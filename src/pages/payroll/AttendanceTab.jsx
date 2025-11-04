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
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal, DetailsView } from '../../components/common';
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
  getAttendanceStats 
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
  const handleFilterChange = (filterType, value) => {
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
      render: (attendance) => (
        <div className="font-medium text-gray-900">
          {attendance.summaryData?.presentDays || 0}
        </div>
      )
    },
    {
      key: 'lop',
      label: 'LOP',
      render: (attendance) => (
        <div className="font-medium text-gray-900">
          {attendance.summaryData?.lop || 0}
        </div>
      )
    },
    {
      key: 'approvalStatus',
      label: 'Approval Status',
      render: (attendance) => {
        const status = attendance.approvalStatus || 'pending';
        const statusColors = {
          pending: 'bg-yellow-100 text-yellow-800',
          approved: 'bg-green-100 text-green-800',
          rejected: 'bg-red-100 text-red-800'
        };
        return (
          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (attendance) => (
        <div className="flex space-x-3">
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
        </div>
      )
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
    { value: 'all', label: 'All Approval Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' }
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
                onChange={(value) => handleFilterChange('branch', value)}
                options={branchOptions}
                className="w-full sm:w-40"
              />
              <Select
                value={approvalStatusFilter}
                onChange={(value) => handleFilterChange('approvalStatus', value)}
                options={approvalStatusOptions}
                className="w-full sm:w-48"
              />
              <Select
                value={monthFilter}
                onChange={(value) => handleFilterChange('month', value)}
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
                  onChange={(value) => handleFilterChange('branch', value)}
                  options={branchOptions}
                  className="w-full sm:w-40"
                />
                <Select
                  value={monthFilter}
                  onChange={(value) => handleFilterChange('month', value)}
                  options={monthOptions}
                  className="w-full sm:w-32"
                />
                <Select
                  value={approvalStatusFilter}
                  onChange={(value) => handleFilterChange('approvalStatus', value)}
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
