/**
 * RBM Record List Action Service Script Include
 * 
 * Manages server-side action execution with:
 * - Action registry (allow-list) for permitted actions
 * - Row and bulk action execution with ACL enforcement
 * - Justification enforcement for admin actions
 * - Server-side permission validation
 */

import { gs, GlideRecord, GlideRecordSecure } from '@servicenow/glide';

export class RBMRecordListActionService {
    
    constructor() {
        this.actionRegistry = this._initializeActionRegistry();
    }
    
    /**
     * MANDATORY: Action registry (allow-list) for security
     * Only registered actions can be executed through the API
     */
    _initializeActionRegistry() {
        return {
            // Standard CRUD actions
            'view': {
                type: 'read',
                requiresWrite: false,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['*'], // All tables
                description: 'View record details'
            },
            
            'edit': {
                type: 'write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['*'],
                description: 'Edit record'
            },
            
            'delete': {
                type: 'delete',
                requiresWrite: false,
                requiresDelete: true,
                requiresJustification: true,
                appliesToTables: ['*'],
                description: 'Delete record'
            },
            
            // State management actions
            'activate': {
                type: 'write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['*'],
                description: 'Activate record',
                fieldRequirements: ['active']
            },
            
            'deactivate': {
                type: 'write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['*'],
                description: 'Deactivate record',
                fieldRequirements: ['active']
            },
            
            // Incident-specific actions
            'resolve_incident': {
                type: 'write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['incident'],
                description: 'Resolve incident'
            },
            
            'close_incident': {
                type: 'write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['incident'],
                description: 'Close incident'
            },
            
            // Bulk actions
            'bulk_delete': {
                type: 'bulk_delete',
                requiresWrite: false,
                requiresDelete: true,
                requiresJustification: true,
                appliesToTables: ['*'],
                description: 'Delete multiple records',
                maxRecords: 50 // Lower limit for destructive actions
            },
            
            'bulk_activate': {
                type: 'bulk_write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['*'],
                description: 'Activate multiple records',
                fieldRequirements: ['active'],
                maxRecords: 100
            },
            
            'bulk_deactivate': {
                type: 'bulk_write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['*'],
                description: 'Deactivate multiple records',
                fieldRequirements: ['active'],
                maxRecords: 100
            },
            
            'bulk_assign': {
                type: 'bulk_write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: false,
                appliesToTables: ['incident', 'task'],
                description: 'Assign multiple records',
                maxRecords: 100
            },
            
            // Administrative actions (require justification)
            'admin_force_delete': {
                type: 'admin_delete',
                requiresWrite: false,
                requiresDelete: true,
                requiresJustification: true,
                appliesToTables: ['*'],
                description: 'Administrative force delete',
                requiresRole: 'admin'
            },
            
            'admin_unlock': {
                type: 'admin_write',
                requiresWrite: true,
                requiresDelete: false,
                requiresJustification: true,
                appliesToTables: ['*'],
                description: 'Administrative unlock record',
                requiresRole: 'admin'
            }
        };
    }
    
    /**
     * Validate action against registry
     * @param {string} actionId - Action identifier
     * @param {string} tableName - Target table name
     * @returns {Object} Validation result
     */
    validateAction(actionId, tableName) {
        if (!actionId || typeof actionId !== 'string') {
            return {
                valid: false,
                error: 'actionId is required and must be a string'
            };
        }
        
        const actionDef = this.actionRegistry[actionId];
        if (!actionDef) {
            gs.warn(`RBM Action Service: Rejected unknown actionId: ${actionId} - User: ${gs.getUserID()}`);
            return {
                valid: false,
                error: `Unknown actionId: ${actionId}. Only registered actions are allowed.`
            };
        }
        
        // Check if action applies to this table
        if (actionDef.appliesToTables && 
            !actionDef.appliesToTables.includes('*') && 
            !actionDef.appliesToTables.includes(tableName)) {
            return {
                valid: false,
                error: `Action '${actionId}' is not allowed for table '${tableName}'`
            };
        }
        
        // Check role requirements
        if (actionDef.requiresRole && !gs.hasRole(actionDef.requiresRole)) {
            return {
                valid: false,
                error: `Action '${actionId}' requires role: ${actionDef.requiresRole}`
            };
        }
        
        return {
            valid: true,
            actionDef: actionDef
        };
    }
    
