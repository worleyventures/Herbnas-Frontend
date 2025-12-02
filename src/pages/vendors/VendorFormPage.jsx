import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiBuildingOffice2, HiCheckCircle } from 'react-icons/hi2';
import { Button, Input } from '../../components/common';
import { createSupplier } from '../../redux/actions/inventoryActions';
import { addNotification } from '../../redux/slices/uiSlice';

const VendorFormPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});

  const [formData, setFormData] = useState({
    supplierId: '',
    supplierName: '',
    gstNumber: '',
    hsn: '',
    contactName: '',
    phone: '',
    email: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.supplierName || formData.supplierName.trim().length < 2) {
      newErrors.supplierName = 'Supplier name is required (minimum 2 characters)';
    }

    if (!formData.gstNumber || formData.gstNumber.trim().length < 10 || formData.gstNumber.trim().length > 20) {
      newErrors.gstNumber = 'GST number is required (10-20 characters)';
    }

    if (!formData.hsn || formData.hsn.trim().length === 0) {
      newErrors.hsn = 'HSN code is required';
    }


    // Optional field validations
    if (formData.phone && formData.phone.trim().length > 0) {
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.phone.trim())) {
        newErrors.phone = 'Phone number must be 10 digits';
      }
    }

    if (formData.email && formData.email.trim().length > 0) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Please enter a valid email address';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form',
        duration: 5000
      }));
      return;
    }

    setIsSubmitting(true);

    try {
      // Create supplier using dedicated endpoint
      const supplierData = {
        supplierId: formData.supplierId?.trim() || undefined,
        supplierName: formData.supplierName.trim(),
        gstNumber: formData.gstNumber.trim(),
        hsn: formData.hsn.trim(),
        contactName: formData.contactName?.trim() || undefined,
        phone: formData.phone?.trim() || undefined,
        email: formData.email?.trim() || undefined
      };

      await dispatch(createSupplier(supplierData)).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Vendor Added Successfully',
        message: `Vendor "${formData.supplierName}" has been added successfully`,
        duration: 5000
      }));

      // Navigate back to vendors page
      navigate('/vendors');
    } catch (error) {
      console.error('Error creating vendor:', error);
      // Extract error message from different possible formats
      let errorMessage = 'An error occurred while adding the vendor. Please try again.';
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (error?.payload) {
        errorMessage = error.payload;
      }
      
      dispatch(addNotification({
        type: 'error',
        title: 'Failed to Add Vendor',
        message: errorMessage,
        duration: 5000
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Vendor Information */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <HiBuildingOffice2 className="h-5 w-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Vendor Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Supplier ID"
              name="supplierId"
              value={formData.supplierId}
              onChange={handleChange}
              placeholder="Enter supplier ID (optional)"
              helperText="Optional: Unique identifier for the supplier"
              inputClassName="border-0 border-b-2 border-gray-300 rounded-none shadow-none hover:shadow-none focus:border-[#8bc34a]"
            />

            <Input
              label="Supplier Name"
              name="supplierName"
              value={formData.supplierName}
              onChange={handleChange}
              placeholder="Enter supplier name"
              error={!!errors.supplierName}
              errorMessage={errors.supplierName}
              required
              inputClassName="border-0 border-b-2 border-gray-300 rounded-none shadow-none hover:shadow-none focus:border-[#8bc34a]"
            />

            <Input
              label="GST Number"
              name="gstNumber"
              value={formData.gstNumber}
              onChange={handleChange}
              placeholder="Enter GST number (10-20 characters)"
              error={!!errors.gstNumber}
              errorMessage={errors.gstNumber}
              required
              inputClassName="border-0 border-b-2 border-gray-300 rounded-none shadow-none hover:shadow-none focus:border-[#8bc34a]"
            />

            <Input
              label="HSN Code"
              name="hsn"
              value={formData.hsn}
              onChange={handleChange}
              placeholder="Enter HSN code"
              error={!!errors.hsn}
              errorMessage={errors.hsn}
              required
              inputClassName="border-0 border-b-2 border-gray-300 rounded-none shadow-none hover:shadow-none focus:border-[#8bc34a]"
            />
          </div>
        </div>

        {/* Contact Information */}
        <div className="space-y-4 border-t border-gray-200 pt-6">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
          <p className="text-sm text-gray-500">Optional contact details for the vendor</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Contact Name"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              placeholder="Enter contact person name"
              inputClassName="border-0 border-b-2 border-gray-300 rounded-none shadow-none hover:shadow-none focus:border-[#8bc34a]"
            />

            <Input
              label="Phone Number"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter 10-digit phone number"
              error={!!errors.phone}
              errorMessage={errors.phone}
              inputClassName="border-0 border-b-2 border-gray-300 rounded-none shadow-none hover:shadow-none focus:border-[#8bc34a]"
            />

            <Input
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter email address"
              error={!!errors.email}
              errorMessage={errors.email}
              inputClassName="border-0 border-b-2 border-gray-300 rounded-none shadow-none hover:shadow-none focus:border-[#8bc34a]"
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate('/vendors')}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={isSubmitting}
            icon={isSubmitting ? undefined : HiCheckCircle}
          >
            {isSubmitting ? 'Adding Vendor...' : 'Add Vendor'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default VendorFormPage;

