import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiCurrencyDollar,
  HiBuildingOffice,
  HiCalendar,
  HiUser,
  HiClock,
  HiCheckCircle,
  HiXMark,
  HiPlus,
  HiMinus,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea, Loading, Stepper, MaterialStepper, Card } from '../../components/common';
import { createPayroll, updatePayroll, getPayrollById, getAllPayrolls } from '../../redux/actions/payrollActions';
import { getAllBranches, getActiveBranches } from '../../redux/actions/branchActions';
import {
  selectCurrentPayroll,
  selectPayrollLoading,
  selectPayrollError
} from '../../redux/slices/payrollSlice';
import {
  selectBranches,
  selectBranchLoading
} from '../../redux/slices/branchSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const PayrollFormPage = () => {
  const navigate = useNavigate();
  
  // Wrap navigate to track navigation calls
  const trackedNavigate = (path, ...args) => {
    console.log('🔀 Navigation triggered to:', path, 'from step:', currentStep);
    console.trace('Navigation stack trace');
    navigate(path, ...args);
  };
  const dispatch = useDispatch();
  const { id } = useParams();
  const isEdit = Boolean(id);

  // Redux state
  const currentPayroll = useSelector(selectCurrentPayroll);
  const payrollLoading = useSelector(selectPayrollLoading);
  const payrollError = useSelector(selectPayrollError);
  const branches = useSelector(selectBranches);
  const branchesLoading = useSelector(selectBranchLoading);

  // Form state
  const [formData, setFormData] = useState({
    employeeName: '',
    employeeId: '',
    designation: '',
    branchId: '',
    basicSalary: '',
    allowances: {
      transportAllowance: 0,
      specialAllowance: 0,
      otherAllowances: 0
    },
    deductions: {
      providentFund: 0,
      professionalTax: 0,
      incomeTax: 0,
      otherDeductions: 0
    },
    payment: {
      status: 'pending',
      paymentMethod: 'bank_transfer',
      remarks: ''
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
  const [currentStep, setCurrentStep] = useState(1);
  const [submitButtonClicked, setSubmitButtonClicked] = useState(false);
  
  // Debug step changes
  useEffect(() => {
    console.log('📍 Current step changed to:', currentStep);
    // Reset submit button state when step changes
    setSubmitButtonClicked(false);
  }, [currentStep]);
  
  // Debug currentPayroll changes
  useEffect(() => {
    console.log('📦 currentPayroll changed:', { hasPayroll: !!currentPayroll, payrollId: currentPayroll?._id });
  }, [currentPayroll]);
  
  // Debug component lifecycle
  useEffect(() => {
    console.log('🚀 Component mounted/updated:', { isEdit, id, currentPath: window.location.pathname, currentStep });
    return () => {
      console.log('💀 Component unmounting - current step was:', currentStep);
    };
  });

  // Load data on component mount
  useEffect(() => {
    // Try both actions to ensure branches are loaded
    dispatch(getActiveBranches());
    dispatch(getAllBranches({ page: 1, limit: 1000, status: 'active' }));
    
    if (isEdit && id) {
      dispatch(getPayrollById(id));
    }
  }, [dispatch, isEdit, id]);


  // Update form data when payroll is loaded for editing
  useEffect(() => {
    console.log('📋 Edit effect triggered:', { isEdit, hasCurrentPayroll: !!currentPayroll, payrollId: currentPayroll?._id });
    if (isEdit && currentPayroll && currentPayroll._id) {
      console.log('🔄 Setting form data for editing:', currentPayroll);
      setFormData({
        employeeName: currentPayroll.employeeName || '',
        employeeId: currentPayroll.employeeId || '',
        designation: currentPayroll.designation || '',
        branchId: currentPayroll.branchId?._id || '',
        basicSalary: currentPayroll.basicSalary || '',
        allowances: {
          transportAllowance: currentPayroll.allowances?.transportAllowance || 0,
          specialAllowance: currentPayroll.allowances?.specialAllowance || 0,
          otherAllowances: currentPayroll.allowances?.otherAllowances || 0
        },
        deductions: {
          providentFund: currentPayroll.deductions?.providentFund || 0,
          professionalTax: currentPayroll.deductions?.professionalTax || 0,
          incomeTax: currentPayroll.deductions?.incomeTax || 0,
          otherDeductions: currentPayroll.deductions?.otherDeductions || 0
        },
        payment: {
          status: currentPayroll.payment?.status || 'pending',
          paymentMethod: currentPayroll.payment?.paymentMethod || 'bank_transfer',
          remarks: currentPayroll.payment?.remarks || ''
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]); // Only run when id changes, not when currentPayroll changes

  // Handle input changes
  const handleInputChange = (field, value) => {
    console.log('🔧 Input change:', { field, value, currentStep, isEdit });
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => {
        const newData = {
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value
          }
        };
        console.log('📝 Updated form data (nested):', newData);
        return newData;
      });
    } else {
      setFormData(prev => {
        const newData = {
          ...prev,
          [field]: value
        };
        console.log('📝 Updated form data (direct):', newData);
        return newData;
      });
    }
    
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
    console.log('🔍 Validating form with data:', formData);
    const newErrors = {};

    // Only validate required fields for now
    if (!formData.employeeName) {
      newErrors.employeeName = 'Employee name is required';
    }
    if (!formData.employeeId) {
      newErrors.employeeId = 'Employee ID is required';
    }
    if (!formData.designation) {
      newErrors.designation = 'Designation is required';
    }
    if (!formData.branchId || formData.branchId === 'default') {
      newErrors.branchId = 'Branch is required';
    }
    if (!formData.basicSalary || formData.basicSalary <= 0) {
      newErrors.basicSalary = 'Basic salary is required and must be greater than 0';
    }
    
    // Optional validations - only validate if fields have values
    if (formData.bankDetails.accountNumber && !formData.bankDetails.bankName) {
      newErrors['bankDetails.bankName'] = 'Bank name is required when account number is provided';
    }
    if (formData.bankDetails.accountNumber && !formData.bankDetails.ifscCode) {
      newErrors['bankDetails.ifscCode'] = 'IFSC code is required when account number is provided';
    }
    // Only validate PAN format if PAN number is provided and not empty
    if (formData.panDetails.panNumber && formData.panDetails.panNumber.trim() !== '') {
      if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panDetails.panNumber.trim())) {
        newErrors['panDetails.panNumber'] = 'Invalid PAN number format (e.g., ABCDE1234F)';
      }
    }
    // Only validate Aadhar format if Aadhar number is provided and not empty
    if (formData.panDetails.aadharNumber && formData.panDetails.aadharNumber.trim() !== '') {
      if (!/^[0-9]{12}$/.test(formData.panDetails.aadharNumber.trim())) {
        newErrors['panDetails.aadharNumber'] = 'Aadhar number must be exactly 12 digits';
      }
    }
    
    // Payment validation - make these optional for now to prevent form closing
    // if (!formData.payment?.status) {
    //   newErrors['payment.status'] = 'Payment status is required';
    // }
    // if (!formData.payment?.paymentMethod) {
    //   newErrors['payment.paymentMethod'] = 'Payment method is required';
    // }

    console.log('✅ Validation result:', { errors: newErrors, isValid: Object.keys(newErrors).length === 0 });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('📤 Form submission triggered:', { currentStep, isEdit, formData });
    console.log('📤 Form submission event:', e);
    console.trace('Form submission stack trace');
    
    // Only allow submission on the last step AND when user actually clicks submit
    if (currentStep !== 5) {
      console.log('❌ Form submission blocked - not on last step:', currentStep);
      return;
    }
    
    // Check if this is a manual submission (user clicked submit button)
    const isManualSubmission = e.nativeEvent && e.nativeEvent.submitter && e.nativeEvent.submitter.type === 'submit';
    console.log('🔍 Submission details:', { 
      hasNativeEvent: !!e.nativeEvent, 
      hasSubmitter: !!(e.nativeEvent && e.nativeEvent.submitter),
      submitterType: e.nativeEvent?.submitter?.type,
      isManualSubmission,
      submitButtonClicked
    });
    
    if (!isManualSubmission || !submitButtonClicked) {
      console.log('❌ Form submission blocked - not manual submission or button not clicked');
      return;
    }
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      // Get the first error message to show in notification
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorMessage = errors[firstErrorKey];
      
      dispatch(addNotification({
        type: 'error',
        message: `Please fix the errors before submitting. ${firstErrorMessage}`
      }));
      
      // Scroll to first error
      if (firstErrorKey) {
        const element = document.querySelector(`[name="${firstErrorKey}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        } else {
          // If element not found by name, try to find by error key
          const errorElement = document.querySelector(`[data-error="${firstErrorKey}"]`);
          if (errorElement) {
            errorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            errorElement.focus();
          }
        }
      }
      return;
    }

    setSubmitting(true);
    
    try {
      const payrollData = {
        ...formData,
        basicSalary: parseFloat(formData.basicSalary),
        designation: formData.designation,
        allowances: {
          transportAllowance: parseFloat(formData.allowances.transportAllowance) || 0,
          specialAllowance: parseFloat(formData.allowances.specialAllowance) || 0,
          otherAllowances: parseFloat(formData.allowances.otherAllowances) || 0
        },
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

      if (isEdit) {
        await dispatch(updatePayroll({ id, payrollData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Payroll updated successfully'
        }));
      } else {
        await dispatch(createPayroll(payrollData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Payroll created successfully'
        }));
        
        // Refresh the payroll list to show the new payroll
        dispatch(getAllPayrolls({ page: 1, limit: 10 }));
      }
      
      trackedNavigate('/payrolls');
    } catch (error) {
      console.error('Payroll operation failed:', error);
      dispatch(addNotification({
        type: 'error',
        message: error || `Failed to ${isEdit ? 'update' : 'create'} payroll`
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const totalAllowances = Object.values(formData.allowances).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const totalDeductions = Object.values(formData.deductions).reduce((sum, val) => sum + (parseFloat(val) || 0), 0);
    const grossSalary = (parseFloat(formData.basicSalary) || 0) + totalAllowances;
    const netSalary = grossSalary - totalDeductions;

    return {
      totalAllowances,
      totalDeductions,
      grossSalary,
      netSalary
    };
  };

  const totals = calculateTotals();

  // Prepare options
  const branchOptions = branches && branches.length > 0 ? branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  })) : [
    { value: 'default', label: 'No branches available - Please add branches first' }
  ];



  const paymentMethodOptions = [
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'cash', label: 'Cash' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'upi', label: 'UPI' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' }
  ];

  const steps = [
    { id: 'basic-info', title: 'Basic Information', description: 'Employee and branch details', icon: HiUser },
    { id: 'salary-allowances', title: 'Salary & Allowances', description: 'Basic salary and allowances', icon: HiCurrencyDollar },
    { id: 'deductions', title: 'Deductions', description: 'Taxes and other deductions', icon: HiMinus },
    { id: 'bank-pf-details', title: 'Bank & PF Details', description: 'Bank and provident fund info', icon: HiBuildingOffice },
    { id: 'payment-details', title: 'Payment Details', description: 'Payment status and method', icon: HiCheckCircle }
  ];

  if (payrollLoading && isEdit) {
    return <Loading />;
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <Card padding="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Edit Employee' : 'Add New Employee'}
              </h1>
            </div>
          </div>
        </div>
      </Card>

      {/* Stepper */}
      <Card padding="p-4">
        <MaterialStepper 
          steps={steps} 
          currentStep={currentStep} 
          onStepChange={setCurrentStep}
          allowNavigation={true}
        />
      </Card>

      {/* Form */}
      <form 
        onSubmit={(e) => {
          console.log('📝 Form onSubmit event triggered:', { currentStep, isEdit });
          handleSubmit(e);
        }} 
        className="space-y-3"
      >
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <Card padding="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <HiUser className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                name="employeeName"
                label="Employee Name *"
                value={formData.employeeName}
                onChange={(e) => handleInputChange('employeeName', e.target.value)}
                error={errors.employeeName}
                placeholder="Enter employee name"
                icon={HiUser}
              />
              <Input
                name="employeeId"
                label="Employee ID *"
                value={formData.employeeId}
                onChange={(e) => handleInputChange('employeeId', e.target.value)}
                error={errors.employeeId}
                placeholder="Enter employee ID"
                icon={HiUser}
              />
              <Input
                name="designation"
                label="Designation *"
                value={formData.designation}
                onChange={(e) => handleInputChange('designation', e.target.value)}
                error={errors.designation}
                placeholder="Enter designation"
                icon={HiUser}
              />
              <Select
                name="branchId"
                label="Branch *"
                value={formData.branchId}
                onChange={(e) => handleInputChange('branchId', e.target.value)}
                options={branchOptions}
                error={errors.branchId}
                loading={branchesLoading}
                placeholder={branchesLoading ? "Loading branches..." : "Select a branch"}
                disabled={branchesLoading || branchOptions.length === 0}
              />
            </div>
          </Card>
        )}

        {/* Step 2: Salary & Allowances */}
        {currentStep === 2 && (
          <Card padding="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <HiCurrencyDollar className="w-5 h-5 mr-2" />
              Salary & Allowances
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                name="basicSalary"
                label="Basic Salary *"
                type="number"
                value={formData.basicSalary}
                onChange={(e) => handleInputChange('basicSalary', e.target.value)}
                error={errors.basicSalary}
                icon={HiCurrencyDollar}
                placeholder="Enter basic salary"
                min="0"
                step="0.01"
              />
              <div className="md:col-span-2">
                <h3 className="text-md font-medium text-gray-700 mb-3">Allowances</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Transport Allowance"
                    type="number"
                    value={formData.allowances.transportAllowance}
                    onChange={(e) => handleInputChange('allowances.transportAllowance', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <Input
                    label="Special Allowance"
                    type="number"
                    value={formData.allowances.specialAllowance}
                    onChange={(e) => handleInputChange('allowances.specialAllowance', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                  <Input
                    label="Other Allowances"
                    type="number"
                    value={formData.allowances.otherAllowances}
                    onChange={(e) => handleInputChange('allowances.otherAllowances', e.target.value)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <strong>Total Allowances:</strong> ₹{totals.totalAllowances.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 3: Deductions */}
        {currentStep === 3 && (
          <Card padding="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <HiMinus className="w-5 h-5 mr-2" />
              Deductions
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Provident Fund"
                type="number"
                value={formData.deductions.providentFund}
                onChange={(e) => handleInputChange('deductions.providentFund', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <Input
                label="Professional Tax"
                type="number"
                value={formData.deductions.professionalTax}
                onChange={(e) => handleInputChange('deductions.professionalTax', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <Input
                label="Income Tax"
                type="number"
                value={formData.deductions.incomeTax}
                onChange={(e) => handleInputChange('deductions.incomeTax', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <Input
                label="Other Deductions"
                type="number"
                value={formData.deductions.otherDeductions}
                onChange={(e) => handleInputChange('deductions.otherDeductions', e.target.value)}
                placeholder="0"
                min="0"
                step="0.01"
              />
              <div className="md:col-span-2 mt-2 p-3 bg-gray-50 rounded-lg">
                <div className="text-sm text-gray-600">
                  <strong>Total Deductions:</strong> ₹{totals.totalDeductions.toLocaleString()}
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 4: Bank & PF Details */}
        {currentStep === 4 && (
          <Card padding="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <HiBuildingOffice className="w-5 h-5 mr-2" />
              Bank & PF Details
            </h2>
            <div className="space-y-3">
              {/* Bank Details */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="Bank Name"
                    value={formData.bankDetails.bankName}
                    onChange={(e) => handleInputChange('bankDetails.bankName', e.target.value)}
                    error={errors['bankDetails.bankName']}
                    placeholder="Enter bank name"
                  />
                  <Input
                    label="Account Number"
                    value={formData.bankDetails.accountNumber}
                    onChange={(e) => handleInputChange('bankDetails.accountNumber', e.target.value)}
                    placeholder="Enter account number"
                  />
                  <Input
                    label="IFSC Code"
                    value={formData.bankDetails.ifscCode}
                    onChange={(e) => handleInputChange('bankDetails.ifscCode', e.target.value)}
                    error={errors['bankDetails.ifscCode']}
                    placeholder="Enter IFSC code"
                    className="uppercase"
                  />
                  <Input
                    label="Account Holder Name"
                    value={formData.bankDetails.accountHolderName}
                    onChange={(e) => handleInputChange('bankDetails.accountHolderName', e.target.value)}
                    placeholder="Enter account holder name"
                  />
                </div>
              </div>

              {/* PF Details */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">Provident Fund Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    label="PF Number"
                    value={formData.pfDetails.pfNumber}
                    onChange={(e) => handleInputChange('pfDetails.pfNumber', e.target.value)}
                    placeholder="Enter PF number"
                  />
                  <Input
                    label="UAN Number"
                    value={formData.pfDetails.uanNumber}
                    onChange={(e) => handleInputChange('pfDetails.uanNumber', e.target.value)}
                    placeholder="Enter UAN number"
                  />
                  <Input
                    label="PF Account Number"
                    value={formData.pfDetails.pfAccountNumber}
                    onChange={(e) => handleInputChange('pfDetails.pfAccountNumber', e.target.value)}
                    placeholder="Enter PF account number"
                  />
                </div>
              </div>

              {/* PAN & Aadhar Details */}
              <div>
                <h3 className="text-md font-medium text-gray-700 mb-3">PAN & Aadhar Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="relative">
                    <Input
                      name="panDetails.panNumber"
                      label="PAN Number (Optional)"
                      value={formData.panDetails.panNumber}
                      onChange={(e) => handleInputChange('panDetails.panNumber', e.target.value.toUpperCase())}
                      error={errors['panDetails.panNumber']}
                      placeholder="Enter PAN number (e.g., ABCDE1234F)"
                      className="uppercase"
                      maxLength="10"
                      data-error="panDetails.panNumber"
                    />
                    {formData.panDetails.panNumber && errors['panDetails.panNumber'] && (
                      <button
                        type="button"
                        onClick={() => handleInputChange('panDetails.panNumber', '')}
                        className="absolute right-2 top-8 text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Input
                      name="panDetails.aadharNumber"
                      label="Aadhar Number (Optional)"
                      value={formData.panDetails.aadharNumber}
                      onChange={(e) => handleInputChange('panDetails.aadharNumber', e.target.value.replace(/\D/g, ''))}
                      error={errors['panDetails.aadharNumber']}
                      placeholder="Enter Aadhar number (12 digits)"
                      maxLength="12"
                      data-error="panDetails.aadharNumber"
                    />
                    {formData.panDetails.aadharNumber && errors['panDetails.aadharNumber'] && (
                      <button
                        type="button"
                        onClick={() => handleInputChange('panDetails.aadharNumber', '')}
                        className="absolute right-2 top-8 text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Step 5: Payment Details */}
        {currentStep === 5 && (
          <Card padding="p-4">
            {console.log('🎯 Rendering Payment Details step')}
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <HiCheckCircle className="w-5 h-5 mr-2" />
              Payment Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Select
                name="payment.status"
                label="Payment Status"
                value={formData.payment.status}
                onChange={(e) => handleInputChange('payment.status', e.target.value)}
                options={paymentStatusOptions}
                error={errors['payment.status']}
              />
              <Select
                name="payment.paymentMethod"
                label="Payment Method"
                value={formData.payment.paymentMethod}
                onChange={(e) => handleInputChange('payment.paymentMethod', e.target.value)}
                options={paymentMethodOptions}
                error={errors['payment.paymentMethod']}
              />
              <div className="md:col-span-2">
                <TextArea
                  label="Payment Remarks"
                  value={formData.payment.remarks}
                  onChange={(e) => handleInputChange('payment.remarks', e.target.value)}
                  placeholder="Enter any payment-related remarks..."
                  rows={3}
                />
              </div>
            </div>
          </Card>
        )}


        {/* Form Actions */}
        <Card padding="p-4">
          <div className="flex justify-between">
            <div className="flex space-x-3">
              <button
                type="button"
                onClick={() => trackedNavigate('/payrolls')}
                className="flex items-center space-x-2 px-3 py-1.5 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
              >
                <HiXMark className="h-3 w-3" />
                <span>Cancel</span>
              </button>
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium"
                >
                  <HiChevronLeft className="h-3 w-3" />
                  <span>Previous</span>
                </button>
              )}
            </div>
            <div className="flex space-x-3">
              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={() => {
                    console.log('🔄 Next button clicked, current step:', currentStep, 'going to:', currentStep + 1);
                    setCurrentStep(currentStep + 1);
                  }}
                  className="px-3 py-1.5 text-white rounded-lg transition-all duration-200 flex items-center space-x-2 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] hover:from-[#558b2f] hover:to-[#4a7c2a] shadow-md hover:shadow-lg text-xs font-medium"
                >
                  <span>Next</span>
                  <HiChevronRight className="h-3 w-3" />
                </button>
              ) : (
                <>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-3 py-1.5 text-white rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 bg-gradient-to-r from-[#8bc34a] to-[#558b2f] hover:from-[#558b2f] hover:to-[#4a7c2a] shadow-md hover:shadow-lg text-xs font-medium"
                    onClick={(e) => {
                      console.log('🔘 Submit button clicked manually:', { submitting, currentStep });
                      setSubmitButtonClicked(true);
                      if (submitting) {
                        e.preventDefault();
                        return;
                      }
                    }}
                  >
                    {submitting && (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                    )}
                    <span>{isEdit ? 'Update Payroll' : 'Create Payroll'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default PayrollFormPage;
