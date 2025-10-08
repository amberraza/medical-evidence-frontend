import React from 'react';
import { MessageSquare } from 'lucide-react';

export const FollowUpQuestions = ({ questions, onQuestionClick }) => {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center gap-2 mb-3">
        <MessageSquare className="w-4 h-4 text-indigo-600" />
        <h3 className="font-semibold text-gray-900 text-sm">Suggested Follow-up Questions</h3>
      </div>
      <div className="space-y-2">
        {questions.map((question, i) => (
          <button
            key={i}
            onClick={() => onQuestionClick(question)}
            className="w-full text-left p-3 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors group"
          >
            <div className="flex items-start gap-2">
              <span className="text-indigo-600 font-semibold text-sm flex-shrink-0">{i + 1}.</span>
              <span className="text-indigo-900 text-sm group-hover:text-indigo-700">
                {question}
              </span>
            </div>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-2 italic">Click a question to explore further</p>
    </div>
  );
};
