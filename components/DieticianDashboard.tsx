'use client';

import { useState, useEffect } from 'react';
import { Users, UserPlus, TrendingUp, Utensils, ChevronRight } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useConnectionStore } from '@/store/connectionStore';
import { AddConnectionModal } from './AddConnectionModal';
import { DieticianClientView } from '@/lib/types';

export function DieticianDashboard() {
  const { user, clients, setActiveClient, activeClient, setViewMode } = useAuthStore();
  const { connections } = useConnectionStore();

  const [showAddClient, setShowAddClient] = useState(false);

  // Filter client connections
  const clientConnections = connections.filter(
    (c) => c.type === 'dietician_client' && c.requester_id === user?.id && c.status === 'accepted'
  );

  const handleSelectClient = (client: DieticianClientView) => {
    setActiveClient(client.profile);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Clients</h1>
          <p className="text-zinc-400">Manage your clients&apos; meal plans</p>
        </div>
        <button
          onClick={() => setShowAddClient(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
        >
          <UserPlus className="w-5 h-5" />
          Add Client
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-zinc-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{clients.length}</p>
              <p className="text-sm text-zinc-400">Total Clients</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-sm text-zinc-400">Active Today</p>
            </div>
          </div>
        </div>
        <div className="bg-zinc-900 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
              <Utensils className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">0</p>
              <p className="text-sm text-zinc-400">Plans Created</p>
            </div>
          </div>
        </div>
      </div>

      {/* Client List */}
      <div className="bg-zinc-900 rounded-xl">
        <div className="p-4 border-b border-zinc-800">
          <h2 className="font-semibold text-white">Your Clients</h2>
        </div>

        {clients.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-zinc-600" />
            </div>
            <h3 className="font-medium text-white mb-2">No clients yet</h3>
            <p className="text-zinc-400 text-sm mb-4">
              Add your first client to start managing their meal plans.
            </p>
            <button
              onClick={() => setShowAddClient(true)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
            >
              Add Client
            </button>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800">
            {clients.map((client) => (
              <button
                key={client.profile.id}
                onClick={() => handleSelectClient(client)}
                className={`w-full flex items-center gap-4 p-4 hover:bg-zinc-800/50 transition-colors text-left ${
                  activeClient?.id === client.profile.id ? 'bg-zinc-800' : ''
                }`}
              >
                <div className="w-12 h-12 bg-zinc-700 rounded-full flex items-center justify-center">
                  {client.profile.avatar_url ? (
                    <img
                      src={client.profile.avatar_url}
                      alt={client.profile.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-medium text-zinc-400">
                      {client.profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-white">{client.profile.name}</p>
                  <p className="text-sm text-zinc-400">{client.profile.email}</p>
                  {client.profile.goal && (
                    <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-700 text-zinc-300 text-xs rounded">
                      {client.profile.goal.replace('_', ' ')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="text-sm">
                    {client.plans.length} plan{client.plans.length !== 1 ? 's' : ''}
                  </span>
                  <ChevronRight className="w-5 h-5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      {activeClient && (
        <div className="bg-zinc-900 rounded-xl p-4">
          <h3 className="font-medium text-white mb-3">
            Quick Actions for {activeClient.name}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setViewMode('single')}
              className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
            >
              <Utensils className="w-5 h-5 text-red-400" />
              <span className="text-sm font-medium text-white">View Plan</span>
            </button>
            <button className="flex items-center gap-2 p-3 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors">
              <TrendingUp className="w-5 h-5 text-green-400" />
              <span className="text-sm font-medium text-white">View Progress</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Client Modal */}
      <AddConnectionModal
        isOpen={showAddClient}
        onClose={() => setShowAddClient(false)}
      />
    </div>
  );
}
