# RBM Record List Component

## Purpose

The RBM Record List component is a reference implementation for displaying ServiceNow table records in a standardized, accessible, and performant manner. This component strictly adheres to RBM Design System standards and WCAG 2.1 AA accessibility guidelines.

## Key Features

- **Server-Side Operations**: All filtering, sorting, pagination, and search operations are performed server-side for optimal performance
- **RBM Design System Compliance**: Utilizes only approved RBM catalogue components - no custom grid implementations
- **WCAG 2.1 AA Accessibility**: Full keyboard navigation, screen reader support, and semantic HTML structure
- **ServiceNow Integration**: Native integration with ServiceNow Table API and ACL enforcement
- **React + TypeScript**: Modern, type-safe implementation with comprehensive error handling

## Constraints & Non-Negotiables

### RBM Standards Compliance
1. **Component Composition**: Must compose from RBM catalogue components only
2. **No Custom Grids**: Prohibited from implementing custom data grid solutions
3. **Server-Side Processing**: All data operations (filter/sort/paginate/search) handled by backend
4. **UI Not Security-Authoritative**: Server enforces all ACLs and security policies
5. **No Inline Editing**: Governed fields cannot be edited inline per RBM governance rules

### Technical Requirements
1. **React + TypeScript Only**: No other frameworks or plain JavaScript permitted
2. **WCAG 2.1 AA Mandatory**: All accessibility standards must be met
3. **ServiceNow Native**: Uses ServiceNow Table API exclusively for data operations
4. **Error Handling**: Comprehensive error handling for all service interactions
5. **Performance**: Optimized for large datasets through server-side processing

## Catalogue Composition Requirement

This component **MUST** be built using RBM catalogue components exclusively. Custom implementations of the following are prohibited:

- Data grids or tables
- Pagination controls  
- Sort indicators
- Filter controls
- Loading states
- Action buttons
- Search inputs

Instead, compose the solution using approved RBM catalogue components that provide these functionalities with guaranteed consistency, accessibility, and maintainability.

## Architecture Overview

```
RbmRecordList
├── Header (RBM Catalogue)
│   ├── Title Component
│   ├── Search Input (if enabled)
│   └── Action Toolbar
├── Data Grid (RBM Catalogue)
│   ├── Column Headers (sortable)
│   ├── Row Data
│   └── Selection Controls (if enabled)
├── Pagination (RBM Catalogue)
│   ├── Page Navigation
│   ├── Page Size Selector
│   └── Record Count Display
└── Footer (RBM Catalogue)
    ├── Status Messages
    └── Bulk Actions (if applicable)
```

## Data Flow

1. **Initial Load**: Component requests data with default parameters
2. **User Interaction**: User triggers filter/sort/page/search action
3. **Server Request**: New request sent to ServiceNow Table API
4. **Response Processing**: Server response validated and processed
5. **UI Update**: Component re-renders with new data
6. **Error Handling**: Any errors displayed using RBM error components

## ServiceNow Integration

- **Table API**: Primary data source using ServiceNow REST Table API
- **ACL Enforcement**: Server validates all permissions before returning data
- **Field Security**: Respects ServiceNow field-level security rules
- **Session Management**: Uses ServiceNow session tokens for authentication
- **Audit Trail**: All operations logged through ServiceNow audit framework

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support for all interactive elements
- **Screen Reader Support**: Proper ARIA labels and semantic structure
- **High Contrast**: Compatible with high contrast modes
- **Focus Management**: Clear focus indicators and logical tab order
- **Announcements**: Dynamic content changes announced to assistive technology

## Usage Guidelines

### Basic Implementation
```typescript
import { RbmRecordList } from './components/rbm-record-list';

<RbmRecordList
  tableName="incident"
  columns={columnConfig}
  showSearch={true}
  showPagination={true}
  selectable={true}
/>
```

### Advanced Configuration
```typescript
<RbmRecordList
  tableName="custom_table"
  columns={advancedColumns}
  initialRequest={{
    filters: [{ field: 'active', operator: '=', value: true }],
    sort: { field: 'created', direction: 'desc' },
    pagination: { page: 0, pageSize: 25 }
  }}
  actions={recordActions}
  onSelectionChange={handleSelection}
  ariaLabel="Custom Records Management Interface"
/>
```

