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
  HiXCircle,
  HiXMark
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea } from '../common';
import { createRawMaterial, createBatchWithSets, updateRawMaterial, getRawMaterialById } from '../../redux/actions/inventoryActions';
import { addNotification } from '../../redux/slices/uiSlice';
import { GST_PERCENTAGE_OPTIONS, getGstPercentageError } from '../../utils/gstUtils';

const RawMaterialForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  const { currentRawMaterial, loading, updateLoading } = useSelector((state) => state.inventory);

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
    notes: '',
    // New fields for buy sets option
    materialType: 'individual', // 'individual' or 'sets'
    batchId: '',
    quantity: '',
    unitPrice: ''
  });

  const [isBuySetsMode, setIsBuySetsMode] = useState(false);

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

  // Toggle between normal form and buy sets mode
  const toggleBuySetsMode = () => {
    setIsBuySetsMode(!isBuySetsMode);
    // Reset form data when switching modes
    setFormData(prev => ({
      ...prev,
      materialType: !isBuySetsMode ? 'sets' : 'individual',
      batchId: '',
      quantity: '',
      unitPrice: ''
    }));
  };

  // Set options
  const setOptions = [
    { value: 'SET1', label: 'SET1' },
    { value: 'SET2', label: 'SET2' },
    { value: 'SET3', label: 'SET3' }
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

  // GST percentage options (imported from utility)
  const gstPercentageOptions = GST_PERCENTAGE_OPTIONS;

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

    if (isBuySetsMode) {
      // Buy sets validations
      if (!formData.batchId.trim()) {
        newErrors.batchId = 'Batch ID is required';
      }

      if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      }

      if (!formData.UOM) {
        newErrors.UOM = 'Unit of measure is required';
      }

      if (!formData.unitPrice || parseFloat(formData.unitPrice) <= 0) {
        newErrors.unitPrice = 'Unit price must be greater than 0';
      }
    } else {
      // Individual material validations
      if (!formData.materialId.trim()) {
        newErrors.materialId = 'Material ID is required';
      }

      if (!formData.materialName.trim()) {
        newErrors.materialName = 'Material name is required';
      }

      if (!formData.UOM) {
        newErrors.UOM = 'Unit of measure is required';
      }

      if (!formData.price || parseFloat(formData.price) <= 0) {
        newErrors.price = 'Price must be greater than 0';
      }
    }

    // Common validations
    if (!formData.category) {
      newErrors.category = 'Category is required';
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

    const gstError = getGstPercentageError(formData.gstPercentage);
    if (gstError) {
      newErrors.gstPercentage = gstError;
    }

    if (!isBuySetsMode && (!formData.stockQuantity || parseFloat(formData.stockQuantity) < 0)) {
      newErrors.stockQuantity = 'Stock quantity must be 0 or greater';
    }

    if (!isBuySetsMode && formData.minStockLevel && parseFloat(formData.minStockLevel) < 0) {
      newErrors.minStockLevel = 'Minimum stock level must be 0 or greater';
    }

    if (!isBuySetsMode && formData.maxStockLevel && parseFloat(formData.maxStockLevel) < 0) {
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
        materialType: formData.materialType,
        category: formData.category,
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

      // Add fields based on mode
      if (isBuySetsMode) {
        rawMaterialData.materialType = 'sets';
        rawMaterialData.batchId = formData.batchId.trim();
        rawMaterialData.quantity = parseFloat(formData.quantity);
        rawMaterialData.UOM = formData.UOM;
        rawMaterialData.unitPrice = parseFloat(formData.unitPrice);
      } else {
        rawMaterialData.materialType = 'individual';
        rawMaterialData.materialId = formData.materialId.trim().toUpperCase();
        rawMaterialData.materialName = formData.materialName.trim();
        rawMaterialData.UOM = formData.UOM;
        rawMaterialData.price = parseFloat(formData.price);
      }

      console.log('Sending raw material data:', rawMaterialData);

      let result;
      if (isEdit) {
        result = await dispatch(updateRawMaterial({ 
          rawMaterialId: id, 
          rawMaterialData 
        })).unwrap();
        console.log('Update result:', result);
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Raw material updated successfully'
        }));
      } else {
        result = await dispatch(createRawMaterial(rawMaterialData)).unwrap();
        console.log('Create result:', result);
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: isBuySetsMode ? 'Set created successfully' : 'Raw material created successfully'
        }));
      }

      // Check if the operation was successful and navigate immediately
      if (result && (result.success || result.data)) {
        navigate('/inventory');
      } else {
        throw new Error('Operation failed - no success response received');
      }
    } catch (error) {
      console.error('Form submission error:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error || 'Failed to save raw material'
      }));
      // Stay on form if there's an error - no navigation
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || updateLoading) {
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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2">
                <HiCube className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {isEdit 
                    ? 'Edit Raw Material' 
                    : isBuySetsMode 
                      ? 'Add New Set' 
                      : 'Add Raw Material'
                  }
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit 
                    ? 'Update raw material information' 
                    : isBuySetsMode
                      ? 'Add new set to inventory'
                      : 'Add new raw material to inventory'
                  }
                </p>
              </div>
            </div>
            {/* Toggle Button */}
            <Button
              type="button"
              onClick={toggleBuySetsMode}
              variant={isBuySetsMode ? "gradient" : "outline"}
              size="sm"
              icon={HiCube}
            >
              {isBuySetsMode ? 'Switch to Materials' : 'Buy Sets'}
            </Button>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} id="raw-material-form" className="space-y-8">

          {/* Basic Information */}
          <div id="basic-info-section" className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isBuySetsMode ? (
                <>
                  <Input
                    label="Batch ID"
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleChange}
                    placeholder="Enter batch ID"
                    error={!!errors.batchId}
                    errorMessage={errors.batchId}
                    required
                  />
                  <Input
                    label="Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter total quantity"
                    error={!!errors.quantity}
                    errorMessage={errors.quantity}
                    required
                  />
                  <Select
                    label="Unit of Measure"
                    name="UOM"
                    value={formData.UOM}
                    onChange={handleChange}
                    options={uomOptions}
                    placeholder="Select unit of measure"
                    error={!!errors.UOM}
                    errorMessage={errors.UOM}
                    required
                  />
                </>
              ) : (
                <>
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
                    label="Unit of Measure"
                    name="UOM"
                    value={formData.UOM}
                    onChange={handleChange}
                    options={uomOptions}
                    placeholder="Select unit of measure"
                    error={!!errors.UOM}
                    errorMessage={errors.UOM}
                    required
                  />
                </>
              )}
              
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
            </div>
          </div>

          {/* Pricing Information */}
          <div id="pricing-section" className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Pricing Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {isBuySetsMode ? (
                <Input
                  label="Unit Price"
                  name="unitPrice"
                  type="number"
                  step="0.01"
                  value={formData.unitPrice}
                  onChange={handleChange}
                  placeholder="0.00"
                  error={!!errors.unitPrice}
                  errorMessage={errors.unitPrice}
                  required
                />
              ) : (
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
              )}
              <Select
                label="GST Percentage"
                name="gstPercentage"
                value={formData.gstPercentage}
                onChange={handleChange}
                options={gstPercentageOptions}
                placeholder="Select GST percentage"
                error={!!errors.gstPercentage}
                errorMessage={errors.gstPercentage}
                required
              />
            </div>
            
            {/* Total calculation for sets mode */}
            {isBuySetsMode && formData.unitPrice && formData.gstPercentage && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-blue-900 mb-2">Total Calculation</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Unit Price:</span>
                    <span className="font-medium">₹{parseFloat(formData.unitPrice || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">GST ({formData.gstPercentage}%):</span>
                    <span className="font-medium">₹{((parseFloat(formData.unitPrice || 0) * parseFloat(formData.gstPercentage || 0)) / 100).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-1">
                    <div className="flex justify-between">
                      <span className="text-blue-900 font-medium">Total per Unit:</span>
                      <span className="text-blue-900 font-bold">₹{(parseFloat(formData.unitPrice || 0) + (parseFloat(formData.unitPrice || 0) * parseFloat(formData.gstPercentage || 0)) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
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

          {/* Stock Information - Only show for individual materials */}
          {!isBuySetsMode && (
            <div id="additional-info-section" className="space-y-4">
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
          )}

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
              disabled={isSubmitting || updateLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={isEdit ? HiCheckCircle : HiPlus}
            >
              {(isSubmitting || updateLoading) ? 'Saving...' : (isEdit ? 'Update Raw Material' : 'Add Raw Material')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RawMaterialForm;
