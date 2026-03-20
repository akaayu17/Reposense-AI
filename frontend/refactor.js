import fs from 'fs';

const files = [
  'src/App.jsx',
  'src/components/RepoInput.jsx',
  'src/components/SummaryView.jsx',
  'src/components/ChatInterface.jsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  
  // 1. Convert Colors
  content = content.replace(/'#ffffff'/g, "'var(--text-primary)'");
  content = content.replace(/'#f8fafc'/g, "'var(--text-primary)'");
  // Some places have color: 'white' or text-white
  content = content.replace(/color:\s*'white'/g, "color: 'var(--text-primary)'");
  content = content.replace(/color:\s*"white"/g, "color: 'var(--text-primary)'");
  content = content.replace(/text-white/g, "text-[color:var(--text-primary)]");
  content = content.replace(/text-slate-100/g, "text-[color:var(--text-primary)]");
  content = content.replace(/text-slate-200/g, "text-[color:var(--text-primary)]");
  content = content.replace(/text-slate-300/g, "text-[color:var(--text-secondary)]");
  content = content.replace(/text-slate-400/g, "text-[color:var(--text-tertiary)]");
  content = content.replace(/text-slate-500/g, "text-[color:var(--text-tertiary)]");
  content = content.replace(/'#e2e8f0'/g, "'var(--text-primary)'");
  content = content.replace(/'#cbd5e1'/g, "'var(--text-secondary)'");

  // 2. Backgrounds
  content = content.replace(/'#020617'/g, "'var(--bg-app)'");
  content = content.replace(/#020617/g, "var(--bg-app)");
  content = content.replace(/rgba\(\s*2\s*,\s*6\s*,\s*23\s*,/g, "rgba(var(--bg-app-rgb),");
  content = content.replace(/rgba\(\s*5\s*,\s*10\s*,\s*24\s*,/g, "rgba(var(--bg-app-rgb),");
  content = content.replace(/rgba\(\s*6\s*,\s*14\s*,\s*33\s*,/g, "rgba(var(--bg-panel-rgb),");
  content = content.replace(/#03070f/g, "var(--bg-app)");

  // 3. Inverts (white transparents) -> use --bg-invert-rgb
  content = content.replace(/rgba\(\s*255\s*,\s*255\s*,\s*255\s*,/g, "rgba(var(--bg-invert-rgb),");
  
  // 4. Muted text rgb
  content = content.replace(/rgba\(\s*148\s*,\s*163\s*,\s*184\s*,/g, "rgba(var(--text-muted-rgb),");
  content = content.replace(/rgba\(\s*100\s*,\s*116\s*,\s*139\s*,/g, "rgba(var(--text-dark-rgb),");
  content = content.replace(/rgba\(\s*71\s*,\s*85\s*,\s*105\s*,/g, "rgba(var(--text-dark-rgb),");
  content = content.replace(/rgba\(\s*203\s*,\s*213\s*,\s*225\s*,/g, "rgba(var(--text-secondary-rgb),");

  // 5. Add Theme Context to App.jsx
  if (file === 'src/App.jsx') {
    // Add Sun/Moon imports
    if (!content.includes('Sun, Moon')) {
      content = content.replace(/import\s*{\s*Github/, "import { Github, Sun, Moon");
    }

    // Add Theme state
    if (!content.includes('const [theme, setTheme]')) {
      content = content.replace(
        /const\s*\[activeView,\s*setActiveView\]\s*=\s*useState\('summary'\);/,
        "const [activeView, setActiveView] = useState('summary');\n  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');\n  useEffect(() => {\n    document.documentElement.setAttribute('data-theme', theme);\n    localStorage.setItem('theme', theme);\n  }, [theme]);\n  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark');"
      );
    }

    // Inject Theme Toggle Button next to right nav
    const themeBtn = `
                <button
                  onClick={toggleTheme}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '2.25rem', height: '2.25rem', borderRadius: '0.6rem',
                    background: 'rgba(var(--bg-invert-rgb), 0.05)',
                    border: '1px solid rgba(var(--bg-invert-rgb), 0.1)',
                    color: 'var(--text-primary)', cursor: 'pointer', transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(var(--bg-invert-rgb), 0.1)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'rgba(var(--bg-invert-rgb), 0.05)'}
                >
                  {theme === 'dark' ? <Sun style={{ width: '1.2rem', height: '1.2rem' }} /> : <Moon style={{ width: '1.2rem', height: '1.2rem' }} />}
                </button>
    `;
    
    // Add to isRepoLoaded nav (before the buttons map)
    if (!content.includes('onClick={toggleTheme}')) {
      content = content.replace(
        /\{\s*isDesktop\s*&&\s*<a[^>]*>Docs<\/a>\s*\}/,
        themeBtn + "\n              {isDesktop && <a href=\"#\" style={{ fontSize: '0.75rem', color: 'rgba(var(--text-muted-rgb), 0.7)', textDecoration: 'none' }}>Docs</a>}"
      );
      
      content = content.replace(
        /\{ \[\s*\{\s*v:\s*'summary'/,
        themeBtn + "\n              {[ { v: 'summary'"
      );
    }
  }

  fs.writeFileSync(file, content);
}
console.log('Refactoring complete!');
