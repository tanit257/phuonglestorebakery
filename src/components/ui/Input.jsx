import React from 'react';
import { Search } from 'lucide-react';

export const Input = ({
  label,
  error,
  icon: Icon,
  className = '',
  id,
  name,
  ...props
}) => {
  const inputId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden="true"
          />
        )}
        <input
          id={inputId}
          name={name}
          className={`
            w-full px-4 py-3 bg-gray-50 rounded-xl
            border border-transparent
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent
            placeholder:text-gray-400
            transition-colors duration-200
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-1.5 text-sm text-rose-500" role="alert">{error}</p>
      )}
    </div>
  );
};

export const SearchInput = ({ value, onChange, placeholder = 'Tìm kiếm…', ...props }) => {
  return (
    <Input
      type="search"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon={Search}
      aria-label="Tìm kiếm"
      {...props}
    />
  );
};

export const Select = ({
  label,
  options,
  error,
  className = '',
  id,
  name,
  ...props
}) => {
  const selectId = id || name;

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <select
        id={selectId}
        name={name}
        className={`
          w-full px-4 py-3 bg-gray-50 rounded-xl
          border border-transparent
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:border-transparent
          transition-colors duration-200
          text-gray-900 bg-white
          ${error ? 'border-rose-500 focus-visible:ring-rose-500' : ''}
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1.5 text-sm text-rose-500" role="alert">{error}</p>
      )}
    </div>
  );
};

export default Input;
