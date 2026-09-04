/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AlertTriangle, RefreshCw, ArrowLeft, ShieldAlert } from 'lucide-react';

interface ErrorRetryCardProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  onSecondaryAction?: () => void;
  secondaryActionLabel?: string;
  isRetrying?: boolean;
  compact?: boolean;
}

export function ErrorRetryCard({
  title = 'Encountered Request Disruption',
  message = 'We could not retrieve the atelier information. Please verify your connection and attempt again.',
  onRetry,
  onSecondaryAction,
  secondaryActionLabel = 'Back to Showroom',
  isRetrying = false,
  compact = false
}: ErrorRetryCardProps) {
  if (compact) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between gap-4 text-left shadow-2xs">
        <div className="flex items-center space-x-3 text-xs text-rose-800">
          <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
          <span className="line-clamp-2">{message}</span>
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-rose-100 border border-rose-300 text-rose-800 rounded-lg text-[11px] font-sans font-bold tracking-wider uppercase transition-all shrink-0 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            <RefreshCw className={`h-3 w-3 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Retrying...' : 'Retry'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="py-16 px-4 text-center max-w-lg mx-auto">
      <div className="inline-flex p-4 rounded-full bg-rose-50 border border-rose-200 text-rose-600 mb-5 shadow-xs">
        <ShieldAlert className="h-8 w-8 stroke-[1.5]" />
      </div>

      <h3 className="font-serif text-2xl text-[#1F1B17] font-bold mb-2">{title}</h3>
      <p className="text-xs text-[#5C5248] font-sans leading-relaxed max-w-md mx-auto mb-8">
        {message}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        {onRetry && (
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="inline-flex items-center space-x-2 px-7 py-3 bg-gradient-to-r from-[#D4AF37] to-[#AA8232] hover:brightness-110 text-[#1F1B17] font-bold text-xs font-sans tracking-widest uppercase transition-all rounded-lg shadow-sm disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isRetrying ? 'animate-spin' : ''}`} />
            <span>{isRetrying ? 'Re-executing...' : 'Retry Request'}</span>
          </button>
        )}

        {onSecondaryAction && (
          <button
            onClick={onSecondaryAction}
            className="inline-flex items-center space-x-2 px-6 py-3 bg-white hover:bg-[#FAF6ED] border border-[#E8DFC8] text-[#1F1B17] text-xs font-sans tracking-widest uppercase rounded-lg transition-all cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{secondaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ErrorRetryCard;
