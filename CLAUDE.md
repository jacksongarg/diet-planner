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

---
**Session: March 30, 2026 (Update 3)**
Implemented User Authentication & Multi-Mode System with Supabase:

## New Features

### User Authentication
- Login/signup with email/password
- Google OAuth support
- Password reset flow
- Session management

### Multi-Mode System
- **Single Mode**: User sees only their own diet plan
- **Couple/Friend Mode**: Two users see each other's plans (temporary changes only)
- **Dietician Mode**: Professional can manage multiple clients with full edit access

### Connection System
- Send/accept/reject connection requests
- In-app notifications for connection events
- Real-time notification updates via Supabase subscriptions

## Database Schema (Supabase)
Migration file: `supabase/migrations/001_auth_multimode.sql`

**Tables:**
- `profiles` - User profiles with role, stats, macro targets, view_mode
- `connections` - Relationships between users (couple, friend, dietician_client)
- `notifications` - In-app notifications for connection requests
- `meal_plans` - User-specific meal plans
- `meals` - Individual meals with macros
- `meal_completions` - Meal completion tracking
- `supplements` - Supplement definitions
- `supplement_entries` - Daily supplement tracking
- `weight_entries` - Weight history
- `daily_stats` - Daily nutrition stats
- `shared_prep` - Shared prep notes per day

**Features:**
- Row Level Security (RLS) policies for all tables
- Auto-create profile on signup trigger
- Auto-notification triggers for connection events

## New Files

### Supabase Setup
- `lib/supabase/client.ts` - Browser Supabase client
- `lib/supabase/server.ts` - Server Supabase client
- `lib/supabase/middleware.ts` - Auth middleware
- `lib/supabase/index.ts` - Exports
- `middleware.ts` - Next.js middleware for route protection

### Auth Pages
- `app/(auth)/layout.tsx` - Auth layout with logo
- `app/(auth)/login/page.tsx` - Login page
- `app/(auth)/signup/page.tsx` - Signup with role selection
- `app/(auth)/forgot-password/page.tsx` - Password reset
- `app/auth/callback/route.ts` - OAuth callback handler

### Auth Components
- `components/auth/LoginForm.tsx` - Email/password + Google OAuth
- `components/auth/SignupForm.tsx` - With user/dietician role selection
- `components/auth/ForgotPasswordForm.tsx` - Password reset flow

### Stores
- `store/authStore.ts` - Auth state, view mode, connections
- `store/notificationStore.ts` - Notifications with real-time subscription
- `store/connectionStore.ts` - Connection management

### API Routes
- `app/api/connections/route.ts` - List/create connections
- `app/api/connections/[id]/route.ts` - Update/delete connections
- `app/api/notifications/route.ts` - List/clear notifications
- `app/api/notifications/[id]/route.ts` - Read/delete notification

### UI Components
- `components/AuthProvider.tsx` - Auth initialization wrapper
- `components/NotificationBell.tsx` - Bell with badge, dropdown, actions
- `components/AddConnectionModal.tsx` - Search users, send requests
- `components/ModeToggle.tsx` - Switch between modes
- `components/PartnerSelector.tsx` - Select partner in couple mode
- `components/ClientSelector.tsx` - Select client in dietician mode
- `components/DieticianDashboard.tsx` - Client management dashboard

## Updated Files
- `lib/types.ts` - Added auth types (DietProfile, Connection, Notification, ViewMode, etc.)
- `app/layout.tsx` - Added AuthProvider wrapper

## Environment Variables (New)
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
```

## Dependencies Added
```bash
npm install @supabase/supabase-js @supabase/ssr
```

## Next Steps
1. Create Supabase project and configure auth settings
2. Run the migration in Supabase SQL Editor
3. Add environment variables to `.env.local`
4. Configure Google OAuth (optional)
5. Deploy and test auth flows
