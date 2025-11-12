import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiUser,
  HiBuildingOffice,
  HiCalendar,
  HiCurrencyDollar,
  HiClock,
  HiCheckCircle,
  HiXMark,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import { Button, StatusBadge, Loading, CommonModal } from './index';
import { getPayrollById, deletePayroll, approvePayroll, rejectPayroll } from '../../redux/actions/payrollActions';
import { selectCurrentPayroll, selectPayrollLoading } from '../../redux/slices/payrollSlice';
import { addNotification } from '../../redux/slices/uiSlice';

const PayrollDetailsModal = ({ isOpen, onClose, payrollId, onEdit, onDelete }) => {
  const dispatch = useDispatch();
  const currentPayroll = useSelector(selectCurrentPayroll);
  const loading = useSelector(selectPayrollLoading);

  useEffect(() => {
    if (isOpen && payrollId) {
      dispatch(getPayrollById(payrollId));
    }
  }, [dispatch, isOpen, payrollId]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this payroll?')) {
      try {
        await dispatch(deletePayroll(payrollId)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Payroll deleted successfully'
        }));
        onClose();
        if (onDelete) onDelete();
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to delete payroll'
        }));
      }
    }
  };

  const handleApprove = async () => {
    try {
      await dispatch(approvePayroll(payrollId)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Payroll approved successfully'
      }));
      dispatch(getPayrollById(payrollId));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to approve payroll'
      }));
    }
  };

  const handleReject = async () => {
    try {
      await dispatch(rejectPayroll(payrollId)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Payroll rejected successfully'
      }));
      dispatch(getPayrollById(payrollId));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: 'Failed to reject payroll'
      }));
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'gray';
      case 'pending_approval': return 'yellow';
      case 'approved': return 'green';
      case 'rejected': return 'red';
      default: return 'gray';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processed': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title={`Payroll Details - ${currentPayroll?.payrollId || ''}`}
      size="lg"
    >
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <Loading />
        </div>
      ) : !currentPayroll ? (
        <div className="text-center py-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Payroll Not Found</h3>
          <p className="text-gray-600">The payroll you're looking for doesn't exist.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Actions */}
          <div className="flex justify-end items-center border-b pb-4">
            <div className="flex space-x-1">
              {currentPayroll.status === 'pending_approval' && (
                <>
                  <Button
                    onClick={handleApprove}
                    size="xs"
                    className="bg-green-600 hover:bg-green-700 text-xs px-2 py-1"
                  >
                    <HiCheckCircle className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    onClick={handleReject}
                    size="xs"
                    variant="outline"
                    className="text-red-600 border-red-600 hover:bg-red-50 text-xs px-2 py-1"
                  >
                    <HiXMark className="w-3 h-3 mr-1" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent flex items-center">
                <HiUser className="w-4 h-4 mr-2 text-[#8bc34a]" />
                Employee Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee Name</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.employeeName}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Employee ID</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.employeeId}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Designation</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.designation}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Branch</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.branchId?.branchName}</p>
                </div>
              </div>
            </div>

            {/* Pay Period & Status */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent flex items-center">
                <HiCalendar className="w-4 h-4 mr-2 text-[#8bc34a]" />
                Pay Period & Status
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Pay Period</label>
                  <p className="text-gray-900 font-medium">
                    {currentPayroll.payPeriod?.month}/{currentPayroll.payPeriod?.year}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Status</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={currentPayroll.status}
                      color={getStatusColor(currentPayroll.status)}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={currentPayroll.payment?.status}
                      color={getPaymentStatusColor(currentPayroll.payment?.status)}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Salary Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent flex items-center">
                <HiCurrencyDollar className="w-4 h-4 mr-2 text-[#8bc34a]" />
                Salary Information
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Basic Salary</label>
                  <p className="text-gray-900 font-medium">₹{currentPayroll.basicSalary?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Allowances</label>
                  <p className="text-gray-900 font-medium">₹{currentPayroll.calculations?.totalAllowances?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Deductions</label>
                  <p className="text-gray-900 font-medium">₹{currentPayroll.calculations?.totalDeductions?.toLocaleString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Net Salary</label>
                  <p className="text-lg font-bold text-green-600">
                    ₹{currentPayroll.calculations?.netSalary?.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Bank Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent">Bank Details</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Bank Name</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.bankDetails?.bankName || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Account Number</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.bankDetails?.accountNumber || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">IFSC Code</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.bankDetails?.ifscCode || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* Attendance Details */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent flex items-center">
                <HiClock className="w-4 h-4 mr-2 text-[#8bc34a]" />
                Attendance Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Days</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.attendance?.totalDays}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Present Days</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.attendance?.presentDays}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Absent Days</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.attendance?.absentDays}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Overtime Hours</label>
                  <p className="text-gray-900 font-medium">{currentPayroll.attendance?.overtimeHours}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      )}
    </CommonModal>
  );
};

export default PayrollDetailsModal;
