import { Utensils } from 'lucide-react';
import Link from 'next/link';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      {/* Header */}
      <header className="p-6 text-center">
        <Link href="/" className="inline-flex items-center gap-2">
          <div className="w-10 h-10 bg-red-500 rounded-xl flex items-center justify-center">
            <Utensils className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold text-white">Diet Planner</span>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-zinc-500 text-sm">
        &copy; {new Date().getFullYear()} Diet Planner. All rights reserved.
      </footer>
    </div>
  );
}
