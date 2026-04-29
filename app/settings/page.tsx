'use client';

import { useAppState } from '@/contexts/AppStateContext';

const MIN = 1;
const MAX = 10;

export default function SettingsPage() {
  const { state, updateSettings } = useAppState();
  const capacity = state.settings.dailyCapacity;

  const setCapacity = (n: number) => {
    if (!Number.isFinite(n)) return;
    updateSettings({ dailyCapacity: Math.min(MAX, Math.max(MIN, Math.round(n))) });
  };

  return (
    <section className="pb-8">
      <header className="mb-6">
        <p className="text-sm text-ink-muted">Configure</p>
        <h1 className="text-[26px] font-medium leading-tight text-ink">Settings</h1>
      </header>

      <div className="card p-5">
        <h2 className="text-[17px] font-medium text-ink">Daily capacity</h2>
        <p className="mt-1 text-sm text-ink-muted">
          The maximum number of habits the app picks for you each day.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            className="btn-secondary px-4"
            aria-label="Decrease daily capacity"
            onClick={() => setCapacity(capacity - 1)}
            disabled={capacity <= MIN}
          >
            −
          </button>
          <input
            type="number"
            inputMode="numeric"
            min={MIN}
            max={MAX}
            value={capacity}
            onChange={(e) => setCapacity(Number(e.target.value))}
            className="field-input w-20 text-center"
            aria-label="Daily capacity"
          />
          <button
            type="button"
            className="btn-secondary px-4"
            aria-label="Increase daily capacity"
            onClick={() => setCapacity(capacity + 1)}
            disabled={capacity >= MAX}
          >
            +
          </button>
          <span className="text-sm text-ink-muted">habits/day</span>
        </div>
      </div>
    </section>
  );
}
