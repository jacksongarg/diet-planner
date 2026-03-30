'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabase/client';
import { Connection, ConnectionType, DietProfile } from '@/lib/types';

interface ConnectionStore {
  connections: Connection[];
  pendingRequests: Connection[];
  isLoading: boolean;

  // Actions
  fetchConnections: () => Promise<void>;
  sendRequest: (email: string, type: ConnectionType) => Promise<{ success: boolean; error?: string }>;
  acceptRequest: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  rejectRequest: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  removeConnection: (connectionId: string) => Promise<{ success: boolean; error?: string }>;
  searchUsers: (query: string) => Promise<DietProfile[]>;
}

export const useConnectionStore = create<ConnectionStore>((set, get) => ({
  connections: [],
  pendingRequests: [],
  isLoading: false,

  fetchConnections: async () => {
    set({ isLoading: true });

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ connections: [], pendingRequests: [], isLoading: false });
        return;
      }

      // Fetch all connections involving current user
      const { data, error } = await supabase
        .from('connections')
        .select(`
          *,
          requester:profiles!connections_requester_id_fkey(*),
          recipient:profiles!connections_recipient_id_fkey(*)
        `)
        .or(`requester_id.eq.${user.id},recipient_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching connections:', error);
        set({ isLoading: false });
        return;
      }

      const allConnections = (data || []) as Connection[];

      // Separate accepted from pending
      const connections = allConnections.filter((c: Connection) => c.status === 'accepted');
      const pendingRequests = allConnections.filter(
        (c: Connection) => c.status === 'pending' && c.recipient_id === user.id
      );

      set({ connections, pendingRequests, isLoading: false });
    } catch (error) {
      console.error('Error fetching connections:', error);
      set({ isLoading: false });
    }
  },

  sendRequest: async (email: string, type: ConnectionType) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      // Find recipient by email
      const { data: recipient, error: findError } = await supabase
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (findError || !recipient) {
        return { success: false, error: 'User not found with that email' };
      }

      if (recipient.id === user.id) {
        return { success: false, error: 'Cannot connect with yourself' };
      }

      // Check for existing connection
      const { data: existing } = await supabase
        .from('connections')
        .select('*')
        .or(
          `and(requester_id.eq.${user.id},recipient_id.eq.${recipient.id}),` +
          `and(requester_id.eq.${recipient.id},recipient_id.eq.${user.id})`
        )
        .single();

      if (existing) {
        if (existing.status === 'accepted') {
          return { success: false, error: 'Already connected with this user' };
        }
        if (existing.status === 'pending') {
          return { success: false, error: 'Request already pending' };
        }
      }

      // Create connection request
      const { error: insertError } = await supabase
        .from('connections')
        .insert({
          requester_id: user.id,
          recipient_id: recipient.id,
          type,
          status: 'pending',
        });

      if (insertError) {
        console.error('Error creating connection:', insertError);
        return { success: false, error: 'Failed to send request' };
      }

      // Refresh connections
      get().fetchConnections();

      return { success: true };
    } catch (error) {
      console.error('Error sending request:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  acceptRequest: async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'accepted' })
        .eq('id', connectionId);

      if (error) {
        console.error('Error accepting request:', error);
        return { success: false, error: 'Failed to accept request' };
      }

      // Refresh connections
      get().fetchConnections();

      return { success: true };
    } catch (error) {
      console.error('Error accepting request:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  rejectRequest: async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .update({ status: 'rejected' })
        .eq('id', connectionId);

      if (error) {
        console.error('Error rejecting request:', error);
        return { success: false, error: 'Failed to reject request' };
      }

      // Refresh connections
      get().fetchConnections();

      return { success: true };
    } catch (error) {
      console.error('Error rejecting request:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  removeConnection: async (connectionId: string) => {
    try {
      const { error } = await supabase
        .from('connections')
        .delete()
        .eq('id', connectionId);

      if (error) {
        console.error('Error removing connection:', error);
        return { success: false, error: 'Failed to remove connection' };
      }

      // Refresh connections
      get().fetchConnections();

      return { success: true };
    } catch (error) {
      console.error('Error removing connection:', error);
      return { success: false, error: 'An unexpected error occurred' };
    }
  },

  searchUsers: async (query: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || query.length < 2) {
        return [];
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`email.ilike.%${query}%,name.ilike.%${query}%`)
        .neq('id', user.id)
        .limit(10);

      if (error) {
        console.error('Error searching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  },
}));
