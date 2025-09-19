import React from 'react';
import { 
  HiCube, 
  HiBuildingOffice2, 
  HiUser, 
  HiCalendar, 
  HiXMark,
  HiExclamationTriangle,
  HiCheckCircle,
  HiInformationCircle,
  HiCog6Tooth,
  HiDocumentText
} from 'react-icons/hi2';
import { Modal, StatusBadge } from './index';

const InventoryDetailsModal = ({ isOpen, onClose, inventory, isFinishedProduction = false }) => {
  if (!inventory) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStockStatus = () => {
    if (isFinishedProduction) {
      return {
        status: 'completed',
        variant: 'success',
        icon: HiCheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }

    const totalStock = (inventory.inventoryStock || 0) + (inventory.branchStock || 0);
    const minLevel = inventory.minStockLevel || 0;
    const maxLevel = inventory.maxStockLevel || 0;

    if (totalStock <= minLevel) {
      return {
        status: 'low',
        variant: 'danger',
        icon: HiExclamationTriangle,
        color: 'text-red-600',
        bgColor: 'bg-red-100'
      };
    } else if (totalStock >= maxLevel) {
      return {
        status: 'high',
        variant: 'warning',
        icon: HiInformationCircle,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100'
      };
    } else {
      return {
        status: 'normal',
        variant: 'success',
        icon: HiCheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100'
      };
    }
  };

  const stockStatus = getStockStatus();
  const totalStock = (inventory.inventoryStock || 0) + (inventory.branchStock || 0);
  const totalValue = totalStock * (inventory.product?.price || 0);

  const details = isFinishedProduction ? [
    {
      label: 'Product Name',
      value: inventory.product?.productName || 'N/A',
      icon: HiDocumentText,
      color: 'text-blue-600'
    },
    {
      label: 'Batch Number',
      value: inventory.product?.batchNumber || 'N/A',
      icon: HiCube,
      color: 'text-indigo-600'
    },
    {
      label: 'Production Stage',
      value: 'F6 - Final Inspection',
      icon: HiCog6Tooth,
      color: 'text-purple-600'
    },
    {
      label: 'Production Status',
      value: 'Completed',
      icon: HiCheckCircle,
      color: 'text-green-600'
    },
    {
      label: 'Production Quantity',
      value: `${inventory.product?.quantity || 0} units`,
      icon: HiCube,
      color: 'text-blue-600'
    },
    {
      label: 'Production Status',
      value: (
        <StatusBadge 
          status={stockStatus.status}
          variant={stockStatus.variant}
        />
      ),
      icon: stockStatus.icon,
      color: stockStatus.color
    },
    {
      label: 'Price per Unit',
      value: `₹${inventory.product?.price || 0}`,
      icon: HiCube,
      color: 'text-green-600'
    },
    {
      label: 'Total Production Value',
      value: `₹${((inventory.product?.quantity || 0) * (inventory.product?.price || 0)).toLocaleString()}`,
      icon: HiCube,
      color: 'text-green-600'
    },
    {
      label: 'Production Completed',
      value: formatDate(inventory.updatedAt || inventory.createdAt),
      icon: HiCalendar,
      color: 'text-gray-600'
    },
    {
      label: 'Last Updated',
      value: formatDate(inventory.updatedAt || inventory.createdAt),
      icon: HiCalendar,
      color: 'text-gray-600'
    },
    {
      label: 'Updated By',
      value: inventory.updatedBy ? 
        `${inventory.updatedBy.firstName} ${inventory.updatedBy.lastName}` : 'N/A',
      icon: HiUser,
      color: 'text-indigo-600'
    }
  ] : [
    {
      label: 'Product Name',
      value: inventory.product?.productName || 'N/A',
      icon: HiCube,
      color: 'text-blue-600'
    },
    {
      label: 'Branch',
      value: inventory.branch?.branchName || 'N/A',
      icon: HiBuildingOffice2,
      color: 'text-indigo-600'
    },
    {
      label: 'Inventory Stock',
      value: `${inventory.inventoryStock || 0} units`,
      icon: HiCube,
      color: 'text-purple-600'
    },
    {
      label: 'Branch Stock',
      value: `${inventory.branchStock || 0} units`,
      icon: HiBuildingOffice2,
      color: 'text-green-600'
    },
    {
      label: 'Total Stock',
      value: `${totalStock} units`,
      icon: HiCube,
      color: 'text-blue-600'
    },
    {
      label: 'Stock Status',
      value: (
        <StatusBadge 
          status={stockStatus.status}
          variant={stockStatus.variant}
        />
      ),
      icon: stockStatus.icon,
      color: stockStatus.color
    },
    {
      label: 'Min Stock Level',
      value: `${inventory.minStockLevel || 0} units`,
      icon: HiExclamationTriangle,
      color: 'text-red-600'
    },
    {
      label: 'Max Stock Level',
      value: `${inventory.maxStockLevel || 0} units`,
      icon: HiInformationCircle,
      color: 'text-yellow-600'
    },
    {
      label: 'Total Value',
      value: `₹${totalValue.toLocaleString()}`,
      icon: HiCube,
      color: 'text-green-600'
    },
    {
      label: 'Last Restocked',
      value: formatDate(inventory.lastRestocked),
      icon: HiCalendar,
      color: 'text-gray-600'
    },
    {
      label: 'Last Updated',
      value: formatDate(inventory.lastUpdated),
      icon: HiCalendar,
      color: 'text-gray-600'
    },
    {
      label: 'Updated By',
      value: inventory.updatedBy ? 
        `${inventory.updatedBy.firstName} ${inventory.updatedBy.lastName}` : 'N/A',
      icon: HiUser,
      color: 'text-indigo-600'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isFinishedProduction ? "Finished Production Details" : "Inventory Details"}
      size="sm"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <div className={`h-16 w-16 rounded-lg ${isFinishedProduction ? 'bg-green-100' : 'bg-blue-100'} flex items-center justify-center`}>
              {isFinishedProduction ? (
                <HiCheckCircle className="h-8 w-8 text-green-600" />
              ) : (
                <HiCube className="h-8 w-8 text-blue-600" />
              )}
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900">
              {inventory.product?.productName || 'Unknown Product'}
            </h3>
            <p className="text-sm text-gray-600">
              {isFinishedProduction ? 
                `Batch: ${inventory.product?.batchNumber || 'N/A'}` : 
                (inventory.branch?.branchName || 'Unknown Branch')
              }
            </p>
            <div className="mt-2">
              <StatusBadge 
                status={stockStatus.status}
                variant={stockStatus.variant}
              />
            </div>
          </div>
        </div>

        {/* Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isFinishedProduction ? (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <HiCube className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Production Quantity</p>
                    <p className="text-2xl font-bold text-blue-900">{inventory.product?.quantity || 0}</p>
                    <p className="text-xs text-blue-600">units produced</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <HiCube className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Production Value</p>
                    <p className="text-2xl font-bold text-green-900">₹{((inventory.product?.quantity || 0) * (inventory.product?.price || 0)).toLocaleString()}</p>
                    <p className="text-xs text-green-600">total value</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${stockStatus.bgColor}`}>
                <div className="flex items-center">
                  <stockStatus.icon className={`h-8 w-8 ${stockStatus.color} mr-3`} />
                  <div>
                    <p className={`text-sm font-medium ${stockStatus.color}`}>Production Status</p>
                    <p className={`text-2xl font-bold ${stockStatus.color}`}>
                      {stockStatus.status.charAt(0).toUpperCase() + stockStatus.status.slice(1)}
                    </p>
                    <p className={`text-xs ${stockStatus.color}`}>
                      Production finished
                    </p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <HiCube className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-600">Total Stock</p>
                    <p className="text-2xl font-bold text-blue-900">{totalStock}</p>
                    <p className="text-xs text-blue-600">units</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <HiCube className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-600">Total Value</p>
                    <p className="text-2xl font-bold text-green-900">₹{totalValue.toLocaleString()}</p>
                    <p className="text-xs text-green-600">worth of stock</p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${stockStatus.bgColor}`}>
                <div className="flex items-center">
                  <stockStatus.icon className={`h-8 w-8 ${stockStatus.color} mr-3`} />
                  <div>
                    <p className={`text-sm font-medium ${stockStatus.color}`}>Stock Status</p>
                    <p className={`text-2xl font-bold ${stockStatus.color}`}>
                      {stockStatus.status.charAt(0).toUpperCase() + stockStatus.status.slice(1)}
                    </p>
                    <p className={`text-xs ${stockStatus.color}`}>
                      {stockStatus.status === 'low' ? 'Below minimum' : 
                       stockStatus.status === 'high' ? 'Above maximum' : 'Normal range'}
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Inventory Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {details.map((detail, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${detail.color}`}>
                <detail.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                <dd className="mt-1 text-sm text-gray-900">{detail.value}</dd>
              </div>
            </div>
          ))}
        </div>

        {/* Product Information */}
        {inventory.product && (
          <div className="border-t border-gray-200 pt-6">
            <h4 className="text-lg font-medium text-gray-900 mb-4">
              {isFinishedProduction ? 'Production Information' : 'Product Information'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-blue-600">
                  {isFinishedProduction ? <HiDocumentText className="h-5 w-5" /> : <HiCube className="h-5 w-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Product Name</p>
                  <p className="text-sm text-gray-900">{inventory.product.productName}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-green-600">
                  <HiCube className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Price per Unit</p>
                  <p className="text-sm text-gray-900">₹{inventory.product.price || 'N/A'}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0 text-purple-600">
                  <HiCube className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">Weight</p>
                  <p className="text-sm text-gray-900">{inventory.product.weight || 'N/A'}g</p>
                </div>
              </div>
              {isFinishedProduction && (
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0 text-indigo-600">
                    <HiCog6Tooth className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Production Stage</p>
                    <p className="text-sm text-gray-900">F6 - Final Inspection</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <HiXMark className="h-4 w-4 mr-2" />
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default InventoryDetailsModal;
