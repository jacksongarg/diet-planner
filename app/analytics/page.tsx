'use client';

import { useState } from 'react';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { User, USER_LABELS } from '@/lib/types';

export default function AnalyticsPage() {
  const [selectedUser, setSelectedUser] = useState<User>('jackson');

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-stone-800 mb-6">Analytics</h1>

        {/* User Toggle */}
        <div className="flex gap-2 p-1 bg-stone-200 rounded-lg mb-6">
          {(['jackson', 'rymma'] as User[]).map((user) => (
            <button
              key={user}
              onClick={() => setSelectedUser(user)}
              className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                selectedUser === user
                  ? 'bg-white text-stone-800 shadow-sm'
                  : 'text-stone-500 hover:text-stone-700'
              }`}
            >
              {USER_LABELS[user]}
            </button>
          ))}
        </div>

        <AnalyticsDashboard user={selectedUser} />
      </div>
    </div>
  );
}
