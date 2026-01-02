import React from 'react';

/**
 * WCAG 2.1 AA Compliant Selection Indicator Component
 * 
 * Shows selection state with both icon and text (never color alone)
 * Includes proper ARIA markup for screen readers
 */

export interface SelectionIndicatorProps {
  isSelected: boolean;
  isPartiallySelected?: boolean;
  selectionMode: 'single' | 'multiple' | 'none';
  rowIndex?: number;
  totalRows?: number;
  className?: string;
  onChange?: (selected: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
}

export const SelectionIndicator: React.FC<SelectionIndicatorProps> = ({
  isSelected,
  isPartiallySelected = false,
  selectionMode,
  rowIndex,
  totalRows,
  className = '',
  onChange,
  disabled = false,
  ariaLabel
}) => {
  if (selectionMode === 'none') {
    return null;
  }

  const getSelectionIcon = (): string => {
    if (isPartiallySelected) return '◐';
    if (isSelected) return '✓';
    return selectionMode === 'multiple' ? '☐' : '○';
  };

  const getSelectionText = (): string => {
    if (isPartiallySelected) return 'Partially selected';
    if (isSelected) return 'Selected';
    return 'Not selected';
  };

  const getAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;
    
    let label = getSelectionText();
    if (rowIndex !== undefined && totalRows !== undefined) {
      label += `, row ${rowIndex + 1} of ${totalRows}`;
    }
    return label;
  };

  const handleClick = () => {
    if (!disabled && onChange && selectionMode !== 'none') {
      onChange(!isSelected);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if ((event.key === ' ' || event.key === 'Enter') && !disabled && onChange) {
      event.preventDefault();
      onChange(!isSelected);
    }
  };

  return (
    <span
      className={`rbm-selection-indicator ${className}`}
      role={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
      aria-checked={isPartiallySelected ? 'mixed' : isSelected}
      aria-label={getAriaLabel()}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-selected={isSelected}
      data-partially-selected={isPartiallySelected}
    >
      <span 
        className="rbm-selection-indicator__icon" 
        aria-hidden="true"
      >
        {getSelectionIcon()}
      </span>
      <span className="rbm-selection-indicator__text rbm-sr-only">
        {getSelectionText()}
        {rowIndex !== undefined && totalRows !== undefined && 
          `, row ${rowIndex + 1} of ${totalRows}`
        }
      </span>
    </span>
  );
};