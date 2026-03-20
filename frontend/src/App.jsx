import React, { useState, useEffect, useRef } from 'react';
import RepoInput from './components/RepoInput';
import ChatInterface from './components/ChatInterface';
import SummaryView from './components/SummaryView';
import { loadRepo } from './services/api';
import {
  Github, MessageSquare, FileText, Code2, Network, Zap,
  ChevronRight, Cpu, Activity, Shield, ArrowRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/* ─────────────────────────────────────
   STARFIELD CANVAS
   — static stars that gently twinkle
───────────────────────────────────── */
function StarCanvas() {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let W, H, raf;
    let stars = [];

    function init() {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
      stars = [];
      // layer 1 – tiny dim background stars
      for (let i = 0; i < 220; i++) {
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 0.55 + 0.2,
          base: Math.random() * 0.35 + 0.1,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.008 + 0.003,
          color: '#ffffff',
        });
      }
      // layer 2 – mid stars, slight colour tint
      for (let i = 0; i < 80; i++) {
        const tints = ['#c7e8ff', '#ddd8ff', '#ffffff'];
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 0.9 + 0.5,
          base: Math.random() * 0.45 + 0.15,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.006 + 0.002,
          color: tints[Math.floor(Math.random() * tints.length)],
        });
      }
      // layer 3 – a handful of brighter accent stars with glow
      for (let i = 0; i < 18; i++) {
        const accents = ['#38bdf8', '#818cf8', '#c084fc', '#ffffff'];
        stars.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: Math.random() * 1.4 + 0.9,
          base: Math.random() * 0.6 + 0.3,
          phase: Math.random() * Math.PI * 2,
          speed: Math.random() * 0.005 + 0.002,
          color: accents[Math.floor(Math.random() * accents.length)],
          glow: true,
        });
      }
    }

    init();
    window.addEventListener('resize', init);

    function loop() {
      ctx.clearRect(0, 0, W, H);
      const t = performance.now() * 0.001;

      stars.forEach(s => {
        const alpha = s.base + (Math.sin(s.phase + t * s.speed * 60) * 0.5 + 0.5) * (1 - s.base) * 0.7;

        if (s.glow) {
          const g = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.r * 5);
          g.addColorStop(0, s.color + Math.floor(alpha * 180).toString(16).padStart(2, '0'));
          g.addColorStop(1, s.color + '00');
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.r * 5, 0, Math.PI * 2);
          ctx.fillStyle = g;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = s.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
        ctx.fill();
      });

      raf = requestAnimationFrame(loop);
    }
    loop();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', init); };
  }, []);
  return <canvas ref={ref} style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

