import React, { useState, useRef, useEffect } from 'react';
import { Search, FileText, Loader2, AlertCircle, BookOpen, CheckCircle } from 'lucide-react';

const API_BASE_URL = 'https://optimistic-sparkle-production-f85a.up.railway.app/api';

export default function MedicalEvidenceTool() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const response = await fetch(`${API_BASE_URL}/search-pubmed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
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
      const response = await fetch(`${API_BASE_URL}/generate-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          query: userQuery,
          articles: articles
        })
      });

      if (!response.ok) {
        throw new Error(`Backend error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (err) {
      console.error('Response generation error:', err);
      throw err;
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    if (backendStatus !== 'connected') {
      setError('Backend server is not running. Please start the server first.');
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setError(null);
    
    setMessages(prev => [...prev, {
      role: 'user',
      content: userMessage
    }]);

    setLoading(true);

    try {
      // Search PubMed
      const articles = await searchPubMed(userMessage);
      
      if (articles.length === 0) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: 'I couldn\'t find relevant medical literature for your query. Please try rephrasing your question or being more specific about the medical topic you\'re interested in.',
          sources: []
        }]);
        setLoading(false);
        return;
      }

      // Generate response using Claude
      const aiResponse = await generateResponse(userMessage, articles);
      
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: aiResponse,
        sources: articles
      }]);
    } catch (err) {
      setError('An error occurred while processing your request. Make sure the backend server is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Medical Evidence Search</h1>
                <p className="text-sm text-gray-600">Evidence-based medical information powered by PubMed & AI</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {backendStatus === 'connected' && (
                <div className="flex items-center gap-2 bg-green-50 px-3 py-1.5 rounded-full border border-green-200">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-xs font-medium text-green-700">Backend Connected</span>
                </div>
              )}
              {backendStatus === 'error' && (
                <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-200">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span className="text-xs font-medium text-red-700">Backend Offline</span>
                </div>
              )}
              {backendStatus === 'checking' && (
                <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
                  <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                  <span className="text-xs font-medium text-gray-700">Checking...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-4xl mx-auto space-y-6">
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
                </div>
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="bg-indigo-600 text-white rounded-lg px-4 py-3 max-w-xl shadow-sm">
                  <p>{msg.content}</p>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-6 max-w-3xl shadow-sm border border-gray-200 w-full">
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
                        {msg.sources.map((source, i) => (
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
                                <p className="text-gray-600 text-xs mt-1">
                                  {source.authors} • {source.journal}, {source.pubdate}
                                </p>
                                <p className="text-gray-500 text-xs mt-1">PMID: {source.pmid}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <div className="flex items-center gap-3">
                  <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                  <span className="text-gray-600">Searching medical literature and generating response...</span>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-start">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 shadow-lg">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a medical question..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-transparent"
              disabled={loading || backendStatus !== 'connected'}
            />
            <button
              onClick={handleSubmit}
              disabled={loading || !input.trim() || backendStatus !== 'connected'}
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Search
                </>
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            This is a prototype for educational purposes. Not for clinical decision-making.
          </p>
        </div>
      </div>
    </div>
  );
}