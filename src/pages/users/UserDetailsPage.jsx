import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiArrowLeft, 
  HiUser, 
  HiEnvelope, 
  HiPhone, 
  HiBuildingOffice2, 
  HiCalendar, 
  HiCheckCircle, 
  HiXCircle,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import { Button, StatusBadge } from '../../components/common';
import { getUserById } from '../../redux/actions/userActions';
import { addNotification } from '../../redux/slices/uiSlice';

const UserDetailsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useDispatch();
  
  const { userId } = params;
  const { users, loading, error, userLoading, userError, currentUser } = useSelector(state => state.user || {});
  
  const [user, setUser] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    personal: true,
    work: true,
    activity: false
  });

  useEffect(() => {
    if (userId) {
      console.log('UserDetailsPage: Looking for user with ID:', userId);
      console.log('UserDetailsPage: Available users:', users);
      
      // Always fetch user from API to ensure we have the latest data
      dispatch(getUserById(userId));
    }
  }, [userId, dispatch]);

  // Update user when it's loaded from API
  useEffect(() => {
    if (userId && users.length > 0) {
      const foundUser = users.find(u => u._id === userId);
      console.log('UserDetailsPage: Checking for user in users array:', {
        userId,
        usersCount: users.length,
        foundUser,
        allUsers: users.map(u => ({ id: u._id, name: `${u.firstName} ${u.lastName}` }))
      });
      if (foundUser) {
        console.log('UserDetailsPage: User loaded from API:', foundUser);
        setUser(foundUser);
      }
    }
  }, [userId, users]);

  // Also check if user is loaded after API call completes
  useEffect(() => {
    if (userId && !userLoading && !userError && users.length > 0) {
      const foundUser = users.find(u => u._id === userId);
      if (foundUser && !user) {
        console.log('UserDetailsPage: User found after API call completion:', foundUser);
        setUser(foundUser);
      }
    }
  }, [userId, userLoading, userError, users, user]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleEdit = () => {
    navigate(`/users/edit/${userId}`, {
      state: { 
        user: user,
        returnTo: '/users'
      }
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete user "${user?.firstName} ${user?.lastName}"?`)) {
      // Handle delete logic here
      dispatch(addNotification({
        type: 'success',
        message: 'User deleted successfully!'
      }));
      navigate('/users');
    }
  };

  const handleBack = () => {
    navigate('/users');
  };

  const getRoleColor = (role) => {
    const colors = {
      super_admin: 'bg-red-100 text-red-800',
      admin: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      employee: 'bg-green-100 text-green-800'
    };
    return colors[role] || 'bg-gray-100 text-gray-800';
  };

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      employee: 'Employee'
    };
    return labels[role] || role;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (userLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (userError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <HiXCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading User</h2>
          <p className="text-gray-600 mb-4">{userError}</p>
          <Button onClick={handleBack} variant="primary">
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <HiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">User Not Found</h2>
          <p className="text-gray-600 mb-4">The requested user could not be found.</p>
          <Button onClick={handleBack} variant="primary">
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Button
                  onClick={handleBack}
                  variant="secondary"
                  size="sm"
                  className="flex items-center mr-4"
                >
                  <HiArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">
                    {user.firstName} {user.lastName}
                  </h1>
                  <p className="text-gray-600">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <StatusBadge
                  status={user.isActive ? 'active' : 'inactive'}
                  className="text-sm"
                />
                <Button
                  onClick={handleEdit}
                  variant="primary"
                  size="sm"
                  className="flex items-center"
                >
                  <HiPencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="sm"
                  className="flex items-center"
                >
                  <HiTrash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-lg shadow-md">
              <div
                className="px-6 py-4 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('personal')}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <HiUser className="h-5 w-5 mr-2 text-indigo-500" />
                    Personal Information
                  </h2>
                  <div className="text-gray-400">
                    {expandedSections.personal ? '−' : '+'}
                  </div>
                </div>
              </div>
              {expandedSections.personal && (
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name
                      </label>
                      <p className="text-gray-900">{user.firstName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name
                      </label>
                      <p className="text-gray-900">{user.lastName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <HiEnvelope className="h-4 w-4 mr-2 text-gray-400" />
                        {user.email || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone
                      </label>
                      <p className="text-gray-900 flex items-center">
                        <HiPhone className="h-4 w-4 mr-2 text-gray-400" />
                        {user.phone || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Work Information */}
            <div className="bg-white rounded-lg shadow-md">
              <div
                className="px-6 py-4 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('work')}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <HiBuildingOffice2 className="h-5 w-5 mr-2 text-indigo-500" />
                    Work Information
                  </h2>
                  <div className="text-gray-400">
                    {expandedSections.work ? '−' : '+'}
                  </div>
                </div>
              </div>
              {expandedSections.work && (
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                        {getRoleLabel(user.role)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Branch
                      </label>
                      <p className="text-gray-900">
                        {user.branch?.branchName || user.branch || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <StatusBadge
                        status={user.isActive ? 'active' : 'inactive'}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Activity Information */}
            <div className="bg-white rounded-lg shadow-md">
              <div
                className="px-6 py-4 border-b border-gray-200 cursor-pointer"
                onClick={() => toggleSection('activity')}
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <HiCalendar className="h-5 w-5 mr-2 text-indigo-500" />
                    Activity Information
                  </h2>
                  <div className="text-gray-400">
                    {expandedSections.activity ? '−' : '+'}
                  </div>
                </div>
              </div>
              {expandedSections.activity && (
                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Created At
                      </label>
                      <p className="text-gray-900">{formatDate(user.createdAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Updated
                      </label>
                      <p className="text-gray-900">{formatDate(user.updatedAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Login
                      </label>
                      <p className="text-gray-900">{formatDate(user.lastLoginAt)}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Verified
                      </label>
                      <div className="flex items-center">
                        {user.emailVerified ? (
                          <HiCheckCircle className="h-4 w-4 text-green-500 mr-1" />
                        ) : (
                          <HiXCircle className="h-4 w-4 text-red-500 mr-1" />
                        )}
                        <span className={user.emailVerified ? 'text-green-700' : 'text-red-700'}>
                          {user.emailVerified ? 'Verified' : 'Not Verified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
              </div>
              <div className="px-6 py-4 space-y-3">
                <Button
                  onClick={handleEdit}
                  variant="primary"
                  size="sm"
                  className="w-full flex items-center justify-center"
                >
                  <HiPencil className="h-4 w-4 mr-2" />
                  Edit User
                </Button>
                <Button
                  onClick={handleDelete}
                  variant="danger"
                  size="sm"
                  className="w-full flex items-center justify-center"
                >
                  <HiTrash className="h-4 w-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </div>

            {/* User Summary */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">User Summary</h3>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <StatusBadge
                      status={user.isActive ? 'active' : 'inactive'}
                      className="text-xs"
                    />
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Role:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {getRoleLabel(user.role)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Branch:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {user.branch?.branchName || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email Verified:</span>
                    <span className="text-sm font-medium">
                      {user.emailVerified ? (
                        <span className="text-green-600">Yes</span>
                      ) : (
                        <span className="text-red-600">No</span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
