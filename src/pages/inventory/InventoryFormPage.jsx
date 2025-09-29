import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiArrowLeft, HiCube, HiBuildingOffice2, HiExclamationTriangle, HiCheckCircle, HiPlus, HiXCircle, HiXMark } from 'react-icons/hi2';
import { Button, Input, Select } from '../../components/common';
import { createOrUpdateInventory, getAllFinishedGoods } from '../../redux/actions/inventoryActions';
import { getAllProducts } from '../../redux/actions/productActions';
import { clearError } from '../../redux/slices/inventorySlice';
import RawMaterialForm from '../../components/inventory/RawMaterialForm';

const InventoryFormPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const dispatch = useDispatch();
  
  // Get inventory type from query parameters
  const searchParams = new URLSearchParams(location.search);
  const inventoryType = searchParams.get('type') || 'finishedGoods';
  
  // Get inventory data from location state or params
  const selectedInventory = location.state?.inventory || null;
  const mode = location.state?.mode || (params.id ? 'edit' : 'create');
  const inventoryId = params.id;
  
  // Get loading states, success states, and inventory data from Redux
  const { 
    loading: inventoryLoading,
    error: inventoryError,
    finishedGoods
  } = useSelector(state => state.inventory || {});
  
  // Get products for the dropdown
  const { products } = useSelector(state => state.products || {});
  
  // Find the inventory by ID if we're editing
  const reduxInventory = mode === 'edit' && inventoryId ? 
    (finishedGoods || []).find(item => item._id === inventoryId) : null;
  
  const [inventoryItems, setInventoryItems] = useState([
    {
      id: 1,
      productId: '',
      batchId: '',
      availableStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      stockUpdate: '',
      stockUpdateType: 'add'
    }
  ]);

  const [errors, setErrors] = useState({});

  // Load products on component mount
  useEffect(() => {
    dispatch(getAllProducts({ isActive: true }));
  }, [dispatch]);

  // Initialize form data
  useEffect(() => {
    const inventoryData = selectedInventory || reduxInventory;
    if (inventoryData && !Array.isArray(inventoryData)) {
      // Single inventory item for editing
      setInventoryItems([{
        id: 1,
        productId: inventoryData.product?._id || inventoryData.product || '',
        batchId: inventoryData.batchId || '',
        availableStock: inventoryData.availableQuantity || inventoryData.availableStock || '',
        minStockLevel: inventoryData.minStockLevel || '',
        maxStockLevel: inventoryData.maxStockLevel || '',
        stockUpdate: '',
        stockUpdateType: 'add'
      }]);
    } else if (mode === 'create') {
      setInventoryItems([{
        id: 1,
        productId: '',
        batchId: '',
        availableStock: '',
        minStockLevel: '',
        maxStockLevel: '',
        stockUpdate: '',
        stockUpdateType: 'add'
      }]);
    }
  }, [selectedInventory, reduxInventory, mode]);

  // Handle success states - navigate away from form
  // Note: Success handling will be done in the form submission

  // Handle input changes
  const handleInputChange = (itemId, field, value) => {
    // For numeric fields, ensure only valid numbers are entered
    if (['availableStock', 'minStockLevel', 'maxStockLevel'].includes(field)) {
      // Allow empty string, numbers, and decimal points
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setInventoryItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, [field]: value }
              : item
          )
        );
      }
    } else {
      setInventoryItems(prev => 
        prev.map(item => 
          item.id === itemId 
            ? { ...item, [field]: value }
            : item
        )
      );
    }
    
    // Clear error when user starts typing
    if (errors[`${itemId}_${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${itemId}_${field}`];
        return newErrors;
      });
    }
  };

  // Add new inventory item
  const addInventoryItem = () => {
    const newId = Math.max(...inventoryItems.map(item => item.id)) + 1;
    setInventoryItems(prev => [...prev, {
      id: newId,
      productId: '',
      batchId: '',
      availableStock: '',
      minStockLevel: '',
      maxStockLevel: '',
      stockUpdate: '',
      stockUpdateType: 'add'
    }]);
  };

  // Remove inventory item
  const removeInventoryItem = (itemId) => {
    if (inventoryItems.length > 1) {
      setInventoryItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    inventoryItems.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`${item.id}_productId`] = 'Product is required';
      }
      if (!item.batchId || item.batchId.trim() === '') {
        newErrors[`${item.id}_batchId`] = 'Batch ID is required';
      }
      if (!item.availableStock || item.availableStock === '' || isNaN(parseInt(item.availableStock))) {
        newErrors[`${item.id}_availableStock`] = 'Available stock must be a valid number';
      } else if (parseInt(item.availableStock) < 0) {
        newErrors[`${item.id}_availableStock`] = 'Available stock cannot be negative';
      }
      
      // Validate min stock level
      if (item.minStockLevel && item.minStockLevel !== '' && isNaN(parseInt(item.minStockLevel))) {
        newErrors[`${item.id}_minStockLevel`] = 'Min stock level must be a valid number';
      } else if (item.minStockLevel && parseInt(item.minStockLevel) < 0) {
        newErrors[`${item.id}_minStockLevel`] = 'Min stock level cannot be negative';
      }
      
      // Validate max stock level
      if (item.maxStockLevel && item.maxStockLevel !== '' && isNaN(parseInt(item.maxStockLevel))) {
        newErrors[`${item.id}_maxStockLevel`] = 'Max stock level must be a valid number';
      } else if (item.maxStockLevel && parseInt(item.maxStockLevel) < 0) {
        newErrors[`${item.id}_maxStockLevel`] = 'Max stock level cannot be negative';
      }
      
      // Validate min vs max stock
      if (item.minStockLevel && item.maxStockLevel && 
          item.minStockLevel !== '' && item.maxStockLevel !== '') {
        const minStock = parseInt(item.minStockLevel);
        const maxStock = parseInt(item.maxStockLevel);
        if (!isNaN(minStock) && !isNaN(maxStock) && minStock > maxStock) {
          newErrors[`${item.id}_maxStockLevel`] = 'Max stock must be greater than or equal to min stock';
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Only allow editing existing finished goods
    if (mode !== 'edit' || !inventoryId) {
      alert('Finished goods can only be created through the production approval process. Please use the production module to create new finished goods.');
      return;
    }

    try {
      for (const item of inventoryItems) {
        const inventoryData = {
          _id: inventoryId,
          availableQuantity: parseInt(item.availableStock),
          notes: `Updated via inventory form - ${new Date().toLocaleString()}`
        };

        await dispatch(createOrUpdateInventory(inventoryData)).unwrap();
      }
      
      // Navigate back on success
      navigate('/inventory');
    } catch (error) {
      // Error will be handled by Redux state
      console.error('Error saving inventory:', error);
    }
  };

  const handleBack = () => {
    navigate('/inventory');
  };

  // Render raw materials form if type is rawMaterials
  if (inventoryType === 'rawMaterials') {
    return <RawMaterialForm />;
  }

  // Show message for create mode since finished goods can't be created directly
  if (mode === 'create') {
    return (
      <div className="min-h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center space-x-4">
                <Button
                  onClick={handleBack}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <HiArrowLeft className="h-4 w-4 mr-2" />
                  Back to Inventory
                </Button>
                <div className="h-6 w-px bg-gray-300" />
                <div>
                  <h1 className="text-xl font-semibold text-gray-900">
                    Create Finished Goods
                  </h1>
                  <p className="text-sm text-gray-500">
                    Finished goods are created through production approval
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-8 text-center">
              <HiCube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                Finished Goods Creation
              </h2>
              <p className="text-gray-600 mb-6 max-w-md mx-auto">
                Finished goods inventory is automatically created when production batches are approved. 
                You cannot create finished goods directly through this form.
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500">
                  To create finished goods:
                </p>
                <ol className="text-sm text-gray-600 text-left max-w-md mx-auto space-y-2">
                  <li>1. Go to the Production module</li>
                  <li>2. Create a new production batch</li>
                  <li>3. Complete the production process</li>
                  <li>4. Approve the production (QC status)</li>
                  <li>5. Finished goods will be automatically created</li>
                </ol>
                <div className="pt-4">
                  <Button
                    onClick={() => navigate('/production')}
                    variant="primary"
                    className="mr-4"
                  >
                    Go to Production
                  </Button>
                  <Button
                    onClick={handleBack}
                    variant="outline"
                  >
                    Back to Inventory
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between py-6">
              <div className="flex items-center space-x-3">

                <div className="p-2 bg-green-100 rounded-lg">
                  <HiCube className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {mode === 'edit' ? 'Edit Finished Product' : 'Add Finished Product'}
                  </h1>
                  <p className="text-sm text-gray-500">
                    {mode === 'edit' ? 'Update finished product details' : 'Add new finished product to inventory'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <form onSubmit={handleSubmit} id="inventory-form" className="space-y-8">
            {/* Inventory Items */}
            <div id="basic-info-section" className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <HiCube className="h-5 w-5 mr-2 text-[#22c55e]" />
                  Inventory Items
                </h3> 
              </div>
              
              <div className="space-y-6">
                {inventoryItems.map((item, index) => (
                  <div key={item.id} className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-md font-medium text-gray-900">Item {index + 1}</h4>
                      {inventoryItems.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeInventoryItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-800"
                        >
                          <HiXCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Product *
                        </label>
                        <Select
                          value={item.productId}
                          onChange={(e) => handleInputChange(item.id, 'productId', e.target.value)}
                          options={[
                            { value: '', label: 'Select Product' },
                            ...(products || []).map(product => ({
                              value: product._id,
                              label: `${product.productName} (${product.productId || 'N/A'})`
                            }))
                          ]}
                        />
                        {errors[`${item.id}_productId`] && (
                          <p className="mt-1 text-sm text-red-600">{errors[`${item.id}_productId`]}</p>
                        )}
                      </div>
                      
                      <Input
                        label="Batch ID *"
                        name="batchId"
                        value={item.batchId}
                        onChange={(e) => handleInputChange(item.id, 'batchId', e.target.value)}
                        placeholder="Enter batch ID"
                        error={errors[`${item.id}_batchId`]}
                        required
                      />
                      
                      <Input
                        label="Available Stock *"
                        name="availableStock"
                        type="number"
                        value={item.availableStock}
                        onChange={(e) => handleInputChange(item.id, 'availableStock', e.target.value)}
                        placeholder="0"
                        error={errors[`${item.id}_availableStock`]}
                        min="0"
                        required
                      />
                      
                      <Input
                        label="Min Stock Level"
                        name="minStockLevel"
                        type="number"
                        value={item.minStockLevel}
                        onChange={(e) => handleInputChange(item.id, 'minStockLevel', e.target.value)}
                        placeholder="0"
                        error={errors[`${item.id}_minStockLevel`]}
                        min="0"
                      />
                      
                      <Input
                        label="Max Stock Level"
                        name="maxStockLevel"
                        type="number"
                        value={item.maxStockLevel}
                        onChange={(e) => handleInputChange(item.id, 'maxStockLevel', e.target.value)}
                        placeholder="0"
                        error={errors[`${item.id}_maxStockLevel`]}
                        min="0"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Error Messages */}
            {inventoryError && (
              <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg">
                <div className="flex items-center">
                  <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-red-800">
                      Error: {inventoryError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                onClick={handleBack}
                variant="outline"
                size="xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="xs"
                loading={inventoryLoading}
                className="flex items-center"
              >
                <HiCheckCircle className="h-4 w-4 mr-2" />
                {mode === 'create' ? 'Create Inventory' : 'Update Inventory'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InventoryFormPage;
