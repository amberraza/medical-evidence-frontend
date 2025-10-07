import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, Loader2, AlertCircle, BookOpen, CheckCircle, Trash2, MessageSquare, Filter, X, ChevronDown, ChevronUp, History, Save, Download } from 'lucide-react';
import { jsPDF } from 'jspdf';

const API_BASE_URL = 'https://optimistic-sparkle-production-f85a.up.railway.app/api';

// LocalStorage utilities
const STORAGE_KEY = 'medicalEvidence_conversations';
const CURRENT_CONVERSATION_KEY = 'medicalEvidence_currentConversation';

const saveToLocalStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save to localStorage:', error);
  }
};

const loadFromLocalStorage = (key, defaultValue = null) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Failed to load from localStorage:', error);
    return defaultValue;
  }
};

// Export utilities
const formatConversationAsText = (messages) => {
  let text = 'MEDICAL EVIDENCE SEARCH - CONVERSATION EXPORT\n';
  text += '=' .repeat(60) + '\n';
  text += `Exported: ${new Date().toLocaleString()}\n`;
  text += '=' .repeat(60) + '\n\n';

  messages.forEach((msg, idx) => {
    if (msg.role === 'user') {
      text += `QUESTION ${Math.floor(idx / 2) + 1}:\n`;
      text += msg.content + '\n\n';
    } else {
      text += `ANSWER:\n`;
      text += msg.content + '\n\n';

      if (msg.sources && msg.sources.length > 0) {
        text += 'SOURCES:\n';
        msg.sources.forEach((source, i) => {
          text += `[${i + 1}] ${source.title}\n`;
          text += `    Authors: ${source.authors}\n`;
          text += `    Journal: ${source.journal}, ${source.pubdate}\n`;
          text += `    PMID: ${source.pmid}\n`;
          text += `    URL: ${source.url}\n`;
          if (source.studyType) text += `    Study Type: ${source.studyType}\n`;
          text += '\n';
        });
      }

      text += '-'.repeat(60) + '\n\n';
    }
  });

  text += '\n\nDISCLAIMER:\n';
  text += 'This is a prototype for educational purposes only.\n';
  text += 'Not intended for clinical decision-making.\n';
  text += 'Always consult with qualified healthcare professionals.\n';

  return text;
};

