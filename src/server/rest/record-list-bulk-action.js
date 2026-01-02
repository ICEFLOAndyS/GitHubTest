/**
 * RBM Record List Bulk Action Handler
 * POST /api/x_icefl_git/v1/record-list/bulk-action
 * 
 * Executes bulk actions on multiple records with proper ACL enforcement and audit logging
 * 
 * Request Schema:
 * {
 *   "actionId": "string",
 *   "records": [ { "sys_id": "string", "objectType": "string" } ],
 *   "metadata": {
 *     "sourceComponent": "rbm-record-list",
 *     "listKey": "string",
 *     "viewId": "string|null",
 *     "clientCorrelationId": "string",
 *     "invocationType": "bulk",
 *     "selectionCount": 10,
 *     "justification": "string|null"
 *   }
 * }
 * 
 * Response Schema (200):
 * {
 *   "result": {
 *     "totalRecords": 10,
 *     "successCount": 8,
 *     "failureCount": 2,
 *     "results": [
 *       { "sys_id": "string", "success": true, "result": {...} },
 *       { "sys_id": "string", "success": false, "error": {...} }
 *     ]
 *   },
 *   "correlationId": "string"
 * }
 * 
 * Error Response (4xx/5xx):
 * { "error": { "code": "string", "message": "string" }, "correlationId": "string" }
 */

import { gs, GlideRecord, GlideRecordSecure } from '@servicenow/glide';
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int';

export function handleBulkAction(request, response) {
    let correlationId;
    
    try {
        // Parse and validate request
        const requestBody = JSON.parse(request.body.data);
        correlationId = requestBody.metadata?.clientCorrelationId || generateCorrelationId();
        
        // Validate required fields
        if (!requestBody.actionId) {
            return sendError(response, 'MISSING_ACTION_ID', 'actionId is required', correlationId, 400);
        }
        
        if (!requestBody.records || !Array.isArray(requestBody.records) || requestBody.records.length === 0) {
            return sendError(response, 'MISSING_RECORDS', 'records array is required and must not be empty', correlationId, 400);
        }
        
        if (!requestBody.metadata?.sourceComponent) {
            return sendError(response, 'MISSING_METADATA', 'metadata.sourceComponent is required', correlationId, 400);
        }
        
        // Enforce bulk cap: max 100 records per request (server-side)
        if (requestBody.records.length > 100) {
            return sendError(response, 'BULK_LIMIT_EXCEEDED', 'Maximum 100 records allowed per bulk operation', correlationId, 400);
        }
        
        // Validate record structure
        for (let record of requestBody.records) {
            if (!record.sys_id || !record.objectType) {
                return sendError(response, 'INVALID_RECORD_DATA', 'Each record must have sys_id and objectType', correlationId, 400);
            }
        }
        
        // Create parent audit entry for the batch
        const batchAuditId = createBatchAuditEntry(
            requestBody.actionId,
            requestBody.records,
            requestBody.metadata,
            correlationId
        );
        
        // Execute bulk action
        const bulkResult = executeBulkAction(
            requestBody.actionId,
            requestBody.records,
            requestBody.metadata,
            correlationId,
            batchAuditId
        );
        
        const responseData = {
            result: bulkResult,
            correlationId: correlationId
        };
        
        response.setStatus(200);
        response.setHeader('Content-Type', 'application/json');
        response.getStreamWriter().writeString(JSON.stringify(responseData));
        
    } catch (error) {
        gs.error('RBM Bulk Action Error: ' + error.message + ' - CorrelationId: ' + (correlationId || 'unknown'));
        return sendError(response, 'INTERNAL_ERROR', 'Internal server error', correlationId || generateCorrelationId(), 500);
    }
}

