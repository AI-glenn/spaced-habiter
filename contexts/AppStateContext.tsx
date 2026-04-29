'use client';

/**
 * AppStateContext owns the single AppState blob, persists it to
 * localStorage, and exposes domain-level mutators to the UI.
 *
 * All mutations go through reducer-style helpers so that scheduling
 * logic stays pure — see `lib/scheduler`.
 */

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  AppState,
  Habit,
  Priority,
  Rating,
  Settings,
} from '@/lib/domain/types';
import { uuid } from '@/lib/domain/uuid';
import { todayISO } from '@/lib/domain/week';
import { initialAppState, loadState, saveState } from '@/lib/storage/localStore';
import { pickToday } from '@/lib/scheduler/pickToday';
import {
  completeHabit as txCompleteHabit,
  skipHabit as txSkipHabit,
} from '@/lib/scheduler/transitions';
import { rolloverIfNeeded } from '@/lib/scheduler/rollover';

interface NewHabitInput {
  name: string;
  weeklyTarget: number;
  priority: Priority;
}

interface AppStateContextValue {
  state: AppState;
  /** True until the first localStorage hydration has finished. */
  hydrated: boolean;
  addHabit: (input: NewHabitInput) => void;
  updateHabit: (id: string, patch: Partial<NewHabitInput>) => void;
  deleteHabit: (id: string) => void;
  rateToday: (habitId: string, rating: Rating) => void;
  skipToday: (habitId: string) => void;
  regenerateToday: () => void;
  updateSettings: (patch: Partial<Settings>) => void;
}

const AppStateContext = createContext<AppStateContextValue | null>(null);

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialAppState);
  const [hydrated, setHydrated] = useState(false);
  const lastSerialized = useRef<string>('');

  // Hydrate from localStorage on mount.
  useEffect(() => {
    const today = todayISO();
    const loaded = loadState();

    // Run rollover catch-up, then ensure today has a schedule.
    const { state: rolled, needsNewSchedule } = rolloverIfNeeded(loaded, today);
    let next = rolled;
    if (needsNewSchedule) {
      next = { ...next, todaySchedule: pickToday(next, today) };
    }
    setState(next);
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (!hydrated) return;
    const serialized = JSON.stringify(state);
    if (serialized === lastSerialized.current) return;
    lastSerialized.current = serialized;
    saveState(state);
  }, [state, hydrated]);

  const value = useMemo<AppStateContextValue>(() => {
    const ensureTodaySchedule = (s: AppState): AppState => {
      const today = todayISO();
      if (!s.todaySchedule || s.todaySchedule.date !== today) {
        return { ...s, todaySchedule: pickToday(s, today) };
      }
      return s;
    };

    return {
      state,
      hydrated,
      addHabit: ({ name, weeklyTarget, priority }) => {
        setState((s) => {
          const habit: Habit = {
            id: uuid(),
            name: name.trim(),
            weeklyTarget,
            priority,
            ease: 1.0,
            createdAt: new Date().toISOString(),
          };
          const next = { ...s, habits: [...s.habits, habit] };
          // If no schedule today (e.g. fresh install), let it pick now;
          // otherwise leave today's stable list alone so the new habit
          // shows up tomorrow or on Regenerate.
          return s.todaySchedule ? next : ensureTodaySchedule(next);
        });
      },
      updateHabit: (id, patch) => {
        setState((s) => ({
          ...s,
          habits: s.habits.map((h) =>
            h.id === id
              ? {
                  ...h,
                  ...(patch.name !== undefined ? { name: patch.name.trim() } : {}),
                  ...(patch.weeklyTarget !== undefined
                    ? { weeklyTarget: patch.weeklyTarget }
                    : {}),
                  ...(patch.priority !== undefined ? { priority: patch.priority } : {}),
                }
              : h,
          ),
        }));
      },
      deleteHabit: (id) => {
        setState((s) => ({
          ...s,
          habits: s.habits.filter((h) => h.id !== id),
          completions: s.completions.filter((c) => c.habitId !== id),
          skips: s.skips.filter((sk) => sk.habitId !== id),
          todaySchedule: s.todaySchedule
            ? {
                ...s.todaySchedule,
                habitIds: s.todaySchedule.habitIds.filter((hid) => hid !== id),
              }
            : null,
        }));
      },
      rateToday: (habitId, rating) => {
        const today = todayISO();
        setState((s) => txCompleteHabit(s, habitId, today, rating));
      },
      skipToday: (habitId) => {
        const today = todayISO();
        setState((s) => txSkipHabit(s, habitId, today, 'manual'));
      },
      regenerateToday: () => {
        setState((s) => ({ ...s, todaySchedule: pickToday(s, todayISO()) }));
      },
      updateSettings: (patch) => {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
      },
    };
  }, [state, hydrated]);

  return (
    <AppStateContext.Provider value={value}>{children}</AppStateContext.Provider>
  );
}

export function useAppState(): AppStateContextValue {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error('useAppState must be used within an AppStateProvider');
  }
  return ctx;
}
