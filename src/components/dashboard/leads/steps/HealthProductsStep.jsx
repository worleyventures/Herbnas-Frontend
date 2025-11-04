import React, { useEffect, useMemo } from 'react';
import { HiExclamationTriangle, HiBuildingOffice2, HiPlus, HiTrash, HiDocumentText } from 'react-icons/hi2';

const HealthProductsStep = ({
  formData,
  setFormData,
  products,
  productsLoading,
  productSearch,
  setProductSearch,
  showProductDropdown,
  setShowProductDropdown,
  healthIssueSearch,
  setHealthIssueSearch,
  showHealthIssueDropdown,
  setShowHealthIssueDropdown,
  activeHealthIssues,
  healthIssuesLoading,
  healthIssuesError,
  errors
}) => {
  
  // Get health issue names from API data
  const allHealthIssues = activeHealthIssues.length > 0 
    ? activeHealthIssues.map(issue => issue.healthIssue)
    : [
        'Diabetes Management',
        'Digestive Disorders',
        'Stress and Anxiety',
        'Skin Problems',
        'Joint Pain and Arthritis'
      ]; // Fallback health issues
  console.log('HealthProductsStep - allHealthIssues:', allHealthIssues);

  // Function to filter health issues based on search
  const filteredHealthIssues = allHealthIssues.filter(issue =>
    issue.toLowerCase().includes(healthIssueSearch.toLowerCase())
  );

  // Get available products from Redux
  const availableProducts = products || [];

  // Function to filter products based on search
  const filteredProducts = availableProducts.filter(product =>
    product.productName?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProductDropdown && !event.target.closest('.product-dropdown-container')) {
        setShowProductDropdown(false);
      }
      if (showHealthIssueDropdown && !event.target.closest('.health-issue-dropdown-container')) {
        setShowHealthIssueDropdown(false);
      }
    };

    if (showProductDropdown || showHealthIssueDropdown) {
      // Use click event with capture phase to allow button clicks to complete first
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [showProductDropdown, showHealthIssueDropdown, setShowProductDropdown, setShowHealthIssueDropdown]);

  // Close product dropdown when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setShowProductDropdown(false);
        setShowHealthIssueDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [setShowProductDropdown, setShowHealthIssueDropdown]);

  return (
    <div className="space-y-6">
      {/* Health Information */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-red-500/10 rounded-xl flex items-center justify-center">
          <HiExclamationTriangle className="h-5 w-5 text-red-500" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Health Information</h4>
          <p className="text-sm text-gray-500">Medical conditions and health issues</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Health Issues
        </label>
        <div className="relative health-issue-dropdown-container z-50">
          <input
            type="text"
            value={healthIssueSearch}
            onChange={(e) => {
              setHealthIssueSearch(e.target.value);
              setShowHealthIssueDropdown(true);
            }}
            onFocus={() => setShowHealthIssueDropdown(true)}
            placeholder="Search health issues..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
          <HiDocumentText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {showHealthIssueDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <span className="text-xs font-medium text-gray-600">
                  Select Health Issues ({filteredHealthIssues.length} available)
                </span>
                <div className="flex gap-2">
                  {healthIssueSearch && (
                    <button
                      type="button"
                      onClick={() => setHealthIssueSearch('')}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Clear Search
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowHealthIssueDropdown(false)}
                    className="text-gray-400 hover:text-gray-600 text-sm"
                  >
                    ×
                  </button>
                </div>
              </div>
              {healthIssuesLoading ? (
                <div className="px-4 py-3 text-gray-500 text-center text-sm">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#22c55e] mr-2"></div>
                    Loading health issues...
                  </div>
                </div>
              ) : healthIssuesError ? (
                <div className="px-4 py-3 text-red-500 text-center text-sm">
                  Error loading health issues: {healthIssuesError}
                </div>
              ) : filteredHealthIssues.length > 0 ? (
                filteredHealthIssues.map(issue => (
                  <div
                    key={issue}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer flex items-center transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      const isSelected = formData.healthIssues.includes(issue);
                      let newHealthIssues;
                      if (isSelected) {
                        newHealthIssues = formData.healthIssues.filter(h => h !== issue);
                      } else {
                        newHealthIssues = [...formData.healthIssues, issue];
                      }
                      setFormData(prev => ({
                        ...prev,
                        healthIssues: newHealthIssues
                      }));
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.healthIssues.includes(issue)}
                      onChange={() => {}} // Handled by parent onClick
                      className="h-4 w-4 text-[#22c55e] focus:ring-[#22c55e] border-gray-300 rounded mr-2"
                    />
                    <span>{issue}</span>
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center text-sm">
                  {healthIssueSearch ? 'No health issues found' : 'No health issues available'}
                </div>
              )}
            </div>
          )}
        </div>
        {formData.healthIssues.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Selected: </span>
            <span className="text-xs text-gray-400 ml-2">({formData.healthIssues.length} items)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.healthIssues.map(issue => (
                <span
                  key={issue}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {issue}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        healthIssues: prev.healthIssues.filter(h => h !== issue)
                      }));
                    }}
                    className="ml-1 text-blue-600 hover:text-blue-800"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, healthIssues: [] }))}
                className="text-xs text-red-600 hover:text-red-800 ml-2"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Products & Services */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
          <HiBuildingOffice2 className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Products & Services</h4>
          <p className="text-sm text-gray-500">Select products and services</p>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Product
        </label>
        <div className="relative product-dropdown-container z-40">
          <input
            type="text"
            value={productSearch}
            onChange={(e) => {
              setProductSearch(e.target.value);
              setShowProductDropdown(true);
            }}
            onFocus={() => setShowProductDropdown(true)}
            placeholder="Search products..."
            className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
              showProductDropdown 
                ? 'border-[#22c55e] ring-2 ring-[#22c55e]' 
                : 'border-gray-300/50'
            }`}
          />
          <HiDocumentText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          {showProductDropdown && (
            <div className="absolute z-40 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
              <div className="flex justify-between items-center px-4 py-2 bg-gray-50 border-b border-gray-200 rounded-t-lg">
                <span className="text-xs font-medium text-gray-600">Select Products</span>
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(false)}
                  className="text-gray-400 hover:text-gray-600 text-sm"
                >
                  ×
                </button>
              </div>
              {productsLoading ? (
                <div className="px-4 py-3 text-gray-500 text-center text-sm">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#22c55e] mr-2"></div>
                    Loading products...
                  </div>
                </div>
              ) : filteredProducts.length > 0 ? (
                filteredProducts.map(product => (
                  <div
                    key={product._id}
                    className="px-4 py-2 hover:bg-yellow-50 cursor-pointer flex items-center transition-colors duration-200 border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      const isSelected = formData.products.includes(product._id);
                      let newProducts;
                      if (isSelected) {
                        newProducts = formData.products.filter(p => p !== product._id);
                      } else {
                        newProducts = [...formData.products, product._id];
                      }
                      setFormData(prev => ({
                        ...prev,
                        products: newProducts
                      }));
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.products.includes(product._id)}
                      onChange={() => {}} // Handled by parent onClick
                      className="h-4 w-4 text-[#22c55e] focus:ring-[#22c55e] border-gray-300 rounded mr-2"
                    />
                    <span className="text-sm text-gray-900">{product.productName}</span>
                    {product.price && (
                      <span className="ml-auto text-xs text-gray-500">₹{product.price}</span>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-4 py-3 text-gray-500 text-center text-sm">
                  {productSearch ? 'No products found' : 
                   availableProducts.length === 0 ? 'No products available. Please add products first.' : 
                   'Start typing to search products...'}
                </div>
              )}
              <div className="border-t border-gray-200 px-4 py-2 bg-gray-50 rounded-b-lg">
                <button
                  type="button"
                  onClick={() => setShowProductDropdown(false)}
                  className="w-full text-sm font-medium text-[#22c55e] hover:text-[#16a34a] py-1"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
        {formData.products.length > 0 && (
          <div className="mt-2">
            <span className="text-sm text-gray-600">Selected: </span>
            <span className="text-xs text-gray-400 ml-2">({formData.products.length} items)</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {formData.products.map(productId => {
                const product = availableProducts.find(p => p._id === productId);
                return product ? (
                  <span
                    key={productId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {product.productName}
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          products: prev.products.filter(p => p !== productId)
                        }));
                      }}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ) : (
                  <span
                    key={productId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800"
                  >
                    Invalid Product (ID: {productId})
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({
                          ...prev,
                          products: prev.products.filter(p => p !== productId)
                        }));
                      }}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, products: [] }))}
                className="text-xs text-red-600 hover:text-red-800 ml-2"
              >
                Clear All
              </button>
            </div>
          </div>
        )}
        
        {availableProducts.length === 0 && (
          <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm text-yellow-800">
              <strong>No products available.</strong> Please add products to the system before creating leads.
            </p>
          </div>
        )}
        
        {errors.products && (
          <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">
              <strong>Error:</strong> {errors.products}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthProductsStep;
