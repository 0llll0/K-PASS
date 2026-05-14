'use client';

import { REGIONS } from '@/lib/mockData';

/**
 * RegionSelector — region selection for onboarding
 */
export default function RegionSelector({ selected, onChange }) {
  return (
    <div className="space-y-2">
      {REGIONS.map((region) => (
        <button
          key={region.code}
          id={`region-${region.code}`}
          onClick={() => onChange(region.code)}
          className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl border-2 transition-all text-left ${
            selected === region.code
              ? 'border-[#1a2b4a] bg-[#eef1f8]'
              : 'border-gray-100 bg-white'
          }`}
        >
          <span className="text-xl">📍</span>
          <div className="flex-1">
            <p className={`font-semibold text-sm ${selected === region.code ? 'text-[#1a2b4a]' : 'text-gray-700'}`}>
              {region.label}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">Gyeongsangbuk-do, Korea</p>
          </div>
          {selected === region.code && (
            <div className="w-5 h-5 rounded-full bg-[#1a2b4a] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-xs">✓</span>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
