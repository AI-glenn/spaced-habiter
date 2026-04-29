'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { formatLongDate, todayISO } from '@/lib/domain/week';
import HabitCard from '@/components/HabitCard';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function TodayPage() {
  const {
    state,
    hydrated,
    rateToday,
    skipToday,
    regenerateToday,
  } = useAppState();
  const [confirmRegen, setConfirmRegen] = useState(false);

  const today = todayISO();
  const schedule = state.todaySchedule;
  const totalScheduled = schedule?.habitIds.length ?? 0;

  const { active, doneCount } = useMemo(() => {
    if (!schedule) return { active: [], doneCount: 0 };
    const completedIds = new Set(
      state.completions.filter((c) => c.date === today).map((c) => c.habitId),
    );
    const skippedIds = new Set(
      state.skips.filter((s) => s.date === today).map((s) => s.habitId),
    );
    const actedIds = new Set([...completedIds, ...skippedIds]);
    const habitsById = new Map(state.habits.map((h) => [h.id, h]));
    const active = schedule.habitIds
      .filter((id) => !actedIds.has(id))
      .map((id) => habitsById.get(id))
      .filter((h): h is NonNullable<typeof h> => Boolean(h));
    return { active, doneCount: actedIds.size };
  }, [schedule, state.completions, state.skips, state.habits, today]);

  if (!hydrated) {
    return (
      <Header date={today}>
        <p className="text-ink-muted">Loading…</p>
      </Header>
    );
  }

  const hasAnyHabits = state.habits.length > 0;
  const allDone = totalScheduled > 0 && active.length === 0;
  const nothingScheduled = hasAnyHabits && totalScheduled === 0;

  return (
    <Header date={today}>
      {!hasAnyHabits && (
        <EmptyNoHabits />
      )}

      {hasAnyHabits && nothingScheduled && (
        // TODO(algorithm-thread): empty-day copy depends on what the
        // final scheduler decides to do here.
        <EmptyState
          title="Nothing scheduled today"
          subtitle="Nice work — you’re on track for the week."
        />
      )}

      {hasAnyHabits && totalScheduled > 0 && (
        <>
          <ul className="space-y-3">
            {active.map((habit) => (
              <li key={habit.id}>
                <HabitCard
                  habit={habit}
                  onRate={(rating) => rateToday(habit.id, rating)}
                  onSkip={() => skipToday(habit.id)}
                />
              </li>
            ))}
          </ul>

          {allDone && (
            <div className="card mt-2 p-5 text-center">
              <p className="text-[17px] font-medium text-ink">Done for today</p>
              <p className="mt-1 text-sm text-ink-muted">
                {doneCount} of {totalScheduled} done
              </p>
            </div>
          )}
        </>
      )}

      {hasAnyHabits && totalScheduled > 0 && (
        <div className="mt-8 flex items-center justify-between text-sm text-ink-muted">
          <span>
            {doneCount} of {totalScheduled} done
          </span>
          <button
            type="button"
            className="btn-ghost"
            onClick={() => {
              if (doneCount > 0) setConfirmRegen(true);
              else regenerateToday();
            }}
          >
            Regenerate
          </button>
        </div>
      )}

      <ConfirmDialog
        open={confirmRegen}
        title="Regenerate today’s list?"
        body={
          <>
            You’ve already acted on {doneCount} habit{doneCount === 1 ? '' : 's'} today.
            Regenerating will replace the rest of today’s list with a fresh pick.
            Already-rated and skipped habits will stay logged.
          </>
        }
        confirmLabel="Regenerate"
        onConfirm={() => {
          setConfirmRegen(false);
          regenerateToday();
        }}
        onCancel={() => setConfirmRegen(false)}
      />
    </Header>
  );
}

function Header({
  date,
  children,
}: {
  date: string;
  children: React.ReactNode;
}) {
  return (
    <section className="pb-8">
      <header className="mb-6">
        <p className="text-sm text-ink-muted">Today</p>
        <h1 className="text-[26px] font-medium leading-tight text-ink">
          {formatLongDate(date)}
        </h1>
      </header>
      {children}
    </section>
  );
}

function EmptyNoHabits() {
  return (
    <div className="card p-6 text-center">
      <h2 className="text-lg font-medium text-ink">No habits yet</h2>
      <p className="mt-1.5 text-sm text-ink-muted">
        Add a habit and the app will start picking your daily lineup.
      </p>
      <Link href="/habits" className="btn-primary mt-5">
        Add your first habit
      </Link>
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="card p-6 text-center">
      <h2 className="text-lg font-medium text-ink">{title}</h2>
      <p className="mt-1.5 text-sm text-ink-muted">{subtitle}</p>
    </div>
  );
}
