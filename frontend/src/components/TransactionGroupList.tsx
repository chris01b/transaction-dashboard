import React from 'react';
import { TransactionGroup, GroupBy } from '@/types';
import { ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface TransactionGroupListProps {
  groups: TransactionGroup[];
  groupBy: GroupBy;
  onGroupClick: (group: TransactionGroup) => void;
}

export const TransactionGroupList: React.FC<TransactionGroupListProps> = ({
  groups,
  groupBy,
  onGroupClick
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
