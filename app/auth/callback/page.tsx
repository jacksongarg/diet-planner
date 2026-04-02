'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check for error in URL
        const errorParam = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        if (errorParam) {
          setError(errorDescription || errorParam);
          return;
        }

        // Check for code in query params (PKCE flow)
        const code = searchParams.get('code');

        if (code) {
          console.log('Exchanging code for session...');
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error('Exchange error:', exchangeError);
            setError(exchangeError.message);
            return;
          }

          console.log('Session created, redirecting...');
          router.replace('/');
          return;
        }

        // Check if we have a session already (implicit flow - tokens in hash)
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          setError(sessionError.message);
          return;
        }

        if (session) {
          console.log('Session found, redirecting...');
          router.replace('/');
          return;
        }

        // No code and no session - something went wrong
        console.log('No code or session found');
        setError('Authentication failed. Please try again.');
      } catch (err: any) {
        console.error('Callback error:', err);
        setError(err?.message || 'An unexpected error occurred');
      }
    };

    handleCallback();
  }, [searchParams, router]);

  if (error) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="bg-zinc-900 rounded-2xl p-6 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">!</span>
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Authentication Error</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-2.5 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-10 h-10 text-red-500 animate-spin" />
        <p className="text-zinc-400">Completing sign in...</p>
      </div>
    </div>
  );
}
