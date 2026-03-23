'use client';

import { useState } from 'react';
import { UtensilsCrossed } from 'lucide-react';
import { useDietStore } from '@/store/dietStore';
import { User, MealType } from '@/lib/types';
import { findSharedMeals, calculateOverlapScore } from '@/lib/shareUtils';
import { DaySelector } from '@/components/DaySelector';
import { UserMealSection } from '@/components/UserMealSection';
import { SharedPrepSection } from '@/components/SharedPrepSection';
import { ActionButtons } from '@/components/ActionButtons';
import { EditMealModal } from '@/components/EditMealModal';

export default function Home() {
  const { weeklyPlan, selectedDay, updateMeal, updateSharedPrep, resetDayToDefault } = useDietStore();
  const [editingMeal, setEditingMeal] = useState<{ user: User; mealType: MealType } | null>(null);

  const jacksonDayPlan = weeklyPlan.jackson[selectedDay];
  const rymmaDayPlan = weeklyPlan.rymma[selectedDay];
  const sharedPrep = weeklyPlan.sharedPrep[selectedDay];
  const sharedMeals = findSharedMeals(weeklyPlan, selectedDay);
  const overlapScore = calculateOverlapScore(weeklyPlan, selectedDay);

  const handleEditMeal = (user: User, mealType: MealType) => {
    setEditingMeal({ user, mealType });
  };

  const handleSaveMeal = (text: string, saveAsDefault: boolean) => {
    if (!editingMeal) return;
    updateMeal(editingMeal.user, selectedDay, editingMeal.mealType, text, saveAsDefault);
    setEditingMeal(null);
  };

  const getEditingMeal = () => {
    if (!editingMeal) return null;
    const dayPlan = editingMeal.user === 'jackson' ? jacksonDayPlan : rymmaDayPlan;
    return dayPlan.meals[editingMeal.mealType];
  };

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="header-gradient sticky top-0 z-10 px-4 py-4 border-b border-stone-200 shadow-sm">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <UtensilsCrossed className="w-6 h-6 text-emerald-600" />
            <h1 className="text-xl font-bold text-stone-800">Diet Planner</h1>
          </div>
          <DaySelector />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Shared Prep Section */}
        <div className="mb-6">
          <SharedPrepSection
            sharedPrep={sharedPrep}
            overlapScore={overlapScore}
            onUpdate={(notes) => updateSharedPrep(selectedDay, notes)}
          />
        </div>

        {/* Users' Meals - Side by Side on larger screens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <UserMealSection
            user="jackson"
            dayPlan={jacksonDayPlan}
            sharedMeals={sharedMeals}
            onEditMeal={handleEditMeal}
          />
          <UserMealSection
            user="rymma"
            dayPlan={rymmaDayPlan}
            sharedMeals={sharedMeals}
            onEditMeal={handleEditMeal}
          />
        </div>

        {/* Action Buttons */}
        <div className="mt-6 pb-6">
          <ActionButtons
            weeklyPlan={weeklyPlan}
            day={selectedDay}
            onResetDay={() => resetDayToDefault(selectedDay)}
          />
        </div>
      </main>

      {/* Edit Modal */}
      <EditMealModal
        isOpen={editingMeal !== null}
        meal={getEditingMeal()}
        user={editingMeal?.user ?? 'jackson'}
        day={selectedDay}
        onSave={handleSaveMeal}
        onClose={() => setEditingMeal(null)}
      />
    </div>
  );
}
