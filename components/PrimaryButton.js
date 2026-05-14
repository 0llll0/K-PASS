'use client';

/**
 * PrimaryButton component
 * Large touch-friendly button for mobile-first UI
 */
export default function PrimaryButton({
  children,
  onClick,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  fullWidth = true,
  className = '',
  type = 'button',
  id,
}) {
  const variants = {
    primary: 'bg-[#1a2b4a] text-white hover:bg-[#2c4a7c] active:bg-[#0f1d33]',
    secondary: 'bg-white text-[#1a2b4a] border-2 border-[#1a2b4a] hover:bg-[#f0f4ff]',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    success: 'bg-green-600 text-white hover:bg-green-700',
    ghost: 'bg-transparent text-[#1a2b4a] hover:bg-gray-100',
  };

  const sizes = {
    sm: 'py-2 px-4 text-sm rounded-xl',
    md: 'py-3 px-5 text-base rounded-xl',
    lg: 'py-4 px-6 text-base font-semibold rounded-2xl',
  };

  return (
    <button
      id={id}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        transition-all duration-150 active:scale-[0.98] font-semibold
        flex items-center justify-center gap-2
        ${className}
      `}
    >
      {children}
    </button>
  );
}
