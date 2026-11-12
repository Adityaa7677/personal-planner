import type { FC } from 'react';
import { BookOpen, Layers, CheckCircle2, Circle, Clock, Sparkles, ChevronLeft } from 'lucide-react';
import type { Goal } from '../../core/types.js';

interface GoalsSidebarProps {
  isOpen: boolean;
  goals: Goal[];
  onClose: () => void;
}

export const GoalsSidebar: FC<GoalsSidebarProps> = ({
  isOpen,
  goals,
  onClose,
}) => {
  return (
    <aside
      aria-label="Goals Ledger Panel"
      className={`relative h-full flex-shrink-0 border-r border-hairline bg-[var(--color-paper-wash)] transition-all duration-[200ms] ease-out flex flex-col z-20 ${
        isOpen ? 'w-72 sm:w-80 opacity-100' : 'w-0 opacity-0 overflow-hidden border-r-0 pointer-events-none'
      }`}
    >
      <div className="w-72 sm:w-80 flex flex-col h-full overflow-hidden">
        {/* Panel Header */}
        <header className="px-5 py-4 border-b border-hairline flex items-center justify-between bg-[var(--color-paper-surface)]">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 stroke-[1.5] text-[var(--color-accent)]" />
            <div>
              <h2 className="font-serif text-lg text-[var(--color-ink)] font-normal tracking-tight">
                Goals Ledger
              </h2>
              <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink-muted)]">
                Active Priorities
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-1.5">
            <span className="px-2 py-0.5 text-[10px] font-mono rounded-[var(--radius-xs)] bg-[var(--color-paper-muted)] text-[var(--color-accent)] border border-hairline">
              Coming Next
            </span>
            <button
              type="button"
              onClick={onClose}
              aria-label="Collapse panel"
              className="p-1 rounded-[var(--radius-xs)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-editorial cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 stroke-[1.5]" />
            </button>
          </div>
        </header>

        {/* Empty state line & registered goals preview */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="p-3.5 bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-xs)] text-xs font-mono text-[var(--color-ink-secondary)] leading-relaxed">
            <p className="text-[var(--color-ink)] font-medium mb-1 flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[var(--color-accent)] stroke-[1.5]" />
              <span>Goals Region Reserved</span>
            </p>
            <p className="text-[11px] text-[var(--color-ink-muted)]">
              This space will house the interactive goal management system, milestone checkmarks, and dynamic subtask allocation.
            </p>
          </div>

          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-2 flex items-center space-x-1.5">
              <Layers className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Registered Goals ({goals.length})</span>
            </h3>

            <div className="space-y-3">
              {goals.map((goal) => (
                <div
                  key={goal.id}
                  className="p-3 bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-xs)] transition-editorial"
                  style={{
                    borderLeftColor: goal.color,
                    borderLeftWidth: '3px',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-medium text-[var(--color-ink)] leading-snug">
                      {goal.title}
                    </h4>
                    <span className="text-[10px] font-mono uppercase px-1 py-0.2 rounded-[var(--radius-xs)] bg-[var(--color-paper-muted)] text-[var(--color-ink-muted)] border border-hairline">
                      {goal.type}
                    </span>
                  </div>

                  <p className="text-[11px] font-mono tabular-nums text-[var(--color-ink-muted)] mt-1.5 flex items-center space-x-1">
                    <Clock className="w-3 h-3 stroke-[1.5]" />
                    <span>Due: {goal.deadline}</span>
                  </p>

                  {/* Subtasks summary */}
                  <div className="mt-2.5 pt-2 border-t border-hairline space-y-1.5">
                    {goal.subtasks.map((st) => (
                      <div
                        key={st.id}
                        className="flex items-center justify-between text-[11px] font-mono text-[var(--color-ink-secondary)]"
                      >
                        <span className="flex items-center space-x-1.5 truncate pr-2">
                          {st.done ? (
                            <CheckCircle2 className="w-3 h-3 text-green-700 dark:text-green-500 stroke-[1.5] flex-shrink-0" />
                          ) : (
                            <Circle className="w-3 h-3 text-[var(--color-ink-muted)] stroke-[1.5] flex-shrink-0" />
                          )}
                          <span className={st.done ? 'line-through text-[var(--color-ink-faint)]' : ''}>
                            {st.title}
                          </span>
                        </span>
                        <span className="tabular-nums text-[var(--color-ink-muted)] flex-shrink-0">
                          {st.estimateMins}m
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
