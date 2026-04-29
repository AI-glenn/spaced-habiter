'use client';

import { useState } from 'react';
import { Habit, Rating, RATING_LABEL } from '@/lib/domain/types';

interface Props {
  habit: Habit;
  onRate: (rating: Rating) => void;
  onSkip: () => void;
}

const RATINGS: Rating[] = ['easy', 'medium', 'hard'];

/**
 * Today-screen card. Three rating buttons + a subtler Skip.
 * On any action, the card fades briefly before the parent unmounts it.
 */
export default function HabitCard({ habit, onRate, onSkip }: Props) {
  const [acting, setActing] = useState(false);

  // Short fade so the user sees the action acknowledged before the
  // list reflows. Respects prefers-reduced-motion via global CSS.
  const trigger = (fn: () => void) => () => {
    if (acting) return;
    setActing(true);
    setTimeout(fn, 150);
  };

  return (
    <article
      className={`card p-5 transition-opacity duration-150 ${
        acting ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <h3 className="text-[19px] font-medium text-ink leading-snug">{habit.name}</h3>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {RATINGS.map((r) => (
          <button
            key={r}
            type="button"
            onClick={trigger(() => onRate(r))}
            className="rounded-lg border border-hairline bg-surface py-3 text-sm font-medium text-ink
                       transition-colors hover:bg-accent-subtle active:bg-accent-subtle"
            aria-label={`Mark ${habit.name} done — ${RATING_LABEL[r]}`}
          >
            {RATING_LABEL[r]}
          </button>
        ))}
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={trigger(onSkip)}
          className="text-sm text-ink-muted hover:text-ink underline-offset-2 hover:underline"
          aria-label={`Skip ${habit.name} today`}
        >
          Skip
        </button>
      </div>
    </article>
  );
}
