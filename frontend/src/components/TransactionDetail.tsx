import React from 'react';
import { TransactionGroup } from '@/types';
import { ArrowLeft, Calendar, CreditCard, MapPin } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';

interface TransactionDetailProps {
  group: TransactionGroup;
  onBackClick: () => void;
}

export const TransactionDetail: React.FC<TransactionDetailProps> = ({
  group,
  onBackClick
}) => {
  return (
    <div>
      <div className="mb-6">
        <button
          onClick={onBackClick}
          className="flex items-center text-primary-600 hover:text-primary-700 mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to groups
        </button>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">{group.label}</h1>
          <div className="text-right">
            <div className="text-sm text-gray-600">{group.count} transactions</div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(group.total)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {group.transactions.map((transaction) => (
          <div key={transaction.token} className="card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">
                    {transaction.merchant.descriptor}
                  </h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span>
                      {transaction.merchant.city}, {transaction.merchant.state}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(transaction.amount)}
                </div>
                <div className="text-sm text-gray-600">
                  {transaction.currency}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-100">
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(transaction.created).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span>MCC: {transaction.merchant.mcc}</span>
                <span className="capitalize">{transaction.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
