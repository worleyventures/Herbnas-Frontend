import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiUser, 
  HiCurrencyDollar, 
  HiMinus, 
  HiBuildingOffice, 
  HiXMark, 
  HiChevronLeft, 
  HiChevronRight,
  HiEye,
  HiEyeSlash
} from 'react-icons/hi2';
import { MaterialStepper, Select } from '../../components/common';
import { createPayroll, updatePayroll, getPayrollById } from '../../redux/actions/payrollActions';
import { 
  clearPayrollError, 
  clearCurrentPayroll, 
  clearCreateSuccess, 
  clearUpdateSuccess 
} from '../../redux/slices/payrollSlice';
import { getAllBranches } from '../../redux/actions/branchActions';
import { addNotification } from '../../redux/slices/uiSlice';
import { Loading } from '../../components/common';

const PayrollFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get payroll data from location state or params
  const selectedPayroll = location.state?.payroll || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const payrollId = params.id;
  
  // Get loading states, success states, and payroll data from Redux
  const { 
    createLoading: payrollLoading, 
    updateLoading, 
    selectedPayroll: reduxPayroll, 
    loading: payrollDataLoading,
    createSuccess,
    updateSuccess,
    createError,
    updateError
  } = useSelector(state => state.payrolls || {});
  
  const { branches = [], loading: branchesLoading = false } = useSelector(state => state.branches || {});
  
  // Use the payroll from Redux if we don't have one from location state
  const currentPayroll = selectedPayroll || reduxPayroll;
  const isEdit = mode === 'edit';
  
  // Load payroll data if editing and we have an ID
  useEffect(() => {
    if (isEdit && payrollId && !selectedPayroll) {
      dispatch(getPayrollById(payrollId));
    }
  }, [dispatch, isEdit, payrollId, selectedPayroll]);

  // Load branches
  useEffect(() => {
    dispatch(getAllBranches());
  }, [dispatch]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isSubmittingRef.current = false;
      // Clear success states on unmount
      dispatch(clearCreateSuccess());
      dispatch(clearUpdateSuccess());
    };
  }, [dispatch]);

  // Handle success states - navigate away from form
  useEffect(() => {
    if (createSuccess) {
      setSubmitButtonClicked(false); // Reset submit button state
      isSubmittingRef.current = false; // Reset ref
      dispatch(addNotification({
        type: 'success',
        message: 'Employee created successfully!'
      }));
      dispatch(clearCurrentPayroll());
      dispatch(clearCreateSuccess()); // Clear success state
      // Small delay to show notification before navigation
      setTimeout(() => {
      navigate('/payrolls', { state: { activeTab: 'employees' } });
      }, 1000);
    }
  }, [createSuccess, navigate, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      setSubmitButtonClicked(false); // Reset submit button state
      isSubmittingRef.current = false; // Reset ref
      dispatch(addNotification({
        type: 'success',
        message: 'Employee updated successfully!'
      }));
      dispatch(clearCurrentPayroll());
      dispatch(clearUpdateSuccess()); // Clear success state
      // Small delay to show notification before navigation
      setTimeout(() => {
      navigate('/payrolls', { state: { activeTab: 'employees' } });
      }, 1000);
    }
  }, [updateSuccess, navigate, dispatch]);

  // Handle error states - show error messages
  useEffect(() => {
    if (createError) {
      setSubmitButtonClicked(false); // Reset submit button state on error
      isSubmittingRef.current = false; // Reset ref on error
      dispatch(clearPayrollError());
    }
  }, [createError, dispatch]);

  useEffect(() => {
    if (updateError) {
      setSubmitButtonClicked(false); // Reset submit button state on error
      isSubmittingRef.current = false; // Reset ref on error
      dispatch(clearPayrollError());
    }
  }, [updateError, dispatch]);

  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    designation: '',
    email: '',
    password: '',
    confirmPassword: '',
    branchId: '',
    dateOfBirth: '',
    address: {
      street: '',
      city: '',
      state: '',
      pinCode: '',
      country: 'India'
    },
    basicSalary: '',
    deductions: {
      providentFund: 0,
      professionalTax: 0,
      incomeTax: 0,
      otherDeductions: 0
    },
    bankDetails: {
      bankName: '',
      accountNumber: '',
      ifscCode: '',
      accountHolderName: ''
    },
    pfDetails: {
      pfNumber: '',
      uanNumber: '',
      pfAccountNumber: ''
    },
    panDetails: {
      panNumber: '',
      aadharNumber: ''
    }
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const isSubmittingRef = useRef(false);

  // Initialize form data when editing
  useEffect(() => {
    if (isEdit && currentPayroll) {
      setFormData({
        employeeName: currentPayroll.employeeName || '',
        employeeId: currentPayroll.employeeId || '',
        designation: currentPayroll.designation || '',
        email: currentPayroll.email || '',
        password: '',
        confirmPassword: '',
        branchId: currentPayroll.branchId?._id || currentPayroll.branchId || '',
        dateOfBirth: currentPayroll.dateOfBirth || '',
        address: {
          street: currentPayroll.address?.street || '',
          city: currentPayroll.address?.city || '',
          state: currentPayroll.address?.state || '',
          pinCode: currentPayroll.address?.pinCode || '',
          country: currentPayroll.address?.country || 'India'
        },
        basicSalary: currentPayroll.basicSalary || '',
        deductions: {
          providentFund: currentPayroll.deductions?.providentFund || 0,
          professionalTax: currentPayroll.deductions?.professionalTax || 0,
          incomeTax: currentPayroll.deductions?.incomeTax || 0,
          otherDeductions: currentPayroll.deductions?.otherDeductions || 0
        },
        bankDetails: {
          bankName: currentPayroll.bankDetails?.bankName || '',
          accountNumber: currentPayroll.bankDetails?.accountNumber || '',
          ifscCode: currentPayroll.bankDetails?.ifscCode || '',
          accountHolderName: currentPayroll.bankDetails?.accountHolderName || ''
        },
        pfDetails: {
          pfNumber: currentPayroll.pfDetails?.pfNumber || '',
          uanNumber: currentPayroll.pfDetails?.uanNumber || '',
          pfAccountNumber: currentPayroll.pfDetails?.pfAccountNumber || ''
        },
        panDetails: {
          panNumber: currentPayroll.panDetails?.panNumber || '',
          aadharNumber: currentPayroll.panDetails?.aadharNumber || ''
        }
      });
    }
  }, [isEdit, currentPayroll]);

  const handleInputChange = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.employeeName?.trim()) {
      newErrors.employeeName = 'Employee name is required';
    }
    if (!formData.employeeId?.trim()) {
      newErrors.employeeId = 'Employee ID is required';
    }
    if (!formData.designation?.trim()) {
      newErrors.designation = 'Designation is required';
    }
    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.password?.trim()) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword?.trim()) {
      newErrors.confirmPassword = 'Confirm password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.branchId) {
      newErrors.branchId = 'Branch is required';
    }
    if (!formData.basicSalary || formData.basicSalary <= 0) {
      newErrors.basicSalary = 'Basic salary is required and must be greater than 0';
    }
    if (!formData.dateOfBirth?.trim()) {
      newErrors.dateOfBirth = 'Date of birth is required';
    }
    if (!formData.address.street?.trim()) {
      newErrors['address.street'] = 'Street address is required';
    }
    if (!formData.address.city?.trim()) {
      newErrors['address.city'] = 'City is required';
    }
    if (!formData.address.state?.trim()) {
      newErrors['address.state'] = 'State is required';
    }
    if (!formData.address.pinCode?.trim()) {
      newErrors['address.pinCode'] = 'PIN code is required';
    }
    
    // Optional validations - only validate if fields have values
    if (formData.bankDetails.accountNumber && !formData.bankDetails.bankName) {
      newErrors['bankDetails.bankName'] = 'Bank name is required when account number is provided';
    }
    if (formData.bankDetails.accountNumber && !formData.bankDetails.ifscCode) {
      newErrors['bankDetails.ifscCode'] = 'IFSC code is required when account number is provided';
    }
    if (formData.panDetails.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panDetails.panNumber)) {
      newErrors['panDetails.panNumber'] = 'PAN number must be in format ABCDE1234F';
    }
    if (formData.panDetails.aadharNumber && !/^[0-9]{12}$/.test(formData.panDetails.aadharNumber)) {
      newErrors['panDetails.aadharNumber'] = 'Aadhar number must be 12 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('🚀 Form submission started', { submitting, submitButtonClicked, isSubmittingRef: isSubmittingRef.current });
    
    // Prevent duplicate submissions using ref for immediate check
    if (submitting || submitButtonClicked || isSubmittingRef.current) {
      console.log('❌ Form submission blocked - already submitting or clicked');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    console.log('✅ Form validation passed, starting submission');
    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitButtonClicked(true);
    
    try {
      const payrollData = {
        employeeName: formData.employeeName.trim(),
        employeeId: formData.employeeId.trim(),
        designation: formData.designation.trim(),
        email: formData.email.trim(),
        password: formData.password,
        branchId: formData.branchId,
        dateOfBirth: formData.dateOfBirth,
        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          pinCode: formData.address.pinCode.trim(),
          country: formData.address.country.trim()
        },
        basicSalary: parseFloat(formData.basicSalary),
        deductions: {
          providentFund: parseFloat(formData.deductions.providentFund) || 0,
          professionalTax: parseFloat(formData.deductions.professionalTax) || 0,
          incomeTax: parseFloat(formData.deductions.incomeTax) || 0,
          otherDeductions: parseFloat(formData.deductions.otherDeductions) || 0
        },
        bankDetails: {
          bankName: formData.bankDetails.bankName || '',
          accountNumber: formData.bankDetails.accountNumber || '',
          ifscCode: formData.bankDetails.ifscCode || '',
          accountHolderName: formData.bankDetails.accountHolderName || ''
        },
        pfDetails: {
          pfNumber: formData.pfDetails.pfNumber || '',
          uanNumber: formData.pfDetails.uanNumber || '',
          pfAccountNumber: formData.pfDetails.pfAccountNumber || ''
        },
        panDetails: {
          panNumber: formData.panDetails.panNumber || '',
          aadharNumber: formData.panDetails.aadharNumber || ''
        }
      };

      if (isEdit && currentPayroll) {
        console.log('📝 Updating payroll:', currentPayroll._id);
        await dispatch(updatePayroll({ payrollId: currentPayroll._id, payrollData })).unwrap();
        console.log('✅ Payroll updated successfully');
      } else {
        console.log('➕ Creating new payroll:', payrollData.employeeName);
        const result = await dispatch(createPayroll(payrollData)).unwrap();
        console.log('✅ Payroll created successfully:', result);
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      setSubmitButtonClicked(false); // Reset on error to allow retry
      isSubmittingRef.current = false; // Reset ref on error
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const basicSalary = parseFloat(formData.basicSalary) || 0;
    const totalDeductions = Object.values(formData.deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const grossSalary = basicSalary; // No allowances, so gross = basic
    const netSalary = grossSalary - totalDeductions;

    return {
      basicSalary,
      totalDeductions,
      grossSalary,
      netSalary
    };
  };

  const totals = calculateTotals();

  // Designation options - based on available user roles (excluding super_admin)
  const designationOptions = [
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'admin', label: 'Admin' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'production_manager', label: 'Production Manager' },
    { value: 'accounts_manager', label: 'Accounts Manager' }
  ];

  // Prepare options
  const branchOptions = branches.length > 0 ? branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  })) : [
    { value: 'default', label: 'No branches available - Please add branches first' }
  ];

  const steps = [
    { id: 'basic-info', title: 'Basic Information', description: 'Employee and branch details', icon: HiUser },
    { id: 'salary-deductions', title: 'Salary & Deductions', description: 'Basic salary and deductions', icon: HiCurrencyDollar },
    { id: 'bank-pf-details', title: 'Bank & PF Details', description: 'Bank and provident fund info', icon: HiBuildingOffice }
  ];

  if (payrollLoading && isEdit) {
    return <Loading />;
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Employee' : 'Add New Employee'}
        </h1>
      </div>

      {/* Stepper */}
      <div className="px-6 py-4">
        <MaterialStepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepChange={setCurrentStep}
          allowNavigation={true}
        />
      </div>

      {/* Form Content */}
      <div className="flex-1 px-6 py-4 bg-white overflow-y-auto">
        <form 
          onSubmit={handleSubmit}
          className="h-full flex flex-col"
        >
          <div className="flex-1 min-h-0">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <HiUser className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Basic Information</h4>
                    <p className="text-sm text-gray-600">Employee details and branch assignment</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee Name *
                    </label>
                    <input
                      type="text"
                      name="employeeName"
                      value={formData.employeeName}
                      onChange={(e) => handleInputChange('employeeName', e.target.value)}
                      placeholder="Enter employee name"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                    {errors.employeeName && (
                      <p className="mt-1 text-sm text-red-600">{errors.employeeName}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Employee ID *
                    </label>
                    <input
                      type="text"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={(e) => handleInputChange('employeeId', e.target.value)}
                      placeholder="Enter employee ID"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                    {errors.employeeId && (
                      <p className="mt-1 text-sm text-red-600">{errors.employeeId}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Designation *
                    </label>
                    <Select
                      options={designationOptions}
                      value={formData.designation}
                      onChange={(value) => handleInputChange('designation', value)}
                      placeholder="Select designation"
                      error={errors.designation}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="Enter email address"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={(e) => handleInputChange('password', e.target.value)}
                        placeholder="Enter password"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showPassword ? (
                          <HiEyeSlash className="h-5 w-5" />
                        ) : (
                          <HiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm password"
                        className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                      >
                        {showConfirmPassword ? (
                          <HiEyeSlash className="h-5 w-5" />
                        ) : (
                          <HiEye className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Branch *
                    </label>
                    <Select
                      options={branchOptions}
                      value={formData.branchId}
                      onChange={(value) => handleInputChange('branchId', value)}
                      placeholder={branchesLoading ? "Loading branches..." : "Select a branch"}
                      disabled={branchesLoading || branchOptions.length === 0}
                      error={errors.branchId}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth *
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                    {errors.dateOfBirth && (
                      <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth}</p>
                    )}
                  </div>
                </div>
                
                {/* Address Section */}
                <div className="mt-8">
                  <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">Address Information</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address *
                      </label>
                      <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={(e) => handleInputChange('address.street', e.target.value)}
                        placeholder="Enter street address"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      {errors['address.street'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['address.street']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City *
                      </label>
                      <input
                        type="text"
                        name="address.city"
                        value={formData.address.city}
                        onChange={(e) => handleInputChange('address.city', e.target.value)}
                        placeholder="Enter city"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      {errors['address.city'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['address.city']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        State *
                      </label>
                      <input
                        type="text"
                        name="address.state"
                        value={formData.address.state}
                        onChange={(e) => handleInputChange('address.state', e.target.value)}
                        placeholder="Enter state"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      {errors['address.state'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['address.state']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code *
                      </label>
                      <input
                        type="text"
                        name="address.pinCode"
                        value={formData.address.pinCode}
                        onChange={(e) => handleInputChange('address.pinCode', e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter PIN code"
                        maxLength="6"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      {errors['address.pinCode'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['address.pinCode']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country
                      </label>
                      <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={(e) => handleInputChange('address.country', e.target.value)}
                        placeholder="Enter country"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Salary & Deductions */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-10 bg-green-100 rounded-xl flex items-center justify-center">
                    <HiCurrencyDollar className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Salary & Deductions</h4>
                    <p className="text-sm text-gray-600">Basic salary and deduction information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Basic Salary *
                    </label>
                    <input
                      type="number"
                      name="basicSalary"
                      value={formData.basicSalary}
                      onChange={(e) => handleInputChange('basicSalary', e.target.value)}
                      placeholder="Enter basic salary"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                    {errors.basicSalary && (
                      <p className="mt-1 text-sm text-red-600">{errors.basicSalary}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Provident Fund
                    </label>
                    <input
                      type="number"
                      name="deductions.providentFund"
                      value={formData.deductions.providentFund}
                      onChange={(e) => handleInputChange('deductions.providentFund', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Professional Tax
                    </label>
                    <input
                      type="number"
                      name="deductions.professionalTax"
                      value={formData.deductions.professionalTax}
                      onChange={(e) => handleInputChange('deductions.professionalTax', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Income Tax
                    </label>
                    <input
                      type="number"
                      name="deductions.incomeTax"
                      value={formData.deductions.incomeTax}
                      onChange={(e) => handleInputChange('deductions.incomeTax', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Other Deductions
                    </label>
                    <input
                      type="number"
                      name="deductions.otherDeductions"
                      value={formData.deductions.otherDeductions}
                      onChange={(e) => handleInputChange('deductions.otherDeductions', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
                
                <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Basic Salary:</span>
                      <span className="font-medium text-gray-900">₹{totals.basicSalary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Deductions:</span>
                      <span className="font-medium text-gray-900">₹{totals.totalDeductions?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gross Salary:</span>
                      <span className="font-medium text-gray-900">₹{totals.grossSalary?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Net Salary:</span>
                      <span className="font-medium text-green-600">₹{totals.netSalary?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}


            {/* Step 3: Bank & PF Details */}
            {currentStep === 3 && (
              <div className="space-y-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="h-10 w-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <HiBuildingOffice className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Bank & PF Details</h4>
                    <p className="text-sm text-gray-600">Banking and provident fund information</p>
                  </div>
                </div>
                
                {/* Bank Details */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Bank Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Bank Name
                      </label>
                      <input
                        type="text"
                        name="bankDetails.bankName"
                        value={formData.bankDetails.bankName}
                        onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                        placeholder="Enter bank name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      {errors['bankDetails.bankName'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['bankDetails.bankName']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Number
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountNumber"
                        value={formData.bankDetails.accountNumber}
                        onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                        placeholder="Enter account number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        IFSC Code
                      </label>
                      <input
                        type="text"
                        name="bankDetails.ifscCode"
                        value={formData.bankDetails.ifscCode}
                        onChange={(e) => handleInputChange('bankDetails.ifscCode', e.target.value.toUpperCase())}
                        placeholder="Enter IFSC code"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase"
                      />
                      {errors['bankDetails.ifscCode'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['bankDetails.ifscCode']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Account Holder Name
                      </label>
                      <input
                        type="text"
                        name="bankDetails.accountHolderName"
                        value={formData.bankDetails.accountHolderName}
                        onChange={(e) => handleInputChange('bankDetails.accountHolderName', e.target.value)}
                        placeholder="Enter account holder name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                </div>

                {/* PF Details */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">Provident Fund Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PF Number
                      </label>
                      <input
                        type="text"
                        name="pfDetails.pfNumber"
                        value={formData.pfDetails.pfNumber}
                        onChange={(e) => handleInputChange('pfDetails.pfNumber', e.target.value)}
                        placeholder="Enter PF number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        UAN Number
                      </label>
                      <input
                        type="text"
                        name="pfDetails.uanNumber"
                        value={formData.pfDetails.uanNumber}
                        onChange={(e) => handleInputChange('pfDetails.uanNumber', e.target.value)}
                        placeholder="Enter UAN number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PF Account Number
                      </label>
                      <input
                        type="text"
                        name="pfDetails.pfAccountNumber"
                        value={formData.pfDetails.pfAccountNumber}
                        onChange={(e) => handleInputChange('pfDetails.pfAccountNumber', e.target.value)}
                        placeholder="Enter PF account number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                    </div>
                  </div>
                </div>

                {/* PAN & Aadhar Details */}
                <div className="space-y-4">
                  <h3 className="text-md font-semibold text-gray-800 border-b border-gray-200 pb-2">PAN & Aadhar Details</h3>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        PAN Number (Optional)
                      </label>
                      <input
                        type="text"
                        name="panDetails.panNumber"
                        value={formData.panDetails.panNumber}
                        onChange={(e) => handleInputChange('panDetails.panNumber', e.target.value.toUpperCase())}
                        placeholder="Enter PAN number (e.g., ABCDE1234F)"
                        maxLength="10"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md uppercase"
                      />
                      {errors['panDetails.panNumber'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['panDetails.panNumber']}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aadhar Number (Optional)
                      </label>
                      <input
                        type="text"
                        name="panDetails.aadharNumber"
                        value={formData.panDetails.aadharNumber}
                        onChange={(e) => handleInputChange('panDetails.aadharNumber', e.target.value.replace(/\D/g, ''))}
                        placeholder="Enter Aadhar number (12 digits)"
                        maxLength="12"
                        className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
                      />
                      {errors['panDetails.aadharNumber'] && (
                        <p className="mt-1 text-sm text-red-600">{errors['panDetails.aadharNumber']}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <div className="flex justify-between">
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/payrolls')}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  <HiXMark className="h-4 w-4" />
                  <span>Cancel</span>
                </button>
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep - 1)}
                    className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                  >
                    <HiChevronLeft className="h-4 w-4" />
                    <span>Previous</span>
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                {currentStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-4 py-2 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] hover:from-[#558b2f] hover:to-[#4a7c2a] shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    <span>Next</span>
                    <HiChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] hover:from-[#558b2f] hover:to-[#4a7c2a] shadow-md hover:shadow-lg text-sm font-medium"
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    )}
                    <span>{isEdit ? 'Update Employee' : 'Create Employee'}</span>
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

export default PayrollFormPage;