import { MOCK_LOCAL_GUIDES } from '@/lib/mockData';

/**
 * GET /api/search-local-rules?region=pohang-buk&query=trash
 * Searches local rules using Pinecone vector search
 * TODO: Integrate real Pinecone search
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const region = searchParams.get('region') || 'pohang-buk';
    const query = searchParams.get('query') || '';

    // TODO: Use Pinecone vector search (lib/pinecone.js)
    // Filter mock data by query
    const results = query
      ? MOCK_LOCAL_GUIDES.filter(
          (g) =>
            g.category.toLowerCase().includes(query.toLowerCase()) ||
            g.title.toLowerCase().includes(query.toLowerCase())
        )
      : MOCK_LOCAL_GUIDES;

    return Response.json({
      success: true,
      region,
      query,
      results,
    });
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
