import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiShoppingBag,
  HiTag,
  HiCurrencyRupee,
  HiScale,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi2';
import { Table, ActionButton, StatusBadge, ConfirmationModal, ProductDetailsModal } from '../../common';

const ProductCRUD = ({ 
  products, 
  onSelectProduct, 
  onEditProduct, 
  onDeleteProduct, 
  onCreateProduct, 
  onUpdateProduct, 
  onDeleteProductConfirm,
  onToggleStatus,
  showDeleteModal,
  showDisableModal,
  showActivateModal,
  selectedProduct,
  setShowDeleteModal,
  setShowDisableModal,
  setShowActivateModal,
  loading,
  createLoading,
  updateLoading,
  deleteLoading
}) => {
  const navigate = useNavigate();
  const [showProductModal, setShowProductModal] = useState(false);
  
  const dispatch = useDispatch();
  
  // Get users for createdBy/updatedBy display
  const users = useSelector((state) => state.user?.users || []);
  
  // Get user from auth state
  const { user } = useSelector((state) => state.auth);
  
  // Find user names by ID
  const findUserName = (userId) => {
    if (!userId) return 'Unknown';
    const foundUser = users.find(u => u._id === userId);
    return foundUser ? `${foundUser.firstName} ${foundUser.lastName}` : 'Unknown';
  };

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'productId',
      label: 'Product ID',
      sortable: true,
      render: (product) => (
        <div className="text-sm">
          <div className="font-medium text-gray-900">{product.productId}</div>
        </div>
      )
    },
    {
      key: 'productName',
      label: 'Product Name',
      sortable: true,
      render: (product) => (
        <div className="min-w-0 flex-1">
          <div className="font-semibold text-gray-900 truncate">{product.productName || 'No Name'}</div>
          <div className="text-sm text-gray-500 truncate">{product.description || 'No description'}</div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (product) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {product.category || 'N/A'}
        </span>
      )
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-1">
          <span className="font-medium text-gray-900">₹{product.price?.toLocaleString() || '0'}</span>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (product) => (
        <StatusBadge 
          status={product.isActive ? 'active' : 'inactive'}
          text={product.isActive ? 'Active' : 'Inactive'}
        />
      )
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      render: (product) => (
        <div className="text-sm text-gray-500">
          {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A'}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (product) => (
        <div className="flex items-center space-x-1">
          <ActionButton
            icon={HiEye}
            onClick={() => handleViewProduct(product)}
            variant="view"
            title="View Product"
          />
          <ActionButton
            icon={HiPencil}
            onClick={() => handleEditProduct(product)}
            variant="edit"
            title="Edit Product"
          />
          <ActionButton
            icon={product.isActive ? HiXCircle : HiCheckCircle}
            onClick={() => handleToggleStatus(product)}
            variant={product.isActive ? "warning" : "success"}
            title={product.isActive ? "Deactivate Product" : "Activate Product"}
          />
          <ActionButton
            icon={HiTrash}
            onClick={() => handleDeleteProduct(product)}
            variant="delete"
            title="Delete Product"
          />
        </div>
      )
    }
  ], [users]);

  // Handle view product
  const handleViewProduct = (product) => {
    onSelectProduct(product);
    setShowProductModal(true);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    onEditProduct(product);
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    onSelectProduct(product);
    setShowDeleteModal(true);
  };

  // Handle toggle status
  const handleToggleStatus = (product) => {
    onSelectProduct(product);
    if (product.isActive) {
      setShowDisableModal(true);
    } else {
      setShowActivateModal(true);
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      onDeleteProductConfirm(selectedProduct._id);
      setShowDeleteModal(false);
    }
  };

  // Handle status toggle confirmation
  const handleStatusToggleConfirm = (isActivating) => {
    if (selectedProduct) {
      onToggleStatus(selectedProduct._id, isActivating);
      setShowDisableModal(false);
      setShowActivateModal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Products Table */}
      <div className="bg-white rounded-lg">
        <div className="p-6">
          <Table
            data={products}
            columns={columns}
            loading={loading}
            emptyMessage="No products found"
            emptyStateIcon={HiShoppingBag}
            emptyStateTitle="No Products"
            emptyStateDescription="No products have been created yet"
          />
        </div>
      </div>

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={showProductModal}
        onClose={() => setShowProductModal(false)}
        product={selectedProduct}
        onEdit={handleEditProduct}
        onDelete={handleDeleteProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Product"
        message={`Are you sure you want to delete "${selectedProduct?.productName}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Disable Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={() => handleStatusToggleConfirm(false)}
        title="Deactivate Product"
        message={`Are you sure you want to deactivate "${selectedProduct?.productName}"?`}
        confirmText="Deactivate"
        cancelText="Cancel"
        variant="warning"
        loading={updateLoading}
      />

      {/* Activate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={() => handleStatusToggleConfirm(true)}
        title="Activate Product"
        message={`Are you sure you want to activate "${selectedProduct?.productName}"?`}
        confirmText="Activate"
        cancelText="Cancel"
        variant="success"
        loading={updateLoading}
      />
    </div>
  );
};

export default ProductCRUD;