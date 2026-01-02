/**
 * RBM Audit Metadata Validator - AUTHORITATIVE v1.9.5
 * 
 * Server-side validation for mandatory audit metadata compliance
 * ENFORCES: All fields required, justification enforcement, no client storage
 */

import { gs } from '@servicenow/glide';

export class RBMAuditMetadataValidator {
    
    constructor() {
        this.requiredFields = [
            'sourceComponent',
            'listKey', 
            'clientCorrelationId',
            'invocationType',
            'timestamp',
            'userAgent',
            'actionId',
            'recordIds'
        ];
        
        this.justificationRequiredActions = new Set([
            'delete',
            'bulk_delete', 
            'disable',
            'bulk_disable',
            'force_close',
            'bulk_force_close',
            'reject',
            'bulk_reject',
            'cancel',
            'bulk_cancel'
        ]);
    }
    
    /**
     * Validate complete audit metadata (ALL fields mandatory)
     */
    validateCompleteAuditMetadata(auditMetadata, expectedInvocationType, correlationId) {
        const errors = [];
        const warnings = [];
        
        // STEP 1: Check for presence of auditMetadata object
        if (!auditMetadata) {
            return {
                valid: false,
                errors: ['auditMetadata object is missing'],
                correlationId: correlationId
            };
        }
        
        // STEP 2: Validate ALL mandatory fields
        for (const field of this.requiredFields) {
            if (auditMetadata[field] === undefined || auditMetadata[field] === null) {
                errors.push(`Missing mandatory field: ${field}`);
            }
        }
        
        // STEP 3: Validate viewId (special case - can be null but must be explicitly set)
        if (!auditMetadata.hasOwnProperty('viewId')) {
            errors.push('Missing mandatory field: viewId (can be null but must be explicitly provided)');
        }
        
        // STEP 4: Validate sourceComponent value
        if (auditMetadata.sourceComponent && auditMetadata.sourceComponent !== 'rbm-record-list') {
            errors.push(`Invalid sourceComponent: must be "rbm-record-list", got "${auditMetadata.sourceComponent}"`);
        }
        
        // STEP 5: Validate invocationType
        if (auditMetadata.invocationType) {
            if (!['row', 'bulk'].includes(auditMetadata.invocationType)) {
                errors.push(`Invalid invocationType: must be "row" or "bulk", got "${auditMetadata.invocationType}"`);
            }
            
            if (expectedInvocationType && auditMetadata.invocationType !== expectedInvocationType) {
                errors.push(`Invocation type mismatch: expected "${expectedInvocationType}", got "${auditMetadata.invocationType}"`);
            }
        }
        
        // STEP 6: Validate selectionCount for bulk actions
        if (auditMetadata.invocationType === 'bulk') {
            if (auditMetadata.selectionCount === undefined || auditMetadata.selectionCount === null) {
                errors.push('selectionCount is mandatory for bulk actions');
            } else if (typeof auditMetadata.selectionCount !== 'number' || auditMetadata.selectionCount < 1) {
                errors.push('selectionCount must be a positive number for bulk actions');
            }
        }
        
        // STEP 7: Validate recordIds consistency
        if (auditMetadata.recordIds) {
            if (!Array.isArray(auditMetadata.recordIds)) {
                errors.push('recordIds must be an array');
            } else if (auditMetadata.recordIds.length === 0) {
                errors.push('recordIds array cannot be empty');
            } else if (auditMetadata.invocationType === 'bulk' && auditMetadata.selectionCount) {
                if (auditMetadata.recordIds.length !== auditMetadata.selectionCount) {
                    errors.push(`recordIds count (${auditMetadata.recordIds.length}) must match selectionCount (${auditMetadata.selectionCount})`);
                }
            }
        }
        
        // STEP 8: Validate timestamp format
        if (auditMetadata.timestamp) {
            try {
                const timestamp = new Date(auditMetadata.timestamp);
                if (isNaN(timestamp.getTime())) {
                    errors.push('Invalid timestamp format - must be valid ISO string');
                }
                
                // Check if timestamp is reasonable (not too old, not in future)
                const now = new Date();
                const hourAgo = new Date(now.getTime() - 3600000); // 1 hour ago
                const minuteFromNow = new Date(now.getTime() + 60000); // 1 minute from now
                
                if (timestamp < hourAgo) {
                    warnings.push('Timestamp is older than 1 hour - may indicate client clock issues');
                } else if (timestamp > minuteFromNow) {
                    warnings.push('Timestamp is in the future - may indicate client clock issues');
                }
            } catch (e) {
                errors.push('Invalid timestamp format - must be valid date string');
            }
        }
        
        // STEP 9: Validate clientCorrelationId format
        if (auditMetadata.clientCorrelationId) {
            const correlationPattern = /^client_\d+_[a-f0-9\-]+$/;
            if (!correlationPattern.test(auditMetadata.clientCorrelationId)) {
                errors.push('Invalid clientCorrelationId format - must match pattern "client_{timestamp}_{uuid}"');
            }
        }
        
        // Log validation results
        if (warnings.length > 0) {
            gs.warn(`RBM Audit Metadata Validation Warnings: ${warnings.join(', ')} - CorrelationId: ${correlationId}`);
        }
        
        return {
            valid: errors.length === 0,
            errors: errors,
            warnings: warnings,
            correlationId: correlationId
        };
    }
    
