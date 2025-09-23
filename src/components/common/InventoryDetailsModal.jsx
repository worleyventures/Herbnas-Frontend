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
  HiTrash
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

  const getStockStatus = (quantity) => {
    if (quantity <= 10) return { color: 'text-red-600', bg: 'bg-red-100', label: 'Low Stock', icon: HiExclamationTriangle };
    if (quantity <= 50) return { color: 'text-yellow-600', bg: 'bg-yellow-100', label: 'Medium Stock', icon: HiExclamationTriangle };
    return { color: 'text-green-600', bg: 'bg-green-100', label: 'In Stock', icon: HiCheckCircle };
  };

  const stockStatus = getStockStatus(inventoryItem.quantity || 0);

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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/10 to-indigo-600/10 flex items-center justify-center">
                <HiCube className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isFinishedProduction ? 'Production Details' : 'Inventory Details'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isFinishedProduction ? 'View production information' : 'View and manage inventory information'}
                </p>
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
            {/* Inventory Item Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                <HiCube className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {inventoryItem.product?.productName || 'Unknown Product'}
                </h3>
                <p className="text-sm text-gray-600">
                  {inventoryItem.product?.description || 'No description available'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bg} ${stockStatus.color}`}>
                    <stockStatus.icon className="h-3 w-3 inline mr-1" />
                    {stockStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Inventory Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Product Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Product Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiDocumentText className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Product Name</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.product?.productName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCube className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Quantity</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.quantity || 0} units
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Branch</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.branch?.branchName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Management Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Management Info</h4>
                
                <div className="space-y-3">
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
                      <p className="text-xs font-medium text-gray-600">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(inventoryItem.lastUpdated)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Created</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(inventoryItem.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {inventoryItem.notes && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notes</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{inventoryItem.notes}</p>
                </div>
              </div>
            )}

            {/* Production-specific information */}
            {isFinishedProduction && inventoryItem.productionDetails && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Production Details</h4>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs font-medium text-gray-600">Production Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(inventoryItem.productionDetails.productionDate)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-gray-600">Batch Number</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {inventoryItem.productionDetails.batchNumber || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4 py-2"
              >
                Close
              </Button>
              {!isFinishedProduction && onEdit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onEdit(inventoryItem);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiPencil className="h-4 w-4" />
                  <span>Edit Inventory</span>
                </Button>
              )}
              {!isFinishedProduction && onDelete && (
                <Button
                  variant="danger"
                  onClick={() => {
                    onDelete(inventoryItem);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Delete Inventory</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsModal;
