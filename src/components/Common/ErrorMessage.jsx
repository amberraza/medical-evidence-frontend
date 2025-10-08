import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const ErrorMessage = ({ error, errorRetryable, lastQuery, onRetry }) => {
  if (!error) return null;

  return (
    <div className="flex justify-start">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-3xl">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-red-800 text-sm font-medium mb-2">{error}</p>
            {errorRetryable && lastQuery && (
              <button
                onClick={() => onRetry(lastQuery)}
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <Loader2 className="w-4 h-4" />
                Retry Request
              </button>
            )}
            {!errorRetryable && (
              <p className="text-red-600 text-xs mt-2">
                ⚠️ This error cannot be automatically retried. Please check your input and try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
