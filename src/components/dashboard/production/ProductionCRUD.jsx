import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiCheckCircle, 
  HiXCircle,
  HiClock,
  HiExclamationTriangle,
  HiPlay,
  HiPause,
  HiCalendar,
  HiCube,
  HiTag
} from 'react-icons/hi2';
import { Table, ActionButton, StatusBadge, ConfirmationModal, ProductionDetailsModal } from '../../common';

const ProductionCRUD = ({
  productions,
  onSelectProduction,
  onEditProduction,
  onDeleteProduction,
  onUpdateProduction,
  onDeleteProductionConfirm,
  showDeleteModal,
  showDisableModal,
  showActivateModal,
  selectedProduction,
  setShowDeleteModal,
  setShowDisableModal,
  setShowActivateModal,
  loading,
  createLoading,
  updateLoading,
  deleteLoading,
}) => {
  const navigate = useNavigate();
  const [showProductionModal, setShowProductionModal] = useState(false);
  const { user } = useSelector((state) => state.auth);
  const isProductionManager = user?.role === 'production_manager';
  const isSuperAdmin = user?.role === 'super_admin';
  const canManageProduction = isProductionManager || isSuperAdmin;

  // Get status badge for production status
  const getProductionStatusBadge = (status) => {
    console.log('Production status:', status);
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
    console.log('QC status:', status);
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

  // Handle view production
  const handleViewProduction = (production) => {
    onSelectProduction(production);
    setShowProductionModal(true);
  };

  // Handle edit production
  const handleEditProduction = (production) => {
    onEditProduction(production);
  };

  // Handle delete production
  const handleDeleteProduction = (production) => {
    onDeleteProduction(production);
  };

  // Handle status toggle
  const handleToggleStatus = (production) => {
    const newStatus = production.isActive ? false : true;
    onUpdateProduction(production._id, { isActive: newStatus });
  };

  // Table columns
  const columns = [
    {
      key: 'batchId',
      label: 'Batch ID',
      render: (production) => (
        <div className="flex items-center space-x-2">
          <HiTag className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">{production.batchId}</span>
        </div>
      )
    },
    {
      key: 'product',
      label: 'Product',
      render: (production) => {
        console.log('Product data:', production.productId);
        return (
          <div>
            <p className="font-medium text-gray-900">
              {production.productId?.productName || 'N/A'}
            </p>
            <p className="text-sm text-gray-500">
              {production.productId?.category || 'No category'}
            </p>
          </div>
        );
      }
    },
    {
      key: 'manufacturedDate',
      label: 'Manufactured Date',
      render: (production) => (
        <div className="flex items-center space-x-2">
          <HiCalendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {production.manufacturedDate ? new Date(production.manufacturedDate).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'expiryDate',
      label: 'Expiry Date',
      render: (production) => (
        <div className="flex items-center space-x-2">
          <HiCalendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {production.expiryDate ? new Date(production.expiryDate).toLocaleDateString() : 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (production) => (
        <div className="flex items-center space-x-2">
          <HiCube className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">
            {production.quantity || 0} Kgs
          </span>
        </div>
      )
    },
    {
      key: 'productionStatus',
      label: 'Production Status',
      render: (production) => {
        console.log('Full production object:', production);
        console.log('Production status field:', production.productionStatus);
        return getProductionStatusBadge(production.productionStatus);
      }
    },
    {
      key: 'QCstatus',
      label: 'QC Status',
      render: (production) => {
        console.log('QC status field:', production.QCstatus);
        return getQCStatusBadge(production.QCstatus);
      }
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (production) => {
        console.log('Production isActive:', production.isActive);
        return (
          <StatusBadge
            status={production.isActive ? 'active' : 'inactive'}
          />
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (production) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            onClick={() => handleViewProduction(production)}
            icon={HiEye}
            title="View Details"
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          />
          {canManageProduction && (
            <>
              <ActionButton
                onClick={() => handleEditProduction(production)}
                icon={HiPencil}
                title="Edit Production"
                className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
              />
              <ActionButton
                onClick={() => handleDeleteProduction(production)}
                icon={HiTrash}
                title="Delete Production"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              />
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <>
      <Table
        data={productions}
        columns={columns}
        loading={loading}
        emptyMessage="No production batches found. Click 'Add Production Batch' to create one."
        className="min-h-[400px]"
      />

      {/* Production Details Modal */}
      <ProductionDetailsModal
        isOpen={showProductionModal}
        onClose={() => setShowProductionModal(false)}
        production={selectedProduction}
        onEdit={handleEditProduction}
        onDelete={handleDeleteProduction}
      />
    </>
  );
};

export default ProductionCRUD;


