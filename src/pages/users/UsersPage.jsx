import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiUserGroup, HiPlus, HiMagnifyingGlass, HiXMark, HiEye, HiPencil, HiTrash, HiEyeSlash } from 'react-icons/hi2';
import { StatCard, Table, Button, ActionButton, Input, Select, Modal, Loading, EmptyState } from '../../components/common';
import { PageHeader } from '../../components/layout';
import { getAllUsers, updateUser, deleteUser, createUser } from '../../redux/actions/userActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { addNotification } from '../../redux/slices/uiSlice';

const UsersPage = () => {
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
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToEdit, setUserToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    isActive: true,
    branch: ''
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [addFormData, setAddFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: '',
    isActive: true,
    branch: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);


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

  // Available roles for editing/adding (without "All Roles")
  const addRoles = [
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

  // Available branches for editing (without "All Branches" option)
  const editBranches = [
    { value: '', label: 'No Branch Assigned' },
    ...branches.map(branch => ({
      value: branch._id,
      label: branch.branchName
    }))
  ];

  // Available branches for adding (only actual branches)
  const addBranches = [
    ...branches.map(branch => ({
      value: branch._id,
      label: branch.branchName
    }))
  ];

  // Debug logging for branches
  console.log('Available branches for add form:', addBranches);
  console.log('Current addFormData.branch:', addFormData.branch);

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
            onClick={() => {
              setSelectedUser(user);
              setShowUserModal(true);
            }}
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
            onClick={() => {
              setUserToDelete(user);
              setShowDeleteModal(true);
            }}
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

  // Handle edit user
  const handleEditUser = (user) => {
    setUserToEdit(user);
    setEditFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      role: user.role || '',
      isActive: user.isActive !== undefined ? user.isActive : true,
      branch: user.branch?._id || ''
    });
    setShowEditModal(true);
  };

  // Handle form input changes
  const handleEditFormChange = (field, value) => {
    setEditFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle edit form submission
  const handleEditSubmit = async (e) => {
    e.preventDefault();

    try {
      const updateData = {
        firstName: editFormData.firstName,
        lastName: editFormData.lastName,
        email: editFormData.email,
        phone: editFormData.phone,
        role: editFormData.role,
        isActive: editFormData.isActive
      };

      // Only include branch if it's selected
      if (editFormData.branch) {
        updateData.branch = editFormData.branch;
      }

      console.log('Updating user with data:', updateData);
      const result = await dispatch(updateUser({
        userId: userToEdit._id,
        userData: updateData
      })).unwrap();
      console.log('Update user result:', result);

      dispatch(addNotification({
        type: 'success',
        title: 'User Updated',
        message: 'User has been updated successfully',
        duration: 3000
      }));

      // Close modal first
      setShowEditModal(false);
      setUserToEdit(null);

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
      console.error('Update user error:', error);
      // Safely extract error message to avoid circular structure issues
      let errorMessage = 'Failed to update user';
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
        title: 'Update Failed',
        message: errorMessage,
        duration: 5000
      }));
    }
  };

  // Handle delete user
  const handleDeleteUser = async () => {
    try {
      console.log('Deleting user:', userToDelete._id);
      const result = await dispatch(deleteUser(userToDelete._id)).unwrap();
      console.log('Delete user result:', result);

      dispatch(addNotification({
        type: 'success',
        title: 'User Deleted',
        message: 'User has been deleted successfully',
        duration: 3000
      }));

      // Close modal first
      setShowDeleteModal(false);
      setUserToDelete(null);

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
  };

  // Handle add user
  const handleAddUser = () => {
    setAddFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      role: '',
      isActive: true,
      branch: ''
    });
    setShowAddModal(true);
  };

  // Handle add form input changes
  const handleAddFormChange = (field, value) => {
    console.log('Add form change:', { field, value, type: typeof value });
    setAddFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle add form submission
  const handleAddSubmit = async (e) => {
    e.preventDefault();

    // Validate passwords match
    if (addFormData.password !== addFormData.confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Passwords do not match',
        duration: 5000
      }));
      return;
    }

    // Validate password length
    if (addFormData.password.length < 6) {
      dispatch(addNotification({
        type: 'error',
        title: 'Validation Error',
        message: 'Password must be at least 6 characters long',
        duration: 5000
      }));
      return;
    }

    try {
      const userData = {
        firstName: addFormData.firstName,
        lastName: addFormData.lastName,
        email: addFormData.email,
        phone: addFormData.phone,
        password: addFormData.password,
        role: addFormData.role,
        isActive: addFormData.isActive
      };

      // Only include branch if it's selected
      if (addFormData.branch) {
        userData.branch = addFormData.branch;
      }

      console.log('Creating user with data:', userData);
      console.log('Current addFormData:', addFormData);
      console.log('Selected branch ID:', addFormData.branch);
      const result = await dispatch(createUser(userData)).unwrap();
      console.log('Create user result:', result);

      dispatch(addNotification({
        type: 'success',
        title: 'User Created',
        message: 'User has been created successfully',
        duration: 3000
      }));

      // Close modal first
      setShowAddModal(false);
      setAddFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role: '',
        isActive: true,
        branch: ''
      });

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
      console.error('Create user error:', error);
      // Safely extract error message to avoid circular structure issues
      let errorMessage = 'Failed to create user';
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
        title: 'Create Failed',
        message: errorMessage,
        duration: 5000
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="User Management"
        subtitle="Manage all users and their branch assignments"
        icon={HiUserGroup}
        action={
          <Button
            onClick={handleAddUser}
            variant="gradient"
            icon={HiPlus}
          >
            Add User
          </Button>
        }
      />

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
      {selectedUser && (
        <Modal
          isOpen={showUserModal}
          onClose={() => {
            setShowUserModal(false);
            setSelectedUser(null);
          }}
          size="sm"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">
                    {selectedUser.firstName?.charAt(0)}{selectedUser.lastName?.charAt(0)}
                  </span>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedUser.firstName} {selectedUser.lastName}
                  </h2>
                  <p className="text-gray-500">{selectedUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Role</label>
                    <p className="text-sm text-gray-900">
                      {selectedUser.role?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedUser.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.isActive
                        ? 'bg-[#22c55e]-100 text-[#22c55e]-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {selectedUser.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Assignment</h3>
                {selectedUser.branch && typeof selectedUser.branch === 'object' ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Branch Name</label>
                      <p className="text-sm text-gray-900">{selectedUser.branch.branchName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Location</label>
                      <p className="text-sm text-gray-900">
                        {selectedUser.branch.city}, {selectedUser.branch.state}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Address</label>
                      <p className="text-sm text-gray-900">{selectedUser.branch.address}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Branch Status</label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedUser.branch.isActive
                          ? 'bg-[#22c55e]-100 text-[#22c55e]-800'
                          : 'bg-red-100 text-red-800'
                        }`}>
                        {selectedUser.branch.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <HiUserGroup className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500">No branch assigned</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setUserToDelete(null);
          }}
          size="sm"
        >
          <div className="p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 rounded-full">
              <HiTrash className="h-6 w-6 text-red-600" />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete User
              </h3>
              <p className="text-sm text-gray-500 mb-6">
                Are you sure you want to delete <strong>{userToDelete.firstName} {userToDelete.lastName}</strong>?
                This action cannot be undone.
              </p>
              <div className="flex items-center justify-center space-x-3">
                <Button
                  variant="ghost"
                  onClick={() => {
                    setShowDeleteModal(false);
                    setUserToDelete(null);
                  }}
                  className="px-4 py-2"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteUser}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete User
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit User Modal */}
      {userToEdit && (
        <Modal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setUserToEdit(null);
            setEditFormData({
              firstName: '',
              lastName: '',
              email: '',
              phone: '',
              role: '',
              isActive: true,
              branch: ''
            });
          }}
          size="sm"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setUserToEdit(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <HiXMark className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name *
                  </label>
                  <Input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => handleEditFormChange('firstName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <Input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => handleEditFormChange('lastName', e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email *
                  </label>
                  <Input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => handleEditFormChange('email', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone
                  </label>
                  <Input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => handleEditFormChange('phone', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role *
                  </label>
                  <Select
                    value={editFormData.role}
                    onChange={(e) => handleEditFormChange('role', e.target.value)}
                    options={addRoles}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Branch
                  </label>
                  <Select
                    value={editFormData.branch}
                    onChange={(e) => handleEditFormChange('branch', e.target.value)}
                    options={addBranches}
                    placeholder="Select a branch"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={editFormData.isActive}
                    onChange={(e) => handleEditFormChange('isActive', e.target.checked)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Active User</span>
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowEditModal(false);
                    setUserToEdit(null);
                  }}
                  className="hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="gradient"
                >
                  Update User
                </Button>
              </div>
            </form>
          </div>
        </Modal>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => {
          setShowAddModal(false);
          setAddFormData({
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            role: '',
            isActive: true,
            branch: ''
          });
          setShowPassword(false);
          setShowConfirmPassword(false);
        }}
        size="lg"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Add New User</h2>
            <button
              onClick={() => {
                setShowAddModal(false);
                setAddFormData({
                  firstName: '',
                  lastName: '',
                  email: '',
                  phone: '',
                  password: '',
                  confirmPassword: '',
                  role: '',
                  isActive: true,
                  branch: ''
                });
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
            </button>
          </div>

          <form onSubmit={handleAddSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={addFormData.firstName}
                  onChange={(e) => handleAddFormChange('firstName', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={addFormData.lastName}
                  onChange={(e) => handleAddFormChange('lastName', e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => handleAddFormChange('email', e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  value={addFormData.phone}
                  onChange={(e) => handleAddFormChange('phone', e.target.value)}
                />
              </div>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {/* Password */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Password *
                 </label>
                 <div className="relative">
                   <input
                     type={showPassword ? 'text' : 'password'}
                     value={addFormData.password}
                     onChange={(e) => handleAddFormChange('password', e.target.value)}
                     className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                     required
                   />
                   <button
                     type="button"
                     onClick={() => setShowPassword(!showPassword)}
                     className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                   >
                     {showPassword ? (
                       <HiEyeSlash className="h-4 w-4" />
                     ) : (
                       <HiEye className="h-4 w-4" />
                     )}
                   </button>
                 </div>
               </div>

               {/* Confirm Password */}
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">
                   Confirm Password *
                 </label>
                 <div className="relative">
                   <input
                     type={showConfirmPassword ? 'text' : 'password'}
                     value={addFormData.confirmPassword}
                     onChange={(e) => handleAddFormChange('confirmPassword', e.target.value)}
                     className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none transition-colors"
                     required
                   />
                   <button
                     type="button"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                   >
                     {showConfirmPassword ? (
                       <HiEyeSlash className="h-4 w-4" />
                     ) : (
                       <HiEye className="h-4 w-4" />
                     )}
                   </button>
                 </div>
               </div>
             </div>


            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role *
                </label>
                <Select
                  value={addFormData.role}
                  onChange={(e) => handleAddFormChange('role', e.target.value)}
                  options={addRoles}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Branch
                </label>
                <Select
                  value={addFormData.branch}
                  onChange={(e) => {
                    console.log('Branch select onChange:', e.target.value);
                    handleAddFormChange('branch', e.target.value);
                  }}
                  options={addBranches}
                  placeholder="Select a branch"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={addFormData.isActive}
                  onChange={(e) => handleAddFormChange('isActive', e.target.checked)}
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Active User</span>
              </label>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddModal(false);
                  setAddFormData({
                    firstName: '',
                    lastName: '',
                    email: '',
                    phone: '',
                    password: '',
                    confirmPassword: '',
                    role: '',
                    isActive: true,
                    branch: ''
                  });
                  setShowPassword(false);
                  setShowConfirmPassword(false);
                }}
                className="hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="gradient"
              >
                Create User
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default UsersPage;
