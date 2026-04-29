'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Plus } from 'lucide-react';
import { useAppState } from '@/contexts/AppStateContext';
import HabitForm, { HabitFormValues } from '@/components/HabitForm';

export default function HabitsPage() {
  const { state, addHabit } = useAppState();
  const [creating, setCreating] = useState(false);

  const handleCreate = (v: HabitFormValues) => {
    addHabit(v);
    setCreating(false);
  };

  return (
    <section className="pb-8">
      <header className="mb-6 flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-muted">Manage</p>
          <h1 className="text-[26px] font-medium leading-tight text-ink">Habits</h1>
        </div>
        {!creating && (
          <button
            type="button"
            onClick={() => setCreating(true)}
            className="btn-primary"
            aria-label="Add habit"
          >
            <Plus size={16} strokeWidth={2} className="mr-1" />
            Add
          </button>
        )}
      </header>

      {creating && (
        <div className="card p-5 mb-6">
          <h2 className="text-lg font-medium text-ink mb-4">New habit</h2>
          <HabitForm
            submitLabel="Save"
            onSubmit={handleCreate}
            onCancel={() => setCreating(false)}
          />
        </div>
      )}

      {state.habits.length === 0 && !creating ? (
        <div className="card p-6 text-center">
          <h2 className="text-lg font-medium text-ink">No habits yet</h2>
          <p className="mt-1.5 text-sm text-ink-muted">
            Add your first habit to start.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {state.habits.map((h) => (
            <li key={h.id}>
              <Link
                href={`/habits/${h.id}`}
                className="card flex items-center justify-between p-4 transition-colors hover:bg-accent-subtle"
              >
                <div>
                  <p className="text-[17px] font-medium text-ink">{h.name}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">
                    {h.weeklyTarget}× / week · {labelForPriority(h.priority)} priority
                  </p>
                </div>
                <span aria-hidden className="text-ink-muted">
                  ›
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function labelForPriority(p: 'high' | 'medium' | 'low'): string {
  return p === 'high' ? 'High' : p === 'medium' ? 'Medium' : 'Low';
}
