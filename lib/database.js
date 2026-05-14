/**
 * Database helpers — Supabase tables:
 *   profiles, documents, local_rules, places, reminders
 */

import { createClient } from './supabaseClient';
import { MOCK_HISTORY, MOCK_REMINDERS, MOCK_LOCAL_GUIDES } from './mockData';
import { normalizeAnalysisResult } from './ai';

// ---------------------------------------------------------------------------
// Documents (analysis history)
// ---------------------------------------------------------------------------

/**
 * Fetch all analysis results for a user, newest first.
 */
export async function getAnalysisHistory(userId) {
  if (!userId) return MOCK_HISTORY;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('id, document_type, urgency, translated_summary, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[database] getAnalysisHistory error:', error.message);
    return MOCK_HISTORY;
  }

  return data.map((row) => ({
    ...row,
    summary: row.translated_summary || '',
  }));
}

/**
 * Save an analysis result to the documents table.
 * Returns the inserted row (with generated id).
 */
export async function saveAnalysisResult(data) {
  const supabase = createClient();
  
  console.log('[database] saveAnalysisResult input:', JSON.stringify(data, null, 2));

  // Normalize data (handle nested "0" or array from AI)
  const normalized = normalizeAnalysisResult(data);
  
  // Define allowed columns in Supabase documents table
  const ALLOWED_COLUMNS = [
    'user_id',
    'image_url',
    'image_path',
    'document_type',
    'issuer',
    'deadline',
    'amount',
    'urgency',
    'simple_korean_summary',
    'translated_summary',
    'action_steps',
    'risk_if_ignored',
    'local_context',
    'nearby_place',
    'processed_at',
    'created_at'
  ];

  const saveData = {};
  
  // 1. Fill with normalized analysis fields
  ALLOWED_COLUMNS.forEach(col => {
    if (normalized && normalized[col] !== undefined) {
      saveData[col] = normalized[col];
    }
  });

  // 2. Override with metadata from original data
  const metadataFields = ['user_id', 'image_url', 'image_path', 'processed_at', 'created_at'];
  metadataFields.forEach(field => {
    if (data[field] !== undefined) {
      saveData[field] = data[field];
    }
  });

  if (!saveData.created_at) {
    saveData.created_at = new Date().toISOString();
  }

  console.log('[database] final saved payload:', JSON.stringify(saveData, null, 2));

  const { data: inserted, error } = await supabase
    .from('documents')
    .insert([saveData])
    .select()
    .single();

  if (error) {
    console.warn('[database] saveAnalysisResult error:', error.message);
    throw new Error(`saveAnalysisResult: ${error.message}`);
  }
  
  return inserted;
}

/**
 * Fetch a single analysis result by id.
 */
export async function getAnalysisResultById(id) {
  const { MOCK_ANALYSIS_RESULT } = await import('./mockData');
  if (id === 'demo-result') return MOCK_ANALYSIS_RESULT;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    console.warn('[database] getAnalysisResultById error:', error?.message);
    return MOCK_ANALYSIS_RESULT;
  }
  
  console.log('[Result] loaded document:', data.id);
  return data;
}

// ---------------------------------------------------------------------------
// Reminders
// ---------------------------------------------------------------------------

/**
 * Fetch all reminders for a user.
 */
export async function getReminders(userId) {
  if (!userId) return MOCK_REMINDERS;

  const supabase = createClient();
  const { data, error } = await supabase
    .from('reminders')
    .select('*')
    .eq('user_id', userId)
    .order('deadline', { ascending: true });

  if (error) {
    console.warn('[database] getReminders error:', error.message);
    return MOCK_REMINDERS;
  }
  return data;
}

/**
 * Insert a new reminder row. Prevents duplicates for the same document.
 */
export async function createReminder(data) {
  const supabase = createClient();
  
  // Check for duplicate
  if (data.user_id && data.result_id) {
    const { data: existing } = await supabase
      .from('reminders')
      .select('id')
      .eq('user_id', data.user_id)
      .eq('result_id', data.result_id)
      .limit(1);
    
    if (existing && existing.length > 0) {
      console.log('[Reminder] duplicate reminder found:', existing[0].id);
      return existing[0];
    }
  }

  const { data: inserted, error } = await supabase
    .from('reminders')
    .insert([data])
    .select()
    .single();

  if (error) throw new Error(`createReminder: ${error.message}`);
  
  console.log('[Reminder] saved reminder:', inserted.id);
  return inserted;
}

/**
 * Update the status of a reminder.
 */
export async function updateReminderStatus(id, status) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('reminders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error(`updateReminderStatus: ${error.message}`);
  return data;
}

// ---------------------------------------------------------------------------
// Local guides / rules
// ---------------------------------------------------------------------------

export async function getVerifiedLocalRule(region, category) {
  const supabase = createClient();
  
  let { data, error } = await supabase
    .from('local_rules')
    .select('*')
    .eq('region', region)
    .eq('category', category)
    .single();

  if (!error && data) return data;

  const { data: regionData } = await supabase
    .from('local_rules')
    .select('*')
    .eq('region', region)
    .limit(1)
    .single();
  
  if (regionData) return regionData;

  const { data: catData } = await supabase
    .from('local_rules')
    .select('*')
    .eq('category', category)
    .limit(1)
    .single();

  return catData || null;
}

export async function getLocalGuides(region) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('local_rules')
    .select('*')
    .eq('region', region);

  if (error || !data || data.length === 0) {
    return MOCK_LOCAL_GUIDES;
  }
  return data;
}

// ---------------------------------------------------------------------------
// Places
// ---------------------------------------------------------------------------

export async function getPlaces(region, category = null) {
  const supabase = createClient();
  let query = supabase.from('places').select('*').eq('region', region);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    console.warn('[database] getPlaces error:', error.message);
    return [];
  }
  return data;
}

export async function getUserProfile(userId) {
  if (!userId) return null;
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.warn('[database] getUserProfile error:', error.message);
    return null;
  }
  return data;
}

export async function upsertProfile(profileData) {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('profiles')
    .upsert([profileData], { onConflict: 'id' })
    .select()
    .single();

  if (error) throw new Error(`upsertProfile: ${error.message}`);
  return data;
}
