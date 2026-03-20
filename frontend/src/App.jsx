import React, { useState, useEffect } from 'react';
import RepoInput from './components/RepoInput';
import ChatInterface from './components/ChatInterface';
import SummaryView from './components/SummaryView';
import { loadRepo } from './services/api';
import {
  Github, MessageSquare, FileText, Code2, Network, Zap,
  ChevronRight, Cpu, Activity, Shield, ArrowRight, Terminal,
  GitBranch, Search, BarChart3, Layers,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
function Container({ children, className = '', style = {} }) {
  return (
    <div
      className={className}
      style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem', width: '100%', boxSizing: 'border-box', ...style }}
    >
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
   BADGE
───────────────────────────────────── */
function Badge({ children }) {
  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      padding: '0.3rem 0.85rem',
      borderRadius: '9999px',
      fontSize: '11px',
      fontWeight: 700,
      letterSpacing: '0.12em',
      textTransform: 'uppercase',
      background: 'rgba(15,23,42,0.08)',
      border: '1px solid rgba(15,23,42,0.12)',
      color: '#0f172a',
      fontFamily: "'DM Mono', monospace",
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#2563eb', display: 'inline-block' }} />
      {children}
    </span>
  );
}

/* ─────────────────────────────────────
   SECTION HEADING
───────────────────────────────────── */
function SectionHeading({ label, title, align = 'center', dark = false }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: align === 'center' ? 'center' : 'flex-start', textAlign: align, marginBottom: '3rem' }}>
      <p style={{
        fontSize: '11px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase',
        color: dark ? 'rgba(255,255,255,0.45)' : '#2563eb',
        marginBottom: '0.75rem', fontFamily: "'DM Mono', monospace",
      }}>
        {label}
      </p>
      <h2 style={{
        fontSize: 'clamp(1.8rem, 3.5vw, 2.5rem)',
        fontWeight: 800,
        color: dark ? '#ffffff' : '#0f172a',
        letterSpacing: '-0.035em',
        lineHeight: 1.15,
        maxWidth: '38rem',
        fontFamily: "'Bricolage Grotesque', sans-serif",
        margin: 0,
      }}>
        {title}
      </h2>
    </div>
  );
}

