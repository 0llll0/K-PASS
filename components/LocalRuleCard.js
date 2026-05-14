'use client';

/**
 * LocalRuleCard — shows a local Pohang rule/guide
 */
export default function LocalRuleCard({ guide }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-3">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-4 pb-2">
        <div className="w-10 h-10 bg-[#eef1f8] rounded-xl flex items-center justify-center text-xl flex-shrink-0">
          {guide.icon}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-[#1a2b4a] text-sm leading-tight">{guide.title}</h3>
          <span className="text-xs text-[#3b6fd4] font-medium">{guide.category}</span>
        </div>
        <span className="text-xs text-gray-400 bg-gray-50 border border-gray-100 rounded-full px-2 py-0.5 flex-shrink-0">
          Source: {guide.source}
        </span>
      </div>

      {/* Description */}
      <p className="px-4 pb-3 text-xs text-gray-500 leading-relaxed">{guide.description}</p>

      {/* Rules */}
      <div className="px-4 pb-4">
        <ul className="space-y-1">
          {guide.rules.map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-600">
              <span className="text-[#3b6fd4] mt-0.5 flex-shrink-0">•</span>
              {rule}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
