import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiXMark, HiUserGroup, HiPlus, HiTrash, HiEye, HiEyeSlash, HiUser, HiCommandLine } from 'react-icons/hi2';
import { Modal, Button, Input, Select, SearchInput } from './index';
import { addNotification } from '../../redux/slices/uiSlice';
import { getAllUsers } from '../../redux/actions/userActions';

const AddMembersModal = ({ isOpen, onClose, branch, onAddMembers }) => {
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [userSearch, setUserSearch] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [addingUser, setAddingUser] = useState(false);
  const [userType, setUserType] = useState('existing'); // 'existing' or 'new'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newUserData, setNewUserData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const dispatch = useDispatch();
  
  // Get users from Redux store
  const usersState = useSelector((state) => state.user);
  const users = usersState?.users || [];
  const usersLoading = usersState?.loading || false;
  
  // Debug logging
  console.log('Users state:', usersState);
  console.log('Users array:', users);
  console.log('Users loading:', usersLoading);

  // Available roles
  const availableRoles = [
    { value: 'sales_executive', label: 'Sales Executive' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'production_manager', label: 'Production Manager' },
    { value: 'accounts_manager', label: 'Accounts Manager' },
    { value: 'admin', label: 'Admin' }
  ];

  // Filter users based on search and exclude already selected users
  const filteredUsers = users.filter(user => {
    const searchMatch = user.firstName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                       user.lastName?.toLowerCase().includes(userSearch.toLowerCase()) ||
                       user.email?.toLowerCase().includes(userSearch.toLowerCase());
    
    const notSelected = !selectedUsers.some(selected => selected.user._id === user._id);
    
    return searchMatch && notSelected;
  });

  // Handle user selection
  const handleUserSelect = (user) => {
    const newMember = {
      user: user,
      role: 'sales_executive', // Default role
      assignedAt: new Date(),
      assignedBy: null, // Will be set by backend
      userType: 'existing'
    };
    
    setSelectedUsers([...selectedUsers, newMember]);
    setUserSearch('');
    setShowUserDropdown(false);
    
    // Show success toast
    dispatch(addNotification({
      type: 'success',
      title: 'Success',
      message: 'User added to selection',
      duration: 2000
    }));
  };

  // Handle new user creation
  const handleAddNewUser = async () => {
    // Validate new user data
    if (!newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Please fill in all required fields',
        duration: 3000
      }));
      return;
    }

    if (newUserData.password !== newUserData.confirmPassword) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Passwords do not match',
        duration: 3000
      }));
      return;
    }

    if (newUserData.password.length < 6) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Password must be at least 6 characters',
        duration: 3000
      }));
      return;
    }

    setAddingUser(true);
    
    try {
      // Simulate a brief delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create new user object
      const newUser = {
        firstName: newUserData.firstName,
        lastName: newUserData.lastName,
        email: newUserData.email,
        phone: newUserData.phone || '',
        password: newUserData.password,
        isNewUser: true
      };

      const newMember = {
        user: newUser,
        role: 'sales_executive', // Default role
        assignedAt: new Date(),
        assignedBy: null, // Will be set by backend
        userType: 'new'
      };
      
      setSelectedUsers([...selectedUsers, newMember]);
      
      // Show success toast
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: 'New user added to selection',
        duration: 3000
      }));
      
      // Reset form
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add new user',
        duration: 3000
      }));
    } finally {
      setAddingUser(false);
    }
  };

  // Handle role change
  const handleRoleChange = (userIndex, newRole) => {
    const updatedUsers = [...selectedUsers];
    updatedUsers[userIndex].role = newRole;
    setSelectedUsers(updatedUsers);
  };

  // Handle remove user
  const handleRemoveUser = (userIndex) => {
    const updatedUsers = selectedUsers.filter((_, index) => index !== userIndex);
    setSelectedUsers(updatedUsers);
    
    // Show info toast
    dispatch(addNotification({
      type: 'info',
      title: 'Removed',
      message: 'User removed from selection',
      duration: 2000
    }));
  };

  // Handle save
  const handleSave = async () => {
    if (selectedUsers.length === 0) {
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Please select at least one user to add',
        duration: 3000
      }));
      return;
    }

    setLoading(true);
    try {
      await onAddMembers(branch._id, selectedUsers);
      
      // Count new vs existing users
      const newUsersCount = selectedUsers.filter(member => member.userType === 'new').length;
      const existingUsersCount = selectedUsers.filter(member => member.userType === 'existing').length;
      
      let message = 'Members added successfully';
      if (newUsersCount > 0 && existingUsersCount > 0) {
        message = `${newUsersCount} new user(s) created and ${existingUsersCount} existing user(s) added`;
      } else if (newUsersCount > 0) {
        message = `${newUsersCount} new user(s) created and added`;
      } else if (existingUsersCount > 0) {
        message = `${existingUsersCount} existing user(s) added`;
      }
      
      dispatch(addNotification({
        type: 'success',
        title: 'Success',
        message: message,
        duration: 4000
      }));
      
      onClose();
      setSelectedUsers([]);
      
      // Reset form state
      setUserType('existing');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Error adding members:', error);
      dispatch(addNotification({
        type: 'error',
        title: 'Error',
        message: 'Failed to add members',
        duration: 3000
      }));
    } finally {
      setLoading(false);
    }
  };

  // Load users when modal opens
  useEffect(() => {
    if (isOpen && userType === 'existing') {
      dispatch(getAllUsers({ 
        page: 1, 
        limit: 100, // Load more users for selection
        status: 'active' // Only load active users
      }));
    }
  }, [isOpen, userType, dispatch]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedUsers([]);
      setUserSearch('');
      setShowUserDropdown(false);
      setUserType('existing');
      setShowPassword(false);
      setShowConfirmPassword(false);
      setNewUserData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
      });
    }
  }, [isOpen]);

  if (!branch) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <HiUserGroup className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add Members</h2>
              <p className="text-sm text-gray-500">{branch.branchName}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <HiXMark className="h-6 w-6" />
          </button>
        </div>

        {/* User Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Add Members
          </label>
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => setUserType('existing')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                userType === 'existing'
                  ? 'border-transparent bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-lg'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-transparent hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white'
              }`}
            >
              <HiUserGroup className="h-5 w-5 mr-2" />
              Existing Users
            </button>
            <button
              type="button"
              onClick={() => setUserType('new')}
              className={`flex-1 flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                userType === 'new'
                  ? 'border-transparent bg-gradient-to-r from-[#22c55e] to-[#16a34a] text-white shadow-lg'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-transparent hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34e] hover:text-white'
              }`}
            >
              <HiUser className="h-5 w-5 mr-2" />
              New Users
            </button>
          </div>
        </div>

         {/* User Search - Existing Users */}
         {userType === 'existing' && (
           <div className="mb-6">
             <label className="block text-sm font-medium text-gray-700 mb-2">
               Search Existing Users
             </label>
           <SearchInput
             placeholder="Search by name or email..."
             value={userSearch}
             onChange={(e) => {
               setUserSearch(e.target.value);
               setShowUserDropdown(true);
             }}
             onFocus={() => setShowUserDropdown(true)}
           />
             
             {/* User Dropdown */}
             {showUserDropdown && userSearch && (
               <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-auto">
                 {usersLoading ? (
                   <div className="px-4 py-6 text-center">
                     <div className="flex items-center justify-center space-x-2">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                       <p className="text-sm text-gray-500">Loading users...</p>
                     </div>
                   </div>
                 ) : filteredUsers.length > 0 ? (
                   filteredUsers.map((user) => (
                     <div
                       key={user._id}
                       className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                       onClick={() => handleUserSelect(user)}
                     >
                       <div className="flex items-center space-x-3">
                         <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                           <span className="text-sm font-semibold text-gray-600">
                             {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                           </span>
                         </div>
                         <div className="flex-1 min-w-0">
                           <p className="text-sm font-medium text-gray-900 truncate">
                             {user.firstName} {user.lastName}
                           </p>
                           <p className="text-xs text-gray-500 truncate">{user.email}</p>
                           {user.role && (
                             <div className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                               {user.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                             </div>
                           )}
                         </div>
                       </div>
                     </div>
                   ))
                 ) : (
                   <div className="px-4 py-6 text-center">
                     <p className="text-sm text-gray-500">
                       {users.length === 0 ? 'No users available' : 'No users found matching your search'}
                     </p>
                   </div>
                 )}
               </div>
             )}
           </div>
         </div>
         )}

        {/* New User Form */}
        {userType === 'new' && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              Create New User
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  First Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter first name"
                  value={newUserData.firstName}
                  onChange={(e) => setNewUserData({...newUserData, firstName: e.target.value})}
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Last Name *
                </label>
                <Input
                  type="text"
                  placeholder="Enter last name"
                  value={newUserData.lastName}
                  onChange={(e) => setNewUserData({...newUserData, lastName: e.target.value})}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Email *
                </label>
                <Input
                  type="email"
                  placeholder="Enter email address"
                  value={newUserData.email}
                  onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Phone
                </label>
                <Input
                  type="tel"
                  placeholder="Enter phone number"
                  value={newUserData.phone}
                  onChange={(e) => setNewUserData({...newUserData, phone: e.target.value})}
                />
              </div>

               {/* Password */}
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">
                   Password *
                 </label>
                 <div className="relative">
                   <Input
                     type={showPassword ? "text" : "password"}
                     placeholder="Create password (min 6 characters)"
                     value={newUserData.password}
                     onChange={(e) => setNewUserData({...newUserData, password: e.target.value})}
                     inputClassName="!pr-10 !pl-3 !h-10"
                   />
                   <button
                     type="button"
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1"
                     onClick={() => setShowPassword(!showPassword)}
                     title={showPassword ? "Hide password" : "Show password"}
                   >
                     {showPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                   </button>
                 </div>
                 {newUserData.password && (
                   <div className="mt-1 text-xs text-gray-500">
                     {newUserData.password.length < 6 ? (
                       <span className="text-red-500">Password too short (min 6 characters)</span>
                     ) : (
                       <span className="text-[#22c55e]-500">✓ Password is valid</span>
                     )}
                   </div>
                 )}
               </div>

               {/* Confirm Password */}
               <div>
                 <label className="block text-xs font-medium text-gray-600 mb-1">
                   Confirm Password *
                 </label>
                 <div className="relative">
                   <Input
                     type={showConfirmPassword ? "text" : "password"}
                     placeholder="Confirm password"
                     value={newUserData.confirmPassword}
                     onChange={(e) => setNewUserData({...newUserData, confirmPassword: e.target.value})}
                     inputClassName="!pr-10 !pl-3 !h-10"
                   />
                   <button
                     type="button"
                     className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors z-10 p-1"
                     onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                     title={showConfirmPassword ? "Hide password" : "Show password"}
                   >
                     {showConfirmPassword ? <HiEyeSlash className="h-4 w-4" /> : <HiEye className="h-4 w-4" />}
                   </button>
                 </div>
                 {newUserData.confirmPassword && (
                   <div className="mt-1 text-xs text-gray-500">
                     {newUserData.password !== newUserData.confirmPassword ? (
                       <span className="text-red-500">Passwords do not match</span>
                     ) : (
                       <span className="text-[#22c55e]-500">✓ Passwords match</span>
                     )}
                   </div>
                 )}
               </div>
            </div>

            {/* Add New User Button */}
            <div className="mt-4">
              <Button
                onClick={handleAddNewUser}
                loading={addingUser}
                disabled={addingUser || !newUserData.firstName || !newUserData.lastName || !newUserData.email || !newUserData.password || !newUserData.confirmPassword}
                size="xs"
                variant="gradient"
                className="w-full"
                icon={HiPlus}
              >
                {addingUser ? 'Adding User...' : 'Add New User'}
              </Button>
            </div>
          </div>
        )}

        {/* Selected Users */}
        {selectedUsers.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Selected Users</h3>
            <div className="space-y-3">
              {selectedUsers.map((member, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-sm font-semibold text-gray-600">
                        {member.user.firstName?.charAt(0)}{member.user.lastName?.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="text-sm font-medium text-gray-900">
                          {member.user.firstName} {member.user.lastName}
                        </p>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          member.userType === 'new' 
                            ? 'bg-[#22c55e]-100 text-[#22c55e]-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {member.userType === 'new' ? 'New' : 'Existing'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Select
                      value={member.role}
                      onChange={(e) => handleRoleChange(index, e.target.value)}
                      options={availableRoles}
                      className="w-40"
                    />
                    <button
                      onClick={() => handleRemoveUser(index)}
                      className="text-red-400 hover:text-red-600 transition-colors"
                    >
                      <HiTrash className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            size="xs"
            className="hover:bg-gradient-to-r hover:from-[#22c55e] hover:to-[#16a34a] hover:text-white hover:border-transparent"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            loading={loading}
            disabled={selectedUsers.length === 0}
            variant="gradient"
            icon={HiPlus}
            size="xs"
          >
            Add {selectedUsers.length} Member{selectedUsers.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddMembersModal;
