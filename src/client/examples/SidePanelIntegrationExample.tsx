/**
 * RBM Record List with Side Panel Integration Example
 * 
 * Demonstrates the complete list → side panel navigation pattern with:
 * - Proper RecordRef navigation contract
 * - Focus management and restoration
 * - Multiple navigation triggers (double-click, Enter, action)
 * - Keyboard accessibility compliance
 */

import React, { useState, useCallback } from 'react';
import { RbmRecordList } from '../components/rbm-record-list';
import { useRecordListDataProvider, useRecordListConfig } from '../hooks/useRecordList';
import { ColumnDef, ActionDef, RecordRef } from '../components/rbm-record-list/types';
import './SidePanelIntegrationExample.css';

/**
 * Mock Side Panel Component for demonstration
 */
const MockSidePanel: React.FC<{
  recordRef: RecordRef | null;
  onClose: () => void;
  isOpen: boolean;
}> = ({ recordRef, onClose, isOpen }) => {
  
  // Handle Escape key to close panel
  React.useEffect(() => {
    if (!isOpen) return;
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);
  
  if (!isOpen || !recordRef) {
    return null;
  }
  
  return (
    <>
      {/* Backdrop */}
      <div className="side-panel-backdrop" onClick={onClose} />
      
      {/* Side Panel */}
      <div 
        className="side-panel"
        role="complementary"
        aria-label={`Details for ${recordRef.display}`}
        aria-modal="true"
      >
        <header className="side-panel__header">
          <h2 className="side-panel__title">
            {recordRef.display}
          </h2>
          <button
            type="button"
            className="side-panel__close"
            onClick={onClose}
            aria-label="Close panel"
          >
            ×
          </button>
        </header>
        
        <div className="side-panel__content">
          <p><strong>Sys ID:</strong> {recordRef.sys_id}</p>
          <p><strong>Type:</strong> {recordRef.objectType}</p>
          <p><strong>Display:</strong> {recordRef.display}</p>
          
          <div className="side-panel__actions">
            <button className="rbm-button rbm-button--primary">
              Edit Record
            </button>
            <button className="rbm-button rbm-button--secondary">
              View History
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

/**
 * Main Example Component
 */
export const SidePanelIntegrationExample: React.FC = () => {
    // Side panel state
    const [sidePanelOpen, setSidePanelOpen] = useState(false);
    const [currentRecordRef, setCurrentRecordRef] = useState<RecordRef | null>(null);
    const [focusRestoreFn, setFocusRestoreFn] = useState<(() => void) | null>(null);
    
    // Create data provider with context
    const dataProvider = useRecordListDataProvider('incident.active', 'side_panel_demo');
    
    // Create configuration with focus restore callback
    const config = useRecordListConfig('incident.active', {
        enableSearch: true,
        enableColumnResize: true,
        defaultPageSize: 25,
        onFocusRestore: (restoreFn) => {
            setFocusRestoreFn(() => restoreFn); // Store for later use
        }
    });
    
    // Columns for side panel demo
    const columns: ColumnDef[] = [
        {
            field: 'number',
            label: 'Incident',
            width: 120,
            priority: 1,
            sortable: true,
            rendererKey: 'link',
            metadata: {
                accessibility: {
                    cellAriaLabel: 'Double-click or press Enter to open incident details'
                }
            }
        },
        {
            field: 'short_description',
            label: 'Description',
            width: 'auto',
            priority: 1,
            rendererKey: 'text'
        },
        {
            field: 'state',
            label: 'State',
            width: 100,
            priority: 2,
            sortable: true,
            rendererKey: 'choice'
        },
        {
            field: 'assigned_to',
            label: 'Assigned',
            width: 150,
            priority: 3,
            rendererKey: 'reference'
        }
    ];
    
    // Actions including explicit "open" action
    const actions: ActionDef[] = [
        {
            id: 'open', // Default navigation action
            label: 'Open Details',
            iconKey: 'external-link',
            category: 'primary',
            accessibility: {
                ariaLabel: 'Open incident details in side panel'
            }
        },
        {
            id: 'edit',
            label: 'Edit',
            iconKey: 'edit',
            category: 'secondary',
            accessibility: {
                ariaLabel: 'Edit incident'
            }
        }
    ];
    
    /**
     * Handle record navigation - implements the navigation contract
     */
    const handleOpenRecord = useCallback((recordRef: RecordRef) => {
        console.log('Navigation triggered:', recordRef);
        
        // Set current record and open panel
        setCurrentRecordRef(recordRef);
        setSidePanelOpen(true);
        
        // Log for debugging
        console.log(`Side panel opened for ${recordRef.objectType}: ${recordRef.display} (${recordRef.sys_id})`);
    }, []);
    
    /**
     * Handle side panel close with focus restoration
     */
    const handleCloseSidePanel = useCallback(() => {
        console.log('Closing side panel');
        
        // Close panel
        setSidePanelOpen(false);
        setCurrentRecordRef(null);
        
        // Restore focus to invoking element
        if (focusRestoreFn) {
            // Small delay to ensure panel is fully closed before focus restoration
            setTimeout(() => {
                focusRestoreFn();
                console.log('Focus restored to record list');
            }, 100);
        }
    }, [focusRestoreFn]);
    
    /**
     * Handle action completion events
     */
    const handleActionInvoked = useCallback((actionId, recordOrRecords, success, error) => {
        if (success) {
            console.log(`Action ${actionId} completed successfully`);
        } else {
            console.error(`Action ${actionId} failed:`, error);
        }
    }, []);
    
    return (
        <div className="side-panel-integration-example">
            <header className="example-header">
                <h1>Side Panel Integration Example</h1>
                <p>
                    This example demonstrates the proper navigation contract between 
                    the record list and side panel components.
                </p>
                <div className="navigation-triggers">
                    <h3>Navigation Triggers:</h3>
                    <ul>
                        <li><strong>Double-click</strong> any row to open details</li>
                        <li><strong>Press Enter</strong> on a focused row</li>
                        <li><strong>Select "Open Details"</strong> from row actions menu</li>
                        <li><strong>Press Escape</strong> in side panel to close and restore focus</li>
                    </ul>
                </div>
            </header>
            
            <div className="layout">
                <div className="layout__main">
                    <RbmRecordList
                        listKey="incident.active"
                        columns={columns}
                        defaultSort={{ field: 'sys_created_on', direction: 'desc' }}
                        selectionMode="single"
                        actions={actions}
                        dataProvider={dataProvider}
                        onOpenRecord={handleOpenRecord} // Navigation contract implementation
                        onActionInvoked={handleActionInvoked}
                        density="comfortable"
                        config={config}
                        a11y={{
                            ariaLabel: "Incident List with Side Panel Navigation",
                            descriptions: {
                                tableDescription: "List of incidents. Double-click, press Enter, or use Open action to view details in side panel",
                                filtersDescription: "Filter incidents before opening details",
                                paginationDescription: "Navigate pages while maintaining focus context"
                            },
                            keyboardShortcuts: {
                                enableKeyboardNav: true,
                                customShortcuts: [
                                    {
                                        keys: ['Enter'],
                                        description: 'Open selected record in side panel',
                                        handler: () => {} // Handled by component
                                    },
                                    {
                                        keys: ['Escape'],
                                        description: 'Close side panel if open',
                                        handler: () => {
                                            if (sidePanelOpen) {
                                                handleCloseSidePanel();
                                            }
                                        }
                                    }
                                ]
                            }
                        }}
                        className="side-panel-integration__list"
                        testIds={{
                            container: 'incident-list-with-panel',
                            table: 'incident-table',
                            filters: 'incident-filters',
                            pagination: 'incident-pagination'
                        }}
                    />
                </div>
                
                <div className="layout__panel">
                    <MockSidePanel
                        recordRef={currentRecordRef}
                        onClose={handleCloseSidePanel}
                        isOpen={sidePanelOpen}
                    />
                </div>
            </div>
            
            {/* Current Status Display */}
            {currentRecordRef && sidePanelOpen && (
                <div className="current-status" role="status" aria-live="polite">
                    Currently viewing: <strong>{currentRecordRef.display}</strong>
                    <br />
                    <small>
                        Type: {currentRecordRef.objectType} | 
                        ID: {currentRecordRef.sys_id}
                    </small>
                </div>
            )}
        </div>
    );
};

export default SidePanelIntegrationExample;