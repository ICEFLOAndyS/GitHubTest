/**
 * RBM Record List Row Action Handler - AUTHORITATIVE v1.9.5
 * POST /api/x_icefl_git/rbm/v1/record-list/row-action
 * 
 * Handles individual record actions with MANDATORY audit metadata enforcement:
 * - ALL metadata fields validation (sourceComponent, listKey, viewId, clientCorrelationId, invocationType)
 * - Justification enforcement for designated actions (NO API call without justification)
 * - No client-side audit storage validation
 * - Complete audit trail generation
 */

import { gs } from '@servicenow/glide';
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int';

export function handleRowAction(request, response) {
    const { RBMApiUtil } = require('script-includes/RBMApiUtil');
    const { RBMRecordListActionService } = require('script-includes/RBMRecordListActionService');
    const { RBMEvidenceService } = require('script-includes/RBMEvidenceService');
    const { RBMAuditMetadataValidator } = require('script-includes/RBMAuditMetadataValidator');
    
    let correlationId;
    
    try {
        // Parse request body
        const requestBody = JSON.parse(request.body.data);
        
        // CRITICAL: Extract and validate client correlation ID
        correlationId = requestBody.auditMetadata?.clientCorrelationId;
        if (!correlationId) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'MISSING_CORRELATION_ID',
                'Client correlation ID is mandatory for all RBM requests',
                RBMApiUtil.generateCorrelationId(),
                400
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // STEP 1: MANDATORY Audit Metadata Validation (ALL fields required)
        const metadataValidator = new RBMAuditMetadataValidator();
        const metadataValidation = metadataValidator.validateCompleteAuditMetadata(
            requestBody.auditMetadata,
            'row',
            correlationId
        );
        
        if (!metadataValidation.valid) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'AUDIT_METADATA_VALIDATION_FAILED',
                `Mandatory audit metadata validation failed: ${metadataValidation.errors.join(', ')}`,
                correlationId,
                400
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // STEP 2: Source Component Authorization (MANDATORY rbm-record-list only)
        if (requestBody.auditMetadata.sourceComponent !== 'rbm-record-list') {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'UNAUTHORIZED_SOURCE_COMPONENT',
                `Source component '${requestBody.auditMetadata.sourceComponent}' is not authorized. Only 'rbm-record-list' is permitted.`,
                correlationId,
                403
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // STEP 3: Action-Justification Enforcement Validation
        const actionId = requestBody.actionId;
        const justificationValidation = metadataValidator.validateActionJustificationRequirement(
            actionId,
            requestBody.auditMetadata.justification,
            correlationId
        );
        
        if (!justificationValidation.valid) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'JUSTIFICATION_ENFORCEMENT_FAILED',
                justificationValidation.errorMessage,
                correlationId,
                400
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // STEP 4: Validate No Client-Side Audit Storage (security check)
        const clientStorageValidation = metadataValidator.validateNoClientSideStorage(
            requestBody.auditMetadata,
            correlationId
        );
        
        if (!clientStorageValidation.valid) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'CLIENT_STORAGE_VIOLATION',
                'Client-side audit storage detected - security policy violation',
                correlationId,
                403
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Log AUTHORITATIVE API operation with complete metadata
        RBMApiUtil.logApiOperation('record_list_row_action_v195', {
            actionId: actionId,
            recordId: requestBody.records?.[0]?.sys_id || requestBody.record?.sys_id,
            listKey: requestBody.auditMetadata.listKey,
            viewId: requestBody.auditMetadata.viewId,
            invocationType: requestBody.auditMetadata.invocationType,
            hasJustification: !!requestBody.auditMetadata.justification,
            sourceComponent: requestBody.auditMetadata.sourceComponent,
            userAgent: requestBody.auditMetadata.userAgent,
            timestamp: requestBody.auditMetadata.timestamp
        }, correlationId);
        
        // Sanitize inputs (Enhanced for v1.9.5)
        const sanitizedRequest = {
            actionId: RBMApiUtil.sanitizeString(actionId, 100),
            record: {
                sys_id: RBMApiUtil.sanitizeString(requestBody.records?.[0]?.sys_id || requestBody.record?.sys_id, 32),
                objectType: RBMApiUtil.sanitizeString(requestBody.records?.[0]?.objectType || requestBody.record?.objectType, 100)
            },
            auditMetadata: {
                ...requestBody.auditMetadata,
                justification: requestBody.auditMetadata.justification 
                    ? RBMApiUtil.sanitizeString(requestBody.auditMetadata.justification, 1000) 
                    : null
            }
        };
        
        // Execute action through service with COMPLETE audit metadata
        const actionService = new RBMRecordListActionService();
        const actionResult = actionService.executeRowActionWithCompleteAudit(
            sanitizedRequest.actionId,
            sanitizedRequest.record,
            sanitizedRequest.auditMetadata,
            correlationId
        );
        
        if (!actionResult.success) {
            const statusCode = _getErrorStatusCode(actionResult.error.code);
            const errorResponse = RBMApiUtil.createErrorResponse(
                actionResult.error.code,
                actionResult.error.message,
                correlationId,
                statusCode
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // MANDATORY: Write complete audit evidence (AUTHORITATIVE v1.9.5)
        const evidenceService = new RBMEvidenceService();
        const auditTrailResult = evidenceService.writeCompleteAuditTrail({
            actionId: sanitizedRequest.actionId,
            recordId: sanitizedRequest.record.sys_id,
            tableName: sanitizedRequest.record.objectType,
            userId: gs.getUserID(),
            userName: gs.getUserDisplayName(),
            
            // MANDATORY metadata (ALL fields)
            sourceComponent: sanitizedRequest.auditMetadata.sourceComponent,
            listKey: sanitizedRequest.auditMetadata.listKey,
            viewId: sanitizedRequest.auditMetadata.viewId,
            clientCorrelationId: sanitizedRequest.auditMetadata.clientCorrelationId,
            invocationType: sanitizedRequest.auditMetadata.invocationType,
            justification: sanitizedRequest.auditMetadata.justification,
            
            // Technical audit data
            timestamp: sanitizedRequest.auditMetadata.timestamp,
            userAgent: sanitizedRequest.auditMetadata.userAgent,
            serverCorrelationId: correlationId,
            
            // Action result data
            actionOutcome: actionResult.result,
            auditData: actionResult.auditData,
            oldValue: actionResult.auditData?.oldValue,
            newValue: actionResult.auditData?.newValue
        }, correlationId);
        
        // Build AUTHORITATIVE response
        const responseData = RBMApiUtil.createSuccessResponse({
            success: true,
            serverCorrelationId: correlationId,
            auditTrailId: auditTrailResult.auditTrailId,
            timestamp: new Date().toISOString(),
            result: actionResult.result
        }, correlationId);
        
        return RBMApiUtil.sendResponse(response, responseData, 200);
        
    } catch (error) {
        gs.error(`RBM Row Action Handler Error (AUTHORITATIVE v1.9.5): ${error.message} - CorrelationId: ${correlationId || 'unknown'}`);
        
        const errorResponse = RBMApiUtil.createErrorResponse(
            'INTERNAL_ERROR',
            'Internal server error during audit metadata processing',
            correlationId || RBMApiUtil.generateCorrelationId(),
            500
        );
        return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
    }
}

/**
 * Map error codes to HTTP status codes (Enhanced for v1.9.5)
 */
function _getErrorStatusCode(errorCode) {
    const statusMap = {
        // Validation Errors
        'INVALID_ACTION': 400,
        'JUSTIFICATION_REQUIRED': 400,
        'AUDIT_METADATA_VALIDATION_FAILED': 400,
        'JUSTIFICATION_ENFORCEMENT_FAILED': 400,
        
        // Security/Authorization Errors  
        'PERMISSION_DENIED': 403,
        'ACCESS_DENIED': 403,
        'UNAUTHORIZED_SOURCE_COMPONENT': 403,
        'CLIENT_STORAGE_VIOLATION': 403,
        
        // Not Found Errors
        'RECORD_NOT_FOUND': 404,
        'ACTION_NOT_FOUND': 404,
        
        // Server Errors
        'UPDATE_FAILED': 500,
        'DELETE_FAILED': 500,
        'EXECUTION_ERROR': 500,
        'AUDIT_TRAIL_FAILED': 500,
        'EVIDENCE_WRITE_FAILED': 500
    };
    
    return statusMap[errorCode] || 400;
}