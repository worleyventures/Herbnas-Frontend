import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getAllBranches, getActiveBranches } from '../../../redux/actions/branchActions';
import { getAllUsers } from '../../../redux/actions/userActions';
import { getActiveProducts } from '../../../redux/actions/productActions';
import { 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiUser
} from 'react-icons/hi2';
import { Table, ActionButton, StatusBadge, PriorityBadge, ConfirmationModal, LeadDetailsModal } from '../../common';

const LeadCRUD = ({ 
  leads, 
  onSelectLead, 
  onEditLead, 
  onDeleteLead, 
  onCreateLead, 
  onUpdateLead, 
  onDeleteLeadConfirm,
  showDeleteModal,
  selectedLead,
  setShowDeleteModal,
  loading,
  createLoading,
  updateLoading,
  deleteLoading
}) => {
  const navigate = useNavigate();
  const [showLeadModal, setShowLeadModal] = useState(false);
  
  const dispatch = useDispatch();
  
  // Get branches, users, and products from Redux state with memoization
  const branches = useSelector((state) => state.branches?.branches || []);
  const users = useSelector((state) => state.user?.users || []);
  const products = useSelector((state) => {
    return state.products?.activeProducts || [];
  });
  const branchesLoading = useSelector((state) => state.branches?.loading || false);
  const usersLoading = useSelector((state) => state.user?.loading || false);
  const productsLoading = useSelector((state) => state.products?.activeLoading || false);
  const branchesError = useSelector((state) => state.branches?.error || null);
  const usersError = useSelector((state) => state.user?.error || null);
  const productsError = useSelector((state) => state.products?.activeError || null);
  
  // Fallback branches if API fails
  const fallbackBranches = [
    { _id: '1', branchName: 'Main Branch' },
    { _id: '2', branchName: 'North Branch' },
    { _id: '3', branchName: 'South Branch' },
    { _id: '4', branchName: 'East Branch' },
    { _id: '5', branchName: 'West Branch' }
  ];
  
  // Use branches from API or fallback
  const availableBranches = branches.length > 0 ? branches : fallbackBranches;
  
  // Memoize the sales reps filter to prevent unnecessary re-renders
  const salesReps = useMemo(() => {
    return users.filter(user => 
      user.role === 'sales_rep' || user.role === 'junior_supervisor' || user.role === 'supervisor'
    );
  }, [users]);
  
  // Get authentication state
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  
  // Fetch branches and users data on component mount only if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (branches.length === 0 && !branchesLoading) {
        // Try to get active branches first (public route), then all branches if needed
        dispatch(getActiveBranches());
      }
      if (users.length === 0 && !usersLoading) {
        dispatch(getAllUsers());
      }
      if (products.length === 0 && !productsLoading) {
        dispatch(getActiveProducts());
      }
    }
  }, [dispatch, isAuthenticated, user, branches.length, users.length, products.length, branchesLoading, usersLoading, productsLoading]);

  const statusOptions = [
    { value: 'new_lead', label: 'New Lead', color: 'bg-blue-100 text-blue-800' },
    { value: 'not_answered', label: 'Not Answered', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'qualified', label: 'Qualified', color: 'bg-purple-100 text-purple-800' },
    { value: 'pending', label: 'Pending', color: 'bg-orange-100 text-orange-800' },
    { value: 'order_completed', label: 'Order Completed', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'unqualified', label: 'Unqualified', color: 'bg-red-100 text-red-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const handleCreateClick = () => {
    navigate('/leads/create');
  };

  const handleEditClick = (lead) => {
    navigate(`/leads/edit/${lead._id}`, { 
      state: { 
        lead: lead, 
        mode: 'edit' 
      } 
    });
  };

  const handleDelete = (lead) => {
    onSelectLead(lead);
    setShowDeleteModal(true);
  };

  const handleView = (lead) => {
    onSelectLead(lead);
    setShowLeadModal(true);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const statusOption = statusOptions.find(option => option.value === status);
    return statusOption ? statusOption.color : 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const priorityOption = priorityOptions.find(option => option.value === priority);
    return priorityOption ? priorityOption.color : 'bg-gray-100 text-gray-800';
  };

  const getPaymentTypeColor = (paymentType) => {
    const colors = {
      prepaid: 'bg-[#22c55e]-100 text-[#22c55e]-800',
      local: 'bg-blue-100 text-blue-800',
      cod: 'bg-orange-100 text-orange-800'
    };
    return colors[paymentType] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6">

      {/* Leads Table */}
      <Table
        columns={[
          {
            key: 'customerName',
            label: 'Customer',
            render: (lead) => (
              <div className="flex flex-col">
                <div className="text-sm font-medium text-gray-900">
                  {lead.customerName || 'N/A'}
                </div>
                {/* Mobile: Show additional info */}
                <div className="sm:hidden mt-1 space-y-1">
                  <div className="text-xs text-gray-500">
                    {lead.customerMobile || 'N/A'}
                  </div>
                  <div className="flex items-center space-x-2">
                    <StatusBadge 
                      status={lead.leadStatus || 'unknown'} 
                      className="text-xs"
                    />
                    <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${getPaymentTypeColor(lead.payment?.paymentType)}`}>
                      {lead.payment?.paymentType ? lead.payment.paymentType.charAt(0).toUpperCase() + lead.payment.paymentType.slice(1) : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            )
          },
          {
            key: 'customerMobile',
            label: 'Contact',
            hiddenOnMobile: true,
            render: (lead) => (
              <div className="text-sm text-gray-900">
                {lead.customerMobile || 'N/A'}
              </div>
            )
          },
          {
            key: 'leadStatus',
            label: 'Status',
            hiddenOnMobile: true,
            render: (lead) => {
              // Debug: Log the lead status for debugging
              console.log('Lead status:', lead.leadStatus, 'for lead:', lead.customerName);
              return (
                <StatusBadge 
                  status={lead.leadStatus || 'unknown'} 
                  className="min-w-[80px] text-center"
                />
              );
            }
          },
          {
            key: 'branch',
            label: 'Branch',
            hiddenOnMobile: true,
            render: (lead) => (
              <div className="text-sm text-gray-900">
                {(() => {
                  if (!lead.dispatchedFrom) return lead.branch || 'Unassigned';
                  if (typeof lead.dispatchedFrom === 'string') return lead.dispatchedFrom;
                  if (lead.dispatchedFrom.name) return lead.dispatchedFrom.name;
                  if (lead.dispatchedFrom.branchName) return lead.dispatchedFrom.branchName;
                  return lead.branch || 'Unassigned';
                })()}
              </div>
            )
          },
          {
            key: 'paymentType',
            label: 'Payment Type',
            hiddenOnMobile: true,
            render: (lead) => (
              <div className="flex items-center">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentTypeColor(lead.payment?.paymentType)}`}>
                  {lead.payment?.paymentType ? lead.payment.paymentType.charAt(0).toUpperCase() + lead.payment.paymentType.slice(1) : 'N/A'}
                </span>
              </div>
            )
          },
          {
            key: 'createdAt',
            label: 'Created',
            hiddenOnMobile: true,
            render: (lead) => (
              <div className="text-sm text-gray-500">
                {formatDate(lead.createdAt)}
              </div>
            )
          }
        ]}
        data={leads}
        loading={loading}
        emptyMessage="No leads found"
        emptyIcon={HiUser}
        onRowClick={onSelectLead}
        actions={[
          {
            icon: HiEye,
            onClick: handleView,
            title: "View Details",
            variant: "view"
          },
          {
            icon: HiPencil,
            onClick: handleEditClick,
            title: "Edit Lead",
            variant: "edit"
          },
          {
            icon: HiTrash,
            onClick: handleDelete,
            title: "Delete Lead",
            variant: "delete"
          }
        ]}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={onDeleteLeadConfirm}
        title="Delete Lead"
        message={
          selectedLead ? (
            <div className="text-left">
              <p className="mb-2">Are you sure you want to delete the lead for <strong>{selectedLead.customerName}</strong>?</p>
              <p className="text-sm text-gray-600">All associated data will be permanently removed.</p>
            </div>
          ) : "Are you sure you want to delete this lead?"
        }
        confirmText="Delete Lead"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

      {/* Lead Details Modal */}
      <LeadDetailsModal
        isOpen={showLeadModal}
        onClose={() => setShowLeadModal(false)}
        lead={selectedLead}
        onEdit={onEditLead}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default LeadCRUD;