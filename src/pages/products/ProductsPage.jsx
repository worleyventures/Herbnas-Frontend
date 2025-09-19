import React, { useState } from 'react';
import { HiDocumentText, HiPlus } from 'react-icons/hi2';
import { PageHeader } from '../../components/layout';
import { Button } from '../../components/common';
import ProductsDashboard from '../../components/dashboard/ProductsDashboard';

const ProductsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreateProduct = () => {
    setShowCreateModal(true);
  };

  return (
    <div className="space-y-6">
      
      <ProductsDashboard 
        showCreateModal={showCreateModal}
        setShowCreateModal={setShowCreateModal}
      />
    </div>
  );
};

export default ProductsPage;
