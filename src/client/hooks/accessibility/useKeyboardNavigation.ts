import { useCallback, useRef, useState, useEffect } from 'react';

/**
 * WCAG 2.1 AA Keyboard Navigation Hook
 * 
 * Provides comprehensive keyboard navigation for data grids according to WCAG guidelines:
 * - Tab: Navigate between major UI sections (filters → grid → pagination → bulk actions)
 * - Arrow keys: Navigate within grid (row/cell navigation)
 * - Space: Toggle selection in multi-select mode
 * - Enter: Activate default action or open record
 * - Escape: Close menus, dialogs, and exit modes
 */

export interface KeyboardNavigationConfig {
  gridId: string;
  rowCount: number;
  columnCount: number;
  selectionMode: 'none' | 'single' | 'multiple';
  hasActions: boolean;
  onRowSelect?: (rowIndex: number) => void;
  onRowActivate?: (rowIndex: number) => void;
  onSelectionToggle?: (rowIndex: number) => void;
  onEscape?: () => void;
}

export interface KeyboardNavigationState {
  focusedRowIndex: number;
  focusedColumnIndex: number;
  isInGrid: boolean;
  currentFocusZone: 'filters' | 'grid' | 'pagination' | 'bulk-actions' | null;
}

export function useKeyboardNavigation(config: KeyboardNavigationConfig) {
  const {
    gridId,
    rowCount,
    columnCount,
    selectionMode,
    hasActions,
    onRowSelect,
    onRowActivate,
    onSelectionToggle,
    onEscape
  } = config;

  const [navigationState, setNavigationState] = useState<KeyboardNavigationState>({
    focusedRowIndex: -1,
    focusedColumnIndex: -1,
    isInGrid: false,
    currentFocusZone: null
  });

  const gridRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  /**
   * Announce changes to screen readers
   */
  const announceToScreenReader = useCallback((message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      // Clear after announcement to avoid repetition
      setTimeout(() => {
        if (announcementRef.current) {
          announcementRef.current.textContent = '';
        }
      }, 1000);
    }
  }, []);

  /**
   * Get the DOM element for a specific grid cell
   */
  const getCellElement = useCallback((rowIndex: number, columnIndex: number): HTMLElement | null => {
    if (!gridRef.current) return null;
    
    const cellSelector = `[role="gridcell"][data-row-index="${rowIndex}"][data-column-index="${columnIndex}"]`;
    return gridRef.current.querySelector(cellSelector);
  }, []);

  /**
   * Get the DOM element for a specific grid row
   */
  const getRowElement = useCallback((rowIndex: number): HTMLElement | null => {
    if (!gridRef.current) return null;
    
    const rowSelector = `[role="row"][data-row-index="${rowIndex}"]`;
    return gridRef.current.querySelector(rowSelector);
  }, []);

  /**
   * Focus a specific cell in the grid
   */
  const focusCell = useCallback((rowIndex: number, columnIndex: number) => {
    const cellElement = getCellElement(rowIndex, columnIndex);
    if (cellElement) {
      cellElement.focus();
      setNavigationState(prev => ({
        ...prev,
        focusedRowIndex: rowIndex,
        focusedColumnIndex: columnIndex,
        isInGrid: true,
        currentFocusZone: 'grid'
      }));

      // Announce current position
      announceToScreenReader(`Row ${rowIndex + 1}, Column ${columnIndex + 1} of ${columnCount}`);
    }
  }, [getCellElement, columnCount, announceToScreenReader]);

  /**
   * Focus a specific row (for row-level navigation)
   */
  const focusRow = useCallback((rowIndex: number) => {
    const rowElement = getRowElement(rowIndex);
    if (rowElement) {
      rowElement.focus();
      setNavigationState(prev => ({
        ...prev,
        focusedRowIndex: rowIndex,
        focusedColumnIndex: 0,
        isInGrid: true,
        currentFocusZone: 'grid'
      }));

      // Announce current row
      announceToScreenReader(`Row ${rowIndex + 1} of ${rowCount}`);
    }
  }, [getRowElement, rowCount, announceToScreenReader]);

  /**
   * Handle arrow key navigation within the grid
   */
  const handleArrowNavigation = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    const { focusedRowIndex, focusedColumnIndex } = navigationState;
    
    let newRowIndex = focusedRowIndex;
    let newColumnIndex = focusedColumnIndex;

    switch (direction) {
      case 'up':
        newRowIndex = Math.max(0, focusedRowIndex - 1);
        break;
      case 'down':
        newRowIndex = Math.min(rowCount - 1, focusedRowIndex + 1);
        break;
      case 'left':
        newColumnIndex = Math.max(0, focusedColumnIndex - 1);
        break;
      case 'right':
        newColumnIndex = Math.min(columnCount - 1, focusedColumnIndex + 1);
        break;
    }

    // Only move if the new position is different
    if (newRowIndex !== focusedRowIndex || newColumnIndex !== focusedColumnIndex) {
      focusCell(newRowIndex, newColumnIndex);
    }
  }, [navigationState, rowCount, columnCount, focusCell]);

  /**
   * Handle space key for selection toggle
   */
  const handleSpaceKey = useCallback(() => {
    if (selectionMode === 'multiple' && navigationState.focusedRowIndex >= 0) {
      onSelectionToggle?.(navigationState.focusedRowIndex);
      announceToScreenReader(`Row ${navigationState.focusedRowIndex + 1} selection toggled`);
    }
  }, [selectionMode, navigationState.focusedRowIndex, onSelectionToggle, announceToScreenReader]);

  /**
   * Handle enter key for row activation
   */
  const handleEnterKey = useCallback(() => {
    if (navigationState.focusedRowIndex >= 0) {
      onRowActivate?.(navigationState.focusedRowIndex);
      announceToScreenReader(`Activated row ${navigationState.focusedRowIndex + 1}`);
    }
  }, [navigationState.focusedRowIndex, onRowActivate, announceToScreenReader]);

  /**
   * Handle escape key
   */
  const handleEscapeKey = useCallback(() => {
    onEscape?.();
    
    // Reset navigation state
    setNavigationState(prev => ({
      ...prev,
      isInGrid: false,
      currentFocusZone: null
    }));
    
    announceToScreenReader('Exited grid navigation');
  }, [onEscape, announceToScreenReader]);

  /**
   * Main keyboard event handler
   */
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    // Only handle navigation when in grid
    if (!navigationState.isInGrid && event.currentTarget.closest(`#${gridId}`)) {
      return;
    }

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        handleArrowNavigation('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        handleArrowNavigation('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        handleArrowNavigation('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        handleArrowNavigation('right');
        break;
      case ' ':
        event.preventDefault();
        handleSpaceKey();
        break;
      case 'Enter':
        event.preventDefault();
        handleEnterKey();
        break;
      case 'Escape':
        event.preventDefault();
        handleEscapeKey();
        break;
      case 'Home':
        event.preventDefault();
        if (event.ctrlKey) {
          // Ctrl+Home: Go to first row, first column
          focusCell(0, 0);
        } else {
          // Home: Go to first column of current row
          focusCell(navigationState.focusedRowIndex, 0);
        }
        break;
      case 'End':
        event.preventDefault();
        if (event.ctrlKey) {
          // Ctrl+End: Go to last row, last column
          focusCell(rowCount - 1, columnCount - 1);
        } else {
          // End: Go to last column of current row
          focusCell(navigationState.focusedRowIndex, columnCount - 1);
        }
        break;
      case 'PageUp':
        event.preventDefault();
        // Move up 10 rows or to first row
        focusCell(Math.max(0, navigationState.focusedRowIndex - 10), navigationState.focusedColumnIndex);
        break;
      case 'PageDown':
        event.preventDefault();
        // Move down 10 rows or to last row
        focusCell(Math.min(rowCount - 1, navigationState.focusedRowIndex + 10), navigationState.focusedColumnIndex);
        break;
    }
  }, [
    navigationState,
    gridId,
    handleArrowNavigation,
    handleSpaceKey,
    handleEnterKey,
    handleEscapeKey,
    focusCell,
    rowCount,
    columnCount
  ]);

  /**
   * Enter grid navigation mode
   */
  const enterGridNavigation = useCallback((initialRowIndex = 0, initialColumnIndex = 0) => {
    focusCell(initialRowIndex, initialColumnIndex);
  }, [focusCell]);

  /**
   * Exit grid navigation mode
   */
  const exitGridNavigation = useCallback(() => {
    setNavigationState(prev => ({
      ...prev,
      isInGrid: false,
      currentFocusZone: null
    }));
  }, []);

  /**
   * Set current focus zone for tab order management
   */
  const setFocusZone = useCallback((zone: KeyboardNavigationState['currentFocusZone']) => {
    setNavigationState(prev => ({
      ...prev,
      currentFocusZone: zone
    }));
  }, []);

  /**
   * Get navigation instructions for screen readers
   */
  const getNavigationInstructions = useCallback(() => {
    const instructions = [
      'Use arrow keys to navigate between cells',
      'Press Enter to activate the current row',
    ];

    if (selectionMode === 'multiple') {
      instructions.push('Press Space to toggle row selection');
    }

    if (hasActions) {
      instructions.push('Press Tab to access row actions');
    }

    instructions.push('Press Escape to exit navigation mode');

    return instructions.join('. ');
  }, [selectionMode, hasActions]);

  return {
    navigationState,
    gridRef,
    announcementRef,
    handleKeyDown,
    enterGridNavigation,
    exitGridNavigation,
    focusCell,
    focusRow,
    setFocusZone,
    getNavigationInstructions,
    announceToScreenReader
  };
}