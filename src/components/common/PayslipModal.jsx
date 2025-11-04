import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiUser,
  HiDocument,
  HiXMark,
  HiCurrencyDollar
} from 'react-icons/hi2';
import { Button, Loading, CommonModal } from './index';
import { getUserById } from '../../redux/actions/userActions';
import { getAllAttendance } from '../../redux/actions/attendanceActions';
import { getPayrollById } from '../../redux/actions/payrollActions';
import { selectCurrentUser } from '../../redux/slices/userSlice';

const PayslipModal = ({ isOpen, onClose, userId, attendanceData: initialAttendanceData, initialPayrollData }) => {
  const dispatch = useDispatch();
  const { users, loading: userLoading, error: userError } = useSelector(state => state.user || {});
  const currentUser = useSelector(selectCurrentUser);
  const { allAttendance: attendance, loading: attendanceLoading } = useSelector(state => state.attendance || {});
  const { currentPayroll, loading: payrollLoading, error: payrollError } = useSelector(state => state.payroll || {});
  
  const [user, setUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState(initialAttendanceData || null);
  const [payrollData, setPayrollData] = useState(initialPayrollData || null);

  // Load user and payroll data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      dispatch(getUserById(userId));
      // Only fetch payroll if not already provided
      if (!initialPayrollData) {
        dispatch(getPayrollById(userId));
      }
      if (!initialAttendanceData) {
        dispatch(getAllAttendance({
          page: 1,
          limit: 1000,
          employeeId: userId
        }));
      }
    }
  }, [isOpen, userId, dispatch, initialAttendanceData, initialPayrollData]);

  // Update user when loaded
  useEffect(() => {
    // First check currentUser (from getUserById)
    if (userId && currentUser && currentUser._id === userId) {
      setUser(currentUser);
    } else if (userId && users.length > 0) {
      // Otherwise check users array
      const foundUser = users.find(u => u._id === userId);
      if (foundUser) {
        setUser(foundUser);
        // If user has payrollData, use it
        if (foundUser.payrollData && !payrollData) {
          setPayrollData(foundUser.payrollData);
        }
      }
    }
  }, [userId, users, currentUser, payrollData]);

  // Update payroll data when loaded
  useEffect(() => {
    // Use initial payroll data if provided, otherwise use currentPayroll from Redux
    if (initialPayrollData) {
      setPayrollData(initialPayrollData);
    } else if (currentPayroll) {
      setPayrollData(currentPayroll);
    }
  }, [currentPayroll, initialPayrollData]);

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

  const getRoleLabel = (role) => {
    const labels = {
      super_admin: 'Super Admin',
      admin: 'Admin',
      manager: 'Manager',
      employee: 'Employee',
      sales_executive: 'Sales Executive',
      supervisor: 'Supervisor',
      production_manager: 'Production Manager',
      accounts_manager: 'Accounts Manager'
    };
    return labels[role] || role?.replace('_', ' ').toUpperCase() || 'N/A';
  };

  // Get pay period from payroll data or use current month
  const getPayPeriod = () => {
    if (payrollData?.payPeriod?.month && payrollData?.payPeriod?.year) {
      const month = payrollData.payPeriod.month;
      const year = payrollData.payPeriod.year;
      const date = new Date(year, month - 1, 1); // month is 1-indexed, Date uses 0-indexed
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    // Fallback to current month
    return new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Calculate pay date as 5th of next month after pay period
  const getPayDate = () => {
    let payPeriodMonth, payPeriodYear;
    
    if (payrollData?.payPeriod?.month && payrollData?.payPeriod?.year) {
      payPeriodMonth = payrollData.payPeriod.month;
      payPeriodYear = payrollData.payPeriod.year;
    } else {
      // Fallback to current month
      const now = new Date();
      payPeriodMonth = now.getMonth() + 1; // getMonth() returns 0-11
      payPeriodYear = now.getFullYear();
    }
    
    // Calculate next month
    let nextMonth = payPeriodMonth + 1;
    let nextYear = payPeriodYear;
    
    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }
    
    // Return 5th of next month
    const payDate = new Date(nextYear, nextMonth - 1, 5);
    return payDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
  };

  const loading = userLoading || payrollLoading || attendanceLoading;
  const error = userError || payrollError;

  if (!isOpen) return null;

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Payslip"
      size="2xl"
      className="max-h-[90vh]"
    >
      <div className="overflow-y-auto max-h-[calc(90vh-120px)] -mx-4 px-4 py-2">
        {loading ? (
          <div className="flex justify-center items-center py-8">
            <Loading />
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Payslip</h3>
            <p className="text-gray-600">{error}</p>
          </div>
        ) : !user ? (
          <div className="text-center py-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Employee Not Found</h3>
            <p className="text-gray-600">The requested employee could not be found.</p>
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Print Button */}
            <div className="flex justify-end print:hidden">
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

            {/* Payslip Document */}
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
                      {getPayPeriod()}
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
                          {getPayDate()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Pay Period:</span>
                        <span className="text-sm font-medium text-gray-900">
                          {getPayPeriod()}
                        </span>
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
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-gray-800">Total Earnings</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{payrollData?.calculations?.grossSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || payrollData?.basicSalary?.toLocaleString('en-IN', { minimumFractionDigits: 2 }) || '0.00'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deductions - Only show if there are any deductions */}
                  {(payrollData?.deductions?.providentFund > 0 || 
                    payrollData?.deductions?.professionalTax > 0 || 
                    payrollData?.deductions?.incomeTax > 0 || 
                    payrollData?.deductions?.otherDeductions > 0 ||
                    (payrollData?.calculations?.totalDeductions > 0)) && (
                    <div>
                      <h4 className="text-md font-semibold text-gray-800 mb-3 text-red-600">Deductions</h4>
                      <div className="space-y-2">
                        {payrollData?.deductions?.providentFund > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Provident Fund (PF)</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₹{payrollData.deductions.providentFund.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {payrollData?.deductions?.professionalTax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Professional Tax</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₹{payrollData.deductions.professionalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {payrollData?.deductions?.incomeTax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Income Tax (TDS)</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₹{payrollData.deductions.incomeTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        )}
                        {payrollData?.deductions?.otherDeductions > 0 && (
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Other Deductions</span>
                            <span className="text-sm font-medium text-gray-900">
                              ₹{payrollData.deductions.otherDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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
                  )}
                </div>
              </div>

              {/* Bank Details */}
              {payrollData?.bankDetails && (
                <div className="px-8 py-6 border-t border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bank Details</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="text-sm font-medium text-gray-500">Bank Name</label>
                      <p className="text-sm text-gray-900">{payrollData.bankDetails.bankName || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Number</label>
                      <p className="text-sm text-gray-900">
                        {payrollData.bankDetails.accountNumber ? 
                          `****${payrollData.bankDetails.accountNumber.slice(-4)}` : 'N/A'
                        }
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                      <p className="text-sm text-gray-900">{payrollData.bankDetails.ifscCode || 'N/A'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-500">Account Holder Name</label>
                      <p className="text-sm text-gray-900">{payrollData.bankDetails.accountHolderName || 'N/A'}</p>
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
                      After all deductions
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
        )}
      </div>
    </CommonModal>
  );
};

export default PayslipModal;

