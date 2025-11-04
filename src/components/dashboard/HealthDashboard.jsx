import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiDocumentText,
  HiCheckCircle,
  HiUser,
  HiHeart,
  HiEye,
  HiPencil,
  HiXCircle,
  HiPlus
} from 'react-icons/hi2';
import { StatCard, Button, ActionButton, SearchInput, Select, Pagination, HealthIssueDetailsModal } from '../common';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  getAllHealthIssues,
  createHealthIssue,
  updateHealthIssue,
  deleteHealthIssue,
  getHealthIssueStats
} from '../../redux/actions/healthActions';

const HealthDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const healthIssueState = useSelector((state) => state.health);
  const { healthIssues, loading, error, stats, statsLoading } = healthIssueState;

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterMaritalStatus, setFilterMaritalStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [selectedHealthIssue, setSelectedHealthIssue] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load health issues and stats on component mount
  useEffect(() => {
    dispatch(getAllHealthIssues({ page: 1, limit: 1000 }));
    dispatch(getHealthIssueStats());
  }, [dispatch]);

  // Refresh health issues when navigating to this page (e.g., returning from edit form)
  useEffect(() => {
    if (location.pathname === '/health-issues') {
      dispatch(getAllHealthIssues({ page: 1, limit: 1000 }));
      dispatch(getHealthIssueStats());
    }
  }, [location.pathname, dispatch]);

  // Filter health issues based on search and filters
  const filteredHealthIssues = healthIssues.filter(issue => {
    const matchesSearch = !searchTerm || 
      issue.healthIssue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = filterGender === 'all' || issue.gender === filterGender;
    const matchesMaritalStatus = filterMaritalStatus === 'all' || issue.maritalStatus === filterMaritalStatus;
    
    return matchesSearch && matchesGender && matchesMaritalStatus;
  });

  // Use server-side pagination from Redux
  const totalPages = Math.ceil(filteredHealthIssues.length / itemsPerPage);
  const paginatedHealthIssues = filteredHealthIssues.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'gender':
        setFilterGender(value);
        break;
      case 'maritalStatus':
        setFilterMaritalStatus(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Handle health issue selection
  const handleSelectHealthIssue = (issue) => {
    setSelectedHealthIssue(issue);
  };

  // Handle view health issue
  const handleViewHealthIssue = (issue) => {
    setSelectedHealthIssue(issue);
    setShowHealthModal(true);
  };

  // Handle edit health issue
  const handleEditHealthIssue = (issue) => {
    navigate(`/health-issues/edit/${issue._id}`, {
      state: { 
        healthIssue: issue,
        returnTo: '/health-issues'
      }
    });
  };

  // Handle delete health issue
  const handleDeleteHealthIssue = async (issue) => {
    if (window.confirm(`Are you sure you want to delete "${issue.healthIssue}"?`)) {
      try {
        await dispatch(deleteHealthIssue(issue._id)).unwrap();
        
        dispatch(addNotification({
          type: 'success',
          title: 'Health Issue Deleted',
          message: 'Health issue has been deleted successfully',
          duration: 3000
        }));

        // Refresh data
        dispatch(getAllHealthIssues({ page: 1, limit: 1000 }));
        dispatch(getHealthIssueStats());
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: error.message || 'Failed to delete health issue',
          duration: 5000
        }));
      }
    }
  };

  // Handle resolve health issue
  const handleResolveHealthIssue = async (issue) => {
    try {
      await dispatch(updateHealthIssue({
        healthIssueId: issue._id,
        healthIssueData: { isActive: false }
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Health Issue Resolved',
        message: 'Health issue has been marked as resolved',
        duration: 3000
      }));

      // Refresh data
      dispatch(getAllHealthIssues({ page: 1, limit: 1000 }));
      dispatch(getHealthIssueStats());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update health issue',
        duration: 5000
      }));
    }
  };

  // Handle reopen health issue
  const handleReopenHealthIssue = async (issue) => {
    try {
      await dispatch(updateHealthIssue({
        healthIssueId: issue._id,
        healthIssueData: { isActive: true }
      })).unwrap();
      
      dispatch(addNotification({
        type: 'success',
        title: 'Health Issue Reopened',
        message: 'Health issue has been reopened',
        duration: 3000
      }));

      // Refresh data
      dispatch(getAllHealthIssues({ page: 1, limit: 1000 }));
      dispatch(getHealthIssueStats());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Update Failed',
        message: error.message || 'Failed to update health issue',
        duration: 5000
      }));
    }
  };


  // Gender options
  const genderOptions = [
    { value: 'all', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'both', label: 'Both' }
  ];

  // Marital status options
  const maritalStatusOptions = [
    { value: 'all', label: 'All Marital Status' },
    { value: 'married', label: 'Married' },
    { value: 'unmarried', label: 'Unmarried' },
    { value: 'both', label: 'Both' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Issues Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage health issues and their categories
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => navigate('/health-issues/create')}
            icon={HiPlus}
            variant="gradient"
            size="sm"
          >
            Add New Health Issue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Health Issues"
          value={stats?.overview?.totalHealthIssues || healthIssues.length}
          icon={HiDocumentText}
          gradient="green"
          animation="bounce"
          change="+5%"
          changeType="increase"
          loading={statsLoading || loading}
        />
        <StatCard
          title="Active Issues"
          value={stats?.overview?.activeHealthIssues || healthIssues.filter(i => i.isActive === true).length}
          icon={HiCheckCircle}
          gradient="emerald"
          animation="pulse"
          change="+2%"
          changeType="increase"
          loading={statsLoading || loading}
        />
        <StatCard
          title="Male Specific"
          value={stats?.genderDistribution?.find(g => g._id === 'male')?.count || healthIssues.filter(i => i.gender === 'male').length}
          icon={HiUser}
          gradient="blue"
          animation="float"
          change="+1%"
          changeType="increase"
          loading={statsLoading || loading}
        />
        <StatCard
          title="Female Specific"
          value={stats?.genderDistribution?.find(g => g._id === 'female')?.count || healthIssues.filter(i => i.gender === 'female').length}
          icon={HiHeart}
          gradient="pink"
          animation="bounce"
          change="+3%"
          changeType="increase"
          loading={statsLoading || loading}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search health issues..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
          <div className="w-full sm:w-48">
            <Select
              value={filterGender}
              onChange={(e) => handleFilterChange('gender', e.target.value)}
              options={genderOptions}
              placeholder="Filter by gender"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterMaritalStatus}
              onChange={(e) => handleFilterChange('maritalStatus', e.target.value)}
              options={maritalStatusOptions}
              placeholder="Filter by marital status"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health Issue
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="hidden md:table-cell px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marital Status
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age Range
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
                      <span className="ml-2 text-gray-500">Loading health issues...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedHealthIssues.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="text-center">
                      <HiDocumentText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No health issues found</h3>
                      <p className="text-gray-500 mb-4">
                        {searchTerm || filterGender !== 'all' || filterMaritalStatus !== 'all'
                          ? 'Try adjusting your search or filters'
                          : 'Get started by creating your first health issue'
                        }
                      </p>
                      {!searchTerm && filterGender === 'all' && filterMaritalStatus === 'all' && (
                        <Button
                          variant="gradient"
                          onClick={() => navigate('/health-issues/create')}
                          size="xs"
                          className="flex items-center mx-auto"
                        >
                          <HiPencil className="h-4 w-4 mr-2" />
                          Add Health Issue
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedHealthIssues.map((issue) => (
                  <tr key={issue._id} className="hover:bg-gray-50">
                    <td className="px-3 sm:px-4 py-3">
                      <div className="flex flex-col">
                        <div className="text-sm font-medium text-gray-900">
                          {issue.healthIssue}
                        </div>
                        {/* Mobile: Show additional info */}
                        <div className="sm:hidden mt-1 space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              issue.gender === 'male' 
                                ? 'bg-blue-100 text-blue-800'
                                : issue.gender === 'female'
                                ? 'bg-pink-100 text-pink-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {issue.gender === 'male' ? 'Male' : issue.gender === 'female' ? 'Female' : 'Both'}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              issue.maritalStatus === 'married' 
                                ? 'bg-green-100 text-green-800'
                                : issue.maritalStatus === 'unmarried'
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {issue.maritalStatus === 'married' ? 'Married' : issue.maritalStatus === 'unmarried' ? 'Unmarried' : 'Both'}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">
                            Age: {issue.fromAge} - {issue.toAge} years
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.gender === 'male' 
                          ? 'bg-blue-100 text-blue-800'
                          : issue.gender === 'female'
                          ? 'bg-pink-100 text-pink-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.gender === 'male' ? 'Male' : issue.gender === 'female' ? 'Female' : 'Both'}
                      </span>
                    </td>
                    <td className="hidden md:table-cell px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.maritalStatus === 'married' 
                          ? 'bg-green-100 text-green-800'
                          : issue.maritalStatus === 'unmarried'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {issue.maritalStatus === 'married' ? 'Married' : issue.maritalStatus === 'unmarried' ? 'Unmarried' : 'Both'}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell px-3 sm:px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                      {issue.fromAge} - {issue.toAge} years
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {issue.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <ActionButton
                          icon={HiEye}
                          onClick={() => handleViewHealthIssue(issue)}
                          variant="view"
                          size="sm"
                          title="View Details"
                        />
                        <ActionButton
                          icon={HiPencil}
                          onClick={() => handleEditHealthIssue(issue)}
                          variant="edit"
                          size="sm"
                          title="Edit"
                        />
                        <ActionButton
                          icon={HiXCircle}
                          onClick={() => handleDeleteHealthIssue(issue)}
                          variant="delete"
                          size="sm"
                          title="Delete"
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredHealthIssues.length}
          />
        </div>
      )}

      {/* Health Issue Details Modal */}
      <HealthIssueDetailsModal
        isOpen={showHealthModal}
        onClose={() => setShowHealthModal(false)}
        healthIssue={selectedHealthIssue}
        onEdit={handleEditHealthIssue}
        onDelete={handleDeleteHealthIssue}
        onResolve={handleResolveHealthIssue}
        onReopen={handleReopenHealthIssue}
      />

    </div>
  );
};

export default HealthDashboard;