import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, Sparkles, Copy, Check } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import { askQuestion } from '../services/api';

/* ── copy-to-clipboard mini hook ── */
function useCopy(text) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  return { copied, copy };
}

/* ── single message bubble ── */
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  const { copied, copy } = useCopy(msg.content);

  return (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="group"
      style={{
        display: 'flex',
        gap: '1rem',
        width: '100%',
        maxWidth: '56rem',
        marginLeft: 'auto',
        marginRight: 'auto',
        flexDirection: isUser ? 'row-reverse' : 'row',
      }}
    >
      {/* avatar */}
      <div style={{
        width: '2.75rem', height: '2.75rem', flexShrink: 0,
        borderRadius: '0.875rem', display: 'flex', alignItems: 'center',
        justifyContent: 'center', marginTop: '0.125rem',
        ...(isUser
          ? { background: 'linear-gradient(135deg,#38bdf8,#818cf8)', boxShadow: '0 0 16px rgba(56,189,248,0.35)' }
          : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }),
      }}>
        {isUser
          ? <User style={{ width: '1rem', height: '1rem', color: '#ffffff' }} />
          : <Bot  style={{ width: '1rem', height: '1rem', color: '#38bdf8' }} />}
      </div>

      {/* bubble */}
      <div style={{ position: 'relative', maxWidth: '80%', display: 'flex', flexDirection: 'column' }}>
        <div style={{
          padding: '1rem 1.5rem',
          borderRadius: '1.25rem',
          borderTopRightRadius: isUser ? '0.25rem' : '1.25rem',
          borderTopLeftRadius:  isUser ? '1.25rem' : '0.25rem',
          fontSize: '1rem', lineHeight: 1.75,
          boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
          ...(isUser
            ? {
                background: 'linear-gradient(135deg,rgba(56,189,248,0.18),rgba(129,140,248,0.18))',
                border: '1px solid rgba(56,189,248,0.28)',
                color: '#e2e8f0',
              }
            : {
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.09)',
                color: '#cbd5e1',
              }),
        }}>
          <article style={{ color: 'inherit' }}>
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </article>
        </div>

        {/* copy button */}
        {!isUser && (
          <button
            onClick={copy}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            style={{
              position: 'absolute', bottom: '-1.75rem', left: '0.25rem',
              display: 'flex', alignItems: 'center', gap: '0.35rem',
              fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)',
              background: 'none', border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#38bdf8'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(148,163,184,0.7)'}
          >
            {copied
              ? <Check style={{ width: '0.875rem', height: '0.875rem', color: '#34d399' }} />
              : <Copy style={{ width: '0.875rem', height: '0.875rem' }} />}
            <span style={{ color: copied ? '#34d399' : 'inherit' }}>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        )}
      </div>
    </motion.div>
  );
}

/* ── typing indicator ── */
function TypingDots() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto' }}
    >
      <div style={{
        width: '2.75rem', height: '2.75rem', flexShrink: 0, borderRadius: '0.875rem',
        display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '0.125rem',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
      }}>
        <Bot style={{ width: '1rem', height: '1rem', color: '#38bdf8' }} />
      </div>
      <div style={{
        padding: '1rem 1.5rem', borderRadius: '1.25rem', borderTopLeftRadius: '0.25rem',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)',
      }}>
        {[0, 150, 300].map(delay => (
          <span
            key={delay}
            className="animate-bounce"
            style={{
              display: 'inline-block', width: '0.5rem', height: '0.5rem',
              borderRadius: '50%', background: 'rgba(56,189,248,0.7)',
              animationDelay: `${delay}ms`, boxShadow: '0 0 6px rgba(56,189,248,0.5)',
            }}
          />
        ))}
      </div>
    </motion.div>
  );
}

/* ── suggested prompts ── */
const SUGGESTIONS = [
  'Explain the overall architecture',
  'How does authentication work?',
  'Where is the main entry point?',
  'List all API endpoints',
];

