import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { HiUserGroup, HiPlus, HiMagnifyingGlass, HiEye, HiPencil, HiTrash } from 'react-icons/hi2';
import { StatCard, Table, Button, ActionButton, Input, Select, Loading, EmptyState, UserDetailsModal } from '../../components/common';
import { getAllUsers, deleteUser } from '../../redux/actions/userActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { addNotification } from '../../redux/slices/uiSlice';

const UsersPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux state
  const userState = useSelector((state) => state.user);
  const branchState = useSelector((state) => state.branches);

  const users = userState?.users || [];
  const allUsers = userState?.allUsers || [];
  const loading = userState?.loading || false;
  const error = userState?.error || null;
  const branches = branchState?.branches || [];

  // Debug logging
  console.log('User state:', userState);
  console.log('Branch state:', branchState);
  console.log('Users array:', users);
  console.log('All users array:', allUsers);
  console.log('Branches array:', branches);

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

  // Calculate stats from all users (not filtered)
  const totalUsers = allUsers.length;
  const adminUsers = allUsers.filter(user => user.role === 'admin').length;
  const supervisorUsers = allUsers.filter(user => user.role === 'supervisor').length;
  const salesExecutiveUsers = allUsers.filter(user => user.role === 'sales_executive').length;
  
  // Debug stats
  console.log('Stats calculation:', {
    totalUsers,
    adminUsers,
    supervisorUsers,
    salesExecutiveUsers,
    allUsersCount: allUsers.length
  });

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

  // Handle add user
  const handleAddUser = () => {
    navigate('/users/create');
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
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={handleAddUser}
            variant="gradient"
            icon={HiPlus}
          >
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          title="All Users"
          value={totalUsers}
          icon={HiUserGroup}
          iconBg="bg-gradient-to-r from-purple-500 to-purple-600"
          onClick={() => {
            setFilterRole('all');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
        <StatCard
          title="Admin Users"
          value={adminUsers}
          icon={HiUserGroup}
          iconBg="bg-gradient-to-r from-blue-500 to-blue-600"
          onClick={() => {
            setFilterRole('admin');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
        <StatCard
          title="Supervisors"
          value={supervisorUsers}
          icon={HiUserGroup}
          iconBg="bg-gradient-to-r from-yellow-500 to-yellow-600"
          onClick={() => {
            setFilterRole('supervisor');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
        <StatCard
          title="Sales Executives"
          value={salesExecutiveUsers}
          icon={HiUserGroup}
          iconBg="bg-gradient-to-r from-orange-500 to-orange-600"
          onClick={() => {
            setFilterRole('sales_executive');
            setCurrentPage(1);
          }}
          className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Users
            </label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
              <HiMagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <Select
              value={filterRole}
              onChange={(value) => handleFilterChange('role', value)}
              options={availableRoles}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={filterStatus}
              onChange={(value) => handleFilterChange('status', value)}
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
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
          </div>

          {loading ? (
            <Loading />
          ) : filteredUsers.length === 0 ? (
            <EmptyState
              icon={HiUserGroup}
              title="No users found"
              description="No users match your current filters"
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