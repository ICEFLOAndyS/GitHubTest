/**
 * RBM Record List - Accessibility Compliance ATF Test Suite
 * 
 * Tests WCAG 2.1 AA compliance through server-side validation and component behavior:
 * - Component configuration validation (WCAG 4.1.2)
 * - ARIA metadata verification (WCAG 4.1.2)
 * - Accessibility feature enablement (WCAG 2.1.1, 2.4.7)
 * - Screen reader support validation (WCAG 4.1.3)
 */

import '@servicenow/sdk/global';
import { Test } from '@servicenow/sdk/core';

// Test 1: Component ARIA Configuration Validation
Test({
  $id: Now.ID['rbm_record_list_aria_configuration'],
  name: 'RBM Record List - ARIA Configuration Validation',
  description: 'Validates ARIA roles, labels, and properties are properly configured via REST API according to WCAG 4.1.2',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test component configuration endpoint with accessibility settings
  atf.rest.sendRestRequest({
    $id: Now.ID['test_aria_configuration'],
    path: '/api/x_icefl_git/rbm/v1/record-list/config',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_aria_config_001'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      selectionMode: 'multiple',
      a11y: {
        ariaLabel: 'Incident records list',
        showKeyboardInstructions: true,
        descriptions: {
          tableDescription: 'Searchable and sortable incident records',
          filtersDescription: 'Filter options for incident data',
          paginationDescription: 'Navigate between pages of incidents'
        }
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate successful configuration
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_aria_config_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Validate ARIA configuration is properly structured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_aria_config_structure'],
    elementName: 'accessibility.ariaLabel',
    operation: 'equals',
    elementValue: 'Incident records list'
  });

  // Step 4: Validate keyboard instructions are enabled
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_keyboard_instructions_enabled'],
    elementName: 'accessibility.keyboardNavigation.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 5: Validate table description is set
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_table_description_set'],
    elementName: 'accessibility.descriptions.tableDescription',
    operation: 'equals',
    elementValue: 'Searchable and sortable incident records'
  });

  // Step 6: Test multi-select accessibility configuration
  atf.rest.sendRestRequest({
    $id: Now.ID['test_multiselect_aria_config'],
    path: '/api/x_icefl_git/rbm/v1/record-list/config',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_multiselect_aria_001'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      selectionMode: 'multiple',
      enableBulkActions: true
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 7: Validate multi-selectable configuration
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_multiselect_aria_enabled'],
    elementName: 'accessibility.multiselectable',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 8: Validate bulk action accessibility is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_bulk_action_accessibility'],
    elementName: 'accessibility.bulkActions.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  atf.server.log({
    $id: Now.ID['log_aria_config_complete'],
    log: 'RBM Record List ARIA Configuration Test completed - validated WCAG 4.1.2 ARIA structure compliance'
  });
});

// Test 2: Accessibility Feature Enablement Validation
Test({
  $id: Now.ID['rbm_record_list_accessibility_features'],
  name: 'RBM Record List - Accessibility Features Validation',
  description: 'Validates accessibility features are properly enabled according to WCAG 2.1.1 and 2.4.7',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test component data with accessibility metadata
  atf.rest.sendRestRequest({
    $id: Now.ID['test_data_with_accessibility'],
    path: '/api/x_icefl_git/rbm/v1/record-list/data',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_accessibility_features_001'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      includeAccessibilityMetadata: true,
      pagination: {
        pageSize: 10,
        cursor: null
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate response includes accessibility metadata
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_accessibility_data_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Validate keyboard navigation metadata is present
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_keyboard_navigation_metadata'],
    elementName: 'accessibility.keyboardNavigation',
    operation: 'exists',
    elementValue: ''
  });

  // Step 4: Validate focus management metadata is present
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_focus_management_metadata'],
    elementName: 'accessibility.focusManagement',
    operation: 'exists',
    elementValue: ''
  });

  // Step 5: Validate screen reader support metadata is present
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_screen_reader_metadata'],
    elementName: 'accessibility.screenReader',
    operation: 'exists',
    elementValue: ''
  });

  // Step 6: Test with high contrast mode configuration
  atf.rest.sendRestRequest({
    $id: Now.ID['test_high_contrast_mode'],
    path: '/api/x_icefl_git/rbm/v1/record-list/config',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_high_contrast_001'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      accessibility: {
        highContrastMode: true,
        enhancedFocusIndicators: true
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 7: Validate high contrast configuration
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_high_contrast_enabled'],
    elementName: 'accessibility.visualEnhancements.highContrast',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 8: Validate enhanced focus indicators
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_enhanced_focus_enabled'],
    elementName: 'accessibility.visualEnhancements.focusIndicators',
    operation: 'equals',
    elementValue: 'enhanced'
  });

  atf.server.log({
    $id: Now.ID['log_accessibility_features_complete'],
    log: 'RBM Record List Accessibility Features Test completed - validated WCAG 2.1.1 and 2.4.7 feature enablement compliance'
  });
});

