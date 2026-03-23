'use client';

import { User, DayOfWeek, MealType, MEAL_TYPES, USER_LABELS, DayPlan } from '@/lib/types';
import { MealCard } from './MealCard';

interface UserMealSectionProps {
  user: User;
  dayPlan: DayPlan;
  sharedMeals: MealType[];
  onEditMeal: (user: User, mealType: MealType) => void;
}

export function UserMealSection({ user, dayPlan, sharedMeals, onEditMeal }: UserMealSectionProps) {
  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
            user === 'jackson' ? 'bg-blue-500' : 'bg-pink-500'
          }`}
        >
          {USER_LABELS[user][0]}
        </div>
        <h2 className="text-lg font-semibold text-stone-800">{USER_LABELS[user]}</h2>
      </div>

      <div className="space-y-3">
        {MEAL_TYPES.map(({ key }) => (
          <MealCard
            key={key}
            meal={dayPlan.meals[key]}
            isShared={sharedMeals.includes(key)}
            onEdit={() => onEditMeal(user, key)}
          />
        ))}
      </div>
    </div>
  );
}
