/**
 * RBM Record List - Row Actions ATF Test Suite
 * 
 * Covers:
 * - Successful row action execution
 * - Access denied scenarios
 * - Validation error handling
 * - Justification enforcement
 * - Audit metadata compliance
 */

import '@servicenow/sdk/global';
import { Test } from '@servicenow/sdk/core';

// Test 1: Successful Row Action Execution
Test({
  $id: Now.ID['rbm_record_list_row_action_success'],
  name: 'RBM Record List - Successful Row Action',
  description: 'Validates successful execution of row actions with proper audit metadata and justification',
  active: true,
  failOnServerError: true
}, (atf) => {

  let testRecordId = '';

  // Step 1: Create a test incident record for action testing
  const createResult = atf.server.recordInsert({
    $id: Now.ID['create_test_incident'],
    table: 'incident',
    fieldValues: {
      short_description: 'ATF Test Incident for Row Action',
      description: 'This incident was created by ATF for testing row actions',
      priority: '4',
      impact: '3',
      urgency: '3',
      state: '2'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });

  testRecordId = createResult.record_id;

  // Step 2: Log the test record creation
  atf.server.log({
    $id: Now.ID['log_test_record_created'],
    log: `Test incident created with ID: ${testRecordId} for row action testing`
  });

  // Step 3: Execute a row action that doesn't require justification (view/edit)
  atf.rest.sendRestRequest({
    $id: Now.ID['execute_row_action_view'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_row_action_view_001'
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
        clientCorrelationId: 'atf_test_row_action_view_001',
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

  // Step 4: Validate successful response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_view_action_success'],
    operation: 'equals',
    statusCode: 200
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_view_success_true'],
    elementName: 'success',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 5: Execute a row action that requires justification (delete)
  atf.rest.sendRestRequest({
    $id: Now.ID['execute_row_action_delete'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_row_action_delete_001'
    },
    body: JSON.stringify({
      actionId: 'delete',
      record: {
        sys_id: testRecordId,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_row_action_delete_001',
        invocationType: 'row',
        justification: 'ATF Test - Deleting test incident created for automated testing purposes. This is a valid justification that meets minimum length requirements.',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'delete',
        recordIds: [testRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 6: Validate successful delete response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_delete_action_success'],
    operation: 'equals',
    statusCode: 200
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_delete_success_true'],
    elementName: 'success',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 7: Validate audit trail creation
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_audit_trail_id'],
    elementName: 'auditTrailId',
    operation: 'exists',
    elementValue: ''
  });

  atf.server.log({
    $id: Now.ID['log_row_action_success_complete'],
    log: 'RBM Record List Row Action Success Test completed - validated view and delete actions with proper audit metadata'
  });
});

// Test 2: Row Action Access Denied
Test({
  $id: Now.ID['rbm_record_list_row_action_denied'],
  name: 'RBM Record List - Row Action Access Denied',
  description: 'Validates proper handling when user lacks permission for row actions',
  active: true,
  failOnServerError: false // Expect controlled errors
}, (atf) => {

  // Step 1: Create a limited user with restricted permissions
  const restrictedUser = atf.server.createUser({
    $id: Now.ID['create_restricted_user'],
    firstName: 'ATF',
    lastName: 'RestrictedUser',
    fieldValues: {
      user_name: 'atf.restricted.user',
      email: 'atf.restricted@test.com'
    },
    groups: [], // No groups = very limited permissions
    roles: ['snc_internal'], // Minimal role
    impersonate: true
  });

  // Step 2: Create a test record as admin first
  const adminRecord = atf.server.recordInsert({
    $id: Now.ID['create_admin_test_record'],
    table: 'incident',
    fieldValues: {
      short_description: 'ATF Admin Test Record for Access Denial',
      description: 'This record should be inaccessible to restricted user',
      priority: '1',
      impact: '1',
      urgency: '1',
      state: '1'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });

  // Step 3: Switch to restricted user
  atf.server.impersonate({
    $id: Now.ID['impersonate_restricted_user'],
    user: restrictedUser.user
  });

  // Step 4: Attempt row action as restricted user
  atf.rest.sendRestRequest({
    $id: Now.ID['attempt_restricted_row_action'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_access_denied_001'
    },
    body: JSON.stringify({
      actionId: 'delete',
      record: {
        sys_id: adminRecord.record_id,
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_access_denied_001',
        invocationType: 'row',
        justification: 'ATF Test - Attempting action without permissions to validate access control',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'delete',
        recordIds: [adminRecord.record_id]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 5: Validate access denied response (403 Forbidden)
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_access_denied'],
    operation: 'equals',
    statusCode: 403
  });

  // Step 6: Validate error message structure
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_access_error'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'PERMISSION_DENIED'
  });

  atf.server.log({
    $id: Now.ID['log_access_denied_complete'],
    log: 'RBM Record List Access Denied Test completed - validated proper 403 response for unauthorized actions'
  });
});

// Test 3: Row Action Validation Errors
Test({
  $id: Now.ID['rbm_record_list_row_action_validation'],
  name: 'RBM Record List - Row Action Validation Errors',
  description: 'Validates proper handling of validation errors including missing justification and malformed requests',
  active: true,
  failOnServerError: false
}, (atf) => {

  // Step 1: Test missing justification for action that requires it
  atf.rest.sendRestRequest({
    $id: Now.ID['test_missing_justification'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_missing_justification_001'
    },
    body: JSON.stringify({
      actionId: 'delete',
      record: {
        sys_id: 'dummy_record_id',
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_missing_justification_001',
        invocationType: 'row',
        // Missing justification field intentionally
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'delete',
        recordIds: ['dummy_record_id']
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate justification validation error (400 Bad Request)
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_justification_error'],
    operation: 'equals',
    statusCode: 400
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_justification_error_message'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'justification'
  });

  // Step 3: Test insufficient justification length
  atf.rest.sendRestRequest({
    $id: Now.ID['test_short_justification'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_short_justification_001'
    },
    body: JSON.stringify({
      actionId: 'delete',
      record: {
        sys_id: 'dummy_record_id',
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_short_justification_001',
        invocationType: 'row',
        justification: 'short', // Too short for requirements
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'delete',
        recordIds: ['dummy_record_id']
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 4: Validate short justification error
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_short_justification_error'],
    operation: 'equals',
    statusCode: 400
  });

  // Step 5: Test missing audit metadata fields
  atf.rest.sendRestRequest({
    $id: Now.ID['test_missing_metadata'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_missing_metadata_001'
    },
    body: JSON.stringify({
      actionId: 'view',
      record: {
        sys_id: 'dummy_record_id',
        objectType: 'incident'
      },
      auditMetadata: {
        // Missing most required fields intentionally
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active'
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 6: Validate metadata validation error
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_metadata_error'],
    operation: 'equals',
    statusCode: 400
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_metadata_error_message'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'audit metadata'
  });

  // Step 7: Test unauthorized source component
  atf.rest.sendRestRequest({
    $id: Now.ID['test_unauthorized_source'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_unauthorized_source_001'
    },
    body: JSON.stringify({
      actionId: 'view',
      record: {
        sys_id: 'dummy_record_id',
        objectType: 'incident'
      },
      auditMetadata: {
        sourceComponent: 'malicious-component', // Unauthorized source
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_unauthorized_source_001',
        invocationType: 'row',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'view',
        recordIds: ['dummy_record_id']
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 8: Validate unauthorized source error (403 Forbidden)
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_unauthorized_source_error'],
    operation: 'equals',
    statusCode: 403
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_unauthorized_source_message'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'UNAUTHORIZED_SOURCE_COMPONENT'
  });

  atf.server.log({
    $id: Now.ID['log_validation_errors_complete'],
    log: 'RBM Record List Validation Errors Test completed - validated justification, metadata, and authorization validation'
  });
});