// Test 3: Screen Reader Support Validation
Test({
  $id: Now.ID['rbm_record_list_screen_reader_support'],
  name: 'RBM Record List - Screen Reader Support Validation',
  description: 'Validates screen reader announcements and live regions according to WCAG 4.1.3',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test selection announcement endpoint
  atf.rest.sendRestRequest({
    $id: Now.ID['test_selection_announcements'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/announcements',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_announcements_001'
    },
    body: JSON.stringify({
      eventType: 'selection_change',
      selectedCount: 3,
      totalCount: 25,
      recordType: 'incidents'
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate announcement response structure
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_announcement_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Validate announcement message format
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_announcement_message'],
    elementName: 'announcement.message',
    operation: 'contains',
    elementValue: '3 of 25 incidents selected'
  });

  // Step 4: Validate announcement priority
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_announcement_priority'],
    elementName: 'announcement.priority',
    operation: 'equals',
    elementValue: 'polite'
  });

  // Step 5: Test action result announcements
  atf.rest.sendRestRequest({
    $id: Now.ID['test_action_announcements'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/announcements',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_action_announcements_001'
    },
    body: JSON.stringify({
      eventType: 'action_result',
      success: true,
      actionId: 'delete',
      recordCount: 1,
      context: 'incident INC0000123'
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 6: Validate action result announcement
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_action_result_announcement'],
    elementName: 'announcement.message',
    operation: 'contains',
    elementValue: 'delete completed for incident INC0000123'
  });

  // Step 7: Test error announcements (assertive priority)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_error_announcements'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/announcements',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_error_announcements_001'
    },
    body: JSON.stringify({
      eventType: 'error',
      errorMessage: 'Permission denied for delete action',
      severity: 'high'
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 8: Validate error announcement priority is assertive
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_error_announcement_priority'],
    elementName: 'announcement.priority',
    operation: 'equals',
    elementValue: 'assertive'
  });

  // Step 9: Test loading state announcements
  atf.rest.sendRestRequest({
    $id: Now.ID['test_loading_announcements'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/announcements',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_loading_announcements_001'
    },
    body: JSON.stringify({
      eventType: 'loading_state_change',
      loading: false,
      context: 'incident records',
      resultCount: 15
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 10: Validate loading completion announcement
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_loading_complete_announcement'],
    elementName: 'announcement.message',
    operation: 'contains',
    elementValue: 'incident records loaded'
  });

  // Step 11: Validate result count is announced
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_result_count_announcement'],
    elementName: 'announcement.message',
    operation: 'contains',
    elementValue: '15'
  });

  atf.server.log({
    $id: Now.ID['log_screen_reader_support_complete'],
    log: 'RBM Record List Screen Reader Support Test completed - validated WCAG 4.1.3 screen reader announcement compliance'
  });
});

// Test 4: Keyboard Navigation Support Validation
Test({
  $id: Now.ID['rbm_record_list_keyboard_support_validation'],
  name: 'RBM Record List - Keyboard Navigation Support',
  description: 'Validates keyboard navigation features are properly configured according to WCAG 2.1.1',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test keyboard navigation configuration
  atf.rest.sendRestRequest({
    $id: Now.ID['test_keyboard_navigation_config'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/keyboard-config',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_keyboard_config_001'
    },
    body: '',
    auth: 'basic',
    queryParameters: {
      listKey: 'incident.active',
      selectionMode: 'multiple'
    }
  });

  // Step 2: Validate keyboard configuration response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_keyboard_config_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Validate arrow key navigation is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_arrow_navigation_enabled'],
    elementName: 'keyboardNavigation.arrowKeys.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 4: Validate space key selection is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_space_selection_enabled'],
    elementName: 'keyboardNavigation.spaceSelection.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 5: Validate enter key activation is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_enter_activation_enabled'],
    elementName: 'keyboardNavigation.enterActivation.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 6: Validate escape key modal handling is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_escape_handling_enabled'],
    elementName: 'keyboardNavigation.escapeHandling.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 7: Test keyboard instructions endpoint
  atf.rest.sendRestRequest({
    $id: Now.ID['test_keyboard_instructions'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/keyboard-instructions',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_keyboard_instructions_001'
    },
    body: '',
    auth: 'basic',
    queryParameters: {}
  });

  // Step 8: Validate keyboard instructions are provided
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_keyboard_instructions_provided'],
    elementName: 'instructions',
    operation: 'exists',
    elementValue: ''
  });

  // Step 9: Validate arrow key instructions are included
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_arrow_key_instructions'],
    elementName: 'instructions.arrowKeys',
    operation: 'contains',
    elementValue: 'Navigate within the grid'
  });

  // Step 10: Validate tab key instructions are included
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_tab_key_instructions'],
    elementName: 'instructions.tab',
    operation: 'contains',
    elementValue: 'Navigate between sections'
  });

  atf.server.log({
    $id: Now.ID['log_keyboard_support_complete'],
    log: 'RBM Record List Keyboard Navigation Support Test completed - validated WCAG 2.1.1 keyboard accessibility compliance'
  });
});