const downloadAsText = (messages) => {
  const text = formatConversationAsText(messages);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `medical-evidence-${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

const downloadAsPDF = (messages) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = 20;

  // Helper function to add new page if needed
  const checkPageBreak = (heightNeeded) => {
    if (yPosition + heightNeeded > pageHeight - 20) {
      doc.addPage();
      yPosition = 20;
      return true;
    }
    return false;
  };

  // Helper function to wrap text
  const addWrappedText = (text, x, y, maxWidth, fontSize, fontStyle = 'normal') => {
    doc.setFontSize(fontSize);
    doc.setFont('helvetica', fontStyle);
    const lines = doc.splitTextToSize(text, maxWidth);

    lines.forEach((line, index) => {
      checkPageBreak(fontSize * 0.5);
      doc.text(line, x, y + (index * fontSize * 0.5));
    });

    return lines.length * fontSize * 0.5;
  };

  // Header
  doc.setFillColor(79, 70, 229); // Indigo
  doc.rect(0, 0, pageWidth, 35, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Medical Evidence Search', margin, 15);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Conversation Export - ${new Date().toLocaleString()}`, margin, 25);

  yPosition = 45;
  doc.setTextColor(0, 0, 0);

  // Content
  messages.forEach((msg, idx) => {
    if (msg.role === 'user') {
      checkPageBreak(20);

      // Question box
      doc.setFillColor(79, 70, 229);
      doc.setDrawColor(79, 70, 229);
      const questionText = `Q${Math.floor(idx / 2) + 1}: ${msg.content}`;
      const lines = doc.splitTextToSize(questionText, maxWidth - 4);
      const boxHeight = lines.length * 5 + 4;

      doc.roundedRect(margin, yPosition, maxWidth, boxHeight, 2, 2, 'FD');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      lines.forEach((line, i) => {
        doc.text(line, margin + 2, yPosition + 5 + (i * 5));
      });

      yPosition += boxHeight + 5;
      doc.setTextColor(0, 0, 0);

    } else {
      checkPageBreak(15);

      // Answer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      const answerHeight = addWrappedText(msg.content, margin, yPosition, maxWidth, 10);
      yPosition += answerHeight + 5;

      // Sources
      if (msg.sources && msg.sources.length > 0) {
        checkPageBreak(15);

        doc.setDrawColor(226, 232, 240);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(79, 70, 229);
        doc.text(`SOURCES (${msg.sources.length})`, margin, yPosition);
        yPosition += 7;
        doc.setTextColor(0, 0, 0);

        msg.sources.forEach((source, i) => {
          const sourceHeight = 25 + (source.studyType ? 5 : 0);
          checkPageBreak(sourceHeight);

          // Source box
          doc.setFillColor(248, 250, 252);
          doc.setDrawColor(79, 70, 229);
          doc.setLineWidth(0.5);
          doc.rect(margin, yPosition, maxWidth, sourceHeight, 'FD');

          // Source number and title
          doc.setFontSize(9);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(79, 70, 229);
          const titleLines = doc.splitTextToSize(`[${i + 1}] ${source.title}`, maxWidth - 4);
          titleLines.forEach((line, idx) => {
            doc.text(line, margin + 2, yPosition + 5 + (idx * 4));
          });

          let sourceYPos = yPosition + 5 + (titleLines.length * 4) + 2;

          // Metadata
          doc.setFontSize(8);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(100, 116, 139);
          doc.text(source.authors.substring(0, 80), margin + 2, sourceYPos);
          sourceYPos += 4;
          doc.text(`${source.journal}, ${source.pubdate}`, margin + 2, sourceYPos);
          sourceYPos += 4;
          doc.text(`PMID: ${source.pmid}`, margin + 2, sourceYPos);

          // Study type badge
          if (source.studyType) {
            sourceYPos += 5;
            const badgeColor = source.studyType === 'Meta-Analysis' || source.studyType === 'Systematic Review'
              ? [124, 58, 237]
              : source.studyType === 'RCT'
              ? [5, 150, 105]
              : [37, 99, 235];

            doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(7);
            doc.setFont('helvetica', 'bold');
            const badgeWidth = doc.getTextWidth(source.studyType) + 4;
            doc.roundedRect(margin + 2, sourceYPos - 2.5, badgeWidth, 4, 1, 1, 'F');
            doc.text(source.studyType, margin + 4, sourceYPos);
          }

          yPosition += sourceHeight + 3;
          doc.setTextColor(0, 0, 0);
        });
      }

      yPosition += 5;
    }
  });

  // Disclaimer
  checkPageBreak(20);
  doc.setFillColor(254, 243, 199);
  doc.setDrawColor(245, 158, 11);
  doc.setLineWidth(1);
  doc.rect(margin, yPosition, maxWidth, 18, 'FD');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(146, 64, 14);
  doc.text('DISCLAIMER:', margin + 2, yPosition + 5);
  doc.setFont('helvetica', 'normal');
  const disclaimerLines = doc.splitTextToSize(
    'This is a prototype for educational purposes only. Not intended for clinical decision-making. Always consult with qualified healthcare professionals.',
    maxWidth - 4
  );
  disclaimerLines.forEach((line, i) => {
    doc.text(line, margin + 2, yPosition + 10 + (i * 4));
  });

  // Save
  doc.save(`medical-evidence-${Date.now()}.pdf`);
};

