import React from 'react';
import { Search, MessageSquare } from 'lucide-react';

export const EmptyState = ({ darkMode }) => {
  return (
    <div className="text-center py-12">
      <div className={`rounded-lg p-8 shadow-sm border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <Search className={`w-12 h-12 mx-auto mb-4 ${darkMode ? 'text-orange-500' : 'text-indigo-600'}`} />
        <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Ask a Medical Question</h2>
        <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Get evidence-based answers from peer-reviewed medical literature</p>
        <div className={`text-left max-w-md mx-auto space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <p className={`font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Example queries:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>What are the latest treatments for type 2 diabetes?</li>
            <li>Efficacy of statins in primary prevention</li>
            <li>Management of hypertension in elderly patients</li>
            <li>Side effects of ACE inhibitors</li>
          </ul>
          <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className={`font-medium flex items-center gap-2 ${darkMode ? 'text-orange-500' : 'text-indigo-600'}`}>
              <MessageSquare className="w-4 h-4" />
              New: Conversation History
            </p>
            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              Ask follow-up questions and I'll remember the context of our conversation!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
