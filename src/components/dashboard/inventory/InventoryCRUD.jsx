import React, { useState, useMemo } from 'react';
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
  HiInformationCircle,
  HiTruck,
  HiCreditCard,
  HiDocumentArrowDown
} from 'react-icons/hi2';
import { Table, ActionButton, StatusBadge, ConfirmationModal, InventoryDetailsModal, CommonModal, Select, Button } from '../../common';
import { updateSentGoodsStatus } from '../../../redux/actions/sentGoodsActions';
import { addNotification } from '../../../redux/slices/uiSlice';
import { getAccountByRawMaterialId, updateAccountPaymentStatus } from '../../../redux/actions/accountActions';

const InventoryCRUD = ({ 
  inventory, 
  inventoryType = 'finishedGoods', // 'rawMaterials', 'finishedGoods', or 'sentGoods'
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
  const [showInventoryModal, setShowInventoryModal] = useState(false);
  const [showPaymentStatusModal, setShowPaymentStatusModal] = useState(false);
  const [selectedRawMaterial, setSelectedRawMaterial] = useState(null);
  const [rawMaterialAccount, setRawMaterialAccount] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceAccount, setInvoiceAccount] = useState(null);

  // Get current user for permission checks
  const { user } = useSelector((state) => state.auth || {});

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


  // Check if user can delete raw materials (admin or super_admin only)
  const canDeleteRawMaterials = () => {
    if (!user?.role) return false;
    return user.role === 'admin' || user.role === 'super_admin';
  };

  const getStockStatus = (inventoryItem) => {
    const availableStock = inventoryType === 'rawMaterials' 
      ? (inventoryItem.stockQuantity || 0)
      : (inventoryItem.availableQuantity || 0);
    const minLevel = inventoryItem.minStockLevel || 0;
    const maxLevel = inventoryItem.maxStockLevel || 0;
    const reorderPoint = inventoryItem.reorderPoint || 0;

    if (availableStock <= minLevel) {
      return {
        text: 'Low Stock',
        status: 'low',
        variant: 'danger',
        icon: HiExclamationTriangle,
        color: 'text-red-600'
      };
    } else if (availableStock >= maxLevel) {
      return {
        text: 'High Stock',
        status: 'high',
        variant: 'warning',
        icon: HiInformationCircle,
        color: 'text-yellow-600'
      };
    } else if (availableStock <= reorderPoint) {
      return {
        text: 'Reorder',
        status: 'reorder',
        variant: 'warning',
        icon: HiCube,
        color: 'text-orange-600'
      };
    } else {
      return {
        text: 'Normal Stock',
        status: 'normal',
        variant: 'success',
        icon: HiCheckCircle,
        color: 'text-green-600'
      };
    }
  };

  // Handle status update for sent goods
  const handleStatusUpdate = async (id, newStatus) => {
    console.log('=== STATUS UPDATE START ===');
    console.log('Updating status for item:', id, 'to:', newStatus);
    console.log('Current inventory type:', inventoryType);
    console.log('onUpdateInventory function:', typeof onUpdateInventory);
    
    try {
      console.log('Dispatching updateSentGoodsStatus action...');
      const result = await dispatch(updateSentGoodsStatus({ id, status: newStatus }));
      console.log('Status update result:', result);
      console.log('Result type:', result.type);
      console.log('Result payload:', result.payload);
      
      if (updateSentGoodsStatus.fulfilled.match(result)) {
        console.log('Status update successful!');
        dispatch(addNotification({
          type: 'success',
          message: `Status updated to ${newStatus}`
        }));
        
        // Refresh the inventory data to reflect the status change
        if (typeof onUpdateInventory === 'function') {
          console.log('Calling onUpdateInventory to refresh data...');
          onUpdateInventory();
        } else {
          console.log('onUpdateInventory is not a function:', onUpdateInventory);
        }
      } else {
        console.log('Status update failed:', result.payload);
        dispatch(addNotification({
          type: 'error',
          message: result.payload || 'Failed to update status'
        }));
      }
    } catch (error) {
      console.error('Error updating status:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to update status'
      }));
    }
    console.log('=== STATUS UPDATE END ===');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const columns = useMemo(() => {
    if (inventoryType === 'sentGoods') {
      return [
        {
          key: 'trackingId',
          label: 'Tracking ID',
          sortable: true,
          render: (inventoryItem) => (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {inventoryItem.trackingId || 'N/A'}
              </p>
            </div>
          )
        },
        {
          key: 'branch',
          label: 'Branch',
          sortable: true,
          render: (inventoryItem) => (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {inventoryItem.branchId?.branchName || 'Unknown Branch'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                {inventoryItem.branchId?.branchCode || ''}
              </p>
            </div>
          )
        },
        {
          key: 'items',
          label: 'Items',
          sortable: false,
          render: (inventoryItem) => (
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {inventoryItem.items?.length || 0} items
              </span>
              <div className="text-xs text-gray-500 mt-1">
                {inventoryItem.items?.slice(0, 2).map(item => item.productName || 'Unknown Product').join(', ')}
                {inventoryItem.items?.length > 2 && '...'}
              </div>
            </div>
          )
        },
        {
          key: 'status',
          label: 'Status',
          sortable: true,
          render: (inventoryItem) => {
            const getStatusColor = (status) => {
              const colors = {
                'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
                'in-transit': 'bg-blue-100 text-blue-800 border-blue-300',
                'delivered': 'bg-green-100 text-green-800 border-green-300',
                'cancelled': 'bg-red-100 text-red-800 border-red-300'
              };
              return colors[status] || 'bg-gray-100 text-gray-800 border-gray-300';
            };
            
            const getStatusLabel = (status) => {
              const labels = {
                'pending': 'Pending',
                'in-transit': 'In Transit',
                'delivered': 'Delivered',
                'cancelled': 'Cancelled'
              };
              return labels[status] || status;
            };
            
            // Show colored badge for all users
            return (
              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(inventoryItem.status)}`}>
                {getStatusLabel(inventoryItem.status)}
              </span>
            );
          }
        },
        {
          key: 'sentDate',
          label: 'Sent Date',
          sortable: true,
          render: (inventoryItem) => (
            <span className="text-sm text-gray-900">
              {formatDate(inventoryItem.sentAt || inventoryItem.createdAt)}
            </span>
          )
        },
        {
          key: 'actions',
          label: 'Actions',
          sortable: false,
          render: (inventoryItem) => {
            const isSuperAdmin = user?.role === 'super_admin';
            
            return (
              <div className="flex items-center space-x-2">
                 <ActionButton
                   icon={HiEye}
                   onClick={() => {
                     onSelectInventory(inventoryItem);
                     setShowInventoryModal(true);
                   }}
                   tooltip="View Details"
                   className="text-blue-600 hover:text-blue-900"
                 />
                 {isSuperAdmin && (
                   <ActionButton
                     icon={HiPencil}
                     onClick={() => onEditInventory(inventoryItem)}
                     tooltip="Edit Goods"
                     className="text-indigo-600 hover:text-indigo-900"
                   />
                 )}
              </div>
            );
          }
        }
      ];
    } else if (inventoryType === 'rawMaterials') {
      return [
        {
          key: 'material',
          label: 'Material',
          sortable: true,
          render: (inventoryItem) => (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {inventoryItem.set || 'Unknown Material'}
              </p>
              <p className="text-sm text-gray-500 truncate">
                ID: {inventoryItem.materialId || 'N/A'}
              </p>
            </div>
          )
        },
        {
          key: 'supplier',
          label: 'Supplier',
          sortable: true,
          render: (inventoryItem) => (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {inventoryItem.supplierName || 'Unknown Supplier'}
              </p>
            </div>
          )
        },
        {
          key: 'category',
          label: 'Category',
          sortable: true,
          render: (inventoryItem) => (
            <span className="text-sm text-gray-900">{inventoryItem.category || 'N/A'}</span>
          )
        },
        {
          key: 'stockQuantity',
          label: 'Stock Quantity',
          sortable: true,
          render: (inventoryItem) => (
            <div className="text-sm">
              <span className="font-medium text-gray-900">
                {inventoryItem.stockQuantity || 0} {inventoryItem.UOM || ''}
              </span>
            </div>
          )
        },
        {
          key: 'totalPrice',
          label: 'Total Price',
          sortable: true,
          render: (inventoryItem) => (
            <span className="text-sm font-medium text-gray-900">
              ₹{inventoryItem.totalPrice?.toLocaleString() || 'N/A'}
            </span>
          )
        },
        {
          key: 'stockStatus',
          label: 'Stock Status',
          sortable: true,
          render: (inventoryItem) => {
            const stockStatus = getStockStatus(inventoryItem);
            return (
              <StatusBadge
                status={stockStatus.text}
                color={stockStatus.color}
                icon={stockStatus.icon}
              />
            );
          }
        },
        {
          key: 'isActive',
          label: 'Active',
          sortable: true,
          render: (inventoryItem) => (
            <StatusBadge
              status={inventoryItem.isActive ? 'Active' : 'Inactive'}
              color={inventoryItem.isActive ? 'green' : 'red'}
            />
          )
        },
        {
          key: 'paymentStatus',
          label: 'Payment Status',
          sortable: true,
          render: (inventoryItem) => {
            const paymentStatus = inventoryItem.paymentStatus || 'N/A';
            const statusColors = {
              'pending': 'yellow',
              'completed': 'green',
              'failed': 'red',
              'refunded': 'gray'
            };
            return (
              <StatusBadge
                status={paymentStatus}
                color={statusColors[paymentStatus] || 'gray'}
              />
            );
          }
        },
        {
          key: 'actions',
          label: 'Actions',
          render: (inventoryItem) => (
            <div className="flex items-center space-x-2">
              <ActionButton
                icon={HiEye}
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewInvoice(inventoryItem);
                }}
                variant="view"
                size="sm"
                title="View Invoice"
              />
              <ActionButton
                icon={HiPencil}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditInventory(inventoryItem);
                }}
                variant="edit"
                size="sm"
                title="Edit Inventory"
              />
              <ActionButton
                icon={HiCreditCard}
                onClick={(e) => {
                  e.stopPropagation();
                  handlePaymentStatusClick(inventoryItem);
                }}
                variant="secondary"
                size="sm"
                title="Update Payment Status"
              />
              {canDeleteRawMaterials() && inventoryType === 'rawMaterials' && (
                <ActionButton
                  icon={HiTrash}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteInventory(inventoryItem);
                  }}
                  variant="danger"
                  size="sm"
                  title="Delete Inventory"
                />
              )}
            </div>
          )
        }
      ];
    } else {
      return [
        {
          key: 'product',
          label: 'Product',
          sortable: true,
          render: (inventoryItem) => (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {inventoryItem.product?.productName || 'Unknown Product'}
              </p>
            </div>
          )
        },
        {
          key: 'productionId',
          label: 'Production ID',
          sortable: false,
          hiddenOnMobile: true,
          render: (inventoryItem) => (
            <div className="text-sm">
              <p className="font-medium text-gray-900 truncate">
                {inventoryItem.production?.batchId || inventoryItem.batchId || inventoryItem.productionId || 'N/A'}
              </p>
            </div>
          )
        },
    {
      key: 'productionStatus',
      label: isFinishedProduction ? 'Production Status' : 'Production Status',
      sortable: true,
      render: (inventoryItem) => (
        <div className="flex flex-col space-y-1">
          <span className="text-sm font-medium text-gray-900">
            {isFinishedProduction ? 'Completed' : 'Completed'}
          </span>
        </div>
      )
    },
    {
      key: 'stock',
      label: isFinishedProduction ? 'Production Quantity' : 'Available Stock',
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
                {inventoryItem.availableQuantity || 0} units
              </span>
            </div>
            <div className="text-xs text-gray-500">
              Available: {inventoryItem.availableQuantity || 0} units
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
            <span className="text-gray-500">Min:</span>
            <span className="font-medium">{inventoryItem.minStockLevel || 0}</span>
          </div>
          <div className="flex items-center space-x-2">
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

        const availableStock = inventoryItem.availableQuantity || 0;
        const totalValue = availableStock * (inventoryItem.product?.price || 0);
        return (
          <div className="text-sm">
            <p className="font-medium text-gray-900">₹{totalValue.toLocaleString()}</p>
            <p className="text-xs text-gray-500">Stock value</p>
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
          {/* <p className="text-xs text-gray-500">
            by {inventoryItem.updatedBy ? 
              `${inventoryItem.updatedBy.firstName} ${inventoryItem.updatedBy.lastName}` : 
              'Unknown User'
            }
          </p> */}
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
          {!isFinishedProduction && inventoryType !== 'sentGoods' && (
            <>
              <ActionButton
                icon={HiPencil}
                onClick={() => onEditInventory(inventoryItem)}
                variant="edit"
                size="sm"
                title="Edit Inventory"
              />
              {canDeleteRawMaterials() && inventoryType !== 'sentGoods' && (
                <ActionButton
                  icon={HiTrash}
                  onClick={() => handleDeleteInventory(inventoryItem)}
                  variant="danger"
                  size="sm"
                  title="Delete Inventory"
                />
              )}
            </>
          )}
        </div>
      )
    }
      ];
    }
  }, [allUsers, inventoryType, isFinishedProduction]);

  const handleViewInventory = (inventoryItem) => {
    onSelectInventory(inventoryItem);
    setShowInventoryModal(true);
  };

  const handleDeleteInventory = (inventoryItem) => {
    onSelectInventory(inventoryItem);
    setShowDeleteModal(true);
  };

  const handlePaymentStatusClick = async (inventoryItem) => {
    try {
      setSelectedRawMaterial(inventoryItem);
      // Fetch account entry for this raw material
      const result = await dispatch(getAccountByRawMaterialId(inventoryItem._id)).unwrap();
      // Handle both nested and direct account data
      const accountData = result.data?.account || result.data || result.account || result;
      setRawMaterialAccount(accountData);
      setShowPaymentStatusModal(true);
    } catch (error) {
      const errorMessage = error?.message || 'Failed to fetch account details';
      dispatch(addNotification({
        type: 'error',
        message: errorMessage.includes('Account entry not found') 
          ? 'No account entry found for this raw material. Please create a purchase entry first from the Purchase Management page.'
          : errorMessage
      }));
      // Don't open modal if account doesn't exist
      setSelectedRawMaterial(null);
      setRawMaterialAccount(null);
    }
  };

  const handleViewInvoice = async (inventoryItem) => {
    try {
      // Fetch account entry for this raw material
      const result = await dispatch(getAccountByRawMaterialId(inventoryItem._id)).unwrap();
      // Handle both nested and direct account data
      const accountData = result.data?.account || result.data || result.account || result;
      setInvoiceAccount(accountData);
      setShowInvoiceModal(true);
    } catch (error) {
      const errorMessage = error?.message || 'Failed to fetch invoice details';
      dispatch(addNotification({
        type: 'error',
        message: errorMessage.includes('Account entry not found') 
          ? 'No invoice available for this raw material. Please create a purchase entry first from the Purchase Management page.'
          : errorMessage
      }));
    }
  };

  const handleRowClick = (inventoryItem) => {
    // Open inventory details modal when clicking on row data (not actions)
    handleViewInventory(inventoryItem);
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
        onRowClick={inventoryType === 'rawMaterials' ? handleRowClick : undefined}
        emptyMessage={
          inventoryType === 'rawMaterials' 
            ? "No raw materials found" 
            : inventoryType === 'sentGoods'
              ? "No sent goods found"
              : isFinishedProduction 
                ? "No finished production products yet" 
                : "No completed production products in inventory yet"
        }
        emptySubMessage={
          inventoryType === 'rawMaterials'
            ? "Raw materials will appear here once they are added to the system"
            : inventoryType === 'sentGoods'
              ? "Sent goods will appear here once inventory is transferred to branches"
              : isFinishedProduction 
                ? "Products will appear here once they complete F6 stage with 'completed' status" 
                : "Products will appear here once they complete F6 stage with 'completed' status"
        }
        className="w-full"
      />


      {/* Delete Confirmation Modal - Only show for regular inventory, not finished production or sent goods */}
      {!isFinishedProduction && inventoryType !== 'sentGoods' && (
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

      {/* Inventory Details Modal */}
      <InventoryDetailsModal
        isOpen={showInventoryModal}
        onClose={() => setShowInventoryModal(false)}
        inventoryItem={selectedInventory}
        onEdit={!isFinishedProduction ? onEditInventory : null}
        onDelete={!isFinishedProduction ? handleDeleteInventory : null}
        isFinishedProduction={isFinishedProduction}
      />

      {/* Payment Status Modal */}
      {showPaymentStatusModal && rawMaterialAccount && (
        <PaymentStatusModal
          isOpen={showPaymentStatusModal}
          onClose={() => {
            setShowPaymentStatusModal(false);
            setSelectedRawMaterial(null);
            setRawMaterialAccount(null);
          }}
          rawMaterial={selectedRawMaterial}
          account={rawMaterialAccount}
          onUpdate={async (paymentStatus, paymentSource, bankAccountIndex) => {
            try {
              await dispatch(updateAccountPaymentStatus({
                accountId: rawMaterialAccount._id,
                paymentStatus,
                paymentSource,
                bankAccountIndex
              })).unwrap();
              dispatch(addNotification({
                type: 'success',
                message: 'Payment status updated successfully'
              }));
              setShowPaymentStatusModal(false);
              setSelectedRawMaterial(null);
              setRawMaterialAccount(null);
              // Refresh inventory to show updated payment status
              if (onUpdateInventory) {
                onUpdateInventory();
              }
            } catch (error) {
              dispatch(addNotification({
                type: 'error',
                message: error?.message || 'Failed to update payment status'
              }));
            }
          }}
        />
      )}

      {/* Invoice Modal */}
      {showInvoiceModal && invoiceAccount && (
        <InvoiceModal
          isOpen={showInvoiceModal}
          onClose={() => {
            setShowInvoiceModal(false);
            setInvoiceAccount(null);
          }}
          account={invoiceAccount}
        />
      )}
    </div>
  );
};

// Invoice Modal Component
const InvoiceModal = ({ isOpen, onClose, account }) => {
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '₹0';
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const generateInvoice = () => {
    if (!account) return;

    const rawMaterial = account.rawMaterialId || {};
    const branch = account.branchId || {};
    
    // Create invoice data
    const invoiceData = {
      invoiceNumber: account.invoiceNumber || account.accountId || `INV-${account._id}`,
      date: formatDate(account.transactionDate),
      accountId: account.accountId || 'N/A',
      item: {
        id: rawMaterial.materialId || rawMaterial._id || 'N/A',
        name: rawMaterial.materialName || 'N/A',
        category: rawMaterial.category || 'N/A',
        quantity: account.quantity || 0,
        unitPrice: account.unitPrice || 0,
        gstPercentage: account.gstPercentage || 0,
        totalPrice: account.totalAmount || 0
      },
      supplier: {
        name: account.vendorName || 'N/A',
        id: account.supplierId || 'N/A'
      },
      company: {
        name: 'HerbNas Ayurveda',
        address: branch.branchName === 'Head Office' ? 'Head Office Address' : (branch.branchAddress || '123 Ayurveda Street, Health City, India - 123456'),
        gstNumber: '29ABCDE1234F1Z5',
        phone: '+91 9876543210',
        email: 'info@herbnas.com'
      },
      payment: {
        method: account.paymentMethod || 'N/A',
        status: account.paymentStatus || 'N/A',
        date: formatDate(account.transactionDate)
      }
    };

    // Calculate totals
    const subtotal = invoiceData.item.quantity * invoiceData.item.unitPrice;
    const gstAmount = account.gstAmount || (subtotal * invoiceData.item.gstPercentage) / 100;
    const total = account.amount || (subtotal + gstAmount);

    // Create invoice HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Purchase Invoice - ${invoiceData.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
          .invoice-container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 20px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 5px; }
          .company-details { color: #6b7280; font-size: 14px; }
          .invoice-title { font-size: 24px; font-weight: bold; color: #1f2937; margin-bottom: 20px; text-align: center; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details, .supplier-details { flex: 1; }
          .section-title { font-size: 16px; font-weight: bold; color: #374151; margin-bottom: 10px; }
          .detail-row { margin-bottom: 5px; color: #6b7280; }
          .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          .items-table th, .items-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e5e7eb; }
          .items-table th { background-color: #f9fafb; font-weight: bold; color: #374151; }
          .items-table td { color: #6b7280; }
          .items-table td.text-right { text-align: right; }
          .totals { text-align: right; }
          .total-row { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
          .total-label { font-weight: bold; color: #374151; }
          .total-amount { font-weight: bold; color: #1f2937; }
          .grand-total { border-top: 2px solid #e5e7eb; padding-top: 10px; font-size: 18px; }
          .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px; }
          .payment-info { margin-top: 20px; padding: 15px; background-color: #f9fafb; border-radius: 5px; }
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
          
          <div class="invoice-title">Raw Material Purchase Invoice</div>
          
          <div class="invoice-info">
            <div class="invoice-details">
              <div class="section-title">Invoice Details</div>
              <div class="detail-row"><strong>Invoice Number:</strong> ${invoiceData.invoiceNumber}</div>
              <div class="detail-row"><strong>Account ID:</strong> ${invoiceData.accountId}</div>
              <div class="detail-row"><strong>Date:</strong> ${invoiceData.date}</div>
            </div>
            <div class="supplier-details">
              <div class="section-title">Supplier Details</div>
              <div class="detail-row"><strong>Name:</strong> ${invoiceData.supplier.name}</div>
              <div class="detail-row"><strong>ID:</strong> ${invoiceData.supplier.id}</div>
            </div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item ID</th>
                <th>Description</th>
                <th>Category</th>
                <th>Quantity</th>
                <th class="text-right">Unit Price</th>
                <th class="text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${invoiceData.item.id}</td>
                <td>${invoiceData.item.name}</td>
                <td>${invoiceData.item.category}</td>
                <td>${invoiceData.item.quantity}</td>
                <td class="text-right">${formatCurrency(invoiceData.item.unitPrice)}</td>
                <td class="text-right">${formatCurrency(subtotal)}</td>
              </tr>
            </tbody>
          </table>
          
          <div class="totals">
            <div class="total-row">
              <span class="total-label">Subtotal:</span>
              <span class="total-amount">${formatCurrency(subtotal)}</span>
            </div>
            <div class="total-row">
              <span class="total-label">GST (${invoiceData.item.gstPercentage}%):</span>
              <span class="total-amount">${formatCurrency(gstAmount)}</span>
            </div>
            <div class="total-row grand-total">
              <span class="total-label">Total Amount:</span>
              <span class="total-amount">${formatCurrency(total)}</span>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="section-title">Payment Information</div>
            <div class="detail-row"><strong>Payment Method:</strong> ${invoiceData.payment.method}</div>
            <div class="detail-row"><strong>Payment Status:</strong> ${invoiceData.payment.status}</div>
            <div class="detail-row"><strong>Transaction Date:</strong> ${invoiceData.payment.date}</div>
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
    const invoiceWindow = window.open('', '_blank', 'width=900,height=700,scrollbars=yes,resizable=yes');
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
    
    // Focus the new window
    invoiceWindow.focus();
  };

  if (!account) return null;

  const rawMaterial = account.rawMaterialId || {};
  const branch = account.branchId || {};

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Purchase Invoice"
      subtitle={`Raw Material: ${rawMaterial.materialName || 'N/A'}`}
      icon={HiDocumentArrowDown}
      iconColor="from-blue-500 to-blue-600"
      size="lg"
      showFooter={true}
      footerContent={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
          >
            Close
          </Button>
          <Button
            variant="primary"
            onClick={generateInvoice}
            size="sm"
            icon={HiDocumentArrowDown}
          >
            Generate Invoice PDF
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Invoice Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Invoice Information</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Invoice Number</label>
                <p className="text-sm font-medium text-gray-900">
                  {account.invoiceNumber || account.accountId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Account ID</label>
                <p className="text-sm font-medium text-gray-900">
                  {account.accountId || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Date</label>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(account.transactionDate)}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Supplier Information</h3>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-gray-500">Supplier Name</label>
                <p className="text-sm font-medium text-gray-900">
                  {account.vendorName || 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-xs text-gray-500">Supplier ID</label>
                <p className="text-sm font-medium text-gray-900">
                  {account.supplierId || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Item Details */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Item Details</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Material Name</label>
              <p className="text-sm font-medium text-gray-900">
                {rawMaterial.materialName || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Category</label>
              <p className="text-sm font-medium text-gray-900">
                {rawMaterial.category || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Quantity</label>
              <p className="text-sm font-medium text-gray-900">
                {account.quantity || 0}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Unit Price</label>
              <p className="text-sm font-medium text-gray-900">
                ₹{(account.unitPrice || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">GST %</label>
              <p className="text-sm font-medium text-gray-900">
                {account.gstPercentage || 0}%
              </p>
            </div>
          </div>
        </div>

        {/* Amount Details */}
        <div className="border-b pb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Amount Details</h3>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal:</span>
              <span className="text-sm font-medium text-gray-900">
                ₹{(account.totalAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">GST Amount:</span>
              <span className="text-sm font-medium text-gray-900">
                ₹{(account.gstAmount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t">
              <span className="text-base font-semibold text-gray-900">Total Amount:</span>
              <span className="text-base font-bold text-gray-900">
                ₹{(account.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Payment Information</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Payment Method</label>
              <p className="text-sm font-medium text-gray-900">
                {account.paymentMethod || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Status</label>
              <StatusBadge
                status={account.paymentStatus || 'N/A'}
                color={
                  account.paymentStatus === 'completed' ? 'green' :
                  account.paymentStatus === 'pending' ? 'yellow' :
                  account.paymentStatus === 'failed' ? 'red' : 'gray'
                }
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Transaction Date</label>
              <p className="text-sm font-medium text-gray-900">
                {formatDate(account.transactionDate)}
              </p>
            </div>
          </div>
        </div>
      </div>
    </CommonModal>
  );
};

// Payment Status Modal Component
const PaymentStatusModal = ({ isOpen, onClose, rawMaterial, account, onUpdate }) => {
  const dispatch = useDispatch();
  const [paymentStatus, setPaymentStatus] = React.useState(account?.paymentStatus || 'pending');
  const [paymentSource, setPaymentSource] = React.useState('ready_cash');
  const [bankAccountIndex, setBankAccountIndex] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (account) {
      setPaymentStatus(account.paymentStatus || 'pending');
    }
  }, [account]);

  // Get branch data - handle both populated object and ID
  const branch = account?.branchId;
  const branchName = typeof branch === 'object' ? branch?.branchName : null;
  const branchIdValue = typeof branch === 'object' ? branch?._id : branch;
  
  // Check if it's Head Office
  const isHeadOffice = branchName && branchName.toLowerCase() === 'head office';
  
  // Get bank accounts - handle both populated object and array
  const bankAccounts = isHeadOffice && branch && typeof branch === 'object' && Array.isArray(branch.bankAccounts) 
    ? branch.bankAccounts 
    : [];

  const bankAccountOptions = bankAccounts.map((acc, index) => ({
    value: String(index),
    label: `${acc.bankName || 'Bank'} - ${acc.bankAccountNumber || 'N/A'} (Balance: ₹${(acc.accountBalance || 0).toLocaleString()})`
  }));

  // Get ready cash amount
  const readyCashAmount = isHeadOffice && branch && typeof branch === 'object' 
    ? (branch.readyCashAmount || 0) 
    : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate bank account selection if payment source is bank account
    if (paymentStatus === 'completed' && paymentSource === 'bank_account' && !bankAccountIndex) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please select a bank account'
      }));
      return;
    }
    
    // Validate payment source is provided for Head Office when status is completed
    if (paymentStatus === 'completed' && isHeadOffice && !paymentSource) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please select a payment source'
      }));
      return;
    }
    
    setLoading(true);
    await onUpdate(paymentStatus, paymentSource, bankAccountIndex);
    setLoading(false);
  };

  const isAlreadyCompleted = account?.paymentStatus === 'completed';

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Payment Status"
      subtitle={`Raw Material: ${rawMaterial?.set || rawMaterial?.materialName || 'N/A'}`}
      icon={HiCreditCard}
      iconColor="from-blue-500 to-blue-600"
      size="lg"
      showFooter={true}
      footerContent={
        <div className="flex space-x-2">
          <Button
            variant="outline"
            onClick={onClose}
            size="sm"
          >
            Cancel
          </Button>
          {isAlreadyCompleted && paymentStatus === 'completed' ? (
            <Button
              variant="primary"
              size="sm"
              disabled={true}
              className="bg-green-600 hover:bg-green-600 cursor-not-allowed"
            >
              Payment Completed
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              size="sm"
              loading={loading}
              disabled={paymentStatus === 'completed' && !paymentSource && isHeadOffice}
            >
              Update Status
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-6">
        {/* Payment Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Status *
          </label>
          <Select
            value={paymentStatus}
            onChange={(e) => setPaymentStatus(e.target.value)}
            disabled={isAlreadyCompleted && paymentStatus === 'completed'}
            options={[
              { value: 'pending', label: 'Pending' },
              { value: 'completed', label: 'Completed' },
              { value: 'failed', label: 'Failed' },
              { value: 'refunded', label: 'Refunded' }
            ]}
          />
        </div>

        {/* Payment Source (only for Head Office and when status is completed, but not if already paid) */}
        {isHeadOffice && paymentStatus === 'completed' && !isAlreadyCompleted && (
          <div className="space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Payment Source *
              </label>
              <Select
                value={paymentSource}
                onChange={(e) => {
                  const value = e.target.value;
                  setPaymentSource(value);
                  if (value !== 'bank_account') {
                    setBankAccountIndex('');
                  }
                }}
                options={[
                  { value: 'ready_cash', label: `Ready Cash (Balance: ₹${readyCashAmount.toLocaleString()})` },
                  ...(bankAccountOptions.length > 0 ? [{ value: 'bank_account', label: 'Bank Account' }] : [])
                ]}
              />
              <p className="mt-1 text-xs text-gray-500">
                Select from which account the amount should be deducted
              </p>
            </div>

            {paymentSource === 'bank_account' && bankAccountOptions.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Bank Account *
                </label>
                <Select
                  value={bankAccountIndex}
                  onChange={(e) => setBankAccountIndex(e.target.value)}
                  options={bankAccountOptions}
                  placeholder="Select Bank Account"
                />
              </div>
            )}
          </div>
        )}

        {/* Account Details */}
        <div className="border-t pt-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Account Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-gray-500">Amount</label>
              <p className="text-sm font-medium text-gray-900">
                ₹{account?.amount?.toLocaleString() || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Payment Method</label>
              <p className="text-sm font-medium text-gray-900">
                {account?.paymentMethod || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Invoice Number</label>
              <p className="text-sm font-medium text-gray-900">
                {account?.invoiceNumber || 'N/A'}
              </p>
            </div>
            <div>
              <label className="text-xs text-gray-500">Supplier</label>
              <p className="text-sm font-medium text-gray-900">
                {account?.vendorName || 'N/A'}
              </p>
            </div>
          </div>

          {/* Branch Details */}
          {isHeadOffice && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="text-sm font-semibold text-gray-900 mb-2">Head Office Accounts</h4>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Ready Cash:</span>
                  <span className="text-sm font-medium text-gray-900">
                    ₹{readyCashAmount.toLocaleString()}
                  </span>
                </div>
                {bankAccounts.length > 0 && (
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Bank Accounts:</span>
                    <div className="mt-1 space-y-1">
                      {bankAccounts.map((acc, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <span className="text-gray-600">
                            {acc.bankName || 'Bank'} - {acc.bankAccountNumber || 'N/A'}
                          </span>
                          <span className="font-medium text-gray-900">
                            ₹{(acc.accountBalance || 0).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Debug info - show if not Head Office but payment status is completed */}
          {paymentStatus === 'completed' && !isHeadOffice && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-500 italic">
                Note: Payment source selection is only available for Head Office raw material purchases.
                {branchName && ` Current branch: ${branchName}`}
              </p>
            </div>
          )}
        </div>
      </div>
    </CommonModal>
  );
};

export default InventoryCRUD;
