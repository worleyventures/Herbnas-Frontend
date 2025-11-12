import React from 'react';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';

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
      },
      {
        label: 'Incentive',
        value: formatPrice(product.incentive),
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

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Product Details"
      subtitle={product.productId}
      size="lg"
      showFooter={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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