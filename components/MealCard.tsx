'use client';

import { Pencil, Check, ArrowLeftRight, X } from 'lucide-react';
import { Meal, MealType, MEAL_TYPES, DayOfWeek, DAYS, DAY_LABELS, User } from '@/lib/types';
import { useDietStore } from '@/store/dietStore';
import { useState } from 'react';

interface MealCardProps {
  meal: Meal;
  user: User;
  day: DayOfWeek;
  isShared?: boolean;
  isOverride?: boolean;
  sourceDay?: DayOfWeek;
  onEdit: () => void;
}

const mealIcons: Record<MealType, string> = {
  breakfast: '🌅',
  morningSnack: '🍎',
  lunch: '🍽️',
  afternoonSnack: '🥜',
  dinner: '🌙',
};

export function MealCard({ meal, user, day, isShared, isOverride, sourceDay, onEdit }: MealCardProps) {
  const { toggleMealCompletion, replaceMealTemporarily, clearMealOverride } = useDietStore();
  const [showReplaceMenu, setShowReplaceMenu] = useState(false);

  const label = MEAL_TYPES.find((m) => m.key === meal.type)?.label || meal.type;
  const hasMacros = meal.calories || meal.protein || meal.carbs || meal.fat;

  const handleToggleComplete = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleMealCompletion(user, day, meal.type);
  };

  const handleReplace = (sourceDay: DayOfWeek) => {
    replaceMealTemporarily(user, day, meal.type, sourceDay);
    setShowReplaceMenu(false);
  };

  const handleUndoReplace = () => {
    clearMealOverride(user, day, meal.type);
  };

  const otherDays = DAYS.filter((d) => d !== day);

  return (
    <div
      className={`
        bg-white rounded-xl p-4 shadow-sm border transition-all relative
        ${meal.completed ? 'border-emerald-300 bg-emerald-50/30' : ''}
        ${isOverride ? 'border-blue-300 bg-blue-50/30' : ''}
        ${isShared && !meal.completed && !isOverride ? 'border-emerald-200 bg-emerald-50/50' : ''}
        ${!isShared && !meal.completed && !isOverride ? 'border-stone-100' : ''}
      `}
    >
      <div className="flex items-start gap-3">
        {/* Completion checkbox */}
        <button
          onClick={handleToggleComplete}
          className={`
            flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all mt-0.5
            ${
              meal.completed
                ? 'bg-emerald-500 border-emerald-500 text-white'
                : 'border-stone-300 hover:border-emerald-400'
            }
          `}
        >
          {meal.completed && <Check className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-lg">{mealIcons[meal.type]}</span>
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wide">
              {label}
            </span>
            {isOverride && sourceDay && (
              <span className="inline-flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                <ArrowLeftRight className="w-3 h-3" />
                From {DAY_LABELS[sourceDay]}
                <button
                  onClick={handleUndoReplace}
                  className="ml-1 hover:text-blue-800"
                  title="Undo replacement"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}
            {isShared && !isOverride && (
              <span className="inline-flex items-center gap-1 text-xs text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">
                <Check className="w-3 h-3" />
                Shared
              </span>
            )}
            {meal.isEdited && !isOverride && (
              <span className="text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                Edited
              </span>
            )}
            {meal.completed && meal.completedAt && (
              <span className="text-xs text-emerald-600">
                {new Date(meal.completedAt).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
          </div>

          <p
            className={`text-sm leading-relaxed ${
              meal.completed ? 'text-stone-500 line-through' : 'text-stone-800'
            }`}
          >
            {meal.text}
          </p>

          {/* Macros display */}
          {hasMacros && (
            <div className="flex items-center gap-3 mt-2 text-xs">
              {meal.calories && (
                <span className="text-orange-600 font-medium">{meal.calories} cal</span>
              )}
              {meal.protein && <span className="text-blue-600">P: {meal.protein}g</span>}
              {meal.carbs && <span className="text-amber-600">C: {meal.carbs}g</span>}
              {meal.fat && <span className="text-purple-600">F: {meal.fat}g</span>}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          {/* Replace dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowReplaceMenu(!showReplaceMenu)}
              className="p-2 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              aria-label="Replace meal"
              title="Replace with meal from another day"
            >
              <ArrowLeftRight className="w-4 h-4" />
            </button>

            {showReplaceMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowReplaceMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border border-stone-200 py-1 z-20 min-w-[160px]">
                  <p className="px-3 py-1 text-xs text-stone-500 font-medium">Replace with {label.toLowerCase()} from:</p>
                  {otherDays.map((d) => (
                    <button
                      key={d}
                      onClick={() => handleReplace(d)}
                      className="w-full px-3 py-2 text-left text-sm hover:bg-stone-50 transition-colors"
                    >
                      {DAY_LABELS[d]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Edit button */}
          <button
            onClick={onEdit}
            className="p-2 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
            aria-label="Edit meal"
          >
            <Pencil className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
