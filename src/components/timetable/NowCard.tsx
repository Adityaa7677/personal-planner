import { useState, useMemo } from 'react';
import type { FC } from 'react';
import {
  CheckCircle2,
  SkipForward,
  Clock,
  Layers,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import type { NowSuggestion, Goal, Subtask } from '../../core/types.js';
import { updateBlock, toggleSubtask, timeToMinutes } from '../../core/actions.js';
import { usePlannerStore } from '../../core/store.js';

interface NowCardProps {
  suggestion: NowSuggestion | null;
  currentTimeStr: string;
  onRefreshSuggestion: () => void;
}

export const NowCard: FC<NowCardProps> = ({
  suggestion,
  currentTimeStr,
  onRefreshSuggestion,
}) => {
  const { goals } = usePlannerStore();
  const [skippedSubtaskIds, setSkippedSubtaskIds] = useState<string[]>([]);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(null), 3000);
  };

  // When skipping, calculate alternative subtasks that fit the current free window
  const activeAlternativeSubtask = useMemo<{ subtask: Subtask; goal: Goal } | null>(() => {
    if (!suggestion || suggestion.type !== 'free_window' || suggestion.minutesFree <= 0) {
      return null;
    }

    // Collect all candidate subtasks that fit and are unfinished
    const candidates: { subtask: Subtask; goal: Goal; deadlineTime: number }[] = [];
    const activeGoals = goals.filter((g) => g.status !== 'archived' && g.status !== 'completed');

    for (const goal of activeGoals) {
      const deadlineTime = new Date(goal.deadline + 'T23:59:59').getTime();
      for (const st of goal.subtasks) {
        if (!st.done && st.estimateMins <= suggestion.minutesFree) {
          candidates.push({ subtask: st, goal, deadlineTime });
        }
      }
    }

    // Sort by deadline
    candidates.sort((a, b) => a.deadlineTime - b.deadlineTime);

    // Filter out already skipped subtasks
    const unskipped = candidates.filter((c) => !skippedSubtaskIds.includes(c.subtask.id));
    if (unskipped.length > 0) {
      return unskipped[0];
    }

    // If all candidates were skipped and we have at least 1 candidate, return null to show cycled state
    return null;
  }, [suggestion, goals, skippedSubtaskIds]);

  // Determine current active item to display
  const isCurrentBlock = suggestion?.type === 'current_block';
  const displayedSubtask = activeAlternativeSubtask
    ? activeAlternativeSubtask.subtask
    : suggestion?.type === 'free_window'
      ? skippedSubtaskIds.includes(suggestion.subtask?.id || '')
        ? null
        : suggestion.subtask
      : null;

  const displayedGoal = activeAlternativeSubtask
    ? activeAlternativeSubtask.goal
    : displayedSubtask && suggestion?.type === 'free_window'
      ? goals.find((g) => g.subtasks.some((s) => s.id === displayedSubtask.id)) || suggestion.goal
      : null;

  // Handle "Done" action
  const handleDone = () => {
    if (isCurrentBlock && suggestion.block) {
      updateBlock(suggestion.block.id, { done: true });
      showNotice(`Marked "${suggestion.block.title}" as completed.`);
      onRefreshSuggestion();
    } else if (displayedSubtask && displayedGoal) {
      toggleSubtask(displayedGoal.id, displayedSubtask.id);
      showNotice(`Completed: "${displayedSubtask.title}"!`);
      // Clear from skip list if present
      setSkippedSubtaskIds((prev) => prev.filter((id) => id !== displayedSubtask.id));
      onRefreshSuggestion();
    }
  };

  // Handle "Skip, suggest another"
  const handleSkip = () => {
    if (isCurrentBlock) {
      showNotice('Active fixed blocks cannot be skipped, but you can mark them done or edit them in the grid.');
    } else if (displayedSubtask) {
      setSkippedSubtaskIds((prev) => [...prev, displayedSubtask.id]);
      showNotice('Skipped. Suggesting next candidate...');
    }
  };

  const handleResetSkips = () => {
    setSkippedSubtaskIds([]);
    showNotice('Reset suggestion queue.');
  };

  // Calculate elapsed and remaining minutes for an active block
  const blockTimeInfo = useMemo(() => {
    if (!isCurrentBlock || !suggestion?.block) return null;
    const nowMins = timeToMinutes(currentTimeStr);
    const startMins = timeToMinutes(suggestion.block.start);
    const endMins = timeToMinutes(suggestion.block.end);
    const totalDuration = endMins - startMins;
    const remaining = Math.max(0, endMins - nowMins);
    const elapsed = Math.max(0, nowMins - startMins);
    return { remaining, elapsed, totalDuration };
  }, [isCurrentBlock, suggestion, currentTimeStr]);

  if (!suggestion) {
    return (
      <div className="p-6 bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-sm)] text-center text-xs text-[var(--color-ink-muted)] font-mono">
        Evaluating schedule timeline…
      </div>
    );
  }

  return (
    <section
      aria-label="Current Activity Focus"
      className="relative mb-6 p-6 sm:p-7 bg-[var(--color-paper-surface)] border border-hairline rounded-[var(--radius-sm)] shadow-[0_1px_3px_rgba(0,0,0,0.03)] border-l-[4px] border-l-[var(--color-accent)] transition-editorial"
    >
      {/* Top Meta Bar: Status Pill & Tabular Time */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-hairline">
        <div className="flex items-center space-x-2.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--color-accent)] opacity-60"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--color-accent)]"></span>
          </span>
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--color-accent)] font-medium">
            {isCurrentBlock ? 'Current Scheduled Block' : 'Open Focus Window • Suggested Activity'}
          </span>
        </div>

        <div className="flex items-center space-x-3 text-xs font-mono tabular-nums text-[var(--color-ink-secondary)]">
          <span className="flex items-center space-x-1.5">
            <Clock className="w-3.5 h-3.5 stroke-[1.5] text-[var(--color-ink-muted)]" />
            <span>Now: {currentTimeStr}</span>
          </span>
          {feedbackNotice && (
            <span className="px-2 py-0.5 rounded-[var(--radius-xs)] bg-[var(--color-paper-muted)] text-[var(--color-accent)] font-mono text-[11px] animate-fadeIn">
              {feedbackNotice}
            </span>
          )}
        </div>
      </div>

      {/* Main Hero Card Body */}
      {isCurrentBlock ? (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-[var(--color-ink-muted)]">
              <span className="uppercase tracking-wider px-1.5 py-0.5 bg-[var(--color-paper-muted)] rounded-[var(--radius-xs)] border border-hairline">
                {suggestion.block.kind}
              </span>
              <span>•</span>
              <span className="tabular-nums">
                {suggestion.block.start} — {suggestion.block.end}
              </span>
            </div>

            <h2 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] font-normal tracking-tight">
              {suggestion.block.title}
            </h2>

            {/* Duration metrics */}
            <p className="text-xs sm:text-sm text-[var(--color-ink-secondary)] font-mono tabular-nums flex items-center space-x-2">
              <span>{blockTimeInfo ? `${blockTimeInfo.remaining}m remaining` : ''}</span>
              <span>•</span>
              <span>Total: {blockTimeInfo?.totalDuration} mins</span>
              {suggestion.block.done && (
                <span className="text-green-700 dark:text-green-500 font-medium">
                  (Completed)
                </span>
              )}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2 lg:pt-0">
            <button
              onClick={handleDone}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-accent-contrast)] text-xs font-mono tracking-wider uppercase rounded-[var(--radius-xs)] transition-editorial cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
              <span>Mark Done</span>
            </button>
            <button
              onClick={handleSkip}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 border border-hairline bg-[var(--color-paper)] hover:bg-[var(--color-paper-muted)] text-[var(--color-ink-secondary)] text-xs font-mono tracking-wider uppercase rounded-[var(--radius-xs)] transition-editorial cursor-pointer"
            >
              <SkipForward className="w-4 h-4 stroke-[1.5]" />
              <span>Skip</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex-1 space-y-2">
            {/* Free Window Duration Pill */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[var(--color-ink-muted)]">
              <span className="tabular-nums px-2 py-0.5 bg-[var(--color-paper-muted)] rounded-[var(--radius-xs)] text-[var(--color-ink)] font-medium border border-hairline">
                {suggestion.minutesFree} minutes free
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1 tabular-nums text-[var(--color-ink-secondary)]">
                <ArrowRight className="w-3.5 h-3.5 stroke-[1.5] text-[var(--color-accent)]" />
                <span>
                  {suggestion.nextBlockStart
                    ? `Next block at ${suggestion.nextBlockStart}`
                    : 'No subsequent blocks today'}
                </span>
              </span>
            </div>

            {/* Suggested Subtask Title */}
            {displayedSubtask ? (
              <>
                <h2 className="font-serif text-2xl sm:text-3xl text-[var(--color-ink)] font-normal tracking-tight">
                  {displayedSubtask.title}
                </h2>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono">
                  <span className="tabular-nums text-[var(--color-ink-secondary)]">
                    Estimate: {displayedSubtask.estimateMins} minutes
                  </span>
                  {displayedGoal && (
                    <span
                      className="inline-flex items-center space-x-1.5 px-2 py-0.5 rounded-[var(--radius-xs)] border border-hairline text-[11px]"
                      style={{
                        backgroundColor: 'var(--color-paper-muted)',
                        borderLeftColor: displayedGoal.color,
                        borderLeftWidth: '3px',
                      }}
                    >
                      <Layers className="w-3 h-3 stroke-[1.5]" />
                      <span className="text-[var(--color-ink)]">{displayedGoal.title}</span>
                      <span className="text-[var(--color-ink-muted)] tabular-nums">
                        (Due: {displayedGoal.deadline})
                      </span>
                    </span>
                  )}
                </div>
              </>
            ) : (
              <div className="py-1">
                <h2 className="font-serif text-2xl text-[var(--color-ink)] font-normal">
                  Open Desk Time
                </h2>
                <p className="text-xs text-[var(--color-ink-muted)] font-mono mt-1">
                  {skippedSubtaskIds.length > 0
                    ? 'All fitting candidates in this window have been skipped.'
                    : 'No pending subtask fits within this window duration.'}
                </p>
                {skippedSubtaskIds.length > 0 && (
                  <button
                    onClick={handleResetSkips}
                    className="mt-2 inline-flex items-center space-x-1.5 text-xs text-[var(--color-accent)] font-mono hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3 stroke-[1.5]" />
                    <span>Reset skipped suggestions</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2 lg:pt-0">
            {displayedSubtask && (
              <button
                onClick={handleDone}
                className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[var(--color-accent)] hover:opacity-90 text-[var(--color-accent-contrast)] text-xs font-mono tracking-wider uppercase rounded-[var(--radius-xs)] transition-editorial cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 stroke-[1.5]" />
                <span>Done</span>
              </button>
            )}

            <button
              onClick={handleSkip}
              disabled={!displayedSubtask}
              className="inline-flex items-center space-x-2 px-3.5 py-2.5 border border-hairline bg-[var(--color-paper)] hover:bg-[var(--color-paper-muted)] disabled:opacity-40 disabled:cursor-not-allowed text-[var(--color-ink-secondary)] text-xs font-mono tracking-wider uppercase rounded-[var(--radius-xs)] transition-editorial cursor-pointer"
            >
              <SkipForward className="w-4 h-4 stroke-[1.5]" />
              <span>Skip, suggest another</span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
