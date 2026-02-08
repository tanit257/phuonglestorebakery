import React from 'react';

export const Card = ({ children, className = '', padding = true, hoverable = false, ...props }) => {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-card border border-gray-200/60
        ${padding ? 'p-4' : ''}
        ${hoverable ? 'hover:shadow-card-hover transition-shadow duration-200' : ''}
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
