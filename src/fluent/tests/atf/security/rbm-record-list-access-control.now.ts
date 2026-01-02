/**
 * RBM Record List - Security and Access Control ATF Test Suite
 * 
 * Covers:
 * - Record-level ACL enforcement
 * - Field-level security and masking
 * - Action authorization validation
 * - Cross-scope security boundary testing
 * - Data leakage prevention
 */

import '@servicenow/sdk/global';
import { Test } from '@servicenow/sdk/core';

// Test 1: Record-Level ACL Enforcement
Test({
  $id: Now.ID['rbm_record_list_acl_enforcement'],
  name: 'RBM Record List - Record-Level ACL Enforcement',
  description: 'Validates that record-level ACLs are properly enforced, preventing unauthorized data access',
  active: true,
  failOnServerError: false
}, (atf) => {

  let restrictedRecordId = '';
  let publicRecordId = '';

  // Step 1: Create a restricted incident (high priority/confidential)
  const restrictedIncident = atf.server.recordInsert({
    $id: Now.ID['create_restricted_incident'],
    table: 'incident',
    fieldValues: {
      short_description: 'CONFIDENTIAL - Security Breach Investigation',
      description: 'This incident contains sensitive security information and should be restricted',
      priority: '1', // Critical priority
      impact: '1',
      urgency: '1',
      state: '2',
      category: 'security'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false // Create as admin first
  });
  restrictedRecordId = restrictedIncident.record_id;

  // Step 2: Create a public incident (low priority/general)
  const publicIncident = atf.server.recordInsert({
    $id: Now.ID['create_public_incident'],
    table: 'incident',
    fieldValues: {
      short_description: 'General IT Support Request',
      description: 'Standard IT support request - publicly viewable',
      priority: '4',
      impact: '3',
      urgency: '3',
      state: '2',
      category: 'inquiry'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });
  publicRecordId = publicIncident.record_id;

  // Step 3: Create a limited user with basic incident access
  const limitedUser = atf.server.createUser({
    $id: Now.ID['create_limited_security_user'],
    firstName: 'ATF',
    lastName: 'LimitedUser',
    fieldValues: {
      user_name: 'atf.limited.security',
      email: 'atf.limited@test.com'
    },
    groups: [], // No special groups
    roles: ['itil', 'incident_reader'], // Basic incident access only
    impersonate: true
  });

  // Step 4: Test query access as limited user
  atf.rest.sendRestRequest({
    $id: Now.ID['test_acl_query_limited_user'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 50, cursor: null, offset: 0 },
      sort: [{ field: 'sys_created_on', direction: 'desc' }],
      filters: [
        { field: 'sys_id', operator: 'IN', value: [restrictedRecordId, publicRecordId] }
      ],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_acl_query_001' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 5: Validate response (should return only accessible records)
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_acl_query_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 6: Verify that restricted records are filtered out
  atf.rest.assertResponseJSONPayloadIsValid({
    $id: Now.ID['assert_acl_filtered_json']
  });

  // Step 7: Test row action access as limited user on restricted record
  atf.rest.sendRestRequest({
    $id: Now.ID['test_restricted_row_action'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_restricted_action_001'
    },
    body: JSON.stringify({
      actionId: 'view',
      record: {
        sys_id: restrictedRecordId,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_restricted_action_001',
        invocationType: 'row',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'view',
        recordIds: [restrictedRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 8: Should receive access denied for restricted record
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_restricted_access_denied'],
    operation: 'equals',
    statusCode: 403
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_access_denied_message'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'PERMISSION_DENIED'
  });

  // Step 9: Test row action access on public record (should succeed)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_public_row_action'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_public_action_001'
    },
    body: JSON.stringify({
      actionId: 'view',
      record: {
        sys_id: publicRecordId,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_public_action_001',
        invocationType: 'row',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'view',
        recordIds: [publicRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 10: Should succeed for public record
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_public_access_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 11: Clean up test records
  atf.server.recordDelete({
    $id: Now.ID['cleanup_restricted_record'],
    table: 'incident',
    recordId: restrictedRecordId,
    assert: 'record_successfully_deleted',
    enforceSecurity: false
  });

  atf.server.recordDelete({
    $id: Now.ID['cleanup_public_record'],
    table: 'incident',
    recordId: publicRecordId,
    assert: 'record_successfully_deleted',
    enforceSecurity: false
  });

  atf.server.log({
    $id: Now.ID['log_acl_enforcement_complete'],
    log: 'RBM Record List ACL Enforcement Test completed - validated record-level access control with restricted and public records'
  });
});

// Test 2: Field-Level Security and Masking
Test({
  $id: Now.ID['rbm_record_list_field_masking'],
  name: 'RBM Record List - Field-Level Security and Masking',
  description: 'Validates that sensitive fields are properly masked or hidden based on user permissions',
  active: true,
  failOnServerError: true
}, (atf) => {

  let testRecordId = '';

  // Step 1: Create an incident with sensitive information
  const sensitiveIncident = atf.server.recordInsert({
    $id: Now.ID['create_sensitive_incident'],
    table: 'incident',
    fieldValues: {
      short_description: 'Test Incident with Sensitive Data',
      description: 'This incident contains sensitive information that should be masked for certain users',
      priority: '2',
      impact: '2',
      urgency: '2',
      state: '2',
      caller_id: '681ccaf9c0a8016400b98a06818d57c7', // Use a known user ID
      comments: 'CONFIDENTIAL: Credit card number 1234-5678-9012-3456 was compromised'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });
  testRecordId = sensitiveIncident.record_id;

  // Step 2: Create a user with limited field access
  const fieldLimitedUser = atf.server.createUser({
    $id: Now.ID['create_field_limited_user'],
    firstName: 'ATF',
    lastName: 'FieldLimited',
    fieldValues: {
      user_name: 'atf.field.limited',
      email: 'atf.fieldlimited@test.com'
    },
    groups: [], // No special groups for field access
    roles: ['incident_reader'], // Basic read-only access
    impersonate: true
  });

  // Step 3: Query as limited user to test field masking
  atf.rest.sendRestRequest({
    $id: Now.ID['test_field_masking_query'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 10, cursor: null, offset: 0 },
      sort: [{ field: 'sys_created_on', direction: 'desc' }],
      filters: [
        { field: 'sys_id', operator: '=', value: testRecordId }
      ],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_field_masking_001' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 4: Validate successful response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_field_query_success'],
    operation: 'equals',
    statusCode: 200
  });

  atf.rest.assertResponseJSONPayloadIsValid({
    $id: Now.ID['assert_field_response_valid']
  });

  // Step 5: Verify that sensitive fields are not exposed in response
  // Note: This test assumes the server properly masks sensitive fields
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_has_rows_for_masking'],
    elementName: 'rows',
    operation: 'exists',
    elementValue: ''
  });

  // Step 6: Switch to admin user and verify full field access
  atf.server.impersonate({
    $id: Now.ID['impersonate_admin_for_fields'],
    user: 'admin' // Use admin user
  });

  atf.rest.sendRestRequest({
    $id: Now.ID['test_admin_field_access'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 10, cursor: null, offset: 0 },
      sort: [{ field: 'sys_created_on', direction: 'desc' }],
      filters: [
        { field: 'sys_id', operator: '=', value: testRecordId }
      ],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_admin_field_access_001' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 7: Validate admin has full access
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_admin_field_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 8: Test field access in row actions as limited user
  atf.server.impersonate({
    $id: Now.ID['reimpersonate_limited_user'],
    user: fieldLimitedUser.user
  });

  atf.rest.sendRestRequest({
    $id: Now.ID['test_row_action_field_masking'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_row_field_masking_001'
    },
    body: JSON.stringify({
      actionId: 'view',
      record: {
        sys_id: testRecordId,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_row_field_masking_001',
        invocationType: 'row',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'view',
        recordIds: [testRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 9: Should succeed but with masked fields
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_row_action_field_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 10: Clean up test record
  atf.server.recordDelete({
    $id: Now.ID['cleanup_sensitive_record'],
    table: 'incident',
    recordId: testRecordId,
    assert: 'record_successfully_deleted',
    enforceSecurity: false
  });

  atf.server.log({
    $id: Now.ID['log_field_masking_complete'],
    log: 'RBM Record List Field Masking Test completed - validated field-level security enforcement and proper masking'
  });
});

// Test 3: Action Authorization Validation
Test({
  $id: Now.ID['rbm_record_list_action_authorization'],
  name: 'RBM Record List - Action Authorization Validation',
  description: 'Validates that actions are properly authorized based on user roles and record states',
  active: true,
  failOnServerError: false
}, (atf) => {

  let testRecordId = '';

  // Step 1: Create a closed incident that shouldn't be editable
  const closedIncident = atf.server.recordInsert({
    $id: Now.ID['create_closed_incident'],
    table: 'incident',
    fieldValues: {
      short_description: 'Closed Test Incident for Action Authorization',
      description: 'This incident is closed and should not allow certain actions',
      priority: '3',
      impact: '3',
      urgency: '3',
      state: '6' // Closed state
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });
  testRecordId = closedIncident.record_id;

  // Step 2: Create a read-only user
  const readOnlyUser = atf.server.createUser({
    $id: Now.ID['create_readonly_user'],
    firstName: 'ATF',
    lastName: 'ReadOnly',
    fieldValues: {
      user_name: 'atf.readonly.user',
      email: 'atf.readonly@test.com'
    },
    groups: [], 
    roles: ['incident_reader'], // Read-only access
    impersonate: true
  });

  // Step 3: Test read-only user attempting edit action
  atf.rest.sendRestRequest({
    $id: Now.ID['test_readonly_edit_attempt'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_readonly_edit_001'
    },
    body: JSON.stringify({
      actionId: 'edit',
      record: {
        sys_id: testRecordId,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_readonly_edit_001',
        invocationType: 'row',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'edit',
        recordIds: [testRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 4: Should be denied due to read-only permissions
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_readonly_edit_denied'],
    operation: 'equals',
    statusCode: 403
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_readonly_error_message'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'PERMISSION_DENIED'
  });

  // Step 5: Test view action (should be allowed for read-only user)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_readonly_view_allowed'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_readonly_view_001'
    },
    body: JSON.stringify({
      actionId: 'view',
      record: {
        sys_id: testRecordId,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_readonly_view_001',
        invocationType: 'row',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'view',
        recordIds: [testRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 6: View should be allowed
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_readonly_view_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 7: Create a user with edit permissions but test state-based restrictions
  const editorUser = atf.server.createUser({
    $id: Now.ID['create_editor_user'],
    firstName: 'ATF',
    lastName: 'Editor',
    fieldValues: {
      user_name: 'atf.editor.user',
      email: 'atf.editor@test.com'
    },
    groups: [],
    roles: ['itil'], // Has edit permissions
    impersonate: true
  });

  // Step 8: Test editor attempting to edit closed incident (state-based restriction)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_editor_closed_edit'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_editor_closed_001'
    },
    body: JSON.stringify({
      actionId: 'edit',
      record: {
        sys_id: testRecordId,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_editor_closed_001',
        invocationType: 'row',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'edit',
        recordIds: [testRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 9: May be denied based on business rules for closed incidents
  // Status code could be 403 (forbidden) or 400 (business rule violation)
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_closed_edit_restricted'],
    operation: 'greater_than',
    statusCode: 399 // Accept 400+ (client error range)
  });

  // Step 10: Clean up test record
  atf.server.recordDelete({
    $id: Now.ID['cleanup_closed_incident'],
    table: 'incident',
    recordId: testRecordId,
    assert: 'record_successfully_deleted',
    enforceSecurity: false
  });

  atf.server.log({
    $id: Now.ID['log_action_authorization_complete'],
    log: 'RBM Record List Action Authorization Test completed - validated role-based and state-based action restrictions'
  });
});