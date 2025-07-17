import React from 'react';
import { TransactionGroup } from '@/types';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { formatCurrency } from '@/utils/currency';
import { Calendar, CreditCard, MapPin } from 'lucide-react';

interface TransactionDetailProps {
  group: TransactionGroup;
  onBackClick: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

const TransactionSkeleton = () => (
  <div className="animate-pulse space-y-4">
    <div className="h-6 bg-gray-200 rounded w-3/4"></div>
    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
    <div className="space-y-2 mt-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-16 bg-gray-100 rounded"></div>
      ))}
    </div>
  </div>
);

export const TransactionDetail: React.FC<TransactionDetailProps> = ({
  group,
  onBackClick,
  isLoading = false,
  error = null,
  onRetry,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBackClick}
            className="mr-4 p-1 rounded-full hover:bg-gray-100"
            aria-label="Back to transactions"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <div className="h-6 bg-gray-200 rounded w-48"></div>
        </div>
        <TransactionSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center mb-6">
          <button
            onClick={onBackClick}
            className="mr-4 p-1 rounded-full hover:bg-gray-100"
            aria-label="Back to transactions"
          >
            <ArrowLeft className="h-5 w-5 text-gray-500" />
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {group.label}
          </h2>
        </div>
        <div className="text-center py-8">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <p className="text-red-600 mb-4">Failed to load transaction details</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <RefreshCw className="-ml-1 mr-2 h-4 w-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm">
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
        {group.transactions.length === 0 ? (
          <div className="py-8 text-center text-gray-500">
            No transactions found in this group
          </div>
        ) : (
          group.transactions.map((transaction) => (
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
          ))
        )}
      </div>
    </div>
  );
};
