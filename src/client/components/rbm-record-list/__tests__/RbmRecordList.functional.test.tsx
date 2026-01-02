/**
 * RBM Record List - Functional Tests
 * Tests core functionality: load, paging, filter, sort, search, actions
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RbmRecordList from '../RbmRecordList';
import { DataProvider, RbmRecord } from '../types';

// Mock data provider
const createMockDataProvider = (overrides: Partial<DataProvider> = {}): DataProvider => ({
  fetchRecords: vi.fn().mockResolvedValue({
    records: mockRecords,
    pagination: {
      currentPage: 0,
      pageSize: 50,
      totalRecords: 100,
      totalPages: 2,
      hasNextPage: true,
      hasPreviousPage: false
    },
    success: true,
    metadata: {
      timestamp: new Date().toISOString(),
      executionTime: 150,
      correlationId: 'test-correlation-123'
    }
  }),
  executeAction: vi.fn().mockResolvedValue({
    success: true,
    correlationId: 'action-correlation-123'
  }),
  executeBulkAction: vi.fn().mockResolvedValue({
    success: true,
    correlationId: 'bulk-correlation-123'
  }),
  ...overrides
});

// Mock records
const mockRecords: RbmRecord[] = [
  {
    sys_id: { value: 'rec1', display_value: 'rec1' },
    name: { value: 'Test Record 1', display_value: 'Test Record 1' },
    status: { value: 'active', display_value: 'Active' },
    priority: { value: 'high', display_value: 'High' }
  },
  {
    sys_id: { value: 'rec2', display_value: 'rec2' },
    name: { value: 'Test Record 2', display_value: 'Test Record 2' },
    status: { value: 'inactive', display_value: 'Inactive' },
    priority: { value: 'medium', display_value: 'Medium' }
  }
];

const mockColumns = [
  { field: 'name', label: 'Name', sortable: true },
  { field: 'status', label: 'Status', sortable: true },
  { field: 'priority', label: 'Priority', sortable: false }
];

const mockFilters = [
  {
    field: 'status',
    uiType: 'select' as const,
    operators: ['=' as const],
    config: {
      label: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' }
      ]
    }
  }
];

const mockActions = [
  {
    id: 'edit',
    label: 'Edit',
    category: 'primary' as const
  },
  {
    id: 'delete',
    label: 'Delete',
    category: 'destructive' as const,
    requiresConfirm: true
  }
];

const mockBulkActions = [
  {
    id: 'bulk_activate',
    label: 'Activate Selected',
    maxSelection: 100
  },
  {
    id: 'bulk_delete',
    label: 'Delete Selected',
    requiresConfirm: true,
    maxSelection: 50
  }
];

describe('RbmRecordList - Functional Tests', () => {
  let mockDataProvider: DataProvider;

  beforeEach(() => {
    mockDataProvider = createMockDataProvider();
    vi.clearAllMocks();
  });

  describe('Initial Load', () => {
    it('should load data on mount', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenCalledWith({
          table: 'test_table',
          filters: [],
          pagination: {
            page: 0,
            pageSize: 50,
            cursor: null
          },
          context: expect.objectContaining({
            correlationId: expect.any(String)
          }),
          queryParams: {
            sysparm_display_value: 'all'
          }
        });
      });

      expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      expect(screen.getByText('Test Record 2')).toBeInTheDocument();
    });

    it('should display loading state initially', () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={mockDataProvider}
        />
      );

      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });

    it('should handle load errors gracefully', async () => {
      const errorProvider = createMockDataProvider({
        fetchRecords: vi.fn().mockRejectedValue(new Error('Load failed - CorrelationId: error-123'))
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={errorProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/unable to load records/i)).toBeInTheDocument();
        expect(screen.getByText(/error-123/i)).toBeInTheDocument();
      });
    });
  });

  describe('Paging', () => {
    it('should handle next page navigation', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      const nextButton = screen.getByRole('button', { name: /next/i });
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenCalledWith(
          expect.objectContaining({
            pagination: expect.objectContaining({
              cursor: expect.any(String)
            })
          })
        );
      });
    });

    it('should handle page size changes', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      const pageSizeSelect = screen.getByRole('combobox', { name: /page size/i });
      await userEvent.selectOptions(pageSizeSelect, '100');

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            pagination: expect.objectContaining({
              pageSize: 100
            })
          })
        );
      });
    });

    it('should enforce maximum page size cap', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={mockDataProvider}
          config={{ defaultPageSize: 300 }} // Over 200 limit
        />
      );

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenCalledWith(
          expect.objectContaining({
            pagination: expect.objectContaining({
              pageSize: 200 // Should be capped at 200
            })
          })
        );
      });
    });
  });

  describe('Filtering', () => {
    it('should apply filters correctly', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          filters={mockFilters}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Apply status filter
      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await userEvent.selectOptions(statusFilter, 'active');

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            filters: [
              expect.objectContaining({
                field: 'status',
                operator: '=',
                value: 'active'
              })
            ]
          })
        );
      });
    });

    it('should clear filters correctly', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          filters={mockFilters}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Apply then clear filters
      const statusFilter = screen.getByRole('combobox', { name: /status/i });
      await userEvent.selectOptions(statusFilter, 'active');

      const clearButton = screen.getByRole('button', { name: /clear/i });
      fireEvent.click(clearButton);

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            filters: []
          })
        );
      });
    });
  });

  describe('Sorting', () => {
    it('should handle sort changes', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      fireEvent.click(nameHeader);

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sort: {
              field: 'name',
              direction: 'asc'
            }
          })
        );
      });
    });

    it('should toggle sort direction on repeated clicks', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      const nameHeader = screen.getByRole('columnheader', { name: /name/i });
      
      // First click - ascending
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sort: { field: 'name', direction: 'asc' }
          })
        );
      });

      // Second click - descending
      fireEvent.click(nameHeader);
      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            sort: { field: 'name', direction: 'desc' }
          })
        );
      });
    });
  });

  describe('Search', () => {
    it('should handle search queries', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          filters={mockFilters}
          dataProvider={mockDataProvider}
          config={{ enableSearch: true }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await userEvent.type(searchInput, 'test query');

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: 'test query'
          })
        );
      });
    });

    it('should debounce search input', async () => {
      vi.useFakeTimers();

      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          filters={mockFilters}
          dataProvider={mockDataProvider}
          config={{ enableSearch: true }}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByRole('textbox', { name: /search/i });
      await userEvent.type(searchInput, 'abc');

      // Should not trigger immediately
      expect(mockDataProvider.fetchRecords).toHaveBeenCalledTimes(1); // Initial load only

      // Fast-forward timers
      vi.advanceTimersByTime(500);

      await waitFor(() => {
        expect(mockDataProvider.fetchRecords).toHaveBeenLastCalledWith(
          expect.objectContaining({
            search: 'abc'
          })
        );
      });

      vi.useRealTimers();
    });
  });

  describe('Row Actions', () => {
    it('should execute row action successfully', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          actions={mockActions}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Open actions menu
      const actionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(actionsButton);

      // Click edit action
      const editAction = screen.getByRole('menuitem', { name: /edit/i });
      fireEvent.click(editAction);

      await waitFor(() => {
        expect(mockDataProvider.executeAction).toHaveBeenCalledWith(
          'edit',
          mockRecords[0],
          expect.objectContaining({
            clientCorrelationId: expect.any(String)
          })
        );
      });
    });

    it('should handle denied actions correctly', async () => {
      const deniedProvider = createMockDataProvider({
        executeAction: vi.fn().mockResolvedValue({
          success: false,
          error: '403 Permission denied',
          correlationId: 'denied-correlation-123'
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          actions={mockActions}
          dataProvider={deniedProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Execute action
      const actionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(actionsButton);

      const editAction = screen.getByRole('menuitem', { name: /edit/i });
      fireEvent.click(editAction);

      await waitFor(() => {
        expect(screen.getByText(/you do not have permission/i)).toBeInTheDocument();
        expect(screen.getByText(/denied-correlation-123/i)).toBeInTheDocument();
      });
    });

    it('should handle validation errors', async () => {
      const validationErrorProvider = createMockDataProvider({
        executeAction: vi.fn().mockResolvedValue({
          success: false,
          error: 'Validation failed: Required field missing',
          correlationId: 'validation-correlation-123'
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          actions={mockActions}
          dataProvider={validationErrorProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Execute action
      const actionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(actionsButton);

      const editAction = screen.getByRole('menuitem', { name: /edit/i });
      fireEvent.click(editAction);

      await waitFor(() => {
        expect(screen.getByText(/validation failed/i)).toBeInTheDocument();
        expect(screen.getByText(/validation-correlation-123/i)).toBeInTheDocument();
      });
    });

    it('should show confirmation for destructive actions', async () => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          actions={mockActions}
          dataProvider={mockDataProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Open actions menu and click delete
      const actionsButton = screen.getAllByRole('button', { name: /actions/i })[0];
      fireEvent.click(actionsButton);

      const deleteAction = screen.getByRole('menuitem', { name: /delete/i });
      fireEvent.click(deleteAction);

      // Should show confirmation dialog
      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText(/confirm/i)).toBeInTheDocument();

      // Confirm action
      const confirmButton = screen.getByRole('button', { name: /confirm/i });
      fireEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockDataProvider.executeAction).toHaveBeenCalledWith(
          'delete',
          mockRecords[0],
          expect.any(Object)
        );
      });
    });
  });

  describe('Bulk Actions', () => {
    beforeEach(() => {
      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          selectionMode="multiple"
          bulkActions={mockBulkActions}
          dataProvider={mockDataProvider}
        />
      );
    });

    it('should execute bulk actions within selection cap', async () => {
      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Select records
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]); // First data row
      fireEvent.click(checkboxes[2]); // Second data row

      // Should show bulk action bar
      expect(screen.getByText(/2.*selected/i)).toBeInTheDocument();

      // Execute bulk action
      const bulkActivateButton = screen.getByRole('button', { name: /activate selected/i });
      fireEvent.click(bulkActivateButton);

      await waitFor(() => {
        expect(mockDataProvider.executeBulkAction).toHaveBeenCalledWith(
          'bulk_activate',
          [mockRecords[0], mockRecords[1]],
          expect.objectContaining({
            clientCorrelationId: expect.any(String)
          })
        );
      });
    });

    it('should prevent bulk actions over selection cap', async () => {
      // Mock more records than the cap allows
      const manyRecords = Array.from({ length: 60 }, (_, i) => ({
        sys_id: { value: `rec${i}`, display_value: `rec${i}` },
        name: { value: `Record ${i}`, display_value: `Record ${i}` }
      }));

      const manyRecordsProvider = createMockDataProvider({
        fetchRecords: vi.fn().mockResolvedValue({
          records: manyRecords,
          pagination: { currentPage: 0, pageSize: 50, totalRecords: 60, totalPages: 2, hasNextPage: true, hasPreviousPage: false },
          success: true
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          selectionMode="multiple"
          bulkActions={mockBulkActions}
          dataProvider={manyRecordsProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Record 0')).toBeInTheDocument();
      });

      // Select all records (60 > 50 cap for delete action)
      const selectAllCheckbox = screen.getAllByRole('checkbox')[0]; // Header checkbox
      fireEvent.click(selectAllCheckbox);

      // Try bulk delete (cap: 50)
      const bulkDeleteButton = screen.getByRole('button', { name: /delete selected/i });
      fireEvent.click(bulkDeleteButton);

      // Should show error about exceeding cap
      await waitFor(() => {
        expect(screen.getByText(/selected 60.*maximum.*50/i)).toBeInTheDocument();
      });

      // Action should not execute
      expect(manyRecordsProvider.executeBulkAction).not.toHaveBeenCalled();
    });

    it('should handle partial bulk action failures', async () => {
      const partialFailureProvider = createMockDataProvider({
        executeBulkAction: vi.fn().mockResolvedValue({
          success: false,
          error: 'Partial failure: 1 of 2 records failed validation',
          correlationId: 'partial-fail-123'
        })
      });

      render(
        <RbmRecordList
          listKey="test_table"
          columns={mockColumns}
          selectionMode="multiple"
          bulkActions={mockBulkActions}
          dataProvider={partialFailureProvider}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Select and execute bulk action
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      const bulkActivateButton = screen.getByRole('button', { name: /activate selected/i });
      fireEvent.click(bulkActivateButton);

      await waitFor(() => {
        expect(screen.getByText(/partial failure/i)).toBeInTheDocument();
        expect(screen.getByText(/partial-fail-123/i)).toBeInTheDocument();
      });
    });

    it('should clear selection after successful bulk action', async () => {
      await waitFor(() => {
        expect(screen.getByText('Test Record 1')).toBeInTheDocument();
      });

      // Select records
      const checkboxes = screen.getAllByRole('checkbox');
      fireEvent.click(checkboxes[1]);
      fireEvent.click(checkboxes[2]);

      expect(screen.getByText(/2.*selected/i)).toBeInTheDocument();

      // Execute bulk action
      const bulkActivateButton = screen.getByRole('button', { name: /activate selected/i });
      fireEvent.click(bulkActivateButton);

      await waitFor(() => {
        expect(screen.queryByText(/selected/i)).not.toBeInTheDocument();
      });
    });
  });
});