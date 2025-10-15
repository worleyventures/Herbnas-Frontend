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
import { Input, Select, Button, Loading, Modal, TextArea } from '../../components/common';
import SupervisorAttendanceCalendar from '../../components/attendance/SupervisorAttendanceCalendar';
import { getPendingApprovals, approveAttendance } from '../../redux/actions/attendanceActions';
import { addNotification } from '../../redux/slices/uiSlice';

const SupervisorAttendancePage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { attendance, loading, error } = useSelector(state => state.attendance);
  
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [approvalAction, setApprovalAction] = useState(''); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState(false);

  // Load pending approvals on component mount
  useEffect(() => {
    dispatch(getPendingApprovals());
  }, [dispatch]);

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
  const filteredAttendance = attendance?.filter(record => {
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
        const recordDate = new Date(record.date).toISOString().split('T')[0];
        return recordDate === selectedDate.dateKey;
      })
    : filteredAttendance;

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Attendance Approval</h1>
              <p className="mt-2 text-gray-600">
                Review and approve employee attendance for your branch
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm text-gray-500">Branch</div>
                <div className="font-medium text-gray-900">
                  {user?.branch?.branchName || 'Not Assigned'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <HiClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {attendance?.filter(a => a.approvalStatus === 'pending').length || 0}
                </div>
                <div className="text-sm text-gray-600">Pending Approval</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                <HiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {attendance?.filter(a => a.approvalStatus === 'approved').length || 0}
                </div>
                <div className="text-sm text-gray-600">Approved</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                <HiXMark className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {attendance?.filter(a => a.approvalStatus === 'rejected').length || 0}
                </div>
                <div className="text-sm text-gray-600">Rejected</div>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HiUsers className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">
                  {attendance?.length || 0}
                </div>
                <div className="text-sm text-gray-600">Total Records</div>
              </div>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <HiCalendar className="h-4 w-4 inline mr-2" />
              Calendar View
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              <HiUsers className="h-4 w-4 inline mr-2" />
              Table View
            </button>
          </div>
        </div>

        {/* Calendar or Table View */}
        {viewMode === 'calendar' ? (
          <SupervisorAttendanceCalendar
            attendance={attendance}
            onDateClick={handleDateClick}
            loading={loading}
          />
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
                {selectedDate && (
                  <div className="text-sm text-gray-600">
                    Showing attendance for {selectedDate.dateKey}
                  </div>
                )}
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
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {displayAttendance.map((record) => (
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {record.approvalStatus === 'pending' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleApprovalAction(record, 'approve')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <HiCheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleApprovalAction(record, 'reject')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <HiXMark className="h-5 w-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
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
    </div>
  );
};

export default SupervisorAttendancePage;
