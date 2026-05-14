/**
 * API client functions for K-Pass
 * Currently uses mock data — replace with real API calls in production
 */

import {
  MOCK_ANALYSIS_RESULT,
  MOCK_LOCAL_GUIDES,
} from './mockData';

/**
 * Analyze a document image
 * @param {File} imageFile - The uploaded image file
 * @returns {Promise<Object>} Analysis result
 */
export async function analyzeDocument(imageFile) {
  // TODO: Upload to Supabase Storage, then call /api/analyze-document
  const response = await fetch('/api/analyze-document', {
    method: 'POST',
    body: JSON.stringify({ filename: imageFile?.name || 'mock.jpg' }),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Analysis failed');
  return response.json();
}

/**
 * Search local rules for a region
 * @param {string} region - Region code
 * @param {string} query - Search query
 * @returns {Promise<Array>} Local rules
 */
export async function searchLocalRules(region, query) {
  // TODO: Call /api/search-local-rules with Pinecone vector search
  const response = await fetch(
    `/api/search-local-rules?region=${region}&query=${encodeURIComponent(query)}`
  );
  if (!response.ok) throw new Error('Search failed');
  return response.json();
}

/**
 * Create a reminder for a document
 * @param {Object} reminderData - Reminder details
 * @returns {Promise<Object>} Created reminder
 */
export async function createReminder(reminderData) {
  // TODO: Save to Supabase database
  const response = await fetch('/api/create-reminder', {
    method: 'POST',
    body: JSON.stringify(reminderData),
    headers: { 'Content-Type': 'application/json' },
  });
  if (!response.ok) throw new Error('Failed to create reminder');
  return response.json();
}

/**
 * Get analysis result by ID
 * @param {string} id - Result ID
 * @returns {Promise<Object>} Analysis result
 */
export async function getResultById(id) {
  // TODO: Fetch from Supabase database
  if (id === 'demo-result' || id.startsWith('hist-')) {
    return MOCK_ANALYSIS_RESULT;
  }
  return MOCK_ANALYSIS_RESULT;
}

/**
 * Get all local guides for a region
 * @param {string} region - Region code
 * @returns {Promise<Array>} Local guides
 */
export async function getLocalGuides(region) {
  // TODO: Fetch from Supabase or Pinecone
  return MOCK_LOCAL_GUIDES;
}
