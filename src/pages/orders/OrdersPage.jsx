import React, { useState, useEffect, useMemo } from 'react';
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
  HiDocumentArrowDown,
  HiCog6Tooth,
  HiXMark
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal } from '../../components/common';
import OrderDetailsModal from '../../components/common/OrderDetailsModal';
import {
  getAllOrders,
  getOrderStats,
  deleteOrder,
  updateOrderStatus,
  updateOrderPayment,
  updateOrder
} from '../../redux/actions/orderActions';
import { getAllCourierPartners, createCourierPartner } from '../../redux/actions/courierPartnerActions';
import { addNotification } from '../../redux/slices/uiSlice';
import api from '../../lib/axiosInstance';
import {
  selectOrders,
  selectOrderLoading,
  selectOrderError,
  selectOrderStats,
  selectOrderStatsLoading,
  selectOrderPagination,
  updateOrderInState
} from '../../redux/slices/orderSlice';

const OrdersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get user role for permissions
  const { user } = useSelector((state) => state.auth || {});
  const isAccountsManager = user?.role === 'accounts_manager';
  const isProductionManager = user?.role === 'production_manager';
  const isSupervisor = user?.role === 'supervisor';
  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isSalesExecutive = user?.role === 'sales_executive';
  const canUpdateCourierAndStatus = isSupervisor || isAdmin || isSuperAdmin;
  
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
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState(null);
  const [courierPartners, setCourierPartners] = useState([]);
  const [updateFormData, setUpdateFormData] = useState({
    courierPartnerId: '',
    status: ''
  });
  const [updating, setUpdating] = useState(false);
  const [showAddCourierModal, setShowAddCourierModal] = useState(false);
  const [newCourierName, setNewCourierName] = useState('');
  const [branchUserIds, setBranchUserIds] = useState([]);

  // Fetch branch users for admin
  useEffect(() => {
    const fetchBranchUsers = async () => {
      if (isAdmin && user?.branch) {
        try {
          const branchId = user.branch._id || user.branch;
          const usersResponse = await api.get(`/users?branch=${branchId}&limit=1000`);
          const branchUsers = usersResponse.data?.data?.users || [];
          const userIds = branchUsers.map(u => (u._id || u.id).toString());
          setBranchUserIds(userIds);
        } catch (error) {
          console.error('Error fetching branch users:', error);
        }
      }
    };
    
    fetchBranchUsers();
  }, [isAdmin, user?.branch]);

  // Load data on component mount
  useEffect(() => {
    // For admin, fetch all orders (backend already filters by branch)
    // We'll filter by branch employees on frontend
    const limit = isAdmin ? 1000 : 10;
    const orderParams = {
      page: isAdmin ? 1 : currentPage,
      limit: limit,
      search: searchTerm,
      paymentStatus: paymentStatusFilter === 'all' ? '' : paymentStatusFilter
      // Note: Backend already filters by branch for admin automatically
    };
    
    dispatch(getAllOrders(orderParams));
    dispatch(getOrderStats());
  }, [dispatch, currentPage, searchTerm, paymentStatusFilter, isSalesExecutive, isAdmin, user?._id]);

  // Refresh orders when navigating to this page (e.g., returning from edit form)
  useEffect(() => {
    if (location.pathname === '/orders') {
      const limit = isAdmin ? 1000 : 10;
      dispatch(getAllOrders({
        page: isAdmin ? 1 : currentPage,
        limit: limit,
        search: searchTerm,
        paymentStatus: paymentStatusFilter
        // Note: Backend already filters by branch for admin
      }));
      dispatch(getOrderStats());
    }
  }, [location.pathname, dispatch, isAdmin, currentPage, searchTerm, paymentStatusFilter]);

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
    const limit = isAdmin ? 1000 : 10;
    dispatch(getAllOrders({
      page: isAdmin ? 1 : currentPage,
      limit: limit,
      search: searchTerm,
      paymentStatus: paymentStatusFilter
      // Note: Backend already filters by branch for admin
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
      const limit = isAdmin ? 1000 : 10;
      await dispatch(getAllOrders({
        page: isAdmin ? 1 : currentPage,
        limit: limit,
        search: searchTerm,
        paymentStatus: paymentStatusFilter
        // Note: Backend already filters by branch for admin
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
      const limit = isAdmin ? 1000 : 10;
      await dispatch(getAllOrders({
        page: isAdmin ? 1 : currentPage,
        limit: limit,
        search: searchTerm,
        paymentStatus: paymentStatusFilter
        // Note: Backend already filters by branch for admin
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

  // Handle update courier partner and status
  const handleUpdateCourierAndStatus = (order) => {
    setSelectedOrderForUpdate(order);
    
    // Get courier partner ID - handle both populated object and string ID
    const courierPartnerId = order.courierPartnerId?._id || order.courierPartnerId || '';
    
    setUpdateFormData({
      courierPartnerId: courierPartnerId,
      status: order.status || 'draft'
    });
    setShowUpdateModal(true);
    // Fetch courier partners - handle permission errors gracefully
    dispatch(getAllCourierPartners({ isActive: true })).then((result) => {
      if (result.payload?.data?.courierPartners) {
        const partners = result.payload.data.courierPartners;
        setCourierPartners(partners);
        
        // If courier partner is selected but not in the list, add it
        if (courierPartnerId && order.courierPartnerId?.name) {
          const existingPartner = partners.find(p => p._id === courierPartnerId);
          if (!existingPartner && order.courierPartnerId.name) {
            // Add the current courier partner to the list if it's not there
            setCourierPartners([...partners, {
              _id: courierPartnerId,
              name: order.courierPartnerId.name
            }]);
          }
        }
      }
    }).catch((error) => {
      // Silently handle permission errors - user can still update status without courier partners
      console.error('Error fetching courier partners:', error);
      // If order has a courier partner, add it to the list anyway
      if (courierPartnerId && order.courierPartnerId?.name) {
        setCourierPartners([{
          _id: courierPartnerId,
          name: order.courierPartnerId.name
        }]);
      }
    });
  };

  // Handle update form submission
  const handleUpdateSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    console.log('handleUpdateSubmit called', { selectedOrderForUpdate, updateFormData });
    
    if (!selectedOrderForUpdate) {
      dispatch(addNotification({
        type: 'error',
        message: 'No order selected for update'
      }));
      return;
    }

    // Validate that status is provided (required field)
    if (!updateFormData.status) {
      dispatch(addNotification({
        type: 'error',
        message: 'Order status is required'
      }));
      return;
    }

    console.log('=== STARTING UPDATE PROCESS ===');
    console.log('Order ID:', selectedOrderForUpdate._id);
    console.log('Status:', updateFormData.status);
    console.log('Courier Partner ID:', updateFormData.courierPartnerId);
    
    setUpdating(true);
    
    try {
      // Build update data - always include status (required), and courier partner if provided
      const updateData = {
        status: updateFormData.status
      };
      
      // Handle courier partner - send null if empty string, or the ID if provided
      if (updateFormData.courierPartnerId !== undefined) {
        if (updateFormData.courierPartnerId === '' || updateFormData.courierPartnerId === null) {
          updateData.courierPartnerId = null;
        } else {
          updateData.courierPartnerId = updateFormData.courierPartnerId;
        }
      }
      
      console.log('=== UPDATE DATA PREPARED ===', updateData);
      
      // Make sure we have valid data
      if (!selectedOrderForUpdate._id) {
        console.error('ERROR: Order ID is missing');
        throw new Error('Order ID is missing');
      }
      
      if (!updateData.status) {
        console.error('ERROR: Status is required');
        throw new Error('Status is required');
      }
      
      // Make direct API call - this MUST show in network tab
      console.log('=== MAKING API CALL ===');
      console.log('URL:', `/orders/${selectedOrderForUpdate._id}`);
      console.log('Method: PUT');
      console.log('Data:', updateData);
      
      const directResponse = await api.put(`/orders/${selectedOrderForUpdate._id}`, updateData);
      
      console.log('=== API CALL SUCCESSFUL ===');
      console.log('Response:', directResponse);
      console.log('Response data:', directResponse.data);
      
      // Use the direct response
      const result = directResponse.data;
      console.log('=== PROCESSING RESPONSE ===', result);
      
      if (!result || !result.data || !result.data.order) {
        console.error('ERROR: Invalid response from server', result);
        throw new Error('Invalid response from server');
      }
      
      // Update Redux state immediately
      console.log('=== UPDATING REDUX STATE ===');
      dispatch(updateOrderInState(result.data.order));
      
      // Also dispatch the action for Redux state management
      dispatch(updateOrder({ 
        id: selectedOrderForUpdate._id, 
        orderData: updateData 
      }));
      
      console.log('=== SHOWING SUCCESS NOTIFICATION ===');
      dispatch(addNotification({
        type: 'success',
        message: 'Order updated successfully!'
      }));
      
      setShowUpdateModal(false);
      setSelectedOrderForUpdate(null);
      setUpdateFormData({ courierPartnerId: '', status: '' });
      
      // Refresh orders to ensure data is in sync with backend
      console.log('Refreshing orders...', {
        page: isAdmin ? 1 : currentPage,
        limit: isAdmin ? 1000 : 10,
        search: searchTerm,
        paymentStatus: paymentStatusFilter === 'all' ? '' : paymentStatusFilter
      });
      
      const limit = isAdmin ? 1000 : 10;
      const refreshParams = {
        page: isAdmin ? 1 : currentPage,
        limit: limit,
        search: searchTerm,
        paymentStatus: paymentStatusFilter === 'all' ? '' : paymentStatusFilter
      };
      
      console.log('Calling getAllOrders with params:', refreshParams);
      const refreshResult = await dispatch(getAllOrders(refreshParams));
      console.log('Refresh result:', refreshResult);
      
      console.log('Calling getOrderStats');
      await dispatch(getOrderStats());
    } catch (error) {
      console.error('Error updating order:', error);
      console.error('Error details:', {
        message: error?.message,
        response: error?.response,
        stack: error?.stack
      });
      dispatch(addNotification({
        type: 'error',
        message: error?.message || error || 'Failed to update order'
      }));
    } finally {
      setUpdating(false);
    }
  };

  // Order status options
  const orderStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'picked', label: 'Picked' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'returned', label: 'Returned' }
  ];

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
          {canUpdateCourierAndStatus && (
            <button
              onClick={() => handleUpdateCourierAndStatus(order)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Update Courier Partner & Status"
            >
              <HiCog6Tooth className="w-4 h-4" />
            </button>
          )}
          {!isAccountsManager && !isProductionManager && (
            <>
              <button
                onClick={() => handleEditOrder(order._id)}
                className="text-gray-500 hover:text-gray-700 transition-colors"
                title="Edit Order"
              >
                <HiPencil className="w-4 h-4" />
              </button>
              {/* Hide delete for sales executive */}
              {!isSalesExecutive && (
                <button
                  onClick={() => handleDeleteOrder(order._id)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Delete Order"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              )}
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

  // Filter orders by createdBy for sales executive and admin
  const filteredOrders = useMemo(() => {
    if (isSalesExecutive && user?._id) {
      return orders.filter(order => {
        const orderCreatedBy = order.createdBy?._id || order.createdBy;
        const userId = user._id || user.id;
        return orderCreatedBy && userId && orderCreatedBy.toString() === userId.toString();
      });
    }
    
    // For admin: Show all orders from their branch (backend already filters by branch)
    if (isAdmin && user?.branch) {
      const branchId = (user.branch._id || user.branch).toString();
      
      return orders.filter(order => {
        // Check if order is from admin's branch
        const orderBranchId = (order.branchId?._id || order.branchId)?.toString();
        return orderBranchId === branchId;
      });
    }
    
    return orders;
  }, [orders, isSalesExecutive, isAdmin, branchUserIds, user?._id, user?.branch]);

  // Calculate stats from filtered orders array
  // Use pagination.totalOrders for accurate total count (respects filters)
  // For revenue and status counts, calculate from visible orders (may not reflect all filtered orders if paginated)
  const totalOrders = isSalesExecutive || isAdmin
    ? filteredOrders.length 
    : (pagination?.totalOrders || orders.length);
  
  // Calculate revenue from visible orders
  const totalRevenue = filteredOrders.reduce((sum, order) => {
    const orderTotal = calculateOrderTotal(order);
    return sum + orderTotal;
  }, 0);
  
  // Calculate status counts from visible orders
  // Note: These counts only reflect the current page, not all filtered orders
  const pendingOrders = filteredOrders.filter(order => 
    order.status === 'pending' || order.status === 'draft'
  ).length;
  const deliveredOrders = filteredOrders.filter(order => 
    order.status === 'delivered'
  ).length;
  
  // If we have pagination data and want accurate status counts, we'd need to fetch all matching orders
  // For now, we'll use visible orders which is better than showing unfiltered stats

  // Paginate filtered orders for admin
  const paginatedOrders = React.useMemo(() => {
    if (isAdmin) {
      const start = (currentPage - 1) * 10;
      const end = start + 10;
      return filteredOrders.slice(start, end);
    }
    return filteredOrders;
  }, [filteredOrders, isAdmin, currentPage]);
  
  const displayOrders = isSalesExecutive || isAdmin ? paginatedOrders : orders;
  
  if (loading && displayOrders.length === 0 && orders.length === 0) {
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
          data={displayOrders}
          columns={columns}
          loading={loading}
          error={error}
          pagination={isAdmin ? {
            currentPage: currentPage,
            totalPages: Math.ceil(filteredOrders.length / 10),
            totalItems: filteredOrders.length,
            itemsPerPage: 10,
            hasNextPage: currentPage < Math.ceil(filteredOrders.length / 10),
            hasPrevPage: currentPage > 1,
            onPageChange: handlePageChange,
            itemName: 'orders'
          } : pagination ? {
            ...pagination,
            onPageChange: handlePageChange,
            itemName: 'orders'
          } : null}
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

      {/* Update Courier Partner & Status Modal */}
      <CommonModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedOrderForUpdate(null);
          setUpdateFormData({ courierPartnerId: '', status: '' });
        }}
        title="Update Courier Partner & Order Status"
        subtitle={selectedOrderForUpdate ? `Order: ${selectedOrderForUpdate.orderId}` : ''}
        icon={HiCog6Tooth}
        iconColor="from-blue-500 to-blue-600"
        size="md"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              type="button"
              onClick={() => {
                setShowUpdateModal(false);
                setSelectedOrderForUpdate(null);
                setUpdateFormData({ courierPartnerId: '', status: '' });
              }}
              size="sm"
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              type="button"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                if (updating) {
                  return;
                }
                
                if (!selectedOrderForUpdate || !selectedOrderForUpdate._id) {
                  dispatch(addNotification({
                    type: 'error',
                    message: 'No order selected for update'
                  }));
                  return;
                }
                
                if (!updateFormData.status) {
                  dispatch(addNotification({
                    type: 'error',
                    message: 'Order status is required'
                  }));
                  return;
                }
                
                setUpdating(true);
                
                try {
                  const updateData = {
                    status: updateFormData.status
                  };
                  
                  if (updateFormData.courierPartnerId !== undefined) {
                    updateData.courierPartnerId = updateFormData.courierPartnerId === '' ? null : updateFormData.courierPartnerId;
                  }
                  
                  console.log('=== MAKING API CALL VIA REDUX ACTION ===');
                  console.log('Order ID:', selectedOrderForUpdate._id);
                  console.log('Update Data:', JSON.stringify(updateData, null, 2));
                  console.log('API Base URL:', api.defaults.baseURL);
                  console.log('API instance:', api);
                  console.log('API defaults:', api.defaults);
                  
                  // Verify axios is properly configured
                  if (!api || typeof api.put !== 'function') {
                    throw new Error('API instance is not properly configured');
                  }
                  
                  // Make the API call using the Redux action which will make the actual network request
                  // This should show up in the Network tab
                  console.log('=== DISPATCHING REDUX ACTION ===');
                  
                  // Also make a direct fetch call to verify network request is made
                  // This is just for debugging - will be removed later
                  const directFetchTest = async () => {
                    try {
                      const token = localStorage.getItem('token') || document.cookie.match(/token=([^;]+)/)?.[1];
                      const testUrl = `${api.defaults.baseURL}/orders/${selectedOrderForUpdate._id}?_test=${Date.now()}`;
                      console.log('=== DIRECT FETCH TEST ===');
                      console.log('Test URL:', testUrl);
                      const testResponse = await fetch(testUrl, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`,
                          'Cache-Control': 'no-cache'
                        },
                        body: JSON.stringify(updateData),
                        cache: 'no-store'
                      });
                      console.log('=== DIRECT FETCH RESPONSE ===', testResponse);
                    } catch (err) {
                      console.error('Direct fetch test error:', err);
                    }
                  };
                  
                  // Run both in parallel to see which one shows in Network tab
                  const [result] = await Promise.all([
                    dispatch(updateOrder({ 
                      id: selectedOrderForUpdate._id, 
                      orderData: updateData 
                    })).unwrap(),
                    directFetchTest()
                  ]);
                  
                  console.log('=== REDUX ACTION COMPLETED ===');
                  
                  console.log('=== API CALL RESULT ===', result);
                  console.log('Result structure:', JSON.stringify(result, null, 2));
                  
                  // The result from updateOrder action is response.data from axios
                  // Based on the action, it returns response.data, so result.data.order is the order
                  const updatedOrder = result?.data?.order;
                  
                  if (!updatedOrder) {
                    console.error('No order in result:', result);
                    throw new Error('No order data in response');
                  }
                  
                  console.log('=== UPDATED ORDER ===', updatedOrder);
                  console.log('Updated order status:', updatedOrder.status);
                  console.log('Updated courier partner:', updatedOrder.courierPartnerId);
                  
                  // Update Redux state immediately - this will update the table
                  dispatch(updateOrderInState(updatedOrder));
                  
                  dispatch(addNotification({
                    type: 'success',
                    message: 'Order updated successfully!'
                  }));
                  
                  setShowUpdateModal(false);
                  setSelectedOrderForUpdate(null);
                  setUpdateFormData({ courierPartnerId: '', status: '' });
                  
                  // Refresh orders to ensure table updates with latest data from backend
                  const limit = isAdmin ? 1000 : 10;
                  await dispatch(getAllOrders({
                    page: isAdmin ? 1 : currentPage,
                    limit: limit,
                    search: searchTerm,
                    paymentStatus: paymentStatusFilter === 'all' ? '' : paymentStatusFilter
                  }));
                  
                  // After refresh, update the order again to ensure it has the latest data
                  // This ensures the table shows the updated order even if refresh returned stale data
                  dispatch(updateOrderInState(updatedOrder));
                  
                  await dispatch(getOrderStats());
                } catch (error) {
                  console.error('Error updating order:', error);
                  dispatch(addNotification({
                    type: 'error',
                    message: error?.message || 'Failed to update order'
                  }));
                } finally {
                  setUpdating(false);
                }
              }}
              size="sm"
              loading={updating}
              disabled={updating}
            >
              Update Order
            </Button>
          </div>
        }
      >
        <form id="update-order-form" onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('=== FORM SUBMITTED (should not happen) ===');
          alert('Form submitted - this should not happen!');
          // Don't call handleUpdateSubmit - button handles it
        }} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">
                Courier Partner
              </label>
              <button
                type="button"
                onClick={() => setShowAddCourierModal(true)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <HiPlus className="w-3 h-3" />
                Add New
              </button>
            </div>
            <Select
              options={[
                { value: '', label: 'Select Courier Partner' },
                ...courierPartners.map(partner => ({
                  value: partner._id || partner,
                  label: partner.name || partner
                })),
                // Include current courier partner if it exists but not in the list
                ...(selectedOrderForUpdate?.courierPartnerId && 
                    selectedOrderForUpdate.courierPartnerId.name &&
                    !courierPartners.find(p => {
                      const partnerId = p._id || p;
                      const currentId = selectedOrderForUpdate.courierPartnerId._id || selectedOrderForUpdate.courierPartnerId;
                      return String(partnerId) === String(currentId);
                    })
                    ? [{
                        value: selectedOrderForUpdate.courierPartnerId._id || selectedOrderForUpdate.courierPartnerId,
                        label: selectedOrderForUpdate.courierPartnerId.name
                      }]
                    : [])
              ]}
              value={String(updateFormData.courierPartnerId || '')}
              onChange={(e) => setUpdateFormData(prev => ({ ...prev, courierPartnerId: e.target.value }))}
              placeholder="Select Courier Partner"
              disabled={!!(selectedOrderForUpdate?.courierPartnerId && (selectedOrderForUpdate.courierPartnerId._id || selectedOrderForUpdate.courierPartnerId))}
            />
            {!(selectedOrderForUpdate?.courierPartnerId && (selectedOrderForUpdate.courierPartnerId._id || selectedOrderForUpdate.courierPartnerId)) && (
              <>
                <button
                  type="button"
                  onClick={() => setShowAddCourierModal(true)}
                  className="text-xs text-blue-600 hover:text-blue-800 mt-1 flex items-center gap-1 self-start"
                >
                  <HiPlus className="w-3 h-3" />
                  Add New Courier Partner
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  Leave empty to remove courier partner
                </p>
              </>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Order Status *
            </label>
            <Select
              options={orderStatusOptions}
              value={updateFormData.status}
              onChange={(e) => setUpdateFormData(prev => ({ ...prev, status: e.target.value }))}
              placeholder="Select Order Status"
              required
            />
          </div>

          {selectedOrderForUpdate && (
            <div className="bg-gray-50 rounded-lg p-3 text-sm">
              <p className="text-gray-600 mb-1">
                <strong>Current Status:</strong> {selectedOrderForUpdate.status || 'N/A'}
              </p>
              <p className="text-gray-600">
                <strong>Current Courier Partner:</strong> {
                  selectedOrderForUpdate.courierPartnerId?.name || 
                  (selectedOrderForUpdate.courierPartnerId ? 'Selected' : 'None')
                }
              </p>
            </div>
          )}
        </form>
      </CommonModal>

      {/* Add Courier Partner Modal */}
      {showAddCourierModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/20 backdrop-blur-sm transition-opacity"
              onClick={() => {
                setShowAddCourierModal(false);
                setNewCourierName('');
              }}
            ></div>

            {/* Modal Content */}
            <div className="relative transform overflow-hidden rounded-2xl bg-white/95 backdrop-blur-md text-left shadow-2xl transition-all w-full max-w-md">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Add New Courier Partner
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddCourierModal(false);
                      setNewCourierName('');
                    }}
                    className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 rounded-md p-1"
                  >
                    <HiXMark className="h-6 w-6" />
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="px-6 py-4 sm:p-6">
                <div className="space-y-4">
                  <Input
                    label="Courier Partner Name *"
                    value={newCourierName}
                    onChange={(e) => setNewCourierName(e.target.value)}
                    placeholder="Enter courier partner name (e.g., BlueDart, FedEx, etc.)"
                    className="w-full"
                  />
                  <div className="flex gap-2 justify-end pt-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setShowAddCourierModal(false);
                        setNewCourierName('');
                      }}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={async () => {
                        if (!newCourierName.trim()) {
                          dispatch(addNotification({
                            type: 'error',
                            message: 'Please enter courier partner name'
                          }));
                          return;
                        }
                        try {
                          const result = await dispatch(createCourierPartner({ name: newCourierName.trim() })).unwrap();
                          const newPartner = result.data?.courierPartner;
                          if (newPartner) {
                            setCourierPartners(prev => [...prev, newPartner]);
                            setUpdateFormData(prev => ({ ...prev, courierPartnerId: newPartner._id }));
                            setShowAddCourierModal(false);
                            setNewCourierName('');
                            dispatch(addNotification({
                              type: 'success',
                              message: 'Courier partner added successfully'
                            }));
                          }
                        } catch (error) {
                          dispatch(addNotification({
                            type: 'error',
                            message: error?.message || error?.toString() || 'Failed to create courier partner'
                          }));
                        }
                      }}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersPage;

