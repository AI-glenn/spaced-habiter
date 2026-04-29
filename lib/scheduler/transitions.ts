/**
 * Pure functions that transition AppState in response to user actions.
 * The ease-multiplier logic is PROVISIONAL.
 *
 * TODO(algorithm-thread): replace ease multipliers and skip-streak logic
 * once the dedicated algorithm thread completes.
 */

import {
  AppState,
  CompletionLogEntry,
  Habit,
  Rating,
  SkipLogEntry,
} from '@/lib/domain/types';

const EASE_FLOOR = 0.5;
const EASE_CAP = 3.0;

const clampEase = (x: number) => Math.min(EASE_CAP, Math.max(EASE_FLOOR, x));

/** Apply rating-driven ease multiplier (provisional). */
export function applyRatingToEase(currentEase: number, rating: Rating): number {
  switch (rating) {
    case 'easy':
      return clampEase(currentEase * 0.85);
    case 'medium':
      return clampEase(currentEase);
    case 'hard':
      return clampEase(currentEase * 1.25);
  }
}

/**
 * Apply skip-driven ease multiplier (provisional).
 * Looks at how many consecutive skips precede this one to detect a 2+ streak.
 *
 * TODO(algorithm-thread): "consecutive" here means consecutive skip entries
 * in the log without an intervening completion. The real definition (calendar
 * days vs. scheduled days) is an open algorithmic question.
 */
export function applySkipToEase(
  currentEase: number,
  priorSkipsForHabit: SkipLogEntry[],
  priorCompletionsForHabit: CompletionLogEntry[],
): number {
  let next = currentEase * 1.2;
  // Did the most recent log event for this habit (before today) include a skip?
  const lastCompletion = priorCompletionsForHabit[priorCompletionsForHabit.length - 1];
  const lastSkip = priorSkipsForHabit[priorSkipsForHabit.length - 1];
  const lastWasSkip =
    !!lastSkip && (!lastCompletion || lastSkip.date > lastCompletion.date);
  if (lastWasSkip) {
    next *= 1.5;
  }
  return clampEase(next);
}

/** Mark `habitId` as completed today with the given rating. */
export function completeHabit(
  state: AppState,
  habitId: string,
  date: string,
  rating: Rating,
): AppState {
  const habits = state.habits.map((h: Habit) =>
    h.id === habitId ? { ...h, ease: applyRatingToEase(h.ease, rating) } : h,
  );
  const completion: CompletionLogEntry = { habitId, date, rating };
  return {
    ...state,
    habits,
    completions: [...state.completions, completion],
  };
}

/** Mark `habitId` as skipped today (manual or auto). */
export function skipHabit(
  state: AppState,
  habitId: string,
  date: string,
  source: 'manual' | 'auto',
): AppState {
  const priorSkips = state.skips.filter((s) => s.habitId === habitId);
  const priorCompletions = state.completions.filter((c) => c.habitId === habitId);
  const habits = state.habits.map((h) =>
    h.id === habitId
      ? { ...h, ease: applySkipToEase(h.ease, priorSkips, priorCompletions) }
      : h,
  );
  const skip: SkipLogEntry = { habitId, date, source };
  return {
    ...state,
    habits,
    skips: [...state.skips, skip],
  };
}
