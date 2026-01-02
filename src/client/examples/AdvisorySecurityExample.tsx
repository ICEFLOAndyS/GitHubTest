/**
 * RBM Advisory Security Example
 * 
 * Demonstrates advisory security behavior where:
 * - UI provides hints based on action descriptors and actionAvailability
 * - Server remains sole security authority
 * - 403 errors handled gracefully with standard messaging
 * - Component continues functioning after permission denials
 */

import React, { useState } from 'react';
import { RbmRecordList } from '../components/rbm-record-list';
import { useRecordListDataProvider, useRecordListConfig } from '../hooks/useRecordList';
import { ColumnDef, ActionDef, RbmRecord } from '../components/rbm-record-list/types';
import './AdvisorySecurityExample.css';

export const AdvisorySecurityExample: React.FC = () => {
    const [securityEvents, setSecurityEvents] = useState<string[]>([]);
    
    // Create data provider
    const dataProvider = useRecordListDataProvider('incident.active', 'security_demo');
    
    // Configuration
    const config = useRecordListConfig('incident.active', {
        enableSearch: true,
        defaultPageSize: 25
    });
    
    // Columns
    const columns: ColumnDef[] = [
        {
            field: 'number',
            label: 'Incident',
            width: 120,
            priority: 1,
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
    
    // Actions with advisory security configurations
    const actions: ActionDef[] = [
        {
            id: 'view',
            label: 'View Details',
            iconKey: 'eye',
            category: 'primary',
            // Advisory security: Hide when server says unavailable
            advisorySecurity: {
                hideWhenUnavailable: true,
                disabledTooltip: 'View access not available'
            },
            accessibility: {
                ariaLabel: 'View incident details'
            }
        },
        {
            id: 'edit',
            label: 'Edit',
            iconKey: 'edit',
            category: 'secondary',
            // Advisory security: Disable when server says unavailable (but keep visible)
            advisorySecurity: {
                hideWhenUnavailable: false,
                disableWhenUnavailable: true,
                disabledTooltip: 'Edit access is not available for this record'
            },
            // UI-side conditions (advisory only)
            conditions: {
                visible: (record: RbmRecord) => {
                    // Advisory logic: Don't show edit for closed incidents
                    const state = typeof record.state === 'object' ? record.state.value : record.state;
                    return state !== '7'; // Not closed
                },
                enabled: (record: RbmRecord) => {
                    // Advisory logic: Only enable for assigned incidents
                    return !!record.assigned_to;
                }
            },
            accessibility: {
                ariaLabel: 'Edit incident details'
            }
        },
        {
            id: 'resolve',
            label: 'Resolve',
            iconKey: 'check-circle',
            category: 'secondary',
            confirm: {
                title: 'Resolve Incident',
                message: 'Mark this incident as resolved?',
                confirmText: 'Resolve',
                cancelText: 'Cancel'
            },
            // Advisory security: Hide when not available
            advisorySecurity: {
                hideWhenUnavailable: true
            },
            conditions: {
                visible: (record: RbmRecord) => {
                    // Advisory logic: Only show for active incidents
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
            // Advisory security: Always show but may be disabled
            advisorySecurity: {
                hideWhenUnavailable: false,
                disableWhenUnavailable: true,
                disabledTooltip: 'Delete permission required'
            }
        },
        {
            id: 'admin_override',
            label: 'Admin Override',
            iconKey: 'shield',
            category: 'destructive',
            confirm: {
                title: 'Administrative Override',
                message: 'This action requires administrative privileges and will be audited.',
                confirmText: 'Override',
                cancelText: 'Cancel'
            },
            // Advisory security: Hide completely when not available (admin-only action)
            advisorySecurity: {
                hideWhenUnavailable: true,
                disabledTooltip: 'Administrative privileges required'
            },
            conditions: {
                visible: (record: RbmRecord) => {
                    // Advisory logic: Only show for admin users (this is just UI hint)
                    // Server will enforce actual permissions
                    return window.g_user?.hasRole?.('admin') || false;
                }
            }
        }
    ];
    
    // Event handlers with security logging
    const handleOpenRecord = (recordRef) => {
        console.log('Record opened:', recordRef);
        addSecurityEvent(`Record opened: ${recordRef.display} (${recordRef.sys_id})`);
    };
    
    const handleActionInvoked = (actionId, recordOrRecords, success, error) => {
        if (success) {
            addSecurityEvent(`✅ Action "${actionId}" completed successfully`);
        } else {
            // Log security failures specifically
            const isPermissionError = error?.includes('permission') || error?.includes('403');
            const eventType = isPermissionError ? '🔒 PERMISSION DENIED' : '❌ ACTION FAILED';
            addSecurityEvent(`${eventType}: Action "${actionId}" - ${error}`);
            
            if (isPermissionError) {
                addSecurityEvent('ℹ️ Component continues normal operation after permission denial');
            }
        }
    };
    
    const addSecurityEvent = (event: string) => {
        const timestamp = new Date().toLocaleTimeString();
        setSecurityEvents(prev => [`${timestamp}: ${event}`, ...prev.slice(0, 9)]);
    };
    
    // Mock data with actionAvailability flags to demonstrate advisory security
    const enhancedDataProvider = {
        ...dataProvider,
        async fetchRecords(request) {
            const response = await dataProvider.fetchRecords(request);
            
            // Enhance records with mock actionAvailability flags for demonstration
            const enhancedRecords = response.records.map((record, index) => ({
                ...record,
                actionAvailability: {
                    // Mock some permission scenarios for demo
                    view: { available: true, enabled: true },
                    edit: { 
                        available: true, 
                        enabled: index % 3 !== 0, // Disable every 3rd record 
                        reason: index % 3 === 0 ? 'Record is read-only' : undefined
                    },
                    resolve: { 
                        available: index % 4 !== 0, // Hide for every 4th record
                        enabled: true,
                        reason: index % 4 === 0 ? 'Resolve not permitted for this record type' : undefined
                    },
                    delete: { 
                        available: true, 
                        enabled: index % 5 !== 0, // Disable every 5th record
                        reason: index % 5 === 0 ? 'Delete permission denied' : undefined
                    },
                    admin_override: { 
                        available: index < 2, // Only first 2 records
                        enabled: index < 2,
                        reason: index >= 2 ? 'Administrative override not applicable' : undefined
                    }
                }
            }));
            
            return {
                ...response,
                records: enhancedRecords
            };
        }
    };
    
    return (
        <div className="advisory-security-example">
            <header className="example-header">
                <h1>Advisory Security Example</h1>
                <p>
                    This example demonstrates RBM advisory security behavior where the UI provides
                    hints while the server remains the sole security authority.
                </p>
                
                <div className="security-principles">
                    <h3>RBM Security Principles:</h3>
                    <ul>
                        <li><strong>Server Authority</strong>: Server is sole security enforcement point</li>
                        <li><strong>UI Hints</strong>: Actions may be hidden/disabled based on server flags</li>
                        <li><strong>Never Assume</strong>: Hidden/disabled ≠ permitted/denied</li>
                        <li><strong>Graceful Failures</strong>: 403 errors show standard message + correlation ID</li>
                        <li><strong>Continue Operation</strong>: Component functions normally after denials</li>
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
                        dataProvider={enhancedDataProvider}
                        onOpenRecord={handleOpenRecord}
                        onActionInvoked={handleActionInvoked}
                        density="comfortable"
                        config={config}
                        a11y={{
                            ariaLabel: "Advisory Security Demo - Incident List",
                            descriptions: {
                                tableDescription: "Incident list demonstrating advisory security behavior. Some actions may appear disabled based on server permissions."
                            }
                        }}
                        className="advisory-security__list"
                    />
                </div>
                
                <div className="layout__sidebar">
                    <div className="security-events">
                        <h3>Security Events Log</h3>
                        <div className="events-list">
                            {securityEvents.length === 0 ? (
                                <p className="no-events">No security events yet. Try performing actions...</p>
                            ) : (
                                securityEvents.map((event, index) => (
                                    <div 
                                        key={index} 
                                        className={`security-event ${
                                            event.includes('PERMISSION DENIED') ? 'security-event--denied' :
                                            event.includes('✅') ? 'security-event--success' :
                                            event.includes('❌') ? 'security-event--error' :
                                            'security-event--info'
                                        }`}
                                    >
                                        {event}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                    
                    <div className="demo-info">
                        <h4>Demo Behavior:</h4>
                        <ul>
                            <li><strong>Edit</strong>: Disabled every 3rd record (advisory)</li>
                            <li><strong>Resolve</strong>: Hidden every 4th record (advisory)</li>
                            <li><strong>Delete</strong>: Disabled every 5th record (advisory)</li>
                            <li><strong>Admin</strong>: Only available for first 2 records</li>
                        </ul>
                        <p>
                            <small>
                                <strong>Note:</strong> These are UI hints only. 
                                Server will still validate all permissions.
                            </small>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdvisorySecurityExample;