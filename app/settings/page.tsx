'use client';

import { useAppState } from '@/contexts/AppStateContext';
import NumberStepper from '@/components/NumberStepper';

export default function SettingsPage() {
  const { state, updateSettings } = useAppState();

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
        <div className="mt-4">
          <NumberStepper
            value={state.settings.dailyCapacity}
            min={1}
            max={10}
            onChange={(n) => updateSettings({ dailyCapacity: n })}
            label="daily capacity"
            unit="habits/day"
          />
        </div>
      </div>
    </section>
  );
}
