'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDietStore, calculateTargets } from '@/store/dietStore';
import { useAuthStore } from '@/store/authStore';
import { User, USER_LABELS, ACTIVITY_LEVELS, DIET_GOALS } from '@/lib/types';
import { ProfileModal } from '@/components/ProfileModal';
import { ModeToggle } from '@/components/ModeToggle';
import { User as UserIcon, Activity, Target, Scale, Ruler, LogOut, Users, Mail, ChevronRight } from 'lucide-react';

export default function ProfilePage() {
  const router = useRouter();
  const { profiles } = useDietStore();
  const { user, isAuthenticated, signOut, viewMode, connectedUsers } = useAuthStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Show only current user's profile if authenticated, otherwise show both
  const usersToShow: User[] = isAuthenticated ? ['jackson'] : ['jackson', 'rymma'];

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Header with user info */}
        {isAuthenticated && user && (
          <div className="bg-zinc-900 rounded-xl p-5 mb-6 border border-zinc-800">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center">
                {user.avatar_url ? (
                  <img src={user.avatar_url} alt={user.name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <span className="text-2xl font-bold text-white">{user.name[0].toUpperCase()}</span>
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">{user.name}</h1>
                <p className="text-zinc-400 text-sm flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {user.email}
                </p>
              </div>
            </div>

            {/* Stats if available */}
            {(user.height_cm || user.weight_kg) && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {user.height_cm && (
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">{user.height_cm} cm</span>
                  </div>
                )}
                {user.weight_kg && (
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-zinc-500" />
                    <span className="text-zinc-300">{user.weight_kg} kg</span>
                  </div>
                )}
              </div>
            )}

            {/* Daily Targets */}
            {user.target_calories && (
              <div className="bg-zinc-800 rounded-lg p-4">
                <h3 className="text-sm font-medium text-zinc-400 mb-3">Daily Targets</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="text-lg font-bold text-orange-400">{user.target_calories}</p>
                    <p className="text-xs text-zinc-500">Calories</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-blue-400">{user.target_protein || '-'}g</p>
                    <p className="text-xs text-zinc-500">Protein</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-amber-400">{user.target_carbs || '-'}g</p>
                    <p className="text-xs text-zinc-500">Carbs</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-purple-400">{user.target_fat || '-'}g</p>
                    <p className="text-xs text-zinc-500">Fat</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* View Mode Settings */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">View Mode</h2>
          <ModeToggle />
        </div>

        {/* Connected Users */}
        {connectedUsers.length > 0 && (
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-white mb-3">Connected Users</h2>
            <div className="bg-zinc-900 rounded-xl border border-zinc-800 divide-y divide-zinc-800">
              {connectedUsers.map((cu) => (
                <div key={cu.profile.id} className="flex items-center gap-3 p-4">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium">{cu.profile.name[0].toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-white">{cu.profile.name}</p>
                    <p className="text-sm text-zinc-400">
                      {cu.connection.type === 'couple' ? 'Partner' : 'Friend'}
                    </p>
                  </div>
                  <Users className="w-5 h-5 text-zinc-500" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legacy Profiles (for backward compatibility) */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-white mb-3">Meal Plan Profiles</h2>
          <div className="space-y-4">
            {usersToShow.map((legacyUser) => {
              const profile = profiles[legacyUser];
              const targets = calculateTargets(profile);

              return (
                <div key={legacyUser} className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        legacyUser === 'jackson' ? 'bg-blue-500' : 'bg-pink-500'
                      }`}>
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold text-white">{profile.name}</h2>
                        <p className="text-sm text-zinc-400">
                          {profile.age} years - {profile.gender === 'male' ? 'Male' : 'Female'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingUser(legacyUser)}
                      className="px-3 py-1.5 text-sm text-red-400 hover:bg-zinc-800 rounded-lg font-medium"
                    >
                      Edit
                    </button>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Ruler className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-300">{profile.height_cm} cm</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Scale className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-300">{profile.weight_kg} kg</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-300">
                        {ACTIVITY_LEVELS.find((a) => a.value === profile.activity_level)?.label.split(' ')[0]}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Target className="w-4 h-4 text-zinc-500" />
                      <span className="text-zinc-300">
                        {DIET_GOALS.find((g) => g.value === profile.goal)?.label}
                      </span>
                    </div>
                  </div>

                  {/* Daily Targets */}
                  <div className="bg-zinc-800 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-zinc-400 mb-3">Daily Targets</h3>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div>
                        <p className="text-lg font-bold text-orange-400">{profile.target_calories}</p>
                        <p className="text-xs text-zinc-500">Calories</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-blue-400">{profile.target_protein}g</p>
                        <p className="text-xs text-zinc-500">Protein</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-amber-400">{profile.target_carbs}g</p>
                        <p className="text-xs text-zinc-500">Carbs</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-purple-400">{profile.target_fat}g</p>
                        <p className="text-xs text-zinc-500">Fat</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Sign Out Button */}
        {isAuthenticated && (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 py-3 bg-zinc-900 hover:bg-zinc-800 text-red-400 font-medium rounded-xl transition-colors border border-zinc-800"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        )}
      </div>

      {editingUser && (
        <ProfileModal isOpen={true} user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
}
