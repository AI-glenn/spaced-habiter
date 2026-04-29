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
export function todayISO(): string {
  return toISODate(new Date());
}

/** Parse a `YYYY-MM-DD` string into a local-midnight Date. */
export function fromISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Day index in week with Monday = 0 .. Sunday = 6. */
export function mondayIndex(d: Date): number {
  const js = d.getDay(); // Sun=0..Sat=6
  return (js + 6) % 7;
}

/** Local-time Monday of the week containing `d`. */
export function startOfWeek(d: Date): Date {
  const result = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  result.setDate(result.getDate() - mondayIndex(result));
  return result;
}

/** ISO date for the start of the week containing the given ISO date. */
export function startOfWeekISO(iso: string): string {
  return toISODate(startOfWeek(fromISODate(iso)));
}

/**
 * Inclusive list of dates in the week containing `iso`, as ISO strings.
 * Order: Monday -> Sunday.
 */
export function weekDates(iso: string): string[] {
  const start = startOfWeek(fromISODate(iso));
  const out: string[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    out.push(toISODate(d));
  }
  return out;
}

/** All ISO dates strictly between `fromExclusive` and `toExclusive`, exclusive of both. */
export function datesBetween(fromExclusive: string, toExclusive: string): string[] {
  const out: string[] = [];
  const a = fromISODate(fromExclusive);
  const b = fromISODate(toExclusive);
  const cur = new Date(a);
  cur.setDate(cur.getDate() + 1);
  while (cur < b) {
    out.push(toISODate(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

/** Format an ISO date as a friendly long-form local string, e.g. "Wednesday, April 29". */
export function formatLongDate(iso: string): string {
  const d = fromISODate(iso);
  return d.toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}
