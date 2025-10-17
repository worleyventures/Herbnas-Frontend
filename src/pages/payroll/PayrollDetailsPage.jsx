import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiArrowLeft,
  HiUser,
  HiBuildingOffice,
  HiCalendar,
  HiCurrencyDollar,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiDocument
} from 'react-icons/hi2';
import { Button, StatusBadge, Loading } from '../../components/common';
import { getUserById } from '../../redux/actions/userActions';
import { getAllAttendance } from '../../redux/actions/attendanceActions';
import { getPayrollById } from '../../redux/actions/payrollActions';

const PayrollDetailsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const { id: userId } = params;
  const { users, loading, error, userLoading, userError } = useSelector(state => state.user || {});
  const { allAttendance: attendance, loading: attendanceLoading } = useSelector(state => state.attendance || {});
  const { currentPayroll, loading: payrollLoading, error: payrollError } = useSelector(state => state.payroll || {});
  
  const [user, setUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState(null);
  const [payrollData, setPayrollData] = useState(null);

  // Get attendance data from location state if available
  useEffect(() => {
    if (location.state?.attendanceData) {
      setAttendanceData(location.state.attendanceData);
    }
  }, [location.state]);

  // Load user and payroll data
  useEffect(() => {
    if (userId) {
      dispatch(getUserById(userId));
      dispatch(getPayrollById(userId));
    }
  }, [userId, dispatch]);

  // Load attendance data if not available from state
  useEffect(() => {
    if (userId && !attendanceData) {
      dispatch(getAllAttendance({
        page: 1,
        limit: 1000,
        employeeId: userId
      }));
    }
  }, [userId, attendanceData, dispatch]);

  // Update user when loaded
  useEffect(() => {
    if (userId && users.length > 0) {
      const foundUser = users.find(u => u._id === userId);
      if (foundUser) {
        setUser(foundUser);
      }
    }
  }, [userId, users]);

  // Update payroll data when loaded
  useEffect(() => {
    if (currentPayroll) {
      setPayrollData(currentPayroll);
    }
  }, [currentPayroll]);

  // Calculate attendance data if not provided
  useEffect(() => {
    if (user && attendance && !attendanceData) {
      const employeeAttendance = attendance.filter(record => 
        record.employeeId?._id === user._id || record.employeeId === user._id
      );
      
      if (employeeAttendance.length > 0) {
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
        
        const currentMonth = new Date().getMonth() + 1;
        const currentYear = new Date().getFullYear();
        const currentMonthAttendance = employeeAttendance.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate.getMonth() + 1 === currentMonth && recordDate.getFullYear() === currentYear;
        });
        
        setAttendanceData({
          totalDays,
          presentDays,
          absentDays,
          lateDays,
          currentMonthAttendance: currentMonthAttendance.length,
          currentMonthPresent: currentMonthAttendance.filter(record => 
            record.status === 'present' || record.status === 'approved'
          ).length,
          attendancePercentage: totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0
        });
      } else {
        setAttendanceData({
          totalDays: 0,
          presentDays: 0,
          absentDays: 0,
          lateDays: 0,
          currentMonthAttendance: 0,
          currentMonthPresent: 0,
          attendancePercentage: 0
        });
      }
    }
  }, [user, attendance, attendanceData]);

  const handleBack = () => {
    navigate('/payrolls');
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

  // Show loading state
  if (userLoading || loading || payrollLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Payslip...</h2>
          <p className="text-gray-600 mb-4">Please wait while we fetch the employee and payroll information.</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (userError || error || payrollError) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <HiXCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Payslip</h2>
          <p className="text-gray-600 mb-4">{userError || error || payrollError}</p>
          <Button onClick={handleBack} variant="primary">
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Back to Payroll
          </Button>
        </div>
      </div>
    );
  }

  // Show not found state
  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <HiUser className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Employee Not Found</h2>
          <p className="text-gray-600 mb-4">The requested employee could not be found.</p>
          <Button onClick={handleBack} variant="primary">
            <HiArrowLeft className="h-4 w-4 mr-2" />
            Back to Payroll
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto p-6">
        {/* Header */}
        <div className="mb-6 print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Employee Payslip</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                onClick={() => window.print()}
                variant="outline"
                size="sm"
                className="flex items-center space-x-2"
              >
                <HiDocument className="h-4 w-4" />
                <span>Print Payslip</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Print Header - Only visible when printing */}
        <div className="hidden print:block text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Employee Payslip</h1>
          <p className="text-sm text-gray-600">{user.firstName} {user.lastName} - {user.employeeId}</p>
        </div>

        {/* Payslip Document */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-white print:shadow-none print:border-0">
            {/* Payslip Header */}
            <div className="px-8 py-6 border-b-2 border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">HERBNAS</h2>
                  <p className="text-sm text-gray-600">MADE OF PURITY</p>
                  <p className="text-xs text-gray-500 mt-1">Employee Payslip</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Pay Period</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Generated: {new Date().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Employee Details */}
            <div className="px-8 py-6 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Employee ID:</span>
                      <span className="text-sm font-medium text-gray-900">{user.employeeId || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Name:</span>
                      <span className="text-sm font-medium text-gray-900">{user.firstName} {user.lastName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Designation:</span>
                      <span className="text-sm font-medium text-gray-900">{getRoleLabel(user.role)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Department:</span>
                      <span className="text-sm font-medium text-gray-900">{user.branch?.branchName || 'N/A'}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pay Date:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date().toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pay Period:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Status:</span>
                      <StatusBadge
                        status={user.isActive ? 'active' : 'inactive'}
                        variant={user.isActive ? 'success' : 'danger'}
                        className="text-xs"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Breakdown */}
            <div className="px-8 py-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Salary Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Earnings */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 text-green-600">Earnings</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Basic Salary</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{payrollData?.basicSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                    {attendanceData && attendanceData.attendancePercentage >= 90 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Attendance Bonus</span>
                        <span className="text-sm font-medium text-green-600">
                          ₹{((payrollData?.basicSalary || 0) * 0.04).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-800">Total Earnings</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{payrollData?.calculations?.grossSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div>
                  <h4 className="text-md font-semibold text-gray-800 mb-3 text-red-600">Deductions</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Provident Fund (PF)</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{payrollData?.deductions?.providentFund?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Professional Tax</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{payrollData?.deductions?.professionalTax?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Income Tax (TDS)</span>
                      <span className="text-sm font-medium text-gray-900">
                        ₹{payrollData?.deductions?.incomeTax?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                      </span>
                    </div>
                    {payrollData?.deductions?.otherDeductions > 0 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Other Deductions</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{payrollData.deductions.otherDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    {attendanceData && attendanceData.attendancePercentage < 80 && (
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Late Coming Deduction</span>
                        <span className="text-sm font-medium text-red-600">
                          ₹{((payrollData?.basicSalary || 0) * 0.02).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    )}
                    <div className="border-t border-gray-200 pt-2">
                      <div className="flex justify-between">
                        <span className="text-sm font-semibold text-gray-800">Total Deductions</span>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{payrollData?.calculations?.totalDeductions?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bank Details */}
            {payrollData?.bankDetails && (
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 print:py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 print:text-base">Bank Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">Bank Name</label>
                    <p className="text-sm text-gray-900 print:text-xs">{payrollData.bankDetails.bankName || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">Account Number</label>
                    <p className="text-sm text-gray-900 print:text-xs">
                      {payrollData.bankDetails.accountNumber ? 
                        `****${payrollData.bankDetails.accountNumber.slice(-4)}` : 'N/A'
                      }
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">IFSC Code</label>
                    <p className="text-sm text-gray-900 print:text-xs">{payrollData.bankDetails.ifscCode || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">Account Holder Name</label>
                    <p className="text-sm text-gray-900 print:text-xs">{payrollData.bankDetails.accountHolderName || 'N/A'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* PF Details */}
            {payrollData?.pfDetails && (
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 print:py-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 print:text-base">Provident Fund (PF) Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2 print:gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">Employee PF Number</label>
                    <p className="text-sm text-gray-900 print:text-xs">{payrollData.pfDetails.pfNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">UAN Number</label>
                    <p className="text-sm text-gray-900 print:text-xs">{payrollData.pfDetails.uanNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">PF Account Number</label>
                    <p className="text-sm text-gray-900 print:text-xs">{payrollData.pfDetails.pfAccountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 print:text-xs">PF Status</label>
                    <p className="text-sm text-gray-900 print:text-xs">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 print:bg-transparent print:text-green-800 print:px-0 print:py-0">
                        Active
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-3">
                  <div className="p-4 bg-blue-50 rounded-lg print:p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 print:text-xs">Employee PF Contribution</h4>
                        <p className="text-xs text-gray-600 print:text-xs">12% of basic salary</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600 print:text-sm">
                          ₹{payrollData?.deductions?.providentFund?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg print:p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-sm font-semibold text-gray-800 print:text-xs">Employer PF Contribution</h4>
                        <p className="text-xs text-gray-600 print:text-xs">12% of basic salary</p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600 print:text-sm">
                          ₹{payrollData?.deductions?.providentFund?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-yellow-50 rounded-lg print:p-3">
                  <div className="text-center">
                    <h4 className="text-sm font-semibold text-gray-800 print:text-xs">Total PF Contribution</h4>
                    <div className="text-2xl font-bold text-yellow-600 mt-1 print:text-lg">
                      ₹{((payrollData?.deductions?.providentFund || 0) * 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 print:text-xs">Employee + Employer (24% of basic salary)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Attendance Summary */}
            {attendanceData && (
              <div className="px-8 py-6 border-t border-gray-200 bg-gray-50 print:hidden">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Summary</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{attendanceData.presentDays}</div>
                    <div className="text-xs text-gray-600">Present Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{attendanceData.absentDays}</div>
                    <div className="text-xs text-gray-600">Absent Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600">{attendanceData.totalDays}</div>
                    <div className="text-xs text-gray-600">Total Days</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{attendanceData.attendancePercentage}%</div>
                    <div className="text-xs text-gray-600">Attendance %</div>
                  </div>
                </div>
              </div>
            )}

            {/* Net Pay */}
            <div className="px-8 py-6 border-t-2 border-gray-200 bg-blue-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Net Pay</h3>
                  <p className="text-sm text-gray-600">Amount payable to employee</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-blue-600">
                    ₹{payrollData?.calculations?.netSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                  </div>
                  <p className="text-sm text-gray-600">
                    {attendanceData && attendanceData.attendancePercentage >= 90 ? 'Including attendance bonus' : 'After all deductions'}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                This is a computer-generated payslip. No signature required.
              </p>
              <p className="text-xs text-gray-500 mt-1">
                For queries, contact HR Department | Email: hr@herbnas.com | Phone: +91-1234567890
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PayrollDetailsPage;