    /**
     * Execute row action on single record
     * @param {string} actionId - Action to execute
     * @param {Object} recordRef - Record reference (sys_id, objectType)
     * @param {Object} metadata - Action metadata including justification
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Execution result
     */
    executeRowAction(actionId, recordRef, metadata, correlationId) {
        try {
            // Validate action
            const actionValidation = this.validateAction(actionId, recordRef.objectType);
            if (!actionValidation.valid) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_ACTION',
                        message: actionValidation.error
                    }
                };
            }
            
            const actionDef = actionValidation.actionDef;
            
            // Check justification requirement
            if (actionDef.requiresJustification && (!metadata.justification || !metadata.justification.trim())) {
                return {
                    success: false,
                    error: {
                        code: 'JUSTIFICATION_REQUIRED',
                        message: `Action '${actionId}' requires justification`
                    }
                };
            }
            
            // Load record with security
            const gr = new GlideRecordSecure(recordRef.objectType);
            if (!gr.get(recordRef.sys_id)) {
                return {
                    success: false,
                    error: {
                        code: 'RECORD_NOT_FOUND',
                        message: 'Record not found or access denied'
                    }
                };
            }
            
            // Execute the specific action
            return this._executeSpecificRowAction(actionId, actionDef, gr, metadata, correlationId);
            
        } catch (error) {
            gs.error(`RBM Row Action Execution Error: ${error.message} - CorrelationId: ${correlationId}`);
            return {
                success: false,
                error: {
                    code: 'EXECUTION_ERROR',
                    message: 'Failed to execute action'
                }
            };
        }
    }
    
    /**
     * Execute bulk action on multiple records
     * @param {string} actionId - Action to execute
     * @param {Array} records - Array of record references
     * @param {Object} metadata - Action metadata
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Execution result with per-record status
     */
    executeBulkAction(actionId, records, metadata, correlationId) {
        try {
            // Validate bulk action
            if (!actionId.startsWith('bulk_')) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_BULK_ACTION',
                        message: 'Action must be a bulk action'
                    }
                };
            }
            
            // Validate records array
            if (!Array.isArray(records) || records.length === 0) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_RECORDS',
                        message: 'Records array is required and must not be empty'
                    }
                };
            }
            
            // Enforce bulk record limit (server-side)
            if (records.length > 100) {
                return {
                    success: false,
                    error: {
                        code: 'BULK_LIMIT_EXCEEDED',
                        message: 'Maximum 100 records allowed per bulk operation'
                    }
                };
            }
            
            // Get a sample table name for action validation
            const sampleTable = records[0]?.objectType;
            const actionValidation = this.validateAction(actionId, sampleTable);
            if (!actionValidation.valid) {
                return {
                    success: false,
                    error: {
                        code: 'INVALID_ACTION',
                        message: actionValidation.error
                    }
                };
            }
            
            const actionDef = actionValidation.actionDef;
            
            // Check action-specific record limit
            if (actionDef.maxRecords && records.length > actionDef.maxRecords) {
                return {
                    success: false,
                    error: {
                        code: 'ACTION_LIMIT_EXCEEDED',
                        message: `Action '${actionId}' allows maximum ${actionDef.maxRecords} records`
                    }
                };
            }
            
            // Check justification requirement
            if (actionDef.requiresJustification && (!metadata.justification || !metadata.justification.trim())) {
                return {
                    success: false,
                    error: {
                        code: 'JUSTIFICATION_REQUIRED',
                        message: `Action '${actionId}' requires justification`
                    }
                };
            }
            
            // Execute bulk operation
            return this._executeBulkOperation(actionId, actionDef, records, metadata, correlationId);
            
        } catch (error) {
            gs.error(`RBM Bulk Action Execution Error: ${error.message} - CorrelationId: ${correlationId}`);
            return {
                success: false,
                error: {
                    code: 'EXECUTION_ERROR',
                    message: 'Failed to execute bulk action'
                }
            };
        }
    }
    
    /**
     * Execute specific row action implementation
     */
    _executeSpecificRowAction(actionId, actionDef, gr, metadata, correlationId) {
        // Check permissions based on action type
        const permissionCheck = this._checkRecordPermissions(gr, actionDef);
        if (!permissionCheck.allowed) {
            return {
                success: false,
                error: {
                    code: 'PERMISSION_DENIED',
                    message: permissionCheck.reason
                }
            };
        }
        
        // Execute based on action type
        switch (actionId) {
            case 'view':
                return this._handleViewAction(gr, metadata);
                
            case 'edit':
                return this._handleEditAction(gr, metadata);
                
            case 'delete':
                return this._handleDeleteAction(gr, metadata, correlationId);
                
            case 'activate':
                return this._handleActivateAction(gr, metadata, correlationId);
                
            case 'deactivate':
                return this._handleDeactivateAction(gr, metadata, correlationId);
                
            default:
                // Handle custom actions
                return this._handleCustomAction(actionId, actionDef, gr, metadata, correlationId);
        }
    }
    
    /**
     * Execute bulk operation with per-record processing
     */
    _executeBulkOperation(actionId, actionDef, records, metadata, correlationId) {
        const results = [];
        let successCount = 0;
        let failureCount = 0;
        
        // Group records by table for efficiency
        const recordsByTable = this._groupRecordsByTable(records);
        
        // Process each table group
        for (const [tableName, tableRecords] of Object.entries(recordsByTable)) {
            for (const record of tableRecords) {
                try {
                    const recordResult = this._processBulkRecord(
                        actionId, actionDef, record, tableName, metadata, correlationId
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
        
        return {
            success: true,
            result: {
                totalRecords: records.length,
                successCount: successCount,
                failureCount: failureCount,
                results: results
            }
        };
    }
    
    /**
     * Check record-level permissions
     */
    _checkRecordPermissions(gr, actionDef) {
        if (actionDef.requiresWrite && !gr.canWrite()) {
            return {
                allowed: false,
                reason: 'Write access denied for this record'
            };
        }
        
        if (actionDef.requiresDelete && !gr.canDelete()) {
            return {
                allowed: false,
                reason: 'Delete access denied for this record'
            };
        }
        
        // Check field requirements
        if (actionDef.fieldRequirements) {
            for (const field of actionDef.fieldRequirements) {
                if (!gr.isValidField(field)) {
                    return {
                        allowed: false,
                        reason: `Record does not have required field: ${field}`
                    };
                }
            }
        }
        
        return { allowed: true };
    }
    
    /**
     * Handle view action
     */
    _handleViewAction(gr, metadata) {
        return {
            success: true,
            result: {
                action: 'view',
                record: {
                    sys_id: gr.getUniqueValue(),
                    display_value: this._getRecordDisplayValue(gr)
                }
            },
            auditRequired: false
        };
    }
    
    /**
     * Handle edit action
     */
    _handleEditAction(gr, metadata) {
        return {
            success: true,
            result: {
                action: 'edit',
                record: {
                    sys_id: gr.getUniqueValue(),
                    display_value: this._getRecordDisplayValue(gr)
                },
                editUrl: `/nav_to.do?uri=${gr.getTableName()}.do?sys_id=${gr.getUniqueValue()}`
            },
            auditRequired: false
        };
    }
    
    /**
     * Handle delete action
     */
    _handleDeleteAction(gr, metadata, correlationId) {
        const auditData = {
            originalRecord: {
                sys_id: gr.getUniqueValue(),
                display_value: this._getRecordDisplayValue(gr),
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
                action: 'delete',
                deleted: true,
                message: 'Record deleted successfully'
            },
            auditRequired: true,
            auditData: auditData
        };
    }
    
    /**
     * Handle activate action
     */
    _handleActivateAction(gr, metadata, correlationId) {
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
                error: {
                    code: 'UPDATE_FAILED',
                    message: 'Failed to activate record'
                }
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
    
    /**
     * Handle deactivate action
     */
    _handleDeactivateAction(gr, metadata, correlationId) {
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
                error: {
                    code: 'UPDATE_FAILED',
                    message: 'Failed to deactivate record'
                }
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
    
    /**
     * Handle custom actions (placeholder)
     */
    _handleCustomAction(actionId, actionDef, gr, metadata, correlationId) {
        return {
            success: false,
            error: {
                code: 'CUSTOM_ACTION_NOT_IMPLEMENTED',
                message: `Custom action '${actionId}' is not implemented`
            }
        };
    }
    
    /**
     * Process single record in bulk operation
     */
    _processBulkRecord(actionId, actionDef, record, tableName, metadata, correlationId) {
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
        
        // Use row action logic for individual record processing
        const rowActionId = actionId.replace('bulk_', '');
        return this._executeSpecificRowAction(rowActionId, actionDef, gr, metadata, correlationId);
    }
    
    /**
     * Group records by table type
     */
    _groupRecordsByTable(records) {
        const grouped = {};
        
        for (const record of records) {
            if (!grouped[record.objectType]) {
                grouped[record.objectType] = [];
            }
            grouped[record.objectType].push(record);
        }
        
        return grouped;
    }
    
    /**
     * Get display value for record
     */
    _getRecordDisplayValue(gr) {
        const displayFields = ['short_description', 'name', 'title', 'number', 'label'];
        
        for (const field of displayFields) {
            if (gr.isValidField(field)) {
                const value = gr.getDisplayValue(field);
                if (value && value.trim()) {
                    return value;
                }
            }
        }
        
        return gr.getUniqueValue();
    }
    
    /**
     * Get action definition (for external access)
     */
    getActionDefinition(actionId) {
        return this.actionRegistry[actionId] || null;
    }
    
    /**
     * Get all registered actions (for administrative purposes)
     */
    getRegisteredActions() {
        return Object.keys(this.actionRegistry);
    }
}