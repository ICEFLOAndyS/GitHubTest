import React from 'react';

/**
 * WCAG 2.1 AA Compliant Data Grid Cell Component
 * 
 * Provides proper ARIA markup for grid cells with accessibility support
 */

export interface DataGridCellProps {
  rowIndex: number;
  columnIndex: number;
  column: any;
  value: any;
  record: any;
  className?: string;
  ariaLabel?: string;
  children?: React.ReactNode;
  testId?: string;
}

export const DataGridCell: React.FC<DataGridCellProps> = ({
  rowIndex,
  columnIndex,
  column,
  value,
  record,
  className = '',
  ariaLabel,
  children,
  testId
}) => {
  const getCellValue = (): string => {
    if (value === null || value === undefined) return '';
    
    // Handle display_value structure from ServiceNow
    if (typeof value === 'object' && value.display_value !== undefined) {
      return value.display_value.toString();
    }
    
    return value.toString();
  };

  const getCellAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;
    
    const cellValue = getCellValue();
    const columnLabel = column.label || column.field;
    
    return `${columnLabel}: ${cellValue}`;
  };

  const getCellType = (): string => {
    // Determine cell type for better screen reader context
    const fieldType = column.metadata?.fieldType;
    
    switch (fieldType) {
      case 'date':
      case 'datetime':
        return 'Date';
      case 'number':
        return 'Number';
      case 'reference':
        return 'Reference';
      case 'choice':
        return 'Choice';
      case 'boolean':
        return 'Boolean';
      default:
        return 'Text';
    }
  };

  return (
    <td
      role="gridcell"
      className={`rbm-data-grid__cell ${className}`}
      aria-label={getCellAriaLabel()}
      aria-describedby={column.metadata?.accessibility?.cellAriaLabel ? `cell-${rowIndex}-${columnIndex}-desc` : undefined}
      data-row-index={rowIndex}
      data-column-index={columnIndex}
      data-field={column.field}
      data-type={getCellType().toLowerCase()}
      data-testid={testId}
      tabIndex={-1} // Cells are focusable via keyboard navigation hook
    >
      {children || (
        <>
          <span className="rbm-data-grid__cell-content">
            {getCellValue()}
          </span>
          {column.metadata?.accessibility?.cellAriaLabel && (
            <span 
              id={`cell-${rowIndex}-${columnIndex}-desc`}
              className="rbm-sr-only"
            >
              {column.metadata.accessibility.cellAriaLabel}
            </span>
          )}
        </>
      )}
    </td>
  );
};