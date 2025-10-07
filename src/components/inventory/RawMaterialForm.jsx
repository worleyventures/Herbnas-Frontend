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
import { Button, Input, Select, TextArea, InputWithDropdown } from '../common';
import { createRawMaterial, createBatchWithSets, updateRawMaterial, getRawMaterialById, getUniqueSuppliers } from '../../redux/actions/inventoryActions';
import { addNotification } from '../../redux/slices/uiSlice';
import { GST_PERCENTAGE_OPTIONS, getGstPercentageError } from '../../utils/gstUtils';

const RawMaterialForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);

  const { currentRawMaterial, loading, updateLoading, suppliers } = useSelector((state) => state.inventory);

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
    stockQuantity: '0',
    minStockLevel: '0',
    maxStockLevel: '0',
    notes: '',
    // New fields for buy sets option
    materialType: 'individual', // 'individual' or 'sets'
    batchId: '',
    quantity: '',
    unitPrice: '',
    // Sets data - will contain 3 sets
    sets: [
      { set: 'SET1', quantity: '', unitPrice: '' },
      { set: 'SET2', quantity: '', unitPrice: '' },
      { set: 'SET3', quantity: '', unitPrice: '' }
    ]
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
      unitPrice: '',
      sets: [
        { set: 'SET1', quantity: '', unitPrice: '' },
        { set: 'SET2', quantity: '', unitPrice: '' },
        { set: 'SET3', quantity: '', unitPrice: '' }
      ]
    }));
  };

  // Function to split quantity equally among 3 sets
  const splitQuantityEqually = (totalQuantity) => {
    if (!totalQuantity || totalQuantity <= 0) return [0, 0, 0];
    const quantityPerSet = Math.floor(totalQuantity / 3);
    const remainder = totalQuantity % 3;
    return [
      quantityPerSet + (remainder > 0 ? 1 : 0),
      quantityPerSet + (remainder > 1 ? 1 : 0),
      quantityPerSet
    ];
  };

  // Update sets when total quantity or unit price changes
  const updateSetsData = (totalQuantity, unitPrice) => {
    const quantities = splitQuantityEqually(parseInt(totalQuantity) || 0);
    setFormData(prev => ({
      ...prev,
      sets: prev.sets.map((set, index) => ({
        ...set,
        quantity: quantities[index].toString(),
        unitPrice: unitPrice || ''
      }))
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

  // Supplier options for dropdown
  const supplierOptions = suppliers.map(supplier => ({
    value: supplier.supplierId,
    label: `${supplier.supplierName} (${supplier.supplierId})`,
    // description: `GST: ${supplier.gstNumber} | HSN: ${supplier.hsn} | GST%: ${supplier.gstPercentage}%`,
    supplierName: supplier.supplierName,
    gstNumber: supplier.gstNumber,
    hsn: supplier.hsn,
    gstPercentage: supplier.gstPercentage
  }));

  // Load suppliers and raw material data for editing
  useEffect(() => {
    console.log('Form initialization - isEdit:', isEdit, 'id:', id);
    // Load suppliers for dropdown
    dispatch(getUniqueSuppliers());
    
    if (isEdit && id) {
      dispatch(getRawMaterialById(id));
    } else {
      // For new materials, ensure form is in individual mode
      console.log('Initializing new material form');
      setIsBuySetsMode(false);
      setFormData(prev => {
        const newData = {
          ...prev,
          materialType: 'individual'
        };
        console.log('Initial form data:', newData);
        return newData;
      });
    }
  }, [dispatch, isEdit, id]);

  // Update form data when raw material is loaded
  useEffect(() => {
    if (isEdit && currentRawMaterial) {
      // Check if this is a SETs material and set the appropriate mode
      const isSetsMaterial = currentRawMaterial.materialType === 'sets';
      setIsBuySetsMode(isSetsMaterial);
      
      if (isSetsMaterial) {
        // For SETs materials, populate the sets-specific fields
        setFormData({
          materialType: 'sets',
          batchId: currentRawMaterial.batchId || '',
          quantity: currentRawMaterial.quantity?.toString() || '',
          unitPrice: currentRawMaterial.unitPrice?.toString() || '',
          set: currentRawMaterial.set || '',
          category: currentRawMaterial.category || '',
          UOM: currentRawMaterial.UOM || 'kg',
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
      } else {
        // For individual materials, populate the individual-specific fields
        setFormData({
          materialType: 'individual',
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
    }
  }, [isEdit, currentRawMaterial]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Form field changed: ${name} = ${value}`);
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated form data:', newData);
      return newData;
    });
    
    // Update sets data when quantity or unit price changes in sets mode
    if (isBuySetsMode && (name === 'quantity' || name === 'unitPrice')) {
      const currentQuantity = name === 'quantity' ? value : formData.quantity;
      const currentUnitPrice = name === 'unitPrice' ? value : formData.unitPrice;
      updateSetsData(currentQuantity, currentUnitPrice);
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle supplier selection with auto-fill
  const handleSupplierChange = (e) => {
    const { value } = e.target;
    console.log('Supplier changed to:', value);
    
    // Find the selected supplier
    const selectedSupplier = suppliers.find(supplier => supplier.supplierId === value);
    console.log('Selected supplier:', selectedSupplier);
    
    if (selectedSupplier) {
      // Auto-fill supplier information
      setFormData(prev => {
        const newData = {
          ...prev,
          supplierId: selectedSupplier.supplierId,
          supplierName: selectedSupplier.supplierName,
          gstNumber: selectedSupplier.gstNumber,
          hsn: selectedSupplier.hsn,
          gstPercentage: selectedSupplier.gstPercentage.toString()
        };
        console.log('Updated form data with supplier info:', newData);
        return newData;
      });
    } else {
      // If no supplier selected, just update supplierId
      setFormData(prev => {
        const newData = {
          ...prev,
          supplierId: value
        };
        console.log('Updated form data with supplier ID only:', newData);
        return newData;
      });
    }
    
    // Clear supplier-related errors
    const supplierFields = ['supplierId', 'supplierName', 'gstNumber', 'hsn', 'gstPercentage'];
    setErrors(prev => {
      const newErrors = { ...prev };
      supplierFields.forEach(field => {
        if (newErrors[field]) {
          delete newErrors[field];
        }
      });
      return newErrors;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Debug: Log form data during validation
    console.log('Validating form data:', formData);
    console.log('isBuySetsMode:', isBuySetsMode);

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

      // Validate each set
      formData.sets.forEach((set, index) => {
        if (!set.quantity || parseFloat(set.quantity) <= 0) {
          newErrors[`set${index + 1}Quantity`] = `SET${index + 1} quantity must be greater than 0`;
        }
        if (!set.unitPrice || parseFloat(set.unitPrice) <= 0) {
          newErrors[`set${index + 1}UnitPrice`] = `SET${index + 1} unit price must be greater than 0`;
        }
      });
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
      // Debug: Log form data before processing
      console.log('Form data before processing:', formData);
      
      const rawMaterialData = {
        materialType: formData.materialType,
        category: formData.category,
        supplierId: formData.supplierId?.trim() || undefined,
        supplierName: formData.supplierName?.trim() || '',
        gstNumber: formData.gstNumber?.trim() || '',
        hsn: formData.hsn?.trim() || '',
        gstPercentage: parseFloat(formData.gstPercentage) || 0,
        stockQuantity: parseFloat(formData.stockQuantity) || 0,
        minStockLevel: formData.minStockLevel ? parseFloat(formData.minStockLevel) : 0,
        maxStockLevel: formData.maxStockLevel ? parseFloat(formData.maxStockLevel) : 0,
        notes: formData.notes?.trim() || undefined
      };

      // Add fields based on mode
      if (isBuySetsMode) {
        rawMaterialData.materialType = 'sets';
        rawMaterialData.batchId = formData.batchId.trim();
        rawMaterialData.quantity = parseFloat(formData.quantity);
        rawMaterialData.UOM = formData.UOM;
        rawMaterialData.unitPrice = parseFloat(formData.unitPrice);
        rawMaterialData.sets = formData.sets.map(set => ({
          set: set.set,
          quantity: parseFloat(set.quantity),
          unitPrice: parseFloat(set.unitPrice)
        }));
      } else {
        rawMaterialData.materialType = 'individual';
        rawMaterialData.materialId = formData.materialId?.trim().toUpperCase() || '';
        rawMaterialData.materialName = formData.materialName?.trim() || '';
        rawMaterialData.UOM = formData.UOM || 'kg';
        rawMaterialData.price = parseFloat(formData.price) || 0;
      }

      console.log('Sending raw material data:', rawMaterialData);
      console.log('isBuySetsMode:', isBuySetsMode);
      console.log('Form data state:', formData);
      
      // Additional validation before sending
      if (!isBuySetsMode) {
        const missingFields = [];
        if (!rawMaterialData.materialName) missingFields.push('materialName');
        if (!rawMaterialData.category) missingFields.push('category');
        if (!rawMaterialData.UOM) missingFields.push('UOM');
        if (!rawMaterialData.price) missingFields.push('price');
        if (!rawMaterialData.supplierName) missingFields.push('supplierName');
        if (!rawMaterialData.gstNumber) missingFields.push('gstNumber');
        if (!rawMaterialData.hsn) missingFields.push('hsn');
        if (rawMaterialData.gstPercentage === undefined) missingFields.push('gstPercentage');
        
        if (missingFields.length > 0) {
          console.error('Missing required fields:', missingFields);
          console.error('Raw material data:', rawMaterialData);
          throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }
      }

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
            {/* Toggle Button - Only show when creating new materials */}
            {!isEdit && (
              <Button
                type="button"
                onClick={toggleBuySetsMode}
                variant={isBuySetsMode ? "gradient" : "outline"}
                size="sm"
                icon={HiCube}
              >
                {isBuySetsMode ? 'Switch to Materials' : 'Buy Sets'}
              </Button>
            )}
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
                    disabled={isEdit && isBuySetsMode}
                    helperText={isEdit && isBuySetsMode ? "Batch ID cannot be changed for existing SETs" : ""}
                  />
                  <Input
                    label="Total Quantity"
                    name="quantity"
                    type="number"
                    value={formData.quantity}
                    onChange={handleChange}
                    placeholder="Enter total quantity (will be split equally)"
                    error={!!errors.quantity}
                    errorMessage={errors.quantity}
                    required
                    helperText="Quantity will be automatically split equally among 3 sets"
                  />
                  <Input
                    label="Unit Price"
                    name="unitPrice"
                    type="number"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    placeholder="Enter unit price"
                    error={!!errors.unitPrice}
                    errorMessage={errors.unitPrice}
                    required
                    helperText="Unit price will be applied to all sets"
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

          {/* Sets Preview - Only show in sets mode */}
          {isBuySetsMode && (
            <div id="sets-preview-section" className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Sets Preview</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-4">
                  The total quantity will be split equally among 3 sets:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {formData.sets.map((set, index) => (
                    <div key={index} className="bg-white p-3 rounded border">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">{set.set}</span>
                        <span className="text-sm text-gray-500">
                          {set.quantity} {formData.UOM}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Unit Price: ₹{set.unitPrice || '0'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Total: ₹{((parseFloat(set.quantity) || 0) * (parseFloat(set.unitPrice) || 0)).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Quantity:</span>
                    <span className="font-medium text-gray-900">
                      {formData.sets.reduce((sum, set) => sum + (parseFloat(set.quantity) || 0), 0)} {formData.UOM}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Total Value:</span>
                    <span className="font-medium text-gray-900">
                      ₹{formData.sets.reduce((sum, set) => sum + ((parseFloat(set.quantity) || 0) * (parseFloat(set.unitPrice) || 0)), 0).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Supplier Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Supplier Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputWithDropdown
                label="Supplier ID"
                name="supplierId"
                value={formData.supplierId}
                onChange={handleSupplierChange}
                placeholder="Search or select supplier ID"
                options={supplierOptions}
                helperText="Select from existing suppliers or type a new ID"
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