function executeBulkAction(actionId, records, metadata, correlationId, batchAuditId) {
    const results = [];
    let successCount = 0;
    let failureCount = 0;
    
    // Group records by table type for efficiency
    const recordsByTable = groupRecordsByTable(records);
    
    // Process each table group
    for (const [tableName, tableRecords] of Object.entries(recordsByTable)) {
        
        // Process records in this table
        for (const record of tableRecords) {
            try {
                const recordResult = processBulkActionForRecord(
                    actionId, 
                    record, 
                    tableName,
                    metadata,
                    correlationId,
                    batchAuditId
                );
                
                results.push({
                    sys_id: record.sys_id,
                    success: recordResult.success,
                    result: recordResult.success ? recordResult.result : undefined,
                    error: !recordResult.success ? recordResult.error : undefined
                });
                
                if (recordResult.success) {
                    successCount++;
                } else {
                    failureCount++;
                }
                
            } catch (error) {
                results.push({
                    sys_id: record.sys_id,
                    success: false,
                    error: {
                        code: 'PROCESSING_ERROR',
                        message: 'Error processing record: ' + error.message
                    }
                });
                failureCount++;
            }
        }
    }
    
    // Update batch audit entry with final results
    updateBatchAuditEntry(batchAuditId, successCount, failureCount);
    
    return {
        totalRecords: records.length,
        successCount: successCount,
        failureCount: failureCount,
        results: results,
        batchId: batchAuditId
    };
}

function processBulkActionForRecord(actionId, record, tableName, metadata, correlationId, batchAuditId) {
    try {
        // Load the record
        const gr = new GlideRecordSecure(tableName);
        if (!gr.get(record.sys_id)) {
            return {
                success: false,
                error: {
                    code: 'RECORD_NOT_FOUND',
                    message: 'Record not found or access denied'
                }
            };
        }
        
        // Execute the specific bulk action
        const actionResult = executeSingleBulkAction(actionId, gr, metadata);
        
        // Write per-record audit evidence
        if (actionResult.success && actionResult.auditRequired) {
            writePerRecordAuditEvidence(
                actionId,
                gr,
                metadata,
                correlationId,
                batchAuditId,
                actionResult.auditData
            );
        }
        
        return actionResult;
        
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'RECORD_PROCESSING_ERROR',
                message: 'Failed to process record: ' + error.message
            }
        };
    }
}

function executeSingleBulkAction(actionId, gr, metadata) {
    try {
        switch (actionId.toLowerCase()) {
            case 'bulk_delete':
                return handleBulkDeleteAction(gr, metadata);
                
            case 'bulk_activate':
                return handleBulkActivateAction(gr, metadata);
                
            case 'bulk_deactivate':
                return handleBulkDeactivateAction(gr, metadata);
                
            case 'bulk_export':
                return handleBulkExportAction(gr, metadata);
                
            case 'bulk_assign':
                return handleBulkAssignAction(gr, metadata);
                
            case 'bulk_update_state':
                return handleBulkUpdateStateAction(gr, metadata);
                
            default:
                // Handle custom bulk actions
                return handleCustomBulkAction(actionId, gr, metadata);
        }
    } catch (error) {
        return {
            success: false,
            error: {
                code: 'ACTION_EXECUTION_ERROR',
                message: 'Error executing action: ' + error.message
            }
        };
    }
}

function handleBulkDeleteAction(gr, metadata) {
    if (!gr.canDelete()) {
        return {
            success: false,
            error: {
                code: 'DELETE_DENIED',
                message: 'Delete access denied for this record'
            }
        };
    }
    
    const auditData = {
        originalRecord: {
            sys_id: gr.getUniqueValue(),
            display_value: getRecordDisplayValue(gr),
            table: gr.getTableName()
        }
    };
    
    const deleteResult = gr.deleteRecord();
    
    if (!deleteResult) {
        return {
            success: false,
            error: {
                code: 'DELETE_FAILED',
                message: 'Failed to delete record'
            }
        };
    }
    
    return {
        success: true,
        result: {
            action: 'bulk_delete',
            deleted: true,
            message: 'Record deleted successfully'
        },
        auditRequired: true,
        auditData: auditData
    };
}

