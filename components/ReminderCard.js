'use client';

import { useRouter } from 'next/navigation';

/**
 * ReminderCard — shows a reminder with D-day countdown and status
 */
export default function ReminderCard({ reminder, onAddToCalendar, onMarkDone }) {
  const router = useRouter();
  const deadline = new Date(reminder.deadline);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));

  const isDone = reminder.status === 'done';

  const dDayLabel =
    isDone
      ? 'Paid'
      : diffDays < 0
      ? `D+${Math.abs(diffDays)}`
      : diffDays === 0
      ? 'D-day'
      : `D-${diffDays}`;

  const dDayColor =
    isDone
      ? 'text-gray-400'
      : diffDays <= 3
      ? 'text-red-500'
      : diffDays <= 7
      ? 'text-orange-500'
      : 'text-[#1a2b4a]';

  const statusConfig = {
    urgent: { label: 'Urgent', className: 'bg-red-100 text-red-600' },
    upcoming: { label: 'Upcoming', className: 'bg-orange-100 text-orange-600' },
    done: { label: 'Done', className: 'bg-gray-100 text-gray-400' },
  };

  const status = statusConfig[reminder.status] || statusConfig.upcoming;

  const handleCardClick = () => {
    if (reminder.result_id) {
      router.push(`/result/${reminder.result_id}`);
    } else {
      console.warn('[ReminderCard] No result_id found for this reminder');
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:scale-[0.98] transition-transform cursor-pointer ${isDone ? 'opacity-70' : ''}`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <h3 className={`font-semibold text-sm text-[#1a2b4a] truncate ${isDone ? 'line-through text-gray-400' : ''}`}>
            {reminder.title}
          </h3>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate">{reminder.document_type}</p>
        </div>
        <div className={`text-right flex-shrink-0`}>
          <p className={`text-lg font-bold ${dDayColor}`}>{dDayLabel}</p>
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tight ${status.className}`}>
            {status.label}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3">
        <div>
          <p className={`text-base font-bold ${isDone ? 'text-gray-400 line-through' : 'text-[#1a2b4a]'}`}>
            {reminder.amount}
          </p>
          <p className="text-[10px] text-gray-400">
            Due: {deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
        
        <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
          {!isDone && (
            <>
              <button
                onClick={() => onMarkDone?.(reminder)}
                className="text-[10px] font-bold text-green-600 bg-green-50 px-2.5 py-2 rounded-xl active:bg-green-100 transition-colors"
              >
                Done
              </button>
              <button
                onClick={() => onAddToCalendar?.(reminder)}
                className="text-[10px] font-bold text-[#1a2b4a] bg-[#eef1f8] px-2.5 py-2 rounded-xl active:bg-[#dce8ff] transition-colors"
              >
                📅 Calendar
              </button>
            </>
          )}
          {isDone && (
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-500 text-sm">✓</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
