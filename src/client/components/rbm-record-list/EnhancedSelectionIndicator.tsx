import React from 'react';
import { Icon } from './Icon';

/**
 * WCAG 2.1 AA Enhanced Selection Indicator Component
 * 
 * Shows selection state with multiple visual cues (never color alone):
 * - Icon symbols
 * - Text labels
 * - Border patterns
 * - Shape variations
 */

export interface EnhancedSelectionIndicatorProps {
  isSelected: boolean;
  isPartiallySelected?: boolean;
  selectionMode: 'single' | 'multiple' | 'none';
  rowIndex?: number;
  totalRows?: number;
  className?: string;
  onChange?: (selected: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  variant?: 'default' | 'compact' | 'detailed';
  showText?: boolean;
}

export const EnhancedSelectionIndicator: React.FC<EnhancedSelectionIndicatorProps> = ({
  isSelected,
  isPartiallySelected = false,
  selectionMode,
  rowIndex,
  totalRows,
  className = '',
  onChange,
  disabled = false,
  ariaLabel,
  variant = 'default',
  showText = true
}) => {
  if (selectionMode === 'none') {
    return null;
  }

  const getSelectionConfig = () => {
    if (isPartiallySelected) {
      return {
        icon: 'checkbox-mixed',
        text: 'Partially selected',
        state: 'mixed',
        shape: 'square-mixed'
      };
    }
    
    if (isSelected) {
      if (selectionMode === 'multiple') {
        return {
          icon: 'checkbox-checked',
          text: 'Selected',
          state: 'checked',
          shape: 'square-filled'
        };
      } else {
        return {
          icon: 'radio-selected',
          text: 'Selected',
          state: 'selected',
          shape: 'circle-filled'
        };
      }
    }
    
    // Not selected
    if (selectionMode === 'multiple') {
      return {
        icon: 'checkbox-unchecked',
        text: 'Not selected',
        state: 'unchecked',
        shape: 'square-empty'
      };
    } else {
      return {
        icon: 'radio-unselected',
        text: 'Not selected',
        state: 'unselected',
        shape: 'circle-empty'
      };
    }
  };

  const config = getSelectionConfig();
  const variantClass = `rbm-enhanced-selection-indicator--${variant}`;
  const stateClass = `rbm-enhanced-selection-indicator--${config.state}`;
  const shapeClass = `rbm-selection-shape--${config.shape}`;

  const getAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;
    
    let label = config.text;
    if (rowIndex !== undefined && totalRows !== undefined) {
      label += `, row ${rowIndex + 1} of ${totalRows}`;
    }
    return label;
  };

  const getText = (): string => {
    let text = config.text;
    if (variant === 'detailed' && rowIndex !== undefined && totalRows !== undefined) {
      text += ` (${rowIndex + 1}/${totalRows})`;
    }
    return text;
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
    <div
      className={`rbm-enhanced-selection-indicator ${variantClass} ${stateClass} ${shapeClass} ${className}`}
      role={selectionMode === 'multiple' ? 'checkbox' : 'radio'}
      aria-checked={isPartiallySelected ? 'mixed' : isSelected}
      aria-label={getAriaLabel()}
      aria-disabled={disabled}
      tabIndex={disabled ? -1 : 0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      data-selected={isSelected}
      data-partially-selected={isPartiallySelected}
      data-selection-mode={selectionMode}
    >
      {/* Visual shape indicator */}
      <div 
        className={`rbm-selection-shape ${shapeClass}`}
        aria-hidden="true"
      >
        {/* Pattern overlay for better visual distinction */}
        <div className="rbm-selection-pattern" />
        
        {/* Icon inside shape */}
        <Icon
          name={config.icon}
          size="xs"
          className="rbm-selection-icon"
          decorative={true}
          ariaHidden={true}
        />
      </div>
      
      {/* Text label (visible or screen reader only) */}
      <span className={showText ? 'rbm-enhanced-selection-indicator__text' : 'rbm-sr-only'}>
        {getText()}
      </span>
      
      {/* Focus indicator */}
      <div className="rbm-selection-focus-ring" aria-hidden="true" />
    </div>
  );
};