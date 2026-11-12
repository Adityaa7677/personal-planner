import type { Goal, Block, StorageState } from './types.js';

export const SEED_GOALS: Goal[] = [
  {
    id: 'goal-algorithms',
    title: 'Advanced Systems & Algorithms Mastery',
    type: 'short',
    deadline: '2026-12-15',
    color: '#5B7085', // Slate wash
    status: 'active',
    subtasks: [
      {
        id: 'subtask-dp',
        title: 'Complete memoized DP state-space reductions',
        done: false,
        estimateMins: 45,
      },
      {
        id: 'subtask-lru',
        title: 'Review lock-free buffer pool & cache eviction',
        done: false,
        estimateMins: 30,
      },
      {
        id: 'subtask-pset',
        title: 'Solve midterm problem set 3',
        done: true,
        estimateMins: 60,
      },
    ],
  },
  {
    id: 'goal-monograph',
    title: 'Publish Editorial Photography Monograph',
    type: 'long',
    deadline: '2027-04-30',
    color: '#A86D5B', // Terracotta clay
    status: 'active',
    subtasks: [
      {
        id: 'subtask-curate',
        title: 'Curate 24 large-format contact sheet proofs',
        done: false,
        estimateMins: 40,
      },
      {
        id: 'subtask-paper-stock',
        title: 'Select cotton rag paper stock with printer',
        done: false,
        estimateMins: 20,
      },
    ],
  },
];

export const SEED_BLOCKS: Block[] = [
  {
    id: 'block-college',
    date: '2026-01-01',
    start: '09:00',
    end: '19:00',
    title: 'College Lectures & Lab Studios',
    kind: 'fixed',
    done: false,
    recurrence: {
      frequency: 'weekly',
      // Monday (1) through Friday (5) weekdays
      daysOfWeek: [1, 2, 3, 4, 5],
    },
  },
];

export const INITIAL_STORAGE_STATE: StorageState = {
  goals: SEED_GOALS,
  blocks: SEED_BLOCKS,
  version: 1,
};
