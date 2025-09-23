import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiCog6Tooth,
  HiClock,
  HiCheckCircle,
  HiExclamationTriangle,
  HiPause,
  HiPlay,
  HiCube,
  HiDocumentText,
  HiMagnifyingGlass,
  HiTag,
  HiBuildingOffice2,
  HiCurrencyDollar,
  HiTrash,
  HiPencil
} from 'react-icons/hi2';
import { StatCard, Button, SearchInput, Select, Pagination, ConfirmationModal, Table } from '../../common';
import { getAllProducts, deleteProduct } from '../../../redux/actions/productActions';
import {
  getProductsByStage,
  getProductionStats,
  updateProductionStage,
  moveToInventory
} from '../../../redux/actions/productionActions';
import { addNotification } from '../../../redux/slices/uiSlice';
import StageManagement from './StageManagement';

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('products');
  const [activeView, setActiveView] = useState('stages');
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // By-products state
  const [byProducts, setByProducts] = useState([]);
  const [byProductLoading, setByProductLoading] = useState(false);
  const [selectedByProduct, setSelectedByProduct] = useState(null);
  const [showByProductDeleteModal, setShowByProductDeleteModal] = useState(false);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    products = [],
    loading = false,
    error = null,
    productionStats = null,
    statsLoading = false
  } = useSelector((state) => state.products);

  // Production stages configuration
  const stages = [
    { id: 'F1', name: 'Raw Material Preparation', color: 'bg-blue-500', icon: HiDocumentText },
    { id: 'F2', name: 'Initial Processing', color: 'bg-indigo-500', icon: HiCog6Tooth },
    { id: 'F3', name: 'Formulation', color: 'bg-purple-500', icon: HiCog6Tooth },
    { id: 'F4', name: 'Quality Control', color: 'bg-yellow-500', icon: HiCheckCircle },
    { id: 'F5', name: 'Packaging', color: 'bg-orange-500', icon: HiCube },
    { id: 'F6', name: 'Final Inspection', color: 'bg-green-500', icon: HiCheckCircle }
  ];

  const statuses = [
    { id: 'in-process', name: 'In Process', color: 'bg-blue-500', icon: HiPlay },
    { id: 'on-hold', name: 'On Hold', color: 'bg-yellow-500', icon: HiPause },
    { id: 'completed', name: 'Completed', color: 'bg-green-500', icon: HiCheckCircle }
  ];

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllProducts({ isActive: true }));
      dispatch(getProductionStats());
    }
  }, [dispatch, isAuthenticated]);

  // Load products by stage when stage filter changes
  useEffect(() => {
    if (selectedStage !== 'all') {
      dispatch(getProductsByStage({ 
        stage: selectedStage, 
        params: { 
          page: currentPage, 
          limit: itemsPerPage, 
          search: searchTerm,
          isActive: true
        } 
      }));
    } else {
      dispatch(getAllProducts({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: searchTerm,
        isActive: true
      }));
    }
  }, [dispatch, selectedStage, currentPage, searchTerm]);

  // Calculate stats from products data
  const calculateStats = () => {
    const totalProducts = products.length;
    const inProcessCount = products.filter(p => p.productionStatus === 'in-process').length;
    const onHoldCount = products.filter(p => p.productionStatus === 'on-hold').length;
    const completedCount = products.filter(p => p.productionStatus === 'completed').length;
    
    // Stage distribution
    const stageDistribution = stages.map(stage => ({
      ...stage,
      count: products.filter(p => p.productionStage === stage.id).length
    }));

    return {
      total: totalProducts,
      inProcess: inProcessCount,
      onHold: onHoldCount,
      completed: completedCount,
      stageDistribution
    };
  };

  const stats = calculateStats();

  // Handle stage update
  const handleStageUpdate = (productId, newStage, newStatus, notes) => {
    dispatch(updateProductionStage({ 
      productId, 
      stage: newStage, 
      notes 
    })).then((result) => {
      if (result.type === 'products/updateProductionStage/fulfilled') {
        const responseData = result.payload.data || result.payload;
        
        // Check if product was moved to inventory for finished production
        if (responseData.inventoryCreated) {
          console.log('✅ Product moved to inventory for finished production');
          dispatch(addNotification({
            type: 'success',
            title: 'Production Finished',
            message: `Product production completed and moved to inventory`,
            duration: 5000
          }));
        } else if (responseData.inventoryError) {
          console.error('❌ Failed to move to inventory:', responseData.inventoryError);
          dispatch(addNotification({
            type: 'error',
            title: 'Inventory Move Failed',
            message: `Product stage updated but failed to move to inventory: ${responseData.inventoryError}`,
            duration: 5000
          }));
        }
        
        // Show general success notification
        dispatch(addNotification({
          type: 'success',
          title: 'Production Stage Updated',
          message: responseData.message || 'Production stage updated successfully',
          duration: 3000
        }));
        
        // Refresh data
        dispatch(getAllProducts({ isActive: true }));
        dispatch(getProductionStats());
      }
    });
  };

  // Handle product selection for stage management
  const handleProductSelect = (product) => {
    console.log('🔍 Navigating to view product:', product._id);
    navigate(`/production/view/${product._id}`);
  };

  // Handle create product
  const handleCreateProduct = () => {
    console.log('➕ Navigating to create product');
    navigate('/production/add');
  };

  // By-product form handlers
  const handleAddByProduct = () => {
    console.log('➕ Navigating to add by-product');
    navigate('/production/by-product/add');
  };

  // Load by-products from localStorage (temporary storage until backend integration)
  useEffect(() => {
    if (activeTab === 'by-products') {
      setByProductLoading(true);
      // Load from localStorage
      const storedByProducts = localStorage.getItem('byProducts');
      if (storedByProducts) {
        try {
          const parsedByProducts = JSON.parse(storedByProducts);
          // Convert date strings back to Date objects
          const byProductsWithDates = parsedByProducts.map(item => ({
            ...item,
            createdAt: new Date(item.createdAt),
            updatedAt: new Date(item.updatedAt)
          }));
          setByProducts(byProductsWithDates);
        } catch (error) {
          console.error('Error parsing stored by-products:', error);
          setByProducts([]);
        }
      } else {
        setByProducts([]);
      }
      setByProductLoading(false);
    }
  }, [activeTab]);

  // Listen for by-product additions from the form
  useEffect(() => {
    const handleByProductAdded = (event) => {
      if (event.detail && event.detail.type === 'byProductAdded') {
        const newByProduct = event.detail.byProduct;
        setByProducts(prev => [newByProduct, ...prev]);
      }
    };

    window.addEventListener('byProductAdded', handleByProductAdded);
    return () => {
      window.removeEventListener('byProductAdded', handleByProductAdded);
    };
  }, []);

  const handleEditByProduct = (byProduct) => {
    console.log('✏️ Edit by-product:', byProduct._id);
    // Navigate to edit page or open edit modal
  };

  const handleDeleteByProduct = (byProduct) => {
    console.log('🗑️ Opening delete modal for by-product:', byProduct._id);
    setSelectedByProduct(byProduct);
    setShowByProductDeleteModal(true);
  };

  const handleConfirmByProductDelete = () => {
    if (selectedByProduct) {
      console.log('🗑️ Confirming delete for by-product:', selectedByProduct._id);
      
      // Remove from localStorage
      const existingByProducts = JSON.parse(localStorage.getItem('byProducts') || '[]');
      const updatedByProducts = existingByProducts.filter(item => item._id !== selectedByProduct._id);
      localStorage.setItem('byProducts', JSON.stringify(updatedByProducts));
      
      // Update local state
      setByProducts(prev => prev.filter(item => item._id !== selectedByProduct._id));
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'By-product deleted successfully!',
        duration: 3000
      }));
      
      // Close modal
      setShowByProductDeleteModal(false);
      setSelectedByProduct(null);
    }
  };


  // Handle edit product
  const handleEditProduct = (product) => {
    console.log('✏️ Navigating to edit product:', product._id);
    navigate(`/production/edit/${product._id}`);
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    console.log('🗑️ Opening delete modal for product:', product._id);
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = () => {
    if (selectedProduct) {
      console.log('🗑️ Confirming delete for product:', selectedProduct._id);
      dispatch(deleteProduct(selectedProduct._id)).then((result) => {
        if (result.type === 'products/deleteProduct/fulfilled') {
          console.log('✅ Product deleted successfully');
          setShowDeleteModal(false);
          setSelectedProduct(null);
          // Refresh data
          dispatch(getAllProducts({ isActive: true }));
          dispatch(getProductionStats());
        } else {
          console.error('❌ Failed to delete product:', result.payload);
        }
      });
    }
  };


  const stageOptions = [
    { value: 'all', label: 'All Stages' },
    ...stages.map(stage => ({
      value: stage.id,
      label: `${stage.id} - ${stage.name}`
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    ...statuses.map(status => ({
      value: status.id,
      label: status.name
    }))
  ];

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Track and manage product production stages and status
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              onClick={handleCreateProduct}
              icon={HiDocumentText}
              variant="gradient"
              size="sm"
              className="shadow-lg"
            >
              Add Production
            </Button>
            <Button
              onClick={handleAddByProduct}
              icon={HiTag}
              variant="outline"
              size="sm"
              className="shadow-lg"
            >
              Add By Product
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HiDocumentText className="h-5 w-5" />
                <span>Products</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('by-products')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'by-products'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <HiTag className="h-5 w-5" />
                <span>By-Products</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          {activeTab === 'products' ? (
            <>
              <StatCard
                title="Total Products"
                value={stats.total}
                icon={HiDocumentText}
                gradient="blue"
                animation="bounce"
                change="+5%"
                changeType="increase"
                className="h-full"
              />
              <StatCard
                title="In Process"
                value={stats.inProcess}
                icon={HiPlay}
                gradient="indigo"
                animation="pulse"
                change="+2%"
                changeType="increase"
                className="h-full"
              />
              <StatCard
                title="On Hold"
                value={stats.onHold}
                icon={HiPause}
                gradient="yellow"
                animation="float"
                change="+1%"
                changeType="increase"
                className="h-full"
              />
              <StatCard
                title="Completed"
                value={stats.completed}
                icon={HiCheckCircle}
                gradient="green"
                animation="bounce"
                change="+8%"
                changeType="increase"
                className="h-full"
              />
            </>
          ) : (
            <>
              <StatCard
                title="Total By-Products"
                value={byProducts.length}
                icon={HiTag}
                gradient="blue"
                animation="bounce"
                change="+3%"
                changeType="increase"
                className="h-full"
              />
              <StatCard
                title="Total Value"
                value={`₹${byProducts.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}`}
                icon={HiCurrencyDollar}
                gradient="green"
                animation="pulse"
                change="+12%"
                changeType="increase"
                className="h-full"
              />
              <StatCard
                title="Linked Products"
                value={byProducts.filter(item => item.product).length}
                icon={HiDocumentText}
                gradient="indigo"
                animation="float"
                change="+5%"
                changeType="increase"
                className="h-full"
              />
              <StatCard
                title="Suppliers"
                value={new Set(byProducts.map(item => item.supplierName)).size}
                icon={HiBuildingOffice2}
                gradient="yellow"
                animation="bounce"
                change="+2%"
                changeType="increase"
                className="h-full"
              />
            </>
          )}
        </div>

        {/* Search and Filter Section - Only for Products Tab */}
        {activeTab === 'products' && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                icon={HiMagnifyingGlass}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
              <Select
                value={selectedStage}
                onChange={(e) => setSelectedStage(e.target.value)}
                options={stageOptions}
                className="w-full sm:w-48"
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        {activeTab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Showing {products.length} products
              </div>
            </div>
            <div className="overflow-hidden">
              <StageManagement
                products={products}
                stages={stages}
                statuses={statuses}
                onProductSelect={handleProductSelect}
                onEditProduct={handleEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onStageUpdate={handleStageUpdate}
                loading={loading}
              />
            </div>
          </div>
        )}

        {/* By-Products Tab Content */}
        {activeTab === 'by-products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Showing {byProducts.length} by-products
              </div>
            </div>
            <div className="overflow-hidden">
              <Table
                data={byProducts}
                columns={[
                  {
                    key: 'byProductName',
                    label: 'By-Product Name',
                    render: (item) => (
                      <div>
                        <p className="font-medium text-gray-900">{item.byProductName}</p>
                        {item.product && (
                          <p className="text-sm text-gray-500">
                            Linked to: {item.product.productName} - {item.product.batchNumber}
                          </p>
                        )}
                      </div>
                    )
                  },
                  {
                    key: 'supplierName',
                    label: 'Supplier',
                    render: (item) => (
                      <span className="text-gray-900">{item.supplierName}</span>
                    )
                  },
                  {
                    key: 'price',
                    label: 'Price',
                    render: (item) => (
                      <span className="font-medium text-gray-900">₹{item.price.toFixed(2)}</span>
                    )
                  },
                  {
                    key: 'quantity',
                    label: 'Quantity',
                    render: (item) => (
                      <span className="font-medium text-gray-900">{item.quantity}</span>
                    )
                  },
                  {
                    key: 'totalValue',
                    label: 'Total Value',
                    render: (item) => (
                      <span className="font-semibold text-green-600">
                        ₹{(item.price * item.quantity).toFixed(2)}
                      </span>
                    )
                  },
                  {
                    key: 'actions',
                    label: 'Actions',
                    render: (item) => (
                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleEditByProduct(item)}
                          variant="outline"
                          size="sm"
                          icon={HiPencil}
                        >
                          Edit
                        </Button>
                        <Button
                          onClick={() => handleDeleteByProduct(item)}
                          variant="outline"
                          size="sm"
                          icon={HiTrash}
                          className="text-red-600 hover:text-red-700"
                        >
                          Delete
                        </Button>
                      </div>
                    )
                  }
                ]}
                loading={byProductLoading}
                emptyMessage="No by-products found. Click 'Add By Product' to create one."
                className="min-h-[400px]"
              />
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Production Item"
        message={
          selectedProduct ? (
            `Are you sure you want to delete "${selectedProduct.productName}"? This action cannot be undone.`
          ) : (
            'Are you sure you want to delete this production item? This action cannot be undone.'
          )
        }
        confirmText="Delete Product"
        cancelText="Cancel"
        variant="danger"
      />

      {/* By-Product Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showByProductDeleteModal}
        onClose={() => {
          setShowByProductDeleteModal(false);
          setSelectedByProduct(null);
        }}
        onConfirm={handleConfirmByProductDelete}
        title="Delete By-Product"
        message={
          selectedByProduct ? (
            `Are you sure you want to delete "${selectedByProduct.byProductName}"? This action cannot be undone.`
          ) : (
            'Are you sure you want to delete this by-product? This action cannot be undone.'
          )
        }
        confirmText="Delete By-Product"
        cancelText="Cancel"
        variant="danger"
      />

    </div>
  );
};

export default ProductionDashboard;
