/**
 * RBM Inline Error Component
 * 
 * Non-blocking inline error display for action failures
 */

import React, { useEffect, useState } from 'react';
import './RbmInlineError.css';

interface RbmInlineErrorProps {
  error: {
    message: string;
    correlationId?: string;
    actionId?: string;
    recordId?: string;
  } | null;
  onDismiss?: () => void;
  autoHideAfter?: number; // milliseconds
  className?: string;
}

export const RbmInlineError: React.FC<RbmInlineErrorProps> = ({
  error,
  onDismiss,
  autoHideAfter = 5000,
  className = ''
}) => {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    if (error) {
      setVisible(true);
      
      if (autoHideAfter > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          setTimeout(() => {
            onDismiss?.();
          }, 300); // Allow fade out animation
        }, autoHideAfter);
        
        return () => clearTimeout(timer);
      }
    }
  }, [error, autoHideAfter, onDismiss]);
  
  if (!error || !visible) {
    return null;
  }
  
  return (
    <div 
      className={`rbm-inline-error ${className}`}
      role="alert"
      aria-live="polite"
    >
      <div className="rbm-inline-error__content">
        <div className="rbm-inline-error__icon" aria-hidden="true">
          ⚠️
        </div>
        <div className="rbm-inline-error__message">
          <strong>Action Failed</strong>
          <p>{error.message}</p>
          {error.correlationId && (
            <p className="rbm-inline-error__correlation">
              Correlation ID: {error.correlationId}
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            type="button"
            className="rbm-inline-error__dismiss"
            onClick={() => {
              setVisible(false);
              setTimeout(onDismiss, 300);
            }}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default RbmInlineError;