import React from 'react';
import { TransactionGroup, GroupBy } from '@/types';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface TransactionGroupListProps {
  groups: TransactionGroup[];
  groupBy: GroupBy;
  onGroupClick: (group: TransactionGroup) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const SkeletonLoader = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="card animate-pulse">
        <div className="h-20 rounded-lg bg-gray-100"></div>
      </div>
    ))}
  </div>
);

export const TransactionGroupList: React.FC<TransactionGroupListProps> = ({
  groups,
  groupBy,
  onGroupClick,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  const getGroupLabel = (group: TransactionGroup) => {
    switch (groupBy) {
      case 'mcc':
        return `MCC ${group.label}`;
      case 'currency':
        return group.label.toUpperCase();
      default:
        return group.label;
    }
  };

  if (isLoading) {
    return <SkeletonLoader />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-500 mb-2">Error loading transaction groups</div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (groups.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div
          key={group.label}
          className="card hover:shadow-md transition-shadow cursor-pointer"
          onClick={() => onGroupClick(group)}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                {getGroupLabel(group)}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>{group.count} transactions</span>
                <span>•</span>
                <span className="font-medium text-gray-900">
                  {formatCurrency(group.total)}
                </span>
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      ))}
    </div>
  );
};
