'use client';

interface Props {
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  /** Accessible label applied to the input and to ± buttons. */
  label: string;
  /** Optional unit string shown beside the input (e.g. "days/week"). */
  unit?: string;
  inputId?: string;
}

const clamp = (n: number, min: number, max: number) =>
  Math.min(max, Math.max(min, n));

/** Minimal numeric stepper: − [n] + with optional unit label. */
export default function NumberStepper({
  value,
  min,
  max,
  onChange,
  label,
  unit,
  inputId,
}: Props) {
  const set = (n: number) => {
    if (Number.isFinite(n)) onChange(clamp(Math.round(n), min, max));
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        className="btn-secondary px-4"
        aria-label={`Decrease ${label}`}
        onClick={() => set(value - 1)}
        disabled={value <= min}
      >
        −
      </button>
      <input
        id={inputId}
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        onChange={(e) => set(Number(e.target.value))}
        className="field-input w-20 text-center"
        aria-label={label}
      />
      <button
        type="button"
        className="btn-secondary px-4"
        aria-label={`Increase ${label}`}
        onClick={() => set(value + 1)}
        disabled={value >= max}
      >
        +
      </button>
      {unit && <span className="text-sm text-ink-muted">{unit}</span>}
    </div>
  );
}
