'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import Card from '@/components/Card';
import AuthGate from '@/components/AuthGate';
import { MOCK_REMINDERS, REGIONS } from '@/lib/mockData';
import { getReminders, getAnalysisHistory } from '@/lib/database';
import { getCurrentUser, getUserProfile } from '@/lib/auth';

const QUICK_ACTIONS = [
  { id: 'qa-trash', icon: '🗑️', title: 'Trash Disposal Guide', subtitle: 'Yellow bags & recycling rules', href: '/local-guide', color: 'from-green-50 to-emerald-50', border: 'border-green-100' },
  { id: 'qa-tax', icon: '💰', title: 'Tax / Fine Payment', subtitle: 'Pay via Wetax or bank', href: '/local-guide', color: 'from-orange-50 to-amber-50', border: 'border-orange-100' },
  { id: 'qa-offices', icon: '🏛️', title: 'Nearby Public Offices', subtitle: 'District offices & immigration', href: '/local-guide', color: 'from-blue-50 to-indigo-50', border: 'border-blue-100' },
  { id: 'qa-reminders', icon: '🔔', title: 'Upcoming Reminders', subtitle: '2 items due soon', href: '/reminders', color: 'from-purple-50 to-violet-50', border: 'border-purple-100' },
];

export default function HomePage() {
  return (
    <AuthGate>
      <HomeContent />
    </AuthGate>
  );
}

function HomeContent() {
  const router = useRouter();
  const [region, setRegion] = useState('Pohang-si Buk-gu');
  const [userName, setUserName] = useState('User');
  const [reminders, setReminders] = useState([]);
  const [historyCount, setHistoryCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          setUserName(user.user_metadata?.full_name?.split(' ')[0] || 'User');
          const profile = await getUserProfile(user.id);
          if (profile?.region) {
            const REGIONS_MAP = { 'pohang-buk': 'Pohang-si Buk-gu', 'pohang-nam': 'Pohang-si Nam-gu' };
            setRegion(REGIONS_MAP[profile.region] || profile.region);
          }

          const [remindersData, historyData] = await Promise.all([
            getReminders(user.id),
            getAnalysisHistory(user.id),
          ]);

          if (!cancelled) {
            setReminders(remindersData);
            setHistoryCount(historyData.length);
          }
        } else {
          // Fallback to local storage or mock
          if (typeof window !== 'undefined') {
            const regionCode = localStorage.getItem('kpass_region') || 'pohang-buk';
            const REGIONS_MAP = { 'pohang-buk': 'Pohang-si Buk-gu', 'pohang-nam': 'Pohang-si Nam-gu' };
            setRegion(REGIONS_MAP[regionCode] || 'Pohang-si Buk-gu');
          }
          setReminders(MOCK_REMINDERS);
          setHistoryCount(4);
        }
      } catch (err) {
        console.error('[HomePage] Error loading data:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Upcoming reminder
  const upcoming = reminders.filter((r) => r.status !== 'done')[0];
  const deadline = upcoming ? new Date(upcoming.deadline) : null;
  const diffDays = deadline ? Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <AppShell>
      {/* Header */}
      <Header
        title="K-Pass"
        subtitle={region}
        rightSlot={
          <div className="flex items-center gap-2">
            <button
              id="btn-notifications"
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-100 relative"
            >
              <svg className="w-4 h-4 text-[#1a2b4a]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>
            <button
              id="btn-profile"
              onClick={() => router.push('/mypage')}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#1a2b4a] border border-[#1a2b4a] shadow-sm"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </button>
          </div>
        }
      />

      <div className="px-4 py-4 space-y-4">
        {/* Greeting */}
        <div>
          <h2 className="text-xl font-bold text-[#1a2b4a]">Hello, {userName} 👋</h2>
          <p className="text-sm text-gray-500 mt-0.5">
            <span className="inline-flex items-center gap-1">
              <span className="text-[#3b6fd4]">📍</span> {region}
            </span>
          </p>
        </div>

        {/* Main CTA Card */}
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-br from-[#1a2b4a] to-[#2c4a7c] p-5">
            <div className="flex items-start gap-4">
              <div className="flex-1">
                <p className="text-[#8ba4d4] text-xs font-medium uppercase tracking-wide mb-1">AI Document Analysis</p>
                <h3 className="text-white text-lg font-bold leading-tight">Upload a Korean notice</h3>
                <p className="text-[#8ba4d4] text-xs mt-1.5 leading-relaxed">
                  Get instant translation & clear action steps in your language
                </p>
              </div>
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center flex-shrink-0 border border-white/20">
                <span className="text-3xl">📄</span>
              </div>
            </div>

            <button
              id="btn-analyze-notice"
              onClick={() => router.push('/upload')}
              className="mt-4 w-full bg-white text-[#1a2b4a] font-bold py-3.5 rounded-xl text-sm flex items-center justify-center gap-2 active:bg-gray-50 transition-colors shadow-sm"
            >
              <span>🤖</span>
              Analyze notice with AI
            </button>
          </div>
        </Card>

        {/* Upcoming reminder banner */}
        {upcoming && (
          <div
            className="flex items-center gap-3 bg-orange-50 border border-orange-200 rounded-2xl px-4 py-3 cursor-pointer active:bg-orange-100 transition-colors"
            onClick={() => router.push('/reminders')}
          >
            <div className="w-9 h-9 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-orange-500 text-base">⏰</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-orange-700 font-semibold">Upcoming Reminder</p>
              <p className="text-sm text-[#1a2b4a] font-medium truncate">{upcoming.title}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-sm font-bold text-red-500">D-{diffDays}</p>
              <p className="text-xs text-gray-400">{upcoming.amount}</p>
            </div>
          </div>
        )}

        {/* Quick actions grid */}
        <div>
          <h3 className="text-sm font-bold text-[#1a2b4a] mb-3">Quick Access</h3>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map((action) => (
              <button
                key={action.id}
                id={action.id}
                onClick={() => router.push(action.href)}
                className={`bg-gradient-to-br ${action.color} border ${action.border} rounded-2xl p-4 text-left active:scale-[0.97] transition-transform`}
              >
                <span className="text-2xl block mb-2">{action.icon}</span>
                <p className="text-xs font-bold text-[#1a2b4a] leading-tight">{action.title}</p>
                <p className="text-[10px] text-gray-500 mt-0.5 leading-tight">{action.subtitle}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Recent analysis badge */}
        <div
          className="flex items-center gap-3 bg-white border border-gray-100 rounded-2xl px-4 py-3.5 shadow-sm cursor-pointer active:bg-gray-50 transition-colors"
          onClick={() => router.push('/history')}
        >
          <div className="w-9 h-9 bg-[#eef1f8] rounded-xl flex items-center justify-center">
            <span className="text-[#1a2b4a] text-base">📋</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#1a2b4a]">View Recent Analyses</p>
            <p className="text-xs text-gray-400">{historyCount} document{historyCount !== 1 ? 's' : ''} analyzed</p>
          </div>
          <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </AppShell>
  );
}
