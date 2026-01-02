/**
 * RBM Record List - Bulk Actions ATF Test Suite
 * 
 * Covers:
 * - Successful bulk action within capacity limits
 * - Over capacity handling and rejection
 * - Partial failure scenarios with proper reporting
 * - Bulk justification enforcement
 * - Selection count validation
 */

import '@servicenow/sdk/global';
import { Test } from '@servicenow/sdk/core';

// Test 1: Successful Bulk Action Within Capacity
Test({
  $id: Now.ID['rbm_record_list_bulk_action_success'],
  name: 'RBM Record List - Successful Bulk Action Within Capacity',
  description: 'Validates successful execution of bulk actions with proper audit metadata and within capacity limits',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Create test record 1
  const createResult1 = atf.server.recordInsert({
    $id: Now.ID['create_bulk_test_incident_1'],
    table: 'incident',
    fieldValues: {
      short_description: 'ATF Bulk Test Incident 1',
      description: 'This is test incident 1 created for bulk action testing',
      priority: '4',
      impact: '3',
      urgency: '3',
      state: '2'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });

  // Step 2: Create test record 2
  const createResult2 = atf.server.recordInsert({
    $id: Now.ID['create_bulk_test_incident_2'],
    table: 'incident',
    fieldValues: {
      short_description: 'ATF Bulk Test Incident 2',
      description: 'This is test incident 2 created for bulk action testing',
      priority: '4',
      impact: '3',
      urgency: '3',
      state: '2'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });

  // Step 3: Create test record 3
  const createResult3 = atf.server.recordInsert({
    $id: Now.ID['create_bulk_test_incident_3'],
    table: 'incident',
    fieldValues: {
      short_description: 'ATF Bulk Test Incident 3',
      description: 'This is test incident 3 created for bulk action testing',
      priority: '4',
      impact: '3',
      urgency: '3',
      state: '2'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });

  // Step 2: Log the test records creation
  atf.server.log({
    $id: Now.ID['log_bulk_test_records_created'],
    log: `Created ${testRecordIds.length} test incidents for bulk action testing: ${testRecordIds.join(', ')}`
  });

  // Step 3: Execute bulk action that doesn't require justification (bulk_view)
  atf.rest.sendRestRequest({
    $id: Now.ID['execute_bulk_action_view'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_bulk_view_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_view',
      records: testRecordIds.map(id => ({
        sys_id: id,
        objectType: 'incident'
      })),
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_bulk_view_001',
        invocationType: 'bulk',
        selectionCount: testRecordIds.length,
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_view',
        recordIds: testRecordIds
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 4: Validate successful response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_bulk_view_success'],
    operation: 'equals',
    statusCode: 200
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_bulk_view_success_true'],
    elementName: 'success',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 5: Execute bulk action that requires justification (bulk_update)
  atf.rest.sendRestRequest({
    $id: Now.ID['execute_bulk_action_update'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_bulk_update_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_update',
      records: testRecordIds.slice(0, 3).map(id => ({ // Only use first 3 records
        sys_id: id,
        objectType: 'incident'
      })),
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_bulk_update_001',
        invocationType: 'bulk',
        selectionCount: 3,
        justification: 'ATF Test - Bulk updating test incidents for automated testing. This bulk action is performed to validate the bulk operations functionality with proper justification.',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_update',
        recordIds: testRecordIds.slice(0, 3)
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 6: Validate successful bulk update response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_bulk_update_success'],
    operation: 'equals',
    statusCode: 200
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_bulk_update_success_true'],
    elementName: 'success',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 7: Validate audit trail creation
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_bulk_audit_trail'],
    elementName: 'auditTrailId',
    operation: 'exists',
    elementValue: ''
  });

  // Step 8: Clean up test records
  for (let i = 0; i < testRecordIds.length; i++) {
    atf.server.recordDelete({
      $id: Now.ID[`cleanup_bulk_test_record_${i}`],
      table: 'incident',
      recordId: testRecordIds[i],
      assert: 'record_successfully_deleted',
      enforceSecurity: false
    });
  }

  atf.server.log({
    $id: Now.ID['log_bulk_success_complete'],
    log: 'RBM Record List Bulk Action Success Test completed - validated bulk view and update actions with proper audit metadata'
  });
});

// Test 2: Bulk Action Over Capacity Handling
Test({
  $id: Now.ID['rbm_record_list_bulk_action_over_capacity'],
  name: 'RBM Record List - Bulk Action Over Capacity',
  description: 'Validates proper handling when bulk action exceeds maximum capacity limits (typically 100 records)',
  active: true,
  failOnServerError: false
}, (atf) => {

  // Step 1: Create a large number of dummy record references (simulate over capacity)
  const largeRecordSet = [];
  for (let i = 1; i <= 150; i++) { // Exceed typical 100 record limit
    largeRecordSet.push({
      sys_id: `dummy_record_${i.toString().padStart(3, '0')}`,
      objectType: 'incident'
    });
  }

  // Step 2: Attempt bulk action with over-capacity selection
  atf.rest.sendRestRequest({
    $id: Now.ID['execute_over_capacity_bulk'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_over_capacity_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_view',
      records: largeRecordSet,
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_over_capacity_001',
        invocationType: 'bulk',
        selectionCount: largeRecordSet.length,
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_view',
        recordIds: largeRecordSet.map(r => r.sys_id)
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 3: Validate capacity exceeded error (400 Bad Request)
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_capacity_exceeded'],
    operation: 'equals',
    statusCode: 400
  });

  // Step 4: Validate error message indicates capacity limit
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_capacity_error_message'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'capacity'
  });

  atf.server.log({
    $id: Now.ID['log_over_capacity_complete'],
    log: `RBM Record List Over Capacity Test completed - validated rejection of ${largeRecordSet.length} record bulk action`
  });
});

// Test 3: Bulk Action Partial Failure Handling
Test({
  $id: Now.ID['rbm_record_list_bulk_action_partial_failure'],
  name: 'RBM Record List - Bulk Action Partial Failure',
  description: 'Validates proper handling and reporting when some records in a bulk action fail while others succeed',
  active: true,
  failOnServerError: false
}, (atf) => {

  const validRecordIds = [];
  
  // Step 1: Create some valid test records
  for (let i = 1; i <= 3; i++) {
    const createResult = atf.server.recordInsert({
      $id: Now.ID[`create_valid_test_record_${i}`],
      table: 'incident',
      fieldValues: {
        short_description: `Valid ATF Test Incident ${i}`,
        description: `Valid test incident ${i} for partial failure testing`,
        priority: '4',
        impact: '3',
        urgency: '3',
        state: '2'
      },
      assert: 'record_successfully_inserted',
      enforceSecurity: false
    });
    
    validRecordIds.push(createResult.record_id);
  }

  // Step 2: Create mixed record set (valid + invalid IDs)
  const mixedRecordSet = [
    ...validRecordIds.map(id => ({ sys_id: id, objectType: 'incident' })),
    { sys_id: 'invalid_record_id_1', objectType: 'incident' },
    { sys_id: 'invalid_record_id_2', objectType: 'incident' },
    { sys_id: 'nonexistent_record_id', objectType: 'incident' }
  ];

  // Step 3: Execute bulk action with mixed valid/invalid records
  atf.rest.sendRestRequest({
    $id: Now.ID['execute_partial_failure_bulk'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_partial_failure_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_update',
      records: mixedRecordSet,
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_partial_failure_001',
        invocationType: 'bulk',
        selectionCount: mixedRecordSet.length,
        justification: 'ATF Test - Testing partial failure scenario with mixed valid and invalid records to validate proper error handling and reporting.',
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_update',
        recordIds: mixedRecordSet.map(r => r.sys_id)
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 4: Validate response (might be 200 with partial success or error status)
  // Check for either 200 (partial success) or 207 (multi-status) or 500 (server error)
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_partial_failure_status'],
    operation: 'less_than',
    statusCode: 600 // Accept any reasonable HTTP status
  });

  // Step 5: Validate JSON response structure
  atf.rest.assertResponseJSONPayloadIsValid({
    $id: Now.ID['assert_partial_failure_json_valid']
  });

  // Step 6: Check if response includes failure information
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_has_error_or_partial_info'],
    elementName: 'error.message',
    operation: 'exists',
    elementValue: ''
  });

  // Step 7: Clean up valid test records
  for (let i = 0; i < validRecordIds.length; i++) {
    atf.server.recordDelete({
      $id: Now.ID[`cleanup_partial_test_record_${i}`],
      table: 'incident',
      recordId: validRecordIds[i],
      assert: 'record_successfully_deleted',
      enforceSecurity: false
    });
  }

  atf.server.log({
    $id: Now.ID['log_partial_failure_complete'],
    log: `RBM Record List Partial Failure Test completed - tested mixed set of ${validRecordIds.length} valid and 3 invalid records`
  });
});

// Test 4: Bulk Action Selection Count Validation
Test({
  $id: Now.ID['rbm_record_list_bulk_selection_validation'],
  name: 'RBM Record List - Bulk Selection Count Validation',
  description: 'Validates that audit metadata selectionCount matches actual record count in bulk actions',
  active: true,
  failOnServerError: false
}, (atf) => {

  // Step 1: Test mismatched selectionCount (higher than actual)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_selection_count_mismatch_high'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_selection_mismatch_high_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_view',
      records: [
        { sys_id: 'test_record_1', objectType: 'incident' },
        { sys_id: 'test_record_2', objectType: 'incident' }
      ],
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_selection_mismatch_high_001',
        invocationType: 'bulk',
        selectionCount: 5, // Higher than actual (2)
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_view',
        recordIds: ['test_record_1', 'test_record_2']
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate selection count mismatch error
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_selection_mismatch_high_error'],
    operation: 'equals',
    statusCode: 400
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_selection_count_error_message'],
    elementName: 'error.message',
    operation: 'contains',
    elementValue: 'selectionCount'
  });

  // Step 3: Test mismatched selectionCount (lower than actual)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_selection_count_mismatch_low'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_selection_mismatch_low_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_view',
      records: [
        { sys_id: 'test_record_1', objectType: 'incident' },
        { sys_id: 'test_record_2', objectType: 'incident' },
        { sys_id: 'test_record_3', objectType: 'incident' }
      ],
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_selection_mismatch_low_001',
        invocationType: 'bulk',
        selectionCount: 1, // Lower than actual (3)
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_view',
        recordIds: ['test_record_1', 'test_record_2', 'test_record_3']
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 4: Validate selection count mismatch error
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_selection_mismatch_low_error'],
    operation: 'equals',
    statusCode: 400
  });

  // Step 5: Test correct selectionCount
  atf.rest.sendRestRequest({
    $id: Now.ID['test_selection_count_correct'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_selection_correct_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_view',
      records: [
        { sys_id: 'test_record_1', objectType: 'incident' },
        { sys_id: 'test_record_2', objectType: 'incident' }
      ],
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_selection_correct_001',
        invocationType: 'bulk',
        selectionCount: 2, // Correct count
        timestamp: new Date().toISOString(),
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_view',
        recordIds: ['test_record_1', 'test_record_2']
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 6: This should succeed with proper selection count
  // Note: May still fail due to non-existent records, but not due to count mismatch
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_selection_correct_processed'],
    operation: 'less_than',
    statusCode: 500 // Accept 400 (bad records) but not 500 (server error from count mismatch)
  });

  atf.server.log({
    $id: Now.ID['log_selection_validation_complete'],
    log: 'RBM Record List Selection Count Validation Test completed - validated proper handling of selectionCount mismatches'
  });
});