/* ─────────────────────────────────────
   DIVIDER
───────────────────────────────────── */
function Divider() {
  return (
    <Container>
      <div style={{ height: '1px', background: 'rgba(15,23,42,0.08)' }} />
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
  const isDesktop = useBreakpoint(768);

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
    {
      icon: Code2, title: 'Deep Code Analysis', color: '#2563eb',
      desc: 'Semantic embeddings reveal architecture, patterns, and logic across every source file in the repository.',
    },
    {
      icon: Network, title: 'Dependency Mapping', color: '#7c3aed',
      desc: 'Visualise all components, modules and their interdependencies in a clear, navigable graph.',
    },
    {
      icon: Zap, title: 'Instant AI Answers', color: '#059669',
      desc: 'Natural language queries — uncover bugs, trace logic flows, and accelerate code reviews in seconds.',
    },
  ];

  const steps = [
    { icon: Github, num: '01', title: 'Paste a URL', desc: 'Drop any public GitHub repository URL and hit Analyze.' },
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
    <div style={{
      minHeight: '100vh',
      background: '#ffffff',
      color: '#0f172a',
      overflowX: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: "'DM Sans', sans-serif",
    }}>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700;12..96,800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=DM+Mono:wght@400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; }

        @keyframes blink-kf { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor { animation: blink-kf 1.05s ease-in-out infinite; color: #2563eb; }

        @keyframes fade-up {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes terminal-in {
          from { opacity: 0; transform: translateX(12px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .feature-card {
          background: #ffffff;
          border: 1.5px solid rgba(15,23,42,0.08);
          border-radius: 16px;
          padding: 2rem 1.75rem;
          min-width: 0;
          transition: border-color 0.2s, box-shadow 0.2s, transform 0.22s;
          cursor: default;
        }
        .feature-card:hover {
          border-color: rgba(37,99,235,0.25);
          box-shadow: 0 12px 40px rgba(37,99,235,0.09);
          transform: translateY(-4px);
        }

        .step-card {
          background: #fafafa;
          border: 1.5px solid rgba(15,23,42,0.07);
          border-radius: 16px;
          padding: 2rem 1.75rem;
          min-width: 0;
          transition: border-color 0.2s;
        }
        .step-card:hover {
          border-color: rgba(15,23,42,0.14);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 1.75rem 1.25rem;
          border-radius: 14px;
          background: #fafafa;
          border: 1.5px solid rgba(15,23,42,0.07);
          min-width: 0;
          transition: box-shadow 0.2s, transform 0.22s;
        }
        .stat-item:hover {
          box-shadow: 0 8px 30px rgba(15,23,42,0.08);
          transform: translateY(-3px);
        }

        .cta-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          padding: 0.875rem 2rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.95rem;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          border: none;
          transition: transform 0.18s, box-shadow 0.18s, background 0.18s;
        }
        .cta-btn-primary {
          background: #0f172a;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(15,23,42,0.18);
        }
        .cta-btn-primary:hover {
          background: #1e293b;
          transform: translateY(-2px);
          box-shadow: 0 6px 24px rgba(15,23,42,0.22);
        }
        .cta-btn-secondary {
          background: #ffffff;
          color: #0f172a;
          border: 1.5px solid rgba(15,23,42,0.14) !important;
        }
        .cta-btn-secondary:hover {
          border-color: rgba(15,23,42,0.3) !important;
          transform: translateY(-2px);
        }

        .nav-tab {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.4rem 0.875rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: 1.5px solid transparent;
          transition: all 0.18s;
          font-family: 'DM Sans', sans-serif;
        }

        .dot-grid {
          background-image: radial-gradient(circle, rgba(15,23,42,0.1) 1px, transparent 1px);
          background-size: 24px 24px;
        }
      `}</style>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 30,
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(15,23,42,0.08)',
      }}>
        <Container style={{ height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.25rem' }}>

          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: '#0f172a',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <GitBranch style={{ width: '14px', height: '14px', color: '#ffffff' }} />
            </div>
            <span style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.03em', color: '#0f172a', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
              RepoSense
            </span>
            <span style={{
              fontSize: '9px', padding: '2px 7px', borderRadius: '9999px',
              fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
              background: '#eff6ff', color: '#2563eb',
              border: '1px solid #dbeafe',
              display: isDesktop ? 'inline' : 'none',
              fontFamily: "'DM Mono', monospace",
            }}>AI</span>
          </div>

          {/* Compact search (post-load) */}
          {isRepoLoaded && (
            <div style={{ flex: 1, maxWidth: '28rem', margin: '0 1rem' }}>
              <RepoInput onRepoLoad={handleRepoLoad} isLoading={isLoading} compact={true} />
            </div>
          )}

          {/* Nav right */}
          {isRepoLoaded ? (
            <div style={{ display: 'flex', padding: '3px', borderRadius: '10px', gap: '2px', flexShrink: 0, background: '#f1f5f9', border: '1px solid rgba(15,23,42,0.08)' }}>
              {[
                { v: 'summary', label: 'Summary', Icon: FileText },
                { v: 'chat', label: 'Chat', Icon: MessageSquare },
              ].map(({ v, label, Icon }) => (
                <button key={v} onClick={() => setActiveView(v)} className="nav-tab"
                  style={activeView === v
                    ? { background: '#ffffff', color: '#0f172a', borderColor: 'rgba(15,23,42,0.1)', boxShadow: '0 1px 3px rgba(15,23,42,0.08)' }
                    : { color: '#64748b', background: 'transparent' }}>
                  <Icon style={{ width: '13px', height: '13px' }} />{label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
              {isDesktop && (
                <>
                  <a href="#" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>Docs</a>
                  <a href="#" style={{ fontSize: '0.8rem', fontWeight: 500, color: '#64748b', textDecoration: 'none' }}>GitHub</a>
                </>
              )}
              <button className="cta-btn cta-btn-primary" style={{ padding: '0.45rem 1.1rem', fontSize: '0.8rem', borderRadius: '8px' }}>
                Get started
              </button>
            </div>
          )}
        </Container>
      </header>

      {/* ══════════════════════════════════════
          MAIN
      ══════════════════════════════════════ */}
      <main style={{ flex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ─────────────── LANDING ─────────────── */}
          {!isRepoLoaded && (
            <motion.div key="landing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}>

              {/* ── 1. HERO ── */}
              <section style={{ width: '100%', padding: '6rem 0 5rem', position: 'relative', overflow: 'hidden' }}>
                {/* Dot grid background */}
                <div className="dot-grid" style={{
                  position: 'absolute', inset: 0, opacity: 0.5, zIndex: 0, pointerEvents: 'none',
                }} />
                {/* Soft blue glow — top right */}
                <div style={{
                  position: 'absolute', top: '-80px', right: '-80px',
                  width: '500px', height: '500px', borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(37,99,235,0.07) 0%, transparent 70%)',
                  pointerEvents: 'none', zIndex: 0,
                }} />

                <Container style={{ position: 'relative', zIndex: 1 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>

                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                      <Badge>AI-powered code intelligence</Badge>
                    </motion.div>

                    <motion.h1
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12, duration: 0.55 }}
                      style={{
                        fontWeight: 800,
                        fontSize: 'clamp(2.8rem, 6.5vw, 5rem)',
                        letterSpacing: '-0.04em',
                        lineHeight: 1.05,
                        maxWidth: '800px',
                        color: '#0f172a',
                        margin: 0,
                        fontFamily: "'Bricolage Grotesque', sans-serif",
                      }}>
                      Understand{' '}
                      <span style={{ color: '#2563eb' }}>{typed}</span>
                      <span className="cursor">|</span>
                    </motion.h1>

                    <motion.p
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
                      style={{ fontSize: '1.15rem', color: '#64748b', lineHeight: 1.7, maxWidth: '500px', margin: 0, fontWeight: 400 }}>
                      Paste a GitHub URL to analyze, visualize, and query any codebase with state-of-the-art AI — no setup required.
                    </motion.p>

                    {/* ── SEARCH CARD ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 20, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.32, type: 'spring', stiffness: 120, damping: 18 }}
                      style={{ width: '100%', maxWidth: '780px', marginTop: '0.5rem' }}
                    >
                      <div style={{
                        background: '#ffffff',
                        border: '1.5px solid rgba(15,23,42,0.1)',
                        borderRadius: '18px',
                        boxShadow: '0 4px 6px -1px rgba(15,23,42,0.05), 0 16px 48px -8px rgba(15,23,42,0.1)',
                        overflow: 'hidden',
                      }}>
                        {/* Label */}
                        <div style={{
                          padding: '1rem 1.5rem 0.85rem',
                          borderBottom: '1px solid rgba(15,23,42,0.07)',
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                        }}>
                          <Search style={{ width: '13px', height: '13px', color: '#94a3b8' }} />
                          <span style={{ fontSize: '12px', fontWeight: 600, color: '#94a3b8', letterSpacing: '0.05em', fontFamily: "'DM Mono', monospace" }}>
                            repository url
                          </span>
                        </div>

                        {/* Input */}
                        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
                          <RepoInput onRepoLoad={handleRepoLoad} isLoading={isLoading} compact={false} />
                        </div>

                        {/* Trust strip */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexWrap: 'wrap', gap: '1.5rem',
                          padding: '0.875rem 1.5rem',
                          borderTop: '1px solid rgba(15,23,42,0.06)',
                          background: '#fafafa',
                        }}>
                          {[
                            { icon: '⚡', label: 'Indexed in seconds' },
                            { icon: '🔒', label: 'No auth required' },
                            { icon: '🌐', label: 'Any public repo' },
                            { icon: '🤖', label: 'GPT-4o powered' },
                          ].map(({ icon, label }, i) => (
                            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '12px', color: '#94a3b8', fontFamily: "'DM Mono', monospace" }}>
                              {icon} {label}
                            </span>
                          ))}
                        </div>
                      </div>

                      <p style={{ marginTop: '0.875rem', fontSize: '12px', color: '#cbd5e1', fontFamily: "'DM Mono', monospace", textAlign: 'center' }}>
                        e.g. github.com/facebook/react · github.com/vercel/next.js
                      </p>
                    </motion.div>
                  </div>
                </Container>
              </section>

              {/* ── 2. STATS ── */}
              <section style={{ padding: '0 0 5rem' }}>
                <Container>
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Grid cols={{ mobile: 2, desktop: 4 }} gap="1rem">
                      {stats.map((s, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.07 }}
                          className="stat-item">
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '9px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            marginBottom: '0.875rem',
                            background: `${s.color}10`, border: `1px solid ${s.color}22`,
                          }}>
                            <s.icon style={{ width: '16px', height: '16px', color: s.color }} />
                          </div>
                          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.05em', marginBottom: '0.25rem', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                            {s.value}
                          </div>
                          <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 600, fontFamily: "'DM Mono', monospace" }}>
                            {s.label}
                          </div>
                        </motion.div>
                      ))}
                    </Grid>
                  </motion.div>
                </Container>
              </section>

              <Divider />

              {/* ── 3. FEATURE CARDS ── */}
              <Section>
                <SectionHeading label="Core capabilities" title="Everything you need to understand any codebase" />
                <Grid cols={{ mobile: 1, desktop: 3 }} gap="1.25rem">
                  {features.map((f, i) => (
                    <motion.div key={i} className="feature-card"
                      initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.09 }}>
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '10px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem',
                        background: `${f.color}10`, border: `1.5px solid ${f.color}20`,
                      }}>
                        <f.icon style={{ color: f.color, width: '18px', height: '18px' }} />
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.625rem', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {f.title}
                      </h3>
                      <p style={{ fontSize: '0.925rem', color: '#64748b', lineHeight: 1.7, margin: '0 0 1.25rem', flex: 1 }}>
                        {f.desc}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.85rem', fontWeight: 600, color: f.color }}>
                        Learn more <ChevronRight style={{ width: '13px', height: '13px' }} />
                      </div>
                    </motion.div>
                  ))}
                </Grid>
              </Section>

              <Divider />

              {/* ── 4. TERMINAL SECTION ── */}
              <Section style={{ background: '#0f172a', padding: '5rem 0' }}>
                <Container>
                  <div style={{
                    display: 'flex', flexDirection: isDesktop ? 'row' : 'column',
                    gap: '3.5rem', alignItems: 'center',
                  }}>

                    {/* Left copy */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <SectionHeading
                        label="How it works"
                        title="From URL to full clarity in seconds"
                        align="left"
                        dark
                      />
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
                            <div style={{
                              width: '30px', height: '30px', borderRadius: '8px', flexShrink: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                            }}>
                              <Icon style={{ width: '13px', height: '13px', color: 'rgba(255,255,255,0.5)' }} />
                            </div>
                            <span style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.65)', fontFamily: "'DM Mono', monospace" }}>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Terminal */}
                    <motion.div
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
                      style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        background: '#020617',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '14px',
                        overflow: 'hidden',
                        boxShadow: '0 24px 60px rgba(0,0,0,0.5)',
                        fontFamily: "'DM Mono', monospace",
                      }}>
                        {/* Terminal chrome */}
                        <div style={{
                          padding: '0.75rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.07)',
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          background: 'rgba(255,255,255,0.03)',
                        }}>
                          {['#ff5f57', '#febc2e', '#28c840'].map((c, i) => (
                            <div key={i} style={{ width: '10px', height: '10px', borderRadius: '50%', background: c }} />
                          ))}
                          <span style={{ marginLeft: '0.5rem', fontSize: '11px', color: 'rgba(255,255,255,0.25)', letterSpacing: '0.05em' }}>
                            reposense — bash
                          </span>
                        </div>
                        {/* Terminal body */}
                        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                          {terminalLines.map((line, i) => (
                            <motion.div key={i}
                              initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.18 }}
                              style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '13px' }}>
                              <span style={{
                                color: line.prefix === '✓' ? '#34d399' : line.prefix === '$' ? '#60a5fa' : 'rgba(255,255,255,0.2)',
                                flexShrink: 0, fontWeight: 600,
                              }}>{line.prefix}</span>
                              <span style={{ color: line.color, lineHeight: 1.6 }}>{line.text}</span>
                            </motion.div>
                          ))}
                          {/* Blinking cursor */}
                          <div style={{ display: 'flex', gap: '0.75rem', fontSize: '13px' }}>
                            <span style={{ color: '#60a5fa' }}>$</span>
                            <span className="cursor" style={{ color: 'rgba(255,255,255,0.5)' }}>█</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>

                  </div>
                </Container>
              </Section>

              {/* ── 5. STEPS ── */}
              <Section>
                <SectionHeading label="Process" title="Three steps to clarity" />
                <Grid cols={{ mobile: 1, desktop: 3 }} gap="1.25rem">
                  {steps.map((s, i) => (
                    <motion.div key={i} className="step-card"
                      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.09 }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem',
                      }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '10px',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: '#f1f5f9', border: '1.5px solid rgba(15,23,42,0.08)',
                        }}>
                          <s.icon style={{ width: '18px', height: '18px', color: '#475569' }} />
                        </div>
                        <span style={{
                          fontSize: '2rem', fontWeight: 800, color: 'rgba(15,23,42,0.06)',
                          letterSpacing: '-0.05em', fontFamily: "'Bricolage Grotesque', sans-serif",
                          lineHeight: 1,
                        }}>
                          {s.num}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                        {s.title}
                      </h3>
                      <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                    </motion.div>
                  ))}
                </Grid>
              </Section>

              <Divider />

              {/* ── 6. CTA BANNER ── */}
              <Section>
                <motion.div
                  initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{
                    display: 'flex', flexDirection: isDesktop ? 'row' : 'column',
                    alignItems: isDesktop ? 'center' : 'flex-start',
                    justifyContent: 'space-between',
                    gap: '2rem',
                    borderRadius: '18px',
                    padding: '3rem 2.5rem',
                    background: '#0f172a',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                  {/* subtle blue wash */}
                  <div style={{
                    position: 'absolute', top: '-60px', right: '-60px',
                    width: '300px', height: '300px', borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)',
                    pointerEvents: 'none',
                  }} />
                  <div style={{ position: 'relative', zIndex: 1 }}>
                    <h2 style={{ fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem', letterSpacing: '-0.035em', fontFamily: "'Bricolage Grotesque', sans-serif" }}>
                      Ready to understand your codebase?
                    </h2>
                    <p style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.5)', maxWidth: '26rem', lineHeight: 1.65, margin: 0 }}>
                      Paste any public GitHub URL and get an AI-powered architectural breakdown in seconds.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                    <button
                      className="cta-btn"
                      style={{ background: '#2563eb', color: '#ffffff', boxShadow: '0 2px 8px rgba(37,99,235,0.35)' }}
                      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                      onMouseEnter={e => { e.currentTarget.style.background = '#1d4ed8'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.transform = 'translateY(0)'; }}>
                      Analyze a repo <ArrowRight style={{ width: '15px', height: '15px' }} />
                    </button>
                    <button className="cta-btn" style={{ background: 'rgba(255,255,255,0.08)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.12)' }}
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
                  border: '1.5px solid rgba(15,23,42,0.08)',
                  boxShadow: '0 4px 6px -1px rgba(15,23,42,0.05), 0 16px 48px -8px rgba(15,23,42,0.08)',
                }}>
                  {activeView === 'chat'
                    ? <ChatInterface isRepoLoaded={isRepoLoaded} />
                    : <SummaryView isRepoLoaded={isRepoLoaded} files={files} />}
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
        <footer style={{
          borderTop: '1px solid rgba(15,23,42,0.08)',
          background: '#ffffff',
        }}>
          <Container>
            <div style={{
              paddingTop: '1.5rem', paddingBottom: '1.5rem',
              display: 'flex', flexDirection: isDesktop ? 'row' : 'column',
              alignItems: 'center', justifyContent: 'space-between', gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <GitBranch style={{ width: '10px', height: '10px', color: '#ffffff' }} />
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', fontFamily: "'Bricolage Grotesque', sans-serif" }}>RepoSense AI</span>
              </div>

              <p style={{ fontSize: '11px', color: '#cbd5e1', fontFamily: "'DM Mono', monospace", margin: 0 }}>
                © {new Date().getFullYear()} · React · FastAPI · GPT-4o
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                {['Privacy', 'Terms', 'GitHub'].map(l => (
                  <a key={l} href="#" style={{ fontSize: '11px', color: '#94a3b8', textDecoration: 'none', fontFamily: "'DM Mono', monospace" }}>{l}</a>
                ))}
              </div>
            </div>
          </Container>
        </footer>
      )}
    </div>
  );
}