import React, { useState, useMemo } from 'react';
import {
  HiEye,
  HiPencil,
  HiTrash,
  HiCog6Tooth,
  HiCheckCircle,
  HiClock,
  HiExclamationTriangle,
  HiPause,
  HiPlay,
  HiDocumentText,
  HiCurrencyDollar,
  HiCube,
  HiAdjustmentsHorizontal
} from 'react-icons/hi2';
import { Table, ActionButton, Modal, Button, Select, Input } from '../../common';

const StageManagement = ({
  products = [],
  stages = [],
  statuses = [],
  onProductSelect,
  onEditProduct,
  onDeleteProduct,
  onStageUpdate,
  loading = false,
  isOpen = false,
  onClose = null,
  product = null
}) => {
  const [selectedStage, setSelectedStage] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [notes, setNotes] = useState('');
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter products based on stage
  const filteredProducts = useMemo(() => {
    if (!selectedStage) return products;
    return products.filter(product => product.productionStage === selectedStage);
  }, [products, selectedStage]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'in-process':
        return <HiPlay className="h-4 w-4 text-blue-500" />;
      case 'on-hold':
        return <HiPause className="h-4 w-4 text-yellow-500" />;
      case 'completed':
        return <HiCheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <HiClock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'in-process':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'on-hold':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStageColor = (stage) => {
    const stageConfig = stages.find(s => s.id === stage);
    return stageConfig?.color || 'bg-gray-500';
  };

  const handleStageUpdate = (product) => {
    setSelectedProduct(product);
    setSelectedStage(product.productionStage);
    setSelectedStatus(product.productionStatus);
    setNotes('');
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = () => {
    if (selectedProduct && selectedStage && selectedStatus) {
      onStageUpdate(selectedProduct._id, selectedStage, selectedStatus, notes);
      setShowUpdateModal(false);
      setSelectedProduct(null);
      setSelectedStage('');
      setSelectedStatus('');
      setNotes('');
    }
  };

  const handleClose = () => {
    setShowUpdateModal(false);
    setSelectedProduct(null);
    setSelectedStage('');
    setSelectedStatus('');
    setNotes('');
    if (onClose) onClose();
  };

  // Table columns
  const columns = useMemo(() => [
    {
      key: 'productName',
      label: 'Product Name',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 flex items-center justify-center">
            <HiDocumentText className="h-5 w-5 text-blue-600" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 truncate">{product.productName}</div>
            <div className="text-sm text-gray-500">Batch: {product.batchNumber}</div>
          </div>
        </div>
      )
    },
    {
      key: 'productionStage',
      label: 'Current Stage',
      sortable: true,
      render: (product) => {
        const stageConfig = stages.find(s => s.id === product.productionStage);
        return (
          <div className="flex items-center space-x-2">
            <div className={`w-6 h-6 ${getStageColor(product.productionStage)} rounded flex items-center justify-center`}>
              {stageConfig?.icon ? React.createElement(stageConfig.icon, { className: "h-3 w-3 text-white" }) : <HiCog6Tooth className="h-3 w-3 text-white" />}
            </div>
            <span className="font-medium">{product.productionStage}</span>
          </div>
        );
      }
    },
    {
      key: 'productionStatus',
      label: 'Status',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(product.productionStatus)}
          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(product.productionStatus)}`}>
            {product.productionStatus?.replace('-', ' ') || 'Unknown'}
          </span>
        </div>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-1">
          <HiCurrencyDollar className="h-4 w-4 text-gray-400" />
          <span className="font-medium">₹{product.price?.toLocaleString() || '0'}</span>
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-1">
          <HiCube className="h-4 w-4 text-gray-400" />
          <span className="font-medium">{product.quantity || 0}</span>
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (product) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={HiEye}
            onClick={(e) => {
              e.stopPropagation();
              onProductSelect(product);
            }}
            variant="view"
            size="sm"
            title="View Details"
          />
          <ActionButton
            icon={HiPencil}
            onClick={(e) => {
              e.stopPropagation();
              onEditProduct && onEditProduct(product);
            }}
            variant="edit"
            size="sm"
            title="Edit Product"
          />
          <ActionButton
            icon={HiTrash}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteProduct && onDeleteProduct(product);
            }}
            variant="delete"
            size="sm"
            title="Delete Product"
          />
        </div>
      )
    }
  ], [stages, statuses, onProductSelect, onEditProduct, onDeleteProduct]);

  // If this is a modal for single product
  if (isOpen && product) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={handleClose}
        title="Update Production Stage"
        size="sm"
      >
        <div className="space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">{product.productName}</h3>
            <p className="text-sm text-gray-600">Batch: {product.batchNumber}</p>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <div className={`w-6 h-6 ${getStageColor(product.productionStage)} rounded flex items-center justify-center`}>
                  <HiCog6Tooth className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium">Current: {product.productionStage}</span>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(product.productionStatus)}
                <span className="text-sm font-medium">{product.productionStatus?.replace('-', ' ')}</span>
              </div>
            </div>
          </div>

          {/* Update Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Production Stage"
              value={selectedStage}
              onChange={(value) => setSelectedStage(value)}
              options={stages.map(stage => ({
                value: stage.id,
                label: `${stage.id} - ${stage.name}`
              }))}
              placeholder="Select stage"
            />
            
            <Select
              label="Production Status"
              value={selectedStatus}
              onChange={(value) => setSelectedStatus(value)}
              options={statuses.map(status => ({
                value: status.id,
                label: status.name
              }))}
              placeholder="Select status"
            />
          </div>

          <Input
            label="Notes (Optional)"
            value={notes}
            onChange={(value) => setNotes(value)}
            placeholder="Add notes about the stage update..."
            type="textarea"
            rows={3}
          />

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="gradient"
              onClick={handleUpdateSubmit}
              disabled={!selectedStage || !selectedStatus}
            >
              Update Stage
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  // Main table view
  return (
    <div className="p-6">

      <Table
        data={filteredProducts}
        columns={columns}
        loading={loading}
        emptyMessage="No products found"
        emptyIcon={HiDocumentText}
        onRowClick={onProductSelect}
      />

      {/* Update Stage Modal */}
      <Modal
        isOpen={showUpdateModal}
        onClose={handleClose}
        title="Update Production Stage"
        size="sm"
      >
        {selectedProduct && (
          <div className="space-y-6">
            {/* Product Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{selectedProduct.productName}</h3>
              <p className="text-sm text-gray-600">Batch: {selectedProduct.batchNumber}</p>
              <div className="flex items-center space-x-4 mt-2">
                <div className="flex items-center space-x-2">
                  <div className={`w-6 h-6 ${getStageColor(selectedProduct.productionStage)} rounded flex items-center justify-center`}>
                    <HiCog6Tooth className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-sm font-medium">Current: {selectedProduct.productionStage}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(selectedProduct.productionStatus)}
                  <span className="text-sm font-medium">{selectedProduct.productionStatus?.replace('-', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Update Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Production Stage"
                value={selectedStage}
                onChange={(value) => setSelectedStage(value)}
                options={stages.map(stage => ({
                  value: stage.id,
                  label: `${stage.id} - ${stage.name}`
                }))}
                placeholder="Select stage"
              />
              
              <Select
                label="Production Status"
                value={selectedStatus}
                onChange={(value) => setSelectedStatus(value)}
                options={statuses.map(status => ({
                  value: status.id,
                  label: status.name
                }))}
                placeholder="Select status"
              />
            </div>

            <Input
              label="Notes (Optional)"
              value={notes}
              onChange={(value) => setNotes(value)}
              placeholder="Add notes about the stage update..."
              type="textarea"
              rows={3}
            />

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="gradient"
                onClick={handleUpdateSubmit}
                disabled={!selectedStage || !selectedStatus}
              >
                Update Stage
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default StageManagement;
