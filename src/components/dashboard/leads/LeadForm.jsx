import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllBranches, getActiveBranches } from '../../../redux/actions/branchActions';
import { getAllUsers } from '../../../redux/actions/userActions';
import { getActiveProducts } from '../../../redux/actions/productActions';
import { 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiBell, 
  HiUser, 
  HiBuildingOffice2,
  HiPhone,
  HiEnvelope,
  HiCalendar,
  HiExclamationTriangle,
  HiCheckCircle,
  HiXCircle,
  HiXMark,
  HiCheck,
  HiCreditCard
} from 'react-icons/hi2';

const LeadForm = ({ 
  selectedLead,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const dispatch = useDispatch();
  const { isAuthenticated = false, user = null } = useSelector(state => state.auth || {});
  const { branches = [], loading: branchesLoading = false, error: branchesError = null } = useSelector(state => state.branches || {});
  const { users = [], loading: usersLoading = false } = useSelector(state => state.user || {});
  const { products = [], loading: productsLoading = false } = useSelector(state => state.products || {});

  const [formData, setFormData] = useState({
    // Basic Lead Information
    leadDate: new Date().toISOString().split('T')[0],
    leadStatus: 'new_lead',
    priority: 'medium',
    notes: '',
  
    // Customer Contact Information
    customerName: '',
    customerMobile: '',
    customerEmail: '',
    
    // Address Information
    address: {
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India'
    },
    
    // Personal Information
    age: '',
    gender: '',
    maritalStatus: '',
    
    // Health Information
    healthIssues: [],
    
    // Products
    products: [],
    
    // Payment Information
    payment: {
      paymentType: 'prepaid',
      paymentMode: 'gpay',
      paymentDate: new Date().toISOString().split('T')[0],
      paymentNote: ''
    },
    
    // Branch and User Assignment
    dispatchedFrom: '',
    assignedUser: '',
    
    // Reminders
    reminders: []
  });

  const [errors, setErrors] = useState({});
  const [productSearch, setProductSearch] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [healthIssueSearch, setHealthIssueSearch] = useState('');
  const [showHealthIssueDropdown, setShowHealthIssueDropdown] = useState(false);
  const [newReminder, setNewReminder] = useState({ 
    date: '', 
    time: '', 
    ampm: 'AM', 
    note: '' 
  });
  
  // Search states for branch and user
  const [branchSearch, setBranchSearch] = useState('');
  const [showBranchDropdown, setShowBranchDropdown] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Load data on component mount - but don't block form rendering
  useEffect(() => {
    if (isAuthenticated && user) {
      // Always try to load data, but don't wait for it
      dispatch(getAllBranches());
      dispatch(getActiveBranches());
      dispatch(getAllUsers());
      dispatch(getActiveProducts());
    }
  }, [dispatch, isAuthenticated, user]);

  // Filter branches based on search
  const filteredBranches = useMemo(() => {
    if (!branchSearch) {
      return branches;
    }
    return branches.filter(branch => 
      branch.branchName.toLowerCase().includes(branchSearch.toLowerCase())
    );
  }, [branches, branchSearch]);

  // Get all users in the selected branch (for validation)
  const branchUsers = useMemo(() => {
    if (!formData.dispatchedFrom) {
      return [];
    }
    
    return users.filter(user => {
      // Handle both populated branch object and branch ID
      const userBranchId = user.branch?._id || user.branch;
      return userBranchId === formData.dispatchedFrom;
    });
  }, [users, formData.dispatchedFrom]);

  // Filter users based on selected branch and search
  const filteredUsers = useMemo(() => {
    if (!formData.dispatchedFrom) {
      return [];
    }
    
    let branchUsers = users.filter(user => {
      // Handle both populated branch object and branch ID
      const userBranchId = user.branch?._id || user.branch;
      return userBranchId === formData.dispatchedFrom;
    });
    
    // Apply search filter if user is searching
    if (userSearch) {
      branchUsers = branchUsers.filter(user => 
        `${user.firstName} ${user.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
        user.role.toLowerCase().includes(userSearch.toLowerCase())
      );
    }
    
    return branchUsers;
  }, [users, formData.dispatchedFrom, userSearch]);

  // Clear assigned user when branch changes
  useEffect(() => {
    if (formData.dispatchedFrom && formData.assignedUser) {
      const selectedUser = users.find(user => user._id === formData.assignedUser);
      if (selectedUser) {
        const userBranchId = selectedUser.branch?._id || selectedUser.branch;
        if (userBranchId !== formData.dispatchedFrom) {
          setFormData(prev => ({
            ...prev,
            assignedUser: ''
          }));
        }
      }
    }
  }, [formData.dispatchedFrom, formData.assignedUser, users]);

  // Helper function to format role names
  const formatRoleName = (role) => {
    const roleMap = {
      'sales_executive': 'Sales Executive',
      'admin': 'Admin',
      'super_admin': 'Super Admin',
      'supervisor': 'Supervisor',
      'production_manager': 'Production Manager',
      'accounts_manager': 'Accounts Manager'
    };
    return roleMap[role] || role;
  };

  // Handle branch selection
  const handleBranchSelect = (branch) => {
    console.log('Branch selected:', branch);
    setFormData(prev => ({
      ...prev,
      dispatchedFrom: branch._id
    }));
    setBranchSearch(branch.branchName);
    setShowBranchDropdown(false);
    console.log('Branch selection completed');
    // Clear user selection when branch changes
    setFormData(prev => ({
      ...prev,
      assignedUser: ''
    }));
    setUserSearch('');
  };

  // Handle user selection
  const handleUserSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      assignedUser: user._id
    }));
    setUserSearch(`${user.firstName} ${user.lastName} - ${formatRoleName(user.role)}`);
    setShowUserDropdown(false);
  };

  // Get selected branch name for display
  const getSelectedBranchName = () => {
    if (!formData.dispatchedFrom) return '';
    const branch = branches.find(b => b._id === formData.dispatchedFrom);
    return branch ? branch.branchName : '';
  };

  // Get selected user name for display
  const getSelectedUserName = () => {
    if (!formData.assignedUser) return '';
    const user = users.find(u => u._id === formData.assignedUser);
    return user ? `${user.firstName} ${user.lastName} - ${formatRoleName(user.role)}` : '';
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      console.log('Click outside detected, target:', event.target);
      if (showProductDropdown && !event.target.closest('.product-dropdown-container')) {
        console.log('Closing product dropdown');
        setShowProductDropdown(false);
      }
      if (showHealthIssueDropdown && !event.target.closest('.health-issue-dropdown-container')) {
        console.log('Closing health issue dropdown');
        setShowHealthIssueDropdown(false);
      }
      if (showBranchDropdown && !event.target.closest('.branch-dropdown-container')) {
        console.log('Closing branch dropdown');
        setShowBranchDropdown(false);
      }
      if (showUserDropdown && !event.target.closest('.user-dropdown-container')) {
        console.log('Closing user dropdown');
        setShowUserDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showProductDropdown, showHealthIssueDropdown, showBranchDropdown, showUserDropdown]);

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
  }, []);

  // Populate form when editing
  useEffect(() => {
    if (selectedLead && mode === 'edit') {
      setFormData({
        // Basic Lead Information
        leadDate: selectedLead.leadDate ? selectedLead.leadDate.split('T')[0] : new Date().toISOString().split('T')[0],
        leadStatus: selectedLead.leadStatus || 'new_lead',
        priority: selectedLead.priority || 'medium',
        notes: selectedLead.notes || '',
        
        // Customer Contact Information
        customerName: selectedLead.customerName || '',
        customerMobile: selectedLead.customerMobile || '',
        customerEmail: selectedLead.customerEmail || '',
        
        // Address Information
        address: {
          street: selectedLead.address?.street || '',
          city: selectedLead.address?.city || '',
          state: selectedLead.address?.state || '',
          pinCode: selectedLead.address?.pinCode || '',
          country: selectedLead.address?.country || 'India'
        },
        
        // Personal Information
        age: selectedLead.age || '',
        gender: selectedLead.gender || '',
        maritalStatus: selectedLead.maritalStatus || '',
        
        // Health Information
        healthIssues: selectedLead.healthIssues || [],
        
        // Products - extract IDs from populated products
        products: selectedLead.products ? selectedLead.products.map(p => p._id || p) : [],
        
        // Payment Information
        payment: {
          paymentType: selectedLead.payment?.paymentType || 'prepaid',
          paymentMode: selectedLead.payment?.paymentMode || 'gpay',
          paymentDate: selectedLead.payment?.paymentDate ? selectedLead.payment.paymentDate.split('T')[0] : new Date().toISOString().split('T')[0],
          paymentNote: selectedLead.payment?.paymentNote || ''
        },
        
        // Branch and User Assignment
        dispatchedFrom: selectedLead.dispatchedFrom?._id || selectedLead.dispatchedFrom || '',
        assignedUser: selectedLead.assignedUser?._id || selectedLead.assignedUser || '',
        
        // Reminders
        reminders: selectedLead.reminders || []
      });
      
      // Set search values for display
      if (selectedLead.dispatchedFrom) {
        const branch = branches.find(b => b._id === (selectedLead.dispatchedFrom?._id || selectedLead.dispatchedFrom));
        if (branch) {
          setBranchSearch(branch.branchName);
        }
      }
      
      if (selectedLead.assignedUser) {
        const user = users.find(u => u._id === (selectedLead.assignedUser?._id || selectedLead.assignedUser));
        if (user) {
          setUserSearch(`${user.firstName} ${user.lastName} - ${formatRoleName(user.role)}`);
        }
      }
    }
  }, [selectedLead, mode, branches, users]);

  const statusOptions = [
    { value: 'new_lead', label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
    { value: 'not_answered', label: 'Not Answered', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
    { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
    { value: 'order_completed', label: 'Order Completed', color: 'bg-[#22c55e]-100 text-[#22c55e]-800' },
    { value: 'unqualified', label: 'Unqualified', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const maritalStatusOptions = [
    { value: 'Married', label: 'Married' },
    { value: 'Unmarried', label: 'Unmarried' }
  ];

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

  // Health issues data
  const allHealthIssues = [
    'Diabetes',
    'Hypertension',
    'Heart Disease',
    'Arthritis',
    'Obesity',
    'Thyroid',
    'Asthma',
    'Depression',
    'Anxiety',
    'Migraine',
    'High Cholesterol',
    'Kidney Disease',
    'Liver Disease',
    'Osteoporosis',
    'Epilepsy',
    'Other'
  ];

  // Function to filter health issues based on search
  const filteredHealthIssues = allHealthIssues.filter(issue =>
    issue.toLowerCase().includes(healthIssueSearch.toLowerCase())
  );

  // Get available products from Redux or fallback
  const fallbackProducts = [
    { _id: '1', name: 'Ayurvedic Consultation', price: 500 },
    { _id: '2', name: 'Panchakarma Treatment', price: 2000 },
    { _id: '3', name: 'Herbal Medicine', price: 300 },
    { _id: '4', name: 'Yoga Classes', price: 800 },
    { _id: '5', name: 'Diet Consultation', price: 400 }
  ];

  const availableProducts = (products && products.length > 0) ? products : fallbackProducts;

  // Function to filter products based on search
  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );
  

  // Helper function to format datetime for display (12-hour format)
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

  // Helper function to format datetime for API (24-hour format)
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (address, payment)
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [field]: value
        }
      }));
    } else if (name.startsWith('payment.')) {
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
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addReminder = () => {
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
      
      setNewReminder({ date: '', time: '', ampm: 'AM', note: '' });
    }
  };

  const removeReminder = (reminderId) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== reminderId)
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }
    
    if (!formData.customerMobile.trim()) {
      newErrors.customerMobile = 'Customer mobile is required';
    }
    
    if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }
    
    if (!formData.dispatchedFrom) {
      newErrors.dispatchedFrom = 'Please assign a branch';
    }
    
    if (!formData.assignedUser) {
      if (!formData.dispatchedFrom) {
        newErrors.assignedUser = 'Please select a branch first';
      } else if (branchUsers.length === 0) {
        newErrors.assignedUser = 'No users available in the selected branch';
      } else {
      newErrors.assignedUser = 'Please assign a user';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const resetForm = () => {
    setFormData({
      leadDate: new Date().toISOString().split('T')[0],
      leadStatus: 'new_lead',
      priority: 'medium',
      notes: '',
      customerName: '',
      customerMobile: '',
      customerEmail: '',
      address: {
        street: '',
        city: '',
        state: '',
        pinCode: '',
        country: 'India'
      },
      age: '',
      gender: '',
      maritalStatus: '',
      healthIssues: [],
      products: [],
      payment: {
        paymentType: 'prepaid',
        paymentMode: 'gpay',
        paymentDate: new Date().toISOString().split('T')[0],
        paymentNote: ''
      },
      dispatchedFrom: '',
      assignedUser: '',
      reminders: []
    });
    setErrors({});
    setProductSearch('');
    setHealthIssueSearch('');
    setNewReminder({ date: '', time: '', ampm: 'AM', note: '' });
    setBranchSearch('');
    setUserSearch('');
    setShowBranchDropdown(false);
    setShowUserDropdown(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-b-2xl shadow-2xl">
        <div className="p-6 space-y-6" style={{overflow: 'visible'}}>
          {/* Basic Lead Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-10">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200/50">
              <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <HiUser className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Basic Lead Information</h4>
                <p className="text-sm text-gray-500">Essential lead details and status</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Date *
                </label>
                <input
                  type="date"
                  name="leadDate"
                  value={formData.leadDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lead Status *
                </label>
                <select
                  name="leadStatus"
                  value={formData.leadStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  {priorityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                placeholder="Additional notes about this lead..."
                className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md resize-none"
              />
            </div>
          </div>

           {/* Reminders */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-10">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200/50">
              <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center">
                <HiBell className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Reminders</h4>
                <p className="text-sm text-gray-500">Set follow-up reminders and notes</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newReminder.date}
                    onChange={handleReminderChange}
                    className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={newReminder.time}
                    onChange={handleReminderChange}
                    className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AM/PM
                  </label>
                  <select
                    name="ampm"
                    value={newReminder.ampm}
                    onChange={handleReminderChange}
                    className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
                
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={addReminder}
                    className="w-full px-4 py-3 text-white rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                    style={{backgroundColor: '#22c55e'}}
                  >
                    <HiPlus className="h-4 w-4" />
                    <span>Add Reminder</span>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Note
                </label>
                <input
                  type="text"
                  name="note"
                  value={newReminder.note}
                  onChange={handleReminderChange}
                  placeholder="Enter reminder note..."
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
              
              {formData.reminders.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium text-gray-700">Scheduled Reminders:</h5>
                  {formData.reminders.map(reminder => (
                    <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <HiBell className="h-4 w-4 text-yellow-600" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">{reminder.note}</p>
                          <p className="text-xs text-gray-500">{formatReminderDateTime(reminder.date)}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeReminder(reminder.id)}
                        className="text-red-600 hover:text-red-800 p-1"
                      >
                        <HiTrash className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Customer Contact Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-10">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200/50">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#22c55e20'}}>
                <HiPhone className="h-5 w-5" style={{color: '#22c55e'}} />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Customer Contact Information</h4>
                <p className="text-sm text-gray-500">Customer details and contact information</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name *
                </label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="Enter customer name"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
                    errors.customerName ? 'border-red-500' : 'border-gray-300/50'
                  }`}
                />
                {errors.customerName && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mobile Number *
                </label>
                <input
                  type="tel"
                  name="customerMobile"
                  value={formData.customerMobile}
                  onChange={handleInputChange}
                  placeholder="Enter mobile number"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
                    errors.customerMobile ? 'border-red-500' : 'border-gray-300/50'
                  }`}
                />
                {errors.customerMobile && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerMobile}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
                    errors.customerEmail ? 'border-red-500' : 'border-gray-300/50'
                  }`}
                />
                {errors.customerEmail && (
                  <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Age
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  placeholder="Enter age"
                  min="1"
                  max="120"
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <option value="">Select Gender</option>
                  {genderOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marital Status
                </label>
                <select
                  name="maritalStatus"
                  value={formData.maritalStatus}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                >
                  <option value="">Select Marital Status</option>
                  {maritalStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Street Address
              </label>
              <textarea
                name="address.street"
                value={formData.address.street}
                onChange={handleInputChange}
                rows={2}
                placeholder="Enter street address"
                className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md resize-none"
              />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pin Code
                </label>
                <input
                  type="text"
                  name="address.pinCode"
                  value={formData.address.pinCode}
                  onChange={handleInputChange}
                  placeholder="Enter pin code"
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  placeholder="Enter country"
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
              </div>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-60" style={{overflow: 'visible'}}>
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200/50">
              <div className="h-10 w-10 bg-red-100 rounded-xl flex items-center justify-center">
                <HiExclamationTriangle className="h-5 w-5 text-red-600" />
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
              <div className="relative health-issue-dropdown-container z-[110]" style={{ zIndex: 99999 }}>
                <input
                  type="text"
                  value={healthIssueSearch}
                  onChange={(e) => {
                    setHealthIssueSearch(e.target.value);
                    setShowHealthIssueDropdown(true);
                  }}
                  onFocus={() => setShowHealthIssueDropdown(true)}
                  placeholder="Search health issues..."
                  className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
                />
                {showHealthIssueDropdown && (
                  <div className="absolute z-[99999] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
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
                    {filteredHealthIssues.length > 0 ? (
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
                        {healthIssueSearch ? 'No health issues found' : 'Start typing to search health issues...'}
                      </div>
                    )}
                    {filteredHealthIssues.length > 5 && (
                      <div className="px-4 py-2 text-xs text-gray-400 text-center border-t border-gray-100">
                        Scroll to see more health issues
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
          </div>

          {/* Products & Services */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-40" style={{overflow: 'visible'}}>
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200/50">
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
              <div className="relative product-dropdown-container z-50" style={{ zIndex: 99998 }}>
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setShowProductDropdown(true);
                  }}
                  onFocus={() => setShowProductDropdown(true)}
                  placeholder="Search products..."
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
                    showProductDropdown 
                      ? 'border-[#22c55e] ring-2 ring-[#22c55e]' 
                      : 'border-gray-300/50'
                  }`}
                />
                {showProductDropdown && (
                  <div className="absolute z-[99998] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-48 overflow-y-auto">
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
                            // Keep dropdown open for multiple selections
                            // setShowProductDropdown(false);
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={formData.products.includes(product._id)}
                            onChange={() => {}} // Handled by parent onClick
                            className="h-4 w-4 text-[#22c55e] focus:ring-[#22c55e] border-gray-300 rounded mr-2"
                          />
                          <span className="text-sm text-gray-900">{product.name}</span>
                          {product.price && (
                            <span className="ml-auto text-xs text-gray-500">₹{product.price}</span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-gray-500 text-center text-sm">
                        {productSearch ? 'No products found' : 'Start typing to search products...'}
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
                          {product.name}
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
                      ) : null;
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
            </div>
          </div>

          {/* Payment Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-30">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200/50">
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
          </div>

          {/* Assignment Information */}
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow duration-200 relative z-20" style={{overflow: 'visible'}}>
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-200/50">
              <div className="h-10 w-10 bg-orange-100 rounded-xl flex items-center justify-center">
                <HiBuildingOffice2 className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Assignment Information</h4>
                <p className="text-sm text-gray-500">Assign lead to branch and user</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Branch option clicked:', branch);
                              handleBranchSelect(branch);
                            }}
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
            
              <div className="user-dropdown-container">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assign to User *
                  </label>
                <div className="relative">
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => {
                      setUserSearch(e.target.value);
                      setShowUserDropdown(true);
                    }}
                    onFocus={() => {
                      if (formData.dispatchedFrom) {
                        setShowUserDropdown(true);
                      }
                    }}
                    placeholder={!formData.dispatchedFrom ? 'Select a branch first' :
                               usersLoading ? 'Loading users...' :
                               branchUsers.length === 0 ? 'No users in this branch' :
                               'Search users...'}
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
                      errors.assignedUser ? 'border-red-500' : 'border-gray-300/50'
                    }`}
                    disabled={!formData.dispatchedFrom || usersLoading}
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </div>
                
                  {showUserDropdown && formData.dispatchedFrom && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                      {filteredUsers.length === 0 ? (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          {userSearch ? 'No users found matching your search' : 'No users in this branch'}
                </div>
                      ) : (
                        filteredUsers.map(user => (
                          <div
                            key={user._id}
                            onClick={() => handleUserSelect(user)}
                            className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="flex items-center">
                              <HiUser className="h-4 w-4 text-gray-400 mr-3" />
              <div>
                                <span className="text-sm font-medium text-gray-900">
                                  {user.firstName} {user.lastName}
                                </span>
                                <span className="text-xs text-gray-500 ml-2">
                                  {formatRoleName(user.role)}
                                </span>
              </div>
                        </div>
                      </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
                {errors.assignedUser && (
                  <p className="mt-1 text-sm text-red-600">{errors.assignedUser}</p>
                )}
                {formData.dispatchedFrom && branchUsers.length === 0 && !usersLoading && !formData.assignedUser && (
                  <p className="mt-1 text-sm text-amber-600">
                    No users found in the selected branch. Please add users to this branch first.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onCancel}
              className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent transition-all duration-200 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] shadow-md hover:shadow-lg text-xs font-medium"
            >
              {loading && (
                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
              )}
              <span>{mode === 'edit' ? 'Update Lead' : 'Create Lead'}</span>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LeadForm;

