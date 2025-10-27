import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiArrowLeft, HiTruck, HiBuildingOffice2, HiCube, HiCalendar, HiCheckCircle, HiPlus, HiEye, HiPencil, HiXMark } from 'react-icons/hi2';
import { Button, Input, Select, TextArea, Loading, EmptyState } from '../../components/common';
import { getAllBranches } from '../../redux/actions/branchActions';
import { getAllFinishedGoods } from '../../redux/actions/inventoryActions';
import { createSentGoods, getAllSentGoods, getReceivedGoods, updateSentGoodsStatus, updateSentGoods } from '../../redux/actions/sentGoodsActions';
import { addNotification } from '../../redux/slices/uiSlice';

const SentGoodsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Redux state
  const { branches = [], loading: branchesLoading = false } = useSelector((state) => state.branches);
  const { finishedGoods = [], loading: inventoryLoading = false } = useSelector((state) => state.inventory);
  const { sentGoods = [], loading: sentGoodsLoading = false, error: sentGoodsError = null } = useSelector((state) => state.sentGoods);
  const { user } = useSelector((state) => state.auth);
  
  // Local state
  const [selectedBranch, setSelectedBranch] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('pending');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [activeTab, setActiveTab] = useState('list'); // 'list' or 'create'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(null);

  // Get edit data from location state
  const editData = location.state?.editData;
  const editMode = location.state?.mode === 'edit' && editData;
  const editingItemId = editData?._id;

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllBranches({ page: 1, limit: 1000 }));
    dispatch(getAllFinishedGoods({ page: 1, limit: 1000 }));
    loadSentGoods();
  }, [dispatch]);

  // Populate form when editing
  useEffect(() => {
    if (editMode && editData && finishedGoods.length > 0) {
      setSelectedBranch(editData.branchId?._id || editData.branchId || '');
      setTrackingId(editData.trackingId || '');
      setNotes(editData.notes || '');
      setStatus(editData.status || 'pending');
      
      // Populate items
      if (editData.items && editData.items.length > 0) {
        const items = editData.items.map((item, index) => {
          // Get product name from the correct path
          // In edit mode, inventoryId is populated with productId reference
          // The structure is: item.inventoryId.productId.productName (if nested populate)
          // OR item.inventoryId.productName (if direct populate)
          const inventoryId = item.inventoryId;
          const productName = inventoryId?.productId?.productName 
            || inventoryId?.product?.productName
            || inventoryId?.productName
            || item.productName
            || '';
          
          // Get current available quantity from finishedGoods
          const currentInventoryItem = finishedGoods.find(fg => 
            fg._id === (inventoryId?._id || inventoryId)
          );
          const availableQuantity = currentInventoryItem?.availableQuantity || 0;
            
          return {
            id: Date.now() + index,
            inventoryId: inventoryId?._id || inventoryId || '',
            productName: productName,
            availableQuantity: availableQuantity,
            quantityToSend: item.quantity || 0,
            unitPrice: item.unitPrice || 0
          };
        });
        setSelectedInventoryItems(items);
      }
    }
  }, [editMode, editData, finishedGoods]);

  // Load sent goods with filters
  const loadSentGoods = () => {
    const params = {
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: statusFilter,
      sortBy: 'sentAt',
      sortOrder: 'desc'
    };
    // Use appropriate API based on user role
    if (isProductionManager) {
      dispatch(getReceivedGoods(params));
    } else {
      dispatch(getAllSentGoods(params));
    }
  };

  // Reload sent goods when filters change
  useEffect(() => {
    loadSentGoods();
  }, [searchTerm, statusFilter, currentPage]);

  // Role-based access
  const isProductionManager = user?.role === 'production_manager';
  const canCreateSentGoods = ['admin', 'inventory_manager', 'super_admin'].includes(user?.role);
  const canUpdateStatus = ['admin', 'inventory_manager', 'production_manager', 'super_admin'].includes(user?.role);



  const handleBack = () => {
    navigate('/inventory');
  };

  // Handle status update
  const handleStatusUpdate = async (sentGoodsId, newStatus) => {
    setUpdatingStatus(sentGoodsId);
    try {
      const result = await dispatch(updateSentGoodsStatus({ id: sentGoodsId, status: newStatus }));
      
      if (updateSentGoodsStatus.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          message: `Status updated to ${newStatus} successfully!`
        }));
        loadSentGoods(); // Reload the list
      } else {
        dispatch(addNotification({
          type: 'error',
          message: result.payload || 'Failed to update status'
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update status'
      }));
    } finally {
      setUpdatingStatus(null);
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status display name
  const getStatusDisplay = (status) => {
    const displays = {
      'pending': 'Pending',
      'in-transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled'
    };
    return displays[status] || status;
  };

  const handleAddInventoryItem = () => {
    setSelectedInventoryItems([...selectedInventoryItems, {
      id: Date.now(),
      inventoryId: '',
      productName: '',
      availableQuantity: 0,
      quantityToSend: 0,
      unitPrice: 0
    }]);
  };

  const handleRemoveInventoryItem = (id) => {
    setSelectedInventoryItems(selectedInventoryItems.filter(item => item.id !== id));
  };

  const handleInventoryItemChange = (id, field, value) => {
    setSelectedInventoryItems(selectedInventoryItems.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // If inventory item is selected, populate other fields
        if (field === 'inventoryId' && value) {
          const selectedInventory = finishedGoods.find(fg => fg._id === value);
          if (selectedInventory) {
            // The finished goods structure has: fg.product.productName
            const productName = selectedInventory.product?.productName 
              || selectedInventory.productName
              || '';
              
            const availableQuantity = selectedInventory.availableQuantity || 0;
              
            const unitPrice = selectedInventory.product?.price 
              || selectedInventory.price
              || 0;
              
            updatedItem.productName = productName;
            updatedItem.availableQuantity = availableQuantity;
            updatedItem.unitPrice = unitPrice;
          }
        }
        
        return updatedItem;
      }
      return item;
    }));
  };

  const validateForm = () => {
    const errors = {};

    if (!selectedBranch) {
      errors.selectedBranch = 'Please select a branch';
    }

    if (!trackingId.trim()) {
      errors.trackingId = 'Please enter a tracking ID';
    }

    if (selectedInventoryItems.length === 0) {
      errors.inventoryItems = 'Please add at least one inventory item';
    }

    selectedInventoryItems.forEach((item, index) => {
      if (!item.inventoryId) {
        errors[`inventoryId_${index}`] = 'Please select an inventory item';
      }
      if (!item.quantityToSend || item.quantityToSend <= 0) {
        errors[`quantity_${index}`] = 'Please enter a valid quantity';
      }
      if (item.quantityToSend > item.availableQuantity) {
        errors[`quantity_${index}`] = 'Quantity cannot exceed available stock';
      }
    });

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSendGoods = async () => {
    if (!validateForm()) {
      return;
    }

    const sendData = {
      branchId: selectedBranch,
      trackingId: trackingId.trim(),
      notes: notes.trim(),
      ...(editMode && { status: status }), // Include status when editing
      items: selectedInventoryItems.map(item => ({
        inventoryId: item.inventoryId,
        quantity: parseInt(item.quantityToSend),
        unitPrice: parseFloat(item.unitPrice)
      }))
    };

    try {
      let result;
      if (editMode && editingItemId) {
        // Update existing sent goods
        result = await dispatch(updateSentGoods({ id: editingItemId, sentGoodsData: sendData }));
        
        if (updateSentGoods.fulfilled.match(result)) {
          dispatch(addNotification({
            type: 'success',
            message: 'Sent goods updated successfully!'
          }));
          
          // Refetch finished goods to update stock values
          dispatch(getAllFinishedGoods({ page: 1, limit: 1000 }));
        }
      } else {
        // Create new sent goods
        result = await dispatch(createSentGoods(sendData));
        
        if (createSentGoods.fulfilled.match(result)) {
          dispatch(addNotification({
            type: 'success',
            message: 'Goods sent successfully!'
          }));
          
          // Refetch finished goods to update stock values
          dispatch(getAllFinishedGoods({ page: 1, limit: 1000 }));
        }
      }

      // Reset form
      setSelectedBranch('');
      setTrackingId('');
      setNotes('');
      setStatus('pending');
      setSelectedInventoryItems([]);
      setFormErrors({});
      
      // Navigate to list view after successful creation/update
      if (editMode) {
        // Navigate back to sent goods list
        navigate('/inventory/sent-goods');
      } else {
        setActiveTab('list');
      }
      
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: editMode ? 'Failed to update sent goods' : 'Failed to send goods'
      }));
    }
  };


  const branchOptions = branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  }));



  return (
    <div className="min-h-screen">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {editMode ? 'Edit Sent Goods' : 'Send New Goods'}
        </h2>
        
        <div className="space-y-6">
              {/* Branch Selection, Tracking ID, and Status (for edit mode) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Select
                  label="Select a branch"
                  value={selectedBranch}
                  onChange={(e) => setSelectedBranch(e.target.value)}
                  options={branchOptions}
                  placeholder="Select a branch"
                  disabled={branchesLoading}
                  error={!!formErrors.selectedBranch}
                  errorMessage={formErrors.selectedBranch}
                />
                <Input
                  label="Tracking ID"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter tracking ID manually"
                  error={!!formErrors.trackingId}
                  errorMessage={formErrors.trackingId}
                />
                {editMode && (
                  <Select
                    label="Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: 'pending', label: 'Pending' },
                      { value: 'in-transit', label: 'In Transit' },
                      { value: 'delivered', label: 'Delivered' },
                      { value: 'cancelled', label: 'Cancelled' }
                    ]}
                  />
                )}
              </div>

              {/* Inventory Items Selection */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Inventory Items</h3>
                  <Button
                    type="button"
                    onClick={handleAddInventoryItem}
                    variant="outline"
                    size="sm"
                    icon={HiPlus}
                  >
                    Add Item
                  </Button>
                </div>
                
                {formErrors.inventoryItems && (
                  <p className="text-sm text-red-600 mb-4">{formErrors.inventoryItems}</p>
                )}

                <div className="space-y-6">
                  {selectedInventoryItems.map((item, index) => (
                    <div key={item.id}>
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-medium text-gray-900">Item {index + 1}</h4>
                        <Button
                          type="button"
                          onClick={() => handleRemoveInventoryItem(item.id)}
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Select
                          label="Inventory Item"
                          value={item.inventoryId}
                          onChange={(e) => handleInventoryItemChange(item.id, 'inventoryId', e.target.value)}
                          options={finishedGoods.map(fg => {
                            // Get product name from multiple possible paths
                            const productName = fg.product?.productName 
                              || fg.productName 
                              || 'Unknown';
                            const availableQty = fg.availableQuantity 
                              || fg.stockQuantity 
                              || 0;
                            return {
                              value: fg._id,
                              label: `${productName} (${availableQty} units)`
                            };
                          })}
                          placeholder="Select inventory item"
                          error={!!formErrors[`inventoryId_${index}`]}
                          errorMessage={formErrors[`inventoryId_${index}`]}
                        />
                        
                        <Input
                          label="Available Quantity"
                          value={item.availableQuantity}
                          disabled
                        />
                        
                        <Input
                          label="Quantity to Send"
                          type="number"
                          min="1"
                          max={item.availableQuantity}
                          value={item.quantityToSend}
                          onChange={(e) => handleInventoryItemChange(item.id, 'quantityToSend', e.target.value)}
                          placeholder="Enter quantity"
                          error={!!formErrors[`quantity_${index}`]}
                          errorMessage={formErrors[`quantity_${index}`]}
                        />
                      </div>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Unit Price (₹)"
                          type="number"
                          step="0.01"
                          value={item.unitPrice}
                          onChange={(e) => handleInventoryItemChange(item.id, 'unitPrice', e.target.value)}
                          placeholder="Enter unit price"
                        />
                        
                        <div className="flex items-end">
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Total Amount
                            </label>
                            <div className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900">
                              ₹{(item.quantityToSend * item.unitPrice).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div>
                <TextArea
                  label="Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any notes about this inventory transfer..."
                  rows={3}
                />
              </div>

              {/* Send Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSendGoods}
                  disabled={branchesLoading || inventoryLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  icon={HiTruck}
                >
                  {editMode ? 'Update Goods' : 'Send Goods'}
                </Button>
              </div>
            </div>
      </div>
    </div>
  );
};

export default SentGoodsPage;
