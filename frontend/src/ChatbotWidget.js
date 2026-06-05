// frontend/src/components/ChatbotWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import api from './api/api';
import './Chatbot.css';

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'bot_welcome', sender: 'bot', text: 'Hi, I am TutorBot — ask me anything about using the site.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesRef = useRef(null);

  useEffect(() => {
    // scroll to bottom on new messages
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, open]);

  const handleSend = async (e) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text) return;
    // optimistic UI
    const userMsg = { id: `u_${Date.now()}`, sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // pass last few messages as history optionally
      const history = messages.slice(-8).map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text,
      }));
      const reply = await api.sendToBot({ message: text, history });
      const botMsg = { id: `b_${Date.now()}`, sender: 'bot', text: reply || 'I am sorry, I could not reply.' };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      console.error('ChatbotWidget handleSend error', err);
      setMessages(prev => [...prev, { id: `b_err_${Date.now()}`, sender: 'bot', text: 'Sorry, something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    setOpen(o => !o);
  };

  return (
    <div className={`chatbot-widget ${open ? 'open' : ''}`}>
      <div className="chatbot-toggle" onClick={handleToggle}>
        {open ? '✕' : '💬'}
      </div>

      {open && (
        <div className="chatbot-panel">
          <div className="chatbot-header">
            <div className="title">TutorBot</div>
            <div className="subtitle">Ask about using the website</div>
          </div>

          <div className="chatbot-messages" ref={messagesRef}>
            {messages.map(m => (
              <div key={m.id} className={`cb-message ${m.sender === 'bot' ? 'bot' : 'user'}`}>
                <div className="cb-text">{m.text}</div>
              </div>
            ))}
          </div>

          <form className="chatbot-input" onSubmit={handleSend}>
            <input
              placeholder="Ask something like: 'How do I sign up?'"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button type="submit" disabled={loading || !input.trim()}>
              {loading ? '...' : 'Send'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
