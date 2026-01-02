/**
 * RBM Record List Query Handler
 * POST /api/x_icefl_git/v1/record-list/query
 * 
 * Handles server-side data retrieval with filtering, sorting, and pagination
 * 
 * Request Schema:
 * {
 *   "listKey": "string",
 *   "page": { "size": 50, "cursor": "string|null", "offset": 0|null },
 *   "sort": [ { "field": "string", "direction": "asc|desc" } ],
 *   "filters": [ { "field": "string", "operator": "string", "value": "any" } ],
 *   "search": "string|null",
 *   "context": { "viewId": "string|null", "correlationId": "string" }
 * }
 * 
 * Response Schema (200):
 * {
 *   "rows": [ { "sys_id": "string", "objectType": "string", "display": "string", "fields": { ... }, "actionAvailability": { ...optional... } } ],
 *   "nextCursor": "string|null",
 *   "total": 123|null,
 *   "facets": [ ...optional... ],
 *   "correlationId": "string"
 * }
 * 
 * Error Response (4xx/5xx):
 * { "error": { "code": "string", "message": "string" }, "correlationId": "string" }
 */

import { gs, GlideRecord, GlideAggregate } from '@servicenow/glide';
import { RESTAPIRequest, RESTAPIResponse } from '@servicenow/glide/sn_ws_int';

export function handleRecordListQuery(request, response) {
    let correlationId;
    
    try {
        // Parse and validate request
        const requestBody = JSON.parse(request.body.data);
        correlationId = requestBody.context?.correlationId || generateCorrelationId();
        
        // Validate required fields
        if (!requestBody.listKey) {
            return sendError(response, 'MISSING_LIST_KEY', 'listKey is required', correlationId, 400);
        }
        
        // Extract and validate pagination - enforce max 200 records server-side
        const pageSize = Math.min(requestBody.page?.size || 25, 200);
        const offset = requestBody.page?.offset || 0;
        
        // Parse table from listKey (assuming format: "tableName" or "scope.tableName")
        const tableName = parseTableFromListKey(requestBody.listKey);
        if (!tableName) {
            return sendError(response, 'INVALID_LIST_KEY', 'Invalid listKey format', correlationId, 400);
        }
        
        // Check table access permissions
        if (!hasTableReadAccess(tableName)) {
            return sendError(response, 'ACCESS_DENIED', 'Insufficient privileges to access table', correlationId, 403);
        }
        
        // Build query
        const gr = new GlideRecord(tableName);
        
        // Apply filters
        if (requestBody.filters && Array.isArray(requestBody.filters)) {
            applyFilters(gr, requestBody.filters);
        }
        
        // Apply search
        if (requestBody.search && requestBody.search.trim()) {
            applySearch(gr, requestBody.search.trim(), tableName);
        }
        
        // Apply sorting
        if (requestBody.sort && Array.isArray(requestBody.sort) && requestBody.sort.length > 0) {
            applySorting(gr, requestBody.sort);
        } else {
            // Default sort by sys_created_on desc
            gr.orderByDesc('sys_created_on');
        }
        
        // Get total count (before pagination)
        const totalCount = getTotalCount(gr);
        
        // Apply pagination
        gr.chooseWindow(offset, offset + pageSize);
        gr.query();
        
        // Build response
        const rows = [];
        while (gr.next()) {
            const row = buildRowData(gr, tableName);
            rows.push(row);
        }
        
        // Calculate next cursor (for cursor-based pagination support)
        const nextCursor = rows.length === pageSize ? String(offset + pageSize) : null;
        
        const responseData = {
            rows: rows,
            nextCursor: nextCursor,
            total: totalCount,
            facets: [], // Optional - could be implemented for advanced filtering
            correlationId: correlationId
        };
        
        response.setStatus(200);
        response.setHeader('Content-Type', 'application/json');
        response.getStreamWriter().writeString(JSON.stringify(responseData));
        
    } catch (error) {
        gs.error('RBM Record List Query Error: ' + error.message + ' - CorrelationId: ' + (correlationId || 'unknown'));
        return sendError(response, 'INTERNAL_ERROR', 'Internal server error', correlationId || generateCorrelationId(), 500);
    }
}

function parseTableFromListKey(listKey) {
    // Simple implementation - could be enhanced for complex scenarios
    // Assumes listKey format: "tableName" or "scope.tableName" or "tableName.view"
    const parts = listKey.split('.');
    return parts[0] || null;
}

