import { createClient } from '@/lib/supabaseServer';

/**
 * POST /api/create-reminder
 * Creates a reminder in Supabase for the authenticated user.
 * Falls back to a local mock response if unauthenticated.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const supabase = await createClient();

    // Get the current user session
    const { data: { user } } = await supabase.auth.getUser();

    const reminderData = {
      ...body,
      user_id: user?.id || null,
      created_at: new Date().toISOString(),
    };

    if (user) {
      const { data, error } = await supabase
        .from('reminders')
        .insert([reminderData])
        .select()
        .single();

      if (error) throw new Error(error.message);

      return Response.json({ success: true, reminder: data });
    }

    // Unauthenticated — return a mock reminder so UI still works
    return Response.json({
      success: true,
      reminder: {
        id: `rem-${Date.now()}`,
        ...reminderData,
      },
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
