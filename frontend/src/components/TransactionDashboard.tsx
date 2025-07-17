import React, { useState, useEffect } from 'react';
import { TransactionGroup, GroupBy, PaginationMetadata } from '@/types/index';
import { fetchTransactionGroups } from '@/services/feathers';
import { GroupingTabs } from './GroupingTabs';
import { TransactionGroupList } from './TransactionGroupList';
import { TransactionDetail } from './TransactionDetail';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';
import { Pagination } from './Pagination';

export const TransactionDashboard: React.FC = () => {
  const [groups, setGroups] = useState<TransactionGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TransactionGroup | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('merchant');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalGroups, setTotalGroups] = useState(0);

  useEffect(() => {
    loadTransactionGroups();
  }, [groupBy, currentPage, itemsPerPage]);

  const loadTransactionGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Include pagination parameters in the API request
      console.log('Fetching transaction groups with:', { groupBy, currentPage, itemsPerPage });
      const response = await fetchTransactionGroups(groupBy, currentPage, itemsPerPage);
      console.log('API Response:', response);
      
      const responseData = response as { data: TransactionGroup[]; pagination: PaginationMetadata };
      
      if (responseData && 'data' in responseData) {
        const hasItems = responseData.data && responseData.data.length > 0;
        const total = responseData.pagination?.total || (hasItems ? responseData.data.length : 0);
        
        console.log('Setting groups:', {
          groups: responseData.data || [],
          total,
          pagination: responseData.pagination
        });
        
        setGroups(responseData.data || []);
        setTotalGroups(total);
      } else {
        // Fallback for unexpected response format
        console.warn('Unexpected response format:', response);
        setGroups([]);
        setTotalGroups(0);
      }
    } catch (err) {
      setError('Failed to load transaction data');
      console.error('Error loading transactions:', err);
      setGroups([]);
      setTotalGroups(0);
    } finally {
      setLoading(false);
    }
  };

  // No need for client-side pagination as it's handled by the backend

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleItemsPerPageChange = (newItemsPerPage: number) => {
    // Update items per page and reset to first page
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const handleGroupingChange = (newGroupBy: GroupBy) => {
    setGroupBy(newGroupBy);
    setSelectedGroup(null);
  };

  const handleGroupClick = (group: TransactionGroup) => {
    setSelectedGroup(group);
  };

  const handleBackClick = () => {
    setSelectedGroup(null);
  };

  // Show full page loading only on initial load
  if (loading && groups.length === 0) {
    return <LoadingSpinner />;
  }

  // Show full page error only if we have no data to display
  if (error && groups.length === 0) {
    return <ErrorMessage message={error} onRetry={loadTransactionGroups} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Transaction Dashboard
          </h1>
          <p className="text-gray-600">
            View and analyze your card transactions grouped by different criteria
          </p>
        </div>

        {!selectedGroup ? (
        <div className="space-y-4">
          <GroupingTabs activeGroupBy={groupBy} onGroupingChange={handleGroupingChange} />
          <TransactionGroupList 
            groups={groups}
            groupBy={groupBy}
            onGroupClick={handleGroupClick}
            isLoading={loading}
            error={error}
            onRetry={loadTransactionGroups}
          />
          {totalGroups > 0 && (
            <div className="mt-4 flex justify-start">
              <Pagination
                currentPage={currentPage}
                totalItems={totalGroups}
                itemsPerPage={itemsPerPage}
                onPageChange={handlePageChange}
                onItemsPerPageChange={handleItemsPerPageChange}
              />
            </div>
          )}
        </div>
        ) : (
          <TransactionDetail
            group={selectedGroup}
            onBackClick={handleBackClick}
            isLoading={loading}
            error={error}
            onRetry={loadTransactionGroups}
          />
        )}
      </div>
    </div>
  );
};
