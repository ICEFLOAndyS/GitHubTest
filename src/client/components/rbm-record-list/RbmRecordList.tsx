import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { RbmRecordListProps, RbmRecord, ActiveFilter, SortConfig, ActionDef, BulkActionDef, RecordSelection, RecordRef, DataProviderRequest } from './types';
import { createRecordListDataProvider } from '../../services/rbm-record-list';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { useJustificationDialog } from '../../hooks/useJustificationDialog';
import { useFocusManagement } from '../../hooks/useFocusManagement';
import { RbmConfirmDialog } from '../RbmConfirmDialog';
import { RbmJustificationDialog } from '../RbmJustificationDialog';
import { RbmInlineError } from '../RbmInlineError';
import './RbmRecordList.css';

// RBM Audit Metadata - AUTHORITATIVE v1.9.5
import {
  createRowActionRequest,
  createBulkActionRequest,
  validateActionRequest,
  ActionExecutionOptions
} from '../../services/rbm-record-list/ActionExecution';
import {
  correlationIdGenerator,
  rbmComplianceChecker,
  acceptanceCriteriaValidator
} from './audit-metadata-impl';
import { AuditedActionRequest } from './audit-metadata';

// RBM Design System Catalogue Component Imports (Placeholder - would be actual imports in production)
// import { SelectableDataGrid } from '@rbm/catalogue/selectable-data-grid';
// import { FilterBar } from '@rbm/catalogue/filter-bar';
// import { Pagination } from '@rbm/catalogue/pagination';
// import { RowActionsMenu } from '@rbm/catalogue/row-actions-menu';
// import { BulkActionBar } from '@rbm/catalogue/bulk-action-bar';
// import { GridSkeleton } from '@rbm/catalogue/grid-skeleton';

// Placeholder components for demonstration
const SelectableDataGrid = ({ children, ...props }: any) => <div {...props}>{children || 'SelectableDataGrid Component'}</div>;
const FilterBar = ({ children, ...props }: any) => <div {...props}>{children || 'FilterBar Component'}</div>;
const Pagination = ({ children, ...props }: any) => <div {...props}>{children || 'Pagination Component'}</div>;
const RowActionsMenu = ({ children, ...props }: any) => <div {...props}>{children || 'RowActionsMenu Component'}</div>;
const BulkActionBar = ({ children, ...props }: any) => <div {...props}>{children || 'BulkActionBar Component'}</div>;
const GridSkeleton = ({ children, ...props }: any) => <div {...props}>{children || 'GridSkeleton Component'}</div>;

/**
 * Internal state model for RBM Record List component
 * Enforces server-side operations only - no client-side data manipulation
 */
interface InternalState {
  rows: RbmRecord[];
  loading: boolean;
  error: { message: string; correlationId?: string } | null;
  currentFilters: ActiveFilter[];
  currentSort: SortConfig[];
  currentSearch?: string;
  pageSize: number; // default 50; never exceed 200
  currentCursor?: string | null;
  nextCursor?: string | null;
  hasMore: boolean; // derived from presence of nextCursor
}

/**
 * RBM Record List Component - Data-Wired Implementation
 * 
 * Integrates with RBM-compliant Scripted REST API for server-side operations.
 * Maintains minimal client state - all data operations are server-authoritative.
 */
