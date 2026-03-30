'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, User } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

export function ClientSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { clients, activeClient, setActiveClient } = useAuthStore();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (clients.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors w-full"
      >
        <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
          {activeClient?.avatar_url ? (
            <img
              src={activeClient.avatar_url}
              alt={activeClient.name}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <User className="w-5 h-5 text-zinc-400" />
          )}
        </div>
        <div className="flex-1 text-left">
          <p className="font-medium text-white">
            {activeClient?.name || 'Select client'}
          </p>
          <p className="text-sm text-zinc-400">
            {activeClient ? 'Viewing plan' : 'No client selected'}
          </p>
        </div>
        <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
          {clients.map((client) => (
            <button
              key={client.profile.id}
              onClick={() => {
                setActiveClient(client.profile);
                setIsOpen(false);
              }}
              className={`w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors ${
                activeClient?.id === client.profile.id ? 'bg-zinc-800' : ''
              }`}
            >
              <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                {client.profile.avatar_url ? (
                  <img
                    src={client.profile.avatar_url}
                    alt={client.profile.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="text-lg font-medium text-zinc-400">
                    {client.profile.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-white">{client.profile.name}</p>
                <p className="text-sm text-zinc-400">{client.profile.email}</p>
              </div>
              {activeClient?.id === client.profile.id && (
                <div className="w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
