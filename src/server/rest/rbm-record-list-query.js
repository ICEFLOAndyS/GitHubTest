/**
 * RBM Record List Query Handler
 * POST /api/x_icefl_git/rbm/v1/record-list/query
 * 
 * Handles server-side data retrieval with:
 * - Hard allow-list validation for listKeys (MANDATORY)
 * - Server-side filtering, sorting, and pagination
 * - ACL-safe field access and payload minimization
 * - Comprehensive correlation ID tracking
 */

import { gs } from '@servicenow/glide';
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int';

export function handleRecordListQuery(request, response) {
    const { RBMApiUtil } = require('script-includes/RBMApiUtil');
    const { RBMRecordListService } = require('script-includes/RBMRecordListService');
    
    let correlationId;
    
    try {
        // Parse request body
        const requestBody = JSON.parse(request.body.data);
        correlationId = RBMApiUtil.getCorrelationId(requestBody.context);
        
        // Log API operation
        RBMApiUtil.logApiOperation('record_list_query', {
            listKey: requestBody.listKey,
            hasFilters: !!(requestBody.filters && requestBody.filters.length),
            hasSort: !!(requestBody.sort && requestBody.sort.length),
            hasSearch: !!requestBody.search,
            pageSize: requestBody.page?.size
        }, correlationId);
        
        // Validate required fields
        const validation = RBMApiUtil.validateRequiredFields(requestBody, ['listKey']);
        if (!validation.valid) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                'MISSING_REQUIRED_FIELDS', 
                `Missing required fields: ${validation.missingFields.join(', ')}`,
                correlationId,
                400
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Sanitize inputs
        requestBody.listKey = RBMApiUtil.sanitizeString(requestBody.listKey, 100);
        if (requestBody.search) {
            requestBody.search = RBMApiUtil.sanitizeString(requestBody.search, 200);
        }
        
        // Validate and sanitize arrays
        requestBody.filters = RBMApiUtil.validateArray(requestBody.filters, 50);
        requestBody.sort = RBMApiUtil.validateArray(requestBody.sort, 10);
        
        // Validate pagination with server-side max enforcement (200)
        requestBody.page = RBMApiUtil.validatePagination(requestBody.page, 200);
        
        // Execute query through service
        const recordListService = new RBMRecordListService();
        const queryResult = recordListService.executeQuery(requestBody, correlationId);
        
        if (!queryResult.success) {
            const errorResponse = RBMApiUtil.createErrorResponse(
                queryResult.error.code,
                queryResult.error.message,
                correlationId,
                queryResult.error.code === 'INVALID_LIST_KEY' ? 400 :
                queryResult.error.code === 'ACCESS_DENIED' ? 403 : 500
            );
            return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
        }
        
        // Create success response with correlation ID
        const responseData = RBMApiUtil.createSuccessResponse(queryResult.data, correlationId);
        return RBMApiUtil.sendResponse(response, responseData, 200);
        
    } catch (error) {
        gs.error(`RBM Record List Query Handler Error: ${error.message} - CorrelationId: ${correlationId || 'unknown'}`);
        
        const errorResponse = RBMApiUtil.createErrorResponse(
            'INTERNAL_ERROR',
            'Internal server error',
            correlationId || RBMApiUtil.generateCorrelationId(),
            500
        );
        return RBMApiUtil.sendResponse(response, errorResponse.response, errorResponse.httpStatus);
    }
}