'use client';

import { useDietStore } from '@/store/dietStore';
import { User, DayOfWeek, MEAL_TYPES } from '@/lib/types';

interface MacroSummaryProps {
  user: User;
  day: DayOfWeek;
}

export function MacroSummary({ user, day }: MacroSummaryProps) {
  const { weeklyPlan, profiles } = useDietStore();
  const profile = profiles[user];
  const dayPlan = weeklyPlan[user][day];

  // Calculate totals from all meals (not just completed)
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;
  let completedCount = 0;

  Object.values(dayPlan.meals).forEach((meal) => {
    totalCalories += meal.calories || 0;
    totalProtein += meal.protein || 0;
    totalCarbs += meal.carbs || 0;
    totalFat += meal.fat || 0;
    if (meal.completed) completedCount++;
  });

  const totalMeals = MEAL_TYPES.length;
  const completionPercent = Math.round((completedCount / totalMeals) * 100);

  const caloriePercent = Math.min(100, Math.round((totalCalories / profile.target_calories) * 100));
  const proteinPercent = Math.min(100, Math.round((totalProtein / profile.target_protein) * 100));
  const carbsPercent = Math.min(100, Math.round((totalCarbs / profile.target_carbs) * 100));
  const fatPercent = Math.min(100, Math.round((totalFat / profile.target_fat) * 100));

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
      {/* Completion indicator */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-stone-600">
          {completedCount}/{totalMeals} meals completed
        </span>
        <span className="text-xs text-stone-500">{completionPercent}%</span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full mb-4">
        <div
          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
          style={{ width: `${completionPercent}%` }}
        />
      </div>

      {/* Macro bars */}
      <div className="space-y-3">
        <MacroBar
          label="Calories"
          value={totalCalories}
          target={profile.target_calories}
          percent={caloriePercent}
          color="bg-orange-500"
          unit="cal"
        />
        <MacroBar
          label="Protein"
          value={totalProtein}
          target={profile.target_protein}
          percent={proteinPercent}
          color="bg-blue-500"
          unit="g"
        />
        <MacroBar
          label="Carbs"
          value={totalCarbs}
          target={profile.target_carbs}
          percent={carbsPercent}
          color="bg-amber-500"
          unit="g"
        />
        <MacroBar
          label="Fat"
          value={totalFat}
          target={profile.target_fat}
          percent={fatPercent}
          color="bg-purple-500"
          unit="g"
        />
      </div>
    </div>
  );
}

interface MacroBarProps {
  label: string;
  value: number;
  target: number;
  percent: number;
  color: string;
  unit: string;
}

function MacroBar({ label, value, target, percent, color, unit }: MacroBarProps) {
  const isOver = value > target;

  return (
    <div>
      <div className="flex items-center justify-between text-xs mb-1">
        <span className="font-medium text-stone-700">{label}</span>
        <span className={isOver ? 'text-red-600 font-medium' : 'text-stone-500'}>
          {value} / {target} {unit}
        </span>
      </div>
      <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-red-500' : color}`}
          style={{ width: `${Math.min(100, percent)}%` }}
        />
      </div>
    </div>
  );
}
