'use client';

import { useRouter } from 'next/navigation';
import { useState, use as usePromise } from 'react';
import { useAppState } from '@/contexts/AppStateContext';
import HabitForm, { HabitFormValues } from '@/components/HabitForm';
import ConfirmDialog from '@/components/ConfirmDialog';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditHabitPage({ params }: PageProps) {
  const { id } = usePromise(params);
  const router = useRouter();
  const { state, hydrated, updateHabit, deleteHabit } = useAppState();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const habit = state.habits.find((h) => h.id === id);

  if (!hydrated) {
    return (
      <section className="pb-8">
        <p className="text-ink-muted">Loading…</p>
      </section>
    );
  }

  if (!habit) {
    return (
      <section className="pb-8">
        <header className="mb-6">
          <h1 className="text-[26px] font-medium leading-tight text-ink">
            Habit not found
          </h1>
        </header>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => router.push('/habits')}
        >
          Back to Habits
        </button>
      </section>
    );
  }

  const handleSave = (v: HabitFormValues) => {
    updateHabit(habit.id, v);
    router.push('/habits');
  };

  const handleDelete = () => {
    setConfirmDelete(false);
    deleteHabit(habit.id);
    router.push('/habits');
  };

  return (
    <section className="pb-8">
      <header className="mb-6">
        <p className="text-sm text-ink-muted">Edit</p>
        <h1 className="text-[26px] font-medium leading-tight text-ink">
          {habit.name}
        </h1>
      </header>

      <div className="card p-5">
        <HabitForm
          initialValues={{
            name: habit.name,
            weeklyTarget: habit.weeklyTarget,
            priority: habit.priority,
          }}
          submitLabel="Save"
          onSubmit={handleSave}
          onCancel={() => router.push('/habits')}
          secondaryAction={
            <button
              type="button"
              className="btn-destructive w-full"
              onClick={() => setConfirmDelete(true)}
            >
              Delete habit
            </button>
          }
        />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete "${habit.name}"?`}
        body={
          <>
            This also removes its completion history. This can’t be undone.
          </>
        }
        confirmLabel="Delete"
        destructive
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </section>
  );
}
