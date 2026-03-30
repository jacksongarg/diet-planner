'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  WeeklyPlan,
  DayOfWeek,
  MealType,
  User,
  Meal,
  DAYS,
  UserProfile,
  Supplement,
  SupplementEntry,
  DailyStats,
  DietStreak,
  WeightEntry,
} from '@/lib/types';
import { initialWeeklyPlan, defaultProfiles, defaultSupplements } from '@/lib/initialData';

// Helper to get today's day of week
function getTodayDayOfWeek(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date().getDay();
  return days[today];
}

// Helper to get current date string (YYYY-MM-DD)
function getDateString(date: Date = new Date()): string {
  return date.toISOString().split('T')[0];
}

// Helper to calculate BMR using Mifflin-St Jeor equation
function calculateBMR(profile: UserProfile): number {
  const { weight_kg, height_cm, age, gender } = profile;
  if (gender === 'male') {
    return 10 * weight_kg + 6.25 * height_cm - 5 * age + 5;
  }
  return 10 * weight_kg + 6.25 * height_cm - 5 * age - 161;
}

// Activity multipliers
const activityMultipliers = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extremely_active: 1.9,
};

// Goal calorie adjustments
const goalAdjustments = {
  lose_weight: -500,
  maintain_weight: 0,
  gain_muscle: 300,
  improve_health: 0,
};

// Calculate TDEE and macro targets
export function calculateTargets(profile: UserProfile): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const bmr = calculateBMR(profile);
  const tdee = bmr * activityMultipliers[profile.activity_level];
  const calories = Math.round(tdee + goalAdjustments[profile.goal]);

  // Macro distribution: 30% protein, 40% carbs, 30% fat (adjustable based on goal)
  let proteinPercent = 0.3;
  let carbPercent = 0.4;
  let fatPercent = 0.3;

  if (profile.goal === 'gain_muscle') {
    proteinPercent = 0.35;
    carbPercent = 0.4;
    fatPercent = 0.25;
  } else if (profile.goal === 'lose_weight') {
    proteinPercent = 0.35;
    carbPercent = 0.35;
    fatPercent = 0.3;
  }

  return {
    calories,
    protein: Math.round((calories * proteinPercent) / 4), // 4 cal per gram protein
    carbs: Math.round((calories * carbPercent) / 4), // 4 cal per gram carbs
    fat: Math.round((calories * fatPercent) / 9), // 9 cal per gram fat
  };
}

// Meal override type - stores the source day for a temporary replacement
interface MealOverride {
  sourceDay: DayOfWeek;
  sourceMeal: Meal;
}

// Key for meal overrides: "date-user-mealType"
type OverrideKey = string;

interface DietState {
  weeklyPlan: WeeklyPlan;
  defaultPlan: WeeklyPlan;
  selectedDay: DayOfWeek;
  selectedDate: string; // YYYY-MM-DD

  // Temporary meal overrides (not persisted, reset daily)
  mealOverrides: Record<OverrideKey, MealOverride>;

  // User profiles
  profiles: Record<User, UserProfile>;

  // Supplements
  supplements: Record<User, Supplement[]>;
  supplementTracker: Record<string, SupplementEntry[]>; // keyed by "YYYY-MM-DD-user"

  // Analytics
  dailyStats: DailyStats[];
  streaks: Record<User, DietStreak>;

  // Weight tracking
  weightEntries: Record<User, WeightEntry[]>;
  weightPromptDismissed: Record<string, boolean>; // keyed by "YYYY-MM-DD-user"

  // Actions
  setSelectedDay: (day: DayOfWeek) => void;
  setSelectedDate: (date: string) => void;
  selectToday: () => void;

  // Meal actions
  updateMeal: (user: User, day: DayOfWeek, mealType: MealType, updates: Partial<Meal>, saveAsDefault: boolean) => void;
  toggleMealCompletion: (user: User, day: DayOfWeek, mealType: MealType) => void;

  // Temporary replacement actions
  replaceMealTemporarily: (user: User, targetDay: DayOfWeek, mealType: MealType, sourceDay: DayOfWeek) => void;
  clearMealOverride: (user: User, day: DayOfWeek, mealType: MealType) => void;
  clearAllOverrides: () => void;
  getEffectiveMeal: (user: User, day: DayOfWeek, mealType: MealType) => { meal: Meal; isOverride: boolean; sourceDay?: DayOfWeek };
  hasOverride: (user: User, day: DayOfWeek, mealType: MealType) => boolean;

