import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabaseServer';

/**
 * GET /auth/callback
 * Supabase OAuth redirects here after Google login.
 * Exchanges the code for a session, then:
 *   - redirects to /onboarding if profile is incomplete
 *   - redirects to / if profile is complete
 */
export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && user) {
      // Check if profile is complete
      let profile = null;
      try {
        const { data } = await supabase
          .from('profiles')
          .select('preferred_language, region, user_type')
          .eq('id', user.id)
          .single();
        profile = data;
      } catch (err) {
        console.warn('[auth callback] Could not fetch profile:', err.message);
      }

      const isComplete = profile && profile.preferred_language && profile.region && profile.user_type;
      const redirectTo = isComplete ? next : '/onboarding';
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // Auth error — redirect to login with error message
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
