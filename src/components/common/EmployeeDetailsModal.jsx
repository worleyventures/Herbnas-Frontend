import React from 'react';
import {
  HiUser,
  HiBuildingOffice,
  HiCalendar,
  HiCurrencyDollar,
  HiPhone,
  HiEnvelope,
  HiIdentification
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import Button from './Button';

const EmployeeDetailsModal = ({ 
  isOpen, 
  onClose, 
  employee, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !employee) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'N/A';
    }
  };

  const getRoleLabel = (role) => {
    if (!role) return 'N/A';
    return role.replace(/_/g, ' ').split(' ').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Employee ID',
        value: employee.employeeId || 'N/A'
      },
      {
        label: 'Full Name',
        value: `${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'N/A'
      },
      {
        label: 'Email',
        value: employee.email || 'N/A'
      },
      {
        label: 'Phone',
        value: employee.phone || 'N/A'
      },
      {
        label: 'Designation',
        value: getRoleLabel(employee.role)
      },
      {
        label: 'Status',
        value: employee.isActive ? 'Active' : 'Inactive',
        type: 'status'
      }
    ]
  };

  const branchInfo = {
    title: 'Branch Information',
    fields: [
      {
        label: 'Branch Name',
        value: employee.branch?.branchName || 'N/A'
      },
      {
        label: 'Branch Code',
        value: employee.branch?.branchCode || 'N/A'
      },
      {
        label: 'Branch Address',
        value: employee.branch?.address || 'N/A'
      }
    ]
  };

  const payrollInfo = {
    title: 'Payroll Information',
    fields: [
      {
        label: 'Payroll ID',
        value: employee.payrollData?.payrollId || 'N/A'
      },
      {
        label: 'Pay Period',
        value: employee.payrollData?.payPeriod ? 
          `${new Date(employee.payrollData.payPeriod.year, employee.payrollData.payPeriod.month - 1, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}` : 
          'N/A'
      },
      {
        label: 'Basic Salary',
        value: employee.payrollData?.basicSalary !== undefined && employee.payrollData?.basicSalary !== null ? 
          `₹${employee.payrollData.basicSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 
          'N/A'
      },
      {
        label: 'Allowances',
        value: employee.payrollData?.allowances !== undefined && employee.payrollData?.allowances !== null ? 
          `₹${employee.payrollData.allowances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 
          '₹0.00'
      },
      {
        label: 'Gross Salary',
        value: employee.payrollData?.calculations?.grossSalary ? 
          `₹${employee.payrollData.calculations.grossSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 
          'N/A'
      },
      {
        label: 'Net Salary',
        value: employee.payrollData?.calculations?.netSalary ? 
          `₹${employee.payrollData.calculations.netSalary.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 
          'N/A',
        type: 'price'
      },
      {
        label: 'Status',
        value: employee.payrollData?.status ? 
          employee.payrollData.status.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : 
          'N/A',
        type: 'status'
      }
    ]
  };

  const deductionsInfo = employee.payrollData ? {
    title: 'Deductions Details',
    fields: [
      {
        label: 'Provident Fund (PF)',
        value: employee.payrollData.deductions?.providentFund !== undefined && employee.payrollData.deductions?.providentFund !== null ?
          `₹${employee.payrollData.deductions.providentFund.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` :
          '₹0.00'
      },
      {
        label: 'ESI',
        value: employee.payrollData.deductions?.esi !== undefined && employee.payrollData.deductions?.esi !== null ?
          `₹${employee.payrollData.deductions.esi.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` :
          '₹0.00'
      },
      {
        label: 'Other Deductions',
        value: employee.payrollData.deductions?.otherDeductions !== undefined && employee.payrollData.deductions?.otherDeductions !== null ?
          `₹${employee.payrollData.deductions.otherDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` :
          '₹0.00'
      },
      {
        label: 'Total Deductions',
        value: employee.payrollData?.calculations?.totalDeductions !== undefined && employee.payrollData?.calculations?.totalDeductions !== null ? 
          `₹${employee.payrollData.calculations.totalDeductions.toLocaleString('en-IN', { minimumFractionDigits: 2 })}` : 
          '₹0.00'
      }
    ]
  } : null;

  const attendanceInfo = employee.payrollData ? {
    title: 'Attendance Information',
    fields: [
      {
        label: 'Present Days',
        value: employee.payrollData.attendance?.presentDays !== undefined && employee.payrollData.attendance?.presentDays !== null ?
          `${employee.payrollData.attendance.presentDays}` :
          '0'
      },
      {
        label: 'Absent Days',
        value: employee.payrollData.attendance?.absentDays !== undefined && employee.payrollData.attendance?.absentDays !== null ?
          `${employee.payrollData.attendance.absentDays}` :
          '0'
      },
      {
        label: 'Total Days',
        value: employee.payrollData.attendance?.totalDays !== undefined && employee.payrollData.attendance?.totalDays !== null ?
          `${employee.payrollData.attendance.totalDays}` :
          '0'
      },
      {
        label: 'Overtime Hours',
        value: employee.payrollData.attendance?.overtimeHours !== undefined && employee.payrollData.attendance?.overtimeHours !== null ?
          `${employee.payrollData.attendance.overtimeHours}` :
          '0'
      }
    ]
  } : null;

  const paymentInfo = employee.payrollData ? {
    title: 'Payment Information',
    fields: [
      {
        label: 'Payment Status',
        value: employee.payrollData.payment?.status ? 
          employee.payrollData.payment.status.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : 
          'Pending',
        type: 'status'
      },
      {
        label: 'Payment Date',
        value: employee.payrollData.payment?.paymentDate ? formatDate(employee.payrollData.payment.paymentDate) : 'N/A'
      },
      {
        label: 'Payment Method',
        value: employee.payrollData.payment?.paymentMethod ? 
          employee.payrollData.payment.paymentMethod.replace(/_/g, ' ').split(' ').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' ') : 
          'Bank Transfer'
      },
      {
        label: 'Transaction ID',
        value: employee.payrollData.payment?.transactionId || 'N/A'
      },
      {
        label: 'Remarks',
        value: employee.payrollData.payment?.remarks || 'N/A'
      }
    ]
  } : null;

  const addressInfo = (employee.payrollData?.address || employee.address) ? {
    title: 'Address Information',
    fields: (() => {
      const address = employee.payrollData?.address || employee.address;
      if (typeof address === 'string') {
        return [
          {
            label: 'Full Address',
            value: address
          }
        ];
      } else {
        return [
          {
            label: 'Street',
            value: address.street || 'N/A'
          },
          {
            label: 'City',
            value: address.city || 'N/A'
          },
          {
            label: 'State',
            value: address.state || 'N/A'
          },
          {
            label: 'PIN Code',
            value: address.pinCode || 'N/A'
          },
          {
            label: 'Country',
            value: address.country || 'N/A'
          }
        ];
      }
    })()
  } : null;

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Date of Birth',
        value: employee.payrollData?.dateOfBirth ? formatDate(employee.payrollData.dateOfBirth) : 
               employee.dateOfBirth ? formatDate(employee.dateOfBirth) : 'N/A'
      },
      {
        label: 'Created Date',
        value: formatDate(employee.createdAt)
      },
      {
        label: 'Last Updated',
        value: formatDate(employee.updatedAt)
      }
    ]
  };

  const bankInfo = employee.payrollData?.bankDetails ? {
    title: 'Bank Information',
    fields: [
      {
        label: 'Bank Name',
        value: employee.payrollData.bankDetails.bankName || 'N/A'
      },
      {
        label: 'Account Number',
        value: employee.payrollData.bankDetails.accountNumber ? 
          `****${employee.payrollData.bankDetails.accountNumber.slice(-4)}` : 
          'N/A'
      },
      {
        label: 'IFSC Code',
        value: employee.payrollData.bankDetails.ifscCode || 'N/A'
      },
      {
        label: 'Account Holder',
        value: employee.payrollData.bankDetails.accountHolderName || 'N/A'
      }
    ]
  } : null;

  const pfInfo = employee.payrollData?.pfDetails ? {
    title: 'PF Information',
    fields: [
      {
        label: 'PF Number',
        value: employee.payrollData.pfDetails.pfNumber || 'N/A'
      },
      {
        label: 'UAN Number',
        value: employee.payrollData.pfDetails.uanNumber || employee.payrollData.pfDetails.uan || 'N/A'
      },
      {
        label: 'PF Account Number',
        value: employee.payrollData.pfDetails.pfAccountNumber || 'N/A'
      }
    ]
  } : null;

  const panInfo = employee.payrollData?.panDetails ? {
    title: 'PAN & Aadhar Information',
    fields: [
      {
        label: 'PAN Number',
        value: employee.payrollData.panDetails.panNumber || 'N/A'
      },
      {
        label: 'Aadhar Number',
        value: employee.payrollData.panDetails.aadharNumber ? 
          `****${employee.payrollData.panDetails.aadharNumber.slice(-4)}` : 
          'N/A'
      }
    ]
  } : null;

  const sections = [
    basicInfo,
    branchInfo,
    ...(employee.payrollData ? [payrollInfo] : []),
    ...(deductionsInfo ? [deductionsInfo] : []),
    ...(attendanceInfo ? [attendanceInfo] : []),
    ...(paymentInfo ? [paymentInfo] : []),
    ...(addressInfo ? [addressInfo] : []),
    ...(bankInfo ? [bankInfo] : []),
    ...(pfInfo ? [pfInfo] : []),
    ...(panInfo ? [panInfo] : []),
    additionalInfo
  ];

  const footerContent = (
    <div className="flex space-x-2">
      <Button
        onClick={onClose}
        variant="outline"
        className="px-4 py-2"
      >
        Close
      </Button>
      {onEdit && (
        <Button
          onClick={() => {
            onEdit(employee);
            onClose();
          }}
          variant="primary"
          className="px-4 py-2"
        >
          Edit Employee
        </Button>
      )}
      {onDelete && (
        <Button
          onClick={() => {
            onDelete(employee);
            onClose();
          }}
          variant="danger"
          className="px-4 py-2"
        >
          Delete Employee
        </Button>
      )}
    </div>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Employee Details"
      subtitle={`${employee.firstName || ''} ${employee.lastName || ''}`.trim() || 'Employee Information'}
      size="xl"
      showFooter={true}
      footerContent={footerContent}
      icon={HiUser}
      iconColor="from-blue-500 to-blue-600"
    >
      <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sections.map((section, index) => (
            <div key={index}>
              <DetailsView sections={[section]} />
            </div>
          ))}
        </div>
      </div>
    </CommonModal>
  );
};

export default EmployeeDetailsModal;

