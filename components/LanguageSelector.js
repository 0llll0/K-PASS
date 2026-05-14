'use client';

import { LANGUAGES } from '@/lib/mockData';

/**
 * LanguageSelector — language option list for onboarding
 */
export default function LanguageSelector({ selected, onChange }) {
  return (
    <div className="space-y-2">
      {LANGUAGES.map((lang) => (
        <button
          key={lang.code}
          id={`lang-${lang.code}`}
          onClick={() => onChange(lang.code)}
          className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border-2 transition-all text-left ${
            selected === lang.code
              ? 'border-[#1a2b4a] bg-[#eef1f8]'
              : 'border-gray-100 bg-white'
          }`}
        >
          <span className="text-xl">{lang.flag}</span>
          <span className={`font-semibold text-sm ${selected === lang.code ? 'text-[#1a2b4a]' : 'text-gray-700'}`}>
            {lang.label}
          </span>
          {selected === lang.code && (
            <div className="ml-auto w-5 h-5 rounded-full bg-[#1a2b4a] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
