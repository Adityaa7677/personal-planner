/**
 * ChronoPaper Core Domain Logic & AI Assistant Tool Actions
 * Pure functions with zero UI code.
 * Each function is documented with JSDocs so AI agents and tool registries
 * can execute them seamlessly.
 */

import type {
  Goal,
  Subtask,
  Block,
  FreeWindow,
  NowSuggestion,
  DayOfWeek,
} from './types.js';
import { getPlannerSnapshot, commitPlannerState } from './store.js';

// ==========================================
// Time & Date Calculation Helpers
// ==========================================

/**
 * Converts a 24-hour time string ("HH:MM") to the number of minutes from midnight.
 * Special case: "24:00" is converted to 1440.
 */
export function timeToMinutes(timeStr: string): number {
  if (timeStr === '24:00') return 1440;
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/**
 * Converts minutes from midnight into a zero-padded "HH:MM" string.
 * Special case: 1440 is converted to "24:00".
 */
export function minutesToTime(mins: number): string {
  if (mins >= 1440) return '24:00';
  const clamped = Math.max(0, mins);
  const h = Math.floor(clamped / 60);
  const m = clamped % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

/**
 * Extracts local DayOfWeek (0=Sun..6=Sat) safely from a YYYY-MM-DD string without UTC offset bugs.
 */
export function getDayOfWeekFromDateString(dateStr: string): DayOfWeek {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  return dateObj.getDay() as DayOfWeek;
}

/**
 * Generates a clean unique identifier for goals, subtasks, and blocks.
 */
export function generateId(prefix: string): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

// ==========================================
// Goal Management Actions
// ==========================================

/**
 * Creates and registers a new Goal in the planner.
 *
 * @param goalData - The goal definition without ID (or with an explicit ID).
 * @returns The newly created Goal with a unique ID and initialized subtasks.
 */
export function addGoal(goalData: Omit<Goal, 'id'> & { id?: string }): Goal {
  const { goals } = getPlannerSnapshot();
  const newGoal: Goal = {
    ...goalData,
    id: goalData.id || generateId('goal'),
    subtasks: goalData.subtasks || [],
  };

  commitPlannerState({ goals: [...goals, newGoal] });
  return newGoal;
}

/**
 * Updates an existing Goal by its unique ID.
 *
 * @param id - The unique ID of the goal to update.
 * @param updates - Partial goal fields to update (title, type, deadline, color, status).
 * @returns The updated Goal.
 * @throws Error if no goal with the given ID exists.
 */
export function updateGoal(id: string, updates: Partial<Omit<Goal, 'id'>>): Goal {
  const { goals } = getPlannerSnapshot();
  const index = goals.findIndex((g) => g.id === id);
  if (index === -1) {
    throw new Error(`Goal with ID "${id}" was not found.`);
  }

  const updatedGoal: Goal = {
    ...goals[index],
    ...updates,
  };

  const nextGoals = [...goals];
  nextGoals[index] = updatedGoal;
  commitPlannerState({ goals: nextGoals });
  return updatedGoal;
}

/**
 * Deletes a Goal and unlinks any related flexible blocks.
 *
 * @param id - The unique ID of the goal to remove.
 */
export function deleteGoal(id: string): void {
  const { goals, blocks } = getPlannerSnapshot();
  const nextGoals = goals.filter((g) => g.id !== id);
  const nextBlocks = blocks.map((b) => (b.goalId === id ? { ...b, goalId: undefined, subtaskId: undefined } : b));

  commitPlannerState({ goals: nextGoals, blocks: nextBlocks });
}

// ==========================================
// Subtask Management Actions
// ==========================================

/**
 * Appends a new subtask to a specified parent Goal.
 *
 * @param goalId - The unique ID of the parent Goal.
 * @param subtaskData - The subtask properties (title, estimateMins, optional done state).
 * @returns The created Subtask.
 * @throws Error if parent goal is not found.
 */
export function addSubtask(
  goalId: string,
  subtaskData: Omit<Subtask, 'id' | 'done'> & { id?: string; done?: boolean }
): Subtask {
  const { goals } = getPlannerSnapshot();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) {
    throw new Error(`Cannot add subtask: Goal with ID "${goalId}" does not exist.`);
  }

  const newSubtask: Subtask = {
    ...subtaskData,
    id: subtaskData.id || generateId('subtask'),
    done: subtaskData.done ?? false,
  };

  const updatedGoal: Goal = {
    ...goal,
    subtasks: [...goal.subtasks, newSubtask],
  };

  const nextGoals = goals.map((g) => (g.id === goalId ? updatedGoal : g));
  commitPlannerState({ goals: nextGoals });
  return newSubtask;
}

/**
 * Toggles the completion status of a subtask within a Goal.
 *
 * @param goalId - The unique ID of the parent Goal.
 * @param subtaskId - The unique ID of the subtask to toggle.
 * @returns The updated Subtask.
 * @throws Error if the goal or subtask is not found.
 */
export function toggleSubtask(goalId: string, subtaskId: string): Subtask {
  const { goals } = getPlannerSnapshot();
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) {
    throw new Error(`Cannot toggle subtask: Goal with ID "${goalId}" does not exist.`);
  }

  const subtaskIndex = goal.subtasks.findIndex((s) => s.id === subtaskId);
  if (subtaskIndex === -1) {
    throw new Error(`Subtask with ID "${subtaskId}" was not found in Goal "${goalId}".`);
  }

  const currentSubtask = goal.subtasks[subtaskIndex];
  const updatedSubtask: Subtask = {
    ...currentSubtask,
    done: !currentSubtask.done,
  };

  const nextSubtasks = [...goal.subtasks];
  nextSubtasks[subtaskIndex] = updatedSubtask;

  const nextGoals = goals.map((g) => (g.id === goalId ? { ...goal, subtasks: nextSubtasks } : g));
  commitPlannerState({ goals: nextGoals });
  return updatedSubtask;
}

