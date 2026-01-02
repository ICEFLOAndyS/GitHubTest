/**
 * RBM Record List Scripted REST API - Updated Implementation
 * 
 * Namespace: /api/x_icefl_git/rbm/v1/record-list
 * 
 * Provides three MANDATORY resources with RBM governance:
 * - POST /query - Server-side data retrieval with hard allow-list validation
 * - POST /row-action - Individual record actions with ACL enforcement  
 * - POST /bulk-action - Bulk operations with comprehensive audit logging
 * 
 * Key RBM Compliance Features:
 * - Hard allow-list registry (listKeys MUST be pre-registered)
 * - Action registry (only registered actions permitted)
 * - Server-side security enforcement (UI never trusted)
 * - Comprehensive correlation ID tracking
 * - Mandatory audit evidence for state changes
 */

import '@servicenow/sdk/global';
import { RestApi } from '@servicenow/sdk/core';
import { handleRecordListQuery } from '../../server/rest/rbm-record-list-query.js';
import { handleRowAction } from '../../server/rest/rbm-record-list-row-action.js';
import { handleBulkAction } from '../../server/rest/rbm-record-list-bulk-action.js';

export const rbmRecordListApi = RestApi({
    $id: Now.ID['rbm-record-list-api'],
    name: 'RBM Record List API',
    serviceId: 'rbm',
    shortDescription: 'RBM-compliant server-side data operations for Record List component',
    active: true,
    consumes: 'application/json',
    produces: 'application/json',
    
    // Enforce authentication and ACLs (RBM requirement)
    enforceAcl: [], // Uses default ServiceNow REST ACL enforcement
    
    // API versioning with RBM namespace
    versions: [
        {
            $id: Now.ID['rbm-record-list-api-v1'],
            version: 1,
            active: true,
            isDefault: true,
            shortDescription: 'RBM Record List API v1 - Initial governance-compliant implementation'
        }
    ],
    
    // Define the three MANDATORY resources
    routes: [
        // A) POST /record-list/query - Server-side data retrieval
        {
            $id: Now.ID['rbm-record-list-query-route'],
            name: 'RBM Record List Query',
            path: '/record-list/query',
            method: 'POST',
            script: handleRecordListQuery,
            active: true,
            version: 1,
            shortDescription: 'Server-side query with hard allow-list validation and ACL enforcement',
            consumes: 'application/json',
            produces: 'application/json',
            
            requestExample: JSON.stringify({
                "listKey": "incident.active",
                "page": { "size": 50, "cursor": null, "offset": 0 },
                "sort": [{ "field": "sys_created_on", "direction": "desc" }],
                "filters": [{ "field": "priority", "operator": "=", "value": "1" }],
                "search": "network outage",
                "context": { "viewId": "incident_active_list", "correlationId": "client_12345" }
            }, null, 2),
            
            // Server-authoritative security
            authorization: true,
            authentication: true,
            enforceAcl: [] // Table-level ACL enforcement in handler
        },
        
        // B) POST /record-list/row-action - Individual record actions
        {
            $id: Now.ID['rbm-record-list-row-action-route'],
            name: 'RBM Record List Row Action',
            path: '/record-list/row-action',
            method: 'POST',
            script: handleRowAction,
            active: true,
            version: 1,
            shortDescription: 'Execute individual record actions with comprehensive governance',
            consumes: 'application/json',
            produces: 'application/json',
            
            requestExample: JSON.stringify({
                "actionId": "delete",
                "record": { "sys_id": "9c573169c611228700193229fff72400", "objectType": "incident" },
                "metadata": {
                    "sourceComponent": "rbm-record-list",
                    "listKey": "incident.active", 
                    "viewId": "incident_management",
                    "clientCorrelationId": "client_67890",
                    "invocationType": "row",
                    "justification": "Duplicate incident - approved by manager"
                }
            }, null, 2),
            
            // Server-authoritative security with justification tracking
            authorization: true,
            authentication: true,
            enforceAcl: [] // Record-level ACL enforcement in handler
        },
        
        // C) POST /record-list/bulk-action - Bulk record operations
        {
            $id: Now.ID['rbm-record-list-bulk-action-route'],
            name: 'RBM Record List Bulk Action',
            path: '/record-list/bulk-action',
            method: 'POST',
            script: handleBulkAction,
            active: true,
            version: 1,
            shortDescription: 'Execute bulk actions with parent-child audit evidence and partial failure handling',
            consumes: 'application/json',
            produces: 'application/json',
            
            requestExample: JSON.stringify({
                "actionId": "bulk_activate",
                "records": [
                    { "sys_id": "9c573169c611228700193229fff72400", "objectType": "incident" },
                    { "sys_id": "1c573169c611228700193229fff72401", "objectType": "incident" }
                ],
                "metadata": {
                    "sourceComponent": "rbm-record-list",
                    "listKey": "incident.inactive",
                    "viewId": "incident_management", 
                    "clientCorrelationId": "client_11111",
                    "invocationType": "bulk",
                    "selectionCount": 2,
                    "justification": "Reactivating resolved incidents per change request CR123"
                }
            }, null, 2),
            
            // Server-authoritative security with batch processing
            authorization: true,
            authentication: true,
            enforceAcl: [] // Per-record ACL enforcement in handler
        }
    ]
});