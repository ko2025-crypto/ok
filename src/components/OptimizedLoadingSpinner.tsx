import React, { memo } from 'react';

interface OptimizedLoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'blue' | 'purple' | 'green';
  text?: string;
}

export const OptimizedLoadingSpinner = memo(function OptimizedLoadingSpinner({ 
  size = 'md', 
  color = 'blue',
  text = 'Cargando...'
}: OptimizedLoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-12 w-12',
    lg: 'h-16 w-16'
  };

  const colorClasses = {
    blue: 'border-blue-600',
    purple: 'border-purple-600',
    green: 'border-green-600'
  };

  const secondaryColorClasses = {
    blue: 'border-blue-400',
    purple: 'border-purple-400',
    green: 'border-green-400'
  };

  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="relative">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]} will-change-transform`}></div>
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-r-2 ${secondaryColorClasses[color]} absolute top-0 left-0 animation-delay-75 will-change-transform`}></div>
      </div>
      {text && (
        <p className="mt-4 text-gray-600 font-medium animate-pulse">{text}</p>
      )}
    </div>
  );
});