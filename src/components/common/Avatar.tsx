import React, { useState } from 'react';

interface AvatarProps {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-16 h-16 text-lg',
  xl: 'w-24 h-24 text-2xl',
  '2xl': 'w-32 h-32 text-3xl',
};

// Deterministic pastel color palette based on name initials
const bgColors = [
  'bg-blue-500 text-white',
  'bg-indigo-500 text-white',
  'bg-sky-500 text-white',
  'bg-emerald-500 text-white',
  'bg-teal-500 text-white',
  'bg-purple-500 text-white',
  'bg-rose-500 text-white',
  'bg-amber-500 text-white',
];

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name,
  size = 'md',
  className = '',
}) => {
  const [hasError, setHasError] = useState(false);

  // Compute initials (up to 2 letters)
  const getInitials = (fullName: string) => {
    if (!fullName) return '?';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Pick stable color
  const colorIndex = (name || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % bgColors.length;
  const colorClass = bgColors[colorIndex];

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 rounded-full font-semibold overflow-hidden border-2 border-white shadow-sm ring-1 ring-slate-100 ${sizeClasses[size]} ${className}`}
    >
      {src && !hasError ? (
        <img
          src={src}
          alt={name}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover rounded-full"
          loading="lazy"
        />
      ) : (
        <span className={`w-full h-full flex items-center justify-center select-none ${colorClass}`}>
          {getInitials(name)}
        </span>
      )}
    </div>
  );
};
