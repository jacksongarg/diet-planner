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
    <div className="bg-zinc-900 rounded-xl p-4 border border-zinc-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Pill className="w-5 h-5 text-purple-400" />
          <h3 className="font-semibold text-white">{USER_LABELS[user]}'s Supplements</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">
            {takenCount}/{totalCount} ({adherencePercent}%)
          </span>
          <button
            onClick={() => setShowAddModal(true)}
            className="p-1.5 text-purple-400 hover:bg-zinc-800 rounded-lg"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {userSupplements.length === 0 ? (
        <p className="text-sm text-zinc-500 text-center py-4">
          No supplements added yet. Tap + to add one.
        </p>
      ) : (
        <div className="space-y-2">
          {userSupplements.map((supplement) => (
            <div
              key={supplement.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                isTaken(supplement.id) ? 'bg-purple-500/10' : 'bg-zinc-800'
              }`}
            >
              <button
                onClick={() => toggleSupplementTaken(user, supplement.id, date)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isTaken(supplement.id)
                    ? 'bg-purple-500 border-purple-500 text-white'
                    : 'border-zinc-600 hover:border-purple-400'
                }`}
              >
                {isTaken(supplement.id) && <Check className="w-4 h-4" />}
              </button>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium text-sm ${
                    isTaken(supplement.id) ? 'text-zinc-500 line-through' : 'text-white'
                  }`}
                >
                  {supplement.name}
                </p>
                <div className="flex items-center gap-2 text-xs text-zinc-500">
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
                className="p-1 text-zinc-500 hover:text-red-400"
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
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <div className="relative bg-zinc-900 w-full sm:max-w-md sm:rounded-2xl rounded-t-2xl p-6 shadow-xl max-h-[90vh] overflow-y-auto border border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Add Supplement</h2>
          <button onClick={onClose} className="p-2 text-zinc-400 hover:text-zinc-200 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Vitamin D3"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Dosage</label>
            <input
              type="text"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="e.g., 2000 IU"
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Timing</label>
            <div className="flex flex-wrap gap-2">
              {SUPPLEMENT_TIMINGS.map((t) => (
                <button
                  key={t.value}
                  onClick={() => toggleTiming(t.value)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    timing.includes(t.value)
                      ? 'bg-purple-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {t.icon} {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-1">Notes (optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any special instructions..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 text-zinc-300 bg-zinc-800 rounded-xl font-medium hover:bg-zinc-700"
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
