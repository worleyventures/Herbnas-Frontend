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
  HiMagnifyingGlass
} from 'react-icons/hi2';
import { StatCard, Button, SearchInput, Select, Pagination, ConfirmationModal } from '../../common';
import {
  getAllProducts,
  getProductsByStage,
  getProductionStats,
  updateProductionStage,
  moveToInventory,
  deleteProduct
} from '../../../redux/actions/productActions';
import { addNotification } from '../../../redux/slices/uiSlice';
import StageManagement from './StageManagement';

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState('stages');
  const [selectedStage, setSelectedStage] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
      dispatch(getAllProducts());
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
          search: searchTerm 
        } 
      }));
    } else {
      dispatch(getAllProducts({ 
        page: currentPage, 
        limit: itemsPerPage, 
        search: searchTerm 
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
        // Check if F6 is completed and move to inventory
        if (newStage === 'F6' && newStatus === 'completed') {
          console.log('Product completed F6 stage, moving to inventory...');
          dispatch(moveToInventory(productId)).then((inventoryResult) => {
            if (inventoryResult.type === 'products/moveToInventory/fulfilled') {
              console.log('Product successfully moved to inventory');
              // Show success notification
              dispatch(addNotification({
                type: 'success',
                title: 'Product Moved to Inventory',
                message: `Product has been automatically moved to central inventory with ${inventoryResult.payload.data.centralInventory.availableStock} units`,
                duration: 5000
              }));
            } else {
              console.error('Failed to move product to inventory:', inventoryResult.payload);
              dispatch(addNotification({
                type: 'error',
                title: 'Inventory Move Failed',
                message: inventoryResult.payload || 'Failed to move product to inventory',
                duration: 5000
              }));
            }
          });
        }
        
        // Refresh data
        dispatch(getAllProducts());
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
          dispatch(getAllProducts());
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
    <div className="min-h-screen bg-gray-50">
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
              size="md"
              className="shadow-lg"
            >
              Add Production
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
          <StatCard
            title="Total Products"
            value={stats.total}
            icon={HiDocumentText}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            change="+5%"
            changeType="increase"
            className="h-full"
          />
          <StatCard
            title="In Process"
            value={stats.inProcess}
            icon={HiPlay}
            iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
            change="+2%"
            changeType="increase"
            className="h-full"
          />
          <StatCard
            title="On Hold"
            value={stats.onHold}
            icon={HiPause}
            iconBg="bg-gradient-to-br from-yellow-500 to-yellow-600"
            change="+1%"
            changeType="increase"
            className="h-full"
          />
          <StatCard
            title="Completed"
            value={stats.completed}
            icon={HiCheckCircle}
            iconBg="bg-gradient-to-br from-green-500 to-green-600"
            change="+8%"
            changeType="increase"
            className="h-full"
          />
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
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
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {products.length} products
              </div>
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

    </div>
  );
};

export default ProductionDashboard;
