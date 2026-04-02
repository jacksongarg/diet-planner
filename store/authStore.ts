'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import {
  DietProfile,
  ViewMode,
  DietAuthState,
  ConnectedUserView,
  DieticianClientView,
  Connection,
  MealPlanWithDays,
} from '@/lib/types';

interface AuthStore extends DietAuthState {
  // Auth actions
  setUser: (user: DietProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setViewMode: (mode: ViewMode) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;

  // Connection actions
  setConnectedUsers: (users: ConnectedUserView[]) => void;
  setActivePartner: (partner: DietProfile | null) => void;
  setActiveClient: (client: DietProfile | null) => void;
  setClients: (clients: DieticianClientView[]) => void;
  refreshConnections: () => Promise<void>;

  // Plan actions
  fetchActivePlan: () => Promise<MealPlanWithDays | null>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      isAuthenticated: false,
      isLoading: true,
      viewMode: 'single',
      connectedUsers: [],
      activePartner: null,
      activeClient: null,
      clients: [],

      // Auth actions
      setUser: (user) => set({
        user,
        isAuthenticated: !!user,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setViewMode: async (viewMode) => {
        set({ viewMode });

        // Update in database
        const { user } = get();
        if (user) {
          await supabase
            .from('profiles')
            .update({ view_mode: viewMode })
            .eq('id', user.id);
        }
      },

      refreshProfile: async () => {
        set({ isLoading: true });

        try {
          console.log('Refreshing profile...');
          const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

          if (authError) {
            console.error('Error getting auth user:', authError);
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          if (!authUser) {
            console.log('No auth user found');
            set({ user: null, isAuthenticated: false, isLoading: false });
            return;
          }

          console.log('Auth user found:', authUser.email);

          // Fetch profile
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', authUser.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
            // Profile might not exist yet - create a basic one from auth user
            if (error.code === 'PGRST116') {
              console.log('Profile not found, using auth user data');
              const basicProfile = {
                id: authUser.id,
                email: authUser.email || '',
                name: authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'User',
                role: 'user' as const,
                view_mode: 'single' as const,
              };
              set({
                user: basicProfile as any,
                isAuthenticated: true,
                viewMode: 'single',
                isLoading: false,
              });
              return;
            }
            set({ isLoading: false });
            return;
          }

          console.log('Profile loaded:', profile.name);
          set({
            user: profile,
            isAuthenticated: true,
            viewMode: profile.view_mode || 'single',
            isLoading: false,
          });

          // Refresh connections based on mode
          get().refreshConnections();
        } catch (error) {
          console.error('Error refreshing profile:', error);
          set({ isLoading: false });
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          isAuthenticated: false,
          viewMode: 'single',
          connectedUsers: [],
          activePartner: null,
          activeClient: null,
          clients: [],
        });
      },

      // Connection actions
      setConnectedUsers: (connectedUsers) => set({ connectedUsers }),
      setActivePartner: (activePartner) => set({ activePartner }),
      setActiveClient: (activeClient) => set({ activeClient }),
      setClients: (clients) => set({ clients }),

      refreshConnections: async () => {
        const { user, viewMode } = get();
        if (!user) return;

        try {
          // Fetch accepted connections
          const { data: connections, error } = await supabase
            .from('connections')
            .select(`
              *,
              requester:profiles!connections_requester_id_fkey(*),
              recipient:profiles!connections_recipient_id_fkey(*)
            `)
            .eq('status', 'accepted')
            .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`);

          if (error) {
            console.error('Error fetching connections:', error);
            return;
          }

          if (viewMode === 'couple') {
            // Filter for couple/friend connections
            const coupleConnections = connections?.filter(
              (c: Connection) => c.type === 'couple' || c.type === 'friend'
            ) || [];

            const connectedUsers: ConnectedUserView[] = coupleConnections.map((conn: any) => {
              const partner = conn.requester_id === user.id
                ? conn.recipient
                : conn.requester;

              return {
                connection: conn,
                profile: partner,
              };
            });

            set({ connectedUsers });

            // Auto-select first partner if none selected
            if (connectedUsers.length > 0 && !get().activePartner) {
              set({ activePartner: connectedUsers[0].profile });
            }
          } else if (viewMode === 'dietician' && user.role === 'dietician') {
            // Filter for dietician-client connections where user is the dietician
            const clientConnections = connections?.filter(
              (c: Connection) => c.type === 'dietician_client' && c.requester_id === user.id
            ) || [];

            const clients: DieticianClientView[] = clientConnections.map((conn: any) => ({
              connection: conn,
              profile: conn.recipient,
              plans: [],
            }));

            set({ clients });
          }
        } catch (error) {
          console.error('Error refreshing connections:', error);
        }
      },

      fetchActivePlan: async () => {
        const { user, viewMode, activePartner, activeClient } = get();
        if (!user) return null;

        // Determine which user's plan to fetch
        let targetUserId = user.id;
        if (viewMode === 'couple' && activePartner) {
          targetUserId = activePartner.id;
        } else if (viewMode === 'dietician' && activeClient) {
          targetUserId = activeClient.id;
        }

        try {
          // Fetch active plan with days and meals
          const { data: plan, error } = await supabase
            .from('meal_plans')
            .select(`
              *,
              days:meals(*)
            `)
            .eq('user_id', targetUserId)
            .eq('is_active', true)
            .single();

          if (error) {
            console.error('Error fetching plan:', error);
            return null;
          }

          // Group meals by day
          const dayMap = new Map<string, any>();
          (plan.days || []).forEach((meal: any) => {
            if (!dayMap.has(meal.day_of_week)) {
              dayMap.set(meal.day_of_week, {
                id: `${plan.id}-${meal.day_of_week}`,
                plan_id: plan.id,
                day_of_week: meal.day_of_week,
                meals: [],
                created_at: meal.created_at,
                updated_at: meal.updated_at,
              });
            }
            dayMap.get(meal.day_of_week).meals.push(meal);
          });

          const planWithDays: MealPlanWithDays = {
            ...plan,
            days: Array.from(dayMap.values()),
          };

          return planWithDays;
        } catch (error) {
          console.error('Error fetching active plan:', error);
          return null;
        }
      },
    }),
    {
      name: 'diet-planner-auth',
      partialize: (state) => ({
        viewMode: state.viewMode,
      }),
    }
  )
);
