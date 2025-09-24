import React from 'react';
import {
  HiXMark,
  HiExclamationTriangle,
  HiUser,
  HiBuildingOffice2,
  HiCalendar,
  HiTag,
  HiCheckCircle,
  HiXCircle,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import Button from './Button';

const HealthIssueDetailsModal = ({ 
  isOpen, 
  onClose, 
  healthIssue, 
  onEdit, 
  onDelete,
  onResolve,
  onReopen
}) => {
  if (!isOpen || !healthIssue) return null;

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

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isResolved) => {
    return isResolved 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return '🔴';
      case 'high':
        return '🟠';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-red-500/10 to-orange-600/10 flex items-center justify-center">
                <HiExclamationTriangle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Health Issue Details</h2>
                <p className="text-sm text-gray-600">View and manage health issue information</p>
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
            {/* Health Issue Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-red-500 to-orange-600 flex items-center justify-center text-white text-2xl">
                {getSeverityIcon(healthIssue.severity)}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {healthIssue.title || 'Health Issue'}
                </h3>
                <p className="text-sm text-gray-600">
                  {healthIssue.description || 'No description available'}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(healthIssue.severity)}`}>
                    {healthIssue.severity?.charAt(0).toUpperCase() + healthIssue.severity?.slice(1)} Severity
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(healthIssue.isResolved)}`}>
                    {healthIssue.isResolved ? 'Resolved' : 'Open'}
                  </span>
                </div>
              </div>
            </div>

            {/* Health Issue Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiExclamationTriangle className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Title</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {healthIssue.title || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiTag className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Category</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {healthIssue.category || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Branch</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {healthIssue.branch?.branchName || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status & Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Status & Management</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCheckCircle className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Status</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {healthIssue.isResolved ? 'Resolved' : 'Open'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiUser className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Reported By</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {healthIssue.reportedBy ? 
                          `${healthIssue.reportedBy.firstName} ${healthIssue.reportedBy.lastName}` : 
                          'Unknown User'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiUser className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Assigned To</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {healthIssue.assignedTo ? 
                          `${healthIssue.assignedTo.firstName} ${healthIssue.assignedTo.lastName}` : 
                          'Unassigned'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Important Dates</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Reported Date</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(healthIssue.reportedDate)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Last Updated</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(healthIssue.lastUpdated)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Resolution</h4>
                
                <div className="space-y-3">
                  {healthIssue.resolvedDate && (
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiCheckCircle className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Resolved Date</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {formatDate(healthIssue.resolvedDate)}
                        </p>
                      </div>
                    </div>
                  )}

                  {healthIssue.resolvedBy && (
                    <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                      <HiUser className="h-5 w-5 text-gray-400" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-gray-600">Resolved By</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {healthIssue.resolvedBy.firstName} {healthIssue.resolvedBy.lastName}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description and Resolution Notes */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Details</h4>
              <div className="p-4 bg-gray-50 rounded-lg space-y-3">
                {healthIssue.description && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Description:</p>
                    <p className="text-sm text-gray-700">{healthIssue.description}</p>
                  </div>
                )}
                {healthIssue.resolutionNotes && (
                  <div>
                    <p className="text-xs font-medium text-gray-600 mb-1">Resolution Notes:</p>
                    <p className="text-sm text-gray-700">{healthIssue.resolutionNotes}</p>
                  </div>
                )}
              </div>
            </div>

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
                    onEdit(healthIssue);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiPencil className="h-4 w-4" />
                  <span>Edit Issue</span>
                </Button>
              )}
              {healthIssue.isResolved ? (
                onReopen && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      onReopen(healthIssue);
                      onClose();
                    }}
                    className="px-4 py-2 flex items-center space-x-2"
                  >
                    <HiXCircle className="h-4 w-4" />
                    <span>Reopen Issue</span>
                  </Button>
                )
              ) : (
                onResolve && (
                  <Button
                    variant="success"
                    onClick={() => {
                      onResolve(healthIssue);
                      onClose();
                    }}
                    className="px-4 py-2 flex items-center space-x-2"
                  >
                    <HiCheckCircle className="h-4 w-4" />
                    <span>Resolve Issue</span>
                  </Button>
                )
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  onClick={() => {
                    onDelete(healthIssue);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Delete Issue</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthIssueDetailsModal;
