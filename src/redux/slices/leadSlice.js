import { createSlice } from '@reduxjs/toolkit';
import {
  getAllLeads,
  getLeadById,
  createLead,
  updateLead,
  deleteLead,
  updateLeadStatus,
  bulkUpdateLeads,
  getLeadStats,
  exportLeads,
  clearLeadErrors,
  clearLeadSuccess,
  setSelectedLead,
  clearSelectedLead,
  setLeadFilters,
  clearLeadFilters,
  setLeadPagination
} from '../actions/leadActions';

const initialState = {
  // Lead data
  leads: [],
  selectedLead: null,
  totalLeads: 0,
  
  // Loading states
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  statsLoading: false,
  exportLoading: false,
  
  // Error states
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  statsError: null,
  exportError: null,
  
  // Success states
  success: null,
  createSuccess: null,
  updateSuccess: null,
  deleteSuccess: null,
  
  // Pagination
  pagination: {
    currentPage: 1,
    totalPages: 1,
    limit: 10,
    hasNextPage: false,
    hasPrevPage: false
  },
  
  // Filters
  filters: {
    search: '',
    leadStatus: '',
    gender: '',
    maritalStatus: '',
    minAge: '',
    maxAge: '',
    startDate: '',
    endDate: '',
    city: '',
    state: '',
    dispatchedFrom: '',
    createdBy: '',
    products: [],
    sortBy: 'createdAt',
    sortOrder: 'desc'
  },
  
  // Statistics
  stats: {
    overview: {
      totalLeads: 0,
      recentLeads: 0
    },
    leadsByStatus: [],
    leadsByGender: [],
    leadsByMaritalStatus: [],
    ageStats: {
      avgAge: 0,
      minAge: 0,
      maxAge: 0
    },
    topCities: [],
    topStates: [],
    leadsPerMonth: [],
    topCreators: []
  },
  
  // Export data
  exportData: null
};

