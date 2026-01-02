import React from 'react';
import { DataGridRow } from './DataGridRow';
import { DataGridCell } from './DataGridCell';
import { EnhancedSelectionIndicator } from './EnhancedSelectionIndicator';
import { EnhancedStatusIndicator } from './EnhancedStatusIndicator';
import { ActionMenu } from './ActionMenu';
import { Icon } from './Icon';

/**
 * WCAG 2.1 AA Compliant Enhanced Data Grid Component
 * 
 * Provides comprehensive accessibility support with proper ARIA markup
 */

export interface EnhancedDataGridProps {
  id: string;
  columns: any[];
  records: any[];
  selectionMode: 'none' | 'single' | 'multiple';
  selectedRecords: any[];
  onSelectionChange: (selected: any[]) => void;
  onRecordClick?: (record: any) => void;
  onRecordDoubleClick?: (record: any) => void;
  onRecordKeyDown?: (event: React.KeyboardEvent, record: any) => void;
  sortConfig?: any;
  onSortChange?: (sort: any) => void;
  actions?: any[];
  onActionSelect?: (actionId: string, record: any) => void;
  className?: string;
  ariaLabel?: string;
  loading?: boolean;
  gridRef?: React.RefObject<HTMLTableElement>;
}

export const EnhancedDataGrid: React.FC<EnhancedDataGridProps> = ({
  id,
  columns,
  records,
  selectionMode,
  selectedRecords,
  onSelectionChange,
  onRecordClick,
  onRecordDoubleClick,
  onRecordKeyDown,
  sortConfig,
  onSortChange,
  actions = [],
  onActionSelect,
  className = '',
  ariaLabel,
  loading = false,
  gridRef
}) => {
  const [openMenuRowIndex, setOpenMenuRowIndex] = React.useState<number>(-1);
  const actionTriggerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const isRecordSelected = (record: any): boolean => {
    const recordId = typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id;
    return selectedRecords.some(selected => {
      const selectedId = typeof selected.sys_id === 'object' ? selected.sys_id.value : selected.sys_id;
      return selectedId === recordId;
    });
  };

  const handleSelectionChange = (record: any, selected: boolean) => {
    const recordId = typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id;
    
    if (selectionMode === 'single') {
      onSelectionChange(selected ? [record] : []);
    } else if (selectionMode === 'multiple') {
      if (selected) {
        onSelectionChange([...selectedRecords, record]);
      } else {
        onSelectionChange(selectedRecords.filter(sel => {
          const selId = typeof sel.sys_id === 'object' ? sel.sys_id.value : sel.sys_id;
          return selId !== recordId;
        }));
      }
    }
  };

  const handleSort = (column: any) => {
    if (!column.sortable || !onSortChange) return;

    const currentSort = sortConfig?.field === column.field ? sortConfig.direction : null;
    const newDirection = currentSort === 'asc' ? 'desc' : 'asc';
    
    onSortChange({
      field: column.field,
      direction: newDirection
    });
  };

  const getSortAriaSort = (column: any): "none" | "ascending" | "descending" | undefined => {
    if (!column.sortable) return undefined;
    if (sortConfig?.field !== column.field) return 'none';
    return sortConfig.direction === 'asc' ? 'ascending' : 'descending';
  };

  const handleActionMenuOpen = (rowIndex: number) => {
    setOpenMenuRowIndex(rowIndex);
  };

  const handleActionMenuClose = () => {
    setOpenMenuRowIndex(-1);
  };

  const handleActionSelect = (actionId: string, record: any) => {
    onActionSelect?.(actionId, record);
    handleActionMenuClose();
  };

  const getGridAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;
    
    const recordCount = records.length;
    const selectedCount = selectedRecords.length;
    
    let label = `Data grid with ${recordCount} records`;
    if (selectionMode !== 'none' && selectedCount > 0) {
      label += `, ${selectedCount} selected`;
    }
    
    return label;
  };

  return (
    <div 
      className={`rbm-enhanced-data-grid ${className}`}
      role="application"
      aria-label={getGridAriaLabel()}
    >
      {loading && (
        <div 
          className="rbm-data-grid__loading-overlay" 
          role="status" 
          aria-live="polite"
        >
          <span>Loading data...</span>
        </div>
      )}
      
      <table
        ref={gridRef}
        id={id}
        role="grid"
        className="rbm-data-grid__table"
        aria-label={getGridAriaLabel()}
        aria-rowcount={records.length + 1} // +1 for header
        aria-colcount={columns.length + (selectionMode !== 'none' ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
        aria-multiselectable={selectionMode === 'multiple'}
        aria-readonly={selectionMode === 'none'}
        tabIndex={0}
      >
        {/* Table Header */}
        <thead>
          <tr role="row" aria-rowindex={1}>
            {/* Selection column header */}
            {selectionMode !== 'none' && (
              <th
                role="columnheader"
                className="rbm-data-grid__header-cell rbm-data-grid__header-cell--selection"
                aria-label="Row selection"
                scope="col"
              >
                <span className="rbm-sr-only">Select</span>
                {selectionMode === 'multiple' && (
                  <EnhancedSelectionIndicator
                    isSelected={selectedRecords.length === records.length && records.length > 0}
                    isPartiallySelected={selectedRecords.length > 0 && selectedRecords.length < records.length}
                    selectionMode="multiple"
                    ariaLabel="Select all records"
                    showText={false}
                    variant="compact"
                    onChange={(selected) => {
                      onSelectionChange(selected ? records : []);
                    }}
                  />
                )}
              </th>
            )}
            
            {/* Data column headers */}
            {columns.map((column, columnIndex) => (
              <th
                key={column.field}
                role="columnheader"
                className={`rbm-data-grid__header-cell ${column.sortable ? 'rbm-data-grid__header-cell--sortable' : ''}`}
                aria-sort={getSortAriaSort(column)}
                aria-label={column.metadata?.accessibility?.headerAriaLabel || column.label}
                scope="col"
                tabIndex={column.sortable ? 0 : -1}
                onClick={() => handleSort(column)}
                onKeyDown={(e) => {
                  if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    handleSort(column);
                  }
                }}
              >
                    <span className="rbm-data-grid__header-content">
                      {column.label}
                      {column.sortable && sortConfig?.field === column.field && (
                        <Icon
                          name={sortConfig.direction === 'asc' ? 'arrow-up' : 'arrow-down'}
                          size="xs"
                          className="rbm-data-grid__sort-indicator"
                          ariaHidden={true}
                          decorative={true}
                        />
                      )}
                    </span>
              </th>
            ))}
            
            {/* Actions column header */}
            {actions.length > 0 && (
              <th
                role="columnheader"
                className="rbm-data-grid__header-cell rbm-data-grid__header-cell--actions"
                aria-label="Row actions"
                scope="col"
              >
                <span className="rbm-sr-only">Actions</span>
              </th>
            )}
          </tr>
        </thead>
        
        {/* Table Body */}
        <tbody>
          {records.map((record, rowIndex) => {
            const isSelected = isRecordSelected(record);
            
            return (
              <DataGridRow
                key={typeof record.sys_id === 'object' ? record.sys_id.value : record.sys_id}
                rowIndex={rowIndex}
                record={record}
                columns={columns}
                isSelected={isSelected}
                selectionMode={selectionMode}
                onSelectionChange={(selected) => handleSelectionChange(record, selected)}
                onRowClick={() => onRecordClick?.(record)}
                onRowDoubleClick={() => onRecordDoubleClick?.(record)}
                onKeyDown={(e) => onRecordKeyDown?.(e, record)}
                className={isSelected ? 'rbm-data-grid__row--selected' : ''}
                testId={`data-grid-row-${rowIndex}`}
              >
                {/* Selection cell */}
                {selectionMode !== 'none' && (
                  <DataGridCell
                    rowIndex={rowIndex}
                    columnIndex={0}
                    column={{ field: 'selection', label: 'Selection' }}
                    value=""
                    record={record}
                    className="rbm-data-grid__cell--selection"
                  >
                    <EnhancedSelectionIndicator
                      isSelected={isSelected}
                      selectionMode={selectionMode}
                      rowIndex={rowIndex}
                      totalRows={records.length}
                      showText={false}
                      variant="default"
                      onChange={(selected) => handleSelectionChange(record, selected)}
                    />
                  </DataGridCell>
                )}
                
                {/* Data cells */}
                {columns.map((column, columnIndex) => {
                  const value = record[column.field];
                  const actualColumnIndex = selectionMode !== 'none' ? columnIndex + 1 : columnIndex;
                  
                  return (
                    <DataGridCell
                      key={column.field}
                      rowIndex={rowIndex}
                      columnIndex={actualColumnIndex}
                      column={column}
                      value={value}
                      record={record}
                      testId={`data-grid-cell-${rowIndex}-${columnIndex}`}
                    />
                  );
                })}
                
                {/* Actions cell */}
                {actions.length > 0 && (
                  <DataGridCell
                    rowIndex={rowIndex}
                    columnIndex={columns.length + (selectionMode !== 'none' ? 1 : 0)}
                    column={{ field: 'actions', label: 'Actions' }}
                    value=""
                    record={record}
                    className="rbm-data-grid__cell--actions"
                  >
                    <button
                      ref={el => {
                        actionTriggerRefs.current[rowIndex] = el;
                      }}
                      className="rbm-data-grid__actions-trigger"
                      onClick={() => handleActionMenuOpen(rowIndex)}
                      aria-label={`Actions for row ${rowIndex + 1}`}
                      aria-expanded={openMenuRowIndex === rowIndex}
                      aria-haspopup="menu"
                    >
                      <Icon
                        name="menu"
                        size="sm"
                        className="rbm-data-grid__actions-icon"
                        ariaHidden={true}
                        decorative={true}
                      />
                    </button>
                    
                    <ActionMenu
                      actions={actions}
                      onActionSelect={(actionId) => handleActionSelect(actionId, record)}
                      isOpen={openMenuRowIndex === rowIndex}
                      onClose={handleActionMenuClose}
                      triggerRef={{ current: actionTriggerRefs.current[rowIndex] || null }}
                      ariaLabel={`Actions for row ${rowIndex + 1}`}
                    />
                  </DataGridCell>
                )}
              </DataGridRow>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};