    /**
     * Validate justification enforcement for specific actions
     */
    validateActionJustificationRequirement(actionId, justification, correlationId) {
        const requiresJustification = this.justificationRequiredActions.has(actionId);
        
        if (!requiresJustification) {
            // Action doesn't require justification - validation passes
            return {
                valid: true,
                correlationId: correlationId
            };
        }
        
        // Justification is required for this action
        if (!justification || justification.trim().length === 0) {
            gs.warn(`Justification enforcement failed: Action ${actionId} requires justification but none provided - CorrelationId: ${correlationId}`);
            return {
                valid: false,
                errorMessage: `Action "${actionId}" requires justification for audit compliance but none was provided`,
                correlationId: correlationId
            };
        }
        
        // Validate justification content
        const trimmed = justification.trim();
        if (trimmed.length < 10) {
            return {
                valid: false,
                errorMessage: `Justification must be at least 10 characters (currently ${trimmed.length})`,
                correlationId: correlationId
            };
        }
        
        if (trimmed.length > 1000) {
            return {
                valid: false,
                errorMessage: `Justification must not exceed 1000 characters (currently ${trimmed.length})`,
                correlationId: correlationId
            };
        }
        
        gs.info(`Justification validation passed for action ${actionId} - CorrelationId: ${correlationId}`);
        return {
            valid: true,
            correlationId: correlationId
        };
    }
    
    /**
     * Validate that no client-side storage indicators are present
     */
    validateNoClientSideStorage(auditMetadata, correlationId) {
        const violations = [];
        
        // Check for any fields that might indicate client-side storage
        if (auditMetadata.clientStorageFlags) {
            violations.push('clientStorageFlags detected');
        }
        
        if (auditMetadata.localStorageKeys) {
            violations.push('localStorageKeys detected');
        }
        
        if (auditMetadata.sessionStorageKeys) {
            violations.push('sessionStorageKeys detected'); 
        }
        
        if (auditMetadata.browserCacheIndicators) {
            violations.push('browserCacheIndicators detected');
        }
        
        // Check user agent for suspicious patterns
        if (auditMetadata.userAgent) {
            const suspiciousPatterns = [
                'audit-cache',
                'justification-store',
                'rbm-storage'
            ];
            
            for (const pattern of suspiciousPatterns) {
                if (auditMetadata.userAgent.toLowerCase().includes(pattern)) {
                    violations.push(`Suspicious user agent pattern: ${pattern}`);
                }
            }
        }
        
        if (violations.length > 0) {
            gs.error(`Client-side audit storage violations detected: ${violations.join(', ')} - CorrelationId: ${correlationId}`);
            return {
                valid: false,
                violations: violations,
                correlationId: correlationId
            };
        }
        
        return {
            valid: true,
            correlationId: correlationId
        };
    }
    
    /**
     * Get justification enforcement rules for an action
     */
    getJustificationEnforcement(actionId) {
        const required = this.justificationRequiredActions.has(actionId);
        
        return {
            required: required,
            minLength: required ? 10 : 0,
            maxLength: 1000,
            placeholder: required 
                ? 'Please provide justification for this action (required for audit compliance)...'
                : 'Optional: Provide additional context for this action...'
        };
    }
    
    /**
     * Check if action requires justification
     */
    requiresJustification(actionId) {
        return this.justificationRequiredActions.has(actionId);
    }
    
    /**
     * Generate server-side correlation ID
     */
    generateServerCorrelationId(clientCorrelationId) {
        const timestamp = new Date().toISOString();
        const random = gs.generateGUID();
        return `server_${timestamp}_${random}_client_${clientCorrelationId}`;
    }
}