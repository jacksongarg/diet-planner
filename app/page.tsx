'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Settings, UserPlus, Utensils } from 'lucide-react';
import { useDietStore } from '@/store/dietStore';
import { useAuthStore } from '@/store/authStore';
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
import { NotificationBell } from '@/components/NotificationBell';
import { ModeToggle } from '@/components/ModeToggle';
import { AddConnectionModal } from '@/components/AddConnectionModal';
import { PartnerSelector } from '@/components/PartnerSelector';

export default function Home() {
  const { weeklyPlan, selectedDay, selectedDate, updateMeal, updateSharedPrep, resetDayToDefault, needsWeightEntry } = useDietStore();
  const { user, isAuthenticated, isLoading, viewMode, connectedUsers, activePartner } = useAuthStore();

  const [editingMeal, setEditingMeal] = useState<{ user: User; mealType: MealType } | null>(null);
  const [weightModalUser, setWeightModalUser] = useState<User | null>(null);
  const [hasCheckedWeight, setHasCheckedWeight] = useState(false);
  const [showAddConnection, setShowAddConnection] = useState(false);

  // Check if weight entry is needed on mount
  useEffect(() => {
    if (hasCheckedWeight) return;

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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Utensils className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">Diet Planner</h1>
          <p className="text-zinc-400 mb-8">
            Track your meals, connect with your partner, and reach your nutrition goals together.
          </p>
          <div className="space-y-3">
            <Link
              href="/login"
              className="block w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="block w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-xl transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Determine which users to show based on view mode
  const showBothUsers = viewMode === 'couple' && activePartner;
  const currentUserName = user?.name || 'You';

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      {/* App Header */}
      <header className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Diet Planner</h1>
            <p className="text-sm text-zinc-400">
              {viewMode === 'couple' && activePartner
                ? `You & ${activePartner.name}`
                : `Welcome, ${currentUserName}`
              }
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NotificationBell />
            <ModeToggle compact />
            <Link
              href="/profile"
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5 text-zinc-400" />
            </Link>
          </div>
        </div>
      </header>

      {/* Partner Selector for Couple Mode */}
      {viewMode === 'couple' && (
        <div className="bg-zinc-900 border-b border-zinc-800 px-4 py-3">
          <div className="max-w-lg mx-auto">
            {connectedUsers.length > 0 ? (
              <PartnerSelector />
            ) : (
              <button
                onClick={() => setShowAddConnection(true)}
                className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                Add Partner to Start
              </button>
            )}
          </div>
        </div>
      )}

      {/* Date Header with Share Button */}
      <DateHeader />

      {/* Day Selector */}
      <div className="sticky top-0 z-10 bg-zinc-950">
        <div className="max-w-lg mx-auto">
          <DaySelector />
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6">
        {/* Shared Prep Section - only in couple mode */}
        {showBothUsers && (
          <div className="mb-6">
            <SharedPrepSection
              sharedPrep={sharedPrep}
              overlapScore={overlapScore}
              onUpdate={(notes) => updateSharedPrep(selectedDay, notes)}
            />
          </div>
        )}

        {/* Users' Meals */}
        <div className={`grid gap-4 ${showBothUsers ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
          {/* Current User's Meals (using jackson data for now) */}
          <UserMealSection
            user="jackson"
            day={selectedDay}
            dayPlan={jacksonDayPlan}
            sharedMeals={showBothUsers ? sharedMeals : new Set()}
            onEditMeal={handleEditMeal}
            displayName={currentUserName}
          />

          {/* Partner's Meals - only in couple mode */}
          {showBothUsers && (
            <UserMealSection
              user="rymma"
              day={selectedDay}
              dayPlan={rymmaDayPlan}
              sharedMeals={sharedMeals}
              onEditMeal={handleEditMeal}
              displayName={activePartner?.name || 'Partner'}
            />
          )}
        </div>

        {/* Supplements Section */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-white mb-4">Daily Supplements</h2>
          <div className={`grid gap-4 ${showBothUsers ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1'}`}>
            <SupplementsSection user="jackson" date={selectedDate} />
            {showBothUsers && (
              <SupplementsSection user="rymma" date={selectedDate} />
            )}
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

      {/* Add Connection Modal */}
      <AddConnectionModal
        isOpen={showAddConnection}
        onClose={() => setShowAddConnection(false)}
      />
    </div>
  );
}
