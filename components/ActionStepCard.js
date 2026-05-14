'use client';

/**
 * ActionStepCard — numbered step card for result page
 */
export default function ActionStepCard({ step, index, completed, onToggle }) {
  return (
    <div
      className={`flex items-start gap-3 p-3 rounded-xl border transition-colors ${
        completed
          ? 'bg-green-50 border-green-200'
          : 'bg-white border-gray-100'
      }`}
      onClick={onToggle}
    >
      <div
        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
          completed
            ? 'bg-green-500 text-white'
            : 'bg-[#1a2b4a] text-white'
        }`}
      >
        {completed ? '✓' : index + 1}
      </div>
      <p
        className={`text-sm leading-snug pt-0.5 flex-1 whitespace-pre-wrap ${
          completed ? 'line-through text-gray-400' : 'text-gray-700'
        }`}
      >
        {step}
      </p>
    </div>
  );
}
