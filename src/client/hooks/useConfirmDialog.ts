/**
 * RBM Confirmation Dialog Hook
 * 
 * Provides RBM-compliant confirmation dialog functionality
 */

import { useState, useCallback } from 'react';

export interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  message: string;
  primaryLabel: string;
  secondaryLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState | null>(null);
  
  const showConfirm = useCallback((options: {
    title: string;
    message: string;
    primaryLabel?: string;
    secondaryLabel?: string;
    onConfirm: () => void;
    onCancel?: () => void;
  }) => {
    setDialogState({
      isOpen: true,
      title: options.title,
      message: options.message,
      primaryLabel: options.primaryLabel || 'Confirm',
      secondaryLabel: options.secondaryLabel || 'Cancel',
      onConfirm: () => {
        options.onConfirm();
        setDialogState(null);
      },
      onCancel: () => {
        options.onCancel?.();
        setDialogState(null);
      }
    });
  }, []);
  
  const hideConfirm = useCallback(() => {
    setDialogState(null);
  }, []);
  
  return {
    dialogState,
    showConfirm,
    hideConfirm
  };
}