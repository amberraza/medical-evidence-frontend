import React from 'react';
import { Filter, X } from 'lucide-react';

export const FilterPanel = ({ showFilters, setShowFilters, filters, setFilters }) => {
  if (!showFilters) return null;

  return (
    <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-semibold text-gray-900">Search Filters</h3>
        </div>
        <button
          onClick={() => setShowFilters(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Date Range Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Publication Date
          </label>
          <select
            value={filters.dateRange}
            onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All time</option>
            <option value="1year">Last year</option>
            <option value="5years">Last 5 years</option>
            <option value="10years">Last 10 years</option>
          </select>
        </div>

        {/* Study Type Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Study Type
          </label>
          <select
            value={filters.studyType}
            onChange={(e) => setFilters({...filters, studyType: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            <option value="all">All types</option>
            <option value="rct">Randomized Controlled Trial</option>
            <option value="meta">Meta-Analysis</option>
            <option value="review">Review / Systematic Review</option>
            <option value="clinical">Clinical Trial</option>
            <option value="guideline">Guideline</option>
          </select>
        </div>
      </div>

      {/* Active Filters Display */}
      {(filters.dateRange !== 'all' || filters.studyType !== 'all') && (
        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <span className="text-xs text-gray-600">Active filters:</span>
          {filters.dateRange !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
              {filters.dateRange === '1year' ? 'Last year' : filters.dateRange === '5years' ? 'Last 5 years' : 'Last 10 years'}
              <button
                onClick={() => setFilters({...filters, dateRange: 'all'})}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
          {filters.studyType !== 'all' && (
            <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
              {filters.studyType === 'rct' ? 'RCT' : filters.studyType === 'meta' ? 'Meta-Analysis' : filters.studyType === 'review' ? 'Review' : filters.studyType === 'clinical' ? 'Clinical Trial' : 'Guideline'}
              <button
                onClick={() => setFilters({...filters, studyType: 'all'})}
                className="hover:text-indigo-900"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};
