import React from 'react';
import { 
  HiCube, 
  HiBuildingOffice2, 
  HiCurrencyDollar, 
  HiScale, 
  HiCalendar,
  HiPencil,
  HiCheckCircle,
  HiExclamationTriangle
} from 'react-icons/hi2';
import Button from './Button';

const ProductDetailsCard = ({ 
  product, 
  inventoryType = 'rawMaterials', 
  onEdit, 
  onEditSection,
  isEditing = false,
  className = ""
}) => {
  if (!product) return null;

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
      case 'approved':
        return 'text-green-600 bg-green-100';
      case 'inactive':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'rejected':
      case 'discontinued':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiCube className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {inventoryType === 'rawMaterials' ? 'Raw Material Details' : 'Product Details'}
              </h3>
              <p className="text-sm text-gray-500">
                {isEditing ? 'Currently editing' : 'View details'} - {product.materialName || product.productName}
              </p>
            </div>
          </div>
          {onEdit && (
            <Button
              onClick={onEdit}
              variant="outline"
              size="sm"
              className="flex items-center space-x-2"
            >
              <HiPencil className="h-4 w-4" />
              <span>{isEditing ? 'Update Details' : 'Edit Details'}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Basic Information</h4>
              {onEditSection && (
                <Button
                  onClick={() => onEditSection('basic')}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <HiPencil className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {inventoryType === 'rawMaterials' ? 'Material ID' : 'Product ID'}
                </label>
                <p className="text-sm text-gray-900 font-mono">
                  {product.materialId || product.productId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Name
                </label>
                <p className="text-sm text-gray-900">
                  {product.materialName || product.productName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Category
                </label>
                <p className="text-sm text-gray-900 capitalize">
                  {product.category || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Unit of Measure
                </label>
                <p className="text-sm text-gray-900 flex items-center">
                  <HiScale className="h-4 w-4 mr-1" />
                  {product.UOM || product.unitOfMeasure || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Pricing & Stock Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Pricing & Stock</h4>
              {onEditSection && (
                <Button
                  onClick={() => onEditSection('pricing')}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <HiPencil className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Price
                </label>
                <p className="text-sm text-gray-900 flex items-center">
                  <HiCurrencyDollar className="h-4 w-4 mr-1" />
                  {formatCurrency(product.price)}
                </p>
              </div>
              {inventoryType === 'rawMaterials' ? (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Current Stock
                    </label>
                    <p className="text-sm text-gray-900">
                      {product.stockQuantity || 0} {product.UOM || ''}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Min Stock Level
                    </label>
                    <p className="text-sm text-gray-900">
                      {product.minStockLevel || 0} {product.UOM || ''}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Max Stock Level
                    </label>
                    <p className="text-sm text-gray-900">
                      {product.maxStockLevel || 0} {product.UOM || ''}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Available Quantity
                    </label>
                    <p className="text-sm text-gray-900">
                      {product.availableQuantity || 0} {product.UOM || ''}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Reserved Quantity
                    </label>
                    <p className="text-sm text-gray-900">
                      {product.reservedQuantity || 0} {product.UOM || ''}
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide">Additional Info</h4>
              {onEditSection && (
                <Button
                  onClick={() => onEditSection('additional')}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                >
                  <HiPencil className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
            <div className="space-y-3">
              {inventoryType === 'rawMaterials' && (
                <>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      Supplier
                    </label>
                    <p className="text-sm text-gray-900 flex items-center">
                      <HiBuildingOffice2 className="h-4 w-4 mr-1" />
                      {product.supplierName || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      GST Number
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {product.gstNumber || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      HSN Code
                    </label>
                    <p className="text-sm text-gray-900 font-mono">
                      {product.hsn || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      GST Percentage
                    </label>
                    <p className="text-sm text-gray-900">
                      {product.gstPercentage || 0}%
                    </p>
                  </div>
                </>
              )}
              
              {inventoryType === 'finishedGoods' && product.batchId && (
                <div>
                  <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                    Batch ID
                  </label>
                  <p className="text-sm text-gray-900 font-mono">
                    {product.batchId.batchId || product.batchId || 'N/A'}
                  </p>
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Last Updated
                </label>
                <p className="text-sm text-gray-900 flex items-center">
                  <HiCalendar className="h-4 w-4 mr-1" />
                  {formatDate(product.lastUpdated || product.updatedAt)}
                </p>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Status
                </label>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(product.status)}`}>
                  {product.status === 'active' ? (
                    <HiCheckCircle className="h-3 w-3 mr-1" />
                  ) : product.status === 'pending' ? (
                    <HiExclamationTriangle className="h-3 w-3 mr-1" />
                  ) : null}
                  {product.status || 'Active'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {(product.notes || product.description) && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-900 uppercase tracking-wide mb-3">Notes</h4>
            <p className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
              {product.notes || product.description || 'No notes available'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsCard;
