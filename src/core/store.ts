import { create } from 'zustand';
import type { Goal, Block, StorageState } from './types.js';
import { loadStoredState, saveStoredState, getStorageAdapter } from './storage.js';
import { INITIAL_STORAGE_STATE } from './seed.js';

export interface PlannerStoreState {
  goals: Goal[];
  blocks: Block[];
  isLoaded: boolean;
  activeStorageName: string;

  // Actions
  setGoals: (goals: Goal[]) => void;
  setBlocks: (blocks: Block[]) => void;
  resetToDefaults: () => void;
  reloadFromStorage: () => void;
}

const initialFromStorage = (() => {
  try {
    const loaded = loadStoredState();
    if (loaded && 'goals' in loaded && 'blocks' in loaded) {
      return loaded as StorageState;
    }
  } catch {
    // fallback
  }
  return INITIAL_STORAGE_STATE;
})();

export const usePlannerStore = create<PlannerStoreState>((set, get) => ({
  goals: initialFromStorage.goals,
  blocks: initialFromStorage.blocks,
  isLoaded: true,
  activeStorageName: getStorageAdapter().name,

  setGoals: (goals: Goal[]) => {
    set({ goals });
    const current = get();
    void saveStoredState({ goals: current.goals, blocks: current.blocks, version: 1 });
  },

  setBlocks: (blocks: Block[]) => {
    set({ blocks });
    const current = get();
    void saveStoredState({ goals: current.goals, blocks: current.blocks, version: 1 });
  },

  resetToDefaults: () => {
    set({
      goals: INITIAL_STORAGE_STATE.goals,
      blocks: INITIAL_STORAGE_STATE.blocks,
    });
    void saveStoredState(INITIAL_STORAGE_STATE);
  },

  reloadFromStorage: () => {
    const res = loadStoredState();
    if (res instanceof Promise) {
      void res.then((state) => {
        set({ goals: state.goals, blocks: state.blocks, activeStorageName: getStorageAdapter().name });
      });
    } else {
      set({ goals: res.goals, blocks: res.blocks, activeStorageName: getStorageAdapter().name });
    }
  },
}));

/**
 * Access the store snapshot directly outside React components (e.g. for pure tools/actions).
 */
export function getPlannerSnapshot(): { goals: Goal[]; blocks: Block[] } {
  const state = usePlannerStore.getState();
  return { goals: state.goals, blocks: state.blocks };
}

/**
 * Commit mutations to store and storage.
 */
export function commitPlannerState(updates: { goals?: Goal[]; blocks?: Block[] }): void {
  const current = usePlannerStore.getState();
  const nextGoals = updates.goals ?? current.goals;
  const nextBlocks = updates.blocks ?? current.blocks;

  usePlannerStore.setState({ goals: nextGoals, blocks: nextBlocks });
  void saveStoredState({ goals: nextGoals, blocks: nextBlocks, version: 1 });
}
