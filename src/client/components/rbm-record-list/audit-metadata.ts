/**
 * RBM Audit Metadata Types - AUTHORITATIVE v1.9.5
 * 
 * Mandatory audit metadata for all record list actions
 * Ensures compliance with RBM governance requirements
 */

/**
 * Mandatory metadata that must be included in EVERY action request
 * No exceptions - all fields are required
 */
export interface MandatoryAuditMetadata {
  /** MANDATORY: Source component identifier - always "rbm-record-list" */
  readonly sourceComponent: 'rbm-record-list';
  
  /** MANDATORY: List key identifying the data set */
  readonly listKey: string;
  
  /** MANDATORY: View identifier (null if no specific view) */
  readonly viewId: string | null;
  
  /** MANDATORY: Client correlation ID for request tracking */
  readonly clientCorrelationId: string;
  
  /** MANDATORY: Type of invocation */
  readonly invocationType: 'row' | 'bulk';
  
  /** MANDATORY for bulk actions: Number of records in selection */
  readonly selectionCount?: number;
}

/**
 * Complete audit metadata including justification
 */
export interface CompleteAuditMetadata extends MandatoryAuditMetadata {
  /** Justification text (when required by action) */
  readonly justification?: string;
  
  /** Timestamp when metadata was created */
  readonly timestamp: string;
  
  /** User agent information */
  readonly userAgent: string;
  
  /** Action identifier being executed */
  readonly actionId: string;
  
  /** Record identifiers involved in action */
  readonly recordIds: string[];
}

/**
 * Audit metadata validation result
 */
export interface AuditMetadataValidation {
  /** Whether all mandatory fields are present */
  readonly valid: boolean;
  
  /** List of missing mandatory fields */
  readonly missingFields?: readonly string[];
  
  /** Validation error message */
  readonly errorMessage?: string;
}

/**
 * Justification enforcement configuration
 */
export interface JustificationEnforcement {
  /** Whether justification is required */
  readonly required: boolean;
  
  /** Minimum length for justification text */
  readonly minLength: number;
  
  /** Maximum length for justification text */
  readonly maxLength: number;
  
  /** Placeholder text for justification input */
  readonly placeholder: string;
}

/**
 * Client correlation ID generator interface
 */
export interface CorrelationIdGenerator {
  /** Generate a new unique correlation ID */
  generate(): string;
}

/**
 * Audit metadata builder for constructing compliant metadata objects
 */
export interface AuditMetadataBuilder {
  /** Set the list key */
  withListKey(listKey: string): AuditMetadataBuilder;
  
  /** Set the view ID (null if none) */
  withViewId(viewId: string | null): AuditMetadataBuilder;
  
  /** Set the client correlation ID */
  withClientCorrelationId(correlationId: string): AuditMetadataBuilder;
  
  /** Set the invocation type */
  withInvocationType(type: 'row' | 'bulk'): AuditMetadataBuilder;
  
  /** Set the selection count (mandatory for bulk) */
  withSelectionCount(count: number): AuditMetadataBuilder;
  
  /** Set the justification text */
  withJustification(justification: string): AuditMetadataBuilder;
  
  /** Set the action ID */
  withActionId(actionId: string): AuditMetadataBuilder;
  
  /** Set the record IDs */
  withRecordIds(recordIds: string[]): AuditMetadataBuilder;
  
  /** Build the complete audit metadata */
  build(): CompleteAuditMetadata;
  
  /** Build only the mandatory metadata */
  buildMandatory(): MandatoryAuditMetadata;
}

/**
 * Action execution request with mandatory audit metadata
 */
export interface AuditedActionRequest {
  /** The action to execute */
  readonly actionId: string;
  
  /** Target records */
  readonly records: readonly any[];
  
  /** Complete audit metadata */
  readonly auditMetadata: CompleteAuditMetadata;
}

/**
 * Action execution response with audit trail
 */
export interface AuditedActionResponse {
  /** Whether the action succeeded */
  readonly success: boolean;
  
  /** Error message if failed */
  readonly error?: string;
  
  /** Server correlation ID */
  readonly serverCorrelationId: string;
  
  /** Audit trail ID for tracking */
  readonly auditTrailId?: string;
  
  /** Response timestamp */
  readonly timestamp: string;
}

/**
 * RBM compliance checker interface
 */
export interface RbmComplianceChecker {
  /** Validate mandatory metadata is complete */
  validateMandatoryMetadata(metadata: Partial<MandatoryAuditMetadata>): AuditMetadataValidation;
  
  /** Validate justification meets requirements */
  validateJustification(justification: string, enforcement: JustificationEnforcement): AuditMetadataValidation;
  
  /** Check if action requires justification */
  requiresJustification(actionId: string): boolean;
  
  /** Get justification enforcement rules for action */
  getJustificationEnforcement(actionId: string): JustificationEnforcement;
}

/**
 * Acceptance criteria validation
 */
export interface AcceptanceCriteriaValidator {
  /** Verify metadata is always present in requests */
  validateMetadataPresence(request: any): boolean;
  
  /** Verify justification is enforced in UI */
  validateJustificationEnforcement(actionId: string, hasJustification: boolean): boolean;
  
  /** Verify no audit data is stored client-side */
  validateNoClientSideStorage(): boolean;
}