import React from 'react';
import {
  HiXMark,
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
  HiExclamationTriangle
} from 'react-icons/hi2';
import { Modal, Badge } from './index';

const LeadDetailsModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  branches = [], 
  users = [], 
  products = [] 
}) => {
  if (!lead) return null;

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
    const colors = {
      new_lead: 'bg-blue-100 text-blue-800',
      not_answered: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      pending: 'bg-orange-100 text-orange-800',
      order_completed: 'bg-[#22c55e]-100 text-[#22c55e]-800',
      unqualified: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-yellow-100 text-yellow-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
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
        return product ? product.name : id;
      }
      return id.name || 'Unknown Product';
    });
  };

  const InfoSection = ({ title, icon: Icon, children, className = "" }) => {
    return (
      <div className={`bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200 ${className}`}>
        <div className="flex items-center mb-4">
          <div className="p-2 bg-gray-50 rounded-lg mr-3">
            <Icon className="h-5 w-5 text-gray-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        </div>
        {children}
      </div>
    );
  };

  const InfoRow = ({ label, value, className = "", icon: Icon }) => (
    <div className={`flex items-center py-3 border-b border-gray-100 last:border-b-0 ${className}`}>
      {Icon && (
        <div className="flex-shrink-0 w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center mr-3">
          <Icon className="h-4 w-4 text-gray-500" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <dt className="text-sm font-medium text-gray-600 mb-1">{label}</dt>
        <dd className="text-sm font-semibold text-gray-800 break-words">{value || 'N/A'}</dd>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Details"
      size="4xl"
      className="max-h-[90vh] overflow-y-auto"
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-8 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
                  <HiUser className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-1">{lead.customerName}</h2>
                  <div className="flex items-center space-x-4 text-white/90">
                    <div className="flex items-center space-x-1">
                      <HiPhone className="h-4 w-4" />
                      <span className="text-lg">{lead.customerMobile}</span>
                    </div>
                    {lead.customerEmail && (
                      <div className="flex items-center space-x-1">
                        <HiEnvelope className="h-4 w-4" />
                        <span className="text-lg">{lead.customerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>
            
            <div className="flex items-center space-x-3">
              <Badge 
                className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(lead.leadStatus)} shadow-lg`}
              >
                {lead.leadStatus?.replace('_', ' ').toUpperCase()}
              </Badge>
              {lead.priority && (
                <Badge 
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${getPriorityColor(lead.priority)} shadow-lg`}
                >
                  {lead.priority.toUpperCase()} PRIORITY
                </Badge>
              )}
              <div className="flex items-center space-x-1 text-white/80">
                <HiCalendar className="h-4 w-4" />
                <span className="text-sm">Lead Date: {formatDate(lead.leadDate)}</span>
              </div>
            </div>
          </div>
          
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-12 -translate-x-12"></div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <InfoSection title="Personal Information" icon={HiUser}>
            <div className="space-y-1">
              <InfoRow label="Full Name" value={lead.customerName} icon={HiUser} />
              <InfoRow label="Age" value={lead.age} />
              <InfoRow label="Gender" value={lead.gender} />
              <InfoRow label="Marital Status" value={lead.maritalStatus} />
            </div>
          </InfoSection>

          {/* Contact Information */}
          <InfoSection title="Contact Information" icon={HiPhone}>
            <div className="space-y-1">
              <InfoRow label="Mobile" value={lead.customerMobile} icon={HiPhone} />
              <InfoRow label="Email" value={lead.customerEmail} icon={HiEnvelope} />
              <InfoRow label="Lead Date" value={formatDate(lead.leadDate)} icon={HiCalendar} />
            </div>
          </InfoSection>

          {/* Address Information */}
          <InfoSection title="Address Information" icon={HiMapPin}>
            <div className="space-y-1">
              <InfoRow label="Street" value={lead.address?.street} icon={HiMapPin} />
              <InfoRow label="City" value={lead.address?.city} />
              <InfoRow label="State" value={lead.address?.state} />
              <InfoRow label="Pin Code" value={lead.address?.pinCode} />
              <InfoRow label="Country" value={lead.address?.country || 'India'} />
            </div>
          </InfoSection>

          {/* Health Information */}
          <InfoSection title="Health Information" icon={HiHeart}>
            <div className="space-y-3">
              {lead.healthIssues && lead.healthIssues.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {lead.healthIssues.map((issue, index) => (
                    <Badge key={index} className="bg-red-100 text-red-800 px-3 py-1 text-sm font-medium rounded-full shadow-sm">
                      {issue}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <HiHeart className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <span className="text-sm text-gray-500">No health issues recorded</span>
                </div>
              )}
            </div>
          </InfoSection>

          {/* Products */}
          <InfoSection title="Products" icon={HiShoppingBag}>
            <div className="space-y-2">
              {getProductNames(lead.products).map((product, index) => (
                <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
                  <HiShoppingBag className="h-5 w-5 text-gray-600" />
                  <span className="text-sm font-medium text-gray-800">{product}</span>
                </div>
              ))}
            </div>
          </InfoSection>

          {/* Payment Information */}
          {lead.payment && (
            <InfoSection title="Payment Information" icon={HiCreditCard}>
              <div className="space-y-1">
                <InfoRow label="Payment Type" value={lead.payment.paymentType} icon={HiCreditCard} />
                <InfoRow label="Payment Mode" value={lead.payment.paymentMode} />
                <InfoRow label="Payment Date" value={formatDate(lead.payment.paymentDate)} icon={HiCalendar} />
                <InfoRow label="Payment Note" value={lead.payment.paymentNote} />
              </div>
            </InfoSection>
          )}

          {/* Assignment Information */}
          <InfoSection title="Assignment" icon={HiBuildingOffice2}>
            <div className="space-y-1">
              <InfoRow label="Branch" value={getBranchName(lead.dispatchedFrom)} icon={HiBuildingOffice2} />
              <InfoRow label="Created By" value={getUserName(lead.createdBy)} icon={HiUser} />
              <InfoRow label="Updated By" value={getUserName(lead.updatedBy)} icon={HiUser} />
            </div>
          </InfoSection>

          {/* System Information */}
          <InfoSection title="System Information" icon={HiClock}>
            <div className="space-y-1">
              <InfoRow label="Created At" value={formatDateTime(lead.createdAt)} icon={HiClock} />
              <InfoRow label="Updated At" value={formatDateTime(lead.updatedAt)} icon={HiClock} />
              <InfoRow label="Lead ID" value={lead._id} />
            </div>
          </InfoSection>
        </div>

        {/* Notes Section */}
        {lead.notes && (
          <InfoSection title="Notes" icon={HiPencil}>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                  <HiPencil className="h-4 w-4 text-gray-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{lead.notes}</p>
                </div>
              </div>
            </div>
          </InfoSection>
        )}

        {/* Reminders Section */}
        {lead.reminders && lead.reminders.length > 0 && (
          <InfoSection title="Reminders" icon={HiBell}>
            <div className="space-y-4">
              {lead.reminders.map((reminder, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <HiCalendar className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <span className="text-sm font-semibold text-gray-900">
                          {formatDate(reminder.date)}
                        </span>
                        {reminder.completed && reminder.completedAt && (
                          <p className="text-xs text-gray-500">
                            Completed on {formatDateTime(reminder.completedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {reminder.completed ? (
                        <Badge className="bg-[#22c55e]-100 text-[#22c55e]-800 px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
                          <HiCheckCircle className="h-3 w-3" />
                          <span>Completed</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1 text-xs font-medium rounded-full flex items-center space-x-1">
                          <HiClock className="h-3 w-3" />
                          <span>Pending</span>
                        </Badge>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed ml-11">{reminder.note}</p>
                </div>
              ))}
            </div>
          </InfoSection>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default LeadDetailsModal;
