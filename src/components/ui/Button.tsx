import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'promo';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-40 disabled:pointer-events-none cursor-pointer select-none';
  
  const variants = {
    primary: 'bg-black text-white hover:bg-neutral-900 active:scale-[0.98] rounded-full border border-black shadow-none',
    secondary: 'bg-white text-black border border-[#e6e6e6] hover:bg-[#f7f7f5] hover:border-black active:scale-[0.98] rounded-full shadow-none',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.98] rounded-full border border-red-600 shadow-none',
    ghost: 'bg-transparent text-black hover:bg-[#f7f7f5] rounded-full',
    promo: 'bg-[#ff3d8b] text-white hover:bg-[#eb2b7a] active:scale-[0.98] rounded-full border border-[#ff3d8b] shadow-none',
  };
  
  const sizes = {
    sm: 'px-4 py-1.5 text-xs',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
    icon: 'w-10 h-10 p-0 rounded-full',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
}

