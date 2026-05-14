/**
 * Storage helpers — Supabase Storage (notice-images bucket)
 */

import { createClient } from './supabaseClient';

/**
 * Upload a document image to the notice-images bucket.
 * Path format: userId/timestamp_filename
 * @param {File} file
 * @param {string} userId
 * @returns {{ path: string, publicUrl: string }}
 */
export async function uploadDocumentImage(file, userId) {
  const supabase = createClient();
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${userId}/${timestamp}_${safeName}`;

  const { data, error } = await supabase.storage
    .from('notice-images')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: urlData } = supabase.storage
    .from('notice-images')
    .getPublicUrl(data.path);

  return {
    path: data.path,
    publicUrl: urlData.publicUrl,
  };
}

/**
 * Get the public URL of an already-uploaded file.
 * @param {string} path - Storage path returned by uploadDocumentImage
 * @returns {string} Public URL
 */
export function getDocumentImageUrl(path) {
  const supabase = createClient();
  const { data } = supabase.storage
    .from('notice-images')
    .getPublicUrl(path);
  return data.publicUrl;
}
