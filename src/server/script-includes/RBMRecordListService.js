/**
 * RBM Record List Service Script Include
 * 
 * Manages server-side record list operations with:
 * - Hard allow-list registry for listKeys (MANDATORY)
 * - Server-side query, filter, sort, paging
 * - Payload shaping with ACL-safe reads
 * - Security-first data access patterns
 */

import { gs, GlideRecord, GlideAggregate, GlideRecordSecure } from '@servicenow/glide';

export class RBMRecordListService {
    
    constructor() {
        this.allowListRegistry = this._initializeAllowListRegistry();
    }
    
    /**
     * MANDATORY: Hard allow-list registry for listKey security
     * This registry is the ONLY way to access tables through the record list API
     * Unknown listKeys are automatically rejected
     */
    _initializeAllowListRegistry() {
        return {
            // Incident management
            'incident.active': {
                table: 'incident',
                displayField: 'short_description',
                allowedFields: [
                    'sys_id', 'number', 'short_description', 'description', 
                    'state', 'priority', 'urgency', 'impact', 'category',
                    'assigned_to', 'assignment_group', 'caller_id',
                    'sys_created_on', 'sys_updated_on', 'active'
                ],
                allowedSortFields: [
                    'number', 'sys_created_on', 'sys_updated_on', 
                    'priority', 'state', 'assigned_to'
                ],
                indexedSearchFields: [
                    'short_description', 'description', 'number'
                ],
                defaultFilters: [
                    { field: 'active', operator: '=', value: 'true' }
                ]
            },
            
            'incident.all': {
                table: 'incident',
                displayField: 'short_description',
                allowedFields: [
                    'sys_id', 'number', 'short_description', 'description',
                    'state', 'priority', 'urgency', 'impact', 'category',
                    'assigned_to', 'assignment_group', 'caller_id',
                    'sys_created_on', 'sys_updated_on', 'active'
                ],
                allowedSortFields: [
                    'number', 'sys_created_on', 'sys_updated_on',
                    'priority', 'state', 'assigned_to'
                ],
                indexedSearchFields: [
                    'short_description', 'description', 'number'
                ],
                defaultFilters: []
            },
            
            // User management
            'sys_user.active': {
                table: 'sys_user',
                displayField: 'name',
                allowedFields: [
                    'sys_id', 'user_name', 'first_name', 'last_name', 'name',
                    'email', 'phone', 'title', 'department', 'manager',
                    'active', 'sys_created_on', 'sys_updated_on'
                ],
                allowedSortFields: [
                    'name', 'user_name', 'sys_created_on', 'department'
                ],
                indexedSearchFields: [
                    'name', 'user_name', 'email', 'first_name', 'last_name'
                ],
                defaultFilters: [
                    { field: 'active', operator: '=', value: 'true' }
                ]
            },
            
            // Configuration items
            'cmdb_ci.active': {
                table: 'cmdb_ci',
                displayField: 'name',
                allowedFields: [
                    'sys_id', 'name', 'short_description', 'serial_number',
                    'model_number', 'asset_tag', 'install_status', 'operational_status',
                    'owned_by', 'managed_by', 'supported_by', 'location',
                    'sys_created_on', 'sys_updated_on'
                ],
                allowedSortFields: [
                    'name', 'sys_created_on', 'install_status', 'operational_status'
                ],
                indexedSearchFields: [
                    'name', 'short_description', 'serial_number', 'asset_tag'
                ],
                defaultFilters: [
                    { field: 'install_status', operator: '!=', value: '7' } // Not retired
                ]
            }
            
            // Additional listKeys can be registered here following the same pattern
            // Each MUST include: table, displayField, allowedFields, allowedSortFields, indexedSearchFields
        };
    }
    
