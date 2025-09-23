import React from 'react';
import {
  HiXMark,
  HiUser,
  HiEnvelope,
  HiPhone,
  HiBuildingOffice2,
  HiShieldCheck,
  HiCalendar,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import Button from './Button';

const UserDetailsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800';
      case 'manager':
        return 'bg-blue-100 text-blue-800';
      case 'employee':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-indigo-600/10 flex items-center justify-center">
                <HiUser className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">User Details</h2>
                <p className="text-sm text-gray-600">View and manage user information</p>
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
            {/* User Profile Section */}
            <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                {user.firstName?.charAt(0)?.toUpperCase()}{user.lastName?.charAt(0)?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {user.role?.charAt(0).toUpperCase() + user.role?.slice(1)}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(user.isActive)}`}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* User Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Basic Information</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiUser className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Full Name</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiEnvelope className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Email</p>
                      <p className="text-sm font-semibold text-gray-900">{user.email || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiPhone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Phone</p>
                      <p className="text-sm font-semibold text-gray-900">{user.phone || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Role & Status */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Role & Status</h4>
                
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiShieldCheck className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Role</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiBuildingOffice2 className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Branch</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {user.branch?.branchName || 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                    <HiCalendar className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-xs font-medium text-gray-600">Created</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            {user.address && (
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Address</h4>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700">{user.address}</p>
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
                    onEdit(user);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiPencil className="h-4 w-4" />
                  <span>Edit User</span>
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="danger"
                  onClick={() => {
                    onDelete(user);
                    onClose();
                  }}
                  className="px-4 py-2 flex items-center space-x-2"
                >
                  <HiTrash className="h-4 w-4" />
                  <span>Delete User</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
