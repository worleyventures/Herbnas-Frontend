import React from 'react';
import { HiXMark, HiDocumentText, HiTag, HiCurrencyDollar, HiCube, HiExclamationTriangle, HiCalendar, HiBuildingOffice2, HiQrCode, HiCog6Tooth, HiCheckCircle } from 'react-icons/hi2';
import { Modal, Button, StatusBadge } from './index';

const ProductDetailsModal = ({
  isOpen,
  onClose,
  product,
  onEdit,
  onDelete
}) => {
  if (!product) return null;

  const getStatusVariant = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'discontinued':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return 'HiCheckCircle';
      case 'inactive':
        return 'HiExclamationTriangle';
      case 'discontinued':
        return 'HiXCircle';
      default:
        return 'HiDocumentText';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      size="sm"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="h-16 w-16 rounded-xl flex items-center justify-center" style={{background: 'linear-gradient(90deg, rgba(139, 195, 74, 0.1), rgba(85, 139, 47, 0.1))'}}>
              <HiDocumentText className="h-8 w-8" style={{color: 'rgb(139, 195, 74)'}} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{product.productName}</h2>
              <div className="flex items-center space-x-2 mt-1">
                <StatusBadge
                  status={product.isActive ? 'active' : 'inactive'}
                  variant={getStatusVariant(product.isActive ? 'active' : 'inactive')}
                  icon={getStatusIcon(product.isActive ? 'active' : 'inactive')}
                />
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  product.currentStage === 'completed' ? 'bg-green-100' :
                  product.currentStage === 'F6' ? 'bg-blue-100 text-blue-800' :
                  product.currentStage === 'F5' ? 'bg-purple-100 text-purple-800' :
                  product.currentStage === 'F4' ? 'bg-indigo-100 text-indigo-800' :
                  product.currentStage === 'F3' ? 'bg-yellow-100 text-yellow-800' :
                  product.currentStage === 'F2' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`} style={product.currentStage === 'completed' ? {color: 'rgb(85, 139, 47)'} : {}}>
                  {product.currentStage || 'F1'}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* Production Status */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <HiCog6Tooth className="h-5 w-5 mr-2 text-blue-600" />
            Production Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Current Stage</label>
              <div className="flex items-center mt-1">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.currentStage === 'completed' ? 'bg-green-100' :
                  product.currentStage === 'F6' ? 'bg-blue-100 text-blue-800' :
                  product.currentStage === 'F5' ? 'bg-purple-100 text-purple-800' :
                  product.currentStage === 'F4' ? 'bg-indigo-100 text-indigo-800' :
                  product.currentStage === 'F3' ? 'bg-yellow-100 text-yellow-800' :
                  product.currentStage === 'F2' ? 'bg-orange-100 text-orange-800' :
                  'bg-gray-100 text-gray-800'
                }`} style={product.currentStage === 'completed' ? {color: 'rgb(85, 139, 47)'} : {}}>
                  {product.currentStage || 'F1'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Production Status</label>
              <div className="flex items-center mt-1">
                {product.isProductionComplete ? (
                  <div className="flex items-center" style={{color: 'rgb(139, 195, 74)'}}>
                    <HiCheckCircle className="h-4 w-4 mr-1" />
                    <span className="font-medium">Completed</span>
                  </div>
                ) : (
                  <div className="flex items-center text-yellow-600">
                    <HiExclamationTriangle className="h-4 w-4 mr-1" />
                    <span className="font-medium">In Progress</span>
                  </div>
                )}
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Batch ID</label>
              <div className="flex items-center mt-1">
                <HiTag className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-mono">{product.batchID || 'N/A'}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Quantity</label>
              <div className="flex items-center mt-1">
                <HiCube className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-semibold">{product.quantity || 0} units</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Price</label>
              <div className="flex items-center mt-1">
                <HiCurrencyDollar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-semibold">₹{product.price?.toLocaleString() || '0'}</span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <div className="flex items-center mt-1">
                <StatusBadge
                  status={product.isActive ? 'active' : 'inactive'}
                  variant={getStatusVariant(product.isActive ? 'active' : 'inactive')}
                  icon={getStatusIcon(product.isActive ? 'active' : 'inactive')}
                />
              </div>
            </div>
          </div>
        </div>



        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            size="xs"
            className="hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent"
          >
            Close
          </Button>
          {onEdit && (
            <Button
              variant="gradient"
              onClick={() => {
                onEdit(product);
                onClose();
              }}
              size="xs"
            >
              Edit Product
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default ProductDetailsModal;
