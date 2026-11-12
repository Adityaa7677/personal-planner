import { useMemo } from 'react';
import type { FC } from 'react';
import type { Block, Goal } from '../../core/types.js';
import { getBlocksForDate, timeToMinutes } from '../../core/actions.js';

interface WeekGridProps {
  weekDays: { dateStr: string; dayName: string; dayNumber: string; isToday: boolean }[];
  currentTimeStr: string;
  goals: Goal[];
  onDateHeaderClick: (dateStr: string) => void;
  onBlockClick: (block: Block) => void;
}

const GRID_START_HOUR = 7; // 07:00
const GRID_END_HOUR = 23;  // 23:00
const HOUR_HEIGHT = 56;    // 56px per hour (7 * 8px)

export const WeekGrid: FC<WeekGridProps> = ({
  weekDays,
  currentTimeStr,
  goals,
  onDateHeaderClick,
  onBlockClick,
}) => {
  const hours = useMemo(() => {
    const list: string[] = [];
    for (let h = GRID_START_HOUR; h <= GRID_END_HOUR; h++) {
      list.push(`${String(h).padStart(2, '0')}:00`);
    }
    return list;
  }, []);

  const totalGridHeight = (GRID_END_HOUR - GRID_START_HOUR) * HOUR_HEIGHT;
  const gridStartMins = GRID_START_HOUR * 60;
  const gridEndMins = GRID_END_HOUR * 60;

  // Current time position in pixels
  const nowMins = timeToMinutes(currentTimeStr);
  const isNowWithinGrid = nowMins >= gridStartMins && nowMins <= gridEndMins;
  const nowLineTop = isNowWithinGrid ? ((nowMins - gridStartMins) / 60) * HOUR_HEIGHT : null;

  return (
    <div className="flex flex-col bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-sm)] shadow-[0_1px_2px_rgba(0,0,0,0.02)] overflow-hidden transition-editorial">
      {/* Scrollable Container with sticky headers */}
      <div className="overflow-x-auto max-w-full">
        <div className="min-w-[760px] select-none">
          {/* Weekday Header Row */}
          <div className="flex border-b border-hairline bg-[var(--color-paper-wash)]">
            {/* Time Gutter Corner */}
            <div className="w-16 flex-shrink-0 border-r border-hairline py-3 px-2 flex items-center justify-center">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink-muted)]">
                Time
              </span>
            </div>

            {/* 7 Day Columns */}
            <div className="grid grid-cols-7 flex-1">
              {weekDays.map((day) => (
                <button
                  key={day.dateStr}
                  type="button"
                  onClick={() => onDateHeaderClick(day.dateStr)}
                  className={`py-3 px-2 text-center border-r border-hairline last:border-r-0 transition-editorial group cursor-pointer relative ${
                    day.isToday
                      ? 'bg-[var(--color-paper-muted)]/60'
                      : 'hover:bg-[var(--color-paper-muted)]/40'
                  }`}
                  title="Click to view daily ledger and add blocks"
                >
                  {/* Today marker ribbon indicator */}
                  {day.isToday && (
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--color-accent)]" />
                  )}

                  <span className="block text-[11px] font-mono uppercase tracking-wider text-[var(--color-ink-muted)] group-hover:text-[var(--color-accent)] transition-colors">
                    {day.dayName}
                  </span>
                  <span
                    className={`block font-serif text-2xl tracking-tight leading-none mt-1 ${
                      day.isToday
                        ? 'text-[var(--color-accent)] font-medium'
                        : 'text-[var(--color-ink)]'
                    }`}
                  >
                    {day.dayNumber}
                  </span>

                  <span className="block text-[9px] font-mono text-[var(--color-ink-muted)] opacity-0 group-hover:opacity-100 transition-opacity mt-0.5">
                    Open Day Sheet
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Time Grid Canvas */}
          <div className="flex relative" style={{ height: `${totalGridHeight}px` }}>
            {/* Left Hour Axis Labels */}
            <div className="w-16 flex-shrink-0 border-r border-hairline bg-[var(--color-paper-wash)]/40 relative">
              {hours.map((hour, idx) => (
                <div
                  key={hour}
                  className="absolute left-0 right-0 text-right pr-2 text-[10px] font-mono tabular-nums text-[var(--color-ink-muted)]"
                  style={{
                    top: `${idx * HOUR_HEIGHT - 7}px`,
                  }}
                >
                  {hour}
                </div>
              ))}
            </div>

            {/* Day Columns Grid */}
            <div className="grid grid-cols-7 flex-1 relative">
              {/* Background Horizontal Hairline Rules */}
              <div className="absolute inset-0 pointer-events-none">
                {hours.map((hour, idx) => (
                  <div
                    key={`line-${hour}`}
                    className="absolute left-0 right-0 border-t border-hairline"
                    style={{ top: `${idx * HOUR_HEIGHT}px` }}
                  />
                ))}
              </div>

              {/* Day Columns */}
              {weekDays.map((day) => {
                const blocks = getBlocksForDate(day.dateStr);

                return (
                  <div
                    key={`col-${day.dateStr}`}
                    className={`relative border-r border-hairline last:border-r-0 h-full ${
                      day.isToday ? 'bg-[var(--color-paper-muted)]/20' : ''
                    }`}
                  >
                    {/* Current Time Indicator Line (Only on today's column) */}
                    {day.isToday && nowLineTop !== null && (
                      <div
                        className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
                        style={{ top: `${nowLineTop}px` }}
                      >
                        <span className="h-2 w-2 rounded-full bg-[var(--color-accent)] -ml-1 flex-shrink-0 shadow-xs" />
                        <span className="h-[1.5px] w-full bg-[var(--color-accent)]" />
                        <span className="absolute right-1 -top-3 text-[9px] font-mono tabular-nums bg-[var(--color-accent)] text-white px-1 py-0.2 rounded-[var(--radius-xs)] shadow-xs">
                          {currentTimeStr}
                        </span>
                      </div>
                    )}

                    {/* Scheduled Blocks */}
                    {blocks.map((block) => {
                      const startMins = timeToMinutes(block.start);
                      const endMins = timeToMinutes(block.end);

                      // Calculate block top and height clamped to grid bounds
                      const clampedStart = Math.max(gridStartMins, Math.min(gridEndMins, startMins));
                      const clampedEnd = Math.max(gridStartMins, Math.min(gridEndMins, endMins));
                      const duration = clampedEnd - clampedStart;
                      if (duration <= 0) return null;

                      const topPx = ((clampedStart - gridStartMins) / 60) * HOUR_HEIGHT;
                      const heightPx = Math.max(24, (duration / 60) * HOUR_HEIGHT - 2);

                      const linkedGoal = goals.find((g) => g.id === block.goalId);
                      const isFixed = block.kind === 'fixed';

                      return (
                        <div
                          key={block.id}
                          onClick={() => onBlockClick(block)}
                          style={{
                            top: `${topPx + 1}px`,
                            height: `${heightPx}px`,
                            borderLeftColor: isFixed
                              ? 'var(--color-hairline-strong)'
                              : linkedGoal?.color || 'var(--color-accent)',
                          }}
                          className={`absolute left-1 right-1 z-10 px-2 py-1 rounded-[var(--radius-xs)] overflow-hidden transition-editorial cursor-pointer border text-left flex flex-col justify-between ${
                            isFixed
                              ? 'bg-[var(--color-paper-muted)] border-hairline text-[var(--color-ink-secondary)] hover:border-[var(--color-hairline-strong)]'
                              : 'bg-[var(--color-paper-surface)] border-hairline text-[var(--color-ink)] hover:border-[var(--color-ink-muted)] shadow-[0_1px_3px_rgba(0,0,0,0.03)]'
                          } ${block.done ? 'opacity-55' : ''} border-l-[3px]`}
                          title={`Click to edit: ${block.title} (${block.start} - ${block.end})`}
                        >
                          <div>
                            <div className="flex items-center justify-between gap-1 leading-tight">
                              <span
                                className={`text-[11px] font-medium truncate ${
                                  block.done ? 'line-through text-[var(--color-ink-muted)]' : ''
                                }`}
                              >
                                {block.title}
                              </span>
                              {isFixed && (
                                <span className="text-[9px] font-mono uppercase px-1 py-0.2 bg-[var(--color-paper)] rounded-[var(--radius-xs)] text-[var(--color-ink-muted)] flex-shrink-0">
                                  Fixed
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] font-mono tabular-nums text-[var(--color-ink-muted)] mt-0.5 truncate">
                              {block.start} — {block.end}
                            </p>
                          </div>

                          {linkedGoal && heightPx > 42 && (
                            <div className="text-[9px] font-mono text-[var(--color-ink-muted)] truncate flex items-center space-x-1 pt-0.5">
                              <span
                                className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                                style={{ backgroundColor: linkedGoal.color }}
                              />
                              <span className="truncate">{linkedGoal.title}</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
