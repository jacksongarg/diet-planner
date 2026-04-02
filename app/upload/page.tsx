'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { PDFUpload } from '@/components/PDFUpload';
import { FileText, Upload } from 'lucide-react';

export default function UploadPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Upload className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-3">Upload Diet Plan</h1>
          <p className="text-zinc-400 mb-6">Sign in to upload and parse diet plans.</p>
          <button
            onClick={() => router.push('/login')}
            className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-medium rounded-xl transition-colors"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-red-500 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Upload Diet Plan</h1>
          </div>
          <p className="text-sm text-zinc-400">
            Upload a PDF or paste text from your nutritionist's diet plan. Our AI will extract and
            organize the meals for you.
          </p>
        </div>

        <PDFUpload />
      </div>
    </div>
  );
}
