'use client';

export default function DebugPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return (
    <div className="min-h-screen bg-zinc-950 p-8 text-white">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <div className="space-y-2 font-mono text-sm">
        <p>
          NEXT_PUBLIC_SUPABASE_URL: {' '}
          <span className={supabaseUrl ? 'text-green-400' : 'text-red-400'}>
            {supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : 'NOT SET'}
          </span>
        </p>
        <p>
          NEXT_PUBLIC_SUPABASE_ANON_KEY: {' '}
          <span className={supabaseKey ? 'text-green-400' : 'text-red-400'}>
            {supabaseKey ? `${supabaseKey.substring(0, 20)}...` : 'NOT SET'}
          </span>
        </p>
      </div>
    </div>
  );
}
