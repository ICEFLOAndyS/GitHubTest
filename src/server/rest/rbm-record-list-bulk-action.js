/**
 * RBM Record List Bulk Action Handler
 * POST /api/x_icefl_git/rbm/v1/record-list/bulk-action
 * 
 * Handles bulk record actions with:
 * - Server-side bulk cap enforcement (max 100)
 * - Parent batch + child record audit evidence
 * - Partial failure handling with per-record status
 * - Never silently skip failures (explicit reporting)
 */

import { gs } from '@servicenow/glide';
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int';

export function handleBulkAction(request, response) {
    const { RBMApiUtil } = require('script-includes/RBMApiUtil');
    const { RBMRecordListActionService } = require('script-includes/RBMRecordListActionService');
    const { RBMEvidenceService } = require('script-includes/RBMEvidenceService');
    
    let correlationId;
    let batchAuditSysId;
    
    try {
        // Parse request body
        const requestBody = JSON.parse(request.body.data);
        correlationId = RBMApiUtil.getCorrelationId(requestBody.metadata);
        
        // Log API operation
        RBMApiUtil.logApiOperation('record_list_bulk_action', {
            actionId: requestBody.actionId,
            recordCount: requestBody.records?.length,
            hasJustification: !!requestBody.metadata?.justification,
            sourceComponent: requestBody.metadata?.sourceComponent
        }, correlationId);
        
        // Validate required fields
        const validation = RBMApiUtil.validateRequiredFields(requestBody, [
            'actionId',
            'records',
            'metadata.sourceComponent',
            'metadata.selectionCount'
        ]);
        
        if (!validation.valid) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'MISSING_REQUIRED_FIELDS',
                `Missing required fields: ${validation.missingFields.join(', ')}`,
                correlationId,
                400
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Validate sourceComponent for RBM governance
        if (requestBody.metadata.sourceComponent !== 'rbm-record-list') {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'INVALID_SOURCE_COMPONENT',
                'Only rbm-record-list component is authorized to use this endpoint',
                correlationId,
                403
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Validate records array
        if (!Array.isArray(requestBody.records) || requestBody.records.length === 0) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'INVALID_RECORDS',
                'Records array is required and must not be empty',
                correlationId,
                400
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Enforce server-side bulk cap: max 100 records (MANDATORY)
        if (requestBody.records.length > 100) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'BULK_LIMIT_EXCEEDED',
                'Maximum 100 records allowed per bulk operation',
                correlationId,
                400
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Validate each record structure
        for (let i = 0; i < requestBody.records.length; i++) {
            const record = requestBody.records[i];
            if (!record.sys_id || !record.objectType) {
                const errorResponse = RBMApiUtil.createErrorResponse(
                    'INVALID_RECORD_DATA',
                    `Record at index ${i} must have sys_id and objectType`,
                    correlationId,
                    400
                );
                return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
            }
            
            // Sanitize record data
            record.sys_id = RBMApiUtil.sanitizeString(record.sys_id, 50);
            record.objectType = RBMApiUtil.sanitizeString(record.objectType, 100);
        }
        
        // Sanitize other inputs
        requestBody.actionId = RBMApiUtil.sanitizeString(requestBody.actionId, 100);
        if (requestBody.metadata.justification) {
            requestBody.metadata.justification = RBMApiUtil.sanitizeString(
                requestBody.metadata.justification, 
                1000
            );
        }
        
        // Create parent batch audit evidence BEFORE execution
        const evidenceService = new RBMEvidenceService();
        const batchEvidenceData = {
            actionId: requestBody.actionId,
            recordCount: requestBody.records.length,
            userId: gs.getUserID(),
            sourceComponent: requestBody.metadata.sourceComponent,
            listKey: requestBody.metadata.listKey,
            viewId: requestBody.metadata.viewId,
            invocationType: 'bulk',
            selectionCount: requestBody.metadata.selectionCount,
            justification: requestBody.metadata.justification,
            timestamp: new Date().toISOString()
        };
        
        const batchEvidenceResult = evidenceService.writeBulkActionBatchEvidence(
            batchEvidenceData, 
            correlationId
        );
        
        if (batchEvidenceResult.success) {
            batchAuditSysId = batchEvidenceResult.batchAuditSysId;
        } else {
            gs.warn(`RBM Bulk Action: Failed to create batch evidence - ${batchEvidenceResult.error} - CorrelationId: ${correlationId}`);
        }
        
        // Execute bulk action through service
        const actionService = new RBMRecordListActionService();
        const bulkResult = actionService.executeBulkAction(
            requestBody.actionId,
            requestBody.records,
            requestBody.metadata,
            correlationId
        );
        
        if (!bulkResult.success) {
            const statusCode = this._getErrorStatusCode(bulkResult.error.code);
            const errorResponse = RBMApiUtil.createErrorResponse(
                bulkResult.error.code,
                bulkResult.error.message,
                correlationId,
                statusCode
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Write per-record audit evidence for successful operations
        const recordResults = bulkResult.result.results;
        for (const recordResult of recordResults) {
            if (recordResult.success && recordResult.result?.auditRequired) {
                const recordEvidenceData = {
                    actionId: requestBody.actionId,
                    recordId: recordResult.sys_id,
                    tableName: this._getRecordTableName(recordResult.sys_id, requestBody.records),
                    userId: gs.getUserID(),
                    sourceComponent: requestBody.metadata.sourceComponent,
                    timestamp: new Date().toISOString(),
                    batchResult: recordResult,
                    auditData: recordResult.result.auditData
                };
                
                evidenceService.writeBulkActionRecordEvidence(
                    recordEvidenceData,
                    batchAuditSysId,
                    correlationId
                );
            }
        }
        
        // Update batch evidence with final results
        if (batchAuditSysId) {
            evidenceService.updateBatchEvidenceResults(
                batchAuditSysId,
                {
                    totalRecords: bulkResult.result.totalRecords,
                    successCount: bulkResult.result.successCount,
                    failureCount: bulkResult.result.failureCount,
                    completedAt: new Date().toISOString()
                },
                correlationId
            );
        }
        
        // Add batch audit reference to response
        bulkResult.result.batchAuditSysId = batchAuditSysId;
        
        // Create success response
        const responseData = RBMApiUtil.createSuccessResponse({
            result: bulkResult.result
        }, correlationId);
        
        return RBMApiUtil.sendResponse(response, responseData, 200);
        
    } catch (error) {
        gs.error(`RBM Bulk Action Handler Error: ${error.message} - CorrelationId: ${correlationId || 'unknown'}`);
        
        // Try to update batch evidence with error if we have batch ID
        if (batchAuditSysId) {
            try {
                const evidenceService = new RBMEvidenceService();
                evidenceService.updateBatchEvidenceResults(
                    batchAuditSysId,
                    {
                        status: 'failed',
                        error: error.message,
                        failedAt: new Date().toISOString()
                    },
                    correlationId
                );
            } catch (evidenceError) {
                gs.error(`Failed to update batch evidence on error: ${evidenceError.message}`);
            }
        }
        
        const errorResponse = RBMApiUtil.createErrorResponse(
            'INTERNAL_ERROR',
            'Internal server error',
            correlationId || RBMApiUtil.generateCorrelationId(),
            500
        );
        return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
    }
}

/**
 * Map error codes to HTTP status codes
 */
function _getErrorStatusCode(errorCode) {
    const statusMap = {
        'INVALID_BULK_ACTION': 400,
        'INVALID_RECORDS': 400,
        'BULK_LIMIT_EXCEEDED': 400,
        'ACTION_LIMIT_EXCEEDED': 400,
        'INVALID_ACTION': 400,
        'JUSTIFICATION_REQUIRED': 400,
        'PERMISSION_DENIED': 403,
        'ACCESS_DENIED': 403,
        'EXECUTION_ERROR': 500
    };
    
    return statusMap[errorCode] || 400;
}

/**
 * Get table name for a specific record from the records array
 */
function _getRecordTableName(recordSysId, recordsArray) {
    for (const record of recordsArray) {
        if (record.sys_id === recordSysId) {
            return record.objectType;
        }
    }
    return 'unknown';
}