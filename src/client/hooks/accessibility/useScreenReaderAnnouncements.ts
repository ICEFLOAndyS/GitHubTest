import { useCallback, useRef, useEffect } from 'react';
import React from 'react';

/**
 * WCAG 2.1 AA Screen Reader Announcements Hook
 * 
 * Provides proper screen reader announcements for:
 * - Selection state changes
 * - Action results
 * - Error states
 * - Loading states
 * - Navigation changes
 */

export interface AnnouncementOptions {
  priority?: 'polite' | 'assertive';
  delay?: number;
  clearAfter?: number;
}

export function useScreenReaderAnnouncements() {
  const politeAnnouncementRef = useRef<HTMLDivElement>(null);
  const assertiveAnnouncementRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Clear any pending announcement timeouts
   */
  const clearPendingTimeouts = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  /**
   * Make an announcement to screen readers
   */
  const announce = useCallback((
    message: string, 
    options: AnnouncementOptions = {}
  ) => {
    const { priority = 'polite', delay = 0, clearAfter = 1000 } = options;
    
    const targetRef = priority === 'assertive' ? assertiveAnnouncementRef : politeAnnouncementRef;
    
    if (!targetRef.current) {
      console.warn('Screen reader announcement region not available');
      return;
    }

    // Clear any pending announcements
    clearPendingTimeouts();

    const makeAnnouncement = () => {
      if (targetRef.current) {
        targetRef.current.textContent = message;
        
        if (clearAfter > 0) {
          timeoutRef.current = setTimeout(() => {
            if (targetRef.current) {
              targetRef.current.textContent = '';
            }
            timeoutRef.current = null;
          }, clearAfter);
        }
      }
    };

    if (delay > 0) {
      timeoutRef.current = setTimeout(makeAnnouncement, delay);
    } else {
      makeAnnouncement();
    }
  }, [clearPendingTimeouts]);

  /**
   * Announce selection state changes
   */
  const announceSelection = useCallback((
    selectedCount: number, 
    totalCount: number, 
    recordType = 'records'
  ) => {
    let message = '';
    
    if (selectedCount === 0) {
      message = `No ${recordType} selected`;
    } else if (selectedCount === 1) {
      message = `1 ${recordType.slice(0, -1)} selected`;
    } else if (selectedCount === totalCount) {
      message = `All ${selectedCount} ${recordType} selected`;
    } else {
      message = `${selectedCount} of ${totalCount} ${recordType} selected`;
    }
    
    announce(message);
  }, [announce]);

  /**
   * Announce loading states
   */
  const announceLoading = useCallback((isLoading: boolean, context = 'data') => {
    if (isLoading) {
      announce(`Loading ${context}...`, { priority: 'polite' });
    } else {
      announce(`${context} loaded`, { priority: 'polite' });
    }
  }, [announce]);

  /**
   * Announce action results
   */
  const announceActionResult = useCallback((
    success: boolean, 
    action: string, 
    context?: string
  ) => {
    const message = success 
      ? `${action} completed successfully${context ? ` for ${context}` : ''}`
      : `${action} failed${context ? ` for ${context}` : ''}`;
    
    announce(message, { priority: success ? 'polite' : 'assertive' });
  }, [announce]);

  /**
   * Announce error states
   */
  const announceError = useCallback((errorMessage: string) => {
    announce(`Error: ${errorMessage}`, { priority: 'assertive' });
  }, [announce]);

  /**
   * Announce filter or search changes
   */
  const announceDataChange = useCallback((
    resultCount: number, 
    context: string,
    recordType = 'records'
  ) => {
    const message = resultCount === 0 
      ? `No ${recordType} found for ${context}`
      : `${resultCount} ${resultCount === 1 ? recordType.slice(0, -1) : recordType} found for ${context}`;
    
    announce(message, { delay: 300 }); // Small delay to avoid interrupting typing
  }, [announce]);

  /**
   * Announce pagination changes
   */
  const announcePagination = useCallback((
    currentPage: number, 
    totalPages: number, 
    recordsShown: number,
    totalRecords?: number
  ) => {
    let message = `Page ${currentPage} of ${totalPages}, showing ${recordsShown} records`;
    
    if (totalRecords !== undefined && totalRecords > recordsShown) {
      message += ` of ${totalRecords} total`;
    }
    
    announce(message);
  }, [announce]);

  /**
   * Announce bulk action states
   */
  const announceBulkAction = useCallback((
    actionName: string, 
    recordCount: number, 
    isStarting: boolean
  ) => {
    const message = isStarting
      ? `Starting ${actionName} for ${recordCount} records`
      : `${actionName} completed for ${recordCount} records`;
    
    announce(message, { priority: isStarting ? 'polite' : 'assertive' });
  }, [announce]);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      clearPendingTimeouts();
    };
  }, [clearPendingTimeouts]);

  /**
   * Create the announcement regions for screen readers
   */
  const createAnnouncementRegions = useCallback((): React.ReactNode => {
    return (
      <React.Fragment>
        <div
          ref={politeAnnouncementRef}
          aria-live="polite"
          aria-atomic="true"
          className="rbm-sr-only"
          data-testid="polite-announcements"
        />
        <div
          ref={assertiveAnnouncementRef}
          aria-live="assertive"
          aria-atomic="true"
          className="rbm-sr-only"
          data-testid="assertive-announcements"
        />
      </React.Fragment>
    );
  }, []);

  return {
    announce,
    announceSelection,
    announceLoading,
    announceActionResult,
    announceError,
    announceDataChange,
    announcePagination,
    announceBulkAction,
    createAnnouncementRegions
  };
}