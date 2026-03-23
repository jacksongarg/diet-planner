export type User = 'jackson' | 'rymma';

export type MealType = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Meal {
  id: string;
  type: MealType;
  text: string;
  notes?: string;
  isEdited: boolean;
  lastUpdated: string;
}

export interface DayPlan {
  day: DayOfWeek;
  user: User;
  meals: Record<MealType, Meal>;
}

export interface SharedPrep {
  day: DayOfWeek;
  notes: string[];
}

export interface WeeklyPlan {
  jackson: Record<DayOfWeek, DayPlan>;
  rymma: Record<DayOfWeek, DayPlan>;
  sharedPrep: Record<DayOfWeek, SharedPrep>;
}

export const DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'morningSnack', label: 'Morning Snack' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'afternoonSnack', label: 'Afternoon Snack' },
  { key: 'dinner', label: 'Dinner' },
];

export const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

export const USER_LABELS: Record<User, string> = {
  jackson: 'Jackson',
  rymma: 'Rymma',
};
