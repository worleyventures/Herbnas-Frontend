import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiBanknotes, HiClock, HiPlus, HiDocumentArrowUp, HiArrowDownTray, HiCurrencyDollar } from 'react-icons/hi2';
import { Button, CommonModal } from '../../components/common';
import { addNotification } from '../../redux/slices/uiSlice';
import { uploadAttendanceExcel } from '../../redux/actions/attendanceActions';
import PayrollTab from './PayrollTab';
import AttendanceTab from './AttendanceTab';
import UsersPage from '../users/UsersPage';
import api from '../../lib/axiosInstance';
import * as XLSX from 'xlsx';

const PayrollPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'employees'); // Default to employees tab
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [attendanceRefreshTrigger, setAttendanceRefreshTrigger] = useState(0);

  const tabs = [
    {
      id: 'employees',
      name: 'Employees',
      icon: HiBanknotes,
      component: <PayrollTab showUsers={true} />
    },
    {
      id: 'payroll',
      name: 'Payroll',
      icon: HiCurrencyDollar,
      component: <PayrollTab />
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: HiClock,
      component: <AttendanceTab 
        onUploadClick={() => setShowUploadModal(true)} 
        refreshTrigger={attendanceRefreshTrigger}
      />
    }
  ];

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
      const result = await dispatch(uploadAttendanceExcel({ file: uploadFile, month: selectedMonth }));
      
      if (result.type.endsWith('/fulfilled')) {
        dispatch(addNotification({
          type: 'success',
          message: `Successfully uploaded ${result.payload.data.createdCount} attendance records for ${new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}`
        }));
        setShowUploadModal(false);
        setUploadFile(null);
        setSelectedMonth(new Date().toISOString().slice(0, 7));
        
        // Trigger attendance data refresh
        setAttendanceRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(result.payload || 'Upload failed');
      }
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error.message || 'Failed to upload attendance file'
      }));
    }
  };

  // Generate and download sample Excel file
  const downloadSampleExcel = async () => {
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const sampleData = [];
    
    // Try to get actual payroll data first
    let employees = [];
    try {
      const response = await api.get('/payrolls?limit=5');
      if (response.data.success && response.data.data.payrolls.length > 0) {
        employees = response.data.data.payrolls.map(payroll => ({
          id: payroll.payrollId || payroll.employeeId,
          name: payroll.employeeName,
          designation: payroll.designation,
          grossPay: payroll.calculations?.grossSalary || payroll.basicSalary || 40000
        }));
      }
    } catch (error) {
      console.log('Could not fetch payroll data, using sample data');
    }
    
    // Fallback to sample data if no payroll records exist
    if (employees.length === 0) {
      employees = [
        { id: 'PAY000001', name: 'John Doe', designation: 'Manager', grossPay: 50000 },
        { id: 'PAY000002', name: 'Jane Smith', designation: 'Developer', grossPay: 40000 },
        { id: 'PAY000003', name: 'Mike Johnson', designation: 'Analyst', grossPay: 35000 },
        { id: 'PAY000004', name: 'Sarah Wilson', designation: 'Designer', grossPay: 38000 },
        { id: 'PAY000005', name: 'David Brown', designation: 'Tester', grossPay: 32000 }
      ];
    }

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    employees.forEach((employee, empIndex) => {
      // Generate different attendance patterns for each employee
      let presentDays, absentDays, lop;
      
      if (empIndex === 0) {
        // Manager - good attendance
        presentDays = daysInMonth - 2;
        absentDays = 1;
        lop = 1;
      } else if (empIndex === 1) {
        // Developer - perfect attendance
        presentDays = daysInMonth;
        absentDays = 0;
        lop = 0;
      } else if (empIndex === 2) {
        // Analyst - some absences
        presentDays = daysInMonth - 5;
        absentDays = 3;
        lop = 2;
      } else if (empIndex === 3) {
        // Designer - moderate attendance
        presentDays = daysInMonth - 3;
        absentDays = 2;
        lop = 1;
      } else {
        // Tester - poor attendance
        presentDays = daysInMonth - 8;
        absentDays = 5;
        lop = 3;
      }
      
      sampleData.push({
        'Emp Id': employee.id,
        'Total Working Days': daysInMonth,
        'Present Days': presentDays,
        'Absent Days': absentDays,
        'LOP': lop
      });
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    const colWidths = [
      { wch: 12 }, // Emp Id
      { wch: 18 }, // Total Working Days
      { wch: 15 }, // Present Days
      { wch: 15 }, // Absent Days
      { wch: 10 }  // LOP
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Summary Sample');

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const fileName = `attendance_summary_sample_${monthName}_${currentYear}.xlsx`;
    XLSX.writeFile(wb, fileName);

    dispatch(addNotification({
      type: 'success',
      message: 'Sample Excel file downloaded successfully!'
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employee payrolls, attendance records, and payments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {activeTab === 'employees' ? (
            <Button
              onClick={() => navigate('/payrolls/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={HiPlus}
            >
              Add Employee
            </Button>
          ) : activeTab === 'attendance' ? (
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              icon={HiDocumentArrowUp}
            >
              Upload Excel
            </Button>
          ) : null}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {tabs.find(tab => tab.id === activeTab)?.component}

      {/* Upload Modal */}
      <CommonModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        title="Upload PayRoll Excel"
        subtitle="Upload attendance records for payroll processing"
        icon={HiDocumentArrowUp}
        iconColor="from-green-500 to-green-600"
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
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
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
              <p><strong>Required columns:</strong> Emp Id, Emp Name, Designation, Gross Pay, Total Working Days, Present Days, Absent days, LOP</p>
              <p><strong>Note:</strong> This format is for monthly attendance summary data that will be used for payroll calculations.</p>
            </div>
          </div>
        </div>
      </CommonModal>
    </div>
  );
};

export default PayrollPage;
