import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiFunnel,
  HiArrowPath,
  HiClipboardDocumentList,
  HiCurrencyDollar,
  HiTruck,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiExclamationTriangle,
  HiEye,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal } from '../../components/common';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import {
  getAllOrders,
  getOrderStats,
  deleteOrder,
  updateOrderStatus,
  updateOrderPayment
} from '../../redux/actions/orderActions';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  selectOrders,
  selectOrderLoading,
  selectOrderError,
  selectOrderStats,
  selectOrderStatsLoading,
  selectOrderPagination
} from '../../redux/slices/orderSlice';

const OrdersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const orders = useSelector(selectOrders);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const stats = useSelector(selectOrderStats);
  const statsLoading = useSelector(selectOrderStatsLoading);
  const pagination = useSelector(selectOrderPagination);
  
  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllOrders({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      paymentStatus: paymentStatusFilter
    }));
    dispatch(getOrderStats());
  }, [dispatch, currentPage, searchTerm, paymentStatusFilter]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle payment status filter
  const handlePaymentStatusFilter = (value) => {
    setPaymentStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle refresh
  const handleRefresh = () => {
    dispatch(getAllOrders({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      paymentStatus: paymentStatusFilter
    }));
    dispatch(getOrderStats());
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle view order
  const handleViewOrder = (orderId) => {
    setSelectedOrderId(orderId);
    setShowOrderModal(true);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    setShowOrderModal(false);
    navigate(`/orders/edit/${orderId}`);
  };

  // Handle delete order click
  const handleDeleteOrder = (orderId) => {
    const order = orders.find(o => o._id === orderId);
    setOrderToDelete(order);
    setShowDeleteModal(true);
  };

  // Confirm delete order
  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;
    
    try {
      await dispatch(deleteOrder(orderToDelete._id)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Order deleted successfully!'
      }));
      handleRefresh();
      setShowDeleteModal(false);
      setOrderToDelete(null);
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to delete order'
      }));
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setOrderToDelete(null);
  };

  // Handle status update
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Order status updated to ${newStatus}`
      }));
      handleRefresh();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update order status'
      }));
    }
  };

  // Handle payment status update
  const handlePaymentStatusUpdate = async (orderId, newPaymentStatus) => {
    try {
      await dispatch(updateOrderPayment({ id: orderId, paymentStatus: newPaymentStatus })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Payment status updated to ${newPaymentStatus}`
      }));
      handleRefresh();
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to update payment status'
      }));
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

  // Table columns
  const columns = [
    {
      key: 'orderId',
      label: 'Order #',
      render: (order) => (
        <div className="font-medium text-gray-900">
          {order.orderId}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order) => {
        // Handle both user and lead customers
        const customerName = order.customerType === 'user' 
          ? `${order.customerId?.firstName || ''} ${order.customerId?.lastName || ''}`.trim()
          : order.leadId?.customerName || 'Unknown Customer';
        
        const customerEmail = order.customerType === 'user' 
          ? order.customerId?.email
          : order.leadId?.email;
        
        const customerPhone = order.customerType === 'user' 
          ? order.customerId?.phone
          : order.leadId?.customerMobile;
        
        return (
        <div>
          <div className="font-medium text-gray-900">
              {customerName || 'Unknown Customer'}
          </div>
          <div className="text-sm text-gray-500">
              {customerEmail || customerPhone || 'No contact info'}
            </div>
            <div className="text-xs text-gray-400">
              {order.customerType === 'lead' ? 'Lead' : 'User'}
          </div>
        </div>
        );
      }
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900">
            {order.branchId?.branchName}
          </div>
          <div className="text-sm text-gray-500">
            {order.branchId?.branchCode}
          </div>
        </div>
      )
    },
    {
      key: 'totalAmount',
      label: 'Total Amount',
      render: (order) => (
        <div className="font-medium text-gray-900">
          ₹{order.totalAmount?.toLocaleString()}
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (order) => (
        <StatusBadge
          status={order.paymentStatus}
          color={getPaymentStatusColor(order.paymentStatus)}
        />
      )
    },
    {
      key: 'paymentId',
      label: 'Payment ID',
      render: (order) => (
        <div className="text-sm">
          {order.paymentId ? (
            <span className="font-medium text-gray-900">{order.paymentId}</span>
          ) : (
            <span className="text-gray-400 italic">-</span>
          )}
        </div>
      )
    },
    {
      key: 'orderStatus',
      label: 'Order Status',
      render: (order) => {
        // Simple color: delivered=green, returned=orange, closed=gray, others=blue
        let color = 'blue';
        if (order.status === 'delivered') color = 'green';
        else if (order.status === 'returned') color = 'orange';
        else if (order.status === 'closed') color = 'gray';
        else if (order.status === 'draft') color = 'gray';
        else if (order.status === 'confirmed') color = 'purple';
        else if (order.status === 'picked') color = 'yellow';
        else if (order.status === 'dispatched') color = 'blue';
        return <StatusBadge status={order.status} color={color} />;
      }
    },
    {
      key: 'createdAt',
      label: 'Order Date',
      render: (order) => (
        <div className="text-sm text-gray-900">
          {new Date(order.createdAt).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'amountReceived',
      label: 'Amount Received',
      render: (order) => {
        // If amountReceived field exists, use it; otherwise calculate based on payment status
        let amountReceived = order.amountReceived;
        
        if (amountReceived === undefined || amountReceived === null) {
          if (order.paymentStatus === 'paid') {
            amountReceived = order.totalAmount || 0;
          } else {
            amountReceived = 0;
          }
        }
        
        return (
          <div className="font-medium text-gray-900">
            ₹{amountReceived.toLocaleString()}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order) => (
        <div className="flex space-x-3">
          <button
            onClick={() => handleViewOrder(order._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="View Order"
          >
            <HiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditOrder(order._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit Order"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteOrder(order._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Delete Order"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: 'all', label: 'All Payment Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' }
  ];

  if (loading && orders.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-600">Manage customer orders and track their status</p>
        </div>
        <Button
          onClick={() => navigate('/orders/new')}
          variant="primary"
          icon={HiPlus}
        >
          New Order
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Orders"
          value={stats?.overview?.totalOrders || 0}
          icon={HiClipboardDocumentList}
          gradient="blue"
          loading={statsLoading}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={HiCurrencyDollar}
          gradient="green"
          loading={statsLoading}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.overview?.pendingOrders || 0}
          icon={HiTruck}
          gradient="yellow"
          loading={statsLoading}
        />
        <StatCard
          title="Delivered"
          value={stats?.overview?.deliveredOrders || 0}
          icon={HiCheckCircle}
          gradient="purple"
          loading={statsLoading}
        />
          </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg p-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search orders..."
              value={searchTerm}
              onChange={handleSearch}
              icon={HiMagnifyingGlass}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
            <div className="w-full sm:w-48">
              <Select
                options={paymentStatusOptions}
                value={paymentStatusFilter}
                onChange={handlePaymentStatusFilter}
                placeholder="Payment Status"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white">
        <Table
          data={orders}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          emptyMessage="No orders found"
          emptyIcon={HiClipboardDocumentList}
        />
      </div>

      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={showOrderModal}
        onClose={() => {
          setShowOrderModal(false);
          setSelectedOrderId(null);
        }}
        orderId={selectedOrderId}
        onEdit={handleEditOrder}
        onDelete={handleDeleteOrder}
        onRefresh={handleRefresh}
      />

      {/* Delete Confirmation Modal */}
      <CommonModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Order"
        subtitle="This action cannot be undone"
        icon={HiTrash}
        iconColor="from-red-500 to-red-600"
        size="sm"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteOrder}
              size="sm"
            >
              Delete Order
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <HiTrash className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure you want to delete this order?
          </h3>
          {orderToDelete && (
            <div className="text-sm text-gray-500 mb-4">
              <p><strong>Order ID:</strong> {orderToDelete.orderId}</p>
              <p><strong>Customer:</strong> {
                orderToDelete.customerType === 'user' 
                  ? `${orderToDelete.customerId?.firstName || ''} ${orderToDelete.customerId?.lastName || ''}`.trim()
                  : orderToDelete.leadId?.customerName || 'Unknown Customer'
              }</p>
              <p><strong>Total Amount:</strong> ₹{orderToDelete.totalAmount?.toLocaleString()}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone. The order will be permanently removed from the system.
          </p>
        </div>
      </CommonModal>
    </div>
  );
};

export default OrdersPage;

