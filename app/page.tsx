'use client';

import { useState, useEffect } from 'react';
import { useDietStore } from '@/store/dietStore';
import { User, MealType, Meal } from '@/lib/types';
import { findSharedMeals, calculateOverlapScore } from '@/lib/shareUtils';
import { DateHeader } from '@/components/DateHeader';
import { DaySelector } from '@/components/DaySelector';
import { UserMealSection } from '@/components/UserMealSection';
import { SharedPrepSection } from '@/components/SharedPrepSection';
import { ActionButtons } from '@/components/ActionButtons';
import { EditMealModal } from '@/components/EditMealModal';
import { SupplementsSection } from '@/components/SupplementsSection';
import { WeightEntryModal } from '@/components/WeightEntryModal';

export default function Home() {
  const { weeklyPlan, selectedDay, selectedDate, updateMeal, updateSharedPrep, resetDayToDefault, needsWeightEntry } = useDietStore();
  const [editingMeal, setEditingMeal] = useState<{ user: User; mealType: MealType } | null>(null);
  const [weightModalUser, setWeightModalUser] = useState<User | null>(null);
  const [hasCheckedWeight, setHasCheckedWeight] = useState(false);

  // Check if weight entry is needed on mount
  useEffect(() => {
    if (hasCheckedWeight) return;

    // Small delay to ensure store is hydrated
    const timer = setTimeout(() => {
      if (needsWeightEntry('jackson')) {
        setWeightModalUser('jackson');
      } else if (needsWeightEntry('rymma')) {
        setWeightModalUser('rymma');
      }
      setHasCheckedWeight(true);
    }, 500);

    return () => clearTimeout(timer);
  }, [needsWeightEntry, hasCheckedWeight]);

  const handleWeightModalClose = () => {
    // Check if the other user also needs weight entry
    if (weightModalUser === 'jackson' && needsWeightEntry('rymma')) {
      setWeightModalUser('rymma');
    } else {
      setWeightModalUser(null);
    }
  };

  const jacksonDayPlan = weeklyPlan.jackson[selectedDay];
  const rymmaDayPlan = weeklyPlan.rymma[selectedDay];
  const sharedPrep = weeklyPlan.sharedPrep[selectedDay];
  const sharedMeals = findSharedMeals(weeklyPlan, selectedDay);
  const overlapScore = calculateOverlapScore(weeklyPlan, selectedDay);

  const handleEditMeal = (user: User, mealType: MealType) => {
    setEditingMeal({ user, mealType });
  };

  const handleSaveMeal = (updates: Partial<Meal>, saveAsDefault: boolean) => {
    if (!editingMeal) return;
    updateMeal(editingMeal.user, selectedDay, editingMeal.mealType, updates, saveAsDefault);
    setEditingMeal(null);
  };

  const getEditingMeal = () => {
    if (!editingMeal) return null;
    const dayPlan = editingMeal.user === 'jackson' ? jacksonDayPlan : rymmaDayPlan;
    return dayPlan.meals[editingMeal.mealType];
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Date Header with Share Button */}
      <DateHeader />

      {/* Day Selector */}
      <div className="sticky top-0 z-10 bg-stone-50">
        <div className="max-w-lg mx-auto">
          <DaySelector />
        </div>
      </div>

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
            day={selectedDay}
            dayPlan={jacksonDayPlan}
            sharedMeals={sharedMeals}
            onEditMeal={handleEditMeal}
          />
          <UserMealSection
            user="rymma"
            day={selectedDay}
            dayPlan={rymmaDayPlan}
            sharedMeals={sharedMeals}
            onEditMeal={handleEditMeal}
          />
        </div>

        {/* Supplements Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-stone-800 mb-4">Daily Supplements</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SupplementsSection user="jackson" date={selectedDate} />
            <SupplementsSection user="rymma" date={selectedDate} />
          </div>
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

      {/* Weight Entry Modal */}
      <WeightEntryModal
        isOpen={weightModalUser !== null}
        user={weightModalUser || 'jackson'}
        onClose={handleWeightModalClose}
      />
    </div>
  );
}
