import React from 'react';
import {
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import Button from './Button';

const ProductDetailsModal = ({ 
  isOpen, 
  onClose, 
  product, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !product) return null;

  // Layout: Additional Info (left) | Basic Info (right)

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Product Name',
        value: product.productName || 'N/A'
      },
      {
        label: 'Category',
        value: product.category || 'N/A'
      },
      {
        label: 'Unit of Measure',
        value: product.UOM || 'N/A'
      },
      {
        label: 'Price',
        value: formatPrice(product.price),
        type: 'price'
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Description',
        value: product.description || 'No description available'
      },
      {
        label: 'Status',
        value: product.isActive ? 'Active' : 'Inactive',
        type: 'status'
      },
      {
        label: 'Created Date',
        value: formatDate(product.createdAt)
      },
      {
        label: 'Last Updated',
        value: formatDate(product.updatedAt)
      }
    ]
  };

  const footerContent = (
    <>
      <Button
        onClick={onClose}
        variant="outline"
        className="px-4 py-2"
      >
        Close
      </Button>
      {onEdit && (
        <Button
          onClick={() => onEdit(product)}
          variant="primary"
          icon={HiPencil}
          className="px-4 py-2"
        >
          Edit Product
        </Button>
      )}
      {onDelete && (
        <Button
          onClick={() => onDelete(product)}
          variant="danger"
          icon={HiTrash}
          className="px-4 py-2"
        >
          Delete Product
        </Button>
      )}
    </>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      subtitle={product.productId}
      size="xl"
      showFooter={true}
      footerContent={footerContent}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <DetailsView sections={[basicInfo]} />
        </div>
        <div>
          <DetailsView sections={[additionalInfo]} />
        </div>
      </div>
    </CommonModal>
  );
};

export default ProductDetailsModal;