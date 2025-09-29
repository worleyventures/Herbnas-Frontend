import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiDocumentText,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiBell,
  HiExclamationTriangle,
  HiChartBar,
  HiPencil,
  HiCloudArrowUp,
  HiTag,
  HiHeart,
  HiUser,
  HiCalendar,
  HiEye,
  HiPlus
} from 'react-icons/hi2';
import { StatCard, Button, ActionButton, SearchInput, Select, Pagination, ImportModal, HealthIssueDetailsModal } from '../common';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  getAllHealthIssues,
  createHealthIssue,
  updateHealthIssue,
  deleteHealthIssue,
  getHealthIssueStats
} from '../../redux/actions/healthActions';
import { clearError, clearSuccess } from '../../redux/slices/healthSlice';

const HealthDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedHealthIssue, setSelectedHealthIssue] = useState(null);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('all');
  const [filterMaritalStatus, setFilterMaritalStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const {
    healthIssues: allHealthIssues = [],
    loading = false,
    error = null,
    stats = null,
    statsLoading = false,
    createLoading = false,
    updateLoading = false,
    deleteLoading = false,
    createSuccess = null,
    updateSuccess = null,
    deleteSuccess = null,
    suggestedProducts = [],
    availableProducts = [],
    suggestionLoading = false,
    suggestionError = null,
    suggestionSuccess = null,
    pagination = {
      currentPage: 1,
      totalPages: 1,
      totalHealthIssues: 0,
      hasNextPage: false,
      hasPrevPage: false
    }
  } = useSelector((state) => state.health);

  // Filter options
  const genderOptions = [
    { value: 'all', label: 'All Genders' },
    { value: 'male', label: 'Male' },
    { value: 'female', label: 'Female' },
    { value: 'both', label: 'Both' }
  ];

  const maritalStatusOptions = [
    { value: 'all', label: 'All Marital Status' },
    { value: 'married', label: 'Married' },
    { value: 'unmarried', label: 'Unmarried' },
    { value: 'both', label: 'Both' }
  ];

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getAllHealthIssues({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        gender: filterGender !== 'all' ? filterGender : undefined,
        maritalStatus: filterMaritalStatus !== 'all' ? filterMaritalStatus : undefined
      }));
      dispatch(getHealthIssueStats());
    }
  }, [dispatch, isAuthenticated, currentPage, itemsPerPage, searchTerm, filterGender, filterMaritalStatus]);

  // Clear success messages after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccess());
    }, 3000);

    return () => clearTimeout(timer);
  }, [dispatch, createSuccess, updateSuccess, deleteSuccess]);

  // Use real health issues data from Redux
  const healthIssues = Array.isArray(allHealthIssues) ? allHealthIssues : 
                       (allHealthIssues && Array.isArray(allHealthIssues.healthIssues)) ? allHealthIssues.healthIssues :
                       (allHealthIssues && Array.isArray(allHealthIssues.data)) ? allHealthIssues.data : [];

  // Filter health issues based on search and filters (client-side filtering for additional refinement)
  const filteredHealthIssues = healthIssues.filter(issue => {
    const matchesSearch = !searchTerm || 
      issue.healthIssue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesGender = filterGender === 'all' || issue.gender === filterGender;
    const matchesMaritalStatus = filterMaritalStatus === 'all' || issue.maritalStatus === filterMaritalStatus;
    
    return matchesSearch && matchesGender && matchesMaritalStatus;
  });

  // Use server-side pagination from Redux
  const totalPages = pagination.totalPages || 1;
  const paginatedHealthIssues = filteredHealthIssues;

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
  const handleDeleteHealthIssue = (issue) => {
    if (window.confirm(`Are you sure you want to delete "${issue.healthIssue}"?`)) {
      dispatch(deleteHealthIssue(issue._id))
        .then(() => {
          // Refresh the data
          dispatch(getAllHealthIssues({ 
            page: currentPage, 
            limit: itemsPerPage,
            search: searchTerm,
            gender: filterGender !== 'all' ? filterGender : undefined,
            maritalStatus: filterMaritalStatus !== 'all' ? filterMaritalStatus : undefined
          }));
          dispatch(addNotification({
            type: 'success',
            message: 'Health issue deleted successfully!'
          }));
        })
        .catch(() => {
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to delete health issue. Please try again.'
          }));
        });
    }
  };

  // Handle resolve health issue
  const handleResolveHealthIssue = (issue) => {
    const updatedIssue = {
      ...issue,
      isResolved: true,
      resolvedDate: new Date().toISOString(),
      resolvedBy: user?._id
    };

    dispatch(updateHealthIssue({ id: issue._id, healthIssue: updatedIssue }))
      .then(() => {
        // Refresh the data
        dispatch(getAllHealthIssues({ 
          page: currentPage, 
          limit: itemsPerPage,
          search: searchTerm,
          gender: filterGender !== 'all' ? filterGender : undefined,
          maritalStatus: filterMaritalStatus !== 'all' ? filterMaritalStatus : undefined
        }));
        dispatch(addNotification({
          type: 'success',
          message: 'Health issue resolved successfully!'
        }));
      })
      .catch(() => {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to resolve health issue. Please try again.'
        }));
      });
  };

  // Handle reopen health issue
  const handleReopenHealthIssue = (issue) => {
    const updatedIssue = {
      ...issue,
      isResolved: false,
      resolvedDate: null,
      resolvedBy: null
    };

    dispatch(updateHealthIssue({ id: issue._id, healthIssue: updatedIssue }))
      .then(() => {
        // Refresh the data
        dispatch(getAllHealthIssues({ 
          page: currentPage, 
          limit: itemsPerPage,
          search: searchTerm,
          gender: filterGender !== 'all' ? filterGender : undefined,
          maritalStatus: filterMaritalStatus !== 'all' ? filterMaritalStatus : undefined
        }));
        dispatch(addNotification({
          type: 'success',
          message: 'Health issue reopened successfully!'
        }));
      })
      .catch(() => {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to reopen health issue. Please try again.'
        }));
      });
  };

  // Handle create health issue

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <HiExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Health Issues</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="gradient" size="xs">Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Health Issues Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage health conditions and product recommendations
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button
            onClick={() => setShowImportModal(true)}
            icon={HiCloudArrowUp}
            variant="warning"
            size="sm"
          >
            Import Health Issues
          </Button>
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
              onChange={(value) => handleFilterChange('gender', value)}
              options={genderOptions}
              placeholder="Filter by gender"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={filterMaritalStatus}
              onChange={(value) => handleFilterChange('maritalStatus', value)}
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
            currentPage={pagination.currentPage || currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={pagination.totalHealthIssues || filteredHealthIssues.length}
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
