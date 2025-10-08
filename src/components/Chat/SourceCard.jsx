import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export const SourceCard = ({ source, index, isExpanded, onToggle }) => {
  return (
    <div className="bg-gray-50 rounded p-3 text-sm">
      <div className="flex items-start gap-2">
        <span className="font-bold text-indigo-600 flex-shrink-0">[{index + 1}]</span>
        <div className="flex-1 min-w-0">
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline break-words"
          >
            {source.title}
          </a>

          {/* Metadata Badges */}
          {(source.studyType || source.isRecent || source.source || source.hasFullText) && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {source.source && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  source.source === 'Europe PMC'
                    ? 'bg-sky-100 text-sky-800'
                    : 'bg-teal-100 text-teal-800'
                }`}>
                  {source.source === 'Europe PMC' ? 'Europe PMC' : 'PubMed'}
                </span>
              )}
              {source.hasFullText && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-lime-100 text-lime-800">
                  Full Text
                </span>
              )}
              {source.studyType && (
                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                  source.studyType === 'Meta-Analysis' || source.studyType === 'Systematic Review'
                    ? 'bg-purple-100 text-purple-800'
                    : source.studyType === 'RCT'
                    ? 'bg-green-100 text-green-800'
                    : source.studyType === 'Clinical Trial'
                    ? 'bg-blue-100 text-blue-800'
                    : source.studyType === 'Review'
                    ? 'bg-indigo-100 text-indigo-800'
                    : source.studyType === 'Guideline'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {source.studyType}
                </span>
              )}
              {source.isRecent && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                  New Research
                </span>
              )}
              {source.publicationYear && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                  {source.publicationYear}
                </span>
              )}
            </div>
          )}

          <p className="text-gray-600 text-xs mt-2">
            {source.authors} • {source.journal}
          </p>
          <p className="text-gray-500 text-xs mt-1">PMID: {source.pmid}</p>

          {/* Expandable Abstract Section */}
          {source.abstract && (
            <div className="mt-3">
              {isExpanded && (
                <div className="bg-white rounded border border-gray-200 p-3 mb-2">
                  <h4 className="font-semibold text-gray-900 text-xs mb-2">Abstract</h4>
                  <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                    {source.abstract}
                  </p>
                  {source.allAuthors && source.allAuthors !== source.authors && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <h4 className="font-semibold text-gray-900 text-xs mb-1">All Authors</h4>
                      <p className="text-gray-600 text-xs">{source.allAuthors}</p>
                    </div>
                  )}
                  {source.doi && (
                    <div className="mt-2">
                      <p className="text-gray-500 text-xs">DOI: {source.doi}</p>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={onToggle}
                className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    Show less
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    Show more details
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
