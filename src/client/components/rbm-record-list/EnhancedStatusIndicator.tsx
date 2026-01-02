import React from 'react';
import { Icon } from './Icon';

/**
 * WCAG 2.1 AA Enhanced Status Indicator Component
 * 
 * Always displays status with BOTH visual and textual indicators
 * Includes patterns, shapes, and text - never relies on color alone
 */

export interface EnhancedStatusIndicatorProps {
  status: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'pending' | 'in-progress' | 'complete';
  text: string;
  icon?: string;
  className?: string;
  ariaLabel?: string;
  description?: string;
  showIcon?: boolean;
  showPattern?: boolean;
  variant?: 'default' | 'compact' | 'detailed';
}

export const EnhancedStatusIndicator: React.FC<EnhancedStatusIndicatorProps> = ({
  status,
  text,
  icon,
  className = '',
  ariaLabel,
  description,
  showIcon = true,
  showPattern = true,
  variant = 'default'
}) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      success: {
        icon: 'success',
        pattern: 'solid',
        textPrefix: 'Success:',
        semanticClass: 'success'
      },
      warning: {
        icon: 'warning',
        pattern: 'diagonal-lines',
        textPrefix: 'Warning:',
        semanticClass: 'warning'
      },
      error: {
        icon: 'error',
        pattern: 'dots',
        textPrefix: 'Error:',
        semanticClass: 'error'
      },
      info: {
        icon: 'info',
        pattern: 'horizontal-lines',
        textPrefix: 'Info:',
        semanticClass: 'info'
      },
      neutral: {
        icon: 'default',
        pattern: 'solid',
        textPrefix: '',
        semanticClass: 'neutral'
      },
      pending: {
        icon: 'pending',
        pattern: 'diagonal-lines',
        textPrefix: 'Pending:',
        semanticClass: 'pending'
      },
      'in-progress': {
        icon: 'in-progress',
        pattern: 'dots',
        textPrefix: 'In Progress:',
        semanticClass: 'in-progress'
      },
      complete: {
        icon: 'complete',
        pattern: 'solid',
        textPrefix: 'Complete:',
        semanticClass: 'complete'
      }
    };
    
    return configs[status] || configs.neutral;
  };

  const config = getStatusConfig(status);
  const statusClass = `rbm-enhanced-status-indicator--${config.semanticClass}`;
  const variantClass = `rbm-enhanced-status-indicator--${variant}`;
  const patternClass = showPattern ? `rbm-pattern--${config.pattern}` : '';
  
  const finalAriaLabel = ariaLabel || `${config.textPrefix} ${text}`.trim();

  const getPatternElement = () => {
    if (!showPattern) return null;

    // Create visual patterns that work without color
    switch (config.pattern) {
      case 'diagonal-lines':
        return <div className="rbm-pattern rbm-pattern--diagonal" aria-hidden="true" />;
      case 'dots':
        return <div className="rbm-pattern rbm-pattern--dots" aria-hidden="true" />;
      case 'horizontal-lines':
        return <div className="rbm-pattern rbm-pattern--horizontal" aria-hidden="true" />;
      default:
        return null;
    }
  };

  return (
    <div
      className={`rbm-enhanced-status-indicator ${statusClass} ${variantClass} ${patternClass} ${className}`}
      role="status"
      aria-label={finalAriaLabel}
      aria-describedby={description ? `${status}-enhanced-desc` : undefined}
      data-status={status}
    >
      {/* Visual pattern background */}
      {getPatternElement()}
      
      {/* Icon + Text Content */}
      <div className="rbm-enhanced-status-indicator__content">
        {showIcon && (
          <Icon
            name={icon || config.icon}
            size="sm"
            className="rbm-enhanced-status-indicator__icon"
            decorative={true}
            ariaHidden={true}
          />
        )}
        
        <span className="rbm-enhanced-status-indicator__text">
          {variant === 'detailed' && config.textPrefix && (
            <span className="rbm-enhanced-status-indicator__prefix">
              {config.textPrefix}{' '}
            </span>
          )}
          {text}
        </span>
      </div>
      
      {/* Screen reader description */}
      {description && (
        <span 
          id={`${status}-enhanced-desc`} 
          className="rbm-sr-only"
        >
          {description}
        </span>
      )}
    </div>
  );
};