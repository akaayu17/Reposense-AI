import React, { useState, useEffect } from 'react';
import { summarizeRepo } from '../services/api';
import { FileText, FolderOpen, Loader2, AlertTriangle, Code2, BarChart2 } from 'lucide-react';
import { motion } from 'framer-motion';

function StatCard({ icon: Icon, label, value, color = '#38bdf8', labelColor = '#475569', valueColor = '#0f172a' }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(255,255,255,0.09)',
      borderRadius: '1rem',
      padding: '1.25rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.5rem',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Icon style={{ width: '1rem', height: '1rem', color }} />
        <span style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: labelColor }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color: valueColor, letterSpacing: '-0.03em', fontFamily: "'Sora', sans-serif" }}>
        {value}
      </div>
    </div>
  );
}

export default function SummaryView({ isRepoLoaded, files = [], dark = false }) {
  // Theme-aware text colors
  const bodyText  = dark ? '#f1f5f9' : '#1e293b';
  const mutedText = dark ? '#94a3b8' : '#475569';
  const fileText  = dark ? '#cbd5e1' : '#334155';
  const [summary, setSummary] = useState(null);
  const [isLoadingSummary, setIsLoadingSummary] = useState(false);
  const [error, setError] = useState(null);

  const loadSummary = async () => {
    setIsLoadingSummary(true);
    setError(null);
    try {
      const data = await summarizeRepo();
      setSummary(data);
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load summary.');
    } finally {
      setIsLoadingSummary(false);
    }
  };

  useEffect(() => {
    if (isRepoLoaded && !summary) loadSummary();
  }, [isRepoLoaded]);

  /* ── Loading state ── */
  if (isLoadingSummary) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', padding: '3rem', color: 'rgba(148,163,184,0.7)' }}>
        <Loader2 style={{ width: '2.5rem', height: '2.5rem', color: '#38bdf8' }} className="animate-spin" />
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>Generating AI summary…</p>
      </div>
    );
  }

  /* ── Error state ── */
  if (error) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, gap: '1rem', padding: '3rem', color: '#fca5a5' }}>
        <AlertTriangle style={{ width: '2rem', height: '2rem' }} />
        <p style={{ margin: 0, fontSize: '1rem', fontWeight: 500, textAlign: 'center', maxWidth: '28rem' }}>{error}</p>
        <button
          onClick={loadSummary}
          style={{
            marginTop: '0.5rem', padding: '0.6rem 1.5rem', borderRadius: '0.75rem',
            background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
            color: '#38bdf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  /* ── Main UI ── */
  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{
        flexShrink: 0, display: 'flex', alignItems: 'center', gap: '1rem',
        padding: '1.25rem 2rem',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        background: 'rgba(255,255,255,0.02)',
      }}>
        <div style={{
          width: '2.75rem', height: '2.75rem', borderRadius: '0.875rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.22)',
        }}>
          <FileText style={{ width: '1.2rem', height: '1.2rem', color: '#38bdf8' }} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em', fontFamily: "'Sora', sans-serif" }}>
            Repository Summary
          </h2>
          <p style={{ margin: '0.2rem 0 0', fontSize: '0.85rem', color: 'rgba(148,163,184,0.75)' }}>
            AI-generated architectural overview
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

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', scrollbarWidth: 'thin', scrollbarColor: 'rgba(56,189,248,0.2) transparent' }}>

        {/* Stat row */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}
        >
          <StatCard icon={FolderOpen} label="Files Indexed" value={files.length || summary?.file_count || '—'} color="#38bdf8" labelColor={mutedText} valueColor={bodyText} />
          <StatCard icon={Code2} label="Language" value={summary?.primary_language || 'Multi'} color="#818cf8" labelColor={mutedText} valueColor={bodyText} />
          <StatCard icon={BarChart2} label="Lines of Code" value={summary?.total_lines ? summary.total_lines.toLocaleString() : '—'} color="#c084fc" labelColor={mutedText} valueColor={bodyText} />
        </motion.div>

        {/* AI Summary block */}
        {summary?.summary && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '1rem',
              padding: '1.5rem 1.75rem',
            }}
          >
            <h3 style={{ margin: '0 0 0.85rem', fontSize: '0.95rem', fontWeight: 700, color: '#38bdf8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Sora', sans-serif" }}>
              Overview
            </h3>
            <p style={{ margin: 0, fontSize: '1rem', lineHeight: 1.75, color: bodyText, whiteSpace: 'pre-wrap' }}>
              {summary.summary}
            </p>
          </motion.div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.09)',
              borderRadius: '1rem',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, color: 'rgba(203,213,225,0.9)', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: "'Sora', sans-serif" }}>
                Indexed Files
              </h3>
            </div>
            <div style={{ maxHeight: '320px', overflowY: 'auto', padding: '0.5rem 0' }}>
              {files.map((f, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.55rem 1.5rem',
                  borderBottom: i < files.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                  fontSize: '0.88rem', color: fileText, fontFamily: 'monospace',
                }}>
                  <Code2 style={{ width: '0.875rem', height: '0.875rem', color: 'rgba(56,189,248,0.5)', flexShrink: 0 }} />
                  {f}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Empty state when no summary at all yet */}
        {!summary && !isLoadingSummary && (
          <div style={{ textAlign: 'center', padding: '3rem', color: mutedText }}>
            <FileText style={{ width: '2.5rem', height: '2.5rem', margin: '0 auto 1rem', display: 'block' }} />
            <p style={{ margin: 0, fontSize: '1rem' }}>No summary available yet.</p>
            <button
              onClick={loadSummary}
              style={{
                marginTop: '1rem', padding: '0.6rem 1.5rem', borderRadius: '0.75rem',
                background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)',
                color: '#38bdf8', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              Generate Summary
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
