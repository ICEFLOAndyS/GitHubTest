/**
 * RBM Record List Bulk Actions Example
 * 
 * Demonstrates bulk selection and bulk actions with proper
 * confirmation dialogs, error handling, and server-side operations.
 */

import React, { useState } from 'react';
import { RbmRecordList } from '../components/rbm-record-list';
import { useRecordListDataProvider, useRecordListConfig } from '../hooks/useRecordList';
import { ColumnDef, FilterDef, ActionDef, BulkActionDef } from '../components/rbm-record-list/types';

export const BulkActionsExample: React.FC = () => {
    const [operationStatus, setOperationStatus] = useState<string>('');
    
    // Create data provider with context
    const dataProvider = useRecordListDataProvider('incident.active', 'bulk_management');
    
    // Create configuration optimized for bulk operations
    const config = useRecordListConfig('incident.active', {
        enableSearch: true,
        defaultPageSize: 25, // Smaller pages for better bulk selection UX
        pageSizeOptions: [10, 25, 50]
    });
    
    // Simplified columns for bulk operations demo
    const columns: ColumnDef[] = [
        {
            field: 'number',
            label: 'Number',
            width: 120,
            priority: 1,
            sortable: true,
            rendererKey: 'link'
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
            field: 'priority',
            label: 'Priority',
            width: 80,
            priority: 2,
            rendererKey: 'priority'
        }
    ];
    
    // Basic filters for demo
    const filters: FilterDef[] = [
        {
            field: 'state',
            uiType: 'select',
            operators: ['=', '!='],
            config: {
                label: 'State',
                options: [
                    { value: '1', label: 'New' },
                    { value: '2', label: 'In Progress' },
                    { value: '6', label: 'Resolved' }
                ]
            }
        }
    ];
    
    // Row actions
    const actions: ActionDef[] = [
        {
            id: 'view',
            label: 'View',
            iconKey: 'eye',
            category: 'primary'
        }
    ];
    
    // Comprehensive bulk actions demonstrating different patterns
    const bulkActions: BulkActionDef[] = [
        // Low-risk action - no confirmation needed
        {
            id: 'bulk_activate',
            label: 'Activate Selected',
            iconKey: 'play-circle',
            maxSelection: 100,
            requiresConfirm: false,
            serverActionId: 'bulk_activate',
            accessibility: {
                ariaLabel: 'Activate all selected incidents'
            }
        },
        
        // Medium-risk action - confirmation required
        {
            id: 'bulk_assign',
            label: 'Bulk Assign',
            iconKey: 'user-plus',
            maxSelection: 50,
            requiresConfirm: true,
            confirm: {
                title: 'Bulk Assignment',
                messageTemplate: (count) => `Assign ${count} selected incidents to a user? You will be able to choose the assignee in the next step.`,
                confirmText: 'Continue',
                cancelText: 'Cancel'
            },
            serverActionId: 'bulk_assign',
            accessibility: {
                ariaLabel: 'Assign selected incidents to a user'
            }
        },
        
        // High-risk action - lower cap, strong confirmation
        {
            id: 'bulk_delete',
            label: 'Delete Selected',
            iconKey: 'trash',
            maxSelection: 10, // Very low limit for destructive action
            requiresConfirm: true,
            confirm: {
                title: 'Delete Incidents',
                messageTemplate: (count) => `⚠️ Delete ${count} selected incidents?\n\nThis action is PERMANENT and cannot be undone. All related data, attachments, and history will be lost.`,
                confirmText: 'DELETE PERMANENTLY',
                cancelText: 'Cancel'
            },
            serverActionId: 'bulk_delete',
            accessibility: {
                ariaLabel: 'Permanently delete selected incidents'
            }
        },
        
        // Conditional bulk action
        {
            id: 'bulk_resolve',
            label: 'Resolve Selected',
            iconKey: 'check-circle',
            maxSelection: 75,
            requiresConfirm: true,
            confirm: {
                title: 'Bulk Resolve',
                messageTemplate: (count) => `Mark ${count} selected incidents as resolved?`,
                confirmText: 'Resolve All',
                cancelText: 'Cancel'
            },
            serverActionId: 'bulk_resolve',
            conditions: {
                available: (records) => {
                    // Only available if all selected incidents can be resolved
                    return records.every(record => {
                        const state = typeof record.state === 'object' ? record.state.value : record.state;
                        return ['1', '2', '3'].includes(state); // New, In Progress, On Hold
                    });
                }
            },
            accessibility: {
                ariaLabel: 'Resolve all selected incidents'
            }
        }
    ];
    
    // Event handlers with comprehensive logging
    const handleOpenRecord = (record) => {
        console.log('Open record:', record);
        setOperationStatus(`Opened record: ${record.number?.display_value || record.sys_id}`);
    };
    
    const handleActionInvoked = (actionId, recordOrRecords, success, error) => {
        if (success) {
            if (Array.isArray(recordOrRecords)) {
                // Bulk action success
                const message = `Bulk action "${actionId}" completed successfully on ${recordOrRecords.length} records`;
                console.log(message);
                setOperationStatus(message);
            } else {
                // Row action success
                const message = `Row action "${actionId}" completed successfully`;
                console.log(message);
                setOperationStatus(message);
            }
        } else {
            if (Array.isArray(recordOrRecords)) {
                // Bulk action failure
                const message = `Bulk action "${actionId}" failed on ${recordOrRecords.length} records: ${error}`;
                console.error(message);
                setOperationStatus(message);
            } else {
                // Row action failure
                const message = `Row action "${actionId}" failed: ${error}`;
                console.error(message);
                setOperationStatus(message);
            }
        }
    };
    
    const handleSelectionChange = (selected) => {
        console.log(`Selection changed: ${selected.length} records selected`);
        setOperationStatus(`${selected.length} records selected`);
    };
    
    return (
        <div className="bulk-actions-example">
            <header className="bulk-actions-example__header">
                <h1>Bulk Actions Example</h1>
                <p>Demonstrates multi-select functionality with various bulk action patterns:</p>
                <ul>
                    <li><strong>No Confirmation</strong>: Bulk Activate (safe operation)</li>
                    <li><strong>Standard Confirmation</strong>: Bulk Assign (workflow operation)</li>
                    <li><strong>Strong Confirmation</strong>: Bulk Delete (destructive operation)</li>
                    <li><strong>Conditional Action</strong>: Bulk Resolve (state-dependent)</li>
                </ul>
                
                {operationStatus && (
                    <div className="operation-status">
                        <strong>Status:</strong> {operationStatus}
                    </div>
                )}
            </header>
            
            <RbmRecordList
                listKey="incident.active"
                columns={columns}
                filters={filters}
                defaultSort={{ field: 'sys_created_on', direction: 'desc' }}
                selectionMode="multiple"
                actions={actions}
                bulkActions={bulkActions}
                dataProvider={dataProvider}
                onOpenRecord={handleOpenRecord}
                onActionInvoked={handleActionInvoked}
                density="comfortable"
                config={{
                    ...config,
                    onSelectionChange: handleSelectionChange
                }}
                a11y={{
                    ariaLabel: "Bulk Actions Example - Incident Management",
                    descriptions: {
                        tableDescription: "Example incident list demonstrating bulk selection and actions",
                        filtersDescription: "Filter incidents to find specific records for bulk operations",
                        paginationDescription: "Navigate between pages while maintaining selection state"
                    }
                }}
                className="bulk-actions-example__list"
                testIds={{
                    container: 'bulk-example',
                    table: 'bulk-table',
                    filters: 'bulk-filters',
                    pagination: 'bulk-pagination',
                    actions: 'bulk-actions'
                }}
            />
        </div>
    );
};

export default BulkActionsExample;