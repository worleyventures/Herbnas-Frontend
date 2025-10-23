import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiEye, 
  HiTruck, 
  HiBuildingOffice2,
  HiCalendar,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiExclamationTriangle
} from 'react-icons/hi2';
import { Table, ActionButton, StatusBadge, ConfirmationModal } from '../../common';
import { updateSentGoodsStatus } from '../../../redux/actions/sentGoodsActions';
import { addNotification } from '../../../redux/slices/uiSlice';

const ReceivedGoodsCRUD = ({ 
  sentGoods = [],
  loading = false,
  onRefresh
}) => {
  const dispatch = useDispatch();
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedGoods, setSelectedGoods] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);



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
        // Refresh the data
        if (onRefresh) {
          onRefresh();
        }
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

  // Table columns
  const columns = [
    {
      key: 'trackingId',
      label: 'Tracking ID',
      render: (goods) => (
        <div className="flex items-center space-x-2">
          <div className="flex-shrink-0">
            <HiTruck className="h-5 w-5 text-gray-400" />
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900">{goods.trackingId}</div>
            <div className="text-sm text-gray-500">{goods.branchId?.branchName || 'Unknown Branch'}</div>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (goods) => {
        const StatusIcon = getStatusIcon(goods.status);
        return (
          <div className="flex items-center space-x-2">
            <StatusIcon className="h-4 w-4 text-gray-400" />
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goods.status)}`}>
              {getStatusDisplay(goods.status)}
            </span>
          </div>
        );
      }
    },
    {
      key: 'sentAt',
      label: 'Sent Date',
      render: (goods) => (
        <div className="text-sm text-gray-900">
          {formatDate(goods.sentAt)}
        </div>
      )
    },
    {
      key: 'deliveredAt',
      label: 'Delivered Date',
      render: (goods) => (
        <div className="text-sm text-gray-900">
          {goods.deliveredAt ? formatDate(goods.deliveredAt) : 'Not delivered'}
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (goods) => (
        <div className="text-sm font-medium text-gray-900">
          ₹{goods.totalAmount?.toLocaleString() || '0'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (goods) => {
        const availableOptions = getAvailableStatusOptions(goods.status);
        
        return (
          <div className="flex items-center space-x-2">
            <ActionButton
              icon={HiEye}
              onClick={() => {
                setSelectedGoods(goods);
                setShowDetailsModal(true);
              }}
              tooltip="View Details"
              variant="outline"
              size="sm"
            />
            
            {availableOptions.length > 0 && (
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    handleStatusUpdate(goods._id, e.target.value);
                  }
                }}
                disabled={updatingStatus === goods._id}
                className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Update Status</option>
                {availableOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            )}
            
            {updatingStatus === goods._id && (
              <div className="flex items-center text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                Updating...
              </div>
            )}
          </div>
        );
      }
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (sentGoods.length === 0) {
    return (
      <div className="text-center py-12">
        <HiTruck className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No received goods found</h3>
        <p className="mt-1 text-sm text-gray-500">No goods have been sent to your branch yet.</p>
      </div>
    );
  }

  return (
    <>

      <Table
        data={sentGoods}
        columns={columns}
        loading={loading}
        emptyMessage="No received goods found"
      />

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
    </>
  );
};

export default ReceivedGoodsCRUD;