// ==========================================
// Block Management Actions
// ==========================================

/**
 * Creates and schedules a new time block.
 *
 * @param blockData - The block configuration (start, end, title, kind, optional recurrence).
 * @returns The newly created Block.
 */
export function addBlock(blockData: Omit<Block, 'id'> & { id?: string }): Block {
  const { blocks } = getPlannerSnapshot();
  const newBlock: Block = {
    ...blockData,
    id: blockData.id || generateId('block'),
    done: blockData.done ?? false,
  };

  commitPlannerState({ blocks: [...blocks, newBlock] });
  return newBlock;
}

/**
 * Updates an existing time block by its unique ID.
 *
 * @param id - The unique ID of the block to update.
 * @param updates - Fields to modify.
 * @returns The updated Block.
 * @throws Error if block is not found.
 */
export function updateBlock(id: string, updates: Partial<Omit<Block, 'id'>>): Block {
  const { blocks } = getPlannerSnapshot();
  const index = blocks.findIndex((b) => b.id === id);
  if (index === -1) {
    throw new Error(`Block with ID "${id}" was not found.`);
  }

  const updatedBlock: Block = {
    ...blocks[index],
    ...updates,
  };

  const nextBlocks = [...blocks];
  nextBlocks[index] = updatedBlock;
  commitPlannerState({ blocks: nextBlocks });
  return updatedBlock;
}

/**
 * Deletes a time block by its unique ID.
 *
 * @param id - The unique ID of the block to delete.
 */
export function deleteBlock(id: string): void {
  const { blocks } = getPlannerSnapshot();
  const nextBlocks = blocks.filter((b) => b.id !== id);
  commitPlannerState({ blocks: nextBlocks });
}

// ==========================================
// Query & Scheduling Engine Actions
// ==========================================

/**
 * Retrieves all blocks that occur on a specific date (YYYY-MM-DD),
 * including one-off blocks and recurring blocks matching the date's day of week.
 * The results are sorted chronologically by start time.
 *
 * @param date - The target date in ISO format (YYYY-MM-DD).
 * @param explicitBlocks - Optional array of blocks to search within (defaults to active store state).
 * @returns Chronologically sorted array of active blocks for that date.
 */
export function getBlocksForDate(date: string, explicitBlocks?: Block[]): Block[] {
  const allBlocks = explicitBlocks ?? getPlannerSnapshot().blocks;
  const targetDayOfWeek = getDayOfWeekFromDateString(date);

  const matched = allBlocks.filter((block) => {
    // 1. One-off block scheduled on this exact date
    if (block.date === date && !block.recurrence) {
      return true;
    }

    // 2. Recurring block
    if (block.recurrence) {
      const { daysOfWeek, startDate, endDate } = block.recurrence;
      if (startDate && date < startDate) return false;
      if (endDate && date > endDate) return false;
      return daysOfWeek.includes(targetDayOfWeek);
    }

    return false;
  });

  // Sort chronologically by start time
  return matched.sort((a, b) => timeToMinutes(a.start) - timeToMinutes(b.start));
}

