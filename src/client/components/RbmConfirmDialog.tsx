/**
 * RBM Confirmation Dialog Component
 * 
 * RBM-compliant confirmation dialog using design system patterns
 */

import React, { useEffect, useRef } from 'react';
import { ConfirmDialogState } from '../hooks/useConfirmDialog';
import './RbmConfirmDialog.css';

interface RbmConfirmDialogProps {
  dialogState: ConfirmDialogState | null;
  className?: string;
  testId?: string;
}

export const RbmConfirmDialog: React.FC<RbmConfirmDialogProps> = ({
  dialogState,
  className = '',
  testId
}) => {
  const primaryButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  
  // Focus management - focus primary button when dialog opens
  useEffect(() => {
    if (dialogState?.isOpen && primaryButtonRef.current) {
      primaryButtonRef.current.focus();
    }
  }, [dialogState?.isOpen]);
  
  // Escape key handler
  useEffect(() => {
    if (!dialogState?.isOpen) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        dialogState.onCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dialogState]);
  
  // Trap focus within dialog
  useEffect(() => {
    if (!dialogState?.isOpen || !dialogRef.current) return;
    
    const dialog = dialogRef.current;
    const focusableElements = dialog.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    if (focusableElements.length === 0) return;
    
    const firstElement = focusableElements[0] as HTMLElement;
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
    
    const handleTabKey = (event: KeyboardEvent) => {
      if (event.key !== 'Tab') return;
      
      if (event.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    };
    
    dialog.addEventListener('keydown', handleTabKey);
    return () => dialog.removeEventListener('keydown', handleTabKey);
  }, [dialogState?.isOpen]);
  
  if (!dialogState?.isOpen) {
    return null;
  }
  
  return (
    <>
      {/* Backdrop */}
      <div 
        className="rbm-dialog-backdrop"
        onClick={dialogState.onCancel}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`rbm-confirm-dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        data-testid={testId}
      >
        <div className="rbm-confirm-dialog__content">
          <header className="rbm-confirm-dialog__header">
            <h2 
              id="confirm-dialog-title"
              className="rbm-confirm-dialog__title"
            >
              {dialogState.title}
            </h2>
          </header>
          
          <div className="rbm-confirm-dialog__body">
            <p 
              id="confirm-dialog-message"
              className="rbm-confirm-dialog__message"
            >
              {dialogState.message}
            </p>
          </div>
          
          <footer className="rbm-confirm-dialog__footer">
            <button
              type="button"
              className="rbm-button rbm-button--secondary"
              onClick={dialogState.onCancel}
            >
              {dialogState.secondaryLabel}
            </button>
            <button
              ref={primaryButtonRef}
              type="button"
              className="rbm-button rbm-button--primary"
              onClick={dialogState.onConfirm}
            >
              {dialogState.primaryLabel}
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default RbmConfirmDialog;