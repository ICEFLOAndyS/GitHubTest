/**
 * RBM Audit Metadata Implementation - AUTHORITATIVE v1.9.5
 * 
 * Concrete implementations for audit metadata handling
 */

import { 
  MandatoryAuditMetadata,
  CompleteAuditMetadata,
  AuditMetadataBuilder,
  AuditMetadataValidation,
  CorrelationIdGenerator,
  RbmComplianceChecker,
  JustificationEnforcement,
  AcceptanceCriteriaValidator
} from './audit-metadata';

/**
 * Standard client correlation ID generator
 */
export class StandardCorrelationIdGenerator implements CorrelationIdGenerator {
  generate(): string {
    const timestamp = Date.now();
    const random = crypto.randomUUID ? 
      crypto.randomUUID() : 
      Math.random().toString(36).substr(2, 9);
    return `client_${timestamp}_${random}`;
  }
}

/**
 * Audit metadata builder implementation
 */
export class StandardAuditMetadataBuilder implements AuditMetadataBuilder {
  private metadata: Partial<{
    sourceComponent: 'rbm-record-list';
    listKey: string;
    viewId: string | null;
    clientCorrelationId: string;
    invocationType: 'row' | 'bulk';
    selectionCount?: number;
    justification?: string;
    timestamp: string;
    userAgent: string;
    actionId: string;
    recordIds: string[];
  }> = {
    sourceComponent: 'rbm-record-list', // Always set
    timestamp: new Date().toISOString(),
    userAgent: navigator.userAgent
  };
  
  withListKey(listKey: string): AuditMetadataBuilder {
    this.metadata.listKey = listKey;
    return this;
  }
  
  withViewId(viewId: string | null): AuditMetadataBuilder {
    this.metadata.viewId = viewId;
    return this;
  }
  
  withClientCorrelationId(correlationId: string): AuditMetadataBuilder {
    this.metadata.clientCorrelationId = correlationId;
    return this;
  }
  
  withInvocationType(type: 'row' | 'bulk'): AuditMetadataBuilder {
    this.metadata.invocationType = type;
    return this;
  }
  
  withSelectionCount(count: number): AuditMetadataBuilder {
    this.metadata.selectionCount = count;
    return this;
  }
  
  withJustification(justification: string): AuditMetadataBuilder {
    this.metadata.justification = justification;
    return this;
  }
  
  withActionId(actionId: string): AuditMetadataBuilder {
    this.metadata.actionId = actionId;
    return this;
  }
  
  withRecordIds(recordIds: string[]): AuditMetadataBuilder {
    this.metadata.recordIds = [...recordIds]; // Defensive copy
    return this;
  }
  
  build(): CompleteAuditMetadata {
    const validation = this.validateComplete();
    if (!validation.valid) {
      throw new Error(`Invalid audit metadata: ${validation.errorMessage}`);
    }
    
    return {
      sourceComponent: this.metadata.sourceComponent!,
      listKey: this.metadata.listKey!,
      viewId: this.metadata.viewId!,
      clientCorrelationId: this.metadata.clientCorrelationId!,
      invocationType: this.metadata.invocationType!,
      selectionCount: this.metadata.selectionCount,
      justification: this.metadata.justification,
      timestamp: this.metadata.timestamp!,
      userAgent: this.metadata.userAgent!,
      actionId: this.metadata.actionId!,
      recordIds: this.metadata.recordIds!
    };
  }
  
  buildMandatory(): MandatoryAuditMetadata {
    const validation = this.validateMandatory();
    if (!validation.valid) {
      throw new Error(`Invalid mandatory metadata: ${validation.errorMessage}`);
    }
    
    return {
      sourceComponent: this.metadata.sourceComponent!,
      listKey: this.metadata.listKey!,
      viewId: this.metadata.viewId!,
      clientCorrelationId: this.metadata.clientCorrelationId!,
      invocationType: this.metadata.invocationType!,
      ...(this.metadata.invocationType === 'bulk' && { selectionCount: this.metadata.selectionCount })
    } as MandatoryAuditMetadata;
  }
  
  private validateMandatory(): AuditMetadataValidation {
    const required = [
      'sourceComponent',
      'listKey',
      'clientCorrelationId',
      'invocationType'
    ];
    
    // viewId is always required (can be null but must be explicitly set)
    if (this.metadata.viewId === undefined) {
      required.push('viewId');
    }
    
    // selectionCount is required for bulk actions
    if (this.metadata.invocationType === 'bulk') {
      required.push('selectionCount');
    }
    
    const missing: string[] = [];
    for (const field of required) {
      if (this.metadata[field] === undefined) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return {
        valid: false,
        missingFields: missing,
        errorMessage: `Missing required fields: ${missing.join(', ')}`
      };
    }
    
    return { valid: true };
  }
  
  private validateComplete(): AuditMetadataValidation {
    const mandatoryValidation = this.validateMandatory();
    if (!mandatoryValidation.valid) {
      return mandatoryValidation;
    }
    
    // Additional validation for complete metadata
    const required = ['timestamp', 'userAgent', 'actionId', 'recordIds'];
    const missing: string[] = [];
    
    for (const field of required) {
      if (this.metadata[field] === undefined) {
        missing.push(field);
      }
    }
    
    if (missing.length > 0) {
      return {
        valid: false,
        missingFields: missing,
        errorMessage: `Missing required fields for complete metadata: ${missing.join(', ')}`
      };
    }
    
    return { valid: true };
  }
}

/**
 * RBM compliance checker implementation
 */
export class StandardRbmComplianceChecker implements RbmComplianceChecker {
  private justificationRequiredActions = new Set([
    'delete',
    'bulk_delete',
    'disable',
    'bulk_disable',
    'force_close',
    'bulk_force_close'
  ]);
  
