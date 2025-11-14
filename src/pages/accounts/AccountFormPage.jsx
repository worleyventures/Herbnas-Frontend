import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { Button, Input, Select, TextArea, Loading } from '../../components/common';
import { createAccount, updateAccount, getAccountById, getUniqueVendors, getUniqueCustomers } from '../../redux/actions/accountActions';
import { getAllBranches, getBranchById } from '../../redux/actions/branchActions';
import { getAllOrders } from '../../redux/actions/orderActions';
import { addNotification } from '../../redux/slices/uiSlice';

const AccountFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Get branches from Redux store
  const { branches = [], loading: branchesLoading } = useSelector(state => state.branches || {});
  
  // Get orders from Redux store
  const { orders = [], loading: ordersLoading } = useSelector(state => state.orders || {});
  
  // Get user information for role-based functionality
  const { user } = useSelector((state) => state.auth);
  const isAccountsManager = user?.role === 'accounts_manager';

  // Debug: Log branches data
  console.log('AccountFormPage - branches:', branches);
  console.log('AccountFormPage - branchesLoading:', branchesLoading);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    transactionType: 'income',
    category: '',
    subCategory: '',
    amount: '',
    currency: 'INR',
    branchId: '',
    orderId: '', // Local orderId for display
    orderIdMongo: '', // MongoDB _id for submission
    description: '',
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    transactionDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    vendorName: '',
    customerName: '',
    paymentSource: 'ready_cash', // 'bank_account' or 'ready_cash'
    bankAccountIndex: '' // Index of bank account if paymentSource is 'bank_account'
  });
  const [selectedBranchDetails, setSelectedBranchDetails] = useState(null);
  const [errors, setErrors] = useState({});
  const [vendors, setVendors] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [customersLoading, setCustomersLoading] = useState(false);


  // Load account data for editing
  const loadAccountData = async () => {
    if (!isEdit) return;
    
    setLoading(true);
    try {
      const result = await dispatch(getAccountById(id)).unwrap();
      const account = result.data.account;
      
      // Get local orderId if orderId is populated, otherwise use MongoDB _id
      let displayOrderId = '';
      if (account.orderId) {
        // If populated, get the local orderId field
        displayOrderId = account.orderId.orderId || account.orderId._id || '';
      }
      
      setFormData({
        transactionType: account.transactionType || 'income',
        category: account.category || '',
        subCategory: account.subCategory || '',
        amount: account.amount || '',
        currency: account.currency || 'INR',
        branchId: account.branchId?._id || '',
        orderId: displayOrderId, // Store local orderId for display
        orderIdMongo: account.orderId?._id || '', // Store MongoDB _id separately for submission
        description: account.description || '',
        paymentMethod: account.paymentMethod || 'cash',
        paymentStatus: account.paymentStatus || 'completed',
        transactionDate: account.transactionDate ? new Date(account.transactionDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        referenceNumber: account.referenceNumber || '',
        vendorName: account.vendorName || '',
        customerName: account.customerName || '',
        paymentSource: account.paymentSource || 'ready_cash',
        bankAccountIndex: account.bankAccountIndex || ''
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

  // Load vendors
  useEffect(() => {
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
  }, [dispatch]);

  // Load customers
  useEffect(() => {
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
  }, [dispatch]);

  // Load data on component mount
  useEffect(() => {
    // Load branches using Redux
    console.log('AccountFormPage - Dispatching getAllBranches');
    dispatch(getAllBranches());
    
    // Load orders if orderId field might be visible (income transactions with sales/service category)
    if (formData.transactionType === 'income' && ['sales', 'service'].includes(formData.category)) {
      dispatch(getAllOrders({ page: 1, limit: 1000 }));
    }
    
    if (isEdit) {
      loadAccountData();
    }
  }, [isEdit, id, dispatch, navigate]);

  // Load orders when transaction type or category changes and orderId field becomes visible
  useEffect(() => {
    if (formData.transactionType === 'income' && ['sales', 'service'].includes(formData.category)) {
      dispatch(getAllOrders({ page: 1, limit: 1000 }));
    }
  }, [formData.transactionType, formData.category, dispatch]);

  // Auto-select branch for accounts managers when creating new accounts
  useEffect(() => {
    if (!isEdit && isAccountsManager && user?.branch && branches.length > 0) {
      const userBranchId = user.branch?._id || user.branch;
      setFormData(prev => ({
        ...prev,
        branchId: userBranchId
      }));
    }
  }, [isEdit, isAccountsManager, user?.branch, branches.length]);

  // Fetch branch details when branchId changes to get bank accounts and ready cash
  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (formData.branchId) {
        try {
          const result = await dispatch(getBranchById(formData.branchId)).unwrap();
          const branchData = result.data?.branch || result.data;
          setSelectedBranchDetails(branchData);
        } catch (error) {
          console.error('Error fetching branch details:', error);
          setSelectedBranchDetails(null);
        }
      } else {
        setSelectedBranchDetails(null);
      }
    };
    
    fetchBranchDetails();
  }, [formData.branchId, dispatch]);

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
      // Convert local orderId to MongoDB _id if orderId is provided
      let orderIdMongo = null;
      if (formData.orderId) {
        // Check if it's already a MongoDB ObjectId (24 hex characters)
        const isMongoId = /^[0-9a-fA-F]{24}$/.test(formData.orderId);
        if (isMongoId) {
          orderIdMongo = formData.orderId;
        } else {
          // Find order by local orderId
          const order = orders.find(o => o.orderId === formData.orderId);
          if (order) {
            orderIdMongo = order._id;
          } else {
            dispatch(addNotification({
              type: 'error',
              message: `Order with ID "${formData.orderId}" not found`
            }));
            setLoading(false);
            return;
          }
        }
      } else if (formData.orderIdMongo) {
        // Use stored MongoDB _id if local orderId is empty
        orderIdMongo = formData.orderIdMongo;
      }
      
      const accountData = {
        ...formData,
        amount: parseFloat(formData.amount),
        orderId: orderIdMongo,
        // Include paymentSource and bankAccountIndex only if paymentStatus is 'completed'
        paymentSource: formData.paymentStatus === 'completed' ? formData.paymentSource : undefined,
        bankAccountIndex: formData.paymentStatus === 'completed' && formData.paymentSource === 'bank_account' ? formData.bankAccountIndex : undefined
      };
      
      // Remove orderIdMongo from accountData as it's not a field in the model
      delete accountData.orderIdMongo;

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

      // Refresh accounts list after create/update
      // Note: AccountsPage will refresh on navigation, but we refresh here too for immediate update
      
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
        { value: 'eb', label: 'EB' },
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

  // Order options - show local orderId but store MongoDB _id
  const orderOptions = orders
    .filter(order => order.isActive !== false)
    .map(order => ({
      value: order.orderId, // Use local orderId as value for display
      label: order.orderId, // Show only the order ID
      mongoId: order._id // Store MongoDB _id separately
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

  if (loading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div className="bg-white p-4">
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
      <div className="bg-white p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Transaction Type and Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Transaction Type *
              </label>
              <Select
                options={transactionTypeOptions}
                value={formData.transactionType}
                onChange={(e) => {
                  const value = e.target.value;
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
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Select category"
                error={errors.category}
              />
            </div>
          </div>

          {/* Sub Category and Amount */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Branch *
              </label>
              <Select
                options={branchOptions}
                value={formData.branchId}
                onChange={(e) => handleInputChange('branchId', e.target.value)}
                placeholder="Select branch"
                error={errors.branchId}
                disabled={isAccountsManager}
                className={isAccountsManager ? 'opacity-60 cursor-not-allowed' : ''}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Method
              </label>
              <Select
                options={paymentMethodOptions}
                value={formData.paymentMethod}
                onChange={(e) => handleInputChange('paymentMethod', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Status
              </label>
              <Select
                options={paymentStatusOptions}
                value={formData.paymentStatus}
                onChange={(e) => {
                  handleInputChange('paymentStatus', e.target.value);
                  // Reset payment source when status changes away from completed
                  if (e.target.value !== 'completed') {
                    handleInputChange('paymentSource', 'ready_cash');
                    handleInputChange('bankAccountIndex', '');
                  }
                }}
              />
            </div>
          </div>

          {/* Payment Source Selection - Only show when payment status is 'completed' */}
          {formData.paymentStatus === 'completed' && formData.branchId && selectedBranchDetails && (() => {
            const branch = selectedBranchDetails;
            const bankAccounts = branch?.bankAccounts && Array.isArray(branch.bankAccounts) 
              ? branch.bankAccounts 
              : [];
            // Ready cash amount (defaults to 0 if not set)
            const readyCashAmount = branch?.readyCashAmount !== undefined && branch?.readyCashAmount !== null 
              ? branch.readyCashAmount 
              : 0;
            const hasBankAccounts = bankAccounts.length > 0;
            
            // Check if branch has any payment options configured
            // Show message only if readyCashAmount is not configured (undefined/null) AND no bank accounts exist
            // Note: readyCashAmount can be 0, which is still a valid configuration
            const hasReadyCashConfigured = branch?.readyCashAmount !== undefined && branch?.readyCashAmount !== null;
            const hasPaymentOptions = hasReadyCashConfigured || hasBankAccounts;

            if (!hasPaymentOptions) {
              return (
                <div className="border-t pt-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                    <p className="text-sm text-yellow-800">
                      Payment options are not available for this Branch
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      Please configure Ready Cash amount or Bank Accounts for this branch.
                    </p>
                  </div>
                </div>
              );
            }

            const readyCashDisplayAmount = readyCashAmount;

            const bankAccountOptions = bankAccounts.map((acc, index) => ({
              value: String(index),
              label: `${acc.bankName || 'Bank'} - ${acc.bankAccountNumber || 'N/A'} (Balance: ₹${(acc.accountBalance || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
            }));

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Source *
                  </label>
                  <Select
                    options={[
                      { value: 'ready_cash', label: `Ready Cash (Balance: ₹${readyCashDisplayAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})` },
                      ...(bankAccountOptions.length > 0 ? [{ value: 'bank_account', label: 'Bank Account' }] : [])
                    ]}
                    value={formData.paymentSource}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleInputChange('paymentSource', value);
                      if (value !== 'bank_account') {
                        handleInputChange('bankAccountIndex', '');
                      }
                    }}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Select from which account the amount should be {formData.transactionType === 'expense' ? 'deducted' : 'added'}
                  </p>
                </div>

                {formData.paymentSource === 'bank_account' && (() => {
                  return bankAccountOptions.length > 0 ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Bank Account *
                      </label>
                      <Select
                        options={bankAccountOptions}
                        value={formData.bankAccountIndex}
                        onChange={(e) => handleInputChange('bankAccountIndex', e.target.value)}
                        placeholder="Select Bank Account"
                      />
                    </div>
                  ) : null;
                })()}
              </div>
            );
          })()}

          {/* Reference Number and Vendor/Customer Name (single row) */}
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
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
                <Select
                  options={orderOptions}
                  value={formData.orderId}
                  onChange={(e) => {
                    const selectedOrderId = e.target.value;
                    const selectedOrder = orderOptions.find(opt => opt.value === selectedOrderId);
                    handleInputChange('orderId', selectedOrderId);
                    if (selectedOrder) {
                      handleInputChange('orderIdMongo', selectedOrder.mongoId);
                    }
                  }}
                  placeholder="Select order (optional)"
                  searchable={true}
                />
              </div>
            ) : (
              <div className="hidden md:block"></div>
            )}
          </div>

          {/* Order ID (shown separately for income transactions when customer name is also shown) */}
          {visibleFields.orderId && visibleFields.customerName && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order ID
                </label>
                <Select
                  options={orderOptions}
                  value={formData.orderId}
                  onChange={(e) => {
                    const selectedOrderId = e.target.value;
                    const selectedOrder = orderOptions.find(opt => opt.value === selectedOrderId);
                    handleInputChange('orderId', selectedOrderId);
                    if (selectedOrder) {
                      handleInputChange('orderIdMongo', selectedOrder.mongoId);
                    }
                  }}
                  placeholder="Select order (optional)"
                  searchable={true}
                />
              </div>
              <div className="hidden md:block"></div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/accounts')}
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
              {isEdit ? 'Update Account' : 'Create Account'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountFormPage;



