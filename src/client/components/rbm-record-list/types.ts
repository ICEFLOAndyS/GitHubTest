/**
 * RBM Record List TypeScript Contracts
 * Comprehensive type definitions following RBM Design System standards
 */

/**
 * Base record structure - represents a ServiceNow table record
 * All records must include sys_id for unique identification
 */
export interface RbmRecord {
  sys_id: string | { display_value: string; value: string };
  /** Advisory action availability flags (UI hints only - server is authoritative) */
  actionAvailability?: {
    [actionId: string]: {
      /** Whether action appears available (UI hint only) */
      available?: boolean;
      /** Whether action appears enabled (UI hint only) */
      enabled?: boolean;
      /** Advisory reason for unavailability (UI hint only) */
      reason?: string;
    };
  };
  [key: string]: any;
}

/**
 * Record reference for navigation
 * Lightweight structure for side panel integration
 */
export interface RecordRef {
  /** Record system ID */
  sys_id: string;
  /** Object/table type */
  objectType: string;
  /** Display value for record */
  display: string;
}

/**
 * Record selection reference
 * Lightweight reference for bulk operations
 */
export interface RecordSelection {
  /** Record system ID */
  sys_id: string;
  /** Object/table type */
  objectType: string;
}

/**
 * Column definition for record list display
 * Defines how each field should be rendered and behave
 */
export interface ColumnDef {
  /** Unique field identifier */
  field: string;
  /** Display label for column header */
  label: string;
  /** Column width specification (px, %, or 'auto') */
  width?: string | number;
  /** Column priority for responsive hiding (1=highest, 5=lowest) */
  priority?: 1 | 2 | 3 | 4 | 5;
  /** Whether this column supports server-side sorting */
  sortable?: boolean;
  /** RBM catalogue renderer key for cell content */
  rendererKey?: string;
  /** Additional column metadata */
  metadata?: {
    /** Field type hint for optimal rendering */
    fieldType?: 'string' | 'number' | 'date' | 'reference' | 'choice' | 'boolean';
    /** ServiceNow field configuration */
    serviceNowField?: {
      table?: string;
      displayField?: string;
    };
    /** Accessibility configuration */
    accessibility?: {
      headerAriaLabel?: string;
      cellAriaLabel?: string;
    };
  };
}

/**
 * Filter definition for server-side filtering
 * Describes available filter options and UI configuration
 */
export interface FilterDef {
  /** Field name to filter on */
  field: string;
  /** UI component type for filter input */
  uiType: 'text' | 'select' | 'multiselect' | 'date' | 'daterange' | 'number' | 'boolean';
  /** Available filter operators for this field */
  operators: FilterOperator[];
  /** Default filter value */
  defaultValue?: any;
  /** Additional filter configuration */
  config?: {
    /** Display label for filter */
    label?: string;
    /** Placeholder text for input fields */
    placeholder?: string;
    /** Options for select-type filters */
    options?: Array<{ value: any; label: string }>;
    /** ServiceNow choice field configuration */
    choiceField?: {
      table: string;
      field: string;
    };
    /** Validation rules */
    validation?: {
      required?: boolean;
      min?: number;
      max?: number;
      pattern?: string;
    };
  };
}

/**
 * Supported filter operators
 */
export type FilterOperator = 
  | '=' | '!=' | '>' | '>=' | '<' | '<=' 
  | 'CONTAINS' | 'DOES NOT CONTAIN' | 'STARTSWITH' | 'ENDSWITH'
  | 'IN' | 'NOT IN' | 'ISEMPTY' | 'ISNOTEMPTY'
  | 'ON' | 'NOT ON' | 'BEFORE' | 'AFTER' | 'BETWEEN';

/**
 * Active filter instance
 */
export interface ActiveFilter {
  field: string;
  operator: FilterOperator;
  value: any;
  /** Human-readable filter description */
  displayText?: string;
}

/**
 * Sort configuration
 */
export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * Selection mode options
 */
export type SelectionMode = 'none' | 'single' | 'multiple';

/**
 * Record density options for display
 */
export type DensityMode = 'compact' | 'comfortable' | 'spacious';

/**
 * Action definition for individual record actions
 */
