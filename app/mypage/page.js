'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import Header from '@/components/Header';
import PrimaryButton from '@/components/PrimaryButton';
import AuthGate from '@/components/AuthGate';
import { getCurrentUser, getUserProfile, signOut } from '@/lib/auth';
import { USER_TYPES } from '@/lib/mockData';

export default function MyPage() {
  return (
    <AuthGate>
      <MyPageContent />
    </AuthGate>
  );
}

function MyPageContent() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
          const userProfile = await getUserProfile(currentUser.id);
          setProfile(userProfile);
        }
      } catch (err) {
        console.error('[MyPage] Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/login');
  };

  const userTypeLabel = profile?.user_type 
    ? USER_TYPES.find(t => t.code === profile.user_type)?.label || profile.user_type
    : 'Not set';

  const regionLabel = profile?.region === 'pohang-buk' ? 'Pohang-si Buk-gu' : 
                     profile?.region === 'pohang-nam' ? 'Pohang-si Nam-gu' : 
                     profile?.region || 'Not set';

  return (
    <AppShell>
      <Header title="My Profile" showBack />

      <div className="px-4 py-6 space-y-6">
        {/* User basic info */}
        <div className="flex flex-col items-center text-center">
          <div className="w-24 h-24 bg-[#1a2b4a] rounded-3xl flex items-center justify-center mb-4 shadow-lg border-4 border-white">
            <span className="text-white text-4xl font-bold">
              {user?.user_metadata?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#1a2b4a]">
            {user?.user_metadata?.full_name || 'K-Pass User'}
          </h2>
          <p className="text-sm text-gray-500">{user?.email}</p>
        </div>

        {/* Profile details */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
            <h3 className="text-sm font-bold text-[#1a2b4a]">Account Details</h3>
          </div>
          
          <div className="divide-y divide-gray-50">
            <div className="px-5 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Preferred Language</span>
              <span className="text-sm font-semibold text-[#1a2b4a] uppercase">
                {profile?.preferred_language || 'English'}
              </span>
            </div>
            
            <div className="px-5 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">Current Region</span>
              <span className="text-sm font-semibold text-[#1a2b4a]">
                {regionLabel}
              </span>
            </div>
            
            <div className="px-5 py-4 flex justify-between items-center">
              <span className="text-sm text-gray-500">User Type</span>
              <span className="text-sm font-semibold text-[#1a2b4a]">
                {userTypeLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Stats or other info (optional) */}
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => router.push('/history')}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-left"
          >
            <span className="text-2xl block mb-1">📋</span>
            <p className="text-xs font-bold text-[#1a2b4a]">My History</p>
            <p className="text-[10px] text-gray-400">View analysis results</p>
          </button>
          <button 
            onClick={() => router.push('/reminders')}
            className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm text-left"
          >
            <span className="text-2xl block mb-1">🔔</span>
            <p className="text-xs font-bold text-[#1a2b4a]">Reminders</p>
            <p className="text-[10px] text-gray-400">Manage active items</p>
          </button>
        </div>

        {/* Logout button */}
        <div className="pt-4">
          <button
            onClick={handleLogout}
            className="w-full py-4 rounded-2xl border-2 border-red-100 text-red-500 font-bold text-sm active:bg-red-50 transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
          <p className="text-center text-[10px] text-gray-300 mt-4">K-Pass v1.0.0 (Beta)</p>
        </div>
      </div>
    </AppShell>
  );
}
