/**
 * Pure functions that transition AppState in response to user actions.
 * The ease-multiplier logic is PROVISIONAL.
 *
 * TODO(algorithm-thread): replace ease multipliers and skip-streak logic
 * once the dedicated algorithm thread completes.
 */

import { AppState, Rating } from '@/lib/domain/types';

const EASE_FLOOR = 0.5;
const EASE_CAP = 3.0;

const clampEase = (x: number) => Math.min(EASE_CAP, Math.max(EASE_FLOOR, x));

const RATING_MULTIPLIER: Record<Rating, number> = {
  easy: 0.85,
  medium: 1.0,
  hard: 1.25,
};

/** Apply rating-driven ease multiplier (provisional). */
export const applyRatingToEase = (ease: number, rating: Rating): number =>
  clampEase(ease * RATING_MULTIPLIER[rating]);

/**
 * Apply skip-driven ease multiplier (provisional).
 * Bumps further when the previous logged event for this habit was also a skip.
 *
 * TODO(algorithm-thread): "consecutive" here means consecutive skip entries
 * in the log without an intervening completion. The real definition (calendar
 * days vs. scheduled days) is an open algorithmic question.
 */
export function applySkipToEase(ease: number, lastEventWasSkip: boolean): number {
  const next = ease * 1.2 * (lastEventWasSkip ? 1.5 : 1);
  return clampEase(next);
}

/** Mark `habitId` as completed today with the given rating. */
export function completeHabit(
  state: AppState,
  habitId: string,
  date: string,
  rating: Rating,
): AppState {
  return {
    ...state,
    habits: state.habits.map((h) =>
      h.id === habitId ? { ...h, ease: applyRatingToEase(h.ease, rating) } : h,
    ),
    completions: [...state.completions, { habitId, date, rating }],
  };
}

/** Mark `habitId` as skipped today (manual or auto). */
export function skipHabit(
  state: AppState,
  habitId: string,
  date: string,
  source: 'manual' | 'auto',
): AppState {
  const lastEventWasSkip = wasLastEventASkip(state, habitId);
  return {
    ...state,
    habits: state.habits.map((h) =>
      h.id === habitId ? { ...h, ease: applySkipToEase(h.ease, lastEventWasSkip) } : h,
    ),
    skips: [...state.skips, { habitId, date, source }],
  };
}

/** True iff the most recent log entry for `habitId` is a skip (vs. a completion). */
function wasLastEventASkip(state: AppState, habitId: string): boolean {
  const lastSkipDate = latestDate(state.skips, habitId);
  const lastCompletionDate = latestDate(state.completions, habitId);
  return lastSkipDate !== null && lastSkipDate > (lastCompletionDate ?? '');
}

function latestDate(
  entries: ReadonlyArray<{ habitId: string; date: string }>,
  habitId: string,
): string | null {
  let latest: string | null = null;
  for (const e of entries) {
    if (e.habitId === habitId && (latest === null || e.date > latest)) {
      latest = e.date;
    }
  }
  return latest;
}
