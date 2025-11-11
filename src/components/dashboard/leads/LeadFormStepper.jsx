import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getAllBranches, getActiveBranches } from '../../../redux/actions/branchActions';
import { getActiveProducts } from '../../../redux/actions/productActions';
import { getActiveHealthIssues } from '../../../redux/actions/healthActions';
import { getProfile } from '../../../redux/actions/authActions';
import { getCookie } from '../../../utils/cookieUtils';
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
  HiCreditCard,
  HiChevronLeft,
  HiChevronRight,
  HiClipboardDocumentList,
  HiHeart,
  HiCurrencyDollar
} from 'react-icons/hi2';
import { Stepper, MaterialStepper } from '../../common';
import BasicInfoStep from './steps/BasicInfoStep';
import RemindersStep from './steps/RemindersStep';
import CustomerDetailsStep from './steps/CustomerDetailsStep';
import HealthProductsStep from './steps/HealthProductsStep';
import PaymentAssignmentStep from './steps/PaymentAssignmentStep';

const LeadFormStepper = ({ 
  selectedLead,
  onSubmit,
  onCancel,
  loading = false,
  mode = 'create' // 'create' or 'edit'
}) => {
  const dispatch = useDispatch();
  const authState = useSelector(state => state.auth || {});
  const { isAuthenticated = false, user = null } = authState;
  
  // Fallback: Try to get user from localStorage if Redux user is null
  const fallbackUser = React.useMemo(() => {
    if (!user) {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
          return JSON.parse(storedUser);
        }
      } catch (error) {
        console.error('Error parsing user from localStorage:', error);
      }
    }
    return user;
  }, [user]);
  
  // Use fallback user if available
  const currentUser = user || fallbackUser;
  const currentIsAuthenticated = isAuthenticated && !!currentUser;
  
  // Debug authentication status (removed for production)
  const { branches = [], loading: branchesLoading = false, error: branchesError = null } = useSelector(state => state.branches || {});
  const { activeProducts: products = [], loading: productsLoading = false } = useSelector(state => state.products || {});
  const { activeHealthIssues = [], loading: healthIssuesLoading = false, error: healthIssuesError = null } = useSelector(state => state.health || {});
  

  // Stepper state
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState(new Set());

  // Form data state
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
    
    // Reminders
    reminders: []
  });

  const [errors, setErrors] = useState({});
  const [hasAttemptedSubmit, setHasAttemptedSubmit] = useState(false);
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

  // Define stepper steps based on lead status
  const allSteps = [
    {
      id: 'reminders',
      title: 'Reminders',
      description: 'Follow-up reminders and notes',
      icon: HiBell
    },
    {
      id: 'basic-info',
      title: 'Basic Information',
      description: 'Lead details and status',
      icon: HiClipboardDocumentList
    },
    {
      id: 'customer-info',
      title: 'Customer Details',
      description: 'Contact and personal information',
      icon: HiUser
    },
    {
      id: 'health-products',
      title: 'Health & Products',
      description: 'Medical conditions and services',
      icon: HiHeart
    },
    {
      id: 'payment-assignment',
      title: 'Payment & Assignment',
      description: 'Payment details and team assignment',
      icon: HiCurrencyDollar
    },
  ];

  // Show all steps if lead status is "Order Completed", otherwise show only first 3 steps
  const steps = formData.leadStatus === 'order_completed' 
    ? allSteps 
    : allSteps.slice(0, 3);

  // Reset current step when lead status changes and current step is no longer available
  useEffect(() => {
    if (currentStep > steps.length) {
      setCurrentStep(steps.length);
    }
  }, [steps.length, currentStep]);

  // Function to clear authentication and redirect to login
  const clearAuthAndRedirect = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Clear cookies
    document.cookie = 'token=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    document.cookie = 'user=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
    // Redirect to login
    window.location.href = '/login';
  };

  // Function to validate user and load data
  const validateUserAndLoadData = async () => {
    // If we have a token but no user, try to fetch the profile
    if (isAuthenticated && !user && localStorage.getItem('token')) {
      try {
        const profileResult = await dispatch(getProfile());
        if (profileResult.type === 'auth/getProfile/fulfilled') {
          // User profile fetched, now load other data
          dispatch(getAllBranches());
          dispatch(getActiveBranches());
          dispatch(getActiveProducts());
          dispatch(getActiveHealthIssues());
          return;
        } else {
          console.error('❌ Profile fetch failed:', profileResult.payload);
          clearAuthAndRedirect();
          return;
        }
      } catch (error) {
        console.error('❌ Error fetching profile:', error);
        clearAuthAndRedirect();
        return;
      }
    }

    if (!currentIsAuthenticated || !currentUser) {
      console.log('User not authenticated, skipping data load');
      return;
    }

    try {
      // First verify the user still exists by fetching profile
      const profileResult = await dispatch(getProfile());
      
      if (profileResult.type === 'auth/getProfile/fulfilled') {
        // User exists, load other data
        dispatch(getAllBranches());
        dispatch(getActiveBranches());
        dispatch(getActiveProducts());
        dispatch(getActiveHealthIssues());
      } else {
        console.error('User validation failed:', profileResult.payload);
        clearAuthAndRedirect();
      }
    } catch (error) {
      console.error('Error validating user:', error);
      clearAuthAndRedirect();
    }
  };

  // Load data on component mount
  useEffect(() => {
    validateUserAndLoadData();
  }, [dispatch, isAuthenticated, user]);

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
      
    }
  }, [selectedLead, mode, branches]);

  // Auto-assign branch for non-super_admin users
  useEffect(() => {
    if (currentUser?.role !== 'super_admin' && currentUser?.branch && branches.length > 0 && !formData.dispatchedFrom) {
      const userBranchId = currentUser.branch?._id || currentUser.branch;
      const branchExists = branches.some(b => (b._id || b).toString() === userBranchId.toString());
      if (branchExists) {
        const branch = branches.find(b => (b._id || b).toString() === userBranchId.toString());
        if (branch) {
          handleBranchSelect(branch);
        }
      }
    }
  }, [currentUser, branches, formData.dispatchedFrom]);

  // Clear dispatchedFrom error when branch is selected
  useEffect(() => {
    if (formData.dispatchedFrom && errors.dispatchedFrom) {
      setErrors(prev => ({
        ...prev,
        dispatchedFrom: null
      }));
    }
  }, [formData.dispatchedFrom, errors.dispatchedFrom]);

  // Handle branch selection
  const handleBranchSelect = (branch) => {
    console.log('Branch selected:', branch);
    setFormData(prev => {
      const newData = {
        ...prev,
        dispatchedFrom: branch._id
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    setBranchSearch(branch.branchName);
    setShowBranchDropdown(false);
    // Clear the error when a branch is selected
    setErrors(prev => ({
      ...prev,
      dispatchedFrom: null
    }));
  };

  // Add reminder function
  const addReminder = () => {
    if (newReminder.date && newReminder.time && newReminder.note) {
      const reminder = {
        id: Date.now(),
        datetime: formatReminderDateTimeForAPI(newReminder.date, newReminder.time, newReminder.ampm),
        note: newReminder.note
      };
      
      setFormData(prev => ({
        ...prev,
        reminders: [...prev.reminders, reminder]
      }));
      
      setNewReminder({ date: '', time: '', ampm: 'AM', note: '' });
    }
  };

  // Remove reminder function
  const removeReminder = (reminderId) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== reminderId)
    }));
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

  // Step validation functions
  const validateStep = (stepNumber, showErrors = false) => {
    const newErrors = {};
    
    // Get the step configuration for the given step number
    const stepConfig = steps[stepNumber - 1];
    
    if (!stepConfig) {
      return true; // No validation needed for non-existent steps
    }
    
    switch (stepConfig.id) {
      case 'reminders':
        // No required fields in reminders step
        break;
        
      case 'basic-info':
        // No required fields in basic info step
        break;
        
      case 'customer-info':
        if (!formData.customerName.trim()) {
          newErrors.customerName = 'Customer name is required';
        }
        if (!formData.customerMobile.trim()) {
          newErrors.customerMobile = 'Customer mobile is required';
        }
        if (formData.customerEmail && !/\S+@\S+\.\S+/.test(formData.customerEmail)) {
          newErrors.customerEmail = 'Please enter a valid email address';
        }
        break;
        
      case 'health-products':
        // Validate that all selected products have valid ObjectIds
        const invalidProductIds = formData.products.filter(productId => {
          // Check if it's a valid MongoDB ObjectId (24 hex characters)
          return !/^[0-9a-fA-F]{24}$/.test(productId);
        });
        
        if (invalidProductIds.length > 0) {
          newErrors.products = `Invalid product IDs detected: ${invalidProductIds.join(', ')}. Please remove invalid products.`;
        }
        break;
        
      case 'payment-assignment':
        console.log('Validating payment-assignment - dispatchedFrom:', formData.dispatchedFrom);
        // Make branch assignment optional for now to test
        // if (!formData.dispatchedFrom) {
        //   newErrors.dispatchedFrom = 'Please assign a branch';
        // }
        break;
    }
    
    // Only set errors if showErrors is true AND form has been submitted
    if (showErrors && hasAttemptedSubmit) {
      setErrors(prev => ({ ...prev, ...newErrors }));
    }
    
    return Object.keys(newErrors).length === 0;
  };


  // Handle step navigation
  const handleStepChange = (stepNumber) => {
    if (stepNumber < currentStep || completedSteps.has(stepNumber)) {
      setCurrentStep(stepNumber);
    } else if (stepNumber === currentStep + 1) {
      // Validate current step before moving to next (without showing errors)
      if (validateStep(currentStep, false)) {
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        setCurrentStep(stepNumber);
      }
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep, false)) {
      setCompletedSteps(prev => new Set([...prev, currentStep]));
      if (currentStep < steps.length) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🔐 Form submission - Auth check:', {
      isAuthenticated,
      user,
      currentUser,
      currentIsAuthenticated,
      hasUser: !!currentUser,
      userRole: currentUser?.role,
      authState
    });
    
    // Check if user is authenticated
    if (!currentIsAuthenticated || !currentUser) {
      console.error('❌ User not authenticated, cannot submit form:', {
        isAuthenticated,
        user,
        currentUser,
        currentIsAuthenticated,
        authState
      });
      return;
    }

    // Validate user before submitting
    try {
      const profileResult = await dispatch(getProfile());
      if (profileResult.type !== 'auth/getProfile/fulfilled') {
        console.error('User validation failed before submission:', profileResult.payload);
        clearAuthAndRedirect();
        return;
      }
    } catch (error) {
      console.error('Error validating user before submission:', error);
      clearAuthAndRedirect();
      return;
    }
    
    // Set flag that form submission has been attempted
    setHasAttemptedSubmit(true);
    
    // Clear previous errors first
    setErrors({});
    
    // Validate all steps before submitting (with errors shown)
    let allValid = true;
    for (let i = 1; i <= steps.length; i++) {
      if (!validateStep(i, true)) {
        allValid = false;
      }
    }
    
    if (allValid) {
      console.log('✅ Form validation passed, submitting data:', JSON.stringify(formData, null, 2));
      onSubmit(formData);
    } else {
      console.log('❌ Form validation failed, errors:', errors);
      // Go to first step with errors
      for (let i = 1; i <= steps.length; i++) {
        if (!validateStep(i, false)) {
          console.log(`❌ Validation failed at step ${i}`);
          setCurrentStep(i);
          break;
        }
      }
    }
  };

  // Render step content based on current step and available steps
  const renderStepContent = () => {
    // Get the current step configuration
    const currentStepConfig = steps[currentStep - 1];
    
    if (!currentStepConfig) {
      return null;
    }

    switch (currentStepConfig.id) {
      case 'reminders':
        return <RemindersStep 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors}
          newReminder={newReminder}
          setNewReminder={setNewReminder}
        />;
      case 'basic-info':
        return <BasicInfoStep formData={formData} setFormData={setFormData} errors={errors} setErrors={setErrors} hasAttemptedSubmit={hasAttemptedSubmit} />;
      case 'customer-info':
        return <CustomerDetailsStep 
          formData={formData} 
          setFormData={setFormData} 
          errors={errors}
          setErrors={setErrors}
          hasAttemptedSubmit={hasAttemptedSubmit}
        />;
      case 'health-products':
        return <HealthProductsStep 
          formData={formData} 
          setFormData={setFormData} 
          products={products}
          productsLoading={productsLoading}
          productSearch={productSearch}
          setProductSearch={setProductSearch}
          showProductDropdown={showProductDropdown}
          setShowProductDropdown={setShowProductDropdown}
          healthIssueSearch={healthIssueSearch}
          setHealthIssueSearch={setHealthIssueSearch}
          showHealthIssueDropdown={showHealthIssueDropdown}
          setShowHealthIssueDropdown={setShowHealthIssueDropdown}
          activeHealthIssues={activeHealthIssues}
          healthIssuesLoading={healthIssuesLoading}
          healthIssuesError={healthIssuesError}
          errors={errors}
        />;
      case 'payment-assignment':
        return <PaymentAssignmentStep
          formData={formData}
          setFormData={setFormData}
          errors={errors}
          branches={branches}
          branchesLoading={branchesLoading}
          branchesError={branchesError}
          branchSearch={branchSearch}
          setBranchSearch={setBranchSearch}
          showBranchDropdown={showBranchDropdown}
          setShowBranchDropdown={setShowBranchDropdown}
          handleBranchSelect={handleBranchSelect}
          user={currentUser}
        />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Stepper */}
      <div className="px-6 py-4">
        <MaterialStepper
          steps={steps}
          currentStep={currentStep}
          onStepChange={handleStepChange}
          allowNavigation={true}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 px-6 py-4 bg-white overflow-y-auto">
        <form onSubmit={handleSubmit} className="h-full flex flex-col">
          <div className="flex-1 min-h-0">
            {renderStepContent()}
          </div>

          {/* Form Actions */}
          <div className="mt-6 pt-4 border-t flex-shrink-0">
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
              >
                <HiChevronLeft className="h-3 w-3" />
                <span>Previous</span>
              </button>
              
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={onCancel}
                  className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gradient-to-r hover:from-[#8bc34a] hover:to-[#558b2f] hover:text-white hover:border-transparent transition-all duration-200 text-xs font-medium"
                >
                  Cancel
                </button>
                
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-3 py-1.5 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] hover:from-[#558b2f] hover:to-[#4a7c2a] shadow-md hover:shadow-lg text-xs font-medium"
                  >
                    <span>Next</span>
                    <HiChevronRight className="h-3 w-3" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-3 py-1.5 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] hover:from-[#558b2f] hover:to-[#4a7c2a] shadow-md hover:shadow-lg text-xs font-medium"
                  >
                    {loading && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    )}
                    <span>{mode === 'edit' ? 'Update Lead' : 'Create Lead'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LeadFormStepper;
