import React, { useState, useRef, useEffect } from 'react';
import { HiPlus, HiXMark } from 'react-icons/hi2';
import Dropdown from './Dropdown';

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
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductWeight, setNewProductWeight] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const inputRef = useRef(null);

  // Focus input when add form opens
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  const handleAddNewClick = () => {
    setShowAddForm(true);
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!newProductName.trim()) return;
    
    setIsCreating(true);
    try {
      const productData = {
        productName: newProductName.trim(),
        price: parseFloat(newProductPrice) || 0,
        weight: parseFloat(newProductWeight) || 0,
        isActive: true
      };
      
      await onAddNew(productData);
      
      // Reset form
      setNewProductName('');
      setNewProductPrice('');
      setNewProductWeight('');
      setShowAddForm(false);
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

  return (
    <div className={`space-y-1 ${className}`}>
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
        loading={loading}
        showAddNew={true}
        addNewLabel="Add New Product"
        onAddNew={handleAddNewClick}
        {...props}
      />

      {/* Add New Product Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md mx-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Add New Product</h3>
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiXMark className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Name *
                  </label>
                  <input
                    ref={inputRef}
                    type="text"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="Enter product name"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight (g)
                    </label>
                    <input
                      type="number"
                      value={newProductWeight}
                      onChange={(e) => setNewProductWeight(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.1"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={handleCreateProduct}
                  disabled={!newProductName.trim() || isCreating}
                  className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#22c55e] rounded-md hover:bg-[#16a34a] focus:outline-none focus:ring-2 focus:ring-[#22c55e] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? 'Creating...' : 'Create Product'}
                </button>
                
                <button
                  type="button"
                  onClick={handleCancelAdd}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductSelectWithCreate;