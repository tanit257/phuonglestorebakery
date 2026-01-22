import React from 'react';

export const Card = ({ children, className = '', padding = true, ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-sm border border-gray-100
        ${padding ? 'p-4' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`flex items-center justify-between mb-3 ${className}`}>
      {children}
    </div>
  );
};

export const CardTitle = ({ children, className = '' }) => {
  return (
    <h3 className={`font-semibold text-gray-800 ${className}`}>
      {children}
    </h3>
  );
};

export default Card;
