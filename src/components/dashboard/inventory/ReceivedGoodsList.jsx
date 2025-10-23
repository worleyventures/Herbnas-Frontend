import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiTruck, 
  HiBuildingOffice2, 
  HiCalendar, 
  HiCheckCircle, 
  HiClock, 
  HiXCircle,
  HiExclamationTriangle,
  HiPencil,
  HiEye
} from 'react-icons/hi2';
import { Button, Loading, EmptyState, Select } from '../../common';
import { getAllSentGoods, updateSentGoodsStatus } from '../../../redux/actions/sentGoodsActions';
import { addNotification } from '../../../redux/slices/uiSlice';

const ReceivedGoodsList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  
  // Use more specific selectors to prevent unnecessary re-renders
  const sentGoods = useSelector((state) => state.sentGoods?.sentGoods || []);
  const loading = useSelector((state) => state.sentGoods?.loading || false);
  const error = useSelector((state) => state.sentGoods?.error || null);
  
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

  // Memoized params to prevent unnecessary re-renders
  const params = useMemo(() => ({
    page: currentPage,
    limit: 10,
    search: searchTerm,
    status: statusFilter,
    sortBy: 'sentAt',
    sortOrder: 'desc'
  }), [currentPage, searchTerm, statusFilter]);

  // Load data only once on mount
  useEffect(() => {
    console.log('ReceivedGoodsList: Component mounted, loading initial data');
    if (isMountedRef.current && !hasLoadedRef.current) {
      console.log('ReceivedGoodsList: Dispatching getAllSentGoods with params:', params);
      dispatch(getAllSentGoods(params));
      hasLoadedRef.current = true;
    }
  }, []); // Empty dependency array - only run on mount

  // Load data when filters change (with debouncing)
  useEffect(() => {
    if (!isMountedRef.current || !hasLoadedRef.current) return;
    
    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // Set new timeout for debouncing
    timeoutRef.current = setTimeout(() => {
      if (isMountedRef.current) {
        console.log('ReceivedGoodsList: Filter changed, loading data with params:', params);
        dispatch(getAllSentGoods(params));
      }
    }, 500); // 500ms debounce

    // Cleanup timeout on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [dispatch, params]); // Only depend on dispatch and memoized params

  // Cleanup on unmount
  useEffect(() => {
    return () => {
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

  // Filter sent goods based on search and status
  const filteredGoods = sentGoods.filter(goods => {
    const matchesSearch = !searchTerm || 
      goods.trackingId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goods.branchId?.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      goods.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || goods.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading && !hasLoadedRef.current) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <HiExclamationTriangle className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading received goods</h3>
        <p className="mt-1 text-sm text-gray-500">{error}</p>
        <div className="mt-6">
          <Button onClick={loadSentGoods} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (filteredGoods.length === 0) {
    return (
      <EmptyState
        icon={HiTruck}
        title="No received goods found"
        description="No goods have been sent to your branch yet."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
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

      {/* Goods List */}
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
  );
};

export default ReceivedGoodsList;