## Server-Side Integration

### Scripted REST API Endpoints

The component integrates with three server-side endpoints that enforce all RBM governance and security requirements:

#### A) POST `/api/x_icefl_git/v1/record-list/query`
**Purpose**: Server-side data retrieval with filtering, sorting, and pagination

**Request Schema**:
```json
{
  "listKey": "string",
  "page": { "size": 50, "cursor": "string|null", "offset": 0|null },
  "sort": [ { "field": "string", "direction": "asc|desc" } ],
  "filters": [ { "field": "string", "operator": "string", "value": "any" } ],
  "search": "string|null",
  "context": { "viewId": "string|null", "correlationId": "string" }
}
```

**Response Schema (200)**:
```json
{
  "rows": [ { "sys_id": "string", "objectType": "string", "display": "string", "fields": { ... }, "actionAvailability": { ...optional... } } ],
  "nextCursor": "string|null",
  "total": 123|null,
  "facets": [ ...optional... ],
  "correlationId": "string"
}
```

**Server-Side Enforcement**:
- ✅ Page size maximum 200 records (hard limit)
- ✅ Server-side filtering, sorting, and pagination only
- ✅ Field-level ACL enforcement
- ✅ Payload minimization (only requested fields)
- ✅ Correlation ID tracking for all requests

#### B) POST `/api/x_icefl_git/v1/record-list/row-action`
**Purpose**: Execute individual record actions with full governance

**Request Schema**:
```json
{
  "actionId": "string",
  "record": { "sys_id": "string", "objectType": "string" },
  "metadata": {
    "sourceComponent": "rbm-record-list",
    "listKey": "string",
    "viewId": "string|null",
    "clientCorrelationId": "string",
    "invocationType": "row",
    "justification": "string|null"
  }
}
```

**Server-Side Enforcement**:
- ✅ Role/state/ACL checks per action
- ✅ 403 responses on access denial
- ✅ Comprehensive audit evidence with justification
- ✅ Source component tracking for governance

#### C) POST `/api/x_icefl_git/v1/record-list/bulk-action`  
**Purpose**: Bulk operations with per-record status tracking

**Request Schema**:
```json
{
  "actionId": "string",
  "records": [ { "sys_id": "string", "objectType": "string" } ],
  "metadata": {
    "sourceComponent": "rbm-record-list",
    "listKey": "string",
    "viewId": "string|null",
    "clientCorrelationId": "string",
    "invocationType": "bulk",
    "selectionCount": 10,
    "justification": "string|null"
  }
}
```

**Server-Side Enforcement**:
- ✅ Bulk operation cap: maximum 100 records per request
- ✅ Parent batch audit + per-record child entries
- ✅ Partial failure handling with per-record status
- ✅ Batch correlation ID tracking

### Data Provider Integration

The `RecordListDataProvider` class handles all client-server communication:

**Key Features**:
- ✅ Comprehensive error handling with try/catch at async boundaries
- ✅ Correlation ID propagation to UI error displays  
- ✅ ServiceNow authentication via `X-UserToken: window.g_ck`
- ✅ Request/response transformation between client and server schemas
- ✅ Network failure and JSON parsing error handling

**Usage**:
```typescript
import { createRecordListDataProvider } from '../../services/rbm-record-list';

const dataProvider = createRecordListDataProvider();

// Will handle all server communication, error handling, and correlation tracking
<RbmRecordList
  dataProvider={dataProvider}
  // ... other props
/>
```

## Development Status

**Current Phase**: Server Integration Complete
- ✅ Component structure established
- ✅ TypeScript interfaces defined  
- ✅ RBM catalogue component integration complete
- ✅ **Scripted REST API implemented with full governance**
- ✅ **RecordListDataProvider with comprehensive error handling**
- ✅ **Correlation ID tracking and audit logging**
- ✅ Documentation completed
- ⏳ Data wiring between provider and component pending
- ⏳ Accessibility features pending

## Next Steps

1. Wire data provider to component state management
2. Implement loading, error, and empty state handling
3. Add real-time data refresh and caching
4. Implement accessibility features and ARIA support  
5. Add comprehensive testing coverage
6. Performance optimization and monitoring