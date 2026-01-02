/**
 * RBM Justification Dialog Hook - AUTHORITATIVE v1.9.5
 * 
 * Provides justification collection functionality for actions requiring audit justification
 * ENFORCES: Mandatory justification collection before API invocation
 */

import { useState, useCallback } from 'react';

export interface JustificationDialogState {
  isOpen: boolean;
  actionId: string;
  actionLabel: string;
  recordDisplay: string;
  recordCount?: number;
  required: boolean; // Always true for RBM compliance
  placeholder?: string;
  onSubmit: (justification: string) => void;
  onCancel: () => void;
}

export function useJustificationDialog() {
  const [dialogState, setDialogState] = useState<JustificationDialogState | null>(null);
  
  const showJustificationDialog = useCallback((options: {
    actionId: string;
    actionLabel: string;
    recordDisplay: string;
    recordCount?: number;
    required?: boolean; // Will be forced to true for RBM compliance
    placeholder?: string;
    onSubmit: (justification: string) => void;
    onCancel?: () => void;
  }) => {
    // CRITICAL: RBM compliance requires justification to always be mandatory
    const isRequired = true; // Force required for all RBM justification dialogs
    
    setDialogState({
      isOpen: true,
      actionId: options.actionId,
      actionLabel: options.actionLabel,
      recordDisplay: options.recordDisplay,
      recordCount: options.recordCount,
      required: isRequired, // Always true for RBM compliance
      placeholder: options.placeholder || 'Please provide justification for this action (required for audit compliance)...',
      onSubmit: (justification: string) => {
        // CRITICAL: Validation happens in dialog component using RBM compliance checker
        // Pass justification directly to action executor
        options.onSubmit(justification);
        setDialogState(null); // Clear state immediately after submit
      },
      onCancel: () => {
        options.onCancel?.();
        setDialogState(null); // Clear state immediately after cancel
      }
    });
  }, []);
  
  const hideJustificationDialog = useCallback(() => {
    // CRITICAL: Clear all justification data from memory
    setDialogState(null);
  }, []);
  
  return {
    dialogState,
    showJustificationDialog,
    hideJustificationDialog
  };
}