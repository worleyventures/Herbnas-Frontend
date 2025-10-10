import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCurrencyDollar,
  HiBuildingOffice,
  HiCalendar,
  HiDocumentText,
  HiUser,
  HiTag,
  HiCheckCircle
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea, Loading } from '../../components/common';
import { createAccount, updateAccount, getAccountById } from '../../redux/actions/accountActions';
import { addNotification } from '../../redux/slices/uiSlice';

const AccountFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [branches, setBranches] = useState([]);
  const [formData, setFormData] = useState({
    transactionType: 'income',
    category: '',
    subCategory: '',
    amount: '',
    currency: 'INR',
    branchId: '',
    orderId: '',
    description: '',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    transactionDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    referenceNumber: '',
    vendorName: '',
    customerName: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Load branches data
  const loadBranches = async () => {
    try {
      const response = await fetch('/api/branches');
      const data = await response.json();
      if (data.success) {
        setBranches(data.data.branches || []);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load branches'
      }));
    }
  };

  // Load account data for editing
  const loadAccountData = async () => {
    if (!isEdit) return;
    
    setLoading(true);
    try {
      const result = await dispatch(getAccountById(id)).unwrap();
      const account = result.data.account;
      
      setFormData({
        transactionType: account.transactionType || 'income',
        category: account.category || '',
        subCategory: account.subCategory || '',
        amount: account.amount || '',
        currency: account.currency || 'INR',
        branchId: account.branchId?._id || '',
        orderId: account.orderId?._id || '',
        description: account.description || '',
        paymentMethod: account.paymentMethod || 'cash',
        paymentStatus: account.paymentStatus || 'completed',
        transactionDate: account.transactionDate ? new Date(account.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dueDate: account.dueDate ? new Date(account.dueDate).toISOString().split('T')[0] : '',
        referenceNumber: account.referenceNumber || '',
        vendorName: account.vendorName || '',
        customerName: account.customerName || '',
        notes: account.notes || ''
      });
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load account data'
      }));
      navigate('/accounts');
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadBranches();
    if (isEdit) {
      loadAccountData();
    }
  }, [isEdit, id, dispatch, navigate]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    if (!formData.branchId) {
      newErrors.branchId = 'Branch is required';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!formData.transactionDate) {
      newErrors.transactionDate = 'Transaction date is required';
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

    setLoading(true);
    try {
      const accountData = {
        ...formData,
        amount: parseFloat(formData.amount),
        orderId: formData.orderId || null,
        dueDate: formData.dueDate || null
      };

      if (isEdit) {
        // Update existing account
        await dispatch(updateAccount({ id, accountData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Account entry updated successfully!'
        }));
      } else {
        // Create new account
        await dispatch(createAccount(accountData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Account entry created successfully!'
        }));
      }

      navigate('/accounts');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to save account entry'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Transaction type options
  const transactionTypeOptions = [
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' }
  ];

  // Category options based on transaction type
  const getCategoryOptions = () => {
    if (formData.transactionType === 'income') {
      return [
        { value: 'sales', label: 'Sales' },
        { value: 'service', label: 'Service' },
        { value: 'commission', label: 'Commission' },
        { value: 'interest', label: 'Interest' },
        { value: 'investment', label: 'Investment' },
        { value: 'other_income', label: 'Other Income' }
      ];
    } else {
      return [
        { value: 'raw_materials', label: 'Raw Materials' },
        { value: 'labor', label: 'Labor' },
        { value: 'utilities', label: 'Utilities' },
        { value: 'rent', label: 'Rent' },
        { value: 'equipment', label: 'Equipment' },
        { value: 'marketing', label: 'Marketing' },
        { value: 'transportation', label: 'Transportation' },
        { value: 'maintenance', label: 'Maintenance' },
        { value: 'insurance', label: 'Insurance' },
        { value: 'taxes', label: 'Taxes' },
        { value: 'other_expense', label: 'Other Expense' }
      ];
    }
  };

  // Branch options
  const branchOptions = branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  }));

  // Payment method options
  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'netbanking', label: 'Net Banking' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'bank_transfer', label: 'Bank Transfer' }
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  // Currency options
  const currencyOptions = [
    { value: 'INR', label: 'INR (₹)' },
    { value: 'USD', label: 'USD ($)' },
    { value: 'EUR', label: 'EUR (€)' },
    { value: 'GBP', label: 'GBP (£)' }
  ];

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Account Entry' : 'Add Account Entry'}
              </h1>
              {/* <p className="text-gray-600 mt-1">
                {isEdit ? 'Update account information' : 'Create a new account entry'}
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Transaction Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type *
              </label>
              <Select
                options={transactionTypeOptions}
                value={formData.transactionType}
                onChange={(value) => {
                  handleInputChange('transactionType', value);
                  handleInputChange('category', ''); // Reset category when type changes
                }}
                error={errors.transactionType}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <Select
                options={getCategoryOptions()}
                value={formData.category}
                onChange={(value) => handleInputChange('category', value)}
                placeholder="Select category"
                error={errors.category}
              />
            </div>
          </div>

          {/* Sub Category and Amount */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sub Category
              </label>
              <Input
                value={formData.subCategory}
                onChange={(e) => handleInputChange('subCategory', e.target.value)}
                placeholder="Enter sub category (optional)"
                error={errors.subCategory}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount *
              </label>
              <Input
                type="number"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="Enter amount"
                error={errors.amount}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Currency and Branch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <Select
                options={currencyOptions}
                value={formData.currency}
                onChange={(value) => handleInputChange('currency', value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch *
              </label>
              <Select
                options={branchOptions}
                value={formData.branchId}
                onChange={(value) => handleInputChange('branchId', value)}
                placeholder="Select branch"
                error={errors.branchId}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              error={errors.description}
              rows={3}
            />
          </div>

          {/* Payment Method and Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <Select
                options={paymentMethodOptions}
                value={formData.paymentMethod}
                onChange={(value) => handleInputChange('paymentMethod', value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <Select
                options={paymentStatusOptions}
                value={formData.paymentStatus}
                onChange={(value) => handleInputChange('paymentStatus', value)}
              />
            </div>
          </div>

          {/* Transaction Date and Due Date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Date *
              </label>
              <Input
                type="date"
                value={formData.transactionDate}
                onChange={(e) => handleInputChange('transactionDate', e.target.value)}
                error={errors.transactionDate}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Due Date
              </label>
              <Input
                type="date"
                value={formData.dueDate}
                onChange={(e) => handleInputChange('dueDate', e.target.value)}
              />
            </div>
          </div>

          {/* Reference Number and Order ID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reference Number
              </label>
              <Input
                value={formData.referenceNumber}
                onChange={(e) => handleInputChange('referenceNumber', e.target.value)}
                placeholder="Enter reference number"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Order ID
              </label>
              <Input
                value={formData.orderId}
                onChange={(e) => handleInputChange('orderId', e.target.value)}
                placeholder="Enter order ID (optional)"
              />
            </div>
          </div>

          {/* Vendor/Customer Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {formData.transactionType === 'income' ? 'Customer Name' : 'Vendor Name'}
              </label>
              <Input
                value={formData.transactionType === 'income' ? formData.customerName : formData.vendorName}
                onChange={(e) => handleInputChange(
                  formData.transactionType === 'income' ? 'customerName' : 'vendorName', 
                  e.target.value
                )}
                placeholder={`Enter ${formData.transactionType === 'income' ? 'customer' : 'vendor'} name`}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <TextArea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter additional notes (optional)"
              rows={3}
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountFormPage;

