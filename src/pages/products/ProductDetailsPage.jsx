import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiArrowLeft,
  HiDocumentText,
  HiTag,
  HiCurrencyDollar,
  HiCube,
  HiCog6Tooth,
  HiCalendar,
  HiExclamationTriangle,
  HiPencil,
  HiPrinter,
  HiShare,
  HiChevronUp,
  HiChevronDown
} from 'react-icons/hi2';
import { Button } from '../../components/common';

const ProductDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    production: true,
    inventory: true
  });
  
  // Get product data from Redux state
  const products = useSelector((state) => state.products?.products || []);
  
  // Find the specific product
  const product = products.find(p => p._id === id);
  
  if (!product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The product you're looking for doesn't exist or has been removed from the system.
            </p>
            <Button
              onClick={() => navigate('/products')}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back to Products
            </Button>
          </div>
        </div>
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

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getProductionStatusColor = (status) => {
    const colors = {
      not_in_production: 'bg-gray-100 text-gray-800 border-gray-200',
      in_process: 'bg-blue-100 text-blue-800 border-blue-200',
      completed: 'bg-green-100 text-green-800 border-green-200',
      on_hold: 'bg-yellow-100 text-yellow-800 border-yellow-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const SectionHeader = ({ title, icon: Icon, isExpanded, onToggle, count, className = "" }) => (
    <div 
      className={`flex items-center justify-between p-4 bg-white border border-gray-200 rounded-t-lg cursor-pointer hover:bg-gray-50 transition-colors ${className}`}
      onClick={onToggle}
    >
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {count !== undefined && (
            <p className="text-sm text-gray-500">{count} items</p>
          )}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        {count !== undefined && count > 0 && (
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
            {count}
          </span>
        )}
        {isExpanded ? (
          <HiChevronUp className="h-5 w-5 text-gray-400" />
        ) : (
          <HiChevronDown className="h-5 w-5 text-gray-400" />
        )}
      </div>
    </div>
  );

  const InfoCard = ({ icon: Icon, label, value, subValue, className = "" }) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-gray-100 rounded-lg flex-shrink-0">
          <Icon className="h-5 w-5 text-gray-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className="text-lg font-semibold text-gray-900 truncate">{value || 'N/A'}</p>
          {subValue && (
            <p className="text-sm text-gray-500 mt-1">{subValue}</p>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/products')}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <HiArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Product Details</h1>
                <p className="text-sm text-gray-500">Product ID: {product._id?.slice(-8) || 'N/A'}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <HiPrinter className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <HiShare className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => navigate(`/products/edit/${product._id}`)}
                variant="primary"
                size="sm"
                className="flex items-center"
              >
                <HiPencil className="h-4 w-4 mr-2" />
                Edit Product
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Product Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <HiDocumentText className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{product.productName}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <HiTag className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">{product.batchNumber}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <HiCurrencyDollar className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">₹{product.price}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getProductionStatusColor(product.productionStatus)}`}>
                    {product.productionStatus?.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoCard
                    icon={HiCalendar}
                    label="Created Date"
                    value={formatDate(product.createdAt)}
                  />
                  <InfoCard
                    icon={HiCube}
                    label="Weight"
                    value={product.weight ? `${product.weight}g` : 'N/A'}
                  />
                  <InfoCard
                    icon={HiTag}
                    label="Quantity"
                    value={product.quantity?.toString() || 'N/A'}
                  />
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Basic Information"
                icon={HiDocumentText}
                isExpanded={expandedSections.basic}
                onToggle={() => toggleSection('basic')}
                count={6}
              />
              {expandedSections.basic && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={HiDocumentText}
                      label="Product Name"
                      value={product.productName}
                    />
                    <InfoCard
                      icon={HiTag}
                      label="Batch Number"
                      value={product.batchNumber}
                    />
                    <InfoCard
                      icon={HiCurrencyDollar}
                      label="Price"
                      value={`₹${product.price}`}
                      subValue="Per unit"
                    />
                    <InfoCard
                      icon={HiCube}
                      label="Weight"
                      value={product.weight ? `${product.weight}g` : 'Not specified'}
                    />
                    <InfoCard
                      icon={HiTag}
                      label="Quantity"
                      value={product.quantity?.toString() || 'N/A'}
                      subValue="Available units"
                    />
                    <InfoCard
                      icon={HiCog6Tooth}
                      label="Production Stage"
                      value={product.productionStage || 'N/A'}
                    />
                  </div>
                  
                  {product.description && (
                    <div className="mt-6">
                      <h4 className="text-sm font-semibold text-gray-900 mb-3">Description</h4>
                      <p className="text-gray-700 bg-gray-50 rounded-lg p-4">{product.description}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Production Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Production Information"
                icon={HiCog6Tooth}
                isExpanded={expandedSections.production}
                onToggle={() => toggleSection('production')}
                count={2}
              />
              {expandedSections.production && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={HiCog6Tooth}
                      label="Production Status"
                      value={product.productionStatus?.replace('_', ' ').toUpperCase() || 'N/A'}
                      subValue="Current production status"
                    />
                    <InfoCard
                      icon={HiTag}
                      label="Production Stage"
                      value={product.productionStage || 'N/A'}
                      subValue="Current stage in production"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Product Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Product Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Product ID</span>
                  <span className="text-sm font-medium text-gray-900">{product._id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(product.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(product.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getProductionStatusColor(product.productionStatus)}`}>
                    {product.productionStatus?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/products/edit/${product._id}`)}
                  variant="primary"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiPencil className="h-4 w-4 mr-2" />
                  Edit Product
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiPrinter className="h-4 w-4 mr-2" />
                  Print Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiShare className="h-4 w-4 mr-2" />
                  Share Product
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage;
