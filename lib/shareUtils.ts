import { WeeklyPlan, DayOfWeek, DAY_LABELS, MEAL_TYPES, MealType } from './types';

export function generateDayPlanText(weeklyPlan: WeeklyPlan, day: DayOfWeek): string {
  const jacksonPlan = weeklyPlan.jackson[day];
  const rymmaPlan = weeklyPlan.rymma[day];
  const sharedPrep = weeklyPlan.sharedPrep[day];

  const mealLabels: Record<string, string> = {
    breakfast: 'Breakfast',
    morningSnack: 'Morning Snack',
    lunch: 'Lunch',
    afternoonSnack: 'Afternoon Snack',
    dinner: 'Dinner',
  };

  let text = `*${DAY_LABELS[day]} Diet Plan*\n\n`;

  // Jackson's meals
  text += `*Jackson*\n`;
  MEAL_TYPES.forEach(({ key }) => {
    text += `${mealLabels[key]}: ${jacksonPlan.meals[key].text}\n`;
  });

  text += `\n`;

  // Rymma's meals
  text += `*Rymma*\n`;
  MEAL_TYPES.forEach(({ key }) => {
    text += `${mealLabels[key]}: ${rymmaPlan.meals[key].text}\n`;
  });

  text += `\n`;

  // Shared prep
  if (sharedPrep.notes.length > 0) {
    text += `*Shared Prep:*\n`;
    sharedPrep.notes.forEach((note) => {
      text += `• ${note}\n`;
    });
  }

  return text;
}

export function copyToClipboard(text: string): Promise<boolean> {
  return navigator.clipboard
    .writeText(text)
    .then(() => true)
    .catch(() => false);
}

export function shareOnWhatsApp(text: string): void {
  const encodedText = encodeURIComponent(text);
  const whatsappUrl = `https://wa.me/?text=${encodedText}`;
  window.open(whatsappUrl, '_blank');
}

export function findSharedMeals(weeklyPlan: WeeklyPlan, day: DayOfWeek): MealType[] {
  const jacksonPlan = weeklyPlan.jackson[day];
  const rymmaPlan = weeklyPlan.rymma[day];
  const shared: MealType[] = [];

  MEAL_TYPES.forEach(({ key }) => {
    const jacksonMeal = jacksonPlan.meals[key].text.toLowerCase().trim();
    const rymmaMeal = rymmaPlan.meals[key].text.toLowerCase().trim();

    if (jacksonMeal === rymmaMeal) {
      shared.push(key);
    }
  });

  return shared;
}

export function calculateOverlapScore(weeklyPlan: WeeklyPlan, day: DayOfWeek): number {
  const shared = findSharedMeals(weeklyPlan, day);
  return Math.round((shared.length / MEAL_TYPES.length) * 100);
}
