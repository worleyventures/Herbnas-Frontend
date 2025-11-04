import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllBranches, getActiveBranches } from '../../../redux/actions/branchActions';
import { getActiveProducts } from '../../../redux/actions/productActions';
import { getActiveHealthIssues } from '../../../redux/actions/healthActions';
import { getProfile } from '../../../redux/actions/authActions';
import { getCookie } from '../../../utils/cookieUtils';
import { 
  HiPlus, 
  HiTrash, 
  HiBell, 
  HiUser, 
  HiPhone,
  HiEnvelope,
  HiCalendar,
  HiExclamationTriangle,
  HiCheckCircle,
  HiXCircle,
  HiHeart,
  HiClipboardDocumentList
} from 'react-icons/hi2';
import { Button, Input, TextArea, Select } from '../../common';

const LeadFormSingle = ({ 
  selectedLead,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const dispatch = useDispatch();
  
  // Redux state
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { branches, loading: branchesLoading, error: branchesError } = useSelector((state) => state.branches);
  const { products, loading: productsLoading, error: productsError } = useSelector((state) => state.products);
  const { activeHealthIssues, loading: healthIssuesLoading, error: healthIssuesError } = useSelector((state) => state.health);

  // Form data state
  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    email: '',
    age: '',
    gender: '',
    maritalStatus: '',
    leadStatus: 'new_lead',
    priority: 'medium',
    leadSource: '',
    notes: '',
    reminders: [],
    healthIssues: [],
    products: [],
    branchId: '',
    assignedTo: '',
    address: {
      number: '',
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India'
    }
  });

  // Form state
  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
  
  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [newReminder, setNewReminder] = useState({
    date: getTodayDate(),
    time: '',
    ampm: 'AM',
    note: ''
  });

  // Dropdown states
  const [showHealthIssueDropdown, setShowHealthIssueDropdown] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [healthIssueSearch, setHealthIssueSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [pincodeLoading, setPincodeLoading] = useState(false);

  // Refs for dropdown containers
  const healthIssueRef = useRef(null);
  const productRef = useRef(null);

  // Initialize form data when selectedLead changes
  useEffect(() => {
    if (selectedLead && mode === 'edit') {
      // Handle products - extract IDs if they are objects
      const productIds = selectedLead.products?.map(p => 
        typeof p === 'object' ? p._id || p : p
      ).filter(Boolean) || [];
      
      // Handle dispatchedFrom (branch) - extract ID if it's an object
      let branchIdValue = '';
      if (selectedLead.dispatchedFrom) {
        if (typeof selectedLead.dispatchedFrom === 'object') {
          branchIdValue = selectedLead.dispatchedFrom._id || selectedLead.dispatchedFrom || '';
        } else {
          branchIdValue = selectedLead.dispatchedFrom;
        }
      }
      
      setFormData({
        customerName: selectedLead.customerName || '',
        mobileNumber: selectedLead.customerMobile || '',
        email: selectedLead.email || '',
        age: selectedLead.age ? String(selectedLead.age) : '',
        gender: selectedLead.gender || '',
        maritalStatus: selectedLead.maritalStatus || '',
        leadStatus: selectedLead.leadStatus || 'new_lead',
        priority: selectedLead.priority || 'medium',
        leadSource: selectedLead.leadSource || '',
        notes: selectedLead.notes || '',
        reminders: selectedLead.reminders || [],
        healthIssues: selectedLead.healthIssues || [],
        products: productIds,
        branchId: branchIdValue || '',
        assignedTo: selectedLead.assignedTo || '',
        address: {
          number: selectedLead.address?.number || '',
          street: selectedLead.address?.street || '',
          city: selectedLead.address?.city || '',
          state: selectedLead.address?.state || '',
          pinCode: selectedLead.address?.pinCode || '',
          country: selectedLead.address?.country || 'India'
        }
      });
    }
  }, [selectedLead, mode]);

  // Load data on component mount
  useEffect(() => {
    dispatch(getActiveBranches());
    dispatch(getActiveProducts());
    dispatch(getActiveHealthIssues());
  }, [dispatch]);

  // Debug: Log branches state changes
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const optionsCount = Array.isArray(branches) 
        ? branches.filter(b => b && b._id && b.branchName).length 
        : 0;
      console.log('Branches state changed:', {
        branches,
        branchesCount: Array.isArray(branches) ? branches.length : 'not an array',
        branchesLoading,
        branchesError,
        branchOptionsCount: optionsCount
      });
    }
  }, [branches, branchesLoading, branchesError]);

  // Auto-assign branch for accounts managers
  useEffect(() => {
    if (user?.role === 'accounts_manager' && user?.branch && branches.length > 0) {
      const userBranchId = user.branch?._id || user.branch;
      setFormData(prev => ({
        ...prev,
        branchId: userBranchId
      }));
    }
  }, [user, branches]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if click is outside health issue dropdown
      if (healthIssueRef.current && !healthIssueRef.current.contains(event.target)) {
        setShowHealthIssueDropdown(false);
      }
      // Check if click is outside product dropdown
      if (productRef.current && !productRef.current.contains(event.target)) {
        setShowProductDropdown(false);
      }
    };
    
    // Use click event with capture phase to handle clicks properly
    if (showHealthIssueDropdown || showProductDropdown) {
      // Use a small timeout to ensure the click event on options completes first
      const timeoutId = setTimeout(() => {
        document.addEventListener('click', handleClickOutside, true);
      }, 0);
      
      return () => {
        clearTimeout(timeoutId);
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [showHealthIssueDropdown, showProductDropdown]);

  // Status options
  const statusOptions = [
    { value: 'new_lead', label: 'New Lead' },
    { value: 'not_answered', label: 'Not Answered' },
    { value: 'qualified', label: 'Qualified' },
    { value: 'pending', label: 'Pending' },
    { value: 'order_completed', label: 'Order Completed' },
    { value: 'unqualified', label: 'Unqualified' }
  ];

  // Priority options
  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' }
  ];

  // Lead source options
  const leadSourceOptions = [
    { value: 'website', label: 'Website' },
    { value: 'social_media', label: 'Social Media' },
    { value: 'referral', label: 'Referral' },
    { value: 'advertisement', label: 'Advertisement' },
    { value: 'walk_in', label: 'Walk-in' },
    { value: 'phone_call', label: 'Phone Call' },
    { value: 'other', label: 'Other' }
  ];

  // Gender options
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  // Marital status options
  const maritalStatusOptions = [
    { value: 'Married', label: 'Married' },
    { value: 'Unmarried', label: 'Unmarried' }
  ];

  // Branch options - with debugging
  const branchOptions = useMemo(() => {
    // Debug: log branches state
    if (process.env.NODE_ENV === 'development') {
      console.log('Branches state:', { 
        branches, 
        isArray: Array.isArray(branches), 
        length: branches?.length,
        loading: branchesLoading,
        error: branchesError
      });
    }
    
    if (!Array.isArray(branches)) {
      return [];
    }
    
    if (branches.length === 0) {
      return [];
    }
    
    return branches
      .filter(branch => branch && branch._id && branch.branchName)
      .map(branch => ({
        value: branch._id,
        label: `${branch.branchName} (${branch.branchCode || ''})`.trim()
      }));
  }, [branches, branchesLoading]);

  // Health issues from API
  const allHealthIssues = activeHealthIssues.length > 0 
    ? activeHealthIssues.map(issue => issue.healthIssue)
    : [
        'Diabetes Management',
        'Digestive Disorders',
        'Stress and Anxiety',
        'Skin Problems',
        'Joint Pain and Arthritis'
      ];

  // Filtered health issues - show all if search is empty, otherwise filter
  const filteredHealthIssues = healthIssueSearch.trim() === ''
    ? allHealthIssues
    : allHealthIssues.filter(issue =>
        issue.toLowerCase().includes(healthIssueSearch.toLowerCase())
      );

  // Filtered products - show all if search is empty, otherwise filter
  // Ensure we're working with an array and filter out any null/undefined products
  const validProducts = Array.isArray(products) 
    ? products.filter(product => product && product._id && product.productName)
    : [];
  
  const filteredProducts = productSearch.trim() === ''
    ? validProducts
    : validProducts.filter(product =>
        product.productName?.toLowerCase().includes(productSearch.toLowerCase())
      );
  
  // Debug logging in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('Products state:', {
        products,
        productsType: typeof products,
        isArray: Array.isArray(products),
        productsLength: Array.isArray(products) ? products.length : 'not an array',
        validProductsLength: validProducts.length,
        productsLoading,
        productsError
      });
    }
  }, [products, productsLoading, productsError, validProducts.length]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (address)
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
      
      // Auto-fetch city and state when pinCode is entered
      if (field === 'pinCode' && value.length === 6) {
        handlePincodeLookup(value);
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

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
          address: {
            ...prev.address,
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

  // Handle reminder changes
  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Format reminder datetime for API
  const formatReminderDateTimeForAPI = (date, time, ampm) => {
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const datetime = new Date(date);
    datetime.setHours(hour24, parseInt(minutes), 0, 0);
    
    return datetime.toISOString();
  };

  // State to control visibility of reminder input fields
  const [showReminderFields, setShowReminderFields] = useState(false);

  // Initialize showReminderFields based on mode and existing reminders
  useEffect(() => {
    if (mode === 'edit' && formData.reminders && formData.reminders.length > 0) {
      setShowReminderFields(true);
    } else if (mode === 'create') {
      setShowReminderFields(false);
    }
  }, [mode, formData.reminders]);

  // Toggle reminder fields visibility
  const handleToggleReminderFields = () => {
    setShowReminderFields(prev => !prev);
  };

  // Add reminder
  const handleAddReminder = () => {
    if (newReminder.date && newReminder.time && newReminder.note) {
      const reminder = {
        id: Date.now(),
        date: formatReminderDateTimeForAPI(newReminder.date, newReminder.time, newReminder.ampm),
        note: newReminder.note
      };
      
      setFormData(prev => ({
        ...prev,
        reminders: [...prev.reminders, reminder]
      }));
      
      setNewReminder({
        date: '',
        time: '',
        ampm: 'AM',
        note: ''
      });
    }
  };

  // Remove reminder
  const handleRemoveReminder = (reminderId) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== reminderId)
    }));
  };

  // Add health issue
  const handleAddHealthIssue = (healthIssue) => {
    if (!formData.healthIssues.includes(healthIssue)) {
      setFormData(prev => ({
        ...prev,
        healthIssues: [...prev.healthIssues, healthIssue]
      }));
    }
    setHealthIssueSearch('');
    setShowHealthIssueDropdown(false);
  };

  // Remove health issue
  const handleRemoveHealthIssue = (healthIssue) => {
    setFormData(prev => ({
      ...prev,
      healthIssues: prev.healthIssues.filter(issue => issue !== healthIssue)
    }));
  };

  // Add product
  const handleAddProduct = (product) => {
    if (!formData.products.find(p => p._id === product._id)) {
      setFormData(prev => ({
        ...prev,
        products: [...prev.products, product]
      }));
    }
    setProductSearch('');
    setShowProductDropdown(false);
  };

  // Remove product
  const handleRemoveProduct = (productId) => {
    setFormData(prev => ({
      ...prev,
      products: prev.products.filter(product => product._id !== productId)
    }));
  };

  // Format reminder for display
  const formatReminderDateTime = (datetimeString) => {
    const date = new Date(datetimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^\d{10}$/.test(formData.mobileNumber.replace(/\D/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setHasAttemptedSubmit(true);

    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const submitData = {
      ...formData,
      mobileNumber: formData.mobileNumber.replace(/\D/g, '') // Remove non-digits
    };

    onSubmit(submitData);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Form Content */}
      <div className="flex-1 px-6 py-4 bg-white overflow-y-auto">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 min-h-0 space-y-8">
            
            {/* Customer Name and Mobile Number - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Customer Name */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <HiUser className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Customer Name</h4>
                    <p className="text-sm text-gray-600">Enter the customer's full name</p>
                  </div>
                </div>
                
                <Input
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  icon={HiUser}
                />
              </div>

              {/* Mobile Number */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <HiPhone className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Mobile Number</h4>
                    <p className="text-sm text-gray-600">Enter the customer's mobile number</p>
                  </div>
                </div>
                
                <Input
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  error={hasAttemptedSubmit && errors.mobileNumber}
                  errorMessage={errors.mobileNumber}
                  icon={HiPhone}
                  required
                />
              </div>
            </div>

            {/* Age, Gender, Marital Status - Only in edit mode */}
            {mode === 'edit' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age
                  </label>
                  <Input
                    name="age"
                    value={formData.age}
                    onChange={handleInputChange}
                    placeholder="Enter age"
                    type="number"
                    min="1"
                    max="150"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender
                  </label>
                  <Select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    options={genderOptions}
                    placeholder="Select gender"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Marital Status
                  </label>
                  <Select
                    name="maritalStatus"
                    value={formData.maritalStatus}
                    onChange={handleInputChange}
                    options={maritalStatusOptions}
                    placeholder="Select marital status"
                  />
                </div>
              </div>
            )}

            {/* Address - Only in edit mode */}
            {mode === 'edit' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-teal-100 rounded-xl flex items-center justify-center">
                  <HiClipboardDocumentList className="h-5 w-5 text-teal-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Address</h4>
                  <p className="text-sm text-gray-600">Enter customer address details</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    House/Flat Number
                  </label>
                  <Input
                    name="address.number"
                    value={formData.address.number}
                    onChange={handleInputChange}
                    placeholder="Enter house/flat number"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <Input
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    placeholder="Enter street address"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pincode
                    {pincodeLoading && <span className="ml-2 text-xs text-blue-600">Fetching...</span>}
                  </label>
                  <Input
                    name="address.pinCode"
                    value={formData.address.pinCode}
                    onChange={handleInputChange}
                    placeholder="Enter 6-digit pincode"
                    type="text"
                    maxLength="6"
                    pattern="[0-9]{6}"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <Input
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    placeholder="City (auto-filled from pincode)"
                    readOnly={!!formData.address.pinCode && formData.address.pinCode.length === 6}
                    className={formData.address.pinCode && formData.address.pinCode.length === 6 ? 'bg-gray-50' : ''}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    name="address.state"
                    value={formData.address.state}
                    onChange={handleInputChange}
                    placeholder="State (auto-filled from pincode)"
                    readOnly={!!formData.address.pinCode && formData.address.pinCode.length === 6}
                    className={formData.address.pinCode && formData.address.pinCode.length === 6 ? 'bg-gray-50' : ''}
                  />
                </div>
              </div>
            </div>
            )}

            {/* Lead Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                  <HiClipboardDocumentList className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">Lead Information</h4>
                  <p className="text-sm text-gray-600">Basic lead details and status</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email address"
                    error={hasAttemptedSubmit && errors.email}
                    errorMessage={errors.email}
                    icon={HiEnvelope}
                    type="email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Status
                  </label>
                  <Select
                    name="leadStatus"
                    value={formData.leadStatus}
                    onChange={handleInputChange}
                    options={statusOptions}
                    placeholder="Select lead status"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    options={priorityOptions}
                    placeholder="Select priority"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lead Source
                  </label>
                  <Select
                    name="leadSource"
                    value={formData.leadSource}
                    onChange={handleInputChange}
                    options={leadSourceOptions}
                    placeholder="Select lead source"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch
                  </label>
                  <Select
                    name="branchId"
                    value={formData.branchId}
                    onChange={handleInputChange}
                    options={branchOptions}
                    placeholder={branchesLoading ? 'Loading branches...' : branchOptions.length === 0 ? 'No branches available' : 'Select branch'}
                    disabled={user?.role === 'accounts_manager' || branchesLoading}
                    loading={branchesLoading}
                    emptyMessage="No active branches available"
                    className={user?.role === 'accounts_manager' ? 'opacity-60 cursor-not-allowed' : ''}
                  />
                  {user?.role === 'accounts_manager' && (
                    <p className="mt-1 text-sm text-gray-500">
                      Branch is automatically set to your assigned branch
                    </p>
                  )}
                  {user?.role !== 'accounts_manager' && branchesLoading && (
                    <p className="mt-1 text-xs text-gray-500">Loading branches...</p>
                  )}
                  {user?.role !== 'accounts_manager' && !branchesLoading && branchOptions.length === 0 && !branchesError && (
                    <p className="mt-1 text-xs text-yellow-600">No active branches found. Please create a branch first.</p>
                  )}
                  {branchesError && (
                    <div className="mt-1">
                      <p className="text-xs text-red-600 mb-1">
                        {branchesError}
                      </p>
                      <button 
                        type="button"
                        onClick={() => {
                          dispatch(getActiveBranches());
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 underline hover:no-underline font-medium"
                      >
                        Click to Retry
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Notes Field - Full Width */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <TextArea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Enter additional notes"
                  rows={3}
                />
              </div>
            </div>

            {/* Reminders - Input Fields - Only show when showReminderFields is true */}
            {showReminderFields && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                    <HiBell className="h-5 w-5 text-yellow-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Reminders</h4>
                    <p className="text-sm text-gray-600">Set follow-up reminders and notes</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <Input
                      name="date"
                      value={newReminder.date}
                      onChange={handleReminderChange}
                      placeholder="dd-mm-yyyy"
                      type="date"
                      icon={HiCalendar}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                    <Input
                      name="time"
                      value={newReminder.time}
                      onChange={handleReminderChange}
                      placeholder="--:--"
                      type="time"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">AM/PM</label>
                    <Select
                      name="ampm"
                      value={newReminder.ampm}
                      onChange={handleReminderChange}
                      options={[
                        { value: 'AM', label: 'AM' },
                        { value: 'PM', label: 'PM' }
                      ]}
                    />
                  </div>
                </div>
                
                {/* Reminder Note */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reminder Note</label>
                  <TextArea
                    name="note"
                    value={newReminder.note}
                    onChange={handleReminderChange}
                    placeholder="Enter reminder note..."
                    rows={2}
                  />
                </div>

                {/* Add Reminder Button */}
                <div className="flex justify-end">
                  <Button
                    type="button"
                    onClick={handleAddReminder}
                    disabled={!newReminder.date || !newReminder.time || !newReminder.note}
                    size="sm"
                  >
                    Add Reminder
                  </Button>
                </div>

                {/* Existing Reminders */}
                {formData.reminders.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-900">Existing Reminders</h5>
                    {formData.reminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {formatReminderDateTime(reminder.date)}
                          </p>
                          <p className="text-sm text-gray-600">{reminder.note}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveReminder(reminder.id)}
                          className="text-red-500 hover:text-red-700 transition-colors"
                        >
                          <HiTrash className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Existing Reminders - Show even when fields are hidden */}
            {!showReminderFields && formData.reminders.length > 0 && (
              <div className="space-y-2">
                <h5 className="text-sm font-medium text-gray-900">Existing Reminders</h5>
                {formData.reminders.map((reminder) => (
                  <div key={reminder.id} className="flex items-center justify-between bg-white p-3 border border-gray-200 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatReminderDateTime(reminder.date)}
                      </p>
                      <p className="text-sm text-gray-600">{reminder.note}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveReminder(reminder.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Health Issues and Products - Side by Side - Only in edit mode */}
            {mode === 'edit' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Health Issues */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
                    <HiHeart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Health Issues</h4>
                    <p className="text-sm text-gray-600">Select relevant health conditions</p>
                  </div>
                </div>

                {/* Add Health Issue */}
                <div className="relative" ref={healthIssueRef}>
                  <Input
                    value={healthIssueSearch}
                    onChange={(e) => {
                      setHealthIssueSearch(e.target.value);
                      setShowHealthIssueDropdown(true);
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      setShowHealthIssueDropdown(true);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowHealthIssueDropdown(true);
                    }}
                    placeholder="Search and select health issues..."
                  />
                  
                  {showHealthIssueDropdown && (
                    <div 
                      className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filteredHealthIssues.length > 0 ? (
                        filteredHealthIssues.map((issue) => (
                          <button
                            key={issue}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddHealthIssue(issue);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                          >
                            {issue}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {healthIssueSearch ? `No health issues found matching "${healthIssueSearch}"` : 'No health issues available'}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Health Issues */}
                {formData.healthIssues.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.healthIssues.map((issue) => (
                      <div key={issue} className="flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                        <span>{issue}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveHealthIssue(issue)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <HiXCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Products */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <HiClipboardDocumentList className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Products</h4>
                    <p className="text-sm text-gray-600">Select relevant products</p>
                  </div>
                </div>

                {/* Add Product */}
                <div className="relative" ref={productRef}>
                  <Input
                    value={productSearch}
                    onChange={(e) => {
                      setProductSearch(e.target.value);
                      setShowProductDropdown(true);
                    }}
                    onFocus={(e) => {
                      e.stopPropagation();
                      setShowProductDropdown(true);
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowProductDropdown(true);
                    }}
                    placeholder="Search and select products..."
                  />
                  
                  {showProductDropdown && (
                    <div 
                      className="absolute z-[100] w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                      onClick={(e) => e.stopPropagation()}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => (
                          <button
                            key={product._id}
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleAddProduct(product);
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 focus:outline-none focus:bg-gray-100 transition-colors"
                          >
                            {product.productName}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 text-center">
                          {productsLoading ? (
                            <div className="flex items-center justify-center space-x-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                              <span>Loading products...</span>
                            </div>
                          ) : productsError ? (
                            <div>
                              <p className="text-red-600 mb-1">{productsError}</p>
                              <button 
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  dispatch(getActiveProducts());
                                }}
                                className="text-xs text-blue-600 hover:text-blue-800 underline"
                              >
                                Click to Retry
                              </button>
                            </div>
                          ) : productSearch ? (
                            `No products found matching "${productSearch}"`
                          ) : (
                            'No products available'
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Selected Products */}
                {formData.products.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {formData.products.map((product) => (
                      <div key={product._id} className="flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                        <span>{product.productName}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveProduct(product._id)}
                          className="text-indigo-600 hover:text-indigo-800"
                        >
                          <HiXCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleToggleReminderFields}
              icon={HiPlus}
              disabled={loading}
            >
              {showReminderFields ? 'Hide Reminders' : 'Add Reminders'}
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              disabled={loading}
            >
              {mode === 'create' ? 'Create Lead' : 'Update Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormSingle;
