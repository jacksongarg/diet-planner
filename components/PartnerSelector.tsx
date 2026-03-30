'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Users, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { AddConnectionModal } from './AddConnectionModal';

export function PartnerSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddPartner, setShowAddPartner] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { connectedUsers, activePartner, setActivePartner } = useAuthStore();

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

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => {
            if (connectedUsers.length === 0) {
              setShowAddPartner(true);
            } else {
              setIsOpen(!isOpen);
            }
          }}
          className="flex items-center gap-3 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 rounded-xl transition-colors w-full"
        >
          <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
            {activePartner?.avatar_url ? (
              <img
                src={activePartner.avatar_url}
                alt={activePartner.name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <Users className="w-5 h-5 text-zinc-400" />
            )}
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium text-white">
              {activePartner?.name || 'No partner'}
            </p>
            <p className="text-sm text-zinc-400">
              {connectedUsers.length === 0 ? 'Add a partner to start' : 'Viewing together'}
            </p>
          </div>
          {connectedUsers.length > 0 ? (
            <ChevronDown className={`w-5 h-5 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          ) : (
            <UserPlus className="w-5 h-5 text-red-400" />
          )}
        </button>

        {isOpen && connectedUsers.length > 0 && (
          <div className="absolute left-0 right-0 mt-2 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
            {connectedUsers.map((cu) => (
              <button
                key={cu.profile.id}
                onClick={() => {
                  setActivePartner(cu.profile);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors ${
                  activePartner?.id === cu.profile.id ? 'bg-zinc-800' : ''
                }`}
              >
                <div className="w-10 h-10 bg-zinc-700 rounded-full flex items-center justify-center">
                  {cu.profile.avatar_url ? (
                    <img
                      src={cu.profile.avatar_url}
                      alt={cu.profile.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg font-medium text-zinc-400">
                      {cu.profile.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <p className="font-medium text-white">{cu.profile.name}</p>
                  <p className="text-sm text-zinc-400">
                    {cu.connection.type === 'couple' ? 'Partner' : 'Friend'}
                  </p>
                </div>
                {activePartner?.id === cu.profile.id && (
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            ))}

            <div className="border-t border-zinc-800">
              <button
                onClick={() => {
                  setShowAddPartner(true);
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-zinc-800 transition-colors text-red-400"
              >
                <UserPlus className="w-5 h-5" />
                <span className="font-medium">Add Another Partner</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <AddConnectionModal
        isOpen={showAddPartner}
        onClose={() => setShowAddPartner(false)}
      />
    </>
  );
}
