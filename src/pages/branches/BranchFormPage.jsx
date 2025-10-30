import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiBuildingOffice2, HiMapPin, HiCog6Tooth, HiExclamationTriangle, HiCheckCircle, HiXMark } from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { createBranch, updateBranch, getBranchById } from '../../redux/actions/branchActions';
import { clearError, clearBranchSuccess } from '../../redux/slices/branchSlice';

const BranchFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get branch data from location state or params
  const selectedBranch = location.state?.branch || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const branchId = params.id;
  const isEdit = mode === 'edit';
  
  // Get loading states, success states, and branch data from Redux
  const { 
    loading: branchLoading,
    error: branchError,
    branches
  } = useSelector(state => state.branches || {});
  
  // Find the branch by ID if we're editing
  const reduxBranch = mode === 'edit' && branchId ? 
    branches.find(branch => branch._id === branchId) : null;
  
  const [formData, setFormData] = useState({
    branchName: '',
    branchCode: '',
    branchAddress: {
      street: '',
      city: '',
      state: '',
      pinCode: ''
    },
    incentiveType: 0,
    isActive: true,
    bankAccounts: [
      {
        bankName: '',
        bankAccountNumber: '',
        bankIfsc: '',
        bankBranch: '',
        bankAccountHolder: ''
      }
    ],
    readyCashAmount: 0,
    readyCashRemarks: ''
  });

  const [errors, setErrors] = useState({});
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Load branch data if editing and we have an ID
  useEffect(() => {
    if (mode === 'edit' && branchId && !selectedBranch) {
      dispatch(getBranchById(branchId));
    }
  }, [dispatch, mode, branchId, selectedBranch]);

  // Initialize form data
  useEffect(() => {
    const branchData = selectedBranch || reduxBranch;
    if (branchData) {
      // Handle both old format (string) and new format (object)
      let addressData = {
        street: '',
        city: '',
        state: '',
        pinCode: ''
      };
      
      if (typeof branchData.branchAddress === 'string') {
        addressData.street = branchData.branchAddress || '';
      } else if (branchData.branchAddress) {
        addressData = {
          street: branchData.branchAddress.street || '',
          city: branchData.branchAddress.city || '',
          state: branchData.branchAddress.state || '',
          pinCode: branchData.branchAddress.pinCode || ''
        };
      }
      
      setFormData({
        branchName: branchData.branchName || '',
        branchCode: branchData.branchCode || '',
        branchAddress: addressData,
        incentiveType: branchData.incentiveType || 0,
        isActive: branchData.isActive !== undefined ? branchData.isActive : true,
        bankAccounts: Array.isArray(branchData.bankAccounts) && branchData.bankAccounts.length > 0
          ? branchData.bankAccounts.map(acc => ({
              bankName: acc.bankName || '',
              bankAccountNumber: acc.bankAccountNumber || '',
              bankIfsc: acc.bankIfsc || '',
              bankBranch: acc.bankBranch || '',
              bankAccountHolder: acc.bankAccountHolder || ''
            }))
          : [
              {
                bankName: branchData.bankName || '',
                bankAccountNumber: branchData.bankAccountNumber || '',
                bankIfsc: branchData.bankIfsc || '',
                bankBranch: branchData.bankBranch || '',
                bankAccountHolder: branchData.bankAccountHolder || ''
              }
            ],
        readyCashAmount: branchData.readyCashAmount || 0,
        readyCashRemarks: branchData.readyCashRemarks || ''
      });
    } else if (mode === 'create') {
      setFormData({
        branchName: '',
        branchCode: '',
        branchAddress: {
          street: '',
          city: '',
          state: '',
          pinCode: ''
        },
        incentiveType: 0,
        isActive: true,
        bankAccounts: [
          {
            bankName: '',
            bankAccountNumber: '',
            bankIfsc: '',
            bankBranch: '',
            bankAccountHolder: ''
          }
        ],
        readyCashAmount: 0,
        readyCashRemarks: ''
      });
    }
  }, [selectedBranch, reduxBranch, mode]);

  // Handle success states - navigate away from form
  // Note: Success handling will be done in the form submission

  // Pincode lookup function
  const handlePincodeLookup = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setPincodeLoading(true);
    try {
      // Using postalpincode.in API (free, no API key required)
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          branchAddress: {
            ...prev.branchAddress,
            city: postOffice.Block || postOffice.District || '',
            state: postOffice.State || '',
            pinCode: pincode
          }
        }));
      } else {
        console.warn('Pincode not found or invalid');
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
    } finally {
      setPincodeLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle nested objects (branchAddress)
    if (name.startsWith('branchAddress.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        branchAddress: {
          ...prev.branchAddress,
          [field]: value
        }
      }));
      
      // Auto-fetch city and state when pinCode is entered
      if (field === 'pinCode' && value.length === 6) {
        handlePincodeLookup(value);
      }
    } else if (name.startsWith('bankAccounts[')) {
      // name format: bankAccounts[INDEX].field
      const match = name.match(/^bankAccounts\[(\d+)\]\.(.+)$/);
      if (match) {
        const index = parseInt(match[1], 10);
        const field = match[2];
        setFormData(prev => {
          const nextAccounts = prev.bankAccounts.map((acc, i) =>
            i === index ? { ...acc, [field]: value } : acc
          );
          return { ...prev, bankAccounts: nextAccounts };
        });
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleAddBankAccount = () => {
    const lastIndex = formData.bankAccounts.length - 1;
    const last = formData.bankAccounts[lastIndex];
    const missing = {};
    if (!last.bankName || !last.bankName.trim()) {
      missing[`bankAccounts[${lastIndex}].bankName`] = 'Bank name is required';
    }
    if (!last.bankAccountNumber || !last.bankAccountNumber.trim()) {
      missing[`bankAccounts[${lastIndex}].bankAccountNumber`] = 'Account number is required';
    }
    if (!last.bankIfsc || !last.bankIfsc.trim()) {
      missing[`bankAccounts[${lastIndex}].bankIfsc`] = 'IFSC code is required';
    }
    
    if (Object.keys(missing).length > 0) {
      setErrors(prev => ({ ...prev, ...missing }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      bankAccounts: [
        ...prev.bankAccounts,
        { bankName: '', bankAccountNumber: '', bankIfsc: '', bankBranch: '', bankAccountHolder: '' }
      ]
    }));
  };

  const handleRemoveBankAccount = (index) => {
    setFormData(prev => ({
      ...prev,
      bankAccounts: prev.bankAccounts.filter((_, i) => i !== index)
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.branchName.trim()) {
      newErrors.branchName = 'Branch name is required';
    }
    
    if (!formData.branchCode.trim()) {
      newErrors.branchCode = 'Branch code is required';
    }
    
    if (!formData.branchAddress.street.trim()) {
      newErrors.branchAddress = 'Street address is required';
    }
    
    if (!formData.branchAddress.city.trim()) {
      newErrors.city = 'City is required';
    }
    
    if (!formData.branchAddress.state.trim()) {
      newErrors.state = 'State is required';
    }
    
    if (!formData.branchAddress.pinCode.trim()) {
      newErrors.pinCode = 'Pincode is required';
    }
    
    if (formData.incentiveType < 0) {
      newErrors.incentiveType = 'Incentive type must be a positive number';
    }
    
    if (formData.readyCashAmount < 0) {
      newErrors.readyCashAmount = 'Ready cash must be 0 or a positive number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const branchData = {
      ...formData,
      incentiveType: parseFloat(formData.incentiveType)
    };

    // Backward compatibility: also send flat bank fields from the first account if present
    if (Array.isArray(branchData.bankAccounts) && branchData.bankAccounts.length > 0) {
      const first = branchData.bankAccounts[0];
      branchData.bankName = first.bankName;
      branchData.bankAccountNumber = first.bankAccountNumber;
      branchData.bankIfsc = first.bankIfsc;
      branchData.bankBranch = first.bankBranch;
      branchData.bankAccountHolder = first.bankAccountHolder;
    }

    try {
      if (mode === 'create') {
        await dispatch(createBranch(branchData)).unwrap();
      } else {
        await dispatch(updateBranch({ branchId, branchData })).unwrap();
      }
      // Navigate back on success
      navigate('/branches');
    } catch (error) {
      // Error will be handled by Redux state
      console.error('Error saving branch:', error);
    }
  };

  const handleBack = () => {
    navigate('/branches');
  };

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="min-h-screen">
        {/* Header */}
        <div className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <HiBuildingOffice2 className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {isEdit ? 'Edit Branch' : 'Add Branch'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {isEdit ? 'Update branch details' : 'Add new branch to the system'}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate('/branches')}
                variant="outline"
                size="sm"
                icon={HiXMark}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiBuildingOffice2 className="h-5 w-5 mr-2 text-[#22c55e]" />
                Branch Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Branch Name *"
                  name="branchName"
                  value={formData.branchName}
                  onChange={handleInputChange}
                  placeholder="Enter branch name"
                  error={errors.branchName}
                  required
                />
                
                <Input
                  label="Branch Code *"
                  name="branchCode"
                  value={formData.branchCode}
                  onChange={handleInputChange}
                  placeholder="Enter branch code"
                  error={errors.branchCode}
                  required
                />
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <textarea
                    name="branchAddress.street"
                    value={formData.branchAddress.street || ''}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent ${
                      errors.branchAddress ? 'border-red-300' : 'border-gray-300'
                    }`}
                    required
                  />
                  {errors.branchAddress && (
                    <p className="mt-1 text-sm text-red-600">{errors.branchAddress}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode *
                    {pincodeLoading && <span className="ml-2 text-xs text-blue-600">Fetching...</span>}
                  </label>
                  <Input
                    name="branchAddress.pinCode"
                    value={formData.branchAddress.pinCode || ''}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit pincode"
                    type="text"
                    maxLength="6"
                    pattern="[0-9]{6}"
                    error={errors.pinCode}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <Input
                    name="branchAddress.city"
                    value={formData.branchAddress.city || ''}
                    onChange={handleInputChange}
                    placeholder="City (auto-filled from pincode)"
                    readOnly={!!formData.branchAddress.pinCode && formData.branchAddress.pinCode.length === 6}
                    className={formData.branchAddress.pinCode && formData.branchAddress.pinCode.length === 6 ? 'bg-gray-50' : ''}
                    error={errors.city}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <Input
                    name="branchAddress.state"
                    value={formData.branchAddress.state || ''}
                    onChange={handleInputChange}
                    placeholder="State (auto-filled from pincode)"
                    readOnly={!!formData.branchAddress.pinCode && formData.branchAddress.pinCode.length === 6}
                    className={formData.branchAddress.pinCode && formData.branchAddress.pinCode.length === 6 ? 'bg-gray-50' : ''}
                    error={errors.state}
                  />
                </div>

                <div className="md:col-span-2 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-[#22c55e] focus:ring-[#22c55e] border-gray-300 rounded"
                  />
                  <label className="text-sm font-medium text-gray-700">
                    Active Branch
                  </label>
                </div>
              </div>
            </div>

            {/* Settings */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
                Branch Settings
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Incentive Type"
                  name="incentiveType"
                  type="number"
                  value={formData.incentiveType}
                  onChange={handleInputChange}
                  placeholder="0"
                  error={errors.incentiveType}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>

            {/* Bank Details */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
                  Bank Details
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={handleAddBankAccount}
                >
                  Add Bank Account
                </Button>
              </div>
              <div className="space-y-6">
                {formData.bankAccounts.map((acc, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2 flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Bank Account {index + 1}</span>
                      {formData.bankAccounts.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveBankAccount(index)}
                          className="text-red-600 text-sm hover:underline"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <Input
                      label="Bank Name"
                      name={`bankAccounts[${index}].bankName`}
                      value={acc.bankName}
                      onChange={handleInputChange}
                      placeholder="Enter bank name"
                      error={errors[`bankAccounts[${index}].bankName`]}
                    />
                    <Input
                      label="Account Holder Name"
                      name={`bankAccounts[${index}].bankAccountHolder`}
                      value={acc.bankAccountHolder}
                      onChange={handleInputChange}
                      placeholder="Enter account holder name"
                    />
                    <Input
                      label="Account Number"
                      name={`bankAccounts[${index}].bankAccountNumber`}
                      value={acc.bankAccountNumber}
                      onChange={handleInputChange}
                      placeholder="Enter account number"
                      error={errors[`bankAccounts[${index}].bankAccountNumber`]}
                    />
                    <Input
                      label="IFSC Code"
                      name={`bankAccounts[${index}].bankIfsc`}
                      value={acc.bankIfsc}
                      onChange={handleInputChange}
                      placeholder="Enter IFSC code"
                      error={errors[`bankAccounts[${index}].bankIfsc`]}
                    />
                    <Input
                      label="Bank Branch"
                      name={`bankAccounts[${index}].bankBranch`}
                      value={acc.bankBranch}
                      onChange={handleInputChange}
                      placeholder="Enter bank branch"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Ready Cash */}
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
                Ready Cash
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ready Cash Amount"
                  name="readyCashAmount"
                  type="number"
                  value={formData.readyCashAmount}
                  onChange={handleInputChange}
                  placeholder="0"
                  error={errors.readyCashAmount}
                  min="0"
                  step="0.01"
                />
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Remarks
                  </label>
                  <textarea
                    name="readyCashRemarks"
                    value={formData.readyCashRemarks}
                    onChange={handleInputChange}
                    placeholder="Optional notes about ready cash"
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent ${
                      errors.readyCashRemarks ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Error Messages */}
            {branchError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Error: {branchError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                size="xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="xs"
                loading={branchLoading}
                className="flex items-center"
              >
                <HiCheckCircle className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Branch' : 'Update Branch'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BranchFormPage;
