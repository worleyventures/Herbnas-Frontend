import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiShoppingBag, HiXMark, HiPlus, HiTrash } from 'react-icons/hi2';
import { Button, Input, Select, TextArea, CommonModal } from '../../common';
import { createGoodsRequest } from '../../../redux/actions/goodsRequestActions';
import { getAllProducts } from '../../../redux/actions/productActions';
import { addNotification } from '../../../redux/slices/uiSlice';

const RequestGoodsModal = ({ isOpen, onClose, onSuccess }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { products = [], loading: productsLoading } = useSelector((state) => state.products);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    items: [{ productId: '', quantity: '' }],
    priority: 'medium',
    notes: ''
  });
  const [errors, setErrors] = useState({});

  // Load products when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getAllProducts({ page: 1, limit: 1000, isActive: true }));
    }
  }, [isOpen, dispatch]);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        items: [{ productId: '', quantity: '' }],
        priority: 'medium',
        notes: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Product options
  const productOptions = products
    .filter(product => product.isActive)
    .map(product => ({
      value: product._id,
      label: `${product.productName} (${product.productId})`
    }));

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' }
  ];

  const handleInputChange = (field, value) => {
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

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));

    // Clear error
    if (errors[`items.${index}.${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`items.${index}.${field}`];
        return newErrors;
      });
    }
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: '' }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate items
    formData.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`items.${index}.productId`] = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`items.${index}.quantity`] = 'Quantity must be greater than 0';
      }
    });

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
        duration: 3000
      }));
      return;
    }

    setLoading(true);
    try {
      const requestData = {
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity)
        })),
        priority: formData.priority,
        notes: formData.notes.trim()
      };

      await dispatch(createGoodsRequest(requestData)).unwrap();

      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'Goods request created successfully',
        duration: 3000
      }));

      if (onSuccess) {
        onSuccess();
      }
      onClose();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error || 'Failed to create goods request',
        duration: 5000
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Goods"
      subtitle="Request goods for your branch"
      icon={HiShoppingBag}
      iconColor="from-blue-500 to-blue-600"
      size="xl"
      showCloseButton={true}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Items Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-gray-800">
              Requested Items *
            </label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
              icon={HiPlus}
            >
              Add Item
            </Button>
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Product *
                    </label>
                    <Select
                      options={productOptions}
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      placeholder="Select product"
                      error={!!errors[`items.${index}.productId`]}
                      errorMessage={errors[`items.${index}.productId`]}
                      disabled={productsLoading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity *
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        placeholder="Enter quantity"
                        error={errors[`items.${index}.quantity`]}
                        min="1"
                        step="1"
                        className="flex-1"
                      />
                      {formData.items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="flex-shrink-0 p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Remove item"
                        >
                          <HiTrash className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Priority and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priority *
            </label>
            <Select
              options={priorityOptions}
              value={formData.priority}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              error={!!errors.priority}
              errorMessage={errors.priority}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <TextArea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Add any additional notes or comments"
            rows={3}
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            disabled={loading}
          >
            Submit Request
          </Button>
        </div>
      </form>
    </CommonModal>
  );
};

export default RequestGoodsModal;

