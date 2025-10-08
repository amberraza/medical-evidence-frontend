import { useState, useEffect } from 'react';
import { saveToLocalStorage, loadFromLocalStorage } from '../utils/localStorage';
import { STORAGE_KEY, CURRENT_CONVERSATION_KEY } from '../constants/config';

/**
 * Custom hook for managing conversations
 * Handles message state, conversation history, saving/loading, and persistence
 */
export const useConversation = () => {
  const [messages, setMessages] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [savedConversations, setSavedConversations] = useState([]);

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

  // Save current conversation to history
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

  // Load a conversation
  const loadConversation = (conversation) => {
    setMessages(conversation.messages);
    setCurrentConversationId(conversation.id);
  };

  // Delete a conversation
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

  // Start a new conversation
  const startNewConversation = () => {
    saveCurrentConversation();
    setMessages([]);
    setCurrentConversationId(null);
    localStorage.removeItem(CURRENT_CONVERSATION_KEY);
  };

  // Clear current conversation
  const clearConversation = () => {
    setMessages([]);
  };

  // Add a message to the conversation
  const addMessage = (message) => {
    setMessages(prev => [...prev, message]);
  };

  return {
    messages,
    setMessages,
    currentConversationId,
    savedConversations,
    saveCurrentConversation,
    loadConversation,
    deleteConversation,
    startNewConversation,
    clearConversation,
    addMessage
  };
};
