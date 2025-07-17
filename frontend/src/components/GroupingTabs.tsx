import React from 'react';
import { GroupBy } from '@/types';
import { Store, CreditCard, Globe } from 'lucide-react';
import clsx from 'clsx';

interface GroupingTabsProps {
  activeGroupBy: GroupBy;
  onGroupingChange: (groupBy: GroupBy) => void;
}

export const GroupingTabs: React.FC<GroupingTabsProps> = ({
  activeGroupBy,
  onGroupingChange
}) => {
  const tabs = [
    { id: 'merchant' as GroupBy, label: 'Merchant', icon: Store },
    { id: 'mcc' as GroupBy, label: 'MCC', icon: CreditCard },
    { id: 'currency' as GroupBy, label: 'Currency', icon: Globe }
  ];

  return (
    <div className="mb-6">
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onGroupingChange(id)}
              className={clsx(
                'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors',
                activeGroupBy === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              <Icon className="mr-2 h-5 w-5" />
              {label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
};
