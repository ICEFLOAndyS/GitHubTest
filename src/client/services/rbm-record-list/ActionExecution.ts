/**
 * RBM Record List Action Execution Module - AUTHORITATIVE v1.9.5
 * 
 * Handles row and bulk action execution with:
 * - Mandatory audit metadata enforcement (ALL fields required)
 * - Justification collection and validation  
 * - Complete correlation ID tracking
 * - RBM compliance validation
 */

import { RbmRecord, ActionDef, BulkActionDef } from '../../components/rbm-record-list/types';
import { 
  MandatoryAuditMetadata,
  CompleteAuditMetadata,
  AuditedActionRequest,
  AuditedActionResponse 
} from '../../components/rbm-record-list/audit-metadata';
import {
  createAuditMetadataBuilder,
  correlationIdGenerator,
  rbmComplianceChecker,
  acceptanceCriteriaValidator
} from '../../components/rbm-record-list/audit-metadata-impl';

/**
 * DEPRECATED: Use CompleteAuditMetadata from audit-metadata.ts instead
 * @deprecated
 */
export interface ActionExecutionContext {
  /** MANDATORY: Source component identifier */
  sourceComponent: 'rbm-record-list';
  /** MANDATORY: List key for the data set */
  listKey: string;
  /** MANDATORY: View identifier (if present) */
  viewId: string | null;
  /** MANDATORY: Client correlation ID */
  clientCorrelationId: string;
  /** MANDATORY: Invocation type */
  invocationType: 'row' | 'bulk';
  /** MANDATORY for bulk: Selection count */
  selectionCount?: number;
  /** Justification text (when required) */
  justification?: string;
}

/**
 * Enhanced action execution options with authoritative audit metadata
 */
export interface ActionExecutionOptions {
  /** List key identifying the data set */
  listKey: string;
  /** View identifier (null if none) */
  viewId?: string | null;
  /** Pre-generated correlation ID (optional) */
  correlationId?: string;
  /** Justification text (when action requires it) */
  justification?: string;
  /** Action definition for validation */
  actionDef?: ActionDef | BulkActionDef;
}

/**
 * Create complete audited action request for row action
 * ENFORCES all mandatory metadata requirements
 */
export function createRowActionRequest(
  actionId: string,
  record: RbmRecord,
  options: ActionExecutionOptions
): AuditedActionRequest {
  // Extract record sys_id
  const recordId = typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id;
  
  // Generate correlation ID if not provided
  const correlationId = options.correlationId || correlationIdGenerator.generate();
  
  // Validate justification if action requires it
  if (options.actionDef && rbmComplianceChecker.requiresJustification(actionId)) {
    if (!options.justification || options.justification.trim().length === 0) {
      throw new Error(`Action ${actionId} requires justification but none provided`);
    }
    
    const enforcement = rbmComplianceChecker.getJustificationEnforcement(actionId);
    const justificationValidation = rbmComplianceChecker.validateJustification(
      options.justification, 
      enforcement
    );
    
    if (!justificationValidation.valid) {
      throw new Error(`Invalid justification: ${justificationValidation.errorMessage}`);
    }
  }
  
  // Build complete audit metadata
  const auditMetadata = createAuditMetadataBuilder()
    .withListKey(options.listKey)
    .withViewId(options.viewId || null)
    .withClientCorrelationId(correlationId)
    .withInvocationType('row')
    .withActionId(actionId)
    .withRecordIds([recordId])
    .withJustification(options.justification || '')
    .build();
  
  return {
    actionId,
    records: [record],
    auditMetadata
  };
}

/**
 * Create complete audited action request for bulk action
 * ENFORCES all mandatory metadata requirements including selectionCount
 */
export function createBulkActionRequest(
  actionId: string,
  records: RbmRecord[],
  options: ActionExecutionOptions
): AuditedActionRequest {
  if (records.length === 0) {
    throw new Error('Cannot create bulk action request with empty record selection');
  }
  
  // Extract record sys_ids
  const recordIds = records.map(record => 
    typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id
  );
  
  // Generate correlation ID if not provided
  const correlationId = options.correlationId || correlationIdGenerator.generate();
  
  // Validate justification if action requires it
  if (options.actionDef && rbmComplianceChecker.requiresJustification(actionId)) {
    if (!options.justification || options.justification.trim().length === 0) {
      throw new Error(`Bulk action ${actionId} requires justification but none provided`);
    }
    
    const enforcement = rbmComplianceChecker.getJustificationEnforcement(actionId);
    const justificationValidation = rbmComplianceChecker.validateJustification(
      options.justification, 
      enforcement
    );
    
    if (!justificationValidation.valid) {
      throw new Error(`Invalid justification: ${justificationValidation.errorMessage}`);
    }
  }
  
  // Build complete audit metadata with MANDATORY selectionCount
  const auditMetadata = createAuditMetadataBuilder()
    .withListKey(options.listKey)
    .withViewId(options.viewId || null)
    .withClientCorrelationId(correlationId)
    .withInvocationType('bulk')
    .withSelectionCount(records.length) // MANDATORY for bulk
    .withActionId(actionId)
    .withRecordIds(recordIds)
    .withJustification(options.justification || '')
    .build();
  
  return {
    actionId,
    records: [...records], // Defensive copy
    auditMetadata
  };
}

