'use client';

import { useState, FormEvent } from 'react';
import { Priority } from '@/lib/domain/types';

export interface HabitFormValues {
  name: string;
  weeklyTarget: number;
  priority: Priority;
}

interface Props {
  initialValues?: HabitFormValues;
  submitLabel: string;
  onSubmit: (values: HabitFormValues) => void;
  onCancel?: () => void;
  /** Optional secondary action (e.g. Delete) rendered below the form. */
  secondaryAction?: React.ReactNode;
}

const DEFAULTS: HabitFormValues = {
  name: '',
  weeklyTarget: 3,
  priority: 'medium',
};

const PRIORITY_OPTIONS: { value: Priority; label: string }[] = [
  { value: 'high', label: 'High' },
  { value: 'medium', label: 'Medium' },
  { value: 'low', label: 'Low' },
];

export default function HabitForm({
  initialValues = DEFAULTS,
  submitLabel,
  onSubmit,
  onCancel,
  secondaryAction,
}: Props) {
  const [name, setName] = useState(initialValues.name);
  const [weeklyTarget, setWeeklyTarget] = useState(initialValues.weeklyTarget);
  const [priority, setPriority] = useState<Priority>(initialValues.priority);

  const trimmed = name.trim();
  const valid = trimmed.length > 0 && weeklyTarget >= 1 && weeklyTarget <= 7;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    onSubmit({ name: trimmed, weeklyTarget, priority });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="habit-name" className="field-label">
          Name
        </label>
        <input
          id="habit-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="field-input"
          placeholder="e.g. Read for 20 minutes"
          autoFocus
          autoComplete="off"
          required
        />
      </div>

      <div>
        <label htmlFor="habit-weekly-target" className="field-label">
          Weekly target
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary px-4"
            aria-label="Decrease weekly target"
            onClick={() => setWeeklyTarget((n) => Math.max(1, n - 1))}
          >
            −
          </button>
          <input
            id="habit-weekly-target"
            type="number"
            inputMode="numeric"
            min={1}
            max={7}
            value={weeklyTarget}
            onChange={(e) => {
              const n = Number(e.target.value);
              if (Number.isFinite(n)) {
                setWeeklyTarget(Math.min(7, Math.max(1, Math.round(n))));
              }
            }}
            className="field-input text-center w-20"
          />
          <button
            type="button"
            className="btn-secondary px-4"
            aria-label="Increase weekly target"
            onClick={() => setWeeklyTarget((n) => Math.min(7, n + 1))}
          >
            +
          </button>
          <span className="text-sm text-ink-muted">days/week</span>
        </div>
      </div>

      <div>
        <span className="field-label">Priority</span>
        <div className="grid grid-cols-3 gap-2">
          {PRIORITY_OPTIONS.map((opt) => {
            const selected = priority === opt.value;
            return (
              <button
                type="button"
                key={opt.value}
                onClick={() => setPriority(opt.value)}
                aria-pressed={selected}
                className={[
                  'rounded-lg border py-2.5 text-sm font-medium transition-colors',
                  selected
                    ? 'border-accent bg-accent-subtle text-accent-hover'
                    : 'border-hairline bg-surface text-ink hover:bg-accent-subtle',
                ].join(' ')}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex items-center justify-end gap-2 pt-2">
        {onCancel && (
          <button type="button" className="btn-secondary" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" className="btn-primary" disabled={!valid}>
          {submitLabel}
        </button>
      </div>

      {secondaryAction && <div className="pt-4">{secondaryAction}</div>}
    </form>
  );
}
