import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiTruck, HiBuildingOffice2, HiCube, HiCalendar, HiCheckCircle, HiPlus } from 'react-icons/hi2';
import { Button, Input, Select, TextArea, Table, StatusBadge } from '../../components/common';
import { getAllBranches } from '../../redux/actions/branchActions';
import { getAllFinishedGoods } from '../../redux/actions/inventoryActions';
import { getAllSentGoods, createSentGoods, updateSentGoodsStatus, deleteSentGoods } from '../../redux/actions/sentGoodsActions';
import { addNotification } from '../../redux/slices/uiSlice';

const SentGoodsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const { branches = [], loading: branchesLoading = false } = useSelector((state) => state.branches);
  const { finishedGoods = [], loading: inventoryLoading = false } = useSelector((state) => state.inventory);
  const { sentGoods = [], loading: sentGoodsLoading = false, pagination } = useSelector((state) => state.sentGoods);
  
  // Local state
  const [selectedBranch, setSelectedBranch] = useState('');
  const [trackingId, setTrackingId] = useState('');
  const [notes, setNotes] = useState('');
  const [selectedInventoryItems, setSelectedInventoryItems] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState({});

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllBranches({ page: 1, limit: 1000 }));
    dispatch(getAllFinishedGoods({ page: 1, limit: 1000 }));
    dispatch(getAllSentGoods({ page: 1, limit: 10 }));
  }, [dispatch]);

  // Filter sent goods based on search and status
  const filteredSentGoods = sentGoods.filter(sg => {
    const matchesSearch = !searchTerm || 
      sg.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sg.branch?.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sg.items.some(item => item.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || sg.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleBack = () => {
    navigate('/inventory');
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
            updatedItem.productName = selectedInventory.product?.productName || '';
            updatedItem.availableQuantity = selectedInventory.availableQuantity || 0;
            updatedItem.unitPrice = selectedInventory.product?.price || 0;
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
      items: selectedInventoryItems.map(item => ({
        inventoryId: item.inventoryId,
        quantity: parseInt(item.quantityToSend),
        unitPrice: parseFloat(item.unitPrice)
      }))
    };

    try {
      const result = await dispatch(createSentGoods(sendData));
      
      if (createSentGoods.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          message: 'Goods sent successfully!'
        }));
        
        // Reset form
        setSelectedBranch('');
        setTrackingId('');
        setNotes('');
        setSelectedInventoryItems([]);
        setFormErrors({});
        
        // Refresh sent goods list
        dispatch(getAllSentGoods({ page: 1, limit: 10 }));
      } else {
        dispatch(addNotification({
          type: 'error',
          message: result.payload || 'Failed to send goods'
        }));
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to send goods'
      }));
    }
  };

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const result = await dispatch(updateSentGoodsStatus({ id, status: newStatus }));
      
      if (updateSentGoodsStatus.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          message: `Status updated to ${newStatus}`
        }));
        
        // Refresh sent goods list
        dispatch(getAllSentGoods({ page: 1, limit: 10 }));
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
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'in-transit':
        return 'blue';
      case 'pending':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'in-transit':
        return 'In Transit';
      case 'pending':
        return 'Pending';
      default:
        return 'Unknown';
    }
  };

  const branchOptions = branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  }));

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in-transit', label: 'In Transit' },
    { value: 'delivered', label: 'Delivered' }
  ];

  const columns = [
    {
      key: 'trackingId',
      label: 'Tracking ID',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <HiTruck className="h-4 w-4 text-gray-500" />
          <span className="font-medium text-gray-900">{item.trackingId}</span>
        </div>
      )
    },
    {
      key: 'branch',
      label: 'Destination',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <HiBuildingOffice2 className="h-4 w-4 text-gray-500" />
          <div>
            <p className="font-medium text-gray-900">{item.branch?.branchName || 'Unknown Branch'}</p>
            <p className="text-sm text-gray-500">{item.branch?.branchCode || ''}</p>
          </div>
        </div>
      )
    },
    {
      key: 'items',
      label: 'Items',
      sortable: false,
      render: (item) => (
        <div className="space-y-1">
          {item.items?.slice(0, 2).map((itemData, index) => (
            <div key={index} className="flex items-center space-x-2">
              <HiCube className="h-4 w-4 text-gray-500" />
              <span className="text-gray-900 text-sm">
                {itemData.productName} ({itemData.quantity} units)
              </span>
            </div>
          ))}
          {item.items?.length > 2 && (
            <span className="text-xs text-gray-500">
              +{item.items.length - 2} more items
            </span>
          )}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      sortable: true,
      render: (item) => (
        <span className="font-medium text-gray-900">₹{item.totalAmount?.toFixed(2) || '0.00'}</span>
      )
    },
    {
      key: 'sentAt',
      label: 'Sent Date',
      sortable: true,
      render: (item) => (
        <div className="flex items-center space-x-2">
          <HiCalendar className="h-4 w-4 text-gray-500" />
          <span className="text-gray-900">{new Date(item.sentAt).toLocaleDateString()}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (item) => (
        <StatusBadge
          status={item.statusDisplay || item.status}
          color={getStatusColor(item.status)}
          icon={HiCheckCircle}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (item) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => console.log('View details:', item._id)}
          >
            View
          </Button>
          {item.status === 'pending' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus(item._id, 'in-transit')}
            >
              Ship
            </Button>
          )}
          {item.status === 'in-transit' && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleUpdateStatus(item._id, 'delivered')}
            >
              Deliver
            </Button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="h-6 w-px" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Sent Goods</h1>
                <p className="text-sm text-gray-500">
                  Track and manage inventory transfers to branches
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white">
        {/* Send New Goods Form */}
        <div className="bg-white mb-8">
          <div className="p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-6">Send New Goods</h2>
            
            <div className="space-y-6">
              {/* Branch Selection and Tracking ID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                <div className="space-y-4">
                  {selectedInventoryItems.map((item, index) => (
                    <div key={item.id} className="border border-gray-200 rounded-lg p-4">
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
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Select
                          label="Inventory Item"
                          value={item.inventoryId}
                          onChange={(e) => handleInventoryItemChange(item.id, 'inventoryId', e.target.value)}
                          options={finishedGoods.map(fg => ({
                            value: fg._id,
                            label: `${fg.product?.productName || 'Unknown'} (${fg.availableQuantity} units)`
                          }))}
                          placeholder="Select inventory item"
                          error={!!formErrors[`inventoryId_${index}`]}
                          errorMessage={formErrors[`inventoryId_${index}`]}
                        />
                        
                        <Input
                          label="Product Name"
                          value={item.productName}
                          disabled
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
              <TextArea
                label="Notes (Optional)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this inventory transfer..."
                rows={3}
              />

              {/* Send Button */}
              <div className="flex justify-end">
                <Button
                  onClick={handleSendGoods}
                  disabled={branchesLoading || inventoryLoading}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  icon={HiTruck}
                >
                  Send Goods
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Sent Goods History */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Sent Goods History</h2>
              <div className="flex space-x-4">
                <Input
                  placeholder="Search tracking ID, product, or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-64"
                />
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  options={statusOptions}
                  className="w-40"
                />
              </div>
            </div>

            <Table
              data={filteredSentGoods}
              columns={columns}
              loading={sentGoodsLoading}
              emptyMessage="No sent goods found"
              emptySubMessage="Goods you send to branches will appear here"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentGoodsPage;
