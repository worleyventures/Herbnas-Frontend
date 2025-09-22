import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import LeadFormStepper from '../../components/dashboard/leads/LeadFormStepper';
import { createLead, updateLead, getLeadById, clearLeadSuccess, clearLeadErrors } from '../../redux/actions/leadActions';
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
  
  // Load lead data if editing and we have an ID
  useEffect(() => {
    if (mode === 'edit' && leadId && !selectedLead) {
      dispatch(getLeadById(leadId));
    }
  }, [dispatch, mode, leadId, selectedLead]);

  // Handle success states - navigate away from form
  useEffect(() => {
    if (createSuccess) {
      // Show success message and navigate to leads table
      dispatch(clearLeadSuccess());
      navigate('/leads/table');
    }
  }, [createSuccess, navigate, dispatch]);

  useEffect(() => {
    if (updateSuccess) {
      // Show success message and navigate to leads table
      dispatch(clearLeadSuccess());
      navigate('/leads/table');
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
  
  const handleSubmit = (formData) => {
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
      
      dispatch(updateLead({ leadId: currentLead._id, leadData: formData }));
    } else {
      console.log('Creating new lead with data:', JSON.stringify(formData, null, 2));
      
      // Validate required fields before sending
      if (!formData.customerName || !formData.customerMobile) {
        console.error('Missing required fields:', {
          customerName: formData.customerName,
          customerMobile: formData.customerMobile
        });
        return;
      }
      
      // Clean up the data before sending
      const cleanedData = {
        customerName: formData.customerName?.trim(),
        customerMobile: formData.customerMobile?.trim(),
        customerEmail: formData.customerEmail?.trim() || undefined,
        age: formData.age ? parseInt(formData.age) : undefined,
        gender: formData.gender || undefined,
        maritalStatus: formData.maritalStatus || undefined,
        healthIssues: formData.healthIssues || [],
        products: formData.products || [],
        payment: formData.payment || undefined,
        dispatchedFrom: formData.dispatchedFrom || undefined,
        address: formData.address || {},
        leadStatus: formData.leadStatus || 'new_lead',
        reminders: formData.reminders || []
      };
      
      console.log('Cleaned data being sent:', JSON.stringify(cleanedData, null, 2));
      dispatch(createLead(cleanedData));
    }
  };

  const handleCancel = () => {
    navigate(-1); // Go back to previous page
  };

  // Show loading state while form is submitting or loading lead data
  const isLoading = createLoading || updateLoading || leadLoading;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Form Content */}
      <div className="max-w-7xl mx-auto py-6" style={{overflow: 'visible'}}>
        <LeadFormStepper
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
