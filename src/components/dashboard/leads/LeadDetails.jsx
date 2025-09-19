import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiArrowLeft,
  HiUser,
  HiPhone,
  HiEnvelope,
  HiMapPin,
  HiCalendar,
  HiBuildingOffice2,
  HiHeart,
  HiShoppingBag,
  HiCreditCard,
  HiBell,
  HiPencil,
  HiClock,
  HiCheckCircle,
  HiExclamationTriangle,
  HiStar,
  HiSparkles,
  HiHome,
  HiShieldCheck,
  HiChartBar,
  HiEye,
  HiChatBubbleLeftRight
} from 'react-icons/hi2';
import { Badge, Button } from '../../common';

const LeadDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  
  // Get lead data from Redux state
  const leads = useSelector((state) => state.leads?.leads || []);
  const branches = useSelector((state) => state.branches?.branches || []);
  const users = useSelector((state) => state.user?.users || []);
  const products = useSelector((state) => state.products?.activeProducts || []);
  
  // Find the specific lead
  const lead = leads.find(l => l._id === id);
  
  if (!lead) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <HiExclamationTriangle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Lead Not Found</h2>
          <p className="text-gray-600 mb-6">The lead you're looking for doesn't exist or has been removed.</p>
          <Button
            onClick={() => navigate('/leads')}
            variant="primary"
            size="xs"
            className="inline-flex items-center"
          >
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Back to Leads
          </Button>
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

  const getStatusColor = (status) => {
    return 'bg-white text-gray-800 border border-gray-200';
  };

  const getPriorityColor = (priority) => {
    return 'bg-white text-gray-800 border border-gray-200';
  };

  const getBranchName = (branchId) => {
    if (!branchId) return 'N/A';
    if (typeof branchId === 'string') {
      const branch = branches.find(b => b._id === branchId);
      return branch ? (branch.branchName || branch.name) : branchId;
    }
    return branchId.branchName || branchId.name || 'N/A';
  };

  const getUserName = (userId) => {
    if (!userId) return 'N/A';
    if (typeof userId === 'string') {
      const user = users.find(u => u._id === userId);
      return user ? `${user.firstName} ${user.lastName}` : userId;
    }
    return `${userId.firstName} ${userId.lastName}` || 'N/A';
  };

  const getProductNames = (productIds) => {
    if (!productIds || productIds.length === 0) return ['N/A'];
    return productIds.map(id => {
      if (typeof id === 'string') {
        const product = products.find(p => p._id === id);
        return product ? product.productName || product.name : id;
      }
      return id.productName || id.name || 'Unknown Product';
    });
  };

  const InfoSection = ({ title, icon: Icon, children, className = "" }) => {
    return (
      <div className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center mb-3">
          <div className="p-1.5 bg-gray-50 rounded-md mr-2">
            <Icon className="h-4 w-4 text-gray-600" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
        {children}
      </div>
    );
  };

  const InfoRow = ({ label, value, className = "", icon: Icon, compact = false }) => (
    <div className={`flex items-center ${compact ? 'py-1.5' : 'py-2'} border-b border-gray-100 last:border-b-0 ${className}`}>
      {Icon && (
        <div className="flex-shrink-0 w-6 h-6 bg-gray-50 rounded-md flex items-center justify-center mr-2">
          <Icon className="h-3 w-3 text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <dt className="text-xs font-medium text-gray-600">{label}</dt>
        <dd className="text-sm font-semibold text-gray-800 break-words">{value || 'N/A'}</dd>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}}></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}}></div>
        <div className="absolute top-40 left-1/2 w-80 h-80 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}}></div>
      </div>

      {/* Hero Section */}
      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-8">

          {/* Lead Header */}
          <div className="relative">
            <div className="absolute inset-0 rounded-2xl blur-xl" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}}></div>
            <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-2xl">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-4 lg:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-105 transition-transform duration-300" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}}>
                      <HiUser className="h-8 w-8 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center shadow-lg" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}}>
                      <HiCheckCircle className="h-3 w-3 text-white" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-3">
                      <h1 className="text-3xl font-bold text-gray-900">{lead.customerName}</h1>
                      <div className="px-3 py-1 rounded-full" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}}>
                        <span className="text-xs font-semibold text-white">{lead.leadStatus?.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-gray-700">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">{lead.customerMobile}</span>
                      </div>
                      {lead.customerEmail && (
                        <div className="flex items-center space-x-2">
                          <span className="text-lg font-semibold">{lead.customerEmail}</span>
                        </div>
                      )}
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-semibold">{formatDate(lead.leadDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-3">
                  <div className="text-right">
                    <p className="text-xs font-medium text-gray-600 mb-1">Priority</p>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{lead.priority?.toUpperCase() || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Personal & Contact */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)', opacity: 0.1}}></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Personal Information</h2>
                    <p className="text-gray-600 text-sm">Customer details and contact information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Full Name</p>
                          <p className="text-lg font-bold text-gray-900">{lead.customerName}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Mobile Number</p>
                          <p className="text-lg font-bold text-gray-900">{lead.customerMobile}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Email Address</p>
                          <p className="text-lg font-bold text-gray-900">{lead.customerEmail || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Age</p>
                          <p className="text-lg font-bold text-gray-900">{lead.age || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)', opacity: 0.1}}></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Address Information</h2>
                    <p className="text-gray-600 text-sm">Location and address details</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Street Address</p>
                          <p className="text-lg font-bold text-gray-900">{lead.address?.street || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">City</p>
                          <p className="text-lg font-bold text-gray-900">{lead.address?.city || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">State</p>
                          <p className="text-lg font-bold text-gray-900">{lead.address?.state || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Pin Code</p>
                          <p className="text-lg font-bold text-gray-900">{lead.address?.pinCode || 'Not provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Health & Products */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)', opacity: 0.1}}></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Health & Products</h2>
                    <p className="text-gray-600 text-sm">Medical and product information</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Health Issues</p>
                          {lead.healthIssues && lead.healthIssues.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {lead.healthIssues.map((issue, index) => (
                                <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium border border-red-200">
                                  {issue}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No health issues recorded</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="group/item">
                      <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all duration-300">
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-600 mb-1">Products</p>
                          {getProductNames(lead.products).length > 0 ? (
                            <div className="space-y-1">
                              {getProductNames(lead.products).map((product, index) => (
                                <div key={index} className="flex items-center space-x-2 p-1 bg-gray-100 rounded-md">
                                  <HiShoppingBag className="h-3 w-3 text-gray-600" />
                                  <span className="text-gray-900 text-sm">{product}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 text-sm">No products selected</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Info & Actions */}
          <div className="space-y-6">
            {/* Lead Status & Priority */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)', opacity: 0.1}}></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Lead Status</h2>
                    <p className="text-gray-600 text-sm">Status and priority</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">Status</span>
                      <div className="px-2 py-1 style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}} rounded-full">
                        <span className="text-xs font-semibold text-white">{lead.leadStatus?.replace('_', ' ').toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div className="style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}} h-1.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-medium text-gray-600">Priority</span>
                      <div className="px-2 py-1 style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)'}} rounded-full">
                        <span className="text-xs font-semibold text-white">{lead.priority?.toUpperCase() || 'N/A'}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-gray-900">{lead.priority?.toUpperCase() || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Assignment & System */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)', opacity: 0.1}}></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-1">Assignment</h2>
                    <p className="text-gray-600 text-sm">Branch and system info</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Branch</p>
                        <p className="text-lg font-bold text-gray-900">{getBranchName(lead.dispatchedFrom)}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center">
                        <HiUser className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Created By</p>
                        <p className="text-lg font-bold text-gray-900">{getUserName(lead.createdBy)}</p>
                      </div>
                    </div>
                  </div>
                  
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="relative group">
              <div className="absolute inset-0 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500" style={{background: 'linear-gradient(135deg, #a3c663, #6d8f35)', opacity: 0.1}}></div>
              <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl p-6 border border-gray-200/50 shadow-2xl group-hover:shadow-3xl transition-all duration-500">
                <div className="flex items-center mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-1">Payment</h2>
                    <p className="text-gray-600 text-sm">Payment details and information</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Payment Type</p>
                        <p className="text-lg font-bold text-gray-900">{lead.payment?.paymentType || 'prepaid'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Payment Mode</p>
                        <p className="text-lg font-bold text-gray-900">{lead.payment?.paymentMode || 'gpay'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Payment Date</p>
                        <p className="text-lg font-bold text-gray-900">{lead.payment?.paymentDate ? formatDate(lead.payment.paymentDate) : 'September 17, 2025'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LeadDetails;
