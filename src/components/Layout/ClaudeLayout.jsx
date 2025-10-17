import React, { useState } from 'react';
import { Sparkles, Filter, X, Moon, Sun } from 'lucide-react';

export const ClaudeLayout = ({ children, userName = "User", onToggleExperience, onOpenSidebar, darkMode, toggleDarkMode }) => {
  const currentHour = new Date().getHours();
  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] text-white flex flex-col">
      {/* Minimal Top Bar */}
      <div className="fixed top-0 left-0 right-0 h-14 flex items-center justify-between px-4 border-b border-gray-800 bg-[#1a1a1a] z-50">
        <div className="flex items-center gap-3">
          {/* Sidebar toggle (hamburger) */}
          <button onClick={onOpenSidebar} className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Toggle UI Button */}
          <button
            onClick={onToggleExperience}
            className="px-3 py-1.5 text-xs bg-gray-800 hover:bg-gray-700 rounded-md transition-colors"
          >
            Switch to Classic
          </button>

          {/* User profile circle */}
          <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium hover:bg-gray-600 transition-colors">
            {userName.charAt(0).toUpperCase()}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 pt-14">
        {children}
      </div>
    </div>
  );
};

export const ClaudeGreeting = ({ userName = "User", onToolClick }) => {
  const currentHour = new Date().getHours();
  let greeting = "Good evening";

  if (currentHour < 12) {
    greeting = "Good morning";
  } else if (currentHour < 18) {
    greeting = "Good afternoon";
  }

  const medicalTools = [
    { icon: "📊", label: "Clinical Calculators", action: "calculators" },
    { icon: "📄", label: "Document Analysis", action: "document" },
    { icon: "💊", label: "Drug Information", action: "drug" },
    { icon: "📚", label: "Clinical Guidelines", action: "guidelines" },
    { icon: "🔔", label: "Evidence Alerts", action: "alerts" },
    { icon: "📝", label: "Visit Notes", action: "visitNotes" }
  ];

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
      <div className="max-w-3xl w-full px-6 flex flex-col items-center">
        {/* Greeting */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-orange-400" />
            <h1 className="text-4xl font-light text-gray-200">
              {greeting}, {userName}
            </h1>
          </div>
        </div>

        {/* Medical Tools Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8 w-full">
          {medicalTools.map((tool) => (
            <button
              key={tool.action}
              onClick={() => onToolClick?.(tool.action)}
              className="flex flex-col items-center gap-2 px-4 py-4 bg-transparent border border-gray-700 hover:border-gray-600 rounded-lg transition-all hover:bg-gray-800/50"
            >
              <span className="text-2xl">{tool.icon}</span>
              <span className="text-sm text-gray-300 text-center">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ClaudeChatInput = ({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "How can I help you today?",
  deepResearchMode,
  onToggleDeepResearch,
  filters,
  setFilters
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const hasActiveFilters = filters?.dateRange !== 'all' || filters?.studyType !== 'all';

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-[#1a1a1a] border-t border-gray-800 p-4">
      <div className="max-w-3xl mx-auto">
        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-4 p-4 bg-[#2a2a2a] border border-gray-700 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-orange-400" />
                <h3 className="font-semibold text-gray-100 text-sm">Search Filters</h3>
              </div>
              <button
                onClick={() => setShowFilters(false)}
                className="text-gray-400 hover:text-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Publication Date
                </label>
                <select
                  value={filters?.dateRange || 'all'}
                  onChange={(e) => setFilters?.({...filters, dateRange: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
                >
                  <option value="all">All time</option>
                  <option value="1year">Last year</option>
                  <option value="5years">Last 5 years</option>
                  <option value="10years">Last 10 years</option>
                </select>
              </div>

              {/* Study Type Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Study Type
                </label>
                <select
                  value={filters?.studyType || 'all'}
                  onChange={(e) => setFilters?.({...filters, studyType: e.target.value})}
                  className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 text-sm"
                >
                  <option value="all">All types</option>
                  <option value="rct">Randomized Controlled Trial</option>
                  <option value="meta">Meta-Analysis</option>
                  <option value="review">Review / Systematic Review</option>
                  <option value="clinical">Clinical Trial</option>
                  <option value="guideline">Guideline</option>
                </select>
              </div>
            </div>

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mt-4 flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-400">Active:</span>
                {filters?.dateRange !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-xs border border-orange-600/30">
                    {filters.dateRange === '1year' ? 'Last year' : filters.dateRange === '5years' ? 'Last 5 years' : 'Last 10 years'}
                    <button
                      onClick={() => setFilters?.({...filters, dateRange: 'all'})}
                      className="hover:text-orange-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
                {filters?.studyType !== 'all' && (
                  <span className="inline-flex items-center gap-1 bg-orange-600/20 text-orange-400 px-2 py-1 rounded text-xs border border-orange-600/30">
                    {filters.studyType === 'rct' ? 'RCT' : filters.studyType === 'meta' ? 'Meta-Analysis' : filters.studyType === 'review' ? 'Review' : filters.studyType === 'clinical' ? 'Clinical Trial' : 'Guideline'}
                    <button
                      onClick={() => setFilters?.({...filters, studyType: 'all'})}
                      className="hover:text-orange-300"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Controls Row - Deep Research & Filters */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <button
            onClick={onToggleDeepResearch}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors ${
              deepResearchMode
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <span>Deep Research {deepResearchMode ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs transition-colors ${
              showFilters || hasActiveFilters
                ? 'bg-orange-600 text-white'
                : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters{hasActiveFilters ? ' (Active)' : ''}</span>
          </button>
        </div>

        <div className="relative bg-[#2a2a2a] rounded-lg border border-gray-700 focus-within:border-gray-600 transition-colors">
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            rows={1}
            className="w-full bg-transparent text-white px-4 py-3 pr-14 resize-none focus:outline-none placeholder-gray-500 text-sm"
            style={{
              minHeight: '48px',
              maxHeight: '200px'
            }}
          />

          <div className="absolute right-2 bottom-2 flex items-center gap-2">
            {/* Submit button */}
            <button
              onClick={onSubmit}
              disabled={disabled || !value.trim()}
              className="p-2 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-700 disabled:cursor-not-allowed rounded transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="19" x2="12" y2="5"></line>
                <polyline points="5 12 12 5 19 12"></polyline>
              </svg>
            </button>
          </div>
        </div>

        <div className="text-xs text-gray-500 text-center mt-2">
          Medical Evidence Tool powered by AI
        </div>
      </div>
    </div>
  );
};
