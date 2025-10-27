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
import CommonModal from '../../common/CommonModal';
import DetailsView from '../../common/DetailsView';
import Button from '../../common/Button';
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
      <CommonModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Goods Details"
        subtitle={selectedGoods?.trackingId || ''}
        size="xl"
        showFooter={true}
        footerContent={
          <Button
            onClick={() => setShowDetailsModal(false)}
            variant="outline"
            className="px-4 py-2"
          >
            Close
          </Button>
        }
      >
        {selectedGoods && (() => {
          const additionalInfo = {
            title: 'Additional Information',
            fields: [
              {
                label: 'Branch',
                value: selectedGoods.branchId?.branchName || 'Unknown'
              },
              {
                label: 'Status',
                value: getStatusDisplay(selectedGoods.status)
              },
              {
                label: 'Sent At',
                value: formatDate(selectedGoods.sentAt)
              },
              ...(selectedGoods.deliveredAt ? [{
                label: 'Delivered At',
                value: formatDate(selectedGoods.deliveredAt)
              }] : [])
            ].filter(Boolean)
          };

          const basicInfo = {
            title: 'Basic Information',
            fields: [
              {
                label: 'Tracking ID',
                value: selectedGoods.trackingId || 'N/A'
              },
              {
                label: 'Total Items',
                value: selectedGoods.items?.length || 0
              },
              {
                label: 'Sent From',
                value: 'Head Office'
              }
            ]
          };

          const itemsInfo = selectedGoods.items && selectedGoods.items.length > 0 ? {
            title: 'Items',
            fields: selectedGoods.items.map((item, index) => ({
              label: item.inventoryId?.productId?.productName || 'Unknown Product',
              value: `${item.quantity} units | ₹${item.unitPrice}`
            }))
          } : null;

          const notesInfo = selectedGoods.notes ? {
            title: 'Notes',
            fields: [
              {
                label: 'Shipping Notes',
                value: selectedGoods.notes
              }
            ]
          } : null;

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column - Additional Information and Notes */}
              <div className="space-y-4">
                <DetailsView sections={[additionalInfo]} />
                {notesInfo && <DetailsView sections={[notesInfo]} />}
              </div>
              
              {/* Right Column - Basic Information and Items */}
              <div className="space-y-4">
                <DetailsView sections={[basicInfo]} />
                {itemsInfo && <DetailsView sections={[itemsInfo]} />}
              </div>
            </div>
          );
        })()}
      </CommonModal>
    </>
  );
};

export default ReceivedGoodsCRUD;
