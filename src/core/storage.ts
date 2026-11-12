import type { StorageState } from './types.js';
import { INITIAL_STORAGE_STATE } from './seed.js';

export interface StorageAdapter {
  name: string;
  load(): StorageState | Promise<StorageState>;
  save(state: StorageState): void | Promise<void>;
  clear(): void | Promise<void>;
}

const STORAGE_KEY = 'chronopaper_planner_state_v1';

/**
 * Standard LocalStorage adapter for browser persistence.
 */
export class LocalStorageAdapter implements StorageAdapter {
  name = 'localStorage';

  load(): StorageState {
    if (typeof window === 'undefined' || !window.localStorage) {
      return INITIAL_STORAGE_STATE;
    }

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        this.save(INITIAL_STORAGE_STATE);
        return INITIAL_STORAGE_STATE;
      }
      const parsed = JSON.parse(raw) as StorageState;
      if (!parsed.goals || !parsed.blocks) {
        return INITIAL_STORAGE_STATE;
      }
      return parsed;
    } catch {
      return INITIAL_STORAGE_STATE;
    }
  }

  save(state: StorageState): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors in constrained environments
    }
  }

  clear(): void {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

/**
 * In-memory storage adapter for unit tests and headless environments.
 */
export class MemoryStorageAdapter implements StorageAdapter {
  name = 'memory';
  private state: StorageState;

  constructor(initialState?: StorageState) {
    this.state = initialState ? JSON.parse(JSON.stringify(initialState)) : JSON.parse(JSON.stringify(INITIAL_STORAGE_STATE));
  }

  load(): StorageState {
    return JSON.parse(JSON.stringify(this.state));
  }

  save(state: StorageState): void {
    this.state = JSON.parse(JSON.stringify(state));
  }

  clear(): void {
    this.state = JSON.parse(JSON.stringify(INITIAL_STORAGE_STATE));
  }
}

/**
 * Active storage adapter singleton. Defaults to LocalStorageAdapter,
 * but can be hot-swapped for SQLite or an in-memory test runner.
 */
let activeAdapter: StorageAdapter = new LocalStorageAdapter();

export function setStorageAdapter(adapter: StorageAdapter): void {
  activeAdapter = adapter;
}

export function getStorageAdapter(): StorageAdapter {
  return activeAdapter;
}

export function loadStoredState(): StorageState | Promise<StorageState> {
  return activeAdapter.load();
}

export function saveStoredState(state: StorageState): void | Promise<void> {
  return activeAdapter.save(state);
}

export function clearStoredState(): void | Promise<void> {
  return activeAdapter.clear();
}
