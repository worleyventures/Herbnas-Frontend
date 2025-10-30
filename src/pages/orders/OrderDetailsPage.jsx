import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import {
  HiArrowLeft,
  HiPencil,
  HiTrash,
  HiPrinter,
  HiShare,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiTruck,
  HiCurrencyDollar,
  HiUser,
  HiBuildingOffice2,
  HiMapPin,
  HiPhone,
  HiEnvelope,
  HiCalendar,
  HiClipboardDocumentList
} from 'react-icons/hi2';
import { Button, StatusBadge, Loading } from '../../components/common';
import {
  getOrderById,
  updateOrderStatus,
  updateOrderPayment,
  deleteOrder
} from '../../redux/actions/orderActions';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError
} from '../../redux/slices/orderSlice';

// Order Tracker Component
function OrderTracker({ order }) {
  const steps = [
    { key: 'draft', label: 'Draft' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'picked', label: 'Picked' },
    { key: 'dispatched', label: 'Dispatched' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'closed', label: 'Closed' },
    { key: 'returned', label: 'Returned' }
  ];

  // Find index of current step
  let currentIdx = steps.findIndex(s => s.key === order.status);
  // If status is returned, highlight all except closed
  if (order.status === 'returned') currentIdx = steps.length - 1;
  // Hide tracker if status is undefined/bogus
  if (currentIdx === -1) return null;

  return (
    <div className="flex flex-col mb-4">
      <div className="flex flex-row justify-between items-center w-full max-w-4xl mx-auto">
        {steps.map((s, idx) => (
          <div
            key={s.key}
            className={`flex-1 flex flex-col items-center ${idx < steps.length - 1 ? 'mr-4' : ''}`}
          >
            <div
              className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-xs
                ${idx < currentIdx ? 'bg-green-500 text-white' : idx === currentIdx ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'}
              `}
            >
              {idx + 1}
            </div>
            <span className={`mt-1 text-xs font-semibold ${idx <= currentIdx ? 'text-gray-900' : 'text-gray-400'}`}>{s.label}</span>
            {idx < steps.length - 1 && (
              <div className={`w-full h-1 mt-2 mb-1 ${idx < currentIdx - 1 ? 'bg-green-500' : idx + 1 === currentIdx ? 'bg-blue-500' : 'bg-gray-200'}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const OrderDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  
  // Local state (removed updating from view page)

  // Load order data
  useEffect(() => {
    if (id) {
      dispatch(getOrderById(id));
    }
  }, [dispatch, id]);

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      await dispatch(updateOrderStatus({ id, status: newStatus })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Order status updated to ${newStatus}`
      }));
      setShowStatusModal(false);
      setNewStatus('');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update order status'
      }));
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async () => {
    try {
      await dispatch(updateOrderPayment({ id, paymentStatus: newPaymentStatus })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Payment status updated to ${newPaymentStatus}`
      }));
      setShowPaymentModal(false);
      setNewPaymentStatus('');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update payment status'
      }));
    }
  };

  // Handle delete order
  const handleDeleteOrder = async () => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await dispatch(deleteOrder(id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Order deleted successfully!'
        }));
        navigate('/orders');
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error || 'Failed to delete order'
        }));
      }
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'delivered':
        return 'green';
      case 'shipped':
        return 'blue';
      case 'processing':
        return 'yellow';
      case 'confirmed':
        return 'purple';
      case 'cancelled':
        return 'red';
      case 'returned':
        return 'orange';
      default:
        return 'gray';
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'green';
      case 'partial':
        return 'yellow';
      case 'refunded':
        return 'blue';
      case 'failed':
        return 'red';
      default:
        return 'gray';
    }
  };

  // Status options
  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'returned', label: 'Returned' }
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' }
  ];

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiXCircle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Order Not Found</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              {error}
            </p>
            <Button
              onClick={() => navigate('/orders')}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            onClick={() => navigate('/orders')}
            variant="outline"
            icon={HiArrowLeft}
          >
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
            <p className="text-gray-600">Order #{order.orderNumber}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button
            onClick={() => navigate(`/orders/edit/${order._id}`)}
            variant="outline"
            icon={HiPencil}
          >
            Edit
          </Button>
          <Button
            onClick={handleDeleteOrder}
            variant="danger"
            icon={HiTrash}
          >
            Delete
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Tracker */}
          {(order.paymentStatus === 'paid' && order.paymentMethod !== 'cod') ||
            (order.paymentStatus === 'partial' && order.paymentMethod === 'cod') ? (
            <div className="bg-white p-6 rounded-lg shadow mb-4">
              <OrderTracker order={order} />
            </div>
          ) : null}
          {/* Order Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Order Status
                </label>
                <div className="flex items-center space-x-2">
                  <StatusBadge
                    status={order.status}
                    color={getStatusColor(order.status)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Status
                </label>
                <div className="flex items-center space-x-2">
                  <StatusBadge
                    status={order.paymentStatus}
                    color={getPaymentStatusColor(order.paymentStatus)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="bg-white p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Items</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Unit Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {order.items?.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {item.productId?.productName || 'Unknown Product'}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {item.productId?.productId || 'N/A'}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {item.quantity}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{item.unitPrice?.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        ₹{item.totalPrice?.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Order Notes */}
          {(order.notes || order.internalNotes) && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div className="space-y-4">
                {order.notes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Customer Notes
                    </label>
                    <p className="text-sm text-gray-900">{order.notes}</p>
                  </div>
                )}
                {order.internalNotes && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Internal Notes
                    </label>
                    <p className="text-sm text-gray-900">{order.internalNotes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Order Summary */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Subtotal</span>
                <span className="text-sm font-medium">₹{order.subtotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Tax</span>
                <span className="text-sm font-medium">₹{order.taxAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Shipping</span>
                <span className="text-sm font-medium">₹{order.shippingAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Discount</span>
                <span className="text-sm font-medium">-₹{order.discountAmount?.toLocaleString()}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-base font-medium text-gray-900">Total</span>
                  <span className="text-base font-bold text-gray-900">₹{order.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <HiUser className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {order.customerId?.firstName} {order.customerId?.lastName}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <HiEnvelope className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{order.customerId?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiPhone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{order.customerId?.phone}</span>
              </div>
            </div>
          </div>

          {/* Branch Information */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Branch</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <HiBuildingOffice2 className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">{order.branchId?.branchName}</span>
              </div>
              <div className="flex items-center space-x-2">
                <HiMapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-900">
                  {typeof order.branchId?.branchAddress === 'object' && order.branchId?.branchAddress !== null
                    ? `${order.branchId.branchAddress.street || ''}, ${order.branchId.branchAddress.city || ''}, ${order.branchId.branchAddress.state || ''} - ${order.branchId.branchAddress.pinCode || ''}`
                    : order.branchId?.branchAddress || 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-900">{order.shippingAddress?.name}</p>
              <p className="text-sm text-gray-900">{order.shippingAddress?.address}</p>
              <p className="text-sm text-gray-900">
                {order.shippingAddress?.city}, {order.shippingAddress?.state} {order.shippingAddress?.pincode}
              </p>
              <p className="text-sm text-gray-900">{order.shippingAddress?.phone}</p>
              {order.shippingAddress?.email && (
                <p className="text-sm text-gray-900">{order.shippingAddress?.email}</p>
              )}
            </div>
          </div>

          {/* Order Dates */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Dates</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <HiCalendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Order Date</p>
                  <p className="text-sm text-gray-600">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              {order.expectedDeliveryDate && (
                <div className="flex items-center space-x-2">
                  <HiTruck className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Expected Delivery</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.expectedDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
              {order.actualDeliveryDate && (
                <div className="flex items-center space-x-2">
                  <HiCheckCircle className="h-4 w-4 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Actual Delivery</p>
                    <p className="text-sm text-gray-600">
                      {new Date(order.actualDeliveryDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowStatusModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Order Status</h3>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handleStatusUpdate}
                  variant="primary"
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Update Status
                </Button>
                <Button
                  onClick={() => setShowStatusModal(false)}
                  variant="outline"
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Status Update Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowPaymentModal(false)} />
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Update Payment Status</h3>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {paymentStatusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <Button
                  onClick={handlePaymentStatusUpdate}
                  variant="primary"
                  className="w-full sm:w-auto sm:ml-3"
                >
                  Update Payment Status
                </Button>
                <Button
                  onClick={() => setShowPaymentModal(false)}
                  variant="outline"
                  className="w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailsPage;
