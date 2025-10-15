import React from 'react';
import { Search, Loader2, Filter, X, Sparkles } from 'lucide-react';
import { FilterPanel } from './FilterPanel';

export const SearchInput = ({
  input,
  setInput,
  loading,
  backendStatus,
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  deepResearchMode,
  setDeepResearchMode,
  onSubmit,
  onKeyPress
}) => {
  return (
    <div className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-lg">
      <div className="max-w-4xl mx-auto">
        <FilterPanel
          showFilters={showFilters}
          setShowFilters={setShowFilters}
          filters={filters}
          setFilters={setFilters}
        />

        {/* Deep Research Mode Toggle */}
        {deepResearchMode !== undefined && (
          <div className="mb-3 flex items-center gap-2">
            <button
              onClick={() => setDeepResearchMode(!deepResearchMode)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                deepResearchMode
                  ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Deep Research Mode
              {deepResearchMode && <span className="text-xs">(Multi-stage AI analysis)</span>}
            </button>
          </div>
        )}

        <div className="flex gap-2 sm:gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={onKeyPress}
            placeholder={deepResearchMode ? "Ask a research question for deep analysis..." : "Ask a medical question..."}
            className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
            disabled={loading || backendStatus !== 'connected'}
          />
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
              showFilters || filters.dateRange !== 'all' || filters.studyType !== 'all'
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
            title="Toggle filters"
          >
            <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
            {(filters.dateRange !== 'all' || filters.studyType !== 'all') && (
              <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                {(filters.dateRange !== 'all' ? 1 : 0) + (filters.studyType !== 'all' ? 1 : 0)}
              </span>
            )}
          </button>
          <button
            onClick={onSubmit}
            disabled={loading || !input.trim() || backendStatus !== 'connected'}
            className={`${
              deepResearchMode
                ? 'bg-purple-600 hover:bg-purple-700'
                : 'bg-indigo-600 hover:bg-indigo-700'
            } text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                <span className="hidden sm:inline">Processing</span>
              </>
            ) : deepResearchMode ? (
              <>
                <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Deep Research</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline">Search</span>
              </>
            )}
          </button>
        </div>
        <p className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center">
          This is a prototype for educational purposes. Not for clinical decision-making.
        </p>
      </div>
    </div>
  );
};
