import React, { useState } from 'react';
import { BookOpen, Search, Loader2, ExternalLink, Calendar, Building2, Tag } from 'lucide-react';
import * as api from '../../services/api';

export const ClinicalGuidelines = () => {
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [guidelines, setGuidelines] = useState([]);
  const [error, setError] = useState(null);
  const [selectedOrg, setSelectedOrg] = useState('all');

  // Major guideline organizations
  const organizations = [
    { id: 'all', name: 'All Organizations' },
    { id: 'ACC/AHA', name: 'ACC/AHA (Cardiology)' },
    { id: 'ADA', name: 'ADA (Diabetes)' },
    { id: 'CHEST', name: 'CHEST (Pulmonary)' },
    { id: 'IDSA', name: 'IDSA (Infectious Disease)' },
    { id: 'NCCN', name: 'NCCN (Oncology)' },
    { id: 'WHO', name: 'WHO (Global Health)' },
    { id: 'CDC', name: 'CDC (Public Health)' },
    { id: 'ACOG', name: 'ACOG (Obstetrics/Gynecology)' }
  ];

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setError(null);
    setGuidelines([]);

    try {
      const data = await api.searchGuidelines(query.trim(), selectedOrg);
      setGuidelines(data.guidelines || []);
    } catch (err) {
      setError(err.message || 'Failed to search guidelines');
    } finally {
      setSearching(false);
    }
  };

  const GuidelineCard = ({ guideline }) => (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {guideline.title}
          </h3>

          <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
            {guideline.organization && (
              <div className="flex items-center gap-1">
                <Building2 className="w-4 h-4" />
                <span>{guideline.organization}</span>
              </div>
            )}
            {guideline.year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{guideline.year}</span>
              </div>
            )}
            {guideline.specialty && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>{guideline.specialty}</span>
              </div>
            )}
          </div>

          {guideline.summary && (
            <p className="text-gray-700 text-sm mb-3 line-clamp-3">
              {guideline.summary}
            </p>
          )}

          {guideline.keyRecommendations && guideline.keyRecommendations.length > 0 && (
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900 mb-1">Key Recommendations:</p>
              <ul className="list-disc ml-5 space-y-1">
                {guideline.keyRecommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="text-sm text-gray-700">{rec}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {guideline.url && (
          <a
            href={guideline.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-bold text-gray-900">Clinical Practice Guidelines</h3>
        </div>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Search for evidence-based clinical practice guidelines from major medical organizations.
      </p>

      {/* Search Form */}
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex flex-col gap-3">
          {/* Organization Filter */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              Organization:
            </label>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              disabled={searching}
            >
              {organizations.map(org => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>

          {/* Search Input */}
          <div className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter condition or topic (e.g., Heart Failure, Diabetes Management)"
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={searching}
            />
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {searching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {/* Guidelines Results */}
      {guidelines.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-semibold text-gray-900">
              Found {guidelines.length} {guidelines.length === 1 ? 'Guideline' : 'Guidelines'}
            </h4>
          </div>
          {guidelines.map((guideline, idx) => (
            <GuidelineCard key={idx} guideline={guideline} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!guidelines.length && !searching && !error && (
        <div className="text-center py-8 text-gray-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p>Enter a condition or topic to search for clinical guidelines</p>
          <p className="text-xs mt-2">Examples: Hypertension, Diabetes, Asthma Management</p>
        </div>
      )}
    </div>
  );
};
