import { useCallback, useRef, useEffect, useState } from 'react';
import React from 'react';

/**
 * WCAG 2.1 AA Focus Management Hook
 * 
 * Manages focus for:
 * - Tab order between UI sections
 * - Focus trapping in modals/dialogs
 * - Focus restoration after modal close
 * - Visible focus indicators
 * - Skip links navigation
 */

export interface FocusZone {
  id: string;
  label: string;
  selector: string;
  skipToSelector?: string;
}

export interface FocusManagementConfig {
  focusZones: FocusZone[];
  skipLinks?: boolean;
  trapFocus?: boolean;
}

export function useFocusManagement(config: FocusManagementConfig = { focusZones: [] }) {
  const { focusZones, skipLinks = true, trapFocus = false } = config;
  
  const [currentZoneIndex, setCurrentZoneIndex] = useState(-1);
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /**
   * Store current focus for later restoration
   */
  const storeFocus = useCallback(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  /**
   * Restore previously stored focus
   */
  const restoreFocus = useCallback(() => {
    if (restoreFocusRef.current) {
      restoreFocusRef.current.focus();
      restoreFocusRef.current = null;
    }
  }, []);

  /**
   * Clear stored focus reference
   */
  const clearFocus = useCallback(() => {
    restoreFocusRef.current = null;
  }, []);

  /**
   * Focus the first focusable element in a zone
   */
  const focusZone = useCallback((zoneIndex: number) => {
    if (zoneIndex < 0 || zoneIndex >= focusZones.length) return false;
    
    const zone = focusZones[zoneIndex];
    const element = document.querySelector(zone.selector) as HTMLElement;
    
    if (element) {
      element.focus();
      setCurrentZoneIndex(zoneIndex);
      return true;
    }
    
    return false;
  }, [focusZones]);

  /**
   * Focus the next available zone
   */
  const focusNextZone = useCallback(() => {
    for (let i = currentZoneIndex + 1; i < focusZones.length; i++) {
      if (focusZone(i)) {
        return true;
      }
    }
    
    // If we can't find a next zone, try from the beginning
    for (let i = 0; i <= currentZoneIndex; i++) {
      if (focusZone(i)) {
        return true;
      }
    }
    
    return false;
  }, [currentZoneIndex, focusZones, focusZone]);

  /**
   * Focus the previous available zone
   */
  const focusPreviousZone = useCallback(() => {
    for (let i = currentZoneIndex - 1; i >= 0; i--) {
      if (focusZone(i)) {
        return true;
      }
    }
    
    // If we can't find a previous zone, try from the end
    for (let i = focusZones.length - 1; i >= currentZoneIndex; i--) {
      if (focusZone(i)) {
        return true;
      }
    }
    
    return false;
  }, [currentZoneIndex, focusZones, focusZone]);

  /**
   * Get all focusable elements within a container
   */
  const getFocusableElements = useCallback((container: HTMLElement): HTMLElement[] => {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]',
      '[role="button"]',
      '[role="link"]',
      '[role="menuitem"]',
      '[role="option"]',
      '[role="tab"]'
    ].join(',');

    return Array.from(container.querySelectorAll(focusableSelectors)).filter(
      (el) => {
        const element = el as HTMLElement;
        return element.offsetParent !== null && // Element is visible
               !element.hasAttribute('aria-hidden') &&
               element.getAttribute('aria-hidden') !== 'true';
      }
    ) as HTMLElement[];
  }, []);

  /**
   * Handle keyboard navigation between zones
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Track focus visibility (keyboard navigation)
    setIsFocusVisible(true);

    // Handle zone navigation with Ctrl+Arrow keys
    if (event.ctrlKey) {
      switch (event.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          event.preventDefault();
          focusNextZone();
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          event.preventDefault();
          focusPreviousZone();
          break;
      }
      return;
    }

    // Handle focus trapping if enabled
    if (trapFocus && containerRef.current) {
      const focusableElements = getFocusableElements(containerRef.current);
      
      if (focusableElements.length === 0) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          // Shift+Tab: move to previous element
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: move to next element
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  }, [trapFocus, focusNextZone, focusPreviousZone, getFocusableElements]);

  /**
   * Handle mouse interactions (hide focus visibility)
   */
  const handleMouseDown = useCallback(() => {
    setIsFocusVisible(false);
  }, []);

  /**
   * Skip to a specific zone using skip links
   */
  const skipToZone = useCallback((zoneId: string) => {
    const zone = focusZones.find(z => z.id === zoneId);
    if (zone) {
      const targetSelector = zone.skipToSelector || zone.selector;
      const element = document.querySelector(targetSelector) as HTMLElement;
      if (element) {
        element.focus();
        // Scroll element into view
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [focusZones]);

  /**
   * Create skip links for accessibility
   */
  const createSkipLinks = useCallback((): React.ReactNode => {
    if (!skipLinks || focusZones.length === 0) return null;

    return (
      <div className="rbm-skip-links" role="navigation" aria-label="Skip links">
        {focusZones.map((zone) => (
          <button
            key={zone.id}
            className="rbm-skip-link"
            onClick={() => skipToZone(zone.id)}
            onFocus={() => setIsFocusVisible(true)}
          >
            Skip to {zone.label}
          </button>
        ))}
      </div>
    );
  }, [skipLinks, focusZones, skipToZone, setIsFocusVisible]);

  /**
   * Focus the first zone on mount (if zones are available)
   */
  useEffect(() => {
    if (focusZones.length > 0 && currentZoneIndex === -1) {
      focusZone(0);
    }
  }, [focusZones, currentZoneIndex, focusZone]);

  /**
   * Add global mouse listener to track focus visibility
   */
  useEffect(() => {
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [handleMouseDown]);

  return {
    containerRef,
    currentZoneIndex,
    isFocusVisible,
    storeFocus,
    restoreFocus,
    clearFocus,
    focusZone,
    focusNextZone,
    focusPreviousZone,
    handleKeyDown,
    skipToZone,
    createSkipLinks,
    getFocusableElements
  };
}