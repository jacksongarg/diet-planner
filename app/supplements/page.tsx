'use client';

import { useRouter } from 'next/navigation';
import { useDietStore } from '@/store/dietStore';
import { useAuthStore } from '@/store/authStore';
import { SupplementsSection } from '@/components/SupplementsSection';
import { User } from '@/lib/types';
import { Pill } from 'lucide-react';

export default function SupplementsPage() {
  const router = useRouter();
  const { selectedDate } = useDietStore();
  const { user, isAuthenticated, isLoading, viewMode, activePartner } = useAuthStore();

  const dateDisplay = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });

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
            <Pill className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Supplements</h1>
          <p className="text-zinc-400 mb-6">Sign in to track your daily supplements.</p>
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

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-white">Supplements</h1>
          <p className="text-sm text-zinc-400">{dateDisplay}</p>
        </div>

        <div className="space-y-6">
          {/* Current User's Supplements */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                {currentUserName[0].toUpperCase()}
              </div>
              <h2 className="text-lg font-semibold text-white">{currentUserName}</h2>
            </div>
            <SupplementsSection user="jackson" date={selectedDate} />
          </div>

          {/* Partner's Supplements - only in couple mode */}
          {showBothUsers && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                  {(activePartner?.name || 'P')[0].toUpperCase()}
                </div>
                <h2 className="text-lg font-semibold text-white">{activePartner?.name || 'Partner'}</h2>
              </div>
              <SupplementsSection user="rymma" date={selectedDate} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
