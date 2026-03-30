'use client';

import { useState } from 'react';
import { useDietStore, calculateTargets } from '@/store/dietStore';
import { User, USER_LABELS, ACTIVITY_LEVELS, DIET_GOALS } from '@/lib/types';
import { ProfileModal } from '@/components/ProfileModal';
import { User as UserIcon, Activity, Target, Scale, Ruler, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { profiles } = useDietStore();
  const [editingUser, setEditingUser] = useState<User | null>(null);

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">User Profiles</h1>

        <div className="space-y-4">
          {(['jackson', 'rymma'] as User[]).map((user) => {
            const profile = profiles[user];
            const targets = calculateTargets(profile);

            return (
              <div key={user} className="bg-white rounded-xl p-5 shadow-sm border border-stone-100">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-stone-800">{profile.name}</h2>
                      <p className="text-sm text-stone-500">
                        {profile.age} years • {profile.gender === 'male' ? 'Male' : 'Female'}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setEditingUser(user)}
                    className="px-3 py-1.5 text-sm text-emerald-600 hover:bg-emerald-50 rounded-lg font-medium"
                  >
                    Edit
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Ruler className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-600">{profile.height_cm} cm</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Scale className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-600">{profile.weight_kg} kg</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Activity className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-600">
                      {ACTIVITY_LEVELS.find((a) => a.value === profile.activity_level)?.label.split(' ')[0]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4 text-stone-400" />
                    <span className="text-stone-600">
                      {DIET_GOALS.find((g) => g.value === profile.goal)?.label}
                    </span>
                  </div>
                </div>

                {/* Daily Targets */}
                <div className="bg-stone-50 rounded-lg p-4">
                  <h3 className="text-sm font-medium text-stone-700 mb-3">Daily Targets</h3>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-lg font-bold text-orange-600">{profile.target_calories}</p>
                      <p className="text-xs text-stone-500">Calories</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-blue-600">{profile.target_protein}g</p>
                      <p className="text-xs text-stone-500">Protein</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-amber-600">{profile.target_carbs}g</p>
                      <p className="text-xs text-stone-500">Carbs</p>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-purple-600">{profile.target_fat}g</p>
                      <p className="text-xs text-stone-500">Fat</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {editingUser && (
        <ProfileModal isOpen={true} user={editingUser} onClose={() => setEditingUser(null)} />
      )}
    </div>
  );
}
