/**
 * Provisional daily scheduler.
 *
 * TODO(algorithm-thread): The picker logic, the empty-day behavior, and
 * the cold-start handling for new habits are all open questions. Replace
 * the body of `pickToday` with the final algorithm when it lands. The
 * function signature (AppState + date in -> ordered habit ids out) is
 * intended to be stable.
 */

import { AppState, DailySchedule, Priority } from '@/lib/domain/types';
import { startOfWeekISO } from '@/lib/domain/week';

const PRIORITY_RANK: Record<Priority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

/**
 * Build today's schedule for `date`. Pure function over AppState.
 * Result is sized at most `state.settings.dailyCapacity`.
 */
export function pickToday(state: AppState, date: string): DailySchedule {
  const completedThisWeek = countCompletionsThisWeek(state, date);
  const completed = (id: string) => completedThisWeek.get(id) ?? 0;

  const ranked = state.habits
    .filter((h) => completed(h.id) < h.weeklyTarget)
    .sort((a, b) => {
      const tier = PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority];
      if (tier !== 0) return tier;
      const aScore = (a.weeklyTarget - completed(a.id)) * a.ease;
      const bScore = (b.weeklyTarget - completed(b.id)) * b.ease;
      if (bScore !== aScore) return bScore - aScore;
      // Stable tiebreak: oldest habit first.
      return a.createdAt.localeCompare(b.createdAt);
    });

  const habitIds = ranked
    .slice(0, Math.max(1, state.settings.dailyCapacity))
    .map((h) => h.id);

  return { date, habitIds, generatedAt: new Date().toISOString() };
}

/** Map of habitId -> completion count for the week containing `date`. */
function countCompletionsThisWeek(state: AppState, date: string): Map<string, number> {
  const weekStart = startOfWeekISO(date);
  const counts = new Map<string, number>();
  for (const c of state.completions) {
    if (startOfWeekISO(c.date) === weekStart) {
      counts.set(c.habitId, (counts.get(c.habitId) ?? 0) + 1);
    }
  }
  return counts;
}