const leadSlice = createSlice({
  name: 'leads',
  initialState,
  reducers: {
    // Reset lead state
    resetLeadState: (state) => {
      return { ...initialState };
    },
    
    // Update lead in list
    updateLeadInList: (state, action) => {
      const updatedLead = action.payload;
      const index = state.leads.findIndex(lead => lead._id === updatedLead._id);
      if (index !== -1) {
        state.leads[index] = updatedLead;
      }
      if (state.selectedLead && state.selectedLead._id === updatedLead._id) {
        state.selectedLead = updatedLead;
      }
    },
    
    // Remove lead from list
    removeLeadFromList: (state, action) => {
      const leadId = action.payload;
      state.leads = state.leads.filter(lead => lead._id !== leadId);
      if (state.selectedLead && state.selectedLead._id === leadId) {
        state.selectedLead = null;
      }
      state.totalLeads = Math.max(0, state.totalLeads - 1);
    },
    
    // Add lead to list
    addLeadToList: (state, action) => {
      const newLead = action.payload;
      state.leads.unshift(newLead);
      state.totalLeads += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      // Get all leads
      .addCase(getAllLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = action.payload.data?.leads || [];
        state.totalLeads = action.payload.data?.pagination?.totalLeads || 0;
        state.pagination = action.payload.data?.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalLeads: 0,
          hasNextPage: false,
          hasPrevPage: false
        };
        state.error = null;
      })
      .addCase(getAllLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.leads = [];
      })
      
      // Get lead by ID
      .addCase(getLeadById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getLeadById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedLead = action.payload.data.lead;
        state.error = null;
      })
      .addCase(getLeadById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.selectedLead = null;
      })
      
      // Create lead
      .addCase(createLead.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
        state.createSuccess = null;
      })
      .addCase(createLead.fulfilled, (state, action) => {
        state.createLoading = false;
        state.createSuccess = action.payload.message;
        state.createError = null;
        
        // Add to leads list if we're on the first page
        if (state.pagination.currentPage === 1) {
          state.leads.unshift(action.payload.data.lead);
          state.totalLeads += 1;
        }
      })
      .addCase(createLead.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
        state.createSuccess = null;
      })
      
      // Update lead
      .addCase(updateLead.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateLead.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message;
        state.updateError = null;
        
        // Update lead in list and selected lead
        const updatedLead = action.payload.data.lead;
        const index = state.leads.findIndex(lead => lead._id === updatedLead._id);
        if (index !== -1) {
          state.leads[index] = updatedLead;
        }
        if (state.selectedLead && state.selectedLead._id === updatedLead._id) {
          state.selectedLead = updatedLead;
        }
      })
      .addCase(updateLead.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = null;
      })
      
      // Delete lead
      .addCase(deleteLead.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
        state.deleteSuccess = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.deleteSuccess = action.payload.message;
        state.deleteError = null;
        
        // Remove lead from list
        const leadId = action.payload.leadId;
        state.leads = state.leads.filter(lead => lead._id !== leadId);
        if (state.selectedLead && state.selectedLead._id === leadId) {
          state.selectedLead = null;
        }
        state.totalLeads = Math.max(0, state.totalLeads - 1);
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
        state.deleteSuccess = null;
      })
      
      // Update lead status
      .addCase(updateLeadStatus.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message;
        state.updateError = null;
        
        // Update lead in list and selected lead
        const updatedLead = action.payload.data.lead;
        const index = state.leads.findIndex(lead => lead._id === updatedLead._id);
        if (index !== -1) {
          state.leads[index] = updatedLead;
        }
        if (state.selectedLead && state.selectedLead._id === updatedLead._id) {
          state.selectedLead = updatedLead;
        }
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = null;
      })
      
      // Bulk update leads
      .addCase(bulkUpdateLeads.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
        state.updateSuccess = null;
      })
      .addCase(bulkUpdateLeads.fulfilled, (state, action) => {
        state.updateLoading = false;
        state.updateSuccess = action.payload.message;
        state.updateError = null;
        
        // Update leads in list with the updated data
        const updatedLeads = action.payload.data?.leads || [];
        updatedLeads.forEach(updatedLead => {
          const index = state.leads.findIndex(lead => lead._id === updatedLead._id);
          if (index !== -1) {
            state.leads[index] = updatedLead;
          }
          if (state.selectedLead && state.selectedLead._id === updatedLead._id) {
            state.selectedLead = updatedLead;
          }
        });
      })
      .addCase(bulkUpdateLeads.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
        state.updateSuccess = null;
      })
      
      // Get lead statistics
      .addCase(getLeadStats.pending, (state) => {
        state.statsLoading = true;
        state.statsError = null;
      })
      .addCase(getLeadStats.fulfilled, (state, action) => {
        state.statsLoading = false;
        state.stats = action.payload.data || {
          overview: {
            totalLeads: 0,
            recentLeads: 0
          },
          leadsByStatus: [],
          leadsByGender: [],
          leadsByMaritalStatus: [],
          ageStats: {
            avgAge: 0,
            minAge: 0,
            maxAge: 0
          },
          topCities: [],
          topStates: [],
          leadsPerMonth: [],
          topCreators: []
        };
        state.statsError = null;
      })
      .addCase(getLeadStats.rejected, (state, action) => {
        state.statsLoading = false;
        state.statsError = action.payload;
      })
      
      // Export leads
      .addCase(exportLeads.pending, (state) => {
        state.exportLoading = true;
        state.exportError = null;
      })
      .addCase(exportLeads.fulfilled, (state, action) => {
        state.exportLoading = false;
        state.exportData = action.payload.data;
        state.exportError = null;
      })
      .addCase(exportLeads.rejected, (state, action) => {
        state.exportLoading = false;
        state.exportError = action.payload;
        state.exportData = null;
      })
      
      // Clear errors
      .addCase(clearLeadErrors.fulfilled, (state) => {
        state.error = null;
        state.createError = null;
        state.updateError = null;
        state.deleteError = null;
        state.statsError = null;
        state.exportError = null;
      })
      
      // Clear success messages
      .addCase(clearLeadSuccess.fulfilled, (state) => {
        state.success = null;
        state.createSuccess = null;
        state.updateSuccess = null;
        state.deleteSuccess = null;
      })
      
      // Set selected lead
      .addCase(setSelectedLead.fulfilled, (state, action) => {
        state.selectedLead = action.payload;
      })
      
      // Clear selected lead
      .addCase(clearSelectedLead.fulfilled, (state) => {
        state.selectedLead = null;
      })
      
      // Set filters
      .addCase(setLeadFilters.fulfilled, (state, action) => {
        state.filters = { ...state.filters, ...action.payload };
      })
      
      // Clear filters
      .addCase(clearLeadFilters.fulfilled, (state, action) => {
        state.filters = action.payload;
      })
      
      // Set pagination
      .addCase(setLeadPagination.fulfilled, (state, action) => {
        state.pagination = { ...state.pagination, ...action.payload };
      });
  }
});

