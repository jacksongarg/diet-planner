'use client';

import { useState, useEffect, useRef } from 'react';
import { useDietStore } from '@/store/dietStore';
import { User, USER_LABELS } from '@/lib/types';
import { X, Scale, SkipForward } from 'lucide-react';

interface WeightEntryModalProps {
  isOpen: boolean;
  user: User;
  onClose: () => void;
}

export function WeightEntryModal({ isOpen, user, onClose }: WeightEntryModalProps) {
  const { recordWeight, dismissWeightPrompt, getLatestWeight, profiles } = useDietStore();
  const [weight, setWeight] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const latestWeight = getLatestWeight(user);
  const profileWeight = profiles[user].weight_kg;
  const previousWeight = latestWeight?.weight_kg || profileWeight;

  useEffect(() => {
    if (isOpen) {
      // Pre-fill with previous weight
      setWeight(previousWeight.toString());
      // Focus input after modal opens
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [isOpen, previousWeight]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const weightNum = parseFloat(weight);
    if (!isNaN(weightNum) && weightNum > 0) {
      recordWeight(user, weightNum);
      onClose();
    }
  };

  const handleSkip = () => {
    dismissWeightPrompt(user);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl">
        <div className="p-4 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-stone-800">
              {USER_LABELS[user]}&apos;s Weight
            </h2>
          </div>
          <button
            onClick={handleSkip}
            className="p-1 hover:bg-stone-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-stone-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          <p className="text-sm text-stone-600 mb-4">
            Enter today&apos;s weight for {USER_LABELS[user]}
          </p>

          <div className="relative mb-4">
            <input
              ref={inputRef}
              type="number"
              step="0.1"
              min="30"
              max="300"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="Weight in kg"
              className="w-full px-4 py-3 text-2xl font-semibold text-center border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 text-lg">
              kg
            </span>
          </div>

          {latestWeight && (
            <p className="text-xs text-stone-500 text-center mb-4">
              Last recorded: {latestWeight.weight_kg} kg on {new Date(latestWeight.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleSkip}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-medium transition-colors"
            >
              <SkipForward className="w-4 h-4" />
              Skip
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-medium transition-colors"
            >
              Save
            </button>
          </div>

          <p className="text-xs text-stone-400 text-center mt-3">
            Skip will use previous weight ({previousWeight} kg)
          </p>
        </form>
      </div>
    </div>
  );
}
