import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { HiUserGroup, HiEye, HiPencil, HiTrash } from 'react-icons/hi2';
import { StatCard, Table, Button, ActionButton, Input, Select, Loading, EmptyState, UserDetailsModal, SearchInput } from '../../components/common';
import { getAllUsers, deleteUser } from '../../redux/actions/userActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { addNotification } from '../../redux/slices/uiSlice';

const UsersPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // Redux state
  const userState = useSelector((state) => state.user);
  const branchState = useSelector((state) => state.branches);

  const users = userState?.users || [];
  const allUsers = userState?.allUsers || [];
  const loading = userState?.loading || false;
  const error = userState?.error || null;
  const branches = branchState?.branches || [];
  const pagination = userState?.pagination || null;

  // Refresh all users for stats
  const refreshAllUsers = () => {
    dispatch(getAllUsers({ page: 1, limit: 1000 })).then((result) => {
      if (result.payload && result.payload.data) {
        const usersData = Array.isArray(result.payload.data) 
          ? result.payload.data 
          : (result.payload.data.users || []);
        console.log('Refreshed all users:', usersData);
      }
    }).catch((error) => {
      console.error('Error refreshing all users:', error);
    });
  };

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showUserModal, setShowUserModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load all users for stats and branches on component mount
  useEffect(() => {
    dispatch(getAllUsers({
      page: 1,
      limit: 1000, // Get all users for stats
      search: '',
      role: '',
      branch: '',
      status: ''
    }));
    dispatch(getAllBranches());
  }, [dispatch]);

  // Load filtered users for table display
  useEffect(() => {
    dispatch(getAllUsers({
      page: currentPage,
      limit: itemsPerPage,
      search: searchTerm,
      role: filterRole === 'all' ? '' : filterRole,
      branch: filterBranch === 'all' ? '' : filterBranch,
      status: filterStatus === 'all' ? '' : filterStatus
    }));
  }, [dispatch, currentPage, itemsPerPage, searchTerm, filterRole, filterBranch, filterStatus]);

  // Refresh users when navigating to this page (e.g., returning from edit form)
  useEffect(() => {
    if (location.pathname === '/users') {
      // Refresh filtered users
      dispatch(getAllUsers({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        role: filterRole === 'all' ? '' : filterRole,
        branch: filterBranch === 'all' ? '' : filterBranch,
        status: filterStatus === 'all' ? '' : filterStatus
      }));
      // Also refresh all users for stats
      refreshAllUsers();
    }
  }, [location.pathname, dispatch]);

  // Update allUsers when users change (for stats calculation)
  useEffect(() => {
    if (users.length > 0) {
      // If we have users from API, use them for stats
      const usersForStats = users;
      // Update allUsers in Redux state for stats calculation
      if (JSON.stringify(usersForStats) !== JSON.stringify(allUsers)) {
        // This will be handled by the Redux slice
      }
    }
  }, [users, allUsers]);

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesBranch = filterBranch === 'all' || 
      (user.branch?._id === filterBranch) || 
      (typeof user.branch === 'string' && user.branch === filterBranch);
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? user.isActive : !user.isActive);

    return matchesSearch && matchesRole && matchesBranch && matchesStatus;
  });

  // Calculate stats from users data (use users array for stats)
  const usersForStats = users.length > 0 ? users : allUsers;
  const totalUsers = usersForStats.length;
  const adminUsers = usersForStats.filter(user => user.role === 'admin').length;
  const supervisorUsers = usersForStats.filter(user => user.role === 'supervisor').length;
  const salesExecutiveUsers = usersForStats.filter(user => user.role === 'sales_executive').length;
  const productionManagerUsers = usersForStats.filter(user => user.role === 'production_manager').length;
  const accountsManagerUsers = usersForStats.filter(user => user.role === 'accounts_manager').length;
  const activeUsers = usersForStats.filter(user => user.isActive === true).length;
  const inactiveUsers = usersForStats.filter(user => user.isActive === false).length;

  // Available roles for filtering
  const availableRoles = [
    { value: 'all', label: 'All Roles' },
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'production_manager', label: 'Production Manager' },
    { value: 'accounts_manager', label: 'Accounts Manager' },
    { value: 'admin', label: 'Admin' }
  ];

  // Available branches for filtering
  const availableBranches = [
    { value: 'all', label: 'All Branches' },
    ...branches.map(branch => ({
      value: branch._id,
      label: branch.branchName
    }))
  ];

  // Table columns
  const columns = [
    {
      key: 'user',
      label: 'User',
      render: (user) => (
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-white">
                {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            </div>
          </div>
          {/* Mobile: Show additional info */}
          <div className="sm:hidden space-y-1">
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${user.isActive
                  ? 'bg-[#22c55e]-100 text-[#22c55e]-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {user.phone || 'N/A'}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Role',
      hiddenOnMobile: true,
      render: (user) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {user.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
        </span>
      )
    },
    {
      key: 'branch',
      label: 'Branch',
      hiddenOnMobile: true,
      render: (user) => {
        // Handle both populated branch object and branch ID
        const getBranchInfo = () => {
          if (!user.branch) {
            return null;
          }
          
          // If branch is populated (object)
          if (typeof user.branch === 'object' && user.branch.branchName) {
            return {
              name: user.branch.branchName,
              // location: `${user.branch.city}, ${user.branch.state}`
            };
          }
          
          // If branch is just an ID, find it in the branches array
          if (typeof user.branch === 'string') {
            const branch = branches.find(b => b._id === user.branch);
            if (branch) {
              return {
                name: branch.branchName,
                location: `${branch.city}, ${branch.state}`
              };
            }
          }
          
          return null;
        };

        const branchInfo = getBranchInfo();
        
        return (
          <div className="text-sm">
            {branchInfo ? (
              <div>
                <p className="font-medium text-gray-900">{branchInfo.name}</p>
                <p className="text-gray-500">{branchInfo.location}</p>
              </div>
            ) : (
              <span className="text-gray-400 italic">No branch assigned</span>
            )}
          </div>
        );
      }
    },
    {
      key: 'phone',
      label: 'Phone',
      hiddenOnMobile: true,
      render: (user) => (
        <span className="text-sm text-gray-900">{user.phone || 'N/A'}</span>
      )
    },
    {
      key: 'status',
      label: 'Status',
      hiddenOnMobile: true,
      render: (user) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive
            ? 'bg-[#22c55e]-100 text-[#22c55e]-800'
            : 'bg-red-100 text-red-800'
          }`}>
          {user.isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center space-x-1">
          <ActionButton
            icon={HiEye}
            onClick={() => handleViewUser(user)}
            variant="view"
            title="View User"
          />
          <ActionButton
            icon={HiPencil}
            onClick={() => handleEditUser(user)}
            variant="edit"
            title="Edit User"
          />
          <ActionButton
            icon={HiTrash}
            onClick={() => handleDeleteUser(user)}
            variant="delete"
            title="Delete User"
          />
        </div>
      )
    }
  ];

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    switch (filterType) {
      case 'role':
        setFilterRole(value);
        break;
      case 'branch':
        setFilterBranch(value);
        break;
      case 'status':
        setFilterStatus(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm('');
    setFilterRole('all');
    setFilterBranch('all');
    setFilterStatus('all');
    setCurrentPage(1);
  };

  // Handle view user
  const handleViewUser = (user) => {
    console.log('UsersPage: Opening user modal:', user);
    setSelectedUser(user);
    setShowUserModal(true);
  };

  // Handle edit user
  const handleEditUser = (user) => {
    navigate(`/users/edit/${user._id}`, {
      state: { 
        user: user,
        returnTo: '/users'
      }
    });
  };

  // Handle delete user
  const handleDeleteUser = async (user) => {
    if (window.confirm(`Are you sure you want to delete user "${user.firstName} ${user.lastName}"?`)) {
      try {
        console.log('Deleting user:', user._id);
        const result = await dispatch(deleteUser(user._id)).unwrap();
        console.log('Delete user result:', result);

        dispatch(addNotification({
          type: 'success',
          title: 'User Deleted',
          message: 'User has been deleted successfully',
          duration: 3000
        }));

        // Refresh users list
        dispatch(getAllUsers({
          page: currentPage,
          limit: itemsPerPage,
          search: searchTerm,
          role: filterRole !== 'all' ? filterRole : undefined,
          status: filterStatus !== 'all' ? filterStatus : undefined
        }));

        // Refresh all users for stats
        refreshAllUsers();

      } catch (error) {
        console.error('Delete user error:', error);
        // Safely extract error message to avoid circular structure issues
        let errorMessage = 'Failed to delete user';
        try {
          if (typeof error === 'string') {
            errorMessage = error;
          } else if (error?.message) {
            errorMessage = error.message;
          } else if (error?.toString) {
            errorMessage = error.toString();
          }
        } catch (e) {
          console.warn('Could not extract error message:', e);
        }
        
        dispatch(addNotification({
          type: 'error',
          title: 'Delete Failed',
          message: errorMessage,
          duration: 5000
        }));
      }
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage all users and their branch assignments
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="Total Users"
          value={totalUsers}
          icon={HiUserGroup}
          gradient="purple"
          animation="bounce"
          onClick={() => {
            setFilterRole('all');
            setFilterStatus('all');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
        <StatCard
          title="Active Users"
          value={activeUsers}
          icon={HiUserGroup}
          gradient="green"
          animation="pulse"
          onClick={() => {
            setFilterStatus('active');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
        <StatCard
          title="Admin Users"
          value={adminUsers}
          icon={HiUserGroup}
          gradient="blue"
          animation="float"
          onClick={() => {
            setFilterRole('admin');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
        <StatCard
          title="Sales Executives"
          value={salesExecutiveUsers}
          icon={HiUserGroup}
          gradient="orange"
          animation="bounce"
          onClick={() => {
            setFilterRole('sales_executive');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
          <div className="w-full sm:w-48">
            <Select
              value={filterRole}
              onChange={(e) => handleFilterChange('role', e.target.value)}
              options={availableRoles}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={filterBranch}
              onChange={(e) => handleFilterChange('branch', e.target.value)}
              options={availableBranches}
            />
          </div>

          <div className="w-full sm:w-48">
            <Select
              value={filterStatus}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              options={[
                { value: 'all', label: 'All Status' },
                { value: 'active', label: 'Active' },
                { value: 'inactive', label: 'Inactive' }
              ]}
            />
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Users ({filteredUsers.length})
            </h3>
            <div className="text-sm text-gray-500">
              {pagination && (
                `Showing ${((currentPage - 1) * itemsPerPage) + 1} to ${Math.min(currentPage * itemsPerPage, pagination.totalUsers || filteredUsers.length)} of ${pagination.totalUsers || filteredUsers.length} users`
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#22c55e]"></div>
              <span className="ml-2 text-gray-500">Loading users...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={HiUserGroup}
              title="No users found"
              description={searchTerm || filterRole !== 'all' || filterBranch !== 'all' || filterStatus !== 'all' 
                ? "No users match your current filters. Try adjusting your search criteria."
                : "No employees have been registered yet. Users are created when employees are added to the system."
              }
            />
          ) : (
            <Table
              data={filteredUsers}
              columns={columns}
              loading={loading}
              emptyMessage="No users found"
            />
          )}
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(pagination.totalPages, prev + 1))}
              disabled={currentPage === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      <UserDetailsModal
        isOpen={showUserModal}
        onClose={() => setShowUserModal(false)}
        user={selectedUser}
        onEdit={handleEditUser}
        onDelete={handleDeleteUser}
      />
    </div>
  );
};

export default UsersPage;