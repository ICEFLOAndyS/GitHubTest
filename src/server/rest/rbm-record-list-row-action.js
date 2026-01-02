/**
 * RBM Record List Row Action Handler
 * POST /api/x_icefl_git/rbm/v1/record-list/row-action
 * 
 * Handles individual record actions with:
 * - Server-side action registry validation (MANDATORY)
 * - Role, state, and ACL checks enforcement
 * - Justification requirement for admin actions
 * - Comprehensive audit evidence writing
 */

import { gs } from '@servicenow/glide';
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int';

export function handleRowAction(request, response) {
    const { RBMApiUtil } = require('script-includes/RBMApiUtil');
    const { RBMRecordListActionService } = require('script-includes/RBMRecordListActionService');
    const { RBMEvidenceService } = require('script-includes/RBMEvidenceService');
    
    let correlationId;
    
    try {
        // Parse request body
        const requestBody = JSON.parse(request.body.data);
        correlationId = RBMApiUtil.getCorrelationId(requestBody.metadata);
        
        // Log API operation
        RBMApiUtil.logApiOperation('record_list_row_action', {
            actionId: requestBody.actionId,
            objectType: requestBody.record?.objectType,
            hasJustification: !!requestBody.metadata?.justification,
            sourceComponent: requestBody.metadata?.sourceComponent
        }, correlationId);
        
        // Validate required fields
        const validation = RBMApiUtil.validateRequiredFields(requestBody, [
            'actionId', 
            'record.sys_id', 
            'record.objectType', 
            'metadata.sourceComponent'
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
        
        // Sanitize inputs
        requestBody.actionId = RBMApiUtil.sanitizeString(requestBody.actionId, 100);
        requestBody.record.sys_id = RBMApiUtil.sanitizeString(requestBody.record.sys_id, 50);
        requestBody.record.objectType = RBMApiUtil.sanitizeString(requestBody.record.objectType, 100);
        
        if (requestBody.metadata.justification) {
            requestBody.metadata.justification = RBMApiUtil.sanitizeString(
                requestBody.metadata.justification, 
                1000
            );
        }
        
        // Execute action through service
        const actionService = new RBMRecordListActionService();
        const actionResult = actionService.executeRowAction(
            requestBody.actionId,
            requestBody.record,
            requestBody.metadata,
            correlationId
        );
        
        if (!actionResult.success) {
            const statusCode = this._getErrorStatusCode(actionResult.error.code);
            const errorResponse = RBMApiUtil.createErrorResponse(
                actionResult.error.code,
                actionResult.error.message,
                correlationId,
                statusCode
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Write audit evidence for state-changing actions
        if (actionResult.auditRequired) {
            const evidenceService = new RBMEvidenceService();
            const evidenceData = {
                actionId: requestBody.actionId,
                recordId: requestBody.record.sys_id,
                tableName: requestBody.record.objectType,
                userId: gs.getUserID(),
                sourceComponent: requestBody.metadata.sourceComponent,
                listKey: requestBody.metadata.listKey,
                viewId: requestBody.metadata.viewId,
                invocationType: 'row',
                justification: requestBody.metadata.justification,
                timestamp: new Date().toISOString(),
                auditData: actionResult.auditData,
                oldValue: actionResult.auditData?.oldValue || 'N/A',
                newValue: actionResult.auditData?.newValue || requestBody.actionId
            };
            
            const evidenceResult = evidenceService.writeRecordActionEvidence(evidenceData, correlationId);
            
            if (evidenceResult.success) {
                actionResult.result.auditSysId = evidenceResult.auditSysId;
            } else {
                gs.warn(`RBM Row Action: Failed to write evidence - ${evidenceResult.error} - CorrelationId: ${correlationId}`);
            }
        }
        
        // Create success response
        const responseData = RBMApiUtil.createSuccessResponse({
            result: actionResult.result
        }, correlationId);
        
        return RBMApiUtil.sendResponse(response, responseData, 200);
        
    } catch (error) {
        gs.error(`RBM Row Action Handler Error: ${error.message} - CorrelationId: ${correlationId || 'unknown'}`);
        
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
        'INVALID_ACTION': 400,
        'JUSTIFICATION_REQUIRED': 400,
        'RECORD_NOT_FOUND': 404,
        'PERMISSION_DENIED': 403,
        'ACCESS_DENIED': 403,
        'UPDATE_FAILED': 500,
        'DELETE_FAILED': 500,
        'EXECUTION_ERROR': 500
    };
    
    return statusMap[errorCode] || 400;
}