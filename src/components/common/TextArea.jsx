import React from 'react';
import { HiExclamationTriangle } from 'react-icons/hi2';

const TextArea = ({
  name,
  value,
  onChange,
  placeholder,
  rows = 3,
  disabled = false,
  error,
  className = '',
  ...props
}) => {
  const baseClasses = `
    block w-full px-3 py-2 border rounded-md shadow-sm
    focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a]
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    transition-colors duration-200
  `;

  const errorClasses = error
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : 'border-gray-300';

  const combinedClasses = `${baseClasses} ${errorClasses} ${className}`.trim();

  return (
    <div className="relative">
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className={combinedClasses}
        {...props}
      />
      
      {error && (
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <HiExclamationTriangle className="h-5 w-5 text-red-500" />
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
};

export default TextArea;



