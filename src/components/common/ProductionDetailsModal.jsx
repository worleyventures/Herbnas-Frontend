import React from 'react';
import {
  HiXMark,
  HiTag,
  HiCube,
  HiCalendar,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiExclamationTriangle,
  HiPlay,
  HiPause,
  HiPencil,
  HiTrash,
  HiDocumentText,
  HiClipboardDocumentList
} from 'react-icons/hi2';
import Button from './Button';
import { StatusBadge } from './Badge';

const ProductionDetailsModal = ({ 
  isOpen, 
  onClose, 
  production, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !production) return null;

  // Debug logging
  console.log('ProductionDetailsModal - production data:', production);

  // Get status badge for production status
  const getProductionStatusBadge = (status) => {
    const statusMap = {
      'in-progress': { variant: 'info', label: 'In Progress' },
      'on-hold': { variant: 'warning', label: 'On Hold' },
      'completed': { variant: 'success', label: 'Completed' }
    };
    
    return (
      <StatusBadge
        status={status}
        statusMap={statusMap}
      />
    );
  };

  // Get status badge for QC status
  const getQCStatusBadge = (status) => {
    const statusMap = {
      'Pending': { variant: 'warning', label: 'Pending' },
      'Approved': { variant: 'success', label: 'Approved' },
      'Rejected': { variant: 'error', label: 'Rejected' }
    };
    
    return (
      <StatusBadge
        status={status}
        statusMap={statusMap}
      />
    );
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
              <div className="p-2 bg-blue-100 rounded-lg">
                <HiClipboardDocumentList className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Production Batch Details
                </h2>
                <p className="text-sm text-gray-500">
                  Batch ID: {production.batchId}
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
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                {/* Batch Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <HiTag className="h-5 w-5 mr-2 text-gray-600" />
                    Batch Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiTag className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Batch ID</p>
                        <p className="text-sm font-semibold text-gray-900">{production.batchId}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiCube className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Quantity</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {production.quantity} {production.productId?.UOM || 'units'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <HiDocumentText className="h-5 w-5 mr-2 text-gray-600" />
                    Product Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiDocumentText className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Product Name</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {production.productId?.productName || 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiTag className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Category</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {production.productId?.category || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Status and Dates */}
              <div className="space-y-6">
                {/* Status Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <HiCheckCircle className="h-5 w-5 mr-2 text-gray-600" />
                    Status Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Production Status</p>
                        <div className="mt-1">
                          {getProductionStatusBadge(production.productionStatus)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">QC Status</p>
                        <div className="mt-1">
                          {getQCStatusBadge(production.QCstatus)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Active Status</p>
                        <div className="mt-1">
                          <StatusBadge
                            status={production.isActive ? 'active' : 'inactive'}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Date Information */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <HiCalendar className="h-5 w-5 mr-2 text-gray-600" />
                    Date Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiCalendar className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Manufactured Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {new Date(production.manufacturedDate).toLocaleDateString('en-IN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiCalendar className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Expiry Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {production.expiryDate 
                            ? new Date(production.expiryDate).toLocaleDateString('en-IN', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })
                            : 'N/A'
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Raw Materials Section */}
            {production.rawMaterials && production.rawMaterials.length > 0 && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <HiCube className="h-5 w-5 mr-2 text-gray-600" />
                  Raw Materials Used
                </h3>
                <div className="space-y-3">
                  {production.rawMaterials.map((rawMaterial, index) => (
                    <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">
                            {rawMaterial.rawMaterialId?.materialName || 'Unknown Material'}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {rawMaterial.rawMaterialId?.materialId || 'N/A'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900">
                            {rawMaterial.quantity} {rawMaterial.rawMaterialId?.UOM || 'units'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Available: {rawMaterial.rawMaterialId?.stockQuantity || 0} {rawMaterial.rawMaterialId?.UOM || 'units'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notes Section */}
            {(production.notes || production.QCNotes) && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <HiDocumentText className="h-5 w-5 mr-2 text-gray-600" />
                  Notes
                </h3>
                <div className="space-y-3">
                  {production.notes && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">Production Notes</p>
                      <p className="text-sm text-gray-900">{production.notes}</p>
                    </div>
                  )}
                  {production.QCNotes && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-600 mb-1">QC Notes</p>
                      <p className="text-sm text-gray-900">{production.QCNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* User Information */}
            {(production.createdBy || production.updatedBy) && (
              <div className="mt-6 bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">User Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {production.createdBy && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-600">Created By</p>
                      <p className="text-sm text-gray-900">
                        {production.createdBy.firstName} {production.createdBy.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{production.createdBy.email}</p>
                    </div>
                  )}
                  {production.updatedBy && (
                    <div className="p-3 bg-white border border-gray-200 rounded-lg">
                      <p className="text-xs font-medium text-gray-600">Updated By</p>
                      <p className="text-sm text-gray-900">
                        {production.updatedBy.firstName} {production.updatedBy.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{production.updatedBy.email}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Timestamps</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-600">Created At</p>
                  <p className="text-sm text-gray-900">
                    {new Date(production.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="p-3 bg-white border border-gray-200 rounded-lg">
                  <p className="text-xs font-medium text-gray-600">Updated At</p>
                  <p className="text-sm text-gray-900">
                    {new Date(production.updatedAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
            >
              Close
            </Button>
            {onEdit && (
              <Button
                onClick={() => {
                  onEdit(production);
                  onClose();
                }}
                variant="primary"
                size="sm"
                icon={HiPencil}
              >
                Edit Production
              </Button>
            )}
            {onDelete && (
              <Button
                onClick={() => {
                  onDelete(production);
                  onClose();
                }}
                variant="danger"
                size="sm"
                icon={HiTrash}
              >
                Delete Production
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductionDetailsModal;


