import React from 'react';
import { AlertCircle, Loader2 } from 'lucide-react';

export const ErrorMessage = ({ error, errorRetryable, lastQuery, onRetry, darkMode }) => {
  if (!error) return null;

  return (
    <div className="flex justify-start">
      <div className={`border rounded-lg p-4 w-full max-w-3xl ${
        darkMode ? 'bg-red-950 border-red-800' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-start gap-3">
          <AlertCircle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
          <div className="flex-1">
            <p className={`text-sm font-medium mb-2 ${darkMode ? 'text-red-200' : 'text-red-800'}`}>{error}</p>
            {errorRetryable && lastQuery && (
              <button
                onClick={() => onRetry(lastQuery)}
                className={`flex items-center gap-2 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  darkMode ? 'bg-red-700 hover:bg-red-600' : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                <Loader2 className="w-4 h-4" />
                Retry Request
              </button>
            )}
            {!errorRetryable && (
              <p className={`text-xs mt-2 ${darkMode ? 'text-red-300' : 'text-red-600'}`}>
                ⚠️ This error cannot be automatically retried. Please check your input and try again.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
