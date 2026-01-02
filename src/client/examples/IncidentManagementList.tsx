/**
 * RBM Record List Example - Incident Management
 * 
 * Demonstrates the fully wired rbm-record-list component with
 * server-side data operations, filtering, sorting, and pagination.
 */

import React from 'react';
import { RbmRecordList } from '../components/rbm-record-list';
import { useRecordListDataProvider, useRecordListConfig } from '../hooks/useRecordList';
import { ColumnDef, FilterDef, ActionDef, BulkActionDef } from '../components/rbm-record-list/types';

/**
 * Example: Incident Management List
 */
export const IncidentManagementList: React.FC = () => {
    // Create data provider instance with context
    const dataProvider = useRecordListDataProvider('incident.active', 'incident_list');
    
    // Create configuration
    const config = useRecordListConfig('incident.active', {
        enableSearch: true,
        enableColumnResize: true,
        defaultPageSize: 50
    });
    
    // Define columns for incident table
    const columns: ColumnDef[] = [
        {
            field: 'number',
            label: 'Number',
            width: 120,
            priority: 1,
            sortable: true,
            rendererKey: 'link', // RBM catalogue renderer for links
            metadata: {
                fieldType: 'string',
                accessibility: {
                    headerAriaLabel: 'Incident number',
                    cellAriaLabel: 'Incident number'
                }
            }
        },
        {
            field: 'short_description',
            label: 'Short Description',
            width: 'auto',
            priority: 1,
            sortable: true,
            rendererKey: 'text',
            metadata: {
                fieldType: 'string',
                accessibility: {
                    headerAriaLabel: 'Incident description'
                }
            }
        },
        {
            field: 'state',
            label: 'State',
            width: 100,
            priority: 2,
            sortable: true,
            rendererKey: 'choice',
            metadata: {
                fieldType: 'choice',
                serviceNowField: {
                    table: 'incident',
                    displayField: 'state'
                }
            }
        },
        {
            field: 'priority',
            label: 'Priority',
            width: 80,
            priority: 2,
            sortable: true,
            rendererKey: 'priority',
            metadata: {
                fieldType: 'choice'
            }
        },
        {
            field: 'assigned_to',
            label: 'Assigned to',
            width: 150,
            priority: 3,
            sortable: true,
            rendererKey: 'reference',
            metadata: {
                fieldType: 'reference',
                serviceNowField: {
                    table: 'sys_user',
                    displayField: 'name'
                }
            }
        },
        {
            field: 'sys_created_on',
            label: 'Created',
            width: 130,
            priority: 4,
            sortable: true,
            rendererKey: 'datetime',
            metadata: {
                fieldType: 'date'
            }
        }
    ];
    
    // Define filters
    const filters: FilterDef[] = [
        {
            field: 'state',
            uiType: 'select',
            operators: ['=', '!='],
            defaultValue: null,
            config: {
                label: 'State',
                options: [
                    { value: '1', label: 'New' },
                    { value: '2', label: 'In Progress' },
                    { value: '3', label: 'On Hold' },
                    { value: '6', label: 'Resolved' },
                    { value: '7', label: 'Closed' }
                ]
            }
        },
        {
            field: 'priority',
            uiType: 'select',
            operators: ['=', '!=', '<=', '>='],
            defaultValue: null,
            config: {
                label: 'Priority',
                options: [
                    { value: '1', label: 'Critical' },
                    { value: '2', label: 'High' },
                    { value: '3', label: 'Moderate' },
                    { value: '4', label: 'Low' },
                    { value: '5', label: 'Planning' }
                ]
            }
        },
        {
            field: 'assigned_to',
            uiType: 'select',
            operators: ['=', '!=', 'ISEMPTY', 'ISNOTEMPTY'],
            defaultValue: null,
            config: {
                label: 'Assigned to',
                placeholder: 'Select user...'
                // Could integrate with user picker
            }
        },
        {
            field: 'sys_created_on',
            uiType: 'daterange',
            operators: ['>=', '<=', 'BETWEEN', 'ON'],
            defaultValue: null,
            config: {
                label: 'Created date'
            }
        }
    ];
    
    // Define actions
    const actions: ActionDef[] = [
        {
            id: 'open',
            label: 'Open Details',
            iconKey: 'external-link',
            category: 'primary',
            accessibility: {
                ariaLabel: 'Open incident details'
            }
        },
        {
            id: 'view',
            label: 'View',
            iconKey: 'eye',
            category: 'primary',
            accessibility: {
                ariaLabel: 'View incident details'
            }
        },
        {
            id: 'edit',
            label: 'Edit',
            iconKey: 'edit',
            category: 'primary',
            conditions: {
                visible: (record) => true, // Could check permissions
                enabled: (record) => true
            },
            accessibility: {
                ariaLabel: 'Edit incident'
            }
        },
        {
            id: 'resolve_incident',
            label: 'Resolve',
            iconKey: 'check-circle',
            category: 'secondary',
            conditions: {
                visible: (record) => {
                    // Show only for active incidents
                    const state = typeof record.state === 'object' ? record.state.value : record.state;
                    return ['1', '2', '3'].includes(state); // New, In Progress, On Hold
                }
            }
        },
        {
            id: 'delete',
            label: 'Delete',
            iconKey: 'trash',
            category: 'destructive',
            confirm: {
                title: 'Delete Incident',
                message: 'Are you sure you want to delete this incident? This action cannot be undone.',
                confirmText: 'Delete',
                cancelText: 'Cancel'
            },
            accessibility: {
                ariaLabel: 'Delete incident'
            }
        }
    ];
    
    // Define bulk actions
    const bulkActions: BulkActionDef[] = [
        {
            id: 'bulk_assign',
            label: 'Assign Selected',
            iconKey: 'user-plus',
            maxSelection: 50,
            requiresConfirm: true,
            confirm: {
                title: 'Bulk Assignment',
                messageTemplate: (count) => `Assign ${count} selected incidents to a user?`,
                confirmText: 'Assign',
                cancelText: 'Cancel'
            },
            serverAction: {
                type: 'bulk_update',
                method: 'POST'
            },
            accessibility: {
                ariaLabel: 'Assign selected incidents to a user'
            }
        },
        {
            id: 'bulk_activate',
            label: 'Activate Selected',
            iconKey: 'play-circle',
            maxSelection: 100,
            requiresConfirm: false,
            serverAction: {
                type: 'bulk_update',
                method: 'PATCH'
            },
            accessibility: {
                ariaLabel: 'Activate selected incidents'
            }
        },
        {
            id: 'bulk_resolve',
            label: 'Resolve Selected',
            iconKey: 'check-circle',
            maxSelection: 75,
            requiresConfirm: true,
            confirm: {
                title: 'Bulk Resolve',
                messageTemplate: (count) => `Mark ${count} selected incidents as resolved? This will change their state to "Resolved".`,
                confirmText: 'Resolve All',
                cancelText: 'Cancel'
            },
            serverAction: {
                type: 'bulk_update',
                method: 'PATCH'
            },
            conditions: {
                available: (records) => {
                    // Only show if all selected records are in resolvable state
                    return records.every(record => {
                        const state = typeof record.state === 'object' ? record.state.value : record.state;
                        return ['1', '2', '3'].includes(state); // New, In Progress, On Hold
                    });
                }
            },
            accessibility: {
                ariaLabel: 'Resolve selected incidents'
            }
        },
        {
            id: 'bulk_delete',
            label: 'Delete Selected',
            iconKey: 'trash',
            maxSelection: 25, // Lower limit for destructive actions
            requiresConfirm: true,
            confirm: {
                title: 'Delete Incidents',
                messageTemplate: (count) => `Delete ${count} selected incidents? This action cannot be undone.`,
                confirmText: 'Delete All',
                cancelText: 'Cancel'
            },
            serverAction: {
                type: 'bulk_delete',
                method: 'DELETE'
            },
            accessibility: {
                ariaLabel: 'Delete selected incidents permanently'
            }
        }
    ];
    
    // Event handlers
    const handleOpenRecord = (recordRef) => {
        console.log('Navigation triggered - Record Reference:', recordRef);
        
        // Example of proper RecordRef usage:
        // - sys_id: unique identifier for server calls
        // - objectType: table name for proper routing  
        // - display: human-readable identifier
        
        // In a real application, this would trigger side panel or modal
        // For demo purposes, simulate navigation
        const navigationUrl = `/nav_to.do?uri=${recordRef.objectType}.do?sys_id=${recordRef.sys_id}`;
        console.log('Would navigate to:', navigationUrl);
        console.log('Display value:', recordRef.display);
        
        // Could integrate with side panel here:
        // showSidePanel(recordRef);
    };
    
    const handleActionInvoked = (actionId, recordOrRecords, success, error) => {
        if (success) {
            if (Array.isArray(recordOrRecords)) {
                // Bulk action
                console.log(`Bulk action ${actionId} completed successfully on ${recordOrRecords.length} records`);
            } else {
                // Row action
                console.log(`Row action ${actionId} completed successfully`);
            }
        } else {
            if (Array.isArray(recordOrRecords)) {
                // Bulk action failure
                console.error(`Bulk action ${actionId} failed on ${recordOrRecords.length} records:`, error);
            } else {
                // Row action failure
                console.error(`Row action ${actionId} failed:`, error);
            }
        }
    };
    
    return (
        <div className="incident-management">
            <h1>Incident Management</h1>
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
                config={config}
                a11y={{
                    ariaLabel: "Incident Management List",
                    descriptions: {
                        tableDescription: "List of active incidents with filtering and sorting capabilities",
                        filtersDescription: "Filter incidents by state, priority, assignment, and creation date",
                        paginationDescription: "Navigate between pages of incident results"
                    }
                }}
                className="incident-management__list"
                testIds={{
                    container: 'incident-list',
                    table: 'incident-table',
                    filters: 'incident-filters',
                    pagination: 'incident-pagination',
                    actions: 'incident-actions'
                }}
            />
        </div>
    );
};

export default IncidentManagementList;