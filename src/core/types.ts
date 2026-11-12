/**
 * ChronoPaper Core Type Definitions
 * Strict types for goals, subtasks, blocks, recurrence, and scheduling actions.
 */

export type GoalType = 'short' | 'long';
export type GoalStatus = 'active' | 'completed' | 'archived';
export type BlockKind = 'fixed' | 'flexible';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday

export interface RecurrenceRule {
  frequency: 'daily' | 'weekly';
  /** Days of the week when this block repeats (0=Sun, 1=Mon, ..., 6=Sat) */
  daysOfWeek: DayOfWeek[];
  /** Optional starting boundary (YYYY-MM-DD) */
  startDate?: string;
  /** Optional ending boundary (YYYY-MM-DD) */
  endDate?: string;
}

export interface Subtask {
  id: string;
  title: string;
  done: boolean;
  estimateMins: number;
}

export interface Goal {
  id: string;
  title: string;
  type: GoalType;
  /** ISO Date string (YYYY-MM-DD) */
  deadline: string;
  /** Muted hex or CSS color token */
  color: string;
  status: GoalStatus;
  subtasks: Subtask[];
}

export interface Block {
  id: string;
  /** Reference ISO date (YYYY-MM-DD) */
  date: string;
  /** 24-hour start time "HH:MM" e.g. "09:00" */
  start: string;
  /** 24-hour end time "HH:MM" e.g. "19:00" */
  end: string;
  title: string;
  kind: BlockKind;
  goalId?: string;
  subtaskId?: string;
  done: boolean;
  /** Recurrence specification for repeating blocks (e.g. college Mon-Fri or Mon-Sat) */
  recurrence?: RecurrenceRule;
}

export interface FreeWindow {
  /** Start time "HH:MM" */
  start: string;
  /** End time "HH:MM" */
  end: string;
  /** Duration in minutes */
  durationMins: number;
}

export interface NowBlockSuggestion {
  type: 'current_block';
  block: Block;
  subtask: null;
  goal: null;
  minutesFree: 0;
  nextBlockStart: null;
  window: null;
}

export interface NowSubtaskSuggestion {
  type: 'free_window';
  block: null;
  subtask: Subtask | null;
  goal: Goal | null;
  minutesFree: number;
  nextBlockStart: string | null;
  window: FreeWindow;
}

export type NowSuggestion = NowBlockSuggestion | NowSubtaskSuggestion;

export interface StorageState {
  goals: Goal[];
  blocks: Block[];
  version: number;
}