  // Shared prep
  updateSharedPrep: (day: DayOfWeek, notes: string[]) => void;

  // Reset actions
  resetDayToDefault: (day: DayOfWeek) => void;
  duplicatePreviousDay: (targetDay: DayOfWeek) => void;
  resetAllToDefault: () => void;

  // Profile actions
  updateProfile: (user: User, profile: Partial<UserProfile>) => void;
  recalculateTargets: (user: User) => void;

  // Supplement actions
  addSupplement: (user: User, supplement: Omit<Supplement, 'id' | 'created_at'>) => void;
  updateSupplement: (user: User, supplementId: string, updates: Partial<Supplement>) => void;
  removeSupplement: (user: User, supplementId: string) => void;
  toggleSupplementTaken: (user: User, supplementId: string, date: string) => void;

  // Analytics actions
  recordDailyStats: (date: string, user: User) => void;
  getDailyMacros: (user: User, day: DayOfWeek) => { calories: number; protein: number; carbs: number; fat: number; completed: number; total: number };
  getSupplementAdherence: (user: User, date: string) => { taken: number; total: number; percentage: number };

  // Import actions
  importPlanFromPDF: (plan: WeeklyPlan) => void;

  // Weight tracking actions
  recordWeight: (user: User, weight_kg: number, date?: string) => void;
  getLatestWeight: (user: User) => WeightEntry | null;
  getTodayWeight: (user: User) => WeightEntry | null;
  needsWeightEntry: (user: User) => boolean;
  dismissWeightPrompt: (user: User) => void;
}

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      weeklyPlan: initialWeeklyPlan,
      defaultPlan: initialWeeklyPlan,
      selectedDay: getTodayDayOfWeek(),
      selectedDate: getDateString(),

      // Temporary overrides - NOT persisted (see partialize below)
      mealOverrides: {},

      profiles: defaultProfiles,
      supplements: defaultSupplements,
      supplementTracker: {},
      dailyStats: [],
      streaks: {
        jackson: { user: 'jackson', current_streak: 0, longest_streak: 0 },
        rymma: { user: 'rymma', current_streak: 0, longest_streak: 0 },
      },

      // Weight tracking
      weightEntries: {
        jackson: [],
        rymma: [],
      },
      weightPromptDismissed: {},

      setSelectedDay: (day) => set({ selectedDay: day }),

      setSelectedDate: (date) => {
        const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
        set({ selectedDate: date, selectedDay: dayOfWeek });
      },

      selectToday: () => {
        set({
          selectedDay: getTodayDayOfWeek(),
          selectedDate: getDateString(),
        });
      },

      updateMeal: (user, day, mealType, updates, saveAsDefault) => {
        set((state) => {
          const currentMeal = state.weeklyPlan[user][day].meals[mealType];
          const updatedMeal: Meal = {
            ...currentMeal,
            ...updates,
            isEdited: true,
            lastUpdated: new Date().toISOString(),
          };

          const newWeeklyPlan = {
            ...state.weeklyPlan,
            [user]: {
              ...state.weeklyPlan[user],
              [day]: {
                ...state.weeklyPlan[user][day],
                meals: {
                  ...state.weeklyPlan[user][day].meals,
                  [mealType]: updatedMeal,
                },
              },
            },
          };

          if (saveAsDefault) {
            const newDefaultPlan = {
              ...state.defaultPlan,
              [user]: {
                ...state.defaultPlan[user],
                [day]: {
                  ...state.defaultPlan[user][day],
                  meals: {
                    ...state.defaultPlan[user][day].meals,
                    [mealType]: { ...updatedMeal, isEdited: false },
                  },
                },
              },
            };
            return { weeklyPlan: newWeeklyPlan, defaultPlan: newDefaultPlan };
          }

          return { weeklyPlan: newWeeklyPlan };
        });
      },

      toggleMealCompletion: (user, day, mealType) => {
        set((state) => {
          const currentMeal = state.weeklyPlan[user][day].meals[mealType];
          const isNowCompleted = !currentMeal.completed;

          const updatedMeal: Meal = {
            ...currentMeal,
            completed: isNowCompleted,
            completedAt: isNowCompleted ? new Date().toISOString() : undefined,
            lastUpdated: new Date().toISOString(),
          };

          return {
            weeklyPlan: {
              ...state.weeklyPlan,
              [user]: {
                ...state.weeklyPlan[user],
                [day]: {
                  ...state.weeklyPlan[user][day],
                  meals: {
                    ...state.weeklyPlan[user][day].meals,
                    [mealType]: updatedMeal,
                  },
                },
              },
            },
          };
        });
      },

      // Temporarily replace a meal with one from another day (one-way, not a swap)
      replaceMealTemporarily: (user, targetDay, mealType, sourceDay) => {
        const state = get();
        const date = state.selectedDate;
        // Include targetDay in the key so override only applies to that specific day
        const key = `${date}-${user}-${targetDay}-${mealType}`;
        const sourceMeal = state.weeklyPlan[user][sourceDay].meals[mealType];

        set((state) => ({
          mealOverrides: {
            ...state.mealOverrides,
            [key]: {
              sourceDay,
              sourceMeal: { ...sourceMeal },
            },
          },
        }));
      },

      clearMealOverride: (user, day, mealType) => {
        const state = get();
        const date = state.selectedDate;
        // Include day in the key to match the format used in replaceMealTemporarily
        const key = `${date}-${user}-${day}-${mealType}`;

        set((state) => {
          const newOverrides = { ...state.mealOverrides };
          delete newOverrides[key];
          return { mealOverrides: newOverrides };
        });
      },

      clearAllOverrides: () => {
        set({ mealOverrides: {} });
      },

      getEffectiveMeal: (user, day, mealType) => {
        const state = get();
        const date = state.selectedDate;
        // Include day in the key to only match overrides for this specific day
        const key = `${date}-${user}-${day}-${mealType}`;
        const override = state.mealOverrides[key];

        if (override) {
          return {
            meal: override.sourceMeal,
            isOverride: true,
            sourceDay: override.sourceDay,
          };
        }

        return {
          meal: state.weeklyPlan[user][day].meals[mealType],
          isOverride: false,
        };
      },

      hasOverride: (user, day, mealType) => {
        const state = get();
        const date = state.selectedDate;
        // Include day in the key to match the format used in other functions
        const key = `${date}-${user}-${day}-${mealType}`;
        return !!state.mealOverrides[key];
      },

      updateSharedPrep: (day, notes) => {
        set((state) => ({
          weeklyPlan: {
            ...state.weeklyPlan,
            sharedPrep: {
              ...state.weeklyPlan.sharedPrep,
              [day]: { day, notes },
            },
          },
        }));
      },

      resetDayToDefault: (day) => {
        set((state) => ({
          weeklyPlan: {
            ...state.weeklyPlan,
            jackson: {
              ...state.weeklyPlan.jackson,
              [day]: state.defaultPlan.jackson[day],
            },
            rymma: {
              ...state.weeklyPlan.rymma,
              [day]: state.defaultPlan.rymma[day],
            },
            sharedPrep: {
              ...state.weeklyPlan.sharedPrep,
              [day]: state.defaultPlan.sharedPrep[day],
            },
          },
          // Also clear any overrides for this day
          mealOverrides: {},
        }));
      },

      duplicatePreviousDay: (targetDay) => {
        const dayIndex = DAYS.indexOf(targetDay);
        if (dayIndex <= 0) return;

        const previousDay = DAYS[dayIndex - 1];

        set((state) => ({
          weeklyPlan: {
            ...state.weeklyPlan,
            jackson: {
              ...state.weeklyPlan.jackson,
              [targetDay]: {
                ...state.weeklyPlan.jackson[previousDay],
                day: targetDay,
              },
            },
            rymma: {
              ...state.weeklyPlan.rymma,
              [targetDay]: {
                ...state.weeklyPlan.rymma[previousDay],
                day: targetDay,
              },
            },
          },
        }));
      },

      resetAllToDefault: () => {
        set((state) => ({
          weeklyPlan: state.defaultPlan,
          mealOverrides: {},
        }));
      },

      // Profile actions
      updateProfile: (user, profileUpdates) => {
        set((state) => {
          const currentProfile = state.profiles[user];
          const updatedProfile: UserProfile = {
            ...currentProfile,
            ...profileUpdates,
            updated_at: new Date().toISOString(),
          };

          // Recalculate targets if relevant fields changed
          if (
            profileUpdates.weight_kg !== undefined ||
            profileUpdates.height_cm !== undefined ||
            profileUpdates.age !== undefined ||
            profileUpdates.gender !== undefined ||
            profileUpdates.activity_level !== undefined ||
            profileUpdates.goal !== undefined
          ) {
            const targets = calculateTargets(updatedProfile);
            updatedProfile.target_calories = targets.calories;
            updatedProfile.target_protein = targets.protein;
            updatedProfile.target_carbs = targets.carbs;
            updatedProfile.target_fat = targets.fat;
          }

          return {
            profiles: {
              ...state.profiles,
              [user]: updatedProfile,
            },
          };
        });
      },

      recalculateTargets: (user) => {
        set((state) => {
          const profile = state.profiles[user];
          const targets = calculateTargets(profile);

          return {
            profiles: {
              ...state.profiles,
              [user]: {
                ...profile,
                target_calories: targets.calories,
                target_protein: targets.protein,
                target_carbs: targets.carbs,
                target_fat: targets.fat,
                updated_at: new Date().toISOString(),
              },
            },
          };
        });
      },

      // Supplement actions
      addSupplement: (user, supplement) => {
        const newSupplement: Supplement = {
          ...supplement,
          id: `supp-${user}-${Date.now()}`,
          user,
          is_active: true,
          created_at: new Date().toISOString(),
        };

        set((state) => ({
          supplements: {
            ...state.supplements,
            [user]: [...state.supplements[user], newSupplement],
          },
        }));
      },

      updateSupplement: (user, supplementId, updates) => {
        set((state) => ({
          supplements: {
            ...state.supplements,
            [user]: state.supplements[user].map((s) =>
              s.id === supplementId ? { ...s, ...updates } : s
            ),
          },
        }));
      },

      removeSupplement: (user, supplementId) => {
        set((state) => ({
          supplements: {
            ...state.supplements,
            [user]: state.supplements[user].filter((s) => s.id !== supplementId),
          },
        }));
      },

      toggleSupplementTaken: (user, supplementId, date) => {
        const key = `${date}-${user}`;

        set((state) => {
          const currentEntries = state.supplementTracker[key] || [];
          const existingEntry = currentEntries.find((e) => e.supplement_id === supplementId);

          let newEntries: SupplementEntry[];

          if (existingEntry) {
            // Toggle the taken status
            newEntries = currentEntries.map((e) =>
              e.supplement_id === supplementId
                ? { ...e, taken: !e.taken, taken_at: !e.taken ? new Date().toISOString() : undefined }
                : e
            );
          } else {
            // Create new entry
            newEntries = [
              ...currentEntries,
              {
                id: `entry-${Date.now()}`,
                supplement_id: supplementId,
                date,
                taken: true,
                taken_at: new Date().toISOString(),
              },
            ];
          }

          return {
            supplementTracker: {
              ...state.supplementTracker,
              [key]: newEntries,
            },
          };
        });
      },

      // Analytics actions
      recordDailyStats: (date, user) => {
        set((state) => {
          const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as DayOfWeek;
          const macros = get().getDailyMacros(user, dayOfWeek);
          const profile = state.profiles[user];
          const supplementAdherence = get().getSupplementAdherence(user, date);

          const newStats: DailyStats = {
            id: `stats-${date}-${user}`,
            user,
            date,
            calories_consumed: macros.calories,
            protein_consumed: macros.protein,
            carbs_consumed: macros.carbs,
            fat_consumed: macros.fat,
            calories_target: profile.target_calories,
            protein_target: profile.target_protein,
            carbs_target: profile.target_carbs,
            fat_target: profile.target_fat,
            meals_completed: macros.completed,
            meals_total: macros.total,
            supplements_taken: supplementAdherence.taken,
            supplements_total: supplementAdherence.total,
            created_at: new Date().toISOString(),
          };

          // Remove existing stats for this date/user and add new
          const filteredStats = state.dailyStats.filter(
            (s) => !(s.date === date && s.user === user)
          );

          return {
            dailyStats: [...filteredStats, newStats],
          };
        });
      },

      getDailyMacros: (user, day) => {
        const state = get();
        const dayPlan = state.weeklyPlan[user][day];
        const meals = dayPlan.meals;

        let calories = 0;
        let protein = 0;
        let carbs = 0;
        let fat = 0;
        let completed = 0;
        const total = Object.keys(meals).length;

        Object.values(meals).forEach((meal) => {
          if (meal.completed) {
            calories += meal.calories || 0;
            protein += meal.protein || 0;
            carbs += meal.carbs || 0;
            fat += meal.fat || 0;
            completed++;
          }
        });

        return { calories, protein, carbs, fat, completed, total };
      },

      getSupplementAdherence: (user, date) => {
        const state = get();
        const userSupplements = state.supplements[user].filter((s) => s.is_active);
        const key = `${date}-${user}`;
        const entries = state.supplementTracker[key] || [];

        const taken = entries.filter((e) => e.taken).length;
        const total = userSupplements.length;

        return {
          taken,
          total,
          percentage: total > 0 ? Math.round((taken / total) * 100) : 0,
        };
      },

      // Import actions
      importPlanFromPDF: (plan) => {
        set({
          weeklyPlan: plan,
          defaultPlan: plan,
        });
      },

      // Weight tracking actions
      recordWeight: (user, weight_kg, date) => {
        const dateStr = date || getDateString();
        const newEntry: WeightEntry = {
          date: dateStr,
          weight_kg,
          recorded_at: new Date().toISOString(),
        };

        set((state) => {
          // Remove any existing entry for the same date
          const filteredEntries = state.weightEntries[user].filter(
            (e) => e.date !== dateStr
          );

          return {
            weightEntries: {
              ...state.weightEntries,
              [user]: [...filteredEntries, newEntry].sort((a, b) =>
                a.date.localeCompare(b.date)
              ),
            },
            // Also dismiss the prompt for today
            weightPromptDismissed: {
              ...state.weightPromptDismissed,
              [`${dateStr}-${user}`]: true,
            },
          };
        });
      },

      getLatestWeight: (user) => {
        const state = get();
        const entries = state.weightEntries[user];
        if (entries.length === 0) return null;
        return entries[entries.length - 1];
      },

      getTodayWeight: (user) => {
        const state = get();
        const today = getDateString();
        return state.weightEntries[user].find((e) => e.date === today) || null;
      },

      needsWeightEntry: (user) => {
        const state = get();
        const today = getDateString();
        const key = `${today}-${user}`;

        // Already dismissed for today
        if (state.weightPromptDismissed[key]) return false;

        // Already has weight for today
        const hasToday = state.weightEntries[user].some((e) => e.date === today);
        return !hasToday;
      },

      dismissWeightPrompt: (user) => {
        const today = getDateString();
        const key = `${today}-${user}`;

        set((state) => {
          // When skipped, copy the previous day's weight (or use profile weight as fallback)
          const latestWeight = get().getLatestWeight(user);
          const profileWeight = state.profiles[user].weight_kg;
          const weightToUse = latestWeight?.weight_kg || profileWeight;

          const newEntry: WeightEntry = {
            date: today,
            weight_kg: weightToUse,
            recorded_at: new Date().toISOString(),
          };

          // Remove any existing entry for today
          const filteredEntries = state.weightEntries[user].filter(
            (e) => e.date !== today
          );

          return {
            weightEntries: {
              ...state.weightEntries,
              [user]: [...filteredEntries, newEntry].sort((a, b) =>
                a.date.localeCompare(b.date)
              ),
            },
            weightPromptDismissed: {
              ...state.weightPromptDismissed,
              [key]: true,
            },
          };
        });
      },
    }),
    {
      name: 'diet-planner-storage',
      // Don't persist mealOverrides - they should reset on page refresh
      partialize: (state) => ({
        weeklyPlan: state.weeklyPlan,
        defaultPlan: state.defaultPlan,
        selectedDay: state.selectedDay,
        selectedDate: state.selectedDate,
        profiles: state.profiles,
        supplements: state.supplements,
        supplementTracker: state.supplementTracker,
        dailyStats: state.dailyStats,
        streaks: state.streaks,
        weightEntries: state.weightEntries,
        weightPromptDismissed: state.weightPromptDismissed,
        // mealOverrides is intentionally NOT persisted
      }),
    }
  )
);
