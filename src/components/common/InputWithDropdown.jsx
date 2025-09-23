import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

const InputWithDropdown = ({
  value,
  onChange,
  dropdownValue,
  onDropdownChange,
  dropdownOptions = [],
  placeholder = "Enter value",
  dropdownPlaceholder = "Select unit",
  disabled = false,
  error = false,
  errorMessage = "",
  label = "",
  helperText = "",
  className = "",
  inputClassName = "",
  labelClassName = "",
  name,
  dropdownName,
  type = "text",
  ...props
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleInputChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  const handleDropdownChange = (optionValue) => {
    if (onDropdownChange) {
      const syntheticEvent = {
        target: {
          value: optionValue,
          name: dropdownName || ''
        }
      };
      onDropdownChange(syntheticEvent);
    }
    setIsDropdownOpen(false);
  };

  const selectedOption = dropdownOptions.find(option => option.value === dropdownValue);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
        </label>
      )}
      
      <div className="relative" ref={dropdownRef}>
        <div className="flex">
          {/* Input Field */}
          <input
            type={type}
            name={name}
            value={value}
            onChange={handleInputChange}
            placeholder={placeholder}
            disabled={disabled}
            className={`
              flex-1 px-4 py-2.5 border rounded-l-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] text-sm bg-white shadow-sm hover:border-gray-400
              ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
              ${inputClassName}
            `}
            {...props}
          />
          
          {/* Dropdown Button */}
          <button
            type="button"
            onClick={() => {
              if (!disabled) {
                setIsDropdownOpen(!isDropdownOpen);
              }
            }}
            disabled={disabled}
            className={`
              px-3 py-2.5 border border-l-0 rounded-r-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] text-sm bg-white shadow-sm hover:border-gray-400 cursor-pointer
              ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
              ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
              ${isDropdownOpen ? 'border-[#22c55e]' : ''}
            `}
          >
            <div className="flex items-center space-x-1">
              <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
                {selectedOption ? selectedOption.label : dropdownPlaceholder}
              </span>
              <HiChevronDown 
                className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </div>
          </button>
        </div>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {dropdownOptions.length > 0 ? (
              dropdownOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDropdownChange(option.value);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                    dropdownValue === option.value ? 'bg-[#22c55e]/10 text-[#22c55e] font-medium' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No options available
              </div>
            )}
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
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default InputWithDropdown;
