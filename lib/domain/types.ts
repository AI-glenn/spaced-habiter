/**
 * Shared domain types for the habit tracker.
 *
 * NOTE: Some fields are PROVISIONAL — they are tightly coupled to the
 * provisional scheduling algorithm in `lib/scheduler`. The dedicated
 * algorithm-design pass may revise these. Anywhere that should be
 * revisited is marked with TODO(algorithm-thread).
 */

export type Priority = 'high' | 'medium' | 'low';

export type Rating = 'easy' | 'medium' | 'hard';

/** A user-defined habit. */
export interface Habit {
  id: string;
  name: string;
  /** How many times per week the user wants to do this habit (1..7). */
  weeklyTarget: number;
  priority: Priority;
  /**
   * Difficulty multiplier modulated by ratings & skips.
   * Default 1.0; floor 0.5, cap 3.0 (provisional).
   * TODO(algorithm-thread): may be replaced or supplemented.
   */
  ease: number;
  /** ISO datetime string. */
  createdAt: string;
  /**
   * Reserved for future weekday constraints (Mon..Sun bitmask).
   * V1 scheduler ignores this.
   */
  weekdayMask?: number;
}

/** A logged completion of a habit on a given date with a self-rating. */
export interface CompletionLogEntry {
  habitId: string;
  /** Local-time date, ISO YYYY-MM-DD. */
  date: string;
  rating: Rating;
}

/** A logged skip of a habit (manual or auto via rollover). */
export interface SkipLogEntry {
  habitId: string;
  date: string;
  source: 'manual' | 'auto';
}

export interface Settings {
  /** Maximum number of habits scheduled per day. */
  dailyCapacity: number;
}

/** A frozen list of habit ids selected for a particular day. */
export interface DailySchedule {
  date: string;
  /** Ordered: priority desc, then by within-tier ranking. */
  habitIds: string[];
  generatedAt: string;
}

export interface AppState {
  habits: Habit[];
  completions: CompletionLogEntry[];
  skips: SkipLogEntry[];
  settings: Settings;
  todaySchedule: DailySchedule | null;
  /**
   * Past schedules, keyed by date. Kept so auto-skip catch-up can look at
   * what was scheduled yesterday/last week and back-fill missing skip
   * entries on first-open-of-new-day.
   */
  pastSchedules: Record<string, DailySchedule>;
}

/** Schema version for future migrations. */
export const SCHEMA_VERSION = 1;

export interface PersistedState {
  version: number;
  state: AppState;
}
