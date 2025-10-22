import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown, HiXMark } from 'react-icons/hi2';

const CustomerSelect = ({
  options = [],
  value,
  onChange,
  placeholder = "Search and select customer",
  disabled = false,
  error = false,
  errorMessage = "",
  label = "",
  helperText = "",
  className = "",
  labelClassName = "",
  loading = false,
  searchPlaceholder = "Search customers by name, email, or phone...",
  emptyMessage = "No customers found",
  name,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Filter options based on search term - search both label and searchText
  const filteredOptions = options.filter(option => {
    if (!searchTerm) return true;
    const searchLower = searchTerm.toLowerCase();
    return (
      option.label.toLowerCase().includes(searchLower) ||
      (option.searchText && option.searchText.includes(searchLower))
    );
  });

  const handleSelectChange = (optionValue) => {
    if (onChange) {
      // Pass the value directly instead of creating a synthetic event
      onChange(optionValue);
    }
    
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleClear = () => {
    setSearchTerm('');
    if (onChange) {
      // Pass empty string directly instead of creating a synthetic event
      onChange('');
    }
  };

  // Get display value
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : '';

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 mb-2 ${labelClassName}`}>
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        {/* Input Field */}
        <div
          className={`
            relative w-full cursor-pointer rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a]
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}
            ${isOpen ? 'ring-2 ring-[#8bc34a] border-[#8bc34a]' : ''}
          `}
          onClick={() => !disabled && setIsOpen(!isOpen)}
        >
          <input
            type="text"
            value={isOpen ? searchTerm : displayValue}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => {
              setIsOpen(true);
              setSearchTerm('');
            }}
            placeholder={isOpen ? searchPlaceholder : placeholder}
            disabled={disabled}
            className="w-full px-3 py-2 pr-20 border-0 rounded-md focus:outline-none focus:ring-0 bg-transparent"
            readOnly={!isOpen}
          />
          
          {/* Clear and Dropdown Icons */}
          <div className="absolute inset-y-0 right-0 flex items-center">
            {value && !disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="p-1 text-gray-400 hover:text-gray-600 mr-1"
              >
                <HiXMark className="h-4 w-4" />
              </button>
            )}
            <button
              type="button"
              className="p-1 text-gray-400 hover:text-gray-600"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              <HiChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {/* Options List */}
            {filteredOptions.length > 0 ? (
              <div className="py-1">
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectChange(option.value)}
                    className={`
                      w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100
                      ${value === option.value ? 'bg-[#8bc34a] text-white hover:bg-[#7cb342]' : 'text-gray-900'}
                    `}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{option.label.split(' | ')[0]}</span>
                      <span className={`text-xs ${value === option.value ? 'text-gray-200' : 'text-gray-500'}`}>
                        {option.label.split(' | ').slice(1).join(' | ')}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-4 py-3 text-sm text-gray-500 text-center">
                {loading ? 'Loading customers...' : emptyMessage}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && errorMessage && (
        <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className="mt-1 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default CustomerSelect;
