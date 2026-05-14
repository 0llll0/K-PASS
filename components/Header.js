'use client';

import { useRouter } from 'next/navigation';

/**
 * Header component — top navigation bar
 */
export default function Header({ title, subtitle, showBack = false, rightSlot }) {
  const router = useRouter();

  return (
    <header className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100 sticky top-0 z-40">
      {showBack && (
        <button
          id="btn-back"
          onClick={() => router.back()}
          className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 flex-shrink-0 active:bg-gray-100 transition-colors"
        >
          <svg className="w-4 h-4 text-[#1a2b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {!showBack && (
            <div className="w-7 h-7 bg-[#1a2b4a] rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs font-black">K</span>
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[#1a2b4a] leading-tight truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-gray-400 leading-tight truncate">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {rightSlot && (
        <div className="flex-shrink-0">{rightSlot}</div>
      )}
    </header>
  );
}
