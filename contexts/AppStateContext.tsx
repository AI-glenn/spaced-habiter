'use client';

/**
 * AppStateContext owns the single AppState blob, persists it to
 * localStorage, and exposes domain-level mutators to the UI.
 *
 * All scheduling logic stays pure — see `lib/scheduler`.
 */

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { AppState, Habit, Priority, Rating, Settings } from '@/lib/domain/types';
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

const newHabit = ({ name, weeklyTarget, priority }: NewHabitInput): Habit => ({
  id: uuid(),
  name,
  weeklyTarget,
  priority,
  ease: 1.0,
  createdAt: new Date().toISOString(),
});

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(initialAppState);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount, run rollover catch-up, and
  // ensure today has a schedule.
  useEffect(() => {
    const today = todayISO();
    const rolled = rolloverIfNeeded(loadState(), today);
    setState(
      rolled.todaySchedule?.date === today
        ? rolled
        : { ...rolled, todaySchedule: pickToday(rolled, today) },
    );
    setHydrated(true);
  }, []);

  // Persist on every change after hydration.
  useEffect(() => {
    if (hydrated) saveState(state);
  }, [state, hydrated]);

  const value = useMemo<AppStateContextValue>(
    () => ({
      state,
      hydrated,
      addHabit: (input) => {
        setState((s) => ({ ...s, habits: [...s.habits, newHabit(input)] }));
      },
      updateHabit: (id, patch) => {
        setState((s) => ({
          ...s,
          habits: s.habits.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        }));
      },
      deleteHabit: (id) => {
        setState((s) => ({
          ...s,
          habits: s.habits.filter((h) => h.id !== id),
          completions: s.completions.filter((c) => c.habitId !== id),
          skips: s.skips.filter((sk) => sk.habitId !== id),
          todaySchedule: s.todaySchedule && {
            ...s.todaySchedule,
            habitIds: s.todaySchedule.habitIds.filter((hid) => hid !== id),
          },
        }));
      },
      rateToday: (habitId, rating) => {
        setState((s) => txCompleteHabit(s, habitId, todayISO(), rating));
      },
      skipToday: (habitId) => {
        setState((s) => txSkipHabit(s, habitId, todayISO(), 'manual'));
      },
      regenerateToday: () => {
        setState((s) => ({ ...s, todaySchedule: pickToday(s, todayISO()) }));
      },
      updateSettings: (patch) => {
        setState((s) => ({ ...s, settings: { ...s.settings, ...patch } }));
      },
    }),
    [state, hydrated],
  );

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
