'use client';

import { useDietStore } from '@/store/dietStore';
import { MEAL_TYPES, MealType, User } from '@/lib/types';
import { generateCookMenuText, shareOrCopyMenu, EffectiveMeals } from '@/lib/shareUtils';
import { Calendar, Share2, ChevronLeft, ChevronRight, Check, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

export function DateHeader() {
  const { selectedDay, selectedDate, weeklyPlan, selectToday, setSelectedDate, getEffectiveMeal, mealOverrides, clearAllOverrides } = useDietStore();
  const [showCopied, setShowCopied] = useState(false);

  // Auto-select today on mount
  useEffect(() => {
    selectToday();
  }, [selectToday]);

  // Check if there are any active overrides
  const hasOverrides = Object.keys(mealOverrides).length > 0;

  const handleShare = async () => {
    // Build effective meals map with any overrides applied
    const effectiveMeals: EffectiveMeals = {
      jackson: {} as Record<MealType, any>,
      rymma: {} as Record<MealType, any>,
    };

    (['jackson', 'rymma'] as User[]).forEach((user) => {
      MEAL_TYPES.forEach(({ key }) => {
        const { meal } = getEffectiveMeal(user, selectedDay, key);
        effectiveMeals[user][key] = meal;
      });
    });

    const menuText = generateCookMenuText(weeklyPlan, selectedDay, selectedDate, effectiveMeals);
    const result = await shareOrCopyMenu(menuText);

    if (result.shared || result.copied) {
      setShowCopied(true);
      setTimeout(() => setShowCopied(false), 2000);
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + (direction === 'next' ? 1 : -1));
    setSelectedDate(current.toISOString().split('T')[0]);
  };

  const formattedDate = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  const isToday = selectedDate === new Date().toISOString().split('T')[0];

  return (
    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white -mx-4 px-4 py-4 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 opacity-80" />
          <div>
            <h1 className="text-lg font-semibold">{formattedDate}</h1>
            {!isToday && (
              <button
                onClick={selectToday}
                className="text-xs text-emerald-200 hover:text-white transition-colors"
              >
                Go to Today
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateDate('prev')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigateDate('next')}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full text-sm font-medium transition-all"
        >
          {showCopied ? (
            <>
              <Check className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              Share Menu with Cook
            </>
          )}
        </button>

        {hasOverrides && (
          <button
            onClick={clearAllOverrides}
            className="flex items-center gap-2 px-3 py-2 bg-blue-500/30 hover:bg-blue-500/40 rounded-full text-sm font-medium transition-all"
            title="Clear all temporary replacements"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        )}
      </div>

      {hasOverrides && (
        <p className="mt-2 text-xs text-emerald-200">
          Some meals are temporarily replaced for today's menu
        </p>
      )}
    </div>
  );
}
