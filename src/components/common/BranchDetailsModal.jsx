import React from 'react';
import { HiBuildingOffice2, HiMapPin, HiCog6Tooth, HiUsers, HiCalendar, HiXMark, HiUser } from 'react-icons/hi2';
import { Modal, StatusBadge } from './index';

const BranchDetailsModal = ({ isOpen, onClose, branch, branchUsers = [], branchUsersLoading = false }) => {
  if (!branch) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatRole = (role) => {
    if (!role) return 'N/A';
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getRoleColor = (role) => {
    const colors = {
      'admin': 'bg-red-100 text-red-800',
      'super_admin': 'bg-purple-100 text-purple-800',
      'supervisor': 'bg-blue-100 text-blue-800',
      'sales_executive': 'bg-green-100 text-green-800',
      'production_manager': 'bg-yellow-100 text-yellow-800',
      'accounts_manager': 'bg-indigo-100 text-indigo-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const details = [
    {
      label: 'Branch Name',
      value: branch.branchName,
      icon: HiBuildingOffice2,
      color: 'text-blue-600'
    },
    {
      label: 'Branch Code',
      value: branch.branchCode,
      icon: HiCog6Tooth,
      color: 'text-gray-600'
    },
    {
      label: 'Address',
      value: branch.branchAddress,
      icon: HiMapPin,
      color: 'text-[#22c55e]-600'
    },
    {
      label: 'Incentive Type',
      value: `${branch.incentiveType}%`,
      icon: HiCog6Tooth,
      color: 'text-purple-600'
    },
    {
      label: 'Status',
      value: (
        <StatusBadge 
          status={branch.isActive ? 'active' : 'inactive'}
          variant={branch.isActive ? 'success' : 'danger'}
        />
      ),
      icon: HiUsers,
      color: 'text-indigo-600'
    },
    {
      label: 'Created At',
      value: formatDate(branch.createdAt),
      icon: HiCalendar,
      color: 'text-gray-600'
    },
    {
      label: 'Updated At',
      value: formatDate(branch.updatedAt),
      icon: HiCalendar,
      color: 'text-gray-600'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Branch Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Branch Header */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            <div className="h-16 w-16 rounded-lg bg-indigo-100 flex items-center justify-center">
              <HiBuildingOffice2 className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-semibold text-gray-900">{branch.branchName}</h3>
            <p className="text-sm text-gray-600">{branch.branchCode}</p>
            <div className="mt-2">
              <StatusBadge 
                status={branch.isActive ? 'active' : 'inactive'}
                variant={branch.isActive ? 'success' : 'danger'}
              />
            </div>
          </div>
        </div>

        {/* Branch Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {details.map((detail, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className={`flex-shrink-0 ${detail.color}`}>
                <detail.icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <dt className="text-sm font-medium text-gray-500">{detail.label}</dt>
                <dd className="mt-1 text-sm text-gray-900">{detail.value}</dd>
              </div>
            </div>
          ))}
        </div>

        {/* Address Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">Branch Location</h4>
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 text-[#22c55e]-600">
              <HiMapPin className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900 leading-relaxed">{branch.branchAddress}</p>
            </div>
          </div>
        </div>

        {/* Assigned Users Section */}
        <div className="border-t border-gray-200 pt-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <HiUsers className="h-5 w-5 mr-2 text-indigo-600" />
            Assigned Users ({branchUsers.length})
          </h4>
          
          {branchUsersLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              <span className="ml-2 text-gray-600">Loading users...</span>
            </div>
          ) : branchUsers.length > 0 ? (
            <div className="space-y-3">
              {branchUsers.map((user) => (
                <div key={user._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
                        <span className="text-sm font-bold text-white">
                          {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {user.firstName} {user.lastName}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                      {formatRole(user.role)}
                    </span>
                    <StatusBadge 
                      status={user.isActive ? 'active' : 'inactive'}
                      variant={user.isActive ? 'success' : 'danger'}
                      className="text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <HiUser className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500 text-sm">No users assigned to this branch</p>
              <p className="text-gray-400 text-xs mt-1">Users can be assigned to this branch from the Users page</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]"
          >
            <HiXMark className="h-4 w-4 mr-2" />
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default BranchDetailsModal;