function handleBulkActivateAction(gr, metadata) {
    if (!gr.isValidField('active')) {
        return {
            success: false,
            error: {
                code: 'FIELD_NOT_FOUND',
                message: 'Record does not have an active field'
            }
        };
    }
    
    if (!gr.canWrite()) {
        return {
            success: false,
            error: {
                code: 'UPDATE_DENIED',
                message: 'Update access denied for this record'
            }
        };
    }
    
    const wasActive = gr.getValue('active') == 'true';
    
    if (wasActive) {
        return {
            success: true,
            result: {
                action: 'bulk_activate',
                message: 'Record was already active'
            },
            auditRequired: false
        };
    }
    
    gr.setValue('active', 'true');
    const updateResult = gr.update();
    
    if (!updateResult) {
        return {
            success: false,
            error: {
                code: 'UPDATE_FAILED',
                message: 'Failed to activate record'
            }
        };
    }
    
    return {
        success: true,
        result: {
            action: 'bulk_activate',
            activated: true,
            message: 'Record activated successfully'
        },
        auditRequired: true,
        auditData: {
            fieldChanged: 'active',
            oldValue: 'false',
            newValue: 'true'
        }
    };
}

function handleBulkDeactivateAction(gr, metadata) {
    if (!gr.isValidField('active')) {
        return {
            success: false,
            error: {
                code: 'FIELD_NOT_FOUND',
                message: 'Record does not have an active field'
            }
        };
    }
    
    if (!gr.canWrite()) {
        return {
            success: false,
            error: {
                code: 'UPDATE_DENIED',
                message: 'Update access denied for this record'
            }
        };
    }
    
    const wasActive = gr.getValue('active') == 'true';
    
    if (!wasActive) {
        return {
            success: true,
            result: {
                action: 'bulk_deactivate',
                message: 'Record was already inactive'
            },
            auditRequired: false
        };
    }
    
    gr.setValue('active', 'false');
    const updateResult = gr.update();
    
    if (!updateResult) {
        return {
            success: false,
            error: {
                code: 'UPDATE_FAILED',
                message: 'Failed to deactivate record'
            }
        };
    }
    
    return {
        success: true,
        result: {
            action: 'bulk_deactivate',
            deactivated: true,
            message: 'Record deactivated successfully'
        },
        auditRequired: true,
        auditData: {
            fieldChanged: 'active',
            oldValue: 'true',
            newValue: 'false'
        }
    };
}

function handleBulkExportAction(gr, metadata) {
    return {
        success: true,
        result: {
            action: 'bulk_export',
            record: buildExportData(gr)
        },
        auditRequired: false
    };
}

function handleBulkAssignAction(gr, metadata) {
    // This would typically receive assignment target in metadata
    // For now, just return success without actual assignment
    return {
        success: true,
        result: {
            action: 'bulk_assign',
            message: 'Assignment action placeholder - implement based on requirements'
        },
        auditRequired: false
    };
}

function handleBulkUpdateStateAction(gr, metadata) {
    // This would typically receive new state value in metadata
    // For now, just return success without actual state change
    return {
        success: true,
        result: {
            action: 'bulk_update_state',
            message: 'State update action placeholder - implement based on requirements'
        },
        auditRequired: false
    };
}

function handleCustomBulkAction(actionId, gr, metadata) {
    return {
        success: false,
        error: {
            code: 'UNKNOWN_ACTION',
            message: 'Unknown bulk action: ' + actionId
        }
    };
}

function groupRecordsByTable(records) {
    const grouped = {};
    
    for (const record of records) {
        if (!grouped[record.objectType]) {
            grouped[record.objectType] = [];
        }
        grouped[record.objectType].push(record);
    }
    
    return grouped;
}

function buildExportData(gr) {
    const exportData = {
        sys_id: gr.getUniqueValue(),
        table: gr.getTableName(),
        fields: {}
    };
    
    const elements = gr.getElements();
    for (let i = 0; i < elements.size(); i++) {
        const element = elements.get(i);
        const fieldName = element.getName();
        
        exportData.fields[fieldName] = {
            value: gr.getValue(fieldName),
            display_value: gr.getDisplayValue(fieldName)
        };
    }
    
    return exportData;
}

