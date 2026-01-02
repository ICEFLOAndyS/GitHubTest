/**
 * RBM Evidence Service Script Include
 * 
 * Provides evidence/audit write interface for RBM governance compliance.
 * This service ensures all state-changing actions are properly documented
 * for audit, compliance, and governance requirements.
 * 
 * Note: This is the stable interface - implementation may be stubbed initially
 * and enhanced over time without breaking consuming services.
 */

import { gs, GlideRecord } from '@servicenow/glide';

export class RBMEvidenceService {
    
    constructor() {
        this.auditTableName = 'sys_audit'; // Standard ServiceNow audit table
        this.rbmAuditTableName = 'x_icefl_git_rbm_audit'; // Custom RBM audit table (if exists)
    }
    
    /**
     * Write audit evidence for a single record action
     * @param {Object} evidenceData - Evidence data structure
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Write result
     */
    writeRecordActionEvidence(evidenceData, correlationId) {
        try {
            const requiredFields = [
                'actionId', 'recordId', 'tableName', 'userId', 
                'sourceComponent', 'timestamp'
            ];
            
            const validation = this._validateEvidenceData(evidenceData, requiredFields);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error
                };
            }
            
            // Write to standard ServiceNow audit table
            const auditSysId = this._writeToAuditTable(evidenceData, correlationId);
            
            // Write to custom RBM audit table if it exists
            const rbmAuditSysId = this._writeToRBMAuditTable(evidenceData, correlationId);
            
            // Log for monitoring
            this._logEvidenceWrite(evidenceData, correlationId, 'record_action');
            
