import React, { useState } from 'react';
import { Search, Loader2, Github, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function RepoInput({ onRepoLoad, isLoading, compact }) {
  const [url, setUrl] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onRepoLoad(url.trim());
  };

  /* ── COMPACT ── */
  if (compact) {
    return (
      <form onSubmit={handleSubmit} className="flex w-full relative">
        <Github className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Analyze another repository..."
          className={`w-full text-white text-sm rounded-full pl-11 pr-32 py-2.5 focus:outline-none transition-all placeholder:text-slate-500 bg-white/5 border ${isFocused ? 'border-sky-400 shadow-sm shadow-sky-500/10' : 'border-white/10'}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={isLoading}
          required
        />
        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="absolute right-1 top-1 bottom-1 flex items-center justify-center gap-2 px-4 rounded-full text-xs font-semibold text-white bg-sky-500 hover:bg-sky-400 transition-all disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Analyze'}
        </button>
      </form>
    );
  }

  /* ── FULL ── */
  return (
    <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full relative z-10">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-3 rounded-full p-2.5 transition-all duration-300 bg-white/5 border ${isFocused ? 'border-sky-400 shadow-lg shadow-sky-500/20' : 'border-white/10'}`}
      >
        <div className="pl-4 flex-shrink-0">
          <Search className={`w-5 h-5 transition-colors ${isFocused ? 'text-sky-500' : 'text-slate-400'}`} />
        </div>

        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="https://github.com/facebook/react"
          className="flex-1 bg-transparent text-white text-base font-mono focus:outline-none placeholder:text-slate-600 py-3 min-w-0"
          disabled={isLoading}
          required
        />

        <button
          type="submit"
          disabled={isLoading || !url.trim()}
          className="flex-shrink-0 flex items-center gap-2 text-white font-bold text-sm px-6 py-3 rounded-[1.4rem] transition-all duration-200 disabled:opacity-50 hover:scale-105 active:scale-95 bg-sky-500 shadow-md"
        >
          {isLoading
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing</>
            : <>Start <ArrowRight className="w-4 h-4" /></>}
        </button>
      </form>
    </motion.div>
  );
}