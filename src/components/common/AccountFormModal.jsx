import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiXMark,
  HiCurrencyDollar,
  HiBuildingOffice,
  HiCalendar,
  HiDocumentText,
  HiUser,
  HiTag
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea, CommonModal } from './index';
import { createAccount, updateAccount, getUniqueVendors, getUniqueCustomers } from '../../redux/actions/accountActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { addNotification } from '../../redux/slices/uiSlice';

const AccountFormModal = ({ isOpen, onClose, account = null }) => {
  const dispatch = useDispatch();
  
  // Get branches from Redux store
  const { branches = [], loading: branchesLoading } = useSelector(state => state.branches || {});
  
  const [loading, setLoading] = useState(false);
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);
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
    referenceNumber: '',
    vendorName: '',
    customerName: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Load branches and vendors when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getAllBranches());
      
      // Load vendors
      const fetchVendors = async () => {
        setVendorsLoading(true);
        try {
          const result = await dispatch(getUniqueVendors()).unwrap();
          const vendorsList = result.data || [];
          setVendors(vendorsList);
        } catch (error) {
          console.error('Error fetching vendors:', error);
        } finally {
          setVendorsLoading(false);
        }
      };
      
      fetchVendors();
      
      // Load customers
      const fetchCustomers = async () => {
        setCustomersLoading(true);
        try {
          const result = await dispatch(getUniqueCustomers()).unwrap();
          const customersList = result.data || [];
          setCustomers(customersList);
        } catch (error) {
          console.error('Error fetching customers:', error);
        } finally {
          setCustomersLoading(false);
        }
      };
      
      fetchCustomers();
    }
  }, [isOpen, dispatch]);

  // Reset form when modal opens/closes or account changes
  useEffect(() => {
    if (isOpen) {
      if (account) {
        // Edit mode - populate form with account data
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
          referenceNumber: account.referenceNumber || '',
          vendorName: account.vendorName || '',
          customerName: account.customerName || ''
        });
      } else {
        // Create mode - reset form
        setFormData({
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
          referenceNumber: '',
          vendorName: '',
          customerName: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, account]);

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
      };

      if (account) {
        // Update existing account
        await dispatch(updateAccount({ id: account._id, accountData })).unwrap();
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

      onClose();
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

  // Debug: Log branches data
  console.log('AccountFormModal - branches:', branches);
  console.log('AccountFormModal - branchOptions:', branchOptions);

  // Determine which fields to show based on transaction type and category
  const showFields = () => {
    const fields = {
      // Common fields - always show
      transactionType: true,
      category: true,
      amount: true,
      branchId: true,
      description: true,
      paymentMethod: true,
      paymentStatus: true,
      transactionDate: true,
      referenceNumber: true,

      // Conditional fields
      subCategory: false,
      orderId: false,
      customerName: false,
      vendorName: false,
    };

    const { transactionType, category } = formData;

    // Show sub-category for most categories
    if (category) {
      fields.subCategory = true;
    }

    // Show order ID for income transactions (sales, service)
    if (transactionType === 'income' && ['sales', 'service'].includes(category)) {
      fields.orderId = true;
    }

    // Show customer name for income transactions
    if (transactionType === 'income') {
      fields.customerName = true;
    }

    // Show vendor name for expense transactions
    if (transactionType === 'expense') {
      fields.vendorName = true;
    }

    return fields;
  };

  const visibleFields = showFields();

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

  if (!isOpen) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={account ? 'Edit Account Entry' : 'Add Account Entry'}
      subtitle={account ? 'Update account information' : 'Create a new account entry'}
      icon={HiCurrencyDollar}
      iconColor="from-green-500 to-green-600"
      size="xl"
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Transaction Type and Category */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
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

        {/* Branch and Transaction Date */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        

        {/* Reference Number and Vendor/Customer Name (single row) */}
        <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
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
          {visibleFields.vendorName ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vendor Name
              </label>
              <Select
                options={[
                  ...vendors.map(v => ({
                    value: v.vendorName,
                    label: `${v.vendorName}${v.referenceNumber ? ` (${v.referenceNumber})` : ''}`
                  })),
                  // Add current vendor name if it's not in the list (for new vendors or editing)
                  ...(formData.vendorName && !vendors.find(v => v.vendorName === formData.vendorName)
                    ? [{ value: formData.vendorName, label: formData.vendorName }]
                    : [])
                ]}
                value={formData.vendorName}
                onChange={(e) => handleInputChange('vendorName', e.target.value)}
                placeholder="Select or type vendor name"
                searchable={true}
                searchPlaceholder="Search or type new vendor..."
                loading={vendorsLoading}
              />
            </div>
          ) : visibleFields.customerName ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Customer Name
              </label>
              <Select
                options={[
                  ...customers.map(c => ({
                    value: c.customerName,
                    label: `${c.customerName}${c.referenceNumber ? ` (${c.referenceNumber})` : ''}`
                  })),
                  // Add current customer name if it's not in the list (for new customers or editing)
                  ...(formData.customerName && !customers.find(c => c.customerName === formData.customerName)
                    ? [{ value: formData.customerName, label: formData.customerName }]
                    : [])
                ]}
                value={formData.customerName}
                onChange={(e) => handleInputChange('customerName', e.target.value)}
                placeholder="Select or type customer name"
                searchable={true}
                searchPlaceholder="Search or type new customer..."
                loading={customersLoading}
              />
            </div>
          ) : visibleFields.orderId ? (
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
          ) : (
            <div className="hidden md:block"></div>
          )}
        </div>

        {/* Order ID (shown separately for income transactions when customer name is also shown) */}
        {visibleFields.orderId && visibleFields.customerName && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="hidden md:block"></div>
          </div>
        )}


        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            {account ? 'Update Account' : 'Create Account'}
          </Button>
        </div>
      </form>
    </CommonModal>
  );
};

export default AccountFormModal;



