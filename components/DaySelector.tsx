'use client';

import { DayOfWeek, DAYS, DAY_LABELS } from '@/lib/types';
import { useDietStore } from '@/store/dietStore';

export function DaySelector() {
  const { selectedDay, setSelectedDay } = useDietStore();

  return (
    <div className="sticky top-0 z-10 bg-stone-50 border-b border-stone-200 -mx-4 px-4 py-3">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {DAYS.map((day) => (
          <button
            key={day}
            onClick={() => setSelectedDay(day)}
            className={`
              flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
              ${
                selectedDay === day
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
              }
            `}
          >
            {DAY_LABELS[day].slice(0, 3)}
          </button>
        ))}
      </div>
    </div>
  );
}
