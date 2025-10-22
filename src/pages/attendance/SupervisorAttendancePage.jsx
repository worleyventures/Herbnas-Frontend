import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  HiMagnifyingGlass, 
  HiEye, 
  HiCheckCircle, 
  HiXMark, 
  HiClock,
  HiUsers,
  HiCalendar,
  HiExclamationTriangle
} from 'react-icons/hi2';
import { Input, Select, Button, Loading, Modal, TextArea, StatCard } from '../../components/common';
import SupervisorAttendanceCalendar from '../../components/attendance/SupervisorAttendanceCalendar';
import { getPendingApprovals, approveAttendance } from '../../redux/actions/attendanceActions';
import { addNotification } from '../../redux/slices/uiSlice';
import { getProfile } from '../../redux/actions/authActions';
import api from '../../lib/axiosInstance';

const SupervisorAttendancePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { attendance, loading, error, pendingApprovals } = useSelector(state => state.attendance);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [approvalAction, setApprovalAction] = useState(''); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [branchDetails, setBranchDetails] = useState(null);
  const [loadingBranch, setLoadingBranch] = useState(false);

  // Fetch branch details by ID
  const fetchBranchDetails = async (branchId) => {
    if (!branchId || typeof branchId !== 'string') return;
    
    setLoadingBranch(true);
    try {
      const response = await api.get(`/attendance/branch/${branchId}`);
      setBranchDetails(response.data.data.branch);
    } catch (error) {
      console.error('Failed to fetch branch details:', error);
    } finally {
      setLoadingBranch(false);
    }
  };

  // Load all attendance records and refresh user profile on component mount
  useEffect(() => {
    dispatch(getPendingApprovals({ status: statusFilter }));
    // Refresh user profile to ensure we have latest branch data
    dispatch(getProfile());
  }, [dispatch, statusFilter]);

  // Fetch branch details when user data is available
  useEffect(() => {
    if (user?.branch && typeof user.branch === 'string') {
      fetchBranchDetails(user.branch);
    }
  }, [user?.branch]);

  // Handle date click from calendar
  const handleDateClick = (dayData) => {
    setSelectedDate(dayData);
    setViewMode('table');
  };

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Handle filter change
  const handleFilterChange = (type, value) => {
    if (type === 'status') {
      setStatusFilter(value);
      // Reload data with new status filter
      dispatch(getPendingApprovals({ status: value }));
    }
  };

  // Handle approval action
  const handleApprovalAction = (attendance, action) => {
    setSelectedAttendance(attendance);
    setApprovalAction(action);
    setRejectionReason('');
    setShowApprovalModal(true);
  };

  // Confirm approval/rejection
  const confirmApproval = async () => {
    if (!selectedAttendance) return;

    setApproving(true);
    try {
      const result = await dispatch(approveAttendance({
        attendanceId: selectedAttendance._id,
        action: approvalAction,
        rejectionReason: approvalAction === 'reject' ? rejectionReason : undefined
      })).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: `Attendance ${approvalAction}d successfully`
        }));
        
        // Refresh the data
        dispatch(getPendingApprovals());
        
        setShowApprovalModal(false);
        setSelectedAttendance(null);
        setApprovalAction('');
        setRejectionReason('');
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || `Failed to ${approvalAction} attendance`
      }));
    } finally {
      setApproving(false);
    }
  };

  // Filter attendance data
  const filteredAttendance = pendingApprovals?.filter(record => {
    const matchesSearch = !searchTerm || 
      record.employeeId?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.employeeId?.employeeId?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || record.approvalStatus === statusFilter;
    
    return matchesSearch && matchesStatus;
  }) || [];

  // Filter by selected date if in table view
  const displayAttendance = viewMode === 'table' && selectedDate 
    ? filteredAttendance.filter(record => {
        // Use local date for consistent filtering
        const recordDate = new Date(record.date);
        const year = recordDate.getFullYear();
        const month = String(recordDate.getMonth() + 1).padStart(2, '0');
        const day = String(recordDate.getDate()).padStart(2, '0');
        const recordDateKey = `${year}-${month}-${day}`;
        return recordDateKey === selectedDate.dateKey;
      })
    : filteredAttendance;

  // Debug logging
  console.log('🔍 Table display debug:', {
    viewMode,
    selectedDate,
    filteredAttendanceCount: filteredAttendance.length,
    displayAttendanceCount: displayAttendance.length,
    pendingApprovalsCount: pendingApprovals?.length || 0
  });

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
  ];

  // Format time
  const formatTime = (time) => {
    if (!time) return 'N/A';
    return new Date(time).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance Approval</h1>
          <p className="mt-1 text-sm text-gray-500">
            Review and approve employee attendance for your branch
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Branch</div>
            <div className="font-medium text-gray-900">
              {loadingBranch ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                branchDetails?.name || user?.branch?.branchName || user?.branch || 'Not Assigned'
              )}
            </div>
            {!branchDetails?.name && !user?.branch?.branchName && user?.branch && (
              <div className="text-xs text-yellow-600 mt-1">
                Branch ID: {user.branch}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Pending Approval"
          value={pendingApprovals?.filter(a => a.approvalStatus === 'pending').length || 0}
          icon={HiClock}
          gradient="yellow"
          animation="bounce"
          change="+5%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Approved"
          value={pendingApprovals?.filter(a => a.approvalStatus === 'approved').length || 0}
          icon={HiCheckCircle}
          gradient="green"
          animation="pulse"
          change="+2%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Rejected"
          value={pendingApprovals?.filter(a => a.approvalStatus === 'rejected').length || 0}
          icon={HiXMark}
          gradient="red"
          animation="float"
          change="+1%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Total Records"
          value={pendingApprovals?.length || 0}
          icon={HiUsers}
          gradient="blue"
          animation="bounce"
          change="+8%"
          changeType="increase"
          loading={loading}
        />
      </div>


        {/* Calendar or Table View */}
        {viewMode === 'calendar' ? (
          <SupervisorAttendanceCalendar
            attendance={pendingApprovals || []}
            onDateClick={handleDateClick}
            loading={loading}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Back to Calendar Button and Date Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <button
                    onClick={() => setViewMode('calendar')}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <HiCalendar className="h-4 w-4 mr-2" />
                    Back to Calendar
                  </button>
                </div>
                {selectedDate && (
                  <div className="text-sm text-gray-600">
                    Showing attendance for {selectedDate.dateKey}
                  </div>
                )}
              </div>
            </div>
            
            {/* Filters */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Input
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search employees..."
                    icon={HiMagnifyingGlass}
                    className="w-full sm:w-64"
                  />
                  <Select
                    value={statusFilter}
                    onChange={(value) => handleFilterChange('status', value)}
                    options={statusOptions}
                    className="w-full sm:w-40"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Employee
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check In
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check Out
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Approved At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayAttendance.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                        <div className="flex flex-col items-center">
                          <HiExclamationTriangle className="h-12 w-12 text-gray-400 mb-4" />
                          <p className="text-lg font-medium">No attendance records found</p>
                          <p className="text-sm">
                            {selectedDate 
                              ? `No records for ${selectedDate.dateKey}` 
                              : 'No pending approvals available'
                            }
                          </p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    displayAttendance.map((record) => (
                    <tr key={record._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {record.employeeId?.firstName} {record.employeeId?.lastName}
                          </div>
                          <div className="text-sm text-gray-500">
                            {record.employeeId?.employeeId}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(record.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.checkIn?.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatTime(record.checkOut?.time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(record.approvalStatus)}`}>
                          {record.approvalStatus}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.approvedBy ? (
                          <div>
                            <div className="font-medium">{record.approvedBy.firstName} {record.approvedBy.lastName}</div>
                            <div className="text-gray-500">{record.approvedBy.email}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.approvedAt ? (
                          <div>
                            <div>{new Date(record.approvedAt).toLocaleDateString()}</div>
                            <div className="text-gray-500">{formatTime(record.approvedAt)}</div>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {record.approvalStatus === 'pending' ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprovalAction(record, 'approve')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                            >
                              <HiCheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </button>
                            <button
                              onClick={() => handleApprovalAction(record, 'reject')}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              <HiXMark className="h-4 w-4 mr-1" />
                              Reject
                            </button>
                          </div>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            record.approvalStatus === 'approved' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.approvalStatus}
                          </span>
                        )}
                      </td>
                    </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Approval Modal */}
        <Modal
          isOpen={showApprovalModal}
          onClose={() => setShowApprovalModal(false)}
          title={`${approvalAction === 'approve' ? 'Approve' : 'Reject'} Attendance`}
        >
          <div className="p-6">
            {selectedAttendance && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Attendance Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Employee:</span>
                      <div className="font-medium">
                        {selectedAttendance.employeeId?.firstName} {selectedAttendance.employeeId?.lastName}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Date:</span>
                      <div className="font-medium">
                        {new Date(selectedAttendance.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Check In:</span>
                      <div className="font-medium">
                        {formatTime(selectedAttendance.checkIn?.time)}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-500">Check Out:</span>
                      <div className="font-medium">
                        {formatTime(selectedAttendance.checkOut?.time)}
                      </div>
                    </div>
                  </div>
                </div>

                {approvalAction === 'reject' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rejection Reason *
                    </label>
                    <TextArea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Please provide a reason for rejection..."
                      rows={3}
                      className="w-full"
                    />
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4">
                  <Button
                    onClick={() => setShowApprovalModal(false)}
                    variant="outline"
                    disabled={approving}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={confirmApproval}
                    disabled={approving || (approvalAction === 'reject' && !rejectionReason.trim())}
                    className={`${
                      approvalAction === 'approve' 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-red-600 hover:bg-red-700'
                    }`}
                  >
                    {approving ? 'Processing...' : `${approvalAction === 'approve' ? 'Approve' : 'Reject'}`}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </Modal>
    </div>
  );
};

export default SupervisorAttendancePage;
