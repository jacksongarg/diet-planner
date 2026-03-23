# Diet Planner

## Overview
A mobile-first diet planning web app for Jackson and Rymma to manage their weekly meals.

## Tech Stack
- Next.js 16 with TypeScript
- Tailwind CSS for styling
- Zustand with persist middleware for state management
- localStorage for data persistence
- lucide-react for icons

## Features
- Weekly diet plans with Monday-Sunday tabs
- 5 meals per day: Breakfast, Morning Snack, Lunch, Afternoon Snack, Dinner
- Side-by-side view of both users' meals
- Shared meal indicators with overlap percentage
- Edit meals with "Save for today only" or "Save as new default" options
- Copy plan to clipboard
- Share on WhatsApp
- Reset day to default
- Shared prep notes section

## Current Status
- All features implemented and working
- Deployed to production

## Deployment
- **Production URL**: https://diet-planner-sigma.vercel.app
- **GitHub**: https://github.com/jacksongarg/diet-planner
- Connected to Vercel for automatic deployments on push

## Project Structure
```
/lib
  types.ts        - Type definitions
  initialData.ts  - Default meal data for week
  shareUtils.ts   - Copy/share utility functions

/store
  dietStore.ts    - Zustand store with persist

/components
  DaySelector.tsx       - Day tabs (Mon-Sun)
  MealCard.tsx          - Individual meal display
  EditMealModal.tsx     - Edit meal modal
  UserMealSection.tsx   - User's meals section
  SharedPrepSection.tsx - Shared prep notes
  ActionButtons.tsx     - Copy/Share/Reset buttons

/app
  page.tsx        - Main app page
  globals.css     - Global styles
```

## Notes
- Data persists in localStorage under 'diet-planner-storage' key
- Preloaded with full week of meal plans for both users
