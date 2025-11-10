import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiEye,
  HiBuildingOffice2,
  HiCalendar,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiExclamationTriangle,
  HiShoppingBag
} from 'react-icons/hi2';
import { Table, StatusBadge, ActionButton } from '../../common';
import CommonModal from '../../common/CommonModal';
import DetailsView from '../../common/DetailsView';
import Button from '../../common/Button';
import { updateGoodsRequestStatus } from '../../../redux/actions/goodsRequestActions';
import { addNotification } from '../../../redux/slices/uiSlice';

const GoodsRequestsCRUD = ({ 
  goodsRequests = [],
  loading = false,
  onRefresh,
  showActions = true
}) => {
  const dispatch = useDispatch();
  const [updatingStatus, setUpdatingStatus] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'rejected': 'bg-red-100 text-red-800',
      'fulfilled': 'bg-green-100 text-green-800',
      'cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  // Get status display name
  const getStatusDisplay = (status) => {
    const displays = {
      'pending': 'Pending',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'fulfilled': 'Fulfilled',
      'cancelled': 'Cancelled'
    };
    return displays[status] || status;
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

  // Handle status update
  const handleStatusUpdate = async (requestId, newStatus, reason = '') => {
    setUpdatingStatus(requestId);
    setErrorMessage(''); // Clear any previous error
    try {
      await dispatch(updateGoodsRequestStatus({ 
        id: requestId, 
        status: newStatus,
        rejectionReason: reason
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: `Request ${newStatus} successfully!`,
        duration: 3000
      }));
      setShowActionModal(false);
      setActionType(null);
      setRejectionReason('');
      setErrorMessage('');
      if (onRefresh) {
        onRefresh();
      }
    } catch (error) {
      // Extract error message - handle both string and object error formats
      // The error can be:
      // 1. A string (when rejectWithValue passes a string)
      // 2. An object with message property (transformed axios error)
      // 3. An object with data.message (nested error structure)
      let extractedErrorMessage = 'Failed to update request status';
      
      if (typeof error === 'string') {
        extractedErrorMessage = error;
      } else if (error?.message) {
        extractedErrorMessage = error.message;
      } else if (error?.data?.message) {
        extractedErrorMessage = error.data.message;
      } else if (error?.response?.data?.message) {
        extractedErrorMessage = error.response.data.message;
      }
      
      console.error('Error updating goods request status:', error);
      
      // Set error message in state to display in modal
      setErrorMessage(extractedErrorMessage);
      
      // Also show notification
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: extractedErrorMessage,
        duration: 5000
      }));
    } finally {
      setUpdatingStatus(null);
    }
  };

  const handleActionClick = (request, action) => {
    setSelectedRequest(request);
    setActionType(action);
    setErrorMessage(''); // Clear any previous error
    setShowActionModal(true);
  };

  const handleActionConfirm = () => {
    if (actionType === 'reject' && !rejectionReason.trim()) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please provide a rejection reason'
      }));
      return;
    }
    handleStatusUpdate(selectedRequest._id, actionType, rejectionReason);
  };

  // Table columns
  const columns = [
    {
      key: 'requestId',
      label: 'Request ID',
      render: (request) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{request.requestId}</div>
          <div className="text-sm text-gray-500">{request.branchId?.branchName || 'Unknown Branch'}</div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (request) => (
        <StatusBadge
          status={getStatusDisplay(request.status)}
          color={getStatusColor(request.status)}
        />
      )
    },
    {
      key: 'priority',
      label: 'Priority',
      render: (request) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          request.priority === 'urgent' ? 'bg-red-100 text-red-800' :
          request.priority === 'high' ? 'bg-orange-100 text-orange-800' :
          request.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
          'bg-gray-100 text-gray-800'
        }`}>
          {request.priority?.toUpperCase() || 'MEDIUM'}
        </span>
      )
    },
    {
      key: 'items',
      label: 'Items',
      render: (request) => (
        <div className="text-sm text-gray-900">
          {request.items?.length || 0} item(s)
        </div>
      )
    },
    {
      key: 'requestedDate',
      label: 'Requested Date',
      render: (request) => (
        <div className="text-sm text-gray-900">
          {formatDate(request.requestedDate)}
        </div>
      )
    },
    {
      key: 'createdBy',
      label: 'Requested By',
      render: (request) => (
        <div className="text-sm text-gray-900">
          {request.createdBy?.firstName} {request.createdBy?.lastName}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (request) => {
        if (!showActions) {
          // For supervisors/admins viewing their own requests, only show view
          return (
            <div className="flex items-center space-x-2">
              <ActionButton
                icon={HiEye}
                onClick={() => {
                  setSelectedRequest(request);
                  setShowDetailsModal(true);
                }}
                tooltip="View Details"
                variant="view"
                size="sm"
              />
            </div>
          );
        }
        
        // For super admin, show all actions
        // Only show approve/reject for pending requests
        const status = (request.status || '').toLowerCase();
        const canApprove = status === 'pending';
        const canReject = status === 'pending';
        // Only show fulfill for approved requests (not yet fulfilled or cancelled)
        const canFulfill = status === 'approved';
        
        return (
          <div className="flex items-center space-x-2">
            <ActionButton
              icon={HiEye}
              onClick={() => {
                setSelectedRequest(request);
                setShowDetailsModal(true);
              }}
              tooltip="View Details"
              variant="view"
              size="sm"
            />
            {canApprove && (
              <ActionButton
                icon={HiCheckCircle}
                onClick={() => handleActionClick(request, 'approved')}
                tooltip="Approve"
                variant="success"
                size="sm"
              />
            )}
            {canReject && (
              <ActionButton
                icon={HiXCircle}
                onClick={() => handleActionClick(request, 'rejected')}
                tooltip="Reject"
                variant="danger"
                size="sm"
              />
            )}
            {canFulfill && (
              <ActionButton
                icon={HiCheckCircle}
                onClick={() => handleActionClick(request, 'fulfilled')}
                tooltip="Mark as Fulfilled"
                variant="success"
                size="sm"
              />
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

  if (goodsRequests.length === 0) {
    return (
      <div className="text-center py-12">
        <HiShoppingBag className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No goods requests found</h3>
        <p className="mt-1 text-sm text-gray-500">No goods requests have been submitted yet.</p>
      </div>
    );
  }

  return (
    <>
      <Table
        data={goodsRequests}
        columns={columns}
        loading={loading}
        emptyMessage="No goods requests found"
        allowOverflow={true}
      />

      {/* Details Modal */}
      <CommonModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="Goods Request Details"
        subtitle={selectedRequest?.requestId || ''}
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
        {selectedRequest && (() => {
          const basicInfo = {
            title: 'Basic Information',
            fields: [
              {
                label: 'Request ID',
                value: selectedRequest.requestId || 'N/A'
              },
              {
                label: 'Branch',
                value: selectedRequest.branchId?.branchName || 'Unknown'
              },
              {
                label: 'Status',
                value: getStatusDisplay(selectedRequest.status)
              },
              {
                label: 'Priority',
                value: selectedRequest.priority?.toUpperCase() || 'MEDIUM'
              },
              {
                label: 'Requested Date',
                value: formatDate(selectedRequest.requestedDate)
              },
              {
                label: 'Requested By',
                value: `${selectedRequest.createdBy?.firstName || ''} ${selectedRequest.createdBy?.lastName || ''}`.trim() || 'N/A'
              }
            ]
          };

          const itemsInfo = selectedRequest.items && selectedRequest.items.length > 0 ? {
            title: 'Requested Items',
            fields: selectedRequest.items.map((item, index) => ({
              label: item.productId?.productName || 'Unknown Product',
              value: `Quantity: ${item.quantity}${item.notes ? ` | Notes: ${item.notes}` : ''}`
            }))
          } : null;

          const notesInfo = selectedRequest.notes ? {
            title: 'Notes',
            fields: [
              {
                label: 'Additional Notes',
                value: selectedRequest.notes
              }
            ]
          } : null;

          const rejectionInfo = selectedRequest.rejectionReason ? {
            title: 'Rejection Information',
            fields: [
              {
                label: 'Rejection Reason',
                value: selectedRequest.rejectionReason
              },
              ...(selectedRequest.approvedBy ? [{
                label: 'Rejected By',
                value: `${selectedRequest.approvedBy?.firstName || ''} ${selectedRequest.approvedBy?.lastName || ''}`.trim()
              }] : [])
            ]
          } : null;

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <DetailsView sections={[basicInfo]} />
                {notesInfo && <DetailsView sections={[notesInfo]} />}
                {rejectionInfo && <DetailsView sections={[rejectionInfo]} />}
              </div>
              <div className="space-y-4">
                {itemsInfo && <DetailsView sections={[itemsInfo]} />}
              </div>
            </div>
          );
        })()}
      </CommonModal>

      {/* Action Confirmation Modal */}
      <CommonModal
        isOpen={showActionModal}
        onClose={() => {
          setShowActionModal(false);
          setActionType(null);
          setRejectionReason('');
          setErrorMessage('');
        }}
        title={actionType === 'approved' ? 'Approve Request' : actionType === 'rejected' ? 'Reject Request' : 'Fulfill Request'}
        subtitle={selectedRequest?.requestId || ''}
        size="md"
        showFooter={true}
        footerContent={
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setShowActionModal(false);
                setActionType(null);
                setRejectionReason('');
                setErrorMessage('');
              }}
              variant="outline"
            >
              Cancel
            </Button>
            <Button
              onClick={handleActionConfirm}
              variant="primary"
              loading={updatingStatus === selectedRequest?._id}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <HiXCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800 mb-1">Error</h4>
                <p className="text-sm text-red-700">{errorMessage}</p>
              </div>
            </div>
          )}
          
          {actionType === 'rejected' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                placeholder="Please provide a reason for rejection"
              />
            </div>
          ) : (
            <p className="text-gray-600">
              Are you sure you want to {actionType} this goods request?
            </p>
          )}
        </div>
      </CommonModal>
    </>
  );
};

export default GoodsRequestsCRUD;

