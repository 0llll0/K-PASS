'use client';

/**
 * PlaceCard — shows a helpful place or online service
 */
export default function PlaceCard({ place }) {
  if (!place) return null;

  const handleOpenMap = () => {
    if (place.map_url) {
      window.open(place.map_url, '_blank');
    }
  };

  const handleOpenWebsite = () => {
    const url = place.website_url || place.map_url;
    if (url && (url.startsWith('http') || url.includes('www.'))) {
      window.open(url, '_blank');
    }
  };

  const hasWebsite = place.website_url || (place.map_url && (place.map_url.startsWith('http') || place.map_url.includes('www.')));
  const hasMap = place.map_url && !place.map_url.includes('www.') && !place.map_url.startsWith('http') || (place.map_url && place.map_url.includes('map.kakao.com'));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="font-bold text-[#1a2b4a] text-sm">{place.name}</h4>
            <p className="text-[10px] font-bold text-[#3b6fd4] uppercase tracking-wider mt-0.5">
              {place.type || 'Public Office'}
            </p>
          </div>
          <div className="w-8 h-8 bg-[#eef1f8] rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-lg">{hasWebsite && !hasMap ? '🌐' : '📍'}</span>
          </div>
        </div>

        <div className="mt-3 space-y-1.5">
          {place.address && (
            <div className="flex items-start gap-2">
              <span className="text-gray-400 text-[10px] mt-0.5">📍</span>
              <p className="text-[11px] text-gray-600 leading-tight">{place.address}</p>
            </div>
          )}
          {place.phone && (
            <div className="flex items-center gap-2">
              <span className="text-gray-400 text-[10px]">📞</span>
              <p className="text-[11px] text-gray-600">{place.phone}</p>
            </div>
          )}
        </div>

        {place.description && (
          <p className="mt-3 text-[11px] text-gray-500 leading-relaxed bg-gray-50 p-2 rounded-lg border border-gray-100">
            {place.description}
          </p>
        )}
      </div>

      <div className="flex border-t border-gray-100">
        {place.map_url && (
          <button
            onClick={handleOpenMap}
            className="flex-1 py-3 bg-[#eef1f8] text-[#1a2b4a] text-xs font-bold active:bg-[#dce8ff] transition-colors flex items-center justify-center gap-2 border-r border-gray-100"
          >
            📍 Map
          </button>
        )}
        {hasWebsite && (
          <button
            onClick={handleOpenWebsite}
            className="flex-1 py-3 bg-[#f0f4ff] text-[#3b6fd4] text-xs font-bold active:bg-[#dce8ff] transition-colors flex items-center justify-center gap-2"
          >
            🌐 Website
          </button>
        )}
      </div>
    </div>
  );
}
