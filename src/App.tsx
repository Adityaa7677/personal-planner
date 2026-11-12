import { useState, useEffect, useMemo, useCallback } from 'react';
import type { FC } from 'react';
import { usePlannerStore } from './core/store.js';
import { getNowSuggestion } from './core/actions.js';
import type { Block, NowSuggestion } from './core/types.js';
import { NowCard } from './components/timetable/NowCard.js';
import { WeekGrid } from './components/timetable/WeekGrid.js';
import { DaySlideOver } from './components/timetable/DaySlideOver.js';
import { BlockEditModal } from './components/timetable/BlockEditModal.js';
import { GoalsSidebar } from './components/timetable/GoalsSidebar.js';
import { TimetableHeader } from './components/timetable/TimetableHeader.js';

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

  // Collapsible Goals panel state
  const [isGoalsOpen, setIsGoalsOpen] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chronopaper_goals_open');
      if (saved !== null) return saved === 'true';
      return window.innerWidth >= 1280;
    }
    return true;
  });

  const { goals, blocks, activeStorageName } = usePlannerStore();

  // Navigation: Week offset (0 = current week)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Time & Now Suggestion initialized eagerly
  const [currentTimeStr, setCurrentTimeStr] = useState<string>(() => {
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  const [todayDateStr, setTodayDateStr] = useState<string>(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  });
  const [nowSuggestion, setNowSuggestion] = useState<NowSuggestion | null>(() => {
    return getNowSuggestion(new Date());
  });

  // Slide-over & Modal states
  const [selectedDateForSlideOver, setSelectedDateForSlideOver] = useState<string | null>(null);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);

  // Update theme class on HTML element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('chronopaper_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('chronopaper_theme', 'light');
    }
  }, [isDark]);

  // Persist goals panel open/collapsed preference
  useEffect(() => {
    localStorage.setItem('chronopaper_goals_open', String(isGoalsOpen));
  }, [isGoalsOpen]);

  // Real-time evaluation of current time and getNowSuggestion
  const refreshSuggestion = useCallback(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');

    setTodayDateStr(`${y}-${m}-${d}`);
    setCurrentTimeStr(`${hh}:${mm}`);
    setNowSuggestion(getNowSuggestion(now));
  }, []);

  useEffect(() => {
    const timer = setInterval(refreshSuggestion, 20000);
    return () => clearInterval(timer);
  }, [refreshSuggestion, blocks, goals]);

  // Week Days calculation (Monday through Sunday)
  const { weekDays, weekRangeLabel } = useMemo(() => {
    const now = new Date();
    // Reset to local midnight
    const baseDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Day of week: 0 = Sun, 1 = Mon, ..., 6 = Sat
    const dayOfWeek = baseDate.getDay();
    const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;

    // Shift to Monday of the active week offset
    const monday = new Date(baseDate);
    monday.setDate(baseDate.getDate() + diffToMonday + weekOffset * 7);

    const days: { dateStr: string; dayName: string; dayNumber: string; isToday: boolean }[] = [];
    const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);

      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const dayNum = String(d.getDate()).padStart(2, '0');
      const dateStr = `${y}-${m}-${dayNum}`;

      days.push({
        dateStr,
        dayName: dayNames[i],
        dayNumber: dayNum,
        isToday: dateStr === todayDateStr,
      });
    }

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);

    const startMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(monday);
    const endMonth = new Intl.DateTimeFormat('en-US', { month: 'short' }).format(sunday);
    const startYear = monday.getFullYear();
    const endYear = sunday.getFullYear();

    let rangeLabel = '';
    if (startYear !== endYear) {
      rangeLabel = `${startMonth} ${monday.getDate()}, ${startYear} — ${endMonth} ${sunday.getDate()}, ${endYear}`;
    } else if (startMonth !== endMonth) {
      rangeLabel = `${startMonth} ${monday.getDate()} — ${endMonth} ${sunday.getDate()}, ${startYear}`;
    } else {
      rangeLabel = `${startMonth} ${monday.getDate()} — ${sunday.getDate()}, ${startYear}`;
    }

    return { weekDays: days, weekRangeLabel: rangeLabel };
  }, [weekOffset, todayDateStr]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[var(--color-paper)] text-[var(--color-ink)] overflow-hidden transition-colors duration-[180ms] ease-out">
      {/* Bookcloth Ribbon Accent Line (single accent color) */}
      <div className="h-[2px] w-full bg-[var(--color-accent)] opacity-90 flex-shrink-0" />

      {/* Main Top Timetable Bar */}
      <TimetableHeader
        isGoalsOpen={isGoalsOpen}
        onToggleGoals={() => setIsGoalsOpen((prev) => !prev)}
        isDark={isDark}
        onToggleTheme={() => setIsDark((prev) => !prev)}
        weekRangeLabel={weekRangeLabel}
        onPrevWeek={() => setWeekOffset((prev) => prev - 1)}
        onNextWeek={() => setWeekOffset((prev) => prev + 1)}
        onToday={() => setWeekOffset(0)}
        activeStorageName={activeStorageName}
      />

      {/* Main Content Area: Left Goals Sidebar + Right Timetable Canvas */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Collapsible Goals Panel */}
        <GoalsSidebar
          isOpen={isGoalsOpen}
          goals={goals}
          onClose={() => setIsGoalsOpen(false)}
        />

        {/* Right Timetable Workspace */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl w-full mx-auto flex flex-col">
            {/* The "Now" Card: Most prominent element on the page */}
            <NowCard
              suggestion={nowSuggestion}
              currentTimeStr={currentTimeStr}
              onRefreshSuggestion={refreshSuggestion}
            />

            {/* Timetable Sub-header & Interaction Note */}
            <div className="flex items-center justify-between mb-3 text-xs font-mono text-[var(--color-ink-muted)]">
              <span>Click any date header to open daily sheet • Click any block to edit</span>
              <span className="hidden sm:inline tabular-nums">07:00 — 23:00 View</span>
            </div>

            {/* The Week Time Grid */}
            <WeekGrid
              weekDays={weekDays}
              currentTimeStr={currentTimeStr}
              goals={goals}
              onDateHeaderClick={(dateStr) => setSelectedDateForSlideOver(dateStr)}
              onBlockClick={(block) => setEditingBlock(block)}
            />
          </div>
        </main>
      </div>

      {/* Slide-over Day Panel */}
      {selectedDateForSlideOver && (
        <DaySlideOver
          key={selectedDateForSlideOver}
          date={selectedDateForSlideOver}
          goals={goals}
          isOpen={true}
          onClose={() => setSelectedDateForSlideOver(null)}
          onBlockSelectedForEdit={(block) => setEditingBlock(block)}
          onScheduleChanged={refreshSuggestion}
        />
      )}

      {/* Block Edit Modal */}
      {editingBlock && (
        <BlockEditModal
          key={editingBlock.id}
          block={editingBlock}
          goals={goals}
          isOpen={true}
          onClose={() => setEditingBlock(null)}
          onSaved={refreshSuggestion}
        />
      )}
    </div>
  );
};

export default App;
