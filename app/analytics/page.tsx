'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useAuthStore } from '@/store/authStore';
import { User, USER_LABELS } from '@/lib/types';
import { BarChart3 } from 'lucide-react';

export default function AnalyticsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading, viewMode, activePartner } = useAuthStore();
  const [selectedUser, setSelectedUser] = useState<User>('jackson');

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Analytics</h1>
          <p className="text-zinc-400 mb-6">Sign in to view your progress and analytics.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // Determine which users to show based on view mode
  const showBothUsers = viewMode === 'couple' && activePartner;
  const currentUserName = user?.name || 'You';

  // Get users to show in toggle
  const usersToShow: { key: User; label: string }[] = showBothUsers
    ? [
        { key: 'jackson', label: currentUserName },
        { key: 'rymma', label: activePartner?.name || 'Partner' },
      ]
    : [{ key: 'jackson', label: currentUserName }];

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-white mb-6">Analytics</h1>

        {/* User Toggle - only show if couple mode */}
        {showBothUsers && (
          <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg mb-6">
            {usersToShow.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedUser(key)}
                className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  selectedUser === key
                    ? 'bg-zinc-700 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        <AnalyticsDashboard user={selectedUser} />
      </div>
    </div>
  );
}