function hasTableReadAccess(tableName) {
    try {
        const testGr = new GlideRecord(tableName);
        testGr.setLimit(1);
        testGr.query();
        return true;
    } catch (e) {
        return false;
    }
}

function applyFilters(gr, filters) {
    filters.forEach(filter => {
        if (filter.field && filter.operator && filter.value !== undefined) {
            try {
                switch (filter.operator.toLowerCase()) {
                    case '=':
                    case 'equals':
                        gr.addQuery(filter.field, filter.value);
                        break;
                    case '!=':
                    case 'not equals':
                        gr.addQuery(filter.field, '!=', filter.value);
                        break;
                    case '>':
                        gr.addQuery(filter.field, '>', filter.value);
                        break;
                    case '>=':
                        gr.addQuery(filter.field, '>=', filter.value);
                        break;
                    case '<':
                        gr.addQuery(filter.field, '<', filter.value);
                        break;
                    case '<=':
                        gr.addQuery(filter.field, '<=', filter.value);
                        break;
                    case 'contains':
                        gr.addQuery(filter.field, 'CONTAINS', filter.value);
                        break;
                    case 'does not contain':
                        gr.addQuery(filter.field, 'DOES NOT CONTAIN', filter.value);
                        break;
                    case 'startswith':
                        gr.addQuery(filter.field, 'STARTSWITH', filter.value);
                        break;
                    case 'endswith':
                        gr.addQuery(filter.field, 'ENDSWITH', filter.value);
                        break;
                    case 'in':
                        gr.addQuery(filter.field, 'IN', filter.value);
                        break;
                    case 'not in':
                        gr.addQuery(filter.field, 'NOT IN', filter.value);
                        break;
                    case 'isempty':
                        gr.addQuery(filter.field, 'ISEMPTY');
                        break;
                    case 'isnotempty':
                        gr.addQuery(filter.field, 'ISNOTEMPTY');
                        break;
                    default:
                        gs.warn('Unsupported filter operator: ' + filter.operator);
                }
            } catch (e) {
                gs.warn('Error applying filter: ' + e.message);
            }
        }
    });
}

function applySearch(gr, searchText, tableName) {
    // Simple implementation - searches common text fields
    // Could be enhanced with table-specific search configurations
    const searchFields = getSearchableFields(tableName);
    
    if (searchFields.length > 0) {
        const orCondition = gr.addQuery();
        searchFields.forEach(field => {
            orCondition.addOrCondition(field, 'CONTAINS', searchText);
        });
    }
}

function getSearchableFields(tableName) {
    // Return common searchable fields - could be enhanced with metadata lookup
    const commonFields = ['short_description', 'description', 'name', 'title', 'subject'];
    
    // Could enhance this with actual table schema inspection
    return commonFields;
}

function applySorting(gr, sortArray) {
    sortArray.forEach(sort => {
        if (sort.field) {
            if (sort.direction && sort.direction.toLowerCase() === 'desc') {
                gr.orderByDesc(sort.field);
            } else {
                gr.orderBy(sort.field);
            }
        }
    });
}

function getTotalCount(gr) {
    try {
        // Clone the GlideRecord to get count without affecting main query
        const countGr = new GlideRecord(gr.getTableName());
        
        // Copy the query conditions
        const encodedQuery = gr.getEncodedQuery();
        if (encodedQuery) {
            countGr.addEncodedQuery(encodedQuery);
        }
        
        countGr.query();
        return countGr.getRowCount();
    } catch (e) {
        gs.warn('Error getting total count: ' + e.message);
        return null;
    }
}

function buildRowData(gr, tableName) {
    const row = {
        sys_id: gr.getUniqueValue(),
        objectType: tableName,
        display: getDisplayValue(gr),
        fields: {},
        actionAvailability: {} // Optional - could include action permissions
    };
    
    // Build fields object with display values
    const elements = gr.getElements();
    for (let i = 0; i < elements.size(); i++) {
        const element = elements.get(i);
        const fieldName = element.getName();
        
        row.fields[fieldName] = {
            value: gr.getValue(fieldName),
            display_value: gr.getDisplayValue(fieldName)
        };
    }
    
    return row;
}

function getDisplayValue(gr) {
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

function generateCorrelationId() {
    // Generate a correlation ID for tracking requests
    return 'rbm_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2, 9);
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