import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiMagnifyingGlass,
  HiCurrencyDollar,
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiXMark,
  HiClock,
  HiUser,
  HiDocument,
  HiEye
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal, PayslipModal, EmployeeDetailsModal, ActionButton } from '../../components/common';
import {
  getPayrollStats,
  getPayrollById
} from '../../redux/actions/payrollActions';
import {
  getAllUsers,
  deleteUser
} from '../../redux/actions/userActions';
import {
  getAllAttendance
} from '../../redux/actions/attendanceActions';
import {
  selectPayrollStats
} from '../../redux/slices/payrollSlice';
import {
  selectUsers,
  selectUserLoading,
  selectUserError
} from '../../redux/slices/userSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import api from '../../lib/axiosInstance';

const PayrollTab = ({ showUsers = true, isPayrollTab = false }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const stats = useSelector(selectPayrollStats);
  const { user: loggedInUser } = useSelector((state) => state.auth);
  const isAccountsManager = loggedInUser?.role === 'accounts_manager';
  const isSupervisor = loggedInUser?.role === 'supervisor';
  
  // User state (when showing users)
  const users = useSelector(selectUsers);
  const userLoading = useSelector(selectUserLoading);
  const userError = useSelector(selectUserError);
  const userPagination = useSelector((state) => state.user.pagination);
  
  // Attendance state
  const attendance = useSelector((state) => state.attendance.allAttendance);
  const attendanceLoading = useSelector((state) => state.attendance.loading);

  // Extract branch ID - handle both populated object and ObjectId string
  const userBranchId = useMemo(() => {
    if (!loggedInUser?.branch) return null;
    return loggedInUser.branch?._id || loggedInUser.branch;
  }, [loggedInUser?.branch]);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  // For accounts_manager and supervisor, automatically set branch filter to their branch
  const [branchFilter, setBranchFilter] = useState(
    (isAccountsManager || isSupervisor) && userBranchId
      ? userBranchId
      : 'all'
  );
  const [monthFilter, setMonthFilter] = useState(String(new Date().getMonth() + 1)); // Default to current month
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showPayslipModal, setShowPayslipModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedUserAttendanceData, setSelectedUserAttendanceData] = useState(null);
  const [selectedUserPayrollData, setSelectedUserPayrollData] = useState(null);
  const [showEmployeeDetailsModal, setShowEmployeeDetailsModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  // Load branches data
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

  // Set branch filter for accounts_manager and supervisor on mount
  useEffect(() => {
    if ((isAccountsManager || isSupervisor) && userBranchId) {
      setBranchFilter(userBranchId);
    }
  }, [isAccountsManager, isSupervisor, userBranchId]);

  // Load data on component mount
  useEffect(() => {
    // Always load users for the payroll table with attendance data
    dispatch(getAllUsers({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      branch: branchFilter !== 'all' ? branchFilter : undefined
    }));
    
    // Also load payroll stats for the summary cards
    dispatch(getPayrollStats({
      branchId: branchFilter !== 'all' ? branchFilter : undefined,
      year: yearFilter,
      month: monthFilter !== 'all' ? monthFilter : undefined
    }));
    
    // Fetch attendance data for all employees
    dispatch(getAllAttendance({
      page: 1,
      limit: 1000, // Get all attendance records
      branchId: branchFilter !== 'all' ? branchFilter : undefined,
      month: monthFilter !== 'all' ? monthFilter : undefined,
      year: yearFilter
    }));
    
    loadBranches();
  }, [currentPage, searchTerm, branchFilter, monthFilter, yearFilter, dispatch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filter changes - support both event object and direct value
  const handleFilterChange = (filterType, eventOrValue) => {
    // Prevent accounts_manager and supervisor from changing branch filter
    if (filterType === 'branch' && (isAccountsManager || isSupervisor)) {
      return;
    }
    
    // Extract value from event object or use direct value
    const value = eventOrValue?.target?.value !== undefined ? eventOrValue.target.value : eventOrValue;
    // Ensure value is always a string for consistency
    const stringValue = value !== undefined && value !== null ? String(value) : '';
    
    switch (filterType) {
      case 'branch':
        setBranchFilter(stringValue);
        break;
      case 'month':
        setMonthFilter(stringValue);
        break;
      case 'year':
        setYearFilter(stringValue);
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
  const handleDeletePayroll = (id) => {
    const user = users.find(u => u._id === id);
    setPayrollToDelete(user);
    setShowDeleteModal(true);
  };


  const handleViewPayslip = async (user) => {
    // Show payslip modal instead of navigating
    const attendanceData = getEmployeeAttendanceData(user._id);
    setSelectedUserId(user._id);
    setSelectedUserAttendanceData(attendanceData);
    
    // Ensure we have payroll data - fetch if not available
    let payrollData = user.payrollData;
    
    if (!payrollData && user._id) {
      try {
        // Try to fetch payroll data
        const result = await dispatch(getPayrollById(user._id)).unwrap();
        if (result?.data?.payroll) {
          payrollData = result.data.payroll;
        }
      } catch (error) {
        console.error('Failed to fetch payroll data:', error);
      }
    }
    
    setSelectedUserPayrollData(payrollData);
    setShowPayslipModal(true);
  };

  const handleViewEmployee = async (user) => {
    // If user doesn't have payrollData, try to fetch it
    let employeeData = { ...user };
    
    if (!user.payrollData && user._id) {
      try {
        // Try to fetch payroll data by user ID
        const result = await dispatch(getPayrollById(user._id)).unwrap();
        if (result?.data?.payroll) {
          const payroll = result.data.payroll;
          // Transform payroll to match the expected structure
          employeeData.payrollData = {
            _id: payroll._id,
            payrollId: payroll.payrollId,
            basicSalary: payroll.basicSalary,
            calculations: payroll.calculations,
            deductions: payroll.deductions,
            bankDetails: payroll.bankDetails,
            pfDetails: payroll.pfDetails,
            panDetails: payroll.panDetails,
            address: payroll.address,
            dateOfBirth: payroll.dateOfBirth,
            payment: payroll.payment,
            status: payroll.status,
            payPeriod: payroll.payPeriod,
            attendance: payroll.attendance,
            employeeName: payroll.employeeName,
            employeeId: payroll.employeeId,
            email: payroll.email,
            designation: payroll.designation
          };
        }
      } catch (error) {
        console.error('Failed to fetch payroll data:', error);
        // Continue with user data even if payroll fetch fails
      }
    }
    
    setSelectedEmployee(employeeData);
    setShowEmployeeDetailsModal(true);
  };

  const handleEditEmployee = (user) => {
    navigate(`/payrolls/edit/${user._id}`);
  };

  const handleDeleteEmployee = (user) => {
    setPayrollToDelete(user);
    setShowDeleteModal(true);
  };


  const confirmDeletePayroll = async () => {
    if (payrollToDelete) {
      try {
        await dispatch(deleteUser(payrollToDelete._id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Employee deleted successfully'
        }));
        setShowDeleteModal(false);
        setPayrollToDelete(null);
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error || 'Failed to delete employee'
        }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPayrollToDelete(null);
  };

  // Helper function to get attendance data for an employee
  // Filters attendance based on selected month and year
  const getEmployeeAttendanceData = (employeeId) => {
    if (!attendance || !Array.isArray(attendance)) {
      // Return zero data when attendance is not loaded
      return {
        totalDays: 0,
        presentDays: 0,
        absentDays: 0,
        lateDays: 0,
        halfDays: 0,
        currentMonthAttendance: 0,
        currentMonthPresent: 0,
        attendancePercentage: 0
      };
    }
    
    // Get selected month and year for filtering
    const selectedMonth = monthFilter !== 'all' ? parseInt(monthFilter) : null;
    const selectedYear = parseInt(yearFilter);
    
    // Filter attendance records for this employee
    let employeeAttendance = attendance.filter(record => 
      record.employeeId?._id === employeeId || record.employeeId === employeeId
    );
    
    // Filter by selected month and year if filters are set
    // This is a client-side double-check since backend already filters, but ensures data consistency
    if (selectedMonth && selectedYear) {
      employeeAttendance = employeeAttendance.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        // Check if date is valid
        if (isNaN(recordDate.getTime())) return false;
        const recordMonth = recordDate.getMonth() + 1; // getMonth() returns 0-11
        const recordYear = recordDate.getFullYear();
        return recordMonth === selectedMonth && recordYear === selectedYear;
      });
    } else if (selectedYear) {
      // If only year is selected, filter by year
      employeeAttendance = employeeAttendance.filter(record => {
        if (!record.date) return false;
        const recordDate = new Date(record.date);
        // Check if date is valid
        if (isNaN(recordDate.getTime())) return false;
        return recordDate.getFullYear() === selectedYear;
      });
    }
    
    // Calculate summary data for filtered attendance
    const totalDays = employeeAttendance.length;
    const presentDays = employeeAttendance.filter(record => 
      record.status === 'present' || record.status === 'approved'
    ).length;
    const absentDays = employeeAttendance.filter(record => 
      record.status === 'absent' || record.status === 'rejected'
    ).length;
    const lateDays = employeeAttendance.filter(record => 
      record.status === 'late'
    ).length;
    const halfDays = employeeAttendance.filter(record => 
      record.status === 'half_day'
    ).length;
    
    // For "This Month" column, use the filtered data (selected month/year)
    // If month filter is set, use that; otherwise use current month
    let filteredMonth = selectedMonth || new Date().getMonth() + 1;
    let filteredYear = selectedYear || new Date().getFullYear();
    
    const filteredMonthAttendance = employeeAttendance.filter(record => {
      if (!record.date) return false;
      const recordDate = new Date(record.date);
      // Check if date is valid
      if (isNaN(recordDate.getTime())) return false;
      return recordDate.getMonth() + 1 === filteredMonth && recordDate.getFullYear() === filteredYear;
    });
    
    return {
      totalDays,
      presentDays,
      absentDays,
      lateDays,
      halfDays,
      currentMonthAttendance: filteredMonthAttendance.length,
      currentMonthPresent: filteredMonthAttendance.filter(record => 
        record.status === 'present' || record.status === 'approved'
      ).length,
      attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
    };
  };

  // Table columns - now both data sources use user format
  const columns = [
    {
      key: 'employeeId',
      label: 'Employee ID',
      render: (user) => (
        <div className="font-medium text-gray-900">
          {user.employeeId || 'N/A'}
        </div>
      )
    },
    {
      key: 'employee',
      label: 'Employee',
      render: (user) => (
        <div>
          <div className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </div>
          <div className="text-sm text-gray-500">
            {user.email}
          </div>
        </div>
      )
    },
    {
      key: 'role',
      label: 'Designation',
      render: (user) => (
        <div className="text-sm text-gray-900">
          {user.role?.replace('_', ' ').toUpperCase() || 'N/A'}
        </div>
      )
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (user) => (
        <div className="text-sm text-gray-900">
          {user.branch?.branchName || 'N/A'}
        </div>
      )
    },
    {
      key: 'salary',
      label: 'Salary',
      render: (user) => (
        <div className="text-sm text-gray-900">
          {user.payrollData?.calculations?.netSalary ? 
            `₹${user.payrollData.calculations.netSalary.toLocaleString()}` : 
            'N/A'
          }
        </div>
      )
    },
    {
      key: 'attendance',
      label: 'Attendance',
      render: (user) => {
        if (isAttendanceLoading) {
          return (
            <div className="text-sm text-gray-400">
              Loading...
            </div>
          );
        }
        
        const attendanceData = getEmployeeAttendanceData(user._id);
        return (
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${attendanceData.presentDays > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                {attendanceData.presentDays}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">
                {attendanceData.totalDays}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              {attendanceData.attendancePercentage}% present
            </div>
          </div>
        );
      }
    },
    {
      key: 'currentMonth',
      label: monthFilter !== 'all' ? 
        new Date(parseInt(yearFilter), parseInt(monthFilter) - 1, 1).toLocaleDateString('en-US', { month: 'long' }) : 
        'This Month',
      render: (user) => {
        if (isAttendanceLoading) {
          return (
            <div className="text-sm text-gray-400">
              Loading...
            </div>
          );
        }
        
        const attendanceData = getEmployeeAttendanceData(user._id);
        return (
          <div className="text-sm">
            <div className="flex items-center space-x-2">
              <span className={`font-medium ${attendanceData.currentMonthPresent > 0 ? 'text-blue-600' : 'text-gray-500'}`}>
                {attendanceData.currentMonthPresent}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-600">
                {attendanceData.currentMonthAttendance}
              </span>
            </div>
            <div className="text-xs text-gray-500">
              present this month
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      label: 'Attendance Status',
      render: (user) => {
        if (isAttendanceLoading) {
          return (
            <div className="text-sm text-gray-400">
              Loading...
            </div>
          );
        }
        
        const attendanceData = getEmployeeAttendanceData(user._id);
        
        // If no attendance records at all, show "no-data" status
        if (attendanceData.totalDays === 0) {
          return (
            <StatusBadge
              status="no-data"
              variant="warning"
            />
          );
        }
        
        let status = 'good';
        let variant = 'success';
        
        if (attendanceData.attendancePercentage < 70) {
          status = 'poor';
          variant = 'danger';
        } else if (attendanceData.attendancePercentage < 85) {
          status = 'average';
          variant = 'warning';
        }
        
        return (
          <StatusBadge
            status={status}
            variant={variant}
          />
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (user) => (
        <div className="flex items-center space-x-2">
          {isPayrollTab ? (
            // Payroll tab: Show View Payslip button
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleViewPayslip(user)}
              className="flex items-center space-x-1"
            >
              <HiDocument className="h-4 w-4" />
              <span>View Payslip</span>
            </Button>
          ) : (
            // Employees tab: Show view, edit, delete icons
            <>
              <ActionButton
                icon={HiEye}
                onClick={() => handleViewEmployee(user)}
                variant="view"
                size="sm"
                title="View Employee Details"
              />
              <ActionButton
                icon={HiPencil}
                onClick={() => handleEditEmployee(user)}
                variant="edit"
                size="sm"
                title="Edit Employee"
              />
              <ActionButton
                icon={HiTrash}
                onClick={() => handleDeleteEmployee(user)}
                variant="delete"
                size="sm"
                title="Delete Employee"
              />
            </>
          )}
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

  // Month options
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

  // Year options (current year and 2 years before)
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: (currentYear - 2).toString(), label: (currentYear - 2).toString() },
    { value: (currentYear - 1).toString(), label: (currentYear - 1).toString() },
    { value: currentYear.toString(), label: currentYear.toString() },
    { value: (currentYear + 1).toString(), label: (currentYear + 1).toString() }
  ];




  // Always use users data for the payroll table with attendance
  const currentLoading = userLoading;
  const currentError = userError;
  const currentData = users;
  const currentPagination = userPagination;
  
  // Combined loading state for attendance data
  const isAttendanceLoading = attendanceLoading;

  if (currentLoading && (!currentData || currentData.length === 0)) {
    return <Loading />;
  }

  if (currentError) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <HiXMark className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading employees
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{currentError}</p>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => window.location.reload()}
                  className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Employees"
          value={currentPagination?.total || (currentData?.length || 0)}
          icon={HiUser}
          gradient="blue"
          animation="bounce"
          change="+5%"
          changeType="increase"
          loading={currentLoading}
        />
        <StatCard
          title="Active Employees"
          value={currentData?.filter(user => user.isActive).length || 0}
          icon={HiCheckCircle}
          gradient="green"
          animation="pulse"
          change="+2%"
          changeType="increase"
          loading={currentLoading}
        />
        <StatCard
          title="Inactive Employees"
          value={currentData?.filter(user => !user.isActive).length || 0}
          icon={HiXMark}
          gradient="red"
          animation="float"
          change="+8%"
          changeType="increase"
          loading={currentLoading}
        />
        <StatCard
          title="Total Salary"
          value={`₹${(currentData?.reduce((sum, user) => sum + (user.payrollData?.calculations?.netSalary || 0), 0) || 0).toLocaleString()}`}
          icon={HiCurrencyDollar}
          gradient="emerald"
          animation="bounce"
          change="+12%"
          changeType="increase"
          loading={currentLoading}
        />
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, currentPagination?.totalItems || 0)} of {currentPagination?.totalItems || 0} employees
        </div>
      </div>

      {/* Payroll Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
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
              {/* Hide branch filter for accounts_manager - they can only see their branch */}
              {!isAccountsManager && !isSupervisor && (
                <Select
                  value={branchFilter}
                  onChange={(e) => handleFilterChange('branch', e)}
                  options={branchOptions}
                  className="w-full sm:w-40"
                />
              )}
              <Select
                value={monthFilter}
                onChange={(e) => handleFilterChange('month', e)}
                options={monthOptions}
                className="w-full sm:w-40"
              />
              <Select
                value={yearFilter}
                onChange={(e) => handleFilterChange('year', e)}
                options={yearOptions}
                className="w-full sm:w-32"
              />
            </div>
          </div>
        </div>
        <div className="overflow-hidden">
          <Table
            data={currentData || []}
            columns={columns}
            loading={currentLoading}
            pagination={{
              currentPage: currentPagination?.currentPage || 1,
              totalPages: currentPagination?.totalPages || 1,
              onPageChange: handlePageChange
            }}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <CommonModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Employee"
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
              onClick={confirmDeletePayroll}
              size="sm"
            >
              Delete Employee
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <HiTrash className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure you want to delete this employee?
          </h3>
          {payrollToDelete && (
            <div className="text-sm text-gray-500 mb-4">
              <p><strong>Employee ID:</strong> {payrollToDelete.employeeId || 'N/A'}</p>
              <p><strong>Name:</strong> {payrollToDelete.firstName} {payrollToDelete.lastName}</p>
              <p><strong>Email:</strong> {payrollToDelete.email}</p>
              <p><strong>Role:</strong> {payrollToDelete.role?.replace('_', ' ').toUpperCase()}</p>
              {payrollToDelete.payrollData && (
                <p><strong>Net Salary:</strong> ₹{payrollToDelete.payrollData.calculations?.netSalary?.toLocaleString()}</p>
              )}
            </div>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone. The employee will be permanently removed from the system.
          </p>
        </div>
      </CommonModal>

      {/* Payslip Modal */}
      <PayslipModal
        isOpen={showPayslipModal}
        onClose={() => {
          setShowPayslipModal(false);
          setSelectedUserId(null);
          setSelectedUserAttendanceData(null);
          setSelectedUserPayrollData(null);
        }}
        userId={selectedUserId}
        attendanceData={selectedUserAttendanceData}
        initialPayrollData={selectedUserPayrollData}
      />

      {/* Employee Details Modal */}
      <EmployeeDetailsModal
        isOpen={showEmployeeDetailsModal}
        onClose={() => {
          setShowEmployeeDetailsModal(false);
          setSelectedEmployee(null);
        }}
        employee={selectedEmployee}
        onEdit={handleEditEmployee}
        onDelete={handleDeleteEmployee}
      />
    </div>
  );
};

export default PayrollTab;
