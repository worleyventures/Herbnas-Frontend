import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiMagnifyingGlass,
  HiDocumentText,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiBell,
  HiExclamationTriangle,
  HiChartBar,
  HiPencil,
  HiCloudArrowUp,
  HiTag,
  HiCurrencyDollar,
  HiCube
} from 'react-icons/hi2';
import { StatCard, FilterCard, Button, SearchInput, Select, Pagination, ImportModal } from '../common';
import {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct
} from '../../redux/actions/productActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { clearError, clearSuccess } from '../../redux/slices/productSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import ProductCRUD from './products/ProductCRUD';
import ProductForm from './products/ProductForm';

const ProductsDashboard = ({ showCreateModal, setShowCreateModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const {
    products: allProducts = [],
    loading = false,
    error = null
  } = useSelector((state) => state.products);



  // Filter options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' }
  ];

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllProducts());
      dispatch(getAllBranches());
      // Note: Stats API endpoint doesn't exist yet, using calculated stats from products
    }
  }, [dispatch, isAuthenticated]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch]);

  // Ensure allProducts is always an array
  const productsArray = Array.isArray(allProducts) ? allProducts : 
                       (allProducts && Array.isArray(allProducts.products)) ? allProducts.products :
                       (allProducts && Array.isArray(allProducts.data)) ? allProducts.data : [];

  // Use real products data
  const finalProducts = productsArray;

  // Filter products based on search and filters
  const filteredProducts = finalProducts.filter(product => {
    const matchesSearch = !searchTerm || 
      product.productName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || product.isActive === (filterStatus === 'active');
    
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'status':
        setFilterStatus(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Handle product selection
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  // Handle edit product
  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setShowEditModal(true);
  };

  // Handle delete product
  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };


  // Handle update product
  const handleUpdateProduct = (productData) => {
    if (selectedProduct) {
      dispatch(updateProduct({ productId: selectedProduct._id, productData }))
        .then((result) => {
          setShowEditModal(false);
          setSelectedProduct(null);
          
          const responseData = result.payload.data || result.payload;
          
          // Check if product was automatically moved to inventory
          if (responseData.inventoryMoveSuccess) {
            dispatch(addNotification({
              type: 'success',
              title: 'Product Updated & Moved to Inventory',
              message: `Product updated and automatically moved to central inventory with ${responseData.inventoryStock} units`
            }));
          } else if (responseData.inventoryMoveError) {
            dispatch(addNotification({
              type: 'warning',
              title: 'Product Updated with Warning',
              message: `Product updated but failed to move to inventory: ${responseData.inventoryMoveError}`
            }));
          } else {
            dispatch(addNotification({
              type: 'success',
              message: responseData.message || 'Product updated successfully!'
            }));
          }
        })
        .catch(() => {
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to update product. Please try again.'
          }));
        });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      dispatch(deleteProduct(selectedProduct._id))
        .then(() => {
          setShowDeleteModal(false);
          setSelectedProduct(null);
          dispatch(addNotification({
            type: 'success',
            message: 'Product deleted successfully!'
          }));
        })
        .catch(() => {
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to delete product. Please try again.'
          }));
        });
    }
  };

  // Handle create product
  const handleCreateProductSubmit = (productData) => {
    dispatch(createProduct(productData))
      .then(() => {
        setShowCreateModal(false);
        dispatch(addNotification({
          type: 'success',
          message: 'Product created successfully!'
        }));
      })
      .catch(() => {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to create product. Please try again.'
        }));
      });
  };


  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HiExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Products</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="gradient">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your product catalog, pricing, and inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button
            onClick={() => setShowImportModal(true)}
            icon={HiCloudArrowUp}
            variant="warning"
            size="sm"
          >
            Import Products
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={HiPencil}
            variant="gradient"
            size="sm"
          >
            Add New Product
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total Products"
          value={finalProducts.length}
          icon={HiDocumentText}
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
          change="+12%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Active Products"
          value={finalProducts.filter(p => p.isActive === true).length}
          icon={HiCheckCircle}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          change="+8%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Total Value"
          value={`₹${finalProducts.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}`}
          icon={HiCurrencyDollar}
          iconBg="bg-gradient-to-br from-amber-500 to-amber-600"
          change="+15%"
          changeType="increase"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <FilterCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search products..."
            icon={HiMagnifyingGlass}
          />
          <Select
            value={filterStatus}
            onChange={(value) => handleFilterChange('status', value)}
            options={statusOptions}
            placeholder="Filter by status"
          />
        </div>
      </FilterCard>

      {/* Main Content */}
      <div>
        <ProductCRUD
          products={paginatedProducts}
          loading={loading}
          onSelectProduct={handleSelectProduct}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
          onUpdateProduct={handleUpdateProduct}
          onDeleteConfirm={handleDeleteConfirm}
          showDeleteModal={showDeleteModal}
          selectedProduct={selectedProduct}
          setShowDeleteModal={setShowDeleteModal}
        />
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredProducts.length}
          />
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <ProductForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateProductSubmit}
          title="Create New Product"
          submitText="Create Product"
          loading={loading}
        />
      )}

      {showEditModal && selectedProduct && (
        <ProductForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedProduct(null);
          }}
          onSubmit={handleUpdateProduct}
          title="Edit Product"
          submitText="Update Product"
          initialData={selectedProduct}
          loading={loading}
        />
      )}

      {showImportModal && (
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          title="Import Products"
          description="Upload a CSV file to import multiple products at once"
          onImport={(file) => {
            // Handle import logic here
            console.log('Import file:', file);
            setShowImportModal(false);
          }}
        />
      )}
    </div>
  );
};

export default ProductsDashboard;
