'use client';

import { PDFUpload } from '@/components/PDFUpload';
import { FileText } from 'lucide-react';

export default function UploadPage() {
  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <FileText className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-stone-800">Upload Diet Plan</h1>
          </div>
          <p className="text-sm text-stone-500">
            Upload a PDF or paste text from your nutritionist's diet plan. Our AI will extract and
            organize the meals for you.
          </p>
        </div>

        <PDFUpload />
      </div>
    </div>
  );
}
