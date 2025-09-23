import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  HiCheck, 
  HiXMark, 
  HiCalendar,
  HiTag,
  HiCube,
  HiClipboardDocumentList,
  HiExclamationTriangle
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea, Loading } from '../common';
import { createProduction, updateProduction, getProductionById } from '../../redux/actions/productionActions';
import { getActiveProducts } from '../../redux/actions/productActions';
import { getAllRawMaterials } from '../../redux/actions/inventoryActions';
import { addNotification } from '../../redux/slices/uiSlice';

const ProductionForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const { currentProduction, loading } = useSelector((state) => state.productions);
  const { products } = useSelector((state) => state.products);
  const { rawMaterials } = useSelector((state) => state.inventory);

  const [formData, setFormData] = useState({
    batchId: '',
    productId: '',
    manufacturedDate: '',
    expiryDate: '',
    productionStatus: 'in-progress',
    QCstatus: 'Pending',
    quantity: '',
    rawMaterialId: '',
    notes: '',
    QCNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Production status options
  const productionStatusOptions = [
    { value: 'in-progress', label: 'In Progress' },
    { value: 'on-hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' }
  ];

  // QC status options
  const QCstatusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' }
  ];

  // Product options
  const productOptions = products.map(product => ({
    value: product._id,
    label: `${product.productName} (${product.productId || 'N/A'})`
  }));

  // Raw materials options
  const rawMaterialOptions = rawMaterials.map(rawMaterial => ({
    value: rawMaterial._id,
    label: `${rawMaterial.materialName} (${rawMaterial.materialId}) - Stock: ${rawMaterial.stockQuantity} ${rawMaterial.UOM}`
  }));

  // Load products and raw materials on component mount
  useEffect(() => {
    dispatch(getActiveProducts());
    dispatch(getAllRawMaterials({ isActive: true }));
  }, [dispatch]);

  // Load production data for editing
  useEffect(() => {
    if (isEdit && id) {
      dispatch(getProductionById(id));
    }
  }, [dispatch, isEdit, id]);

  // Update form data when production is loaded for editing
  useEffect(() => {
    if (isEdit && currentProduction) {
      setFormData({
        batchId: currentProduction.batchId || '',
        productId: currentProduction.productId?._id || '',
        manufacturedDate: currentProduction.manufacturedDate 
          ? new Date(currentProduction.manufacturedDate).toISOString().split('T')[0]
          : '',
        expiryDate: currentProduction.expiryDate 
          ? new Date(currentProduction.expiryDate).toISOString().split('T')[0]
          : '',
        productionStatus: currentProduction.productionStatus || 'in-progress',
        QCstatus: currentProduction.QCstatus || 'Pending',
        quantity: currentProduction.quantity?.toString() || '',
        rawMaterialId: currentProduction.rawMaterialId || '',
        notes: currentProduction.notes || '',
        QCNotes: currentProduction.QCNotes || ''
      });
    }
  }, [isEdit, currentProduction]);

  // Handle input changes
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

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.productId) {
      newErrors.productId = 'Product is required';
    }

    if (!formData.manufacturedDate) {
      newErrors.manufacturedDate = 'Manufactured date is required';
    }

    if (formData.expiryDate && formData.manufacturedDate) {
      const manufacturedDate = new Date(formData.manufacturedDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= manufacturedDate) {
        newErrors.expiryDate = 'Expiry date must be after manufactured date';
      }
    }

    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }

    if (!formData.rawMaterialId) {
      newErrors.rawMaterialId = 'Raw material is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const productionData = {
        batchId: formData.batchId && formData.batchId.trim() ? formData.batchId.trim().replace(/\s+/g, '') : undefined,
        productId: formData.productId,
        manufacturedDate: formData.manufacturedDate,
        expiryDate: formData.expiryDate || undefined,
        productionStatus: formData.productionStatus,
        QCstatus: formData.QCstatus,
        quantity: parseInt(formData.quantity),
        rawMaterialId: formData.rawMaterialId,
        notes: formData.notes.trim() || undefined,
        QCNotes: formData.QCNotes.trim() || undefined
      };

      if (isEdit) {
        await dispatch(updateProduction({ productionId: id, productionData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Production Updated',
          message: 'Production batch updated successfully',
          duration: 3000
        }));
      } else {
        await dispatch(createProduction(productionData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Production Created',
          message: 'Production batch created successfully',
          duration: 3000
        }));
      }

      navigate('/productions');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: isEdit ? 'Update Failed' : 'Creation Failed',
        message: error || `Failed to ${isEdit ? 'update' : 'create'} production batch`,
        duration: 5000
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiClipboardDocumentList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit Production Batch' : 'Create Production Batch'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Update production batch details' : 'Add a new production batch to the system'}
                </p>
              </div>
            </div>
            <Button
              onClick={() => navigate('/productions')}
              variant="outline"
              size="sm"
              icon={HiXMark}
            >
              Cancel
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Batch ID */}
            <Input
              label="Batch ID"
              name="batchId"
              value={formData.batchId}
              onChange={handleChange}
              placeholder="Enter batch ID (optional - auto-generated if empty)"
              error={!!errors.batchId}
              errorMessage={errors.batchId}
              helperText="Leave empty to auto-generate"
            />

            {/* Product */}
            <Select
              label="Product"
              name="productId"
              value={formData.productId}
              onChange={handleChange}
              options={productOptions}
              placeholder="Select a product"
              error={!!errors.productId}
              errorMessage={errors.productId}
              required
            />

            {/* Manufactured Date */}
            <Input
              label="Manufactured Date"
              name="manufacturedDate"
              type="date"
              value={formData.manufacturedDate}
              onChange={handleChange}
              error={!!errors.manufacturedDate}
              errorMessage={errors.manufacturedDate}
              required
            />

            {/* Expiry Date */}
            <Input
              label="Expiry Date"
              name="expiryDate"
              type="date"
              value={formData.expiryDate}
              onChange={handleChange}
              error={!!errors.expiryDate}
              errorMessage={errors.expiryDate}
              helperText="Optional - leave empty if no expiry date"
            />

            {/* Production Status */}
            <Select
              label="Production Status"
              name="productionStatus"
              value={formData.productionStatus}
              onChange={handleChange}
              options={productionStatusOptions}
              placeholder="Select production status"
            />

            {/* QC Status */}
            <Select
              label="QC Status"
              name="QCstatus"
              value={formData.QCstatus}
              onChange={handleChange}
              options={QCstatusOptions}
              placeholder="Select QC status"
            />

            {/* Quantity */}
            <Input
              label="Quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              placeholder="Enter quantity"
              error={!!errors.quantity}
              errorMessage={errors.quantity}
              required
              min="1"
            />

            {/* Raw Material */}
            <Select
              label="Raw Material"
              name="rawMaterialId"
              value={formData.rawMaterialId}
              onChange={handleChange}
              options={rawMaterialOptions}
              placeholder="Select a raw material"
              error={!!errors.rawMaterialId}
              errorMessage={errors.rawMaterialId}
              required
            />
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <TextArea
              label="Production Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any production notes (optional)"
              rows={3}
            />

            <TextArea
              label="QC Notes"
              name="QCNotes"
              value={formData.QCNotes}
              onChange={handleChange}
              placeholder="Enter any QC notes (optional)"
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => navigate('/productions')}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              icon={HiCheck}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? (isEdit ? 'Updating...' : 'Creating...') : (isEdit ? 'Update Production' : 'Create Production')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductionForm;
