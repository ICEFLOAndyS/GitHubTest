/**
 * RBM Record List Row Action Handler
 * POST /api/x_icefl_git/v1/record-list/row-action
 * 
 * Executes individual record actions with proper ACL enforcement and audit logging
 * 
 * Request Schema:
 * {
 *   "actionId": "string",
 *   "record": { "sys_id": "string", "objectType": "string" },
 *   "metadata": {
 *     "sourceComponent": "rbm-record-list",
 *     "listKey": "string",
 *     "viewId": "string|null",
 *     "clientCorrelationId": "string",
 *     "invocationType": "row",
 *     "justification": "string|null"
 *   }
 * }
 * 
 * Response Schema (200):
 * { "result": { ... }, "correlationId": "string" }
 * 
 * Error Response (4xx/5xx):
 * { "error": { "code": "string", "message": "string" }, "correlationId": "string" }
 */

import { gs, GlideRecord, GlideRecordSecure } from '@servicenow/glide';
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int';

export function handleRowAction(request, response) {
    let correlationId;
    
    try {
        // Parse and validate request
        const requestBody = JSON.parse(request.body.data);
        correlationId = requestBody.metadata?.clientCorrelationId || generateCorrelationId();
        
        // Validate required fields
        if (!requestBody.actionId) {
            return sendError(response, 'MISSING_ACTION_ID', 'actionId is required', correlationId, 400);
        }
        
        if (!requestBody.record?.sys_id || !requestBody.record?.objectType) {
            return sendError(response, 'MISSING_RECORD_DATA', 'record.sys_id and record.objectType are required', correlationId, 400);
        }
        
        if (!requestBody.metadata?.sourceComponent) {
            return sendError(response, 'MISSING_METADATA', 'metadata.sourceComponent is required', correlationId, 400);
        }
        
        // Load the record
        const gr = new GlideRecordSecure(requestBody.record.objectType);
        if (!gr.get(requestBody.record.sys_id)) {
            return sendError(response, 'RECORD_NOT_FOUND', 'Record not found or access denied', correlationId, 404);
        }
        
        // Execute action based on actionId
        const actionResult = executeRowAction(
            requestBody.actionId, 
            gr, 
            requestBody.metadata
        );
        
        if (!actionResult.success) {
            return sendError(response, actionResult.errorCode, actionResult.errorMessage, correlationId, actionResult.statusCode || 403);
        }
        
        // Write audit evidence for state-changing actions
        if (actionResult.auditRequired) {
            writeAuditEvidence(
                requestBody.actionId,
                gr,
                requestBody.metadata,
                correlationId,
                actionResult.auditData
            );
        }
        
        const responseData = {
            result: actionResult.result,
            correlationId: correlationId
        };
        
        response.setStatus(200);
        response.setHeader('Content-Type', 'application/json');
        response.getStreamWriter().writeString(JSON.stringify(responseData));
        
    } catch (error) {
        gs.error('RBM Row Action Error: ' + error.message + ' - CorrelationId: ' + (correlationId || 'unknown'));
        return sendError(response, 'INTERNAL_ERROR', 'Internal server error', correlationId || generateCorrelationId(), 500);
    }
}

function executeRowAction(actionId, gr, metadata) {
    try {
        switch (actionId.toLowerCase()) {
            case 'view':
                return handleViewAction(gr, metadata);
                
            case 'edit':
                return handleEditAction(gr, metadata);
                
            case 'delete':
                return handleDeleteAction(gr, metadata);
                
            case 'activate':
                return handleActivateAction(gr, metadata);
                
            case 'deactivate':
                return handleDeactivateAction(gr, metadata);
                
            case 'duplicate':
                return handleDuplicateAction(gr, metadata);
                
            case 'export':
                return handleExportAction(gr, metadata);
                
            default:
                // Handle custom actions
                return handleCustomAction(actionId, gr, metadata);
        }
    } catch (error) {
        return {
            success: false,
            errorCode: 'ACTION_EXECUTION_ERROR',
            errorMessage: 'Error executing action: ' + error.message,
            statusCode: 500
        };
    }
}