    /**
     * Validate listKey against allow-list registry
     * @param {string} listKey - The listKey to validate
     * @returns {Object} Validation result with registry entry if valid
     */
    validateListKey(listKey) {
        if (!listKey || typeof listKey !== 'string') {
            return {
                valid: false,
                error: 'listKey is required and must be a string'
            };
        }
        
        const registryEntry = this.allowListRegistry[listKey];
        if (!registryEntry) {
            gs.warn(`RBM Record List: Rejected unknown listKey: ${listKey} - User: ${gs.getUserID()}`);
            return {
                valid: false,
                error: `Unknown listKey: ${listKey}. Only registered listKeys are allowed.`
            };
        }
        
        return {
            valid: true,
            registryEntry: registryEntry
        };
    }
    
    /**
     * Execute query with server-side filtering, sorting, and pagination
     * @param {Object} queryRequest - Query parameters
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Query results
     */
    executeQuery(queryRequest, correlationId) {
        try {
            // Validate listKey first (MANDATORY security check)
            const listKeyValidation = this.validateListKey(queryRequest.listKey);
            if (!listKeyValidation.valid) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_LIST_KEY',
                        message: listKeyValidation.error
                    }
                };
            }
            
            const registryEntry = listKeyValidation.registryEntry;
            
            // Check table access permissions
            if (!this._hasTableReadAccess(registryEntry.table)) {
                return {
                    success: false,
                    error: {
                        code: 'ACCESS_DENIED',
                        message: 'Insufficient privileges to access this data'
                    }
                };
            }
            
            // Build secure query
            const gr = new GlideRecordSecure(registryEntry.table);
            
            // Apply default filters from registry
            this._applyDefaultFilters(gr, registryEntry.defaultFilters);
            
            // Apply user-provided filters (validated against allow-list)
            if (queryRequest.filters && Array.isArray(queryRequest.filters)) {
                const filterResult = this._applyFilters(gr, queryRequest.filters, registryEntry);
                if (!filterResult.success) {
                    return filterResult;
                }
            }
            
            // Apply search (only on indexed search fields)
            if (queryRequest.search && queryRequest.search.trim()) {
                const searchResult = this._applySearch(gr, queryRequest.search.trim(), registryEntry);
                if (!searchResult.success) {
                    return searchResult;
                }
            }
            
            // Apply sorting (validated against allow-list)
            if (queryRequest.sort && Array.isArray(queryRequest.sort)) {
                const sortResult = this._applySorting(gr, queryRequest.sort, registryEntry);
                if (!sortResult.success) {
                    return sortResult;
                }
            } else {
                // Default sort by sys_created_on desc
                gr.orderByDesc('sys_created_on');
            }
            
            // Apply pagination
            const page = queryRequest.page || {};
            const offset = page.offset || 0;
            const pageSize = Math.min(page.size || 25, 200); // Enforce max 200 server-side
            
            gr.chooseWindow(offset, offset + pageSize);
            gr.query();
            
            // Build response rows with ACL-safe field access
            const rows = [];
            while (gr.next()) {
                const row = this._buildSecureRowData(gr, registryEntry);
                if (row) { // Only include if ACL check passes
                    rows.push(row);
                }
            }
            
            // Calculate next cursor for cursor-based pagination
            const nextCursor = rows.length === pageSize ? String(offset + pageSize) : null;
            
            return {
                success: true,
                data: {
                    rows: rows,
                    nextCursor: nextCursor,
                    total: null, // Don't return total unless explicitly required (performance)
                    facets: null // Could be implemented for advanced filtering
                }
            };
            
        } catch (error) {
            gs.error(`RBM Record List Query Error: ${error.message} - CorrelationId: ${correlationId}`);
            return {
                success: false,
                error: {
                    code: 'QUERY_EXECUTION_ERROR',
                    message: 'Failed to execute query'
                }
            };
        }
    }
    
    /**
     * Check if current user has read access to table
     */
    _hasTableReadAccess(tableName) {
        try {
            const testGr = new GlideRecordSecure(tableName);
            testGr.setLimit(1);
            testGr.query();
            return true;
        } catch (e) {
            return false;
        }
    }
    
    /**
     * Apply default filters from registry
     */
    _applyDefaultFilters(gr, defaultFilters) {
        if (defaultFilters && Array.isArray(defaultFilters)) {
            defaultFilters.forEach(filter => {
                this._applyFilter(gr, filter);
            });
        }
    }
    
    /**
     * Apply user-provided filters with allow-list validation
     */
    _applyFilters(gr, filters, registryEntry) {
        for (const filter of filters) {
            // Validate filter field against allow-list
            if (!registryEntry.allowedFields.includes(filter.field)) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_FILTER_FIELD',
                        message: `Filter field '${filter.field}' is not allowed for this listKey`
                    }
                };
            }
            
            // Apply the filter
            this._applyFilter(gr, filter);
        }
        
        return { success: true };
    }
    
    /**
     * Apply a single filter to GlideRecord
     */
    _applyFilter(gr, filter) {
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
                        gs.warn('RBM Record List: Unsupported filter operator: ' + filter.operator);
                }
            } catch (e) {
                gs.warn('RBM Record List: Error applying filter: ' + e.message);
            }
        }
    }
    
    /**
     * Apply search only on indexed search fields
     */
    _applySearch(gr, searchText, registryEntry) {
        if (registryEntry.indexedSearchFields.length === 0) {
            return {
                success: false,
                error: {
                    code: 'SEARCH_NOT_SUPPORTED',
                    message: 'Search is not supported for this listKey'
                }
            };
        }
        
        const orCondition = gr.addQuery();
        registryEntry.indexedSearchFields.forEach(field => {
            orCondition.addOrCondition(field, 'CONTAINS', searchText);
        });
        
        return { success: true };
    }
    
    /**
     * Apply sorting with allow-list validation
     */
    _applySorting(gr, sortArray, registryEntry) {
        for (const sort of sortArray) {
            // Validate sort field against allow-list
            if (!registryEntry.allowedSortFields.includes(sort.field)) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_SORT_FIELD',
                        message: `Sort field '${sort.field}' is not allowed for this listKey`
                    }
                };
            }
            
            // Apply sorting
            if (sort.direction && sort.direction.toLowerCase() === 'desc') {
                gr.orderByDesc(sort.field);
            } else {
                gr.orderBy(sort.field);
            }
        }
        
        return { success: true };
    }
    
    /**
     * Build secure row data with ACL-safe field access
     */
    _buildSecureRowData(gr, registryEntry) {
        try {
            // Check if user can read this specific record
            if (!gr.canRead()) {
                return null; // Skip this record
            }
            
            const row = {
                sys_id: gr.getUniqueValue(),
                objectType: registryEntry.table,
                display: this._getDisplayValue(gr, registryEntry.displayField),
                fields: {}
            };
            
            // Only include allowed fields with ACL checking
            registryEntry.allowedFields.forEach(fieldName => {
                if (gr.isValidField(fieldName)) {
                    try {
                        row.fields[fieldName] = {
                            value: gr.getValue(fieldName),
                            display_value: gr.getDisplayValue(fieldName)
                        };
                    } catch (e) {
                        // Field access denied - skip this field
                        gs.debug(`RBM Record List: Field access denied for ${fieldName} - Record: ${gr.getUniqueValue()}`);
                    }
                }
            });
            
            return row;
            
        } catch (error) {
            gs.debug(`RBM Record List: Error building row data: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Get display value for record
     */
    _getDisplayValue(gr, displayField) {
        try {
            if (gr.isValidField(displayField)) {
                const value = gr.getDisplayValue(displayField);
                if (value && value.trim()) {
                    return value;
                }
            }
        } catch (e) {
            // Display field access denied
        }
        
        // Fallback to sys_id
        return gr.getUniqueValue();
    }
    
    /**
     * Get registry entry for listKey (for external access)
     */
    getRegistryEntry(listKey) {
        const validation = this.validateListKey(listKey);
        return validation.valid ? validation.registryEntry : null;
    }
    
    /**
     * Get all registered listKeys (for administrative purposes)
     */
    getRegisteredListKeys() {
        return Object.keys(this.allowListRegistry);
    }
}