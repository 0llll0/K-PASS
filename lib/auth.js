/**
 * Auth helpers for K-Pass
 * Uses Supabase Google OAuth via @supabase/ssr browser client
 */

import { createClient } from './supabaseClient';

/**
 * Sign in with Google OAuth.
 * Redirects the browser to Google consent screen.
 * After auth, Supabase redirects back to /auth/callback.
 */
export async function signInWithGoogle() {
  const supabase = createClient();
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const redirectTo = `${origin}/auth/callback`;
  
  console.log("[Auth] redirectTo:", redirectTo);

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
    },
  });
  return { data, error };
}

/**
 * Sign out the current user.
 */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  return { error };
}

/**
 * Get the currently authenticated user from the active session.
 * Returns null if not logged in.
 */
export async function getCurrentUser() {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}

/**
 * Get the profile row for a user from the profiles table.
 * Returns null if no profile exists yet.
 */
export async function getUserProfile(userId) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) return null;
  return data;
}

/**
 * Check whether a user's profile is complete
 * (has language, region, and user_type set).
 */
export function isProfileComplete(profile) {
  return profile && profile.preferred_language && profile.region && profile.user_type;
}
