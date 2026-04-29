'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import { formatLongDate, todayISO } from '@/lib/domain/week';
import HabitCard from '@/components/HabitCard';
import ConfirmDialog from '@/components/ConfirmDialog';

export default function TodayPage() {
  const { state, hydrated, rateToday, skipToday, regenerateToday } = useAppState();
  const [confirmRegen, setConfirmRegen] = useState(false);
  const today = todayISO();

  const { active, doneCount, totalScheduled } = useTodayView(state, today);

  const handleRegenerate = () => {
    if (doneCount > 0) setConfirmRegen(true);
    else regenerateToday();
  };

  return (
    <section className="pb-8">
      <header className="mb-6">
        <p className="text-sm text-ink-muted">Today</p>
        <h1 className="text-[26px] font-medium leading-tight text-ink">
          {formatLongDate(today)}
        </h1>
      </header>

      {!hydrated ? (
        <p className="text-ink-muted">Loading…</p>
      ) : state.habits.length === 0 ? (
        <EmptyNoHabits />
      ) : totalScheduled === 0 ? (
        // TODO(algorithm-thread): empty-day copy depends on what the
        // final scheduler decides to do here.
        <EmptyState
          title="Nothing scheduled today"
          subtitle="Nice work — you’re on track for the week."
        />
      ) : (
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

          {active.length === 0 && (
            <div className="card mt-2 p-5 text-center">
              <p className="text-[17px] font-medium text-ink">Done for today</p>
              <p className="mt-1 text-sm text-ink-muted">
                {doneCount} of {totalScheduled} done
              </p>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between text-sm text-ink-muted">
            <span>
              {doneCount} of {totalScheduled} done
            </span>
            <button type="button" className="btn-ghost" onClick={handleRegenerate}>
              Regenerate
            </button>
          </div>
        </>
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
    </section>
  );
}

function useTodayView(state: ReturnType<typeof useAppState>['state'], today: string) {
  return useMemo(() => {
    const schedule = state.todaySchedule;
    if (!schedule) return { active: [], doneCount: 0, totalScheduled: 0 };

    const actedIds = new Set<string>();
    for (const c of state.completions) if (c.date === today) actedIds.add(c.habitId);
    for (const s of state.skips) if (s.date === today) actedIds.add(s.habitId);

    const habitsById = new Map(state.habits.map((h) => [h.id, h]));
    const active = schedule.habitIds
      .filter((id) => !actedIds.has(id))
      .map((id) => habitsById.get(id))
      .filter((h): h is NonNullable<typeof h> => Boolean(h));

    return {
      active,
      doneCount: actedIds.size,
      totalScheduled: schedule.habitIds.length,
    };
  }, [state.todaySchedule, state.completions, state.skips, state.habits, today]);
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