/* ─────────────────────────────────────
   NETWORK GRAPH CANVAS
───────────────────────────────────── */
function NetworkGraph() {
  const canvasRef = useRef(null), rafRef = useRef(null);
  const nodesRef = useRef([]), mouseRef = useRef({ x: -999, y: -999 });
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); const dpr = window.devicePixelRatio || 1;
    const resize = () => { canvas.width = canvas.offsetWidth * dpr; canvas.height = canvas.offsetHeight * dpr; ctx.scale(dpr, dpr); };
    resize(); window.addEventListener('resize', resize);
    const W = () => canvas.offsetWidth, H = () => canvas.offsetHeight;
    const COLORS = ['#38bdf8', '#818cf8', '#c084fc', '#34d399'];
    const LABELS = ['main.js', 'api/', 'utils', 'db', 'auth', 'config', 'index', 'routes', 'models', 'tests', 'hooks', 'store'];
    nodesRef.current = Array.from({ length: 22 }, () => ({
      x: Math.random() * W(), y: Math.random() * H(),
      vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 2 + 1.5, phase: Math.random() * Math.PI * 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      label: LABELS[Math.floor(Math.random() * LABELS.length)],
    }));
    function tick() {
      ctx.clearRect(0, 0, W(), H()); const ns = nodesRef.current;
      ns.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.phase += 0.016;
        if (n.x < 0 || n.x > W()) n.vx *= -1;
        if (n.y < 0 || n.y > H()) n.vy *= -1;
        const dx = n.x - mouseRef.current.x, dy = n.y - mouseRef.current.y, d = Math.sqrt(dx * dx + dy * dy);
        if (d < 100) { n.vx += (dx / d) * 0.06; n.vy += (dy / d) * 0.06; }
        const spd = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (spd > 1.5) { n.vx *= 0.93; n.vy *= 0.93; }
      });
      for (let i = 0; i < ns.length; i++) for (let j = i + 1; j < ns.length; j++) {
        const dx = ns[i].x - ns[j].x, dy = ns[i].y - ns[j].y, dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 130) {
          const a = (1 - dist / 130) * 0.28, hex = Math.floor(a * 255).toString(16).padStart(2, '0');
          const g = ctx.createLinearGradient(ns[i].x, ns[i].y, ns[j].x, ns[j].y);
          g.addColorStop(0, ns[i].color + hex); g.addColorStop(1, ns[j].color + hex);
          ctx.beginPath(); ctx.moveTo(ns[i].x, ns[i].y); ctx.lineTo(ns[j].x, ns[j].y);
          ctx.strokeStyle = g; ctx.lineWidth = a * 2; ctx.stroke();
        }
      }
      ns.forEach(n => {
        const glow = Math.sin(n.phase) * 0.5 + 0.5;
        const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.r * 6);
        grad.addColorStop(0, n.color + '44'); grad.addColorStop(1, n.color + '00');
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r * 6, 0, Math.PI * 2); ctx.fillStyle = grad; ctx.fill();
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r + glow, 0, Math.PI * 2);
        ctx.fillStyle = n.color; ctx.shadowBlur = 12; ctx.shadowColor = n.color; ctx.fill(); ctx.shadowBlur = 0;
        ctx.font = '9px monospace'; ctx.fillStyle = n.color + '88'; ctx.fillText(n.label, n.x + n.r + 3, n.y + 3);
      });
      rafRef.current = requestAnimationFrame(tick);
    }
    tick();
    const onMove = e => { const r = canvas.getBoundingClientRect(); mouseRef.current = { x: e.clientX - r.left, y: e.clientY - r.top }; };
    canvas.addEventListener('mousemove', onMove);
    return () => { cancelAnimationFrame(rafRef.current); window.removeEventListener('resize', resize); canvas.removeEventListener('mousemove', onMove); };
  }, []);
  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%', display: 'block' }} />;
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
   RESPONSIVE GRID HOOK
   Returns true when viewport >= breakpoint px
───────────────────────────────────── */
function useBreakpoint(bp = 768) {
  const [matches, setMatches] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= bp : false);
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
   CONTAINER  max-w-6xl, always centered
   FIX: removed w-full — max-w-6xl + mx-auto
   already constrains width. w-full on a
   flex/grid child can force 100% stretch.
───────────────────────────────────── */
function Container({ children, className = '' }) {
  return (
    <div
      className={`max-w-6xl mx-auto px-6 lg:px-10 ${className}`}
      style={{ width: '100%', boxSizing: 'border-box' }}
    >
      {children}
    </div>
  );
}

/* ─────────────────────────────────────
   SECTION  consistent vertical rhythm
───────────────────────────────────── */
function Section({ children, className = '' }) {
  return (
    <section className={`py-16 ${className}`} style={{ width: '100%' }}>
      <Container>{children}</Container>
    </section>
  );
}

/* ─────────────────────────────────────
   SECTION HEADING
───────────────────────────────────── */
function SectionHeading({ eyebrow, eyebrowColor = '#38bdf8', title }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: '2.5rem' }}>
      <p style={{ fontSize: '13px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '0.85rem', color: eyebrowColor, fontFamily: "'DM Sans', sans-serif" }}>
        {eyebrow}
      </p>
      <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', letterSpacing: '-0.03em', maxWidth: '40rem', lineHeight: 1.15, fontFamily: "'Sora', sans-serif" }}>
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
      <div style={{ height: '1px', background: 'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)' }} />
    </Container>
  );
}

