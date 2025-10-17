import React, { useState, useRef, useEffect } from 'react';
import { useConversation } from './hooks/useConversation';
import { useBackendHealth } from './hooks/useBackendHealth';
import { Header } from './components/Header/Header';
import { EmptyState } from './components/Common/EmptyState';
import { UserMessage } from './components/Chat/UserMessage';
import { AssistantMessage } from './components/Chat/AssistantMessage';
import { LoadingIndicator } from './components/Common/LoadingIndicator';
import { ErrorMessage } from './components/Common/ErrorMessage';
import { SearchInput } from './components/Input/SearchInput';
import { DeepResearchProgress } from './components/Research/DeepResearchPanel';
import { ClinicalCalculators } from './components/Calculators/ClinicalCalculators';
import { DocumentUpload } from './components/Document/DocumentUpload';
import { DrugInfo } from './components/DrugInfo/DrugInfo';
import { ClinicalGuidelines } from './components/Guidelines/ClinicalGuidelines';
import { EvidenceAlerts } from './components/Alerts/EvidenceAlerts';
import { VisitNotes } from './components/VisitNotes/VisitNotes';
import { ClaudeLayout, ClaudeGreeting, ClaudeChatInput } from './components/Layout/ClaudeLayout';
import { ClaudeSidebar } from './components/Layout/ClaudeSidebar';
import * as api from './services/api';
import { DARK_MODE_KEY } from './constants/config';

