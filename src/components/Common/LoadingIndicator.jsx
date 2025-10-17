import React from 'react';
import { Loader2, CheckCircle } from 'lucide-react';

export const LoadingIndicator = ({ loadingStage, articleCount, darkMode }) => {
  return (
    <div className="flex justify-start">
      <div className={`rounded-lg p-6 shadow-sm border min-w-[400px] ${
        darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        {/* Stage 1: Searching */}
        <div className={`flex items-center gap-3 transition-opacity ${loadingStage === 'searching' ? 'opacity-100' : 'opacity-40'}`}>
          <div className="relative">
            {loadingStage === 'searching' ? (
              <Loader2 className={`w-5 h-5 animate-spin ${darkMode ? 'text-orange-500' : 'text-indigo-600'}`} />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600" />
            )}
          </div>
          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Searching medical databases...</span>
        </div>

        {/* Stage 2: Found Articles */}
        {(loadingStage === 'found' || loadingStage === 'generating') && (
          <div className={`flex items-center gap-3 mt-4 transition-opacity ${loadingStage === 'found' ? 'opacity-100' : 'opacity-40'}`}>
            <div className="relative">
              {loadingStage === 'found' ? (
                <Loader2 className={`w-5 h-5 animate-spin ${darkMode ? 'text-orange-500' : 'text-indigo-600'}`} />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-600" />
              )}
            </div>
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Found {articleCount} relevant articles</span>
              <div className="flex gap-1 mt-1">
                {[...Array(Math.min(articleCount, 5))].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full animate-pulse ${darkMode ? 'bg-orange-800' : 'bg-indigo-200'}`} style={{ animationDelay: `${i * 100}ms` }}></div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Stage 3: Generating Response */}
        {loadingStage === 'generating' && (
          <div className="flex items-center gap-3 mt-4">
            <Loader2 className={`w-5 h-5 animate-spin ${darkMode ? 'text-orange-500' : 'text-indigo-600'}`} />
            <div>
              <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Analyzing evidence and generating response...</span>
              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>This may take a few moments</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
