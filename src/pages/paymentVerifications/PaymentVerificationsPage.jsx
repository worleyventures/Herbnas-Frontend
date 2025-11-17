import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiEye,
  HiExclamationTriangle
} from 'react-icons/hi2';
import { Table, StatusBadge, Button, Loading, CommonModal, Input } from '../../components/common';
import {
  getAllPaymentVerifications,
  approvePaymentVerification,
  rejectPaymentVerification,
  getPendingVerificationCount
} from '../../redux/actions/paymentVerificationActions';
import {
  selectPaymentVerifications,
  selectPaymentVerificationLoading,
  selectPaymentVerificationError,
  selectPaymentVerificationPagination,
  selectPendingVerificationCount
} from '../../redux/slices/paymentVerificationSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import { getAllOrders } from '../../redux/actions/orderActions';

const PaymentVerificationsPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth || {});
  
  const verifications = useSelector(selectPaymentVerifications);
  const loading = useSelector(selectPaymentVerificationLoading);
  const error = useSelector(selectPaymentVerificationError);
  const pagination = useSelector(selectPaymentVerificationPagination);
  const pendingCount = useSelector(selectPendingVerificationCount);
  
  const [statusFilter, setStatusFilter] = useState('pending');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedVerification, setSelectedVerification] = useState(null);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [approveNotes, setApproveNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  
  // Load verifications on mount and when filters change
  useEffect(() => {
    dispatch(getAllPaymentVerifications({
      page: currentPage,
      limit: 10,
      status: statusFilter === 'all' ? '' : statusFilter
    }));
    dispatch(getPendingVerificationCount());
  }, [dispatch, currentPage, statusFilter]);
  
  // Refresh pending count periodically
  useEffect(() => {
    const interval = setInterval(() => {
      dispatch(getPendingVerificationCount());
    }, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, [dispatch]);
  
  const handleApprove = async () => {
    if (!selectedVerification) return;
    
    setActionLoading(true);
    try {
      await dispatch(approvePaymentVerification({
        id: selectedVerification._id,
        notes: approveNotes
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Payment verification approved successfully!'
      }));
      
      // Refresh verifications and orders
      dispatch(getAllPaymentVerifications({
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? '' : statusFilter
      }));
      dispatch(getAllOrders({ page: 1, limit: 10 }));
      dispatch(getPendingVerificationCount());
      
      setShowApproveModal(false);
      setSelectedVerification(null);
      setApproveNotes('');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to approve verification'
      }));
    } finally {
      setActionLoading(false);
    }
  };
  
  const handleReject = async () => {
    if (!selectedVerification || !rejectionReason.trim()) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please provide a rejection reason'
      }));
      return;
    }
    
    setActionLoading(true);
    try {
      await dispatch(rejectPaymentVerification({
        id: selectedVerification._id,
        rejectionReason: rejectionReason
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        message: 'Payment verification rejected successfully!'
      }));
      
      // Refresh verifications
      dispatch(getAllPaymentVerifications({
        page: currentPage,
        limit: 10,
        status: statusFilter === 'all' ? '' : statusFilter
      }));
      dispatch(getPendingVerificationCount());
      
      setShowRejectModal(false);
      setSelectedVerification(null);
      setRejectionReason('');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to reject verification'
      }));
    } finally {
      setActionLoading(false);
    }
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const formatCurrency = (amount) => {
    return `₹${parseFloat(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'yellow';
      case 'approved':
        return 'green';
      case 'rejected':
        return 'red';
      default:
        return 'gray';
    }
  };
  
  const columns = [
    {
      key: 'orderId',
      label: 'Order ID',
      render: (verification) => (
        <div className="font-medium text-gray-900">
          {verification.orderId?.orderId || verification.orderId?._id || 'N/A'}
        </div>
      )
    },
    {
      key: 'requestedBy',
      label: 'Requested By',
      render: (verification) => (
        <div>
          <div className="text-sm font-medium text-gray-900">
            {verification.requestedBy?.firstName} {verification.requestedBy?.lastName}
          </div>
          <div className="text-xs text-gray-500">
            {verification.requestedBy?.role || 'N/A'}
          </div>
        </div>
      )
    },
    {
      key: 'currentValues',
      label: 'Current Values',
      render: (verification) => (
        <div className="text-sm">
          <div className="text-gray-900">
            <span className="font-medium">Status:</span> {verification.currentPaymentStatus}
          </div>
          <div className="text-gray-600">
            <span className="font-medium">Amount:</span> {formatCurrency(verification.currentAmountReceived)}
          </div>
        </div>
      )
    },
    {
      key: 'requestedValues',
      label: 'Requested Values',
      render: (verification) => (
        <div className="text-sm">
          <div className="text-green-700 font-medium">
            <span className="font-semibold">Status:</span> {verification.requestedPaymentStatus}
          </div>
          <div className="text-green-600">
            <span className="font-semibold">Amount:</span> {formatCurrency(verification.requestedAmountReceived)}
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (verification) => (
        <StatusBadge
          status={verification.status}
          color={getStatusColor(verification.status)}
        />
      )
    },
    {
      key: 'createdAt',
      label: 'Requested At',
      render: (verification) => (
        <div className="text-sm text-gray-500">
          {formatDate(verification.createdAt)}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (verification) => (
        <div className="flex space-x-2">
          {verification.status === 'pending' && (
            <>
              <button
                onClick={() => {
                  setSelectedVerification(verification);
                  setShowApproveModal(true);
                }}
                className="text-green-600 hover:text-green-700 transition-colors"
                title="Approve"
              >
                <HiCheckCircle className="w-5 h-5" />
              </button>
              <button
                onClick={() => {
                  setSelectedVerification(verification);
                  setShowRejectModal(true);
                }}
                className="text-red-600 hover:text-red-700 transition-colors"
                title="Reject"
              >
                <HiXCircle className="w-5 h-5" />
              </button>
            </>
          )}
          <button
            onClick={() => setSelectedVerification(verification)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="View Details"
          >
            <HiEye className="w-5 h-5" />
          </button>
        </div>
      )
    }
  ];
  
  if (loading && verifications.length === 0) {
    return <Loading />;
  }
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Verifications</h1>
          <p className="text-gray-600">Review and approve payment status changes for orders</p>
        </div>
        {pendingCount > 0 && (
          <div className="flex items-center space-x-2 bg-yellow-50 border border-yellow-200 rounded-lg px-4 py-2">
            <HiExclamationTriangle className="w-5 h-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-800">
              {pendingCount} pending verification{pendingCount !== 1 ? 's' : ''}
            </span>
          </div>
        )}
      </div>
      
      {/* Filters */}
      <div className="bg-white rounded-lg p-4">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">Status:</label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#8bc34a]"
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      
      {/* Verifications Table */}
      <div className="bg-white">
        <Table
          data={verifications}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination ? {
            ...pagination,
            onPageChange: setCurrentPage,
            itemName: 'verifications'
          } : null}
          emptyMessage="No payment verifications found"
          emptyIcon={HiClock}
        />
      </div>
      
      {/* Approve Modal */}
      <CommonModal
        isOpen={showApproveModal}
        onClose={() => {
          setShowApproveModal(false);
          setSelectedVerification(null);
          setApproveNotes('');
        }}
        title="Approve Payment Verification"
        subtitle={selectedVerification ? `Order: ${selectedVerification.orderId?.orderId || 'N/A'}` : ''}
        icon={HiCheckCircle}
        iconColor="from-green-500 to-green-600"
        size="lg"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowApproveModal(false);
                setSelectedVerification(null);
                setApproveNotes('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleApprove}
              loading={actionLoading}
              disabled={actionLoading}
            >
              Approve
            </Button>
          </div>
        }
      >
        {selectedVerification && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Status:</span> {selectedVerification.currentPaymentStatus}</div>
                  <div><span className="font-medium">Amount:</span> {formatCurrency(selectedVerification.currentAmountReceived)}</div>
                  {selectedVerification.currentPaymentNotes && (
                    <div><span className="font-medium">Notes:</span> {selectedVerification.currentPaymentNotes}</div>
                  )}
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-semibold text-green-700 mb-2">Requested Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Status:</span> <span className="text-green-700">{selectedVerification.requestedPaymentStatus}</span></div>
                  <div><span className="font-medium">Amount:</span> <span className="text-green-700">{formatCurrency(selectedVerification.requestedAmountReceived)}</span></div>
                  {selectedVerification.requestedPaymentNotes && (
                    <div><span className="font-medium">Notes:</span> {selectedVerification.requestedPaymentNotes}</div>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Approval Notes (Optional)
              </label>
              <Input
                type="text"
                value={approveNotes}
                onChange={(e) => setApproveNotes(e.target.value)}
                placeholder="Add any notes about this approval..."
                className="w-full"
              />
            </div>
            {selectedVerification.requestNotes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Request Notes:</span> {selectedVerification.requestNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </CommonModal>
      
      {/* Reject Modal */}
      <CommonModal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setSelectedVerification(null);
          setRejectionReason('');
        }}
        title="Reject Payment Verification"
        subtitle={selectedVerification ? `Order: ${selectedVerification.orderId?.orderId || 'N/A'}` : ''}
        icon={HiXCircle}
        iconColor="from-red-500 to-red-600"
        size="lg"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false);
                setSelectedVerification(null);
                setRejectionReason('');
              }}
              disabled={actionLoading}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleReject}
              loading={actionLoading}
              disabled={actionLoading || !rejectionReason.trim()}
            >
              Reject
            </Button>
          </div>
        }
      >
        {selectedVerification && (
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Status:</span> {selectedVerification.currentPaymentStatus}</div>
                  <div><span className="font-medium">Amount:</span> {formatCurrency(selectedVerification.currentAmountReceived)}</div>
                </div>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <h4 className="text-sm font-semibold text-red-700 mb-2">Requested Payment Information</h4>
                <div className="space-y-1 text-sm">
                  <div><span className="font-medium">Status:</span> {selectedVerification.requestedPaymentStatus}</div>
                  <div><span className="font-medium">Amount:</span> {formatCurrency(selectedVerification.requestedAmountReceived)}</div>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Rejection Reason <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Please provide a reason for rejecting this payment verification request..."
                rows={4}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                required
              />
            </div>
          </div>
        )}
      </CommonModal>
    </div>
  );
};

export default PaymentVerificationsPage;

