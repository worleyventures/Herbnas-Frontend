import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUsersByBranch } from '../../../redux/actions/userActions';
import { 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiBuildingOffice2,
  HiMapPin,
  HiUsers,
  HiCog6Tooth,
  HiCheckCircle,
  HiXCircle
} from 'react-icons/hi2';
import { Table, ActionButton, StatusBadge, ConfirmationModal } from '../../common';

const BranchCRUD = ({ 
  branches, 
  onSelectBranch,
  onViewBranch, 
  onEditBranch, 
  onDeleteBranch, 
  onCreateBranch, 
  onUpdateBranch, 
  onDeleteBranchConfirm,
  onDisableBranch,
  onActivateBranch,
  showDeleteModal,
  showDisableModal,
  showActivateModal,
  selectedBranch,
  setShowDeleteModal,
  setShowDisableModal,
  setShowActivateModal,
  loading,
  createLoading,
  updateLoading,
  deleteLoading,
  pagination,
  onPageChange
}) => {
  const navigate = useNavigate();
  
  const dispatch = useDispatch();
  
  // Get user role for permission checks
  const { user } = useSelector((state) => state.auth);
  const isSalesExecutive = user?.role === 'sales_executive';
  const isAccountsManager = user?.role === 'accounts_manager';
  const isProductionManager = user?.role === 'production_manager';
  const isAdmin = user?.role === 'admin';
  const isSuperAdmin = user?.role === 'super_admin';
  const isSupervisor = user?.role === 'supervisor';
  // Admin, super_admin, and supervisor can edit any branch
  const canEditBranch = (branch) => {
    if (isSuperAdmin || isSupervisor || isAdmin) return true;
    return false;
  };
  
  // Get users for createdBy/updatedBy display
  const users = useSelector((state) => state.user?.users || []);
  
  // Handler functions (defined before useMemo to avoid reference errors)
  const handleViewBranch = (branch) => {
    if (onViewBranch) {
      onViewBranch(branch);
    }
  };

  const handleDisableBranch = (branch) => {
    console.log('Disable branch clicked:', {
      branchId: branch._id,
      branchName: branch.branchName,
      isActive: branch.isActive,
      isActiveType: typeof branch.isActive
    });
    onSelectBranch(branch);
    onDisableBranch();
  };

  const handleActivateBranch = (branch) => {
    onSelectBranch(branch);
    onActivateBranch();
  };

  const handleDeleteBranch = (branch) => {
    onSelectBranch(branch);
    setShowDeleteModal(true);
  };
  
  // Get branch users from Redux state
  const { branchUsers, branchUsersLoading } = useSelector(state => state.user);
  const usersLoading = useSelector((state) => state.user?.loading || false);
  const usersError = useSelector((state) => state.user?.error || null);
  
  // Fallback users if API fails
  const fallbackUsers = [
    { _id: '1', firstName: 'Admin', lastName: 'User' },
    { _id: '2', firstName: 'Manager', lastName: 'User' }
  ];
  
  const allUsers = users.length > 0 ? users : fallbackUsers;
  
  // Memoized columns for better performance
  const columns = useMemo(() => [
    {
      key: 'branchName',
      label: 'Branch Name',
      sortable: true,
      render: (branch) => (
        <div>
          <div className="text-sm font-medium text-gray-900 truncate">{branch.branchName}</div>
          <div className="text-xs text-gray-500 truncate">{branch.branchCode}</div>
        </div>
      )
    },
    {
      key: 'branchAddress',
      label: 'Address',
      sortable: true,
      render: (branch) => {
        // Handle both string and object address formats
        let addressText = '';
        let addressTitle = '';
        
        if (typeof branch.branchAddress === 'object' && branch.branchAddress !== null) {
          addressText = `${branch.branchAddress.street || ''}, ${branch.branchAddress.city || ''}, ${branch.branchAddress.state || ''} - ${branch.branchAddress.pinCode || ''}`;
          addressTitle = addressText;
        } else {
          addressText = branch.branchAddress || 'N/A';
          addressTitle = addressText;
        }
        
        return (
          <div className="text-sm text-gray-900 max-w-48 truncate" title={addressTitle}>
            {addressText}
          </div>
        );
      }
    },
    {
      key: 'incentiveType',
      label: 'Incentive Type (Count)',
      sortable: true,
      render: (branch) => (
        <div className="text-sm text-gray-900">
          {branch.incentiveType !== undefined && branch.incentiveType !== null 
            ? branch.incentiveType.toLocaleString('en-IN') 
            : '0'}
        </div>
      )
    },
    {
      key: 'isActive',
      label: 'Status',
      sortable: true,
      render: (branch) => (
        <StatusBadge 
          status={branch.isActive ? 'active' : 'inactive'}
          variant={branch.isActive ? 'success' : 'danger'}
        />
      )
    },
    // {
    //   key: 'createdBy',
    //   label: 'Created By',
    //   sortable: false,
    //   render: (branch) => {
    //     const user = allUsers.find(u => u._id === branch.createdBy);
    //     return (
    //       <div className="flex items-center">
    //         <div className="flex-shrink-0 h-6 w-6">
    //           <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
    //             <HiUsers className="h-3 w-3 text-gray-600" />
    //           </div>
    //         </div>
    //         <div className="ml-2">
    //           <div className="text-sm font-medium text-gray-900 truncate">
    //             {user ? `${user.firstName} ${user.lastName}` : 'Unknown User'}
    //           </div>
    //         </div>
    //       </div>
    //     );
    //   }
    // },
    {
      key: 'createdAt',
      label: 'Created At',
      sortable: true,
      render: (branch) => (
        <div className="text-sm text-gray-900">
          {new Date(branch.createdAt).toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
          })}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (branch) => (
        <div className="flex items-center space-x-2">
          <ActionButton
            icon={HiEye}
            onClick={() => handleViewBranch(branch)}
            variant="view"
            size="sm"
            title="View Details"
          />
          {(!isSalesExecutive && !isAccountsManager && !isProductionManager && canEditBranch(branch)) && (
            <>
              <ActionButton
                icon={HiPencil}
                onClick={() => navigate(`/branches/edit/${branch._id}`, { 
                  state: { 
                    branch,
                    returnTo: '/branches'
                  }
                })}
                variant="edit"
                size="sm"
                title="Edit Branch"
              />
              {(isSuperAdmin || isSupervisor) && (
                branch.isActive ? (
                  <ActionButton
                    icon={HiXCircle}
                    onClick={() => handleDisableBranch(branch)}
                    variant="warning"
                    size="sm"
                    title="Disable Branch"
                  />
                ) : (
                  <ActionButton
                    icon={HiCheckCircle}
                    onClick={() => handleActivateBranch(branch)}
                    variant="success"
                    size="sm"
                    title="Activate Branch"
                  />
                )
              )}
              {isSuperAdmin && (
                <ActionButton
                  icon={HiTrash}
                  onClick={() => handleDeleteBranch(branch)}
                  variant="delete"
                  size="sm"
                  title="Delete Branch"
                />
              )}
            </>
          )}
        </div>
      )
    }
  ], [allUsers, isSalesExecutive, isAdmin, isSuperAdmin, isSupervisor, user, navigate, handleViewBranch, handleDisableBranch, handleActivateBranch, handleDeleteBranch]);


  // Loading state
  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!branches || branches.length === 0) {
    return (
      <div className="p-6 text-center">
        <HiBuildingOffice2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Branches Found</h3>
        <p className="text-gray-600 mb-4">Get started by creating your first branch.</p>
        {!isSalesExecutive && !isAccountsManager && !isProductionManager && (
          <button
            onClick={onCreateBranch}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#22c55e] hover:bg-[#16a34a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]"
          >
            <HiBuildingOffice2 className="h-4 w-4 mr-2" />
            Add New Branch
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      <Table
        data={branches}
        columns={columns}
        loading={loading}
        emptyMessage="No branches found"
        className="w-full"
        pagination={pagination ? {
          ...pagination,
          onPageChange: onPageChange,
          itemName: 'branches'
        } : null}
      />


      {/* Disable Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDisableModal}
        onClose={() => setShowDisableModal(false)}
        onConfirm={() => {
          onDeleteBranchConfirm();
        }}
        title="Disable Branch"
        message={
          selectedBranch ? (
            <div className="text-left">
              <p className="mb-2">Are you sure you want to disable the branch <strong>{selectedBranch.branchName}</strong>?</p>
              <p className="text-sm text-gray-600">The branch will be deactivated and won't be available for new operations.</p>
            </div>
          ) : "Are you sure you want to disable this branch?"
        }
        confirmText="Disable"
        cancelText="Cancel"
        variant="warning"
        loading={deleteLoading}
      />

      {/* Activate Confirmation Modal */}
      <ConfirmationModal
        isOpen={showActivateModal}
        onClose={() => setShowActivateModal(false)}
        onConfirm={() => {
          onDeleteBranchConfirm();
        }}
        title="Activate Branch"
        message={
          selectedBranch ? (
            <div className="text-left">
              <p className="mb-2">Are you sure you want to activate the branch <strong>{selectedBranch.branchName}</strong>?</p>
              <p className="text-sm text-gray-600">The branch will be available for all operations.</p>
            </div>
          ) : "Are you sure you want to activate this branch?"
        }
        confirmText="Activate"
        cancelText="Cancel"
        variant="success"
        loading={deleteLoading}
      />

    </div>
  );
};

export default BranchCRUD;
