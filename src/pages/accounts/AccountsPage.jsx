import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  HiChartBar
} from 'react-icons/hi2';
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal, SearchInput } from '../../components/common';
import {
  getAllAccounts,
  getAccountStats,
  getBranchSummary,
  deleteAccount
} from '../../redux/actions/accountActions';
import {
  selectAccounts,
  selectAccountLoading,
  selectAccountError,
  selectAccountStats,
  selectAccountStatsLoading,
  selectBranchSummary,
  selectBranchSummaryLoading,
  selectAccountPagination,
  clearAccountError
} from '../../redux/slices/accountSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import PurchaseManagement from '../../components/accounts/PurchaseManagement';
import FinancialReports from '../../components/accounts/FinancialReports';

const AccountsPage = () => {
  const navigate = useNavigate();
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
  const pagination = useSelector(selectAccountPagination);
  
  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [monthFilter, setMonthFilter] = useState('all');
  const [yearFilter, setYearFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [accountToView, setAccountToView] = useState(null);

  // Role-based access
  const isSuperAdmin = user?.role === 'super_admin';
  const isAccountsManager = user?.role === 'accounts_manager';

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'overview' || isAccountsManager) {
      // For accounts managers, always filter by their branch
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
      dispatch(getAccountStats({
        month: monthFilter !== 'all' ? monthFilter : undefined,
        year: yearFilter !== 'all' ? yearFilter : undefined,
        branchId: branchId
      }));
      
      // Load branch summary for super admin
      if (isSuperAdmin) {
        dispatch(getBranchSummary({
          month: monthFilter !== 'all' ? monthFilter : undefined,
          year: yearFilter !== 'all' ? yearFilter : undefined
        }));
      }
    }
  }, [activeTab, currentPage, searchTerm, monthFilter, yearFilter, branchFilter, paymentStatusFilter, dispatch, isSuperAdmin, isAccountsManager, user?.branch?._id, user?.branch]);

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  // Handle filters
  const handleMonthFilter = (value) => {
    setMonthFilter(value);
    setCurrentPage(1);
  };

  const handleYearFilter = (value) => {
    setYearFilter(value);
    setCurrentPage(1);
  };

  const handleBranchFilter = (value) => {
    setBranchFilter(value);
    setCurrentPage(1);
  };

  const handlePaymentStatusFilter = (value) => {
    setPaymentStatusFilter(value);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Handle add account
  const handleAddAccount = () => {
    navigate('/accounts/new');
  };

  // Handle view account
  const handleViewAccount = (id) => {
    const account = accounts.find(acc => acc._id === id);
    setAccountToView(account);
    setShowViewModal(true);
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
      key: 'description',
      label: 'Description',
      render: (account) => (
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {account.description}
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

  // Generate year options for last 5 years
  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: 'all', label: 'All Years' },
    ...Array.from({ length: 5 }, (_, i) => ({
      value: String(currentYear - i),
      label: String(currentYear - i)
    }))
  ];

  const paymentStatusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'completed', label: 'Completed' },
    { value: 'pending', label: 'Pending' },
    { value: 'failed', label: 'Failed' },
    { value: 'refunded', label: 'Refunded' }
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
                          <tr key={branch.branchId} className="hover:bg-gray-50">
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
                  gradient={stats.summary?.netProfit >= 0 ? 'green' : 'red'}
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
             <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
               <Select
                 value={monthFilter}
                 onChange={handleMonthFilter}
                 options={monthOptions}
                 className="w-full sm:w-48"
               />
               <Select
                 value={yearFilter}
                 onChange={handleYearFilter}
                 options={yearOptions}
                 className="w-full sm:w-48"
               />
               <Select
                 value={paymentStatusFilter}
                 onChange={handlePaymentStatusFilter}
                 options={paymentStatusOptions}
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
        // Super Admin: Branch Summary Dashboard
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
                gradient={stats.summary?.netProfit >= 0 ? 'green' : 'red'}
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
                placeholder="Search branches..."
                icon={HiMagnifyingGlass}
              />
            </div>
             <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
               <Select
                 value={monthFilter}
                 onChange={handleMonthFilter}
                 options={monthOptions}
                 className="w-full sm:w-48"
               />
               <Select
                 value={yearFilter}
                 onChange={handleYearFilter}
                 options={yearOptions}
                 className="w-full sm:w-48"
               />
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
                            <tr key={branch.branchId} className="hover:bg-gray-50">
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
                          ))
                        ) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                <HiClipboardDocumentList className="h-12 w-12 text-gray-300 mb-2" />
                                <p className="text-lg font-medium">No data found</p>
                                <p className="text-sm">
                                  {monthFilter !== 'all' && yearFilter !== 'all' 
                                    ? `No transactions found for ${monthOptions.find(m => m.value === monthFilter)?.label} ${yearFilter}`
                                    : monthFilter !== 'all'
                                    ? `No transactions found for ${monthOptions.find(m => m.value === monthFilter)?.label}`
                                    : yearFilter !== 'all'
                                    ? `No transactions found for ${yearFilter}`
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
                gradient={stats.summary?.netProfit >= 0 ? 'green' : 'red'}
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
            <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
              <Select
                value={monthFilter}
                onChange={handleMonthFilter}
                options={monthOptions}
                className="w-full sm:w-48"
              />
              <Select
                value={yearFilter}
                onChange={handleYearFilter}
                options={yearOptions}
                className="w-full sm:w-48"
              />
              <Select
                value={paymentStatusFilter}
                onChange={handlePaymentStatusFilter}
                options={paymentStatusOptions}
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
              </div>
            </div>

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