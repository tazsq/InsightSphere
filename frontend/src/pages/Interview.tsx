import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Send, CheckCircle } from 'lucide-react';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const Interview: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [anonymousToken, setAnonymousToken] = useState<string | null>(null);
  const [sessionSubmitted, setSessionSubmitted] = useState(false);
  const [isConversationFinished, setIsConversationFinished] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Start session on mount
    const startSession = async () => {
      try {
        setLoading(true);
        const res = await fetch('http://localhost:5000/api/feedback/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${user?.token}`
          }
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message);
        
        setAnonymousToken(data.anonymousToken);
        setMessages([{ role: 'assistant', content: data.message }]);
        setIsConversationFinished(false);
      } catch (error) {
        console.error('Failed to start session', error);
      } finally {
        setLoading(false);
      }
    };

    startSession();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !anonymousToken || isConversationFinished) return;

    const userMessage = inputValue.trim();
    setInputValue('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const res = await fetch('http://localhost:5000/api/feedback/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anonymousToken, message: userMessage })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
      if (data.isFinished) {
        setIsConversationFinished(true);
      }
    } catch (error) {
      console.error('Failed to send message', error);
      // Optional: Add error state to UI
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSession = async () => {
    if (!anonymousToken) return;
    setLoading(true);
    
    try {
      const res = await fetch('http://localhost:5000/api/feedback/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ anonymousToken })
      });
      
      if (res.ok) {
        setSessionSubmitted(true);
      }
    } catch (error) {
      console.error('Failed to submit session', error);
    } finally {
      setLoading(false);
    }
  };

  if (sessionSubmitted) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div className="card text-center flex flex-col items-center gap-4" style={{ maxWidth: '400px', padding: '3rem 2rem' }}>
          <div style={{ color: 'var(--success)' }}>
            <CheckCircle size={48} />
          </div>
          <h2 className="text-xl">Feedback Submitted</h2>
          <p className="text-muted text-sm">
            Thank you for completing the guided feedback interview. Your responses have been recorded completely anonymously.
          </p>
          <button className="btn btn-secondary mt-4" onClick={() => navigate('/')}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
      <header style={{ backgroundColor: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', padding: '1rem 0' }}>
        <div className="container flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">Guided Feedback Interview</h1>
            <p className="text-xs text-muted mt-1 flex items-center gap-1">
              <span style={{ display: 'inline-block', width: '6px', height: '6px', borderRadius: '50%', backgroundColor: 'var(--success)' }}></span>
              Anonymous Session Active
            </p>
          </div>
          <button onClick={handleSubmitSession} className="btn btn-secondary text-sm" disabled={loading || messages.length < 3}>
            End & Submit
          </button>
        </div>
      </header>

      <main className="container flex-1 flex flex-col" style={{ maxWidth: '800px', padding: '2rem 1.5rem', overflow: 'hidden' }}>
        <div className="flex-1 overflow-y-auto pr-4 mb-4" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <span className="text-xs text-muted mb-1 font-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {msg.role === 'user' ? 'Your Response' : 'Interviewer'}
              </span>
              <div style={{
                backgroundColor: msg.role === 'user' ? 'var(--bg-primary)' : 'transparent',
                border: msg.role === 'user' ? '1px solid var(--border-color)' : 'none',
                padding: msg.role === 'user' ? '1rem 1.25rem' : '0.5rem 0',
                borderRadius: 'var(--radius-lg)',
                maxWidth: '85%',
                fontSize: '0.9375rem',
                color: msg.role === 'user' ? 'var(--text-primary)' : 'var(--text-primary)',
                lineHeight: 1.6,
                fontWeight: msg.role === 'assistant' ? 500 : 400
              }}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
               <span className="text-xs text-muted mb-1 font-medium" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Interviewer
              </span>
              <div className="text-muted" style={{ padding: '0.5rem 0', fontSize: '0.875rem' }}>
                Generating next question...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ position: 'sticky', bottom: '2rem' }}>
          {isConversationFinished ? (
            <div className="card flex flex-col items-center gap-4" style={{ padding: '1.5rem', border: '1px solid var(--success)', background: 'rgba(16, 185, 129, 0.05)' }}>
              <div className="flex items-center gap-2" style={{ color: 'var(--success)', fontWeight: 600 }}>
                <CheckCircle size={20} />
                <span>Conversation Complete</span>
              </div>
              <p className="text-sm text-muted text-center" style={{ margin: 0 }}>
                Thank you! All 5 feedback questions have been answered. Please click the button below to submit.
              </p>
              <button 
                onClick={handleSubmitSession} 
                className="btn btn-primary flex items-center justify-center gap-2" 
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', fontWeight: 600, fontSize: '0.9375rem' }}
                disabled={loading}
              >
                Submit Feedback
              </button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSendMessage} className="card flex items-center gap-3" style={{ padding: '0.75rem 1rem' }}>
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your response here..."
                  style={{
                    flex: 1,
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.9375rem',
                    color: 'var(--text-primary)',
                    fontFamily: 'inherit'
                  }}
                  disabled={loading}
                  autoFocus
                />
                <button 
                  type="submit" 
                  className="btn btn-primary flex items-center justify-center" 
                  style={{ padding: '0.5rem', borderRadius: '50%', width: '36px', height: '36px' }}
                  disabled={!inputValue.trim() || loading}
                >
                  <Send size={16} />
                </button>
              </form>
              <p className="text-xs text-center text-muted mt-3">
                Your responses are processed confidentially. Press Enter to send.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Interview;
