import { Suspense } from 'react';
import { LoginForm } from '@/components/auth/LoginForm';

export const metadata = {
  title: 'Login - Diet Planner',
  description: 'Sign in to your Diet Planner account',
};

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="bg-zinc-900 rounded-2xl p-6 shadow-xl animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-1/2 mx-auto mb-4" />
        <div className="space-y-4">
          <div className="h-10 bg-zinc-800 rounded" />
          <div className="h-10 bg-zinc-800 rounded" />
          <div className="h-10 bg-zinc-800 rounded" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
