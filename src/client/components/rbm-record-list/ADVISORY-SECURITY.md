# RBM Advisory Security Implementation

## Overview

The rbm-record-list component implements **advisory security behavior** where the UI provides hints while the server remains the sole security authority. This approach balances user experience with security compliance.

## Core Principles

### 1. Server-Side Authority (MANDATORY)
- Server is the **ONLY** source of security truth
- UI security logic is **advisory only** - provides user experience hints
- Server validates ALL permissions regardless of UI state

### 2. Advisory UI Gating (OPTIONAL)
The UI **MAY** hide or disable actions based on:
- Action descriptor conditions (`ActionDef.conditions`)  
- Server-provided `actionAvailability` flags per record

The UI **MUST NOT**:
- Assume hidden/disabled = permitted/denied
- Perform security enforcement locally
- Skip server validation based on UI state

### 3. Graceful Denial Handling (MANDATORY)
When server returns 403:
- Display inline, non-blocking error message
- Standard message: "You do not have permission to perform this action."
- Always display correlation ID for support
- Component continues functioning normally

## Implementation Details

### ActionAvailability Server Response
```json
{
  "rows": [
    {
      "sys_id": "abc123",
      "fields": { ... },
      "actionAvailability": {
        "edit": {
          "available": true,
          "enabled": false,
          "reason": "Record is read-only in current state"
        },
        "delete": {
          "available": false,
          "reason": "Delete not permitted for this record type"
        }
      }
    }
  ]
}
```

### Action Descriptor Advisory Security
```typescript
const actionDef: ActionDef = {
  id: 'edit',
  label: 'Edit Record',
  advisorySecurity: {
    hideWhenUnavailable: false,    // Keep visible even when unavailable
    disableWhenUnavailable: true,  // But disable when server says unavailable
    disabledTooltip: 'Edit access not available for this record'
  },
  conditions: {
    // UI-side advisory logic (server still validates)
    visible: (record) => record.state !== 'closed',
    enabled: (record) => !!record.assigned_to
  }
};
```

### Enhanced Error Handling
```typescript
const handleActionError = (actionId, record, errorMessage, correlationId) => {
  // Check for permission denial
  const isPermissionDenied = errorMessage.includes('403') || 
                            errorMessage.includes('permission');
  
  if (isPermissionDenied) {
    // Standard RBM permission denial message
    displayMessage = 'You do not have permission to perform this action.';
  }
  
  // Show non-blocking inline error with correlation ID
  setActionError({
    message: displayMessage,
    correlationId: correlationId
  });
  
  // CRITICAL: Component continues functioning normally
  console.log('Component continues normal operation after security denial');
};
```

## Security Behavior Patterns

### Pattern 1: Hide When Unavailable
**Use Case**: Actions that should not be visible to certain users
```typescript
advisorySecurity: {
  hideWhenUnavailable: true  // Hide action when server says unavailable
}
```
**Result**: Action disappears from menu when `actionAvailability[actionId].available === false`

### Pattern 2: Disable When Unavailable  
**Use Case**: Actions that should be visible but not executable
```typescript
advisorySecurity: {
  hideWhenUnavailable: false,
  disableWhenUnavailable: true,
  disabledTooltip: 'Permission required for this action'
}
```
**Result**: Action shown but disabled when `actionAvailability[actionId].enabled === false`

### Pattern 3: Always Attempt (Default)
**Use Case**: Actions where UI cannot predict availability
```typescript
// No advisorySecurity configuration
```
**Result**: Action always shown/enabled, server handles all validation

## Error Response Handling

### Success Response
```json
{
  "result": { ... },
  "correlationId": "rbm_12345"
}
```
**Action**: Re-fetch data, notify success, continue normal operation

### Permission Denied (403)
```json
{
  "error": {
    "code": "PERMISSION_DENIED", 
    "message": "Delete access denied for this record"
  },
  "correlationId": "rbm_12345"
}
```
**Action**: 
- Display standard message: "You do not have permission to perform this action."
- Show correlation ID: "rbm_12345"
- Component continues functioning normally

### Validation Error (400)
```json
{
  "error": {
    "code": "INVALID_ACTION",
    "message": "Action 'custom_action' is not supported for this record type"
  },
  "correlationId": "rbm_12345"
}
```
**Action**: Display server error message as-is with correlation ID

### Server Error (500)
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Internal server error"
  },
  "correlationId": "rbm_12345"
}
```
**Action**: Display generic error with correlation ID for support

## Testing Advisory Security

### Manual Testing Scenarios

1. **Hidden Actions**: Verify actions disappear when `hideWhenUnavailable: true` and server returns `available: false`

2. **Disabled Actions**: Verify actions become disabled when `disableWhenUnavailable: true` and server returns `enabled: false`

3. **Permission Denials**: Attempt actions that should fail with 403, verify:
   - Standard error message displayed
   - Correlation ID shown
   - Component continues functioning
   - No UI state corruption

4. **Tooltip Display**: Hover over disabled actions to verify custom tooltip appears

5. **Keyboard Navigation**: Ensure disabled actions are properly announced by screen readers

### Automated Testing Approach

```javascript
// Test: Advisory hiding behavior
expect(getVisibleActions(recordWithUnavailableEdit))
  .not.toContain(editActionWithHideWhenUnavailable);

// Test: Advisory disabling behavior  
expect(getActionEnablement(editAction, recordWithDisabledEdit))
  .toEqual({ enabled: false, reason: 'Edit not permitted' });

// Test: 403 error handling
await simulateActionError('delete', record, '403 Permission denied', 'corr_123');
expect(screen.getByText('You do not have permission to perform this action.'))
  .toBeInTheDocument();
expect(screen.getByText('Correlation ID: corr_123')).toBeInTheDocument();

// Test: Component continues functioning after denial
expect(screen.getByRole('button', { name: 'Refresh' })).toBeEnabled();
```

## Security Compliance

✅ **Server Authority**: All security decisions made server-side
✅ **Advisory UI**: Client provides UX hints only  
✅ **Never Assume**: UI never assumes security state
✅ **Graceful Failures**: Standard error messaging with correlation tracking
✅ **Continued Operation**: Component remains functional after denials
✅ **Audit Compliance**: All actions logged with correlation IDs
✅ **No Duplication**: Security logic exists only on server

This implementation ensures RBM security governance while maintaining optimal user experience through advisory UI behavior.