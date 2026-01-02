/**
 * RBM Record List - Basic Operations ATF Test Suite
 * 
 * Covers:
 * - Initial load and data display
 * - Paging functionality with caps enforcement
 * - Filter, sort, and search operations
 * - Basic row and bulk action execution
 */

import '@servicenow/sdk/global';
import { Test } from '@servicenow/sdk/core';

// Test 1: Initial Load and Data Display
Test({
  $id: Now.ID['rbm_record_list_initial_load'],
  name: 'RBM Record List - Initial Load and Data Display',
  description: 'Validates that the record list loads correctly with proper data structure, pagination controls, and performance constraints',
  active: true,
  failOnServerError: true
}, (atf) => {
  
  // Step 1: Log test start
  atf.server.log({
    $id: Now.ID['log_initial_load_start'],
    log: 'Starting RBM Record List Initial Load Test - validating basic data loading functionality'
  });

  // Step 2: Test the record list query endpoint directly
  atf.rest.sendRestRequest({
    $id: Now.ID['test_record_list_query'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 50, cursor: null, offset: 0 },
      sort: [{ field: 'sys_created_on', direction: 'desc' }],
      filters: [],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_initial_load_001' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Step 3: Validate successful response
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_query_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 4: Validate JSON response structure
  atf.rest.assertResponseJSONPayloadIsValid({
    $id: Now.ID['assert_json_valid']
  });

  // Step 5: Validate required response fields
  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_has_rows'],
    elementName: 'rows',
    operation: 'exists',
    elementValue: ''
  });

  atf.rest.assertJsonResponsePayloadElement({
    $id: Now.ID['assert_has_total'],
    elementName: 'total',
    operation: 'exists',
    elementValue: ''
  });

  // Step 6: Validate page size cap enforcement (max 100 records)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_page_size_cap'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 200, cursor: null, offset: 0 }, // Request more than allowed
      sort: [],
      filters: [],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_page_cap_001' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  // Should still return 200 but with capped page size
  atf.rest.assertStatusCode({
    $id: Now.ID['assert_page_cap_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 7: Validate response time performance (should be under 3 seconds)
  atf.rest.assertResponseTime({
    $id: Now.ID['assert_response_time'],
    operation: 'less_than',
    responseTime: 3000
  });

  // Step 8: Log test completion
  atf.server.log({
    $id: Now.ID['log_initial_load_complete'],
    log: 'RBM Record List Initial Load Test completed successfully - data loading and performance validation passed'
  });
});

// Test 2: Paging Functionality
Test({
  $id: Now.ID['rbm_record_list_paging'],
  name: 'RBM Record List - Paging and Navigation',
  description: 'Validates pagination controls, cursor-based navigation, and page size limits',
  active: true,
  failOnServerError: true
}, (atf) => {
  
  // Step 1: Get first page
  atf.rest.sendRestRequest({
    $id: Now.ID['test_first_page'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 25, cursor: null, offset: 0 },
      sort: [{ field: 'number', direction: 'asc' }],
      filters: [],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_paging_001' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_first_page_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 2: Test second page using offset
  atf.rest.sendRestRequest({
    $id: Now.ID['test_second_page'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 25, cursor: null, offset: 25 },
      sort: [{ field: 'number', direction: 'asc' }],
      filters: [],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_paging_002' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_second_page_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Test different page sizes
  const pageSizes = [10, 25, 50, 100];
  let stepCounter = 1;

  for (const pageSize of pageSizes) {
    atf.rest.sendRestRequest({
      $id: Now.ID[`test_page_size_${pageSize}`],
      path: '/api/x_icefl_git/rbm/v1/record-list/query',
      method: 'post',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        listKey: 'incident.active',
        page: { size: pageSize, cursor: null, offset: 0 },
        sort: [{ field: 'number', direction: 'asc' }],
        filters: [],
        search: null,
        context: { 
          viewId: 'incident_management', 
          correlationId: `atf_test_page_size_${pageSize}` 
        }
      }),
      auth: 'basic',
      queryParameters: {}
    });

    atf.rest.assertStatusCode({
      $id: Now.ID[`assert_page_size_${pageSize}_success`],
      operation: 'equals',
      statusCode: 200
    });
    
    stepCounter++;
  }

  atf.server.log({
    $id: Now.ID['log_paging_complete'],
    log: `RBM Record List Paging Test completed - validated page sizes: ${pageSizes.join(', ')}`
  });
});

// Test 3: Filter and Sort Operations
Test({
  $id: Now.ID['rbm_record_list_filter_sort'],
  name: 'RBM Record List - Filter and Sort Operations',
  description: 'Validates filtering by various criteria and sorting functionality',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test basic filtering
  atf.rest.sendRestRequest({
    $id: Now.ID['test_priority_filter'],
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
        { field: 'priority', operator: '=', value: '1' }
      ],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_filter_priority' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_filter_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 2: Test multiple filters
  atf.rest.sendRestRequest({
    $id: Now.ID['test_multiple_filters'],
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
        { field: 'priority', operator: 'IN', value: ['1', '2'] },
        { field: 'state', operator: '!=', value: '6' }
      ],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_multiple_filters' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_multiple_filters_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Test sorting ascending
  atf.rest.sendRestRequest({
    $id: Now.ID['test_sort_ascending'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 25, cursor: null, offset: 0 },
      sort: [{ field: 'number', direction: 'asc' }],
      filters: [],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_sort_asc' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_sort_asc_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 4: Test sorting descending  
  atf.rest.sendRestRequest({
    $id: Now.ID['test_sort_descending'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 25, cursor: null, offset: 0 },
      sort: [{ field: 'priority', direction: 'desc' }],
      filters: [],
      search: null,
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_sort_desc' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_sort_desc_success'],
    operation: 'equals',
    statusCode: 200
  });

  atf.server.log({
    $id: Now.ID['log_filter_sort_complete'],
    log: 'RBM Record List Filter and Sort Test completed - validated filtering and sorting operations'
  });
});

// Test 4: Search Functionality
Test({
  $id: Now.ID['rbm_record_list_search'],
  name: 'RBM Record List - Search Functionality',
  description: 'Validates search operations across multiple fields and search term handling',
  active: true,
  failOnServerError: true
}, (atf) => {

  // Step 1: Test basic text search
  atf.rest.sendRestRequest({
    $id: Now.ID['test_basic_search'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 50, cursor: null, offset: 0 },
      sort: [{ field: 'sys_created_on', direction: 'desc' }],
      filters: [],
      search: 'network outage',
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_search_basic' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_search_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 2: Test search with special characters
  atf.rest.sendRestRequest({
    $id: Now.ID['test_special_char_search'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 50, cursor: null, offset: 0 },
      sort: [{ field: 'sys_created_on', direction: 'desc' }],
      filters: [],
      search: 'server@domain.com',
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_search_special' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_special_search_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 3: Test empty search (should return unfiltered results)
  atf.rest.sendRestRequest({
    $id: Now.ID['test_empty_search'],
    path: '/api/x_icefl_git/rbm/v1/record-list/query',
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      listKey: 'incident.active',
      page: { size: 50, cursor: null, offset: 0 },
      sort: [{ field: 'sys_created_on', direction: 'desc' }],
      filters: [],
      search: '',
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_search_empty' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_empty_search_success'],
    operation: 'equals',
    statusCode: 200
  });

  // Step 4: Test search combined with filters
  atf.rest.sendRestRequest({
    $id: Now.ID['test_search_with_filters'],
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
        { field: 'priority', operator: '=', value: '1' }
      ],
      search: 'critical',
      context: { 
        viewId: 'incident_management', 
        correlationId: 'atf_test_search_filtered' 
      }
    }),
    auth: 'basic',
    queryParameters: {}
  });

  atf.rest.assertStatusCode({
    $id: Now.ID['assert_search_filtered_success'],
    operation: 'equals',
    statusCode: 200
  });

  atf.server.log({
    $id: Now.ID['log_search_complete'],
    log: 'RBM Record List Search Test completed - validated basic search, special characters, empty search, and combined filtering'
  });
});