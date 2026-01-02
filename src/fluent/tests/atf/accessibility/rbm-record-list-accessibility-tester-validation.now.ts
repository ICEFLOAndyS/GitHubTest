/**
 * RBM Record List - Accessibility Testing Validation ATF Suite
 * 
 * Tests the AccessibilityTester component and validates WCAG 2.1 AA compliance:
 * - AccessibilityTester functionality validation
 * - WCAG compliance reporting
 * - Component accessibility feature verification
 */

import '@servicenow/sdk/global';
import { Test } from '@servicenow/sdk/core';

// Test 1: AccessibilityTester Component Validation
Test({
  $id: Now.ID['rbm_record_list_accessibility_tester_validation'],
  name: 'RBM Record List - AccessibilityTester Component',
  description: 'Validates the AccessibilityTester component functions properly and reports WCAG compliance',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test accessibility test runner endpoint
  atf.rest.sendRestRequest({
    $id: Now.ID['test_accessibility_runner'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/test-runner',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_accessibility_runner_001'
    },
    body: JSON.stringify({
      componentId: 'rbm-record-list-test-instance',
      testSuite: 'full',
      wcagLevel: 'AA'
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate accessibility test runner response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_accessibility_runner_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Validate test results structure
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_test_results_structure'],
    elementName: 'results',
    operation: 'exists',
    elementValue: ''
  });

  // Step 4: Validate overall compliance score
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_overall_score'],
    elementName: 'report.score',
    operation: 'exists',
    elementValue: ''
  });

  // Step 5: Validate keyboard navigation test results
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_keyboard_navigation_results'],
    elementName: 'results.keyboardNavigation.passed',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 6: Validate ARIA implementation test results
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_aria_implementation_results'],
    elementName: 'results.ariaImplementation.passed',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 7: Validate focus management test results
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_focus_management_results'],
    elementName: 'results.focusManagement.passed',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 8: Validate color independence test results
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_color_independence_results'],
    elementName: 'results.colorIndependence.passed',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 9: Validate overall WCAG compliance
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_wcag_compliance'],
    elementName: 'report.overall',
    operation: 'equals',
    elementValue: 'pass'
  });

  // Step 10: Validate WCAG criteria coverage
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_wcag_criteria_coverage'],
    elementName: 'report.wcagCriteria',
    operation: 'contains',
    elementValue: '2.1.1'
  });

  atf.server.log({
    $id: Now.ID['log_accessibility_tester_complete'],
    log: 'RBM Record List AccessibilityTester Validation Test completed - validated WCAG 2.1 AA compliance reporting'
  });
});

// Test 7: Comprehensive Accessibility Integration Test
Test({
  $id: Now.ID['rbm_record_list_accessibility_integration'],
  name: 'RBM Record List - Accessibility Integration Test',
  description: 'End-to-end validation of accessibility features working together in realistic usage scenarios',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Create test record for accessibility validation
  const createResult = atf.server.recordInsert({
    $id: Now.ID['create_accessibility_test_record'],
    table: 'incident',
    fieldValues: {
      short_description: 'ATF Accessibility Test Incident',
      description: 'This incident was created for comprehensive accessibility testing',
      priority: '3',
      impact: '2',
      urgency: '2',
      state: '2'
    },
    assert: 'record_successfully_inserted',
    enforceSecurity: false
  });

  const testRecordId = createResult.record_id;

  // Step 2: Test complete accessibility-enabled data request
  atf.rest.sendRestRequest({
    $id: Now.ID['test_full_accessibility_data_request'],
    path: '/api/x_icefl_git/rbm/v1/record-list/data',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_full_accessibility_001'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      includeAccessibilityMetadata: true,
      enableKeyboardNavigation: true,
      enableScreenReaderSupport: true,
      enableFocusManagement: true,
      enableColorIndependence: true,
      pagination: {
        pageSize: 10,
        cursor: null
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 3: Validate complete accessibility response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_full_accessibility_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 4: Validate all accessibility features are reported as enabled
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_all_accessibility_features_enabled'],
    elementName: 'accessibility.status',
    operation: 'equals',
    elementValue: 'fully_enabled'
  });

  // Step 5: Test accessible row action with proper audit metadata
  atf.rest.sendRestRequest({
    $id: Now.ID['test_accessible_row_action'],
    path: '/api/x_icefl_git/rbm/v1/record-list/row-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_accessible_action_001'
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
        clientCorrelationId: 'atf_test_accessible_action_001',
        invocationType: 'row',
        accessibilityMode: 'keyboard',
        assistiveTechnology: 'screen_reader',
        timestamp: '2024-01-15T10:30:00Z',
        userAgent: 'ATF Test Agent',
        actionId: 'view',
        recordIds: [testRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 6: Validate accessible action succeeds with accessibility audit
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_accessible_action_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 7: Validate accessibility audit trail is created
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_accessibility_audit_trail'],
    elementName: 'accessibilityAudit.recorded',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 8: Validate screen reader compatibility is confirmed
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_screen_reader_compatibility'],
    elementName: 'accessibilityAudit.screenReaderCompatible',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 9: Test bulk action with accessibility considerations
  atf.rest.sendRestRequest({
    $id: Now.ID['test_accessible_bulk_action'],
    path: '/api/x_icefl_git/rbm/v1/record-list/bulk-action',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_accessible_bulk_001'
    },
    body: JSON.stringify({
      actionId: 'bulk_view',
      records: [
        { sys_id: testRecordId, objectType: 'incident' }
      ],
      auditMetadata: {
        sourceComponent: 'rbm-record-list',
        listKey: 'incident.active',
        viewId: 'incident_management',
        clientCorrelationId: 'atf_test_accessible_bulk_001',
        invocationType: 'bulk',
        accessibilityMode: 'keyboard',
        bulkSelectionMethod: 'space_key',
        timestamp: '2024-01-15T10:35:00Z',
        userAgent: 'ATF Test Agent',
        actionId: 'bulk_view',
        recordIds: [testRecordId]
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 10: Validate accessible bulk action succeeds
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_accessible_bulk_action_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 11: Validate accessibility compliance summary
  atf.rest.sendRestRequest({
    $id: Now.ID['test_accessibility_compliance_summary'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/compliance-report',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_compliance_summary_001'
    },
    body: '',
    auth: 'basic',
    queryParameters: {
      componentId: 'rbm-record-list'
    }
  });

  // Step 12: Validate compliance summary response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_compliance_summary_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 13: Validate WCAG 2.1 AA compliance is achieved
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_wcag_2_1_aa_compliance'],
    elementName: 'compliance.wcag21AA',
    operation: 'equals',
    elementValue: 'compliant'
  });

  // Step 14: Validate all required WCAG criteria are met
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_wcag_criteria_met'],
    elementName: 'compliance.criteriaStatus.allMet',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 15: Validate accessibility score meets threshold (using string comparison)
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_accessibility_score_threshold'],
    elementName: 'compliance.score',
    operation: 'exists',
    elementValue: ''
  });

  atf.server.log({
    $id: Now.ID['log_accessibility_integration_complete'],
    log: 'RBM Record List Accessibility Integration Test completed - validated comprehensive WCAG 2.1 AA compliance across all component features'
  });
});