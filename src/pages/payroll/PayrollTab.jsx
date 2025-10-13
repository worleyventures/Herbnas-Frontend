import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiCurrencyDollar,
  HiEye,
  HiPencil,
  HiTrash,
  HiCheckCircle,
  HiXMark,
  HiClock,
  HiUser,
  HiBuildingOffice,
  HiCalendar
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal, PayrollDetailsModal } from '../../components/common';
import {
  getAllPayrolls,
  deletePayroll,
  approvePayroll,
  rejectPayroll,
  getPayrollStats
} from '../../redux/actions/payrollActions';
import {
  selectPayrolls,
  selectPayrollLoading,
  selectPayrollError,
  selectPayrollStats,
  selectPayrollPagination,
  clearPayrollError
} from '../../redux/slices/payrollSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import api from '../../lib/axiosInstance';

const PayrollTab = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const payrolls = useSelector(selectPayrolls);
  const loading = useSelector(selectPayrollLoading);
  const error = useSelector(selectPayrollError);
  const stats = useSelector(selectPayrollStats);
  const pagination = useSelector(selectPayrollPagination);

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState(new Date().getFullYear().toString());
  const [monthFilter, setMonthFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [payrollToDelete, setPayrollToDelete] = useState(null);
  const [branches, setBranches] = useState([]);
  const [showPayrollModal, setShowPayrollModal] = useState(false);
  const [selectedPayrollId, setSelectedPayrollId] = useState(null);

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

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllPayrolls({
      page: currentPage,
      limit: 10,
      search: searchTerm,
      branchId: branchFilter !== 'all' ? branchFilter : undefined,
      year: yearFilter,
      month: monthFilter !== 'all' ? monthFilter : undefined,
      paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined
    }));
    dispatch(getPayrollStats({
      branchId: branchFilter !== 'all' ? branchFilter : undefined,
      year: yearFilter,
      month: monthFilter !== 'all' ? monthFilter : undefined
    }));
    loadBranches();
  }, [currentPage, searchTerm, branchFilter, yearFilter, monthFilter, paymentStatusFilter, dispatch]);

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
      case 'year':
        setYearFilter(value);
        break;
      case 'month':
        setMonthFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'paymentStatus':
        setPaymentStatusFilter(value);
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
  const handleDeletePayroll = (payrollId) => {
    const payroll = payrolls.find(p => p._id === payrollId);
    setPayrollToDelete(payroll);
    setShowDeleteModal(true);
  };

  const handleViewPayroll = (payrollId) => {
    setSelectedPayrollId(payrollId);
    setShowPayrollModal(true);
  };

  const handleEditPayroll = (payrollId) => {
    navigate(`/payrolls/edit/${payrollId}`);
  };

  const handleClosePayrollModal = () => {
    setShowPayrollModal(false);
    setSelectedPayrollId(null);
  };

  const confirmDeletePayroll = async () => {
    if (payrollToDelete) {
      try {
        await dispatch(deletePayroll(payrollToDelete._id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Payroll deleted successfully'
        }));
        setShowDeleteModal(false);
        setPayrollToDelete(null);
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error || 'Failed to delete payroll'
        }));
      }
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPayrollToDelete(null);
  };

  // Handle approve
  const handleApprovePayroll = async (payrollId) => {
    try {
      await dispatch(approvePayroll(payrollId)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Payroll approved successfully'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to approve payroll'
      }));
    }
  };

  // Handle reject
  const handleRejectPayroll = async (payrollId) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      try {
        await dispatch(rejectPayroll({ id: payrollId, rejectionReason: reason })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Payroll rejected successfully'
        }));
      } catch (error) {
        dispatch(addNotification({
          type: 'error',
          message: error || 'Failed to reject payroll'
        }));
      }
    }
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'yellow';
      case 'processed': return 'blue';
      case 'paid': return 'green';
      case 'failed': return 'red';
      default: return 'gray';
    }
  };

  // Table columns
  const columns = [
    {
      key: 'payrollId',
      label: 'Payroll ID',
      render: (payroll) => (
        <div className="font-medium text-gray-900">
          {payroll.payrollId}
        </div>
      )
    },
    {
      key: 'employee',
      label: 'Employee',
      render: (payroll) => (
        <div>
          <div className="font-medium text-gray-900">
            {payroll.employeeName}
          </div>
          <div className="text-sm text-gray-500">
            {payroll.employeeId}
          </div>
        </div>
      )
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (payroll) => (
        <div>
          <div className="font-medium text-gray-900">
            {payroll.branchId?.branchName}
          </div>
          <div className="text-sm text-gray-500">
            {payroll.branchId?.branchCode}
          </div>
        </div>
      )
    },
    {
      key: 'designation',
      label: 'Designation',
      render: (payroll) => (
        <div className="font-medium text-gray-900">
          {payroll.designation}
        </div>
      )
    },
    {
      key: 'netSalary',
      label: 'Net Salary',
      render: (payroll) => (
        <div className="font-medium text-gray-900">
          ₹{payroll.calculations?.netSalary?.toLocaleString()}
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment Status',
      render: (payroll) => (
        <StatusBadge
          status={payroll.payment?.status}
          color={getPaymentStatusColor(payroll.payment?.status)}
        />
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (payroll) => (
        <div className="flex space-x-3">
          <button
            onClick={() => handleViewPayroll(payroll._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="View Payroll"
          >
            <HiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate(`/payrolls/edit/${payroll._id}`)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit Payroll"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          {payroll.status === 'pending_approval' && (
            <>
              <button
                onClick={() => handleApprovePayroll(payroll._id)}
                className="text-green-500 hover:text-green-700 transition-colors"
                title="Approve Payroll"
              >
                <HiCheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleRejectPayroll(payroll._id)}
                className="text-red-500 hover:text-red-700 transition-colors"
                title="Reject Payroll"
              >
                <HiXMark className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => handleDeletePayroll(payroll._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Delete Payroll"
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

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const year = new Date().getFullYear() - i;
    return { value: year.toString(), label: year.toString() };
  });

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


  const paymentStatusOptions = [
    { value: 'all', label: 'All Payments' },
    { value: 'pending', label: 'Pending' },
    { value: 'processed', label: 'Processed' },
    { value: 'paid', label: 'Paid' },
    { value: 'failed', label: 'Failed' }
  ];

  if (loading && payrolls.length === 0) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Payrolls"
          value={stats?.overview?.totalPayrolls || 0}
          icon={HiCurrencyDollar}
          gradient="blue"
          animation="bounce"
          change="+5%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Pending Payments"
          value={stats?.overview?.pendingPayrolls || 0}
          icon={HiClock}
          gradient="yellow"
          animation="pulse"
          change="+2%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Paid This Month"
          value={stats?.overview?.paidPayrolls || 0}
          icon={HiCheckCircle}
          gradient="green"
          animation="float"
          change="+8%"
          changeType="increase"
          loading={loading}
        />
        <StatCard
          title="Total Amount"
          value={`₹${(stats?.overview?.totalAmount || 0).toLocaleString()}`}
          icon={HiCurrencyDollar}
          gradient="emerald"
          animation="bounce"
          change="+12%"
          changeType="increase"
          loading={loading}
        />
      </div>

      {/* Results Info */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-500">
          Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, pagination?.totalItems || 0)} of {pagination?.totalItems || 0} payrolls
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
                placeholder="Search payrolls..."
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
                value={yearFilter}
                onChange={(value) => handleFilterChange('year', value)}
                options={yearOptions}
                className="w-full sm:w-32"
              />
              <Select
                value={monthFilter}
                onChange={(value) => handleFilterChange('month', value)}
                options={monthOptions}
                className="w-full sm:w-32"
              />
              <Select
                value={paymentStatusFilter}
                onChange={(value) => handleFilterChange('paymentStatus', value)}
                options={paymentStatusOptions}
                className="w-full sm:w-40"
              />
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table
            data={payrolls}
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
        title="Delete Payroll"
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
              Delete Payroll
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <HiTrash className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure you want to delete this payroll?
          </h3>
          {payrollToDelete && (
            <div className="text-sm text-gray-500 mb-4">
              <p><strong>Payroll ID:</strong> {payrollToDelete.payrollId}</p>
              <p><strong>Employee:</strong> {payrollToDelete.employeeId?.firstName} {payrollToDelete.employeeId?.lastName}</p>
              <p><strong>Net Salary:</strong> ₹{payrollToDelete.calculations?.netSalary?.toLocaleString()}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone. The payroll will be permanently removed from the system.
          </p>
        </div>
      </CommonModal>

      {/* Payroll Details Modal */}
      <PayrollDetailsModal
        isOpen={showPayrollModal}
        onClose={handleClosePayrollModal}
        payrollId={selectedPayrollId}
        onEdit={handleEditPayroll}
        onDelete={() => {
          handleClosePayrollModal();
          // Refresh the payroll list after deletion
          dispatch(getAllPayrolls({
            page: currentPage,
            limit: 10,
            search: searchTerm,
            branchId: branchFilter !== 'all' ? branchFilter : undefined,
            year: yearFilter,
            month: monthFilter !== 'all' ? monthFilter : undefined,
            paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined
          }));
        }}
      />
    </div>
  );
};

export default PayrollTab;
