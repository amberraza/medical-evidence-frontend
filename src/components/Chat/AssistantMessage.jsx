import React from 'react';
import { FileText, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { SourceCard } from './SourceCard';
import { FollowUpQuestions } from './FollowUpQuestions';

export const AssistantMessage = ({
  content,
  sources,
  followUpQuestions,
  suggestions,
  messageIndex,
  expandedSources,
  onToggleSource,
  onFollowUpClick,
  scrollToBottom,
  isLoading,
  darkMode = false
}) => {
  return (
    <div className="flex justify-start">
      <div className={`rounded-lg p-4 sm:p-6 max-w-full sm:max-w-3xl shadow-sm w-full ${
        darkMode
          ? 'bg-[#2a2a2a] border border-gray-700 text-gray-100'
          : 'bg-white border border-gray-200'
      }`}>
        {isLoading ? (
          <div className={`flex items-center gap-3 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            <Loader2 className={`w-5 h-5 animate-spin ${darkMode ? 'text-orange-500' : 'text-indigo-600'}`} />
            <div className="prose prose-sm max-w-none">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          </div>
        ) : (
          <div className={`prose prose-sm max-w-none ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className={`text-2xl font-bold mt-6 mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                h2: ({node, ...props}) => <h2 className={`text-xl font-bold mt-5 mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                h3: ({node, ...props}) => <h3 className={`text-lg font-semibold mt-4 mb-2 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                h4: ({node, ...props}) => <h4 className={`text-base font-semibold mt-3 mb-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} {...props} />,
                p: ({node, ...props}) => <p className={`mb-3 leading-relaxed ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc ml-6 mb-3 space-y-1.5" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal ml-6 mb-3 space-y-1.5" {...props} />,
                li: ({node, ...props}) => <li className={`pl-2 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} {...props} />,
                strong: ({node, ...props}) => <strong className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`} {...props} />,
                em: ({node, ...props}) => <em className={`italic ${darkMode ? 'text-gray-200' : 'text-gray-800'}`} {...props} />,
                hr: ({node, ...props}) => <hr className={`my-6 ${darkMode ? 'border-gray-700' : 'border-gray-300'}`} {...props} />,
                blockquote: ({node, ...props}) => <blockquote className={`border-l-4 pl-4 italic my-4 ${darkMode ? 'border-orange-500' : 'border-indigo-500'}`} {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        )}

        {sources && sources.length > 0 && (
          <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <div className="flex items-center gap-2 mb-3">
              <FileText className={`w-4 h-4 ${darkMode ? 'text-orange-500' : 'text-indigo-600'}`} />
              <h3 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Sources</h3>
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

        {suggestions && suggestions.length > 0 && (
          <div className={`mt-6 pt-6 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h3 className={`font-semibold text-sm mb-3 ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>💡 Suggested Alternative Queries:</h3>
            <div className="space-y-2">
              {suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onFollowUpClick(sug.query);
                    scrollToBottom();
                  }}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-colors group ${
                    darkMode
                      ? 'border-orange-800 bg-orange-950/30 hover:bg-orange-950/50'
                      : 'border-indigo-200 bg-indigo-50 hover:bg-indigo-100'
                  }`}
                >
                  <div className={`font-medium mb-1 ${
                    darkMode
                      ? 'text-orange-200 group-hover:text-orange-100'
                      : 'text-indigo-900 group-hover:text-indigo-700'
                  }`}>
                    {idx + 1}. {sug.query}
                  </div>
                  <div className={`text-sm italic ${
                    darkMode ? 'text-orange-300' : 'text-indigo-700'
                  }`}>
                    {sug.reason}
                  </div>
                </button>
              ))}
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
