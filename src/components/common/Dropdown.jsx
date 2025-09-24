import React, { useState, useRef, useEffect } from 'react';
import { HiChevronDown } from 'react-icons/hi2';

const Dropdown = ({
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
  labelClassName = "",
  loading = false,
  searchable = false,
  searchPlaceholder = "Search...",
  emptyMessage = "No options available",
  onAddNew,
  addNewLabel = "Add New",
  showAddNew = false,
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
        console.log('Dropdown: Clicking outside, closing dropdown');
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

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelectChange = (optionValue) => {
    console.log('Dropdown: handleSelectChange called with:', optionValue);
    console.log('Dropdown: onChange function:', onChange);
    
    if (onChange) {
      // Create an event-like object to maintain compatibility with existing onChange handlers
      const syntheticEvent = {
        target: {
          value: optionValue,
          name: name || ''
        }
      };
      onChange(syntheticEvent);
    } else {
      console.error('Dropdown: onChange function is not provided');
    }
    
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleAddNewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAddNew) {
      onAddNew();
    }
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
      {label && (
        <label className={`block text-sm font-medium text-gray-700 ${labelClassName}`}>
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => {
            console.log('Dropdown: Button clicked, disabled:', disabled, 'loading:', loading);
            if (!disabled && !loading) {
              console.log('Dropdown: Opening dropdown, current isOpen:', isOpen);
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled || loading}
          className={`
            w-full px-4 py-2.5 pr-8 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] text-sm bg-white shadow-sm hover:border-gray-400 cursor-pointer text-left
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            ${disabled || loading ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${isOpen ? 'border-[#22c55e]' : ''}
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {loading ? 'Loading...' : selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>
        
        {/* Single Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <HiChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Add New Option */}
            {showAddNew && onAddNew && (
              <div className="border-b border-gray-200">
                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="w-full px-4 py-2 text-left text-sm text-[#22c55e] hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center font-medium"
                >
                  <span className="mr-2">+</span>
                  {addNewLabel}
                </button>
              </div>
            )}
            
            {/* Options List */}
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Dropdown: Option clicked:', option.value, option.label);
                    handleSelectChange(option.value);
                  }}
                  className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${
                    value === option.value ? 'bg-[#22c55e]/10 text-[#22c55e] font-medium' : 'text-gray-900'
                  }`}
                >
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                {searchTerm ? 'No matching options found' : emptyMessage}
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

export default Dropdown;
