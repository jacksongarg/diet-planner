'use client';

import { useState, useRef, useEffect } from 'react';
import { User, Users, UserCog, ChevronDown } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { ViewMode } from '@/lib/types';

interface ModeToggleProps {
  compact?: boolean;
}

export function ModeToggle({ compact = false }: ModeToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { user, viewMode, setViewMode, connectedUsers, clients } = useAuthStore();

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

  const modes: {
    value: ViewMode;
    label: string;
    icon: typeof User;
    description: string;
    available: boolean;
  }[] = [
    {
      value: 'single',
      label: 'Single',
      icon: User,
      description: 'View only your meals',
      available: true,
    },
    {
      value: 'couple',
      label: 'Partner',
      icon: Users,
      description: 'View with partner',
      available: connectedUsers.length > 0,
    },
  ];

  // Add dietician mode if user is a dietician
  if (user?.role === 'dietician') {
    modes.push({
      value: 'dietician',
      label: 'Dietician',
      icon: UserCog,
      description: 'Manage clients',
      available: true,
    });
  }

  const currentMode = modes.find((m) => m.value === viewMode) || modes[0];
  const CurrentIcon = currentMode.icon;

  if (compact) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <CurrentIcon className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-white">{currentMode.label}</span>
          <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl z-50">
            {modes.map((mode) => {
              const Icon = mode.icon;
              return (
                <button
                  key={mode.value}
                  onClick={() => {
                    if (mode.available) {
                      setViewMode(mode.value);
                      setIsOpen(false);
                    }
                  }}
                  disabled={!mode.available}
                  className={`w-full flex items-center gap-3 p-3 transition-colors ${
                    mode.value === viewMode
                      ? 'bg-red-500/20 text-white'
                      : mode.available
                      ? 'hover:bg-zinc-800 text-zinc-300'
                      : 'opacity-50 cursor-not-allowed text-zinc-500'
                  } first:rounded-t-xl last:rounded-b-xl`}
                >
                  <Icon className={`w-5 h-5 ${mode.value === viewMode ? 'text-red-400' : ''}`} />
                  <div className="text-left">
                    <p className="font-medium">{mode.label}</p>
                    <p className="text-xs text-zinc-500">{mode.description}</p>
                  </div>
                  {mode.value === viewMode && (
                    <div className="ml-auto w-2 h-2 bg-red-500 rounded-full" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-4">
      <h3 className="font-medium text-white mb-3">View Mode</h3>
      <div className="grid grid-cols-2 gap-2">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <button
              key={mode.value}
              onClick={() => mode.available && setViewMode(mode.value)}
              disabled={!mode.available}
              className={`flex flex-col items-center gap-2 p-3 rounded-lg transition-colors ${
                mode.value === viewMode
                  ? 'bg-red-500 text-white'
                  : mode.available
                  ? 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  : 'bg-zinc-800/50 text-zinc-500 cursor-not-allowed'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{mode.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
