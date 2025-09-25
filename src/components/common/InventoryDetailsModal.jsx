import React from 'react';
import {
  HiXMark,
  HiCube,
  HiDocumentText,
  HiBuildingOffice2,
  HiUser,
  HiCalendar,
  HiExclamationTriangle,
  HiCheckCircle,
  HiPencil,
  HiTrash,
  HiTag,
  HiCurrencyDollar,
  HiScale,
  HiInformationCircle,
  HiChartBar,
  HiShoppingCart,
  HiClipboardDocumentList,
  HiTruck,
  HiDocumentArrowDown
} from 'react-icons/hi2';
import Button from './Button';

const InventoryDetailsModal = ({ 
  isOpen, 
  onClose, 
  inventoryItem, 
  onEdit, 
  onDelete,
  isFinishedProduction = false
}) => {
  if (!isOpen || !inventoryItem) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const generateInvoice = () => {
    if (!inventoryItem) return;

    // Create invoice data
    const invoiceData = {
      invoiceNumber: `INV-${inventoryItem.materialId || inventoryItem._id}-${Date.now()}`,
      date: new Date().toLocaleDateString('en-IN'),
      item: {
        id: itemId,
        name: itemName,
        category: itemCategory,
        uom: inventoryItem.UOM || inventoryItem.product?.UOM || 'units',
        quantity: inventoryItem.stockQuantity || inventoryItem.quantity || 0,
        unitPrice: inventoryItem.price || inventoryItem.product?.price || 0,
        gstPercentage: inventoryItem.gstPercentage || 0,
        totalPrice: inventoryItem.totalPrice || inventoryItem.formattedTotalPrice || 0
      },
      supplier: {
        name: inventoryItem.supplierName || 'N/A',
        id: inventoryItem.supplierId || 'N/A',
        gstNumber: inventoryItem.gstNumber || 'N/A',
        hsn: inventoryItem.hsn || 'N/A'
      },
      company: {
        name: 'HerbNas Ayurveda',
        address: '123 Ayurveda Street, Health City, India - 123456',
        gstNumber: '29ABCDE1234F1Z5',
        phone: '+91 9876543210',
        email: 'info@herbnas.com'
      }
    };

    // Calculate totals
    const subtotal = invoiceData.item.quantity * invoiceData.item.unitPrice;
    const gstAmount = (subtotal * invoiceData.item.gstPercentage) / 100;
    const total = subtotal + gstAmount;

    // Create invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
          .company-details { color: #6b7280; font-size: 14px; }
          .invoice-title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details, .supplier-details { flex: 1; }
          .section-title { font-size: 16px; font-weight: bold; color: #374151; margin-bottom: 10px; }
          .detail-row { margin-bottom: 5px; color: #6b7280; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .items-table th { background-color: #f9fafb; font-weight: bold; color: #374151; }
          .items-table td { color: #6b7280; }
          .totals { text-align: right; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
          .total-label { font-weight: bold; color: #374151; }
          .total-amount { font-weight: bold; color: #1f2937; }
          .grand-total { border-top: 2px solid #e5e7eb; padding-top: 10px; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">${invoiceData.company.name}</div>
            <div class="company-details">
              ${invoiceData.company.address}<br>
              GST: ${invoiceData.company.gstNumber} | Phone: ${invoiceData.company.phone} | Email: ${invoiceData.company.email}
            </div>
          </div>
          
          <div class="invoice-title">Raw Material Invoice</div>
          
          <div class="invoice-info">
            <div class="invoice-details">
              <div class="section-title">Invoice Details</div>
              <div class="detail-row"><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</div>
              <div class="detail-row"><strong>Date:</strong> ${invoiceData.date}</div>
            </div>
            <div class="supplier-details">
              <div class="section-title">Supplier Details</div>
              <div class="detail-row"><strong>Name:</strong> ${invoiceData.supplier.name}</div>
              <div class="detail-row"><strong>ID:</strong> ${invoiceData.supplier.id}</div>
              <div class="detail-row"><strong>GST:</strong> ${invoiceData.supplier.gstNumber}</div>
              <div class="detail-row"><strong>HSN:</strong> ${invoiceData.supplier.hsn}</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>UOM</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoiceData.item.id}</td>
                <td>${invoiceData.item.name}</td>
                <td>${invoiceData.item.category}</td>
                <td>${invoiceData.item.uom}</td>
                <td>${invoiceData.item.quantity}</td>
                <td>₹${invoiceData.item.unitPrice.toFixed(2)}</td>
                <td>₹${subtotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-amount">₹${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">GST (${invoiceData.item.gstPercentage}%):</span>
              <span class="total-amount">₹${gstAmount.toFixed(2)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total Amount:</span>
              <span class="total-amount">₹${total.toFixed(2)}</span>
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for your business!</p>
            <p>This is a computer-generated invoice.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Open invoice in new window
    const invoiceWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes,resizable=yes');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    // Focus the new window
    invoiceWindow.focus();
  };

  const getStockStatus = (quantity, minStock = 0) => {
    if (quantity <= minStock) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Low Stock', icon: HiExclamationTriangle };
    if (quantity <= minStock * 2) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium Stock', icon: HiExclamationTriangle };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock', icon: HiCheckCircle };
  };

  // Determine if this is a raw material or finished good
  const isRawMaterial = inventoryItem.materialId || inventoryItem.materialName;
  const isFinishedGood = inventoryItem.productId || inventoryItem.product;
  
  const stockStatus = getStockStatus(
    inventoryItem.stockQuantity || inventoryItem.quantity || 0,
    inventoryItem.minStockLevel || 0
  );

  // Get the appropriate name and ID
  const itemName = inventoryItem.materialName || inventoryItem.product?.productName || 'Unknown Item';
  const itemId = inventoryItem.materialId || inventoryItem.product?.productId || 'N/A';
  const itemCategory = inventoryItem.category || inventoryItem.product?.category || 'N/A';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                isRawMaterial 
                  ? 'bg-gradient-to-br from-blue-500/10 to-cyan-600/10' 
                  : 'bg-gradient-to-br from-purple-500/10 to-indigo-600/10'
              }`}>
                {isRawMaterial ? (
                  <HiTruck className="h-6 w-6 text-blue-600" />
                ) : (
                <HiCube className="h-6 w-6 text-purple-600" />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isRawMaterial ? 'Raw Material Details' : 'Finished Product Details'}
                </h2>
                <p className="text-sm text-gray-600">
                  {itemName} - {itemId}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {/* Invoice button - only for raw materials, positioned near X button */}
              {isRawMaterial && (
                <Button
                  variant="primary"
                  onClick={generateInvoice}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiDocumentArrowDown className="h-4 w-4" />
                  <span>Invoice</span>
                </Button>
              )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiXMark className="h-5 w-5 text-gray-500" />
            </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            {/* Item Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${
                isRawMaterial 
                  ? 'bg-gradient-to-br from-blue-500 to-cyan-600' 
                  : 'bg-gradient-to-br from-purple-500 to-indigo-600'
              }`}>
                {isRawMaterial ? (
                  <HiTruck className="h-8 w-8" />
                ) : (
                <HiCube className="h-8 w-8" />
                )}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">{itemName}</h3>
                <p className="text-sm text-gray-600">ID: {itemId} | Category: {itemCategory}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                    <stockStatus.icon className="h-3 w-3 inline mr-1" />
                    {stockStatus.label}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                    {isRawMaterial ? 'Raw Material' : 'Finished Product'}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
                  <HiInformationCircle className="h-4 w-4 mr-2" />
                  Basic Information
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Item ID</p>
                      <p className="text-sm font-semibold text-gray-900">{itemId}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiDocumentText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Name</p>
                      <p className="text-sm font-semibold text-gray-900">{itemName}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiChartBar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Category</p>
                      <p className="text-sm font-semibold text-gray-900">{itemCategory}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiScale className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Unit of Measure</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.UOM || inventoryItem.product?.UOM || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
                  <HiShoppingCart className="h-4 w-4 mr-2" />
                  Stock Information
                </h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCube className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Current Stock</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.stockQuantity || inventoryItem.quantity || 0} {inventoryItem.UOM || 'units'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiExclamationTriangle className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Minimum Stock Level</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.minStockLevel || 'N/A'} {inventoryItem.UOM || 'units'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCheckCircle className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Maximum Stock Level</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.maxStockLevel || 'N/A'} {inventoryItem.UOM || 'units'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCurrencyDollar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Stock Value</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(inventoryItem.stockValue || ((inventoryItem.stockQuantity || 0) * (inventoryItem.price || 0)))}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
                <HiCurrencyDollar className="h-4 w-4 mr-2" />
                Pricing Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <HiCurrencyDollar className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">Unit Price</p>
                      <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(inventoryItem.price || inventoryItem.product?.price)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <HiChartBar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">GST Percentage</p>
                      <p className="text-sm font-semibold text-gray-900">
                      {inventoryItem.gstPercentage || 'N/A'}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <HiCurrencyDollar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">Total Price (with GST)</p>
                      <p className="text-sm font-semibold text-gray-900">
                      {formatCurrency(inventoryItem.totalPrice || inventoryItem.formattedTotalPrice)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            {/* Supplier Information (for Raw Materials) */}
            {isRawMaterial && (inventoryItem.supplierName || inventoryItem.supplierId) && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
                  <HiBuildingOffice2 className="h-4 w-4 mr-2" />
                  Supplier Information
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Supplier Name</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.supplierName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Supplier ID</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.supplierId || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiDocumentText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">GST Number</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.gstNumber || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">HSN Code</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.hsn || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

              {/* Management Information */}
              <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
                <HiUser className="h-4 w-4 mr-2" />
                Management Information
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                  <HiUser className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">Created By</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {inventoryItem.createdBy ? 
                        `${inventoryItem.createdBy.firstName} ${inventoryItem.createdBy.lastName}` : 
                        'Unknown User'
                      }
                    </p>
                  </div>
                </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiUser className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Updated By</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.updatedBy ? 
                          `${inventoryItem.updatedBy.firstName} ${inventoryItem.updatedBy.lastName}` : 
                          'Unknown User'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">Created Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                      {formatDate(inventoryItem.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                    <p className="text-xs font-medium text-gray-600">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-900">
                      {formatDate(inventoryItem.lastUpdated || inventoryItem.updatedAt)}
                      </p>
                    </div>
                  </div>

                {inventoryItem.lastRestocked && (
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTruck className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Last Restocked</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(inventoryItem.lastRestocked)}
                      </p>
                </div>
                  </div>
                )}
              </div>
            </div>

            {/* Notes */}
            {inventoryItem.notes && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center">
                  <HiClipboardDocumentList className="h-4 w-4 mr-2" />
                  Notes
                </h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{inventoryItem.notes}</p>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsModal;


