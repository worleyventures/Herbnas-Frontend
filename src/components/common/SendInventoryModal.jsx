import React, { useState, useEffect } from 'react';
import { HiXMark, HiTruck, HiBuildingOffice2, HiCube } from 'react-icons/hi2';
import { Button, Input, Select, TextArea } from './index';

const SendInventoryModal = ({
  isOpen,
  onClose,
  inventoryItems = [],
  branches = [],
  onSendInventory,
  loading = false
}) => {
  const [formData, setFormData] = useState({
    branchId: '',
    trackingId: '',
    notes: '',
    items: []
  });
  const [errors, setErrors] = useState({});

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        branchId: '',
        trackingId: '',
        notes: '',
        items: inventoryItems.map(item => ({
          inventoryId: item._id,
          productName: item.product?.productName || 'Unknown Product',
          availableQuantity: item.availableQuantity || 0,
          quantityToSend: 0,
          selected: false
        }))
      });
      setErrors({});
    }
  }, [isOpen, inventoryItems]);

  // Generate tracking ID when branch is selected
  useEffect(() => {
    if (formData.branchId && !formData.trackingId) {
      const selectedBranch = branches.find(branch => branch._id === formData.branchId);
      if (selectedBranch) {
        const timestamp = Date.now().toString().slice(-6);
        const trackingId = `TRK-${selectedBranch.branchCode}-${timestamp}`;
        setFormData(prev => ({ ...prev, trackingId }));
      }
    }
  }, [formData.branchId, branches]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { ...item, [field]: value }
          : item
      )
    }));
  };

  const handleItemToggle = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index 
          ? { 
              ...item, 
              selected: !item.selected,
              quantityToSend: !item.selected ? 1 : 0
            }
          : item
      )
    }));
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.branchId) {
      newErrors.branchId = 'Please select a branch';
    }

    if (!formData.trackingId.trim()) {
      newErrors.trackingId = 'Tracking ID is required';
    }

    const selectedItems = formData.items.filter(item => item.selected);
    if (selectedItems.length === 0) {
      newErrors.items = 'Please select at least one inventory item to send';
    }

    // Validate quantities
    selectedItems.forEach((item, index) => {
      if (item.quantityToSend <= 0) {
        newErrors[`quantity_${index}`] = 'Quantity must be greater than 0';
      }
      if (item.quantityToSend > item.availableQuantity) {
        newErrors[`quantity_${index}`] = 'Quantity cannot exceed available stock';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const selectedItems = formData.items
      .filter(item => item.selected)
      .map(item => ({
        inventoryId: item.inventoryId,
        quantity: parseInt(item.quantityToSend)
      }));

    const sendData = {
      branchId: formData.branchId,
      trackingId: formData.trackingId.trim(),
      notes: formData.notes.trim(),
      items: selectedItems
    };

    onSendInventory(sendData);
  };

  const branchOptions = branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  }));

  const selectedBranch = branches.find(branch => branch._id === formData.branchId);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="bg-white px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <HiTruck className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Send Inventory to Branch
                    </h3>
                    <p className="text-sm text-gray-500">
                      Select inventory items to send to a branch
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <HiXMark className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="bg-white px-6 py-4 space-y-6">
              {/* Branch Selection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Destination Branch"
                  name="branchId"
                  value={formData.branchId}
                  onChange={handleChange}
                  options={branchOptions}
                  placeholder="Select a branch"
                  error={!!errors.branchId}
                  errorMessage={errors.branchId}
                  required
                />
                <Input
                  label="Tracking ID"
                  name="trackingId"
                  value={formData.trackingId}
                  onChange={handleChange}
                  placeholder="Auto-generated tracking ID"
                  error={!!errors.trackingId}
                  errorMessage={errors.trackingId}
                  required
                  disabled
                />
              </div>

              {/* Branch Details */}
              {selectedBranch && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-600" />
                    <h4 className="font-medium text-gray-900">Branch Details</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Branch Name:</span>
                      <span className="ml-2 font-medium">{selectedBranch.branchName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Branch Code:</span>
                      <span className="ml-2 font-medium">{selectedBranch.branchCode}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500">Address:</span>
                      <span className="ml-2 font-medium">
                        {typeof selectedBranch.branchAddress === 'object' && selectedBranch.branchAddress !== null
                          ? `${selectedBranch.branchAddress.street || ''}, ${selectedBranch.branchAddress.city || ''}, ${selectedBranch.branchAddress.state || ''} - ${selectedBranch.branchAddress.pinCode || ''}`
                          : selectedBranch.branchAddress || 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Inventory Items Selection */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">Select Inventory Items</h4>
                {errors.items && (
                  <p className="text-sm text-red-600 mb-4">{errors.items}</p>
                )}
                
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {formData.items.map((item, index) => (
                    <div key={item.inventoryId} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={() => handleItemToggle(index)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <HiCube className="h-5 w-5 text-gray-400" />
                              <span className="font-medium text-gray-900">
                                {item.productName}
                              </span>
                            </div>
                            <p className="text-sm text-gray-500">
                              Available: {item.availableQuantity} units
                            </p>
                          </div>
                        </div>
                        
                        {item.selected && (
                          <div className="flex items-center space-x-2">
                            <label className="text-sm text-gray-700">Quantity:</label>
                            <Input
                              type="number"
                              min="1"
                              max={item.availableQuantity}
                              value={item.quantityToSend}
                              onChange={(e) => handleItemChange(index, 'quantityToSend', e.target.value)}
                              className="w-20"
                              error={!!errors[`quantity_${index}`]}
                            />
                            {errors[`quantity_${index}`] && (
                              <p className="text-xs text-red-600">{errors[`quantity_${index}`]}</p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <TextArea
                label="Notes (Optional)"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder="Add any notes about this inventory transfer..."
                rows={3}
              />
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex justify-end space-x-3">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                icon={HiTruck}
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Inventory'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SendInventoryModal;

