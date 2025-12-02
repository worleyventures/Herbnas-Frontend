import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LeadFormSingle from '../../components/dashboard/leads/LeadFormSingle';
import { createLead, updateLead, getLeadById, clearLeadSuccess, clearLeadErrors } from '../../redux/actions/leadActions';
import { addNotification } from '../../redux/slices/uiSlice';
import { HiArrowLeft } from 'react-icons/hi2';

const LeadFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get lead data from location state or params
  const selectedLead = location.state?.lead || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const leadId = params.id;
  
  // Get loading states, success states, and lead data from Redux
  const { 
    createLoading, 
    updateLoading, 
    selectedLead: reduxLead, 
    loading: leadLoading,
    createSuccess,
    updateSuccess,
    createError,
    updateError
  } = useSelector(state => state.leads || {});
  
  // Get user from auth state to auto-assign branch
  const { user } = useSelector(state => state.auth || {});
  
  // Load lead data if editing and we have an ID
  useEffect(() => {
    if (mode === 'edit' && leadId && !selectedLead) {
      dispatch(getLeadById(leadId));
    }
  }, [dispatch, mode, leadId, selectedLead]);

  // Handle success states - navigate away from form
  useEffect(() => {
    if (createSuccess) {
      // Navigate to leads table with refresh flag
      navigate('/leads/table', { state: { refresh: true } });
      // Clear success after a short delay to allow LeadsDashboard to react
      setTimeout(() => {
        dispatch(clearLeadSuccess());
      }, 100);
    }
  }, [createSuccess, navigate, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      // Navigate to leads table with refresh flag
      navigate('/leads/table', { state: { refresh: true } });
      // Clear success after a short delay to allow LeadsDashboard to react
      setTimeout(() => {
        dispatch(clearLeadSuccess());
      }, 100);
    }
  }, [updateSuccess, navigate, dispatch]);

  // Handle error states - show error messages
  useEffect(() => {
    if (createError) {
      dispatch(clearLeadErrors());
    }
  }, [createError, dispatch]);

  useEffect(() => {
    if (updateError) {
      dispatch(clearLeadErrors());
    }
  }, [updateError, dispatch]);
  
  // Use the lead from Redux if we don't have one from location state
  const currentLead = selectedLead || reduxLead;
  
  // Debug logging
  console.log('LeadFormPage Debug:', {
    mode,
    leadId,
    selectedLead,
    reduxLead,
    currentLead,
    hasCurrentLead: !!currentLead,
    currentLeadId: currentLead?._id
  });
  
  const handleSubmit = async (formData) => {
    if (mode === 'edit' && currentLead) {
      console.log('Updating lead with ID:', currentLead._id, 'Data:', formData);
      
      // Validate lead ID
      if (!currentLead._id) {
        console.error('Lead ID is missing from current lead');
        return;
      }
      
      // Check if it's a valid MongoDB ObjectId format
      const objectIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!objectIdRegex.test(currentLead._id)) {
        console.error('Invalid lead ID format:', currentLead._id);
        return;
      }
      
      // Get user's branch ID for auto-assignment
      const userBranchId = user?.branch?._id || user?.branch;
      const branchId = formData.branchId && String(formData.branchId).trim() !== '' 
        ? String(formData.branchId).trim() 
        : (userBranchId ? String(userBranchId).trim() : null);
      
      // Clean up the data before sending (same mapping as create)
      const cleanedData = {
        customerName: formData.customerName?.trim() || undefined,
        customerMobile: formData.mobileNumber?.trim(),
        email: formData.email?.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        leadStatus: formData.leadStatus || 'new_lead',
        priority: formData.priority || 'medium',
        leadSource: formData.leadSource || undefined,
        leadDate: formData.leadDate ? new Date(formData.leadDate) : new Date(),
        notes: formData.notes?.trim() || undefined,
        healthIssues: formData.healthIssues || [],
        products: formData.products?.map(p => typeof p === 'object' ? p._id || p : p).filter(Boolean) || [],
        dispatchedFrom: branchId,
        assignedTo: formData.assignedTo || undefined,
        address: formData.address || {},
        reminders: formData.reminders || []
      };
      
      console.log('Cleaned update data being sent:', JSON.stringify(cleanedData, null, 2));
      try {
        await dispatch(updateLead({ leadId: currentLead._id, leadData: cleanedData })).unwrap();
        // Navigate will happen via useEffect watching updateSuccess
      } catch (error) {
        console.error('Error updating lead:', error);
        
        // Extract error message from Redux action error
        let errorMessage = 'Failed to update lead. Please try again.';
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.payload) {
          errorMessage = error.payload;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Show toast notification with appropriate title based on error type
        const isValidationError = errorMessage.toLowerCase().includes('already exists') || 
                                  errorMessage.toLowerCase().includes('duplicate') ||
                                  errorMessage.toLowerCase().includes('mobile') ||
                                  errorMessage.toLowerCase().includes('email');
        
        dispatch(addNotification({
          type: 'error',
          title: isValidationError ? 'Validation Error' : 'Update Failed',
          message: errorMessage,
          duration: 5000
        }));
      }
    } else {
      console.log('Creating new lead with data:', JSON.stringify(formData, null, 2));
      
      // Validate required fields before sending
      if (!formData.mobileNumber) {
        console.error('Missing required fields:', {
          mobileNumber: formData.mobileNumber
        });
        return;
      }
      
      // Get user's branch ID for auto-assignment
      const userBranchId = user?.branch?._id || user?.branch;
      const branchId = formData.branchId && String(formData.branchId).trim() !== '' 
        ? String(formData.branchId).trim() 
        : (userBranchId ? String(userBranchId).trim() : null);
      
      // Clean up the data before sending
      const cleanedData = {
        customerName: formData.customerName?.trim() || undefined,
        customerMobile: formData.mobileNumber?.trim(),
        email: formData.email?.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        leadStatus: formData.leadStatus || 'new_lead',
        priority: formData.priority || 'medium',
        leadSource: formData.leadSource || undefined,
        leadDate: formData.leadDate ? new Date(formData.leadDate) : new Date(),
        notes: formData.notes?.trim() || undefined,
        healthIssues: formData.healthIssues || [],
        products: formData.products?.map(p => typeof p === 'object' ? p._id || p : p).filter(Boolean) || [],
        dispatchedFrom: branchId,
        assignedTo: formData.assignedTo || undefined,
        address: formData.address || {},
        reminders: formData.reminders || []
      };
      
      console.log('Cleaned data being sent:', JSON.stringify(cleanedData, null, 2));
      try {
        await dispatch(createLead(cleanedData)).unwrap();
        // Navigate will happen via useEffect watching createSuccess
      } catch (error) {
        console.error('Error creating lead:', error);
        
        // Extract error message from Redux action error
        let errorMessage = 'Failed to create lead. Please try again.';
        if (typeof error === 'string') {
          errorMessage = error;
        } else if (error?.payload) {
          errorMessage = error.payload;
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        // Show toast notification with appropriate title based on error type
        const isValidationError = errorMessage.toLowerCase().includes('already exists') || 
                                  errorMessage.toLowerCase().includes('duplicate') ||
                                  errorMessage.toLowerCase().includes('mobile') ||
                                  errorMessage.toLowerCase().includes('email');
        
        dispatch(addNotification({
          type: 'error',
          title: isValidationError ? 'Validation Error' : 'Creation Failed',
          message: errorMessage,
          duration: 5000
        }));
      }
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  // Show loading state while form is submitting or loading lead data
  const isLoading = createLoading || updateLoading || leadLoading;

  return (
    <div className="min-h-screen bg-white">

      {/* Form Content */}
      <div className="max-w-7xl mx-auto py-6" style={{overflow: 'visible'}}>
        <LeadFormSingle
          selectedLead={currentLead}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          loading={isLoading}
          mode={mode}
        />
      </div>
    </div>
  );
};

export default LeadFormPage;
