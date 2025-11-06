import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiMagnifyingGlass,
  HiTrash,
  HiClock,
  HiUser,
  HiBuildingOffice,
  HiCalendar,
  HiCheckCircle,
  HiXMark,
  HiEye
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal, DetailsView, TextArea } from '../../components/common';
import AttendanceCalendar from '../../components/attendance/AttendanceCalendar';
import { addNotification } from '../../redux/slices/uiSlice';
import { 
  selectAttendance,
  selectAttendanceLoading,
  selectAttendanceStats,
  selectAttendancePagination
} from '../../redux/slices/attendanceSlice';
import { 
  getAllAttendance, 
  deleteAttendance, 
  getAttendanceStats,
  approveAttendance
} from '../../redux/actions/attendanceActions';
import api from '../../lib/axiosInstance';

const AttendanceTab = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const attendance = useSelector(selectAttendance);
  const loading = useSelector(selectAttendanceLoading);
  const stats = useSelector(selectAttendanceStats);
  const pagination = useSelector(selectAttendancePagination);
  
  // Local state
  const [selectedDate, setSelectedDate] = useState(null);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [approvalStatusFilter, setApprovalStatusFilter] = useState('all'); // Filter by approval status
  const [monthFilter, setMonthFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [attendanceToView, setAttendanceToView] = useState(null);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedAttendanceForApproval, setSelectedAttendanceForApproval] = useState(null);
  const [approvalAction, setApprovalAction] = useState(''); // 'approve' or 'reject'
  const [rejectionReason, setRejectionReason] = useState('');
  const [approving, setApproving] = useState(false);
  const [branches, setBranches] = useState([]);

  // Load branches and employees data
  const loadBranches = async () => {
    try {
      const response = await api.get('/branches');
      if (response.data.success) {
        setBranches(response.data.data.branches || []);
      }
    } catch (error) {
      console.error('Failed to load branches:', error);
    }
  };

  // Load attendance data
  const loadAttendance = async () => {
    const params = {
      page: currentPage.toString(),
      limit: '10',
      ...(searchTerm && { search: searchTerm }),
      ...(branchFilter !== 'all' && { branchId: branchFilter }),
      ...(statusFilter !== 'all' && { status: statusFilter }),
      ...(monthFilter !== 'all' && { month: monthFilter }),
      ...(approvalStatusFilter !== 'all' && { approvalStatus: approvalStatusFilter })
    };

    dispatch(getAllAttendance(params));
  };

  // Load attendance stats
  const loadStats = async () => {
    const params = {
      ...(branchFilter !== 'all' && { branchId: branchFilter }),
      ...(approvalStatusFilter !== 'all' && { approvalStatus: approvalStatusFilter })
    };

    dispatch(getAttendanceStats(params));
  };

  // Load data on component mount
  useEffect(() => {
    loadAttendance();
    loadStats();
    loadBranches();
  }, [currentPage, searchTerm, branchFilter, statusFilter, approvalStatusFilter, monthFilter]);


  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes
  // Handle filter changes - support both event object and direct value
  const handleFilterChange = (filterType, eventOrValue) => {
    // Extract value from event object or use direct value
    const value = eventOrValue?.target?.value !== undefined ? eventOrValue.target.value : eventOrValue;
    
    switch (filterType) {
      case 'branch':
        setBranchFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'approvalStatus':
        setApprovalStatusFilter(value);
        break;
      case 'month':
        setMonthFilter(value);
        break;
      default:
        break;
    }
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle date click from calendar
  const handleDateClick = (dayData) => {
    setSelectedDate(dayData);
    setViewMode('table');
    // Filter attendance for the selected date using consistent date format
    const selectedDateAttendance = attendance.filter(record => {
      const date = new Date(record.date);
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const recordDateKey = `${year}-${month}-${day}`;
      return recordDateKey === dayData.dateKey;
    });
    // You could dispatch an action to filter the attendance data here
  };


  // Handle view attendance
  const handleViewAttendance = (attendanceId) => {
    const attendanceRecord = attendance.find(a => a._id === attendanceId);
    if (attendanceRecord) {
      console.log('Attendance record for view:', attendanceRecord);
      console.log('Summary data:', attendanceRecord.summaryData);
      setAttendanceToView(attendanceRecord);
      setShowViewModal(true);
    }
  };

  // Handle delete
  const handleDeleteAttendance = (attendanceId) => {
    const attendanceRecord = attendance.find(a => a._id === attendanceId);
    setAttendanceToDelete(attendanceRecord);
    setShowDeleteModal(true);
  };

  const confirmDeleteAttendance = async () => {
    if (attendanceToDelete) {
      try {
        const result = await dispatch(deleteAttendance(attendanceToDelete._id));
        
        if (result.type.endsWith('/fulfilled')) {
          dispatch(addNotification({
            type: 'success',
            message: 'Attendance record deleted successfully'
          }));
          setShowDeleteModal(false);
          setAttendanceToDelete(null);
        } else {
          throw new Error(result.payload || 'Delete failed');
        }
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error.message || 'Failed to delete attendance record'
        }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAttendanceToDelete(null);
  };

  const closeViewModal = () => {
    setShowViewModal(false);
    setAttendanceToView(null);
  };

  // Handle approval action
  const handleApprovalAction = (attendance, action) => {
    setSelectedAttendanceForApproval(attendance);
    setApprovalAction(action);
    setRejectionReason('');
    setShowApprovalModal(true);
  };

  // Confirm approval/rejection
  const confirmApproval = async () => {
    if (!selectedAttendanceForApproval) return;

    setApproving(true);
    try {
      const result = await dispatch(approveAttendance({
        attendanceId: selectedAttendanceForApproval._id,
        action: approvalAction,
        rejectionReason: approvalAction === 'reject' ? rejectionReason : undefined
      })).unwrap();

      if (result.success) {
        dispatch(addNotification({
          type: 'success',
          message: `Attendance ${approvalAction}d successfully`
        }));
        
        // Refresh the attendance data
        loadAttendance();
        
        setShowApprovalModal(false);
        setSelectedAttendanceForApproval(null);
        setApprovalAction('');
        setRejectionReason('');
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || `Failed to ${approvalAction} attendance`
      }));
    } finally {
      setApproving(false);
    }
  };

  const cancelApproval = () => {
    setShowApprovalModal(false);
    setSelectedAttendanceForApproval(null);
    setApprovalAction('');
    setRejectionReason('');
  };


  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'present': return 'green';
      case 'absent': return 'red';
      case 'late': return 'yellow';
      case 'half_day': return 'orange';
      case 'leave': return 'blue';
      case 'holiday': return 'purple';
      case 'weekend': return 'gray';
      default: return 'gray';
    }
  };

  // Table columns
  const columns = [
    {
      key: 'employee',
      label: 'Employee',
      render: (attendance) => (
        <div>
          <div className="font-medium text-gray-900">
            {attendance.employeeId?.firstName} {attendance.employeeId?.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {attendance.employeeId?.employeeId}
          </div>
        </div>
      )
    },
    {
      key: 'monthYear',
      label: 'Month/Year',
      render: (attendance) => (
        <div>
          <div className="font-medium text-gray-900">
            {attendance.summaryData?.month ? 
              new Date(0, attendance.summaryData.month - 1).toLocaleDateString('en-US', { month: 'short' }) : 
              new Date(attendance.date).toLocaleDateString('en-US', { month: 'short' })
            }
          </div>
          <div className="text-sm text-gray-500">
            {attendance.summaryData?.year || new Date(attendance.date).getFullYear()}
          </div>
        </div>
      )
    },
    {
      key: 'presentDays',
      label: 'Present Days',
      render: (attendance) => {
        // If it's a summary record, use summaryData
        if (attendance.summaryData?.presentDays !== undefined) {
          return (
            <div className="font-medium text-gray-900">
              {attendance.summaryData.presentDays}
            </div>
          );
        }
        // For individual records, calculate based on approval status
        const approvalStatus = attendance.approvalStatus || 'pending';
        const presentDays = approvalStatus === 'approved' ? 1 : 0;
        return (
          <div className="font-medium text-gray-900">
            {presentDays}
          </div>
        );
      }
    },
    {
      key: 'lop',
      label: 'LOP',
      render: (attendance) => {
        // If it's a summary record, use summaryData
        if (attendance.summaryData?.lop !== undefined) {
          return (
            <div className="font-medium text-gray-900">
              {attendance.summaryData.lop}
            </div>
          );
        }
        // For individual records, calculate based on approval status
        const approvalStatus = attendance.approvalStatus || 'pending';
        const lop = approvalStatus === 'rejected' ? 1 : 0;
        return (
          <div className="font-medium text-gray-900">
            {lop}
          </div>
        );
      }
    },
    {
      key: 'approvalStatus',
      label: "Today's Attendance",
      render: (attendance) => {
        const approvalStatus = attendance.approvalStatus || 'pending';
        let displayStatus, statusColors;
        
        if (approvalStatus === 'approved') {
          displayStatus = 'Present';
          statusColors = 'bg-green-100 text-green-800';
        } else if (approvalStatus === 'rejected') {
          displayStatus = 'Absent';
          statusColors = 'bg-red-100 text-red-800';
        } else {
          displayStatus = 'Pending';
          statusColors = 'bg-yellow-100 text-yellow-800';
        }
        
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors}`}>
            {displayStatus}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (attendance) => {
        const isPending = attendance.approvalStatus === 'pending';
        return (
          <div className="flex space-x-2 items-center">
            {isPending ? (
              <>
                <button
                  onClick={() => handleApprovalAction(attendance, 'approve')}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                  title="Approve Attendance"
                >
                  <HiCheckCircle className="w-4 h-4 mr-1" />
                  Approve
                </button>
                <button
                  onClick={() => handleApprovalAction(attendance, 'reject')}
                  className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  title="Reject Attendance"
                >
                  <HiXMark className="w-4 h-4 mr-1" />
                  Reject
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => handleViewAttendance(attendance._id)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="View Attendance Details"
                >
                  <HiEye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteAttendance(attendance._id)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                  title="Delete Attendance"
                >
                  <HiTrash className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  // Filter options
  const branchOptions = [
    { value: 'all', label: 'All Branches' },
    ...branches.map(branch => ({
      value: branch._id,
      label: `${branch.branchName} (${branch.branchCode})`
    }))
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'present', label: 'Present' },
    { value: 'absent', label: 'Absent' },
    { value: 'late', label: 'Late' },
    { value: 'half_day', label: 'Half Day' },
    { value: 'leave', label: 'Leave' },
    { value: 'holiday', label: 'Holiday' },
    { value: 'weekend', label: 'Weekend' }
  ];

  const monthOptions = [
    { value: 'all', label: 'All Months' },
    { value: '1', label: 'January' },
    { value: '2', label: 'February' },
    { value: '3', label: 'March' },
    { value: '4', label: 'April' },
    { value: '5', label: 'May' },
    { value: '6', label: 'June' },
    { value: '7', label: 'July' },
    { value: '8', label: 'August' },
    { value: '9', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const approvalStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Present' },
    { value: 'rejected', label: 'Absent' }
  ];


  if (loading && attendance.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          title="Total Records"
          value={pagination?.totalItems || 0}
          icon={HiClock}
          gradient="blue"
          animation="bounce"
          change="+5%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Present Today"
          value={attendance.filter(a => a.status === 'present').length}
          icon={HiCheckCircle}
          gradient="green"
          animation="pulse"
          change="+2%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Absent Today"
          value={attendance.filter(a => a.status === 'absent').length}
          icon={HiXMark}
          gradient="red"
          animation="float"
          change="+1%"
          changeType="increase"
          loading={loading}
        />
      </div>

      {/* Calendar or Table View */}
      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {/* Filters for Calendar View */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <Select
                value={branchFilter}
                onChange={(e) => handleFilterChange('branch', e)}
                options={branchOptions}
                className="w-full sm:w-40"
              />
              <Select
                value={approvalStatusFilter}
                onChange={(e) => handleFilterChange('approvalStatus', e)}
                options={approvalStatusOptions}
                className="w-full sm:w-48"
              />
              <Select
                value={monthFilter}
                onChange={(e) => handleFilterChange('month', e)}
                options={monthOptions}
                className="w-full sm:w-32"
              />
            </div>
          </div>
          <AttendanceCalendar
            attendance={attendance}
            onDateClick={handleDateClick}
            loading={loading}
          />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <Input
                  value={searchTerm}
                  onChange={handleSearch}
                  placeholder="Search attendance..."
                  icon={HiMagnifyingGlass}
                  className="w-full sm:w-64"
                />
                <Select
                  value={branchFilter}
                  onChange={(e) => handleFilterChange('branch', e)}
                  options={branchOptions}
                  className="w-full sm:w-40"
                />
                <Select
                  value={monthFilter}
                  onChange={(e) => handleFilterChange('month', e)}
                  options={monthOptions}
                  className="w-full sm:w-32"
                />
                <Select
                  value={approvalStatusFilter}
                  onChange={(e) => handleFilterChange('approvalStatus', e)}
                  options={approvalStatusOptions}
                  className="w-full sm:w-48"
                />
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            {pagination ? (
              <Table
                data={selectedDate ? 
                  attendance.filter(record => {
                    const date = new Date(record.date);
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    const recordDateKey = `${year}-${month}-${day}`;
                    return recordDateKey === selectedDate.dateKey;
                  }) : 
                  attendance
                }
                columns={columns}
                loading={loading}
                pagination={selectedDate ? null : {
                  currentPage: pagination.currentPage,
                  totalPages: pagination.totalPages,
                  onPageChange: handlePageChange
                }}
              />
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-500">Loading attendance data...</div>
              </div>
            )}
          </div>
        </div>
      )}


      {/* Delete Confirmation Modal */}
      <CommonModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Attendance Record"
        subtitle="This action cannot be undone"
        icon={HiTrash}
        iconColor="from-red-500 to-red-600"
        size="sm"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={cancelDelete}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteAttendance}
              size="sm"
            >
              Delete Record
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <HiTrash className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure you want to delete this attendance record?
          </h3>
          {attendanceToDelete && (
            <div className="text-sm text-gray-500 mb-4">
              <p><strong>Employee:</strong> {attendanceToDelete.employeeId?.firstName} {attendanceToDelete.employeeId?.lastName}</p>
              <p><strong>Date:</strong> {new Date(attendanceToDelete.date).toLocaleDateString()}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone. The attendance record will be permanently removed from the system.
          </p>
        </div>
      </CommonModal>

      {/* Approval Modal */}
      <CommonModal
        isOpen={showApprovalModal}
        onClose={cancelApproval}
        title={approvalAction === 'approve' ? 'Approve Attendance' : 'Reject Attendance'}
        subtitle={selectedAttendanceForApproval ? `${selectedAttendanceForApproval.employeeId?.firstName} ${selectedAttendanceForApproval.employeeId?.lastName} - ${new Date(selectedAttendanceForApproval.date).toLocaleDateString()}` : 'Attendance Approval'}
        icon={approvalAction === 'approve' ? HiCheckCircle : HiXMark}
        iconColor={approvalAction === 'approve' ? 'from-green-500 to-green-600' : 'from-red-500 to-red-600'}
        size="md"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={cancelApproval}
              size="sm"
              disabled={approving}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmApproval}
              disabled={approving || (approvalAction === 'reject' && !rejectionReason.trim())}
              className={approvalAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              size="sm"
            >
              {approving ? 'Processing...' : (approvalAction === 'approve' ? 'Approve' : 'Reject')}
            </Button>
          </div>
        }
      >
        <div className="py-4">
          {selectedAttendanceForApproval && (
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Attendance Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Employee:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedAttendanceForApproval.employeeId?.firstName} {selectedAttendanceForApproval.employeeId?.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Employee ID:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedAttendanceForApproval.employeeId?.employeeId}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Date:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {new Date(selectedAttendanceForApproval.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <span className="ml-2 font-medium text-gray-900">
                      {selectedAttendanceForApproval.status?.charAt(0).toUpperCase() + selectedAttendanceForApproval.status?.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                  {selectedAttendanceForApproval.checkIn?.time && (
                    <div>
                      <span className="text-gray-600">Check In:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(selectedAttendanceForApproval.checkIn.time).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                  {selectedAttendanceForApproval.checkOut?.time && (
                    <div>
                      <span className="text-gray-600">Check Out:</span>
                      <span className="ml-2 font-medium text-gray-900">
                        {new Date(selectedAttendanceForApproval.checkOut.time).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
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

              {approvalAction === 'approve' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm text-green-800">
                    This will mark the attendance as approved and the employee will be marked as present.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </CommonModal>

      {/* View Attendance Modal */}
      <CommonModal
        isOpen={showViewModal}
        onClose={closeViewModal}
        title="Attendance Details"
        subtitle={attendanceToView ? `${attendanceToView.employeeId?.firstName} ${attendanceToView.employeeId?.lastName} - ${new Date(attendanceToView.date).toLocaleDateString()}` : 'Attendance Details'}
        icon={HiEye}
        iconColor="from-blue-500 to-blue-600"
        size="xl"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={closeViewModal}
              className="px-4 py-2"
            >
              Close
            </Button>
          </div>
        }
      >
        {attendanceToView && (() => {
          // Basic Information Section
          const basicInfo = {
            title: 'Basic Information',
            fields: [
              {
                label: 'Date',
                value: new Date(attendanceToView.date).toLocaleDateString()
              },
              {
                label: 'Employee',
                value: `${attendanceToView.employeeId?.firstName} ${attendanceToView.employeeId?.lastName}`
              },
              {
                label: 'Employee ID',
                value: attendanceToView.employeeId?.employeeId || 'N/A'
              },
              {
                label: 'Designation',
                value: attendanceToView.summaryData?.designation || 'N/A'
              },
              {
                label: 'Branch',
                value: `${attendanceToView.branchId?.branchName} (${attendanceToView.branchId?.branchCode})`
              }
            ]
          };

          // Time Information Section
          const timeInfo = {
            title: 'Time Information',
            fields: [
              {
                label: 'Check In Time',
                value: attendanceToView.checkIn?.time 
                  ? new Date(attendanceToView.checkIn.time).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      hour12: true 
                    })
                  : 'Not checked in'
              },
              {
                label: 'Check In Location',
                value: attendanceToView.checkIn?.location || 'N/A'
              },
              {
                label: 'Check In Method',
                value: attendanceToView.checkIn?.method || 'N/A'
              },
              {
                label: 'Check Out Time',
                value: attendanceToView.checkOut?.time 
                  ? new Date(attendanceToView.checkOut.time).toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      hour12: true 
                    })
                  : 'Not checked out'
              },
              {
                label: 'Check Out Location',
                value: attendanceToView.checkOut?.location || 'N/A'
              },
              {
                label: 'Check Out Method',
                value: attendanceToView.checkOut?.method || 'N/A'
              }
            ]
          };


          // Status and Additional Information Section
          const statusInfo = {
            title: 'Status & Additional Information',
            fields: [
              {
                label: 'Status',
                value: attendanceToView.status?.charAt(0).toUpperCase() + attendanceToView.status?.slice(1).replace('_', ' '),
                type: 'status'
              },
              {
                label: 'Remarks',
                value: attendanceToView.remarks || 'No remarks'
              }
            ]
          };

          // Leave Information Section (if applicable)
          const leaveInfo = attendanceToView.leave?.type ? {
            title: 'Leave Information',
            fields: [
              {
                label: 'Leave Type',
                value: attendanceToView.leave.type
              },
              {
                label: 'Leave Reason',
                value: attendanceToView.leave.reason || 'N/A'
              },
              {
                label: 'Approved By',
                value: attendanceToView.leave.approvedBy ? 
                  `${attendanceToView.leave.approvedBy.firstName} ${attendanceToView.leave.approvedBy.lastName}` : 
                  'N/A'
              },
              {
                label: 'Approved At',
                value: attendanceToView.leave.approvedAt ? 
                  new Date(attendanceToView.leave.approvedAt).toLocaleDateString() : 
                  'N/A'
              }
            ]
          } : null;

          // Overtime Information Section (if applicable)
          const overtimeInfo = attendanceToView.overtime?.rate ? {
            title: 'Overtime Information',
            fields: [
              {
                label: 'Overtime Rate',
                value: `₹${attendanceToView.overtime.rate}/hour`,
                type: 'price'
              },
              {
                label: 'Overtime Amount',
                value: `₹${attendanceToView.overtime.amount?.toFixed(2) || 0}`,
                type: 'price'
              },
              {
                label: 'Approved By',
                value: attendanceToView.overtime.approvedBy ? 
                  `${attendanceToView.overtime.approvedBy.firstName} ${attendanceToView.overtime.approvedBy.lastName}` : 
                  'N/A'
              },
              {
                label: 'Approved At',
                value: attendanceToView.overtime.approvedAt ? 
                  new Date(attendanceToView.overtime.approvedAt).toLocaleDateString() : 
                  'N/A'
              }
            ]
          } : null;


          const sections = [basicInfo, timeInfo, statusInfo];
          if (leaveInfo) sections.push(leaveInfo);
          if (overtimeInfo) sections.push(overtimeInfo);

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <DetailsView sections={sections.slice(0, Math.ceil(sections.length / 2))} />
              </div>
              <div>
                <DetailsView sections={sections.slice(Math.ceil(sections.length / 2))} />
              </div>
            </div>
          );
        })()}
      </CommonModal>
    </div>
  );
};

export default AttendanceTab;
