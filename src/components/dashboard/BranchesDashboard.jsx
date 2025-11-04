import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiPlus,
  HiBuildingOffice2,
  HiMapPin,
  HiUsers,
  HiChartBar,
  HiExclamationTriangle,
  HiCog6Tooth,
  HiCloudArrowUp
} from 'react-icons/hi2';
import { StatCard, Button, SearchInput, Select, Pagination, ImportModal } from '../common';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  getAllBranches,
  getBranchById,
  getBranchStats,
  createBranch,
  updateBranch,
  deleteBranch,
  deactivateBranch,
  restoreBranch,
  clearBranchErrors,
  clearBranchSuccess
} from '../../redux/actions/branchActions';
import BranchCRUD from './branches/BranchCRUD';

const BranchesDashboard = ({ propActiveView = 'table' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeView, setActiveView] = useState(propActiveView || 'table');
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  
  const {
    branches: allBranches = [],
    loading = false,
    error = null,
    stats = null,
    statsLoading = false
  } = useSelector((state) => state.branches);

  // State for unfiltered branches (for stats and performance)
  const [unfilteredBranches, setUnfilteredBranches] = useState([]);
  const [unfilteredStats, setUnfilteredStats] = useState(null);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // Fetch branches when component mounts or filters change
  useEffect(() => {
    if (isAuthenticated && user) {
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: filterStatus === 'all' ? '' : filterStatus
      };

      console.log('Fetching branches with params:', params);
      dispatch(getAllBranches(params));
    }
  }, [dispatch, isAuthenticated, user, currentPage, searchTerm, filterStatus, itemsPerPage]);

  // Refresh branches when navigating to this page (e.g., returning from edit form)
  useEffect(() => {
    if (isAuthenticated && user && location.pathname === '/branches') {
      // Refresh filtered branches
      dispatch(getAllBranches({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        status: filterStatus === 'all' ? '' : filterStatus
      }));
      // Also refresh unfiltered branches and stats
      dispatch(getBranchStats());
      dispatch(getAllBranches({ page: 1, limit: 1000 })).then((result) => {
        if (result.payload && result.payload.data) {
          const branchesData = Array.isArray(result.payload.data) 
            ? result.payload.data 
            : (result.payload.data.branches || []);
          setUnfilteredBranches(branchesData);
        }
      });
    }
  }, [location.pathname, dispatch, isAuthenticated, user]);

  // Fetch unfiltered branches and stats for cards and performance
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch stats first (this gives us the total counts)
      dispatch(getBranchStats()).then((result) => {
        if (result.payload && result.payload.data) {
          setUnfilteredStats(result.payload.data);
          console.log('Set unfiltered stats via Redux');
        }
      }).catch((error) => {
        console.error('Error fetching unfiltered stats via Redux:', error);
      });

      // Fetch all branches without any filters for detailed data
      dispatch(getAllBranches({ page: 1, limit: 1000 })).then((result) => {
        if (result.payload && result.payload.data) {
          const branchesData = Array.isArray(result.payload.data) 
            ? result.payload.data 
            : (result.payload.data.branches || []);
          setUnfilteredBranches(branchesData);
          console.log('Set unfiltered branches via Redux:', branchesData);
        }
      }).catch((error) => {
        console.error('Error fetching unfiltered branches via Redux:', error);
        setUnfilteredBranches([]);
      });
    }
  }, [dispatch, isAuthenticated, user]);

  // Clear success message after 3 seconds
  useEffect(() => {
    // This effect is disabled for now since success is not available in branch slice
    // if (success) {
    //   const timer = setTimeout(() => {
    //     dispatch(clearBranchSuccess());
    //   }, 3000);
    //   return () => clearTimeout(timer);
    // }
  }, [dispatch]);

  // Clear errors when component unmounts
  useEffect(() => {
    return () => {
      dispatch(clearBranchErrors());
    };
  }, [dispatch]);

  const handleCreateBranch = (branchData) => {
    try {
      dispatch(createBranch(branchData));
    } catch (error) {
      console.error('Error creating branch:', error);
    }
  };

  const handleUpdateBranch = (branchData) => {
    try {
      if (selectedBranch) {
        dispatch(updateBranch({ branchId: selectedBranch._id, branchData }));
        setShowEditModal(false);
        setSelectedBranch(null);
      }
    } catch (error) {
      console.error('Error updating branch:', error);
    }
  };

  const handleDeleteBranch = () => {
    try {
      if (selectedBranch) {
        dispatch(deleteBranch(selectedBranch._id));
        setShowDeleteModal(false);
        setSelectedBranch(null);
      }
    } catch (error) {
      console.error('Error deleting branch:', error);
    }
  };

  const handleEditBranch = (branch) => {
    navigate(`/branches/edit/${branch._id}`, { 
      state: { 
        branch,
        returnTo: '/branches'
      }
    });
  };

  const handleViewBranch = (branch) => {
    setSelectedBranch(branch);
    // You can implement a view modal here if needed
  };

  const handleDeleteBranchConfirm = () => {
    handleDeleteBranch();
  };

  const handleToggleBranchStatus = async () => {
    try {
      if (selectedBranch) {
        console.log('Toggling branch status:', {
          branchId: selectedBranch._id,
          branchName: selectedBranch.branchName,
          isActive: selectedBranch.isActive,
          isActiveType: typeof selectedBranch.isActive
        });
        
        // First, refresh the branch data to ensure we have the latest status
        const branchResponse = await dispatch(getBranchById(selectedBranch._id)).unwrap();
        const latestBranch = branchResponse.data.branch;
        
        console.log('Latest branch data from server:', {
          branchId: latestBranch._id,
          branchName: latestBranch.branchName,
          isActive: latestBranch.isActive,
          isActiveType: typeof latestBranch.isActive
        });
        
        // Use deactivate or restore based on current status
        if (latestBranch.isActive) {
          await dispatch(deactivateBranch(latestBranch._id)).unwrap();
        } else {
          await dispatch(restoreBranch(latestBranch._id)).unwrap();
        }
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          title: 'Branch Status Updated',
          message: `Branch ${selectedBranch.branchName} has been ${selectedBranch.isActive ? 'disabled' : 'activated'} successfully.`,
          duration: 3000
        }));

        // Close modals
        setShowDisableModal(false);
        setShowActivateModal(false);
        setSelectedBranch(null);

        // Refresh branches list
        dispatch(getAllBranches({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          status: filterStatus === 'all' ? '' : filterStatus
        }));

        // Refresh stats
        dispatch(getBranchStats());
      }
    } catch (error) {
      console.error('Error toggling branch status:', error);
      
      // Extract error message from the error object
      let errorMessage = 'Failed to update branch status. Please try again.';
      
      if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: errorMessage,
        duration: 5000
      }));
    }
  };

  const handleCardFilter = (status) => {
    console.log('Card filter clicked:', status);
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleImportSuccess = (importResult) => {
    console.log('🔄 Import success - refreshing data...');
    
    // Show success notification
    dispatch(addNotification({
      type: 'success',
      title: 'Import Successful!',
      message: `Successfully imported ${importResult?.inserted || 0} branches. ${importResult?.errors?.length || 0} errors, ${importResult?.duplicates?.length || 0} duplicates.`,
      duration: 5000
    }));
    
    // Close the import modal
    setShowImportModal(false);
    
    // Refresh branches and stats after successful import
    dispatch(getAllBranches({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      status: filterStatus === 'all' ? '' : filterStatus
    }));
    
    // Refresh unfiltered data for cards and performance
    dispatch(getAllBranches({})).then((result) => {
      if (result.payload && result.payload.data) {
        const branchesData = Array.isArray(result.payload.data) 
          ? result.payload.data 
          : (result.payload.data.branches || []);
        setUnfilteredBranches(branchesData);
        console.log('Refreshed unfiltered branches after import');
      }
    });
    
    dispatch(getBranchStats()).then((result) => {
      if (result.payload && result.payload.data) {
        setUnfilteredStats(result.payload.data);
        console.log('Refreshed unfiltered stats after import');
      }
    });
    
    console.log('✅ Data refresh dispatched');
  };

  // Calculate stable counts from stats data (always use unfiltered stats for cards)
  const getStatusCount = (status) => {
    const statsToUse = unfilteredStats || stats;
    if (!statsToUse?.branchesByStatus || !Array.isArray(statsToUse.branchesByStatus)) return 0;
    const statusData = statsToUse.branchesByStatus.find(item => item._id === status);
    return statusData ? statusData.count : 0;
  };


  // Calculate card counts - always use unfiltered data for consistency
  const safeUnfilteredBranches = Array.isArray(unfilteredBranches) ? unfilteredBranches : [];
  
  // Use stats data as fallback if unfiltered branches are not available
  const statsToUse = unfilteredStats || stats;
  const cardCounts = {
    total: safeUnfilteredBranches.length || statsToUse?.overview?.totalBranches || 0,
    active: safeUnfilteredBranches.length > 0 
      ? safeUnfilteredBranches.filter(branch => branch.isActive).length 
      : (statsToUse?.overview?.activeBranches || 0),
    inactive: safeUnfilteredBranches.length > 0 
      ? safeUnfilteredBranches.filter(branch => !branch.isActive).length 
      : (statsToUse?.overview?.inactiveBranches || 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading branches...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <HiExclamationTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Branches</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="gradient">Try Again</Button>
        </div>
      </div>
    );
  }

  const renderViewContent = () => {
    switch (activeView) {
      case 'table':
        return (
          <BranchCRUD
            branches={allBranches}
            onSelectBranch={setSelectedBranch}
            onEditBranch={handleEditBranch}
            onDeleteBranch={handleDeleteBranch}
            onCreateBranch={() => navigate('/branches/create')}
            onUpdateBranch={handleUpdateBranch}
            onDeleteBranchConfirm={handleToggleBranchStatus}
            onDisableBranch={() => setShowDisableModal(true)}
            onActivateBranch={() => setShowActivateModal(true)}
            showDeleteModal={showDeleteModal}
            showDisableModal={showDisableModal}
            showActivateModal={showActivateModal}
            selectedBranch={selectedBranch}
            setShowDeleteModal={setShowDeleteModal}
            setShowDisableModal={setShowDisableModal}
            setShowActivateModal={setShowActivateModal}
            loading={loading}
            createLoading={loading}
            updateLoading={loading}
            deleteLoading={loading}
          />
        );
      default:
        return (
          <div className="text-center py-12">
            <HiBuildingOffice2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">View Not Available</h3>
            <p className="text-gray-600">This view is not implemented yet.</p>
          </div>
        );
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branches Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track your branch locations effectively
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 sm:mt-0">
            <Button
              onClick={() => navigate('/branches/create')}
              icon={HiPlus}
              variant="gradient"
              size="sm"
            >
              Add New Branch
            </Button>
          </div>
        </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
            <StatCard
              title="Total Branches"
              value={cardCounts.total}
              icon={HiBuildingOffice2}
              iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
              gradient="purple"
              onClick={() => handleCardFilter('all')}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
            <StatCard
              title="Active Branches"
              value={cardCounts.active}
              icon={HiUsers}
              iconBg="bg-gradient-to-br from-emerald-500 to-emerald-600"
              gradient="emerald"
              onClick={() => handleCardFilter('active')}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
            <StatCard
              title="Inactive Branches"
              value={cardCounts.inactive}
              icon={HiExclamationTriangle}
              iconBg="bg-gradient-to-br from-red-500 to-red-600"
              gradient="red"
              onClick={() => handleCardFilter('inactive')}
              className="cursor-pointer hover:shadow-md transition-shadow"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-80">
              <SearchInput
                placeholder="Search branches..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-48">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'active', label: 'Active' },
                  { value: 'inactive', label: 'Inactive' }
                ]}
              />
            </div>
          </div>

          {/* Main Content */}
          <div>
            {renderViewContent()}
          </div>

          {/* Pagination - Simplified for now */}
          {allBranches.length > itemsPerPage && (
            <div className="flex justify-center">
              <div className="text-sm text-gray-600">
                Showing {allBranches.length} branches
              </div>
            </div>
          )}
        </div>


      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </>
  );
};

export default BranchesDashboard;
