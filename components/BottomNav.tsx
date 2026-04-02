'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Utensils, User, BarChart3, Upload, Pill, LogOut } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';

const navItems = [
  { href: '/', icon: Utensils, label: 'Meals' },
  { href: '/profile', icon: User, label: 'Profile' },
  { href: '/supplements', icon: Pill, label: 'Supps' },
  { href: '/analytics', icon: BarChart3, label: 'Progress' },
  { href: '/upload', icon: Upload, label: 'Upload' },
];

export function BottomNav() {
  const pathname = usePathname();
  const { isAuthenticated, signOut } = useAuthStore();

  // Hide on auth pages
  if (pathname?.startsWith('/login') || pathname?.startsWith('/signup') || pathname?.startsWith('/forgot-password')) {
    return null;
  }

  // Hide if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 pb-safe z-40">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'text-red-500'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5px]' : ''}`} />
              <span className={`text-xs ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