/* ── main component ── */
export default function ChatInterface({ isRepoLoaded }) {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: "Repository context loaded! I've indexed all source files and I'm ready to answer questions about the architecture, logic, dependencies, or anything else in the codebase.",
  }]);
  const [input, setInput]       = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    const q = input.trim();
    if (!q || !isRepoLoaded || isTyping) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setIsTyping(true);
    try {
      const response = await askQuestion(q);
      setMessages(prev => [...prev, { role: 'assistant', content: response.answer }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: '**Error:** Failed to reach the AI engine. Please check the backend is running.' }]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  };

  const handleSuggestion = (text) => { setInput(text); inputRef.current?.focus(); };

  if (!isRepoLoaded) return null;
  const showSuggestions = messages.length <= 1 && !isTyping;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden', background: 'transparent' }}>

      {/* ── header ── */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.24)',
        }}>
          <Sparkles style={{ width: '1.2rem', height: '1.2rem', color: '#38bdf8' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: "'Sora', sans-serif" }}>
            Ask RepoSense AI
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(148,163,184,0.75)' }}>
            Context-aware answers from your indexed codebase
          </p>
        </div>
        <div style={{
          marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem',
          fontSize: '0.75rem', fontWeight: 600, padding: '0.35rem 0.875rem', borderRadius: '9999px',
          background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399',
        }}>
          <span className="animate-pulse" style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#34d399', display: 'inline-block' }} />
          Indexed
        </div>
      </div>

      {/* ── messages ── */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '2rem',
        display: 'flex', flexDirection: 'column', gap: '2rem',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(56,189,248,0.2) transparent',
      }}>
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => <MessageBubble key={i} msg={msg} />)}
        </AnimatePresence>

        <AnimatePresence>
          {isTyping && <TypingDots />}
        </AnimatePresence>

        {/* ── suggested questions ── */}
        <AnimatePresence>
          {showSuggestions && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.3 }}
              style={{ width: '100%', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '1rem' }}
            >
              {/* label — inline color so it never goes black */}
              <p style={{
                margin: '0 0 1rem',
                fontSize: '0.8rem', fontWeight: 700,
                letterSpacing: '0.12em', textTransform: 'uppercase',
                color: 'rgba(203,213,225,0.8)',         /* slate-300 equivalent */
              }}>
                Suggested questions
              </p>

              {/* 2-column grid of suggestion cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: '0.75rem' }}>
                {SUGGESTIONS.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => handleSuggestion(s)}
                    style={{
                      textAlign: 'left', cursor: 'pointer',
                      fontSize: '0.95rem', fontWeight: 500,
                      color: 'rgba(203,213,225,0.9)',   /* always light, never black */
                      padding: '1rem 1.25rem',
                      borderRadius: '1rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      boxShadow: '0 2px 12px rgba(0,0,0,0.25)',
                      transition: 'all 0.18s ease',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.color      = '#7dd3fc';
                      e.currentTarget.style.borderColor = 'rgba(56,189,248,0.45)';
                      e.currentTarget.style.background  = 'rgba(56,189,248,0.08)';
                      e.currentTarget.style.boxShadow   = '0 4px 22px rgba(56,189,248,0.14)';
                      e.currentTarget.style.transform   = 'translateY(-2px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.color      = 'rgba(203,213,225,0.9)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
                      e.currentTarget.style.background  = 'rgba(255,255,255,0.05)';
                      e.currentTarget.style.boxShadow   = '0 2px 12px rgba(0,0,0,0.25)';
                      e.currentTarget.style.transform   = 'translateY(0)';
                    }}
                  >
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                      <span style={{ color: 'rgba(56,189,248,0.55)', fontSize: '1rem', flexShrink: 0 }}>→</span>
                      {s}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={bottomRef} style={{ height: '0.75rem' }} />
      </div>

      {/* ── input bar ── */}
      <div style={{
        flexShrink: 0,
        padding: '1.5rem 2rem',
        borderTop: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(0,0,0,0.32)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', gap: '1rem' }}>

          {/* text input — explicit color so it never goes black */}
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSubmit(); } }}
            placeholder="Ask anything about the codebase…"
            disabled={isTyping}
            style={{
              flex: 1,
              fontSize: '1.05rem',
              color: '#e2e8f0',                          /* always light */
              caretColor: '#38bdf8',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '1rem',
              padding: '1.1rem 1.5rem',                 /* tall input */
              outline: 'none',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
              transition: 'border-color 0.2s, box-shadow 0.2s',
              fontFamily: "'DM Sans', sans-serif",
            }}
            onFocus={e => {
              e.currentTarget.style.borderColor = 'rgba(56,189,248,0.55)';
              e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(56,189,248,0.1), inset 0 1px 0 rgba(255,255,255,0.04)';
            }}
            onBlur={e => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)';
              e.currentTarget.style.boxShadow   = 'inset 0 1px 0 rgba(255,255,255,0.04)';
            }}
          />

          {/* send button */}
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || isTyping}
            style={{
              flexShrink: 0,
              width: '3.5rem', height: '3.5rem',
              borderRadius: '1rem',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#ffffff', border: 'none', cursor: 'pointer',
              background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
              boxShadow: input.trim() ? '0 0 28px rgba(56,189,248,0.5)' : 'none',
              opacity: (!input.trim() || isTyping) ? 0.35 : 1,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => { if (input.trim()) { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 0 44px rgba(56,189,248,0.65)'; } }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = input.trim() ? '0 0 28px rgba(56,189,248,0.5)' : 'none'; }}
          >
            <Send style={{ width: '1.2rem', height: '1.2rem', marginTop: '-1px', marginLeft: '1px' }} />
          </button>
        </div>

        {/* disclaimer */}
        <p style={{
          textAlign: 'center', marginTop: '0.75rem',
          fontSize: '0.7rem', color: 'rgba(71,85,105,0.65)',
          fontFamily: 'monospace',
        }}>
          RepoSense AI can make mistakes. Verify critical information.
        </p>
      </div>

    </div>
  );
}