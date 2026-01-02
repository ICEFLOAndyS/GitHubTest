/**
 * RBM Focus Management Hook
 * 
 * Provides focus management for side panel navigation with accessibility compliance
 */

import { useRef, useCallback } from 'react';

export interface FocusManagerState {
  /** Store the currently focused element */
  storeFocus: () => void;
  /** Restore focus to the previously stored element */
  restoreFocus: () => void;
  /** Check if focus can be restored */
  canRestoreFocus: () => boolean;
  /** Clear stored focus reference */
  clearFocus: () => void;
}

export function useFocusManagement(): FocusManagerState {
  const storedFocusRef = useRef<HTMLElement | null>(null);
  
  /**
   * Store the currently focused element before opening side panel
   */
  const storeFocus = useCallback(() => {
    const activeElement = document.activeElement as HTMLElement;
    
    // Only store if it's a focusable element within our component
    if (activeElement && 
        (activeElement.tagName === 'BUTTON' || 
         activeElement.tagName === 'A' ||
         activeElement.hasAttribute('tabindex') ||
         activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'SELECT' ||
         activeElement.tagName === 'TEXTAREA')) {
      storedFocusRef.current = activeElement;
      console.log('Focus stored:', activeElement);
    } else {
      storedFocusRef.current = null;
    }
  }, []);
  
  /**
   * Restore focus to the previously stored element
   */
  const restoreFocus = useCallback(() => {
    if (storedFocusRef.current) {
      try {
        // Check if element is still in DOM and focusable
        if (document.contains(storedFocusRef.current)) {
          storedFocusRef.current.focus();
          console.log('Focus restored to:', storedFocusRef.current);
        } else {
          console.warn('Stored focus element no longer exists in DOM');
        }
      } catch (error) {
        console.warn('Failed to restore focus:', error);
      } finally {
        storedFocusRef.current = null;
      }
    }
  }, []);
  
  /**
   * Check if focus can be restored
   */
  const canRestoreFocus = useCallback(() => {
    return storedFocusRef.current !== null && 
           document.contains(storedFocusRef.current);
  }, []);
  
  /**
   * Clear stored focus reference without restoring
   */
  const clearFocus = useCallback(() => {
    storedFocusRef.current = null;
  }, []);
  
  return {
    storeFocus,
    restoreFocus,
    canRestoreFocus,
    clearFocus
  };
}