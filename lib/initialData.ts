import { WeeklyPlan, DayOfWeek, MealType, Meal, UserProfile, Supplement, User } from './types';

interface MealData {
  text: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

function createMeal(type: MealType, data: MealData): Meal {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    text: data.text,
    calories: data.calories,
    protein: data.protein,
    carbs: data.carbs,
    fat: data.fat,
    completed: false,
    isEdited: false,
    lastUpdated: new Date().toISOString(),
  };
}

function createDayPlan(day: DayOfWeek, user: 'jackson' | 'rymma', meals: Record<MealType, MealData>) {
  return {
    day,
    user,
    meals: {
      breakfast: createMeal('breakfast', meals.breakfast),
      morningSnack: createMeal('morningSnack', meals.morningSnack),
      lunch: createMeal('lunch', meals.lunch),
      afternoonSnack: createMeal('afternoonSnack', meals.afternoonSnack),
      dinner: createMeal('dinner', meals.dinner),
    },
  };
}

// Default profiles for Jackson and Rymma
export const defaultProfiles: Record<User, UserProfile> = {
  jackson: {
    id: 'profile-jackson',
    user: 'jackson',
    name: 'Jackson',
    height_cm: 178,
    weight_kg: 75,
    age: 30,
    gender: 'male',
    activity_level: 'moderately_active',
    goal: 'maintain_weight',
    target_calories: 2200,
    target_protein: 165,
    target_carbs: 220,
    target_fat: 73,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  rymma: {
    id: 'profile-rymma',
    user: 'rymma',
    name: 'Rymma',
    height_cm: 165,
    weight_kg: 58,
    age: 28,
    gender: 'female',
    activity_level: 'moderately_active',
    goal: 'maintain_weight',
    target_calories: 1800,
    target_protein: 108,
    target_carbs: 180,
    target_fat: 60,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};

// Default supplements
export const defaultSupplements: Record<User, Supplement[]> = {
  jackson: [
    {
      id: 'supp-jackson-1',
      user: 'jackson',
      name: 'Vitamin D3',
      dosage: '2000 IU',
      timing: ['morning'],
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'supp-jackson-2',
      user: 'jackson',
      name: 'Omega-3 Fish Oil',
      dosage: '1000mg',
      timing: ['with_breakfast'],
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'supp-jackson-3',
      user: 'jackson',
      name: 'Magnesium',
      dosage: '400mg',
      timing: ['before_bed'],
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ],
  rymma: [
    {
      id: 'supp-rymma-1',
      user: 'rymma',
      name: 'Vitamin D3',
      dosage: '2000 IU',
      timing: ['morning'],
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'supp-rymma-2',
      user: 'rymma',
      name: 'Iron',
      dosage: '18mg',
      timing: ['with_breakfast'],
      is_active: true,
      created_at: new Date().toISOString(),
    },
    {
      id: 'supp-rymma-3',
      user: 'rymma',
      name: 'B-Complex',
      dosage: '1 capsule',
      timing: ['with_lunch'],
      is_active: true,
      created_at: new Date().toISOString(),
    },
  ],
};

export const initialWeeklyPlan: WeeklyPlan = {
  jackson: {
    monday: createDayPlan('monday', 'jackson', {
      breakfast: { text: 'Oats with milk + peanut butter + banana', calories: 450, protein: 18, carbs: 55, fat: 18 },
      morningSnack: { text: 'Greek yogurt + berries', calories: 180, protein: 15, carbs: 18, fat: 5 },
      lunch: { text: '2 chapati + dal + sautéed vegetables + 1/4 avocado', calories: 520, protein: 20, carbs: 65, fat: 18 },
      afternoonSnack: { text: 'Lentil bread + labneh', calories: 200, protein: 10, carbs: 25, fat: 8 },
      dinner: { text: 'Paneer tikka + grilled vegetables + small quinoa', calories: 480, protein: 28, carbs: 40, fat: 22 },
    }),
    tuesday: createDayPlan('tuesday', 'jackson', {
      breakfast: { text: 'Vegetable poha + Greek yogurt', calories: 420, protein: 16, carbs: 58, fat: 14 },
      morningSnack: { text: '1 apple + 10 almonds', calories: 180, protein: 5, carbs: 22, fat: 10 },
      lunch: { text: '2 chapati + paneer curry + cucumber yogurt salad', calories: 550, protein: 25, carbs: 55, fat: 24 },
      afternoonSnack: { text: 'Lentil bread + labneh', calories: 200, protein: 10, carbs: 25, fat: 8 },
      dinner: { text: 'Tofu stir fry + vegetables + small rice', calories: 450, protein: 22, carbs: 48, fat: 18 },
    }),
    wednesday: createDayPlan('wednesday', 'jackson', {
      breakfast: { text: 'Vegetable upma + Greek yogurt', calories: 400, protein: 14, carbs: 52, fat: 14 },
      morningSnack: { text: '1 orange + 10 walnuts', calories: 200, protein: 5, carbs: 20, fat: 14 },
      lunch: { text: '2 chapati + tofu curry + cucumber salad', calories: 500, protein: 24, carbs: 55, fat: 20 },
      afternoonSnack: { text: 'Lentil bread + hummus', calories: 220, protein: 8, carbs: 28, fat: 10 },
      dinner: { text: 'Grilled fish or paneer alternative + vegetables + buckwheat', calories: 480, protein: 30, carbs: 38, fat: 22 },
    }),
    thursday: createDayPlan('thursday', 'jackson', {
      breakfast: { text: 'Besan chilla + yogurt dip', calories: 380, protein: 18, carbs: 42, fat: 16 },
      morningSnack: { text: '1 pear + 10 almonds', calories: 180, protein: 5, carbs: 24, fat: 10 },
      lunch: { text: '2 chapati + rajma curry + 1/4 avocado', calories: 540, protein: 22, carbs: 62, fat: 20 },
      afternoonSnack: { text: 'Lentil bread + cottage cheese', calories: 230, protein: 14, carbs: 22, fat: 10 },
      dinner: { text: 'Tofu + vegetable stir fry + small brown rice', calories: 460, protein: 24, carbs: 50, fat: 18 },
    }),
    friday: createDayPlan('friday', 'jackson', {
      breakfast: { text: 'Poha + Greek yogurt', calories: 400, protein: 15, carbs: 55, fat: 12 },
      morningSnack: { text: 'Banana + 10 almonds', calories: 190, protein: 5, carbs: 28, fat: 10 },
      lunch: { text: '2 chapati + paneer bhurji + salad', calories: 530, protein: 26, carbs: 50, fat: 24 },
      afternoonSnack: { text: 'Lentil bread + hummus', calories: 220, protein: 8, carbs: 28, fat: 10 },
      dinner: { text: 'Lean meat or tofu + vegetables + quinoa', calories: 490, protein: 32, carbs: 42, fat: 20 },
    }),
    saturday: createDayPlan('saturday', 'jackson', {
      breakfast: { text: 'Oats with milk + peanut butter + banana', calories: 450, protein: 18, carbs: 55, fat: 18 },
      morningSnack: { text: '1 apple + 10 almonds', calories: 180, protein: 5, carbs: 22, fat: 10 },
      lunch: { text: '2 chapati + paneer curry + cucumber yogurt salad', calories: 550, protein: 25, carbs: 55, fat: 24 },
      afternoonSnack: { text: 'Lentil bread + hummus', calories: 220, protein: 8, carbs: 28, fat: 10 },
      dinner: { text: 'Grilled fish or paneer alternative + vegetables + buckwheat', calories: 480, protein: 30, carbs: 38, fat: 22 },
    }),
    sunday: createDayPlan('sunday', 'jackson', {
      breakfast: { text: 'Vegetable poha + Greek yogurt', calories: 420, protein: 16, carbs: 58, fat: 14 },
      morningSnack: { text: '1 pear + 10 almonds', calories: 180, protein: 5, carbs: 24, fat: 10 },
      lunch: { text: '2 chapati + tofu curry + cucumber salad', calories: 500, protein: 24, carbs: 55, fat: 20 },
      afternoonSnack: { text: 'Lentil bread + cottage cheese', calories: 230, protein: 14, carbs: 22, fat: 10 },
      dinner: { text: 'Tofu + vegetable stir fry + small brown rice', calories: 460, protein: 24, carbs: 50, fat: 18 },
    }),
  },
  rymma: {
    monday: createDayPlan('monday', 'rymma', {
      breakfast: { text: 'Oats with milk + peanut butter + banana', calories: 380, protein: 15, carbs: 48, fat: 15 },
      morningSnack: { text: 'Greek yogurt + strawberries', calories: 150, protein: 12, carbs: 16, fat: 4 },
      lunch: { text: 'Paneer stir fry + vegetables + 1/2 cup brown rice', calories: 420, protein: 22, carbs: 45, fat: 16 },
      afternoonSnack: { text: 'Banana + 1 tbsp peanut butter', calories: 200, protein: 5, carbs: 28, fat: 9 },
      dinner: { text: 'Tofu salad + 1 slice lentil bread', calories: 320, protein: 18, carbs: 30, fat: 14 },
    }),
    tuesday: createDayPlan('tuesday', 'rymma', {
      breakfast: { text: 'Buckwheat porridge with milk + peanut butter + berries', calories: 400, protein: 14, carbs: 52, fat: 16 },
      morningSnack: { text: '1 apple + 10 almonds', calories: 180, protein: 5, carbs: 22, fat: 10 },
      lunch: { text: 'Grilled salmon + quinoa + sautéed zucchini', calories: 480, protein: 35, carbs: 38, fat: 20 },
      afternoonSnack: { text: 'Lentil bread + labneh', calories: 180, protein: 8, carbs: 22, fat: 7 },
      dinner: { text: 'Avocado + 2 eggs omelet with spinach + 1 slice whole grain toast', calories: 420, protein: 20, carbs: 25, fat: 28 },
    }),
    wednesday: createDayPlan('wednesday', 'rymma', {
      breakfast: { text: 'Smoothie with milk + oats + banana + chia seeds', calories: 380, protein: 14, carbs: 55, fat: 12 },
      morningSnack: { text: '1 orange + 10 walnuts', calories: 200, protein: 5, carbs: 20, fat: 14 },
      lunch: { text: 'Baked white fish + roasted sweet potato + green beans', calories: 420, protein: 32, carbs: 42, fat: 12 },
      afternoonSnack: { text: 'Lentil bread + hummus', calories: 200, protein: 7, carbs: 26, fat: 9 },
      dinner: { text: 'Paneer + sautéed vegetables + 1/4 avocado', calories: 380, protein: 20, carbs: 22, fat: 24 },
    }),
    thursday: createDayPlan('thursday', 'rymma', {
      breakfast: { text: 'Buckwheat pancakes with honey + berries', calories: 360, protein: 10, carbs: 58, fat: 10 },
      morningSnack: { text: 'Greek yogurt + 1 small apple', calories: 180, protein: 14, carbs: 22, fat: 4 },
      lunch: { text: 'Tofu stir fry + quinoa + vegetables', calories: 440, protein: 24, carbs: 48, fat: 18 },
      afternoonSnack: { text: 'Avocado on lentil bread', calories: 240, protein: 6, carbs: 24, fat: 16 },
      dinner: { text: '2 boiled eggs + sautéed spinach + small baked potato', calories: 350, protein: 18, carbs: 32, fat: 16 },
    }),
    friday: createDayPlan('friday', 'rymma', {
      breakfast: { text: '2 eggs + 1/4 avocado on lentil bread + tomato', calories: 400, protein: 18, carbs: 28, fat: 24 },
      morningSnack: { text: 'Greek yogurt + strawberries', calories: 150, protein: 12, carbs: 16, fat: 4 },
      lunch: { text: 'Paneer stir fry + vegetables + brown rice', calories: 450, protein: 24, carbs: 48, fat: 18 },
      afternoonSnack: { text: 'Banana + 1 tbsp peanut butter', calories: 200, protein: 5, carbs: 28, fat: 9 },
      dinner: { text: 'Tofu salad + 1 slice lentil bread', calories: 320, protein: 18, carbs: 30, fat: 14 },
    }),
    saturday: createDayPlan('saturday', 'rymma', {
      breakfast: { text: 'Buckwheat porridge with milk + peanut butter + berries', calories: 400, protein: 14, carbs: 52, fat: 16 },
      morningSnack: { text: '1 apple + 10 almonds', calories: 180, protein: 5, carbs: 22, fat: 10 },
      lunch: { text: 'Grilled salmon + buckwheat + vegetables', calories: 460, protein: 34, carbs: 36, fat: 20 },
      afternoonSnack: { text: 'Lentil bread + cottage cheese or labneh', calories: 200, protein: 12, carbs: 20, fat: 8 },
      dinner: { text: 'Tofu + 1/4 avocado + vegetable stir fry', calories: 360, protein: 18, carbs: 26, fat: 22 },
    }),
    sunday: createDayPlan('sunday', 'rymma', {
      breakfast: { text: 'Oats with milk + peanut butter + banana', calories: 380, protein: 15, carbs: 48, fat: 15 },
      morningSnack: { text: '1 pear + 10 almonds', calories: 180, protein: 5, carbs: 24, fat: 10 },
      lunch: { text: 'Tofu stir fry + quinoa + vegetables', calories: 440, protein: 24, carbs: 48, fat: 18 },
      afternoonSnack: { text: 'Avocado on lentil bread', calories: 240, protein: 6, carbs: 24, fat: 16 },
      dinner: { text: 'Avocado + 2 eggs omelet with spinach + whole grain toast', calories: 420, protein: 20, carbs: 25, fat: 28 },
    }),
  },
  sharedPrep: {
    monday: {
      day: 'monday',
      notes: [
        'Same breakfast base',
        'Chop vegetables once',
        'Prepare one grain base if needed',
        'Separate final protein plating only',
      ],
    },
    tuesday: {
      day: 'tuesday',
      notes: [
        'Same snack prep',
        'Shared vegetables',
        'Shared yogurt/labneh stock',
        'Different mains at lunch and dinner',
      ],
    },
    wednesday: {
      day: 'wednesday',
      notes: [
        'Same morning snack',
        'Same afternoon snack',
        'Shared vegetables for dinner',
        'Separate lunch mains',
      ],
    },
    thursday: {
      day: 'thursday',
      notes: [
        'Shared vegetables',
        'Shared tofu prep possible at lunch/dinner',
        'Different breakfast and snacks',
      ],
    },
    friday: {
      day: 'friday',
      notes: [
        'Shared vegetables',
        'Shared paneer/tofu stock',
        'Different breakfast and snacks',
      ],
    },
    saturday: {
      day: 'saturday',
      notes: [
        'Same morning snack',
        'Shared vegetables',
        'Shared buckwheat prep',
        'Different proteins',
      ],
    },
    sunday: {
      day: 'sunday',
      notes: [
        'Same morning snack',
        'Shared tofu/vegetable base',
        'Different breakfast and dinner finishing',
      ],
    },
  },
};
