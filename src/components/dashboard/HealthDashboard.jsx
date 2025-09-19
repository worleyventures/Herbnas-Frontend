import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiMagnifyingGlass,
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
import { StatCard, FilterCard, Button, SearchInput, Select, Pagination, ImportModal, Modal } from '../common';
import { addNotification } from '../../redux/slices/uiSlice';
import HealthForm from './health/HealthForm';
import {
  getAllHealthIssues,
  createHealthIssue,
  updateHealthIssue,
  deleteHealthIssue,
  getHealthIssueStats,
  addProductSuggestion,
  removeProductSuggestion,
  getSuggestedProducts,
  getProductsForSuggestion
} from '../../redux/actions/healthActions';
import { clearSuggestedProducts, clearError, clearSuccess } from '../../redux/slices/healthSlice';

const HealthDashboard = ({ showCreateModal, setShowCreateModal }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [selectedHealthIssue, setSelectedHealthIssue] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showProductSuggestionModal, setShowProductSuggestionModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [suggestionReason, setSuggestionReason] = useState('');
  const [suggestionPriority, setSuggestionPriority] = useState(1);
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
    setShowViewModal(true);
    // Load suggested products for this health issue
    dispatch(getSuggestedProducts(issue._id));
  };

  // Handle add product suggestion
  const handleAddProductSuggestion = () => {
    if (selectedHealthIssue && selectedProduct) {
      dispatch(addProductSuggestion({
        healthIssueId: selectedHealthIssue._id,
        productId: selectedProduct._id,
        suggestionReason: suggestionReason,
        priority: suggestionPriority
      }))
        .then(() => {
          // Show success toast
          dispatch(addNotification({
            type: 'success',
            title: 'Success',
            message: 'Product suggestion added successfully!',
            duration: 3000
          }));
          
          setShowProductSuggestionModal(false);
          setSelectedProduct(null);
          setSuggestionReason('');
          setSuggestionPriority(1);
          // Refresh suggested products for this specific health issue
          dispatch(getSuggestedProducts(selectedHealthIssue._id));
          // Refresh available products
          dispatch(getProductsForSuggestion({ healthIssueId: selectedHealthIssue._id }));
        })
        .catch(() => {
          // Show error toast
          dispatch(addNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to add product suggestion. Please try again.',
            duration: 3000
          }));
        });
    }
  };

  // Handle remove product suggestion
  const handleRemoveProductSuggestion = (productId) => {
    if (selectedHealthIssue) {
      dispatch(removeProductSuggestion({
        healthIssueId: selectedHealthIssue._id,
        productId: productId
      }))
        .then(() => {
          // Show success toast
          dispatch(addNotification({
            type: 'success',
            title: 'Success',
            message: 'Product suggestion removed successfully!',
            duration: 3000
          }));
          // Refresh suggested products for this specific health issue
          dispatch(getSuggestedProducts(selectedHealthIssue._id));
          // Refresh available products
          dispatch(getProductsForSuggestion({ healthIssueId: selectedHealthIssue._id }));
        })
        .catch(() => {
          // Show error toast
          dispatch(addNotification({
            type: 'error',
            title: 'Error',
            message: 'Failed to remove product suggestion. Please try again.',
            duration: 3000
          }));
        });
    }
  };

  // Handle open product suggestion modal
  const handleOpenProductSuggestionModal = () => {
    if (selectedHealthIssue) {
      setShowProductSuggestionModal(true);
      // Load available products for suggestion
      dispatch(getProductsForSuggestion({ healthIssueId: selectedHealthIssue._id }));
    }
  };

  // Handle edit health issue
  const handleEditHealthIssue = (issue) => {
    setSelectedHealthIssue(issue);
    setShowEditModal(true);
    // Load suggested products for this specific health issue
    dispatch(getSuggestedProducts(issue._id));
    // Load available products for suggestion
    dispatch(getProductsForSuggestion({ healthIssueId: issue._id }));
  };

  // Handle delete health issue
  const handleDeleteHealthIssue = (issue) => {
    setSelectedHealthIssue(issue);
    setShowDeleteModal(true);
  };

  // Handle update health issue
  const handleUpdateHealthIssue = (issueData) => {
    if (selectedHealthIssue) {
      dispatch(updateHealthIssue({ healthIssueId: selectedHealthIssue._id, healthIssueData: issueData }))
        .then((result) => {
          setShowEditModal(false);
          setSelectedHealthIssue(null);
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
            message: 'Health issue updated successfully!'
          }));
        })
        .catch((error) => {
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to update health issue. Please try again.'
          }));
        });
    }
  };

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (selectedHealthIssue) {
      dispatch(deleteHealthIssue(selectedHealthIssue._id))
        .then((result) => {
          setShowDeleteModal(false);
          setSelectedHealthIssue(null);
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
        .catch((error) => {
          dispatch(addNotification({
            type: 'error',
            message: 'Failed to delete health issue. Please try again.'
          }));
        });
    }
  };

  // Handle create health issue
  const handleCreateHealthIssueSubmit = (issueData) => {
    dispatch(createHealthIssue(issueData))
      .then(() => {
        setShowCreateModal(false);
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
          message: 'Health issue created successfully!'
        }));
      })
      .catch(() => {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to create health issue. Please try again.'
        }));
      });
  };

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HiExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Health Issues</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="gradient">Try Again</Button>
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
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={() => setShowImportModal(true)}
            icon={HiCloudArrowUp}
            variant="warning"
            size="md"
          >
            Import Health Issues
          </Button>
          <Button
            onClick={() => setShowCreateModal(true)}
            icon={HiPlus}
            variant="gradient"
            size="md"
          >
            Add New Health Issue
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Health Issues"
          value={stats?.overview?.totalHealthIssues || healthIssues.length}
          icon={HiDocumentText}
          iconBg="bg-gradient-to-br from-green-500 to-green-600"
          change="+5%"
          changeType="increase"
          loading={statsLoading || loading}
        />
        <StatCard
          title="Active Issues"
          value={stats?.overview?.activeHealthIssues || healthIssues.filter(i => i.isActive === true).length}
          icon={HiCheckCircle}
          iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
          change="+2%"
          changeType="increase"
          loading={statsLoading || loading}
        />
        <StatCard
          title="Male Specific"
          value={stats?.genderDistribution?.find(g => g._id === 'male')?.count || healthIssues.filter(i => i.gender === 'male').length}
          icon={HiUser}
          iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
          change="+1%"
          changeType="increase"
          loading={statsLoading || loading}
        />
        <StatCard
          title="Female Specific"
          value={stats?.genderDistribution?.find(g => g._id === 'female')?.count || healthIssues.filter(i => i.gender === 'female').length}
          icon={HiHeart}
          iconBg="bg-gradient-to-br from-red-500 to-red-600"
          change="+3%"
          changeType="increase"
          loading={statsLoading || loading}
        />
      </div>

      {/* Filters */}
      <FilterCard>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SearchInput
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search health issues..."
            icon={HiMagnifyingGlass}
          />
          <Select
            value={filterGender}
            onChange={(value) => handleFilterChange('gender', value)}
            options={genderOptions}
            placeholder="Filter by gender"
          />
          <Select
            value={filterMaritalStatus}
            onChange={(value) => handleFilterChange('maritalStatus', value)}
            options={maritalStatusOptions}
            placeholder="Filter by marital status"
          />
        </div>
      </FilterCard>

      {/* Main Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex space-x-3">
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Health Issue
                </th>
                <th className="hidden sm:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Gender
                </th>
                <th className="hidden md:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Marital Status
                </th>
                <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Age Range
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                          onClick={() => setShowCreateModal(true)}
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
                    <td className="px-3 sm:px-6 py-4">
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
                    <td className="hidden sm:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
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
                    <td className="hidden md:table-cell px-3 sm:px-6 py-4 whitespace-nowrap">
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
                    <td className="hidden lg:table-cell px-3 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {issue.fromAge} - {issue.toAge} years
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        issue.isActive 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {issue.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex flex-wrap gap-1 sm:gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHealthIssue(issue)}
                          className="text-green-600 hover:text-green-900"
                          title="View Details"
                        >
                          <HiEye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditHealthIssue(issue)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit"
                        >
                          <HiPencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteHealthIssue(issue)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <HiXCircle className="h-4 w-4" />
                        </Button>
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

      {/* Modals */}
      {showCreateModal && (
        <HealthForm
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateHealthIssueSubmit}
          title="Create New Health Issue"
          submitText="Create Health Issue"
          loading={createLoading}
        />
      )}

      {showEditModal && selectedHealthIssue && (
        <HealthForm
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedHealthIssue(null);
            // Clear product suggestions when closing edit modal
            dispatch(clearSuggestedProducts());
          }}
          onSubmit={handleUpdateHealthIssue}
          title="Edit Health Issue"
          submitText="Update Health Issue"
          initialData={selectedHealthIssue}
          loading={updateLoading}
          // Product suggestion props
          suggestedProducts={suggestedProducts}
          availableProducts={availableProducts}
          onAddProductSuggestion={handleOpenProductSuggestionModal}
          onRemoveProductSuggestion={handleRemoveProductSuggestion}
          selectedProduct={selectedProduct}
          setSelectedProduct={setSelectedProduct}
          suggestionReason={suggestionReason}
          setSuggestionReason={setSuggestionReason}
          suggestionPriority={suggestionPriority}
          setSuggestionPriority={setSuggestionPriority}
          suggestionLoading={suggestionLoading}
          suggestionError={suggestionError}
        />
      )}

      {showDeleteModal && selectedHealthIssue && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSelectedHealthIssue(null);
          }}
          title="Delete Health Issue"
          size="sm"
        >
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <HiExclamationTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete "{selectedHealthIssue.healthIssue}"? This action cannot be undone.
            </div>
            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedHealthIssue(null);
                }}
              >
                Cancel
              </Button>
              <Button
                variant="gradient"
                onClick={handleDeleteConfirm}
                className="bg-red-600 hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </div>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {showViewModal && selectedHealthIssue && (
        <Modal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedHealthIssue(null);
          }}
          title="Health Issue Details"
          size="lg"
        >
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-[#22c55e] bg-opacity-10 flex items-center justify-center mr-3">
                    <HiHeart className="h-5 w-5 text-[#22c55e]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{selectedHealthIssue.healthIssue}</h4>
                    <p className="text-sm text-gray-500">Health Issue</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Gender</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedHealthIssue.gender}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Marital Status</label>
                    <p className="text-sm text-gray-900 capitalize">{selectedHealthIssue.maritalStatus}</p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Age Range</label>
                  <p className="text-sm text-gray-900">{selectedHealthIssue.fromAge} - {selectedHealthIssue.toAge} years</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Status </label>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedHealthIssue.isActive 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedHealthIssue.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Created</label>
                  <p className="text-sm text-gray-900">{new Date(selectedHealthIssue.createdAt).toLocaleDateString()}</p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Last Updated</label>
                  <p className="text-sm text-gray-900">{new Date(selectedHealthIssue.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Product Suggestions Section - Read Only */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center mb-4">
                  <h4 className="text-md font-semibold text-gray-900 flex items-center">
                    <HiTag className="h-5 w-5 mr-2 text-[#22c55e]" />
                    Suggested Products
                  </h4>
                </div>
                
                {suggestedProducts.length > 0 ? (
                  <div className="space-y-2">
                    {suggestedProducts.map((suggestion, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg border">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-gray-900">
                              {suggestion.productId?.productName || 'Unknown Product'}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              suggestion.priority === 1 ? 'bg-red-100 text-red-800' :
                              suggestion.priority === 2 ? 'bg-yellow-100 text-yellow-800' :
                              'bg-green-100 text-green-800'
                            }`}>
                              {suggestion.priority === 1 ? 'High' : suggestion.priority === 2 ? 'Medium' : 'Low'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {suggestion.suggestionReason}
                          </p>
                          <p className="text-xs text-gray-500">
                            Price: ₹{suggestion.productId?.price || 'N/A'} | 
                            Weight: {suggestion.productId?.weight || 'N/A'}g
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <HiTag className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>No products suggested yet</p>
                    <p className="text-sm">Products can be added in edit mode</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedHealthIssue(null);
                  }}
                >
                  Close
                </Button>
              </div>
        </Modal>
      )}

      {/* Product Suggestion Modal */}
      {showProductSuggestionModal && selectedHealthIssue && (
        <Modal
          isOpen={showProductSuggestionModal}
          onClose={() => {
            setShowProductSuggestionModal(false);
            setSelectedProduct(null);
            setSuggestionReason('');
            setSuggestionPriority(1);
          }}
          title="Add Product Suggestion"
          size="md"
        >
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Product * ({availableProducts.length} available)
                  </label>
                  {suggestionLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#22c55e]"></div>
                      <span className="ml-2 text-sm text-gray-600">Loading products...</span>
                    </div>
                  ) : suggestionError ? (
                    <div className="text-center p-4 text-red-500">
                      <p>Error loading products: {suggestionError}</p>
                    </div>
                  ) : availableProducts.length === 0 ? (
                    <div className="text-center p-4 text-gray-500">
                      <p>No products available for suggestion</p>
                      <p className="text-sm">All products may already be suggested for this health issue</p>
                    </div>
                  ) : (
                    <Select
                      value={selectedProduct ? selectedProduct._id : ''}
                      onChange={(value) => {
                        const product = availableProducts.find(p => p._id === value);
                        setSelectedProduct(product);
                      }}
                      options={availableProducts.map(product => ({
                        value: product._id,
                        label: `${product.productName} - ₹${product.price}`
                      }))}
                      placeholder="Choose a product"
                      error={!selectedProduct}
                      errorMessage={!selectedProduct ? 'Please select a product' : ''}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggestion Reason
                  </label>
                  <textarea
                    value={suggestionReason}
                    onChange={(e) => setSuggestionReason(e.target.value)}
                    placeholder="Why is this product recommended for this health issue?"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Priority
                  </label>
                  <Select
                    value={suggestionPriority}
                    onChange={(value) => setSuggestionPriority(parseInt(value))}
                    options={[
                      { value: 1, label: 'High Priority' },
                      { value: 2, label: 'Medium Priority' },
                      { value: 3, label: 'Low Priority' }
                    ]}
                    placeholder="Select priority"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowProductSuggestionModal(false);
                    setSelectedProduct(null);
                    setSuggestionReason('');
                    setSuggestionPriority(1);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="gradient"
                  onClick={handleAddProductSuggestion}
                  disabled={!selectedProduct || suggestionLoading}
                >
                  {suggestionLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Adding...
                    </div>
                  ) : (
                    'Add Suggestion'
                  )}
                </Button>
              </div>
        </Modal>
      )}
    </div>
  );
};

export default HealthDashboard;
