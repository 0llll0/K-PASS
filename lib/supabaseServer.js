/**
 * Supabase server-side client for Next.js App Router
 * Uses @supabase/ssr createServerClient with async cookies() from next/headers
 */

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // setAll can only be called in Route Handlers / Server Actions.
            // Ignore the error in Server Component context (read-only).
          }
        },
      },
    }
  );
}
