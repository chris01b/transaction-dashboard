import React, { useState, useEffect } from 'react';
import { TransactionGroup, GroupBy } from '@/types';
import { fetchTransactionGroups } from '@/services/feathers';
import { GroupingTabs } from './GroupingTabs';
import { TransactionGroupList } from './TransactionGroupList';
import { TransactionDetail } from './TransactionDetail';
import { LoadingSpinner } from './LoadingSpinner';
import { ErrorMessage } from './ErrorMessage';

export const TransactionDashboard: React.FC = () => {
  const [groups, setGroups] = useState<TransactionGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<TransactionGroup | null>(null);
  const [groupBy, setGroupBy] = useState<GroupBy>('merchant');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTransactionGroups();
  }, [groupBy]);

  const loadTransactionGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactionGroups(groupBy);
      setGroups(data);
    } catch (err) {
      setError('Failed to load transaction data');
      console.error('Error loading transactions:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
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
          <>
            <GroupingTabs
              activeGroupBy={groupBy}
              onGroupingChange={handleGroupingChange}
            />
            <TransactionGroupList
              groups={groups}
              groupBy={groupBy}
              onGroupClick={handleGroupClick}
            />
          </>
        ) : (
          <TransactionDetail
            group={selectedGroup}
            onBackClick={handleBackClick}
          />
        )}
      </div>
    </div>
  );
};
