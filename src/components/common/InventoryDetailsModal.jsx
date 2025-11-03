import React from 'react';
import {
  HiDocumentArrowDown
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
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
    if (quantity <= minStock) return 'Low Stock';
    if (quantity <= minStock * 2) return 'Medium Stock';
    return 'In Stock';
  };

  // Determine if this is a raw material, finished good, or sent good
  const isRawMaterial = inventoryItem.materialId || inventoryItem.materialName;
  const isFinishedGood = inventoryItem.productId || inventoryItem.product;
  const isSentGood = inventoryItem.trackingId;
  
  const stockStatus = getStockStatus(
    inventoryItem.availableQuantity || inventoryItem.stockQuantity || inventoryItem.quantity || 0,
    inventoryItem.minStockLevel || 0
  );

  // Get the appropriate name and ID
  const itemName = isSentGood ? 
    `Sent Goods - ${inventoryItem.trackingId}` : 
    (inventoryItem.materialName || inventoryItem.product?.productName || 'Unknown Item');
  const itemId = isSentGood ? 
    inventoryItem.trackingId : 
    (inventoryItem.materialId || inventoryItem.product?.productId || 'N/A');
  const itemCategory = isSentGood ? 
    'Sent Goods' : 
    (inventoryItem.category || inventoryItem.product?.category || 'N/A');

  const basicInfo = {
    title: 'Basic Information',
    fields: isSentGood ? [
      {
        label: 'Tracking ID',
        value: itemId
      },
      {
        label: 'Status',
        value: inventoryItem.status || 'Unknown',
        type: 'status'
      },
      {
        label: 'Destination Branch',
        value: inventoryItem.branchId?.branchName || 'Unknown Branch'
      },
      {
        label: 'Branch Code',
        value: inventoryItem.branchId?.branchCode || 'N/A'
      },
      {
        label: 'Total Items',
        value: inventoryItem.items?.length || 0
      },
      {
        label: 'Total Amount',
        value: formatCurrency(inventoryItem.totalAmount || inventoryItem.totalValue || 0)
      },
      {
        label: 'Sent Date',
        value: formatDate(inventoryItem.sentAt || inventoryItem.createdAt)
      }
    ] : [
      {
        label: 'Item ID',
        value: itemId
      },
      {
        label: 'Name',
        value: itemName
      },
      {
        label: 'Category',
        value: itemCategory
      },
      {
        label: 'Unit of Measure',
        value: inventoryItem.UOM || inventoryItem.product?.UOM || 'N/A'
      },
      {
        label: 'Current Stock',
        value: `${inventoryItem.availableQuantity || inventoryItem.stockQuantity || inventoryItem.quantity || 0} ${inventoryItem.UOM || inventoryItem.product?.UOM || 'units'}`
      },
      {
        label: 'Stock Status',
        value: stockStatus,
        type: 'status'
      }
    ]
  };

  const additionalInfo = {
    title: isSentGood ? 'Items Being Sent' : 'Additional Information',
    fields: isSentGood ? [
      ...(inventoryItem.items?.map((item, index) => ({
        label: `Item ${index + 1}`,
        value: `${item.inventoryId?.productId?.productName || 'Unknown Product'} (${item.quantity} units) - ${formatCurrency(item.unitPrice * item.quantity)}`
      })) || [])
    ] : [
      {
        label: 'Unit Price',
        value: formatCurrency(inventoryItem.price || inventoryItem.product?.price)
      },
      {
        label: 'GST Percentage',
        value: inventoryItem.gstPercentage ? `${inventoryItem.gstPercentage}%` : 'N/A'
      },
      {
        label: 'Total Price (with GST)',
        value: formatCurrency(inventoryItem.totalPrice || inventoryItem.formattedTotalPrice)
      },
      {
        label: 'Minimum Stock Level',
        value: inventoryItem.minStockLevel ? `${inventoryItem.minStockLevel} ${inventoryItem.UOM || 'units'}` : 'N/A'
      },
      {
        label: 'Maximum Stock Level',
        value: inventoryItem.maxStockLevel ? `${inventoryItem.maxStockLevel} ${inventoryItem.UOM || 'units'}` : 'N/A'
      },
      {
        label: 'Stock Value',
        value: formatCurrency(inventoryItem.stockValue || ((inventoryItem.availableQuantity || inventoryItem.stockQuantity || 0) * (inventoryItem.price || inventoryItem.product?.price || 0)))
      }
    ]
  };

  const supplierInfo = isRawMaterial && (inventoryItem.supplierName || inventoryItem.supplierId) ? {
    title: 'Supplier Information',
    fields: [
      {
        label: 'Supplier Name',
        value: inventoryItem.supplierName || 'N/A'
      },
      {
        label: 'Supplier ID',
        value: inventoryItem.supplierId || 'N/A'
      },
      {
        label: 'GST Number',
        value: inventoryItem.gstNumber || 'N/A'
      },
      {
        label: 'HSN Code',
        value: inventoryItem.hsn || 'N/A'
      }
    ]
  } : null;

  const managementInfo = {
    title: 'Management Information',
    fields: [
      {
        label: 'Created By',
        value: inventoryItem.createdBy ? 
          `${inventoryItem.createdBy.firstName} ${inventoryItem.createdBy.lastName}` : 
          'Unknown User'
      },
      {
        label: 'Updated By',
        value: inventoryItem.updatedBy ? 
          `${inventoryItem.updatedBy.firstName} ${inventoryItem.updatedBy.lastName}` : 
          'Unknown User'
      },
      {
        label: 'Created Date',
        value: formatDate(inventoryItem.createdAt)
      },
      {
        label: 'Last Updated',
        value: formatDate(inventoryItem.lastUpdated || inventoryItem.updatedAt)
      }
    ]
  };

  const footerContent = (
    <>
      <Button
        onClick={onClose}
        variant="outline"
        className="px-4 py-2"
      >
        Close
      </Button>
      {isRawMaterial && (
        <Button
          onClick={generateInvoice}
          variant="primary"
          icon={HiDocumentArrowDown}
          className="px-4 py-2"
        >
          Generate Invoice
        </Button>
      )}
    </>
  );

  const sections = [basicInfo, additionalInfo];
  if (supplierInfo) sections.push(supplierInfo);
  sections.push(managementInfo);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={isRawMaterial ? 'Raw Material Details' : 'Finished Product Details'}
      subtitle={`${itemName} - ${itemId}`}
      size="xl"
      showFooter={true}
      footerContent={footerContent}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <DetailsView sections={sections.slice(0, Math.ceil(sections.length / 3))} />
        </div>
        <div>
          <DetailsView sections={sections.slice(Math.ceil(sections.length / 3), Math.ceil(sections.length * 2 / 3))} />
        </div>
        <div>
          <DetailsView sections={sections.slice(Math.ceil(sections.length * 2 / 3))} />
        </div>
      </div>
    </CommonModal>
  );
};

export default InventoryDetailsModal;


