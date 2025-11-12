import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  HiArrowLeft,
  HiBuildingOffice2,
  HiMapPin,
  HiCog6Tooth,
  HiCalendar,
  HiExclamationTriangle,
  HiPencil,
  HiPrinter,
  HiShare,
  HiChevronUp,
  HiChevronDown,
  HiUsers,
  HiChartBar
} from 'react-icons/hi2';
import { Button } from '../../components/common';

const BranchDetailsPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    settings: true,
    stats: true
  });
  
  // Get branch data from Redux state
  const branches = useSelector((state) => state.branches?.branches || []);
  
  // Find the specific branch
  const branch = branches.find(b => b._id === id);
  
  if (!branch) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <HiExclamationTriangle className="h-10 w-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Branch Not Found</h2>
            <p className="text-gray-600 mb-8 leading-relaxed">
              The branch you're looking for doesn't exist or has been removed from the system.
            </p>
            <Button
              onClick={() => navigate('/branches')}
              variant="primary"
              size="sm"
              className="w-full"
            >
              <HiArrowLeft className="h-4 w-4 mr-2" />
              Back to Branches
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

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800 border-green-200'
      : 'bg-red-100 text-red-800 border-red-200';
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

  return (
    <div className="min-h-screen bg-white">

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Branch Overview Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                      <HiBuildingOffice2 className="h-8 w-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{branch.branchName}</h2>
                      <div className="flex items-center space-x-4 mt-2">
                        <div className="flex items-center space-x-2">
                          <HiCog6Tooth className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">{branch.branchCode}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <HiMapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-700 font-medium">Branch Location</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(branch.isActive)}`}>
                    {branch.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <InfoCard
                    icon={HiCalendar}
                    label="Created Date"
                    value={formatDate(branch.createdAt)}
                  />
                  <InfoCard
                    icon={HiCog6Tooth}
                    label="Incentive Type (Count)"
                    value={branch.incentiveType !== undefined && branch.incentiveType !== null ? branch.incentiveType.toLocaleString('en-IN') : '0'}
                  />
                  <InfoCard
                    icon={HiUsers}
                    label="Status"
                    value={branch.isActive ? 'Active' : 'Inactive'}
                  />
                </div>
              </div>
            </div>

            {/* Basic Information Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Basic Information"
                icon={HiBuildingOffice2}
                isExpanded={expandedSections.basic}
                onToggle={() => toggleSection('basic')}
                count={3}
              />
              {expandedSections.basic && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={HiBuildingOffice2}
                      label="Branch Name"
                      value={branch.branchName}
                    />
                    <InfoCard
                      icon={HiCog6Tooth}
                      label="Branch Code"
                      value={branch.branchCode}
                    />
                    <InfoCard
                      icon={HiMapPin}
                      label="Branch Address"
                      value={
                        typeof branch.branchAddress === 'object' && branch.branchAddress !== null
                          ? `${branch.branchAddress.street || ''}, ${branch.branchAddress.city || ''}, ${branch.branchAddress.state || ''} - ${branch.branchAddress.pinCode || ''}`
                          : branch.branchAddress || 'N/A'
                      }
                      className="md:col-span-2"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <SectionHeader
                title="Branch Settings"
                icon={HiCog6Tooth}
                isExpanded={expandedSections.settings}
                onToggle={() => toggleSection('settings')}
                count={2}
              />
              {expandedSections.settings && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InfoCard
                      icon={HiChartBar}
                      label="Incentive Type"
                      value={branch.incentiveType ? `${branch.incentiveType}%` : 'N/A'}
                      subValue="Commission percentage"
                    />
                    <InfoCard
                      icon={HiCog6Tooth}
                      label="Status"
                      value={branch.isActive ? 'Active' : 'Inactive'}
                      subValue="Branch operational status"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="space-y-6">
            
            {/* Branch Summary */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Summary</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Branch ID</span>
                  <span className="text-sm font-medium text-gray-900">{branch._id?.slice(-8) || 'N/A'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Created</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(branch.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Last Updated</span>
                  <span className="text-sm font-medium text-gray-900">{formatDate(branch.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded-full ${getStatusColor(branch.isActive)}`}>
                    {branch.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Button
                  onClick={() => navigate(`/branches/edit/${branch._id}`)}
                  variant="primary"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiPencil className="h-4 w-4 mr-2" />
                  Edit Branch
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiPrinter className="h-4 w-4 mr-2" />
                  Print Details
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <HiShare className="h-4 w-4 mr-2" />
                  Share Branch
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BranchDetailsPage;

