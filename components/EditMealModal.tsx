'use client';

import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Meal, MealType, User, DayOfWeek, MEAL_TYPES, USER_LABELS, DAY_LABELS } from '@/lib/types';

interface EditMealModalProps {
  isOpen: boolean;
  meal: Meal | null;
  user: User;
  day: DayOfWeek;
  onClose: () => void;
  onSave: (text: string, saveAsDefault: boolean) => void;
}

export function EditMealModal({ isOpen, meal, user, day, onClose, onSave }: EditMealModalProps) {
  const [text, setText] = useState('');
  const [saveAsDefault, setSaveAsDefault] = useState(false);

  useEffect(() => {
    if (meal) {
      setText(meal.text);
      setSaveAsDefault(false);
    }
  }, [meal]);

  if (!isOpen || !meal) return null;

  const label = MEAL_TYPES.find((m) => m.key === meal.type)?.label || meal.type;

  const handleSave = () => {
    onSave(text, saveAsDefault);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-stone-800">Edit {label}</h2>
            <p className="text-sm text-stone-500">
              {USER_LABELS[user]} • {DAY_LABELS[day]}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input */}
        <div className="mb-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full px-4 py-3 border border-stone-200 rounded-xl text-stone-800 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            rows={4}
            placeholder="Enter meal details..."
          />
        </div>

        {/* Save options */}
        <div className="mb-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={saveAsDefault}
              onChange={(e) => setSaveAsDefault(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-stone-300 rounded focus:ring-emerald-500"
            />
            <span className="text-sm text-stone-600">Save as new default for {DAY_LABELS[day]}</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-stone-600 bg-stone-100 rounded-xl font-medium hover:bg-stone-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 text-white bg-emerald-600 rounded-xl font-medium hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            {saveAsDefault ? 'Save as Default' : 'Save for Today'}
          </button>
        </div>
      </div>
    </div>
  );
}
