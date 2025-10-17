import React from 'react';
import { BookOpen, CheckCircle, AlertCircle, Loader2, MessageSquare, History, Save, Download, Trash2, Moon, Sun } from 'lucide-react';
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
  clearChat,
  darkMode,
  toggleDarkMode
}) => {
  return (
    <div className={`${darkMode ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'} border-b px-3 sm:px-6 py-3 sm:py-4 shadow-sm transition-colors`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3">
          {/* Logo and Title */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} p-1.5 sm:p-2 rounded-lg`}>
              <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className={`text-lg sm:text-2xl font-bold ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Medical Evidence Search</h1>
              <p className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} hidden sm:block`}>Evidence-based medical information powered by PubMed & AI</p>
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
                    ? darkMode
                      ? 'bg-indigo-900 hover:bg-indigo-800 text-indigo-300'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-600'
                    : darkMode
                      ? 'bg-gray-800 hover:bg-gray-700 text-gray-400'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
                title="Conversation history"
              >
                <History className="w-4 h-4" />
                <span className="text-xs sm:text-sm font-medium hidden sm:inline">History</span>
                {savedConversations.length > 0 && (
                  <span className={`${darkMode ? 'bg-indigo-500' : 'bg-indigo-600'} text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center`}>
                    {savedConversations.length}
                  </span>
                )}
              </button>

              {/* History Dropdown */}
              {showHistory && (
                <div className={`absolute right-0 top-full mt-2 w-[calc(100vw-2rem)] sm:w-80 max-w-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto`}>
                  <div className={`p-3 ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'} border-b flex items-center justify-between sticky top-0`}>
                    <h3 className={`font-semibold text-sm ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Saved Conversations</h3>
                    <button
                      onClick={handleStartNewConversation}
                      className={`text-xs ${darkMode ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white px-2 py-1 rounded`}
                    >
                      New Chat
                    </button>
                  </div>
                  {savedConversations.length === 0 ? (
                    <div className={`p-6 text-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      No saved conversations yet
                    </div>
                  ) : (
                    <div className={`divide-y ${darkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                      {savedConversations.map((conv) => (
                        <div
                          key={conv.id}
                          className={`p-3 cursor-pointer ${
                            currentConversationId === conv.id
                              ? darkMode
                                ? 'bg-indigo-900'
                                : 'bg-indigo-50'
                              : darkMode
                                ? 'hover:bg-gray-750'
                                : 'hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div
                              className="flex-1 min-w-0"
                              onClick={() => handleLoadConversation(conv)}
                            >
                              <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>
                                {conv.title}
                              </p>
                              <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(conv.timestamp).toLocaleDateString()} • {Math.floor(conv.messages.length / 2)} exchanges
                              </p>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteConversation(conv.id);
                              }}
                              className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} p-1`}
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
                <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <MessageSquare className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                  <span className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    {Math.floor(messages.length / 2)} {Math.floor(messages.length / 2) === 1 ? 'exchange' : 'exchanges'}
                  </span>
                </div>

                {/* Export Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowExportMenu(!showExportMenu)}
                    className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                      darkMode
                        ? 'bg-blue-900 hover:bg-blue-800 text-blue-300'
                        : 'bg-blue-50 hover:bg-blue-100 text-blue-600'
                    }`}
                    title="Export conversation"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-xs sm:text-sm font-medium hidden sm:inline">Export</span>
                  </button>

                  {showExportMenu && (
                    <div className={`absolute right-0 top-full mt-2 w-48 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-lg shadow-lg border z-50 overflow-hidden`}>
                      <button
                        onClick={() => {
                          downloadAsText(messages);
                          setShowExportMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                          darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>Text File</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Plain text (.txt)</div>
                        </div>
                      </button>
                      <button
                        onClick={() => {
                          downloadAsPDF(messages);
                          setShowExportMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 transition-colors flex items-center gap-3 ${
                          darkMode ? 'border-gray-700 hover:bg-gray-700' : 'border-gray-100 hover:bg-gray-50'
                        } border-t`}
                      >
                        <BookOpen className={`w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                        <div>
                          <div className={`text-sm font-medium ${darkMode ? 'text-gray-100' : 'text-gray-900'}`}>PDF Document</div>
                          <div className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Portable document (.pdf)</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={saveCurrentConversation}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                    darkMode
                      ? 'bg-green-900 hover:bg-green-800 text-green-300'
                      : 'bg-green-50 hover:bg-green-100 text-green-600'
                  }`}
                  title="Save conversation"
                >
                  <Save className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Save</span>
                </button>
                <button
                  onClick={clearChat}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                    darkMode
                      ? 'bg-red-900 hover:bg-red-800 text-red-300'
                      : 'bg-red-50 hover:bg-red-100 text-red-600'
                  }`}
                  title="Clear conversation"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="text-xs sm:text-sm font-medium hidden sm:inline">Clear</span>
                </button>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-full transition-colors ${
                darkMode
                  ? 'bg-gray-800 hover:bg-gray-700 text-gray-300'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
              title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              <span className="text-xs sm:text-sm font-medium hidden sm:inline">
                {darkMode ? 'Light' : 'Dark'}
              </span>
            </button>

            {/* Backend Status */}
            {backendStatus === 'connected' && (
              <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border ${
                darkMode
                  ? 'bg-green-900 border-green-700'
                  : 'bg-green-50 border-green-200'
              }`}>
                <CheckCircle className={`w-4 h-4 ${darkMode ? 'text-green-400' : 'text-green-600'}`} />
                <span className={`text-xs font-medium ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Backend Connected</span>
              </div>
            )}
            {backendStatus === 'error' && (
              <div className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full border ${
                darkMode
                  ? 'bg-red-900 border-red-700'
                  : 'bg-red-50 border-red-200'
              }`}>
                <AlertCircle className={`w-4 h-4 ${darkMode ? 'text-red-400' : 'text-red-600'}`} />
                <span className={`text-xs font-medium hidden sm:inline ${darkMode ? 'text-red-300' : 'text-red-700'}`}>Backend Offline</span>
              </div>
            )}
            {backendStatus === 'checking' && (
              <div className={`flex items-center gap-2 px-2 sm:px-3 py-1.5 rounded-full border ${
                darkMode
                  ? 'bg-gray-800 border-gray-700'
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <Loader2 className={`w-4 h-4 animate-spin ${darkMode ? 'text-gray-400' : 'text-gray-600'}`} />
                <span className={`text-xs font-medium hidden sm:inline ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Checking...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
