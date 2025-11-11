import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiPlus,
  HiUser,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiBell,
  HiExclamationTriangle,
  HiChartBar,
  HiPencil,
  HiCloudArrowUp,
  HiArchiveBox,
  HiArrowPath,
  HiCommandLine
} from 'react-icons/hi2';
import { StatCard, FilterCard, Button, SearchInput, Select, Pagination, ImportModal } from '../common';
import {
  getAllLeads,
  getLeadStats,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  setLeadFilters,
  clearLeadErrors,
  clearLeadSuccess
} from '../../redux/actions/leadActions';
import { clearAllLeadData } from '../../redux/slices/leadSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import { getActiveBranches } from '../../redux/actions/branchActions';
import LeadPipeline from './leads/LeadPipeline';
import LeadCRUD from './leads/LeadCRUD';
import FollowUpHistory from './leads/FollowUpHistory';
import PerformanceTracking from './leads/PerformanceTracking';
import RemindersNotifications from './leads/RemindersNotifications';
import LeadOwnership from './leads/LeadOwnership';

const LeadsDashboard = ({ activeView: propActiveView, onViewChange }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeView, setActiveView] = useState(propActiveView || 'table');
  const [selectedLead, setSelectedLead] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const { branches = [] } = useSelector((state) => state.branches);
  const isAccountsManager = user?.role === 'accounts_manager';
  const isProductionManager = user?.role === 'production_manager';
  const isSalesExecutive = user?.role === 'sales_executive';

  const {
    leads = [],
    loading = false,
    error = null,
    createLoading = false,
    updateLoading = false,
    deleteLoading = false,
    stats = null,
    statsLoading = false,
    createSuccess = null,
    updateSuccess = null,
    deleteSuccess = null,
    createError = null,
    updateError = null,
    deleteError = null
  } = useSelector((state) => state.leads || {});

  const dispatch = useDispatch();

  // Sync internal state with prop
  useEffect(() => {
    if (propActiveView) {
      setActiveView(propActiveView);
    }
  }, [propActiveView]);

  // Initialize pagination on first load
  useEffect(() => {
    if (isAuthenticated && user) {
      // Reset to first page on initial load
      setCurrentPage(1);
    }
  }, [isAuthenticated, user]);

  // State for refresh indicator
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch initial data on mount
  useEffect(() => {
    if (isAuthenticated && user) {
      // Fetch leads with current filters
      const leadParams = {
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        leadStatus: filterStatus === 'all' ? '' : filterStatus,
        dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
      };
      
      // For sales executive, only show leads created by them
      if (isSalesExecutive && user?._id) {
        leadParams.createdBy = user._id;
      }
      
      dispatch(getAllLeads(leadParams));
      
      // Fetch stats
      dispatch(getLeadStats());
    }
  }, [dispatch, isAuthenticated, user, isSalesExecutive]);

  // Refresh leads when navigating to this page (e.g., returning from edit form)
  useEffect(() => {
    if ((location.pathname === '/leads' || location.pathname === '/leads/table' || location.pathname === '/leads/pipeline') && isAuthenticated && user) {
      // Use a small delay to ensure state is ready after navigation
      const timeoutId = setTimeout(() => {
        const leadParams = {
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
        };
        
        // For sales executive, only show leads created by them
        if (isSalesExecutive && user?._id) {
          leadParams.createdBy = user._id;
        }
        
        dispatch(getAllLeads(leadParams));
        dispatch(getLeadStats());
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [location.pathname, dispatch, isAuthenticated, user, isSalesExecutive, currentPage, itemsPerPage, searchTerm, filterStatus, filterBranch]);

  // Clear success/error messages after a delay and close modals on success
  useEffect(() => {
    if (createSuccess || updateSuccess || deleteSuccess) {
      if (createSuccess) {
        setShowCreateModal(false);
      }
      if (updateSuccess) {
        setShowEditModal(false);
        setSelectedLead(null);
        // Clear leads state to force fresh fetch (prevents cache issues)
        dispatch(clearAllLeadData());
        // Refresh the leads list after update with cache-busting
        dispatch(getAllLeads({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch,
          _t: Date.now() // Cache-busting timestamp
        }));
        dispatch(getLeadStats());
      }
      if (deleteSuccess) {
        setShowDeleteModal(false);
        setSelectedLead(null);
        // Clear leads state to force fresh fetch (prevents cache issues)
        dispatch(clearAllLeadData());
        // Refresh the leads list after delete with cache-busting
        dispatch(getAllLeads({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch,
          _t: Date.now() // Cache-busting timestamp
        }));
        dispatch(getLeadStats());
      }
      
      const timer = setTimeout(() => {
        dispatch(clearLeadSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess, updateSuccess, deleteSuccess, dispatch, currentPage, itemsPerPage, searchTerm, filterStatus, filterBranch]);

  useEffect(() => {
    if (createError || updateError || deleteError) {
      const timer = setTimeout(() => {
        dispatch(clearLeadErrors());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createError, updateError, deleteError, dispatch]);

  // Manual refresh function
  const refreshDashboardData = useCallback(() => {
    setIsRefreshing(true);
    
    // Refresh current leads list and stats
    dispatch(getAllLeads({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      leadStatus: filterStatus === 'all' ? '' : filterStatus,
      dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
    }));
    
    dispatch(getLeadStats()).finally(() => {
      setIsRefreshing(false);
    });
  }, [dispatch, currentPage, itemsPerPage, searchTerm, filterStatus, filterBranch]);

  const viewOptions = [
    { id: 'pipeline', name: 'Pipeline View', icon: HiChartBar },
    // { id: 'performance', name: 'Performance', icon: HiChartBar }
  ];

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-500/10 text-blue-500',
      contacted: 'bg-yellow-500/10 text-yellow-500',
      qualified: 'bg-green-500/10 text-green-500',
      converted: 'bg-purple-500/10 text-purple-500',
      lost: 'bg-red-500/10 text-red-500'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-500/10 text-red-500',
      medium: 'bg-yellow-500/10 text-yellow-500',
      low: 'bg-green-500/10 text-green-500'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };



  // Get pagination data from Redux state
  const { pagination = {} } = useSelector((state) => state.leads || {});
  const totalPages = pagination.totalPages || 1;
  const totalLeads = pagination.totalLeads || 0;
  const startIndex = ((currentPage - 1) * itemsPerPage) + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, totalLeads);

  // Fetch data when filters change
  useEffect(() => {
    if (isAuthenticated && user) {
      dispatch(getAllLeads({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        leadStatus: filterStatus === 'all' ? '' : filterStatus,
        dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
      }));
    }
  }, [dispatch, isAuthenticated, user, currentPage, searchTerm, filterStatus, filterBranch]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterBranch]);

  const handleCreateLead = (leadData) => {
      dispatch(createLead(leadData));
  };

  const handleUpdateLead = async (leadData) => {
    try {
      if (selectedLead) {
        // Debug logging removed for production
        
        // Validate lead ID
        if (!selectedLead._id) {
          console.error('Lead ID is missing from selected lead');
          return;
        }
        
        // Check if it's a valid MongoDB ObjectId format
        const objectIdRegex = /^[0-9a-fA-F]{24}$/;
        if (!objectIdRegex.test(selectedLead._id)) {
          console.error('Invalid lead ID format:', selectedLead._id);
          return;
        }
        
        const result = await dispatch(updateLead({ leadId: selectedLead._id, leadData })).unwrap();
        
        // Close modal and clear selection
        setShowEditModal(false);
        setSelectedLead(null);
        
        // Clear leads state to force fresh fetch (prevents cache issues)
        dispatch(clearAllLeadData());
        
        // Refresh the leads list immediately with cache-busting
        dispatch(getAllLeads({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch,
          _t: Date.now() // Cache-busting timestamp
        }));
        dispatch(getLeadStats());
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: 'Lead updated successfully!'
        }));
      } else {
        console.error('No selected lead for update');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
      dispatch(addNotification({
        type: 'error',
        message: error?.message || 'Failed to update lead'
      }));
    }
  };

  const handleDeleteLead = async () => {
    try {
      if (selectedLead) {
        const result = await dispatch(deleteLead(selectedLead._id)).unwrap();
        
        // Close modal and clear selection
        setShowDeleteModal(false);
        setSelectedLead(null);
        
        // Clear leads state to force fresh fetch (prevents cache issues)
        dispatch(clearAllLeadData());
        
        // Refresh the leads list immediately after deletion with cache-busting
        dispatch(getAllLeads({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch,
          _t: Date.now() // Cache-busting timestamp
        }));
        dispatch(getLeadStats());
        
        // Show success notification
        dispatch(addNotification({
          type: 'success',
          message: 'Lead deleted successfully!'
        }));
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
      dispatch(addNotification({
        type: 'error',
        message: error?.message || 'Failed to delete lead'
      }));
    }
  };

  const handleStatusUpdate = async (leadId, newStatus) => {
    try {
      const result = await dispatch(updateLeadStatus({ leadId, leadStatus: newStatus })).unwrap();
      
      // Clear leads state to force fresh fetch (prevents cache issues)
      dispatch(clearAllLeadData());
      
      // Refresh the leads list immediately after status update with cache-busting
      dispatch(getAllLeads({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        leadStatus: filterStatus === 'all' ? '' : filterStatus,
        dispatchedFrom: filterBranch === 'all' ? '' : filterBranch,
        _t: Date.now() // Cache-busting timestamp
      }));
      dispatch(getLeadStats());
      
      // Show success notification
      dispatch(addNotification({
        type: 'success',
        message: `Lead status updated to ${newStatus}`
      }));
    } catch (error) {
      console.error('Error updating lead status:', error);
      dispatch(addNotification({
        type: 'error',
        message: error?.message || 'Failed to update lead status'
      }));
    }
  };

  const handleCardFilter = (status) => {
    // Card filter clicked
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleImportSuccess = (importResult) => {
    // Show success notification
    dispatch(addNotification({
      type: 'success',
      title: 'Import Successful!',
      message: `Successfully imported ${importResult?.inserted || 0} leads. ${importResult?.errors?.length || 0} errors, ${importResult?.duplicates?.length || 0} duplicates.`,
      duration: 5000
    }));
    
    // Close the import modal
    setShowImportModal(false);
    
    // Refresh leads and stats after successful import
    dispatch(getAllLeads({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      leadStatus: filterStatus === 'all' ? '' : filterStatus,
      dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
    }));
    
    dispatch(getLeadStats());
  };

  // Calculate card counts from Redux state
  const getStatusCount = (status) => {
    if (Array.isArray(leads) && leads.length > 0) {
      return leads.filter(lead => lead.leadStatus === status).length;
    }
    
    // Fallback to API stats if no leads data available
    if (stats?.leadsByStatus && Array.isArray(stats.leadsByStatus)) {
      const statusData = stats.leadsByStatus.find(item => item._id === status);
      return statusData ? statusData.count : 0;
    }
    
    return 0;
  };

  // Calculate stats from filtered leads array (use pagination for total, filtered array for status counts)
  const cardCounts = {
    total: totalLeads || pagination?.totalLeads || leads.length || 0,
    newLead: getStatusCount('new_lead'),
    qualified: getStatusCount('qualified'),
    unqualified: getStatusCount('unqualified'),
    converted: getStatusCount('order_completed')
  };

  // Use leads directly from Redux state (server-side filtering)
  const filteredLeads = leads;
  
  // Use server-side pagination data
  const paginationData = {
    totalPages: pagination.totalPages || 1,
    totalLeads: pagination.totalLeads || 0,
    startIndex: startIndex,
    endIndex: endIndex
  };

  const renderViewContent = () => {
    switch (activeView) {
      case 'table':
        return (
          <>
            <LeadCRUD
              leads={filteredLeads}
              onSelectLead={setSelectedLead}
              onEditLead={(lead) => {
                setSelectedLead(lead);
                setShowEditModal(true);
              }}
              onDeleteLead={() => setShowDeleteModal(true)}
              onCreateLead={handleCreateLead}
              onUpdateLead={handleUpdateLead}
              onDeleteLeadConfirm={handleDeleteLead}
              showCreateModal={showCreateModal}
              showEditModal={showEditModal}
              showDeleteModal={showDeleteModal}
              selectedLead={selectedLead}
              setShowCreateModal={setShowCreateModal}
              setShowEditModal={setShowEditModal}
              setShowDeleteModal={setShowDeleteModal}
              loading={loading}
              createLoading={createLoading}
              updateLoading={updateLoading}
              deleteLoading={deleteLoading}
            />

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={paginationData.totalPages}
              totalItems={paginationData.totalLeads}
              itemsPerPage={itemsPerPage}
              startIndex={paginationData.startIndex}
              endIndex={paginationData.endIndex}
              onPageChange={setCurrentPage}
            />
          </>
        );
      case 'pipeline':
        return (
          <LeadPipeline
            leads={leads}
            onStatusUpdate={handleStatusUpdate}
            onSelectLead={setSelectedLead}
            onEditLead={(lead) => {
              setSelectedLead(lead);
              setShowEditModal(true);
            }}
          />
        );
      // case 'performance':
      //   return (
      //     <PerformanceTracking
      //       leads={unfilteredLeads}
      //       stats={unfilteredStats}
      //     />
      //   );
      default:
        return null;
    }
  };

  // Show loading state only when actually loading
  if (loading || statsLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#22c55e]"></div>
          <p className="mt-4 text-gray-600">Loading leads...</p>
        </div>
      </div>
    );
  }

  // Show empty state when no leads are available
  if (!leads || leads.length === 0) {
    return (
      <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track your sales leads effectively
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button
                onClick={refreshDashboardData}
                icon={HiArrowPath}
                variant="outline"
                size="sm"
                title="Refresh data"
                loading={isRefreshing}
                disabled={isRefreshing}
              >
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
              <Button
                onClick={() => setShowImportModal(true)}
                icon={HiCloudArrowUp}
                variant="warning"
                size="sm"
              >
                Import Leads
              </Button>
              {!isAccountsManager && !isProductionManager && (
                <Button
                  onClick={() => navigate('/leads/create')}
                  icon={HiPlus}
                  variant="gradient"
                  size="sm"
                >
                  Add New Lead
                </Button>
              )}
            </div>
          </div>

          {/* Stats Cards - Show zeros for empty collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div
              onClick={() => handleCardFilter('all')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'all' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="Total Leads"
                value={cardCounts.total}
                icon={HiUser}
                iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
                gradient="blue"
                change="+5%"
                changeType="increase"
                className="h-full"
              />
            </div>
            <div
              onClick={() => handleCardFilter('new_lead')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'new_lead' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="New Lead"
                value={cardCounts.newLead}
                icon={HiUser}
                iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
                gradient="indigo"
                change="+5%"
                changeType="increase"
                className="h-full"
              />
            </div>
            <div
              onClick={() => handleCardFilter('qualified')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'qualified' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="Qualified"
                value={cardCounts.qualified}
                icon={HiCheckCircle}
                iconBg="bg-gradient-to-br from-green-500 to-green-600"
                gradient="green"
                change="+2%"
                changeType="increase"
                className="h-full"
              />
            </div>
            <div
              onClick={() => handleCardFilter('order_completed')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'order_completed' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="Order Completed"
                gradient="blue"
                change="+8%"
                changeType="increase"
                className="h-full"
              />
            </div>
          </div>

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-80">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads..."
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'unqualified', label: 'Unqualified' },
                  { value: 'converted', label: 'Order Completed' }
                ]}
                className="w-full sm:w-48"
              />
              <Select
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                options={[
                  { value: 'all', label: 'All Branches' },
                  ...(branches?.map(branch => ({
                    value: branch.branchName || branch,
                    label: branch.branchName || branch
                  })) || [])
                ]}
                className="w-full sm:w-48"
              />
            </div>
          </div>

          {/* Empty State */}
          <div className="flex flex-col items-center text-center py-12">
            <div className="text-gray-400 mb-4">
              <HiUser className="h-16 w-16" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-600 mb-6 max-w-md">
              No data available at the moment
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={() => navigate('/leads/create')}
                icon={HiPlus}
                variant="gradient"
                size="sm"
              >
                Create First Lead
              </Button>
              <Button
                onClick={() => setShowImportModal(true)}
                icon={HiCloudArrowUp}
                variant="outline"
                size="sm"
              >
                Import Leads
              </Button>
            </div>
          </div>

        {/* Import Modal */}
        <ImportModal
          isOpen={showImportModal}
          onClose={() => setShowImportModal(false)}
          onImportSuccess={handleImportSuccess}
        />
      </div>
    );
  }
  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 max-w-md w-full mx-4">
          <div className="flex items-center mb-4">
            <HiExclamationTriangle className="h-8 w-8 text-red-500 mr-3" />
            <h3 className="text-lg font-semibold text-gray-900">Error Loading Leads</h3>
          </div>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              try {
                dispatch(getAllLeads());
                dispatch(getLeadStats());
              } catch (error) {
                console.error('Error retrying:', error);
              }
            }}
            className="w-full text-white py-2 px-4 rounded-lg transition-colors duration-200"
            style={{backgroundColor: '#22c55e'}}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track your sales leads effectively
            </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-2">
              <Button
                onClick={() => setShowImportModal(true)}
                icon={HiCloudArrowUp}
                variant="warning"
                size="sm"
              >
                Import Leads
              </Button>
              {!isAccountsManager && !isProductionManager && (
                <Button
                  onClick={() => navigate('/leads/create')}
                  icon={HiPlus}
                  variant="gradient"
                  size="sm"
                >
                  Add New Lead
                </Button>
              )}
              {viewOptions.map((view) => (
                  <Button
                  key={view.id}
                  onClick={() => {
                    if (onViewChange) {
                      onViewChange(view.id);
                    } else {
                      setActiveView(view.id);
                    }
                  }}
                    icon={view.icon}
                    variant={activeView === view.id ? "gradient" : "outline"}
                    size="sm"
                    className={`${
                      activeView === view.id 
                        ? 'shadow-lg transform scale-105' 
                    : 'border-gray-300 text-gray-700 hover:gradient-primary hover:text-white hover:border-transparent'
                    }`}
                  >
                  {view.name}
                  </Button>
              ))}
        </div>
      </div>

        {/* Error Messages */}
        {(createError || updateError || deleteError) && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
            <div className="flex items-center">
              <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  {createError && (
                    createError.includes('mobile number already exists') 
                      ? `A lead with this mobile number already exists. Please use a different mobile number or update the existing lead.`
                      : `Error creating lead: ${createError}`
                  )}
                  {updateError && `Error updating lead: ${updateError}`}
                  {deleteError && `Error deleting lead: ${deleteError}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats Cards - Show for all tabs when there are leads */}
        {leads && leads.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
            <div
              onClick={() => handleCardFilter('all')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'all' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="Total Leads"
                value={cardCounts.total}
                icon={HiUser}
                iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
                gradient="blue"
                change="+5%"
                changeType="increase"
                className="h-full"
              />
            </div>
            
            <div
              onClick={() => handleCardFilter('qualified')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'qualified' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="Qualified"
                value={cardCounts.qualified}
                icon={HiCheckCircle}
                iconBg="bg-gradient-to-br from-green-500 to-green-600"
                gradient="emerald"
                change="+2%"
                changeType="increase"
                className="h-full"
              />
            </div>
            
            <div
              onClick={() => handleCardFilter('unqualified')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'unqualified' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="Unqualified"
                value={cardCounts.unqualified}
                icon={HiXCircle}
                iconBg="bg-gradient-to-br from-red-500 to-red-600"
                gradient="red"
                change="+2%"
                changeType="increase"
                className="h-full"
              />
            </div>
            
            <div
              onClick={() => handleCardFilter('converted')}
              className={`cursor-pointer transition-all duration-200 ${
                filterStatus === 'converted' ? 'opacity-90 shadow-lg' : 'hover:shadow-md'
              }`}
            >
              <StatCard
                title="Order Completed"
                value={cardCounts.converted}
                icon={HiCheckCircle}
                iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
                gradient="amber"
                change="+8%"
                changeType="increase"
                className="h-full"
              />
            </div>
          </div>
        )}

        {/* Search and Filter Section - Show for all tabs when there are leads */}
        {leads && leads.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-80">
              <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads..."
                icon={HiCommandLine}
                />
              </div>
            <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
              <Select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                options={[
                  { value: 'all', label: 'All Status' },
                  { value: 'qualified', label: 'Qualified' },
                  { value: 'unqualified', label: 'Unqualified' },
                  { value: 'converted', label: 'Order Completed' },
                  { value: 'new_lead', label: 'New Lead' },
                  { value: 'not_answered', label: 'Not Answered' },
                  { value: 'pending', label: 'Pending' }
                ]}
                className="w-full sm:w-48"
              />
              <Select
                  value={filterBranch}
                  onChange={(e) => setFilterBranch(e.target.value)}
                options={[
                  { value: 'all', label: 'All Branches' },
                  ...(branches?.map(branch => ({
                    value: branch.branchName || branch,
                    label: branch.branchName || branch
                  })) || [])
                ]}
                className="w-full sm:w-48"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="overflow-hidden">
          {/* Pagination info - only show for table view */}
          {activeView === 'table' && leads && leads.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm text-gray-500">
                Showing {paginationData.startIndex}-{paginationData.endIndex} of {paginationData.totalLeads} leads
              </div>
            </div>
          )}
          {renderViewContent()}
        </div>

      {/* Import Modal */}
      <ImportModal
        isOpen={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImportSuccess={handleImportSuccess}
      />
    </div>
  );
};

export default LeadsDashboard;