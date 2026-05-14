'use client';

import { useState, useEffect } from 'react';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import ReminderCard from '@/components/ReminderCard';
import PrimaryButton from '@/components/PrimaryButton';
import AuthGate from '@/components/AuthGate';
import { MOCK_REMINDERS } from '@/lib/mockData';
import { getReminders, updateReminderStatus } from '@/lib/database';
import { getCurrentUser } from '@/lib/auth';

export default function ReminderPage() {
  return (
    <AuthGate>
      <ReminderContent />
    </AuthGate>
  );
}

function ReminderContent() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const user = await getCurrentUser();
        const data = await getReminders(user?.id || null);
        if (!cancelled) setReminders(data);
      } catch {
        if (!cancelled) setReminders(MOCK_REMINDERS);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addToGoogleCalendar = (reminder) => {
    const deadline = new Date(reminder.deadline);
    const startDate = deadline.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    const endDate = new Date(deadline.getTime() + 60 * 60 * 1000)
      .toISOString()
      .replace(/[-:]/g, '').split('.')[0] + 'Z';

    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
      `K-Pass: ${reminder.title}`
    )}&dates=${startDate}/${endDate}&details=${encodeURIComponent(
      `Pay ${reminder.amount} — ${reminder.document_type}`
    )}`;

    window.open(calUrl, '_blank');
  };

  const handleMarkDone = async (reminder) => {
    try {
      await updateReminderStatus(reminder.id, 'done');
      setReminders((prev) =>
        prev.map((r) => (r.id === reminder.id ? { ...r, status: 'done' } : r))
      );
    } catch (err) {
      console.warn('[reminders] updateReminderStatus error:', err.message);
    }
  };

  const pending = reminders.filter((r) => r.status !== 'done');
  const done = reminders.filter((r) => r.status === 'done');
  const filtered =
    filter === 'all' ? reminders : filter === 'pending' ? pending : done;

  const totalAmount = pending.reduce((sum, r) => {
    const num = parseInt((r.amount || '').replace(/[^0-9]/g, ''));
    return sum + (isNaN(num) ? 0 : num);
  }, 0);

  return (
    <AppShell>
      <Header
        title="Reminders"
        subtitle={loading ? 'Loading…' : `${pending.length} pending payments`}
      />

      <div className="px-4 py-4 space-y-4">
        {/* Summary banner */}
        <div className="bg-gradient-to-br from-[#1a2b4a] to-[#2c4a7c] rounded-2xl p-4 text-white">
          <p className="text-xs text-[#8ba4d4] font-medium uppercase tracking-wide">Total Pending</p>
          <p className="text-2xl font-bold mt-1">
            {totalAmount.toLocaleString()} <span className="text-base font-medium text-[#8ba4d4]">KRW</span>
          </p>
          <p className="text-xs text-[#8ba4d4] mt-1">{pending.length} document{pending.length !== 1 ? 's' : ''} require action</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending', label: 'Pending' },
            { key: 'done', label: 'Done' },
          ].map((f) => (
            <button
              key={f.key}
              id={`filter-${f.key}`}
              onClick={() => setFilter(f.key)}
              className={`flex-1 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                filter === f.key
                  ? 'bg-[#1a2b4a] text-white shadow-sm'
                  : 'bg-white border border-gray-100 text-gray-500'
              }`}
            >
              {f.label}
              {f.key === 'pending' && pending.length > 0 && (
                <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] ${filter === f.key ? 'bg-white/20' : 'bg-red-100 text-red-600'}`}>
                  {pending.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="space-y-3">
            {[1, 2].map((n) => (
              <div key={n} className="bg-white border border-gray-100 rounded-2xl p-4 animate-pulse">
                <div className="h-3 bg-gray-100 rounded w-1/2 mb-2" />
                <div className="h-2 bg-gray-100 rounded w-1/3" />
              </div>
            ))}
          </div>
        )}

        {/* Reminder cards */}
        {!loading && (
          <div className="space-y-3">
            {filtered.length > 0 ? (
              filtered.map((reminder) => (
                <ReminderCard
                  key={reminder.id}
                  reminder={reminder}
                  onAddToCalendar={addToGoogleCalendar}
                  onMarkDone={handleMarkDone}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <span className="text-4xl mb-3">✅</span>
                <p className="text-sm font-semibold text-gray-600">All done!</p>
                <p className="text-xs text-gray-400 mt-1">No {filter === 'done' ? '' : 'pending '}reminders</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
