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
  HiExclamationTriangle,
  HiPlus,
  HiTrash,
  HiArrowLeft
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
    rawMaterials: [{ rawMaterialId: '', quantity: '', uom: '', stock: 0 }],
    QCNotes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSetsMode, setIsSetsMode] = useState(false);

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

  // Raw materials options - only show materials with stock > 0
  const rawMaterialOptions = rawMaterials
    .filter(rawMaterial => {
      // For editing: include materials that were used in this production even if current stock is 0
      if (isEdit && currentProduction?.rawMaterials?.some(rm => rm.rawMaterialId === rawMaterial._id)) {
        return true;
      }
      // For new production: only show materials with stock > 0
      return rawMaterial.stockQuantity > 0;
    })
    .map(rawMaterial => {
      // Always show current available stock in the dropdown options (like add form)
      const availableStock = rawMaterial.stockQuantity;
      
      // For SETs, show the complete sets quantity in the label
      const displayLabel = rawMaterial.materialType === 'sets' 
        ? `${rawMaterial.materialName} (${rawMaterial.materialId}) - Complete Sets: ${availableStock} ${rawMaterial.UOM}`
        : `${rawMaterial.materialName} (${rawMaterial.materialId}) - Stock: ${availableStock} ${rawMaterial.UOM}`;
      
      return {
        value: rawMaterial._id,
        label: displayLabel,
        stock: availableStock,
        uom: rawMaterial.UOM,
        materialType: rawMaterial.materialType
      };
    });

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
      // Check if any raw materials are SETs
      const hasSetsMaterials = currentProduction.rawMaterials?.some(
        rm => rm.rawMaterialId?.materialType === 'sets'
      );
      
      setIsSetsMode(hasSetsMaterials);
      
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
        // Start with fresh empty raw material fields for editing
        rawMaterials: [{ rawMaterialId: '', quantity: '', uom: '', stock: 0 }],
        QCNotes: currentProduction.QCNotes || ''
      });
    }
  }, [isEdit, currentProduction]);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newFormData = {
        ...prev,
        [name]: value
      };
      
      // Clear QC status when production status changes away from completed
      if (name === 'productionStatus' && value !== 'completed') {
        newFormData.QCstatus = '';
      }
      
      return newFormData;
    });
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle raw material changes
  const handleRawMaterialChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map((item, i) => {
        if (i === index) {
          const updatedItem = { ...item, [field]: value };
          
          // If changing rawMaterialId, also store the UOM and stock info
          if (field === 'rawMaterialId') {
            const selectedRawMaterial = rawMaterials.find(rm => rm._id === value);
            if (selectedRawMaterial) {
              updatedItem.uom = selectedRawMaterial.UOM;
              // Always use current available stock (like add form)
              updatedItem.stock = selectedRawMaterial.stockQuantity;
              
              // If the selected raw material is SETs, automatically set quantity to complete sets quantity
              if (selectedRawMaterial.materialType === 'sets') {
                updatedItem.quantity = selectedRawMaterial.stockQuantity.toString();
              }
            }
          }
          
          return updatedItem;
        }
        return item;
      })
    }));
    
    // Clear errors for raw materials
    if (errors.rawMaterials) {
      setErrors(prev => ({
        ...prev,
        rawMaterials: ''
      }));
    }
  };

  // Add new raw material
  const addRawMaterial = () => {
    setFormData(prev => ({
      ...prev,
      rawMaterials: [...prev.rawMaterials, { rawMaterialId: '', quantity: '', uom: '', stock: 0 }]
    }));
  };

  // Remove raw material
  const removeRawMaterial = (index) => {
    if (formData.rawMaterials.length > 1) {
      setFormData(prev => ({
        ...prev,
        rawMaterials: prev.rawMaterials.filter((_, i) => i !== index)
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Only validate required fields when creating (not editing)
    if (!isEdit) {
      if (!formData.productId) {
        newErrors.productId = 'Product is required';
      }

      if (!formData.manufacturedDate) {
        newErrors.manufacturedDate = 'Manufactured date is required';
      }

      if (!formData.quantity || formData.quantity <= 0) {
        newErrors.quantity = 'Quantity must be greater than 0';
      }

      // Validate raw materials only when creating and not in SETs mode
      if (!isSetsMode) {
        if (!formData.rawMaterials || formData.rawMaterials.length === 0) {
          newErrors.rawMaterials = 'At least one raw material is required';
        } else {
          formData.rawMaterials.forEach((rawMaterial, index) => {
            if (!rawMaterial.rawMaterialId) {
              newErrors[`rawMaterial_${index}`] = 'Raw material is required';
            }
            if (!rawMaterial.quantity || rawMaterial.quantity <= 0) {
              newErrors[`quantity_${index}`] = 'Quantity must be greater than 0';
            }
            
            // For SETs, validate that the quantity matches the available stock
            if (rawMaterial.rawMaterialId) {
              const selectedRawMaterial = rawMaterials.find(rm => rm._id === rawMaterial.rawMaterialId);
              if (selectedRawMaterial && selectedRawMaterial.materialType === 'sets') {
                if (parseInt(rawMaterial.quantity) !== selectedRawMaterial.stockQuantity) {
                  newErrors[`quantity_${index}`] = 'For SETs, quantity must match the complete sets available';
                }
              }
            }
          });
        }
      }
    }

    // Always validate date logic (regardless of create/edit)
    if (formData.expiryDate && formData.manufacturedDate) {
      const manufacturedDate = new Date(formData.manufacturedDate);
      const expiryDate = new Date(formData.expiryDate);
      if (expiryDate <= manufacturedDate) {
        newErrors.expiryDate = 'Expiry date must be after manufactured date';
      }
    }

    // Validate QC status only when production status is completed
    if (formData.productionStatus === 'completed' && !formData.QCstatus) {
      newErrors.QCstatus = 'QC status is required when production is completed';
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
        QCNotes: formData.QCNotes.trim() || undefined
      };

      // Only include rawMaterials if not in SETs mode (for editing SETs, raw materials are read-only)
      if (!isSetsMode) {
        productionData.rawMaterials = formData.rawMaterials.map(rm => ({
          rawMaterialId: rm.rawMaterialId,
          quantity: parseInt(rm.quantity)
        }));
      }

      console.log('Sending production data:', productionData);
      console.log('Raw materials being sent:', productionData.rawMaterials);

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
    <div className="min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2">
                <HiClipboardDocumentList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {isEdit ? 'Edit Production Batch' : 'Create Production Batch'}
                </h1>
                <p className="text-sm text-gray-500">
                  {isEdit ? 'Update production batch details' : 'Add a new production batch to the system'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
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
              required={!isEdit}
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
              required={!isEdit}
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

            {/* QC Status - Only show when production status is completed */}
            {formData.productionStatus === 'completed' && (
              <Select
                label="QC Status"
                name="QCstatus"
                value={formData.QCstatus}
                onChange={handleChange}
                options={QCstatusOptions}
                placeholder="Select QC status"
                error={!!errors.QCstatus}
                errorMessage={errors.QCstatus}
                required
              />
            )}

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
              required={!isEdit}
              min="1"
            />

          </div>

          {/* Raw Materials */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                {isSetsMode ? 'Raw Materials (SETs)' : 'Raw Materials'}
              </h3>
              {!isSetsMode && (
                <Button
                  type="button"
                  onClick={addRawMaterial}
                  variant="outline"
                  size="sm"
                  icon={HiPlus}
                >
                  Add Raw Material
                </Button>
              )}
            </div>
            
            {/* Raw Material Selection Fields */}
            {isSetsMode ? (
              /* SETs Mode - Show existing SETs materials as read-only */
              <>
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <HiCube className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-blue-700">
                        This production uses SETs raw materials. Raw materials cannot be modified as they represent complete sets that were used in the production process.
                      </p>
                    </div>
                  </div>
                </div>
                {currentProduction?.rawMaterials?.map((rawMaterial, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        SET Information
                      </label>
                      <div className="p-3 bg-white border border-gray-300 rounded-md">
                        <p className="text-sm font-medium text-gray-900">
                          {rawMaterial.rawMaterialId?.set || 'SET'} - Batch: {rawMaterial.rawMaterialId?.batchId || 'N/A'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Material ID: {rawMaterial.rawMaterialId?.materialId || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantity Used
                      </label>
                      <div className="p-3 bg-white border border-gray-300 rounded-md">
                        <p className="text-sm font-semibold text-gray-900">
                          {rawMaterial.quantity} {rawMaterial.rawMaterialId?.UOM || 'units'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Complete Sets Used
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                ))}
              </>
            ) : (
              /* Individual Materials Mode - Show editable fields */
              formData.rawMaterials.map((rawMaterial, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border border-gray-200 rounded-lg">
                  <div className="md:col-span-2">
                    <Select
                      label={`Raw Material ${index + 1}`}
                      name={`rawMaterial_${index}`}
                      value={rawMaterial.rawMaterialId}
                      onChange={(e) => handleRawMaterialChange(index, 'rawMaterialId', e.target.value)}
                      options={rawMaterialOptions}
                      placeholder="Select a raw material"
                      error={!!errors[`rawMaterial_${index}`]}
                      errorMessage={errors[`rawMaterial_${index}`]}
                      required={!isEdit}
                    />
                  </div>
                  <div>
                    <Input
                      label={`Quantity (${rawMaterial.uom || 'units'})`}
                      name={`quantity_${index}`}
                      type="number"
                      value={rawMaterial.quantity}
                      onChange={(e) => handleRawMaterialChange(index, 'quantity', e.target.value)}
                      placeholder={`Enter quantity (Available: ${rawMaterial.stock || 0} ${rawMaterial.uom || 'units'})`}
                      helperText={
                        rawMaterial.stock 
                          ? rawMaterial.materialType === 'sets'
                            ? `Complete Sets Available: ${rawMaterial.stock} ${rawMaterial.uom || 'units'} (Auto-filled)`
                            : `Available: ${rawMaterial.stock} ${rawMaterial.uom || 'units'}`
                          : ''
                      }
                      error={!!errors[`quantity_${index}`]}
                      errorMessage={errors[`quantity_${index}`]}
                      required={!isEdit}
                      min="1"
                      max={rawMaterial.stock || undefined}
                      disabled={rawMaterial.materialType === 'sets'}
                    />
                  </div>
                  {formData.rawMaterials.length > 1 && (
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeRawMaterial(index)}
                        variant="outline"
                        size="sm"
                        icon={HiTrash}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
            
            {errors.rawMaterials && (
              <p className="text-sm text-red-600">{errors.rawMaterials}</p>
            )}

            {/* Already Selected Materials Display (for edit mode) */}
            {isEdit && currentProduction?.rawMaterials && currentProduction.rawMaterials.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-gray-700 mb-4">Currently Selected Materials</h4>
                <div className="space-y-3">
                  {currentProduction.rawMaterials.map((rawMaterial, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {rawMaterial.rawMaterialId?.materialType === 'sets' 
                            ? `${rawMaterial.rawMaterialId?.set || 'SET'} - Batch: ${rawMaterial.rawMaterialId?.batchId || 'N/A'}`
                            : (rawMaterial.rawMaterialId?.materialName || 'Unknown Material')
                          }
                        </p>
                        <p className="text-xs text-gray-500">
                          {rawMaterial.rawMaterialId?.materialType === 'sets' 
                            ? `Material ID: ${rawMaterial.rawMaterialId?.materialId || 'N/A'}`
                            : `ID: ${rawMaterial.rawMaterialId?.materialId || 'N/A'}`
                          }
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {rawMaterial.quantity} {rawMaterial.rawMaterialId?.UOM || 'units'}
                        </p>
                        <p className="text-xs text-gray-500">
                          Original Stock: {(rawMaterial.rawMaterialId?.stockQuantity || 0) + (rawMaterial.quantity || 0)} {rawMaterial.rawMaterialId?.UOM || 'units'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* QC Notes */}
          <div className="space-y-4">
            <h4 className=''>Notes</h4>
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
