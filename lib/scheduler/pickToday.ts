/**
 * Provisional daily scheduler.
 *
 * TODO(algorithm-thread): The picker logic, the empty-day behavior, and
 * the cold-start handling for new habits are all open questions. Replace
 * the body of `pickToday` with the final algorithm when it lands. The
 * function signature (AppState + date in -> ordered habit ids out) is
 * intended to be stable.
 */

import { AppState, DailySchedule, Habit, Priority } from '@/lib/domain/types';
import { startOfWeekISO } from '@/lib/domain/week';

const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/** Number of completions for `habit` in the week containing `date`. */
export function completionsThisWeek(
  state: AppState,
  habitId: string,
  date: string,
): number {
  const weekStart = startOfWeekISO(date);
  return state.completions.filter(
    (c) => c.habitId === habitId && startOfWeekISO(c.date) === weekStart,
  ).length;
}

/**
 * Build today's schedule for `date`. Pure function over AppState.
 * Result is sized at most `state.settings.dailyCapacity`.
 */
export function pickToday(state: AppState, date: string): DailySchedule {
  const candidates = state.habits.filter(
    (h) => completionsThisWeek(state, h.id, date) < h.weeklyTarget,
  );

  const ranked = [...candidates].sort((a, b) => {
    const tier = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
    if (tier !== 0) return tier;
    const aUrgency = a.weeklyTarget - completionsThisWeek(state, a.id, date);
    const bUrgency = b.weeklyTarget - completionsThisWeek(state, b.id, date);
    const aScore = aUrgency * a.ease;
    const bScore = bUrgency * b.ease;
    if (bScore !== aScore) return bScore - aScore;
    // Stable tiebreak: oldest habit first.
    return a.createdAt.localeCompare(b.createdAt);
  });

  const habitIds = ranked
    .slice(0, Math.max(1, state.settings.dailyCapacity))
    .map((h: Habit) => h.id);

  return {
    date,
    habitIds,
    generatedAt: new Date().toISOString(),
  };
}
