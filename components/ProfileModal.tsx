'use client';

import { useState, useEffect } from 'react';
import { X, Save, Calculator } from 'lucide-react';
import { User, UserProfile, ACTIVITY_LEVELS, DIET_GOALS, USER_LABELS } from '@/lib/types';
import { useDietStore, calculateTargets } from '@/store/dietStore';

interface ProfileModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
}

export function ProfileModal({ isOpen, user, onClose }: ProfileModalProps) {
  const { profiles, updateProfile } = useDietStore();
  const profile = profiles[user];

  const [name, setName] = useState(profile.name);
  const [heightCm, setHeightCm] = useState(profile.height_cm);
  const [weightKg, setWeightKg] = useState(profile.weight_kg);
  const [age, setAge] = useState(profile.age);
  const [gender, setGender] = useState<'male' | 'female'>(profile.gender);
  const [activityLevel, setActivityLevel] = useState(profile.activity_level);
  const [goal, setGoal] = useState(profile.goal);

  // Calculate preview targets
  const previewProfile: UserProfile = {
    ...profile,
    height_cm: heightCm,
    weight_kg: weightKg,
    age,
    gender,
    activity_level: activityLevel,
    goal,
  };
  const calculatedTargets = calculateTargets(previewProfile);

  useEffect(() => {
    if (isOpen) {
      setName(profile.name);
      setHeightCm(profile.height_cm);
      setWeightKg(profile.weight_kg);
      setAge(profile.age);
      setGender(profile.gender);
      setActivityLevel(profile.activity_level);
      setGoal(profile.goal);
    }
  }, [isOpen, profile]);

  if (!isOpen) return null;

  const handleSave = () => {
    updateProfile(user, {
      name,
      height_cm: heightCm,
      weight_kg: weightKg,
      age,
      gender,
      activity_level: activityLevel,
      goal,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-800">{USER_LABELS[user]}'s Profile</h2>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Height (cm)</label>
              <input
                type="number"
                value={heightCm}
                onChange={(e) => setHeightCm(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Weight (kg)</label>
              <input
                type="number"
                value={weightKg}
                onChange={(e) => setWeightKg(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          {/* Activity Level */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Activity Level</label>
            <select
              value={activityLevel}
              onChange={(e) => setActivityLevel(e.target.value as typeof activityLevel)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ACTIVITY_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
          </div>

          {/* Goal */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Goal</label>
            <select
              value={goal}
              onChange={(e) => setGoal(e.target.value as typeof goal)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {DIET_GOALS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>

          {/* Calculated Targets Preview */}
          <div className="bg-emerald-50 rounded-xl p-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-emerald-600" />
              <span className="text-sm font-medium text-emerald-800">Calculated Daily Targets</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-stone-600">Calories:</span>
                <span className="ml-2 font-medium text-stone-800">{calculatedTargets.calories}</span>
              </div>
              <div>
                <span className="text-stone-600">Protein:</span>
                <span className="ml-2 font-medium text-stone-800">{calculatedTargets.protein}g</span>
              </div>
              <div>
                <span className="text-stone-600">Carbs:</span>
                <span className="ml-2 font-medium text-stone-800">{calculatedTargets.carbs}g</span>
              </div>
              <div>
                <span className="text-stone-600">Fat:</span>
                <span className="ml-2 font-medium text-stone-800">{calculatedTargets.fat}g</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-stone-600 bg-stone-100 rounded-xl font-medium hover:bg-stone-200"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 text-white bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
