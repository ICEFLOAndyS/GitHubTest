/**
 * RBM Record List - Security Tests
 * Tests security features: denied actions, masked fields
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RbmRecordList from '../RbmRecordList';
import { DataProvider, RbmRecord } from '../types';

// Security test data provider
const createSecurityTestProvider = (overrides: Partial<DataProvider> = {}): DataProvider => ({
  fetchRecords: vi.fn().mockResolvedValue({
    records: securityTestRecords,
    pagination: {
      currentPage: 0,
      pageSize: 50,
      totalRecords: 2,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false
    },
    success: true
  }),
  executeAction: vi.fn().mockResolvedValue({
    success: true,
    correlationId: 'security-test-123'
  }),
  executeBulkAction: vi.fn().mockResolvedValue({
    success: true,
    correlationId: 'bulk-security-test-123'
  }),
  ...overrides
});

// Mock records with security context
const securityTestRecords: RbmRecord[] = [
  {
    sys_id: { value: 'secure-rec1', display_value: 'secure-rec1' },
    name: { value: 'Public Record', display_value: 'Public Record' },
    sensitive_field: { value: '***MASKED***', display_value: '***MASKED***' },
    status: { value: 'active', display_value: 'Active' },
    actionAvailability: {
      edit: { available: true, enabled: true },
      delete: { available: false, enabled: false, reason: 'Insufficient privileges' },
      sensitive_action: { available: false, enabled: false, reason: 'Access denied' }
    }
  },
  {
    sys_id: { value: 'secure-rec2', display_value: 'secure-rec2' },
    name: { value: 'Restricted Record', display_value: 'Restricted Record' },
    sensitive_field: null, // Field not returned for security
    status: { value: 'restricted', display_value: 'Restricted' },
    actionAvailability: {
      edit: { available: false, enabled: false, reason: 'Record is restricted' },
      delete: { available: false, enabled: false, reason: 'Access denied' },
      view: { available: true, enabled: true }
    }
  }
];

const securityTestColumns = [
  { field: 'name', label: 'Name', sortable: true },
  { field: 'sensitive_field', label: 'Sensitive Data', sortable: false },
  { field: 'status', label: 'Status', sortable: true }
];

const securityTestActions = [
  {
    id: 'edit',
    label: 'Edit',
    category: 'primary' as const,
    advisorySecurity: {
      hideWhenUnavailable: false,
      disableWhenUnavailable: true,
      disabledTooltip: 'Edit not available for this record'
    }
  },
  {
    id: 'delete',
    label: 'Delete',
    category: 'destructive' as const,
    advisorySecurity: {
      hideWhenUnavailable: true
    }
  },
  {
    id: 'sensitive_action',
    label: 'Sensitive Action',
    category: 'secondary' as const,
    advisorySecurity: {
      hideWhenUnavailable: true
    }
  }
];

describe('RbmRecordList - Security Tests', () => {
  let mockDataProvider: DataProvider;

  beforeEach(() => {
    mockDataProvider = createSecurityTestProvider();
    vi.clearAllMocks();
  });

  describe('Action Security', () => {
    it('should handle denied actions with proper error display', async () => {
      const deniedProvider = createSecurityTestProvider({
        executeAction: vi.fn().mockResolvedValue({
          success: false,
          error: '403 Forbidden: Access denied - CorrelationId: access-denied-123',
          correlationId: 'access-denied-123'
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          actions={securityTestActions}
          dataProvider={deniedProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // Try to execute edit action
      const actionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(actionsButton);

      const editAction = screen.getByRole('menuitem', { name: /edit/i });
      fireEvent.click(editAction);

      // Should show permission denied message
      await waitFor(() => {
        expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument();
        expect(screen.getByText(/access-denied-123/i)).toBeInTheDocument();
      });

      // Component should continue functioning normally
      expect(screen.getByText('Public Record')).toBeInTheDocument();
    });

    it('should hide actions based on actionAvailability', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          actions={securityTestActions}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // First record: delete should be hidden, edit should be visible
      const firstRowActionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(firstRowActionsButton);

      // Edit should be visible and enabled
      expect(screen.getByRole('menuitem', { name: /edit/i })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: /edit/i })).not.toHaveAttribute('disabled');

      // Delete should be hidden (hideWhenUnavailable: true)
      expect(screen.queryByRole('menuitem', { name: /delete/i })).not.toBeInTheDocument();

      // Sensitive action should be hidden
      expect(screen.queryByRole('menuitem', { name: /sensitive action/i })).not.toBeInTheDocument();
    });

    it('should disable actions based on actionAvailability', async () => {
      const disabledActionRecords = [{
        ...securityTestRecords[0],
        actionAvailability: {
          edit: { available: true, enabled: false, reason: 'Record locked for editing' },
          delete: { available: true, enabled: false, reason: 'Cannot delete active record' }
        }
      }];

      const disabledProvider = createSecurityTestProvider({
        fetchRecords: vi.fn().mockResolvedValue({
          records: disabledActionRecords,
          pagination: { currentPage: 0, pageSize: 50, totalRecords: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
          success: true
        })
      });

      const disableActions = [
        {
          id: 'edit',
          label: 'Edit',
          advisorySecurity: {
            disableWhenUnavailable: true,
            disabledTooltip: 'Record locked for editing'
          }
        },
        {
          id: 'delete',
          label: 'Delete',
          advisorySecurity: {
            disableWhenUnavailable: true,
            disabledTooltip: 'Cannot delete active record'
          }
        }
      ];

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          actions={disableActions}
          dataProvider={disabledProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      const actionsButton = screen.getByRole('button', { name: /actions/i });
      fireEvent.click(actionsButton);

      // Actions should be visible but disabled
      const editAction = screen.getByRole('menuitem', { name: /edit/i });
      const deleteAction = screen.getByRole('menuitem', { name: /delete/i });

      expect(editAction).toBeInTheDocument();
      expect(editAction).toHaveAttribute('disabled');
      expect(deleteAction).toBeInTheDocument();
      expect(deleteAction).toHaveAttribute('disabled');
    });

    it('should handle server-side security on bulk actions', async () => {
      const securityErrorProvider = createSecurityTestProvider({
        executeBulkAction: vi.fn().mockResolvedValue({
          success: false,
          error: '403 Forbidden: Insufficient privileges for bulk operation',
          correlationId: 'bulk-security-error-123'
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          selectionMode="multiple"
          bulkActions={mockBulkActions}
          dataProvider={securityErrorProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // Select records
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      // Execute bulk action
      const bulkActivateButton = screen.getByRole('button', { name: /activate selected/i });
      fireEvent.click(bulkActivateButton);

      await waitFor(() => {
        expect(screen.getByText(/insufficient privileges/i)).toBeInTheDocument();
        expect(screen.getByText(/bulk-security-error-123/i)).toBeInTheDocument();
      });
    });
  });

  describe('Masked Fields', () => {
    it('should not render sensitive field values', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // Should show masked value, not actual sensitive data
      expect(screen.getByText('***MASKED***')).toBeInTheDocument();

      // Should not contain any sensitive field content that wasn't masked
      expect(screen.queryByText(/secret/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/password/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/ssn/i)).not.toBeInTheDocument();
    });

    it('should handle null sensitive fields correctly', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Restricted Record')).toBeInTheDocument();
      });

      // Second record has null sensitive_field - should show empty
      const restrictedRow = screen.getByText('Restricted Record').closest('tr');
      expect(restrictedRow).toBeInTheDocument();
      
      // The sensitive field cell should be empty/not contain sensitive data
      const cells = restrictedRow?.querySelectorAll('td');
      const sensitiveFieldCell = cells?.[1]; // sensitive_field is second column
      expect(sensitiveFieldCell?.textContent?.trim()).toBe('');
    });

    it('should not expose sensitive data in DOM attributes', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // Check that no DOM attributes contain sensitive data
      const allElements = screen.getByText('Public Record').closest('[data-testid]') as HTMLElement;
      const allAttributes = Array.from(allElements.attributes);
      
      allAttributes.forEach(attr => {
        expect(attr.value).not.toMatch(/secret|password|ssn|private/i);
      });
    });
  });

  describe('Permission Error Recovery', () => {
    it('should recover from permission errors without component failure', async () => {
      let callCount = 0;
      const recoveryProvider = createSecurityTestProvider({
        executeAction: vi.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({
              success: false,
              error: '403 Permission denied',
              correlationId: 'recovery-test-123'
            });
          }
          return Promise.resolve({
            success: true,
            correlationId: 'recovery-success-123'
          });
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          actions={securityTestActions}
          dataProvider={recoveryProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // First action - denied
      const actionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(actionsButton);

      const editAction = screen.getByRole('menuitem', { name: /edit/i });
      fireEvent.click(editAction);

      await waitFor(() => {
        expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument();
      });

      // Dismiss error
      const dismissButton = screen.getByRole('button', { name: /dismiss/i });
      fireEvent.click(dismissButton);

      // Try same action again - should succeed
      fireEvent.click(actionsButton);
      fireEvent.click(screen.getByRole('menuitem', { name: /edit/i }));

      await waitFor(() => {
        expect(screen.queryByText(/you do not have permission/i)).not.toBeInTheDocument();
      });

      expect(recoveryProvider.executeAction).toHaveBeenCalledTimes(2);
    });

    it('should maintain UI state after security errors', async () => {
      const errorProvider = createSecurityTestProvider({
        executeAction: vi.fn().mockResolvedValue({
          success: false,
          error: '403 Forbidden',
          correlationId: 'state-test-123'
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          selectionMode="multiple"
          actions={securityTestActions}
          dataProvider={errorProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // Select a record
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);

      expect(screen.getByText(/1.*selected/i)).toBeInTheDocument();

      // Try action that will fail
      const actionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(actionsButton);

      const editAction = screen.getByRole('menuitem', { name: /edit/i });
      fireEvent.click(editAction);

      await waitFor(() => {
        expect(screen.getByText(/forbidden/i)).toBeInTheDocument();
      });

      // Selection should still be maintained
      expect(screen.getByText(/1.*selected/i)).toBeInTheDocument();

      // Other UI elements should still be functional
      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      fireEvent.click(nameHeader);

      await waitFor(() => {
        expect(errorProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sort: { field: 'name', direction: 'asc' }
          })
        );
      });
    });
  });

  describe('Data Sanitization', () => {
    it('should not render script tags from field values', async () => {
      const xssTestRecords = [{
        sys_id: { value: 'xss-test', display_value: 'xss-test' },
        name: { 
          value: '<script>alert("xss")</script>Malicious Name',
          display_value: '<script>alert("xss")</script>Malicious Name'
        },
        status: { value: 'active', display_value: 'Active' }
      }];

      const xssProvider = createSecurityTestProvider({
        fetchRecords: vi.fn().mockResolvedValue({
          records: xssTestRecords,
          success: true,
          pagination: { currentPage: 0, pageSize: 50, totalRecords: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          dataProvider={xssProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/malicious name/i)).toBeInTheDocument();
      });

      // Script tag should be rendered as text, not executed
      expect(document.querySelectorAll('script')).toHaveLength(0);
      expect(screen.getByText(/script/i)).toBeInTheDocument(); // As text content
    });

    it('should sanitize ARIA labels from field values', async () => {
      const ariaSanitizationRecords = [{
        sys_id: { value: 'aria-test', display_value: 'aria-test' },
        name: { 
          value: 'Test" aria-label="malicious" onclick="alert(1)"',
          display_value: 'Test" aria-label="malicious" onclick="alert(1)"'
        }
      }];

      const ariaProvider = createSecurityTestProvider({
        fetchRecords: vi.fn().mockResolvedValue({
          records: ariaSanitizationRecords,
          success: true,
          pagination: { currentPage: 0, pageSize: 50, totalRecords: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          dataProvider={ariaProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/test.*malicious/i)).toBeInTheDocument();
      });

      // Check that malicious attributes are not present
      const gridCells = screen.getAllByRole('gridcell');
      gridCells.forEach(cell => {
        expect(cell).not.toHaveAttribute('onclick');
        // ARIA label should be sanitized
        const ariaLabel = cell.getAttribute('aria-label');
        if (ariaLabel) {
          expect(ariaLabel).not.toContain('onclick');
        }
      });
    });
  });

  describe('Access Control Integration', () => {
    it('should respect ACL restrictions on field visibility', async () => {
      const aclRestrictedRecords = [{
        sys_id: { value: 'acl-test', display_value: 'acl-test' },
        name: { value: 'Public Name', display_value: 'Public Name' },
        // sensitive_field is completely omitted due to ACL
        status: { value: 'active', display_value: 'Active' }
      }];

      const aclProvider = createSecurityTestProvider({
        fetchRecords: vi.fn().mockResolvedValue({
          records: aclRestrictedRecords,
          success: true,
          pagination: { currentPage: 0, pageSize: 50, totalRecords: 1, totalPages: 1, hasNextPage: false, hasPreviousPage: false }
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          dataProvider={aclProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Name')).toBeInTheDocument();
      });

      // Sensitive field column should show empty cell
      const dataRows = screen.getAllByRole('row').slice(1); // Skip header
      const firstDataRow = dataRows[0];
      const cells = firstDataRow.querySelectorAll('[role="gridcell"]');
      
      // Find sensitive field cell (column index 1)
      const sensitiveFieldCell = cells[1];
      expect(sensitiveFieldCell.textContent?.trim()).toBe('');
    });

    it('should handle mixed security levels in batch operations', async () => {
      const mixedSecurityProvider = createSecurityTestProvider({
        executeBulkAction: vi.fn().mockResolvedValue({
          success: false,
          error: 'Partial failure: Security denied for 1 of 2 records',
          correlationId: 'mixed-security-123',
          details: {
            successful: ['secure-rec1'],
            failed: ['secure-rec2'],
            errors: {
              'secure-rec2': 'Access denied for restricted record'
            }
          }
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={securityTestColumns}
          selectionMode="multiple"
          bulkActions={mockBulkActions}
          dataProvider={mixedSecurityProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Public Record')).toBeInTheDocument();
      });

      // Select both records
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      // Execute bulk action
      const bulkButton = screen.getByRole('button', { name: /activate selected/i });
      fireEvent.click(bulkButton);

      await waitFor(() => {
        expect(screen.getByText(/partial failure/i)).toBeInTheDocument();
        expect(screen.getByText(/security denied/i)).toBeInTheDocument();
        expect(screen.getByText(/mixed-security-123/i)).toBeInTheDocument();
      });
    });
  });
});