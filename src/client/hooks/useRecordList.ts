/**
 * RBM Record List Hooks
 * 
 * React hooks for managing RBM Record List state and operations
 */

import { useMemo } from 'react';
import { DataProvider } from '../components/rbm-record-list/types';
import { createRecordListDataProvider } from '../services/rbm-record-list';

/**
 * Hook to create and memoize a data provider instance
 * @param listKey - The listKey for data operations
 * @param viewId - Optional view identifier
 * @returns Configured data provider
 */
export function useRecordListDataProvider(listKey: string, viewId?: string): DataProvider {
    return useMemo(() => {
        return createRecordListDataProvider({
            listKey: listKey,
            viewId: viewId
        });
    }, [listKey, viewId]);
}

/**
 * Hook to create RBM record list configuration
 * @param listKey - The listKey for data operations
 * @param options - Configuration options
 * @returns Complete configuration object
 */
export function useRecordListConfig(
    listKey: string,
    options: {
        enableSearch?: boolean;
        enableColumnResize?: boolean;
        enableColumnReorder?: boolean;
        defaultPageSize?: number;
        pageSizeOptions?: number[];
    } = {}
) {
    return useMemo(() => ({
        enableSearch: options.enableSearch !== false, // Default to enabled
        enableColumnResize: options.enableColumnResize !== false, // Default to enabled
        enableColumnReorder: options.enableColumnReorder !== false, // Default to enabled
        defaultPageSize: Math.min(options.defaultPageSize || 50, 200), // Never exceed 200
        pageSizeOptions: options.pageSizeOptions || [10, 25, 50, 100, 200],
        loadingComponent: undefined, // Use default
        errorComponent: undefined, // Use default
        emptyComponent: undefined // Use default
    }), [
        listKey, 
        options.enableSearch, 
        options.enableColumnResize, 
        options.enableColumnReorder,
        options.defaultPageSize,
        options.pageSizeOptions
    ]);
}