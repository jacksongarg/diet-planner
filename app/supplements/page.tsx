'use client';

import { useDietStore } from '@/store/dietStore';
import { SupplementsSection } from '@/components/SupplementsSection';
import { User } from '@/lib/types';

export default function SupplementsPage() {
  const { selectedDate } = useDietStore();

  const dateDisplay = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-stone-800">Supplements</h1>
          <p className="text-sm text-stone-500">{dateDisplay}</p>
        </div>

        <div className="space-y-4">
          {(['jackson', 'rymma'] as User[]).map((user) => (
            <SupplementsSection key={user} user={user} date={selectedDate} />
          ))}
        </div>
      </div>
    </div>
  );
}
