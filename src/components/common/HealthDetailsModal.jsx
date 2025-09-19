import React from 'react';
import { HiXMark, HiUser, HiHeart, HiCalendar, HiUserGroup, HiClock, HiCheckCircle, HiXCircle } from 'react-icons/hi2';
import { Modal, Badge } from './index';

const HealthDetailsModal = ({ isOpen, onClose, healthIssue }) => {
  if (!healthIssue) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'male':
        return '♂';
      case 'female':
        return '♀';
      case 'both':
        return '⚥';
      default:
        return '👤';
    }
  };

  const getMaritalStatusIcon = (status) => {
    switch (status) {
      case 'married':
        return '💍';
      case 'unmarried':
        return '💔';
      case 'both':
        return '💕';
      default:
        return '💑';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Health Issue Details"
      size="lg"
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {healthIssue.healthIssue}
            </h2>
            <div className="flex items-center space-x-2">
              <Badge
                variant={healthIssue.isActive ? 'success' : 'danger'}
                size="sm"
              >
                {healthIssue.isActive ? 'Active' : 'Inactive'}
              </Badge>
              {healthIssue.leadCount !== undefined && (
                <Badge variant="info" size="sm">
                  {healthIssue.leadCount} Lead{healthIssue.leadCount !== 1 ? 's' : ''}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Gender</label>
              <div className="flex items-center mt-1">
                <span className="text-2xl mr-2">{getGenderIcon(healthIssue.gender)}</span>
                <span className="text-gray-900 font-semibold capitalize">
                  {healthIssue.gender}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Marital Status</label>
              <div className="flex items-center mt-1">
                <span className="text-2xl mr-2">{getMaritalStatusIcon(healthIssue.maritalStatus)}</span>
                <span className="text-gray-900 font-semibold capitalize">
                  {healthIssue.maritalStatus}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Age Range</label>
              <div className="flex items-center mt-1">
                <HiCalendar className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-semibold">
                  {healthIssue.fromAge} - {healthIssue.toAge} years
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Age Span</label>
              <div className="flex items-center mt-1">
                <HiUserGroup className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900 font-semibold">
                  {healthIssue.toAge - healthIssue.fromAge + 1} years
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Metadata</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {healthIssue.createdBy && (
              <div>
                <label className="text-sm font-medium text-gray-500">Created By</label>
                <div className="flex items-center mt-1">
                  <HiUser className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {healthIssue.createdBy.firstName} {healthIssue.createdBy.lastName}
                  </span>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  {healthIssue.createdBy.email}
                </div>
              </div>
            )}
            
            {healthIssue.updatedBy && (
              <div>
                <label className="text-sm font-medium text-gray-500">Updated By</label>
                <div className="flex items-center mt-1">
                  <HiUser className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-gray-900">
                    {healthIssue.updatedBy.firstName} {healthIssue.updatedBy.lastName}
                  </span>
                </div>
                <div className="text-xs text-gray-500 ml-6">
                  {healthIssue.updatedBy.email}
                </div>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium text-gray-500">Created At</label>
              <div className="flex items-center mt-1">
                <HiClock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {formatDate(healthIssue.createdAt)}
                </span>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-500">Updated At</label>
              <div className="flex items-center mt-1">
                <HiClock className="h-4 w-4 text-gray-400 mr-2" />
                <span className="text-gray-900">
                  {formatDate(healthIssue.updatedAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Information */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              {healthIssue.isActive ? (
                <HiCheckCircle className="h-5 w-5 text-green-500 mr-2" />
              ) : (
                <HiXCircle className="h-5 w-5 text-red-500 mr-2" />
              )}
              <span className="text-sm font-medium text-gray-700">
                {healthIssue.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            
            {healthIssue.leadCount !== undefined && (
              <div className="flex items-center">
                <HiUserGroup className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-sm font-medium text-gray-700">
                  Associated with {healthIssue.leadCount} lead{healthIssue.leadCount !== 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default HealthDetailsModal;

