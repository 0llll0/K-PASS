'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

/**
 * AuthGate component to protect routes.
 * If Supabase is not configured, it allows mock mode.
 * If user is not logged in, it redirects to /login.
 */
export default function AuthGate({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Check if Supabase is configured
      const isConfigured = 
        process.env.NEXT_PUBLIC_SUPABASE_URL && 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!isConfigured) {
        // Mock mode — always authorized
        setAuthorized(true);
        setLoading(false);
        return;
      }

      // 2. Check current user
      try {
        const user = await getCurrentUser();
        if (user) {
          setAuthorized(true);
        } else {
          // Not logged in — redirect to login
          router.push(`/login?next=${encodeURIComponent(pathname)}`);
        }
      } catch (err) {
        console.error('[AuthGate] Error checking auth:', err);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#f5f6fa]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-100 border-t-[#1a2b4a]"></div>
          <p className="text-xs font-medium text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  return authorized ? <>{children}</> : null;
}