/**
 * Computes all free time gaps (unallocated windows) between blocks on a given date.
 * Automatically merges overlapping or contiguous blocks before computing the free gaps.
 *
 * @param date - The target date in ISO format (YYYY-MM-DD).
 * @param options - Optional configuration for custom blocks, dayStart (default "00:00") and dayEnd (default "24:00").
 * @returns Array of FreeWindow objects sorted chronologically.
 */
export function getFreeWindows(
  date: string,
  options?: {
    blocks?: Block[];
    dayStart?: string;
    dayEnd?: string;
  }
): FreeWindow[] {
  const dayStart = options?.dayStart ?? '00:00';
  const dayEnd = options?.dayEnd ?? '24:00';

  const dayStartMins = timeToMinutes(dayStart);
  const dayEndMins = timeToMinutes(dayEnd);

  if (dayEndMins <= dayStartMins) {
    return [];
  }

  const blocks = getBlocksForDate(date, options?.blocks);

  // If no blocks are scheduled today, the entire day is one free window
  if (blocks.length === 0) {
    return [
      {
        start: dayStart,
        end: dayEnd,
        durationMins: dayEndMins - dayStartMins,
      },
    ];
  }

  // Convert blocks to interval ranges in minutes and clamp to day bounds
  const intervals: { start: number; end: number }[] = [];
  for (const b of blocks) {
    const s = Math.max(dayStartMins, Math.min(dayEndMins, timeToMinutes(b.start)));
    const e = Math.max(dayStartMins, Math.min(dayEndMins, timeToMinutes(b.end)));
    if (e > s) {
      intervals.push({ start: s, end: e });
    }
  }

  if (intervals.length === 0) {
    return [
      {
        start: dayStart,
        end: dayEnd,
        durationMins: dayEndMins - dayStartMins,
      },
    ];
  }

  // Sort intervals by start time
  intervals.sort((a, b) => a.start - b.start);

  // Merge overlapping and touching intervals
  const merged: { start: number; end: number }[] = [];
  let current = { ...intervals[0] };

  for (let i = 1; i < intervals.length; i++) {
    const next = intervals[i];
    if (next.start <= current.end) {
      current.end = Math.max(current.end, next.end);
    } else {
      merged.push(current);
      current = { ...next };
    }
  }
  merged.push(current);

  // Calculate gaps between intervals and day bounds
  const windows: FreeWindow[] = [];

  // Gap before the first block
  if (merged[0].start > dayStartMins) {
    windows.push({
      start: minutesToTime(dayStartMins),
      end: minutesToTime(merged[0].start),
      durationMins: merged[0].start - dayStartMins,
    });
  }

  // Gaps between consecutive blocks
  for (let i = 0; i < merged.length - 1; i++) {
    const gapStart = merged[i].end;
    const gapEnd = merged[i + 1].start;
    if (gapEnd > gapStart) {
      windows.push({
        start: minutesToTime(gapStart),
        end: minutesToTime(gapEnd),
        durationMins: gapEnd - gapStart,
      });
    }
  }

  // Gap after the last block
  const lastMerged = merged[merged.length - 1];
  if (lastMerged.end < dayEndMins) {
    windows.push({
      start: minutesToTime(lastMerged.end),
      end: minutesToTime(dayEndMins),
      durationMins: dayEndMins - lastMerged.end,
    });
  }

  return windows;
}

/**
 * Determines what the user should focus on right now.
 *
 * Logic:
 * 1. If a block is happening right now, returns the active block.
 * 2. Otherwise, identifies the free window the user is currently in.
 * 3. Finds all unfinished subtasks whose parent goal deadline is nearest and
 *    whose estimate fits within the remaining minutes of this free window.
 * 4. Returns the suggested subtask alongside remaining free minutes and the start time
 *    of the next upcoming block.
 *
 * @param now - Current timestamp (Date object, ISO string, or defaults to new Date()).
 * @param options - Optional overrides for blocks, goals, and day boundaries.
 * @returns NowSuggestion describing the active block or recommended subtask.
 */
