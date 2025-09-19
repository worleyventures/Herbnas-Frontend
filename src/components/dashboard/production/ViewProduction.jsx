import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiArrowLeft,
  HiDocumentText,
  HiCurrencyDollar,
  HiCube,
  HiCog6Tooth,
  HiCheckCircle,
  HiClock,
  HiPause,
  HiPlay,
  HiCalendar,
  HiUser
} from 'react-icons/hi2';
import { Button } from '../../common';
import { getProductById } from '../../../redux/actions/productActions';

const ViewProduction = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Load product data
  useEffect(() => {
    if (id && isAuthenticated) {
      console.log('🔍 Loading product data for ID:', id);
      dispatch(getProductById(id)).then((result) => {
        if (result.type === 'products/getProductById/fulfilled') {
          console.log('✅ Product loaded successfully:', result.payload.data.product);
          setProduct(result.payload.data.product);
        } else {
          console.error('❌ Failed to load product:', result.payload);
        }
        setLoading(false);
      });
    }
  }, [id, dispatch, isAuthenticated]);


  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case 'in-process':
        return {
          icon: HiPlay,
          color: 'text-blue-500',
          bgColor: 'bg-blue-100',
          textColor: 'text-blue-800',
          label: 'In Process'
        };
      case 'on-hold':
        return {
          icon: HiPause,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-100',
          textColor: 'text-yellow-800',
          label: 'On Hold'
        };
      case 'completed':
        return {
          icon: HiCheckCircle,
          color: 'text-green-500',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          label: 'Completed'
        };
      default:
        return {
          icon: HiClock,
          color: 'text-gray-500',
          bgColor: 'bg-gray-100',
          textColor: 'text-gray-800',
          label: 'Not In Production'
        };
    }
  };

  // Get stage info
  const getStageInfo = (stage) => {
    const stages = {
      'F1': { name: 'Raw Material Preparation', color: 'bg-blue-500' },
      'F2': { name: 'Initial Processing', color: 'bg-indigo-500' },
      'F3': { name: 'Formulation', color: 'bg-purple-500' },
      'F4': { name: 'Quality Control', color: 'bg-yellow-500' },
      'F5': { name: 'Packaging', color: 'bg-orange-500' },
      'F6': { name: 'Final Inspection', color: 'bg-green-500' }
    };
    return stages[stage] || { name: 'Unknown Stage', color: 'bg-gray-500' };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading production details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HiDocumentText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Product not found</h3>
          <p className="text-gray-500 mb-4">The production item you're looking for doesn't exist.</p>
          <Button onClick={() => navigate('/production')} variant="gradient">
            Back to Production
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo(product.productionStatus);
  const stageInfo = getStageInfo(product.productionStage);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-6">

        {/* Content */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <HiDocumentText className="h-5 w-5 mr-2 text-[#22c55e]" />
                Product Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Product Name</label>
                  <p className="text-gray-900 font-medium">{product.productName}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Batch Number</label>
                  <p className="text-gray-900 font-medium">{product.batchNumber}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                  <div className="flex items-center space-x-1">
                    <HiCurrencyDollar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">₹{product.price?.toLocaleString() || '0'}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Weight</label>
                  <div className="flex items-center space-x-1">
                    <HiCube className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{product.weight || '0'}g</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                  <div className="flex items-center space-x-1">
                    <HiCube className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-900 font-medium">{product.quantity || '0'}</span>
                  </div>
                </div>
              </div>
              
              {product.description && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <p className="text-gray-900">{product.description}</p>
                </div>
              )}
            </div>

            {/* Production Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                <HiCog6Tooth className="h-5 w-5 mr-2 text-[#22c55e]" />
                Production Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Stage</label>
                  <div className="flex items-center space-x-2">
                    <div className={`w-6 h-6 ${stageInfo.color} rounded flex items-center justify-center`}>
                      <HiCog6Tooth className="h-3 w-3 text-white" />
                    </div>
                    <span className="text-gray-900 font-medium">{product.productionStage} - {stageInfo.name}</span>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Production Status</label>
                  <div className="flex items-center space-x-2">
                    <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bgColor} ${statusInfo.textColor}`}>
                      {statusInfo.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Overview</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Stage Progress</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.productionStage} of 6
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(parseInt(product.productionStage?.replace('F', '')) / 6) * 100}%` }}
                  ></div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <div className="flex items-center space-x-1">
                    <statusInfo.icon className={`h-4 w-4 ${statusInfo.color}`} />
                    <span className="text-sm font-medium text-gray-900">{statusInfo.label}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Details</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <HiCalendar className="h-4 w-4" />
                  <span>Created: {new Date(product.createdAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <HiCalendar className="h-4 w-4" />
                  <span>Updated: {new Date(product.updatedAt).toLocaleDateString()}</span>
                </div>
                
                {product.createdBy && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <HiUser className="h-4 w-4" />
                    <span>Created by: {product.createdBy.firstName} {product.createdBy.lastName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ViewProduction;
