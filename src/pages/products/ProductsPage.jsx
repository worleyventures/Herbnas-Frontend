import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiShoppingBag, HiPlus, HiCube, HiCheckCircle, HiTag, HiCurrencyRupee } from 'react-icons/hi2';
import { StatCard, Button, Input, Select, Loading, EmptyState, SearchInput } from '../../components/common';
import ProductCRUD from '../../components/dashboard/products/ProductCRUD';
import { getAllProducts, deleteProduct, updateProduct, getProductStats } from '../../redux/actions/productActions';
import { addNotification } from '../../redux/slices/uiSlice';

const ProductsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Get user role for permissions
  const { user } = useSelector((state) => state.auth || {});
  const isAccountsManager = user?.role === 'accounts_manager';

  // Redux state
  const productState = useSelector((state) => state.products);
  const products = productState?.products || [];
  const loading = productState?.loading || false;
  const error = productState?.error || null;
  const stats = productState?.stats || null;

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Load products and stats on component mount
  useEffect(() => {
    dispatch(getAllProducts({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      category: filterCategory !== 'all' ? filterCategory : undefined
    }));
    dispatch(getProductStats());
  }, [dispatch, currentPage, itemsPerPage, searchTerm, filterCategory]);

  // Refresh products when navigating to this page (e.g., returning from edit form)
  useEffect(() => {
    if (location.pathname === '/products') {
      dispatch(getAllProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : undefined
      }));
      dispatch(getProductStats());
    }
  }, [location.pathname, dispatch]);

  // Filter products based on search and category
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchTerm || 
      product.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate statistics from filtered products array
  const totalProducts = filteredProducts.length;
  const activeProducts = filteredProducts.filter(p => p.isActive).length;
  const categories = [...new Set(filteredProducts.map(p => p.category))];
  const totalValue = filteredProducts.reduce((sum, product) => sum + (product.price || 0), 0);

  // CRUD Handlers
  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
  };

  const handleEditProduct = (product) => {
    navigate(`/products/edit/${product._id}`, {
      state: { 
        product: product,
        returnTo: '/products'
      }
    });
  };

  const handleDeleteProduct = (product) => {
    setSelectedProduct(product);
    setShowDeleteModal(true);
  };

  const handleCreateProduct = () => {
    navigate('/products/create');
  };

  const handleUpdateProduct = (productId, data) => {
    setUpdateLoading(true);
    dispatch(updateProduct({ productId, productData: data }))
      .unwrap()
      .then(() => {
        dispatch(addNotification({
          type: 'success',
          title: 'Product Updated',
          message: 'Product has been updated successfully',
          duration: 3000
        }));
        // Refresh products list
        dispatch(getAllProducts({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          category: filterCategory !== 'all' ? filterCategory : undefined
        }));
        dispatch(getProductStats());
      })
      .catch((error) => {
        console.error('Update product error:', error);
        dispatch(addNotification({
          type: 'error',
          title: 'Update Failed',
          message: error.message || 'Failed to update product. Please try again.',
          duration: 5000
        }));
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  const handleDeleteProductConfirm = async (productId) => {
    setDeleteLoading(true);
    try {
      await dispatch(deleteProduct(productId)).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Product Deleted',
        message: 'Product has been deleted successfully',
        duration: 3000
      }));

      // Refresh products list
      dispatch(getAllProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : undefined
      }));
      dispatch(getProductStats());

    } catch (error) {
      console.error('Delete product error:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: error.message || 'Failed to delete product. Please try again.',
        duration: 5000
      }));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async (productId, isActivating) => {
    setUpdateLoading(true);
    try {
      await dispatch(updateProduct({ 
        productId, 
        productData: { isActive: isActivating } 
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: isActivating ? 'Product Activated' : 'Product Deactivated',
        message: `Product has been ${isActivating ? 'activated' : 'deactivated'} successfully`,
        duration: 3000
      }));

      // Refresh products list
      dispatch(getAllProducts({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        category: filterCategory !== 'all' ? filterCategory : undefined
      }));
      dispatch(getProductStats());

    } catch (error) {
      console.error('Toggle status error:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Status Update Failed',
        message: error.message || 'Failed to update product status. Please try again.',
        duration: 5000
      }));
    } finally {
      setUpdateLoading(false);
    }
  };

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'category':
        setFilterCategory(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterCategory('all');
    setCurrentPage(1);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Product Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all products and their details
          </p>
        </div>
        {!isAccountsManager && (
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Button
              className='sm:w-auto w-full'
              onClick={handleCreateProduct}
              variant="gradient"
              icon={HiPlus}
            >
              Add Product
            </Button>
          </div>
        )}
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={totalProducts}
          icon={HiCube}
          gradient="blue"
        />
        <StatCard
          title="Active Products"
          value={activeProducts}
          icon={HiCheckCircle}
          gradient="green"
        />
        <StatCard
          title="Categories"
          value={categories.length}
          icon={HiTag}
          gradient="purple"
        />
        <StatCard
          title="Total Value"
          value={`₹${totalValue.toLocaleString()}`}
          icon={HiCurrencyRupee}
          gradient="orange"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg p-2">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="w-full sm:w-80">
            <SearchInput
              placeholder="Search by name, ID, or description..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
            <div className="w-full sm:w-48">
              <Select
                value={filterCategory}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map(category => ({
                    value: category,
                    label: category
                  }))
                ]}
              />
            </div>
            {/* <div className="w-full sm:w-48 flex items-end">
              <Button
                onClick={clearFilters}
                variant="outline"
                className="w-full"
              >
                Clear Filters
              </Button>
            </div> */}
          </div>
        </div>
      </div>

      {/* Products CRUD Component */}
      <ProductCRUD
        products={filteredProducts}
        onSelectProduct={handleSelectProduct}
        onEditProduct={handleEditProduct}
        onDeleteProduct={handleDeleteProduct}
        onCreateProduct={handleCreateProduct}
        onUpdateProduct={handleUpdateProduct}
        onDeleteProductConfirm={handleDeleteProductConfirm}
        onToggleStatus={handleToggleStatus}
        showDeleteModal={showDeleteModal}
        showDisableModal={showDisableModal}
        showActivateModal={showActivateModal}
        selectedProduct={selectedProduct}
        setShowDeleteModal={setShowDeleteModal}
        setShowDisableModal={setShowDisableModal}
        setShowActivateModal={setShowActivateModal}
        pagination={pagination ? {
          ...pagination,
          onPageChange: setCurrentPage,
          itemName: 'products'
        } : {
          currentPage: currentPage,
          totalPages: Math.ceil(filteredProducts.length / itemsPerPage),
          totalItems: filteredProducts.length,
          itemsPerPage: itemsPerPage,
          onPageChange: setCurrentPage,
          itemName: 'products'
        }}
        loading={loading}
        createLoading={createLoading}
        updateLoading={updateLoading}
        deleteLoading={deleteLoading}
      />
    </div>
  );
};

export default ProductsPage;