import React, { useState, useRef, useEffect, useMemo } from 'react';
import { HiChevronDown, HiXMark } from 'react-icons/hi2';

const InputWithDropdown = ({
  label,
  name,
  value,
  onChange,
  placeholder,
  options = [],
  error = false,
  errorMessage = '',
  helperText = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const prevValueRef = useRef(value);
  const prevOptionsRef = useRef(options);

  // Memoize filtered options to avoid unnecessary recalculations
  const filteredOptions = useMemo(() => {
    if (searchTerm) {
      return options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    return options;
  }, [searchTerm, options]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [isOpen]);

  // Update search term when value changes - only if value actually changed
  useEffect(() => {
    // Check if value or options actually changed
    const valueChanged = prevValueRef.current !== value;
    const optionsChanged = prevOptionsRef.current !== options;
    
    if (valueChanged || optionsChanged) {
      if (value !== undefined && value !== null && value !== '') {
        const selectedOption = options.find(option => String(option.value) === String(value));
        if (selectedOption) {
          setSearchTerm(selectedOption.label);
        } else {
          setSearchTerm(String(value));
        }
      } else {
        setSearchTerm('');
      }
      
      // Update refs
      prevValueRef.current = value;
      prevOptionsRef.current = options;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    onChange(e);
    setIsOpen(true);
  };

  const handleOptionSelect = (option, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setSearchTerm(option.label);
    onChange({
      target: {
        name,
        value: option.value
      }
    });
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onChange({
      target: {
        name,
        value: ''
      }
    });
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <input
          ref={inputRef}
          type="text"
          name={name}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-3 py-2 pr-20 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
          `}
          {...props}
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center">
          {value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none"
            >
              <HiXMark className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            disabled={disabled}
            className="p-1 text-gray-400 hover:text-gray-600 focus:outline-none disabled:cursor-not-allowed"
          >
            <HiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {isOpen && (
          <div 
            className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.preventDefault()}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => handleOptionSelect(option, e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </button>
              ))
            ) : searchTerm ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : options.length > 0 ? (
              // Show all options when no search term
              options.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => handleOptionSelect(option, e)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                >
                  <div className="font-medium text-gray-900">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500">{option.description}</div>
                  )}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">No options available</div>
            )}
          </div>
        )}
      </div>

      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
      
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}
    </div>
  );
};

export default InputWithDropdown;