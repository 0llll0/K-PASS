'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import LocalRuleCard from '@/components/LocalRuleCard';
import AuthGate from '@/components/AuthGate';
import { MOCK_LOCAL_GUIDES } from '@/lib/mockData';
import { getLocalGuides, getPlaces } from '@/lib/database';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

const CATEGORIES = ['All', 'Trash Disposal', 'Large Waste Disposal', 'Local Tax / Fines', 'Public Offices', 'Foreigner Support'];

export default function LocalGuidePage() {
  return (
    <AuthGate>
      <LocalGuideContent />
    </AuthGate>
  );
}

function LocalGuideContent() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await getCurrentUser();
        let region = 'pohang-buk';
        if (user) {
          const profile = await getUserProfile(user.id);
          if (profile?.region) region = profile.region;
        } else if (typeof window !== 'undefined') {
          region = localStorage.getItem('kpass_region') || 'pohang-buk';
        }

        const data = await getLocalGuides(region);
        if (!cancelled) setGuides(data);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setGuides(MOCK_LOCAL_GUIDES);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = guides.filter((guide) => {
    const matchesCategory = activeCategory === 'All' || guide.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      guide.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      guide.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <AppShell>
      <Header
        title="Local Guide"
        subtitle="Pohang-si Buk-gu"
        rightSlot={
          <div className="flex items-center gap-1 text-xs text-[#3b6fd4] bg-[#eef1f8] border border-[#d8e2f3] px-2.5 py-1 rounded-full font-medium">
            📍 Buk-gu
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="input-local-search"
            type="text"
            placeholder="Search rules, offices, trash…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1a2b4a] shadow-sm"
          />
        </div>

        {/* Category filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              id={`cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-[#1a2b4a] text-white shadow-sm'
                  : 'bg-white border border-gray-100 text-gray-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Source badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">
            {filtered.length} guide{filtered.length !== 1 ? 's' : ''} found
          </span>
          <span className="text-xs text-[#3b6fd4] font-medium">• Source: Pohang City</span>
        </div>

        {/* Guide cards */}
        <div>
          {filtered.length > 0 ? (
            filtered.map((guide) => (
              <LocalRuleCard key={guide.id} guide={guide} />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl mb-3">🔍</span>
              <p className="text-sm font-semibold text-gray-600">No guides found</p>
              <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
