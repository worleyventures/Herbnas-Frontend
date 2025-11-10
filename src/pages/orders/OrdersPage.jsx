import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
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
  HiTrash,
  HiDocumentArrowDown
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
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get user role for permissions
  const { user } = useSelector((state) => state.auth || {});
  const isAccountsManager = user?.role === 'accounts_manager';
  const isProductionManager = user?.role === 'production_manager';
  
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

  // Refresh orders when navigating to this page (e.g., returning from edit form)
  useEffect(() => {
    if (location.pathname === '/orders') {
      dispatch(getAllOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        paymentStatus: paymentStatusFilter
      }));
      dispatch(getOrderStats());
    }
  }, [location.pathname, dispatch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle payment status filter
  const handlePaymentStatusFilter = (e) => {
    setPaymentStatusFilter(e.target.value);
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
      // Refresh the list immediately
      await dispatch(getAllOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        paymentStatus: paymentStatusFilter
      }));
      dispatch(getOrderStats());
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
      // Refresh the list immediately
      await dispatch(getAllOrders({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        paymentStatus: paymentStatusFilter
      }));
      dispatch(getOrderStats());
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

  // Helper function to calculate total amount from order items
  const calculateOrderTotal = (order) => {
    // Calculate subtotal from items
    const calculatedSubtotal = (order.items && Array.isArray(order.items))
      ? order.items.reduce((sum, item) => {
          const quantity = parseInt(item.quantity) || 0;
          const unitPrice = parseFloat(item.unitPrice) || 0;
          const totalPrice = parseFloat(item.totalPrice) || (quantity * unitPrice);
          return sum + totalPrice;
        }, 0)
      : 0;
    
    const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : (parseFloat(order.subtotal) || 0);
    const taxAmount = parseFloat(order.taxAmount) || 0;
    const shippingAmount = parseFloat(order.shippingAmount) || 0;
    const discountAmount = parseFloat(order.discountAmount) || 0;
    const codCharges = order.paymentMethod === 'cod' ? (parseFloat(order.codCharges) || 0) : 0;
    
    const totalAmount = subtotal + taxAmount + shippingAmount + codCharges - discountAmount;
    return totalAmount;
  };

  // Generate invoice for an order
  const handleGenerateInvoice = (order) => {
    if (!order) return;

    const customerName = order.customerType === 'user'
      ? `${order.customerId?.firstName || ''} ${order.customerId?.lastName || ''}`.trim()
      : order.leadId?.customerName || 'Unknown Customer';
    
    const customerEmail = order.customerType === 'user'
      ? order.customerId?.email
      : order.leadId?.email;
    
    const customerPhone = order.customerType === 'user'
      ? order.customerId?.phone
      : order.leadId?.customerMobile;

    const codCharges = order.paymentMethod === 'cod' ? (order.codCharges || 0) : 0;
    
    // Calculate subtotal from items
    const calculatedSubtotal = order.items?.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const totalPrice = parseFloat(item.totalPrice) || (quantity * unitPrice);
      return sum + totalPrice;
    }, 0) || 0;
    
    const subtotal = calculatedSubtotal > 0 ? calculatedSubtotal : (order.subtotal || 0);
    const totalAmount = subtotal + (order.taxAmount || 0) + (order.shippingAmount || 0) + codCharges - (order.discountAmount || 0);
    
    const invoiceNumber = order.orderNumber || order.orderId;
    const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Invoice - ${invoiceNumber}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }
          .invoice-container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            box-shadow: 0 0 20px rgba(0,0,0,0.1);
          }
          .header {
            border-bottom: 3px solid #8bc34a;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #8bc34a;
            font-size: 32px;
            margin-bottom: 10px;
          }
          .header-info {
            display: flex;
            justify-content: space-between;
            margin-top: 20px;
          }
          .info-section {
            flex: 1;
          }
          .info-section h3 {
            color: #333;
            font-size: 16px;
            margin-bottom: 10px;
            border-bottom: 1px solid #eee;
            padding-bottom: 5px;
          }
          .info-section p {
            margin: 5px 0;
            font-size: 14px;
            color: #666;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin: 30px 0;
          }
          .items-table th {
            background: #8bc34a;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
          }
          .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
          }
          .items-table tr:hover {
            background: #f9f9f9;
          }
          .totals {
            margin-top: 20px;
            border-top: 2px solid #eee;
            padding-top: 20px;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }
          .total-label {
            font-weight: 500;
            color: #666;
          }
          .total-amount {
            font-weight: 600;
            color: #333;
          }
          .grand-total {
            border-top: 2px solid #8bc34a;
            margin-top: 10px;
            padding-top: 15px;
            font-size: 18px;
          }
          .grand-total .total-label {
            font-size: 18px;
            font-weight: 700;
            color: #333;
          }
          .grand-total .total-amount {
            font-size: 20px;
            color: #8bc34a;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #666;
            font-size: 12px;
          }
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .invoice-container {
              box-shadow: none;
              padding: 20px;
            }
          }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <h1>INVOICE</h1>
            <div class="header-info">
              <div class="info-section">
                <h3>Bill To:</h3>
                <p><strong>${customerName}</strong></p>
                ${customerPhone ? `<p>Phone: ${customerPhone}</p>` : ''}
                ${customerEmail ? `<p>Email: ${customerEmail}</p>` : ''}
                <p>${order.shippingAddress?.address || ''}</p>
                <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.state || ''} ${order.shippingAddress?.pincode || ''}</p>
              </div>
              <div class="info-section">
                <h3>Invoice Details:</h3>
                <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                <p><strong>Order ID:</strong> ${order.orderId}</p>
                <p><strong>Date:</strong> ${invoiceDate}</p>
                ${order.branchId?.branchName ? `<p><strong>Branch:</strong> ${order.branchId.branchName}</p>` : ''}
              </div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Product ID</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map(item => `
                <tr>
                  <td>${item.productId?.productName || 'Unknown Product'}</td>
                  <td>${item.productId?.productId || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>₹${item.unitPrice?.toLocaleString() || '0'}</td>
                  <td>₹${item.totalPrice?.toLocaleString() || '0'}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-amount">₹${subtotal.toLocaleString()}</span>
            </div>
            ${order.taxAmount > 0 ? `
              <div class="total-row">
                <span class="total-label">Tax:</span>
                <span class="total-amount">₹${order.taxAmount?.toLocaleString() || '0'}</span>
              </div>
            ` : ''}
            ${order.shippingAmount > 0 ? `
              <div class="total-row">
                <span class="total-label">Shipping:</span>
                <span class="total-amount">₹${order.shippingAmount?.toLocaleString() || '0'}</span>
              </div>
            ` : ''}
            ${codCharges > 0 ? `
              <div class="total-row">
                <span class="total-label">COD Charges:</span>
                <span class="total-amount">₹${codCharges.toLocaleString()}</span>
              </div>
            ` : ''}
            ${order.discountAmount > 0 ? `
              <div class="total-row">
                <span class="total-label">Discount:</span>
                <span class="total-amount">-₹${order.discountAmount?.toLocaleString() || '0'}</span>
              </div>
            ` : ''}
            <div class="total-row grand-total">
              <span class="total-label">Total Amount:</span>
              <span class="total-amount">₹${totalAmount.toLocaleString()}</span>
            </div>
          </div>
          
          <div class="footer">
            <p><strong>Payment Method:</strong> ${order.paymentMethod?.toUpperCase() || 'N/A'}</p>
            <p><strong>Payment Status:</strong> ${order.paymentStatus?.toUpperCase() || 'PENDING'}</p>
            ${order.notes ? `<p style="margin-top: 15px;"><strong>Notes:</strong> ${order.notes}</p>` : ''}
            <p style="margin-top: 20px;">Thank you for your business!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open invoice in new window
    const invoiceWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    invoiceWindow.focus();
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
      render: (order) => {
        const calculatedTotal = calculateOrderTotal(order);
        return (
          <div className="font-medium text-gray-900">
            ₹{calculatedTotal.toLocaleString()}
          </div>
        );
      }
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
            const calculatedTotal = calculateOrderTotal(order);
            amountReceived = calculatedTotal || 0;
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
            onClick={() => handleGenerateInvoice(order)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Generate Invoice"
          >
            <HiDocumentArrowDown className="w-4 h-4" />
          </button>
          {!isAccountsManager && !isProductionManager && (
            <>
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
            </>
          )}
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

  // Calculate stats from filtered orders array
  // Use pagination.totalOrders for accurate total count (respects filters)
  // For revenue and status counts, calculate from visible orders (may not reflect all filtered orders if paginated)
  const totalOrders = pagination?.totalOrders || orders.length;
  
  // Calculate revenue from visible orders
  const totalRevenue = orders.reduce((sum, order) => {
    const orderTotal = calculateOrderTotal(order);
    return sum + orderTotal;
  }, 0);
  
  // Calculate status counts from visible orders
  // Note: These counts only reflect the current page, not all filtered orders
  const pendingOrders = orders.filter(order => 
    order.status === 'pending' || order.status === 'draft'
  ).length;
  const deliveredOrders = orders.filter(order => 
    order.status === 'delivered'
  ).length;
  
  // If we have pagination data and want accurate status counts, we'd need to fetch all matching orders
  // For now, we'll use visible orders which is better than showing unfiltered stats

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
        {!isAccountsManager && !isProductionManager && (
          <Button
            onClick={() => navigate('/orders/new')}
            variant="primary"
            icon={HiPlus}
          >
            New Order
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Orders"
          value={totalOrders}
          icon={HiClipboardDocumentList}
          gradient="blue"
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString()}`}
          icon={HiCurrencyDollar}
          gradient="green"
          loading={loading}
        />
        <StatCard
          title="Pending Orders"
          value={pendingOrders}
          icon={HiTruck}
          gradient="yellow"
          loading={loading}
        />
        <StatCard
          title="Delivered"
          value={deliveredOrders}
          icon={HiCheckCircle}
          gradient="purple"
          loading={loading}
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
              <p><strong>Total Amount:</strong> ₹{orderToDelete ? calculateOrderTotal(orderToDelete).toLocaleString() : '0'}</p>
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

