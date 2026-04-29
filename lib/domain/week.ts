/**
 * Date helpers for the habit tracker.
 *
 * All dates are handled in the user's local timezone as `YYYY-MM-DD` strings.
 * Weeks begin Monday 00:00 local time.
 */

/** Format a Date as a local-time `YYYY-MM-DD` string. */
export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Today's local-time date as `YYYY-MM-DD`. */
export const todayISO = (): string => toISODate(new Date());

/** Parse a `YYYY-MM-DD` string into a local-midnight Date. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** ISO date for the Monday that begins the week containing `iso`. */
export function startOfWeekISO(iso: string): string {
  const d = fromISODate(iso);
  // Monday-indexed: Mon=0..Sun=6.
  const offset = (d.getDay() + 6) % 7;
  d.setDate(d.getDate() - offset);
  return toISODate(d);
}

/** Format an ISO date as a friendly long-form local string, e.g. "Wednesday, April 29". */
export function formatLongDate(iso: string): string {
  return fromISODate(iso).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