  validateMandatoryMetadata(metadata: Partial<MandatoryAuditMetadata>): AuditMetadataValidation {
    const required = [
      'sourceComponent',
      'listKey',
      'clientCorrelationId',
      'invocationType'
    ];
    
    // viewId is always required (can be null but must be explicitly set)
    if (metadata.viewId === undefined) {
      required.push('viewId');
    }
    
    // selectionCount is required for bulk actions
    if (metadata.invocationType === 'bulk') {
      required.push('selectionCount');
    }
    
    const missing: string[] = [];
    for (const field of required) {
      if (metadata[field] === undefined) {
        missing.push(field);
      }
    }
    
    // Validate sourceComponent value
    if (metadata.sourceComponent && metadata.sourceComponent !== 'rbm-record-list') {
      return {
        valid: false,
        errorMessage: `sourceComponent must be "rbm-record-list", got "${metadata.sourceComponent}"`
      };
    }
    
    // Validate invocationType value
    if (metadata.invocationType && !['row', 'bulk'].includes(metadata.invocationType)) {
      return {
        valid: false,
        errorMessage: `invocationType must be "row" or "bulk", got "${metadata.invocationType}"`
      };
    }
    
    if (missing.length > 0) {
      return {
        valid: false,
        missingFields: missing,
        errorMessage: `Missing required fields: ${missing.join(', ')}`
      };
    }
    
    return { valid: true };
  }
  
  validateJustification(justification: string, enforcement: JustificationEnforcement): AuditMetadataValidation {
    if (!justification || justification.trim().length === 0) {
      if (enforcement.required) {
        return {
          valid: false,
          errorMessage: 'Justification is required for this action'
        };
      }
      return { valid: true }; // Not required, empty is OK
    }
    
    const trimmed = justification.trim();
    
    if (trimmed.length < enforcement.minLength) {
      return {
        valid: false,
        errorMessage: `Justification must be at least ${enforcement.minLength} characters (currently ${trimmed.length})`
      };
    }
    
    if (trimmed.length > enforcement.maxLength) {
      return {
        valid: false,
        errorMessage: `Justification must not exceed ${enforcement.maxLength} characters (currently ${trimmed.length})`
      };
    }
    
    return { valid: true };
  }
  
  requiresJustification(actionId: string): boolean {
    return this.justificationRequiredActions.has(actionId);
  }
  
  getJustificationEnforcement(actionId: string): JustificationEnforcement {
    const required = this.requiresJustification(actionId);
    
    return {
      required,
      minLength: required ? 10 : 0,
      maxLength: 1000,
      placeholder: required 
        ? 'Please provide justification for this action (required for audit compliance)...'
        : 'Optional: Provide additional context for this action...'
    };
  }
}

/**
 * Acceptance criteria validator implementation
 */
export class StandardAcceptanceCriteriaValidator implements AcceptanceCriteriaValidator {
  private complianceChecker = new StandardRbmComplianceChecker();
  
  validateMetadataPresence(request: any): boolean {
    // Check that request has auditMetadata property
    if (!request.auditMetadata) {
      console.error('Acceptance criteria violation: Missing auditMetadata in request');
      return false;
    }
    
    // Validate mandatory metadata is complete
    const validation = this.complianceChecker.validateMandatoryMetadata(request.auditMetadata);
    if (!validation.valid) {
      console.error('Acceptance criteria violation: Invalid mandatory metadata -', validation.errorMessage);
      return false;
    }
    
    return true;
  }
  
  validateJustificationEnforcement(actionId: string, hasJustification: boolean): boolean {
    const requiresJustification = this.complianceChecker.requiresJustification(actionId);
    
    if (requiresJustification && !hasJustification) {
      console.error(`Acceptance criteria violation: Action ${actionId} requires justification but none provided`);
      return false;
    }
    
    return true;
  }
  
  validateNoClientSideStorage(): boolean {
    try {
      // Check localStorage for audit data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('audit') || key.includes('justification') || key.includes('rbm-compliance'))) {
          console.error('Acceptance criteria violation: Audit data found in localStorage:', key);
          return false;
        }
      }
      
      // Check sessionStorage for audit data
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (key.includes('audit') || key.includes('justification') || key.includes('rbm-compliance'))) {
          console.error('Acceptance criteria violation: Audit data found in sessionStorage:', key);
          return false;
        }
      }
      
      return true;
    } catch (error) {
      console.warn('Could not check client-side storage:', error);
      return true; // Assume compliant if we can't check
    }
  }
}

// Singleton instances for application use
export const correlationIdGenerator = new StandardCorrelationIdGenerator();
export const rbmComplianceChecker = new StandardRbmComplianceChecker();
export const acceptanceCriteriaValidator = new StandardAcceptanceCriteriaValidator();

/**
 * Factory function to create audit metadata builder
 */
export function createAuditMetadataBuilder(): AuditMetadataBuilder {
  return new StandardAuditMetadataBuilder();
}

/**
 * Utility function to create mandatory audit metadata quickly
 */
export function createMandatoryAuditMetadata(options: {
  listKey: string;
  viewId?: string | null;
  invocationType: 'row' | 'bulk';
  selectionCount?: number;
  correlationId?: string;
}): MandatoryAuditMetadata {
  const builder = createAuditMetadataBuilder()
    .withListKey(options.listKey)
    .withViewId(options.viewId || null)
    .withInvocationType(options.invocationType)
    .withClientCorrelationId(options.correlationId || correlationIdGenerator.generate());
  
  if (options.invocationType === 'bulk' && options.selectionCount !== undefined) {
    builder.withSelectionCount(options.selectionCount);
  }
  
  return builder.buildMandatory();
}