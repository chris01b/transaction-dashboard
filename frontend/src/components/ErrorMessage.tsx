import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onRetry: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="card max-w-md w-full text-center">
      <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-lg font-semibold text-gray-900 mb-2">Error</h2>
      <p className="text-gray-600 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="btn btn-primary w-full"
      >
        Try Again
      </button>
    </div>
  </div>
);
