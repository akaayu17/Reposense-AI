import React, { useState, useEffect, useRef } from 'react';
import RepoInput from './components/RepoInput';
import ChatInterface from './components/ChatInterface';
import SummaryView from './components/SummaryView';
import { loadRepo } from './services/api';
import {
  MessageSquare, FileText, Code2, Network, Zap,
  ChevronRight, Cpu, Activity, Shield, ArrowRight,
  GitBranch, Search, BarChart3, Layers, Moon, Sun,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ═══════════════════════════════════════
   THEME TOKENS
═══════════════════════════════════════ */
const LIGHT = {
  bg:           '#ffffff',
  bgSub:        '#fafafa',
  bgSection:    '#f8fafc',
  surface:      '#ffffff',
  surfaceHover: '#f1f5f9',
  border:       'rgba(15,23,42,0.09)',
  borderStrong: 'rgba(15,23,42,0.16)',
  text:         '#0f172a',
  textMuted:    '#64748b',
  textFaint:    '#94a3b8',
  navBg:        'rgba(255,255,255,0.88)',
  accent:       '#2563eb',
  accentMuted:  'rgba(37,99,235,0.08)',
  dotGrid:      'rgba(15,23,42,0.09)',
  divider:      'rgba(15,23,42,0.07)',
  cardBg:       '#ffffff',
  cardBorder:   'rgba(15,23,42,0.08)',
  toggleBg:     '#f1f5f9',
  badgeBg:      'rgba(15,23,42,0.06)',
  badgeBorder:  'rgba(15,23,42,0.10)',
  badgeText:    '#0f172a',
  stepIcon:     '#f1f5f9',
  stepIconBorder:'rgba(15,23,42,0.08)',
  stepIconColor:'#475569',
  stepNumColor: 'rgba(15,23,42,0.06)',
  footerBg:     '#ffffff',
  footerBorder: 'rgba(15,23,42,0.08)',
};

const DARK = {
  bg:           '#080e1a',
  bgSub:        '#0d1526',
  bgSection:    '#0b1220',
  surface:      '#111827',
  surfaceHover: '#1e293b',
  border:       'rgba(148,163,184,0.10)',
  borderStrong: 'rgba(148,163,184,0.20)',
  text:         '#f1f5f9',
  textMuted:    '#94a3b8',
  textFaint:    '#475569',
  navBg:        'rgba(8,14,26,0.88)',
  accent:       '#60a5fa',
  accentMuted:  'rgba(96,165,250,0.10)',
  dotGrid:      'rgba(148,163,184,0.06)',
  divider:      'rgba(148,163,184,0.08)',
  cardBg:       '#111827',
  cardBorder:   'rgba(148,163,184,0.09)',
  toggleBg:     'rgba(148,163,184,0.10)',
  badgeBg:      'rgba(96,165,250,0.10)',
  badgeBorder:  'rgba(96,165,250,0.22)',
  badgeText:    '#93c5fd',
  stepIcon:     'rgba(255,255,255,0.06)',
  stepIconBorder:'rgba(255,255,255,0.10)',
  stepIconColor:'rgba(255,255,255,0.45)',
  stepNumColor: 'rgba(255,255,255,0.05)',
  footerBg:     '#080e1a',
  footerBorder: 'rgba(148,163,184,0.08)',
};

/* ═══════════════════════════════════════
   MOONLIGHT TOGGLE BUTTON
═══════════════════════════════════════ */
function ThemeToggle({ dark, onToggle }) {
  return (
    <motion.button
      onClick={onToggle}
      aria-label="Toggle theme"
      whileTap={{ scale: 0.92 }}
      style={{
        position: 'relative',
        width: '52px',
        height: '28px',
        borderRadius: '9999px',
        border: dark ? '1px solid rgba(148,163,184,0.18)' : '1px solid rgba(15,23,42,0.12)',
        background: dark
          ? 'linear-gradient(135deg, #0f2044 0%, #1a1040 100%)'
          : 'linear-gradient(135deg, #e0f2fe 0%, #ede9fe 100%)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: '3px',
        flexShrink: 0,
        boxShadow: dark
          ? '0 0 12px rgba(96,165,250,0.15), inset 0 1px 0 rgba(255,255,255,0.05)'
          : '0 1px 4px rgba(15,23,42,0.10)',
        transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
      }}
    >
      {/* Stars only in dark mode */}
      {dark && (
        <>
          {[
            { top: '4px', left: '5px', size: '2px', opacity: 0.8 },
            { top: '8px', left: '10px', size: '1.5px', opacity: 0.5 },
            { top: '5px', left: '15px', size: '1.5px', opacity: 0.7 },
          ].map((s, i) => (
            <span key={i} style={{
              position: 'absolute',
              top: s.top, left: s.left,
              width: s.size, height: s.size,
              borderRadius: '50%',
              background: '#ffffff',
              opacity: s.opacity,
              pointerEvents: 'none',
            }} />
          ))}
        </>
      )}

      {/* Pill thumb */}
      <motion.div
        layout
        animate={{ x: dark ? 24 : 0 }}
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        style={{
          width: '22px', height: '22px',
          borderRadius: '50%',
          background: dark
            ? 'linear-gradient(135deg, #c7d2fe 0%, #a5b4fc 60%, #818cf8 100%)'
            : 'linear-gradient(135deg, #fde68a 0%, #fbbf24 60%, #f59e0b 100%)',
          boxShadow: dark
            ? '0 0 8px rgba(165,180,252,0.6), 0 2px 4px rgba(0,0,0,0.3)'
            : '0 0 8px rgba(251,191,36,0.55), 0 2px 4px rgba(0,0,0,0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          zIndex: 2,
          flexShrink: 0,
        }}
      >
        <AnimatePresence mode="wait" initial={false}>
          {dark ? (
            <motion.span key="moon"
              initial={{ opacity: 0, rotate: -40, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 40, scale: 0.6 }}
              transition={{ duration: 0.22 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Moon style={{ width: '11px', height: '11px', color: '#312e81' }} />
            </motion.span>
          ) : (
            <motion.span key="sun"
              initial={{ opacity: 0, rotate: 40, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -40, scale: 0.6 }}
              transition={{ duration: 0.22 }}
              style={{ display: 'flex', alignItems: 'center' }}
            >
              <Sun style={{ width: '11px', height: '11px', color: '#92400e' }} />
            </motion.span>
          )}
        </AnimatePresence>

        {/* Crater overlay — dark mode only */}
        {dark && (
          <span style={{
            position: 'absolute', top: '3px', right: '3px',
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'rgba(99,102,241,0.4)',
            pointerEvents: 'none',
          }} />
        )}
      </motion.div>
    </motion.button>
  );
}

/* ─────────────────────────────────────
   TYPEWRITER
───────────────────────────────────── */
function useTypewriter(words, speed = 85, pause = 2000) {
  const [text, setText] = useState('');
  const [wIdx, setWIdx] = useState(0);
  const [erasing, setErasing] = useState(false);
  useEffect(() => {
    const word = words[wIdx % words.length];
    const t = setTimeout(() => {
      if (!erasing) {
        setText(word.slice(0, text.length + 1));
        if (text.length + 1 === word.length) setTimeout(() => setErasing(true), pause);
      } else {
        setText(word.slice(0, text.length - 1));
        if (text.length === 0) { setErasing(false); setWIdx(i => i + 1); }
      }
    }, erasing ? speed / 2 : speed);
    return () => clearTimeout(t);
  }, [text, erasing, wIdx, words, speed, pause]);
  return text;
}

/* ─────────────────────────────────────
   BREAKPOINT HOOK
───────────────────────────────────── */
function useBreakpoint(bp = 768) {
  const [matches, setMatches] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= bp : false
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${bp}px)`);
    const handler = (e) => setMatches(e.matches);
    setMatches(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [bp]);
  return matches;
}

/* ─────────────────────────────────────
   CONTAINER
───────────────────────────────────── */
function Container({ children, style = {} }) {
  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', width: '100%', boxSizing: 'border-box', ...style }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────
   SECTION
───────────────────────────────────── */
function Section({ children, style = {} }) {
  return (
    <section style={{ width: '100%', padding: '5rem 0', ...style }}>
      <Container>{children}</Container>
    </section>
  );
}

/* ─────────────────────────────────────
   RESPONSIVE GRID
───────────────────────────────────── */
function Grid({ cols = { mobile: 1, desktop: 3 }, gap = '1.5rem', children }) {
  const isDesktop = useBreakpoint(768);
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `repeat(${isDesktop ? cols.desktop : cols.mobile}, minmax(0, 1fr))`,
      gap,
      width: '100%',
    }}>
      {children}
    </div>
  );
}

/* ─────────────────────────────────────
   SECTION HEADING
───────────────────────────────────── */
function SectionHeading({ label, title, align = 'center', t }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align, marginBottom: '3rem' }}>
      <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: t.accent, marginBottom: '0.75rem', fontFamily: "'DM Mono', monospace" }}>
        {label}
      </p>
      <h2 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)', fontWeight: 800, color: t.text, letterSpacing: '-0.035em', lineHeight: 1.15, maxWidth: '38rem', fontFamily: "'Bricolage Grotesque', sans-serif", margin: 0 }}>
        {title}
      </h2>
    </div>
  );
}

/* ─────────────────────────────────────
   DIVIDER
───────────────────────────────────── */
function Divider({ t }) {
  return (
    <Container>
      <div style={{ height: '1px', background: t.divider }} />
    </Container>
  );
}

/* ═══════════════════════════════════════
   APP
═══════════════════════════════════════ */
export default function App() {
  const [files, setFiles] = useState([]);
  const [isRepoLoaded, setIsRepoLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeView, setActiveView] = useState('summary');
  const [dark, setDark] = useState(false);
  const isDesktop = useBreakpoint(768);

  // Persist theme preference
  useEffect(() => {
    const saved = localStorage.getItem('reposense-theme');
    if (saved === 'dark') setDark(true);
  }, []);
  const toggleTheme = () => {
    setDark(d => {
      const next = !d;
      localStorage.setItem('reposense-theme', next ? 'dark' : 'light');
      return next;
    });
  };

  // Active token set
  const t = dark ? DARK : LIGHT;

  const typed = useTypewriter([
    'Any Repository.',
    'Any Codebase.',
    'Any Architecture.',
    'Any Tech Stack.',
  ]);

  const handleRepoLoad = async (url) => {
    setIsLoading(true);
    try {
      const data = await loadRepo(url);
      setFiles(data.files || []);
      setIsRepoLoaded(true);
      setActiveView('summary');
    } catch (err) {
      alert('Error loading repository. ' + (err.response?.data?.detail || err.message));
    } finally { setIsLoading(false); }
  };

  const stats = [
    { icon: Activity, value: '10×', label: 'Faster onboarding', color: '#2563eb' },
    { icon: Cpu, value: '100%', label: 'Language agnostic', color: '#7c3aed' },
    { icon: Zap, value: '<5s', label: 'Analysis time', color: '#059669' },
    { icon: Shield, value: 'OSS', label: 'Open source ready', color: '#dc2626' },
  ];

  const features = [
    { icon: Code2, title: 'Deep Code Analysis', color: '#2563eb', desc: 'Semantic embeddings reveal architecture, patterns, and logic across every source file in the repository.' },
    { icon: Network, title: 'Dependency Mapping', color: '#7c3aed', desc: 'Visualise all components, modules and their interdependencies in a clear, navigable graph.' },
    { icon: Zap, title: 'Instant AI Answers', color: '#059669', desc: 'Natural language queries — uncover bugs, trace logic flows, and accelerate code reviews in seconds.' },
  ];

  const steps = [
    { icon: GitBranch, num: '01', title: 'Paste a URL', desc: 'Drop any public GitHub repository URL and hit Analyze.' },
    { icon: Cpu, num: '02', title: 'AI Indexes', desc: 'We clone, chunk, embed and index every source file via FAISS vector search.' },
    { icon: MessageSquare, num: '03', title: 'Ask Anything', desc: 'Chat naturally about architecture, logic, bugs — get context-aware answers instantly.' },
  ];

  const terminalLines = [
    { prefix: '$', text: 'reposense analyze github.com/vercel/next.js', color: '#e2e8f0' },
    { prefix: '→', text: 'Cloning repository...', color: '#94a3b8' },
    { prefix: '→', text: 'Indexing 2,847 files across 312 modules', color: '#94a3b8' },
    { prefix: '→', text: 'Building FAISS vector index...', color: '#94a3b8' },
    { prefix: '✓', text: 'Ready. Ask anything about your codebase.', color: '#34d399' },
  ];

  return (
    <motion.div
      animate={{ background: t.bg, color: t.text }}
      transition={{ duration: 0.35 }}
      style={{
        minHeight: '100vh',
        background: t.bg,
        color: t.text,
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; }

        @keyframes blink-kf { 0%,100%{opacity:1} 50%{opacity:0} }
        .rs-cursor { animation: blink-kf 1.05s ease-in-out infinite; }



        .feature-card {
          border-radius: 16px;
          padding: 2rem 1.75rem;
          min-width: 0;
          transition: border-color 0.22s, box-shadow 0.22s, transform 0.22s, background 0.35s;
          cursor: default;
        }
        .feature-card:hover { transform: translateY(-4px); }

        .step-card {
          border-radius: 16px;
          padding: 2rem 1.75rem;
          min-width: 0;
          transition: border-color 0.22s, background 0.35s;
        }

        .stat-item {
          display: flex; flex-direction: column; align-items: center;
          padding: 1.75rem 1.25rem; border-radius: 14px; min-width: 0;
          transition: box-shadow 0.22s, transform 0.22s, background 0.35s, border-color 0.35s;
        }
        .stat-item:hover { transform: translateY(-3px); }

        .cta-btn {
          display: inline-flex; align-items: center; gap: 0.55rem;
          padding: 0.875rem 2rem; border-radius: 10px; font-weight: 700;
          font-size: 0.95rem; font-family: 'DM Sans', sans-serif;
          cursor: pointer; border: none;
          transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .nav-tab {
          display: flex; align-items: center; gap: 0.375rem;
          padding: 0.4rem 0.875rem; border-radius: 8px; font-size: 0.8rem;
          font-weight: 600; cursor: pointer; border: 1.5px solid transparent;
          transition: all 0.18s; font-family: 'DM Sans', sans-serif;
        }
      `}</style>



      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <motion.header
        animate={{ background: t.navBg, borderBottomColor: t.border }}
        transition={{ duration: 0.35 }}
        style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: t.navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: `1px solid ${t.border}`,
        }}
      >
        <Container style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: dark ? 'linear-gradient(135deg,#818cf8,#6366f1)' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <GitBranch style={{ width: '14px', height: '14px', color: '#ffffff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: t.text, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              RepoSense
            </span>
            <span style={{
              fontSize: '9px', padding: '2px 7px', borderRadius: '9999px',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: t.accentMuted, color: t.accent,
              border: `1px solid ${dark ? 'rgba(96,165,250,0.22)' : '#dbeafe'}`,
              display: isDesktop ? 'inline' : 'none',
              fontFamily: "'DM Mono', monospace",
            }}>AI</span>
          </div>

          {/* Compact search (post-load) */}
          {isRepoLoaded && (
            <div style={{ flex: 1, maxWidth: '28rem', margin: '0 1rem' }}>
              <RepoInput onRepoLoad={handleRepoLoad} isLoading={isLoading} compact={true} dark={dark} />
            </div>
          )}

          {/* Nav right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
            {isRepoLoaded ? (
              <div style={{ display: 'flex', padding: '3px', borderRadius: '10px', gap: '2px', background: t.toggleBg, border: `1px solid ${t.border}` }}>
                {[
                  { v: 'summary', label: 'Summary', Icon: FileText },
                  { v: 'chat',    label: 'Chat',    Icon: MessageSquare },
                ].map(({ v, label, Icon }) => (
                  <button key={v} onClick={() => setActiveView(v)} className="nav-tab"
                    style={activeView === v
                      ? { background: t.surface, color: t.text, borderColor: t.border, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }
                      : { color: t.textMuted, background: 'transparent' }}>
                    <Icon style={{ width: '13px', height: '13px' }} />{label}
                  </button>
                ))}
              </div>
            ) : (
              <>
                {isDesktop && (
                  <>
                    <a href="#" style={{ fontSize: '0.8rem', fontWeight: 500, color: t.textMuted, textDecoration: 'none' }}>Docs</a>
                    <a href="#" style={{ fontSize: '0.8rem', fontWeight: 500, color: t.textMuted, textDecoration: 'none' }}>GitHub</a>
                  </>
                )}
                <button
                  className="cta-btn"
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem', borderRadius: '8px', background: dark ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#0f172a', color: '#ffffff', boxShadow: dark ? '0 0 16px rgba(99,102,241,0.35)' : '0 2px 8px rgba(15,23,42,0.18)' }}>
                  Get started
                </button>
              </>
            )}

            {/* ── Moonlight toggle ── */}
            <ThemeToggle dark={dark} onToggle={toggleTheme} />
          </div>
        </Container>
      </motion.header>

      {/* ══════════════════════════════════════
          MAIN
      ══════════════════════════════════════ */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ─────────────── LANDING ─────────────── */}
          {!isRepoLoaded && (
            <motion.div key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>

              {/* ── 1. HERO ── */}
              <motion.section
                animate={{ background: t.bg }}
                transition={{ duration: 0.35 }}
                style={{ width: '100%', padding: '6rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
                {/* Dot grid */}
                <div style={{
                  position: 'absolute', inset: 0, opacity: 0.5, zIndex: 0, pointerEvents: 'none',
                  backgroundImage: `radial-gradient(circle, ${t.dotGrid} 1px, transparent 1px)`,
                  backgroundSize: '24px 24px',
                }} />
                {/* Glow */}
                <div style={{
                  position: 'absolute', top: '-80px', right: '-80px',
                  width: '500px', height: '500px', borderRadius: '50%',
                  background: dark
                    ? 'radial-gradient(circle, rgba(129,140,248,0.10) 0%, transparent 70%)'
                    : 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)',
                  pointerEvents: 'none', zIndex: 0,
                }} />
                {dark && (
                  <div style={{
                    position: 'absolute', bottom: '-60px', left: '-60px',
                    width: '400px', height: '400px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)',
                    pointerEvents: 'none', zIndex: 0,
                  }} />
                )}

                <Container style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>

                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.3rem 0.85rem', borderRadius: '9999px',
                        fontSize: '11px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase',
                        background: t.badgeBg, border: `1px solid ${t.badgeBorder}`, color: dark ? t.badgeText : t.accent,
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: t.accent, display: 'inline-block' }} />
                        AI-powered code intelligence
                      </span>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.55 }}
                      style={{ fontWeight: 800, fontSize: 'clamp(2.8rem, 6.5vw, 5rem)', letterSpacing: '-0.04em', lineHeight: 1.05, maxWidth: '800px', color: t.text, margin: 0, fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Understand{' '}
                      <span style={{ color: t.accent }}>{typed}</span>
                      <span className="rs-cursor" style={{ color: t.accent }}>|</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                      style={{ fontSize: '1.15rem', color: t.textMuted, lineHeight: 1.7, maxWidth: '500px', margin: 0, fontWeight: 400 }}>
                      Paste a GitHub URL to analyze, visualize, and query any codebase with state-of-the-art AI — no setup required.
                    </motion.p>

                    {/* ── SEARCH CARD ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.32, type: 'spring', stiffness: 120, damping: 18 }}
                      style={{ width: '100%', maxWidth: '780px', marginTop: '0.5rem' }}>
                      <motion.div
                        animate={{ background: t.surface, borderColor: t.cardBorder }}
                        transition={{ duration: 0.35 }}
                        style={{
                          border: `1.5px solid ${t.cardBorder}`,
                          borderRadius: '18px',
                          boxShadow: dark
                            ? '0 4px 6px rgba(0,0,0,0.3), 0 16px 48px rgba(0,0,0,0.4)'
                            : '0 4px 6px -1px rgba(15,23,42,0.05), 0 16px 48px -8px rgba(15,23,42,0.1)',
                          overflow: 'hidden',
                        }}>
                        <div style={{ padding: '1rem 1.5rem 0.85rem', borderBottom: `1px solid ${t.border}`, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Search style={{ width: '13px', height: '13px', color: t.textFaint }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: t.textFaint, letterSpacing: '0.05em', fontFamily: "'DM Mono', monospace" }}>repository url</span>
                        </div>
                        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                          <RepoInput onRepoLoad={handleRepoLoad} isLoading={isLoading} compact={false} dark={dark} />
                        </div>
                        <motion.div
                          animate={{ background: t.bgSub, borderTopColor: t.border }}
                          transition={{ duration: 0.35 }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '0.875rem 1.5rem', borderTop: `1px solid ${t.border}` }}>
                          {[
                            { icon: '⚡', label: 'Indexed in seconds' },
                            { icon: '🔒', label: 'No auth required' },
                            { icon: '🌐', label: 'Any public repo' },
                            { icon: '🤖', label: 'GPT-4o powered' },
                          ].map(({ icon, label }, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '12px', color: t.textFaint, fontFamily: "'DM Mono', monospace" }}>
                              {icon} {label}
                            </span>
                          ))}
                        </motion.div>
                      </motion.div>
                      <p style={{ marginTop: '0.875rem', fontSize: '12px', color: t.textFaint, fontFamily: "'DM Mono', monospace", textAlign: 'center' }}>
                        e.g. github.com/facebook/react · github.com/vercel/next.js
                      </p>
                    </motion.div>
                  </div>
                </Container>
              </motion.section>

              {/* ── 2. STATS ── */}
              <motion.section animate={{ background: t.bg }} transition={{ duration: 0.35 }} style={{ padding: '0 0 5rem' }}>
                <Container>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Grid cols={{ mobile: 2, desktop: 4 }} gap="1rem">
                      {stats.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.07 }}
                          className="stat-item"
                          style={{ background: t.cardBg, border: `1.5px solid ${t.cardBorder}`, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.25)' : 'none' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.875rem', background: `${s.color}12`, border: `1px solid ${s.color}28` }}>
                            <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: t.text, letterSpacing: '-0.05em', marginBottom: '0.25rem', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            {s.value}
                          </div>
                          <div style={{ fontSize: '11px', color: t.textFaint, textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                            {s.label}
                          </div>
                        </motion.div>
                      ))}
                    </Grid>
                  </motion.div>
                </Container>
              </motion.section>

              <Divider t={t} />

              {/* ── 3. FEATURE CARDS ── */}
              <Section style={{ background: t.bgSection }}>
                <SectionHeading label="Core capabilities" title="Everything you need to understand any codebase" t={t} />
                <Grid cols={{ mobile: 1, desktop: 3 }} gap="1.25rem">
                  {features.map((f, i) => (
                    <motion.div key={i} className="feature-card"
                      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.09 }}
                      style={{ background: t.cardBg, border: `1.5px solid ${t.cardBorder}`, boxShadow: dark ? '0 4px 16px rgba(0,0,0,0.2)' : 'none' }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = `${f.color}40`;
                        e.currentTarget.style.boxShadow = dark
                          ? `0 12px 40px rgba(0,0,0,0.35), 0 0 0 1px ${f.color}30`
                          : `0 12px 40px ${f.color}15`;
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = t.cardBorder;
                        e.currentTarget.style.boxShadow = dark ? '0 4px 16px rgba(0,0,0,0.2)' : 'none';
                      }}>
                      <div style={{ width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', background: `${f.color}12`, border: `1.5px solid ${f.color}28` }}>
                        <f.icon style={{ color: f.color, width: '18px', height: '18px' }} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: t.text, marginBottom: '0.625rem', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {f.title}
                      </h3>
                      <p style={{ fontSize: '0.925rem', color: t.textMuted, lineHeight: 1.7, margin: '0 0 1.25rem', flex: 1 }}>
                        {f.desc}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem', fontWeight: 600, color: f.color }}>
                        Learn more <ChevronRight style={{ width: '13px', height: '13px' }} />
                      </div>
                    </motion.div>
                  ))}
                </Grid>
              </Section>

              <Divider t={t} />

              {/* ── 4. TERMINAL SECTION (always dark panel) ── */}
              <Section style={{ background: '#0d1526', padding: '5rem 0' }}>
                <Container>
                  <div style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', gap: '3.5rem', alignItems: 'center' }}>

                    {/* Left copy */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <SectionHeading label="How it works" title="From URL to full clarity in seconds" align="left" t={{ ...t, text: '#ffffff', accent: '#818cf8' }} />
                      <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '2rem', maxWidth: '26rem' }}>
                        RepoSense clones your repository, builds semantic vector embeddings with FAISS, and surfaces an AI chat interface tuned to your exact codebase — all without any credentials.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                        {[
                          { icon: GitBranch, text: 'Automatic clone & file extraction' },
                          { icon: Layers, text: 'Semantic chunking & embedding' },
                          { icon: Search, text: 'FAISS vector index for fast retrieval' },
                          { icon: BarChart3, text: 'GPT-4o chat with full repo context' },
                        ].map(({ icon: Icon, text }, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <Icon style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.5)' }} />
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Mono', monospace" }}>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terminal */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ background: '#020617', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.5)', fontFamily: "'DM Mono', monospace" }}>
                        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.03)' }}>
                          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                          ))}
                          <span style={{ marginLeft: '0.5rem', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>reposense — bash</span>
                        </div>
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {terminalLines.map((line, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.18 }}
                              style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '13px' }}>
                              <span style={{ color: line.prefix === '✓' ? '#34d399' : line.prefix === '$' ? '#60a5fa' : 'rgba(255,255,255,0.2)', flexShrink: 0, fontWeight: 600 }}>{line.prefix}</span>
                              <span style={{ color: line.color, lineHeight: 1.6 }}>{line.text}</span>
                            </motion.div>
                          ))}
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '13px' }}>
                            <span style={{ color: '#60a5fa' }}>$</span>
                            <span className="rs-cursor" style={{ color: 'rgba(255,255,255,0.5)' }}>█</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </Container>
              </Section>

              {/* ── 5. STEPS ── */}
              <motion.section animate={{ background: t.bg }} transition={{ duration: 0.35 }} style={{ padding: '5rem 0' }}>
                <Container>
                  <SectionHeading label="Process" title="Three steps to clarity" t={t} />
                  <Grid cols={{ mobile: 1, desktop: 3 }} gap="1.25rem">
                    {steps.map((s, i) => (
                      <motion.div key={i} className="step-card"
                        initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.09 }}
                        style={{ background: t.cardBg, border: `1.5px solid ${t.cardBorder}` }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: t.stepIcon, border: `1.5px solid ${t.stepIconBorder}` }}>
                            <s.icon style={{ width: '18px', height: '18px', color: t.stepIconColor }} />
                          </div>
                          <span style={{ fontSize: '2rem', fontWeight: 800, color: t.stepNumColor, letterSpacing: '-0.05em', fontFamily: "'Bricolage Grotesque', sans-serif", lineHeight: 1 }}>
                            {s.num}
                          </span>
                        </div>
                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: t.text, marginBottom: '0.5rem', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                          {s.title}
                        </h3>
                        <p style={{ fontSize: '0.9rem', color: t.textMuted, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                      </motion.div>
                    ))}
                  </Grid>
                </Container>
              </motion.section>

              <Divider t={t} />

              {/* ── 6. CTA BANNER ── */}
              <Section style={{ background: t.bgSection }}>
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{
                    display: 'flex', flexDirection: isDesktop ? 'row' : 'column',
                    alignItems: isDesktop ? 'center' : 'flex-start', justifyContent: 'space-between',
                    gap: '2rem', borderRadius: '18px', padding: '3rem 2.5rem',
                    background: dark ? 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)' : '#0f172a',
                    position: 'relative', overflow: 'hidden',
                    border: dark ? '1px solid rgba(129,140,248,0.15)' : 'none',
                    boxShadow: dark ? '0 0 40px rgba(99,102,241,0.12)' : 'none',
                  }}>
                  <div style={{ position: 'absolute', top: '-60px', right: '-60px', width: '300px', height: '300px', borderRadius: '50%', background: dark ? 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', letterSpacing: '-0.035em', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Ready to understand your codebase?
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '26rem', lineHeight: 1.65, margin: 0 }}>
                      Paste any public GitHub URL and get an AI-powered architectural breakdown in seconds.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                    <button className="cta-btn"
                      style={{ background: dark ? 'linear-gradient(135deg,#4f46e5,#7c3aed)' : '#2563eb', color: '#ffffff', boxShadow: dark ? '0 2px 8px rgba(99,102,241,0.5)' : '0 2px 8px rgba(37,99,235,0.35)' }}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Analyze a repo <ArrowRight style={{ width: '15px', height: '15px' }} />
                    </button>
                    <button className="cta-btn"
                      style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}
                      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.13)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; }}>
                      View docs
                    </button>
                  </div>
                </motion.div>
              </Section>

            </motion.div>
          )}

          {/* ─────────────── DASHBOARD ─────────────── */}
          {isRepoLoaded && (
            <motion.div key="dashboard"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
              style={{ width: '100%', padding: '1.25rem 0', height: 'calc(100vh - 60px)' }}>
              <Container style={{ height: '100%' }}>
                <div style={{
                  borderRadius: '14px', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', height: '100%',
                  border: `1.5px solid ${t.border}`,
                  boxShadow: dark
                    ? '0 4px 6px rgba(0,0,0,0.4), 0 0 40px rgba(99,102,241,0.05)'
                    : '0 4px 6px -1px rgba(15,23,42,0.05), 0 16px 48px -8px rgba(15,23,42,0.08)',
                }}>
                  {activeView === 'chat'
                    ? <ChatInterface isRepoLoaded={isRepoLoaded} dark={dark} />
                    : <SummaryView isRepoLoaded={isRepoLoaded} files={files} dark={dark} />}
                </div>
              </Container>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* ══════════════════════════════════════
          FOOTER
      ══════════════════════════════════════ */}
      {!isRepoLoaded && (
        <motion.footer
          animate={{ background: t.footerBg, borderTopColor: t.footerBorder }}
          transition={{ duration: 0.35 }}
          style={{ borderTop: `1px solid ${t.footerBorder}`, background: t.footerBg }}>
          <Container>
            <div style={{ paddingTop: '1.5rem', paddingBottom: '1.5rem', display: 'flex', flexDirection: isDesktop ? 'row' : 'column', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: dark ? 'linear-gradient(135deg,#818cf8,#6366f1)' : '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitBranch style={{ width: '10px', height: '10px', color: '#ffffff' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: t.textFaint, fontFamily: "'Bricolage Grotesque', sans-serif" }}>RepoSense AI</span>
              </div>
              <p style={{ fontSize: '11px', color: t.textFaint, fontFamily: "'DM Mono', monospace", margin: 0 }}>
                © {new Date().getFullYear()} · React · FastAPI · GPT-4o
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {['Privacy', 'Terms', 'GitHub'].map(l => (
                  <a key={l} href="#" style={{ fontSize: '11px', color: t.textFaint, textDecoration: 'none', fontFamily: "'DM Mono', monospace" }}>{l}</a>
                ))}
              </div>
            </div>
          </Container>
        </motion.footer>
      )}
    </motion.div>
  );
}