import React from 'react';
import {
  HiXMark,
  HiDocumentText,
  HiCurrencyDollar,
  HiCube,
  HiTag,
  HiPencil,
  HiTrash,
  HiCalendar,
  HiBuildingOffice2
} from 'react-icons/hi2';
import Button from './Button';

const ProductDetailsModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !product) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStockStatus = (stock) => {
    if (stock <= 10) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Low Stock' };
    if (stock <= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium Stock' };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock' };
  };

  const stockStatus = getStockStatus(product.branchStock || 0);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/10 flex items-center justify-center">
                <HiDocumentText className="h-6 w-6 text-[#22c55e]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Product Details</h2>
                <p className="text-sm text-gray-600">View and manage product information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiXMark className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Product Overview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {product.productName || 'Unnamed Product'}
                  </h3>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <HiCurrencyDollar className="h-4 w-4 text-gray-500" />
                      <span className="text-lg font-bold text-gray-900">
                        ₹{product.price?.toLocaleString() || '0'}
                      </span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                      {stockStatus.label}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Product Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiDocumentText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Product Name</p>
                      <p className="text-sm font-semibold text-gray-900">{product.productName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Product ID</p>
                      <p className="text-sm font-semibold text-gray-900">{product._id?.slice(-8) || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCurrencyDollar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Price</p>
                      <p className="text-sm font-semibold text-gray-900">₹{product.price?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stock & Inventory */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Stock & Inventory</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCube className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Branch Stock</p>
                      <p className="text-sm font-semibold text-gray-900">{product.branchStock || 0} units</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Branch</p>
                      <p className="text-sm font-semibold text-gray-900">{product.branchName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Created</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(product.createdAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Description</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{product.description}</p>
                </div>
              </div>
            )}

            {/* Additional Information */}
            {(product.category || product.brand || product.sku) && (
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Additional Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {product.category && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-600">Category</p>
                      <p className="text-sm font-semibold text-gray-900">{product.category}</p>
                    </div>
                  )}
                  {product.brand && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-600">Brand</p>
                      <p className="text-sm font-semibold text-gray-900">{product.brand}</p>
                    </div>
                  )}
                  {product.sku && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-600">SKU</p>
                      <p className="text-sm font-semibold text-gray-900">{product.sku}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <Button
              variant="outline"
              onClick={onClose}
              size="sm"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                variant="primary"
                onClick={() => {
                  onEdit(product);
                  onClose();
                }}
                size="sm"
                className="flex items-center space-x-2"
              >
                <HiPencil className="h-4 w-4" />
                <span>Edit Product</span>
              </Button>
            )}
            {onDelete && (
              <Button
                variant="danger"
                onClick={() => {
                  onDelete(product);
                  onClose();
                }}
                size="sm"
                className="flex items-center space-x-2"
              >
                <HiTrash className="h-4 w-4" />
                <span>Delete Product</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
