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

  // Get status badge for production status
  const getProductionStatusBadge = (status) => {
    const statusConfig = {
      'in-progress': { 
        color: 'bg-blue-100 text-blue-800', 
        icon: HiPlay, 
        label: 'In Progress' 
      },
      'on-hold': { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: HiPause, 
        label: 'On Hold' 
      },
      'completed': { 
        color: 'bg-green-100 text-green-800', 
        icon: HiCheckCircle, 
        label: 'Completed' 
      }
    };
    
    const config = statusConfig[status] || statusConfig['in-progress'];
    return (
      <StatusBadge
        color={config.color}
        icon={config.icon}
        label={config.label}
      />
    );
  };

  // Get status badge for QC status
  const getQCStatusBadge = (status) => {
    const statusConfig = {
      'Pending': { 
        color: 'bg-yellow-100 text-yellow-800', 
        icon: HiClock, 
        label: 'Pending' 
      },
      'Approved': { 
        color: 'bg-green-100 text-green-800', 
        icon: HiCheckCircle, 
        label: 'Approved' 
      },
      'Rejected': { 
        color: 'bg-red-100 text-red-800', 
        icon: HiExclamationTriangle, 
        label: 'Rejected' 
      }
    };
    
    const config = statusConfig[status] || statusConfig['Pending'];
    return (
      <StatusBadge
        color={config.color}
        icon={config.icon}
        label={config.label}
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
      render: (production) => (
        <div>
          <p className="font-medium text-gray-900">
            {production.product?.productName || 'N/A'}
          </p>
          <p className="text-sm text-gray-500">
            {production.product?.category || 'No category'}
          </p>
        </div>
      )
    },
    {
      key: 'manufacturedDate',
      label: 'Manufactured Date',
      render: (production) => (
        <div className="flex items-center space-x-2">
          <HiCalendar className="h-4 w-4 text-gray-400" />
          <span className="text-sm text-gray-900">
            {new Date(production.manufacturedDate).toLocaleDateString()}
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
            {production.quantity} {production.product?.UOM || 'units'}
          </span>
        </div>
      )
    },
    {
      key: 'productionStatus',
      label: 'Production Status',
      render: (production) => getProductionStatusBadge(production.productionStatus)
    },
    {
      key: 'QCstatus',
      label: 'QC Status',
      render: (production) => getQCStatusBadge(production.QCstatus)
    },
    {
      key: 'isActive',
      label: 'Status',
      render: (production) => (
        <StatusBadge
          color={production.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
          icon={production.isActive ? HiCheckCircle : HiXCircle}
          label={production.isActive ? 'Active' : 'Inactive'}
        />
      )
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
