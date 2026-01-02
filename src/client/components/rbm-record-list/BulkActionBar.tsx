import React from 'react';

/**
 * WCAG 2.1 AA Compliant Bulk Action Bar Component
 * 
 * Provides accessible bulk actions with proper ARIA markup
 */

export interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  actions: any[];
  onActionSelect: (actionId: string) => void;
  onClearSelection: () => void;
  className?: string;
  ariaLabel?: string;
  position?: 'sticky-bottom' | 'static';
  disabled?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  actions,
  onActionSelect,
  onClearSelection,
  className = '',
  ariaLabel,
  position = 'sticky-bottom',
  disabled = false
}) => {
  const getAriaLabel = (): string => {
    if (ariaLabel) return ariaLabel;
    return `Bulk actions for ${selectedCount} selected records out of ${totalCount} total records`;
  };

  const getSelectionSummary = (): string => {
    if (selectedCount === 0) return 'No records selected';
    if (selectedCount === 1) return '1 record selected';
    if (selectedCount === totalCount) return `All ${totalCount} records selected`;
    return `${selectedCount} of ${totalCount} records selected`;
  };

  return (
    <div
      className={`rbm-bulk-action-bar rbm-bulk-action-bar--${position} ${className}`}
      role="toolbar"
      aria-label={getAriaLabel()}
      aria-live="polite"
      data-selected-count={selectedCount}
      data-total-count={totalCount}
      data-disabled={disabled}
    >
      <div className="rbm-bulk-action-bar__content">
        {/* Selection Summary */}
        <div 
          className="rbm-bulk-action-bar__summary"
          role="status"
          aria-live="polite"
        >
          <span className="rbm-bulk-action-bar__count">
            {getSelectionSummary()}
          </span>
        </div>

        {/* Action Buttons */}
        {selectedCount > 0 && (
          <div 
            className="rbm-bulk-action-bar__actions"
            role="group"
            aria-label="Bulk actions"
          >
            {actions.map((action) => (
              <button
                key={action.id}
                className={`rbm-bulk-action-bar__action rbm-button rbm-button--${action.category || 'secondary'}`}
                onClick={() => onActionSelect(action.id)}
                disabled={disabled || (action.maxSelection && selectedCount > action.maxSelection)}
                aria-describedby={`bulk-action-${action.id}-desc`}
                data-action-id={action.id}
              >
                {action.iconKey && (
                  <span 
                    className="rbm-button__icon" 
                    aria-hidden="true"
                  >
                    {action.iconKey}
                  </span>
                )}
                <span className="rbm-button__label">
                  {action.label}
                </span>
                
                {/* Screen reader description */}
                <span 
                  id={`bulk-action-${action.id}-desc`}
                  className="rbm-sr-only"
                >
                  {action.accessibility?.description || 
                   `Execute ${action.label} on ${selectedCount} selected records`}
                  {action.maxSelection && selectedCount > action.maxSelection && 
                   ` (Maximum ${action.maxSelection} records allowed)`}
                </span>
              </button>
            ))}

            {/* Clear Selection Button */}
            <button
              className="rbm-bulk-action-bar__clear rbm-button rbm-button--ghost"
              onClick={onClearSelection}
              disabled={disabled}
              aria-label={`Clear selection of ${selectedCount} records`}
            >
              <span className="rbm-button__icon" aria-hidden="true">×</span>
              <span className="rbm-button__label">Clear</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};