import { useState } from 'react';
import type { FC } from 'react';
import { X, Trash2, Check, Clock, Bookmark, Layers } from 'lucide-react';
import type { Block, Goal, BlockKind } from '../../core/types.js';
import { updateBlock, deleteBlock } from '../../core/actions.js';

interface BlockEditModalProps {
  block: Block | null;
  goals: Goal[];
  isOpen: boolean;
  onClose: () => void;
  onSaved?: () => void;
}

export const BlockEditModal: FC<BlockEditModalProps> = ({
  block,
  goals,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [title, setTitle] = useState(() => block?.title || '');
  const [start, setStart] = useState(() => block?.start || '09:00');
  const [end, setEnd] = useState(() => block?.end || '10:00');
  const [kind, setKind] = useState<BlockKind>(() => block?.kind || 'flexible');
  const [goalId, setGoalId] = useState<string>(() => block?.goalId || '');
  const [done, setDone] = useState(() => block?.done || false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!isOpen || !block) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    updateBlock(block.id, {
      title: title.trim(),
      start,
      end,
      kind,
      goalId: goalId || undefined,
      done,
    });

    onSaved?.();
    onClose();
  };

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    deleteBlock(block.id);
    onSaved?.();
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px] transition-editorial"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-sm)] shadow-[0_4px_16px_rgba(0,0,0,0.08)] overflow-hidden transition-editorial"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent top stripe */}
        <div className="h-[2px] w-full bg-[var(--color-accent)]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-hairline">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-widest text-[var(--color-ink-muted)]">
              Schedule Entry
            </span>
            <h3 className="font-serif text-xl text-[var(--color-ink)] font-normal">
              Edit Time Block
            </h3>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1 rounded-[var(--radius-xs)] text-[var(--color-ink-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-paper-muted)] transition-editorial cursor-pointer"
          >
            <X className="w-4 h-4 stroke-[1.5]" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Systems Programming Lab"
              className="w-full px-3 py-2 text-sm bg-[var(--color-paper)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] transition-editorial font-sans"
            />
          </div>

          {/* Time Gutter Inputs */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
                Start Time
              </label>
              <div className="relative flex items-center">
                <Clock className="w-3.5 h-3.5 absolute left-2.5 text-[var(--color-ink-muted)] pointer-events-none stroke-[1.5]" />
                <input
                  type="time"
                  required
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono tabular-nums bg-[var(--color-paper)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] transition-editorial"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
                End Time
              </label>
              <div className="relative flex items-center">
                <Clock className="w-3.5 h-3.5 absolute left-2.5 text-[var(--color-ink-muted)] pointer-events-none stroke-[1.5]" />
                <input
                  type="time"
                  required
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs font-mono tabular-nums bg-[var(--color-paper)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] transition-editorial"
                />
              </div>
            </div>
          </div>

          {/* Kind Selector (Fixed vs Flexible) */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1.5">
              Block Nature
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setKind('flexible')}
                className={`px-3 py-2 text-xs font-mono rounded-[var(--radius-xs)] border transition-editorial flex items-center justify-center space-x-1.5 cursor-pointer ${
                  kind === 'flexible'
                    ? 'bg-[var(--color-paper-muted)] text-[var(--color-ink)] border-[var(--color-ink)] font-medium'
                    : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] border-hairline hover:bg-[var(--color-paper-muted)]'
                }`}
              >
                <Bookmark className="w-3 h-3 stroke-[1.5]" />
                <span>Flexible (Active)</span>
              </button>
              <button
                type="button"
                onClick={() => setKind('fixed')}
                className={`px-3 py-2 text-xs font-mono rounded-[var(--radius-xs)] border transition-editorial flex items-center justify-center space-x-1.5 cursor-pointer ${
                  kind === 'fixed'
                    ? 'bg-[var(--color-paper-muted)] text-[var(--color-ink)] border-[var(--color-ink)] font-medium'
                    : 'bg-[var(--color-paper)] text-[var(--color-ink-muted)] border-hairline hover:bg-[var(--color-paper-muted)]'
                }`}
              >
                <Layers className="w-3 h-3 stroke-[1.5]" />
                <span>Fixed (Quiet)</span>
              </button>
            </div>
            <p className="mt-1 text-[11px] text-[var(--color-ink-muted)] font-mono">
              {kind === 'fixed'
                ? 'Unmovable obligation (e.g. college or commute). Rendered in quiet tones.'
                : 'Intentional work window tied to priorities.'}
            </p>
          </div>

          {/* Linked Goal Selector */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] mb-1">
              Link to Goal (Optional)
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="w-full px-3 py-2 text-xs font-mono bg-[var(--color-paper)] border border-hairline rounded-[var(--radius-xs)] text-[var(--color-ink)] focus:outline-none focus:border-[var(--color-accent)] transition-editorial"
            >
              <option value="">None (Independent Block)</option>
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.title} ({g.type})
                </option>
              ))}
            </select>
          </div>

          {/* Completion Checkbox */}
          <div className="pt-2">
            <label className="inline-flex items-center space-x-2 text-xs font-mono text-[var(--color-ink)] cursor-pointer">
              <input
                type="checkbox"
                checked={done}
                onChange={(e) => setDone(e.target.checked)}
                className="rounded-[var(--radius-xs)] border-hairline text-[var(--color-accent)] focus:ring-0"
              />
              <span>Mark this block as completed</span>
            </label>
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-hairline flex items-center justify-between">
            <button
              type="button"
              onClick={handleDelete}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-mono rounded-[var(--radius-xs)] border transition-editorial cursor-pointer ${
                confirmDelete
                  ? 'bg-red-800 text-white border-red-800'
                  : 'text-red-700 dark:text-red-400 border-transparent hover:bg-[var(--color-paper-muted)]'
              }`}
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[1.5]" />
              <span>{confirmDelete ? 'Confirm Delete' : 'Delete'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-mono uppercase tracking-wider text-[var(--color-ink-secondary)] hover:bg-[var(--color-paper-muted)] rounded-[var(--radius-xs)] transition-editorial cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[var(--color-ink)] text-[var(--color-paper)] text-xs font-mono uppercase tracking-wider rounded-[var(--radius-xs)] hover:opacity-90 transition-editorial cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[1.5]" />
                <span>Save</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