            return {
                success: true,
                auditSysId: auditSysId,
                rbmAuditSysId: rbmAuditSysId,
                correlationId: correlationId
            };
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Record Action Error: ${error.message} - CorrelationId: ${correlationId}`);
            return {
                success: false,
                error: 'Failed to write record action evidence'
            };
        }
    }
    
    /**
     * Write audit evidence for a bulk action (parent batch record)
     * @param {Object} batchEvidenceData - Batch evidence data
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Write result with batch ID
     */
    writeBulkActionBatchEvidence(batchEvidenceData, correlationId) {
        try {
            const requiredFields = [
                'actionId', 'recordCount', 'userId', 'sourceComponent', 
                'timestamp', 'listKey'
            ];
            
            const validation = this._validateEvidenceData(batchEvidenceData, requiredFields);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error
                };
            }
            
            // Create parent batch record
            const batchAuditSysId = this._writeBatchAuditRecord(batchEvidenceData, correlationId);
            
            // Log batch creation
            this._logEvidenceWrite(batchEvidenceData, correlationId, 'bulk_batch');
            
            return {
                success: true,
                batchAuditSysId: batchAuditSysId,
                correlationId: correlationId
            };
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Bulk Batch Error: ${error.message} - CorrelationId: ${correlationId}`);
            return {
                success: false,
                error: 'Failed to write bulk batch evidence'
            };
        }
    }
    
    /**
     * Write audit evidence for individual record in bulk action (child record)
     * @param {Object} recordEvidenceData - Individual record evidence
     * @param {string} batchAuditSysId - Parent batch audit sys_id
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Write result
     */
    writeBulkActionRecordEvidence(recordEvidenceData, batchAuditSysId, correlationId) {
        try {
            const requiredFields = [
                'actionId', 'recordId', 'tableName', 'userId', 
                'sourceComponent', 'timestamp', 'batchResult'
            ];
            
            const validation = this._validateEvidenceData(recordEvidenceData, requiredFields);
            if (!validation.valid) {
                return {
                    success: false,
                    error: validation.error
                };
            }
            
            // Add parent batch reference
            recordEvidenceData.parentBatchId = batchAuditSysId;
            recordEvidenceData.correlationId = correlationId;
            
            // Write child record evidence
            const auditSysId = this._writeToAuditTable(recordEvidenceData, correlationId);
            const rbmAuditSysId = this._writeToRBMAuditTable(recordEvidenceData, correlationId);
            
            // Log child record evidence
            this._logEvidenceWrite(recordEvidenceData, correlationId, 'bulk_record');
            
            return {
                success: true,
                auditSysId: auditSysId,
                rbmAuditSysId: rbmAuditSysId,
                parentBatchId: batchAuditSysId
            };
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Bulk Record Error: ${error.message} - CorrelationId: ${correlationId}`);
            return {
                success: false,
                error: 'Failed to write bulk record evidence'
            };
        }
    }
    
    /**
     * Update batch evidence with final results
     * @param {string} batchAuditSysId - Batch audit sys_id
     * @param {Object} finalResults - Final execution results
     * @param {string} correlationId - Request correlation ID
     * @returns {Object} Update result
     */
    updateBatchEvidenceResults(batchAuditSysId, finalResults, correlationId) {
        try {
            if (!batchAuditSysId) {
                return {
                    success: false,
                    error: 'Batch audit sys_id is required'
                };
            }
            
            // Update standard audit table
            const auditGr = new GlideRecord(this.auditTableName);
            if (auditGr.get(batchAuditSysId)) {
                const comments = JSON.parse(auditGr.getValue('comments') || '{}');
                comments.finalResults = finalResults;
                comments.completedAt = new Date().toISOString();
                comments.status = 'completed';
                
                auditGr.setValue('comments', JSON.stringify(comments));
                auditGr.update();
            }
            
            // Update RBM audit table if exists
            this._updateRBMAuditResults(batchAuditSysId, finalResults);
            
            // Log completion
            gs.info(`RBM Evidence: Batch ${batchAuditSysId} completed - CorrelationId: ${correlationId}`);
            
            return {
                success: true,
                batchAuditSysId: batchAuditSysId
            };
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Update Batch Error: ${error.message} - CorrelationId: ${correlationId}`);
            return {
                success: false,
                error: 'Failed to update batch evidence'
            };
        }
    }
    
    /**
     * Query audit evidence for a record
     * @param {string} recordId - Record sys_id
     * @param {Object} options - Query options
     * @returns {Array} Audit evidence records
     */
    queryRecordEvidence(recordId, options = {}) {
        try {
            const evidenceRecords = [];
            
            // Query standard audit table
            const auditGr = new GlideRecord(this.auditTableName);
            auditGr.addQuery('documentkey', recordId);
            
            if (options.actionId) {
                auditGr.addQuery('newvalue', 'CONTAINS', options.actionId);
            }
            
            if (options.startDate) {
                auditGr.addQuery('sys_created_on', '>=', options.startDate);
            }
            
            if (options.endDate) {
                auditGr.addQuery('sys_created_on', '<=', options.endDate);
            }
            
            auditGr.orderByDesc('sys_created_on');
            auditGr.query();
            
            while (auditGr.next()) {
                evidenceRecords.push(this._buildEvidenceRecord(auditGr));
            }
            
            return evidenceRecords;
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Query Error: ${error.message}`);
            return [];
        }
    }
    
    /**
     * Validate evidence data structure
     */
    _validateEvidenceData(evidenceData, requiredFields) {
        if (!evidenceData || typeof evidenceData !== 'object') {
            return {
                valid: false,
                error: 'Evidence data is required and must be an object'
            };
        }
        
        const missingFields = [];
        for (const field of requiredFields) {
            if (!evidenceData[field]) {
                missingFields.push(field);
            }
        }
        
        if (missingFields.length > 0) {
            return {
                valid: false,
                error: `Missing required fields: ${missingFields.join(', ')}`
            };
        }
        
        return { valid: true };
    }
    
    /**
     * Write to standard ServiceNow audit table
     */
    _writeToAuditTable(evidenceData, correlationId) {
        try {
            const auditGr = new GlideRecord(this.auditTableName);
            auditGr.initialize();
            
            auditGr.setValue('tablename', evidenceData.tableName || 'rbm_action');
            auditGr.setValue('documentkey', evidenceData.recordId || correlationId);
            auditGr.setValue('fieldname', 'rbm_action');
            auditGr.setValue('oldvalue', evidenceData.oldValue || 'N/A');
            auditGr.setValue('newvalue', evidenceData.actionId);
            auditGr.setValue('reason', 'RBM Record List Action');
            
            // Store complete evidence in comments field
            const evidenceMetadata = {
                ...evidenceData,
                correlationId: correlationId,
                auditType: 'rbm_record_list',
                evidenceVersion: '1.0'
            };
            
            auditGr.setValue('comments', JSON.stringify(evidenceMetadata));
            
            return auditGr.insert();
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Audit Table Write Error: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Write to custom RBM audit table (if exists)
     */
    _writeToRBMAuditTable(evidenceData, correlationId) {
        try {
            // Check if custom RBM audit table exists
            if (!gs.getTableDescriptor(this.rbmAuditTableName)) {
                return null; // Table doesn't exist - skip
            }
            
            const rbmAuditGr = new GlideRecord(this.rbmAuditTableName);
            rbmAuditGr.initialize();
            
            // Map evidence data to RBM audit fields
            rbmAuditGr.setValue('action_id', evidenceData.actionId);
            rbmAuditGr.setValue('record_id', evidenceData.recordId);
            rbmAuditGr.setValue('table_name', evidenceData.tableName);
            rbmAuditGr.setValue('user_id', evidenceData.userId);
            rbmAuditGr.setValue('source_component', evidenceData.sourceComponent);
            rbmAuditGr.setValue('correlation_id', correlationId);
            rbmAuditGr.setValue('evidence_data', JSON.stringify(evidenceData));
            
            if (evidenceData.justification) {
                rbmAuditGr.setValue('justification', evidenceData.justification);
            }
            
            if (evidenceData.parentBatchId) {
                rbmAuditGr.setValue('parent_batch_id', evidenceData.parentBatchId);
            }
            
            return rbmAuditGr.insert();
            
        } catch (error) {
            gs.warn(`RBM Evidence Service - RBM Audit Table Write Error: ${error.message}`);
            return null; // Don't fail if custom table has issues
        }
    }
    
    /**
     * Write batch audit record
     */
    _writeBatchAuditRecord(batchEvidenceData, correlationId) {
        try {
            const batchAuditGr = new GlideRecord(this.auditTableName);
            batchAuditGr.initialize();
            
            batchAuditGr.setValue('tablename', 'rbm_bulk_action');
            batchAuditGr.setValue('documentkey', correlationId);
            batchAuditGr.setValue('fieldname', 'batch_operation');
            batchAuditGr.setValue('oldvalue', 'N/A');
            batchAuditGr.setValue('newvalue', batchEvidenceData.actionId);
            batchAuditGr.setValue('reason', 'RBM Bulk Action - Parent Batch');
            
            const batchMetadata = {
                ...batchEvidenceData,
                correlationId: correlationId,
                auditType: 'rbm_bulk_batch',
                evidenceVersion: '1.0',
                status: 'processing'
            };
            
            batchAuditGr.setValue('comments', JSON.stringify(batchMetadata));
            
            return batchAuditGr.insert();
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Batch Audit Error: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Update RBM audit results
     */
    _updateRBMAuditResults(batchAuditSysId, finalResults) {
        try {
            if (!gs.getTableDescriptor(this.rbmAuditTableName)) {
                return; // Table doesn't exist - skip
            }
            
            const rbmAuditGr = new GlideRecord(this.rbmAuditTableName);
            rbmAuditGr.addQuery('correlation_id', batchAuditSysId);
            rbmAuditGr.query();
            
            if (rbmAuditGr.next()) {
                const evidenceData = JSON.parse(rbmAuditGr.getValue('evidence_data') || '{}');
                evidenceData.finalResults = finalResults;
                evidenceData.completedAt = new Date().toISOString();
                
                rbmAuditGr.setValue('evidence_data', JSON.stringify(evidenceData));
                rbmAuditGr.update();
            }
            
        } catch (error) {
            gs.warn(`RBM Evidence Service - RBM Update Error: ${error.message}`);
        }
    }
    
    /**
     * Build evidence record for query response
     */
    _buildEvidenceRecord(auditGr) {
        try {
            const evidence = {
                sys_id: auditGr.getUniqueValue(),
                timestamp: auditGr.getValue('sys_created_on'),
                user: auditGr.getDisplayValue('sys_created_by'),
                tableName: auditGr.getValue('tablename'),
                recordId: auditGr.getValue('documentkey'),
                action: auditGr.getValue('newvalue'),
                reason: auditGr.getValue('reason')
            };
            
            // Parse comments for additional metadata
            try {
                const comments = auditGr.getValue('comments');
                if (comments) {
                    evidence.metadata = JSON.parse(comments);
                }
            } catch (parseError) {
                // Comments not JSON - use as string
                evidence.comments = auditGr.getValue('comments');
            }
            
            return evidence;
            
        } catch (error) {
            gs.error(`RBM Evidence Service - Build Record Error: ${error.message}`);
            return null;
        }
    }
    
    /**
     * Log evidence write operation
     */
    _logEvidenceWrite(evidenceData, correlationId, evidenceType) {
        const logMessage = `RBM Evidence Written - Type: ${evidenceType}, Action: ${evidenceData.actionId}, User: ${evidenceData.userId}, CorrelationId: ${correlationId}`;
        gs.info(logMessage);
    }
    
    /**
     * Check if custom RBM audit table is available
     */
    isRBMAuditTableAvailable() {
        return gs.getTableDescriptor(this.rbmAuditTableName) !== null;
    }
}