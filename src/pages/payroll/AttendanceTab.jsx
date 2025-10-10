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
  HiXMark
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal } from '../../components/common';
import { addNotification } from '../../redux/slices/uiSlice';
import api from '../../lib/axiosInstance';

const AttendanceTab = ({ onUploadClick }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Local state
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [employeeFilter, setEmployeeFilter] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [attendanceToDelete, setAttendanceToDelete] = useState(null);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [stats, setStats] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    hasNextPage: false,
    hasPrevPage: false
  });

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

  const loadEmployees = async () => {
    try {
      const response = await api.get('/users');
      if (response.data.success) {
        setEmployees(response.data.data.users || []);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  // Load attendance data
  const loadAttendance = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(searchTerm && { search: searchTerm }),
        ...(branchFilter !== 'all' && { branchId: branchFilter }),
        ...(employeeFilter !== 'all' && { employeeId: employeeFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await api.get(`/attendance?${params}`);
      
      if (response.data.success) {
        setAttendance(response.data.data.attendance || []);
        setPagination(response.data.data.pagination || pagination);
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to load attendance records'
      }));
    } finally {
      setLoading(false);
    }
  };

  // Load attendance stats
  const loadStats = async () => {
    try {
      const params = new URLSearchParams({
        ...(branchFilter !== 'all' && { branchId: branchFilter }),
        ...(startDate && { startDate }),
        ...(endDate && { endDate })
      });

      const response = await api.get(`/attendance/stats?${params}`);
      
      if (response.data.success) {
        setStats(response.data.data.summary || []);
      }
    } catch (error) {
      console.error('Failed to load attendance stats:', error);
    }
  };

  // Load data on component mount
  useEffect(() => {
    loadAttendance();
    loadStats();
    loadBranches();
    loadEmployees();
  }, [currentPage, searchTerm, branchFilter, employeeFilter, startDate, endDate, statusFilter]);

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
      case 'employee':
        setEmployeeFilter(value);
        break;
      case 'startDate':
        setStartDate(value);
        break;
      case 'endDate':
        setEndDate(value);
        break;
      case 'status':
        setStatusFilter(value);
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

  // Handle delete
  const handleDeleteAttendance = (attendanceId) => {
    const attendanceRecord = attendance.find(a => a._id === attendanceId);
    setAttendanceToDelete(attendanceRecord);
    setShowDeleteModal(true);
  };

  const confirmDeleteAttendance = async () => {
    if (attendanceToDelete) {
      try {
        await api.delete(`/attendance/${attendanceToDelete._id}`);
        
        dispatch(addNotification({
          type: 'success',
          message: 'Attendance record deleted successfully'
        }));
        setShowDeleteModal(false);
        setAttendanceToDelete(null);
        loadAttendance(); // Refresh the list
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
      key: 'attendanceId',
      label: 'Attendance ID',
      render: (attendance) => (
        <div className="font-medium text-gray-900">
          {attendance.attendanceId}
        </div>
      )
    },
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
      key: 'date',
      label: 'Date',
      render: (attendance) => (
        <div className="font-medium text-gray-900">
          {new Date(attendance.date).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'checkIn',
      label: 'Check In',
      render: (attendance) => (
        <div>
          {attendance.checkIn?.time ? (
            <div className="text-sm text-gray-900">
              {new Date(attendance.checkIn.time).toLocaleTimeString()}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Not checked in</div>
          )}
        </div>
      )
    },
    {
      key: 'checkOut',
      label: 'Check Out',
      render: (attendance) => (
        <div>
          {attendance.checkOut?.time ? (
            <div className="text-sm text-gray-900">
              {new Date(attendance.checkOut.time).toLocaleTimeString()}
            </div>
          ) : (
            <div className="text-sm text-gray-500">Not checked out</div>
          )}
        </div>
      )
    },
    {
      key: 'workingHours',
      label: 'Working Hours',
      render: (attendance) => (
        <div>
          <div className="font-medium text-gray-900">
            {attendance.workingHours?.actual?.toFixed(1) || 0}h
          </div>
          <div className="text-sm text-gray-500">
            Scheduled: {attendance.workingHours?.scheduled || 0}h
          </div>
        </div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (attendance) => (
        <StatusBadge
          status={attendance.status}
          color={getStatusColor(attendance.status)}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (attendance) => (
        <div className="flex space-x-3">
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

  const employeeOptions = [
    { value: 'all', label: 'All Employees' },
    ...employees.map(employee => ({
      value: employee._id,
      label: `${employee.firstName} ${employee.lastName} (${employee.employeeId})`
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

  if (loading && attendance.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
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
        <StatCard
          title="Total Hours"
          value={`${attendance.reduce((sum, a) => sum + (a.workingHours?.actual || 0), 0).toFixed(1)}h`}
          icon={HiClock}
          gradient="emerald"
          animation="bounce"
          change="+8%"
          changeType="increase"
          loading={loading}
        />
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, pagination?.totalItems || 0)} of {pagination?.totalItems || 0} records
        </div>
      </div>

      {/* Attendance Table */}
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
                value={employeeFilter}
                onChange={(value) => handleFilterChange('employee', value)}
                options={employeeOptions}
                className="w-full sm:w-48"
              />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
                className="w-full sm:w-32"
                placeholder="Start Date"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
                className="w-full sm:w-32"
                placeholder="End Date"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            data={attendance}
            columns={columns}
            loading={loading}
            pagination={{
              currentPage: pagination.currentPage,
              totalPages: pagination.totalPages,
              onPageChange: handlePageChange
            }}
          />
        </div>
      </div>


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
              <p><strong>Attendance ID:</strong> {attendanceToDelete.attendanceId}</p>
              <p><strong>Employee:</strong> {attendanceToDelete.employeeId?.firstName} {attendanceToDelete.employeeId?.lastName}</p>
              <p><strong>Date:</strong> {new Date(attendanceToDelete.date).toLocaleDateString()}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone. The attendance record will be permanently removed from the system.
          </p>
        </div>
      </CommonModal>
    </div>
  );
};

export default AttendanceTab;
