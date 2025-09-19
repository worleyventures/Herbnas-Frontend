import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiCube, 
  HiMagnifyingGlass, 
  HiExclamationTriangle,
  HiInformationCircle,
  HiCheckCircle,
  HiCurrencyDollar,
  HiChartBar,
  HiCog6Tooth
} from 'react-icons/hi2';
import { StatCard, FilterCard, Button, SearchInput, Select, Pagination } from '../common';
import { addNotification } from '../../redux/slices/uiSlice';
import InventoryForm from './inventory/InventoryForm';
import InventoryCRUD from './inventory/InventoryCRUD';
import {
  getAllInventory,
  getInventoryStats,
  updateInventoryStock,
  deleteInventory,
  clearInventoryErrors,
  clearInventorySuccess
} from '../../redux/actions/inventoryActions';
import { getAllProducts } from '../../redux/actions/productActions';

const InventoryDashboard = ({ propActiveView = 'table' }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState(propActiveView || 'table');

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const {
    inventory: allInventory = [],
    loading = false,
    error = null,
    stats = null,
    statsLoading = false,
    success = null
  } = useSelector((state) => state.inventory);

  const {
    products: allProducts = [],
    loading: productsLoading = false
  } = useSelector((state) => state.products);

  // Local state
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProduct, setFilterProduct] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllInventory({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        product: filterProduct === 'all' ? '' : filterProduct,
        stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
      }));
      dispatch(getInventoryStats());
      dispatch(getAllProducts({ page: 1, limit: 1000 }));
    }
  }, [dispatch, isAuthenticated]);

  // Load filtered inventory when filters change
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllInventory({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        product: filterProduct === 'all' ? '' : filterProduct,
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
      dispatch(clearInventorySuccess());
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

  // Filter inventory based on search and filters
  const filteredInventory = allInventory.filter(inventoryItem => {
    const matchesSearch = !searchTerm ||
      inventoryItem.product?.productName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesProduct = filterProduct === 'all' || inventoryItem.product?._id === filterProduct;

    const matchesStockStatus = (() => {
      if (filterStockStatus === 'all') return true;

      const availableStock = inventoryItem.availableStock || 0;
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

  // Calculate stats from inventory data
  const totalInventory = allInventory.length;
  const lowStockItems = allInventory.filter(item => {
    const availableStock = item.availableStock || 0;
    return availableStock <= (item.minStockLevel || 0);
  }).length;
  const highStockItems = allInventory.filter(item => {
    const availableStock = item.availableStock || 0;
    return availableStock >= (item.maxStockLevel || 0);
  }).length;
  const totalValue = allInventory.reduce((sum, item) => {
    const availableStock = item.availableStock || 0;
    return sum + (availableStock * (item.product?.price || 0));
  }, 0);

  // Handle form submissions

  const handleEditInventory = (inventoryItem) => {
    setSelectedInventory(inventoryItem);
    setShowEditModal(true);
  };

  const handleUpdateInventory = async (formData) => {
    try {
      await dispatch(createOrUpdateInventory(formData)).unwrap();
      setShowEditModal(false);
      setSelectedInventory(null);
      
      // Refresh inventory list
      dispatch(getAllInventory({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        product: filterProduct === 'all' ? '' : filterProduct,
        stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
      }));
      
      // Refresh stats
      dispatch(getInventoryStats());
    } catch (error) {
      console.error('Error updating inventory:', error);
    }
  };

  const handleDeleteInventory = (inventoryItem) => {
    setSelectedInventory(inventoryItem);
    setShowDeleteModal(true);
  };

  const handleDeleteInventoryConfirm = async () => {
    try {
      await dispatch(deleteInventory(selectedInventory._id)).unwrap();
      setShowDeleteModal(false);
      setSelectedInventory(null);
      
      // Refresh inventory list
      dispatch(getAllInventory({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        product: filterProduct === 'all' ? '' : filterProduct,
        stockStatus: filterStockStatus === 'all' ? '' : filterStockStatus
      }));
      
      // Refresh stats
      dispatch(getInventoryStats());
    } catch (error) {
      console.error('Error deleting inventory:', error);
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

  if (loading && allInventory.length === 0) {
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
          <h1 className="text-2xl font-bold text-gray-900">Production Inventory</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage completed production products (F6 stage) in central inventory
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Inventory"
          value={totalInventory}
          icon={HiCube}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          change="+5%"
          changeType="increase"
          loading={statsLoading || loading}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems}
          icon={HiExclamationTriangle}
          iconBg="bg-gradient-to-br from-red-500 to-red-600"
          change="+2%"
          changeType="increase"
          loading={statsLoading || loading}
        />
                <StatCard
                  title="High Stock Items"
                  value={highStockItems}
                  icon={HiInformationCircle}
                  iconBg="bg-gradient-to-br from-yellow-500 to-yellow-600"
                  change="+2%"
                  changeType="increase"
                  loading={statsLoading || loading}
                />
        <StatCard
          title="Total Value"
          value={`₹${totalValue.toLocaleString()}`}
          icon={HiCurrencyDollar}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          change="+8%"
          changeType="increase"
          loading={statsLoading || loading}
        />
      </div>

      {/* Filters */}
      <FilterCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchInput
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search inventory..."
            icon={HiMagnifyingGlass}
          />
          <Select
            value={filterProduct}
            onChange={setFilterProduct}
            options={productOptions}
            placeholder="Filter by product"
          />
          <Select
            value={filterStockStatus}
            onChange={setFilterStockStatus}
            options={stockStatusOptions}
            placeholder="Filter by stock status"
          />
        </div>
      </FilterCard>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {startIndex + 1}-{Math.min(endIndex, filteredInventory.length)} of {filteredInventory.length} items
        </div>
      </div>

      {/* Inventory Table */}
      <InventoryCRUD
        inventory={paginatedInventory}
        onSelectInventory={setSelectedInventory}
        onEditInventory={handleEditInventory}
        onDeleteInventory={handleDeleteInventory}
        onCreateInventory={() => setShowCreateModal(true)}
        onUpdateInventory={handleUpdateInventory}
        onDeleteInventoryConfirm={handleDeleteInventoryConfirm}
        showDeleteModal={showDeleteModal}
        selectedInventory={selectedInventory}
        setShowDeleteModal={setShowDeleteModal}
        loading={loading}
        createLoading={loading}
        updateLoading={loading}
        deleteLoading={loading}
      />

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


      <InventoryForm
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedInventory(null);
        }}
        onSubmit={handleUpdateInventory}
        title="Edit Inventory"
        submitText="Update Inventory"
        initialData={selectedInventory}
        loading={loading}
        products={allProducts}
      />

    </div>
  );
};

export default InventoryDashboard;
