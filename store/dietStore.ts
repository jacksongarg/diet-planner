'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WeeklyPlan, DayOfWeek, MealType, User, Meal, DAYS } from '@/lib/types';
import { initialWeeklyPlan } from '@/lib/initialData';

interface DietState {
  weeklyPlan: WeeklyPlan;
  defaultPlan: WeeklyPlan;
  selectedDay: DayOfWeek;

  // Actions
  setSelectedDay: (day: DayOfWeek) => void;
  updateMeal: (user: User, day: DayOfWeek, mealType: MealType, text: string, saveAsDefault: boolean) => void;
  updateSharedPrep: (day: DayOfWeek, notes: string[]) => void;
  resetDayToDefault: (day: DayOfWeek) => void;
  duplicatePreviousDay: (targetDay: DayOfWeek) => void;
  resetAllToDefault: () => void;
}

export const useDietStore = create<DietState>()(
  persist(
    (set, get) => ({
      weeklyPlan: initialWeeklyPlan,
      defaultPlan: initialWeeklyPlan,
      selectedDay: 'monday',

      setSelectedDay: (day) => set({ selectedDay: day }),

      updateMeal: (user, day, mealType, text, saveAsDefault) => {
        set((state) => {
          const updatedMeal: Meal = {
            ...state.weeklyPlan[user][day].meals[mealType],
            text,
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

          // If saving as default, also update the default plan
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
        }));
      },
    }),
    {
      name: 'diet-planner-storage',
    }
  )
);
