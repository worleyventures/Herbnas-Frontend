import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { HiShoppingBag, HiArrowLeft, HiPencil, HiTrash } from 'react-icons/hi2';
import { Button, Loading, EmptyState } from '../../components/common';
import { PageHeader } from '../../components/layout';
import { getProductById, deleteProduct } from '../../redux/actions/productActions';
import { addNotification } from '../../redux/slices/uiSlice';

const ProductDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const { currentProduct, loading, error } = useSelector((state) => state.products);

  // Local state
  const [isDeleting, setIsDeleting] = useState(false);

  // Load product on component mount
  useEffect(() => {
    if (id) {
      dispatch(getProductById(id));
    }
  }, [dispatch, id]);

  // Handle back navigation
  const handleBack = () => {
    navigate('/products');
  };

  // Handle edit product
  const handleEdit = () => {
    navigate(`/products/edit/${id}`, {
      state: { 
        product: currentProduct,
        returnTo: `/products/view/${id}`
      }
    });
  };

  // Handle delete product
  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete product "${currentProduct?.productName}"?`)) {
      setIsDeleting(true);
      try {
        await dispatch(deleteProduct(id)).unwrap();
        
        dispatch(addNotification({
          type: 'success',
          title: 'Product Deleted',
          message: 'Product has been deleted successfully',
          duration: 3000
        }));

        navigate('/products');
      } catch (error) {
        console.error('Delete product error:', error);
        dispatch(addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: 'Failed to delete product. Please try again.',
          duration: 5000
        }));
      } finally {
        setIsDeleting(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error || !currentProduct) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <EmptyState
          icon={HiShoppingBag}
          title="Product Not Found"
          description={error || "The product you're looking for doesn't exist or has been removed."}
          action={
            <Button onClick={handleBack} variant="primary">
              Back to Products
            </Button>
          }
        />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPrice = (price) => {
    if (!price) return 'N/A';
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleBack}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <HiArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <HiShoppingBag className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {currentProduct.productName}
              </h1>
              <p className="text-sm text-gray-500">
                {currentProduct.productId}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            onClick={handleEdit}
            variant="primary"
            icon={HiPencil}
          >
            Edit Product
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            icon={HiTrash}
            loading={isDeleting}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Product'}
          </Button>
        </div>
      </div>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Product ID</span>
              <span className="text-sm text-gray-900">{currentProduct.productId}</span>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Product Name</span>
              <span className="text-sm text-gray-900">{currentProduct.productName}</span>
              </div>
              
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Category</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {currentProduct.category}
              </span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Unit of Measure</span>
              <span className="text-sm text-gray-900">{currentProduct.UOM}</span>
            </div>

            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Price</span>
              <span className="text-sm font-semibold text-gray-900">{formatPrice(currentProduct.price)}</span>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                currentProduct.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentProduct.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

        {/* Additional Information */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Additional Information</h2>
          
          <div className="space-y-4">
            <div>
              <span className="text-sm font-medium text-gray-600 block mb-2">Description</span>
              <p className="text-sm text-gray-900 bg-gray-50 p-3 rounded-lg">
                {currentProduct.description || 'No description available'}
              </p>
            </div>
            
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-600">Created Date</span>
              <span className="text-sm text-gray-900">{formatDate(currentProduct.createdAt)}</span>
              </div>
            
            <div className="flex justify-between items-center py-2">
              <span className="text-sm font-medium text-gray-600">Last Updated</span>
              <span className="text-sm text-gray-900">{formatDate(currentProduct.updatedAt)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;