import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiUser,
  HiCheckCircle,
  HiXCircle,
  HiClock,
  HiBell,
  HiExclamationTriangle,
  HiChartBar,
  HiPencil,
  HiCloudArrowUp,
  HiArchiveBox
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

  // Load leads and stats on component mount
  useEffect(() => {
    // Always try to fetch leads - let the API handle authentication
    const params = {
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      leadStatus: filterStatus === 'all' ? '' : filterStatus,
      dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
    };

    // Handle special status groups by fetching all leads and filtering client-side
    if (filterStatus === 'unqualified' || filterStatus === 'converted') {
      params.leadStatus = ''; // Get all leads, we'll filter client-side
      params.limit = 1000; // Fetch more leads to ensure we get all relevant data
      params.page = 1; // Always fetch from page 1 when doing client-side pagination
    } else {
      // For regular filters, use normal pagination
      params.page = currentPage;
      params.limit = itemsPerPage;
    }

    console.log('Fetching leads with params:', params);

    // Always dispatch the API call - let the interceptor handle auth
    dispatch(getAllLeads(params));
    dispatch(getLeadStats());
    dispatch(getActiveBranches());
  }, [dispatch, isAuthenticated, user, currentPage, itemsPerPage, searchTerm, filterStatus, filterBranch]);

  // Initialize pagination on first load
  useEffect(() => {
    if (isAuthenticated && user) {
      // Reset to first page on initial load
      setCurrentPage(1);
    }
  }, [isAuthenticated, user]);

  // State for unfiltered leads (for pipeline and performance)
  const [unfilteredLeads, setUnfilteredLeads] = useState([]);
  const [unfilteredStats, setUnfilteredStats] = useState(null);

  // Fetch all leads for pipeline and performance (unfiltered) - always fetch when component mounts
  useEffect(() => {
    // Use Redux action to fetch all leads without filters
    console.log('Fetching unfiltered leads via Redux...');
    dispatch(getAllLeads({ limit: 1000, page: 1 })).then((result) => {
      if (result.payload && result.payload.data) {
        setUnfilteredLeads(result.payload.data.leads);
        console.log('Set unfiltered leads via Redux:', result.payload.data.leads.length);
      }
    }).catch((error) => {
      console.error('Error fetching unfiltered leads via Redux:', error);
    });

    // Fetch stats
    dispatch(getLeadStats()).then((result) => {
      if (result.payload && result.payload.data) {
        setUnfilteredStats(result.payload.data);
        console.log('Set unfiltered stats via Redux');
      }
    }).catch((error) => {
      console.error('Error fetching unfiltered stats via Redux:', error);
    });
  }, [dispatch]); // Only run once on component mount

  // Clear success/error messages after a delay and close modals on success
  useEffect(() => {
    if (createSuccess || updateSuccess || deleteSuccess) {
      // Close modals on success
      if (createSuccess) {
        setShowCreateModal(false);
      }
      if (updateSuccess) {
        setShowEditModal(false);
        setSelectedLead(null);
      }
      if (deleteSuccess) {
        setShowDeleteModal(false);
        setSelectedLead(null);
      }
      
      const timer = setTimeout(() => {
        dispatch(clearLeadSuccess());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createSuccess, updateSuccess, deleteSuccess, dispatch]);

  useEffect(() => {
    if (createError || updateError || deleteError) {
      const timer = setTimeout(() => {
        dispatch(clearLeadErrors());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [createError, updateError, deleteError, dispatch]);

  const viewOptions = [
    { id: 'pipeline', name: 'Pipeline View', icon: HiChartBar },
    { id: 'performance', name: 'Performance', icon: HiChartBar }
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

  // Sync unfilteredLeads with Redux leads state when leads change
  React.useEffect(() => {
    if (leads.length > 0 && unfilteredLeads.length > 0) {
      // Update unfilteredLeads with any changes from the Redux leads state
      const updatedUnfilteredLeads = unfilteredLeads.map(unfilteredLead => {
        const reduxLead = leads.find(lead => lead._id === unfilteredLead._id);
        return reduxLead || unfilteredLead;
      });
      
      // Check if there are any differences before updating (compare specific fields to avoid unnecessary re-renders)
      const hasChanges = updatedUnfilteredLeads.some((lead, index) => {
        const originalLead = unfilteredLeads[index];
        return lead.leadStatus !== originalLead.leadStatus || 
               lead.updatedAt !== originalLead.updatedAt ||
               lead.priority !== originalLead.priority;
      });
      
      if (hasChanges) {
        setUnfilteredLeads(updatedUnfilteredLeads);
      }
    }
  }, [leads]);

  // Ensure pagination is properly initialized
  const isPaginationReady = pagination.totalPages && pagination.totalLeads;

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus, filterBranch]);

  const handleCreateLead = (leadData) => {
      dispatch(createLead(leadData));
  };

  const handleUpdateLead = (leadData) => {
    try {
      if (selectedLead) {
        console.log('Selected lead object:', selectedLead);
        console.log('Lead ID:', selectedLead._id);
        console.log('Lead data to update:', leadData);
        
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
        
        dispatch(updateLead({ leadId: selectedLead._id, leadData }));
        setShowEditModal(false);
        setSelectedLead(null);
      } else {
        console.error('No selected lead for update');
      }
    } catch (error) {
      console.error('Error updating lead:', error);
    }
  };

  const handleDeleteLead = () => {
    try {
      if (selectedLead) {
        dispatch(deleteLead(selectedLead._id));
        setShowDeleteModal(false);
        setSelectedLead(null);
      }
    } catch (error) {
      console.error('Error deleting lead:', error);
    }
  };

  const handleStatusUpdate = (leadId, newStatus) => {
    try {
      dispatch(updateLeadStatus({ leadId, leadStatus: newStatus })).then((result) => {
        if (result.payload && result.payload.data) {
          // Update the unfilteredLeads state with the updated lead
          const updatedLead = result.payload.data.lead;
          setUnfilteredLeads(prev => 
            prev.map(lead => 
              lead._id === updatedLead._id ? updatedLead : lead
            )
          );
        }
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
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
    
    // Refresh unfiltered data for cards, pipeline, and performance
    dispatch(getAllLeads({})).then((result) => {
      if (result.payload && result.payload.data) {
        setUnfilteredLeads(result.payload.data);
        console.log('Refreshed unfiltered leads after import');
      }
    });
    
    dispatch(getLeadStats()).then((result) => {
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
    if (!statsToUse?.leadsByStatus || !Array.isArray(statsToUse.leadsByStatus)) return 0;
    const statusData = statsToUse.leadsByStatus.find(item => item._id === status);
    return statusData ? statusData.count : 0;
  };

  // Calculate card counts - always use unfiltered stats for consistency
  const cardCounts = {
    total: (unfilteredStats || stats)?.overview?.totalLeads || 0,
    qualified: getStatusCount('qualified'),
    unqualified: getStatusCount('unqualified'), // Only actual unqualified status
    converted: getStatusCount('order_completed')
  };

  // Filter leads client-side for special status groups
  const getFilteredLeads = () => {
    console.log('Filtering leads with status:', filterStatus, 'Total leads:', leads.length);
    
    // For special filters, we need to use unfiltered data if available
    const dataSource = (filterStatus === 'unqualified' || filterStatus === 'converted') && unfilteredLeads.length > 0 
      ? unfilteredLeads 
      : leads;
    
    if (filterStatus === 'unqualified') {
      const unqualifiedLeads = dataSource.filter(lead => 
        lead.leadStatus === 'unqualified'
      );
      console.log('Unqualified leads found:', unqualifiedLeads.length);
      return unqualifiedLeads;
    }
    
    if (filterStatus === 'converted') {
      const convertedLeads = dataSource.filter(lead => 
        lead.leadStatus === 'order_completed'
      );
      console.log('Order completed leads found:', convertedLeads.length);
      return convertedLeads;
    }
    
    // For other statuses, filter normally using the main leads array
    if (filterStatus !== 'all') {
      const filteredLeads = leads.filter(lead => lead.leadStatus === filterStatus);
      console.log(`Filtered leads for ${filterStatus}:`, filteredLeads.length);
      return filteredLeads;
    }
    
    console.log('Returning all leads:', leads.length);
    return leads;
  };

  const allFilteredLeads = getFilteredLeads();
  
  // Determine pagination method based on filter type
  const isSpecialFilter = filterStatus === 'unqualified' || filterStatus === 'converted';
  
  // Calculate pagination data
  const paginationData = isSpecialFilter ? {
    // Client-side pagination for special filters
    totalPages: Math.ceil(allFilteredLeads.length / itemsPerPage),
    totalLeads: allFilteredLeads.length,
    startIndex: ((currentPage - 1) * itemsPerPage) + 1,
    endIndex: Math.min(currentPage * itemsPerPage, allFilteredLeads.length)
  } : {
    // Server-side pagination for regular filters
    totalPages: pagination.totalPages || 1,
    totalLeads: pagination.totalLeads || 0,
    startIndex: startIndex,
    endIndex: endIndex
  };
  
  // Get leads to display - ensure proper pagination
  const filteredLeads = isSpecialFilter 
    ? allFilteredLeads.slice(paginationData.startIndex - 1, paginationData.endIndex)
    : leads; // For regular filters, use the paginated leads from Redux

  // Debug logging for pagination
  console.log('Pagination Debug:', {
    isPaginationReady,
    filterStatus,
    isSpecialFilter,
    currentPage,
    itemsPerPage,
    totalPages,
    totalLeads,
    leadsLength: leads.length,
    filteredLeadsLength: filteredLeads.length,
    allFilteredLeadsLength: allFilteredLeads.length,
    paginationData
  });

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
            leads={unfilteredLeads.length > 0 ? unfilteredLeads : leads}
            onStatusUpdate={handleStatusUpdate}
            onSelectLead={setSelectedLead}
            onEditLead={(lead) => {
              setSelectedLead(lead);
              setShowEditModal(true);
            }}
          />
        );
      case 'performance':
        return (
          <PerformanceTracking
            leads={unfilteredLeads}
            stats={unfilteredStats}
          />
        );
      default:
        return null;
    }
  };

  // Show loading state only when actually loading
  if (loading || statsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
      <div className="min-h-screen bg-gray-50">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage and track your sales leads effectively
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={() => setShowImportModal(true)}
                icon={HiCloudArrowUp}
                variant="warning"
                size="md"
              >
                Import Leads
              </Button>
              <Button
                onClick={() => navigate('/leads/create')}
                icon={HiPlus}
                variant="gradient"
                size="md"
              >
                Add New Lead
              </Button>
            </div>
          </div>

          {/* Stats Cards - Show zeros for empty collection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              title="Total Leads"
              value={0}
              icon={HiUser}
              iconBg="bg-gradient-to-br from-blue-500 to-blue-600"
              change="+5%"
              changeType="increase"
              className="h-full"
            />
            <StatCard
              title="Qualified"
              value={0}
              icon={HiCheckCircle}
              iconBg="bg-gradient-to-br from-green-500 to-green-600"
              change="+2%"
              changeType="increase"
              className="h-full"
            />
            <StatCard
              title="Unqualified"
              value={0}
              icon={HiXCircle}
              iconBg="bg-gradient-to-br from-red-500 to-red-600"
              change="+2%"
              changeType="increase"
              className="h-full"
            />
            <StatCard
              title="Order Completed"
              value={0}
              icon={HiCheckCircle}
              iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
              change="+8%"
              changeType="increase"
              className="h-full"
            />
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search leads..."
                  icon={HiMagnifyingGlass}
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
                  className="w-full sm:w-40"
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
                  className="w-full sm:w-40"
                />
              </div>
            </div>
          </div>

          {/* Empty State */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  Showing 1-0 of 0 leads
                </div>
              </div>
            </div>
            <div className="p-12">
              <div className="flex flex-col items-center text-center">
          <div className="text-gray-400 mb-4">
                  <HiUser className="h-16 w-16" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No leads found</h3>
                <p className="text-gray-600 mb-6 max-w-md">
                  No data available at the moment
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => navigate('/leads/create')}
                    icon={HiPlus}
                    variant="gradient"
                    size="md"
                  >
                    Create First Lead
                  </Button>
                  <Button
                    onClick={() => setShowImportModal(true)}
                    icon={HiCloudArrowUp}
                    variant="outline"
                    size="md"
                  >
                    Import Leads
                  </Button>
                </div>
              </div>
            </div>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
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
    <div className="min-h-screen bg-gray-50">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
            <h1 className="text-2xl font-bold text-gray-900">Leads Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage and track your sales leads effectively
            </p>
            </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                onClick={() => setShowImportModal(true)}
                icon={HiCloudArrowUp}
                variant="warning"
                size="md"
              >
                Import Leads
              </Button>
              <Button
                onClick={() => navigate('/leads/create')}
                icon={HiPlus}
                variant="gradient"
                size="md"
              >
                Add New Lead
              </Button>
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
                    size="md"
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

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
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
              change="+8%"
              changeType="increase"
              className="h-full"
            />
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search leads..."
                icon={HiMagnifyingGlass}
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
                className="w-full sm:w-40"
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
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </div>

        {/* Leads Table Area */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {paginationData.startIndex}-{paginationData.endIndex} of {paginationData.totalLeads} leads
              </div>
            </div>
          </div>
          <div className="overflow-hidden">
          {renderViewContent()}
          </div>
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
};

export default LeadsDashboard;