import { WeeklyPlan, DayOfWeek, MealType, Meal } from './types';

function createMeal(type: MealType, text: string): Meal {
  return {
    id: `${type}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    text,
    isEdited: false,
    lastUpdated: new Date().toISOString(),
  };
}

function createDayPlan(day: DayOfWeek, user: 'jackson' | 'rymma', meals: Record<MealType, string>) {
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

export const initialWeeklyPlan: WeeklyPlan = {
  jackson: {
    monday: createDayPlan('monday', 'jackson', {
      breakfast: 'Oats with milk + peanut butter + banana',
      morningSnack: 'Greek yogurt + berries',
      lunch: '2 chapati + dal + sautéed vegetables + 1/4 avocado',
      afternoonSnack: 'Lentil bread + labneh',
      dinner: 'Paneer tikka + grilled vegetables + small quinoa',
    }),
    tuesday: createDayPlan('tuesday', 'jackson', {
      breakfast: 'Vegetable poha + Greek yogurt',
      morningSnack: '1 apple + 10 almonds',
      lunch: '2 chapati + paneer curry + cucumber yogurt salad',
      afternoonSnack: 'Lentil bread + labneh',
      dinner: 'Tofu stir fry + vegetables + small rice',
    }),
    wednesday: createDayPlan('wednesday', 'jackson', {
      breakfast: 'Vegetable upma + Greek yogurt',
      morningSnack: '1 orange + 10 walnuts',
      lunch: '2 chapati + tofu curry + cucumber salad',
      afternoonSnack: 'Lentil bread + hummus',
      dinner: 'Grilled fish or paneer alternative + vegetables + buckwheat',
    }),
    thursday: createDayPlan('thursday', 'jackson', {
      breakfast: 'Besan chilla + yogurt dip',
      morningSnack: '1 pear + 10 almonds',
      lunch: '2 chapati + rajma curry + 1/4 avocado',
      afternoonSnack: 'Lentil bread + cottage cheese',
      dinner: 'Tofu + vegetable stir fry + small brown rice',
    }),
    friday: createDayPlan('friday', 'jackson', {
      breakfast: 'Poha + Greek yogurt',
      morningSnack: 'Banana + 10 almonds',
      lunch: '2 chapati + paneer bhurji + salad',
      afternoonSnack: 'Lentil bread + hummus',
      dinner: 'Lean meat or tofu + vegetables + quinoa',
    }),
    saturday: createDayPlan('saturday', 'jackson', {
      breakfast: 'Oats with milk + peanut butter + banana',
      morningSnack: '1 apple + 10 almonds',
      lunch: '2 chapati + paneer curry + cucumber yogurt salad',
      afternoonSnack: 'Lentil bread + hummus',
      dinner: 'Grilled fish or paneer alternative + vegetables + buckwheat',
    }),
    sunday: createDayPlan('sunday', 'jackson', {
      breakfast: 'Vegetable poha + Greek yogurt',
      morningSnack: '1 pear + 10 almonds',
      lunch: '2 chapati + tofu curry + cucumber salad',
      afternoonSnack: 'Lentil bread + cottage cheese',
      dinner: 'Tofu + vegetable stir fry + small brown rice',
    }),
  },
  rymma: {
    monday: createDayPlan('monday', 'rymma', {
      breakfast: 'Oats with milk + peanut butter + banana',
      morningSnack: 'Greek yogurt + strawberries',
      lunch: 'Paneer stir fry + vegetables + 1/2 cup brown rice',
      afternoonSnack: 'Banana + 1 tbsp peanut butter',
      dinner: 'Tofu salad + 1 slice lentil bread',
    }),
    tuesday: createDayPlan('tuesday', 'rymma', {
      breakfast: 'Buckwheat porridge with milk + peanut butter + berries',
      morningSnack: '1 apple + 10 almonds',
      lunch: 'Grilled salmon + quinoa + sautéed zucchini',
      afternoonSnack: 'Lentil bread + labneh',
      dinner: 'Avocado + 2 eggs omelet with spinach + 1 slice whole grain toast',
    }),
    wednesday: createDayPlan('wednesday', 'rymma', {
      breakfast: 'Smoothie with milk + oats + banana + chia seeds',
      morningSnack: '1 orange + 10 walnuts',
      lunch: 'Baked white fish + roasted sweet potato + green beans',
      afternoonSnack: 'Lentil bread + hummus',
      dinner: 'Paneer + sautéed vegetables + 1/4 avocado',
    }),
    thursday: createDayPlan('thursday', 'rymma', {
      breakfast: 'Buckwheat pancakes with honey + berries',
      morningSnack: 'Greek yogurt + 1 small apple',
      lunch: 'Tofu stir fry + quinoa + vegetables',
      afternoonSnack: 'Avocado on lentil bread',
      dinner: '2 boiled eggs + sautéed spinach + small baked potato',
    }),
    friday: createDayPlan('friday', 'rymma', {
      breakfast: '2 eggs + 1/4 avocado on lentil bread + tomato',
      morningSnack: 'Greek yogurt + strawberries',
      lunch: 'Paneer stir fry + vegetables + brown rice',
      afternoonSnack: 'Banana + 1 tbsp peanut butter',
      dinner: 'Tofu salad + 1 slice lentil bread',
    }),
    saturday: createDayPlan('saturday', 'rymma', {
      breakfast: 'Buckwheat porridge with milk + peanut butter + berries',
      morningSnack: '1 apple + 10 almonds',
      lunch: 'Grilled salmon + buckwheat + vegetables',
      afternoonSnack: 'Lentil bread + cottage cheese or labneh',
      dinner: 'Tofu + 1/4 avocado + vegetable stir fry',
    }),
    sunday: createDayPlan('sunday', 'rymma', {
      breakfast: 'Oats with milk + peanut butter + banana',
      morningSnack: '1 pear + 10 almonds',
      lunch: 'Tofu stir fry + quinoa + vegetables',
      afternoonSnack: 'Avocado on lentil bread',
      dinner: 'Avocado + 2 eggs omelet with spinach + whole grain toast',
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