/**
 * DEPRECATED: Use createRowActionRequest or createBulkActionRequest instead
 * @deprecated
 */
export function createMandatoryAuditMetadata(options: {
  listKey: string;
  viewId?: string | null;
  invocationType: 'row' | 'bulk';
  clientCorrelationId: string;
  selectionCount?: number;
  justification?: string;
}): ActionExecutionContext {
  console.warn('createMandatoryAuditMetadata is deprecated. Use createRowActionRequest or createBulkActionRequest instead.');
  
  const metadata: ActionExecutionContext = {
    sourceComponent: 'rbm-record-list', // MANDATORY
    listKey: options.listKey, // MANDATORY
    viewId: options.viewId || null, // MANDATORY (if present)
    clientCorrelationId: options.clientCorrelationId, // MANDATORY
    invocationType: options.invocationType // MANDATORY
  };
  
  // MANDATORY for bulk actions
  if (options.invocationType === 'bulk') {
    if (options.selectionCount === undefined) {
      throw new Error('selectionCount is mandatory for bulk actions');
    }
    metadata.selectionCount = options.selectionCount;
  }
  
  // Include justification when provided
  if (options.justification) {
    metadata.justification = options.justification;
  }
  
  return metadata;
}

/**
 * DEPRECATED: Use rbmComplianceChecker.validateMandatoryMetadata() instead
 * @deprecated
 */
export function validateMandatoryMetadata(metadata: Partial<ActionExecutionContext>): {
  valid: boolean;
  missingFields?: string[];
} {
  console.warn('validateMandatoryMetadata is deprecated. Use rbmComplianceChecker.validateMandatoryMetadata() instead.');
  
  const validation = rbmComplianceChecker.validateMandatoryMetadata(metadata as any);
  return {
    valid: validation.valid,
    missingFields: validation.missingFields as string[]
  };
}

/**
 * DEPRECATED: Use rbmComplianceChecker.requiresJustification() instead
 * @deprecated
 */
export function actionRequiresJustification(actionDef?: ActionDef | BulkActionDef): boolean {
  console.warn('actionRequiresJustification is deprecated. Use rbmComplianceChecker.requiresJustification() instead.');
  
  if (actionDef?.requiresJustification) {
    return true;
  }
  
  // Fallback to checking action ID if available
  if (actionDef?.id) {
    return rbmComplianceChecker.requiresJustification(actionDef.id);
  }
  
  return false;
}

/**
 * DEPRECATED: Use rbmComplianceChecker.validateJustification() instead
 * @deprecated
 */
export function validateJustification(
  justification: string, 
  actionDef?: ActionDef | BulkActionDef
): { valid: boolean; message?: string } {
  console.warn('validateJustification is deprecated. Use rbmComplianceChecker.validateJustification() instead.');
  
  // Extract action ID for enforcement rules
  const actionId = actionDef?.id || 'unknown';
  const enforcement = rbmComplianceChecker.getJustificationEnforcement(actionId);
  
  return rbmComplianceChecker.validateJustification(justification, enforcement);
}

/**
 * Validate complete action request meets all RBM requirements
 */
export function validateActionRequest(request: AuditedActionRequest): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];
  
  // 1. Validate metadata presence
  if (!acceptanceCriteriaValidator.validateMetadataPresence(request)) {
    errors.push('Missing or invalid audit metadata');
  }
  
  // 2. Validate justification enforcement
  const requiresJustification = rbmComplianceChecker.requiresJustification(request.actionId);
  const hasJustification = !!(request.auditMetadata.justification && 
                            request.auditMetadata.justification.trim().length > 0);
  
  if (!acceptanceCriteriaValidator.validateJustificationEnforcement(request.actionId, hasJustification)) {
    errors.push(`Action ${request.actionId} requires justification but none provided`);
  }
  
  // 3. Validate no client-side audit storage
  if (!acceptanceCriteriaValidator.validateNoClientSideStorage()) {
    errors.push('Audit data found in client-side storage (violation of security policy)');
  }
  
  // 4. Validate record selection consistency
  if (request.auditMetadata.recordIds.length !== request.records.length) {
    errors.push('Record count mismatch between audit metadata and actual records');
  }
  
  // 5. Validate bulk action selection count
  if (request.auditMetadata.invocationType === 'bulk') {
    if (request.auditMetadata.selectionCount === undefined) {
      errors.push('selectionCount is mandatory for bulk actions');
    } else if (request.auditMetadata.selectionCount !== request.records.length) {
      errors.push(`selectionCount mismatch: metadata=${request.auditMetadata.selectionCount}, actual=${request.records.length}`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}