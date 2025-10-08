import React from 'react';
import { Search, MessageSquare } from 'lucide-react';

export const EmptyState = () => {
  return (
    <div className="text-center py-12">
      <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
        <Search className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Ask a Medical Question</h2>
        <p className="text-gray-600 mb-4">Get evidence-based answers from peer-reviewed medical literature</p>
        <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
          <p className="font-medium text-gray-900">Example queries:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>What are the latest treatments for type 2 diabetes?</li>
            <li>Efficacy of statins in primary prevention</li>
            <li>Management of hypertension in elderly patients</li>
            <li>Side effects of ACE inhibitors</li>
          </ul>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="font-medium text-indigo-600 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              New: Conversation History
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ask follow-up questions and I'll remember the context of our conversation!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
