'use client';

import { useState } from 'react';
import { Plus, Check, Pill, X, Clock } from 'lucide-react';
import { User, Supplement, SUPPLEMENT_TIMINGS, SupplementTiming, USER_LABELS } from '@/lib/types';
import { useDietStore } from '@/store/dietStore';

interface SupplementsSectionProps {
  user: User;
  date: string;
}

export function SupplementsSection({ user, date }: SupplementsSectionProps) {
  const { supplements, supplementTracker, toggleSupplementTaken, addSupplement, removeSupplement } =
    useDietStore();
  const [showAddModal, setShowAddModal] = useState(false);

  const userSupplements = supplements[user].filter((s) => s.is_active);
  const trackerKey = `${date}-${user}`;
  const entries = supplementTracker[trackerKey] || [];

  const isTaken = (supplementId: string) => {
    const entry = entries.find((e) => e.supplement_id === supplementId);
    return entry?.taken || false;
  };

  const takenCount = entries.filter((e) => e.taken).length;
  const totalCount = userSupplements.length;
  const adherencePercent = totalCount > 0 ? Math.round((takenCount / totalCount) * 100) : 0;

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-stone-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-stone-800">{USER_LABELS[user]}'s Supplements</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-stone-500">
            {takenCount}/{totalCount} ({adherencePercent}%)
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {userSupplements.length === 0 ? (
        <p className="text-sm text-stone-500 text-center py-4">
          No supplements added yet. Tap + to add one.
        </p>
      ) : (
        <div className="space-y-2">
          {userSupplements.map((supplement) => (
            <div
              key={supplement.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isTaken(supplement.id) ? 'bg-purple-50' : 'bg-stone-50'
              }`}
            >
              <button
                onClick={() => toggleSupplementTaken(user, supplement.id, date)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isTaken(supplement.id)
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'border-stone-300 hover:border-purple-400'
                }`}
              >
                {isTaken(supplement.id) && <Check className="w-4 h-4" />}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm ${
                    isTaken(supplement.id) ? 'text-stone-500 line-through' : 'text-stone-800'
                  }`}
                >
                  {supplement.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span>{supplement.dosage}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {supplement.timing
                      .map((t) => SUPPLEMENT_TIMINGS.find((st) => st.value === t)?.label)
                      .join(', ')}
                  </span>
                </div>
              </div>

              <button
                onClick={() => removeSupplement(user, supplement.id)}
                className="p-1 text-stone-400 hover:text-red-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showAddModal && (
        <AddSupplementModal user={user} onClose={() => setShowAddModal(false)} onAdd={addSupplement} />
      )}
    </div>
  );
}

interface AddSupplementModalProps {
  user: User;
  onClose: () => void;
  onAdd: (user: User, supplement: Omit<Supplement, 'id' | 'created_at'>) => void;
}

function AddSupplementModal({ user, onClose, onAdd }: AddSupplementModalProps) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timing, setTiming] = useState<SupplementTiming[]>(['morning']);
  const [notes, setNotes] = useState('');

  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim()) return;

    onAdd(user, {
      user,
      name: name.trim(),
      dosage: dosage.trim(),
      timing,
      notes: notes.trim() || undefined,
      is_active: true,
    });
    onClose();
  };

  const toggleTiming = (t: SupplementTiming) => {
    setTiming((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div className="relative bg-white w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-stone-800">Add Supplement</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vitamin D3"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 2000 IU"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Timing</label>
            <div className="flex flex-wrap gap-2">
              {SUPPLEMENT_TIMINGS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleTiming(t.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    timing.includes(t.value)
                      ? 'bg-purple-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
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
            onClick={handleSubmit}
            disabled={!name.trim() || !dosage.trim()}
            className="flex-1 px-4 py-3 text-white bg-purple-600 rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add Supplement
          </button>
        </div>
      </div>
    </div>
  );
}
