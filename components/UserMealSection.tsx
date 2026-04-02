'use client';

import { User, DayOfWeek, MealType, MEAL_TYPES, USER_LABELS, DayPlan } from '@/lib/types';
import { useDietStore } from '@/store/dietStore';
import { MealCard } from './MealCard';
import { MacroSummary } from './MacroSummary';

interface UserMealSectionProps {
  user: User;
  day: DayOfWeek;
  dayPlan: DayPlan;
  sharedMeals: MealType[] | Set<MealType>;
  onEditMeal: (user: User, mealType: MealType) => void;
  displayName?: string;
}

export function UserMealSection({ user, day, dayPlan, sharedMeals, onEditMeal, displayName }: UserMealSectionProps) {
  const { getEffectiveMeal } = useDietStore();

  const name = displayName || USER_LABELS[user];
  const sharedMealsArray = sharedMeals instanceof Set ? Array.from(sharedMeals) : sharedMeals;

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
            user === 'jackson' ? 'bg-blue-500' : 'bg-pink-500'
          }`}
        >
          {name[0].toUpperCase()}
        </div>
        <h2 className="text-lg font-semibold text-white">{name}</h2>
      </div>

      {/* Macro Summary */}
      <div className="mb-4">
        <MacroSummary user={user} day={day} />
      </div>

      <div className="space-y-3">
        {MEAL_TYPES.map(({ key }) => {
          const { meal, isOverride, sourceDay } = getEffectiveMeal(user, day, key);

          return (
            <MealCard
              key={key}
              meal={meal}
              user={user}
              day={day}
              isShared={sharedMealsArray.includes(key)}
              isOverride={isOverride}
              sourceDay={sourceDay}
              onEdit={() => onEditMeal(user, key)}
            />
          );
        })}
      </div>
    </div>
  );
}
