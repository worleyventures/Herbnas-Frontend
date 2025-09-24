import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiUser,
  HiPhone,
  HiEnvelope,
  HiCalendar,
  HiMapPin,
  HiHome,
  HiFlag,
  HiTag,
  HiHeart,
  HiShoppingBag,
  HiCreditCard,
  HiBanknotes,
  HiBuildingOffice2,
  HiChatBubbleLeftRight,
  HiExclamationTriangle,
  HiChevronDown,
  HiChevronUp
} from 'react-icons/hi2';
import { Button } from '../../common';
// import { getLeadById } from '../../../redux/actions/leadActions';

const LeadDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const dispatch = useDispatch();
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    address: true,
    health: true,
    payment: true
  });
  
  // Get lead data from Redux state
  const { selectedLead, loading } = useSelector((state) => state.leads);
  
  // Temporary mock data for testing
  const lead = selectedLead || {
    _id: '12345',
    customerName: 'John Doe',
    customerMobile: '+1234567890',
    customerEmail: 'john@example.com',
    leadStatus: 'new_lead',
    priority: 'high',
    leadDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    age: 30,
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      pinCode: '10001'
    },
    healthIssues: ['Diabetes', 'Hypertension'],
    products: [
      { productName: 'Product 1' },
      { productName: 'Product 2' }
    ],
    payment: {
      paymentType: 'Prepaid',
      paymentMode: 'GPay',
      paymentDate: new Date().toISOString()
    },
    dispatchedFrom: 'branch123',
    createdBy: 'user456'
  };
  
  useEffect(() => {
    if (id) {
      // dispatch(getLeadById(id));
    }
  }, [dispatch, id]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading lead details...</p>
        </div>
      </div>
    );
  }
  
  if (!lead) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Lead Not Found</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The lead you're looking for doesn't exist or has been removed from the system.
            </p>
            <Button
              onClick={() => navigate('/leads')}
              variant="primary"
              size="sm"
              className="w-full"
            >
              Back to Leads
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

  const getBranchName = (branchId) => {
    // This would typically come from Redux state or API
    return branchId ? `Branch ${branchId.slice(-4)}` : 'N/A';
  };

  const getUserName = (userId) => {
    // This would typically come from Redux state or API
    return userId ? `User ${userId.slice(-4)}` : 'N/A';
  };

  const getProductNames = (products) => {
    if (!products || !Array.isArray(products)) return [];
    return products.map(product => product.productName || product.name || 'Unknown Product');
  };

  const getStatusConfig = (status) => {
    const configs = {
      new_lead: { color: 'bg-blue-100 text-blue-800 border-blue-200', label: 'New Lead', icon: HiUser },
      qualified: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Qualified', icon: HiUser },
      unqualified: { color: 'bg-red-100 text-red-800 border-red-200', label: 'Unqualified', icon: HiUser },
      order_completed: { color: 'bg-purple-100 text-purple-800 border-purple-200', label: 'Order Completed', icon: HiUser }
    };
    return configs[status] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Unknown', icon: HiUser };
  };

  const getPriorityConfig = (priority) => {
    const configs = {
      high: { color: 'bg-red-100 text-red-800 border-red-200', label: 'High', icon: HiChevronUp },
      medium: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', label: 'Medium', icon: HiChevronDown },
      low: { color: 'bg-green-100 text-green-800 border-green-200', label: 'Low', icon: HiChevronDown }
    };
    return configs[priority] || { color: 'bg-gray-100 text-gray-800 border-gray-200', label: 'Normal', icon: HiChevronDown };
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

  const StatusBadge = ({ status, priority }) => {
    const statusConfig = getStatusConfig(status);
    const priorityConfig = getPriorityConfig(priority);
    
    return (
      <div className="flex items-center space-x-3">
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.color}`}>
          <statusConfig.icon className="h-4 w-4 mr-1" />
          {statusConfig.label}
        </div>
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${priorityConfig.color}`}>
          <priorityConfig.icon className="h-4 w-4 mr-1" />
          {priorityConfig.label}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Lead Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <HiUser className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{lead.customerName}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <HiPhone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">{lead.customerMobile}</span>
                        </div>
                        {lead.customerEmail && (
                          <div className="flex items-center space-x-2">
                            <HiEnvelope className="h-4 w-4 text-gray-500" />
                            <span className="text-gray-700 font-medium">{lead.customerEmail}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <StatusBadge status={lead.leadStatus} priority={lead.priority} />
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoCard
                    icon={HiCalendar}
                    label="Lead Date"
                    value={formatDate(lead.leadDate)}
                  />
                  <InfoCard
                    icon={HiBuildingOffice2}
                    label="Branch"
                    value={getBranchName(lead.dispatchedFrom)}
                  />
                  <InfoCard
                    icon={HiUser}
                    label="Created By"
                    value={getUserName(lead.createdBy)}
                  />
                </div>
              </div>
            </div>

            {/* Personal Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Personal Information"
                icon={HiUser}
                isExpanded={expandedSections.personal}
                onToggle={() => toggleSection('personal')}
                count={4}
              />
              {expandedSections.personal && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={HiUser}
                      label="Full Name"
                      value={lead.customerName}
                    />
                    <InfoCard
                      icon={HiPhone}
                      label="Mobile Number"
                      value={lead.customerMobile}
                    />
                    <InfoCard
                      icon={HiEnvelope}
                      label="Email Address"
                      value={lead.customerEmail || 'Not provided'}
                    />
                    <InfoCard
                      icon={HiCalendar}
                      label="Age"
                      value={lead.age ? `${lead.age} years` : 'Not specified'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Address Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Address Information"
                icon={HiMapPin}
                isExpanded={expandedSections.address}
                onToggle={() => toggleSection('address')}
                count={4}
              />
              {expandedSections.address && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={HiHome}
                      label="Street Address"
                      value={lead.address?.street || 'Not provided'}
                    />
                    <InfoCard
                      icon={HiMapPin}
                      label="City"
                      value={lead.address?.city || 'Not specified'}
                    />
                    <InfoCard
                      icon={HiFlag}
                      label="State"
                      value={lead.address?.state || 'Not specified'}
                    />
                    <InfoCard
                      icon={HiTag}
                      label="Pin Code"
                      value={lead.address?.pinCode || 'Not provided'}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Health & Products Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Health & Products"
                icon={HiHeart}
                isExpanded={expandedSections.health}
                onToggle={() => toggleSection('health')}
                count={(lead.healthIssues?.length || 0) + (getProductNames(lead.products).length || 0)}
              />
              {expandedSections.health && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <HiHeart className="h-4 w-4 mr-2 text-red-500" />
                        Health Issues
                      </h4>
                      {lead.healthIssues && lead.healthIssues.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {lead.healthIssues.map((issue, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium border border-red-200">
                              {issue}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No health issues recorded</p>
                      )}
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                        <HiShoppingBag className="h-4 w-4 mr-2 text-blue-500" />
                        Products
                      </h4>
                      {getProductNames(lead.products).length > 0 ? (
                        <div className="space-y-2">
                          {getProductNames(lead.products).map((product, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg">
                              <HiShoppingBag className="h-4 w-4 text-gray-600" />
                              <span className="text-gray-900 text-sm font-medium">{product}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm italic">No products selected</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Payment Information"
                icon={HiCreditCard}
                isExpanded={expandedSections.payment}
                onToggle={() => toggleSection('payment')}
                count={3}
              />
              {expandedSections.payment && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <InfoCard
                      icon={HiCreditCard}
                      label="Payment Type"
                      value={lead.payment?.paymentType || 'Prepaid'}
                      subValue="Payment method"
                    />
                    <InfoCard
                      icon={HiBanknotes}
                      label="Payment Mode"
                      value={lead.payment?.paymentMode || 'GPay'}
                      subValue="Payment platform"
                    />
                    <InfoCard
                      icon={HiCalendar}
                      label="Payment Date"
                      value={lead.payment?.paymentDate ? formatDate(lead.payment.paymentDate) : 'Not specified'}
                      subValue="Transaction date"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Actions & Summary */}
          <div className="space-y-6">

            {/* Lead Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Lead ID</span>
                  <span className="text-sm font-medium text-gray-900">{lead._id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(lead.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(lead.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Priority</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getPriorityConfig(lead.priority).color}`}>
                    {getPriorityConfig(lead.priority).label}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact Actions</h3>
              <div className="space-y-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiPhone className="h-4 w-4 mr-2" />
                  Call {lead.customerMobile}
                </Button>
                {lead.customerEmail && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start"
                  >
                    <HiEnvelope className="h-4 w-4 mr-2" />
                    Email {lead.customerEmail}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiChatBubbleLeftRight className="h-4 w-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetails;

