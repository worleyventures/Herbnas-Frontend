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
  HiDocumentArrowUp,
  HiCheckCircle,
  HiXMark,
  HiArrowDownTray
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal } from '../../components/common';
import { addNotification } from '../../redux/slices/uiSlice';
import api from '../../lib/axiosInstance';
import * as XLSX from 'xlsx';

const AttendanceTab = () => {
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
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM format
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

  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadFile(file);
    }
  };

  const handleUploadSubmit = async () => {
    if (!uploadFile) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please select a file to upload'
      }));
      return;
    }

    if (!selectedMonth) {
      dispatch(addNotification({
        type: 'error',
        message: 'Please select a month for the upload'
      }));
      return;
    }

    try {
      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('month', selectedMonth);
      
      const response = await api.post('/attendance/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        dispatch(addNotification({
          type: 'success',
          message: `Successfully uploaded ${response.data.data.createdCount} attendance records for ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        }));
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedMonth(new Date().toISOString().slice(0, 7)); // Reset to current month
        loadAttendance(); // Refresh the list
        loadStats(); // Refresh stats
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to upload attendance file'
      }));
    }
  };

  // Generate and download sample Excel file
  const downloadSampleExcel = () => {
    // Get current month and year
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // 0-based to 1-based
    const currentYear = currentDate.getFullYear();
    
    // Generate sample data for the entire month
    const sampleData = [];
    const employees = [
      { id: 'EMP001', branch: 'BR001', name: 'John Doe' },
      { id: 'EMP002', branch: 'BR001', name: 'Jane Smith' },
      { id: 'EMP003', branch: 'BR002', name: 'Mike Johnson' },
      { id: 'EMP004', branch: 'BR001', name: 'Sarah Wilson' },
      { id: 'EMP005', branch: 'BR002', name: 'David Brown' }
    ];

    // Generate data for each day of the month
    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
      
      // Skip weekends for most employees
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      employees.forEach((employee, empIndex) => {
        // Skip weekends for most employees (except one for variety)
        if (isWeekend && empIndex !== 4) return;
        
        // Generate different attendance patterns
        let status, checkIn, checkOut, leaveType, remarks;
        
        if (isWeekend && empIndex === 4) {
          // Weekend work
          status = 'present';
          checkIn = '10:00';
          checkOut = '16:00';
          leaveType = '';
          remarks = 'Weekend work';
        } else if (day % 7 === 0) {
          // Every 7th day - sick leave
          status = 'leave';
          checkIn = '';
          checkOut = '';
          leaveType = 'sick';
          remarks = 'Sick leave';
        } else if (day % 10 === 0) {
          // Every 10th day - half day
          status = 'half_day';
          checkIn = '09:00';
          checkOut = '13:00';
          leaveType = '';
          remarks = 'Half day leave';
        } else if (day % 15 === 0) {
          // Every 15th day - absent
          status = 'absent';
          checkIn = '';
          checkOut = '';
          leaveType = '';
          remarks = 'No show';
        } else if (day % 5 === 0) {
          // Every 5th day - late arrival
          status = 'present';
          checkIn = '09:30';
          checkOut = '17:30';
          leaveType = '';
          remarks = 'Late arrival';
        } else {
          // Regular working day
          status = 'present';
          checkIn = '09:00';
          checkOut = '17:00';
          leaveType = '';
          remarks = 'Regular working day';
        }
        
        sampleData.push({
          'Employee ID': employee.id,
          'Branch Code': employee.branch,
          'Date': `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
          'Check In': checkIn,
          'Check Out': checkOut,
          'Status': status,
          'Leave Type': leaveType,
          'Remarks': remarks
        });
      });
    }

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    // Set column widths
    const colWidths = [
      { wch: 12 }, // Employee ID
      { wch: 12 }, // Branch Code
      { wch: 12 }, // Date
      { wch: 10 }, // Check In
      { wch: 10 }, // Check Out
      { wch: 12 }, // Status
      { wch: 12 }, // Leave Type
      { wch: 20 }  // Remarks
    ];
    ws['!cols'] = colWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Sample');

    // Generate Excel file and trigger download
    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const fileName = `attendance_sample_${monthName}_${currentYear}.xlsx`;
    XLSX.writeFile(wb, fileName);

    dispatch(addNotification({
      type: 'success',
      message: 'Sample Excel file downloaded successfully!'
    }));
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
      {/* Statistics Cards */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Records"
            value={stats[0]?.totalRecords || 0}
            icon={HiClock}
            color="blue"
            loading={loading}
          />
          <StatCard
            title="Total Working Hours"
            value={`${stats[0]?.totalWorkingHours?.toFixed(1) || 0}h`}
            icon={HiClock}
            color="green"
            loading={loading}
          />
          <StatCard
            title="Total Overtime"
            value={`${stats[0]?.totalOvertime?.toFixed(1) || 0}h`}
            icon={HiClock}
            color="yellow"
            loading={loading}
          />
          <StatCard
            title="Present Days"
            value={stats[0]?.statusBreakdown?.find(s => s.status === 'present')?.count || 0}
            icon={HiCheckCircle}
            color="green"
            loading={loading}
          />
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Input
            // label="Search"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search attendance..."
            icon={HiMagnifyingGlass}
          />
          <Select
            // label="Branch"
            value={branchFilter}
            onChange={(value) => handleFilterChange('branch', value)}
            options={branchOptions}
          />
          <Select
            // label="Employee"
            value={employeeFilter}
            onChange={(value) => handleFilterChange('employee', value)}
            options={employeeOptions}
          />
          <Input
            // label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          <Input
            // label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Attendance Records</h2>
                <div className="flex space-x-3">
                  <Button
                    variant="primary"
                    icon={HiDocumentArrowUp}
                    onClick={() => setShowUploadModal(true)}
                  >
                    Upload Excel
                  </Button>
                </div>
        </div>
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

      {/* Upload Modal */}
      <CommonModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload Attendance Excel"
        subtitle="Upload attendance records for payroll processing"
        icon={HiDocumentArrowUp}
        iconColor="from-blue-500 to-blue-600"
        size="md"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUploadSubmit}
              size="sm"
              disabled={!uploadFile}
            >
              Upload File
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Month for Upload
            </label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a]"
            />
            <p className="text-sm text-gray-500 mt-1">
              Select the month for which you're uploading attendance data
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Excel File
            </label>
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            <p className="text-sm text-gray-500 mt-1">
              Supported formats: .xlsx, .xls
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-gray-900">Sample Excel File</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={downloadSampleExcel}
                className="flex items-center space-x-2"
              >
                <HiArrowDownTray className="w-4 h-4" />
                <span>Download Sample</span>
              </Button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Download the sample Excel file to see the correct format and structure for uploading attendance records.
            </p>
            <div className="text-xs text-gray-500 space-y-1">
              <p><strong>Required columns:</strong> Employee ID, Branch Code, Date</p>
              <p><strong>Optional columns:</strong> Check In, Check Out, Status, Leave Type, Remarks</p>
              <p><strong>Note:</strong> Uploaded attendance data will be used for payroll calculations.</p>
            </div>
          </div>
        </div>
      </CommonModal>

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
