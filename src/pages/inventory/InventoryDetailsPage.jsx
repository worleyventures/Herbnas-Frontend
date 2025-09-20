import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiArrowLeft,
  HiCube,
  HiBuildingOffice2,
  HiCalendar,
  HiExclamationTriangle,
  HiPencil,
  HiPrinter,
  HiShare,
  HiChevronUp,
  HiChevronDown,
  HiChartBar,
  HiTag,
  HiInformationCircle
} from 'react-icons/hi2';
import { Button } from '../../components/common';

const InventoryDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    items: true,
    stats: true
  });
  
  // Get inventory data from Redux state
  const inventory = useSelector((state) => state.inventory?.inventory || []);
  
  // Find the specific inventory item
  const inventoryItem = inventory.find(item => item._id === id);
  
  if (!inventoryItem) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Inventory Item Not Found</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The inventory item you're looking for doesn't exist or has been removed from the system.
            </p>
            <Button
              onClick={() => navigate('/inventory')}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back to Inventory
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

  const getStockStatus = (availableStock, minStockLevel) => {
    if (availableStock <= 0) {
      return { status: 'Out of Stock', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (availableStock <= minStockLevel) {
      return { status: 'Low Stock', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else {
      return { status: 'In Stock', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  const stockStatus = getStockStatus(inventoryItem.availableStock, inventoryItem.minStockLevel);

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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => navigate('/inventory')}
                variant="outline"
                size="sm"
                className="flex items-center"
              >
                <HiArrowLeft className="h-4 w-4 mr-2" />
                Back to Inventory
              </Button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Inventory Details</h1>
                <p className="text-sm text-gray-500">Inventory ID: {inventoryItem._id?.slice(-8) || 'N/A'}</p>
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
                onClick={() => navigate(`/inventory/edit/${inventoryItem._id}`)}
                variant="primary"
                size="sm"
                className="flex items-center"
              >
                <HiPencil className="h-4 w-4 mr-2" />
                Edit Inventory
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
            
            {/* Inventory Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <HiCube className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {inventoryItem.product?.productName || 'Product Name'}
                      </h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <HiTag className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">{inventoryItem.batchId}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <HiBuildingOffice2 className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">Batch</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${stockStatus.color}`}>
                    {stockStatus.status}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoCard
                    icon={HiCube}
                    label="Available Stock"
                    value={inventoryItem.availableStock}
                    subValue="Units in stock"
                  />
                  <InfoCard
                    icon={HiChartBar}
                    label="Min Stock Level"
                    value={inventoryItem.minStockLevel || 'N/A'}
                    subValue="Minimum threshold"
                  />
                  <InfoCard
                    icon={HiChartBar}
                    label="Max Stock Level"
                    value={inventoryItem.maxStockLevel || 'N/A'}
                    subValue="Maximum threshold"
                  />
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Basic Information"
                icon={HiCube}
                isExpanded={expandedSections.basic}
                onToggle={() => toggleSection('basic')}
                count={3}
              />
              {expandedSections.basic && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={HiTag}
                      label="Product Name"
                      value={inventoryItem.product?.productName || 'N/A'}
                    />
                    <InfoCard
                      icon={HiTag}
                      label="Batch ID"
                      value={inventoryItem.batchId}
                    />
                    <InfoCard
                      icon={HiInformationCircle}
                      label="Product Code"
                      value={inventoryItem.product?.productCode || 'N/A'}
                      className="md:col-span-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Stock Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Stock Information"
                icon={HiChartBar}
                isExpanded={expandedSections.stats}
                onToggle={() => toggleSection('stats')}
                count={3}
              />
              {expandedSections.stats && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard
                      icon={HiCube}
                      label="Available Stock"
                      value={inventoryItem.availableStock}
                      subValue="Current stock level"
                    />
                    <InfoCard
                      icon={HiChartBar}
                      label="Min Stock Level"
                      value={inventoryItem.minStockLevel || 'N/A'}
                      subValue="Low stock threshold"
                    />
                    <InfoCard
                      icon={HiChartBar}
                      label="Max Stock Level"
                      value={inventoryItem.maxStockLevel || 'N/A'}
                      subValue="High stock threshold"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Inventory Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Inventory Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Inventory ID</span>
                  <span className="text-sm font-medium text-gray-900">{inventoryItem._id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(inventoryItem.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(inventoryItem.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stock Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${stockStatus.color}`}>
                    {stockStatus.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/inventory/edit/${inventoryItem._id}`)}
                  variant="primary"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiPencil className="h-4 w-4 mr-2" />
                  Edit Inventory
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
                  Share Inventory
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetailsPage;
