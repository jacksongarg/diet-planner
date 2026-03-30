// Legacy hardcoded user type - keeping for backward compatibility during migration
export type LegacyUser = 'jackson' | 'rymma';
// Alias for backward compatibility with existing components
export type User = LegacyUser;

// Auth types
export type UserRole = 'user' | 'dietician';
export type ViewMode = 'single' | 'couple' | 'dietician';
export type ConnectionType = 'couple' | 'friend' | 'dietician_client';
export type ConnectionStatus = 'pending' | 'accepted' | 'rejected';
export type NotificationType = 'connection_request' | 'connection_accepted' | 'plan_updated' | 'meal_reminder';

// Supabase profile type
export interface DietProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
  height_cm?: number;
  weight_kg?: number;
  age?: number;
  gender?: Gender;
  activity_level?: ActivityLevel;
  goal?: DietGoal;
  target_calories?: number;
  target_protein?: number;
  target_carbs?: number;
  target_fat?: number;
  view_mode: ViewMode;
  created_at: string;
  updated_at: string;
}

// Connection type
export interface Connection {
  id: string;
  requester_id: string;
  recipient_id: string;
  type: ConnectionType;
  status: ConnectionStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  requester?: DietProfile;
  recipient?: DietProfile;
}

// Notification type
export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message?: string;
  data?: {
    connection_id?: string;
    requester_id?: string;
    requester_name?: string;
    connection_type?: ConnectionType;
    accepter_id?: string;
    accepter_name?: string;
    [key: string]: string | undefined;
  };
  read: boolean;
  created_at: string;
}

// Connected user view (for couple mode)
export interface ConnectedUserView {
  connection: Connection;
  profile: DietProfile;
  plan?: MealPlanWithDays;
}

// Dietician client view
export interface DieticianClientView {
  connection: Connection;
  profile: DietProfile;
  plans: MealPlanWithDays[];
  lastUpdated?: string;
}

// Supabase meal plan types (replaces localStorage types)
export interface MealPlan {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  daily_calories?: number;
  protein_grams?: number;
  carbs_grams?: number;
  fat_grams?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface MealPlanDay {
  id: string;
  plan_id: string;
  day_of_week: DayOfWeek;
  notes?: string;
  created_at: string;
  updated_at: string;
  meals?: MealItem[];
}

export interface MealItem {
  id: string;
  plan_id: string;
  day_of_week: DayOfWeek;
  meal_type: MealType;
  text: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  updated_by?: string;
}

export interface MealCompletion {
  id: string;
  user_id: string;
  meal_id: string;
  date: string;
  completed_at: string;
}

export interface MealPlanWithDays extends MealPlan {
  days: MealPlanDayWithMeals[];
}

export interface MealPlanDayWithMeals extends MealPlanDay {
  meals: MealItem[];
}

// Auth state
export interface DietAuthState {
  user: DietProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  viewMode: ViewMode;
  connectedUsers: ConnectedUserView[];
  activePartner: DietProfile | null;
  activeClient: DietProfile | null; // For dietician mode
  clients: DieticianClientView[]; // For dietician mode
}

export type MealType = 'breakfast' | 'morningSnack' | 'lunch' | 'afternoonSnack' | 'dinner';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export interface Meal {
  id: string;
  type: MealType;
  text: string;
  calories?: number;
  protein?: number;      // grams
  carbs?: number;        // grams
  fat?: number;          // grams
  completed: boolean;
  completedAt?: string;  // ISO timestamp
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

// User Profile types
export type ActivityLevel = 'sedentary' | 'lightly_active' | 'moderately_active' | 'very_active' | 'extremely_active';
export type DietGoal = 'lose_weight' | 'maintain_weight' | 'gain_muscle' | 'improve_health';
export type Gender = 'male' | 'female';

export interface UserProfile {
  id: string;
  user: User;
  name: string;
  height_cm: number;
  weight_kg: number;
  age: number;
  gender: Gender;
  activity_level: ActivityLevel;
  goal: DietGoal;
  target_calories: number;
  target_protein: number;
  target_carbs: number;
  target_fat: number;
  created_at: string;
  updated_at: string;
}

// Supplement types
export type SupplementTiming = 'morning' | 'with_breakfast' | 'with_lunch' | 'with_dinner' | 'before_workout' | 'after_workout' | 'before_bed';

export interface Supplement {
  id: string;
  user: User;
  name: string;
  dosage: string;
  timing: SupplementTiming[];
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface SupplementEntry {
  id: string;
  supplement_id: string;
  date: string; // YYYY-MM-DD
  taken: boolean;
  taken_at?: string; // ISO timestamp
}

// Daily stats for analytics
export interface DailyStats {
  id: string;
  user: User;
  date: string; // YYYY-MM-DD
  calories_consumed: number;
  protein_consumed: number;
  carbs_consumed: number;
  fat_consumed: number;
  calories_target: number;
  protein_target: number;
  carbs_target: number;
  fat_target: number;
  meals_completed: number;
  meals_total: number;
  supplements_taken: number;
  supplements_total: number;
  created_at: string;
}

// Weekly summary for analytics
export interface WeeklySummary {
  week_start: string;
  week_end: string;
  user: User;
  avg_calories: number;
  avg_protein: number;
  avg_carbs: number;
  avg_fat: number;
  completion_rate: number;
  days_tracked: number;
  best_day: string;
  needs_improvement: string[];
}

// Diet streak tracking
export interface DietStreak {
  user: User;
  current_streak: number;
  longest_streak: number;
  streak_start_date?: string;
  last_completed_date?: string;
}

// Daily weight tracking
export interface WeightEntry {
  date: string; // YYYY-MM-DD
  weight_kg: number;
  recorded_at: string; // ISO timestamp
}

// PDF upload tracking
export interface UploadedPlan {
  id: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  extracted_plan?: WeeklyPlan;
  uploaded_at: string;
  processed_at?: string;
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

export const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; multiplier: number }[] = [
  { value: 'sedentary', label: 'Sedentary (little/no exercise)', multiplier: 1.2 },
  { value: 'lightly_active', label: 'Lightly Active (1-3 days/week)', multiplier: 1.375 },
  { value: 'moderately_active', label: 'Moderately Active (3-5 days/week)', multiplier: 1.55 },
  { value: 'very_active', label: 'Very Active (6-7 days/week)', multiplier: 1.725 },
  { value: 'extremely_active', label: 'Extremely Active (athlete)', multiplier: 1.9 },
];

export const DIET_GOALS: { value: DietGoal; label: string; calorieAdjustment: number }[] = [
  { value: 'lose_weight', label: 'Lose Weight', calorieAdjustment: -500 },
  { value: 'maintain_weight', label: 'Maintain Weight', calorieAdjustment: 0 },
  { value: 'gain_muscle', label: 'Build Muscle', calorieAdjustment: 300 },
  { value: 'improve_health', label: 'Improve Health', calorieAdjustment: 0 },
];

export const SUPPLEMENT_TIMINGS: { value: SupplementTiming; label: string; icon: string }[] = [
  { value: 'morning', label: 'Morning', icon: '🌅' },
  { value: 'with_breakfast', label: 'With Breakfast', icon: '🥣' },
  { value: 'with_lunch', label: 'With Lunch', icon: '🍽️' },
  { value: 'with_dinner', label: 'With Dinner', icon: '🌙' },
  { value: 'before_workout', label: 'Pre-Workout', icon: '💪' },
  { value: 'after_workout', label: 'Post-Workout', icon: '🥤' },
  { value: 'before_bed', label: 'Before Bed', icon: '😴' },
];
