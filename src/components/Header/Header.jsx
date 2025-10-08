import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, Loader2, MessageSquare, History, Save, Download, Trash2 } from 'lucide-react';
import { downloadAsPDF, downloadAsText } from '../../utils/export';

export const Header = ({
  messages,
  savedConversations,
  currentConversationId,
  backendStatus,
  showHistory,
  setShowHistory,
  showExportMenu,
  setShowExportMenu,
  handleStartNewConversation,
  handleLoadConversation,
  deleteConversation,
  saveCurrentConversation,
  clearChat
}) => {
  return (
    <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg">
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Medical Evidence Search</h1>
              <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Evidence-based medical information powered by PubMed & AI</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* History Button */}
            <div className="relative">
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                  showHistory || savedConversations.length > 0
                    ? 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Conversation history"
              >
                <History className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">History</span>
                {savedConversations.length > 0 && (
                  <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {savedConversations.length}
                  </span>
                )}
              </button>

              {/* History Dropdown */}
              {showHistory && (
                <div className="absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                  <div className="p-3 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                    <h3 className="font-semibold text-gray-900 text-sm">Saved Conversations</h3>
                    <button
                      onClick={handleStartNewConversation}
                      className="text-xs bg-indigo-600 text-white px-2 py-1 rounded hover:bg-indigo-700"
                    >
                      New Chat
                    </button>
                  </div>
                  {savedConversations.length === 0 ? (
                    <div className="p-6 text-center text-gray-500 text-sm">
                      No saved conversations yet
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {savedConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 hover:bg-gray-50 cursor-pointer ${
                            currentConversationId === conv.id ? 'bg-indigo-50' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="flex-1 min-w-0"
                              onClick={() => handleLoadConversation(conv)}
                            >
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {conv.title}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {new Date(conv.timestamp).toLocaleDateString()} • {Math.floor(conv.messages.length / 2)} exchanges
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conv.id);
                              }}
                              className="text-red-500 hover:text-red-700 p-1"
                              title="Delete conversation"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {messages.length > 0 && (
              <>
                <div className="hidden sm:flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full">
                  <MessageSquare className="w-4 h-4 text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">
                    {Math.floor(messages.length / 2)} {Math.floor(messages.length / 2) === 1 ? 'exchange' : 'exchanges'}
                  </span>
                </div>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className="flex items-center gap-1 sm:gap-2 bg-blue-50 hover:bg-blue-100 text-blue-600 px-2 sm:px-3 py-1.5 rounded-full transition-colors"
                    title="Export conversation"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">Export</span>
                  </button>

                  {showExportMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
                      <button
                        onClick={() => {
                          downloadAsText(messages);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3"
                      >
                        <div className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">Text File</div>
                          <div className="text-xs text-gray-500">Plain text (.txt)</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          downloadAsPDF(messages);
                          setShowExportMenu(false);
                        }}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors flex items-center gap-3 border-t border-gray-100"
                      >
                        <BookOpen className="w-4 h-4 text-gray-600" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">PDF Document</div>
                          <div className="text-xs text-gray-500">Portable document (.pdf)</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={saveCurrentConversation}
                  className="flex items-center gap-1 sm:gap-2 bg-green-50 hover:bg-green-100 text-green-600 px-2 sm:px-3 py-1.5 rounded-full transition-colors"
                  title="Save conversation"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={clearChat}
                  className="flex items-center gap-1 sm:gap-2 bg-red-50 hover:bg-red-100 text-red-600 px-2 sm:px-3 py-1.5 rounded-full transition-colors"
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Clear</span>
                </button>
              </>
            )}

            {/* Backend Status */}
            {backendStatus === 'connected' && (
              <div className="hidden sm:flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-xs font-medium text-green-700">Backend Connected</span>
              </div>
            )}
            {backendStatus === 'error' && (
              <div className="flex items-center gap-2 bg-red-50 px-2 sm:px-3 py-1.5 rounded-full border border-red-200">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-xs font-medium text-red-700 hidden sm:inline">Backend Offline</span>
              </div>
            )}
            {backendStatus === 'checking' && (
              <div className="flex items-center gap-2 bg-gray-50 px-2 sm:px-3 py-1.5 rounded-full border border-gray-200">
                <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                <span className="text-xs font-medium text-gray-700 hidden sm:inline">Checking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
