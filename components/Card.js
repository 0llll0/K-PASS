'use client';

/**
 * Card component — white rounded card with optional shadow
 */
export default function Card({ children, className = '', onClick, id }) {
  return (
    <div
      id={id}
      onClick={onClick}
      className={`bg-white rounded-2xl border border-gray-100 shadow-sm ${onClick ? 'cursor-pointer active:scale-[0.98] transition-transform' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
