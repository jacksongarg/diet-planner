'use client';

import { useState } from 'react';
import { ChefHat, Pencil, X, Save } from 'lucide-react';
import { SharedPrep } from '@/lib/types';

interface SharedPrepSectionProps {
  sharedPrep: SharedPrep;
  overlapScore: number;
  onUpdate: (notes: string[]) => void;
}

export function SharedPrepSection({ sharedPrep, overlapScore, onUpdate }: SharedPrepSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(sharedPrep.notes.join('\n'));

  const handleSave = () => {
    const newNotes = notes
      .split('\n')
      .map((n) => n.trim())
      .filter((n) => n.length > 0);
    onUpdate(newNotes);
    setIsEditing(false);
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-emerald-600" />
          <h3 className="font-semibold text-emerald-800">Shared Prep</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-emerald-600 bg-emerald-100 px-2 py-1 rounded-full">
            {overlapScore}% overlap
          </span>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
            >
              <Pencil className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex gap-1">
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSave}
                className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {isEditing ? (
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-emerald-200 rounded-lg text-sm text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-white"
          rows={4}
          placeholder="Enter prep notes, one per line..."
        />
      ) : (
        <ul className="space-y-1.5">
          {sharedPrep.notes.map((note, index) => (
            <li key={index} className="flex items-start gap-2 text-sm text-emerald-800">
              <span className="text-emerald-500 mt-0.5">•</span>
              {note}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
