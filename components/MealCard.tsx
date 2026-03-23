'use client';

import { Pencil, Check } from 'lucide-react';
import { Meal, MealType, MEAL_TYPES } from '@/lib/types';

interface MealCardProps {
  meal: Meal;
  isShared?: boolean;
  onEdit: () => void;
}

const mealIcons: Record<MealType, string> = {
  breakfast: '🌅',
  morningSnack: '🍎',
  lunch: '🍽️',
  afternoonSnack: '🥜',
  dinner: '🌙',
};

export function MealCard({ meal, isShared, onEdit }: MealCardProps) {
  const label = MEAL_TYPES.find((m) => m.key === meal.type)?.label || meal.type;

  return (
    <div
      className={`
        bg-white rounded-xl p-4 shadow-sm border transition-all
        ${isShared ? 'border-emerald-200 bg-emerald-50/50' : 'border-stone-100'}
      `}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{mealIcons[meal.type]}</span>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              {label}
            </span>
            {isShared && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Shared
              </span>
            )}
            {meal.isEdited && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Edited
              </span>
            )}
          </div>
          <p className="text-stone-800 text-sm leading-relaxed">{meal.text}</p>
        </div>
        <button
          onClick={onEdit}
          className="flex-shrink-0 p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
          aria-label="Edit meal"
        >
          <Pencil className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
