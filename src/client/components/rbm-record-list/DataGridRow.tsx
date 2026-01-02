import React from 'react';

/**
 * WCAG 2.1 AA Compliant Data Grid Row Component
 * 
 * Provides proper ARIA markup for grid rows with full accessibility support
 */

export interface DataGridRowProps {
  rowIndex: number;
  record: any;
  columns: any[];
  isSelected: boolean;
  selectionMode: 'none' | 'single' | 'multiple';
  onSelectionChange?: (selected: boolean) => void;
  onRowClick?: () => void;
  onRowDoubleClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
  testId?: string;
}

export const DataGridRow: React.FC<DataGridRowProps> = ({
  rowIndex,
  record,
  columns,
  isSelected,
  selectionMode,
  onSelectionChange,
  onRowClick,
  onRowDoubleClick,
  onKeyDown,
  className = '',
  ariaLabel,
  children,
  testId
}) => {
  const getRowAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;
    
    // Create descriptive label from key fields
    const keyFields = ['name', 'title', 'short_description', 'number'];
    let description = '';
    
    for (const field of keyFields) {
      const value = record[field];
      if (value) {
        const displayValue = typeof value === 'object' ? value.display_value || value.value : value;
        if (displayValue) {
          description = displayValue.toString().substring(0, 100);
          break;
        }
      }
    }
    
    return description || `Row ${rowIndex + 1}`;
  };

  const handleClick = () => {
    onRowClick?.();
  };

  const handleDoubleClick = () => {
    onRowDoubleClick?.();
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    onKeyDown?.(event);
  };

  return (
    <tr
      role="row"
      className={`rbm-data-grid__row ${className}`}
      aria-rowindex={rowIndex + 2} // +2 because header is row 1, first data row is row 2
      aria-selected={selectionMode !== 'none' ? isSelected : undefined}
      aria-label={getRowAriaLabel()}
      data-row-index={rowIndex}
      data-testid={testId}
      tabIndex={0}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {children}
    </tr>
  );
};