function getRecordDisplayValue(gr) {
    const displayFields = ['short_description', 'name', 'title', 'number', 'label'];
    
    for (let field of displayFields) {
        if (gr.isValidField(field)) {
            const value = gr.getDisplayValue(field);
            if (value && value.trim()) {
                return value;
            }
        }
    }
    
    return gr.getUniqueValue();
}

function createBatchAuditEntry(actionId, records, metadata, correlationId) {
    try {
        const batchAuditGr = new GlideRecord('sys_audit');
        batchAuditGr.initialize();
        
        batchAuditGr.setValue('tablename', 'bulk_action');
        batchAuditGr.setValue('documentkey', correlationId);
        batchAuditGr.setValue('fieldname', 'batch_operation');
        batchAuditGr.setValue('oldvalue', 'N/A');
        batchAuditGr.setValue('newvalue', actionId);
        batchAuditGr.setValue('reason', 'RBM Bulk Action - Batch Parent');
        
        const batchMetadata = {
            sourceComponent: metadata.sourceComponent,
            listKey: metadata.listKey,
            viewId: metadata.viewId,
            correlationId: correlationId,
            invocationType: metadata.invocationType,
            selectionCount: metadata.selectionCount,
            justification: metadata.justification,
            recordCount: records.length,
            status: 'processing'
        };
        
        batchAuditGr.setValue('comments', JSON.stringify(batchMetadata));
        return batchAuditGr.insert();
        
    } catch (error) {
        gs.error('Failed to create batch audit entry: ' + error.message + ' - CorrelationId: ' + correlationId);
        return null;
    }
}

function updateBatchAuditEntry(batchAuditId, successCount, failureCount) {
    if (!batchAuditId) return;
    
    try {
        const auditGr = new GlideRecord('sys_audit');
        if (auditGr.get(batchAuditId)) {
            const metadata = JSON.parse(auditGr.getValue('comments') || '{}');
            metadata.status = 'completed';
            metadata.successCount = successCount;
            metadata.failureCount = failureCount;
            metadata.completedAt = new Date().toISOString();
            
            auditGr.setValue('comments', JSON.stringify(metadata));
            auditGr.update();
        }
    } catch (error) {
        gs.error('Failed to update batch audit entry: ' + error.message);
    }
}

function writePerRecordAuditEvidence(actionId, gr, metadata, correlationId, batchAuditId, auditData) {
    try {
        const auditGr = new GlideRecord('sys_audit');
        auditGr.initialize();
        
        auditGr.setValue('tablename', gr.getTableName());
        auditGr.setValue('documentkey', gr.getUniqueValue());
        auditGr.setValue('fieldname', 'bulk_record_action');
        auditGr.setValue('oldvalue', 'N/A');
        auditGr.setValue('newvalue', actionId);
        auditGr.setValue('reason', 'RBM Bulk Action - Record Child');
        
        const recordMetadata = {
            sourceComponent: metadata.sourceComponent,
            listKey: metadata.listKey,
            correlationId: correlationId,
            batchAuditId: batchAuditId,
            invocationType: metadata.invocationType,
            justification: metadata.justification,
            auditData: auditData
        };
        
        auditGr.setValue('comments', JSON.stringify(recordMetadata));
        auditGr.insert();
        
    } catch (error) {
        gs.error('Failed to write per-record audit evidence: ' + error.message + ' - CorrelationId: ' + correlationId);
    }
}

function generateCorrelationId() {
    return 'rbm_bulk_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
}

function sendError(response, code, message, correlationId, statusCode) {
    const errorResponse = {
        error: {
            code: code,
            message: message
        },
        correlationId: correlationId
    };
    
    response.setStatus(statusCode);
    response.setHeader('Content-Type', 'application/json');
    response.getStreamWriter().writeString(JSON.stringify(errorResponse));
}