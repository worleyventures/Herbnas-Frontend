import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HiEye,
  HiPencil,
  HiTrash,
  HiDocumentText,
  HiCurrencyDollar,
  HiCube
} from 'react-icons/hi2';
import { Table, ActionButton, ConfirmationModal } from '../../common';
import { ProductDetailsModal } from '../../common';

const ProductCRUD = ({
  products,
  loading,
  onSelectProduct,
  onEditProduct,
  onDeleteProduct,
  onUpdateProduct,
  onDeleteConfirm,
  showDeleteModal,
  selectedProduct,
  setShowDeleteModal
}) => {
  const navigate = useNavigate();
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // Handle view product
  const handleView = (product) => {
    onSelectProduct(product);
    setShowDetailsModal(true);
  };

  // Handle edit product
  const handleEditClick = (product) => {
    navigate(`/products/edit/${product._id}`, { 
      state: { 
        product,
        returnTo: '/products'
      }
    });
  };

  // Handle delete
  const handleDelete = (product) => {
    onSelectProduct(product);
    setShowDeleteModal(true);
  };


  // Table columns for table view
  const columns = useMemo(() => [
    {
      key: 'name',
      label: 'Product Name',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-[#22c55e]/10 to-[#16a34a]/10 flex items-center justify-center">
            <HiDocumentText className="h-5 w-5 text-[#22c55e]" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-gray-900 truncate">{product.productName || 'No Name'}</div>
          </div>
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
      key: 'branchStock',
      label: 'Branch Stock',
      sortable: true,
      render: (product) => (
        <div className="flex items-center space-x-1">
          <HiCube className="h-4 w-4 text-gray-400" />
          <span className={`font-medium ${product.branchStock <= 10 ? 'text-red-600' : product.branchStock <= 50 ? 'text-yellow-600' : 'text-green-600'}`}>
            {product.branchStock || 0}
          </span>
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
            onClick={() => handleView(product)}
            variant="view"
            size="sm"
            title="View Details"
          />
          <ActionButton
            icon={HiPencil}
            onClick={() => onEditProduct(product)}
            variant="edit"
            size="sm"
            title="Edit Product"
          />
          <ActionButton
            icon={HiTrash}
            onClick={() => handleDelete(product)}
            variant="delete"
            size="sm"
            title="Delete Product"
          />
        </div>
      )
    }
  ], []);


  return (
    <>
      <Table
        data={products}
        columns={columns}
        loading={loading}
        emptyMessage="No products found"
        emptyIcon={HiDocumentText}
        onRowClick={onSelectProduct}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        product={selectedProduct}
        onEdit={onEditProduct}
        onDelete={handleDelete}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDeleteConfirm}
        title="Delete Product"
        message={
          selectedProduct ? (
            `Are you sure you want to delete "${selectedProduct.name}"? This action cannot be undone.`
          ) : (
            'Are you sure you want to delete this product? This action cannot be undone.'
          )
        }
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
      />
    </>
  );
};

export default ProductCRUD;
