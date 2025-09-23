import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiArrowLeft, 
  HiCube, 
  HiBuildingOffice2, 
  HiExclamationTriangle, 
  HiCheckCircle, 
  HiPlus, 
  HiXCircle 
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea } from '../common';
import { createRawMaterial, updateRawMaterial, getRawMaterialById } from '../../redux/actions/inventoryActions';
import { addNotification } from '../../redux/slices/uiSlice';

const RawMaterialForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  const { currentRawMaterial, loading } = useSelector((state) => state.inventory);

  const [formData, setFormData] = useState({
    materialId: '',
    materialName: '',
    category: '',
    UOM: 'kg',
    price: '',
    supplierId: '',
    supplierName: '',
    gstNumber: '',
    hsn: '',
    gstPercentage: '',
    stockQuantity: '',
    minStockLevel: '',
    maxStockLevel: '',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // UOM options
  const uomOptions = [
    { value: 'kg', label: 'Kilogram (kg)' },
    { value: 'g', label: 'Gram (g)' },
    { value: 'l', label: 'Liter (l)' },
    { value: 'ml', label: 'Milliliter (ml)' },
    { value: 'pcs', label: 'Pieces (pcs)' },
    { value: 'box', label: 'Box' },
    { value: 'pack', label: 'Pack' }
  ];

  // Category options
  const categoryOptions = [
    { value: 'herbs', label: 'Herbs' },
    { value: 'spices', label: 'Spices' },
    { value: 'oils', label: 'Oils' },
    { value: 'powders', label: 'Powders' },
    { value: 'extracts', label: 'Extracts' },
    { value: 'packaging', label: 'Packaging' },
    { value: 'other', label: 'Other' }
  ];

  // Load raw material data for editing
  useEffect(() => {
    if (isEdit && id) {
      dispatch(getRawMaterialById(id));
    }
  }, [dispatch, isEdit, id]);

  // Update form data when raw material is loaded
  useEffect(() => {
    if (isEdit && currentRawMaterial) {
      setFormData({
        materialId: currentRawMaterial.materialId || '',
        materialName: currentRawMaterial.materialName || '',
        category: currentRawMaterial.category || '',
        UOM: currentRawMaterial.UOM || 'kg',
        price: currentRawMaterial.price?.toString() || '',
        supplierId: currentRawMaterial.supplierId || '',
        supplierName: currentRawMaterial.supplierName || '',
        gstNumber: currentRawMaterial.gstNumber || '',
        hsn: currentRawMaterial.hsn || '',
        gstPercentage: currentRawMaterial.gstPercentage?.toString() || '',
        stockQuantity: currentRawMaterial.stockQuantity?.toString() || '',
        minStockLevel: currentRawMaterial.minStockLevel?.toString() || '',
        maxStockLevel: currentRawMaterial.maxStockLevel?.toString() || '',
        notes: currentRawMaterial.notes || ''
      });
    }
  }, [isEdit, currentRawMaterial]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.materialId.trim()) {
      newErrors.materialId = 'Material ID is required';
    }

    if (!formData.materialName.trim()) {
      newErrors.materialName = 'Material name is required';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.UOM) {
      newErrors.UOM = 'Unit of measure is required';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be greater than 0';
    }

    if (!formData.supplierName.trim()) {
      newErrors.supplierName = 'Supplier name is required';
    }

    if (!formData.gstNumber.trim()) {
      newErrors.gstNumber = 'GST number is required';
    }

    if (!formData.hsn.trim()) {
      newErrors.hsn = 'HSN code is required';
    }

    if (!formData.gstPercentage || parseFloat(formData.gstPercentage) < 0) {
      newErrors.gstPercentage = 'GST percentage must be 0 or greater';
    }

    if (!formData.stockQuantity || parseFloat(formData.stockQuantity) < 0) {
      newErrors.stockQuantity = 'Stock quantity must be 0 or greater';
    }

    if (formData.minStockLevel && parseFloat(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = 'Minimum stock level must be 0 or greater';
    }

    if (formData.maxStockLevel && parseFloat(formData.maxStockLevel) < 0) {
      newErrors.maxStockLevel = 'Maximum stock level must be 0 or greater';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const rawMaterialData = {
        materialId: formData.materialId.trim().toUpperCase(),
        materialName: formData.materialName.trim(),
        category: formData.category,
        UOM: formData.UOM,
        price: parseFloat(formData.price),
        supplierId: formData.supplierId.trim() || undefined,
        supplierName: formData.supplierName.trim(),
        gstNumber: formData.gstNumber.trim(),
        hsn: formData.hsn.trim(),
        gstPercentage: parseFloat(formData.gstPercentage),
        stockQuantity: parseFloat(formData.stockQuantity),
        minStockLevel: formData.minStockLevel ? parseFloat(formData.minStockLevel) : 0,
        maxStockLevel: formData.maxStockLevel ? parseFloat(formData.maxStockLevel) : 0,
        notes: formData.notes.trim() || undefined
      };

      console.log('Sending raw material data:', rawMaterialData);

      if (isEdit) {
        await dispatch(updateRawMaterial({ 
          rawMaterialId: id, 
          rawMaterialData 
        })).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Raw material updated successfully'
        }));
      } else {
        await dispatch(createRawMaterial(rawMaterialData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Raw material created successfully'
        }));
      }

      navigate('/inventory');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error || 'Failed to save raw material'
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => navigate('/inventory')}
                variant="ghost"
                size="sm"
                icon={HiArrowLeft}
                className="text-gray-500 hover:text-gray-700"
              >
                Back
              </Button>
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiCube className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">
                  {isEdit ? 'Edit Raw Material' : 'Add Raw Material'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Update raw material information' : 'Add new raw material to inventory'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Material ID"
                name="materialId"
                value={formData.materialId}
                onChange={handleChange}
                placeholder="Enter material ID (e.g., RM001)"
                error={!!errors.materialId}
                errorMessage={errors.materialId}
                required
                disabled={isEdit}
              />
              <Input
                label="Material Name"
                name="materialName"
                value={formData.materialName}
                onChange={handleChange}
                placeholder="Enter material name"
                error={!!errors.materialName}
                errorMessage={errors.materialName}
                required
              />
              <Select
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                options={categoryOptions}
                placeholder="Select category"
                error={!!errors.category}
                errorMessage={errors.category}
                required
              />
              <Select
                label="Unit of Measure"
                name="UOM"
                value={formData.UOM}
                onChange={handleChange}
                options={uomOptions}
                placeholder="Select UOM"
                error={!!errors.UOM}
                errorMessage={errors.UOM}
                required
              />
            </div>
          </div>

          {/* Pricing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Price per Unit"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                error={!!errors.price}
                errorMessage={errors.price}
                required
              />
              <Input
                label="GST Percentage"
                name="gstPercentage"
                type="number"
                step="0.01"
                value={formData.gstPercentage}
                onChange={handleChange}
                placeholder="0.00"
                error={!!errors.gstPercentage}
                errorMessage={errors.gstPercentage}
                required
              />
            </div>
          </div>

          {/* Supplier Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Supplier ID"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleChange}
                placeholder="Enter supplier ID (optional)"
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
              />
            </div>
          </div>

          {/* Stock Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Stock Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Stock Quantity"
                name="stockQuantity"
                type="number"
                step="0.01"
                value={formData.stockQuantity}
                onChange={handleChange}
                placeholder="0.00"
                error={!!errors.stockQuantity}
                errorMessage={errors.stockQuantity}
                required
              />
              <Input
                label="Minimum Stock Level"
                name="minStockLevel"
                type="number"
                step="0.01"
                value={formData.minStockLevel}
                onChange={handleChange}
                placeholder="0.00"
                error={!!errors.minStockLevel}
                errorMessage={errors.minStockLevel}
              />
              <Input
                label="Maximum Stock Level"
                name="maxStockLevel"
                type="number"
                step="0.01"
                value={formData.maxStockLevel}
                onChange={handleChange}
                placeholder="0.00"
                error={!!errors.maxStockLevel}
                errorMessage={errors.maxStockLevel}
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <TextArea
              label="Notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
            <Button
              type="button"
              onClick={() => navigate('/inventory')}
              variant="ghost"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={isEdit ? HiCheckCircle : HiPlus}
            >
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Raw Material' : 'Add Raw Material')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialForm;
