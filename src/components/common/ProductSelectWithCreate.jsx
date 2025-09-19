import React, { useState, useRef, useEffect } from 'react';
import { HiPlus, HiXMark } from 'react-icons/hi2';

const ProductSelectWithCreate = ({
  options = [],
  value,
  onChange,
  onAddNew,
  placeholder = "Select or add a product",
  disabled = false,
  error = false,
  errorMessage = "",
  label = "",
  helperText = "",
  className = "",
  loading = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductWeight, setNewProductWeight] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setShowAddForm(false);
        setNewProductName('');
        setNewProductPrice('');
        setNewProductWeight('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Focus input when add form opens
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const handleSelectChange = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleAddNewClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddForm(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newProductName.trim()) return;
    
    setIsCreating(true);
    try {
      const newProduct = {
        productName: newProductName.trim(),
        price: parseFloat(newProductPrice) || 0,
        weight: parseFloat(newProductWeight) || 0,
        isActive: true
      };
      
      await onAddNew(newProduct);
      
      // Reset form
      setNewProductName('');
      setNewProductPrice('');
      setNewProductWeight('');
      setShowAddForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating product:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCancelAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAddForm(false);
    setNewProductName('');
    setNewProductPrice('');
    setNewProductWeight('');
  };

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`space-y-1 ${className}`} ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`
            w-full px-4 py-2.5 pr-8 border rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] text-sm bg-white shadow-sm hover:border-gray-400 cursor-pointer text-left
            ${error ? 'border-red-300 focus:ring-red-500' : 'border-gray-300'}
            ${disabled ? 'bg-gray-50 cursor-not-allowed' : ''}
          `}
          {...props}
        >
          <span className={selectedOption ? 'text-gray-900' : 'text-gray-500'}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </button>
        
        {/* Dropdown Arrow */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg
            className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto">
            {/* Always show Add New Product at the top */}
            <div className="border-b border-gray-200">
              <button
                type="button"
                onClick={handleAddNewClick}
                className="w-full px-4 py-2 text-left text-sm text-[#22c55e] hover:bg-gray-100 focus:outline-none focus:bg-gray-100 flex items-center font-medium"
              >
                <HiPlus className="w-4 h-4 mr-2" />
                Add New Product
              </button>
            </div>
            
            {/* Show existing products */}
            {options.length > 0 ? (
              <>
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelectChange(option.value)}
                    className="w-full px-4 py-2 text-left text-sm text-gray-900 hover:bg-gray-100 focus:outline-none focus:bg-gray-100"
                  >
                    {option.label}
                  </button>
                ))}
              </>
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500">
                No products available
              </div>
            )}
          </div>
        )}

        {/* Add New Product Form */}
        {showAddForm && (
          <div className="absolute z-[110] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900">Add New Product</h3>
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiXMark className="w-4 h-4" />
                </button>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Product Name *
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Enter product name"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e]"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Price (₹)
                  </label>
                  <input
                    type="number"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Weight (g)
                  </label>
                  <input
                    type="number"
                    value={newProductWeight}
                    onChange={(e) => setNewProductWeight(e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.1"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  disabled={!newProductName.trim() || isCreating}
                  className="flex-1 px-3 py-2 text-xs font-medium text-white bg-[#22c55e] rounded-md hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Product'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-1 focus:ring-gray-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {error && errorMessage && (
        <p className="text-sm text-red-600">{errorMessage}</p>
      )}
      
      {!error && helperText && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

export default ProductSelectWithCreate;