const RbmRecordList: React.FC<RbmRecordListProps> = ({
  listKey,
  columns,
  filters = [],
  defaultSort,
  selectionMode = 'none',
  actions = [],
  bulkActions = [],
  dataProvider,
  onOpenRecord,
  onActionInvoked,
  density = 'comfortable',
  a11y,
  config = {},
  className = '',
  testIds = {}
}) => {
  
  // Internal state model (component-internal only)
  const [state, setState] = useState<InternalState>({
    rows: [],
    loading: false,
    error: null,
    currentFilters: [],
    currentSort: defaultSort ? [defaultSort] : [],
    currentSearch: undefined,
    pageSize: Math.min(config.defaultPageSize || 50, 200), // Never exceed 200
    currentCursor: null,
    nextCursor: null,
    hasMore: false
  });
  
  // Selection state (separate from data state)
  const [selectedRecords, setSelectedRecords] = useState<RbmRecord[]>([]);
  
  // Bulk action execution state
  const [executingBulkAction, setExecutingBulkAction] = useState<{
    actionId: string;
    recordCount: number;
  } | null>(null);
  
  // Action execution state
  const [executingAction, setExecutingAction] = useState<{
    actionId: string;
    recordId: string;
  } | null>(null);
  
  // Inline error state for action failures
  const [actionError, setActionError] = useState<{
    message: string;
    correlationId?: string;
    actionId?: string;
    recordId?: string;
  } | null>(null);
  
  // Confirmation dialog state
  const { dialogState, showConfirm, hideConfirm } = useConfirmDialog();
  
  // Justification dialog state
  const { 
    dialogState: justificationDialogState, 
    showJustificationDialog, 
    hideJustificationDialog 
  } = useJustificationDialog();
  
  // Focus management for side panel integration
  const { storeFocus, restoreFocus, clearFocus } = useFocusManagement();
  
  // Data provider instance
  const provider = useMemo(() => dataProvider, [dataProvider]);
  /**
   * Infer object type from record data
   */
  const inferObjectTypeFromRecord = useCallback((record: RbmRecord): string => {
    // Try to determine from record structure or metadata
    // This could be enhanced with more sophisticated detection
    if (record.number && typeof record.number === 'object' && record.number.value) {
      // Looks like an incident or task
      const numberValue = record.number.value;
      if (numberValue.startsWith('INC')) return 'incident';
      if (numberValue.startsWith('TASK')) return 'task';
      if (numberValue.startsWith('REQ')) return 'sc_request';
    }
    
    // Fallback based on listKey
    if (listKey.includes('incident')) return 'incident';
    if (listKey.includes('user')) return 'sys_user';
    if (listKey.includes('cmdb_ci')) return 'cmdb_ci';
    
    // Default fallback
    return 'unknown';
  }, [listKey]);
  
  /**
   * Get display value for record
   */
  const getRecordDisplayValue = useCallback((record: RbmRecord): string => {
    // Try common display fields in order of preference
    const displayFields = ['short_description', 'name', 'title', 'number', 'label'];
    
    for (const field of displayFields) {
      if (record[field]) {
        const fieldValue = record[field];
        const displayValue = typeof fieldValue === 'object' ? fieldValue.display_value : fieldValue;
        if (displayValue && displayValue.toString().trim()) {
          return displayValue.toString();
        }
      }
    }
    
    // Fallback to sys_id
    const sysId = typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id;
    return sysId || 'Unknown Record';
  }, []);
  
  /**
   * Create RecordRef from RbmRecord for navigation
   */
  const createRecordRef = useCallback((record: RbmRecord): RecordRef => {
    const sysId = typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id;
    const objectType = inferObjectTypeFromRecord(record);
    const display = getRecordDisplayValue(record);
    
    return {
      sys_id: sysId,
      objectType: objectType,
      display: display
    };
  }, [inferObjectTypeFromRecord, getRecordDisplayValue]);
  
  /**
   * Handle record open with proper focus management
   */
  const handleOpenRecord = useCallback((record: RbmRecord, source: 'double-click' | 'enter-key' | 'action') => {
    if (!onOpenRecord) {
      console.warn('onOpenRecord handler not provided');
      return;
    }
    
    // Store focus before opening side panel
    storeFocus();
    
    // Create record reference
    const recordRef = createRecordRef(record);
    
    // Log navigation for debugging
    console.log(`Opening record via ${source}:`, recordRef);
    
    // Trigger navigation callback
    try {
      onOpenRecord(recordRef);
    } catch (error) {
      console.error('Error in onOpenRecord callback:', error);
      // Restore focus if navigation fails
      restoreFocus();
    }
  }, [onOpenRecord, storeFocus, restoreFocus, createRecordRef]);
  
  /**
   * Generate client correlation ID for API call tracking
   * MANDATORY for every API call - uses authoritative generator
   */
  const generateClientCorrelationId = useCallback((): string => {
    return correlationIdGenerator.generate();
  }, []);
  
  /**
   * Execute server-side query with current state parameters
   */
  const executeQuery = useCallback(async (options: {
    resetCursor?: boolean;
    newFilters?: ActiveFilter[];
    newSort?: SortConfig[];
    newSearch?: string;
    newPageSize?: number;
  } = {}) => {
    try {
      // Generate client correlation ID for this request
      const clientCorrelationId = generateClientCorrelationId();
      
      // Update loading state
      setState(prev => ({ 
        ...prev, 
        loading: true, 
        error: null 
      }));
      
      // Determine query parameters
      const queryFilters = options.newFilters !== undefined ? options.newFilters : state.currentFilters;
      const querySort = options.newSort !== undefined ? options.newSort : state.currentSort;
      const querySearch = options.newSearch !== undefined ? options.newSearch : state.currentSearch;
      const queryPageSize = options.newPageSize !== undefined ? options.newPageSize : state.pageSize;
      const queryCursor = options.resetCursor ? null : state.currentCursor;
      
      // Build data provider request
      const request: DataProviderRequest = {
        table: listKey, // Will be parsed to actual table by server
        filters: queryFilters,
        sort: querySort.length > 0 ? querySort[0] : undefined,
        search: querySearch || undefined,
        pagination: {
          page: 0, // Cursor-based, page number not used
          pageSize: queryPageSize,
          cursor: queryCursor // Add cursor to pagination
        },
        context: {
          viewId: null, // Could be enhanced to pass view context
          correlationId: clientCorrelationId
        },
        queryParams: {
          sysparm_display_value: 'all' as const // Ensure we get both display and raw values
        }
      };
      
      // Execute query through data provider
      const response = await provider.fetchRecords(request);
      
      // Update state with results
      setState(prev => ({
        ...prev,
        rows: response.records,
        loading: false,
        error: null,
        currentFilters: queryFilters,
        currentSort: querySort,
        currentSearch: querySearch,
        pageSize: queryPageSize,
        currentCursor: queryCursor,
        nextCursor: response.metadata?.nextCursor || null,
        hasMore: !!(response.metadata?.nextCursor)
      }));
      
      // Clear selection on new query
      if (options.resetCursor) {
        setSelectedRecords([]);
      }
      
      // Notify parent of successful data load
      if (config.onDataLoad) {
        config.onDataLoad(response);
      }
      
    } catch (error) {
      console.error('RBM Record List Query Error:', error);
      
      // Extract correlation ID from error message if available
      const correlationIdMatch = error.message?.match(/CorrelationId:\s*([a-zA-Z0-9_-]+)/);
      const correlationId = correlationIdMatch ? correlationIdMatch[1] : undefined;
      
      setState(prev => ({
        ...prev,
        loading: false,
        error: {
          message: error.message || 'Failed to load data',
          correlationId: correlationId
        }
      }));
    }
  }, [listKey, state, provider, generateClientCorrelationId, config]);
  
  /**
   * Initial data load on mount
   */
  useEffect(() => {
    executeQuery({ resetCursor: true });
  }, [listKey]); // Only re-run when listKey changes
  
  /**
   * Handle filter changes from FilterBar
   */
  const handleFiltersChange = useCallback((newFilters: ActiveFilter[]) => {
    executeQuery({ 
      resetCursor: true, 
      newFilters: newFilters 
    });
  }, [executeQuery]);
  
  /**
   * Handle search changes from FilterBar
   */
  const handleSearchChange = useCallback((searchText: string) => {
    executeQuery({ 
      resetCursor: true, 
      newSearch: searchText || undefined 
    });
  }, [executeQuery]);
  
  /**
   * Handle clear all filters
   */
  const handleClearAllFilters = useCallback(() => {
    executeQuery({ 
      resetCursor: true, 
      newFilters: [], 
      newSearch: undefined 
    });
  }, [executeQuery]);
  
  /**
   * Handle sort changes from SelectableDataGrid
   */
  const handleSortChange = useCallback((sortConfig: SortConfig) => {
    executeQuery({ 
      resetCursor: true, 
      newSort: [sortConfig] 
    });
  }, [executeQuery]);
  
  /**
   * Handle page navigation (cursor-based)
   */
  const handlePageChange = useCallback((direction: 'next' | 'prev') => {
    if (direction === 'next' && state.nextCursor) {
      setState(prev => ({ ...prev, currentCursor: prev.nextCursor }));
      executeQuery(); // Will use updated cursor
    } else if (direction === 'prev') {
      // For previous page, we would need to track cursor history
      // For now, reset to first page
      executeQuery({ resetCursor: true });
    }
  }, [executeQuery, state.nextCursor]);
  
  /**
   * Handle page size changes
   */
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    const validatedPageSize = Math.min(newPageSize, 200); // Never exceed 200
    executeQuery({ 
      resetCursor: true, 
      newPageSize: validatedPageSize 
    });
  }, [executeQuery]);
  
  /**
   * Handle record selection changes
   */
  const handleSelectionChange = useCallback((selected: RbmRecord[]) => {
    setSelectedRecords(selected);
    
    if (config.onSelectionChange) {
      config.onSelectionChange(selected);
    }
  }, [config]);
  
  /**
   * Handle record click/open
   */
  const handleRecordClick = useCallback((record: RbmRecord) => {
    // Single click - just handle selection or basic interaction
    // Double click will trigger record opening
  }, []);
  
  /**
   * Handle record double-click for navigation
   */
  const handleRecordDoubleClick = useCallback((record: RbmRecord) => {
    handleOpenRecord(record, 'double-click');
  }, [handleOpenRecord]);
  
  /**
   * Execute row action with AUTHORITATIVE audit metadata enforcement
   */
  const executeRowAction = useCallback(async (
    actionId: string, 
    record: RbmRecord, 
    actionDef?: ActionDef,
    justification?: string
  ) => {
    try {
      // Create execution options with mandatory metadata
      const executionOptions: ActionExecutionOptions = {
        listKey: listKey,
        viewId: config?.viewId || null,
        justification: justification,
        actionDef: actionDef
      };
      
      // Create audited action request with ALL mandatory metadata
      const actionRequest = createRowActionRequest(actionId, record, executionOptions);
      
      // CRITICAL: Validate request meets ALL RBM requirements
      const validation = validateActionRequest(actionRequest);
      if (!validation.valid) {
        throw new Error(`Action request validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Extract record identifiers for UI state
      const recordSysId = typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id;
      
      // Set executing state
      setExecutingAction({
        actionId: actionId,
        recordId: recordSysId
      });
      
      // Log compliance verification
      console.log(`RBM Compliance Check: Row action ${actionId} with correlation ${actionRequest.auditMetadata.clientCorrelationId}`);
      
      // Execute action via data provider with complete audit metadata
      const result = await provider.executeAction(actionId, record, actionRequest.auditMetadata);
      
      if (result.success) {
        // Success: Re-fetch current page (DO NOT mutate UI state locally)
        await executeQuery();
        
        // Notify parent of successful action
        if (onActionInvoked) {
          onActionInvoked(actionId, record, true);
        }
        
        console.log(`Action ${actionId} completed successfully - CorrelationId: ${actionRequest.auditMetadata.clientCorrelationId}`);
        
      } else {
        // Handle action failure
        handleActionError(actionId, record, result.error || 'Action failed', actionRequest.auditMetadata.clientCorrelationId);
      }
      
    } catch (error) {
      console.error('Row action execution error:', error);
      const correlationId = generateClientCorrelationId(); // Fallback correlation ID
      handleActionError(actionId, record, error.message, correlationId);
    } finally {
      setExecutingAction(null);
    }
  }, [provider, executeQuery, onActionInvoked, generateClientCorrelationId, listKey, config]);
  
  /**
   * Handle row action selection with MANDATORY justification enforcement
   */
  const handleRowActionSelect = useCallback((actionId: string, record: RbmRecord) => {
    // Find action definition (UI hint only - server is authoritative)
    const actionDef = actions.find(action => action.id === actionId);
    
    // Check if this is a navigation action (view/open)
    if (actionId === 'view' || actionId === 'open') {
      handleOpenRecord(record, 'action');
      return;
    }
    
    // CRITICAL: Check if justification is required (RBM enforcement)
    const requiresJustification = rbmComplianceChecker.requiresJustification(actionId);
    
    if (requiresJustification) {
      // MANDATORY: Collect justification before proceeding
      const enforcement = rbmComplianceChecker.getJustificationEnforcement(actionId);
      const recordDisplay = getRecordDisplayValue(record);
      
      showJustificationDialog({
        actionId: actionId,
        actionLabel: actionDef?.label || actionId,
        recordDisplay: recordDisplay,
        required: enforcement.required,
        placeholder: enforcement.placeholder,
        onSubmit: (justification: string) => {
          // Validate justification
          const validation = rbmComplianceChecker.validateJustification(justification, enforcement);
          if (!validation.valid) {
            setActionError({
              message: `Invalid justification: ${validation.errorMessage}`,
              correlationId: generateClientCorrelationId(),
              actionId: actionId,
              recordId: typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id
            });
            return;
          }
          
          // Execute with justification
          executeRowAction(actionId, record, actionDef, justification);
        },
        onCancel: () => {
          console.log(`Action ${actionId} cancelled due to missing justification`);
        }
      });
      return;
    }
    
    // Check if confirmation is required (in addition to justification)
    if (actionDef?.confirm || actionDef?.requiresConfirm) {
      const confirmConfig = actionDef.confirm;
      
      showConfirm({
        title: confirmConfig?.title || 'Confirm Action',
        message: confirmConfig?.message || `Are you sure you want to perform this action?`,
        primaryLabel: confirmConfig?.confirmText || 'Confirm',
        secondaryLabel: confirmConfig?.cancelText || 'Cancel',
        onConfirm: () => executeRowAction(actionId, record, actionDef),
        onCancel: () => {
          console.log(`Action ${actionId} cancelled by user`);
        }
      });
    } else {
      // Execute immediately without confirmation (but still with audit metadata)
      executeRowAction(actionId, record, actionDef);
    }
  }, [actions, showConfirm, showJustificationDialog, executeRowAction, handleOpenRecord, getRecordDisplayValue, rbmComplianceChecker, generateClientCorrelationId]);
  
  /**
   * Enhanced error handling for 403 permission denials and other security errors
   */
  const handleActionError = useCallback((actionId: string, record: RbmRecord, errorMessage: string, correlationId: string) => {
    const recordSysId = typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id;
    
    // Check if this is a permission denial (403)
    const isPermissionDenied = errorMessage.includes('403') || 
                              errorMessage.toLowerCase().includes('permission') ||
                              errorMessage.toLowerCase().includes('access denied') ||
                              errorMessage.toLowerCase().includes('insufficient privileges');
    
    let displayMessage = errorMessage;
    
    if (isPermissionDenied) {
      // Standard permission denial message (RBM requirement)
      displayMessage = 'You do not have permission to perform this action.';
    }
    
    // Set inline error state (non-blocking)
    setActionError({
      message: displayMessage,
      correlationId: correlationId,
      actionId: actionId,
      recordId: recordSysId
    });
    
    // Log permission denial for audit (but don't break functionality)
    if (isPermissionDenied) {
      console.warn(`Permission denied for action ${actionId} on record ${recordSysId} - CorrelationId: ${correlationId}`);
    }
    
    // Notify parent of failed action
    if (onActionInvoked) {
      onActionInvoked(actionId, record, false, displayMessage);
    }
    
    // IMPORTANT: Component continues functioning normally after permission denial
    console.log('Component continues normal operation after security denial');
  }, [onActionInvoked]);
  
  /**
   * Get advisory action visibility for a record (UI hints only)
   * Server remains the sole security authority
   */
  const getActionVisibility = useCallback((action: ActionDef, record: RbmRecord) => {
    // Check action descriptor conditions first (UI-side advisory logic)
    if (action.conditions?.visible && !action.conditions.visible(record)) {
      return { visible: false, reason: 'Condition not met' };
    }
    
    // Check server-provided actionAvailability flags (advisory only)
    const availability = record.actionAvailability?.[action.id];
    if (availability) {
      // Honor hide-when-unavailable setting (advisory UI gating)
      if (action.advisorySecurity?.hideWhenUnavailable && availability.available === false) {
        return { 
          visible: false, 
          reason: availability.reason || 'Action not available for this record'
        };
      }
    }
    
    return { visible: true };
  }, []);
  
  /**
   * Get advisory action enablement for a record (UI hints only)
   * Server remains the sole security authority
   */
  const getActionEnablement = useCallback((action: ActionDef, record: RbmRecord) => {
    // Check action descriptor conditions first (UI-side advisory logic)
    if (action.conditions?.enabled && !action.conditions.enabled(record)) {
      return { enabled: false, reason: 'Condition not met' };
    }
    
    // Check server-provided actionAvailability flags (advisory only)
    const availability = record.actionAvailability?.[action.id];
    if (availability) {
      // Honor disable-when-unavailable setting (advisory UI gating)
      if (action.advisorySecurity?.disableWhenUnavailable && availability.enabled === false) {
        return { 
          enabled: false, 
          reason: availability.reason || action.advisorySecurity.disabledTooltip || 'Action not available'
        };
      }
    }
    
    return { enabled: true };
  }, []);
  
  /**
   * Filter actions based on advisory visibility (UI hints only)
   */
  const getVisibleActions = useCallback((record: RbmRecord): ActionDef[] => {
    return actions.filter(action => {
      const visibility = getActionVisibility(action, record);
      return visibility.visible;
    });
  }, [actions, getActionVisibility]);
  
  /**
   * Get actions with advisory enablement info (UI hints only)
   */
  const getActionsWithEnablement = useCallback((record: RbmRecord): Array<ActionDef & { advisoryEnabled: boolean; advisoryReason?: string }> => {
    const visibleActions = getVisibleActions(record);
    
    return visibleActions.map(action => {
      const enablement = getActionEnablement(action, record);
      return {
        ...action,
        advisoryEnabled: enablement.enabled,
        advisoryReason: enablement.reason
      };
    });
  }, [getVisibleActions, getActionEnablement]);

  
  /**
   * Expose focus restoration for parent component
   * Called when side panel closes
   */
  const exposeFocusRestore = useCallback(() => {
    restoreFocus();
  }, [restoreFocus]);
  
  // Expose focus restoration to parent via ref or callback
  React.useEffect(() => {
    if (config.onFocusRestore) {
      config.onFocusRestore(exposeFocusRestore);
    }
  }, [config.onFocusRestore, exposeFocusRestore]);
  // (duplicate removed - definition moved earlier)
  
  /**
   * Handle keyboard events for row actions and navigation
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent, record: RbmRecord) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      
      // Check if we have a default "open" action first
      const openAction = actions.find(action => 
        action.id === 'view' || action.id === 'open'
      );
      
      if (openAction) {
        // Use the open action if available
        handleRowActionSelect(openAction.id, record);
      } else {
        // Fallback to direct record opening via Enter key
        handleOpenRecord(record, 'enter-key');
      }
    }
  }, [actions, handleRowActionSelect, handleOpenRecord]);
  /**
   * Handle refresh action
   */
  const handleRefresh = useCallback(() => {
    executeQuery();
  }, [executeQuery]);
  
  /**
   * Convert full records to lightweight selection references
   */
  const getRecordSelections = useCallback((records: RbmRecord[]): RecordSelection[] => {
    return records.map(record => ({
      sys_id: typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id,
      objectType: inferObjectTypeFromRecord(record)
    }));
  }, []);
  
  /**
   * Execute bulk action with AUTHORITATIVE audit metadata enforcement
   */
  const executeBulkAction = useCallback(async (
    actionId: string, 
    records: RbmRecord[], 
    bulkActionDef?: BulkActionDef,
    justification?: string
  ) => {
    try {
      // Create execution options with mandatory metadata
      const executionOptions: ActionExecutionOptions = {
        listKey: listKey,
        viewId: config?.viewId || null,
        justification: justification,
        actionDef: bulkActionDef
      };
      
      // Create audited bulk action request with ALL mandatory metadata
      const actionRequest = createBulkActionRequest(actionId, records, executionOptions);
      
      // CRITICAL: Validate request meets ALL RBM requirements
      const validation = validateActionRequest(actionRequest);
      if (!validation.valid) {
        throw new Error(`Bulk action request validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Convert to record selections for UI state
      const recordSelections = getRecordSelections(records);
      
      // Set executing state
      setExecutingBulkAction({
        actionId: actionId,
        recordCount: records.length
      });
      
      // Log compliance verification
      console.log(`RBM Compliance Check: Bulk action ${actionId} on ${records.length} records with correlation ${actionRequest.auditMetadata.clientCorrelationId}`);
      
      // Execute bulk action via data provider with complete audit metadata
      const result = await provider.executeBulkAction(actionId, records, actionRequest.auditMetadata);
      
      if (result.success) {
        // Success: Clear selection and re-fetch current page
        setSelectedRecords([]);
        await executeQuery();
        
        // Notify parent of successful bulk action
        if (onActionInvoked) {
          onActionInvoked(actionId, records, true);
        }
        
        console.log(`Bulk action ${actionId} completed successfully on ${records.length} records - CorrelationId: ${actionRequest.auditMetadata.clientCorrelationId}`);
        
      } else {
        // Handle bulk action failure
        handleBulkActionError(actionId, records, result.error || 'Bulk action failed', actionRequest.auditMetadata.clientCorrelationId);
      }
      
    } catch (error) {
      console.error('Bulk action execution error:', error);
      const correlationId = generateClientCorrelationId(); // Fallback correlation ID
      handleBulkActionError(actionId, records, error.message, correlationId);
    } finally {
      setExecutingBulkAction(null);
    }
  }, [provider, executeQuery, onActionInvoked, generateClientCorrelationId, getRecordSelections, listKey, config]);
  
  /**
   * Handle bulk action selection with MANDATORY justification enforcement and cap validation
   */
  const handleBulkActionSelect = useCallback((actionId: string) => {
    if (selectedRecords.length === 0) {
      console.warn('No records selected for bulk action');
      return;
    }
    
    // Find bulk action definition (UI hint only - server is authoritative)
    const bulkActionDef = bulkActions.find(action => action.id === actionId);
    
    // Enforce UI cap (default 100, server will also enforce)
    const maxSelection = bulkActionDef?.maxSelection || 100;
    if (selectedRecords.length > maxSelection) {
      // Show error - do NOT silently truncate
      setActionError({
        message: `Cannot perform bulk action: Selected ${selectedRecords.length} records, but maximum allowed is ${maxSelection}. Please reduce your selection.`,
        correlationId: generateClientCorrelationId(),
        actionId: actionId,
        recordId: 'bulk_selection_limit'
      });
      return;
    }
    
    // CRITICAL: Check if justification is required (RBM enforcement)
    const requiresJustification = rbmComplianceChecker.requiresJustification(actionId);
    
    if (requiresJustification) {
      // MANDATORY: Collect justification before proceeding
      const enforcement = rbmComplianceChecker.getJustificationEnforcement(actionId);
      
      showJustificationDialog({
        actionId: actionId,
        actionLabel: bulkActionDef?.label || actionId,
        recordDisplay: `${selectedRecords.length} selected records`,
        recordCount: selectedRecords.length,
        required: enforcement.required,
        placeholder: enforcement.placeholder,
        onSubmit: (justification: string) => {
          // Validate justification
          const validation = rbmComplianceChecker.validateJustification(justification, enforcement);
          if (!validation.valid) {
            setActionError({
              message: `Invalid justification: ${validation.errorMessage}`,
              correlationId: generateClientCorrelationId(),
              actionId: actionId,
              recordId: `bulk_${selectedRecords.length}_records`
            });
            return;
          }
          
          // Execute with justification
          executeBulkAction(actionId, selectedRecords, bulkActionDef, justification);
        },
        onCancel: () => {
          console.log(`Bulk action ${actionId} cancelled due to missing justification`);
        }
      });
      return;
    }
    
    // Check if confirmation is required (in addition to justification)
    if (bulkActionDef?.requiresConfirm || bulkActionDef?.confirm) {
      const confirmConfig = bulkActionDef.confirm;
      const message = confirmConfig?.messageTemplate 
        ? confirmConfig.messageTemplate(selectedRecords.length)
        : confirmConfig?.message || `Are you sure you want to perform this action on ${selectedRecords.length} selected records?`;
      
      showConfirm({
        title: confirmConfig?.title || `Confirm Bulk Action`,
        message: message,
        primaryLabel: confirmConfig?.confirmText || 'Confirm',
        secondaryLabel: confirmConfig?.cancelText || 'Cancel',
        onConfirm: () => executeBulkAction(actionId, selectedRecords, bulkActionDef),
        onCancel: () => {
          console.log(`Bulk action ${actionId} cancelled by user`);
        }
      });
    } else {
      // Execute immediately without confirmation (but still with audit metadata)
      executeBulkAction(actionId, selectedRecords, bulkActionDef);
    }
  }, [selectedRecords, bulkActions, showConfirm, showJustificationDialog, executeBulkAction, generateClientCorrelationId, rbmComplianceChecker]);
  
  /**
   * Handle bulk action errors with correlation ID display
   */
  const handleBulkActionError = useCallback((actionId: string, records: RbmRecord[], errorMessage: string, correlationId: string) => {
    // Set inline error state (non-blocking)
    setActionError({
      message: `Bulk action failed: ${errorMessage}`,
      correlationId: correlationId,
      actionId: actionId,
      recordId: `bulk_${records.length}_records`
    });
    
    // Notify parent of failed bulk action
    if (onActionInvoked) {
      onActionInvoked(actionId, records, false, errorMessage);
    }
    
    // Also log for debugging
    console.error(`Bulk action ${actionId} failed on ${records.length} records: ${errorMessage} (CorrelationId: ${correlationId})`);
  }, [onActionInvoked]);
  
  /**
   * Clear selection
   */
  const handleClearSelection = useCallback(() => {
    setSelectedRecords([]);
  }, []);
  
  // Determine if bulk action bar should be shown
  const showBulkActionBar = selectionMode === 'multiple' && 
                           selectedRecords.length > 0 && 
                           bulkActions.length > 0;
  
  // Grid configuration
  const gridConfig = {
    columns,
    selectionMode,
    density,
    enableColumnResize: config.enableColumnResize,
    enableColumnReorder: config.enableColumnReorder
  };
  
  // Filter bar configuration
  const filterConfig = {
    filters,
    activeFilters: state.currentFilters,
    enableSearch: config.enableSearch !== false, // Default to enabled
    searchValue: state.currentSearch || ''
  };
  
  // Pagination configuration (cursor-based)
  const paginationConfig = {
    hasNextPage: state.hasMore,
    hasPreviousPage: !!state.currentCursor,
    pageSize: state.pageSize,
    recordCount: state.rows.length,
    pageSizeOptions: config.pageSizeOptions || [10, 25, 50, 100, 200]
  };
  
  return (
    <div 
      className={`rbm-record-list ${className}`}
      data-testid={testIds.container}
      role="region"
      aria-label={a11y?.ariaLabel}
    >
      
      {/* 1. Filter Bar */}
      {filters.length > 0 && (
        <div 
          className="rbm-record-list__filters"
          data-testid={testIds.filters}
          role="search"
          aria-label={a11y?.descriptions?.filtersDescription || 'Record filters'}
        >
          <FilterBar
            filters={filterConfig.filters}
            activeFilters={filterConfig.activeFilters}
            enableSearch={filterConfig.enableSearch}
            searchValue={filterConfig.searchValue}
            searchPlaceholder="Search records..."
            onFiltersChange={handleFiltersChange}
            onSearchChange={handleSearchChange}
            onClearAll={handleClearAllFilters}
            className="rbm-record-list__filter-bar"
            ariaLabel="Filter and search controls"
            disabled={state.loading}
          />
        </div>
      )}
      
      {/* 2. Grid */}
      <div 
        className="rbm-record-list__grid-container"
        data-testid={testIds.table}
      >
        {state.loading ? (
          <GridSkeleton
            columns={columns.length}
            rows={state.pageSize}
            density={density}
            showSelection={selectionMode !== 'none'}
            showActions={actions.length > 0}
            className="rbm-record-list__skeleton"
          />
        ) : state.error ? (
          <div 
            className="rbm-record-list__error-state"
            role="alert"
            aria-live="polite"
          >
            {config.errorComponent ? (
              <config.errorComponent error={state.error.message} />
            ) : (
              <div className="rbm-error-message">
                <div className="rbm-error-message__content">
                  <h3 className="rbm-error-message__title">Unable to load records</h3>
                  <p className="rbm-error-message__description">
                    {state.error.message}
                  </p>
                  {state.error.correlationId && (
                    <p className="rbm-error-message__correlation">
                      Correlation ID: {state.error.correlationId}
                    </p>
                  )}
                  <button 
                    className="rbm-button rbm-button--secondary"
                    onClick={handleRefresh}
                    disabled={state.loading}
                  >
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : state.rows.length === 0 ? (
          <div 
            className="rbm-record-list__empty-state"
            role="status"
            aria-live="polite"
          >
            {config.emptyComponent ? (
              <config.emptyComponent />
            ) : (
              <div className="rbm-empty-state">
                <div className="rbm-empty-state__content">
                  <h3 className="rbm-empty-state__title">No records found</h3>
                  <p className="rbm-empty-state__description">
                    {state.currentFilters.length > 0 || state.currentSearch
                      ? "Try adjusting your filters or search terms to see more results."
                      : "There are no records to display."
                    }
                  </p>
                  {(state.currentFilters.length > 0 || state.currentSearch) && (
                    <button 
                      className="rbm-button rbm-button--secondary"
                      onClick={handleClearAllFilters}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <SelectableDataGrid
            key={listKey}
            columns={gridConfig.columns}
            records={state.rows}
            selectionMode={gridConfig.selectionMode}
            selectedRecords={selectedRecords}
            density={gridConfig.density}
            sortConfig={state.currentSort.length > 0 ? state.currentSort[0] : undefined}
            enableColumnResize={gridConfig.enableColumnResize}
            enableColumnReorder={gridConfig.enableColumnReorder}
            onSelectionChange={handleSelectionChange}
            onSortChange={handleSortChange}
            onRecordClick={handleRecordClick}
            onRecordDoubleClick={handleRecordDoubleClick}
            onRecordKeyDown={handleKeyDown} // Keyboard support
            className="rbm-record-list__data-grid"
            ariaLabel={a11y?.descriptions?.tableDescription || 'Records data table'}
            testId={testIds.table}
            loading={state.loading}
            // Row actions integration with advisory security
            rowActionsComponent={actions.length > 0 ? (
              <RowActionsMenu
                actions={getActionsWithEnablement} // Pass function to get actions per record
                onActionSelect={handleRowActionSelect}
                placement="bottom-end"
                className="rbm-record-list__row-actions"
                disabled={state.loading || !!executingAction}
                showDisabledTooltip={true} // Show tooltips for disabled actions
              />
            ) : undefined}
          />
        )}
      </div>
      
      {/* 3. Pagination */}
      {!state.loading && !state.error && state.rows.length > 0 && (
        <div 
          className="rbm-record-list__pagination"
          data-testid={testIds.pagination}
          role="navigation"
          aria-label={a11y?.descriptions?.paginationDescription || 'Table pagination'}
        >
          <Pagination
            hasNextPage={paginationConfig.hasNextPage}
            hasPreviousPage={paginationConfig.hasPreviousPage}
            pageSize={paginationConfig.pageSize}
            recordCount={paginationConfig.recordCount}
            pageSizeOptions={paginationConfig.pageSizeOptions}
            showPageSizeSelector={true}
            showRecordCount={true}
            onNextPage={() => handlePageChange('next')}
            onPreviousPage={() => handlePageChange('prev')}
            onPageSizeChange={handlePageSizeChange}
            className="rbm-record-list__pagination-controls"
            ariaLabel="Navigate between pages"
            recordsLabel="records"
            disabled={state.loading}
          />
        </div>
      )}
      
      {/* Confirmation Dialog */}
      <RbmConfirmDialog
        dialogState={dialogState}
        className="rbm-record-list__confirm-dialog"
        testId="rbm-record-list-confirm"
      />
      
      {/* Inline Error Display */}
      <RbmInlineError
        error={actionError}
        onDismiss={() => setActionError(null)}
        className="rbm-record-list__inline-error"
      />
      
      {/* 4. Bulk Action Bar (conditional) */}
      {showBulkActionBar && (
        <div 
          className="rbm-record-list__bulk-actions"
          data-testid={testIds.actions}
          role="toolbar"
          aria-label="Bulk actions for selected records"
        >
          <BulkActionBar
            selectedCount={selectedRecords.length}
            totalCount={state.rows.length}
            actions={bulkActions}
            onActionSelect={handleBulkActionSelect}
            onClearSelection={handleClearSelection}
            className="rbm-record-list__bulk-action-bar"
            position="sticky-bottom"
            showSelectedCount={true}
            showClearSelection={true}
            ariaLabel={`${selectedRecords.length} records selected. Available bulk actions`}
            disabled={state.loading || !!executingAction || !!executingBulkAction}
          />
        </div>
      )}
    </div>
  );
};

export default RbmRecordList;