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
  HiExclamationTriangle
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading } from '../../components/common';
import {
  getAllOrders,
  getOrderStats,
  deleteOrder,
  updateOrderStatus,
  updatePaymentStatus
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

  // Handle view order
  const handleViewOrder = (orderId) => {
    navigate(`/orders/${orderId}`);
  };

  // Handle edit order
  const handleEditOrder = (orderId) => {
    navigate(`/orders/edit/${orderId}`);
  };

  // Handle delete order
  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await dispatch(deleteOrder(orderId)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Order deleted successfully!'
        }));
        handleRefresh();
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error || 'Failed to delete order'
        }));
      }
    }
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
      await dispatch(updatePaymentStatus({ id: orderId, paymentStatus: newPaymentStatus })).unwrap();
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

  // Table columns
  const columns = [
    {
      key: 'orderNumber',
      label: 'Order #',
      render: (order) => (
        <div className="font-medium text-gray-900">
          {order.orderNumber}
        </div>
      )
    },
    {
      key: 'customer',
      label: 'Customer',
      render: (order) => (
        <div>
          <div className="font-medium text-gray-900">
            {order.customerId?.firstName} {order.customerId?.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {order.customerId?.email}
          </div>
        </div>
      )
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
      key: 'orderDate',
      label: 'Order Date',
      render: (order) => (
        <div className="text-sm text-gray-900">
          {new Date(order.orderDate).toLocaleDateString()}
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

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
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
      {statsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-6 rounded-lg shadow animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiClipboardDocumentList className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.totalOrders || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiCurrencyDollar className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₹{stats?.totalAmount?.toLocaleString() || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <HiTruck className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.pending || 0}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HiCheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Delivered</p>
                <p className="text-2xl font-bold text-gray-900">{stats?.delivered || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Search orders..."
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
              placeholder="Status"
            />
            <Select
              options={paymentStatusOptions}
              value={paymentStatusFilter}
              onChange={handlePaymentStatusFilter}
              placeholder="Payment"
            />
            <Button
              variant="outline"
              onClick={handleRefresh}
              icon={HiArrowPath}
            >
              Refresh
            </Button>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow">
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
