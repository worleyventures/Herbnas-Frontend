import React from 'react';
import { HiCreditCard, HiBuildingOffice2 } from 'react-icons/hi2';

const PaymentAssignmentStep = ({
  formData,
  setFormData,
  errors,
  branches,
  branchesLoading,
  branchesError,
  branchSearch,
  setBranchSearch,
  showBranchDropdown,
  setShowBranchDropdown,
  handleBranchSelect
}) => {
  const paymentTypeOptions = [
    { value: 'prepaid', label: 'Prepaid' },
    { value: 'local', label: 'Local' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const paymentModeOptions = [
    { value: 'gpay', label: 'Google Pay' },
    { value: 'phonepe', label: 'PhonePe' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online_sales', label: 'Online Sales' },
    { value: 'cash', label: 'Cash' },
    { value: 'full_cod', label: 'Full COD' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (payment)
    if (name.startsWith('payment.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Filter branches based on search
  const filteredBranches = branches.filter(branch => 
    branch.branchName.toLowerCase().includes(branchSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Payment Information */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-[#22c55e]-100 rounded-xl flex items-center justify-center">
          <HiCreditCard className="h-5 w-5 text-[#22c55e]-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Payment Information</h4>
          <p className="text-sm text-gray-500">Payment details and transaction information</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Type
          </label>
          <select
            name="payment.paymentType"
            value={formData.payment.paymentType}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          >
            {paymentTypeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Mode
          </label>
          <select
            name="payment.paymentMode"
            value={formData.payment.paymentMode}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          >
            {paymentModeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Date
          </label>
          <input
            type="date"
            name="payment.paymentDate"
            value={formData.payment.paymentDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Note
          </label>
          <input
            type="text"
            name="payment.paymentNote"
            value={formData.payment.paymentNote}
            onChange={handleInputChange}
            placeholder="Enter payment note"
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
      </div>

      {/* Assignment Information */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <HiBuildingOffice2 className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Assignment Information</h4>
          <p className="text-sm text-gray-500">Assign lead to branch</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="branch-dropdown-container">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dispatched From Branch *
          </label>
          <div className="relative">
            <input
              type="text"
              value={branchSearch}
              onChange={(e) => {
                setBranchSearch(e.target.value);
                setShowBranchDropdown(true);
              }}
              onFocus={() => setShowBranchDropdown(true)}
              placeholder={branchesLoading ? 'Loading branches...' : 
                         branchesError ? 'Error loading branches' :
                         branches.length === 0 ? 'No branches available' :
                         'Search branches...'}
              className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
                errors.dispatchedFrom ? 'border-red-500' : 'border-gray-300/50'
              }`}
              disabled={branchesLoading}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
            
            {showBranchDropdown && (
              <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                {filteredBranches.length === 0 ? (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    {branchSearch ? 'No branches found' : 'No branches available'}
                  </div>
                ) : (
                  filteredBranches.map(branch => (
                    <div
                      key={branch._id}
                      onClick={() => handleBranchSelect(branch)}
                      className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center">
                        <HiBuildingOffice2 className="h-4 w-4 text-gray-400 mr-3" />
                        <span className="text-sm font-medium text-gray-900">{branch.branchName}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          {errors.dispatchedFrom && (
            <p className="mt-1 text-sm text-red-600">{errors.dispatchedFrom}</p>
          )}
          {branchesError && (
            <p className="mt-1 text-sm text-red-600">Failed to load branches: {branchesError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentAssignmentStep;