function handleViewAction(gr, metadata) {
    // View action - just return record data
    return {
        success: true,
        result: {
            action: 'view',
            record: {
                sys_id: gr.getUniqueValue(),
                display_value: getRecordDisplayValue(gr)
            }
        },
        auditRequired: false
    };
}

function handleEditAction(gr, metadata) {
    // Check edit permissions
    if (!gr.canWrite()) {
        return {
            success: false,
            errorCode: 'EDIT_DENIED',
            errorMessage: 'Edit access denied for this record',
            statusCode: 403
        };
    }
    
    return {
        success: true,
        result: {
            action: 'edit',
            record: {
                sys_id: gr.getUniqueValue(),
                display_value: getRecordDisplayValue(gr)
            },
            editUrl: '/nav_to.do?uri=' + gr.getTableName() + '.do?sys_id=' + gr.getUniqueValue()
        },
        auditRequired: false
    };
}

function handleDeleteAction(gr, metadata) {
    // Check delete permissions
    if (!gr.canDelete()) {
        return {
            success: false,
            errorCode: 'DELETE_DENIED',
            errorMessage: 'Delete access denied for this record',
            statusCode: 403
        };
    }
    
    // Store data for audit before deletion
    const auditData = {
        originalRecord: {
            sys_id: gr.getUniqueValue(),
            display_value: getRecordDisplayValue(gr),
            table: gr.getTableName()
        }
    };
    
    // Perform deletion
    const deleteResult = gr.deleteRecord();
    
    if (!deleteResult) {
        return {
            success: false,
            errorCode: 'DELETE_FAILED',
            errorMessage: 'Failed to delete record',
            statusCode: 500
        };
    }
    
    return {
        success: true,
        result: {
            action: 'delete',
            deleted: true,
            message: 'Record deleted successfully'
        },
        auditRequired: true,
        auditData: auditData
    };
}

function handleActivateAction(gr, metadata) {
    // Check if record has active field
    if (!gr.isValidField('active')) {
        return {
            success: false,
            errorCode: 'FIELD_NOT_FOUND',
            errorMessage: 'Record does not have an active field',
            statusCode: 400
        };
    }
    
    // Check write permissions
    if (!gr.canWrite()) {
        return {
            success: false,
            errorCode: 'UPDATE_DENIED',
            errorMessage: 'Update access denied for this record',
            statusCode: 403
        };
    }
    
    const wasActive = gr.getValue('active') == 'true';
    
    if (wasActive) {
        return {
            success: true,
            result: {
                action: 'activate',
                message: 'Record is already active'
            },
            auditRequired: false
        };
    }
    
    gr.setValue('active', 'true');
    const updateResult = gr.update();
    
    if (!updateResult) {
        return {
            success: false,
            errorCode: 'UPDATE_FAILED',
            errorMessage: 'Failed to activate record',
            statusCode: 500
        };
    }
    
    return {
        success: true,
        result: {
            action: 'activate',
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

function handleDeactivateAction(gr, metadata) {
    // Check if record has active field
    if (!gr.isValidField('active')) {
        return {
            success: false,
            errorCode: 'FIELD_NOT_FOUND',
            errorMessage: 'Record does not have an active field',
            statusCode: 400
        };
    }
    
    // Check write permissions
    if (!gr.canWrite()) {
        return {
            success: false,
            errorCode: 'UPDATE_DENIED',
            errorMessage: 'Update access denied for this record',
            statusCode: 403
        };
    }
    
    const wasActive = gr.getValue('active') == 'true';
    
    if (!wasActive) {
        return {
            success: true,
            result: {
                action: 'deactivate',
                message: 'Record is already inactive'
            },
            auditRequired: false
        };
    }
    
    gr.setValue('active', 'false');
    const updateResult = gr.update();
    
    if (!updateResult) {
        return {
            success: false,
            errorCode: 'UPDATE_FAILED',
            errorMessage: 'Failed to deactivate record',
            statusCode: 500
        };
    }
    
    return {
        success: true,
        result: {
            action: 'deactivate',
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

function handleDuplicateAction(gr, metadata) {
    // Check read permissions on original and create permissions on table
    if (!gr.canRead()) {
        return {
            success: false,
            errorCode: 'READ_DENIED',
            errorMessage: 'Read access denied for this record',
            statusCode: 403
        };
    }
    
    const newGr = new GlideRecord(gr.getTableName());
    newGr.initialize();
    
    if (!newGr.canCreate()) {
        return {
            success: false,
            errorCode: 'CREATE_DENIED',
            errorMessage: 'Create access denied for this table',
            statusCode: 403
        };
    }
    
    // Copy fields (excluding sys fields)
    const elements = gr.getElements();
    for (let i = 0; i < elements.size(); i++) {
        const element = elements.get(i);
        const fieldName = element.getName();
        
        // Skip system fields and unique fields
        if (!fieldName.startsWith('sys_') && 
            fieldName !== 'number' && 
            fieldName !== 'correlation_id') {
            newGr.setValue(fieldName, gr.getValue(fieldName));
        }
    }
    
    const newSysId = newGr.insert();
    
    if (!newSysId) {
        return {
            success: false,
            errorCode: 'DUPLICATE_FAILED',
            errorMessage: 'Failed to create duplicate record',
            statusCode: 500
        };
    }
    
    return {
        success: true,
        result: {
            action: 'duplicate',
            duplicated: true,
            newRecord: {
                sys_id: newSysId,
                display_value: getRecordDisplayValue(newGr)
            },
            message: 'Record duplicated successfully'
        },
        auditRequired: true,
        auditData: {
            originalRecord: gr.getUniqueValue(),
            newRecord: newSysId
        }
    };
}

function handleExportAction(gr, metadata) {
    // Export action - return record data in structured format
    return {
        success: true,
        result: {
            action: 'export',
            record: buildExportData(gr)
        },
        auditRequired: false
    };
}

function handleCustomAction(actionId, gr, metadata) {
    // Placeholder for custom action handling
    // Could be extended to call business rules or script includes
    return {
        success: false,
        errorCode: 'UNKNOWN_ACTION',
        errorMessage: 'Unknown action: ' + actionId,
        statusCode: 400
    };
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
    // Try common display fields in order of preference
    const displayFields = ['short_description', 'name', 'title', 'number', 'label'];
    
    for (let field of displayFields) {
        if (gr.isValidField(field)) {
            const value = gr.getDisplayValue(field);
            if (value && value.trim()) {
                return value;
            }
        }
    }
    
    // Fallback to sys_id
    return gr.getUniqueValue();
}

function writeAuditEvidence(actionId, gr, metadata, correlationId, auditData) {
    try {
        // Create audit log entry
        const auditGr = new GlideRecord('sys_audit');
        auditGr.initialize();
        
        auditGr.setValue('tablename', gr.getTableName());
        auditGr.setValue('documentkey', gr.getUniqueValue());
        auditGr.setValue('fieldname', 'record_action');
        auditGr.setValue('oldvalue', 'N/A');
        auditGr.setValue('newvalue', actionId);
        auditGr.setValue('reason', 'RBM Record List Action');
        
        // Add metadata to audit record
        const auditMetadata = {
            sourceComponent: metadata.sourceComponent,
            listKey: metadata.listKey,
            viewId: metadata.viewId,
            correlationId: correlationId,
            invocationType: metadata.invocationType,
            justification: metadata.justification,
            auditData: auditData
        };
        
        auditGr.setValue('comments', JSON.stringify(auditMetadata));
        auditGr.insert();
        
        // Also log to system log
        gs.info('RBM Action Audit - Action: ' + actionId + 
                ', Record: ' + gr.getUniqueValue() + 
                ', User: ' + gs.getUserID() + 
                ', CorrelationId: ' + correlationId);
                
    } catch (error) {
        gs.error('Failed to write audit evidence: ' + error.message + ' - CorrelationId: ' + correlationId);
    }
}

function generateCorrelationId() {
    return 'rbm_row_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
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