import React from 'react';
import {
  HiXMark,
  HiUser,
  HiEnvelope,
  HiPhone,
  HiBuildingOffice2,
  HiCalendar,
  HiTag,
  HiExclamationTriangle,
  HiCheckCircle,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import Button from './Button';

const LeadDetailsModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !lead) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new_lead':
        return 'bg-blue-100 text-blue-800';
      case 'not_answered':
        return 'bg-yellow-100 text-yellow-800';
      case 'qualified':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-orange-100 text-orange-800';
      case 'order_completed':
        return 'bg-green-100 text-green-800';
      case 'unqualified':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new_lead':
        return 'New Lead';
      case 'not_answered':
        return 'Not Answered';
      case 'qualified':
        return 'Qualified';
      case 'pending':
        return 'Pending';
      case 'order_completed':
        return 'Order Completed';
      case 'unqualified':
        return 'Unqualified';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />
        
        {/* Modal */}
        <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-red-600/10 flex items-center justify-center">
                <HiUser className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Lead Details</h2>
                <p className="text-sm text-gray-600">View and manage lead information</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiXMark className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Lead Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white text-xl font-bold">
                {lead.firstName?.charAt(0)?.toUpperCase()}{lead.lastName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {lead.firstName} {lead.lastName}
                </h3>
                <p className="text-sm text-gray-600">{lead.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(lead.priority)}`}>
                    {lead.priority?.charAt(0).toUpperCase() + lead.priority?.slice(1)} Priority
                  </span>
                </div>
              </div>
            </div>

            {/* Lead Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Contact Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiUser className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {lead.firstName} {lead.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiEnvelope className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiPhone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{lead.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lead Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Lead Details</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Status</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {getStatusLabel(lead.status)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiExclamationTriangle className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Priority</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {lead.priority?.charAt(0).toUpperCase() + lead.priority?.slice(1) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Assigned Branch</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {lead.branch?.branchName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dates */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Important Dates</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Created</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(lead.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Last Contact</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(lead.lastContactDate)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Additional Info</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiUser className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Assigned To</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {lead.assignedTo ? 
                          `${lead.assignedTo.firstName} ${lead.assignedTo.lastName}` : 
                          'Unassigned'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Source</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {lead.source || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Comments */}
            {(lead.notes || lead.comments) && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notes & Comments</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  {lead.notes && (
                    <div className="mb-3">
                      <p className="text-xs font-medium text-gray-600 mb-1">Notes:</p>
                      <p className="text-sm text-gray-700">{lead.notes}</p>
                    </div>
                  )}
                  {lead.comments && (
                    <div>
                      <p className="text-xs font-medium text-gray-600 mb-1">Comments:</p>
                      <p className="text-sm text-gray-700">{lead.comments}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={onClose}
                className="px-4 py-2"
              >
                Close
              </Button>
              {onEdit && (
                <Button
                  variant="primary"
                  onClick={() => {
                    onEdit(lead);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiPencil className="h-4 w-4" />
                  <span>Edit Lead</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  onClick={() => {
                    onDelete(lead);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Delete Lead</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadDetailsModal;
