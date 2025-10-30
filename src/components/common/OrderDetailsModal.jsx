import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiUser,
  HiBuildingOffice2,
  HiMapPin,
  HiPhone,
  HiEnvelope,
  HiCalendar,
  HiEye,
  HiDocumentArrowDown,
  HiTruck
} from 'react-icons/hi2';
import { Button, StatusBadge, Loading, CommonModal, Select, DetailsView } from './index';
import {
  getOrderById,
  updateOrderStatus,
  updateOrderPayment
} from '../../redux/actions/orderActions';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError
} from '../../redux/slices/orderSlice';

const OrderDetailsModal = ({ isOpen, onClose, orderId, onEdit, onDelete, onRefresh }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  
  // Local state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');

  // Load order data when modal opens
  useEffect(() => {
    if (isOpen && orderId) {
      dispatch(getOrderById(orderId));
    }
  }, [dispatch, orderId, isOpen]);

  // Handle status update
  const handleStatusUpdate = async () => {
    try {
      await dispatch(updateOrderStatus({ id: orderId, status: newStatus })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Order status updated to ${newStatus}`
      }));
      setShowStatusModal(false);
      setNewStatus('');
      if (onRefresh) onRefresh();
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
      await dispatch(updateOrderPayment({ id: orderId, paymentStatus: newPaymentStatus })).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: `Payment status updated to ${newPaymentStatus}`
      }));
      setShowPaymentModal(false);
      setNewPaymentStatus('');
      if (onRefresh) onRefresh();
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

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Get invoice HTML content
  const getInvoiceHTML = () => {
    if (!order) return '';

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
              <span class="total-amount">₹${order.subtotal?.toLocaleString() || '0'}</span>
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
              <span class="total-amount">₹${order.totalAmount?.toLocaleString() || '0'}</span>
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

    return invoiceHTML;
  };

  // Generate invoice (opens in new window)
  const generateInvoice = () => {
    if (!order) return;
    
    const invoiceHTML = getInvoiceHTML();
    
    // Open invoice in new window
    const invoiceWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    // Focus the new window
    invoiceWindow.focus();
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit(order?._id);
    } else {
      navigate(`/orders/edit/${order?._id}`);
    }
    onClose();
  };

  const handleDeleteClick = () => {
    if (onDelete && order) {
      onDelete(order._id);
    }
  };

  if (!isOpen) return null;

  // Prepare sections for DetailsView
  const prepareSections = () => {
    if (!order) return [];

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

    const orderInfo = {
      title: 'Order Information',
      fields: [
        {
          label: 'Order ID',
          value: order.orderId || 'N/A'
        },
        {
          label: 'Order Number',
          value: order.orderNumber || 'N/A'
        },
        {
          label: 'Order Status',
          value: order.status?.charAt(0).toUpperCase() + order.status?.slice(1) || 'N/A',
          type: 'status'
        },
        {
          label: 'Payment Method',
          value: order.paymentMethod?.toUpperCase() || 'N/A'
        },
        {
          label: 'Payment Status',
          value: order.paymentStatus?.charAt(0).toUpperCase() + order.paymentStatus?.slice(1) || 'N/A',
          type: 'status'
        },
        {
          label: 'Order Date',
          value: formatDate(order.createdAt)
        },
        {
          label: 'Expected Delivery',
          value: order.expectedDeliveryDate ? formatDate(order.expectedDeliveryDate) : 'N/A'
        },
        {
          label: 'Actual Delivery',
          value: order.actualDeliveryDate ? formatDate(order.actualDeliveryDate) : 'N/A'
        }
      ]
    };

    const customerInfo = {
      title: 'Customer Information',
      fields: [
        {
          label: 'Customer Name',
          value: customerName
        },
        {
          label: 'Email',
          value: customerEmail || 'N/A'
        },
        {
          label: 'Phone',
          value: customerPhone || 'N/A'
        },
        {
          label: 'Customer Type',
          value: order.customerType === 'user' ? 'User' : 'Lead'
        }
      ]
    };

    const shippingInfo = {
      title: 'Shipping Address',
      fields: [
        {
          label: 'Name',
          value: order.shippingAddress?.name || 'N/A'
        },
        {
          label: 'Address',
          value: order.shippingAddress?.address || 'N/A'
        },
        {
          label: 'City',
          value: order.shippingAddress?.city || 'N/A'
        },
        {
          label: 'State',
          value: order.shippingAddress?.state || 'N/A'
        },
        {
          label: 'Pincode',
          value: order.shippingAddress?.pincode || 'N/A'
        },
        {
          label: 'Phone',
          value: order.shippingAddress?.phone || 'N/A'
        },
        {
          label: 'Email',
          value: order.shippingAddress?.email || 'N/A'
        }
      ]
    };

    const branchInfo = {
      title: 'Branch Information',
      fields: [
        {
          label: 'Branch Name',
          value: order.branchId?.branchName || 'N/A'
        },
        {
          label: 'Branch Code',
          value: order.branchId?.branchCode || 'N/A'
        },
        {
          label: 'City',
          value: order.branchId?.city || 'N/A'
        },
        {
          label: 'State',
          value: order.branchId?.state || 'N/A'
        }
      ]
    };

    const financialInfo = {
      title: 'Financial Summary',
      fields: [
        {
          label: 'Subtotal',
          value: `₹${order.subtotal?.toLocaleString() || '0'}`,
          type: 'price'
        },
        {
          label: 'Tax',
          value: `₹${order.taxAmount?.toLocaleString() || '0'}`,
          type: 'price'
        },
        {
          label: 'Shipping',
          value: `₹${order.shippingAmount?.toLocaleString() || '0'}`,
          type: 'price'
        },
        ...(codCharges > 0 ? [{
          label: 'COD Charges',
          value: `₹${codCharges.toLocaleString()}`,
          type: 'price'
        }] : []),
        ...(order.discountAmount > 0 ? [{
          label: 'Discount',
          value: `-₹${order.discountAmount?.toLocaleString() || '0'}`,
          type: 'price'
        }] : []),
        {
          label: 'Total Amount',
          value: `₹${order.totalAmount?.toLocaleString() || '0'}`,
          type: 'price'
        }
      ]
    };

    const notesInfo = {
      title: 'Notes',
      fields: [
        ...(order.notes ? [{
          label: 'Customer Notes',
          value: order.notes
        }] : []),
        ...(order.internalNotes ? [{
          label: 'Internal Notes',
          value: order.internalNotes
        }] : [])
      ]
    };

    return [orderInfo, customerInfo, branchInfo, shippingInfo, financialInfo, notesInfo].filter(section => section.fields.length > 0);
  };

  const sections = prepareSections();

  // Order items as a separate section
  const orderItemsSection = order?.items && order.items.length > 0 ? (
    <div className="mb-6">
      <h5 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent mb-3">
        Order Items
      </h5>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Product
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Qty
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Unit Price
              </th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {order.items.map((item, index) => (
              <tr key={index}>
                <td className="px-4 py-3">
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.productId?.productName || 'Unknown Product'}
                    </div>
                    <div className="text-xs text-gray-500">
                      ID: {item.productId?.productId || 'N/A'}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.quantity}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  ₹{item.unitPrice?.toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  ₹{item.totalPrice?.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  ) : null;

  const footerContent = (
    <>
      <Button
        onClick={onClose}
        variant="outline"
        className="px-4 py-2"
      >
        Close
      </Button>
      <div className="flex space-x-2">
        <Button
          onClick={generateInvoice}
          variant="primary"
          icon={HiDocumentArrowDown}
          className="px-4 py-2"
        >
          Generate Invoice
        </Button>
        {onEdit && (
          <Button
            onClick={handleEditClick}
            variant="primary"
            icon={HiPencil}
            className="px-4 py-2"
          >
            Edit
          </Button>
        )}
        {onDelete && (
          <Button
            onClick={handleDeleteClick}
            variant="danger"
            icon={HiTrash}
            className="px-4 py-2"
          >
            Delete
          </Button>
        )}
      </div>
    </>
  );

  return (
    <>
      <CommonModal
        isOpen={isOpen}
        onClose={onClose}
        title="Order Details"
        subtitle={order ? `Order #${order.orderNumber || order.orderId}` : ''}
        size="xl"
        showFooter={true}
        footerContent={footerContent}
      >
        {loading && !order ? (
          <div className="flex justify-center items-center py-12">
            <Loading />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
          </div>
        ) : order ? (
          <div className="space-y-6">
            {/* Order Status Badges */}
            <div className="flex items-center space-x-4 pb-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Order Status:</span>
                <StatusBadge
                  status={order.status}
                  color={getStatusColor(order.status)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">Payment Status:</span>
                <StatusBadge
                  status={order.paymentStatus}
                  color={getPaymentStatusColor(order.paymentStatus)}
                />
              </div>
            </div>

            {/* Order Items Table */}
            {orderItemsSection}

            {/* Details Sections */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailsView sections={sections.slice(0, Math.ceil(sections.length / 2))} />
              </div>
              <div>
                <DetailsView sections={sections.slice(Math.ceil(sections.length / 2))} />
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500">No order data available</p>
          </div>
        )}
      </CommonModal>
    </>
  );
};

export default OrderDetailsModal;