import React, { useState, useRef, useEffect } from 'react';
import apiService from '../services/api';
import './AIChatbot.css';

const AIChatbot = ({ isOpen, onClose, context = null }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi 👋 I'm your AI Assistant. I can help you create better quizzes, suggest question types, recommend difficulty levels, and provide teaching tips. What would you like assistance with?",
      sender: 'ai',
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) {
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setError('');

    try {
      const response = await apiService.chatWithAI(userMessage.text, context);
      
      if (response.success) {
        const aiMessage = {
          id: Date.now() + 1,
          text: response.data.message,
          sender: 'ai',
          timestamp: response.data.timestamp
        };
        
        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(response.message || 'Failed to get AI response');
      }
    } catch (err) {
      console.error('AI chat error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        text: "I'm sorry, I'm having trouble responding right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date().toISOString(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 1,
        text: "Hi 👋 I'm your AI Assistant. I can help you create better quizzes. What would you like assistance with?",
        sender: 'ai',
        timestamp: new Date().toISOString()
      }
    ]);
    setError('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="ai-chatbot-overlay">
      <div className="ai-chatbot-panel">
        {/* Header */}
        <div className="chatbot-header">
          <div className="chatbot-title">
            <div className="ai-avatar">🤖</div>
            <div>
              <h3>AI Assistant</h3>
              <span className="status-indicator">Online</span>
            </div>
          </div>
          <div className="header-actions">
            <button 
              className="clear-btn" 
              onClick={clearChat}
              title="Clear chat"
            >
              🗑️
            </button>
            <button 
              className="close-btn" 
              onClick={onClose}
              title="Close chat"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="chatbot-messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message ${message.sender} ${message.isError ? 'error' : ''}`}
            >
              <div className="message-content">
                <div className="message-text">{message.text}</div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="message ai">
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        {/* Input */}
        <form className="chatbot-input-form" onSubmit={handleSendMessage}>
          <div className="input-container">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask me about quiz creation, question types, difficulty levels..."
              className="message-input"
              rows="1"
              disabled={isLoading}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={!inputMessage.trim() || isLoading}
            >
              {isLoading ? '⏳' : '➤'}
            </button>
          </div>
        </form>

        {/* Quick Suggestions */}
        <div className="quick-suggestions">
          <button 
            className="suggestion-btn"
            onClick={() => setInputMessage("How do I create engaging multiple choice questions?")}
            disabled={isLoading}
          >
            💡 Question Tips
          </button>
          <button 
            className="suggestion-btn"
            onClick={() => setInputMessage("What's the ideal quiz duration and number of questions?")}
            disabled={isLoading}
          >
            ⏱️ Quiz Timing
          </button>
          <button 
            className="suggestion-btn"
            onClick={() => setInputMessage("How do I set appropriate difficulty levels?")}
            disabled={isLoading}
          >
            📊 Difficulty
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChatbot;