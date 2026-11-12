import { describe, it, expect, beforeEach } from 'vitest';
import {
  getFreeWindows,
  getNowSuggestion,
  timeToMinutes,
  minutesToTime,
  getDayOfWeekFromDateString,
  addGoal,
  updateGoal,
  deleteGoal,
  addSubtask,
  toggleSubtask,
  addBlock,
  updateBlock,
  deleteBlock,
  getBlocksForDate,
} from '../actions.js';
import type { Block, Goal } from '../types.js';
import { setStorageAdapter, MemoryStorageAdapter } from '../storage.js';
import { usePlannerStore } from '../store.js';

describe('Time and Date Helpers', () => {
  it('converts time strings to minutes from midnight and back', () => {
    expect(timeToMinutes('00:00')).toBe(0);
    expect(timeToMinutes('09:00')).toBe(540);
    expect(timeToMinutes('19:00')).toBe(1140);
    expect(timeToMinutes('24:00')).toBe(1440);

    expect(minutesToTime(0)).toBe('00:00');
    expect(minutesToTime(540)).toBe('09:00');
    expect(minutesToTime(1140)).toBe('19:00');
    expect(minutesToTime(1440)).toBe('24:00');
  });

  it('determines the correct DayOfWeek without timezone drift', () => {
    // 2026-11-12 is Thursday (4)
    expect(getDayOfWeekFromDateString('2026-11-12')).toBe(4);
    // 2026-11-13 is Friday (5)
    expect(getDayOfWeekFromDateString('2026-11-13')).toBe(5);
    // 2026-11-14 is Saturday (6)
    expect(getDayOfWeekFromDateString('2026-11-14')).toBe(6);
    // 2026-11-15 is Sunday (0)
    expect(getDayOfWeekFromDateString('2026-11-15')).toBe(0);
    // 2026-11-16 is Monday (1)
    expect(getDayOfWeekFromDateString('2026-11-16')).toBe(1);
  });
});

describe('getFreeWindows', () => {
  it('returns full 24h day window when no blocks exist', () => {
    const windows = getFreeWindows('2026-11-15', { blocks: [] });
    expect(windows).toEqual([
      {
        start: '00:00',
        end: '24:00',
        durationMins: 1440,
      },
    ]);
  });

  it('computes free gaps around a single recurring college block (09:00 to 19:00)', () => {
    const collegeBlock: Block = {
      id: 'block-college',
      date: '2026-01-01',
      start: '09:00',
      end: '19:00',
      title: 'College',
      kind: 'fixed',
      done: false,
      recurrence: {
        frequency: 'weekly',
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    };

    // Thursday (weekday 4)
    const windows = getFreeWindows('2026-11-12', { blocks: [collegeBlock] });
    expect(windows).toHaveLength(2);
    expect(windows[0]).toEqual({
      start: '00:00',
      end: '09:00',
      durationMins: 540,
    });
    expect(windows[1]).toEqual({
      start: '19:00',
      end: '24:00',
      durationMins: 300,
    });
  });

  it('computes free windows between multiple spaced blocks', () => {
    const testBlocks: Block[] = [
      {
        id: 'b1',
        date: '2026-11-12',
        start: '09:00',
        end: '12:00',
        title: 'Morning block',
        kind: 'fixed',
        done: false,
      },
      {
        id: 'b2',
        date: '2026-11-12',
        start: '13:00',
        end: '15:30',
        title: 'Afternoon seminar',
        kind: 'fixed',
        done: false,
      },
      {
        id: 'b3',
        date: '2026-11-12',
        start: '18:00',
        end: '20:00',
        title: 'Evening gym',
        kind: 'flexible',
        done: false,
      },
    ];

    const windows = getFreeWindows('2026-11-12', { blocks: testBlocks });
    expect(windows).toEqual([
      { start: '00:00', end: '09:00', durationMins: 540 },
      { start: '12:00', end: '13:00', durationMins: 60 },
      { start: '15:30', end: '18:00', durationMins: 150 },
      { start: '20:00', end: '24:00', durationMins: 240 },
    ]);
  });

  it('merges overlapping and adjacent blocks correctly', () => {
    const overlappingBlocks: Block[] = [
      {
        id: 'b1',
        date: '2026-11-12',
        start: '10:00',
        end: '12:00',
        title: 'Part 1',
        kind: 'fixed',
        done: false,
      },
      {
        id: 'b2',
        date: '2026-11-12',
        start: '11:30',
        end: '13:00',
        title: 'Part 2 (overlaps)',
        kind: 'fixed',
        done: false,
      },
      {
        id: 'b3',
        date: '2026-11-12',
        start: '13:00',
        end: '14:00',
        title: 'Part 3 (contiguous)',
        kind: 'fixed',
        done: false,
      },
    ];

    const windows = getFreeWindows('2026-11-12', { blocks: overlappingBlocks });
    expect(windows).toEqual([
      { start: '00:00', end: '10:00', durationMins: 600 },
      { start: '14:00', end: '24:00', durationMins: 600 },
    ]);
  });

  it('respects custom dayStart and dayEnd boundaries', () => {
    const testBlocks: Block[] = [
      {
        id: 'b1',
        date: '2026-11-12',
        start: '10:00',
        end: '12:00',
        title: 'Block',
        kind: 'fixed',
        done: false,
      },
    ];

    const windows = getFreeWindows('2026-11-12', {
      blocks: testBlocks,
      dayStart: '08:00',
      dayEnd: '18:00',
    });

    expect(windows).toEqual([
      { start: '08:00', end: '10:00', durationMins: 120 },
      { start: '12:00', end: '18:00', durationMins: 360 },
    ]);
  });
});

describe('getNowSuggestion', () => {
  const collegeBlock: Block = {
    id: 'block-college',
    date: '2026-01-01',
    start: '09:00',
    end: '19:00',
    title: 'College',
    kind: 'fixed',
    done: false,
    recurrence: {
      frequency: 'weekly',
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  };

  const sampleGoals: Goal[] = [
    {
      id: 'g-urgent',
      title: 'Urgent Project',
      type: 'short',
      deadline: '2026-11-20', // earlier deadline
      color: '#5B7085',
      status: 'active',
      subtasks: [
        { id: 'st-urgent-big', title: 'Big task (90 mins)', done: false, estimateMins: 90 },
        { id: 'st-urgent-quick', title: 'Quick task (30 mins)', done: false, estimateMins: 30 },
        { id: 'st-urgent-done', title: 'Finished task', done: true, estimateMins: 20 },
      ],
    },
    {
      id: 'g-later',
      title: 'Later Project',
      type: 'long',
      deadline: '2026-12-30', // later deadline
      color: '#A86D5B',
      status: 'active',
      subtasks: [
        { id: 'st-later-fit', title: 'Task (25 mins)', done: false, estimateMins: 25 },
      ],
    },
  ];

  it('returns the active block when a block is happening right now', () => {
    // 2026-11-12 is Thursday, at 14:30 (inside college 09:00 - 19:00)
    const suggestion = getNowSuggestion('2026-11-12T14:30:00', {
      blocks: [collegeBlock],
      goals: sampleGoals,
    });

    expect(suggestion.type).toBe('current_block');
    if (suggestion.type === 'current_block') {
      expect(suggestion.block.title).toBe('College');
      expect(suggestion.block.id).toBe('block-college');
      expect(suggestion.minutesFree).toBe(0);
      expect(suggestion.subtask).toBeNull();
    }
  });

  it('picks the unfinished subtask whose goal deadline is nearest and fits the window', () => {
    // 2026-11-12 at 07:30 (college starts at 09:00)
    // Free window from 07:30 to 09:00 has 90 minutes free
    const suggestion = getNowSuggestion('2026-11-12T07:30:00', {
      blocks: [collegeBlock],
      goals: sampleGoals,
    });

    expect(suggestion.type).toBe('free_window');
    if (suggestion.type === 'free_window') {
      expect(suggestion.minutesFree).toBe(90);
      expect(suggestion.nextBlockStart).toBe('09:00');
      // st-urgent-big (90 mins) fits and belongs to the nearest deadline goal
      expect(suggestion.subtask?.id).toBe('st-urgent-big');
      expect(suggestion.goal?.id).toBe('g-urgent');
    }
  });

  it('filters out subtasks that exceed the remaining free window', () => {
    // At 08:35, college starts at 09:00 -> 25 minutes free
    const suggestion = getNowSuggestion('2026-11-12T08:35:00', {
      blocks: [collegeBlock],
      goals: sampleGoals,
    });

    expect(suggestion.type).toBe('free_window');
    if (suggestion.type === 'free_window') {
      expect(suggestion.minutesFree).toBe(25);
      expect(suggestion.nextBlockStart).toBe('09:00');
      // Urgent subtasks require 90 mins and 30 mins, neither fits 25 mins!
      // But g-later has st-later-fit (25 mins) which fits perfectly!
      expect(suggestion.subtask?.id).toBe('st-later-fit');
      expect(suggestion.goal?.id).toBe('g-later');
    }
  });

  it('returns subtask: null when no unfinished subtasks fit the window', () => {
    // At 08:50, college starts at 09:00 -> only 10 minutes free
    const suggestion = getNowSuggestion('2026-11-12T08:50:00', {
      blocks: [collegeBlock],
      goals: sampleGoals,
    });

    expect(suggestion.type).toBe('free_window');
    if (suggestion.type === 'free_window') {
      expect(suggestion.minutesFree).toBe(10);
      expect(suggestion.nextBlockStart).toBe('09:00');
      expect(suggestion.subtask).toBeNull();
      expect(suggestion.goal).toBeNull();
    }
  });

  it('handles evening window after the last block of the day', () => {
    // At 19:30, after college ends at 19:00
    // Remaining time until 24:00 is 270 minutes, nextBlockStart is null
    const suggestion = getNowSuggestion('2026-11-12T19:30:00', {
      blocks: [collegeBlock],
      goals: sampleGoals,
    });

    expect(suggestion.type).toBe('free_window');
    if (suggestion.type === 'free_window') {
      expect(suggestion.minutesFree).toBe(270);
      expect(suggestion.nextBlockStart).toBeNull();
      expect(suggestion.subtask?.id).toBe('st-urgent-big');
    }
  });
});

describe('Store CRUD Actions with Memory Storage', () => {
  beforeEach(() => {
    setStorageAdapter(new MemoryStorageAdapter({ goals: [], blocks: [], version: 1 }));
    usePlannerStore.setState({ goals: [], blocks: [] });
  });

  it('adds, updates, and deletes goals and subtasks', () => {
    const goal = addGoal({
      title: 'Study Math',
      type: 'short',
      deadline: '2026-12-01',
      color: '#6B7F6D',
      status: 'active',
      subtasks: [],
    });

    expect(goal.id).toBeDefined();
    expect(goal.title).toBe('Study Math');

    const subtask = addSubtask(goal.id, {
      title: 'Chapter 1 Linear Algebra',
      estimateMins: 45,
    });
    expect(subtask.id).toBeDefined();
    expect(subtask.done).toBe(false);

    const toggled = toggleSubtask(goal.id, subtask.id);
    expect(toggled.done).toBe(true);

    const updated = updateGoal(goal.id, { title: 'Study Linear Algebra' });
    expect(updated.title).toBe('Study Linear Algebra');

    deleteGoal(goal.id);
    expect(usePlannerStore.getState().goals).toHaveLength(0);
  });

  it('adds, updates, and deletes blocks and queries blocks by date', () => {
    const block = addBlock({
      date: '2026-11-12',
      start: '14:00',
      end: '15:30',
      title: 'Lab',
      kind: 'fixed',
      done: false,
    });

    const blocksOnDate = getBlocksForDate('2026-11-12');
    expect(blocksOnDate).toHaveLength(1);
    expect(blocksOnDate[0].title).toBe('Lab');

    updateBlock(block.id, { title: 'Chemistry Lab' });
    expect(getBlocksForDate('2026-11-12')[0].title).toBe('Chemistry Lab');

    deleteBlock(block.id);
    expect(getBlocksForDate('2026-11-12')).toHaveLength(0);
  });

  it('handles getNowSuggestion with Date object and recurring college block', () => {
    // 2026-11-12 10:00:00 is a Thursday during college
    const thursdayDate = new Date(2026, 10, 12, 10, 0, 0);
    // In default seed data, college is active weekdays 09:00 - 19:00
    // Wait, in this test block the memory store was empty, so let's pass blocks explicitly:
    const collegeBlock: Block = {
      id: 'block-college',
      date: '2026-01-01',
      start: '09:00',
      end: '19:00',
      title: 'College Lectures',
      kind: 'fixed',
      done: false,
      recurrence: {
        frequency: 'weekly',
        daysOfWeek: [1, 2, 3, 4, 5],
      },
    };

    const res = getNowSuggestion(thursdayDate, { blocks: [collegeBlock] });
    expect(res.type).toBe('current_block');
    if (res.type === 'current_block') {
      expect(res.block.title).toBe('College Lectures');
    }

    // 2026-11-15 10:00:00 is Sunday (not in college daysOfWeek)
    const sundayDate = new Date(2026, 10, 15, 10, 0, 0);
    const sundayRes = getNowSuggestion(sundayDate, { blocks: [collegeBlock] });
    expect(sundayRes.type).toBe('free_window');
    if (sundayRes.type === 'free_window') {
      expect(sundayRes.nextBlockStart).toBeNull();
    }
  });
});
