/**
 * Day-rollover catch-up logic.
 *
 * Because this is a client-only app, "midnight rollover" actually fires
 * whenever the user next opens the app on a new local day. This module
 * replays any past-day schedules whose habits were neither completed nor
 * manually skipped, and writes auto-skip log entries for them.
 */

import { AppState } from '@/lib/domain/types';
import { skipHabit } from '@/lib/scheduler/transitions';

/**
 * If `state.todaySchedule` is from a past date, walk it (and any
 * `pastSchedules` from days strictly between then and `today`) and
 * fold the schedule into history with auto-skip entries for any
 * unaccounted-for habits. Returns the updated state and a flag
 * indicating whether the schedule slot is now empty (meaning the
 * caller should generate a fresh schedule for `today`).
 */
export function rolloverIfNeeded(
  state: AppState,
  today: string,
): { state: AppState; needsNewSchedule: boolean } {
  let next = state;

  // Roll the live schedule into history if it's from a past day.
  if (next.todaySchedule && next.todaySchedule.date < today) {
    const sched = next.todaySchedule;
    next = autoSkipUnacted(next, sched.date, sched.habitIds);
    next = {
      ...next,
      pastSchedules: { ...next.pastSchedules, [sched.date]: sched },
      todaySchedule: null,
    };
  }

  // Also walk any orphan past schedules that haven't been auto-skipped yet.
  // Any habit appearing in a past schedule that has no completion/skip
  // entry for that date gets an auto-skip filled in.
  for (const date of Object.keys(next.pastSchedules)) {
    if (date >= today) continue;
    const sched = next.pastSchedules[date];
    next = autoSkipUnacted(next, date, sched.habitIds);
  }

  const needsNewSchedule =
    next.todaySchedule === null || next.todaySchedule.date !== today;

  return { state: next, needsNewSchedule };
}

/**
 * For each habit id scheduled on `date`, if the user neither completed
 * nor skipped it, append an auto-skip entry.
 */
function autoSkipUnacted(
  state: AppState,
  date: string,
  habitIds: string[],
): AppState {
  let next = state;
  for (const id of habitIds) {
    const acted =
      next.completions.some((c) => c.habitId === id && c.date === date) ||
      next.skips.some((s) => s.habitId === id && s.date === date);
    if (!acted && next.habits.some((h) => h.id === id)) {
      next = skipHabit(next, id, date, 'auto');
    }
  }
  return next;
}
