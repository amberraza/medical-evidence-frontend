import React from 'react';
import {
  Plus,
  MessageSquare,
  FolderOpen,
  Settings,
  Calculator,
  FileText,
  Pill,
  BookOpen,
  Bell,
  Stethoscope,
  X
} from 'lucide-react';

export const ClaudeSidebar = ({
  isOpen,
  onClose,
  onNewChat,
  savedConversations,
  currentConversationId,
  onLoadConversation,
  onDeleteConversation,
  onOpenCalculators,
  onOpenDocumentUpload,
  onOpenDrugInfo,
  onOpenGuidelines,
  onOpenAlerts,
  onOpenVisitNotes,
  userName = "User"
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-[#1a1a1a] border-r border-gray-800 transform transition-transform duration-300 ease-in-out z-50 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <h2 className="text-white font-semibold">Evidex</h2>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-gray-800 rounded transition-colors text-gray-400"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* New Chat Button */}
          <div className="p-3 border-b border-gray-800">
            <button
              onClick={() => {
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="text-sm">New chat</span>
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            {/* Medical Tools - Moved to top */}
            <div className="p-3 border-b border-gray-800">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
                Medical Tools
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onOpenCalculators();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span className="text-xs">Clinical Calculators</span>
                </button>

                <button
                  onClick={() => {
                    onOpenDocumentUpload();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="text-xs">Document Analysis</span>
                </button>

                <button
                  onClick={() => {
                    onOpenDrugInfo();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <Pill className="w-3.5 h-3.5" />
                  <span className="text-xs">Drug Information</span>
                </button>

                <button
                  onClick={() => {
                    onOpenGuidelines();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span className="text-xs">Clinical Guidelines</span>
                </button>

                <button
                  onClick={() => {
                    onOpenAlerts();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="text-xs">Evidence Alerts</span>
                </button>

                <button
                  onClick={() => {
                    onOpenVisitNotes();
                    onClose();
                  }}
                  className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span className="text-xs">Visit Notes</span>
                </button>
              </div>
            </div>

            {/* Starred Section */}
            <div className="p-3 border-t border-gray-800">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
                Starred
              </h3>
              <div className="text-xs text-gray-500 px-2">
                No starred conversations
              </div>
            </div>

            {/* Recent Chats */}
            {savedConversations.length > 0 && (
              <div className="p-3 border-t border-gray-800">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
                  Recents
                </h3>
                <div className="space-y-1">
                  {savedConversations.slice(0, 10).map((conv) => (
                    <div
                      key={conv.id}
                      className="group relative"
                    >
                      <button
                        onClick={() => {
                          onLoadConversation(conv);
                          onClose();
                        }}
                        className={`w-full text-left px-2 py-2 rounded hover:bg-gray-800 transition-colors ${
                          currentConversationId === conv.id
                            ? 'bg-gray-800 text-white'
                            : 'text-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-3.5 h-3.5 flex-shrink-0" />
                          <span className="text-xs truncate">{conv.title}</span>
                        </div>
                      </button>
                      <button
                        onClick={() => onDeleteConversation(conv.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-700 rounded transition-all"
                      >
                        <X className="w-3 h-3 text-gray-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Projects Placeholder */}
            {/* <div className="p-3 border-t border-gray-800">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
                Projects
              </h3>
              <button className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors">
                <FolderOpen className="w-3.5 h-3.5" />
                <span className="text-xs">Create project</span>
              </button>
            </div> */}

            {/* Artifacts Placeholder */}
            {/* <div className="p-3 border-t border-gray-800">
              <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">
                Artifacts
              </h3>
              <div className="text-xs text-gray-500 px-2">
                No artifacts yet
              </div>
            </div> */}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-800">
            {/* <button className="w-full flex items-center gap-2 px-2 py-2 text-gray-300 hover:bg-gray-800 rounded transition-colors">
              <Settings className="w-3.5 h-3.5" />
              <span className="text-xs">Settings</span>
            </button> */}

            {/* Account Info */}
            <div className="mt-2 px-2 py-1">
              <div className="text-xs text-gray-500">{userName}</div>
              <div className="text-xs text-gray-600">Pro plan</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
