import React from 'react';
import {
  HiXMark,
  HiShoppingBag,
  HiTag,
  HiDocumentText,
  HiScale,
  HiCurrencyDollar,
  HiCalendar,
  HiUser,
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiXCircle
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
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <HiShoppingBag className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Product Details
                </h3>
                <p className="text-sm text-gray-500">
                  {product.productId}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiXMark className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Basic Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiShoppingBag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Product Name</p>
                      <p className="text-sm font-semibold text-gray-900">{product.productName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Category</p>
                      <p className="text-sm font-semibold text-gray-900">{product.category || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiScale className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Unit of Measure</p>
                      <p className="text-sm font-semibold text-gray-900">{product.UOM || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCurrencyDollar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Price</p>
                      <p className="text-sm font-semibold text-gray-900">{formatPrice(product.price)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Additional Information
                </h4>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiDocumentText className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Description</p>
                      <p className="text-sm text-gray-900 mt-1">{product.description || 'No description available'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      {product.isActive ? (
                        <HiCheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <HiXCircle className="h-5 w-5 text-red-500" />
                      )}
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Status</p>
                        <p className={`text-sm font-semibold ${
                          product.isActive ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Created Date</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(product.createdAt)}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-900">{formatDate(product.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={onClose}
              variant="outline"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                onClick={() => onEdit(product)}
                variant="primary"
                icon={HiPencil}
              >
                Edit Product
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => onDelete(product)}
                variant="danger"
                icon={HiTrash}
              >
                Delete Product
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;