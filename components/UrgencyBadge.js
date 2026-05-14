'use client';

/**
 * UrgencyBadge component
 * Shows urgency level with color-coded pill badge
 */
export default function UrgencyBadge({ urgency, size = 'md' }) {
  const configs = {
    urgent: {
      label: '🔴 Urgent',
      className: 'bg-red-100 text-red-700 border border-red-200',
    },
    warning: {
      label: '🟠 Action Required',
      className: 'bg-orange-100 text-orange-700 border border-orange-200',
    },
    normal: {
      label: '🔵 Normal',
      className: 'bg-blue-100 text-blue-700 border border-blue-200',
    },
    info: {
      label: '🟢 Info',
      className: 'bg-green-100 text-green-700 border border-green-200',
    },
    done: {
      label: '✅ Done',
      className: 'bg-gray-100 text-gray-500 border border-gray-200',
    },
  };

  const config = configs[urgency] || configs.normal;
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span className={`inline-flex items-center rounded-full font-semibold ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
}
