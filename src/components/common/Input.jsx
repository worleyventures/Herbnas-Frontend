import React from 'react';
import Dropdown from './Dropdown';

const Input = ({
  type = "text",
  placeholder = "",
  value,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  error = false,
  errorMessage = "",
  label = "",
  helperText = "",
  icon: Icon,
  iconPosition = "left",
  size = "md",
  className = "",
  inputClassName = "",
  labelClassName = "",
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'xs':
        return 'px-3 py-1.5 text-xs';
      case 'sm':
        return 'px-3 py-2 text-sm';
      case 'md':
        return 'px-4 py-2.5 text-sm';
      case 'lg':
        return 'px-5 py-3 text-base';
      default:
        return 'px-4 py-2.5 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'xs':
        return 'h-3 w-3';
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      default:
        return 'h-4 w-4';
    }
  };

  const getIconPadding = () => {
    if (!Icon) return '';
    return iconPosition === 'left' ? 'pl-12' : 'pr-12';
  };

  const baseInputClasses = `
    w-full border-2 rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm hover:shadow-md
    ${getSizeClasses()}
    ${getIconPadding()}
    ${error ? 'border-red-500 focus:ring-red-500 bg-red-50/50' : 'border-gray-300 hover:border-blue-500/50 focus:border-blue-500 bg-white/80 backdrop-blur-sm'}
    ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
    ${inputClassName}
  `;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className={`block text-sm font-semibold text-gray-700 ${labelClassName}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        {Icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Icon className={`${getIconSize()} text-gray-400 transition-colors duration-200 ${error ? 'text-red-500' : ''}`} />
          </div>
        )}
        
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onFocus={onFocus}
          onBlur={onBlur}
          disabled={disabled}
          className={baseInputClasses}
          {...props}
        />
        
        {Icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <Icon className={`${getIconSize()} text-gray-400 transition-colors duration-200 ${error ? 'text-red-500' : ''}`} />
          </div>
        )}
      </div>
      
      {error && errorMessage && (
        <div className="flex items-center space-x-1">
          <div className="w-1 h-1 bg-red-500 rounded-full"></div>
          <p className="text-sm text-red-500 font-medium">{errorMessage}</p>
        </div>
      )}
      
      {!error && helperText && (
        <p className="text-sm text-gray-500 font-medium">{helperText}</p>
      )}
    </div>
  );
};

// Select Component
export const Select = ({
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  disabled = false,
  error = false,
  errorMessage = "",
  label = "",
  helperText = "",
  className = "",
  selectClassName = "",
  labelClassName = "",
  name,
  ...props
}) => {
  return (
    <Dropdown
      options={options}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      error={error}
      errorMessage={errorMessage}
      label={label}
      helperText={helperText}
      className={className}
      labelClassName={labelClassName}
      {...props}
    />
  );
};

// Search Input Component
export const SearchInput = ({
  value,
  onChange,
  placeholder = "Search...",
  className = "",
  size = "sm",
  ...props
}) => {
  return (
    <Input
      type="text"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      icon={props.icon}
      size={size}
      className={className}
      {...props}
    />
  );
};

export default Input;
