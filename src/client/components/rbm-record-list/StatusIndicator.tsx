import React from 'react';

/**
 * WCAG 2.1 AA Compliant Status Indicator Component
 * 
 * Displays status with both visual and textual indicators (never color alone)
 * Includes proper ARIA markup for screen readers
 */

export interface StatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral';
  text: string;
  icon?: string;
  className?: string;
  ariaLabel?: string;
  description?: string;
}

export const StatusIndicator: React.FC<StatusIndicatorProps> = ({
  status,
  text,
  icon,
  className = '',
  ariaLabel,
  description
}) => {
  const getStatusIcon = (status: string): string => {
    switch (status) {
      case 'success': return icon || '✓';
      case 'warning': return icon || '⚠';
      case 'error': return icon || '✕';
      case 'info': return icon || 'ℹ';
      default: return icon || '●';
    }
  };

  const statusClass = `rbm-status-indicator--${status}`;
  const finalAriaLabel = ariaLabel || `Status: ${text}`;

  return (
    <span
      className={`rbm-status-indicator ${statusClass} ${className}`}
      role="img"
      aria-label={finalAriaLabel}
      aria-describedby={description ? `${status}-desc` : undefined}
    >
      <span 
        className="rbm-status-indicator__icon" 
        aria-hidden="true"
      >
        {getStatusIcon(status)}
      </span>
      <span className="rbm-status-indicator__text">
        {text}
      </span>
      {description && (
        <span 
          id={`${status}-desc`} 
          className="rbm-sr-only"
        >
          {description}
        </span>
      )}
    </span>
  );
};