export interface ActionDef {
  /** Unique action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon identifier from RBM catalogue */
  iconKey?: string;
  /** Action category for grouping */
  category?: 'primary' | 'secondary' | 'destructive';
  /** Confirmation configuration (UI hint only - server is authoritative) */
  confirm?: {
    /** Confirmation dialog title */
    title: string;
    /** Confirmation message */
    message: string;
    /** Confirm button text */
    confirmText?: string;
    /** Cancel button text */
    cancelText?: string;
  };
  /** Server-side action configuration */
  serverAction?: {
    /** ServiceNow action type */
    type: 'update' | 'delete' | 'custom';
    /** API endpoint for custom actions */
    endpoint?: string;
    /** HTTP method */
    method?: 'POST' | 'PATCH' | 'DELETE';
    /** Payload transformation function */
    payloadTransform?: (record: RbmRecord) => any;
  };
  /** Server action identifier (if different from id) */
  serverActionId?: string;
  /** Whether this action requires confirmation (UI hint) */
  requiresConfirm?: boolean;
  /** Whether this action requires justification (MANDATORY enforcement) */
  requiresJustification?: boolean;
  /** Justification configuration */
  justification?: {
    /** Whether justification is required (default: true if requiresJustification is true) */
    required?: boolean;
    /** Placeholder text for justification input */
    placeholder?: string;
    /** Minimum length for justification text */
    minLength?: number;
    /** Maximum length for justification text */
    maxLength?: number;
    /** Custom validation function */
    validate?: (text: string) => { valid: boolean; message?: string };
  };
  /** Justification configuration */
  justification?: {
    /** Whether justification is required (default: true if requiresJustification is true) */
    required?: boolean;
    /** Placeholder text for justification input */
    placeholder?: string;
    /** Minimum length for justification text */
    minLength?: number;
    /** Maximum length for justification text */
    maxLength?: number;
    /** Custom validation function */
    validate?: (text: string) => { valid: boolean; message?: string };
  };
  /** Confirmation text configuration (UI hint) */
  confirmText?: {
    title: string;
    body: string;
    primaryLabel: string;
  };
  /** Advisory visibility/enablement logic (UI hints only - server is authoritative) */
  conditions?: {
    /** Function to determine if action appears visible (advisory only) */
    visible?: (record: RbmRecord) => boolean;
    /** Function to determine if action appears enabled (advisory only) */
    enabled?: (record: RbmRecord) => boolean;
  };
  /** Advisory security behavior (UI hints only) */
  advisorySecurity?: {
    /** Whether to hide action when actionAvailability indicates unavailable */
    hideWhenUnavailable?: boolean;
    /** Whether to disable action when actionAvailability indicates disabled */
    disableWhenUnavailable?: boolean;
    /** Custom tooltip for disabled state */
    disabledTooltip?: string;
  };
  /** Accessibility configuration */
  accessibility?: {
    ariaLabel?: string;
    description?: string;
  };
}

/**
 * Bulk action definition for multiple record operations
 */
export interface BulkActionDef {
  /** Unique bulk action identifier */
  id: string;
  /** Display label */
  label: string;
  /** Icon identifier from RBM catalogue */
  iconKey?: string;
  /** Whether this action requires confirmation */
  requiresConfirm?: boolean;
  /** Whether this action requires justification (MANDATORY enforcement) */
  requiresJustification?: boolean;
  /** Server action identifier (if different from id) */
  serverActionId?: string;
  /** Maximum number of records this action can handle (default 100) */
  maxSelection?: number;
  /** Confirmation configuration (UI hint only - server is authoritative) */
  confirm?: {
    title: string;
    message: string;
    /** Dynamic message function for record count */
    messageTemplate?: (count: number) => string;
    confirmText?: string;
    cancelText?: string;
  };
  /** Server-side bulk action configuration */
  serverAction?: {
    /** ServiceNow bulk action type */
    type: 'bulk_update' | 'bulk_delete' | 'bulk_custom';
    /** API endpoint for custom bulk actions */
    endpoint?: string;
    /** HTTP method */
    method?: 'POST' | 'PATCH' | 'DELETE';
    /** Payload transformation function */
    payloadTransform?: (records: RbmRecord[]) => any;
    /** Whether to process records individually or as batch */
    processingMode?: 'individual' | 'batch';
  };
  /** Conditional availability */
  conditions?: {
    /** Function to determine if bulk action is available */
    available?: (records: RbmRecord[]) => boolean;
  };
  /** Accessibility configuration */
  accessibility?: {
    ariaLabel?: string;
    description?: string;
  };
}

/**
 * Data provider request specification
 * Encapsulates all parameters for server-side data operations
 */
export interface DataProviderRequest {
  /** ServiceNow table name or listKey */
  table: string;
  /** Active filters */
  filters?: ActiveFilter[];
  /** Sort configuration */
  sort?: SortConfig;
  /** Pagination parameters */
  pagination: {
    /** Page number (0-based) - used for offset calculation */
    page: number;
    /** Records per page */
    pageSize: number;
    /** Cursor for cursor-based pagination (optional) */
    cursor?: string | null;
  };
  /** Search query string */
  search?: string;
  /** Additional ServiceNow query parameters */
  queryParams?: {
    /** Fields to include in response */
    sysparm_fields?: string;
    /** Display value mode */
    sysparm_display_value?: 'true' | 'false' | 'all';
    /** Additional encoded query parameters */
    sysparm_query?: string;
  };
  /** Request context for audit/logging */
  context?: {
    /** User-initiated action context */
    userAction?: string;
    /** Component instance identifier */
    componentId?: string;
    /** View identifier */
    viewId?: string | null;
    /** Client correlation ID for tracking */
    correlationId?: string;
  };
}

/**
 * Data provider response structure
 * Standardized response format from server-side operations
 */
