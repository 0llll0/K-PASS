'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import UrgencyBadge from '@/components/UrgencyBadge';
import AuthGate from '@/components/AuthGate';
import { MOCK_HISTORY } from '@/lib/mockData';
import { getAnalysisHistory } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

const FILTER_TYPES = ['All', 'Local Tax', 'Health Insurance', 'Fines', 'Utilities', 'Other'];

export default function HistoryPage() {
  return (
    <AuthGate>
      <HistoryContent />
    </AuthGate>
  );
}

function HistoryContent() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        const data = await getAnalysisHistory(user?.id || null);
        if (!cancelled) setHistory(data);
      } catch {
        if (!cancelled) setHistory(MOCK_HISTORY);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const filtered = history.filter((item) => {
    const matchesSearch =
      !searchQuery ||
      (item.document_type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.summary || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      typeFilter === 'All' ||
      (item.document_type || '').toLowerCase().includes(typeFilter.toLowerCase());
    return matchesSearch && matchesType;
  });

  return (
    <AppShell>
      <Header
        title="Analysis History"
        subtitle={loading ? 'Loading…' : `${history.length} documents analyzed`}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            id="input-history-search"
            type="text"
            placeholder="Search documents…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-[#1a2b4a] shadow-sm"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
          {FILTER_TYPES.map((type) => (
            <button
              key={type}
              id={`filter-type-${type.replace(/\s+/g, '-').toLowerCase()}`}
              onClick={() => setTypeFilter(type)}
              className={`flex-shrink-0 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                typeFilter === type
                  ? 'bg-[#1a2b4a] text-white shadow-sm'
                  : 'bg-white border border-gray-100 text-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 animate-pulse">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-xl flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 bg-gray-100 rounded w-2/3" />
                    <div className="h-2 bg-gray-100 rounded w-full" />
                    <div className="h-2 bg-gray-100 rounded w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* History items */}
        {!loading && (
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((item) => (
                <div
                  key={item.id}
                  id={`history-item-${item.id}`}
                  onClick={() => router.push(`/result/${item.id}`)}
                  className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 cursor-pointer active:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 bg-[#eef1f8] rounded-xl flex items-center justify-center flex-shrink-0">
                      <span className="text-base">
                        {(item.document_type || '').includes('Tax') ? '💰' :
                         (item.document_type || '').includes('Insurance') ? '🏥' :
                         (item.document_type || '').includes('Fine') || (item.document_type || '').includes('Parking') ? '⚠️' :
                         '📄'}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="text-sm font-bold text-[#1a2b4a] leading-tight">{item.document_type}</h3>
                        <UrgencyBadge urgency={item.urgency} size="sm" />
                      </div>
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{item.summary}</p>
                      <p className="text-[10px] text-gray-300 mt-2">
                        {new Date(item.created_at).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">📂</span>
                <p className="text-sm font-semibold text-gray-600">No results found</p>
                <p className="text-xs text-gray-400 mt-1">Try a different search or filter</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