export default function MedicalEvidenceTool() {
  // Custom hooks
  const {
    messages,
    setMessages,
    savedConversations,
    currentConversationId,
    saveCurrentConversation,
    loadConversation,
    deleteConversation,
    startNewConversation,
    clearConversation,
    addMessage
  } = useConversation();

  const backendStatus = useBackendHealth();

  // Local state
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(null);
  const [articleCount, setArticleCount] = useState(0);
  const [error, setError] = useState(null);
  const [errorRetryable, setErrorRetryable] = useState(true);
  const [lastQuery, setLastQuery] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    studyType: 'all'
  });
  const [expandedSources, setExpandedSources] = useState({});
  const [showHistory, setShowHistory] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [deepResearchLoading, setDeepResearchLoading] = useState(false);
  const [deepResearchStage, setDeepResearchStage] = useState(null);
  const [deepResearchQuery, setDeepResearchQuery] = useState('');
  const [deepResearchMode, setDeepResearchMode] = useState(false);
  const [showCalculators, setShowCalculators] = useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [showDrugInfo, setShowDrugInfo] = useState(false);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [showVisitNotes, setShowVisitNotes] = useState(false);
  const [newExperience, setNewExperience] = useState(true); // Toggle for new UI
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userName, setUserName] = useState(() => {
    // Load user name from localStorage, default to "User"
    return localStorage.getItem('medicalEvidenceUserName') || 'User';
  });
  const [showNamePrompt, setShowNamePrompt] = useState(() => {
    // Show name prompt if never set before
    return !localStorage.getItem('medicalEvidenceUserName');
  });
  const [tempUserName, setTempUserName] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    // Load dark mode preference from localStorage, default to false
    const saved = localStorage.getItem(DARK_MODE_KEY);
    return saved ? JSON.parse(saved) : false;
  });
  const messagesEndRef = useRef(null);

  const toggleSource = (messageIndex, sourceIndex) => {
    const key = `${messageIndex}-${sourceIndex}`;
    setExpandedSources(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSaveUserName = () => {
    const name = tempUserName.trim() || 'User';
    setUserName(name);
    localStorage.setItem('medicalEvidenceUserName', name);
    setShowNamePrompt(false);
  };

  const toggleDarkMode = () => {
    setDarkMode(prev => {
      const newValue = !prev;
      localStorage.setItem(DARK_MODE_KEY, JSON.stringify(newValue));
      return newValue;
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (retryQuery = null) => {
    // If retryQuery is an event object (from button click), ignore it
    const isEvent = retryQuery && typeof retryQuery === 'object' && retryQuery.nativeEvent;
    const queryToSubmit = (isEvent || !retryQuery) ? input.trim() : retryQuery;

    if (!queryToSubmit || loading) return;

    if (backendStatus !== 'connected') {
      setError('Backend server is not running. Please start the server first.');
      setErrorRetryable(false);
      return;
    }

    const userMessage = queryToSubmit;

    // Always clear the input field after submission
    setInput('');

    if (!retryQuery || isEvent) {
      setLastQuery(userMessage);
    }
    setError(null);
    setErrorRetryable(true);

    if (!retryQuery || isEvent) {
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage
      }]);
    }

    // If deep research mode is enabled, use the dedicated handler
    if (deepResearchMode) {
      await handleDeepResearch();
      return;
    }

    setLoading(true);
    setLoadingStage('searching');
    setArticleCount(0);

    try {
      // Stage 0: Preprocess query to optimize for medical literature search
      let searchQuery = userMessage;
      try {
        const preprocessResult = await api.preprocessQuery(userMessage);
        searchQuery = preprocessResult.optimizedQuery;
        console.log(`Original query: "${userMessage}"`);
        console.log(`Optimized query: "${searchQuery}"`);
      } catch (preprocessErr) {
        console.warn('Query preprocessing failed, using original query:', preprocessErr);
        // Continue with original query if preprocessing fails
      }

      // Stage 1: Search multiple sources (PubMed + Europe PMC)
      const searchResults = await api.searchMultipleSources(searchQuery, filters, ['pubmed', 'europepmc']);
      const articles = searchResults.articles || [];
      const confidence = searchResults.confidence || 'high';
      const confidenceMessage = searchResults.confidenceMessage;

      if (articles.length === 0) {
        // Generate smart query suggestions
        setLoadingStage('generating');
        let suggestions = [];
        try {
          const suggestionsResult = await api.getQuerySuggestions(userMessage);
          suggestions = suggestionsResult.suggestions || [];
        } catch (suggErr) {
          console.warn('Query suggestions failed:', suggErr);
        }

        let noResultsMessage = 'I couldn\'t find relevant medical literature for your query.';

        if (suggestions.length > 0) {
          noResultsMessage += '\n\n**Try these alternative searches:**\n\n';
          suggestions.forEach((sug, idx) => {
            noResultsMessage += `${idx + 1}. **${sug.query}**\n   *${sug.reason}*\n\n`;
          });
        } else {
          noResultsMessage += '\n\nPlease try:\n- Using standard medical terminology\n- Being more specific about the condition or treatment\n- Removing exam-style formatting (A, B, C, D, E)\n- Focusing on clinical aspects rather than demographics';
        }

        setMessages(prev => [...prev, {
          role: 'assistant',
          content: noResultsMessage,
          sources: [],
          suggestions: suggestions
        }]);
        setLoading(false);
        setLoadingStage(null);
        return;
      }

      // Show confidence warning if applicable
      if (confidenceMessage) {
        console.log(confidenceMessage);
      }

      // Stage 2: Found articles
      setLoadingStage('found');
      setArticleCount(articles.length);

      // Small delay to show the "found articles" stage
      await new Promise(resolve => setTimeout(resolve, 800));

      // Stage 3: Generate response using Claude
      setLoadingStage('generating');

      // Build conversation history (exclude the current user message)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const responseData = await api.generateResponse(userMessage, articles, conversationHistory);

      // Prepend confidence message if present
      let responseContent = responseData.response || responseData;
      if (confidenceMessage) {
        responseContent = `${confidenceMessage}\n\n${responseContent}`;
      }

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseContent,
        sources: articles,
        followUpQuestions: responseData.followUpQuestions || [],
        searchConfidence: confidence
      }]);

      setLastQuery(null); // Clear last query on success
    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.error || 'An error occurred while processing your request. Please try again.';
      const retryable = errorData?.retryable !== false;

      setError(errorMessage);
      setErrorRetryable(retryable);
      console.error(err);
    } finally {
      setLoading(false);
      setLoadingStage(null);
      setArticleCount(0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Wrapper for clearConversation that also clears error
  const clearChat = () => {
    clearConversation();
    setError(null);
  };

  // Wrapper for loadConversation that also clears UI state
  const handleLoadConversation = (conversation) => {
    loadConversation(conversation);
    setShowHistory(false);
    setExpandedSources({});
  };

  // Wrapper for startNewConversation that also clears UI state
  const handleStartNewConversation = () => {
    startNewConversation();
    setExpandedSources({});
    setShowHistory(false);
  };

  // Deep Research handler
  const handleDeepResearch = async () => {
    // Note: User message is already added by handleSubmit
    const query = input.trim();
    if (!query) return;

    setDeepResearchLoading(true);
    setDeepResearchQuery(query);
    setError(null);

    try {
      // Stage 1: Initial search
      setDeepResearchStage('initial');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Analysis
      setDeepResearchStage('analysis');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 3: Follow-up
      setDeepResearchStage('followup');

      // Perform deep research
      const result = await api.performDeepResearch(query, filters);

      // Stage 4: Synthesis
      setDeepResearchStage('synthesis');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Add deep research result as assistant message
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.synthesis,
        sources: result.initialArticles,
        deepResearch: {
          followUpQuestions: result.followUpQuestions,
          followUpResults: result.followUpResults,
          totalArticles: result.totalArticlesAnalyzed
        }
      }]);

    } catch (err) {
      const errorData = err.response?.data;
      const errorMessage = errorData?.error || 'Deep research failed. Please try again.';
      setError(errorMessage);
      console.error(err);
    } finally {
      setDeepResearchLoading(false);
      setDeepResearchStage(null);
      setDeepResearchQuery('');
    }
  };

  // Document analysis handler
  const handleAnalyzeDocument = async (file) => {
    try {
      setMessages(prev => [...prev, {
        role: 'user',
        content: `📄 Analyzing document: ${file.name}`
      }]);

      // Add loading message
      const loadingMessageId = Date.now();
      setMessages(prev => [...prev, {
        id: loadingMessageId,
        role: 'assistant',
        content: '🔄 Extracting text from document and analyzing with AI...',
        isLoading: true,
        sources: []
      }]);

      const result = await api.analyzeDocument(file);

      // Replace loading message with actual result
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.analysis,
        sources: []
      }]);
    } catch (err) {
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setError(err.message || 'Failed to analyze document');
      console.error(err);
    }
  };

  // Find similar papers handler
  const handleFindSimilar = async (file) => {
    try {
      setMessages(prev => [...prev, {
        role: 'user',
        content: `🔍 Finding papers similar to: ${file.name}`
      }]);

      // Add loading message
      const loadingMessageId = Date.now();
      setMessages(prev => [...prev, {
        id: loadingMessageId,
        role: 'assistant',
        content: '🔄 Extracting key concepts from document and searching medical databases...',
        isLoading: true,
        sources: []
      }]);

      const result = await api.findSimilarPapers(file);

      // Replace loading message with actual result
      setMessages(prev => prev.filter(msg => msg.id !== loadingMessageId));

      const responseText = `# Similar Papers Found\n\nSearch query used: **${result.searchQuery}**\n\nFound ${result.totalFound} similar papers. Showing top ${result.papers.length}:`;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseText,
        sources: result.papers
      }]);
    } catch (err) {
      // Remove loading message on error
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      setError(err.message || 'Failed to find similar papers');
      console.error(err);
    }
  };

  // Render New Claude-style UI
  if (newExperience) {
    return (
      <>
        {/* Name Prompt Modal */}
        {showNamePrompt && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]">
            <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-8 max-w-md w-full mx-4">
              <h2 className="text-2xl font-bold text-gray-100 mb-4">Welcome! 👋</h2>
              <p className="text-gray-300 mb-6">What should we call you?</p>
              <input
                type="text"
                value={tempUserName}
                onChange={(e) => setTempUserName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveUserName()}
                placeholder="Enter your name"
                className="w-full px-4 py-3 bg-[#1a1a1a] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500 mb-6"
                autoFocus
              />
              <button
                onClick={handleSaveUserName}
                className="w-full px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors"
              >
                Continue
              </button>
            </div>
          </div>
        )}

        <ClaudeLayout
          userName={userName}
          onToggleExperience={() => setNewExperience(false)}
          onOpenSidebar={() => setSidebarOpen(true)}
          darkMode={darkMode}
          toggleDarkMode={toggleDarkMode}
        >
          <ClaudeSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            onNewChat={handleStartNewConversation}
            savedConversations={savedConversations}
            currentConversationId={currentConversationId}
            onLoadConversation={handleLoadConversation}
            onDeleteConversation={deleteConversation}
            onOpenCalculators={() => { setShowCalculators(!showCalculators); setSidebarOpen(false); }}
            onOpenDocumentUpload={() => { setShowDocumentUpload(!showDocumentUpload); setSidebarOpen(false); }}
            onOpenDrugInfo={() => { setShowDrugInfo(!showDrugInfo); setSidebarOpen(false); }}
            onOpenGuidelines={() => { setShowGuidelines(!showGuidelines); setSidebarOpen(false); }}
            onOpenAlerts={() => { setShowAlerts(!showAlerts); setSidebarOpen(false); }}
            onOpenVisitNotes={() => { setShowVisitNotes(!showVisitNotes); setSidebarOpen(false); }}
            userName={userName}
          />

        {/* Main Content Area */}
        <div className="flex flex-col h-full">
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto pb-32">
            {messages.length === 0 && !showCalculators && !showDocumentUpload && !showDrugInfo && !showGuidelines && !showAlerts && !showVisitNotes ? (
              <ClaudeGreeting
                userName={userName}
                onToolClick={(tool) => {
                  if (tool === 'calculators') setShowCalculators(true);
                  else if (tool === 'document') setShowDocumentUpload(true);
                  else if (tool === 'drug') setShowDrugInfo(true);
                  else if (tool === 'guidelines') setShowGuidelines(true);
                  else if (tool === 'alerts') setShowAlerts(true);
                  else if (tool === 'visitNotes') setShowVisitNotes(true);
                }}
              />
            ) : (
              <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
                {/* Inline Tools */}
                {showCalculators && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-100">📊 Clinical Calculators</h2>
                      <button onClick={() => setShowCalculators(false)} className="text-gray-400 hover:text-gray-200">✕</button>
                    </div>
                    <ClinicalCalculators darkMode={true} />
                  </div>
                )}

                {showDocumentUpload && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-100">📄 Document Analysis</h2>
                      <button onClick={() => setShowDocumentUpload(false)} className="text-gray-400 hover:text-gray-200">✕</button>
                    </div>
                    <DocumentUpload onAnalyze={handleAnalyzeDocument} onFindSimilar={handleFindSimilar} darkMode={true} />
                  </div>
                )}

                {showDrugInfo && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-100">💊 Drug Information</h2>
                      <button onClick={() => setShowDrugInfo(false)} className="text-gray-400 hover:text-gray-200">✕</button>
                    </div>
                    <DrugInfo darkMode={true} />
                  </div>
                )}

                {showGuidelines && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-100">📚 Clinical Guidelines</h2>
                      <button onClick={() => setShowGuidelines(false)} className="text-gray-400 hover:text-gray-200">✕</button>
                    </div>
                    <ClinicalGuidelines darkMode={true} />
                  </div>
                )}

                {showAlerts && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-100">🔔 Evidence Alerts</h2>
                      <button onClick={() => setShowAlerts(false)} className="text-gray-400 hover:text-gray-200">✕</button>
                    </div>
                    <EvidenceAlerts darkMode={true} />
                  </div>
                )}

                {showVisitNotes && (
                  <div className="bg-[#2a2a2a] border border-gray-700 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-100">📝 Visit Notes</h2>
                      <button onClick={() => setShowVisitNotes(false)} className="text-gray-400 hover:text-gray-200">✕</button>
                    </div>
                    <VisitNotes darkMode={true} />
                  </div>
                )}

                {/* Chat Messages */}
                {messages.map((msg, idx) => (
                  msg.role === 'user' ? (
                    <div key={idx} className="flex justify-end">
                      <div className="bg-gray-800 text-white rounded-2xl px-4 py-3 max-w-2xl">
                        <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ) : (
                    <AssistantMessage
                      key={idx}
                      content={msg.content}
                      sources={msg.sources}
                      followUpQuestions={msg.followUpQuestions}
                      suggestions={msg.suggestions}
                      messageIndex={idx}
                      expandedSources={expandedSources}
                      onToggleSource={toggleSource}
                      onFollowUpClick={setInput}
                      scrollToBottom={scrollToBottom}
                      isLoading={msg.isLoading}
                      darkMode={true}
                    />
                  )
                ))}

                {loading && <LoadingIndicator loadingStage={loadingStage} articleCount={articleCount} />}

                {deepResearchLoading && (
                  <DeepResearchProgress
                    stage={deepResearchStage}
                    currentQuery={deepResearchQuery}
                    completedStages={[]}
                  />
                )}

                {error && (
                  <ErrorMessage
                    error={error}
                    errorRetryable={errorRetryable}
                    lastQuery={lastQuery}
                    onRetry={handleSubmit}
                  />
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Chat Input */}
          <ClaudeChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            disabled={loading || deepResearchLoading}
            placeholder="How can I help you today?"
            deepResearchMode={deepResearchMode}
            onToggleDeepResearch={() => setDeepResearchMode(!deepResearchMode)}
            filters={filters}
            setFilters={setFilters}
          />
        </div>
      </ClaudeLayout>
      </>
    );
  }

  // Render Classic UI
  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gradient-to-br from-gray-900 to-gray-800' : 'bg-gradient-to-br from-blue-50 to-indigo-50'}`}>
      <Header
        messages={messages}
        savedConversations={savedConversations}
        currentConversationId={currentConversationId}
        backendStatus={backendStatus}
        showHistory={showHistory}
        setShowHistory={setShowHistory}
        showExportMenu={showExportMenu}
        setShowExportMenu={setShowExportMenu}
        handleStartNewConversation={handleStartNewConversation}
        handleLoadConversation={handleLoadConversation}
        deleteConversation={deleteConversation}
        saveCurrentConversation={saveCurrentConversation}
        clearChat={clearChat}
        darkMode={darkMode}
        toggleDarkMode={toggleDarkMode}
      />

      {/* Toggle UI Button in Classic UI */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={() => setNewExperience(true)}
          className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors shadow-lg"
        >
          Try New UI
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 && <EmptyState darkMode={darkMode} />}

          {/* Always visible tools section */}
          <div className="space-y-4">
            <div className="flex justify-center gap-3 flex-wrap">
              <button
                onClick={() => setShowCalculators(!showCalculators)}
                className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg hover:bg-indigo-200 transition-colors font-medium flex items-center gap-2"
              >
                <span>📊</span>
                {showCalculators ? 'Hide' : 'Show'} Clinical Calculators
              </button>
              <button
                onClick={() => setShowDocumentUpload(!showDocumentUpload)}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors font-medium flex items-center gap-2"
              >
                <span>📄</span>
                {showDocumentUpload ? 'Hide' : 'Show'} Document Analysis
              </button>
              <button
                onClick={() => setShowDrugInfo(!showDrugInfo)}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium flex items-center gap-2"
              >
                <span>💊</span>
                {showDrugInfo ? 'Hide' : 'Show'} Drug Information
              </button>
              <button
                onClick={() => setShowGuidelines(!showGuidelines)}
                className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors font-medium flex items-center gap-2"
              >
                <span>📚</span>
                {showGuidelines ? 'Hide' : 'Show'} Clinical Guidelines
              </button>
              <button
                onClick={() => setShowAlerts(!showAlerts)}
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors font-medium flex items-center gap-2"
              >
                <span>🔔</span>
                {showAlerts ? 'Hide' : 'Show'} Evidence Alerts
              </button>
              <button
                onClick={() => setShowVisitNotes(!showVisitNotes)}
                className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium flex items-center gap-2"
              >
                <span>📝</span>
                {showVisitNotes ? 'Hide' : 'Show'} Visit Notes
              </button>
            </div>
            {showCalculators && <ClinicalCalculators />}
            {showDocumentUpload && (
              <DocumentUpload
                onAnalyze={handleAnalyzeDocument}
                onFindSimilar={handleFindSimilar}
              />
            )}
            {showDrugInfo && <DrugInfo />}
            {showGuidelines && <ClinicalGuidelines />}
            {showAlerts && <EvidenceAlerts />}
            {showVisitNotes && <VisitNotes />}
          </div>

          {messages.map((msg, idx) => (
            msg.role === 'user' ? (
              <UserMessage key={idx} content={msg.content} darkMode={darkMode} />
            ) : (
              <AssistantMessage
                key={idx}
                content={msg.content}
                sources={msg.sources}
                followUpQuestions={msg.followUpQuestions}
                suggestions={msg.suggestions}
                messageIndex={idx}
                expandedSources={expandedSources}
                onToggleSource={toggleSource}
                onFollowUpClick={setInput}
                scrollToBottom={scrollToBottom}
                isLoading={msg.isLoading}
                darkMode={darkMode}
              />
            )
          ))}

          {loading && <LoadingIndicator loadingStage={loadingStage} articleCount={articleCount} darkMode={darkMode} />}

          {deepResearchLoading && (
            <DeepResearchProgress
              stage={deepResearchStage}
              currentQuery={deepResearchQuery}
              completedStages={[]}
            />
          )}

          <ErrorMessage
            error={error}
            errorRetryable={errorRetryable}
            lastQuery={lastQuery}
            onRetry={handleSubmit}
            darkMode={darkMode}
          />

          <div ref={messagesEndRef} />
        </div>
      </div>

      <SearchInput
        input={input}
        setInput={setInput}
        loading={loading || deepResearchLoading}
        backendStatus={backendStatus}
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        deepResearchMode={deepResearchMode}
        setDeepResearchMode={setDeepResearchMode}
        onSubmit={handleSubmit}
        onKeyPress={handleKeyPress}
        darkMode={darkMode}
      />
    </div>
  );
}