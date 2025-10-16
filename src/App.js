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
import * as api from './services/api';

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
      // Stage 1: Search multiple sources (PubMed + Europe PMC)
      const articles = await api.searchMultipleSources(userMessage, filters, ['pubmed', 'europepmc']);

      if (articles.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I couldn\'t find relevant medical literature for your query. Please try rephrasing your question or being more specific about the medical topic you\'re interested in.',
          sources: []
        }]);
        setLoading(false);
        setLoadingStage(null);
        return;
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

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: responseData.response || responseData,
        sources: articles,
        followUpQuestions: responseData.followUpQuestions || []
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

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
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
      />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 && <EmptyState />}

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
          </div>

          {messages.map((msg, idx) => (
            msg.role === 'user' ? (
              <UserMessage key={idx} content={msg.content} />
            ) : (
              <AssistantMessage
                key={idx}
                content={msg.content}
                sources={msg.sources}
                followUpQuestions={msg.followUpQuestions}
                messageIndex={idx}
                expandedSources={expandedSources}
                onToggleSource={toggleSource}
                onFollowUpClick={setInput}
                scrollToBottom={scrollToBottom}
                isLoading={msg.isLoading}
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

          <ErrorMessage
            error={error}
            errorRetryable={errorRetryable}
            lastQuery={lastQuery}
            onRetry={handleSubmit}
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
      />
    </div>
  );
}