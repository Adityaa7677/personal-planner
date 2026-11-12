import type { FC } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  BookOpen,
  Calendar,
  Database,
} from 'lucide-react';

interface TimetableHeaderProps {
  isGoalsOpen: boolean;
  onToggleGoals: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  weekRangeLabel: string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
  activeStorageName: string;
}

export const TimetableHeader: FC<TimetableHeaderProps> = ({
  isGoalsOpen,
  onToggleGoals,
  isDark,
  onToggleTheme,
  weekRangeLabel,
  onPrevWeek,
  onNextWeek,
  onToday,
  activeStorageName,
}) => {
  return (
    <header className="border-b border-hairline bg-[var(--color-paper-surface)] px-5 py-3.5 select-none transition-editorial">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left Section: Brand & Goals Panel Toggle */}
        <div className="flex items-center space-x-4">
          {/* Goals Panel Toggle Button */}
          <button
            type="button"
            onClick={onToggleGoals}
            aria-label={isGoalsOpen ? 'Collapse Goals panel' : 'Expand Goals panel'}
            className={`inline-flex items-center space-x-2 px-3 py-1.5 text-xs font-mono rounded-[var(--radius-xs)] border transition-editorial cursor-pointer ${
              isGoalsOpen
                ? 'bg-[var(--color-accent-subtle)] text-[var(--color-accent)] border-[var(--color-accent)]/30'
                : 'bg-[var(--color-paper)] text-[var(--color-ink-secondary)] border-hairline hover:bg-[var(--color-paper-muted)]'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5 stroke-[1.5]" />
            <span className="hidden sm:inline">Goals Ledger</span>
            <span className="text-[10px] uppercase font-mono px-1 py-0.2 rounded-[var(--radius-xs)] bg-[var(--color-paper-surface)] border border-hairline">
              {isGoalsOpen ? 'Hide' : 'Show'}
            </span>
          </button>

          <div className="flex items-baseline space-x-2">
            <h1 className="font-serif text-xl sm:text-2xl tracking-tight text-[var(--color-ink)] font-normal">
              ChronoPaper
            </h1>
            <span className="hidden md:inline text-[10px] uppercase tracking-widest text-[var(--color-ink-muted)] font-mono">
              Timetable
            </span>
          </div>
        </div>

        {/* Center / Week Navigator */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center border border-hairline rounded-[var(--radius-xs)] bg-[var(--color-paper)] overflow-hidden">
            <button
              type="button"
              onClick={onPrevWeek}
              aria-label="Previous week"
              title="Previous week"
              className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-editorial cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            </button>

            <button
              type="button"
              onClick={onToday}
              aria-label="Jump to current week"
              className="px-2.5 py-1 text-xs font-mono text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] border-x border-hairline transition-editorial cursor-pointer"
            >
              Today
            </button>

            <button
              type="button"
              onClick={onNextWeek}
              aria-label="Next week"
              title="Next week"
              className="p-1.5 text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-editorial cursor-pointer"
            >
              <ChevronRight className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>

          <div className="flex items-center space-x-1.5 text-xs sm:text-sm font-serif text-[var(--color-ink)] px-2">
            <Calendar className="w-3.5 h-3.5 stroke-[1.5] text-[var(--color-accent)] hidden sm:block" />
            <span>{weekRangeLabel}</span>
          </div>
        </div>

        {/* Right Section: Storage badge & Dark mode toggle */}
        <div className="flex items-center space-x-3">
          <div className="hidden lg:flex items-center space-x-1.5 px-2 py-1 text-[11px] font-mono text-[var(--color-ink-secondary)] bg-[var(--color-paper-muted)] rounded-[var(--radius-xs)] border border-hairline">
            <Database className="w-3 h-3 stroke-[1.5] text-[var(--color-ink-muted)]" />
            <span className="tabular-nums">Storage: {activeStorageName}</span>
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            aria-label="Toggle theme"
            className="p-1.5 rounded-[var(--radius-xs)] border border-hairline bg-[var(--color-paper)] hover:bg-[var(--color-paper-muted)] text-[var(--color-ink-secondary)] transition-editorial cursor-pointer"
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
  );
};
