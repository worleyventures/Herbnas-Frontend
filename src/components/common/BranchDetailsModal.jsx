import React from 'react';
import {
  HiXMark,
  HiBuildingOffice2,
  HiMapPin,
  HiPhone,
  HiEnvelope,
  HiUser,
  HiCalendar,
  HiCheckCircle,
  HiXCircle,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import Button from './Button';

const BranchDetailsModal = ({ 
  isOpen, 
  onClose, 
  branch, 
  onEdit, 
  onDelete,
  onActivate,
  onDisable
}) => {
  if (!isOpen || !branch) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-600/10 flex items-center justify-center">
                <HiBuildingOffice2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Branch Details</h2>
                <p className="text-sm text-gray-600">View and manage branch information</p>
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
            {/* Branch Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white text-xl font-bold">
                <HiBuildingOffice2 className="h-8 w-8" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {branch.branchName}
                </h3>
                <p className="text-sm text-gray-600">{branch.address}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(branch.isActive)}`}>
                    {branch.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Branch Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Branch Name</p>
                      <p className="text-sm font-semibold text-gray-900">{branch.branchName || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiMapPin className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Address</p>
                      <p className="text-sm font-semibold text-gray-900">{branch.address || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiPhone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{branch.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact & Management */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Contact & Management</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiEnvelope className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{branch.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiUser className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Manager</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {branch.manager ? 
                          `${branch.manager.firstName} ${branch.manager.lastName}` : 
                          'N/A'
                        }
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Created</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(branch.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {branch.description && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Description</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{branch.description}</p>
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
                    onEdit(branch);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiPencil className="h-4 w-4" />
                  <span>Edit Branch</span>
                </Button>
              )}
              {branch.isActive ? (
                onDisable && (
                  <Button
                    variant="warning"
                    onClick={() => {
                      onDisable(branch);
                      onClose();
                    }}
                    className="px-4 py-2 flex items-center space-x-2"
                  >
                    <HiXCircle className="h-4 w-4" />
                    <span>Disable Branch</span>
                  </Button>
                )
              ) : (
                onActivate && (
                  <Button
                    variant="success"
                    onClick={() => {
                      onActivate(branch);
                      onClose();
                    }}
                    className="px-4 py-2 flex items-center space-x-2"
                  >
                    <HiCheckCircle className="h-4 w-4" />
                    <span>Activate Branch</span>
                  </Button>
                )
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  onClick={() => {
                    onDelete(branch);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Delete Branch</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetailsModal;
