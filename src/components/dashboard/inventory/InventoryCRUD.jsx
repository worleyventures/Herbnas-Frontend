import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiCube,
  HiBuildingOffice2,
  HiExclamationTriangle,
  HiCheckCircle,
  HiInformationCircle
} from 'react-icons/hi2';
import { Table, ActionButton, StatusBadge, ConfirmationModal } from '../../common';
import { InventoryDetailsModal } from '../../common';

const InventoryCRUD = ({ 
  inventory, 
  onSelectInventory, 
  onEditInventory, 
  onDeleteInventory, 
  onCreateInventory, 
  onUpdateInventory, 
  onDeleteInventoryConfirm,
  showDeleteModal,
  selectedInventory,
  setShowDeleteModal,
  loading,
  createLoading,
  updateLoading,
  deleteLoading,
  isFinishedProduction = false
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Get users for updatedBy display
  const users = useSelector((state) => state.user?.users || []);
  const usersLoading = useSelector((state) => state.user?.loading || false);
  const usersError = useSelector((state) => state.user?.error || null);

  // Fallback users if API fails
  const fallbackUsers = [
    { _id: '1', firstName: 'Admin', lastName: 'User', email: 'admin@example.com' },
    { _id: '2', firstName: 'Manager', lastName: 'User', email: 'manager@example.com' }
  ];

  const allUsers = users.length > 0 ? users : fallbackUsers;

  const getStockStatus = (inventoryItem) => {
    const availableStock = inventoryItem.availableStock || 0;
    const minLevel = inventoryItem.minStockLevel || 0;
    const maxLevel = inventoryItem.maxStockLevel || 0;
    const reorderPoint = inventoryItem.reorderPoint || 0;

    if (availableStock <= minLevel) {
      return {
        status: 'low',
        variant: 'danger',
        icon: HiExclamationTriangle,
        color: 'text-red-600'
      };
    } else if (availableStock >= maxLevel) {
      return {
        status: 'high',
        variant: 'warning',
        icon: HiInformationCircle,
        color: 'text-yellow-600'
      };
    } else if (availableStock <= reorderPoint) {
      return {
        status: 'reorder',
        variant: 'warning',
        icon: HiCube,
        color: 'text-orange-600'
      };
    } else {
      return {
        status: 'normal',
        variant: 'success',
        icon: HiCheckCircle,
        color: 'text-green-600'
      };
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = useMemo(() => [
    {
      key: 'product',
      label: 'Product',
      sortable: true,
      render: (inventoryItem) => (
        <div className="flex items-center space-x-3">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <HiCube className="h-5 w-5 text-green-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {inventoryItem.product?.productName || 'Unknown Product'}
            </p>
            <p className="text-sm text-gray-500 truncate">
              Batch: {inventoryItem.product?.batchNumber || 'N/A'}
            </p>
            <p className="text-xs text-gray-400 truncate">
              ₹{inventoryItem.product?.price || 'N/A'} | {inventoryItem.product?.weight || 'N/A'}g
            </p>
          </div>
        </div>
      )
    },
    {
      key: 'productionStatus',
      label: isFinishedProduction ? 'Production Status' : 'Production Status',
      sortable: true,
      render: (inventoryItem) => (
        <div className="flex flex-col space-y-1">
          <div className="flex items-center space-x-2">
            <HiCheckCircle className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-gray-900">
              {isFinishedProduction ? 'F6 - Completed' : 'F6 - Completed'}
            </span>
          </div>
          <div className="text-xs text-gray-500">
            {isFinishedProduction ? 'Production finished' : 'Production finished'}
          </div>
        </div>
      )
    },
    {
      key: 'stock',
      label: isFinishedProduction ? 'Production Quantity' : 'Stock Levels',
      sortable: false,
      render: (inventoryItem) => {
        if (isFinishedProduction) {
          return (
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-900">
                  {inventoryItem.product?.quantity || 0} units
                </span>
                <StatusBadge 
                  status="completed"
                  variant="success"
                  className="text-xs"
                />
              </div>
              <div className="text-xs text-gray-500">
                Produced: {inventoryItem.product?.quantity || 0}
              </div>
            </div>
          );
        }

        const stockStatus = getStockStatus(inventoryItem);
        
        return (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {inventoryItem.availableStock || 0} units
              </span>
              <StatusBadge 
                status={stockStatus.status}
                variant={stockStatus.variant}
                className="text-xs"
              />
            </div>
            <div className="text-xs text-gray-500">
              Available: {inventoryItem.availableStock || 0}
            </div>
          </div>
        );
      }
    },
    {
      key: 'thresholds',
      label: 'Thresholds',
      sortable: false,
      hiddenOnMobile: true,
      render: (inventoryItem) => (
        <div className="text-sm space-y-1">
          <div className="flex items-center space-x-2">
            <HiExclamationTriangle className="h-3 w-3 text-red-500" />
            <span className="text-gray-500">Min:</span>
            <span className="font-medium">{inventoryItem.minStockLevel || 0}</span>
          </div>
          <div className="flex items-center space-x-2">
            <HiInformationCircle className="h-3 w-3 text-yellow-500" />
            <span className="text-gray-500">Max:</span>
            <span className="font-medium">{inventoryItem.maxStockLevel || 0}</span>
          </div>
        </div>
      )
    },
    {
      key: 'value',
      label: isFinishedProduction ? 'Production Value' : 'Stock Value',
      sortable: false,
      hiddenOnMobile: true,
      render: (inventoryItem) => {
        if (isFinishedProduction) {
          const productionQuantity = inventoryItem.product?.quantity || 0;
          const totalValue = productionQuantity * (inventoryItem.product?.price || 0);
          return (
            <div className="text-sm">
              <p className="font-medium text-gray-900">₹{totalValue.toLocaleString()}</p>
              <p className="text-xs text-gray-500">total production value</p>
            </div>
          );
        }

        const availableStock = inventoryItem.availableStock || 0;
        const totalValue = availableStock * (inventoryItem.product?.price || 0);
        return (
          <div className="text-sm">
            <p className="font-medium text-gray-900">₹{totalValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">available stock value</p>
          </div>
        );
      }
    },
    {
      key: 'lastUpdated',
      label: 'Last Updated',
      sortable: true,
      hiddenOnMobile: true,
      render: (inventoryItem) => (
        <div className="text-sm">
          <p className="text-gray-900">{formatDate(inventoryItem.lastUpdated)}</p>
          <p className="text-xs text-gray-500">
            by {inventoryItem.updatedBy ? 
              `${inventoryItem.updatedBy.firstName} ${inventoryItem.updatedBy.lastName}` : 
              'Unknown User'
            }
          </p>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (inventoryItem) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={HiEye}
            onClick={() => handleViewInventory(inventoryItem)}
            variant="view"
            size="sm"
            title={isFinishedProduction ? "View Production Details" : "View Details"}
          />
          {!isFinishedProduction && (
            <>
              <ActionButton
                icon={HiPencil}
                onClick={() => onEditInventory(inventoryItem)}
                variant="edit"
                size="sm"
                title="Edit Inventory"
              />
              <ActionButton
                icon={HiTrash}
                onClick={() => handleDeleteInventory(inventoryItem)}
                variant="danger"
                size="sm"
                title="Delete Inventory"
              />
            </>
          )}
        </div>
      )
    }
  ], [allUsers]);

  const handleViewInventory = (inventoryItem) => {
    onSelectInventory(inventoryItem);
    setShowDetailsModal(true);
  };

  const handleDeleteInventory = (inventoryItem) => {
    onSelectInventory(inventoryItem);
    setShowDeleteModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    onSelectInventory(null);
  };

  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Table */}
      <Table
        data={inventory}
        columns={columns}
        loading={loading}
        emptyMessage={isFinishedProduction ? "No finished production products yet" : "No completed production products in inventory yet"}
        emptySubMessage={isFinishedProduction ? "Products will appear here once they complete F6 stage with 'completed' status" : "Products will appear here once they complete F6 stage with 'completed' status"}
        className="w-full"
      />

      {/* Inventory Details Modal */}
      {selectedInventory && (
        <InventoryDetailsModal
          isOpen={showDetailsModal}
          onClose={handleCloseDetails}
          inventory={selectedInventory}
          isFinishedProduction={isFinishedProduction}
        />
      )}

      {/* Delete Confirmation Modal - Only show for regular inventory, not finished production */}
      {!isFinishedProduction && (
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => {
            onDeleteInventoryConfirm();
          }}
          title="Delete Inventory"
          message={
            selectedInventory ? (
              <div className="text-left">
                <p className="mb-2">Are you sure you want to delete this inventory record?</p>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="font-medium text-gray-900">
                    {selectedInventory.product?.productName || 'Unknown Product'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedInventory.branch?.branchName || 'Unknown Branch'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Stock: {(selectedInventory.inventoryStock || 0) + (selectedInventory.branchStock || 0)} units
                  </p>
                </div>
                <p className="mt-2 text-sm text-gray-600">
                  This action cannot be undone. The inventory record will be permanently removed.
                </p>
              </div>
            ) : "Are you sure you want to delete this inventory record?"
          }
          confirmText="Delete"
          cancelText="Cancel"
          variant="danger"
          loading={deleteLoading}
        />
      )}
    </div>
  );
};

export default InventoryCRUD;