/* ─────────────────────────────────────
   RESPONSIVE GRID
   Uses inline styles so it works even
   when Tailwind purges the grid classes.
───────────────────────────────────── */
function ResponsiveGrid({ cols = { mobile: 1, desktop: 3 }, gap = '1.5rem', children }) {
  const isDesktop = useBreakpoint(768);
  const columns = isDesktop ? cols.desktop : cols.mobile;
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        gap,
        width: '100%',
        boxSizing: 'border-box',
      }}
    >
      {children}
    </div>
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
    { icon: Activity, value: '10x',  label: 'Faster Onboarding', color: '#38bdf8' },
    { icon: Cpu,      value: '100%', label: 'Any Language',       color: '#818cf8' },
    { icon: Zap,      value: '<5s',  label: 'Analysis Time',      color: '#c084fc' },
    { icon: Shield,   value: 'OSS',  label: 'Open Source',        color: '#34d399' },
  ];

  const features = [
    {
      icon: Code2,
      title: 'Deep Code Analysis',
      color: '#38bdf8',
      desc: 'Semantic embeddings reveal architecture, patterns, and logic across every source file in the repository.',
    },
    {
      icon: Network,
      title: 'Dependency Mapping',
      color: '#818cf8',
      desc: 'Interactive graph of all components, modules and their real-time interdependencies visualized clearly.',
    },
    {
      icon: Zap,
      title: 'Instant AI Insights',
      color: '#c084fc',
      desc: 'Natural language queries — uncover bugs, trace logic flows, and accelerate code reviews in seconds.',
    },
  ];

  const steps = [
    {
      icon: Github,
      num: 1,
      title: 'Paste URL',
      desc: 'Drop any public GitHub repository URL into the search bar and hit Analyze.',
    },
    {
      icon: Cpu,
      num: 2,
      title: 'AI Indexes',
      desc: 'We clone, chunk, embed, and index every source file instantly via FAISS vector search.',
    },
    {
      icon: MessageSquare,
      num: 3,
      title: 'Ask Anything',
      desc: 'Chat naturally about architecture, logic, bugs — get instant context-aware answers.',
    },
  ];

  return (
    <div
      className="selection:bg-sky-500/20"
      style={{
        minHeight: '100vh',
        background: '#020617',
        color: '#f8fafc',
        overflowX: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: "'DM Sans', sans-serif",
        fontSize: '18px',
      }}
    >

      {/* ── keyframes ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap');

        * { font-family: 'DM Sans', sans-serif; }
        h1, h2, h3, .display-font { font-family: 'Sora', sans-serif; }

        @keyframes shimmer-kf {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc, #38bdf8);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-kf 4s linear infinite;
        }
        @keyframes blink-kf { 0%,100%{opacity:1} 50%{opacity:0} }
        .cursor-blink { animation: blink-kf 1.1s ease-in-out infinite; }
        @keyframes ring-kf  { 0%{transform:scale(1);opacity:.75} 100%{transform:scale(2.5);opacity:0} }
        .pulse-ring  { animation: ring-kf 2.3s ease-out infinite; }
        @keyframes grid-kf  { 0%,100%{opacity:.025} 50%{opacity:.05} }
        .agrid { animation: grid-kf 8s ease-in-out infinite; }

        /* ── fcard ── */
        .fcard {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.09);
          border-radius: 16px;
          backdrop-filter: blur(10px);
          box-sizing: border-box;
          /* 
           * KEY FIX: min-width:0 prevents a flex/grid child from overflowing
           * its cell. Without this, long content or nested flex containers
           * can force the item wider than its grid column.
           */
          min-width: 0;
          transition: transform .28s cubic-bezier(.34,1.56,.64,1),
                      box-shadow .28s ease,
                      border-color .28s ease;
        }
        .fcard:hover {
          transform: translateY(-6px);
          border-color: rgba(255,255,255,0.18);
          box-shadow: 0 22px 44px rgba(0,0,0,0.4);
        }

        /* ── glass util ── */
        .glass {
          background: rgba(2,6,23,0.82);
          backdrop-filter: blur(16px);
        }
        .glass-card {
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(12px);
        }
      `}</style>

      {/* ── fixed background ── */}
      <div aria-hidden style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 0 }}>

        {/* twinkling starfield */}
        <StarCanvas />

        {/* subtle grid */}
        <div className="agrid" style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),
                           linear-gradient(90deg,rgba(255,255,255,0.03) 1px,transparent 1px)`,
          backgroundSize: '72px 72px',
        }} />

        {/* soft corner glows — just for depth, no animation */}
        <div style={{
          position: 'absolute', top: '-12rem', left: '-12rem',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(56,189,248,0.06) 0%,transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-12rem', right: '-12rem',
          width: '600px', height: '600px', borderRadius: '50%',
          background: 'radial-gradient(circle,rgba(129,140,248,0.06) 0%,transparent 70%)',
        }} />

      </div>

      {/* ══════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════ */}
      <header className="glass" style={{
        position: 'sticky', top: 0, zIndex: 30,
        borderBottom: '1px solid rgba(255,255,255,0.07)',
      }}>
        <Container style={{ height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>

          {/* logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', flexShrink: 0 }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', inset: 0, borderRadius: '0.5rem',
                filter: 'blur(4px)', opacity: 0.6,
                background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
              }} />
              <div style={{
                position: 'relative', width: '1.75rem', height: '1.75rem',
                borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
              }}>
                <Github style={{ width: '0.875rem', height: '0.875rem', color: 'white' }} />
              </div>
            </div>
            <span style={{ fontWeight: 800, fontSize: '1.15rem', letterSpacing: '-0.03em', color: 'white', fontFamily: "'Sora', sans-serif" }}>RepoSense</span>
            <span style={{
              fontSize: '9px', padding: '0.125rem 0.375rem', borderRadius: '9999px',
              fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
              background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.25)', color: '#38bdf8',
              display: isDesktop ? 'inline' : 'none',
            }}>AI</span>
          </div>

          {/* compact input (repo loaded only) */}
          {isRepoLoaded && (
            <div style={{ flex: 1, maxWidth: '28rem', margin: '0 1rem' }}>
              <RepoInput onRepoLoad={handleRepoLoad} isLoading={isLoading} compact={true} />
            </div>
          )}

          {/* right nav */}
          {isRepoLoaded ? (
            <div style={{
              display: 'flex', padding: '0.25rem', borderRadius: '0.75rem', gap: '0.125rem', flexShrink: 0,
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)',
            }}>
              {[
                { v: 'summary', label: 'Summary', Icon: FileText },
                { v: 'chat',    label: 'Chat',    Icon: MessageSquare },
              ].map(({ v, label, Icon }) => (
                <button key={v} onClick={() => setActiveView(v)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '0.375rem',
                    padding: '0.375rem 1rem', borderRadius: '0.5rem',
                    fontSize: '0.75rem', fontWeight: 600,
                    cursor: 'pointer', transition: 'all 0.2s',
                    ...(activeView === v
                      ? { background: 'linear-gradient(135deg,rgba(56,189,248,0.18),rgba(129,140,248,0.18))', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.25)' }
                      : { color: 'rgba(148,163,184,0.7)', border: '1px solid transparent', background: 'transparent' }),
                  }}>
                  <Icon style={{ width: '0.875rem', height: '0.875rem' }} />{label}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', flexShrink: 0 }}>
              {isDesktop && <a href="#" style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', textDecoration: 'none' }}>Docs</a>}
              {isDesktop && <a href="#" style={{ fontSize: '0.75rem', color: 'rgba(148,163,184,0.7)', textDecoration: 'none' }}>GitHub</a>}
              <button style={{
                padding: '0.375rem 1rem', borderRadius: '0.75rem', fontSize: '0.75rem',
                fontWeight: 700, color: 'white', cursor: 'pointer', border: 'none',
                background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
                boxShadow: '0 0 16px rgba(56,189,248,0.3)',
              }}>
                Get Started
              </button>
            </div>
          )}
        </Container>
      </header>

      {/* ══════════════════════════════════════
          PAGE
      ══════════════════════════════════════ */}
      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">

          {/* ─────────────────────────────────
              LANDING
          ───────────────────────────────── */}
          {!isRepoLoaded && (
            <motion.div key="hero"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              exit={{ opacity: 0, filter: 'blur(8px)', scale: 0.98 }}
              transition={{ duration: 0.45 }}>

              {/* ── 1. HERO ── */}
              <section style={{ width: '100%', paddingTop: '5rem', paddingBottom: '5rem' }}>
                <Container>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '1.5rem' }}>

                    {/* live badge */}
                    <motion.div
                      initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
                      className=""
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                        padding: '0.45rem 1.1rem', borderRadius: '9999px',
                        fontSize: '12px', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase',
                        background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.28)', color: '#38bdf8',
                        boxShadow: '0 0 24px rgba(56,189,248,0.12)',
                      }}>
                      <span style={{ position: 'relative', display: 'flex', width: '0.5rem', height: '0.5rem' }}>
                        <span className="pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#38bdf8', opacity: 0.75 }} />
                        <span style={{ position: 'relative', width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: '#38bdf8' }} />
                      </span>
                      Powered by Advanced AI Models
                    </motion.div>

                    {/* headline */}
                    <motion.h1
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16, duration: 0.6 }}
                      style={{
                        fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center',
                        fontSize: 'clamp(3.2rem,7vw,5.8rem)', lineHeight: 1.06, maxWidth: '820px',
                        margin: 0, fontFamily: "'Sora', sans-serif",
                      }}>
                      <span style={{ color: 'white' }}>Understand </span>
                      <span className="shimmer-text">{typed}</span>
                      <span className="cursor-blink" style={{ color: '#38bdf8' }}>|</span>
                    </motion.h1>

                    {/* subtitle */}
                    <motion.p
                      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
                      style={{ fontSize: '1.25rem', color: 'rgba(148,163,184,0.85)', lineHeight: 1.7, fontWeight: 400, maxWidth: '540px', margin: 0 }}>
                      Paste a GitHub URL to analyze, visualize, and query the entire architecture using state-of-the-art AI.
                    </motion.p>

                    {/* ── BIG SEARCH BLOCK ── */}
                    <motion.div
                      initial={{ opacity: 0, y: 24, scale: 0.97 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ delay: 0.36, type: 'spring', stiffness: 100, damping: 18 }}
                      style={{ width: '100%', maxWidth: '860px', position: 'relative', marginTop: '0.75rem' }}
                    >
                      {/* soft static glow behind the card */}
                      <div style={{
                        position: 'absolute', inset: '-10px', borderRadius: '2rem',
                        background: 'radial-gradient(ellipse at 50% 60%, rgba(56,189,248,0.13) 0%, rgba(129,140,248,0.09) 50%, transparent 80%)',
                        pointerEvents: 'none', zIndex: 0,
                      }} />

                      {/* card */}
                      <div style={{
                        position: 'relative', zIndex: 1,
                        borderRadius: '1.5rem',
                        background: 'rgba(6,14,33,0.88)',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 32px 80px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.07)',
                        backdropFilter: 'blur(20px)',
                        overflow: 'hidden',
                      }}>

                        {/* label row */}
                        <div style={{
                          padding: '1.1rem 1.75rem 0.9rem',
                          borderBottom: '1px solid rgba(255,255,255,0.06)',
                        }}>
                          <p style={{
                            margin: 0,
                            fontSize: '13px', fontWeight: 600,
                            letterSpacing: '0.06em', textTransform: 'uppercase',
                            color: 'rgba(56,189,248,0.65)',
                            fontFamily: "'Sora', sans-serif",
                          }}>
                            Paste a GitHub repository URL to get started
                          </p>
                        </div>

                        {/* input */}
                        <div style={{ padding: '1.5rem 1.75rem 1.75rem' }}>
                          <RepoInput onRepoLoad={handleRepoLoad} isLoading={isLoading} compact={false} />
                        </div>

                        {/* trust strip */}
                        <div style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          flexWrap: 'wrap', gap: '2rem',
                          padding: '1rem 1.75rem',
                          borderTop: '1px solid rgba(255,255,255,0.05)',
                          background: 'rgba(255,255,255,0.02)',
                        }}>
                          {[
                            { icon: '⚡', label: 'Indexed in seconds' },
                            { icon: '🔒', label: 'No auth required' },
                            { icon: '🌐', label: 'Any public repo' },
                            { icon: '🤖', label: 'GPT-4o powered' },
                          ].map(({ icon, label }, i) => (
                            <span key={i} style={{
                              display: 'inline-flex', alignItems: 'center', gap: '0.45rem',
                              fontSize: '13px', color: 'rgba(148,163,184,0.5)',
                              fontFamily: "'DM Sans', sans-serif",
                            }}>
                              <span>{icon}</span>{label}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* hint text */}
                      <p style={{
                        marginTop: '1rem', fontSize: '13px',
                        color: 'rgba(71,85,105,0.7)', fontFamily: 'monospace',
                        textAlign: 'center', letterSpacing: '0.02em',
                      }}>
                        e.g.&nbsp;github.com/facebook/react &nbsp;·&nbsp; github.com/vercel/next.js &nbsp;·&nbsp; github.com/openai/openai-python
                      </p>
                    </motion.div>

                  </div>
                </Container>
              </section>

              {/* ══════════════════════════════
                  2. STATS — 2 cols mobile, 4 cols desktop
                  FIX: Use ResponsiveGrid with explicit
                  inline CSS grid, not Tailwind classes.
                  Each card has NO width override.
              ══════════════════════════════ */}
              <section style={{ width: '100%', paddingBottom: '4rem' }}>
                <Container>
                  <motion.div
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
                    <ResponsiveGrid cols={{ mobile: 2, desktop: 4 }} gap="1.25rem">
                      {stats.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, scale: 0.92 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.6 + i * 0.08 }}
                          className="fcard"
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            padding: '1.75rem 1.25rem',
                            /* NO width:100% — the grid cell controls width */
                          }}
                        >
                          {/* accent bar */}
                          <div style={{
                            width: '66%', height: '2px', borderRadius: '9999px', marginBottom: '1rem',
                            background: `linear-gradient(90deg,transparent,${s.color},transparent)`,
                          }} />
                          <div style={{
                            width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.75rem',
                            background: `${s.color}15`, border: `1px solid ${s.color}30`,
                          }}>
                            <s.icon style={{ color: s.color, width: '1.25rem', height: '1.25rem' }} />
                          </div>
                          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'white', marginBottom: '0.3rem', letterSpacing: '-0.04em', fontFamily: "'Sora', sans-serif" }}>
                            {s.value}
                          </div>
                          <div style={{ fontSize: '13px', color: 'rgba(100,116,139,0.85)', textTransform: 'uppercase', letterSpacing: '0.07em', fontWeight: 500, lineHeight: 1.3 }}>
                            {s.label}
                          </div>
                        </motion.div>
                      ))}
                    </ResponsiveGrid>
                  </motion.div>
                </Container>
              </section>

              <Divider />

              {/* ══════════════════════════════
                  3. FEATURE CARDS — 1 col mobile, 3 cols desktop
                  FIX: ResponsiveGrid + cards are display:flex
                  flex-col internally, no width override.
              ══════════════════════════════ */}
              <Section>
                <SectionHeading
                  eyebrow="Core Capabilities"
                  eyebrowColor="#38bdf8"
                  title="Everything you need to understand any codebase"
                />
                <ResponsiveGrid cols={{ mobile: 1, desktop: 3 }} gap="1.5rem">
                  {features.map((f, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 22 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 + i * 0.1 }}
                      className="fcard"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        padding: '1.75rem 1.5rem',
                        /* NO width:100% — grid cell handles it */
                      }}
                    >
                      {/* top colour strip */}
                      <div style={{
                        width: '100%', height: '2px', borderRadius: '9999px', marginBottom: '1.5rem',
                        background: `linear-gradient(90deg,${f.color}70,transparent)`,
                      }} />
                      <div style={{
                        width: '2.75rem', height: '2.75rem', borderRadius: '0.75rem', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem',
                        background: `${f.color}14`, border: `1px solid ${f.color}28`,
                      }}>
                        <f.icon style={{ color: f.color, width: '1.25rem', height: '1.25rem' }} />
                      </div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.7rem', lineHeight: 1.3, fontFamily: "'Sora', sans-serif" }}>
                        {f.title}
                      </h3>
                      <p style={{ fontSize: '1.05rem', color: 'rgba(100,116,139,0.9)', lineHeight: 1.7, flex: 1, margin: 0 }}>
                        {f.desc}
                      </p>
                      <div style={{ marginTop: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.125rem', fontSize: '0.95rem', fontWeight: 600, color: f.color }}>
                        Learn more <ChevronRight style={{ width: '0.75rem', height: '0.75rem' }} />
                      </div>
                    </motion.div>
                  ))}
                </ResponsiveGrid>
              </Section>

              <Divider />

              {/* ── 4. NETWORK GRAPH ── */}
              <Section>
                <SectionHeading
                  eyebrow="Architecture Visualization"
                  eyebrowColor="#818cf8"
                  title="Watch your repository come alive"
                />
                <p style={{ fontSize: '1.1rem', color: 'rgba(100,116,139,0.8)', textAlign: 'center', marginTop: '-1.5rem', marginBottom: '2rem', maxWidth: '34rem', marginLeft: 'auto', marginRight: 'auto' }}>
                  Interactive dependency graph — hover to repel nodes and watch files connect in real time.
                </p>

                <motion.div
                  initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                  style={{
                    position: 'relative', borderRadius: '1rem', overflow: 'hidden',
                    height: '340px',
                    background: 'rgba(56,189,248,0.015)',
                    border: '1px solid rgba(56,189,248,0.1)',
                    boxShadow: '0 0 60px rgba(56,189,248,0.05),inset 0 0 60px rgba(0,0,0,0.3)',
                  }}>
                  <div style={{ position: 'absolute', inset: 0 }}><NetworkGraph /></div>
                  <div style={{ position: 'absolute', top: '1rem', left: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <span style={{ position: 'relative', display: 'flex', width: '0.375rem', height: '0.375rem' }}>
                      <span className="pulse-ring" style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: '#38bdf8', opacity: 0.75 }} />
                      <span style={{ position: 'relative', width: '0.375rem', height: '0.375rem', borderRadius: '50%', background: '#38bdf8' }} />
                    </span>
                    <span style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(56,189,248,0.65)' }}>Live Analysis</span>
                  </div>
                  {/* corner accents */}
                  {[
                    { top: 0, left: 0, borderTop: '1px solid rgba(56,189,248,0.35)', borderLeft: '1px solid rgba(56,189,248,0.35)' },
                    { top: 0, right: 0, borderTop: '1px solid rgba(56,189,248,0.35)', borderRight: '1px solid rgba(56,189,248,0.35)' },
                    { bottom: 0, left: 0, borderBottom: '1px solid rgba(56,189,248,0.35)', borderLeft: '1px solid rgba(56,189,248,0.35)' },
                    { bottom: 0, right: 0, borderBottom: '1px solid rgba(56,189,248,0.35)', borderRight: '1px solid rgba(56,189,248,0.35)' },
                  ].map((s, i) => (
                    <div key={i} style={{ position: 'absolute', width: '1.25rem', height: '1.25rem', ...s }} />
                  ))}
                  <div style={{ position: 'absolute', bottom: '1rem', left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: '2.5rem' }}>
                    {[{ l: 'Nodes', v: '22' }, { l: 'Connections', v: '84' }, { l: 'Clusters', v: '5' }].map(({ l, v }, i) => (
                      <div key={i} style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '0.875rem', fontWeight: 700, fontFamily: 'monospace', color: '#38bdf8' }}>{v}</div>
                        <div style={{ fontSize: '9px', color: 'rgba(71,85,105,0.7)', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </Section>

              <Divider />

              {/* ══════════════════════════════
                  5. HOW IT WORKS — 1 col mobile, 3 cols desktop
                  FIX: Same ResponsiveGrid approach.
                  Connector line clamped to desktop only.
              ══════════════════════════════ */}
              <Section>
                <SectionHeading
                  eyebrow="How It Works"
                  eyebrowColor="#c084fc"
                  title="From URL to full clarity in three steps"
                />
                <div style={{ position: 'relative' }}>
                  {/* desktop-only connector line */}
                  {isDesktop && (
                    <div style={{
                      position: 'absolute',
                      top: '46px',
                      left: 'calc(16.67% + 18px)',
                      right: 'calc(16.67% + 18px)',
                      height: '1px',
                      background: 'linear-gradient(90deg,rgba(56,189,248,0.3),rgba(129,140,248,0.3))',
                      zIndex: 0,
                    }} />
                  )}
                  <ResponsiveGrid cols={{ mobile: 1, desktop: 3 }} gap="1.5rem">
                    {steps.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 + i * 0.1 }}
                        className="fcard"
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          textAlign: 'center',
                          padding: '2rem 1.5rem',
                          position: 'relative',
                          zIndex: 1,
                        }}
                      >
                        <div style={{
                          position: 'relative', width: '3rem', height: '3rem',
                          borderRadius: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginBottom: '1rem',
                          background: 'rgba(56,189,248,0.08)', border: '1px solid rgba(56,189,248,0.18)',
                        }}>
                          <s.icon style={{ width: '1.25rem', height: '1.25rem', color: '#38bdf8' }} />
                          <div style={{
                            position: 'absolute', top: '-0.5rem', right: '-0.5rem',
                            width: '1.25rem', height: '1.25rem', borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '9px', fontWeight: 700, color: 'white',
                            background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
                            boxShadow: '0 0 8px rgba(56,189,248,0.4)',
                          }}>
                            {s.num}
                          </div>
                        </div>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'white', marginBottom: '0.6rem', fontFamily: "'Sora', sans-serif" }}>
                          {s.title}
                        </h3>
                        <p style={{ fontSize: '1.05rem', color: 'rgba(100,116,139,0.9)', lineHeight: 1.7, margin: 0 }}>
                          {s.desc}
                        </p>
                      </motion.div>
                    ))}
                  </ResponsiveGrid>
                </div>
              </Section>

              <Divider />

              {/* ── 6. CTA BANNER ── */}
              <Section>
                <motion.div
                  initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                  style={{
                    position: 'relative', borderRadius: '1rem', overflow: 'hidden',
                    textAlign: 'center', padding: '3.5rem 2.5rem',
                    background: 'linear-gradient(135deg,rgba(56,189,248,0.06),rgba(129,140,248,0.07),rgba(192,132,252,0.06))',
                    border: '1px solid rgba(56,189,248,0.12)',
                  }}>
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse at center,rgba(56,189,248,0.05) 0%,transparent 70%)',
                  }} />
                  <h2 style={{ fontSize: '2.6rem', fontWeight: 800, color: 'white', marginBottom: '1rem', letterSpacing: '-0.03em', position: 'relative', fontFamily: "'Sora', sans-serif" }}>
                    Ready to understand your codebase?
                  </h2>
                  <p style={{ fontSize: '1.15rem', color: 'rgba(148,163,184,0.8)', maxWidth: '28rem', margin: '0 auto 2.25rem', position: 'relative' }}>
                    Paste any public GitHub URL — get an AI-powered architectural breakdown in seconds. No setup required.
                  </p>
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.6rem',
                      padding: '1rem 2.25rem', borderRadius: '0.875rem',
                      fontWeight: 700, fontSize: '1.05rem', color: 'white',
                      border: 'none', cursor: 'pointer',
                      background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
                      boxShadow: '0 0 28px rgba(56,189,248,0.4)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 0 44px rgba(56,189,248,0.62)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 0 28px rgba(56,189,248,0.4)'; }}
                  >
                    Analyze a Repository <ArrowRight style={{ width: '1.15rem', height: '1.15rem' }} />
                  </button>
                </motion.div>
              </Section>

            </motion.div>
          )}

          {/* ─────────────────────────────────
              DASHBOARD (post-load)
          ───────────────────────────────── */}
          {isRepoLoaded && (
            <motion.div key="dashboard"
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}
              style={{ width: '100%', padding: '1.25rem 0', height: 'calc(100vh - 64px)' }}>
              <Container style={{ height: '100%' }}>
                <div className="glass-card" style={{
                  borderRadius: '1rem', overflow: 'hidden',
                  display: 'flex', flexDirection: 'column', height: '100%',
                  boxShadow: '0 20px 60px -12px rgba(0,0,0,0.6),0 0 32px rgba(56,189,248,0.06)',
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
          position: 'relative', zIndex: 10,
          borderTop: '1px solid rgba(255,255,255,0.05)',
          background: 'rgba(2,6,23,0.92)', backdropFilter: 'blur(12px)',
        }}>
          <Container>
            <div style={{
              paddingTop: '1.5rem', paddingBottom: '1.5rem',
              display: 'flex', flexDirection: isDesktop ? 'row' : 'column',
              alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                  width: '1.25rem', height: '1.25rem', borderRadius: '0.375rem',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'linear-gradient(135deg,#38bdf8,#818cf8)',
                }}>
                  <Github style={{ width: '0.75rem', height: '0.75rem', color: 'white' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(100,116,139,0.7)' }}>RepoSense AI</span>
              </div>
              <p style={{ fontSize: '11px', color: 'rgba(71,85,105,0.7)', fontFamily: 'monospace', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <span>© {new Date().getFullYear()}</span>
                <span style={{ color: 'rgba(56,189,248,0.2)' }}>·</span>
                <span>React · FastAPI · Tailwind</span>
                <span style={{ color: 'rgba(56,189,248,0.2)' }}>·</span>
                <span style={{ color: 'rgba(56,189,248,0.4)' }}>GPT-4o-mini</span>
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                {['Privacy', 'Terms', 'GitHub'].map(l => (
                  <a key={l} href="#" style={{ fontSize: '11px', color: 'rgba(71,85,105,0.7)', textDecoration: 'none' }}>{l}</a>
                ))}
              </div>
            </div>
          </Container>
        </footer>
      )}
    </div>
  );
}