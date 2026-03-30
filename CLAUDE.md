# Diet Planner

## Overview
A mobile-first diet planning web app for Jackson and Rymma to manage their weekly meals with calorie/macro tracking, completion tracking, user profiles, supplements, analytics, and AI-powered PDF diet plan extraction.

## Tech Stack
- Next.js 16 with TypeScript
- Tailwind CSS for styling
- Zustand with persist middleware for state management
- localStorage for data persistence
- lucide-react for icons
- @anthropic-ai/sdk for AI diet plan extraction
- pdf-parse for PDF text extraction

## Features

### Core Features
- Weekly diet plans with Monday-Sunday tabs
- 5 meals per day: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner
- Side-by-side view of both users' meals
- Shared meal indicators with overlap percentage
- Edit meals with "Save for today only" or "Save as new default" options
- Copy plan to clipboard
- Share on WhatsApp
- Reset day to default
- Shared prep notes section

### New Features (March 30, 2026)
- **Auto Date Selection**: App automatically selects today's day on load
- **Share Menu with Cook**: Share button formats daily menu for cook (organized by meal type: breakfast, lunch, dinner with both users' details)
- **Calories & Macros**: Track calories, protein, carbs, fat per meal with visual progress bars
- **Meal Completion**: Mark meals as completed with timestamp display
- **Meal Swapping**: Swap meals with same meal type from other days
- **User Profiles**: Height, weight, age, activity level, goals with auto-calculated TDEE and macro targets
- **Supplements Tracking**: Daily supplement checklist with timing options
- **Analytics Dashboard**: Weekly progress, streaks, macro distribution charts
- **PDF Upload**: AI-powered extraction of diet plans using Claude API
- **Bottom Navigation**: Mobile-friendly nav bar for easy access to all features

## Current Status
- All features implemented and deployed
- Enhanced with macros, completion tracking, profiles, supplements, analytics

## Deployment
- **Production URL**: https://diet-planner-sigma.vercel.app
- **GitHub**: https://github.com/jacksongarg/diet-planner
- Connected to Vercel for automatic deployments on push

## Project Structure
```
/lib
  types.ts        - Type definitions (Meal, UserProfile, Supplement, DailyStats, etc.)
  initialData.ts  - Default meal data, profiles, supplements
  shareUtils.ts   - Copy/share utility functions + generateCookMenuText

/store
  dietStore.ts    - Zustand store with profiles, supplements, analytics, completion tracking

/components
  DateHeader.tsx        - Date display with share button and navigation
  DaySelector.tsx       - Day tabs (Mon-Sun)
  MealCard.tsx          - Meal display with completion checkbox, macros, swap
  EditMealModal.tsx     - Edit meal with macro inputs
  UserMealSection.tsx   - User's meals section with MacroSummary
  MacroSummary.tsx      - Daily macro progress bars vs targets
  ProfileModal.tsx      - Edit user profile with BMR/TDEE calculation preview
  SupplementsSection.tsx - Supplement checklist with add/remove
  AnalyticsDashboard.tsx - Progress charts, streaks, weekly stats
  PDFUpload.tsx         - PDF/text upload for AI extraction
  BottomNav.tsx         - Mobile bottom navigation
  SharedPrepSection.tsx - Shared prep notes
  ActionButtons.tsx     - Copy/Share/Reset buttons

/app
  page.tsx           - Main meals page
  layout.tsx         - Root layout with BottomNav
  profile/page.tsx   - User profiles page
  supplements/page.tsx - Supplements tracking page
  analytics/page.tsx - Analytics dashboard page
  upload/page.tsx    - PDF upload page
  api/extract-diet/route.ts - AI diet plan extraction API
```

## Environment Variables
```
ANTHROPIC_API_KEY=   # Required for PDF diet plan extraction
```

## Notes
- Data persists in localStorage under 'diet-planner-storage' key
- Preloaded with full week of meal plans and macro data for both users
- Profiles auto-calculate TDEE using Mifflin-St Jeor equation
- Macro targets adjust based on goal (lose weight, gain muscle, etc.)

---
**Session: March 30, 2026**
Diet Planner Enhancement complete. Implemented all features from the enhancement plan:
- Calories/macros tracking per meal
- Auto date selection with "Go to Today" button
- Meal swap dropdown (swap with same meal type from other days)
- Completion tracking with timestamps
- User profiles with BMR/TDEE calculations
- Supplements tracking with timing and adherence
- Analytics dashboard with streaks and weekly progress
- PDF upload with AI extraction
- Share menu with cook feature (organized by meal type)
- Bottom navigation bar

---
**Session: March 30, 2026 (Update)**
Fixed meal replacement and added supplements to main page:

**Temporary Meal Replacement (not swap)**
- Changed from "swap" to "replace temporarily"
- Replace Monday's breakfast with Thursday's breakfast just for today's menu
- Overrides are NOT persisted - they reset on page refresh
- Shows "From [Day]" badge on replaced meals with X to undo
- "Reset" button in header clears all temporary replacements
- Sharing uses the effective meals (with overrides applied)

**Supplements on Main Page**
- Added supplements checklist directly on main meals page
- Both Jackson and Rymma's supplements visible alongside their meals

**Key Changes:**
- `store/dietStore.ts`: Added `mealOverrides`, `replaceMealTemporarily`, `clearMealOverride`, `clearAllOverrides`, `getEffectiveMeal`, `hasOverride`
- `components/MealCard.tsx`: Changed to "Replace with" dropdown, shows override indicator
- `components/DateHeader.tsx`: Uses effective meals when sharing, shows "Reset" button when overrides exist
- `components/UserMealSection.tsx`: Uses `getEffectiveMeal` for display
- `lib/shareUtils.ts`: `generateCookMenuText` accepts optional `effectiveMeals` parameter
- `app/page.tsx`: Added SupplementsSection for both users

---
**Session: March 30, 2026 (Update 2)**
Fixed meal replacement bug and added daily weight tracking:

**Bug Fix: Meal Replacement Across Days**
- Fixed bug where meal replacement was affecting all days instead of just the target day
- Override key now includes targetDay: `${date}-${user}-${targetDay}-${mealType}`
- Each day's overrides are now isolated correctly

**Daily Weight Tracking**
- App prompts for weight entry when opened each day
- Modal appears for both Jackson and Rymma (one at a time)
- Pre-fills with previous day's weight for convenience
- "Skip" button uses previous day's weight automatically
- Weight history stored in `weightEntries` state (persisted)
- `weightPromptDismissed` tracks if prompt was shown for today

**New Files:**
- `components/WeightEntryModal.tsx`: Weight entry modal with skip option

**Key Changes:**
- `lib/types.ts`: Added `WeightEntry` interface
- `store/dietStore.ts`: Added `weightEntries`, `weightPromptDismissed`, `recordWeight`, `getLatestWeight`, `getTodayWeight`, `needsWeightEntry`, `dismissWeightPrompt`
- `app/page.tsx`: Added WeightEntryModal that shows on app load if weight not recorded