export interface DataProviderResponse {
  /** Retrieved records */
  records: RbmRecord[];
  /** Pagination information */
  pagination: {
    /** Current page (0-based) */
    currentPage: number;
    /** Records per page */
    pageSize: number;
    /** Total number of records */
    totalRecords: number;
    /** Total number of pages */
    totalPages: number;
    /** Whether there are more pages */
    hasNextPage: boolean;
    /** Whether there are previous pages */
    hasPreviousPage: boolean;
  };
  /** Success status */
  success: boolean;
  /** Error information if applicable */
  error?: {
    /** Error code */
    code: string;
    /** Human-readable error message */
    message: string;
    /** Technical error details */
    details?: any;
  };
  /** Response metadata */
  metadata?: {
    /** Response generation timestamp */
    timestamp: string;
    /** Query execution time in milliseconds */
    executionTime?: number;
    /** Applied server-side transformations */
    transformations?: string[];
    /** Correlation ID from server */
    correlationId?: string;
    /** Next cursor for pagination (if available) */
    nextCursor?: string | null;
  };
}

/**
 * Data provider interface - UPDATED for AUTHORITATIVE audit metadata
 * Defines the contract for server-side data operations
 */
export interface DataProvider {
  /** Fetch records with filtering, sorting, and pagination */
  fetchRecords(request: DataProviderRequest): Promise<DataProviderResponse>;
  /** Execute individual record action with MANDATORY complete audit metadata */
  executeAction(actionId: string, record: RbmRecord, auditMetadata: import('./audit-metadata').CompleteAuditMetadata): Promise<import('./audit-metadata').AuditedActionResponse>;
  /** Execute bulk action on multiple records with MANDATORY complete audit metadata */
  executeBulkAction(actionId: string, records: RbmRecord[], auditMetadata: import('./audit-metadata').CompleteAuditMetadata): Promise<import('./audit-metadata').AuditedActionResponse>;
  /** Validate filter values */
  validateFilters?(filters: ActiveFilter[]): Promise<{ valid: boolean; errors?: string[] }>;
}

/**
 * Event handler types
 */
export type OnOpenRecord = (recordRef: RecordRef) => void;
export type OnActionInvoked = (actionId: string, record: RbmRecord | RbmRecord[], success: boolean, error?: string) => void;

/**
 * Main component props interface
 * Complete specification for RbmRecordList component
 */
export interface RbmRecordListProps {
  /** Unique identifier for this list instance */
  listKey: string;
  
  /** Column definitions for display */
  columns: ColumnDef[];
  
  /** Available filter definitions */
  filters?: FilterDef[];
  
  /** Default sort configuration */
  defaultSort?: SortConfig;
  
  /** Selection behavior mode */
  selectionMode?: SelectionMode;
  
  /** Available actions for individual records */
  actions?: ActionDef[];
  
  /** Available bulk actions for multiple records */
  bulkActions?: BulkActionDef[];
  
  /** Data provider for server-side operations */
  dataProvider: DataProvider;
  
  /** Handler for record open/view action */
  onOpenRecord?: OnOpenRecord;
  
  /** Handler for action completion events */
  onActionInvoked?: OnActionInvoked;
  
  /** Display density mode */
  density?: DensityMode;
  
  /** Accessibility configuration */
  a11y?: {
    /** Primary ARIA label for the component */
    ariaLabel: string;
    /** Additional accessibility descriptions */
    descriptions?: {
      /** Description for the data table */
      tableDescription?: string;
      /** Description for filter controls */
      filtersDescription?: string;
      /** Description for pagination controls */
      paginationDescription?: string;
    };
    /** Keyboard shortcuts configuration */
    keyboardShortcuts?: {
      /** Enable standard keyboard navigation */
      enableKeyboardNav?: boolean;
      /** Custom keyboard shortcuts */
      customShortcuts?: Array<{
        keys: string[];
        description: string;
        handler: (event: KeyboardEvent) => void;
      }>;
    };
  };
  
  /** Additional component configuration */
  config?: {
    /** Enable search functionality */
    enableSearch?: boolean;
    /** Enable column resizing */
    enableColumnResize?: boolean;
    /** Enable column reordering */
    enableColumnReorder?: boolean;
    /** Enable export functionality */
    enableExport?: boolean;
    /** Default page size */
    defaultPageSize?: number;
    /** Available page size options */
    pageSizeOptions?: number[];
    /** Auto-refresh interval in seconds */
    autoRefreshInterval?: number;
    /** Custom loading component */
    loadingComponent?: React.ComponentType;
    /** Custom error component */
    errorComponent?: React.ComponentType<{ error: string }>;
    /** Custom empty state component */
    emptyComponent?: React.ComponentType;
    /** Callback to receive focus restoration function */
    onFocusRestore?: (restoreFocusFn: () => void) => void;
    /** View identifier for context */
    viewId?: string;
    /** Callback when data is loaded */
    onDataLoad?: (response: DataProviderResponse) => void;
    /** Callback when selection changes */
    onSelectionChange?: (selected: RbmRecord[]) => void;
  };
  
  /** Custom CSS class name */
  className?: string;
  
  /** Component test identifiers */
  testIds?: {
    container?: string;
    table?: string;
    filters?: string;
    pagination?: string;
    actions?: string;
  };
}