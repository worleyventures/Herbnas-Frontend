import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fetch unfiltered data on mount
  useEffect(() => {
    dispatch(getAllLeads({ limit: 1000, page: 1 })).then((result) => {
      if (result.payload && result.payload.data) {
        setUnfilteredLeads(result.payload.data.leads);
      }
    }).catch((error) => {
      console.error('Error fetching unfiltered leads on mount:', error);
    });

    // Fetch stats
    dispatch(getLeadStats()).then((result) => {
      if (result.payload && result.payload.data) {
        setUnfilteredStats(result.payload.data);
      }
    }).catch((error) => {
      console.error('Error fetching unfiltered stats on mount:', error);
    });
  }, [dispatch]);

  // Clear success/error messages after a delay and close modals on success
  useEffect(() => {
    console.log('🔍 Success states check:', { createSuccess, updateSuccess, deleteSuccess });
    if (createSuccess || updateSuccess || deleteSuccess) {
      if (createSuccess) {
        console.log('🔄 Lead created successfully, refreshing dashboard data...');
        setShowCreateModal(false);
        // Refresh stats after creating a lead
        dispatch(getLeadStats()).then((result) => {
          if (result.payload && result.payload.data) {
            console.log('📊 Stats refreshed:', result.payload.data);
            setUnfilteredStats(result.payload.data);
          }
        });
        // Immediately add the new lead to unfiltered leads if we have it from Redux
        if (leads.length > 0) {
          const newLead = leads[0]; // New lead is added to the front of the array
          setUnfilteredLeads(prev => {
            const exists = prev.some(lead => lead._id === newLead._id);
            if (!exists) {
              console.log('➕ Adding new lead to unfiltered leads immediately:', newLead.materialName);
              return [newLead, ...prev];
            }
            return prev;
          });
        }
        
        // Refresh unfiltered leads
        dispatch(getAllLeads({ limit: 1000, page: 1 })).then((result) => {
          if (result.payload && result.payload.data) {
            console.log('👥 Leads refreshed:', result.payload.data.leads?.length, 'leads');
            setUnfilteredLeads(result.payload.data.leads);
          }
        });
        
        // Also refresh the main leads list for the filtered display
        dispatch(getAllLeads({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
        })).then((result) => {
          if (result.payload && result.payload.data) {
            console.log('📋 Main leads list refreshed:', result.payload.data.leads?.length, 'leads');
          }
        });
      }
      if (updateSuccess) {
        setShowEditModal(false);
        setSelectedLead(null);
        // Refresh stats after updating a lead
        dispatch(getLeadStats()).then((result) => {
          if (result.payload && result.payload.data) {
            setUnfilteredStats(result.payload.data);
          }
        });
        
        // Also refresh the main leads list for the filtered display
        dispatch(getAllLeads({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
        }));
      }
      if (deleteSuccess) {
        setShowDeleteModal(false);
        setSelectedLead(null);
        // Refresh stats after deleting a lead
        dispatch(getLeadStats()).then((result) => {
          if (result.payload && result.payload.data) {
            setUnfilteredStats(result.payload.data);
          }
        });
        // Refresh unfiltered leads
        dispatch(getAllLeads({ limit: 1000, page: 1 })).then((result) => {
          if (result.payload && result.payload.data) {
            setUnfilteredLeads(result.payload.data.leads);
          }
        });
        
        // Also refresh the main leads list for the filtered display
        dispatch(getAllLeads({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          leadStatus: filterStatus === 'all' ? '' : filterStatus,
          dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
        }));
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

  // Manual refresh function
  const refreshDashboardData = useCallback(() => {
    console.log('🔄 Manual refresh triggered');
    setIsRefreshing(true);
    
    // Refresh unfiltered leads
    dispatch(getAllLeads({ limit: 1000, page: 1 })).then((result) => {
      if (result.payload && result.payload.data) {
        console.log('👥 Manual refresh - Leads updated:', result.payload.data.leads?.length, 'leads');
        setUnfilteredLeads(result.payload.data.leads);
      }
    });
    
    // Also refresh the main leads list for the filtered display
    dispatch(getAllLeads({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      leadStatus: filterStatus === 'all' ? '' : filterStatus,
      dispatchedFrom: filterBranch === 'all' ? '' : filterBranch
    })).then((result) => {
      if (result.payload && result.payload.data) {
        console.log('📋 Manual refresh - Main leads list updated:', result.payload.data.leads?.length, 'leads');
      }
    });
    
    // Refresh stats
    dispatch(getLeadStats()).then((result) => {
      if (result.payload && result.payload.data) {
        console.log('📊 Manual refresh - Stats updated:', result.payload.data);
        setUnfilteredStats(result.payload.data);
      }
    }).finally(() => {
      setIsRefreshing(false);
    });
  }, [dispatch, currentPage, itemsPerPage, searchTerm, filterStatus, filterBranch]);

  // Periodic refresh every 30 seconds to keep data up-to-date
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDashboardData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [refreshDashboardData]);

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
          
          // Refresh stats after status update
          dispatch(getLeadStats()).then((statsResult) => {
            if (statsResult.payload && statsResult.payload.data) {
              setUnfilteredStats(statsResult.payload.data);
            }
          });
        }
      });
    } catch (error) {
      console.error('Error updating lead status:', error);
    }
  };

  const handleCardFilter = (status) => {
    // Card filter clicked
    setFilterStatus(status);
    setCurrentPage(1);
  };

  const handleImportSuccess = (importResult) => {
    // Import success - refreshing data
    
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
        // Refreshed unfiltered leads after import
      }
    });
    
    dispatch(getLeadStats()).then((result) => {
      if (result.payload && result.payload.data) {
        setUnfilteredStats(result.payload.data);
        // Refreshed unfiltered stats after import
      }
    });
    
    // Data refresh dispatched
  };

  // Calculate stable counts from actual leads data (prioritize real data over API stats)
  const getStatusCount = (status) => {
    // First try to use actual leads data
    const leadsToCount = unfilteredLeads.length > 0 ? unfilteredLeads : leads;
    if (Array.isArray(leadsToCount) && leadsToCount.length > 0) {
      const count = leadsToCount.filter(lead => lead.leadStatus === status).length;
      console.log(`📊 Status count for ${status}:`, count, 'from', leadsToCount.length, 'leads');
      return count;
    }
    
    // Fallback to API stats if no leads data available
    const statsToUse = unfilteredStats || stats;
    if (statsToUse?.leadsByStatus && Array.isArray(statsToUse.leadsByStatus)) {
      const statusData = statsToUse.leadsByStatus.find(item => item._id === status);
      return statusData ? statusData.count : 0;
    }
    
    return 0;
  };

  // Calculate card counts - prioritize actual leads data over API stats
  const leadsToCount = unfilteredLeads.length > 0 ? unfilteredLeads : leads;
  const cardCounts = {
    total: leadsToCount.length || (unfilteredStats || stats)?.overview?.totalLeads || totalLeads || 0,
    newLead: getStatusCount('new_lead'),
    qualified: getStatusCount('qualified'),
    unqualified: getStatusCount('unqualified'), // Only actual unqualified status
    converted: getStatusCount('order_completed')
  };

  // Debug card counts
  console.log('📈 Card counts calculated:', {
    total: cardCounts.total,
    newLead: cardCounts.newLead,
    qualified: cardCounts.qualified,
    unqualified: cardCounts.unqualified,
    converted: cardCounts.converted,
    leadsToCount: leadsToCount.length,
    unfilteredLeads: unfilteredLeads.length,
    reduxLeads: leads.length,
    unfilteredStats: !!unfilteredStats,
    stats: !!stats,
    totalLeads: totalLeads
  });
  
  // Debug lead statuses
  if (leadsToCount.length > 0) {
    const statusCounts = leadsToCount.reduce((acc, lead) => {
      acc[lead.leadStatus] = (acc[lead.leadStatus] || 0) + 1;
      return acc;
    }, {});
    console.log('📋 Lead status breakdown:', statusCounts);
  }

  // Filter leads client-side for special status groups
  const getFilteredLeads = () => {
    // Filtering leads with status
    
    // For special filters, we need to use unfiltered data if available
    const dataSource = (filterStatus === 'unqualified' || filterStatus === 'converted') && unfilteredLeads.length > 0 
      ? unfilteredLeads 
      : leads;
    
    if (filterStatus === 'unqualified') {
      const unqualifiedLeads = dataSource.filter(lead => 
        lead.leadStatus === 'unqualified'
      );
      // Unqualified leads found
      return unqualifiedLeads;
    }
    
    if (filterStatus === 'converted') {
      const convertedLeads = dataSource.filter(lead => 
        lead.leadStatus === 'order_completed'
      );
      // Order completed leads found
      return convertedLeads;
    }
    
    // For other statuses, filter normally using the main leads array
    if (filterStatus !== 'all') {
      const filteredLeads = leads.filter(lead => lead.leadStatus === filterStatus);
      // Filtered leads for status
      return filteredLeads;
    }
    
    // Returning all leads
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

  // Debug logging for pagination (removed for production)

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
              <Button
                onClick={() => navigate('/leads/create')}
                icon={HiPlus}
                variant="gradient"
                size="sm"
              >
                Add New Lead
              </Button>
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
                value={cardCounts.converted}
                icon={HiCheckCircle}
                iconBg="bg-gradient-to-br from-purple-500 to-purple-600"
                gradient="purple"
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
              <Button
                onClick={() => navigate('/leads/create')}
                icon={HiPlus}
                variant="gradient"
                size="sm"
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
                gradient="green"
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
                gradient="purple"
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