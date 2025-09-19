import React, { useState, useEffect } from 'react';
import { HiXMark, HiDocumentText, HiUser, HiHeart, HiCalendar, HiExclamationTriangle, HiPlus, HiXCircle, HiTag } from 'react-icons/hi2';
import { Modal, Button, Input, Select } from '../../common';

const HealthForm = ({
  isOpen,
  onClose,
  onSubmit,
  title = "Health Issue Form",
  submitText = "Submit",
  initialData = null,
  loading = false,
  // Product suggestion props
  suggestedProducts = [],
  availableProducts = [],
  onAddProductSuggestion,
  onRemoveProductSuggestion,
  selectedProduct,
  setSelectedProduct,
  suggestionReason,
  setSuggestionReason,
  suggestionPriority,
  setSuggestionPriority,
  suggestionLoading = false,
  suggestionError = null
}) => {
  const [formData, setFormData] = useState({
    healthIssue: '',
    gender: 'both',
    maritalStatus: 'both',
    fromAge: '',
    toAge: ''
  });

  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData({
          healthIssue: String(initialData.healthIssue || ''),
          gender: initialData.gender || 'both',
          maritalStatus: initialData.maritalStatus || 'both',
          fromAge: String(initialData.fromAge || ''),
          toAge: String(initialData.toAge || '')
        });
      } else {
        // Reset form for new health issue
        setFormData({
          healthIssue: '',
          gender: 'both',
          maritalStatus: 'both',
          fromAge: '',
          toAge: ''
        });
      }
      setErrors({});
    }
  }, [isOpen, initialData]);

  // Handle input changes
  const handleChange = (field, value) => {
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

    if (!formData.healthIssue.trim()) {
      newErrors.healthIssue = 'Health issue is required';
    }

    const fromAge = parseInt(formData.fromAge);
    const toAge = parseInt(formData.toAge);

    if (!formData.fromAge || isNaN(fromAge) || fromAge < 1 || fromAge > 150) {
      newErrors.fromAge = 'From age must be between 1 and 150';
    }

    if (!formData.toAge || isNaN(toAge) || toAge < 1 || toAge > 150) {
      newErrors.toAge = 'To age must be between 1 and 150';
    }

    if (!isNaN(fromAge) && !isNaN(toAge) && fromAge > toAge) {
      newErrors.toAge = 'To age must be greater than or equal to from age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Convert numeric fields
      const submitData = {
        ...formData,
        fromAge: parseInt(formData.fromAge),
        toAge: parseInt(formData.toAge)
      };
      
      onSubmit(submitData);
    }
  };

  // Handle close
  const handleClose = () => {
    setFormData({
      healthIssue: '',
      gender: 'both',
      maritalStatus: 'both',
      fromAge: '',
      toAge: ''
    });
    setErrors({});
    onClose();
  };

  const genderOptions = [
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'both', label: 'Both' }
  ];

  const maritalStatusOptions = [
    { value: 'married', label: 'Married' },
    { value: 'unmarried', label: 'Unmarried' },
    { value: 'both', label: 'Both' }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      size="sm"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HiDocumentText className="h-5 w-5 mr-2 text-[#22c55e]" />
            Health Issue Information
          </h3>
          
          <div className="space-y-4">
            <Input
              label="Health Issue *"
              value={formData.healthIssue}
              onChange={(e) => handleChange('healthIssue', e.target ? e.target.value : e)}
              placeholder="Enter health issue name"
              error={!!errors.healthIssue}
              errorMessage={errors.healthIssue}
              required
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Gender *"
                value={formData.gender}
                onChange={(value) => handleChange('gender', value)}
                options={genderOptions}
                error={!!errors.gender}
                errorMessage={errors.gender}
                required
                icon={HiUser}
              />
              
              <Select
                label="Marital Status *"
                value={formData.maritalStatus}
                onChange={(value) => handleChange('maritalStatus', value)}
                options={maritalStatusOptions}
                error={!!errors.maritalStatus}
                errorMessage={errors.maritalStatus}
                required
                icon={HiHeart}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="From Age *"
                type="number"
                value={formData.fromAge}
                onChange={(e) => handleChange('fromAge', e.target ? e.target.value : e)}
                placeholder="1"
                error={!!errors.fromAge}
                errorMessage={errors.fromAge}
                required
                icon={HiCalendar}
                min="1"
                max="150"
              />
              
              <Input
                label="To Age *"
                type="number"
                value={formData.toAge}
                onChange={(e) => handleChange('toAge', e.target ? e.target.value : e)}
                placeholder="100"
                error={!!errors.toAge}
                errorMessage={errors.toAge}
                required
                icon={HiCalendar}
                min="1"
                max="150"
              />
            </div>
          </div>
        </div>

        {/* Age Range Preview */}
        {formData.fromAge && formData.toAge && !errors.fromAge && !errors.toAge && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <HiExclamationTriangle className="h-5 w-5 text-blue-500 mr-2" />
              <span className="text-sm text-blue-700">
                This health issue will be available for ages {formData.fromAge} to {formData.toAge}
              </span>
            </div>
          </div>
        )}

        {/* Product Suggestions Section - Only show in edit mode */}
        {initialData && (
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <HiTag className="h-5 w-5 mr-2" style={{color: 'rgb(139, 195, 74)'}} />
                Suggested Products
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddProductSuggestion}
                style={{
                  color: 'rgb(139, 195, 74)',
                  borderColor: 'rgb(139, 195, 74)'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'transparent';
                  e.target.style.color = 'rgb(139, 195, 74)';
                }}
              >
                <HiPlus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>
            
            {suggestedProducts.length > 0 ? (
              <div className="space-y-2">
                {suggestedProducts.map((suggestion, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {suggestion.productId?.productName || 'Unknown Product'}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          suggestion.priority === 1 ? 'bg-red-100 text-red-800' :
                          suggestion.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100'
                        }`} style={suggestion.priority === 3 ? {color: 'rgb(85, 139, 47)'} : {}}>
                          {suggestion.priority === 1 ? 'High' : suggestion.priority === 2 ? 'Medium' : 'Low'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {suggestion.suggestionReason}
                      </p>
                      <p className="text-xs text-gray-500">
                        Price: ₹{suggestion.productId?.price || 'N/A'} | 
                        Weight: {suggestion.productId?.weight || 'N/A'}g
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRemoveProductSuggestion(suggestion.productId._id)}
                      className="text-red-600 hover:text-red-900 ml-2"
                    >
                      <HiXCircle className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                <HiTag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <p>No products suggested yet</p>
                <p className="text-sm">Click "Add Product" to suggest products for this health issue</p>
              </div>
            )}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={loading}
            size="xs"
            className="hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="gradient"
            disabled={loading}
            size="xs"
          >
            {loading ? (
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Processing...
              </div>
            ) : (
              submitText
            )}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default HealthForm;

