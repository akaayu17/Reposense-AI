import React, { useState } from 'react';
import { Search, Loader2, Github, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RepoInput({ onRepoLoad, isLoading, compact, dark = false }) {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Theme-aware tokens
  const textColor       = dark ? '#f1f5f9' : '#0f172a';
  const placeholderColor= dark ? '#475569' : '#94a3b8';
  const borderColor     = isFocused
    ? '#60a5fa'
    : dark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.14)';
  const bgColor         = dark ? 'rgba(255,255,255,0.04)' : 'transparent';
  const focusRing       = isFocused
    ? dark ? '0 0 0 3px rgba(96,165,250,0.18)' : '0 0 0 4px rgba(96,165,250,0.12)'
    : 'none';
  const iconColor       = isFocused ? '#60a5fa' : (dark ? '#475569' : '#94a3b8');
  const btnBg           = dark ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#2563eb';
  const btnShadow       = dark ? '0 2px 8px rgba(99,102,241,0.4)' : '0 2px 8px rgba(37,99,235,0.25)';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onRepoLoad(url.trim());
  };

  /* ── COMPACT (navbar, post-load) ── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} style={{ display: 'flex', width: '100%', position: 'relative' }}>
        <Github style={{
          position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)',
          width: '14px', height: '14px', color: iconColor, pointerEvents: 'none',
        }} />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Analyze another repository..."
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          required
          style={{
            width: '100%',
            fontSize: '13px',
            borderRadius: '9999px',
            paddingLeft: '2.5rem',
            paddingRight: '7rem',
            paddingTop: '0.55rem',
            paddingBottom: '0.55rem',
            outline: 'none',
            background: bgColor,
            color: textColor,
            border: `1.5px solid ${borderColor}`,
            boxShadow: focusRing,
            transition: 'border-color 0.18s, box-shadow 0.18s',
            fontFamily: "'DM Mono', monospace",
          }}
        />
        <style>{`
          #rs-compact-input::placeholder { color: ${placeholderColor}; }
        `}</style>
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          style={{
            position: 'absolute', right: '4px', top: '4px', bottom: '4px',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            paddingLeft: '1rem', paddingRight: '1rem',
            borderRadius: '9999px', fontSize: '12px', fontWeight: 700,
            color: '#ffffff', background: btnBg, border: 'none', cursor: 'pointer',
            opacity: isLoading || !url.trim() ? 0.5 : 1,
            transition: 'opacity 0.18s',
          }}
        >
          {isLoading
            ? <Loader2 style={{ width: '12px', height: '12px', animation: 'spin 1s linear infinite' }} />
            : 'Analyze'}
        </button>
      </form>
    );
  }

  /* ── FULL (hero search card) ── */
  return (
    <motion.div
      initial={{ scale: 0.98, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{ width: '100%', position: 'relative', zIndex: 10 }}
    >
      <style>{`
        #rs-url-input::placeholder { color: ${placeholderColor} !important; }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.75rem',
          borderRadius: '9999px', padding: '6px 6px 6px 1.25rem',
          background: bgColor,
          border: `2px solid ${borderColor}`,
          boxShadow: focusRing,
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
      >
        <Search style={{
          width: '18px', height: '18px', flexShrink: 0,
          color: iconColor,
          transition: 'color 0.2s',
        }} />

        <input
          id="rs-url-input"
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="https://github.com/facebook/react"
          disabled={isLoading}
          required
          style={{
            flex: 1,
            background: 'transparent',
            color: textColor,
            fontSize: '0.9375rem',
            fontFamily: "'DM Mono', monospace",
            outline: 'none',
            border: 'none',
            minWidth: 0,
            padding: '0.5rem 0',
          }}
        />

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          style={{
            flexShrink: 0,
            display: 'flex', alignItems: 'center', gap: '6px',
            color: '#ffffff', fontWeight: 700, fontSize: '0.875rem',
            paddingLeft: '1.5rem', paddingRight: '1.5rem',
            paddingTop: '0.65rem', paddingBottom: '0.65rem',
            borderRadius: '9999px',
            background: isLoading || !url.trim() ? (dark ? '#334155' : '#94a3b8') : btnBg,
            border: 'none',
            cursor: isLoading || !url.trim() ? 'not-allowed' : 'pointer',
            transition: 'background 0.18s, transform 0.14s',
            boxShadow: isLoading || !url.trim() ? 'none' : btnShadow,
            fontFamily: "'DM Sans', sans-serif",
          }}
          onMouseEnter={e => {
            if (!isLoading && url.trim()) {
              e.currentTarget.style.transform = 'scale(1.03)';
              e.currentTarget.style.background = dark ? 'linear-gradient(135deg,#4338ca,#6d28d9)' : '#1d4ed8';
            }
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.background = isLoading || !url.trim()
              ? (dark ? '#334155' : '#94a3b8')
              : (dark ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#2563eb');
          }}
        >
          {isLoading
            ? <><Loader2 style={{ width: '15px', height: '15px', animation: 'spin 1s linear infinite' }} /> Analyzing</>
            : <>Start <ArrowRight style={{ width: '15px', height: '15px' }} /></>}
        </button>
      </form>
    </motion.div>
  );
}