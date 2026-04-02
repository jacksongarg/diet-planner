'use client';

import { useDietStore } from '@/store/dietStore';
import { User, USER_LABELS, DailyStats } from '@/lib/types';
import { TrendingUp, Flame, Target, Calendar, Award } from 'lucide-react';

interface AnalyticsDashboardProps {
  user: User;
}

export function AnalyticsDashboard({ user }: AnalyticsDashboardProps) {
  const { dailyStats, profiles, streaks } = useDietStore();
  const profile = profiles[user];
  const streak = streaks[user];

  // Get last 7 days of stats for this user
  const userStats = dailyStats
    .filter((s) => s.user === user)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 7);

  // Calculate averages
  const avgCalories =
    userStats.length > 0
      ? Math.round(userStats.reduce((sum, s) => sum + s.calories_consumed, 0) / userStats.length)
      : 0;
  const avgProtein =
    userStats.length > 0
      ? Math.round(userStats.reduce((sum, s) => sum + s.protein_consumed, 0) / userStats.length)
      : 0;
  const avgCompletion =
    userStats.length > 0
      ? Math.round(
          userStats.reduce(
            (sum, s) => sum + (s.meals_total > 0 ? (s.meals_completed / s.meals_total) * 100 : 0),
            0
          ) / userStats.length
        )
      : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-white">{USER_LABELS[user]}'s Progress</h2>
        <span className="text-sm text-zinc-400">Last 7 days</span>
      </div>

      {/* Streak Card */}
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-xl p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-orange-100 text-sm">Current Streak</p>
            <p className="text-3xl font-bold">{streak.current_streak} days</p>
          </div>
          <div className="text-right">
            <Award className="w-10 h-10 opacity-80" />
            <p className="text-xs text-orange-100 mt-1">Best: {streak.longest_streak} days</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          label="Avg Calories"
          value={avgCalories.toString()}
          target={profile.target_calories}
          color="orange"
        />
        <StatCard
          icon={<Target className="w-5 h-5 text-blue-400" />}
          label="Avg Protein"
          value={`${avgProtein}g`}
          target={profile.target_protein}
          suffix="g"
          color="blue"
        />
        <StatCard
          icon={<Calendar className="w-5 h-5 text-emerald-400" />}
          label="Completion"
          value={`${avgCompletion}%`}
          color="emerald"
        />
      </div>

      {/* Weekly Progress Bars */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Weekly Calorie Progress</h3>
        {userStats.length === 0 ? (
          <p className="text-sm text-zinc-500 text-center py-4">
            No data recorded yet. Mark meals as complete to track progress.
          </p>
        ) : (
          <div className="space-y-3">
            {userStats.map((stat) => {
              const percent = Math.min(100, Math.round((stat.calories_consumed / stat.calories_target) * 100));
              const dateLabel = new Date(stat.date).toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              });

              return (
                <div key={stat.id}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-zinc-400">{dateLabel}</span>
                    <span className="text-zinc-500">
                      {stat.calories_consumed} / {stat.calories_target} cal
                    </span>
                  </div>
                  <div className="h-2 bg-zinc-800 rounded-full">
                    <div
                      className={`h-full rounded-full transition-all ${
                        percent > 100 ? 'bg-red-500' : percent >= 80 ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, percent)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Macro Breakdown */}
      <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-300 mb-4">Macro Distribution (7-day avg)</h3>
        <div className="flex items-center justify-center gap-4">
          <MacroCircle
            label="Protein"
            value={avgProtein}
            target={profile.target_protein}
            color="bg-blue-500"
          />
          <MacroCircle
            label="Carbs"
            value={
              userStats.length > 0
                ? Math.round(userStats.reduce((sum, s) => sum + s.carbs_consumed, 0) / userStats.length)
                : 0
            }
            target={profile.target_carbs}
            color="bg-amber-500"
          />
          <MacroCircle
            label="Fat"
            value={
              userStats.length > 0
                ? Math.round(userStats.reduce((sum, s) => sum + s.fat_consumed, 0) / userStats.length)
                : 0
            }
            target={profile.target_fat}
            color="bg-purple-500"
          />
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  target?: number;
  suffix?: string;
  color: 'orange' | 'blue' | 'emerald';
}

function StatCard({ icon, label, value, target, suffix, color }: StatCardProps) {
  const bgColors = {
    orange: 'bg-orange-500/10',
    blue: 'bg-blue-500/10',
    emerald: 'bg-emerald-500/10',
  };

  return (
    <div className={`${bgColors[color]} rounded-xl p-3 text-center border border-zinc-800`}>
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-lg font-bold text-white">{value}</p>
      <p className="text-xs text-zinc-400">{label}</p>
      {target && (
        <p className="text-xs text-zinc-500">
          Target: {target}
          {suffix}
        </p>
      )}
    </div>
  );
}

interface MacroCircleProps {
  label: string;
  value: number;
  target: number;
  color: string;
}

function MacroCircle({ label, value, target, color }: MacroCircleProps) {
  const percent = target > 0 ? Math.min(100, Math.round((value / target) * 100)) : 0;

  return (
    <div className="text-center">
      <div className="relative w-16 h-16 mx-auto mb-2">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="32" cy="32" r="28" stroke="#3f3f46" strokeWidth="6" fill="none" />
          <circle
            cx="32"
            cy="32"
            r="28"
            stroke="currentColor"
            strokeWidth="6"
            fill="none"
            strokeDasharray={`${(percent / 100) * 176} 176`}
            className={color.replace('bg-', 'text-')}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{percent}%</span>
        </div>
      </div>
      <p className="text-xs font-medium text-zinc-300">{label}</p>
      <p className="text-xs text-zinc-500">
        {value}g / {target}g
      </p>
    </div>
  );
}
