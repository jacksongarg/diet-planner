'use client';

import { useState } from 'react';
import { X, Search, UserPlus, Users, UserCog, Loader2 } from 'lucide-react';
import { useConnectionStore } from '@/store/connectionStore';
import { useAuthStore } from '@/store/authStore';
import { ConnectionType, DietProfile } from '@/lib/types';

interface AddConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddConnectionModal({ isOpen, onClose }: AddConnectionModalProps) {
  const { user } = useAuthStore();
  const { sendRequest, searchUsers } = useConnectionStore();

  const [step, setStep] = useState<'type' | 'search'>('type');
  const [connectionType, setConnectionType] = useState<ConnectionType>('couple');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<DietProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    setError(null);

    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    const results = await searchUsers(query);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleSendRequest = async (recipientEmail: string) => {
    setIsSending(true);
    setError(null);

    const result = await sendRequest(recipientEmail, connectionType);

    if (result.success) {
      setSuccess('Request sent successfully!');
      setTimeout(() => {
        onClose();
        resetModal();
      }, 1500);
    } else {
      setError(result.error || 'Failed to send request');
    }

    setIsSending(false);
  };

  const resetModal = () => {
    setStep('type');
    setConnectionType('couple');
    setSearchQuery('');
    setSearchResults([]);
    setError(null);
    setSuccess(null);
  };

  if (!isOpen) return null;

  const connectionTypes = [
    {
      type: 'couple' as ConnectionType,
      icon: Users,
      title: 'Partner',
      description: 'Share meal plans and track together',
    },
    {
      type: 'friend' as ConnectionType,
      icon: UserPlus,
      title: 'Friend',
      description: 'View each other\'s progress',
    },
  ];

  // Add dietician option if user is a dietician
  if (user?.role === 'dietician') {
    connectionTypes.push({
      type: 'dietician_client' as ConnectionType,
      icon: UserCog,
      title: 'Client',
      description: 'Manage their meal plans',
    });
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-md shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-white">
            {step === 'type' ? 'Add Connection' : 'Find User'}
          </h2>
          <button
            onClick={() => {
              onClose();
              resetModal();
            }}
            className="p-1 hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {step === 'type' ? (
            <div className="space-y-3">
              <p className="text-zinc-400 text-sm mb-4">
                What type of connection would you like to add?
              </p>

              {connectionTypes.map(({ type, icon: Icon, title, description }) => (
                <button
                  key={type}
                  onClick={() => {
                    setConnectionType(type);
                    setStep('search');
                  }}
                  className="w-full flex items-center gap-4 p-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <Icon className="w-6 h-6 text-red-400" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{title}</p>
                    <p className="text-sm text-zinc-400">{description}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Back button */}
              <button
                onClick={() => setStep('type')}
                className="text-sm text-zinc-400 hover:text-white transition-colors"
              >
                ← Back
              </button>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Error/Success messages */}
              {error && (
                <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                  {success}
                </div>
              )}

              {/* Search results */}
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-zinc-500 animate-spin" />
                  </div>
                ) : searchResults.length === 0 && searchQuery.length >= 2 ? (
                  <p className="text-center text-zinc-500 py-4">
                    No users found
                  </p>
                ) : (
                  searchResults.map((profile) => (
                    <div
                      key={profile.id}
                      className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                          {profile.avatar_url ? (
                            <img
                              src={profile.avatar_url}
                              alt={profile.name}
                              className="w-10 h-10 rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-lg font-medium text-zinc-400">
                              {profile.name.charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-white">{profile.name}</p>
                          <p className="text-sm text-zinc-400">{profile.email}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleSendRequest(profile.email)}
                        disabled={isSending}
                        className="px-3 py-1.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        {isSending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <UserPlus className="w-4 h-4" />
                            Add
                          </>
                        )}
                      </button>
                    </div>
                  ))
                )}
              </div>

              {/* Or enter email manually */}
              {searchQuery.includes('@') && searchResults.length === 0 && (
                <button
                  onClick={() => handleSendRequest(searchQuery)}
                  disabled={isSending}
                  className="w-full py-2.5 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5" />
                      Send request to {searchQuery}
                    </>
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
