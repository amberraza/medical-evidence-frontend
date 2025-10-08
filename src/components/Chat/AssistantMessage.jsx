import React from 'react';
import { FileText } from 'lucide-react';
import { SourceCard } from './SourceCard';
import { FollowUpQuestions } from './FollowUpQuestions';

export const AssistantMessage = ({
  content,
  sources,
  followUpQuestions,
  messageIndex,
  expandedSources,
  onToggleSource,
  onFollowUpClick,
  scrollToBottom
}) => {
  return (
    <div className="flex justify-start">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-full sm:max-w-3xl shadow-sm border border-gray-200 w-full">
        <div className="prose prose-sm max-w-none">
          <div className="whitespace-pre-wrap text-gray-800">{content}</div>
        </div>

        {sources && sources.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="font-semibold text-gray-900 text-sm">Sources</h3>
            </div>
            <div className="space-y-3">
              {sources.map((source, i) => {
                const isExpanded = expandedSources[`${messageIndex}-${i}`];
                return (
                  <SourceCard
                    key={i}
                    source={source}
                    index={i}
                    isExpanded={isExpanded}
                    onToggle={() => onToggleSource(messageIndex, i)}
                  />
                );
              })}
            </div>
          </div>
        )}

        <FollowUpQuestions
          questions={followUpQuestions}
          onQuestionClick={(question) => {
            onFollowUpClick(question);
            scrollToBottom();
          }}
        />
      </div>
    </div>
  );
};
