import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiArrowLeft, HiTruck, HiBuildingOffice2, HiCalendar, HiCheckCircle, HiClock, HiXCircle, HiExclamationTriangle, HiEye } from 'react-icons/hi2';
import { Button, Loading, EmptyState, Select } from '../../components/common';
import { getAllSentGoods, updateSentGoodsStatus } from '../../redux/actions/sentGoodsActions';
import { addNotification } from '../../redux/slices/uiSlice';

const ReceivedGoodsPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Use Redux state instead of local state
  const { sentGoods = [], loading = false, error = null } = useSelector((state) => state.sentGoods);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedGoods, setSelectedGoods] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Refs to prevent infinite loops
  const hasLoadedRef = useRef(false);
  const timeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  // Memoized load data function
  const loadData = useCallback(async () => {
    if (loading || !isMountedRef.current) return; // Prevent concurrent requests
    
    console.log('ReceivedGoodsPage: Loading data...');
    
    try {
      const params = {
        page: currentPage,
        limit: 10,
        search: searchTerm,
        status: statusFilter,
        sortBy: 'sentAt',
        sortOrder: 'desc'
      };
      
      console.log('ReceivedGoodsPage: Dispatching getAllSentGoods with params:', params);
      await dispatch(getAllSentGoods(params));
    } catch (err) {
      console.error('ReceivedGoodsPage: Error loading data:', err);
    }
  }, [dispatch, currentPage, searchTerm, statusFilter, loading]);

  // Load data on mount only
  useEffect(() => {
    console.log('ReceivedGoodsPage: Component mounted');
    if (!hasLoadedRef.current && isMountedRef.current) {
      hasLoadedRef.current = true;
      loadData();
    }
  }, [loadData]); // Depend on loadData

  // Load data when filters change (with debouncing)
  useEffect(() => {
    if (!isMountedRef.current || !hasLoadedRef.current) return;
    
    console.log('ReceivedGoodsPage: Filters changed, debouncing load...');
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        loadData();
      }
    }, 1000); // 1 second debounce

    // Cleanup timeout
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [loadData]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log('ReceivedGoodsPage: Component unmounting');
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Handle status update
  const handleStatusUpdate = async (sentGoodsId, newStatus) => {
    setUpdatingStatus(sentGoodsId);
    try {
      const result = await dispatch(updateSentGoodsStatus({ id: sentGoodsId, status: newStatus }));
      
      if (updateSentGoodsStatus.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          message: `Status updated to ${getStatusDisplay(newStatus)} successfully!`
        }));
        // Reload data after successful update
        loadData();
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

  // Get status icon
  const getStatusIcon = (status) => {
    const icons = {
      'pending': HiClock,
      'in-transit': HiTruck,
      'delivered': HiCheckCircle,
      'cancelled': HiXCircle
    };
    return icons[status] || HiExclamationTriangle;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get available status options based on current status
  const getAvailableStatusOptions = (currentStatus) => {
    const statusOptions = {
      'pending': [
        { value: 'in-transit', label: 'Mark as In Transit' },
        { value: 'delivered', label: 'Mark as Delivered' },
        { value: 'cancelled', label: 'Cancel' }
      ],
      'in-transit': [
        { value: 'delivered', label: 'Mark as Delivered' },
        { value: 'cancelled', label: 'Cancel' }
      ],
      'delivered': [], // No further actions for delivered
      'cancelled': [] // No further actions for cancelled
    };
    return statusOptions[currentStatus] || [];
  };

  // Filter data based on search and status
  const filteredGoods = sentGoods.filter(goods => {
    const matchesSearch = !searchTerm || 
      goods.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goods.branchId?.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goods.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || goods.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && sentGoods.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Error Loading Data</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">{error}</p>
            <div className="space-y-4">
              <Button onClick={loadData} variant="primary" className="w-full">
                Try Again
              </Button>
              <Button onClick={() => navigate('/inventory')} variant="outline" className="w-full">
                <HiArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Received Goods</h1>
              <p className="mt-2 text-gray-600">Manage goods received at your branch</p>
            </div>
            <Button onClick={() => navigate('/inventory')} variant="outline">
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search by tracking ID, branch, or notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'pending', label: 'Pending' },
                  { value: 'in-transit', label: 'In Transit' },
                  { value: 'delivered', label: 'Delivered' },
                  { value: 'cancelled', label: 'Cancelled' }
                ]}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        {filteredGoods.length === 0 ? (
          <EmptyState
            icon={HiTruck}
            title="No received goods found"
            description="No goods have been sent to your branch yet."
          />
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredGoods.map((goods) => {
                const StatusIcon = getStatusIcon(goods.status);
                const availableOptions = getAvailableStatusOptions(goods.status);
                
                return (
                  <li key={goods._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0">
                          <StatusIcon className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {goods.trackingId}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goods.status)}`}>
                              {getStatusDisplay(goods.status)}
                            </span>
                          </div>
                          <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <HiBuildingOffice2 className="h-4 w-4 mr-1" />
                              {goods.branchId?.branchName || 'Unknown Branch'}
                            </div>
                            <div className="flex items-center">
                              <HiCalendar className="h-4 w-4 mr-1" />
                              {formatDate(goods.sentAt)}
                            </div>
                            {goods.deliveredAt && (
                              <div className="flex items-center">
                                <HiCheckCircle className="h-4 w-4 mr-1" />
                                Delivered: {formatDate(goods.deliveredAt)}
                              </div>
                            )}
                          </div>
                          {goods.notes && (
                            <p className="mt-1 text-sm text-gray-600 truncate">
                              {goods.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => {
                            setSelectedGoods(goods);
                            setShowDetailsModal(true);
                          }}
                          variant="outline"
                          size="sm"
                          icon={HiEye}
                        >
                          View Details
                        </Button>
                        
                        {availableOptions.length > 0 && (
                          <Select
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                handleStatusUpdate(goods._id, e.target.value);
                              }
                            }}
                            disabled={updatingStatus === goods._id}
                            className="w-40"
                          >
                            <option value="">Update Status</option>
                            {availableOptions.map((option) => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </Select>
                        )}
                        
                        {updatingStatus === goods._id && (
                          <div className="flex items-center text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                            Updating...
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedGoods && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">
                    Goods Details - {selectedGoods.trackingId}
                  </h3>
                  <button
                    onClick={() => setShowDetailsModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <HiXCircle className="h-6 w-6" />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedGoods.status)}`}>
                        {getStatusDisplay(selectedGoods.status)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Branch</label>
                      <p className="text-sm text-gray-900">{selectedGoods.branchId?.branchName || 'Unknown'}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Items</label>
                    <div className="mt-1 space-y-2">
                      {selectedGoods.items?.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <span className="text-sm text-gray-900">
                            {item.inventoryId?.productId?.productName || 'Unknown Product'}
                          </span>
                          <span className="text-sm text-gray-600">
                            Qty: {item.quantity} | Price: ₹{item.unitPrice}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Sent At</label>
                      <p className="text-sm text-gray-900">{formatDate(selectedGoods.sentAt)}</p>
                    </div>
                    {selectedGoods.deliveredAt && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Delivered At</label>
                        <p className="text-sm text-gray-900">{formatDate(selectedGoods.deliveredAt)}</p>
                      </div>
                    )}
                  </div>
                  
                  {selectedGoods.notes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Notes</label>
                      <p className="text-sm text-gray-900">{selectedGoods.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceivedGoodsPage;
