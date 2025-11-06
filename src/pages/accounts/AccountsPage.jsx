import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  HiPlus,
  HiMagnifyingGlass,
  HiCurrencyDollar,
  HiArrowUp,
  HiArrowDown,
  HiEye,
  HiPencil,
  HiTrash,
  HiClipboardDocumentList,
  HiShoppingCart,
  HiChartBar,
  HiArrowLeft
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal, SearchInput } from '../../components/common';
import {
  getAllAccounts,
  getAccountStats,
  getBranchSummary,
  deleteAccount,
  getAccountById,
  getHeadOfficeSupplierExpenses,
  backfillUnrecordedRawMaterials
} from '../../redux/actions/accountActions';
import { getOrderById } from '../../redux/actions/orderActions';
import { getBranchById } from '../../redux/actions/branchActions';
import {
  selectAccounts,
  selectAccountLoading,
  selectAccountError,
  selectAccountStats,
  selectAccountStatsLoading,
  selectBranchSummary,
  selectBranchSummaryLoading,
  selectAccountPagination,
  selectHeadOfficeSupplierExpenses,
  selectHeadOfficeSupplierExpensesLoading,
  clearAccountError
} from '../../redux/slices/accountSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import PurchaseManagement from '../../components/accounts/PurchaseManagement';
import FinancialReports from '../../components/accounts/FinancialReports';

const AccountsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  // Get current user for role-based functionality
  const { user } = useSelector((state) => state.auth);
  
  // Redux state
  const accounts = useSelector(selectAccounts);
  const loading = useSelector(selectAccountLoading);
  const error = useSelector(selectAccountError);
  const stats = useSelector(selectAccountStats);
  const statsLoading = useSelector(selectAccountStatsLoading);
  const branchSummary = useSelector(selectBranchSummary);
  const branchSummaryLoading = useSelector(selectBranchSummaryLoading);
  const headOfficeSupplierExpenses = useSelector(selectHeadOfficeSupplierExpenses);
  const headOfficeSupplierExpensesLoading = useSelector(selectHeadOfficeSupplierExpensesLoading);
  const pagination = useSelector(selectAccountPagination);
  
  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRangeFilter, setDateRangeFilter] = useState('today');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [branchFilter, setBranchFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [accountToView, setAccountToView] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [branchDetails, setBranchDetails] = useState(null);
  const [loadingAccountDetails, setLoadingAccountDetails] = useState(false);
  const [transactionTypeFilter, setTransactionTypeFilter] = useState('all');
  
  // Drill-down state for Super Admin
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showBranchDetails, setShowBranchDetails] = useState(false);
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [backfilling, setBackfilling] = useState(false);
  const [showSupplierDetailsModal, setShowSupplierDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  // Role-based access
  const isSuperAdmin = user?.role === 'super_admin';
  const isAccountsManager = user?.role === 'accounts_manager';

  // Helper function to get date range based on filter selection
  const getDateRange = useCallback(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    
    switch (dateRangeFilter) {
      case 'today': {
        const start = new Date(today);
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      }
      case 'thisWeek': {
        const start = new Date(today);
        const dayOfWeek = start.getDay();
        start.setDate(start.getDate() - dayOfWeek); // Go to Sunday
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      }
      case 'thisMonth': {
        const start = new Date(today.getFullYear(), today.getMonth(), 1);
        start.setHours(0, 0, 0, 0);
        return {
          startDate: start.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0]
        };
      }
      case 'custom': {
        if (fromDate && toDate) {
          return {
            startDate: fromDate,
            endDate: toDate
          };
        }
        return null;
      }
      default:
        return null;
    }
  }, [dateRangeFilter, fromDate, toDate]);

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'overview' || isAccountsManager) {
      // For accounts managers, always filter by their branch
      const branchId = isAccountsManager ? (user?.branch?._id || user?.branch) : (branchFilter !== 'all' ? branchFilter : undefined);
      const dateRange = getDateRange();
      
      // For custom date range, only fetch if both dates are provided
      if (dateRangeFilter === 'custom' && (!fromDate || !toDate)) {
        // Don't fetch if custom is selected but dates are not provided
        return;
      }
      
      dispatch(getAllAccounts({
        page: currentPage,
        limit: 10,
        search: searchTerm,
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        branchId: branchId,
        paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
        transactionType: transactionTypeFilter !== 'all' ? transactionTypeFilter : undefined
      }));
      dispatch(getAccountStats({
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
        branchId: branchId
      }));
      
      // Load branch summary for super admin
      if (isSuperAdmin) {
        dispatch(getBranchSummary({
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate
        }));
      }
    }
  }, [activeTab, currentPage, searchTerm, dateRangeFilter, fromDate, toDate, branchFilter, paymentStatusFilter, transactionTypeFilter, dispatch, isSuperAdmin, isAccountsManager, user?.branch?._id, user?.branch, getDateRange]);

  // Separate effect to reload branch summary when date range changes (for super admin)
  useEffect(() => {
    if (isSuperAdmin && (activeTab === 'overview' || !showBranchDetails)) {
      // For custom date range, only fetch if both dates are provided
      if (dateRangeFilter === 'custom' && (!fromDate || !toDate)) {
        // Don't fetch if custom is selected but dates are not provided
        return;
      }
      
      const dateRange = getDateRange();
      dispatch(getBranchSummary({
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate
      }));
    }
  }, [dateRangeFilter, fromDate, toDate, isSuperAdmin, activeTab, showBranchDetails, getDateRange, dispatch]);

  // Load accounts for selected branch drill-down (or Head Office supplier expenses)
  useEffect(() => {
    if (showBranchDetails && selectedBranch) {
      // For custom date range, only fetch if both dates are provided
      if (dateRangeFilter === 'custom' && (!fromDate || !toDate)) {
        // Don't fetch if custom is selected but dates are not provided
        return;
      }
      
      const dateRange = getDateRange();
      
      if (isHeadOffice) {
        // Load Head Office supplier expenses
        dispatch(getHeadOfficeSupplierExpenses({
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
          supplierId: supplierFilter !== 'all' ? supplierFilter : undefined
        }));
      } else {
        // Load regular accounts for other branches
        dispatch(getAllAccounts({
          page: currentPage,
          limit: 10,
          search: searchTerm,
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
          branchId: selectedBranch.branchId,
          paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined,
          transactionType: transactionTypeFilter !== 'all' ? transactionTypeFilter : undefined
        }));
        dispatch(getAccountStats({
          startDate: dateRange?.startDate,
          endDate: dateRange?.endDate,
          branchId: selectedBranch.branchId
        }));
      }
    }
  }, [showBranchDetails, selectedBranch, isHeadOffice, currentPage, searchTerm, getDateRange, paymentStatusFilter, transactionTypeFilter, supplierFilter, dispatch]);

  // Handle branch row click for drill-down
  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    setShowBranchDetails(true);
    setCurrentPage(1); // Reset to first page
    setTransactionTypeFilter('all'); // Reset transaction type filter to show all types
    setPaymentStatusFilter('all'); // Reset payment status filter to show all statuses
    setSearchTerm(''); // Reset search term
    setSupplierFilter('all'); // Reset supplier filter
    
    // Check if it's Head Office branch
    const isHeadOfficeBranch = branch.branchName.toLowerCase() === 'head office';
    setIsHeadOffice(isHeadOfficeBranch);
  };

  // Handle back to branch summary
  const handleBackToSummary = () => {
    setShowBranchDetails(false);
    setSelectedBranch(null);
    setCurrentPage(1);
    setIsHeadOffice(false);
    setSupplierFilter('all');
  };

  // Handle filters with useCallback to prevent unnecessary re-renders
  const handleDateRangeFilter = useCallback((e) => {
    const value = e.target.value;
    setDateRangeFilter(value);
    setCurrentPage(1);
    // If switching away from custom, clear the dates
    if (value !== 'custom') {
      setFromDate('');
      setToDate('');
    }
  }, []);

  const handleFromDateChange = useCallback((value) => {
    setFromDate(value);
    setCurrentPage(1);
  }, []);

  const handleToDateChange = useCallback((value) => {
    setToDate(value);
    setCurrentPage(1);
  }, []);

  const handleSupplierFilter = useCallback((e) => {
    setSupplierFilter(e.target.value);
    // Don't reset page or fetch immediately - let useEffect handle it
  }, []);

  const handleBranchFilter = useCallback((e) => {
    setBranchFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handlePaymentStatusFilter = useCallback((e) => {
    setPaymentStatusFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  const handleTransactionTypeFilter = useCallback((e) => {
    setTransactionTypeFilter(e.target.value);
    setCurrentPage(1);
  }, []);

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle add account
  const handleAddAccount = () => {
    navigate('/accounts/new');
  };

  // Handle view account
  const handleViewAccount = async (id) => {
    const account = accounts.find(acc => acc._id === id);
    setAccountToView(account);
    setShowViewModal(true);
    setOrderDetails(null);
    setBranchDetails(null);
    setLoadingAccountDetails(true);
    
    try {
      // Fetch full account details to get populated orderId
      const accountResult = await dispatch(getAccountById(id)).unwrap();
      const fullAccount = accountResult.data?.account || account;
      
      // Fetch order if orderId exists
      if (fullAccount.orderId) {
        try {
          const orderId = typeof fullAccount.orderId === 'object' ? fullAccount.orderId._id : fullAccount.orderId;
          const orderResult = await dispatch(getOrderById(orderId)).unwrap();
          const order = orderResult.data?.order || orderResult.data;
          setOrderDetails(order);
          
          // Fetch branch details for ready cash and bank accounts
          if (order.branchId) {
            const branchId = typeof order.branchId === 'object' ? order.branchId._id : order.branchId;
            const branchResult = await dispatch(getBranchById(branchId)).unwrap();
            const branch = branchResult.data?.branch || branchResult.data;
            setBranchDetails(branch);
          }
        } catch (error) {
          console.error('Error fetching order/branch details:', error);
        }
      } else if (fullAccount.branchId) {
        // Fetch branch even if no order (for manual accounts)
        const branchId = typeof fullAccount.branchId === 'object' ? fullAccount.branchId._id : fullAccount.branchId;
        try {
          const branchResult = await dispatch(getBranchById(branchId)).unwrap();
          const branch = branchResult.data?.branch || branchResult.data;
          setBranchDetails(branch);
        } catch (error) {
          console.error('Error fetching branch details:', error);
        }
      }
    } catch (error) {
      console.error('Error fetching account details:', error);
    } finally {
      setLoadingAccountDetails(false);
    }
  };

  // Handle edit account
  const handleEditAccount = (id) => {
    navigate(`/accounts/edit/${id}`);
  };

  // Handle delete account
  const handleDeleteAccount = (id) => {
    const account = accounts.find(acc => acc._id === id);
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const confirmDeleteAccount = async () => {
    if (accountToDelete) {
      try {
        await dispatch(deleteAccount(accountToDelete._id)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Account entry deleted successfully'
        }));
        setShowDeleteModal(false);
        setAccountToDelete(null);
        
         // Refresh the accounts list
         const branchId = isAccountsManager ? (user?.branch?._id || user?.branch) : (branchFilter !== 'all' ? branchFilter : undefined);
         dispatch(getAllAccounts({
           page: currentPage,
           limit: 10,
           search: searchTerm,
           month: monthFilter !== 'all' ? monthFilter : undefined,
           year: yearFilter !== 'all' ? yearFilter : undefined,
           branchId: branchId,
           paymentStatus: paymentStatusFilter !== 'all' ? paymentStatusFilter : undefined
         }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to delete account entry'
      }));
      }
    }
  };

  // Cancel delete
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  // Get transaction type color
  const getTransactionTypeColor = (type) => {
    return type === 'income' ? 'green' : 'red';
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'pending':
        return 'yellow';
      case 'failed':
        return 'red';
      case 'refunded':
        return 'blue';
      default:
        return 'gray';
    }
  };

  // Table columns - different for accounts managers vs other roles
  const columns = isAccountsManager ? [
    // Simplified columns for accounts managers
    {
      key: 'accountId',
      label: 'Account ID',
      render: (account) => (
        <div className="font-medium text-gray-900">
          {account.accountId}
        </div>
      )
    },
    {
      key: 'transactionType',
      label: 'Type',
      render: (account) => (
        <StatusBadge
          status={account.transactionType}
          color={getTransactionTypeColor(account.transactionType)}
        />
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (account) => (
        <div className="text-sm text-gray-900">
          {account.category.replace('_', ' ').toUpperCase()}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (account) => (
        <div className={`font-medium ${account.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {account.formattedAmount}
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (account) => (
        <StatusBadge
          status={account.paymentStatus}
          color={getPaymentStatusColor(account.paymentStatus)}
        />
      )
    },
    {
      key: 'transactionDate',
      label: 'Date',
      render: (account) => (
        <div className="text-sm text-gray-900">
          {new Date(account.transactionDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (account) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewAccount(account._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="View Account"
          >
            <HiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditAccount(account._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit Account"
          >
            <HiPencil className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ] : [
    // Full columns for other roles (super admin, admin)
    {
      key: 'accountId',
      label: 'Account ID',
      render: (account) => (
        <div className="font-medium text-gray-900">
          {account.accountId}
        </div>
      )
    },
    {
      key: 'transactionType',
      label: 'Type',
      render: (account) => (
        <StatusBadge
          status={account.transactionType}
          color={getTransactionTypeColor(account.transactionType)}
        />
      )
    },
    {
      key: 'category',
      label: 'Category',
      render: (account) => (
        <div className="text-sm text-gray-900">
          {account.category.replace('_', ' ').toUpperCase()}
        </div>
      )
    },
    {
      key: 'amount',
      label: 'Amount',
      render: (account) => (
        <div className={`font-medium ${account.transactionType === 'income' ? 'text-green-600' : 'text-red-600'}`}>
          {account.formattedAmount}
        </div>
      )
    },
    {
      key: 'branch',
      label: 'Branch',
      render: (account) => (
        <div>
          <div className="font-medium text-gray-900">
            {account.branchId?.branchName}
          </div>
          <div className="text-sm text-gray-500">
            {account.branchId?.branchCode}
          </div>
        </div>
      )
    },
    {
      key: 'orderId',
      label: 'Order ID',
      render: (account) => (
        <div className="text-sm text-gray-900 font-medium">
          {account.orderId?.orderId || account.orderId || '-'}
        </div>
      )
    },
    {
      key: 'paymentStatus',
      label: 'Payment',
      render: (account) => (
        <StatusBadge
          status={account.paymentStatus}
          color={getPaymentStatusColor(account.paymentStatus)}
        />
      )
    },
    {
      key: 'transactionDate',
      label: 'Date',
      render: (account) => (
        <div className="text-sm text-gray-900">
          {new Date(account.transactionDate).toLocaleDateString()}
        </div>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (account) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleViewAccount(account._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="View Account"
          >
            <HiEye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditAccount(account._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Edit Account"
          >
            <HiPencil className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteAccount(account._id)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            title="Delete Account"
          >
            <HiTrash className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Filter options
  const dateRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'thisWeek', label: 'This Week' },
    { value: 'thisMonth', label: 'This Month' },
    { value: 'custom', label: 'Custom' }
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
  ];

  const transactionTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'income', label: 'Income' },
    { value: 'expense', label: 'Expense' },
    { value: 'purchase', label: 'Purchase' }
  ];

  // Render overview content
  const renderOverviewContent = () => {
    if (isSuperAdmin) {
      // Super admin sees only branch summary
  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title="Total Income"
            value={`₹${stats.summary?.totalIncome?.toLocaleString() || 0}`}
            icon={HiArrowUp}
            color="green"
            loading={statsLoading}
          />
          <StatCard
            title="Total Expense"
            value={`₹${stats.summary?.totalExpense?.toLocaleString() || 0}`}
            icon={HiArrowDown}
            color="red"
            loading={statsLoading}
          />
          <StatCard
            title="Net Profit"
            value={`₹${stats.summary?.netProfit?.toLocaleString() || 0}`}
            icon={HiCurrencyDollar}
            color={stats.summary?.netProfit >= 0 ? 'green' : 'red'}
            loading={statsLoading}
          />
          <StatCard
            title="Total Transactions"
            value={stats.summary?.totalTransactions || 0}
            icon={HiClipboardDocumentList}
            color="blue"
            loading={statsLoading}
          />
        </div>
      )}

          {/* Branch Summary for Super Admin */}
          {branchSummary && (
            <div className="bg-white shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-sm text-gray-500">
                  {branchSummary.period && (
                    <span>
                      {new Date(branchSummary.period.startDate).toLocaleDateString()} - {new Date(branchSummary.period.endDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>

              {branchSummaryLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Branch Summary Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Income
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expense
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Purchase
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transactions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {branchSummary.summary?.map((branch) => (
                          <tr 
                            key={branch.branchId} 
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleBranchClick(branch)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {branch.branchName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {branch.branchCode}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600">
                                ₹{branch.income?.toLocaleString() || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                {branch.incomeCount || 0} transactions
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-red-600">
                                ₹{branch.expense?.toLocaleString() || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                {branch.expenseCount || 0} transactions
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600">
                                ₹{branch.purchase?.toLocaleString() || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                {branch.purchaseCount || 0} transactions
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm font-medium ${branch.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{branch.netAmount?.toLocaleString() || 0}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {(branch.incomeCount || 0) + (branch.expenseCount || 0) + (branch.purchaseCount || 0)}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      {branchSummary.totals && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              Total
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                              ₹{branchSummary.totals.totalIncome?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                              ₹{branchSummary.totals.totalExpense?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                              ₹{branchSummary.totals.totalPurchase?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              ₹{branchSummary.totals.totalNetAmount?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {(branchSummary.totals.totalIncomeCount || 0) + (branchSummary.totals.totalExpenseCount || 0) + (branchSummary.totals.totalPurchaseCount || 0)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      );
    } else {
        // Regular users see the full table with filters
        return (
          <div className="space-y-6">
            {/* Statistics Cards */}
            {stats && (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                <StatCard
                  title="Total Income"
                  value={`₹${stats.summary?.totalIncome?.toLocaleString() || 0}`}
                  icon={HiArrowUp}
                  gradient="green"
                  loading={statsLoading}
                  subtitle="Includes accounts + completed leads"
                />
                <StatCard
                  title="Total Expense"
                  value={`₹${stats.summary?.totalExpense?.toLocaleString() || 0}`}
                  icon={HiArrowDown}
                  gradient="red"
                  loading={statsLoading}
                />
                <StatCard
                  title="Net Profit"
                  value={`₹${stats.summary?.netProfit?.toLocaleString() || 0}`}
                  icon={HiCurrencyDollar}
                  gradient="purple"
                  loading={statsLoading}
                />
                <StatCard
                  title="Total Transactions"
                  value={stats.summary?.totalTransactions || 0}
                  icon={HiClipboardDocumentList}
                  gradient="blue"
                  loading={statsLoading}
                />
              </div>
            )}

            {/* Search and Filter Section */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="w-full sm:w-80">
                <SearchInput
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search accounts..."
              icon={HiMagnifyingGlass}
            />
          </div>
             <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0 sm:items-center">
               <Select
                 value={dateRangeFilter}
                 onChange={handleDateRangeFilter}
                 options={dateRangeOptions}
                 className="w-full sm:w-48"
               />
               {dateRangeFilter === 'custom' && (
                 <>
                   <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                     <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">From</label>
                     <Input
                       type="date"
                       value={fromDate}
                       onChange={(e) => handleFromDateChange(e.target.value)}
                       className="w-full sm:w-40"
                     />
                   </div>
                   <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                     <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">To</label>
                     <Input
                       type="date"
                       value={toDate}
                       onChange={(e) => handleToDateChange(e.target.value)}
                       className="w-full sm:w-40"
                     />
                   </div>
                 </>
               )}
               <Select
                 value={paymentStatusFilter}
                 onChange={handlePaymentStatusFilter}
                 options={paymentStatusOptions}
                 className="w-full sm:w-48"
               />
               <Select
                 value={transactionTypeFilter}
                 onChange={handleTransactionTypeFilter}
                 options={transactionTypeOptions}
                 className="w-full sm:w-48"
               />
         </div>
      </div>

      {/* Accounts Table */}
      <div className="bg-white">
        <Table
          data={accounts}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          emptyMessage="No accounts found"
          emptyIcon={HiClipboardDocumentList}
        />
      </div>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            {isSuperAdmin 
              ? 'Manage all branch accounts, expenses, and incomes across all branches' 
              : isAccountsManager 
              ? `Manage accounts, expenses, and incomes for ${user?.branch?.branchName || 'your branch'}`
              : 'Manage all branch accounts, expenses, and incomes'
            }
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={handleAddAccount}
            icon={HiPlus}
            variant="primary"
            size="sm"
          >
            Add Accounts
          </Button>
        </div>
      </div>

      {/* Content based on role */}
      {isSuperAdmin ? (
        showBranchDetails ? (
          // Super Admin: Branch Details View (Drill-down)
          <div className="space-y-6">
            {/* Back Button */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={handleBackToSummary}
                icon={HiArrowLeft}
                size="sm"
              >
                Back to Branch Summary
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedBranch?.branchName} ({selectedBranch?.branchCode})
                </h2>
                <p className="text-sm text-gray-600">
                  {isHeadOffice 
                    ? 'Centralized Raw Material Expenses - Supplier Wise'
                    : 'Account details for selected branch'
                  }
                  {dateRangeFilter === 'custom' && fromDate && toDate
                    ? ` - ${fromDate} to ${toDate}`
                    : dateRangeFilter !== 'custom'
                    ? ` - ${dateRangeOptions.find(d => d.value === dateRangeFilter)?.label}`
                    : ''
                  }
                </p>
              </div>
            </div>

            {isHeadOffice ? (
              // Head Office Supplier Expenses View
              <>
                {/* Statistics Cards for Head Office */}
                {headOfficeSupplierExpenses?.summary && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                      title="Total Amount"
                      value={`₹${headOfficeSupplierExpenses.summary.totalAmount?.toLocaleString() || 0}`}
                      icon={HiCurrencyDollar}
                      gradient="blue"
                      loading={headOfficeSupplierExpensesLoading}
                    />
                    <StatCard
                      title="Total Expenses"
                      value={`₹${headOfficeSupplierExpenses.summary.totalExpense?.toLocaleString() || 0}`}
                      icon={HiArrowDown}
                      gradient="red"
                      loading={headOfficeSupplierExpensesLoading}
                    />
                    <StatCard
                      title="Total Purchases"
                      value={`₹${headOfficeSupplierExpenses.summary.totalPurchase?.toLocaleString() || 0}`}
                      icon={HiShoppingCart}
                      gradient="green"
                      loading={headOfficeSupplierExpensesLoading}
                    />
                    <StatCard
                      title="Total Transactions"
                      value={headOfficeSupplierExpenses.summary.totalTransactions || 0}
                      icon={HiClipboardDocumentList}
                      gradient="purple"
                      loading={headOfficeSupplierExpensesLoading}
                    />
                  </div>
                )}

                {/* Supplier Filter */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-full sm:w-80">
                    <Select
                      value={supplierFilter}
                      onChange={handleSupplierFilter}
                      options={[
                        { value: 'all', label: 'All Suppliers' },
                        ...(headOfficeSupplierExpenses?.suppliers || []).map(supplier => ({
                          value: supplier.supplierId || supplier.supplierName,
                          label: supplier.supplierName || 'Unknown Supplier'
                        }))
                      ]}
                      className="w-full"
                      placeholder="Filter by Supplier"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0 sm:items-center">
                    <Select
                      value={dateRangeFilter}
                      onChange={handleDateRangeFilter}
                      options={dateRangeOptions}
                      className="w-full sm:w-48"
                    />
                    {dateRangeFilter === 'custom' && (
                      <>
                        <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">From</label>
                          <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => handleFromDateChange(e.target.value)}
                            className="w-full sm:w-40"
                          />
                        </div>
                        <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">To</label>
                          <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => handleToDateChange(e.target.value)}
                            className="w-full sm:w-40"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Supplier Expenses Table */}
                <div className="bg-white shadow-sm rounded-lg overflow-hidden">
                  {/* Show empty state if custom date is selected but dates are not provided */}
                  {dateRangeFilter === 'custom' && (!fromDate || !toDate) ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                        <HiClipboardDocumentList className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Please select date range</h3>
                      <p className="text-sm text-gray-500 text-center max-w-md">
                        To view supplier expenses, please select both "From" and "To" dates in the custom date range filter.
                      </p>
                    </div>
                  ) : headOfficeSupplierExpensesLoading ? (
                    <div className="flex justify-center py-8">
                      <Loading />
                    </div>
                  ) : headOfficeSupplierExpenses?.suppliers && headOfficeSupplierExpenses.suppliers.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Supplier
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Raw Material Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Purchase Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Transactions
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {headOfficeSupplierExpenses.suppliers
                            .filter(supplier => !supplierFilter || supplierFilter === 'all' || 
                              (supplier.supplierId && supplier.supplierId === supplierFilter) ||
                              (supplier.supplierName && supplier.supplierName === supplierFilter))
                            .map((supplier, index) => (
                            <tr key={supplier.supplierId || index} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {supplier.supplierName || 'Unknown Supplier'}
                                  </div>
                                  {supplier.supplierId && (
                                    <div className="text-xs text-gray-500">
                                      ID: {supplier.supplierId}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">
                                  {(() => {
                                    // Get unique raw material names from transactions
                                    const rawMaterials = [];
                                    if (supplier.transactions && supplier.transactions.length > 0) {
                                      supplier.transactions.forEach(t => {
                                        if (t.rawMaterialName && !rawMaterials.includes(t.rawMaterialName)) {
                                          rawMaterials.push(t.rawMaterialName);
                                        }
                                      });
                                    }
                                    return rawMaterials.length > 0 
                                      ? rawMaterials.join(', ')
                                      : 'N/A';
                                  })()}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600">
                                  ₹{supplier.purchaseAmount?.toLocaleString() || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {supplier.purchaseCount || 0} purchase(s)
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {supplier.transactionCount || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button
                                  onClick={() => {
                                    setSelectedSupplier(supplier);
                                    setShowSupplierDetailsModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-800 transition-colors"
                                  title="View Supplier Details"
                                >
                                  <HiEye className="w-5 h-5" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        {headOfficeSupplierExpenses.summary && (
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                Total
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {/* Empty cell for raw material column */}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                                ₹{headOfficeSupplierExpenses.summary.totalPurchase?.toLocaleString() || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                                {headOfficeSupplierExpenses.summary.totalTransactions || 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {/* Empty cell for actions column */}
                              </td>
                            </tr>
                          </tfoot>
                        )}
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <HiClipboardDocumentList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No supplier expenses found for the selected period</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              // Regular Branch Accounts View
              <>
                {/* Statistics Cards for Selected Branch */}
                {stats && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
                    <StatCard
                      title="Total Income"
                      value={`₹${stats.summary?.totalIncome?.toLocaleString() || 0}`}
                      icon={HiArrowUp}
                      gradient="green"
                      loading={statsLoading}
                    />
                    <StatCard
                      title="Total Expense"
                      value={`₹${stats.summary?.totalExpense?.toLocaleString() || 0}`}
                      icon={HiArrowDown}
                      gradient="red"
                      loading={statsLoading}
                    />
                    <StatCard
                      title="Net Profit"
                      value={`₹${stats.summary?.netProfit?.toLocaleString() || 0}`}
                      icon={HiCurrencyDollar}
                      gradient="purple"
                      loading={statsLoading}
                    />
                    <StatCard
                      title="Total Transactions"
                      value={stats.summary?.totalTransactions || 0}
                      icon={HiClipboardDocumentList}
                      gradient="blue"
                      loading={statsLoading}
                    />
                  </div>
                )}

                {/* Search and Filter Section */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-full sm:w-80">
                    <SearchInput
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search accounts..."
                      icon={HiMagnifyingGlass}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0 sm:items-center">
                    <Select
                      value={dateRangeFilter}
                      onChange={handleDateRangeFilter}
                      options={dateRangeOptions}
                      className="w-full sm:w-48"
                    />
                    {dateRangeFilter === 'custom' && (
                      <>
                        <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">From</label>
                          <Input
                            type="date"
                            value={fromDate}
                            onChange={(e) => handleFromDateChange(e.target.value)}
                            className="w-full sm:w-40"
                          />
                        </div>
                        <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                          <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">To</label>
                          <Input
                            type="date"
                            value={toDate}
                            onChange={(e) => handleToDateChange(e.target.value)}
                            className="w-full sm:w-40"
                          />
                        </div>
                      </>
                    )}
                    <Select
                      value={paymentStatusFilter}
                      onChange={handlePaymentStatusFilter}
                      options={paymentStatusOptions}
                      className="w-full sm:w-48"
                    />
                    <Select
                      value={transactionTypeFilter}
                      onChange={setTransactionTypeFilter}
                      options={transactionTypeOptions}
                      className="w-full sm:w-48"
                    />
                  </div>
                </div>

                {/* Accounts Table */}
                <div className="bg-white">
                  <Table
                    data={accounts}
                    columns={columns}
                    loading={loading}
                    error={error}
                    pagination={pagination}
                    onPageChange={handlePageChange}
                    emptyMessage="No accounts found"
                    emptyIcon={HiClipboardDocumentList}
                  />
                </div>
              </>
            )}
          </div>
        ) : (
        // Super Admin: Branch Summary Dashboard
        <div className="space-y-6">
          {/* Statistics Cards - Use branchSummary totals when available, otherwise fall back to stats */}
          {(branchSummary?.totals || stats) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Income"
                value={`₹${(branchSummary?.totals?.totalIncome || stats?.summary?.totalIncome || 0).toLocaleString()}`}
                icon={HiArrowUp}
                gradient="green"
                loading={branchSummaryLoading || statsLoading}
                subtitle="Includes accounts + completed leads"
              />
              <StatCard
                title="Total Expense"
                value={`₹${(branchSummary?.totals?.totalExpense || stats?.summary?.totalExpense || 0).toLocaleString()}`}
                icon={HiArrowDown}
                gradient="red"
                loading={branchSummaryLoading || statsLoading}
              />
              <StatCard
                title="Net Profit"
                value={`₹${(branchSummary?.totals?.totalNetAmount || stats?.summary?.netProfit || 0).toLocaleString()}`}
                icon={HiCurrencyDollar}
                gradient="purple"
                loading={branchSummaryLoading || statsLoading}
              />
              <StatCard
                title="Total Transactions"
                value={(branchSummary?.totals ? 
                  ((branchSummary.totals.totalIncomeCount || 0) + (branchSummary.totals.totalExpenseCount || 0) + (branchSummary.totals.totalPurchaseCount || 0)) :
                  (stats?.summary?.totalTransactions || 0))}
                icon={HiClipboardDocumentList}
                gradient="blue"
                loading={branchSummaryLoading || statsLoading}
              />
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-80">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search branches..."
                icon={HiMagnifyingGlass}
              />
            </div>
             <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0 sm:items-center">
               <Select
                 value={dateRangeFilter}
                 onChange={handleDateRangeFilter}
                 options={dateRangeOptions}
                 className="w-full sm:w-48"
               />
               {dateRangeFilter === 'custom' && (
                 <>
                   <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                     <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">From</label>
                     <Input
                       type="date"
                       value={fromDate}
                       onChange={(e) => handleFromDateChange(e.target.value)}
                       className="w-full sm:w-40"
                     />
                   </div>
                   <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                     <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">To</label>
                     <Input
                       type="date"
                       value={toDate}
                       onChange={(e) => handleToDateChange(e.target.value)}
                       className="w-full sm:w-40"
                     />
                   </div>
                 </>
               )}
             </div>
          </div>

          {/* Branch Summary Table */}
          {branchSummary && (
            <div className="bg-white p-6">
              {branchSummaryLoading ? (
                <div className="flex justify-center py-8">
                  <Loading />
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Branch Summary Table */}
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Branch
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Income
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Expense
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Purchase
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Net Amount
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Transactions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {branchSummary.summary?.length > 0 ? (
                          branchSummary.summary?.map((branch) => (
                            <tr 
                              key={branch.branchId} 
                              className="hover:bg-gray-50 cursor-pointer transition-colors duration-200 group"
                              onClick={() => handleBranchClick(branch)}
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {branch.branchName}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {branch.branchCode}
                                    </div>
                                  </div>
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                    <HiArrowLeft className="h-4 w-4 text-gray-400 rotate-180" />
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-green-600">
                                  ₹{branch.income?.toLocaleString() || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {branch.incomeCount || 0} transactions
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-red-600">
                                  ₹{branch.expense?.toLocaleString() || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {branch.expenseCount || 0} transactions
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600">
                                  ₹{branch.purchase?.toLocaleString() || 0}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {branch.purchaseCount || 0} transactions
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className={`text-sm font-medium ${branch.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                  ₹{branch.netAmount?.toLocaleString() || 0}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">
                                  {(branch.incomeCount || 0) + (branch.expenseCount || 0) + (branch.purchaseCount || 0)}
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <HiClipboardDocumentList className="h-12 w-12 text-gray-300 mb-2" />
                                <p className="text-lg font-medium">No data found</p>
                                <p className="text-sm">
                                  {dateRangeFilter === 'custom' && fromDate && toDate
                                    ? `No transactions found for ${fromDate} to ${toDate}`
                                    : dateRangeFilter !== 'custom'
                                    ? `No transactions found for ${dateRangeOptions.find(d => d.value === dateRangeFilter)?.label}`
                                    : 'No transactions found for the current period'
                                  }
                                </p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                      {branchSummary.totals && branchSummary.summary?.length > 0 && (
                        <tfoot className="bg-gray-50">
                          <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              Total
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-600">
                              ₹{branchSummary.totals.totalIncome?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-600">
                              ₹{branchSummary.totals.totalExpense?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                              ₹{branchSummary.totals.totalPurchase?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              ₹{branchSummary.totals.totalNetAmount?.toLocaleString() || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                              {(branchSummary.totals.totalIncomeCount || 0) + (branchSummary.totals.totalExpenseCount || 0) + (branchSummary.totals.totalPurchaseCount || 0)}
                            </td>
                          </tr>
                        </tfoot>
                      )}
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        )
      ) : isAccountsManager ? (
        // Accounts Manager: Simplified view with only cards and table
        <div className="space-y-6">
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
              <StatCard
                title="Total Income"
                value={`₹${stats.summary?.totalIncome?.toLocaleString() || 0}`}
                icon={HiArrowUp}
                gradient="green"
                loading={statsLoading}
              />
              <StatCard
                title="Total Expense"
                value={`₹${stats.summary?.totalExpense?.toLocaleString() || 0}`}
                icon={HiArrowDown}
                gradient="red"
                loading={statsLoading}
              />
              <StatCard
                title="Net Profit"
                value={`₹${stats.summary?.netProfit?.toLocaleString() || 0}`}
                icon={HiCurrencyDollar}
                gradient="purple"
                loading={statsLoading}
              />
              <StatCard
                title="Total Transactions"
                value={stats.summary?.totalTransactions || 0}
                icon={HiClipboardDocumentList}
                gradient="blue"
                loading={statsLoading}
              />
            </div>
          )}

          {/* Search and Filter Section */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="w-full sm:w-80">
              <SearchInput
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search accounts..."
                icon={HiMagnifyingGlass}
              />
            </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0 sm:items-center">
              <Select
                value={dateRangeFilter}
                onChange={handleDateRangeFilter}
                options={dateRangeOptions}
                className="w-full sm:w-48"
              />
              {dateRangeFilter === 'custom' && (
                <>
                  <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">From</label>
                    <Input
                      type="date"
                      value={fromDate}
                      onChange={(e) => handleFromDateChange(e.target.value)}
                      className="w-full sm:w-40"
                    />
                  </div>
                  <div className="w-full sm:w-auto sm:flex sm:items-center sm:gap-2">
                    <label className="text-sm font-medium text-gray-700 whitespace-nowrap mb-2 sm:mb-0">To</label>
                    <Input
                      type="date"
                      value={toDate}
                      onChange={(e) => handleToDateChange(e.target.value)}
                      className="w-full sm:w-40"
                    />
                  </div>
                </>
              )}
              <Select
                value={paymentStatusFilter}
                onChange={handlePaymentStatusFilter}
                options={paymentStatusOptions}
                className="w-full sm:w-48"
              />
              <Select
                value={transactionTypeFilter}
                onChange={setTransactionTypeFilter}
                options={transactionTypeOptions}
                className="w-full sm:w-48"
              />
            </div>
          </div>

          {/* Accounts Table */}
          <div className="bg-white">
            <Table
              data={accounts}
              columns={columns}
              loading={loading}
              error={error}
              pagination={pagination}
              onPageChange={handlePageChange}
              emptyMessage="No accounts found"
              emptyIcon={HiClipboardDocumentList}
            />
          </div>
        </div>
      ) : (
        // Other roles: Tabbed interface
        <>
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('overview')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'overview'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HiClipboardDocumentList className="h-5 w-5" />
                  <span>Overview</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('purchases')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'purchases'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HiShoppingCart className="h-5 w-5" />
                  <span>Purchases</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <HiChartBar className="h-5 w-5" />
                  <span>Reports</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && renderOverviewContent()}
          {activeTab === 'purchases' && <PurchaseManagement />}
          {activeTab === 'reports' && <FinancialReports />}
        </>
      )}

      {/* View Account Modal */}
      <CommonModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Account Details"
        subtitle="View account transaction details"
        icon={HiEye}
        iconColor="from-blue-500 to-blue-600"
        size="lg"
        showCloseButton={true}
      >
        {accountToView && (
          <div className="space-y-6">
            {/* Account Header */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {accountToView.accountId}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {accountToView.transactionType === 'income' ? 'Income' : 'Expense'} Transaction
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  accountToView.transactionType === 'income' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {accountToView.transactionType.toUpperCase()}
                </div>
              </div>
            </div>

            {/* Account Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Amount</label>
                  <p className={`text-lg font-semibold ${
                    accountToView.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {accountToView.formattedAmount}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Category</label>
                  <p className="text-sm text-gray-900">
                    {accountToView.category.replace('_', ' ').toUpperCase()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Branch</label>
                  <p className="text-sm text-gray-900">
                    {accountToView.branchId?.branchName} ({accountToView.branchId?.branchCode})
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Status</label>
                  <p className={`text-sm font-medium ${
                    accountToView.paymentStatus === 'completed' ? 'text-green-600' :
                    accountToView.paymentStatus === 'pending' ? 'text-yellow-600' :
                    accountToView.paymentStatus === 'failed' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {accountToView.paymentStatus.toUpperCase()}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Transaction Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(accountToView.transactionDate).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Payment Method</label>
                  <p className="text-sm text-gray-900">
                    {accountToView.paymentMethod?.toUpperCase() || 'N/A'}
                  </p>
                </div>

                {accountToView.referenceNumber && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Reference Number</label>
                    <p className="text-sm text-gray-900">{accountToView.referenceNumber}</p>
                  </div>
                )}

                {accountToView.vendorName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vendor</label>
                    <p className="text-sm text-gray-900">{accountToView.vendorName}</p>
                  </div>
                )}

                {accountToView.customerName && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Customer</label>
                    <p className="text-sm text-gray-900">{accountToView.customerName}</p>
                  </div>
                )}
                
                {/* Payment Account / Ready Cash */}
                {(() => {
                  const paymentMethod = orderDetails?.paymentMethod || accountToView.paymentMethod;
                  const bankAccountId = orderDetails?.bankAccountId;
                  const isCashOrCod = paymentMethod && ['cash', 'cod'].includes(paymentMethod.toLowerCase());
                  const isBankPayment = paymentMethod && ['cash', 'card', 'netbanking'].includes(paymentMethod.toLowerCase());
                  
                  if (isCashOrCod && branchDetails) {
                    return (
                      <div>
                        <label className="text-sm font-medium text-gray-500">Payment Received Account</label>
                        <p className="text-sm text-gray-900 font-medium">
                          Ready Cash
                        </p>
                      </div>
                    );
                  }
                  
                  if (isBankPayment && bankAccountId && branchDetails?.bankAccounts) {
                    const bankAccount = Array.isArray(branchDetails.bankAccounts) 
                      ? branchDetails.bankAccounts.find(
                          acc => (acc._id && acc._id.toString() === bankAccountId) || 
                                 (acc.bankAccountNumber === bankAccountId)
                        )
                      : null;
                    
                    if (bankAccount) {
                      return (
                        <div>
                          <label className="text-sm font-medium text-gray-500">Payment Received Account</label>
                          <div className="text-sm text-gray-900">
                            <p className="font-medium">{bankAccount.bankName || 'Bank'}</p>
                            <p className="text-xs text-gray-600 mt-1">
                              Account: {bankAccount.bankAccountNumber || 'N/A'}
                            </p>
                            {bankAccount.bankIfsc && (
                              <p className="text-xs text-gray-600">IFSC: {bankAccount.bankIfsc}</p>
                            )}
                          </div>
                        </div>
                      );
                    }
                  }
                  
                  return null;
                })()}
              </div>
            </div>
            
            {loadingAccountDetails && (
              <div className="text-center py-4">
                <Loading />
                <p className="text-sm text-gray-500 mt-2">Loading payment account details...</p>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="text-sm font-medium text-gray-500">Description</label>
              <p className="text-sm text-gray-900 mt-1">{accountToView.description}</p>
            </div>

            {/* Notes */}
            {accountToView.notes && (
              <div>
                <label className="text-sm font-medium text-gray-500">Notes</label>
                <p className="text-sm text-gray-900 mt-1">{accountToView.notes}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowViewModal(false)}
                size="sm"
              >
                Close
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  setShowViewModal(false);
                  handleEditAccount(accountToView._id);
                }}
                icon={HiPencil}
                size="sm"
              >
                Edit Account
              </Button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* Supplier Details Modal */}
      <CommonModal
        isOpen={showSupplierDetailsModal}
        onClose={() => {
          setShowSupplierDetailsModal(false);
          setSelectedSupplier(null);
        }}
        title="Supplier Details"
        subtitle={selectedSupplier ? `Transaction details for ${selectedSupplier.supplierName || 'Unknown Supplier'}` : ''}
        size="lg"
        showCloseButton={true}
      >
        {selectedSupplier && (
          <div className="space-y-6">
            {/* Supplier Header */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedSupplier.supplierName || 'Unknown Supplier'}
                  </h3>
                  {selectedSupplier.supplierId && (
                    <p className="text-sm text-gray-600">
                      Supplier ID: {selectedSupplier.supplierId}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">Total Amount</div>
                  <div className="text-lg font-bold text-gray-900">
                    ₹{selectedSupplier.totalAmount?.toLocaleString() || 0}
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Summary Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Purchase Amount</label>
                  <p className="text-lg font-semibold text-blue-600">
                    ₹{selectedSupplier.purchaseAmount?.toLocaleString() || 0}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {selectedSupplier.purchaseCount || 0} purchase transaction(s)
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-500">Total Transactions</label>
                  <p className="text-lg font-semibold text-gray-900">
                    {selectedSupplier.transactionCount || 0}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Total Amount</label>
                  <p className="text-lg font-semibold text-green-600">
                    ₹{selectedSupplier.totalAmount?.toLocaleString() || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Transaction Details */}
            {selectedSupplier.transactions && selectedSupplier.transactions.length > 0 ? (
              <div>
                <h4 className="text-md font-semibold text-gray-900 mb-4">Transaction Details</h4>
                <div className="space-y-4">
                  {selectedSupplier.transactions.map((transaction, idx) => (
                    <div key={idx} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium text-gray-500">Date</label>
                            <p className="text-sm text-gray-900">
                              {transaction.transactionDate 
                                ? new Date(transaction.transactionDate).toLocaleDateString('en-IN', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  })
                                : 'N/A'}
                            </p>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium text-gray-500">Description</label>
                            <p className="text-sm text-gray-900">
                              {transaction.description || 'N/A'}
                            </p>
                          </div>

                          <div>
                            <label className="text-sm font-medium text-gray-500">Type</label>
                            <p>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                transaction.transactionType === 'purchase' 
                                  ? 'bg-blue-100 text-blue-800'
                                  : transaction.transactionType === 'expense'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {transaction.transactionType?.toUpperCase() || 'N/A'}
                              </span>
                            </p>
                          </div>

                          {transaction.rawMaterialName && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Raw Material</label>
                              <p className="text-sm text-gray-900">
                                {transaction.rawMaterialName}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3">
                          {transaction.quantity && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Quantity</label>
                              <p className="text-sm text-gray-900">
                                {transaction.quantity}
                              </p>
                            </div>
                          )}

                          {transaction.unitPrice && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Unit Price</label>
                              <p className="text-sm text-gray-900">
                                ₹{parseFloat(transaction.unitPrice).toLocaleString()}
                              </p>
                            </div>
                          )}

                          <div>
                            <label className="text-sm font-medium text-gray-500">Amount</label>
                            <p className="text-lg font-semibold text-gray-900">
                              ₹{transaction.amount?.toLocaleString() || '0'}
                            </p>
                          </div>

                          {transaction.invoiceNumber && (
                            <div>
                              <label className="text-sm font-medium text-gray-500">Invoice Number</label>
                              <p className="text-sm text-gray-900">
                                {transaction.invoiceNumber}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <HiClipboardDocumentList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No transaction details available</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setShowSupplierDetailsModal(false);
                  setSelectedSupplier(null);
                }}
                size="sm"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </CommonModal>

      {/* Delete Confirmation Modal */}
      <CommonModal
        isOpen={showDeleteModal}
        onClose={cancelDelete}
        title="Delete Account Entry"
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
              onClick={confirmDeleteAccount}
              size="sm"
            >
              Delete Entry
            </Button>
          </div>
        }
      >
        <div className="text-center py-4">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <HiTrash className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Are you sure you want to delete this account entry?
          </h3>
          {accountToDelete && (
            <div className="text-sm text-gray-500 mb-4">
              <p><strong>Account ID:</strong> {accountToDelete.accountId}</p>
              <p><strong>Type:</strong> {accountToDelete.transactionType}</p>
              <p><strong>Amount:</strong> {accountToDelete.formattedAmount}</p>
              <p><strong>Description:</strong> {accountToDelete.description}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone. The account entry will be permanently removed.
          </p>
        </div>
      </CommonModal>
    </div>
  );
};

export default AccountsPage;