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
  HiBuildingOffice2
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard } from '../../components/common';
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllOrders({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      status: statusFilter,
      paymentStatus: paymentStatusFilter
    }));
    dispatch(getOrderStats());
  }, [dispatch, currentPage, searchTerm, statusFilter, paymentStatusFilter]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle status filter
  const handleStatusFilter = (value) => {
    setStatusFilter(value);
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
      status: statusFilter,
      paymentStatus: paymentStatusFilter
    }));
    dispatch(getOrderStats());
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      key: 'status',
      label: 'Status',
      render: (order) => (
        <StatusBadge
          status={order.status}
          color={getStatusColor(order.status)}
        />
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (order) => (
        <StatusBadge
          status={order.paymentStatus}
          color={getPaymentStatusColor(order.paymentStatus)}
        />
      )
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
      key: 'expectedDeliveryDate',
      label: 'Expected Delivery',
      render: (order) => (
        <div className="text-sm text-gray-900">
          {order.expectedDeliveryDate 
            ? new Date(order.expectedDeliveryDate).toLocaleDateString()
            : <span className="text-gray-400">Not set</span>
          }
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (order) => (
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleViewOrder(order._id)}
          >
            View
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleEditOrder(order._id)}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => handleDeleteOrder(order._id)}
          >
            Delete
          </Button>
        </div>
      )
    }
  ];

  // Helper functions
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'blue';
      case 'pending':
        return 'yellow';
      case 'cancelled':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getPaymentStatusColor = (paymentStatus) => {
    switch (paymentStatus) {
      case 'paid':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      case 'refunded':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Action handlers
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  const handleEditOrder = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        const result = await dispatch(deleteOrder(orderId));
        
        if (deleteOrder.fulfilled.match(result)) {
          dispatch(addNotification({
            type: 'success',
            message: 'Order deleted successfully'
          }));
          
          // Refresh orders list
          dispatch(getAllOrders({
            page: currentPage,
            limit: 10,
            search: searchTerm,
            status: statusFilter,
            paymentStatus: paymentStatusFilter
          }));
        } else {
          dispatch(addNotification({
            type: 'error',
            message: result.payload || 'Failed to delete order'
          }));
        }
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to delete order'
        }));
      }
    }
  };

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Payment Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  if (loading && orders.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600">Track and manage all customer orders</p>
        </div>
        <Button
          onClick={() => navigate('/orders/new')}
          variant="primary"
          icon={HiPlus}
        >
          Create New Order
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
          title="Total Value"
          value={`₹${stats?.totalRevenue?.toLocaleString() || 0}`}
          icon={HiCurrencyDollar}
          gradient="green"
          loading={statsLoading}
        />
        <StatCard
          title="Processing"
          value={stats?.overview?.processingOrders || 0}
          icon={HiClock}
          gradient="yellow"
          loading={statsLoading}
        />
        <StatCard
          title="Completed"
          value={stats?.overview?.deliveredOrders || 0}
          icon={HiCheckCircle}
          gradient="purple"
          loading={statsLoading}
        />
          </div>

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search order ID, customer, or branch..."
              value={searchTerm}
              onChange={handleSearch}
              icon={HiMagnifyingGlass}
            />
          </div>
          <div className="flex gap-2">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={handleStatusFilter}
              placeholder="All Status"
            />
            <Select
              options={paymentStatusOptions}
              value={paymentStatusFilter}
              onChange={handlePaymentStatusFilter}
              placeholder="All Payment Status"
            />
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
    </div>
  );
};

export default OrdersPage;

