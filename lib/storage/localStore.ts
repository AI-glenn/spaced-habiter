/**
 * LocalStorage persistence for the habit tracker.
 * Single JSON blob under one key, with a schema version for migrations.
 */

import {
  AppState,
  PersistedState,
  SCHEMA_VERSION,
} from '@/lib/domain/types';

const STORAGE_KEY = 'habit-tracker:state:v1';

export const initialAppState = (): AppState => ({
  habits: [],
  completions: [],
  skips: [],
  settings: { dailyCapacity: 5 },
  todaySchedule: null,
  pastSchedules: {},
});

/** Read app state from localStorage. Returns a fresh state if missing/corrupt. */
export function loadState(): AppState {
  if (typeof window === 'undefined') return initialAppState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return initialAppState();
    const parsed = JSON.parse(raw) as PersistedState;
    if (!parsed || typeof parsed !== 'object') return initialAppState();
    // Version check; in V1 there is only one version, but future migrations
    // will branch here.
    if (parsed.version !== SCHEMA_VERSION) return initialAppState();
    return { ...initialAppState(), ...parsed.state };
  } catch {
    return initialAppState();
  }
}

/** Persist app state to localStorage. No-op on the server. */
export function saveState(state: AppState): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: PersistedState = { version: SCHEMA_VERSION, state };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Quota or serialization errors are ignored; the in-memory state is
    // still authoritative for the current session.
  }
}
