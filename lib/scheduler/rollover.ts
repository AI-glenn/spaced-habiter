/**
 * Day-rollover catch-up logic.
 *
 * Because this is a client-only app, "midnight rollover" actually fires
 * whenever the user next opens the app on a new local day. If the live
 * `todaySchedule` is from a past day, we move it into history and fill
 * in auto-skip log entries for any habits that weren't acted on.
 */

import { AppState } from '@/lib/domain/types';
import { skipHabit } from '@/lib/scheduler/transitions';

/**
 * Roll a stale `todaySchedule` into `pastSchedules`, writing auto-skip
 * entries for any habits left unacted-upon. Returns state unchanged
 * if the live schedule is for `today` (or absent).
 */
export function rolloverIfNeeded(state: AppState, today: string): AppState {
  const stale = state.todaySchedule;
  if (!stale || stale.date >= today) return state;

  let next = state;
  for (const id of stale.habitIds) {
    if (isUnacted(next, id, stale.date) && hasHabit(next, id)) {
      next = skipHabit(next, id, stale.date, 'auto');
    }
  }
  return {
    ...next,
    pastSchedules: { ...next.pastSchedules, [stale.date]: stale },
    todaySchedule: null,
  };
}

const isUnacted = (state: AppState, habitId: string, date: string): boolean =>
  !state.completions.some((c) => c.habitId === habitId && c.date === date) &&
  !state.skips.some((s) => s.habitId === habitId && s.date === date);

const hasHabit = (state: AppState, habitId: string): boolean =>
  state.habits.some((h) => h.id === habitId);
