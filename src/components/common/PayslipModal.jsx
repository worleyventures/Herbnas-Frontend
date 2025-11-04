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
import { getPayrollById, getAllPayrolls } from '../../redux/actions/payrollActions';
import { selectCurrentUser } from '../../redux/slices/userSlice';
import api from '../../lib/axiosInstance';

const PayslipModal = ({ isOpen, onClose, userId, attendanceData: initialAttendanceData, initialPayrollData }) => {
  const dispatch = useDispatch();
  const { users, loading: userLoading, error: userError } = useSelector(state => state.user || {});
  const currentUser = useSelector(selectCurrentUser);
  const { allAttendance: attendance, loading: attendanceLoading } = useSelector(state => state.attendance || {});
  const { currentPayroll, loading: payrollLoading, error: payrollError } = useSelector(state => state.payroll || {});
  
  const [user, setUser] = useState(null);
  const [attendanceData, setAttendanceData] = useState(initialAttendanceData || null);
  const [payrollData, setPayrollData] = useState(initialPayrollData || null);

  // Calculate previous month from current date
  const getPreviousMonth = () => {
    const now = new Date();
    let prevMonth = now.getMonth(); // 0-11 (current month)
    let prevYear = now.getFullYear();
    
    // Calculate previous month
    if (prevMonth === 0) {
      // If current month is January (0), previous month is December (11) of previous year
      prevMonth = 11;
      prevYear -= 1;
    } else {
      prevMonth -= 1; // Otherwise, just subtract 1
    }
    
    return {
      month: prevMonth, // 0-11 format for Date constructor
      year: prevYear,
      monthNumber: prevMonth + 1 // 1-12 format for API
    };
  };

  // Load user and payroll data when modal opens
  useEffect(() => {
    if (isOpen && userId) {
      dispatch(getUserById(userId));
      
      // Always fetch and recalculate payroll for previous month based on attendance
      const previousMonth = getPreviousMonth();
      
      const fetchAndRecalculatePayroll = async () => {
        try {
          // Get user info first to get employeeId
          const userInfo = await api.get(`/users/${userId}`).catch(() => null);
          const userEmployeeId = userInfo?.data?.data?.user?.employeeId || userId;
          const userEmail = userInfo?.data?.data?.user?.email;
          
          // Calculate total days in month first
          const date = new Date(previousMonth.year, previousMonth.monthNumber, 0);
          let totalDaysInMonth = date.getDate();
          
          // Fetch attendance for previous month - try both userId and employeeId
          let attendanceResponse = null;
          let presentDays = 0;
          
          // Try fetching with userId first
          try {
            attendanceResponse = await api.get('/attendance', {
              params: {
                page: 1,
                limit: 1000,
                employeeId: userId,
                month: previousMonth.monthNumber,
                year: previousMonth.year
              }
            });
          } catch (error) {
            // If that fails, try with employeeId string
            try {
              attendanceResponse = await api.get('/attendance', {
                params: {
                  page: 1,
                  limit: 1000,
                  employeeId: userEmployeeId,
                  month: previousMonth.monthNumber,
                  year: previousMonth.year
                }
              });
            } catch (err) {
              console.error('Failed to fetch attendance:', err);
            }
          }
          
          // Calculate presentDays from attendance
          if (attendanceResponse?.data?.success && attendanceResponse.data.data?.attendance) {
            const monthAttendance = attendanceResponse.data.data.attendance;
            // Filter for present/approved status
            presentDays = monthAttendance.filter(record => {
              const status = record.status?.toLowerCase();
              return status === 'present' || status === 'approved';
            }).length;
            
            console.log('Attendance data:', {
              totalRecords: monthAttendance.length,
              presentDays,
              month: previousMonth.monthNumber,
              year: previousMonth.year,
              totalDaysInMonth,
              records: monthAttendance.map(r => ({
                date: r.date,
                status: r.status,
                employeeId: r.employeeId?._id || r.employeeId
              }))
            });
          } else {
            console.log('No attendance data found:', {
              success: attendanceResponse?.data?.success,
              hasData: !!attendanceResponse?.data?.data,
              hasAttendance: !!attendanceResponse?.data?.data?.attendance,
              response: attendanceResponse?.data
            });
          }
          
          // Fetch payroll for previous month (or use initial data if provided)
          let payrollToUse = null;
          
          if (initialPayrollData) {
            payrollToUse = { ...initialPayrollData };
          } else {
            // Fetch payroll for previous month
            const response = await api.get('/payrolls', {
              params: {
                page: 1,
                limit: 1000,
                month: previousMonth.monthNumber,
                year: previousMonth.year
              }
            });
            
            if (response.data?.success && response.data?.data?.users) {
              // Find payroll for this employee
              const employeePayroll = response.data.data.users.find(user => {
                return user._id === userId || 
                       user.employeeId === userEmployeeId ||
                       user.employeeId === userId ||
                       user.email === userEmail ||
                       user.email === userId;
              });
              
              if (employeePayroll?.payrollData) {
                payrollToUse = { ...employeePayroll.payrollData };
              }
            }
          }
          
          // If no payroll found, try getPayrollById
          if (!payrollToUse) {
            try {
              const payrollResponse = await dispatch(getPayrollById(userId)).unwrap();
              if (payrollResponse?.data?.payroll) {
                payrollToUse = payrollResponse.data.payroll;
              }
            } catch (error) {
              console.error('Failed to fetch payroll:', error);
            }
          }
          
          // Always recalculate based on attendance if we have payroll data
          if (payrollToUse) {
            const basicSalary = payrollToUse.basicSalary || 0;
            
            // Calculate prorated salary based on presentDays
            let proratedBasicSalary = 0;
            if (presentDays > 0 && totalDaysInMonth > 0 && basicSalary > 0) {
              proratedBasicSalary = (presentDays / totalDaysInMonth) * basicSalary;
            } else if (presentDays === 0) {
              proratedBasicSalary = 0;
            } else {
              // If no attendance data, use existing grossSalary or basicSalary
              proratedBasicSalary = payrollToUse.calculations?.grossSalary || basicSalary;
            }
            
            // Calculate prorated deductions
            const deductionPercentage = basicSalary > 0 ? proratedBasicSalary / basicSalary : 0;
            const deductions = payrollToUse.deductions || {};
            const totalDeductions = 
              (deductions.providentFund || 0) * deductionPercentage +
              (deductions.professionalTax || 0) * deductionPercentage +
              (deductions.incomeTax || 0) * deductionPercentage +
              (deductions.otherDeductions || 0) * deductionPercentage;
            
            // Update payroll with recalculated values
            payrollToUse.attendance = {
              ...payrollToUse.attendance,
              presentDays: presentDays,
              totalDays: totalDaysInMonth
            };
            
            payrollToUse.calculations = {
              ...payrollToUse.calculations,
              grossSalary: proratedBasicSalary,
              totalDeductions: totalDeductions,
              netSalary: Math.max(0, proratedBasicSalary - totalDeductions)
            };
            
            console.log('Recalculated payroll:', {
              basicSalary,
              presentDays,
              totalDaysInMonth,
              proratedBasicSalary,
              totalDeductions,
              netSalary: payrollToUse.calculations.netSalary
            });
            
            // Update the payroll record in the database if it exists
            if (payrollToUse._id) {
              try {
                await api.put(`/payrolls/${payrollToUse._id}`, {
                  attendance: payrollToUse.attendance
                });
              } catch (error) {
                console.error('Failed to update payroll attendance:', error);
              }
            }
            
            setPayrollData(payrollToUse);
          } else {
            console.log('No payroll data found for user:', userId);
          }
        } catch (error) {
          console.error('Failed to fetch and recalculate payroll:', error);
        }
      };
      
      fetchAndRecalculatePayroll();
      
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

  // Update payroll data when loaded - but don't override if we've already recalculated
  useEffect(() => {
    // Only update if payrollData is null/undefined (not already set by recalculation)
    if (!payrollData) {
      if (initialPayrollData) {
        setPayrollData(initialPayrollData);
      } else if (currentPayroll) {
        // currentPayroll from Redux is the raw payroll object from getPayrollById
        // It should have all fields directly: basicSalary, deductions, calculations, payment, etc.
        setPayrollData(currentPayroll);
      } else if (user && user.payrollData) {
        setPayrollData(user.payrollData);
      }
    }
  }, [currentPayroll, initialPayrollData, user, payrollData]);

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

  // Helper function to get payroll data - handles both direct and nested structures
  const getPayrollValue = (path) => {
    if (!payrollData) return null;
    // Try direct path first
    let value = payrollData;
    for (const key of path.split('.')) {
      value = value?.[key];
      if (value === undefined || value === null) break;
    }
    // If not found, try nested payrollData path
    if ((value === undefined || value === null) && payrollData.payrollData) {
      value = payrollData.payrollData;
      for (const key of path.split('.')) {
        value = value?.[key];
        if (value === undefined || value === null) break;
      }
    }
    return value;
  };

  // Get pay period from payroll data or use previous month
  const getPayPeriod = () => {
    const payPeriod = payrollData?.payPeriod || payrollData?.payrollData?.payPeriod;
    if (payPeriod?.month && payPeriod?.year) {
      const month = payPeriod.month;
      const year = payPeriod.year;
      const date = new Date(year, month - 1, 1); // month is 1-indexed, Date uses 0-indexed
      return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    }
    // Fallback to previous month
    const previousMonth = getPreviousMonth();
    const date = new Date(previousMonth.year, previousMonth.month, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Calculate pay date as 5th of next month after pay period
  const getPayDate = () => {
    let payPeriodMonth, payPeriodYear;
    
    const payPeriod = payrollData?.payPeriod || payrollData?.payrollData?.payPeriod;
    if (payPeriod?.month && payPeriod?.year) {
      payPeriodMonth = payPeriod.month;
      payPeriodYear = payPeriod.year;
    } else {
      // Fallback to previous month (current month - 1)
      const previousMonth = getPreviousMonth();
      payPeriodMonth = previousMonth.monthNumber;
      payPeriodYear = previousMonth.year;
    }
    
    // Calculate pay date: 5th of current month (since pay period is previous month)
    const now = new Date();
    const currentMonth = now.getMonth() + 1; // 1-12
    const currentYear = now.getFullYear();
    
    // Pay date is always 5th of current month for previous month's payslip
    const payDate = new Date(currentYear, currentMonth - 1, 5);
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
            <div className="print:shadow-none print:border-0">
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
                        <span className="text-sm text-gray-600">Basic Salary (Monthly)</span>
                        <span className="text-sm font-medium text-gray-900">
                          ₹{(getPayrollValue('basicSalary') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>
                          {(() => {
                            const presentDays = getPayrollValue('attendance.presentDays') || 0;
                            const totalDays = getPayrollValue('attendance.totalDays') || 
                              (payrollData?.payPeriod?.month && payrollData?.payPeriod?.year ? 
                                new Date(payrollData.payPeriod.year, payrollData.payPeriod.month, 0).getDate() : 31);
                            return presentDays > 0 ? `Based on ${presentDays} days worked out of ${totalDays} days` : '';
                          })()}
                        </span>
                      </div>
                      <div className="border-t border-gray-200 pt-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-semibold text-gray-800">Total Earnings (Prorated)</span>
                          <span className="text-sm font-semibold text-gray-900">
                            ₹{(getPayrollValue('calculations.grossSalary') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Deductions - Always show */}
                  <div>
                    <h4 className="text-md font-semibold text-gray-800 mb-3 text-red-600">Deductions</h4>
                    <div className="space-y-2">
                      {(() => {
                        // Calculate prorated deductions
                        const basicSalary = getPayrollValue('basicSalary') || 0;
                        const grossSalary = getPayrollValue('calculations.grossSalary') || 0;
                        const deductionPercentage = basicSalary > 0 ? grossSalary / basicSalary : 0;
                        const deductions = {
                          providentFund: (getPayrollValue('deductions.providentFund') || 0) * deductionPercentage,
                          professionalTax: (getPayrollValue('deductions.professionalTax') || 0) * deductionPercentage,
                          incomeTax: (getPayrollValue('deductions.incomeTax') || 0) * deductionPercentage,
                          otherDeductions: (getPayrollValue('deductions.otherDeductions') || 0) * deductionPercentage
                        };
                        return (
                          <>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Provident Fund (PF)</span>
                              <span className="text-sm font-medium text-gray-900">
                                ₹{deductions.providentFund.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Professional Tax</span>
                              <span className="text-sm font-medium text-gray-900">
                                ₹{deductions.professionalTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Income Tax (TDS)</span>
                              <span className="text-sm font-medium text-gray-900">
                                ₹{deductions.incomeTax.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-gray-600">Other Deductions</span>
                              <span className="text-sm font-medium text-gray-900">
                                ₹{deductions.otherDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="border-t border-gray-200 pt-2">
                              <div className="flex justify-between">
                                <span className="text-sm font-semibold text-gray-800">Total Deductions</span>
                                <span className="text-sm font-semibold text-gray-900">
                                  ₹{(getPayrollValue('calculations.totalDeductions') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                </span>
                              </div>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Net Pay */}
              <div className="px-8 py-6 border-t-2 border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Net Pay</h3>
                    <p className="text-sm text-gray-600">Amount payable to employee</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-blue-600">
                      ₹{(getPayrollValue('calculations.netSalary') || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
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

