'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured as checkSupabaseConfigured } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/authStore';
import { useNotificationStore } from '@/store/notificationStore';
import { useConnectionStore } from '@/store/connectionStore';

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isInitialized, setIsInitialized] = useState(false);

  const { refreshProfile, setUser, setLoading, isAuthenticated } = useAuthStore();
  const { fetchNotifications, subscribeToNotifications } = useNotificationStore();
  const { fetchConnections } = useConnectionStore();

  useEffect(() => {
    // If Supabase isn't configured, just render children (legacy mode)
    if (!checkSupabaseConfigured()) {
      setIsInitialized(true);
      setLoading(false);
      return;
    }

    // Skip auth check on callback page - let the callback handle it
    if (pathname === '/auth/callback') {
      setIsInitialized(true);
      return;
    }

    // Check initial auth state
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          await refreshProfile();
          fetchNotifications();
          fetchConnections();
        } else {
          setUser(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        console.log('Auth state changed:', event, session?.user?.email);

        if (event === 'SIGNED_IN' && session) {
          try {
            await refreshProfile();
            fetchNotifications();
            fetchConnections();
          } catch (error) {
            console.error('Error on SIGNED_IN:', error);
            setLoading(false);
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          router.push('/login');
        } else if (event === 'TOKEN_REFRESHED' && session) {
          // Token was refreshed, ensure we have the latest profile
          await refreshProfile();
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Subscribe to real-time notifications when authenticated
  useEffect(() => {
    const { user } = useAuthStore.getState();
    if (user) {
      const unsubscribe = subscribeToNotifications(user.id);
      return () => unsubscribe();
    }
  }, [isAuthenticated]);

  // Show loading state while initializing
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
