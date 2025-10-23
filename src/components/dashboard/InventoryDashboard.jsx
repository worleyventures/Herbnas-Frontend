import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiCube, 
  HiExclamationTriangle,
  HiInformationCircle,
  HiCheckCircle,
  HiCurrencyDollar,
  HiChartBar,
  HiCog6Tooth,
  HiPlus,
  HiTruck
} from 'react-icons/hi2';
import { StatCard, FilterCard, Button, SearchInput, Select, Pagination } from '../common';
import { addNotification } from '../../redux/slices/uiSlice';
import InventoryCRUD from './inventory/InventoryCRUD';
import ReceivedGoodsCRUD from './inventory/ReceivedGoodsCRUD';
import {
  getAllRawMaterials,
  getAllFinishedGoods,
  getInventoryStats,
  updateInventoryStock,
  deleteRawMaterial
} from '../../redux/actions/inventoryActions';
import { getAllSentGoods, getReceivedGoods } from '../../redux/actions/sentGoodsActions';
import { clearError as clearInventoryErrors } from '../../redux/slices/inventorySlice';
import { getAllProducts } from '../../redux/actions/productActions';

const InventoryDashboard = ({ propActiveView = 'table' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState(propActiveView || 'table');

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const {
    rawMaterials = [],
    finishedGoods = [],
    loading = false,
    error = null,
    stats = null,
    success = null
  } = useSelector((state) => state.inventory);

  const {
    products: allProducts = [],
    loading: productsLoading = false
  } = useSelector((state) => state.products);

  const {
    sentGoods = [],
    loading: sentGoodsLoading = false
  } = useSelector((state) => state.sentGoods);

  // Debug Redux state
  const fullSentGoodsState = useSelector((state) => state.sentGoods);
  console.log('🔍 Full Redux sentGoods state:', fullSentGoodsState);
  console.log('🔍 Redux state keys:', Object.keys(fullSentGoodsState));
  console.log('🔍 Redux sentGoods array:', fullSentGoodsState.sentGoods);
  console.log('🔍 Redux loading state:', fullSentGoodsState.loading);

  // Track Redux state changes
  useEffect(() => {
    console.log('🔄 Redux sentGoods state changed:', fullSentGoodsState);
  }, [fullSentGoodsState]);

  // Local state
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [activeTab, setActiveTab] = useState('rawMaterials'); // 'rawMaterials', 'finishedGoods', or 'sentGoods'
  
  // Role-based access
  const isProductionManager = user?.role === 'production_manager';

  // Debug logging
  console.log('🔍 InventoryDashboard Debug:');
  console.log('- User role:', user?.role);
  console.log('- Is production manager:', isProductionManager);
  console.log('- Active tab:', activeTab);
  console.log('- Sent goods count:', sentGoods.length);
  console.log('- Sent goods loading:', sentGoodsLoading);
  console.log('- Sent goods data:', sentGoods);
  console.log('- Redux sentGoods state:', useSelector((state) => state.sentGoods));


  // Load data on component mount
  useEffect(() => {
    console.log('🔄 useEffect triggered - isAuthenticated:', isAuthenticated, 'isProductionManager:', isProductionManager);
    if (isAuthenticated) {
      dispatch(getAllRawMaterials({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
      }));
      dispatch(getAllFinishedGoods({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        productId: filterProduct === 'all' ? '' : filterProduct,
        stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
      }));
      // Load sent goods for all users (production managers will see filtered results)
      console.log('🚀 Dispatching sent goods action...');
      if (isProductionManager) {
        console.log('🚀 Dispatching getReceivedGoods for production manager...');
        const receivedGoodsAction = getReceivedGoods({ page: 1, limit: 1000 });
        console.log('🚀 Received goods action:', receivedGoodsAction);
        dispatch(receivedGoodsAction);
      } else {
        console.log('🚀 Dispatching getAllSentGoods for other roles...');
        const sentGoodsAction = getAllSentGoods({ page: 1, limit: 1000 });
        console.log('🚀 Sent goods action:', sentGoodsAction);
        dispatch(sentGoodsAction);
      }
      dispatch(getInventoryStats());
      dispatch(getAllProducts({ page: 1, limit: 1000, isActive: true }));
    }
  }, [dispatch, isAuthenticated, isProductionManager]);

  // Load filtered inventory when filters change
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllRawMaterials({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
      }));
      dispatch(getAllFinishedGoods({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        productId: filterProduct === 'all' ? '' : filterProduct,
        stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
      }));
    }
  }, [dispatch, isAuthenticated, currentPage, itemsPerPage, searchTerm, filterProduct, filterStockStatus]);

  // Handle success notifications
  useEffect(() => {
    if (success) {
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: success,
        duration: 3000
      }));
    }
  }, [success, dispatch]);

  // Handle error notifications
  useEffect(() => {
    if (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: error,
        duration: 5000
      }));
      dispatch(clearInventoryErrors());
    }
  }, [error, dispatch]);

  // Get current inventory data based on active tab
  const currentInventory = (() => {
    switch (activeTab) {
      case 'rawMaterials':
        return Array.isArray(rawMaterials) ? rawMaterials : [];
      case 'finishedGoods':
        return Array.isArray(finishedGoods) ? finishedGoods : [];
      case 'sentGoods':
        return Array.isArray(sentGoods) ? sentGoods : [];
      default:
        return [];
    }
  })();
  
  // Filter inventory based on search and filters
  const filteredInventory = currentInventory.filter(inventoryItem => {
    if (!inventoryItem) return false; // Skip null/undefined items
    const matchesSearch = !searchTerm || (() => {
      if (activeTab === 'rawMaterials') {
        return inventoryItem.materialName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               inventoryItem.supplierName?.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (activeTab === 'finishedGoods') {
        return inventoryItem.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase());
      } else if (activeTab === 'sentGoods') {
        return inventoryItem.trackingId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               inventoryItem.branch?.branchName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               inventoryItem.items?.some(item => item.productName?.toLowerCase().includes(searchTerm.toLowerCase()));
      }
      return false;
    })();

    const matchesProduct = filterProduct === 'all' || (() => {
      if (activeTab === 'finishedGoods') {
        return inventoryItem.product?._id === filterProduct;
      } else if (activeTab === 'sentGoods') {
        return inventoryItem.items?.some(item => item.productId === filterProduct);
      }
      return true; // Raw materials don't have product filter
    })();

    const matchesStockStatus = (() => {
      if (filterStockStatus === 'all') return true;
      
      // Sent goods don't have stock status filter, so always return true
      if (activeTab === 'sentGoods') return true;

      const availableStock = activeTab === 'rawMaterials' 
        ? (inventoryItem.stockQuantity || 0)
        : (inventoryItem.availableQuantity || 0);
      const minLevel = inventoryItem.minStockLevel || 0;
      const maxLevel = inventoryItem.maxStockLevel || 0;

      switch (filterStockStatus) {
        case 'low':
          return availableStock <= minLevel;
        case 'high':
          return availableStock >= maxLevel;
        case 'normal':
          return availableStock > minLevel && availableStock < maxLevel;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesProduct && matchesStockStatus;
  });

  // Calculate stats from current inventory data
  const totalInventory = currentInventory.length;
  const lowStockItems = activeTab === 'sentGoods' ? 0 : currentInventory.filter(item => {
    if (!item) return false; // Skip null/undefined items
    const availableStock = activeTab === 'rawMaterials' 
      ? (item.stockQuantity || 0)
      : (item.availableQuantity || 0);
    return availableStock <= (item.minStockLevel || 0);
  }).length;
  const highStockItems = activeTab === 'sentGoods' ? 0 : currentInventory.filter(item => {
    if (!item) return false; // Skip null/undefined items
    const availableStock = activeTab === 'rawMaterials' 
      ? (item.stockQuantity || 0)
      : (item.availableQuantity || 0);
    return availableStock >= (item.maxStockLevel || 0);
  }).length;
  const totalValue = activeTab === 'sentGoods' ? 0 : currentInventory.reduce((sum, item) => {
    if (!item) return sum; // Skip null/undefined items
    const availableStock = activeTab === 'rawMaterials' 
      ? (item.stockQuantity || 0)
      : (item.availableQuantity || 0);
    const price = activeTab === 'rawMaterials' 
      ? (item.price || 0)
      : (item.product?.price || 0);
    return sum + (availableStock * price);
  }, 0);

  // Handle form submissions

  const handleEditInventory = (inventoryItem) => {
    navigate(`/inventory/edit/${inventoryItem._id}?type=${activeTab}`, { 
      state: { 
        inventory: inventoryItem,
        returnTo: '/inventory'
      }
    });
  };

  const handleUpdateInventory = async (formData) => {
    try {
      // This function is not used in the current implementation
      // Inventory updates are handled through the form pages
      console.log('Update inventory function called but not implemented in dashboard');
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  // Refresh function for sent goods status updates
  const handleRefreshSentGoods = () => {
    if (activeTab === 'sentGoods') {
      dispatch(getAllSentGoods({ page: currentPage, limit: itemsPerPage }));
    }
  };

  const handleDeleteInventory = (inventoryItem) => {
    setSelectedInventory(inventoryItem);
    setShowDeleteModal(true);
  };

  const handleDeleteInventoryConfirm = async () => {
    try {
      if (activeTab === 'rawMaterials') {
        await dispatch(deleteRawMaterial(selectedInventory._id)).unwrap();
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          title: 'Success',
          message: 'Raw material deleted successfully',
          duration: 3000
        }));
        
        // Refresh raw materials list
        dispatch(getAllRawMaterials({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
        }));
      } else {
        // For finished goods, we need to implement deleteFinishedGoods action
        dispatch(addNotification({
          type: 'error',
          title: 'Error',
          message: 'Delete finished goods not implemented yet',
          duration: 5000
        }));
        return;
      }
      
      setShowDeleteModal(false);
      setSelectedInventory(null);
      
      // Refresh stats
      dispatch(getInventoryStats());
    } catch (error) {
      console.error('Error deleting inventory:', error);
      
      // Show error notification
      dispatch(addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete inventory item. Please check your permissions.',
        duration: 5000
      }));
    }
  };


  // Prepare options for selects
  const productOptions = [
    { value: 'all', label: 'All Products' },
    ...(Array.isArray(allProducts) ? allProducts.map(product => ({
      value: product._id,
      label: product.productName
    })) : [])
  ];

  const stockStatusOptions = [
    { value: 'all', label: 'All Stock Levels' },
    { value: 'low', label: 'Low Stock' },
    { value: 'normal', label: 'Normal Stock' },
    { value: 'high', label: 'High Stock' }
  ];

  // Pagination
  const totalPages = Math.ceil(filteredInventory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInventory = filteredInventory.slice(startIndex, endIndex);

  if ((loading || sentGoodsLoading) && currentInventory.length === 0) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage raw materials and finished goods inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {activeTab === 'rawMaterials' && (
            <Button
              onClick={() => navigate(`/inventory/create?type=${activeTab}`)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={HiPlus}
            >
              Add Raw Material
            </Button>
          )}
          {activeTab === 'sentGoods' && !isProductionManager && (
            <Button
              onClick={() => navigate('/inventory/sent-goods')}
              className="bg-green-600 hover:bg-green-700 text-white"
              icon={HiTruck}
            >
              Send Goods
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('rawMaterials')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rawMaterials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <HiCube className="h-5 w-5" />
              <span>Raw Materials</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('finishedGoods')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'finishedGoods'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <HiCheckCircle className="h-5 w-5" />
              <span>Finished Goods</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('sentGoods')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'sentGoods'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <HiTruck className="h-5 w-5" />
              <span>{isProductionManager ? 'Received Goods' : 'Sent Goods'}</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title={`Total ${activeTab === 'rawMaterials' ? 'Raw Materials' : activeTab === 'finishedGoods' ? 'Finished Goods' : 'Sent Goods'}`}
          value={totalInventory}
          icon={activeTab === 'rawMaterials' ? HiCube : activeTab === 'finishedGoods' ? HiCheckCircle : HiTruck}
          gradient="blue"
          animation="bounce"
          change="+5%"
          changeType="increase"
          loading={loading || sentGoodsLoading}
        />
        <StatCard
          title={activeTab === 'sentGoods' ? 'Delivered Items' : 'Low Stock Items'}
          value={activeTab === 'sentGoods' ? currentInventory.filter(item => item.status === 'delivered').length : lowStockItems}
          icon={activeTab === 'sentGoods' ? HiCheckCircle : HiExclamationTriangle}
          gradient={activeTab === 'sentGoods' ? 'green' : 'red'}
          animation="pulse"
          change="+2%"
          changeType="increase"
          loading={loading || sentGoodsLoading}
        />
        <StatCard
          title={activeTab === 'sentGoods' ? 'In Transit Items' : 'High Stock Items'}
          value={activeTab === 'sentGoods' ? currentInventory.filter(item => item.status === 'in-transit').length : highStockItems}
          icon={activeTab === 'sentGoods' ? HiTruck : HiInformationCircle}
          gradient={activeTab === 'sentGoods' ? 'blue' : 'yellow'}
          animation="float"
          change="+2%"
          changeType="increase"
          loading={loading || sentGoodsLoading}
        />
        <StatCard
          title={activeTab === 'sentGoods' ? 'Pending Items' : 'Total Value'}
          value={activeTab === 'sentGoods' ? currentInventory.filter(item => item.status === 'pending').length : `₹${totalValue.toLocaleString()}`}
          icon={activeTab === 'sentGoods' ? HiExclamationTriangle : HiCurrencyDollar}
          gradient={activeTab === 'sentGoods' ? 'yellow' : 'emerald'}
          animation="bounce"
          change="+8%"
          changeType="increase"
          loading={loading || sentGoodsLoading}
        />
      </div>

      {/* Filters */}
      {/* <FilterCard>
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${activeTab === 'finishedGoods' ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-3`}>
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder={`Search ${activeTab === 'rawMaterials' ? 'raw materials' : 'finished goods'}...`}
          />
          {activeTab === 'finishedGoods' && (
            <Select
              value={filterProduct}
              onChange={setFilterProduct}
              options={productOptions}
              placeholder="Filter by product"
            />
          )}
          <Select
            value={filterStockStatus}
            onChange={setFilterStockStatus}
            options={stockStatusOptions}
            placeholder="Filter by stock status"
          />
        </div>
      </FilterCard> */}

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredInventory.length)} of {filteredInventory.length} items
        </div>
      </div>

      {/* Inventory Table */}
      {activeTab === 'sentGoods' && isProductionManager ? (
        <>
          {console.log('🎯 Rendering ReceivedGoodsCRUD with props:', { sentGoods, loading: sentGoodsLoading })}
          <ReceivedGoodsCRUD
            sentGoods={sentGoods}
            loading={sentGoodsLoading}
            onRefresh={handleRefreshSentGoods}
          />
        </>
      ) : (
        <InventoryCRUD
          inventory={paginatedInventory}
          inventoryType={activeTab}
          onSelectInventory={setSelectedInventory}
          onEditInventory={handleEditInventory}
          onDeleteInventory={handleDeleteInventory}
          onCreateInventory={() => navigate(`/inventory/create?type=${activeTab}`)}
          onUpdateInventory={activeTab === 'sentGoods' ? handleRefreshSentGoods : handleUpdateInventory}
          onDeleteInventoryConfirm={handleDeleteInventoryConfirm}
          showDeleteModal={showDeleteModal}
          selectedInventory={selectedInventory}
          setShowDeleteModal={setShowDeleteModal}
          loading={loading}
          createLoading={loading}
          updateLoading={loading}
          deleteLoading={loading}
        />
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredInventory.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          startIndex={startIndex}
          endIndex={endIndex}
        />
      )}

    </div>
  );
};

export default InventoryDashboard;
