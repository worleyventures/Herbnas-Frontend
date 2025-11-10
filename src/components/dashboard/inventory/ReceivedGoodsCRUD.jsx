import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiEye,
  HiBuildingOffice2,
  HiCalendar,
  HiCheckCircle,
  HiClock,
  HiXCircle,
  HiExclamationTriangle,
  HiChevronDown,
  HiTruck
} from 'react-icons/hi2';
import { Table, StatusBadge, ConfirmationModal, ActionButton } from '../../common';
import CommonModal from '../../common/CommonModal';
import DetailsView from '../../common/DetailsView';
import Button from '../../common/Button';
import { updateSentGoodsStatus, markAsReceived } from '../../../redux/actions/sentGoodsActions';
import { markGoodsRequestAsReceived } from '../../../redux/actions/goodsRequestActions';
import { addNotification } from '../../../redux/slices/uiSlice';

const ReceivedGoodsCRUD = ({ 
  sentGoods = [],
  goodsRequests = [],
  loading = false,
  onRefresh
}) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [markingAsReceived, setMarkingAsReceived] = useState(null);
  const [selectedGoods, setSelectedGoods] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [openStatusDropdown, setOpenStatusDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const statusDropdownRefs = useRef({});
  const buttonRefs = useRef({});

  // Check if user can mark as received (admin or supervisor)
  const canMarkAsReceived = user?.role === 'admin' || user?.role === 'supervisor' || user?.role === 'super_admin';

  // Filter goods requests for the current user's branch if supervisor/admin
  const filteredGoodsRequests = useMemo(() => {
    if (!goodsRequests || goodsRequests.length === 0) return [];
    if (user?.role === 'super_admin') return goodsRequests;
    
    if (user?.branch) {
      const userBranchId = typeof user.branch === 'object' 
        ? user.branch._id || user.branch 
        : user.branch;
      return goodsRequests.filter(req => {
        const reqBranchId = typeof req.branchId === 'object' 
          ? req.branchId._id || req.branchId 
          : req.branchId;
        return reqBranchId?.toString() === userBranchId.toString();
      });
    }
    return goodsRequests;
  }, [goodsRequests, user?.role, user?.branch]);

  // Transform approved goods requests to match sent goods format
  const transformApprovedRequests = () => {
    if (!filteredGoodsRequests || filteredGoodsRequests.length === 0) {
      return [];
    }

    return filteredGoodsRequests
      .filter(request => {
        // Only include approved requests
        const status = (request.status || '').toLowerCase();
        return status === 'approved';
      })
      .map(request => ({
        _id: request._id,
        trackingId: request.requestId || `REQ-${request._id?.toString().slice(-6)}`,
        requestId: request.requestId, // Keep original requestId
        branchId: request.branchId,
        status: 'approved-request', // Special status for approved requests
        items: request.items?.map(item => ({
          inventoryId: null, // No inventory ID for requests
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.productId?.price || 0,
          notes: item.notes
        })) || [],
        totalValue: request.items?.reduce((sum, item) => {
          const price = item.productId?.price || 0;
          return sum + (item.quantity * price);
        }, 0) || 0,
        sentAt: request.requestedDate || request.createdAt,
        requestedDate: request.requestedDate, // Keep original requestedDate
        deliveredAt: null,
        notes: request.notes,
        createdBy: request.createdBy,
        updatedBy: request.updatedBy,
        isReceived: false,
        isApprovedRequest: true, // Flag to identify this is from a goods request
        originalRequest: request // Keep reference to original request
      }));
  };

  // Transform fulfilled goods requests to match sent goods format
  const transformFulfilledRequests = () => {
    if (!filteredGoodsRequests || filteredGoodsRequests.length === 0) {
      return [];
    }

    return filteredGoodsRequests
      .filter(request => {
        // Only include fulfilled requests
        const status = (request.status || '').toLowerCase();
        return status === 'fulfilled';
      })
      .map(request => ({
        _id: request._id,
        trackingId: request.requestId || `REQ-${request._id?.toString().slice(-6)}`,
        requestId: request.requestId, // Keep original requestId
        branchId: request.branchId,
        status: 'fulfilled-request', // Special status for fulfilled requests
        items: request.items?.map(item => ({
          inventoryId: null, // No inventory ID for requests
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.productId?.price || 0,
          notes: item.notes
        })) || [],
        totalValue: request.items?.reduce((sum, item) => {
          const price = item.productId?.price || 0;
          return sum + (item.quantity * price);
        }, 0) || 0,
        sentAt: request.fulfilledAt || request.approvedAt || request.requestedDate || request.createdAt,
        requestedDate: request.requestedDate, // Keep original requestedDate
        deliveredAt: request.fulfilledAt || null,
        notes: request.notes,
        createdBy: request.createdBy,
        updatedBy: request.updatedBy,
        isReceived: true, // Fulfilled requests are considered received
        receivedAt: request.fulfilledAt || null,
        receivedBy: request.fulfilledBy || null,
        isApprovedRequest: false,
        isFulfilledRequest: true, // Flag to identify this is a fulfilled request
        originalRequest: request // Keep reference to original request
      }));
  };

  // Combine sent goods, approved requests, and fulfilled requests
  const approvedRequests = transformApprovedRequests();
  const fulfilledRequests = transformFulfilledRequests();
  const combinedGoods = [
    ...sentGoods,
    ...approvedRequests,
    ...fulfilledRequests
  ].sort((a, b) => {
    // Sort by date (most recent first)
    const dateA = new Date(a.sentAt || a.requestedDate || 0);
    const dateB = new Date(b.sentAt || b.requestedDate || 0);
    return dateB - dateA;
  });

  // Debug logging (can be removed in production)
  useEffect(() => {
    if (goodsRequests && goodsRequests.length > 0) {
      const approvedCount = goodsRequests.filter(r => (r.status || '').toLowerCase() === 'approved').length;
      if (approvedCount > 0) {
        console.log(`✅ Found ${approvedCount} approved goods request(s) to display in received goods`);
      }
    }
  }, [goodsRequests]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openStatusDropdown) {
        const ref = statusDropdownRefs.current[openStatusDropdown];
        const buttonRef = buttonRefs.current[openStatusDropdown];
        if (ref && !ref.contains(event.target) && buttonRef && !buttonRef.contains(event.target)) {
          setOpenStatusDropdown(null);
        }
      }
    };

    if (openStatusDropdown) {
      // Use click event with capture phase to allow button clicks to complete first
      document.addEventListener('click', handleClickOutside, true);
      return () => {
        document.removeEventListener('click', handleClickOutside, true);
      };
    }
  }, [openStatusDropdown]);



  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-transit': 'bg-blue-100 text-blue-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'approved-request': 'bg-blue-100 text-blue-800', // For approved goods requests
      'fulfilled-request': 'bg-green-100 text-green-800' // For fulfilled goods requests
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status display name
  const getStatusDisplay = (status) => {
    const displays = {
      'pending': 'Pending',
      'in-transit': 'In Transit',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'approved-request': 'Approved Request',
      'fulfilled-request': 'Fulfilled Request'
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
      'cancelled': [], // No further actions for cancelled
      'approved-request': [], // No status changes for approved requests (they can only be marked as received)
      'fulfilled-request': [] // No status changes for fulfilled requests
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

  // Handle mark as received
  const handleMarkAsReceived = async (goodsId, isApprovedRequest = false) => {
    setMarkingAsReceived(goodsId);
    try {
      let result;
      if (isApprovedRequest) {
        // Mark approved goods request as received
        result = await dispatch(markGoodsRequestAsReceived(goodsId));
      } else {
        // Mark sent goods as received
        result = await dispatch(markAsReceived(goodsId));
      }
      
      const action = isApprovedRequest ? markGoodsRequestAsReceived : markAsReceived;
      
      if (action.fulfilled.match(result)) {
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Goods marked as received and added to branch inventory successfully!',
          duration: 3000
        }));
        // Refresh the data
        if (onRefresh) {
          onRefresh();
        }
      } else {
        const errorMessage = typeof result.payload === 'string' 
          ? result.payload 
          : result.payload?.message || 'Failed to mark as received';
        dispatch(addNotification({
          type: 'error',
          title: 'Error',
          message: errorMessage,
          duration: 5000
        }));
      }
    } catch (error) {
      const errorMessage = typeof error === 'string' 
        ? error 
        : error?.message || 'Failed to mark as received';
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
        duration: 5000
      }));
    } finally {
      setMarkingAsReceived(null);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'trackingId',
      label: 'Tracking ID',
      render: (goods) => (
        <div className="text-sm font-medium text-gray-900">
          {goods.trackingId || goods.requestId || 'N/A'}
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      cellClassName: 'overflow-visible',
      render: (goods) => {
        const availableOptions = getAvailableStatusOptions(goods.status);
        const isOpen = openStatusDropdown === goods._id;
        const isUpdating = updatingStatus === goods._id;
        
        const handleButtonClick = () => {
          if (availableOptions.length > 0) {
            const button = buttonRefs.current[goods._id];
            if (button) {
              const rect = button.getBoundingClientRect();
              setDropdownPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX
              });
            }
            setOpenStatusDropdown(isOpen ? null : goods._id);
          }
        };
        
        return (
          <div className="inline-block" ref={el => statusDropdownRefs.current[goods._id] = el}>
            <button
              ref={el => buttonRefs.current[goods._id] = el}
              onClick={handleButtonClick}
              disabled={isUpdating || availableOptions.length === 0}
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(goods.status)} ${availableOptions.length > 0 ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {getStatusDisplay(goods.status)}
              {availableOptions.length > 0 && (
                <HiChevronDown className={`ml-1 h-3 w-3 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} />
              )}
              {isUpdating && (
                <div className="ml-1 animate-spin rounded-full h-3 w-3 border-b-2 border-current"></div>
              )}
            </button>
            
            {isOpen && availableOptions.length > 0 && (
              <div 
                className="fixed z-[9999] w-40 bg-white rounded-md shadow-xl border border-gray-200 py-1"
                style={{ top: `${dropdownPosition.top}px`, left: `${dropdownPosition.left}px` }}
              >
                {availableOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleStatusUpdate(goods._id, option.value);
                      setOpenStatusDropdown(null);
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }
    },
    {
      key: 'sentAt',
      label: 'Sent Date',
      render: (goods) => (
        <div className="text-sm text-gray-900">
          {formatDate(goods.sentAt || goods.requestedDate || goods.createdAt)}
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
          ₹{(goods.totalAmount || goods.totalValue || 0).toLocaleString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (goods) => {
        const isMarking = markingAsReceived === goods._id;
        // Can mark as received if: not already received, and either sent goods or approved request (not fulfilled)
        const canMark = canMarkAsReceived && 
          !goods.isReceived && 
          !goods.isFulfilledRequest &&
          goods.status !== 'fulfilled' &&
          goods.status !== 'fulfilled-request' &&
          (goods.status !== 'cancelled' || goods.isApprovedRequest);
        
        return (
          <div className="flex items-center space-x-2">
            <ActionButton
              icon={HiEye}
              onClick={() => {
                setSelectedGoods(goods);
                setShowDetailsModal(true);
              }}
              tooltip="View Details"
              variant="view"
              size="sm"
            />
            {canMark && (
              <ActionButton
                icon={HiCheckCircle}
                onClick={() => handleMarkAsReceived(goods._id, goods.isApprovedRequest)}
                tooltip="Mark as Received"
                variant="success"
                size="sm"
                disabled={isMarking}
                loading={isMarking}
              />
            )}
            {(goods.isReceived || goods.isFulfilledRequest || goods.status === 'fulfilled' || goods.status === 'fulfilled-request') && (
              <HiCheckCircle className="h-5 w-5 text-green-600" />
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

  if (combinedGoods.length === 0) {
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
        data={combinedGoods}
        columns={columns}
        loading={loading}
        emptyMessage="No received goods found"
        allowOverflow={true}
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
                label: (selectedGoods.isApprovedRequest || selectedGoods.isFulfilledRequest) ? 'Requested At' : 'Sent At',
                value: formatDate(selectedGoods.sentAt || selectedGoods.requestedDate || selectedGoods.createdAt)
              },
              ...(selectedGoods.deliveredAt ? [{
                label: 'Delivered At',
                value: formatDate(selectedGoods.deliveredAt)
              }] : []),
              ...(selectedGoods.isReceived ? [{
                label: 'Received',
                value: 'Yes'
              }] : []),
              ...(selectedGoods.receivedAt ? [{
                label: 'Received At',
                value: formatDate(selectedGoods.receivedAt)
              }] : []),
              ...(selectedGoods.receivedBy ? [{
                label: 'Received By',
                value: `${selectedGoods.receivedBy?.firstName || ''} ${selectedGoods.receivedBy?.lastName || ''}`.trim() || 'N/A'
              }] : [])
            ].filter(Boolean)
          };

          const basicInfo = {
            title: 'Basic Information',
            fields: [
              {
                label: (selectedGoods.isApprovedRequest || selectedGoods.isFulfilledRequest) ? 'Request ID' : 'Tracking ID',
                value: selectedGoods.trackingId || selectedGoods.requestId || 'N/A'
              },
              {
                label: 'Total Items',
                value: selectedGoods.items?.length || 0
              },
              {
                label: (selectedGoods.isApprovedRequest || selectedGoods.isFulfilledRequest) ? 'Request Type' : 'Sent From',
                value: (selectedGoods.isApprovedRequest || selectedGoods.isFulfilledRequest) ? 'Goods Request' : 'Head Office'
              },
              ...((selectedGoods.isApprovedRequest || selectedGoods.isFulfilledRequest) && selectedGoods.originalRequest?.priority ? [{
                label: 'Priority',
                value: selectedGoods.originalRequest.priority.toUpperCase()
              }] : [])
            ].filter(Boolean)
          };

          const itemsInfo = selectedGoods.items && selectedGoods.items.length > 0 ? {
            title: 'Items',
            fields: selectedGoods.items.map((item, index) => ({
              label: item.inventoryId?.productId?.productName || item.productId?.productName || 'Unknown Product',
              value: `${item.quantity} units${item.unitPrice ? ` | ₹${item.unitPrice}` : ''}${item.notes ? ` | Notes: ${item.notes}` : ''}`
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
