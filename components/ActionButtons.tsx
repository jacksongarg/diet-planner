'use client';

import { useState } from 'react';
import { Copy, Share2, RotateCcw, Check } from 'lucide-react';
import { WeeklyPlan, DayOfWeek, DAY_LABELS } from '@/lib/types';
import { generateDayPlanText, copyToClipboard, shareOnWhatsApp } from '@/lib/shareUtils';

interface ActionButtonsProps {
  weeklyPlan: WeeklyPlan;
  day: DayOfWeek;
  onResetDay: () => void;
}

export function ActionButtons({ weeklyPlan, day, onResetDay }: ActionButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = generateDayPlanText(weeklyPlan, day);
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = () => {
    const text = generateDayPlanText(weeklyPlan, day);
    shareOnWhatsApp(text);
  };

  return (
    <div className="flex gap-2 flex-wrap">
      <button
        onClick={handleCopy}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50 transition-colors"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-emerald-600" />
            Copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copy Plan
          </>
        )}
      </button>

      <button
        onClick={handleShare}
        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 rounded-xl text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
      >
        <Share2 className="w-4 h-4" />
        Share on WhatsApp
      </button>

      <button
        onClick={onResetDay}
        className="flex items-center gap-2 px-4 py-2.5 bg-white border border-stone-200 rounded-xl text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-700 transition-colors"
      >
        <RotateCcw className="w-4 h-4" />
        Reset
      </button>
    </div>
  );
}
