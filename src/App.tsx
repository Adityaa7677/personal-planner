import { useState, useEffect } from 'react';
import type { FC } from 'react';
import {
  Sun,
  Moon,
  Clock,
  BookOpen,
  Calendar,
  Layers,
  Database,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { usePlannerStore } from './core/store.js';
import { getNowSuggestion } from './core/actions.js';
import type { NowSuggestion } from './core/types.js';

export const App: FC = () => {
  // Theme state persisted to localStorage
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronopaper_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  const { goals, blocks, activeStorageName } = usePlannerStore();
  const [nowSuggestion, setNowSuggestion] = useState<NowSuggestion | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chronopaper_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chronopaper_theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, '0');
      const mm = String(now.getMinutes()).padStart(2, '0');
      setCurrentTimeStr(`${hh}:${mm}`);
      setNowSuggestion(getNowSuggestion(now));
    };

    updateTime();
    const timer = setInterval(updateTime, 30000);
    return () => clearInterval(timer);
  }, [blocks, goals]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  // Formatted date string for editorial header
  const todayFormatted = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());

  return (
    <div className="min-h-screen bg-[var(--color-paper)] text-[var(--color-ink)] transition-colors duration-[180ms] ease-out flex flex-col">
      {/* Bookmark Ribbon Accent Line (single accent color) */}
      <div className="h-[2px] w-full bg-[var(--color-accent)] opacity-90" />

      {/* Editorial Top Navigation Shell */}
      <header className="border-b border-[var(--color-hairline)] px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-baseline space-x-3">
            <h1 className="font-serif text-2xl tracking-tight text-[var(--color-ink)] font-normal">
              ChronoPaper
            </h1>
            <span className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] font-mono">
              Journal Shell v0.1
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Storage Adapter Status Badge */}
            <div className="hidden sm:flex items-center space-x-2 px-2.5 py-1 text-xs text-[var(--color-ink-secondary)] bg-[var(--color-paper-muted)] rounded-[var(--radius-sm)] border border-[var(--color-hairline)]">
              <Database className="w-3.5 h-3.5 stroke-[1.5]" />
              <span className="tabular-nums font-mono text-[11px]">
                Storage: {activeStorageName} (SQLite swap-ready)
              </span>
            </div>

            {/* Dark / Light Mode Switch */}
            <button
              onClick={toggleTheme}
              aria-label="Toggle dark/light paper theme"
              className="p-2 rounded-[var(--radius-sm)] border border-[var(--color-hairline)] bg-[var(--color-paper-surface)] hover:bg-[var(--color-paper-muted)] text-[var(--color-ink-secondary)] transition-colors duration-[150ms] ease-out cursor-pointer"
            >
              {isDark ? (
                <Sun className="w-4 h-4 stroke-[1.5]" />
              ) : (
                <Moon className="w-4 h-4 stroke-[1.5]" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Paper Leaf / App Shell Canvas */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-6 py-8">
        {/* Page Header Leaf */}
        <section className="mb-8 pb-6 border-b border-[var(--color-hairline)]">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-mono mb-1">
                Daily Ledger
              </p>
              <h2 className="font-serif text-3xl sm:text-4xl text-[var(--color-ink)] font-normal tracking-tight">
                {todayFormatted}
              </h2>
            </div>
            <div className="flex items-center space-x-2 text-[var(--color-ink-secondary)] tabular-nums font-mono text-sm">
              <Clock className="w-4 h-4 stroke-[1.5] text-[var(--color-ink-muted)]" />
              <span>Current Time: {currentTimeStr || '--:--'}</span>
            </div>
          </div>
        </section>

        {/* Live Engine Status: Now Suggestion & Free Windows */}
        <section className="mb-8 p-5 bg-[var(--color-paper-surface)] border border-[var(--color-hairline)] rounded-[var(--radius-sm)] shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--color-hairline)]">
            <div className="flex items-center space-x-2 text-xs uppercase tracking-wider font-mono text-[var(--color-ink-muted)]">
              <Sparkles className="w-3.5 h-3.5 stroke-[1.5] text-[var(--color-accent)]" />
              <span>Engine Status: getNowSuggestion()</span>
            </div>
            <span className="text-xs font-mono text-[var(--color-ink-muted)]">
              AI Tool Action Ready
            </span>
          </div>

          {nowSuggestion?.type === 'current_block' ? (
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider font-mono mb-1">
                  Active Block In Progress
                </p>
                <h3 className="font-serif text-xl text-[var(--color-ink)]">
                  {nowSuggestion.block.title}
                </h3>
                <p className="text-sm text-[var(--color-ink-secondary)] tabular-nums mt-1 font-mono">
                  {nowSuggestion.block.start} — {nowSuggestion.block.end} ({nowSuggestion.block.kind})
                </p>
              </div>
              <span className="px-2.5 py-1 text-xs font-mono rounded-[var(--radius-sm)] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border border-[var(--color-hairline)]">
                Busy
              </span>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--color-ink-muted)] uppercase tracking-wider font-mono mb-1">
                    Free Window Detected
                  </p>
                  <p className="font-serif text-lg text-[var(--color-ink)]">
                    {nowSuggestion?.minutesFree ?? 0} minutes available
                    {nowSuggestion?.nextBlockStart
                      ? ` until next block at ${nowSuggestion.nextBlockStart}`
                      : ' (no more blocks scheduled today)'}
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-mono rounded-[var(--radius-sm)] bg-[var(--color-paper-muted)] text-[var(--color-ink-secondary)] border border-[var(--color-hairline)]">
                  Available
                </span>
              </div>

              {nowSuggestion?.subtask ? (
                <div className="mt-3 pt-3 border-t border-[var(--color-hairline)] flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ArrowRight className="w-4 h-4 stroke-[1.5] text-[var(--color-accent)] flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-[var(--color-ink)]">
                        Suggested Subtask: {nowSuggestion.subtask.title}
                      </p>
                      <p className="text-xs text-[var(--color-ink-muted)] tabular-nums font-mono">
                        Estimate: {nowSuggestion.subtask.estimateMins}m • Goal:{' '}
                        {nowSuggestion.goal?.title} (Due: {nowSuggestion.goal?.deadline})
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-2 text-xs text-[var(--color-ink-muted)] font-mono">
                  No unfinished subtask fits this window duration.
                </div>
              )}
            </div>
          )}
        </section>

        {/* Foundation Metric Cards (Hairline borders, 8px grid) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-[var(--color-paper-surface)] border border-[var(--color-hairline)] rounded-[var(--radius-sm)]">
            <div className="flex items-center space-x-2 text-xs font-mono text-[var(--color-ink-muted)] mb-2">
              <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Active Goals</span>
            </div>
            <p className="font-serif text-3xl tabular-nums text-[var(--color-ink)]">
              {goals.length}
            </p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {goals.map((g) => (
                <span
                  key={g.id}
                  className="inline-flex items-center px-2 py-0.5 text-[11px] font-mono rounded-[var(--radius-xs)] border border-[var(--color-hairline)]"
                  style={{
                    backgroundColor: 'var(--color-paper-muted)',
                    borderLeftColor: g.color,
                    borderLeftWidth: '3px',
                  }}
                >
                  {g.title.slice(0, 20)}…
                </span>
              ))}
            </div>
          </div>

          <div className="p-4 bg-[var(--color-paper-surface)] border border-[var(--color-hairline)] rounded-[var(--radius-sm)]">
            <div className="flex items-center space-x-2 text-xs font-mono text-[var(--color-ink-muted)] mb-2">
              <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Registered Blocks</span>
            </div>
            <p className="font-serif text-3xl tabular-nums text-[var(--color-ink)]">
              {blocks.length}
            </p>
            <p className="mt-2 text-xs text-[var(--color-ink-secondary)] font-mono">
              College (Mon–Fri 09:00–19:00)
            </p>
          </div>

          <div className="p-4 bg-[var(--color-paper-surface)] border border-[var(--color-hairline)] rounded-[var(--radius-sm)]">
            <div className="flex items-center space-x-2 text-xs font-mono text-[var(--color-ink-muted)] mb-2">
              <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Storage Layer</span>
            </div>
            <p className="font-serif text-lg text-[var(--color-ink)] truncate">
              {activeStorageName}
            </p>
            <p className="mt-2 text-xs text-[var(--color-ink-muted)] font-mono">
              src/core/storage.ts abstraction
            </p>
          </div>
        </section>

        {/* Blank App Shell Canvas Area */}
        <section className="border border-dashed border-[var(--color-hairline-strong)] rounded-[var(--radius-sm)] p-12 text-center bg-[var(--color-paper-wash)]">
          <p className="text-xs uppercase tracking-widest text-[var(--color-ink-muted)] font-mono mb-2">
            Blank App Shell
          </p>
          <h3 className="font-serif text-2xl text-[var(--color-ink)] mb-2 font-normal">
            Clean Slate Workspace
          </h3>
          <p className="text-sm text-[var(--color-ink-secondary)] max-w-md mx-auto leading-relaxed">
            The foundation is laid: storage abstraction, Zustand store, pure domain actions with
            JSDoc annotations, seed data, and unit tests. The planner interface will be sculpted here.
          </p>
        </section>
      </main>

      {/* Editorial Footer */}
      <footer className="border-t border-[var(--color-hairline)] py-4 px-6 text-center text-xs text-[var(--color-ink-muted)] font-mono">
        <span>ChronoPaper • Calm, Editorial, Personal • 8px Grid & Hairline Discipline</span>
      </footer>
    </div>
  );
};

export default App;
