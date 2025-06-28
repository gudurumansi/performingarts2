import React, { useState, useEffect, useRef } from 'react';
import { Send, Plus, Trash2, MessageSquare } from 'lucide-react';
import './chatbot.css';

const Chatbot = () => {
  const [chats, setChats] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const API_BASE = 'http://localhost:5000/api';


  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchChats = async () => {
    try {
      const response = await fetch(`${API_BASE}/chats`);
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`${API_BASE}/chats/${chatId}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const createNewChat = async () => {
    try {
      const response = await fetch(`${API_BASE}/chats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'New Chat' })
      });
      const newChat = await response.json();
      setChats(prev => [newChat, ...prev]);
      setCurrentChatId(newChat.id);
      setMessages([]);
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const switchToChat = async (chatId) => {
    setCurrentChatId(chatId);
    await fetchMessages(chatId);
  };

 const deleteChat = async (chatId, e) => {
  e.stopPropagation();
  console.log("Deleting chat:", chatId); // ✅ Check this logs only ONE chat id

  if (!window.confirm('Are you sure you want to delete this chat?')) return;

  try {
    await fetch(`${API_BASE}/chats/${chatId}`, { method: 'DELETE' });

    // ✅ Filter only the one deleted
    setChats(prev => prev.filter(chat => chat.id !== chatId));

    if (currentChatId === chatId) {
      setCurrentChatId(null);
      setMessages([]);
    }
  } catch (error) {
    console.error('Error deleting chat:', error);
  }
};


  const sendMessage = async () => {
    const content = inputValue.trim();
    if (!content || isTyping) return;

    let chatId = currentChatId;

    if (!chatId) {
      try {
        const response = await fetch(`${API_BASE}/chats`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: content.slice(0, 50) })
        });
        const newChat = await response.json();
        chatId = newChat.id;
        setCurrentChatId(chatId);
        setChats(prev => [newChat, ...prev]);
      } catch (error) {
        console.error('Error creating chat:', error);
        return;
      }
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, role: 'user' })
      });

      const aiResponse = await fetch(`${API_BASE}/chat/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: content, chatId })
      });

      const aiData = await aiResponse.json();
      const aiMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: aiData.response,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMessage]);
      fetchChats();
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const useExamplePrompt = (prompt) => {
    setInputValue(prompt);
  };

  const formatMessage = (content) => {
    return content
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  };

  const ExamplePrompts = () => (
    <div className="chat-messages">
      <h2>Hello! How can I help you today?</h2>
      <p>Choose an example below or start typing your own question</p>
      <div className="prompt-grid">
        {[
          { icon: '📚', title: 'Explain', prompt: 'Explain about Performing arts in depth' },
          { icon: '✨', title: 'Create', prompt: 'Write a creative story about the depicts of ethihasas and how they influenced people' },
          { icon: '🍽️', title: 'Plan', prompt: 'Help me understand about how the theatrical art forms got into existence and also how they origined' },
          { icon: '🔧', title: 'Code', prompt: 'Tell me about odd art forms' }
        ].map((example, index) => (
          <div key={index} className="prompt-card" onClick={() => useExamplePrompt(example.prompt)}>
            <strong>{example.icon} {example.title}</strong>
            <p>{example.prompt}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const TypingIndicator = () => (
    <div className="typing-indicator">
      <div className="message-avatar ai">AI</div>
      <div>Typing...</div>
    </div>
  );

  return (
    <div className="chatbot-container">
      {/* Sidebar */}
      <div className="chat-sidebar" style={{ width: sidebarOpen ? '250px' : '0px' }}>
        <div>
          <button className="btn-green" onClick={createNewChat}>
            <Plus size={16} /> New Chat
          </button>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {chats.map(chat => (
            <div
              key={chat.id}
              className={`chat-item ${currentChatId === chat.id ? 'active' : ''}`}
              onClick={() => switchToChat(chat.id)}
            >
              <div className="title"><MessageSquare size={16} /> {chat.title}</div>
              <button className="btn-delete" onClick={(e) => deleteChat(chat.id, e)}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div className="chat-header">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button> AI Chat Assistant
        </div>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <ExamplePrompts />
          ) : (
            <>
              {messages.map((message) => (
                <div key={message.id} className={`message-container ${message.role}`}>
                  <div className={`message-avatar ${message.role}`}>
                    {message.role === 'user' ? 'You' : 'AI'}
                  </div>
                  <div className={`message-box ${message.role === 'user' ? 'user-message' : 'ai-message'}`}>
                    <div dangerouslySetInnerHTML={{ __html: formatMessage(message.content) }} />
                  </div>
                </div>
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="chat-input-container">
          <div className="chat-input-wrapper">
            <textarea
              ref={textareaRef}
              className="chat-textarea"
              placeholder="Message AI Chat Assistant..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button className="btn-send" onClick={sendMessage} disabled={!inputValue.trim() || isTyping}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
