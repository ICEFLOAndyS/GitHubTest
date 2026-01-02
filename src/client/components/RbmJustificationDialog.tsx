/**
 * RBM Justification Dialog Component - AUTHORITATIVE v1.9.5
 * 
 * Collects justification text for actions requiring audit justification
 * ENFORCES: 
 * - Mandatory justification collection before API calls
 * - No client-side storage of justification data
 * - Complete audit compliance
 */

import React, { useEffect, useRef, useState } from 'react';
import { JustificationDialogState } from '../hooks/useJustificationDialog';
import { 
  rbmComplianceChecker, 
  acceptanceCriteriaValidator 
} from './rbm-record-list/audit-metadata-impl';
import './RbmJustificationDialog.css';
import './RbmJustificationDialog-enhancements.css';

interface RbmJustificationDialogProps {
  dialogState: JustificationDialogState | null;
  className?: string;
  testId?: string;
}

export const RbmJustificationDialog: React.FC<RbmJustificationDialogProps> = ({
  dialogState,
  className = '',
  testId
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const [justificationText, setJustificationText] = useState('');
  const [isValid, setIsValid] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  // CRITICAL: Ensure no justification data is stored client-side
  useEffect(() => {
    // Verify compliance on component mount and when dialog opens
    if (dialogState?.isOpen) {
      const compliance = acceptanceCriteriaValidator.validateNoClientSideStorage();
      if (!compliance) {
        console.error('RBM COMPLIANCE VIOLATION: Justification data detected in client storage');
        // Force clear any potential storage
        try {
          sessionStorage.removeItem('justification_temp');
          localStorage.removeItem('justification_temp');
        } catch (e) {
          // Silent cleanup
        }
      }
    }
  }, [dialogState?.isOpen]);
  
  // Focus management - focus text area when dialog opens
  useEffect(() => {
    if (dialogState?.isOpen && textAreaRef.current) {
      textAreaRef.current.focus();
      setJustificationText(''); // Reset text (DO NOT persist client-side)
      setIsValid(false);
      setValidationMessage(null);
    }
  }, [dialogState?.isOpen]);
  
  // AUTHORITATIVE validation using RBM compliance checker
  useEffect(() => {
    if (dialogState?.actionId) {
      // Get enforcement rules from compliance checker
      const enforcement = rbmComplianceChecker.getJustificationEnforcement(dialogState.actionId);
      
      // Validate using authoritative rules
      const validation = rbmComplianceChecker.validateJustification(justificationText, enforcement);
      
      setIsValid(validation.valid);
      setValidationMessage(validation.errorMessage || null);
    } else {
      // Fallback validation for missing actionId
      setIsValid(justificationText.trim().length >= 10);
      setValidationMessage(
        justificationText.trim().length > 0 && justificationText.trim().length < 10 
          ? 'Please provide at least 10 characters of justification.'
          : null
      );
    }
  }, [justificationText, dialogState?.actionId]);
  
  // Handle text change with compliance monitoring
  const handleTextChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = event.target.value;
    setJustificationText(newValue);
    
    // CRITICAL: Never store justification in client-side storage
    // Any storage operations here would be a compliance violation
  };
  
  // Handle submit with MANDATORY validation
  const handleSubmit = () => {
    if (!dialogState) {
      console.error('Cannot submit justification: Missing dialog state');
      return;
    }
    
    // CRITICAL: Final validation before submission
    const enforcement = dialogState.actionId 
      ? rbmComplianceChecker.getJustificationEnforcement(dialogState.actionId)
      : { required: dialogState.required, minLength: 10, maxLength: 1000, placeholder: '' };
    
    const finalValidation = rbmComplianceChecker.validateJustification(justificationText, enforcement);
    
    if (!finalValidation.valid) {
      setValidationMessage(finalValidation.errorMessage || 'Invalid justification');
      setIsValid(false);
      return;
    }
    
    // COMPLIANCE CHECK: Verify no client-side storage before submission
    const storageCompliance = acceptanceCriteriaValidator.validateNoClientSideStorage();
    if (!storageCompliance) {
      console.error('RBM COMPLIANCE VIOLATION: Cannot submit - client-side audit storage detected');
      setValidationMessage('Compliance error: Please refresh the page and try again.');
      return;
    }
    
    // Submit justification (will be included in audit metadata)
    dialogState.onSubmit(justificationText.trim());
    
    // CRITICAL: Clear justification from memory after submission
    setJustificationText('');
    setIsValid(false);
    setValidationMessage(null);
  };
  
  // Handle cancel with cleanup
  const handleCancel = () => {
    if (dialogState) {
      // CRITICAL: Clear justification from memory
      setJustificationText('');
      setIsValid(false);
      setValidationMessage(null);
      
      dialogState.onCancel();
    }
  };
  
  // Escape key handler
  useEffect(() => {
    if (!dialogState?.isOpen) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        handleCancel();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [dialogState?.isOpen]);
  
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
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
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
        onClick={handleCancel}
        aria-hidden="true"
      />
      
      {/* Dialog */}
      <div
        ref={dialogRef}
        className={`rbm-justification-dialog ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="justification-dialog-title"
        aria-describedby="justification-dialog-description"
        data-testid={testId}
      >
        <div className="rbm-justification-dialog__content">
          <header className="rbm-justification-dialog__header">
            <h2 
              id="justification-dialog-title"
              className="rbm-justification-dialog__title"
            >
              Justification Required
            </h2>
          </header>
          
          <div className="rbm-justification-dialog__body">
            <div className="rbm-justification-dialog__description">
              <p>
                <strong>Action:</strong> {dialogState.actionLabel}
              </p>
              <p>
                <strong>Target:</strong> {dialogState.recordDisplay}
                {dialogState.recordCount && (
                  <span> ({dialogState.recordCount} records)</span>
                )}
              </p>
              <div className="rbm-compliance-notice">
                <p>
                  <strong>⚠️ MANDATORY JUSTIFICATION REQUIRED</strong>
                </p>
                <p>
                  This action requires justification for audit compliance and governance. 
                  The justification will be included in the audit trail and cannot be modified after submission.
                </p>
                <p>
                  <strong>Security Notice:</strong> Justification data is processed securely and 
                  is not stored in your browser for compliance with RBM security policies.
                </p>
              </div>
            </div>
            
            <div className="rbm-justification-dialog__form">
              <label 
                htmlFor="justification-text"
                className="rbm-justification-dialog__label"
              >
                Justification <span className="required">*</span>
              </label>
              <textarea
                ref={textAreaRef}
                id="justification-text"
                className={`rbm-justification-dialog__textarea ${!isValid && justificationText.length > 0 ? 'error' : ''}`}
                placeholder={dialogState.placeholder}
                value={justificationText}
                onChange={handleTextChange}
                rows={4}
                maxLength={1000}
                required={true}
                aria-describedby="justification-help"
                aria-invalid={!isValid && justificationText.length > 0}
              />
              <div 
                id="justification-help"
                className="rbm-justification-dialog__help"
              >
                <div className="justification-requirements">
                  <p>
                    <strong>Requirements:</strong> 
                    {dialogState.actionId ? (
                      (() => {
                        const enforcement = rbmComplianceChecker.getJustificationEnforcement(dialogState.actionId);
                        return ` Minimum ${enforcement.minLength} characters. ${justificationText.length}/${enforcement.maxLength} characters`;
                      })()
                    ) : (
                      ` Minimum 10 characters. ${justificationText.length}/1000 characters`
                    )}
                  </p>
                </div>
                
                {validationMessage && (
                  <div className="validation-error" role="alert">
                    <strong>❌ {validationMessage}</strong>
                  </div>
                )}
                
                {isValid && justificationText.length > 0 && (
                  <div className="validation-success">
                    <strong>✅ Justification meets requirements</strong>
                  </div>
                )}
                
                <div className="compliance-reminder">
                  <p>
                    <strong>🔒 Security:</strong> Your justification is processed securely 
                    and transmitted directly to the audit system. It will not be cached or stored 
                    in your browser for compliance with RBM data protection policies.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <footer className="rbm-justification-dialog__footer">
            <button
              type="button"
              className="rbm-button rbm-button--secondary"
              onClick={handleCancel}
            >
              Cancel
            </button>
            <button
              type="button"
              className="rbm-button rbm-button--primary"
              onClick={handleSubmit}
              disabled={!isValid}
              title={!isValid ? (validationMessage || 'Please provide valid justification') : 'Submit justification and continue with action'}
            >
              Continue with Justification
            </button>
          </footer>
        </div>
      </div>
    </>
  );
};

export default RbmJustificationDialog;