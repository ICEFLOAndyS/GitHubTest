/**
 * RBM Record List Data Provider
 * 
 * Integrates with server-side RBM Record List API endpoints to provide
 * data operations with proper error handling and correlation ID propagation.
 * 
 * Endpoints:
 * - POST /api/x_icefl_git/v1/record-list/query
 * - POST /api/x_icefl_git/v1/record-list/row-action  
 * - POST /api/x_icefl_git/v1/record-list/bulk-action
 */

import { 
    DataProvider, 
    DataProviderRequest, 
    DataProviderResponse,
    RbmRecord,
    ActiveFilter,
    SortConfig 
} from '../../components/rbm-record-list/types';

/**
 * ServiceNow-specific data provider implementation
 * Handles all server-side communication for RBM Record List operations
 */
export class RecordListDataProvider implements DataProvider {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;
    private listKey?: string;
    private viewId?: string;
    
    constructor(options?: { listKey?: string; viewId?: string }) {
        // ServiceNow API base path with RBM namespace
        this.baseUrl = '/api/x_icefl_git/rbm/v1/record-list';
        
        // Standard ServiceNow headers for authenticated requests
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'X-UserToken': window.g_ck // ServiceNow session token
        };
        
        // Store context for action calls
        this.listKey = options?.listKey;
        this.viewId = options?.viewId;
    }
    
    /**
     * Fetch records with server-side filtering, sorting, and pagination
     */
    async fetchRecords(request: DataProviderRequest): Promise<DataProviderResponse> {
        const clientCorrelationId = request.context?.correlationId || this.generateCorrelationId();
        
        try {
            // Transform request to match server API schema
            const serverRequest = {
                listKey: request.table, // listKey maps directly to table in this implementation
                page: {
                    size: request.pagination.pageSize,
                    cursor: request.pagination.cursor || null,
                    offset: request.pagination.page * request.pagination.pageSize
                },
                sort: request.sort ? [request.sort] : [],
                filters: this.transformFilters(request.filters || []),
                search: request.search || null,
                context: {
                    viewId: request.context?.viewId || null,
                    correlationId: clientCorrelationId
                }
            };
            
            const response = await fetch(`${this.baseUrl}/query`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(serverRequest)
            });
            
            const responseData = await this.handleResponse(response, clientCorrelationId);
            
            // Transform server response to match client interface
            return this.transformQueryResponse(responseData, request.pagination);
            
        } catch (error) {
            console.error('RecordListDataProvider.fetchRecords error:', error);
            throw new Error(`Failed to fetch records: ${error.message} (CorrelationId: ${clientCorrelationId})`);
        }
    }
    
    /**
     * Execute action on individual record
     */
    async executeAction(actionId: string, record: RbmRecord): Promise<{ success: boolean; error?: string }> {
        const clientCorrelationId = this.generateCorrelationId();
        
        try {
            const serverRequest = {
                actionId: actionId,
                record: {
                    sys_id: this.extractValue(record.sys_id),
                    objectType: this.inferObjectType(record)
                },
                metadata: {
                    sourceComponent: 'rbm-record-list',
                    listKey: this.listKey || 'unknown',
                    viewId: this.viewId || null,
                    clientCorrelationId: clientCorrelationId,
                    invocationType: 'row',
                    justification: null // Could be enhanced to collect justification
                }
            };
            
            const response = await fetch(`${this.baseUrl}/row-action`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(serverRequest)
            });
            
            const responseData = await this.handleResponse(response, clientCorrelationId);
            
            return {
                success: true,
                result: responseData.result
            };
            
        } catch (error) {
            console.error('RecordListDataProvider.executeAction error:', error);
            return {
                success: false,
                error: `Action failed: ${error.message} (CorrelationId: ${clientCorrelationId})`
            };
        }
    }
    
    /**
     * Execute bulk action on multiple records
     */
    async executeBulkAction(actionId: string, records: RbmRecord[]): Promise<{ success: boolean; error?: string }> {
        const clientCorrelationId = this.generateCorrelationId();
        
        try {
            const serverRequest = {
                actionId: actionId,
                records: records.map(record => ({
                    sys_id: this.extractValue(record.sys_id),
                    objectType: this.inferObjectType(record)
                })),
                metadata: {
                    sourceComponent: 'rbm-record-list',
                    listKey: this.listKey || 'unknown',
                    viewId: this.viewId || null,
                    clientCorrelationId: clientCorrelationId,
                    invocationType: 'bulk',
                    selectionCount: records.length,
                    justification: null // Could be enhanced to collect justification
                }
            };
            
            const response = await fetch(`${this.baseUrl}/bulk-action`, {
                method: 'POST',
                headers: this.defaultHeaders,
                body: JSON.stringify(serverRequest)
            });
            
            const responseData = await this.handleResponse(response, clientCorrelationId);
            
            // Handle partial failures from bulk operations
            if (responseData.result && typeof responseData.result.failureCount === 'number' && responseData.result.failureCount > 0) {
                const successCount = responseData.result.successCount || 0;
                const failureCount = responseData.result.failureCount;
                const totalCount = responseData.result.totalRecords || records.length;
                
                console.warn(`Bulk action ${actionId} partial failure: ${successCount}/${totalCount} succeeded, ${failureCount} failed - CorrelationId: ${clientCorrelationId}`);
                
                // For partial failures, still return success but include warning
                return {
                    success: true,
                    result: responseData.result,
                    warning: `Action completed with ${failureCount} failures out of ${totalCount} records. Check individual record statuses for details.`
                };
            }
            
            return {
                success: true,
                result: responseData.result
            };
            
        } catch (error) {
            console.error('RecordListDataProvider.executeBulkAction error:', error);
            return {
                success: false,
                error: `Bulk action failed: ${error.message} (CorrelationId: ${clientCorrelationId})`
            };
        }
    }
    
    /**
     * Validate filter values (optional implementation)
     */
    async validateFilters(filters: ActiveFilter[]): Promise<{ valid: boolean; errors?: string[] }> {
        // Could be enhanced to call server-side validation
        // For now, basic client-side validation
        const errors: string[] = [];
        
        for (const filter of filters) {
            if (!filter.field || !filter.operator) {
                errors.push(`Invalid filter: missing field or operator`);
            }
            
            if (filter.value === undefined || filter.value === null) {
                if (!['ISEMPTY', 'ISNOTEMPTY'].includes(filter.operator)) {
                    errors.push(`Filter for field '${filter.field}' requires a value`);
                }
            }
        }
        
        return {
            valid: errors.length === 0,
            errors: errors.length > 0 ? errors : undefined
        };
    }
    
    /**
     * Handle HTTP response with comprehensive error handling
     */
    private async handleResponse(response: Response, correlationId: string): Promise<any> {
        try {
            // Always parse JSON first - ServiceNow returns error details in JSON body
            const responseData = await response.json();
            
            if (!response.ok) {
                // ServiceNow error response format
                const errorMessage = responseData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
                const errorCode = responseData.error?.code || 'HTTP_ERROR';
                const responseCorrelationId = responseData.correlationId || correlationId;
                
                throw new Error(`${errorMessage} (Code: ${errorCode}, CorrelationId: ${responseCorrelationId})`);
            }
            
            // Always propagate correlationId for tracking
            if (responseData.correlationId) {
                console.log(`API Response CorrelationId: ${responseData.correlationId}`);
            }
            
            return responseData;
            
        } catch (jsonError) {
            // If JSON parsing fails, it's likely a network or server error
            if (jsonError instanceof SyntaxError) {
                throw new Error(`Invalid server response (CorrelationId: ${correlationId})`);
            }
            throw jsonError; // Re-throw our formatted error
        }
    }
    
    /**
     * Transform client filters to server filter format
     */
    private transformFilters(filters: ActiveFilter[]): Array<{ field: string; operator: string; value: any }> {
        return filters.map(filter => ({
            field: filter.field,
            operator: filter.operator,
            value: filter.value
        }));
    }
    
    /**
     * Transform server query response to client format
     */
    private transformQueryResponse(serverResponse: any, pagination: { page: number; pageSize: number }): DataProviderResponse {
        const rows = serverResponse.rows || [];
        
        return {
            records: rows.map((row: any) => this.transformRecord(row)),
            pagination: {
                currentPage: pagination.page,
                pageSize: pagination.pageSize,
                totalRecords: serverResponse.total || 0,
                totalPages: serverResponse.total ? Math.ceil(serverResponse.total / pagination.pageSize) : 1,
                hasNextPage: serverResponse.nextCursor !== null,
                hasPreviousPage: pagination.page > 0
            },
            success: true,
            metadata: {
                timestamp: new Date().toISOString(),
                correlationId: serverResponse.correlationId,
                nextCursor: serverResponse.nextCursor || null
            }
        };
    }
    
    /**
     * Transform server record format to client format
     */
    private transformRecord(serverRow: any): RbmRecord {
        return {
            sys_id: {
                display_value: serverRow.sys_id,
                value: serverRow.sys_id
            },
            ...serverRow.fields
        };
    }
    
    /**
     * Build list key from table and optional view ID
     */
    private buildListKey(table: string, viewId?: string): string {
        return viewId ? `${table}.${viewId}` : table;
    }
    
    /**
     * Extract primitive value from ServiceNow field format
     */
    private extractValue(field: any): string {
        if (typeof field === 'string') {
            return field;
        }
        return field?.value || field?.display_value || '';
    }
    
    /**
     * Infer object type from record (enhanced for bulk operations)
     */
    private inferObjectType(record: RbmRecord): string {
        // Try to determine from record structure
        if (record.number && typeof record.number === 'object' && record.number.value) {
            const numberValue = record.number.value;
            if (numberValue.startsWith('INC')) return 'incident';
            if (numberValue.startsWith('TASK')) return 'task';
            if (numberValue.startsWith('REQ')) return 'sc_request';
            if (numberValue.startsWith('CHG')) return 'change_request';
        }
        
        // Check for user records
        if (record.user_name) return 'sys_user';
        
        // Check for CI records
        if (record.install_status || record.operational_status) return 'cmdb_ci';
        
        // Fallback to unknown - server should handle this
        return 'unknown';
    }
    
    /**
     * Generate correlation ID for request tracking
     */
    private generateCorrelationId(): string {
        return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}

/**
 * Factory function to create data provider instance
 */
export function createRecordListDataProvider(options?: { listKey?: string; viewId?: string }): DataProvider {
    return new RecordListDataProvider(options);
}