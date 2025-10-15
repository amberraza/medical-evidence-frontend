import React from 'react';
import { FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
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
        <div className="prose prose-sm max-w-none text-gray-800">
          <ReactMarkdown
            components={{
              h1: ({node, ...props}) => <h1 className="text-2xl font-bold mt-6 mb-4 text-gray-900" {...props} />,
              h2: ({node, ...props}) => <h2 className="text-xl font-bold mt-5 mb-3 text-gray-900" {...props} />,
              h3: ({node, ...props}) => <h3 className="text-lg font-semibold mt-4 mb-2 text-gray-900" {...props} />,
              h4: ({node, ...props}) => <h4 className="text-base font-semibold mt-3 mb-2 text-gray-800" {...props} />,
              p: ({node, ...props}) => <p className="mb-3 text-gray-800 leading-relaxed" {...props} />,
              ul: ({node, ...props}) => <ul className="list-disc list-inside mb-3 space-y-1" {...props} />,
              ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-3 space-y-1" {...props} />,
              li: ({node, ...props}) => <li className="text-gray-800" {...props} />,
              strong: ({node, ...props}) => <strong className="font-semibold text-gray-900" {...props} />,
              em: ({node, ...props}) => <em className="italic text-gray-800" {...props} />,
              hr: ({node, ...props}) => <hr className="my-6 border-gray-300" {...props} />,
              blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-indigo-500 pl-4 italic my-4" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
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