export const {
  resetLeadState,
  updateLeadInList,
  removeLeadFromList,
  addLeadToList
} = leadSlice.actions;

// Selectors
export const selectLeads = (state) => state.leads.leads;
export const selectSelectedLead = (state) => state.leads.selectedLead;
export const selectLeadLoading = (state) => state.leads.loading;
export const selectLeadCreateLoading = (state) => state.leads.createLoading;
export const selectLeadUpdateLoading = (state) => state.leads.updateLoading;
export const selectLeadDeleteLoading = (state) => state.leads.deleteLoading;
export const selectLeadStatsLoading = (state) => state.leads.statsLoading;
export const selectLeadExportLoading = (state) => state.leads.exportLoading;

export const selectLeadError = (state) => state.leads.error;
export const selectLeadCreateError = (state) => state.leads.createError;
export const selectLeadUpdateError = (state) => state.leads.updateError;
export const selectLeadDeleteError = (state) => state.leads.deleteError;
export const selectLeadStatsError = (state) => state.leads.statsError;
export const selectLeadExportError = (state) => state.leads.exportError;

export const selectLeadSuccess = (state) => state.leads.success;
export const selectLeadCreateSuccess = (state) => state.leads.createSuccess;
export const selectLeadUpdateSuccess = (state) => state.leads.updateSuccess;
export const selectLeadDeleteSuccess = (state) => state.leads.deleteSuccess;

export const selectLeadPagination = (state) => state.leads.pagination;
export const selectLeadFilters = (state) => state.leads.filters;
export const selectLeadStats = (state) => state.leads.stats;
export const selectLeadExportData = (state) => state.leads.exportData;
export const selectTotalLeads = (state) => state.leads.totalLeads;

// Complex selectors
export const selectFilteredLeadsCount = (state) => {
  const { leads, filters } = state.leads;
  if (!filters.search && !filters.leadStatus && !filters.gender) {
    return leads.length;
  }
  
  return leads.filter(lead => {
    const matchesSearch = !filters.search || 
      lead.customerName.toLowerCase().includes(filters.search.toLowerCase()) ||
      lead.customerMobile.includes(filters.search);
    
    const matchesStatus = !filters.leadStatus || lead.leadStatus === filters.leadStatus;
    const matchesGender = !filters.gender || lead.gender === filters.gender;
    
    return matchesSearch && matchesStatus && matchesGender;
  }).length;
};

export const selectLeadsByStatus = (state) => {
  const leads = state.leads.leads;
  return leads.reduce((acc, lead) => {
    acc[lead.leadStatus] = (acc[lead.leadStatus] || 0) + 1;
    return acc;
  }, {});
};

export const selectRecentLeads = (state) => {
  const leads = state.leads.leads;
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  return leads.filter(lead => new Date(lead.createdAt) >= sevenDaysAgo);
};

export default leadSlice.reducer;
