import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { HiBanknotes, HiClock, HiPlus, HiDocumentArrowUp, HiArrowDownTray } from 'react-icons/hi2';
import { Button, CommonModal } from '../../components/common';
import { addNotification } from '../../redux/slices/uiSlice';
import PayrollTab from './PayrollTab';
import AttendanceTab from './AttendanceTab';
import api from '../../lib/axiosInstance';
import * as XLSX from 'xlsx';

const PayrollPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('payroll');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  const tabs = [
    {
      id: 'payroll',
      name: 'Payroll',
      icon: HiBanknotes,
      component: <PayrollTab />
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: HiClock,
      component: <AttendanceTab onUploadClick={() => setShowUploadModal(true)} />
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
        setSelectedMonth(new Date().toISOString().slice(0, 7));
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
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    
    const sampleData = [];
    const employees = [
      { id: 'EMP001', branch: 'BR001', name: 'John Doe' },
      { id: 'EMP002', branch: 'BR001', name: 'Jane Smith' },
      { id: 'EMP003', branch: 'BR002', name: 'Mike Johnson' },
      { id: 'EMP004', branch: 'BR001', name: 'Sarah Wilson' },
      { id: 'EMP005', branch: 'BR002', name: 'David Brown' }
    ];

    const daysInMonth = new Date(currentYear, currentMonth, 0).getDate();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth - 1, day);
      const dayOfWeek = date.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      
      employees.forEach((employee, empIndex) => {
        if (isWeekend && empIndex !== 4) return;
        
        let status, checkIn, checkOut, leaveType, remarks;
        
        if (isWeekend && empIndex === 4) {
          status = 'present';
          checkIn = '10:00';
          checkOut = '16:00';
          leaveType = '';
          remarks = 'Weekend work';
        } else if (day % 7 === 0) {
          status = 'leave';
          checkIn = '';
          checkOut = '';
          leaveType = 'sick';
          remarks = 'Sick leave';
        } else if (day % 10 === 0) {
          status = 'half_day';
          checkIn = '09:00';
          checkOut = '13:00';
          leaveType = '';
          remarks = 'Half day leave';
        } else if (day % 15 === 0) {
          status = 'absent';
          checkIn = '';
          checkOut = '';
          leaveType = '';
          remarks = 'No show';
        } else if (day % 5 === 0) {
          status = 'present';
          checkIn = '09:30';
          checkOut = '17:30';
          leaveType = '';
          remarks = 'Late arrival';
        } else {
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

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(sampleData);

    const colWidths = [
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 20 }
    ];
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, 'Attendance Sample');

    const monthName = currentDate.toLocaleString('default', { month: 'long' });
    const fileName = `attendance_sample_${monthName}_${currentYear}.xlsx`;
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
          {activeTab === 'payroll' ? (
            <Button
              onClick={() => navigate('/payrolls/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={HiPlus}
            >
              Add New Payroll
            </Button>
          ) : (
            <Button
              onClick={() => setShowUploadModal(true)}
              className="bg-green-600 hover:bg-green-700 text-white"
              icon={HiDocumentArrowUp}
            >
              Upload Excel
            </Button>
          )}
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
        title="Upload Attendance Excel"
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
              <p><strong>Required columns:</strong> Employee ID, Branch Code, Date</p>
              <p><strong>Optional columns:</strong> Check In, Check Out, Status, Leave Type, Remarks</p>
              <p><strong>Note:</strong> Uploaded attendance data will be used for payroll calculations.</p>
            </div>
          </div>
        </div>
      </CommonModal>
    </div>
  );
};

export default PayrollPage;
