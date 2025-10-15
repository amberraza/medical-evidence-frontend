import React, { useState } from 'react';
import { Search, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

export const DeepResearchPanel = ({ onStartDeepResearch, loading }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 mb-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="bg-purple-600 p-1.5 rounded">
              <Search className="w-4 h-4 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Deep Research Mode</h3>
            <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-0.5 rounded">Beta</span>
          </div>
          <p className="text-sm text-gray-700 mb-3">
            Run a comprehensive multi-stage research analysis. Claude will analyze initial results,
            generate follow-up questions, and synthesize findings into a detailed report.
          </p>

          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1 mb-3"
          >
            {showDetails ? (
              <>
                <ChevronUp className="w-4 h-4" /> Hide Details
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" /> Show Details
              </>
            )}
          </button>

          {showDetails && (
            <div className="bg-white rounded-lg p-4 mb-3 text-sm space-y-2">
              <p className="font-medium text-gray-900">How it works:</p>
              <ol className="list-decimal list-inside space-y-1.5 text-gray-700">
                <li><strong>Initial Search:</strong> Searches medical literature for your query</li>
                <li><strong>Analysis:</strong> Claude analyzes findings and identifies knowledge gaps</li>
                <li><strong>Follow-up Queries:</strong> Generates 3-5 targeted follow-up questions</li>
                <li><strong>Deep Dive:</strong> Searches for each follow-up question automatically</li>
                <li><strong>Synthesis:</strong> Creates comprehensive report with key findings</li>
              </ol>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs text-gray-600">
                  ⏱️ Estimated time: 2-3 minutes • 📚 Sources analyzed: 50-100 articles
                </p>
              </div>
            </div>
          )}

          <button
            onClick={onStartDeepResearch}
            disabled={loading}
            className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Running Deep Research...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Start Deep Research
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const DeepResearchProgress = ({ stage, currentQuery, completedStages }) => {
  const stages = [
    { id: 'initial', label: 'Initial Search', icon: Search },
    { id: 'analysis', label: 'Analyzing Results', icon: Search },
    { id: 'followup', label: 'Follow-up Research', icon: Search },
    { id: 'synthesis', label: 'Synthesizing Report', icon: Search }
  ];

  return (
    <div className="bg-white border border-purple-200 rounded-lg p-4 mb-4">
      <h4 className="font-semibold text-gray-900 mb-3">Deep Research Progress</h4>

      <div className="space-y-3">
        {stages.map((s, idx) => {
          const isCompleted = completedStages?.includes(s.id);
          const isCurrent = s.id === stage;
          const Icon = s.icon;

          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isCompleted
                  ? 'bg-green-100 text-green-600'
                  : isCurrent
                    ? 'bg-purple-100 text-purple-600'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5" />
                ) : isCurrent ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <span className="text-sm font-medium">{idx + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  isCompleted ? 'text-green-700' : isCurrent ? 'text-purple-700' : 'text-gray-500'
                }`}>
                  {s.label}
                </p>
                {isCurrent && currentQuery && (
                  <p className="text-xs text-gray-600 mt-0.5">{currentQuery}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {currentQuery && stage === 'followup' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-gray-600">Current query: <span className="font-medium">{currentQuery}</span></p>
        </div>
      )}
    </div>
  );
};