export function getNowSuggestion(
  now?: Date | string,
  options?: {
    blocks?: Block[];
    goals?: Goal[];
    dayStart?: string;
    dayEnd?: string;
  }
): NowSuggestion {
  // Parse `now` into dateStr (YYYY-MM-DD) and timeStr (HH:MM)
  let dateStr: string;
  let timeStr: string;

  if (typeof now === 'string') {
    if (now.includes('T')) {
      const [d, t] = now.split('T');
      dateStr = d;
      timeStr = t.slice(0, 5);
    } else if (now.includes(' ')) {
      const [d, t] = now.split(' ');
      dateStr = d;
      timeStr = t.slice(0, 5);
    } else {
      // Just a date was passed; default to midnight or current time
      dateStr = now;
      timeStr = '00:00';
    }
  } else if (now instanceof Date) {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    dateStr = `${y}-${m}-${d}`;
    timeStr = `${hh}:${mm}`;
  } else {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    dateStr = `${y}-${m}-${day}`;
    timeStr = `${hh}:${mm}`;
  }

  const nowMins = timeToMinutes(timeStr);
  const blocksToday = getBlocksForDate(dateStr, options?.blocks);

  // 1. Check if a block is active right now
  const activeBlock = blocksToday.find((b) => {
    const startMins = timeToMinutes(b.start);
    const endMins = timeToMinutes(b.end);
    return nowMins >= startMins && nowMins < endMins;
  });

  if (activeBlock) {
    return {
      type: 'current_block',
      block: activeBlock,
      subtask: null,
      goal: null,
      minutesFree: 0,
      nextBlockStart: null,
      window: null,
    };
  }

  // 2. We are in a free gap. Find the free window containing current time
  const freeWindows = getFreeWindows(dateStr, {
    blocks: options?.blocks,
    dayStart: options?.dayStart,
    dayEnd: options?.dayEnd,
  });

  const currentWindow =
    freeWindows.find((w) => {
      const wStartMins = timeToMinutes(w.start);
      const wEndMins = timeToMinutes(w.end);
      return nowMins >= wStartMins && nowMins < wEndMins;
    }) ?? {
      start: timeStr,
      end: options?.dayEnd ?? '24:00',
      durationMins: Math.max(0, timeToMinutes(options?.dayEnd ?? '24:00') - nowMins),
    };

  const windowEndMins = timeToMinutes(currentWindow.end);
  const minutesFree = Math.max(0, windowEndMins - nowMins);

  // Determine when the next block starts today
  const upcomingBlocks = blocksToday.filter((b) => timeToMinutes(b.start) >= nowMins);
  const nextBlockStart = upcomingBlocks.length > 0 ? upcomingBlocks[0].start : null;

  // 3. Find candidate unfinished subtask whose parent goal deadline is nearest
  // and whose estimate fits within remaining minutesFree
  const allGoals = options?.goals ?? getPlannerSnapshot().goals;
  const activeGoals = allGoals.filter((g) => g.status !== 'archived' && g.status !== 'completed');

  interface Candidate {
    subtask: Subtask;
    goal: Goal;
    deadlineTime: number;
  }

  const candidates: Candidate[] = [];

  for (const goal of activeGoals) {
    const deadlineTime = new Date(goal.deadline + 'T23:59:59').getTime();
    for (const subtask of goal.subtasks) {
      if (!subtask.done && subtask.estimateMins <= minutesFree) {
        candidates.push({ subtask, goal, deadlineTime });
      }
    }
  }

  // Sort candidate subtasks: nearest goal deadline first.
  // If deadlines are identical, prioritize longer fitting estimates or earlier defined order.
  candidates.sort((a, b) => {
    if (a.deadlineTime !== b.deadlineTime) {
      return a.deadlineTime - b.deadlineTime;
    }
    return b.subtask.estimateMins - a.subtask.estimateMins;
  });

  const chosen = candidates[0] || null;

  return {
    type: 'free_window',
    block: null,
    subtask: chosen ? chosen.subtask : null,
    goal: chosen ? chosen.goal : null,
    minutesFree,
    nextBlockStart,
    window: currentWindow,
  };
}
