import { WeeklyPlan, DayOfWeek, DAY_LABELS, MEAL_TYPES, MealType, Meal, User } from './types';

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

// Type for effective meals (with overrides applied)
export type EffectiveMeals = Record<User, Record<MealType, Meal>>;

// Generate cook-friendly menu text organized by meal type
// If effectiveMeals is provided, use those (with overrides); otherwise use weeklyPlan
export function generateCookMenuText(
  weeklyPlan: WeeklyPlan,
  day: DayOfWeek,
  dateStr?: string,
  effectiveMeals?: EffectiveMeals
): string {
  const dateDisplay = dateStr
    ? new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
    : DAY_LABELS[day];

  // Helper to get meal - use override if available
  const getMeal = (user: User, mealType: MealType): Meal => {
    if (effectiveMeals) {
      return effectiveMeals[user][mealType];
    }
    return weeklyPlan[user][day].meals[mealType];
  };

  let text = `*Menu for ${dateDisplay}*\n`;
  text += `━━━━━━━━━━━━━━━━━━━━\n\n`;

  // Group by meal type for cook's convenience
  const mealsToShow: { key: MealType; label: string }[] = [
    { key: 'breakfast', label: 'BREAKFAST' },
    { key: 'lunch', label: 'LUNCH' },
    { key: 'dinner', label: 'DINNER' },
  ];

  mealsToShow.forEach(({ key, label }) => {
    const jacksonMeal = getMeal('jackson', key);
    const rymmaMeal = getMeal('rymma', key);
    const isSame = jacksonMeal.text.toLowerCase().trim() === rymmaMeal.text.toLowerCase().trim();

    text += `*${label}*\n`;

    if (isSame) {
      // Same meal for both - show once
      text += `Both: ${jacksonMeal.text}\n`;
      if (jacksonMeal.calories) {
        text += `  (${jacksonMeal.calories} cal, P:${jacksonMeal.protein || 0}g, C:${jacksonMeal.carbs || 0}g, F:${jacksonMeal.fat || 0}g)\n`;
      }
    } else {
      // Different meals - show separately
      text += `Jackson: ${jacksonMeal.text}\n`;
      if (jacksonMeal.calories) {
        text += `  (${jacksonMeal.calories} cal)\n`;
      }
      text += `Rymma: ${rymmaMeal.text}\n`;
      if (rymmaMeal.calories) {
        text += `  (${rymmaMeal.calories} cal)\n`;
      }
    }
    text += `\n`;
  });

  // Add snacks section
  text += `*SNACKS*\n`;
  const snacks: { key: MealType; label: string }[] = [
    { key: 'morningSnack', label: 'Morning' },
    { key: 'afternoonSnack', label: 'Afternoon' },
  ];

  snacks.forEach(({ key, label }) => {
    const jacksonSnack = getMeal('jackson', key);
    const rymmaSnack = getMeal('rymma', key);

    if (jacksonSnack.text === rymmaSnack.text) {
      text += `${label} (Both): ${jacksonSnack.text}\n`;
    } else {
      text += `${label} - J: ${jacksonSnack.text} | R: ${rymmaSnack.text}\n`;
    }
  });

  return text;
}

// Native share if available, otherwise copy
export async function shareOrCopyMenu(text: string): Promise<{ shared: boolean; copied: boolean }> {
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ text });
      return { shared: true, copied: false };
    } catch {
      // User cancelled or share failed, fall through to copy
    }
  }

  const copied = await copyToClipboard(text);
  return { shared: false, copied };
}
