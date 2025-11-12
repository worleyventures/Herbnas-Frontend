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
        // Clicking outside, closing dropdown
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    if (isOpen) {
      // Use click event instead of mousedown to allow button clicks to complete
      document.addEventListener('click', handleClickOutside, true);
      
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [isOpen]);

  // Filter options based on search term
  const filteredOptions = searchable 
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  const handleSelectChange = (optionValue) => {
    // Ensure we're passing the actual option value (not converting to string)
    // The parent component will handle the value type
    if (onChange) {
      // Create a synthetic event object to match expected interface
      const syntheticEvent = {
        target: {
          value: optionValue, // Keep original value type
          name: name
        },
        preventDefault: () => {},
        stopPropagation: () => {}
      };
      // Call onChange immediately - the form handler will update state
      onChange(syntheticEvent);
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

  // Ensure value is always defined (never undefined)
  // Convert both to strings for comparison to handle type mismatches (string vs number)
  // Handle empty string, null, undefined, 0, and false values properly
  const safeValue = value !== undefined && value !== null && value !== '' ? String(value) : '';
  const selectedOption = safeValue ? options.find(option => {
    // Compare both as strings to handle type mismatches
    const optionValueStr = String(option.value || '');
    return optionValueStr === safeValue;
  }) : null;
  
  // Debug: Log if value doesn't match any option (only in development)
  if (safeValue && !selectedOption && process.env.NODE_ENV === 'development') {
    console.warn('Dropdown: Value does not match any option', {
      value: safeValue,
      availableOptions: options.map(opt => String(opt.value)),
      optionsCount: options.length
    });
  }

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
            if (!disabled && !loading) {
              setIsOpen(!isOpen);
            }
          }}
          disabled={disabled || loading}
          className={`
            w-full px-4 py-2 pr-8 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] text-sm bg-white shadow-sm hover:border-[#8bc34a]/50 cursor-pointer text-left
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            ${disabled || loading ? 'bg-gray-50 cursor-not-allowed' : ''}
            ${isOpen ? 'border-[#8bc34a]' : ''}
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
          <div 
            className="absolute z-[9999] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            {searchable && (
              <div className="p-2 border-b border-gray-200" onClick={(e) => e.stopPropagation()}>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a]"
                />
              </div>
            )}

            {/* Add New Option */}
            {showAddNew && onAddNew && (
              <div className="border-b border-gray-200">
                <button
                  type="button"
                  onClick={handleAddNewClick}
                  className="w-full px-4 py-2 text-left text-sm text-[#8bc34a] hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center font-medium"
                >
                  <span className="mr-2">+</span>
                  {addNewLabel}
                </button>
              </div>
            )}
            
            {/* Options List */}
            {filteredOptions.length > 0 ? (
              <>
                {filteredOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectChange(option.value);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors ${
                      String(safeValue) === String(option.value) ? 'bg-[#8bc34a]/10 text-[#8bc34a] font-medium' : 'text-gray-900'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
                {/* Show option to add new value if search term doesn't match any option */}
                {searchable && searchTerm && !filteredOptions.find(opt => opt.value.toLowerCase() === searchTerm.toLowerCase()) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectChange(searchTerm);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#8bc34a] hover:bg-green-50 focus:outline-none focus:bg-green-50 transition-colors font-medium border-t border-gray-200"
                  >
                    + Add "{searchTerm}"
                  </button>
                )}
              </>
            ) : (
              <>
                <div className="px-4 py-2 text-sm text-gray-500">
                  {searchTerm ? 'No matching options found' : emptyMessage}
                </div>
                {/* Show option to add new value if search term is provided */}
                {searchable && searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelectChange(searchTerm);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-[#8bc34a] hover:bg-green-50 focus:outline-none focus:bg-green-50 transition-colors font-medium border-t border-gray-200"
                  >
                    + Add "{searchTerm}"
                  </button>
                )}
              </>
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