export default function MedicalEvidenceTool() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(null);
  const [articleCount, setArticleCount] = useState(0);
  const [error, setError] = useState(null);
  const [errorRetryable, setErrorRetryable] = useState(true);
  const [lastQuery, setLastQuery] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    dateRange: 'all',
    studyType: 'all'
  });
  const [expandedSources, setExpandedSources] = useState({});
  const [savedConversations, setSavedConversations] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [showExportMenu, setShowExportMenu] = useState(false);
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

  // Load saved conversations and current conversation on mount
  useEffect(() => {
    const saved = loadFromLocalStorage(STORAGE_KEY, []);
    setSavedConversations(saved);

    const current = loadFromLocalStorage(CURRENT_CONVERSATION_KEY);
    if (current && current.messages && current.messages.length > 0) {
      setMessages(current.messages);
      setCurrentConversationId(current.id);
    }
  }, []);

  // Auto-save current conversation whenever messages change
  useEffect(() => {
    if (messages.length > 0) {
      const conversationData = {
        id: currentConversationId || Date.now(),
        messages: messages,
        timestamp: Date.now(),
        title: messages[0]?.content.substring(0, 50) + '...' || 'New Conversation'
      };

      if (!currentConversationId) {
        setCurrentConversationId(conversationData.id);
      }

      saveToLocalStorage(CURRENT_CONVERSATION_KEY, conversationData);
    }
  }, [messages, currentConversationId]);

  // Check backend health on mount
  useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (response.ok) {
        setBackendStatus('connected');
      } else {
        setBackendStatus('error');
      }
    } catch (err) {
      setBackendStatus('error');
    }
  };

  const searchPubMed = async (query) => {
    try {
      // Create a clean copy of filters to avoid circular reference issues
      const cleanFilters = {
        dateRange: filters.dateRange,
        studyType: filters.studyType
      };

      const response = await fetch(`${API_BASE_URL}/search-pubmed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, filters: cleanFilters })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Backend error: ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const data = await response.json();
      return data.articles || [];
    } catch (err) {
      console.error('PubMed search error:', err);
      throw err;
    }
  };

  const generateResponse = async (userQuery, articles) => {
    try {
      // Build conversation history (exclude the current user message)
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      const response = await fetch(`${API_BASE_URL}/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: userQuery,
          articles: articles,
          conversationHistory: conversationHistory
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const error = new Error(errorData.error || `Backend error: ${response.status}`);
        error.response = { data: errorData, status: response.status };
        throw error;
      }

      const data = await response.json();
      return data; // Return full data object with response and followUpQuestions
    } catch (err) {
      console.error('Response generation error:', err);
      throw err;
    }
  };

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
    if (!retryQuery) {
      setInput('');
      setLastQuery(userMessage);
    }
    setError(null);
    setErrorRetryable(true);

    if (!retryQuery) {
      setMessages(prev => [...prev, {
        role: 'user',
        content: userMessage
      }]);
    }

    setLoading(true);
    setLoadingStage('searching');
    setArticleCount(0);

    try {
      // Stage 1: Search PubMed
      const articles = await searchPubMed(userMessage);

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
      const responseData = await generateResponse(userMessage, articles);

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

  const clearChat = () => {
    setMessages([]);
    setError(null);
  };

  const saveCurrentConversation = () => {
    if (messages.length === 0) return;

    const conversationData = {
      id: currentConversationId || Date.now(),
      messages: messages,
      timestamp: Date.now(),
      title: messages[0]?.content.substring(0, 50) + '...' || 'New Conversation'
    };

    const existing = savedConversations.findIndex(c => c.id === conversationData.id);
    let updated;

    if (existing >= 0) {
      updated = [...savedConversations];
      updated[existing] = conversationData;
    } else {
      updated = [conversationData, ...savedConversations];
    }

    setSavedConversations(updated);
    saveToLocalStorage(STORAGE_KEY, updated);
  };

  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
    setShowHistory(false);
    setExpandedSources({});
  };

  const deleteConversation = (conversationId) => {
    const updated = savedConversations.filter(c => c.id !== conversationId);
    setSavedConversations(updated);
    saveToLocalStorage(STORAGE_KEY, updated);

    if (currentConversationId === conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
      localStorage.removeItem(CURRENT_CONVERSATION_KEY);
    }
  };

  const startNewConversation = () => {
    saveCurrentConversation();
    setMessages([]);
    setCurrentConversationId(null);
    setExpandedSources({});
    setShowHistory(false);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="bg-indigo-600 p-1.5 sm:p-2 rounded-lg">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900">Medical Evidence Search</h1>
                <p className="text-xs sm:text-sm text-gray-600 hidden sm:block">Evidence-based medical information powered by PubMed & AI</p>
              </div>
            </div>
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
                        onClick={startNewConversation}
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
                                onClick={() => loadConversation(conv)}
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
                          <FileText className="w-4 h-4 text-gray-600" />
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

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 sm:py-6">
        <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="bg-white rounded-lg p-8 shadow-sm border border-gray-200">
                <Search className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Ask a Medical Question</h2>
                <p className="text-gray-600 mb-4">Get evidence-based answers from peer-reviewed medical literature</p>
                <div className="text-left max-w-md mx-auto space-y-2 text-sm text-gray-600">
                  <p className="font-medium text-gray-900">Example queries:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>What are the latest treatments for type 2 diabetes?</li>
                    <li>Efficacy of statins in primary prevention</li>
                    <li>Management of hypertension in elderly patients</li>
                    <li>Side effects of ACE inhibitors</li>
                  </ul>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="font-medium text-indigo-600 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      New: Conversation History
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      Ask follow-up questions and I'll remember the context of our conversation!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="bg-indigo-600 text-white rounded-lg px-3 sm:px-4 py-2 sm:py-3 max-w-[85%] sm:max-w-xl shadow-sm">
                  <p className="text-sm sm:text-base">{msg.content}</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-4 sm:p-6 max-w-full sm:max-w-3xl shadow-sm border border-gray-200 w-full">
                  <div className="prose prose-sm max-w-none">
                    <div className="whitespace-pre-wrap text-gray-800">{msg.content}</div>
                  </div>
                  
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-gray-900 text-sm">Sources</h3>
                      </div>
                      <div className="space-y-3">
                        {msg.sources.map((source, i) => {
                          const isExpanded = expandedSources[`${idx}-${i}`];
                          return (
                            <div key={i} className="bg-gray-50 rounded p-3 text-sm">
                              <div className="flex items-start gap-2">
                                <span className="font-bold text-indigo-600 flex-shrink-0">[{i + 1}]</span>
                                <div className="flex-1 min-w-0">
                                  <a
                                    href={source.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline break-words"
                                  >
                                    {source.title}
                                  </a>

                                  {/* Metadata Badges */}
                                  {(source.studyType || source.isRecent) && (
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                      {source.studyType && (
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                          source.studyType === 'Meta-Analysis' || source.studyType === 'Systematic Review'
                                            ? 'bg-purple-100 text-purple-800'
                                            : source.studyType === 'RCT'
                                            ? 'bg-green-100 text-green-800'
                                            : source.studyType === 'Clinical Trial'
                                            ? 'bg-blue-100 text-blue-800'
                                            : source.studyType === 'Review'
                                            ? 'bg-indigo-100 text-indigo-800'
                                            : source.studyType === 'Guideline'
                                            ? 'bg-amber-100 text-amber-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}>
                                          {source.studyType}
                                        </span>
                                      )}
                                      {source.isRecent && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-100 text-emerald-800">
                                          New Research
                                        </span>
                                      )}
                                      {source.publicationYear && (
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-700">
                                          {source.publicationYear}
                                        </span>
                                      )}
                                    </div>
                                  )}

                                  <p className="text-gray-600 text-xs mt-2">
                                    {source.authors} • {source.journal}
                                  </p>
                                  <p className="text-gray-500 text-xs mt-1">PMID: {source.pmid}</p>

                                  {/* Expandable Abstract Section */}
                                  {source.abstract && (
                                    <div className="mt-3">
                                      {isExpanded && (
                                        <div className="bg-white rounded border border-gray-200 p-3 mb-2">
                                          <h4 className="font-semibold text-gray-900 text-xs mb-2">Abstract</h4>
                                          <p className="text-gray-700 text-xs leading-relaxed whitespace-pre-wrap">
                                            {source.abstract}
                                          </p>
                                          {source.allAuthors && source.allAuthors !== source.authors && (
                                            <div className="mt-3 pt-3 border-t border-gray-200">
                                              <h4 className="font-semibold text-gray-900 text-xs mb-1">All Authors</h4>
                                              <p className="text-gray-600 text-xs">{source.allAuthors}</p>
                                            </div>
                                          )}
                                          {source.doi && (
                                            <div className="mt-2">
                                              <p className="text-gray-500 text-xs">DOI: {source.doi}</p>
                                            </div>
                                          )}
                                        </div>
                                      )}
                                      <button
                                        onClick={() => toggleSource(idx, i)}
                                        className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium transition-colors"
                                      >
                                        {isExpanded ? (
                                          <>
                                            <ChevronUp className="w-4 h-4" />
                                            Show less
                                          </>
                                        ) : (
                                          <>
                                            <ChevronDown className="w-4 h-4" />
                                            Show more details
                                          </>
                                        )}
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {msg.followUpQuestions && msg.followUpQuestions.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-2 mb-3">
                        <MessageSquare className="w-4 h-4 text-indigo-600" />
                        <h3 className="font-semibold text-gray-900 text-sm">Suggested Follow-up Questions</h3>
                      </div>
                      <div className="space-y-2">
                        {msg.followUpQuestions.map((question, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setInput(question);
                              scrollToBottom();
                            }}
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
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 min-w-[400px]">
                {/* Stage 1: Searching */}
                <div className={`flex items-center gap-3 transition-opacity ${loadingStage === 'searching' ? 'opacity-100' : 'opacity-40'}`}>
                  <div className="relative">
                    {loadingStage === 'searching' ? (
                      <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    ) : (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <span className="text-gray-700 font-medium">Searching PubMed database...</span>
                </div>

                {/* Stage 2: Found Articles */}
                {(loadingStage === 'found' || loadingStage === 'generating') && (
                  <div className={`flex items-center gap-3 mt-4 transition-opacity ${loadingStage === 'found' ? 'opacity-100' : 'opacity-40'}`}>
                    <div className="relative">
                      {loadingStage === 'found' ? (
                        <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                      ) : (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <span className="text-gray-700 font-medium">Found {articleCount} relevant articles</span>
                      <div className="flex gap-1 mt-1">
                        {[...Array(Math.min(articleCount, 5))].map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-indigo-200 rounded-full animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Stage 3: Generating Response */}
                {loadingStage === 'generating' && (
                  <div className="flex items-center gap-3 mt-4">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    <div>
                      <span className="text-gray-700 font-medium">Analyzing evidence and generating response...</span>
                      <p className="text-xs text-gray-500 mt-1">This may take a few moments</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 w-full max-w-3xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-red-800 text-sm font-medium mb-2">{error}</p>
                    {errorRetryable && lastQuery && (
                      <button
                        onClick={() => handleSubmit(lastQuery)}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                      >
                        <Loader2 className="w-4 h-4" />
                        Retry Request
                      </button>
                    )}
                    {!errorRetryable && (
                      <p className="text-red-600 text-xs mt-2">
                        ⚠️ This error cannot be automatically retried. Please check your input and try again.
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-3 sm:px-6 py-3 sm:py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          {/* Filters Panel */}
          {showFilters && (
            <div className="mb-3 sm:mb-4 p-3 sm:p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <h3 className="font-semibold text-gray-900">Search Filters</h3>
                </div>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Date Range Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Publication Date
                  </label>
                  <select
                    value={filters.dateRange}
                    onChange={(e) => setFilters({...filters, dateRange: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="all">All time</option>
                    <option value="1year">Last year</option>
                    <option value="5years">Last 5 years</option>
                    <option value="10years">Last 10 years</option>
                  </select>
                </div>

                {/* Study Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Study Type
                  </label>
                  <select
                    value={filters.studyType}
                    onChange={(e) => setFilters({...filters, studyType: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600"
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
              {(filters.dateRange !== 'all' || filters.studyType !== 'all') && (
                <div className="mt-3 flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-gray-600">Active filters:</span>
                  {filters.dateRange !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                      {filters.dateRange === '1year' ? 'Last year' : filters.dateRange === '5years' ? 'Last 5 years' : 'Last 10 years'}
                      <button
                        onClick={() => setFilters({...filters, dateRange: 'all'})}
                        className="hover:text-indigo-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {filters.studyType !== 'all' && (
                    <span className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs">
                      {filters.studyType === 'rct' ? 'RCT' : filters.studyType === 'meta' ? 'Meta-Analysis' : filters.studyType === 'review' ? 'Review' : filters.studyType === 'clinical' ? 'Clinical Trial' : 'Guideline'}
                      <button
                        onClick={() => setFilters({...filters, studyType: 'all'})}
                        className="hover:text-indigo-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2 sm:gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a medical question..."
              className="flex-1 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              disabled={loading || backendStatus !== 'connected'}
            />
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-2 sm:px-4 py-2 sm:py-3 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 ${
                showFilters || filters.dateRange !== 'all' || filters.studyType !== 'all'
                  ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              title="Toggle filters"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
              {(filters.dateRange !== 'all' || filters.studyType !== 'all') && (
                <span className="bg-indigo-600 text-white text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                  {(filters.dateRange !== 'all' ? 1 : 0) + (filters.studyType !== 'all' ? 1 : 0)}
                </span>
              )}
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim() || backendStatus !== 'connected'}
              className="bg-indigo-600 text-white px-3 sm:px-6 py-2 sm:py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-1 sm:gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  <span className="hidden sm:inline">Processing</span>
                </>
              ) : (
                <>
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Search</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[10px] sm:text-xs text-gray-500 mt-2 text-center">
            This is a prototype for educational purposes. Not for clinical decision-making.
          </p>
        </div>
      </div>
    </div>
  );
}