// Test 5: Focus Management Validation
Test({
  $id: Now.ID['rbm_record_list_focus_management_validation'],
  name: 'RBM Record List - Focus Management Validation',
  description: 'Validates focus management and restoration features according to WCAG 2.4.3 and 2.4.7',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test focus configuration endpoint
  atf.rest.sendRestRequest({
    $id: Now.ID['test_focus_configuration'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/focus-config',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_focus_config_001'
    },
    body: '',
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate focus configuration response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_focus_config_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Validate focus zones are defined
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_focus_zones_defined'],
    elementName: 'focusManagement.zones',
    operation: 'exists',
    elementValue: ''
  });

  // Step 4: Validate skip links are configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_skip_links_configured'],
    elementName: 'focusManagement.skipLinks.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 5: Validate focus restoration is enabled
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_focus_restoration_enabled'],
    elementName: 'focusManagement.restoration.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 6: Test modal focus trap configuration
  atf.rest.sendRestRequest({
    $id: Now.ID['test_modal_focus_trap_config'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/modal-config',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_modal_focus_001'
    },
    body: '',
    auth: 'basic',
    queryParameters: {}
  });

  // Step 7: Validate modal focus trap is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_modal_focus_trap_enabled'],
    elementName: 'modals.focusTrap.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 8: Validate modal aria-modal is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_modal_aria_modal_enabled'],
    elementName: 'modals.ariaModal.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 9: Validate focus indicator visibility is configured
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_focus_indicator_visibility'],
    elementName: 'focusManagement.indicators.visible',
    operation: 'equals',
    elementValue: 'true'
  });

  atf.server.log({
    $id: Now.ID['log_focus_management_complete'],
    log: 'RBM Record List Focus Management Test completed - validated WCAG 2.4.3 and 2.4.7 focus management compliance'
  });
});

// Test 6: Color Independence Validation
Test({
  $id: Now.ID['rbm_record_list_color_independence'],
  name: 'RBM Record List - Color Independence Validation',  
  description: 'Validates visual indicators use multiple cues beyond color according to WCAG 1.4.1',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test visual indicator configuration
  atf.rest.sendRestRequest({
    $id: Now.ID['test_visual_indicators_config'],
    path: '/api/x_icefl_git/rbm/v1/record-list/accessibility/visual-indicators',
    method: 'get',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_visual_indicators_001'
    },
    body: '',
    auth: 'basic',
    queryParameters: {}
  });

  // Step 2: Validate visual indicators configuration
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_visual_indicators_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Validate icon indicators are enabled
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_icon_indicators_enabled'],
    elementName: 'visualIndicators.icons.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 4: Validate text indicators are enabled  
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_text_indicators_enabled'],
    elementName: 'visualIndicators.text.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 5: Validate pattern indicators are enabled
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_pattern_indicators_enabled'],
    elementName: 'visualIndicators.patterns.enabled',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 6: Validate color-independent status communication
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_color_independent_status'],
    elementName: 'visualIndicators.colorIndependent',
    operation: 'equals',
    elementValue: 'true'
  });

  // Step 7: Test status indicator metadata
  atf.rest.sendRestRequest({
    $id: Now.ID['test_status_indicator_metadata'],
    path: '/api/x_icefl_git/rbm/v1/record-list/data',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'X-RBM-CorrelationId': 'atf_test_status_metadata_001'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      includeStatusMetadata: true,
      pagination: {
        pageSize: 5,
        cursor: null
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 8: Validate status metadata includes text alternatives
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_status_text_alternatives'],
    elementName: 'records.0.statusMetadata.textAlternative',
    operation: 'exists',
    elementValue: ''
  });

  // Step 9: Validate status metadata includes icon reference
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_status_icon_reference'],
    elementName: 'records.0.statusMetadata.iconName',
    operation: 'exists',
    elementValue: ''
  });

  atf.server.log({
    $id: Now.ID['log_color_independence_complete'],
    log: 'RBM Record List Color Independence Test completed - validated WCAG 1.4.1 multiple visual cue compliance'
  });
});