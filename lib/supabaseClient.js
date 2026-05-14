/**
 * Supabase client (browser-side)
 * Uses @supabase/ssr createBrowserClient for cookie-based session management
 */

import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // Return a dummy client or one that will fail gracefully
    // Most @supabase/ssr functions will handle this, but let's be safe
    console.warn('[supabaseClient] Missing Supabase environment variables');
  }

  return createBrowserClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder'
  );
}
