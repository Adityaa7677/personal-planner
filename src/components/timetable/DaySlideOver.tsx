import { useState } from 'react';
import type { FC } from 'react';
import {
  X,
  Plus,
  Clock,
  Trash2,
  Edit2,
  CheckCircle2,
  Circle,
  FileText,
  Calendar,
} from 'lucide-react';
import type { Block, Goal, BlockKind } from '../../core/types.js';
import {
  getBlocksForDate,
  addBlock,
  updateBlock,
  deleteBlock,
} from '../../core/actions.js';
import { getDayNote, saveDayNote } from '../../core/dayNotes.js';

interface DaySlideOverProps {
  date: string | null; // YYYY-MM-DD
  goals: Goal[];
  isOpen: boolean;
  onClose: () => void;
  onBlockSelectedForEdit: (block: Block) => void;
  onScheduleChanged: () => void;
}

export const DaySlideOver: FC<DaySlideOverProps> = ({
  date,
  goals,
  isOpen,
  onClose,
  onBlockSelectedForEdit,
  onScheduleChanged,
}) => {
  const [dayNote, setDayNote] = useState(() => (date ? getDayNote(date) : ''));
  const [isNoteSavedNotice, setIsNoteSavedNotice] = useState(false);

  // New Block Form State
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newStart, setNewStart] = useState('09:00');
  const [newEnd, setNewEnd] = useState('10:30');
  const [newKind, setNewKind] = useState<BlockKind>('flexible');
  const [newGoalId, setNewGoalId] = useState('');

  // Handle day note change with auto-save
  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setDayNote(val);
    if (date) {
      saveDayNote(date, val);
      setIsNoteSavedNotice(true);
      setTimeout(() => setIsNoteSavedNotice(false), 2000);
    }
  };

  if (!isOpen || !date) return null;

  // Format date for header
  const [y, m, d] = date.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  const formattedFullDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(dateObj);

  const blocksToday = getBlocksForDate(date);

  const handleCreateBlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addBlock({
      date,
      start: newStart,
      end: newEnd,
      title: newTitle.trim(),
      kind: newKind,
      goalId: newGoalId || undefined,
      done: false,
    });

    setNewTitle('');
    setIsAddingBlock(false);
    onScheduleChanged();
  };

  const handleToggleBlockDone = (b: Block) => {
    updateBlock(b.id, { done: !b.done });
    onScheduleChanged();
  };

  const handleDeleteBlock = (id: string) => {
    deleteBlock(id);
    onScheduleChanged();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-40 flex justify-end bg-black/30 backdrop-blur-[1px] transition-editorial"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-[var(--color-paper-surface)] h-full border-l border-hairline flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.06)] overflow-hidden transition-editorial"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent Top Ribbon */}
        <div className="h-[2px] w-full bg-[var(--color-accent)]" />

        {/* Panel Header */}
        <header className="px-6 py-5 border-b border-hairline flex items-start justify-between bg-[var(--color-paper-wash)]">
          <div>
            <div className="flex items-center space-x-2 text-[11px] font-mono uppercase tracking-widest text-[var(--color-accent)] mb-1">
              <Calendar className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>Day Planner Sheet</span>
            </div>
            <h2 className="font-serif text-2xl text-[var(--color-ink)] font-normal tracking-tight">
              {formattedFullDate}
            </h2>
          </div>

          <button
            onClick={onClose}
            aria-label="Close day panel"
            className="p-1.5 rounded-[var(--radius-xs)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-editorial cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-7">
          {/* Section 1: Daily Focus & Intention */}
          <section>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center space-x-1.5 text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)]">
                <FileText className="w-3.5 h-3.5 stroke-[1.5] text-[var(--color-accent)]" />
                <span>Day Intention & Notes</span>
              </label>
              <span className="text-[10px] font-mono text-[var(--color-ink-muted)]">
                {isNoteSavedNotice ? 'Saved to ledger' : 'Auto-saves'}
              </span>
            </div>
            <textarea
              value={dayNote}
              onChange={handleNoteChange}
              rows={3}
              placeholder="What are the essential priorities, mindset, or commitments for this day?"
              className="w-full px-3.5 py-2.5 text-sm bg-[var(--color-paper)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] placeholder-[var(--color-ink-muted)] focus:outline-none focus:border-[var(--color-accent)] transition-editorial resize-none font-sans"
            />
          </section>

          {/* Section 2: Time Blocks Scheduled For Today */}
          <section>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-hairline">
              <div className="flex items-center space-x-2">
                <Clock className="w-3.5 h-3.5 stroke-[1.5] text-[var(--color-ink-secondary)]" />
                <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)]">
                  Scheduled Blocks ({blocksToday.length})
                </h3>
              </div>

              {!isAddingBlock && (
                <button
                  onClick={() => setIsAddingBlock(true)}
                  className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-mono text-[var(--color-accent)] hover:bg-[var(--color-paper-muted)] rounded-[var(--radius-xs)] border border-hairline transition-editorial cursor-pointer"
                >
                  <Plus className="w-3 h-3 stroke-[1.5]" />
                  <span>Add Block</span>
                </button>
              )}
            </div>

            {/* Blocks List */}
            {blocksToday.length === 0 ? (
              <div className="py-6 px-4 bg-[var(--color-paper)] border border-hairline rounded-[var(--radius-xs)] text-center">
                <p className="text-xs text-[var(--color-ink-muted)] font-mono">
                  No blocks scheduled for this day yet.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {blocksToday.map((b) => {
                  const linkedGoal = goals.find((g) => g.id === b.goalId);
                  const isFixed = b.kind === 'fixed';

                  return (
                    <div
                      key={b.id}
                      className={`p-3 rounded-[var(--radius-xs)] border transition-editorial flex items-start justify-between gap-3 ${
                        isFixed
                          ? 'bg-[var(--color-paper-muted)] border-hairline text-[var(--color-ink-secondary)]'
                          : 'bg-[var(--color-paper)] border-hairline text-[var(--color-ink)]'
                      } ${b.done ? 'opacity-60' : ''}`}
                    >
                      <div className="flex items-start space-x-2.5 flex-1 min-w-0">
                        {/* Checkbox toggle */}
                        <button
                          onClick={() => handleToggleBlockDone(b)}
                          aria-label={b.done ? 'Mark incomplete' : 'Mark complete'}
                          className="mt-0.5 text-[var(--color-ink-muted)] hover:text-[var(--color-accent)] transition-editorial cursor-pointer flex-shrink-0"
                        >
                          {b.done ? (
                            <CheckCircle2 className="w-4 h-4 text-green-700 dark:text-green-500 stroke-[1.5]" />
                          ) : (
                            <Circle className="w-4 h-4 stroke-[1.5]" />
                          )}
                        </button>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-baseline space-x-2">
                            <span
                              className={`text-sm font-medium leading-tight truncate ${
                                b.done ? 'line-through text-[var(--color-ink-muted)]' : ''
                              }`}
                            >
                              {b.title}
                            </span>
                            <span className="text-[10px] font-mono uppercase tracking-wider px-1 py-0.2 rounded-[var(--radius-xs)] bg-[var(--color-paper-surface)] border border-hairline text-[var(--color-ink-muted)]">
                              {b.kind}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs font-mono tabular-nums text-[var(--color-ink-muted)]">
                            <span>
                              {b.start} — {b.end}
                            </span>
                            {linkedGoal && (
                              <span
                                className="inline-flex items-center px-1.5 py-0.2 rounded-[var(--radius-xs)] text-[10px]"
                                style={{
                                  borderLeft: `2.5px solid ${linkedGoal.color}`,
                                }}
                              >
                                {linkedGoal.title}
                              </span>
                            )}
                            {b.recurrence && (
                              <span className="text-[10px] italic">
                                (Recurring {b.recurrence.frequency})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex items-center space-x-1 flex-shrink-0">
                        <button
                          onClick={() => onBlockSelectedForEdit(b)}
                          title="Edit Block"
                          className="p-1 rounded-[var(--radius-xs)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-surface)] transition-editorial cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                        <button
                          onClick={() => handleDeleteBlock(b.id)}
                          title="Delete Block"
                          className="p-1 rounded-[var(--radius-xs)] text-[var(--color-ink-muted)] hover:text-red-700 hover:bg-[var(--color-paper-surface)] transition-editorial cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Section 3: Add Block Form (Expandable) */}
          {isAddingBlock && (
            <section className="p-4 bg-[var(--color-paper-muted)] border border-hairline rounded-[var(--radius-sm)] transition-editorial">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-hairline">
                <h4 className="font-serif text-base text-[var(--color-ink)] font-normal">
                  Add Time Block to {formattedFullDate.split(',')[0]}
                </h4>
                <button
                  type="button"
                  onClick={() => setIsAddingBlock(false)}
                  className="text-xs text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] font-mono cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              <form onSubmit={handleCreateBlock} className="space-y-3">
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Focus Sprint on Algorithms"
                    className="w-full px-3 py-1.5 text-xs bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] font-sans"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono tabular-nums bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
                      End Time
                    </label>
                    <input
                      type="time"
                      required
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono tabular-nums bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
                      Nature
                    </label>
                    <select
                      value={newKind}
                      onChange={(e) => setNewKind(e.target.value as BlockKind)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="flexible">Flexible</option>
                      <option value="fixed">Fixed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
                      Link Goal
                    </label>
                    <select
                      value={newGoalId}
                      onChange={(e) => setNewGoalId(e.target.value)}
                      className="w-full px-2 py-1.5 text-xs font-mono bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)]"
                    >
                      <option value="">None</option>
                      {goals.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="submit"
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-[var(--color-accent)] text-white text-xs font-mono uppercase tracking-wider rounded-[var(--radius-xs)] hover:opacity-90 transition-editorial cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 stroke-[1.5]" />
                    <span>Create Block</span>
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
