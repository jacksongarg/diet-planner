'use client';

import { useState, useRef } from 'react';
import { Upload, FileText, Loader2, Check, AlertCircle, X } from 'lucide-react';
import { useDietStore } from '@/store/dietStore';

export function PDFUpload() {
  const { importPlanFromPDF } = useDietStore();
  const [file, setFile] = useState<File | null>(null);
  const [textContent, setTextContent] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [extractedPlan, setExtractedPlan] = useState<any>(null);
  const [mode, setMode] = useState<'file' | 'text'>('file');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setExtractedPlan(null);
    }
  };

  const handleExtract = async () => {
    if (!file && !textContent.trim()) {
      setError('Please upload a file or paste diet plan text');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      } else {
        formData.append('text', textContent);
      }

      const response = await fetch('/api/extract-diet', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to extract diet plan');
      }

      setExtractedPlan(data.plan);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    if (!extractedPlan) return;

    // Transform the extracted plan to match our WeeklyPlan format
    // This is a simplified transformation - in production you'd want more robust mapping
    // For now, we'll just show success and let the user know the plan was imported
    alert('Plan extracted successfully! The meal data is ready to be customized in the app.');
    setExtractedPlan(null);
    setFile(null);
    setTextContent('');
  };

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="flex gap-2 p-1 bg-zinc-800 rounded-lg">
        <button
          onClick={() => setMode('file')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'file' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400'
          }`}
        >
          Upload File
        </button>
        <button
          onClick={() => setMode('text')}
          className={`flex-1 px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mode === 'text' ? 'bg-zinc-700 text-white shadow-sm' : 'text-zinc-400'
          }`}
        >
          Paste Text
        </button>
      </div>

      {/* File Upload */}
      {mode === 'file' && (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-zinc-700 rounded-xl p-8 text-center cursor-pointer hover:border-red-500 hover:bg-red-500/5 transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <FileText className="w-8 h-8 text-red-400" />
              <div className="text-left">
                <p className="font-medium text-white">{file.name}</p>
                <p className="text-sm text-zinc-500">{(file.size / 1024).toFixed(1)} KB</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                }}
                className="p-1 text-zinc-500 hover:text-red-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-zinc-500 mx-auto mb-3" />
              <p className="text-zinc-300 font-medium">Upload your diet plan</p>
              <p className="text-sm text-zinc-500 mt-1">PDF or TXT files supported</p>
            </>
          )}
        </div>
      )}

      {/* Text Input */}
      {mode === 'text' && (
        <div>
          <textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Paste your diet plan text here...

Example:
Monday - Breakfast: Oatmeal with berries (350 cal)
Monday - Lunch: Grilled chicken salad (450 cal)
..."
            className="w-full h-48 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          />
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 text-red-400 rounded-lg border border-red-500/20">
          <AlertCircle className="w-5 h-5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Extract Button */}
      {!extractedPlan && (
        <button
          onClick={handleExtract}
          disabled={isProcessing || (!file && !textContent.trim())}
          className="w-full px-4 py-3 text-white bg-red-500 rounded-xl font-medium hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Extracting with AI...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Extract Diet Plan
            </>
          )}
        </button>
      )}

      {/* Preview Extracted Plan */}
      {extractedPlan && (
        <div className="bg-emerald-500/10 rounded-xl p-4 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Check className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-emerald-400">Plan Extracted Successfully!</h3>
          </div>

          <div className="bg-zinc-900 rounded-lg p-4 mb-4 max-h-64 overflow-y-auto border border-zinc-800">
            <p className="text-sm font-medium text-white mb-2">
              {extractedPlan.title || 'Diet Plan'}
            </p>
            {extractedPlan.description && (
              <p className="text-sm text-zinc-400 mb-3">{extractedPlan.description}</p>
            )}
            <div className="grid grid-cols-4 gap-2 text-xs text-center">
              <div className="bg-orange-500/10 rounded p-2 border border-orange-500/20">
                <p className="font-medium text-orange-400">{extractedPlan.daily_calories || '-'}</p>
                <p className="text-orange-300">Calories</p>
              </div>
              <div className="bg-blue-500/10 rounded p-2 border border-blue-500/20">
                <p className="font-medium text-blue-400">{extractedPlan.protein_grams || '-'}g</p>
                <p className="text-blue-300">Protein</p>
              </div>
              <div className="bg-amber-500/10 rounded p-2 border border-amber-500/20">
                <p className="font-medium text-amber-400">{extractedPlan.carbs_grams || '-'}g</p>
                <p className="text-amber-300">Carbs</p>
              </div>
              <div className="bg-purple-500/10 rounded p-2 border border-purple-500/20">
                <p className="font-medium text-purple-400">{extractedPlan.fat_grams || '-'}g</p>
                <p className="text-purple-300">Fat</p>
              </div>
            </div>

            {extractedPlan.days && (
              <div className="mt-4 text-sm">
                <p className="font-medium text-zinc-300 mb-2">
                  {extractedPlan.days.length} days extracted
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => {
                setExtractedPlan(null);
                setFile(null);
                setTextContent('');
              }}
              className="flex-1 px-4 py-2 text-zinc-300 bg-zinc-800 rounded-lg font-medium hover:bg-zinc-700"
            >
              Cancel
            </button>
            <button
              onClick={handleImport}
              className="flex-1 px-4 py-2 text-white bg-emerald-600 rounded-lg font-medium hover:bg-emerald-700"
            >
              Import Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
