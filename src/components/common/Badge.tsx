import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'outline' | 'telegram';
  size?: 'sm' | 'md';
  className?: string;
  onClick?: () => void;
}

const variantClasses = {
  primary: 'bg-blue-50 text-blue-700 border-blue-200/60',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60',
  warning: 'bg-amber-50 text-amber-700 border-amber-200/60',
  danger: 'bg-rose-50 text-rose-700 border-rose-200/60',
  telegram: 'bg-sky-50 text-sky-700 border-sky-200/70',
  outline: 'bg-white text-slate-600 border-slate-200 hover:border-slate-300',
};

const sizeClasses = {
  sm: 'text-xs px-2 py-0.5 rounded-md font-medium',
  md: 'text-xs px-2.5 py-1 rounded-lg font-medium',
};

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'secondary',
  size = 'sm',
  className = '',
  onClick,
}) => {
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center gap-1 border transition-colors ${variantClasses[variant]} ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:opacity-80' : ''} ${className}`}
    >
      {children}
    </span>
  );
};
