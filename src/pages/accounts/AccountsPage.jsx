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
import { Button, Input, Select, Table, StatusBadge, Loading, StatCard, CommonModal, SearchInput, Card } from '../../components/common';
import {
  getAllAccounts,
  getAccountStats,
  getBranchSummary,
  deleteAccount,
  getAccountById,
  getHeadOfficeSupplierExpenses,
  backfillUnrecordedRawMaterials,
  getUniqueVendors,
  getUniqueCustomers
} from '../../redux/actions/accountActions';
import { getOrderById } from '../../redux/actions/orderActions';
import { getBranchById, getAllBranches } from '../../redux/actions/branchActions';
import { getAllCourierPartners } from '../../redux/actions/courierPartnerActions';
import { getUniqueSuppliers } from '../../redux/actions/inventoryActions';
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
  // For accounts_manager, default to 'thisMonth' to show more data
  const [dateRangeFilter, setDateRangeFilter] = useState(
    user?.role === 'accounts_manager' ? 'thisMonth' : 'today'
  );
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
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Drill-down state for Super Admin
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showBranchDetails, setShowBranchDetails] = useState(false);
  const [isHeadOffice, setIsHeadOffice] = useState(false);
  const [supplierFilter, setSupplierFilter] = useState('all');
  const [backfilling, setBackfilling] = useState(false);
  const [showSupplierDetailsModal, setShowSupplierDetailsModal] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  
  // Tab state for branch details view
  const [branchDetailsTab, setBranchDetailsTab] = useState('summary'); // 'summary' or 'ledger'
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorLedgerTransactions, setVendorLedgerTransactions] = useState([]);
  const [vendorLedgerLoading, setVendorLedgerLoading] = useState(false);
  
  // Tab state for super admin branch summary view
  const [summaryViewTab, setSummaryViewTab] = useState('summary'); // 'summary' or 'ledger'
  const [summarySelectedVendor, setSummarySelectedVendor] = useState(null);
  const [summaryVendorLedgerTransactions, setSummaryVendorLedgerTransactions] = useState([]);
  const [summaryVendorLedgerLoading, setSummaryVendorLedgerLoading] = useState(false);
  
  // Tab state for Admin and Accounts Manager
  const [adminAccountsTab, setAdminAccountsTab] = useState('overview'); // 'overview' or 'ledger'
  const [adminSelectedVendor, setAdminSelectedVendor] = useState(null);
  const [adminVendorLedgerTransactions, setAdminVendorLedgerTransactions] = useState([]);
  const [adminVendorLedgerLoading, setAdminVendorLedgerLoading] = useState(false);

  // Role-based access
  const isSuperAdmin = user?.role === 'super_admin';
  const isAccountsManager = user?.role === 'accounts_manager';
  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';

  // Filter out lead incomes from accounts ledger
  // Note: Category filtering is now handled by the backend
  const filteredAccounts = useMemo(() => {
    if (!accounts || accounts.length === 0) return [];
    
    return accounts.filter(acc => {
      // Exclude lead incomes from ledger
      // Check 1: accountId starting with "PI" (lead income prefix)
      if (acc.accountId && acc.accountId.startsWith('PI')) {
        return false;
      }
      // Check 2: orderId exists and customerType is 'lead' (backup check)
      if (acc.orderId && typeof acc.orderId === 'object' && acc.orderId.customerType === 'lead') {
        return false;
      }
      return true;
    });
  }, [accounts]);

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

  // Read URL query parameters on mount and when location changes
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const categoryParam = searchParams.get('category');
    const transactionTypeParam = searchParams.get('transactionType');
    
    if (categoryParam) {
      setCategoryFilter(categoryParam);
    }
    if (transactionTypeParam) {
      setTransactionTypeFilter(transactionTypeParam);
    }
  }, [location.search]);

  // Load data on component mount
  useEffect(() => {
    if (activeTab === 'overview' || isAccountsManager || isAdmin || isSupervisor) {
      // For accounts managers, admins, and supervisors, always filter by their branch
      const branchId = (isAccountsManager || isAdmin || isSupervisor) ? (user?.branch?._id || user?.branch) : (branchFilter !== 'all' ? branchFilter : undefined);
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
        transactionType: transactionTypeFilter !== 'all' ? transactionTypeFilter : undefined,
        category: categoryFilter || undefined
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
  }, [activeTab, currentPage, searchTerm, dateRangeFilter, fromDate, toDate, branchFilter, paymentStatusFilter, transactionTypeFilter, dispatch, isSuperAdmin, isAccountsManager, isAdmin, isSupervisor, user?.branch?._id, user?.branch, getDateRange]);

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
    setBranchDetailsTab('summary');
    setSelectedVendor(null);
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
         const branchId = (isAccountsManager || isAdmin) ? (user?.branch?._id || user?.branch) : (branchFilter !== 'all' ? branchFilter : undefined);
         const dateRange = getDateRange();
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

  // Table columns - different for accounts managers, supervisors vs other roles
  const columns = isSupervisor ? [
    // View-only columns for supervisors
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
      key: 'vendorCustomer',
      label: 'Vendor/Customer',
      render: (account) => (
        <div>
          {account.vendorName && (
            <div>
              <div className="font-medium text-gray-900">{account.vendorName}</div>
              {account.referenceNumber && (
                <div className="text-xs text-gray-500">Ref: {account.referenceNumber}</div>
              )}
            </div>
          )}
          {account.customerName && (
            <div>
              <div className="font-medium text-gray-900">{account.customerName}</div>
              {account.referenceNumber && (
                <div className="text-xs text-gray-500">Ref: {account.referenceNumber}</div>
              )}
            </div>
          )}
          {!account.vendorName && !account.customerName && (
            <div className="text-sm text-gray-400">N/A</div>
          )}
        </div>
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
        </div>
      )
    }
  ] : isAccountsManager ? [
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
      key: 'vendorCustomer',
      label: 'Vendor/Customer',
      render: (account) => (
        <div>
          {account.vendorName && (
            <div>
              <div className="font-medium text-gray-900">{account.vendorName}</div>
              {account.referenceNumber && (
                <div className="text-xs text-gray-500">Ref: {account.referenceNumber}</div>
              )}
            </div>
          )}
          {account.customerName && (
            <div>
              <div className="font-medium text-gray-900">{account.customerName}</div>
              {account.referenceNumber && (
                <div className="text-xs text-gray-500">Ref: {account.referenceNumber}</div>
              )}
            </div>
          )}
          {!account.vendorName && !account.customerName && (
            <div className="text-sm text-gray-400">N/A</div>
          )}
        </div>
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
      key: 'vendorCustomer',
      label: 'Vendor/Customer',
      render: (account) => (
        <div>
          {account.vendorName && (
            <div>
              <div className="font-medium text-gray-900">{account.vendorName}</div>
              {account.referenceNumber && (
                <div className="text-xs text-gray-500">Ref: {account.referenceNumber}</div>
              )}
            </div>
          )}
          {account.customerName && (
            <div>
              <div className="font-medium text-gray-900">{account.customerName}</div>
              {account.referenceNumber && (
                <div className="text-xs text-gray-500">Ref: {account.referenceNumber}</div>
              )}
            </div>
          )}
          {!account.vendorName && !account.customerName && (
            <div className="text-sm text-gray-400">N/A</div>
          )}
        </div>
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
          data={filteredAccounts}
          columns={columns}
          loading={loading}
          error={error}
          pagination={{
            ...pagination,
            onPageChange: handlePageChange,
            itemName: 'accounts'
          }}
          emptyMessage="No accounts found"
          emptyIcon={HiClipboardDocumentList}
        />
      </div>
          </div>
        );
    }
  };

  // Check if viewing a vendor ledger (hide header and tabs)
  const isViewingVendorLedger = summarySelectedVendor !== null || selectedVendor !== null || adminSelectedVendor !== null;

  return (
    <div className="space-y-6">
      {/* Header - Hide when viewing vendor ledger */}
      {!isViewingVendorLedger && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Accounts Management</h1>
            <p className="mt-1 text-sm text-gray-500">
              {isSuperAdmin 
                ? 'Manage all branch accounts, expenses, and incomes across all branches' 
                : (isAccountsManager || isAdmin || isSupervisor)
                ? `Manage accounts, expenses, and incomes for ${user?.branch?.branchName || 'your branch'}`
                : 'Manage all branch accounts, expenses, and incomes'
              }
            </p>
          </div>
          {!isSupervisor && (
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
          )}
        </div>
      )}

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
              // Regular Branch Accounts View (No Tabs - Just Summary)
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
                    data={filteredAccounts}
                    columns={columns}
                    loading={loading}
                    error={error}
                    pagination={{
                      ...pagination,
                      onPageChange: handlePageChange,
                      itemName: 'accounts'
                    }}
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
          {/* Tabs - Hide when viewing vendor ledger */}
          {!isViewingVendorLedger && (
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setSummaryViewTab('summary');
                    setSummarySelectedVendor(null);
                  }}
                  className={`${
                    summaryViewTab === 'summary'
                      ? 'border-[#8bc34a] text-[#8bc34a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Branch Summary
                </button>
                <button
                  onClick={() => {
                    setSummaryViewTab('ledger');
                    setSummarySelectedVendor(null);
                  }}
                  className={`${
                    summaryViewTab === 'ledger'
                      ? 'border-[#8bc34a] text-[#8bc34a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Ledger
                </button>
              </nav>
            </div>
          )}

          {/* Tab Content */}
          {summaryViewTab === 'summary' ? (
            <>
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
            </>
          ) : (
            <LedgerTabContent
              selectedBranch={null}
              selectedVendor={summarySelectedVendor}
              setSelectedVendor={setSummarySelectedVendor}
              vendorLedgerTransactions={summaryVendorLedgerTransactions}
              setVendorLedgerTransactions={setSummaryVendorLedgerTransactions}
              vendorLedgerLoading={summaryVendorLedgerLoading}
              setVendorLedgerLoading={setSummaryVendorLedgerLoading}
              dateRangeFilter={dateRangeFilter}
              fromDate={fromDate}
              toDate={toDate}
              getDateRange={getDateRange}
              dispatch={dispatch}
              getAllAccounts={getAllAccounts}
              getAllCourierPartners={getAllCourierPartners}
              getUniqueSuppliers={getUniqueSuppliers}
              getAllBranches={getAllBranches}
              addNotification={addNotification}
              getUniqueVendors={getUniqueVendors}
              getUniqueCustomers={getUniqueCustomers}
              user={user}
            />
          )}
        </div>
        )
      ) : (isAccountsManager || isAdmin || isSupervisor) ? (
        // Accounts Manager, Admin, and Supervisor: View with tabs (Overview and Ledger)
        <div className="space-y-6">
          {/* Tabs - Hide when viewing vendor ledger */}
          {!isViewingVendorLedger && (
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => {
                    setAdminAccountsTab('overview');
                    setAdminSelectedVendor(null);
                  }}
                  className={`${
                    adminAccountsTab === 'overview'
                      ? 'border-[#8bc34a] text-[#8bc34a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Overview
                </button>
                <button
                  onClick={() => {
                    setAdminAccountsTab('ledger');
                    setAdminSelectedVendor(null);
                  }}
                  className={`${
                    adminAccountsTab === 'ledger'
                      ? 'border-[#8bc34a] text-[#8bc34a]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors`}
                >
                  Ledger
                </button>
              </nav>
            </div>
          )}

          {/* Tab Content */}
          {adminAccountsTab === 'overview' ? (
            <>
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
                  data={filteredAccounts}
                  columns={columns}
                  loading={loading}
                  error={error}
                  pagination={{
                    ...pagination,
                    onPageChange: handlePageChange,
                    itemName: 'accounts'
                  }}
                  emptyMessage="No accounts found"
                  emptyIcon={HiClipboardDocumentList}
                />
              </div>
            </>
          ) : (
            <LedgerTabContent
              selectedBranch={null}
              selectedVendor={adminSelectedVendor}
              setSelectedVendor={setAdminSelectedVendor}
              vendorLedgerTransactions={adminVendorLedgerTransactions}
              setVendorLedgerTransactions={setAdminVendorLedgerTransactions}
              vendorLedgerLoading={adminVendorLedgerLoading}
              setVendorLedgerLoading={setAdminVendorLedgerLoading}
              dateRangeFilter={dateRangeFilter}
              fromDate={fromDate}
              toDate={toDate}
              getDateRange={getDateRange}
              dispatch={dispatch}
              getAllAccounts={getAllAccounts}
              getAllCourierPartners={getAllCourierPartners}
              getUniqueSuppliers={getUniqueSuppliers}
              getAllBranches={getAllBranches}
              addNotification={addNotification}
              getUniqueVendors={getUniqueVendors}
              getUniqueCustomers={getUniqueCustomers}
              user={user}
            />
          )}
        </div>
      ) : (
        // Other roles (supervisor, etc.): Tabbed interface
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

// Ledger Tab Content Component
const LedgerTabContent = ({
  selectedBranch,
  selectedVendor,
  setSelectedVendor,
  vendorLedgerTransactions,
  setVendorLedgerTransactions,
  vendorLedgerLoading,
  setVendorLedgerLoading,
  dateRangeFilter,
  fromDate,
  toDate,
  getDateRange,
  dispatch,
  getAllAccounts,
  getAllCourierPartners,
  getUniqueSuppliers,
  getAllBranches,
  addNotification,
  getUniqueVendors,
  getUniqueCustomers,
  user = null // Add user prop to determine if branch-specific filtering should be used
}) => {
  const [suppliers, setSuppliers] = useState([]);
  const [courierPartners, setCourierPartners] = useState([]);
  const [expenseVendors, setExpenseVendors] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [vendorsLoading, setVendorsLoading] = useState(false);
  const [vendorBalance, setVendorBalance] = useState({ total: 0, credit: 0, debit: 0 });
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showTransactionDetails, setShowTransactionDetails] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Fetch vendors on mount
  useEffect(() => {
    const fetchVendors = async () => {
      setVendorsLoading(true);
      try {
        // Fetch suppliers (with pagination - fetch all pages)
        let allSuppliers = [];
        let supplierPage = 1;
        let hasMoreSuppliers = true;
        while (hasMoreSuppliers) {
          const suppliersResult = await dispatch(getUniqueSuppliers({ page: supplierPage, limit: 10 })).unwrap();
          const suppliersList = suppliersResult.data || [];
          allSuppliers = [...allSuppliers, ...suppliersList];
          const totalSupplierPages = suppliersResult.pagination?.totalPages || 1;
          hasMoreSuppliers = supplierPage < totalSupplierPages && suppliersList.length > 0;
          supplierPage++;
          if (supplierPage > 100) break; // Safety limit
        }
        setSuppliers(allSuppliers);

        // Fetch courier partners (with pagination - fetch all pages)
        let allCourierPartners = [];
        let courierPage = 1;
        let hasMoreCouriers = true;
        while (hasMoreCouriers) {
          const courierResult = await dispatch(getAllCourierPartners({ isActive: true, page: courierPage, limit: 10 })).unwrap();
          const courierList = courierResult.data?.courierPartners || [];
          allCourierPartners = [...allCourierPartners, ...courierList];
          const totalCourierPages = courierResult.pagination?.totalPages || 1;
          hasMoreCouriers = courierPage < totalCourierPages && courierList.length > 0;
          courierPage++;
          if (courierPage > 100) break; // Safety limit
        }
        setCourierPartners(allCourierPartners);

        // Fetch expense vendors (with pagination - fetch all pages)
        let allExpenseVendors = [];
        let vendorPage = 1;
        let hasMoreVendors = true;
        while (hasMoreVendors) {
          const vendorsResult = await dispatch(getUniqueVendors({ page: vendorPage, limit: 10 })).unwrap();
          const vendorsList = vendorsResult.data || [];
          allExpenseVendors = [...allExpenseVendors, ...vendorsList];
          const totalVendorPages = vendorsResult.pagination?.totalPages || 1;
          hasMoreVendors = vendorPage < totalVendorPages && vendorsList.length > 0;
          vendorPage++;
          if (vendorPage > 100) break; // Safety limit
        }
        setExpenseVendors(allExpenseVendors);

        // DO NOT fetch customers - ledger only tracks vendors
        // Customers are tracked separately in accounts section
        setCustomers([]);
      } catch (error) {
        console.error('Error fetching vendors:', error);
      } finally {
        setVendorsLoading(false);
      }
    };

    if (!selectedVendor) {
      fetchVendors();
    }
  }, [dispatch, getAllCourierPartners, getUniqueSuppliers, getUniqueVendors, getUniqueCustomers, selectedVendor]);

  // Fetch vendor ledger transactions when vendor is selected
  useEffect(() => {
    const fetchVendorLedger = async () => {
      if (!selectedVendor) return;

      setVendorLedgerLoading(true);
      try {
        // For super admin viewing vendor ledger, don't restrict by date range (or use a very wide range)
        // This ensures all vendor transactions are shown
        const isSuperAdminUser = user && user.role === 'super_admin';
        let dateRange = getDateRange();
        
        // If super admin and no date range is set (or it's too restrictive), fetch all transactions
        if (isSuperAdminUser && (!dateRange || dateRangeFilter === 'today')) {
          // For super admin, if date filter is 'today' or not set, fetch all transactions
          // Set a very wide date range (e.g., last 5 years) or null to fetch all
          dateRange = null; // null means no date filter - fetch all transactions
        }
        
        let branchId = selectedBranch ? (selectedBranch.branchId || selectedBranch._id) : null;

        // For suppliers: Raw material purchases are typically for Head Office
        // So we need to fetch from Head Office branch, not the selected branch
        // For courier partners: Orders are branch-specific, so use the selected branch
        // If no branch selected (summary view), fetch from Head Office for suppliers, or all branches for couriers
        // EXCEPTION: For Admin/Accounts Manager (branch-specific users), don't override branchId
        // Let getAllAccounts handle branch filtering automatically
        const isBranchSpecificUser = user && (user.role === 'admin' || user.role === 'accounts_manager' || user.role === 'supervisor');
        
        if (selectedVendor.type === 'supplier' && !isBranchSpecificUser) {
          // Only override for superadmin - for branch-specific users, let getAllAccounts handle it
          // Try to find Head Office branch ID
          try {
            const branchesResult = await dispatch(getAllBranches({ page: 1, limit: 1000 })).unwrap();
            const branches = branchesResult.data?.branches || branchesResult.data || [];
            const headOfficeBranch = branches.find(b => 
              b.branchName && b.branchName.toLowerCase() === 'head office'
            );
            if (headOfficeBranch) {
              branchId = headOfficeBranch._id || headOfficeBranch.id;
              console.log('[LedgerTabContent] Using Head Office branch for supplier:', branchId);
            } else {
              console.warn('[LedgerTabContent] Head Office branch not found, using selected branch or fetching all');
            }
          } catch (error) {
            console.error('[LedgerTabContent] Error fetching branches:', error);
            // Fall back to selected branch or null (all branches)
          }
        } else if (selectedVendor.type === 'courier' && !selectedBranch && !isBranchSpecificUser) {
          // For courier partners in summary view, we need to fetch from all branches
          // So we don't set branchId (will fetch all)
          // EXCEPTION: For branch-specific users, let getAllAccounts handle branch filtering
          branchId = undefined;
          console.log('[LedgerTabContent] Fetching courier transactions from all branches');
        } else if (selectedVendor.type === 'vendor') {
          // For expense vendors, use the user's branch (handled automatically by getAllAccounts for branch-specific users)
          // For superadmin, don't set branchId to fetch from all branches
          if (!isBranchSpecificUser) {
            branchId = undefined;
          } else {
            branchId = undefined; // Let getAllAccounts handle branch filtering
          }
          console.log('[LedgerTabContent] Fetching vendor transactions');
        } else if (selectedVendor.type === 'customer') {
          // For customers, use the user's branch (handled automatically by getAllAccounts for branch-specific users)
          // For superadmin, don't set branchId to fetch from all branches
          if (!isBranchSpecificUser) {
            branchId = undefined;
          } else {
            branchId = undefined; // Let getAllAccounts handle branch filtering
          }
          console.log('[LedgerTabContent] Fetching customer transactions');
        } else if (isBranchSpecificUser) {
          // For branch-specific users, don't set branchId - let getAllAccounts handle it
          branchId = undefined;
          console.log('[LedgerTabContent] Branch-specific user detected, letting getAllAccounts handle branch filtering');
        }

        // For suppliers, we need to get ALL accounts for the branch and filter by supplier
        // Don't use search query as it might miss some transactions that don't have vendorName set
        // If branchId is null/undefined and user is super admin, fetch from all branches
        // For super admin, fetch all transactions (no limit or very high limit)
        const accountParams = {
          page: 1,
          limit: isSuperAdminUser ? 10000 : 1000 // Higher limit for super admin to get all transactions
        };
        
        // Only add date filters if dateRange is provided
        if (dateRange) {
          accountParams.startDate = dateRange.startDate;
          accountParams.endDate = dateRange.endDate;
        }
        
        // Only add branchId if it's specified (for branch-specific view or Head Office for suppliers)
        if (branchId) {
          accountParams.branchId = branchId;
        }
        // If branchId is undefined/null, super admin will see all branches (no branchId filter)
        
        // Fetch all pages if needed for super admin
        let allTransactions = [];
        if (isSuperAdminUser && !branchId) {
          // Fetch all transactions across all pages for super admin
          let currentPage = 1;
          let hasMore = true;
          while (hasMore) {
            const result = await dispatch(getAllAccounts({
              ...accountParams,
              page: currentPage,
              limit: 1000
            })).unwrap();
            const pageTransactions = result.data?.accounts || [];
            allTransactions = [...allTransactions, ...pageTransactions];
            const totalPages = result.pagination?.totalPages || 1;
            hasMore = currentPage < totalPages && pageTransactions.length > 0;
            currentPage++;
            // Safety limit to prevent infinite loops
            if (currentPage > 100) break;
          }
        } else {
          const result = await dispatch(getAllAccounts(accountParams)).unwrap();
          allTransactions = result.data?.accounts || [];
        }

        const transactions = allTransactions;
        
        // Debug logging
        console.log('[LedgerTabContent] Selected vendor:', selectedVendor);
        console.log('[LedgerTabContent] Selected branch:', selectedBranch);
        console.log('[LedgerTabContent] Branch ID used:', branchId || 'ALL BRANCHES');
        console.log('[LedgerTabContent] Date range:', dateRange);
        console.log('[LedgerTabContent] Total transactions fetched:', transactions.length);
        
        // Log all transactions for debugging
        if (transactions.length > 0) {
          console.log('[LedgerTabContent] All transactions:', transactions.map(t => ({
            accountId: t.accountId,
            vendorName: t.vendorName,
            supplierId: t.supplierId,
            transactionType: t.transactionType,
            category: t.category,
            rawMaterialId: t.rawMaterialId ? (typeof t.rawMaterialId === 'object' ? {
              supplierName: t.rawMaterialId.supplierName,
              supplierId: t.rawMaterialId.supplierId
            } : 'ObjectId') : null,
            orderId: t.orderId ? (typeof t.orderId === 'object' ? {
              _id: t.orderId._id,
              courierPartnerId: t.orderId.courierPartnerId
            } : 'ObjectId') : null
          })));
        }
        
        // Filter transactions by vendor name/supplier ID with better matching
        // Exclude:
        // 1. Lead incomes (accountId starting with "PI" or orderId.customerType === 'lead')
        // 2. Any income transactions from orders (orderId exists) - only show manually created income
        // 3. For admin/supervisor/accounts_manager: Only show transactions with vendor AND branch
        
        const filteredTransactions = transactions.filter(acc => {
          // Exclude lead incomes from ledger
          // Check 1: accountId starting with "PI" (lead income prefix)
          if (acc.accountId && acc.accountId.startsWith('PI')) {
            return false;
          }
          // Check 2: orderId exists and customerType is 'lead' (backup check)
          if (acc.orderId && typeof acc.orderId === 'object' && acc.orderId.customerType === 'lead') {
            return false;
          }
          // Check 3: Exclude any income transactions that come from orders
          // Ledger only shows income created manually via accounts form (no orderId)
          if (acc.transactionType === 'income' && acc.orderId) {
            return false;
          }
          
          // For admin/supervisor/accounts_manager: Only show transactions with vendor AND branch
          const isBranchSpecificUser = user && (user.role === 'admin' || user.role === 'accounts_manager' || user.role === 'supervisor');
          if (isBranchSpecificUser) {
            // Must have vendor information (vendorName for expenses, or supplierId for purchases)
            const hasVendorInfo = acc.vendorName || acc.supplierId || 
                                 (acc.rawMaterialId && typeof acc.rawMaterialId === 'object' && acc.rawMaterialId.supplierId) ||
                                 (acc.orderId && typeof acc.orderId === 'object' && acc.orderId.courierPartnerId);
            
            // Must have branch information
            const hasBranchInfo = acc.branchId && (
              typeof acc.branchId === 'object' ? acc.branchId._id || acc.branchId : acc.branchId
            );
            
            if (!hasVendorInfo || !hasBranchInfo) {
              return false;
            }
          }
          
          if (selectedVendor.type === 'vendor') {
            // For expense vendors, match by vendorName and referenceNumber
            const normalize = (str) => (str || '').toString().trim().toLowerCase();
            const vendorNameMatch = acc.vendorName && normalize(acc.vendorName) === normalize(selectedVendor.vendorName);
            const referenceMatch = selectedVendor.referenceNumber 
              ? (acc.referenceNumber && normalize(acc.referenceNumber) === normalize(selectedVendor.referenceNumber))
              : true; // If no reference number in vendor, match any reference number
            
            const match = vendorNameMatch && referenceMatch;
            if (match) {
              console.log('[LedgerTabContent] Matched vendor transaction:', {
                accountId: acc.accountId,
                vendorName: acc.vendorName,
                referenceNumber: acc.referenceNumber,
                transactionType: acc.transactionType,
                category: acc.category
              });
            }
            return match;
          } else if (selectedVendor.type === 'supplier') {
            // Normalize strings for comparison (trim and lowercase)
            const normalize = (str) => (str || '').toString().trim().toLowerCase();
            
            // Check direct vendorName match
            const vendorNameMatch = acc.vendorName && normalize(acc.vendorName) === normalize(selectedVendor.supplierName);
            
            // Check direct supplierId match
            const supplierIdMatch = acc.supplierId && normalize(acc.supplierId) === normalize(selectedVendor.supplierId);
            
            // Check rawMaterialId if populated
            let rawMaterialMatch = false;
            if (acc.rawMaterialId && typeof acc.rawMaterialId === 'object') {
              const rawMaterial = acc.rawMaterialId;
              rawMaterialMatch = 
                (rawMaterial.supplierName && normalize(rawMaterial.supplierName) === normalize(selectedVendor.supplierName)) ||
                (rawMaterial.supplierId && normalize(rawMaterial.supplierId) === normalize(selectedVendor.supplierId));
            }
            
            const match = vendorNameMatch || supplierIdMatch || rawMaterialMatch;
            if (match) {
              console.log('[LedgerTabContent] Matched supplier transaction:', {
                accountId: acc.accountId,
                vendorName: acc.vendorName,
                supplierId: acc.supplierId,
                rawMaterialSupplierName: acc.rawMaterialId?.supplierName,
                rawMaterialSupplierId: acc.rawMaterialId?.supplierId,
                transactionType: acc.transactionType,
                category: acc.category
              });
            }
            return match;
          } else if (selectedVendor.type === 'courier') {
            // For courier partners, check orderId.courierPartnerId
            let orderCourierMatch = false;
            if (acc.orderId && typeof acc.orderId === 'object') {
              // Check if courierPartnerId is populated (object) or just an ID (string/ObjectId)
              if (acc.orderId.courierPartnerId) {
                const courierId = typeof acc.orderId.courierPartnerId === 'object' 
                  ? (acc.orderId.courierPartnerId._id || acc.orderId.courierPartnerId)
                  : acc.orderId.courierPartnerId;
                
                if (courierId) {
                  orderCourierMatch = courierId.toString() === selectedVendor._id.toString();
                }
              }
            }
            
            if (orderCourierMatch) {
              console.log('[LedgerTabContent] Matched courier transaction:', {
                accountId: acc.accountId,
                orderId: acc.orderId?._id,
                courierPartnerId: acc.orderId?.courierPartnerId,
                transactionType: acc.transactionType,
                category: acc.category
              });
            }
            
            return orderCourierMatch;
          }
          return false;
        });

        console.log('[LedgerTabContent] Filtered transactions count:', filteredTransactions.length);
        setVendorLedgerTransactions(filteredTransactions);

        // Calculate balance - include ALL transactions for total credit/debit display
        // But only unpaid transactions for balance calculation
        const balance = filteredTransactions.reduce((acc, txn) => {
          const amount = txn.amount || 0;
          const isPaid = txn.paymentStatus === 'completed';
          
          // Count all transactions for total credit/debit
          if (txn.transactionType === 'income') {
            acc.credit += amount;
          } else if (txn.transactionType === 'expense' || txn.transactionType === 'purchase') {
            acc.debit += amount;
          }
          
          // Only count unpaid transactions in balance
          if (!isPaid) {
            if (txn.transactionType === 'income') {
              acc.total += amount;
            } else if (txn.transactionType === 'expense' || txn.transactionType === 'purchase') {
              acc.total -= amount;
            }
          }
          return acc;
        }, { total: 0, credit: 0, debit: 0 });

        setVendorBalance(balance);
      } catch (error) {
        console.error('Error fetching vendor ledger:', error);
        dispatch(addNotification({
          type: 'error',
          message: 'Failed to fetch vendor ledger'
        }));
      } finally {
        setVendorLedgerLoading(false);
      }
    };

    fetchVendorLedger();
  }, [selectedVendor, selectedBranch, dateRangeFilter, fromDate, toDate, getDateRange, dispatch, getAllAccounts, getAllBranches]);

  // Combine all vendors (exclude customers - ledger only tracks vendors)
  const allVendors = useMemo(() => {
    const vendorList = [];
    
    // Add suppliers
    suppliers.forEach(supplier => {
      vendorList.push({
        _id: supplier.supplierId || supplier._id,
        name: supplier.supplierName || 'Unknown Supplier',
        type: 'supplier',
        supplierId: supplier.supplierId,
        supplierName: supplier.supplierName,
        contactName: supplier.contactName,
        phone: supplier.phone,
        email: supplier.email
      });
    });

    // Add courier partners
    courierPartners.forEach(courier => {
      vendorList.push({
        _id: courier._id,
        name: courier.name || 'Unknown Courier',
        type: 'courier',
        contactName: courier.contactName,
        phone: courier.phone,
        email: courier.email
      });
    });

    // Add expense vendors
    expenseVendors.forEach(vendor => {
      const vendorId = `${vendor.vendorName}_${vendor.referenceNumber || 'no-ref'}`;
      vendorList.push({
        _id: vendorId,
        name: vendor.vendorName || 'Unknown Vendor',
        type: 'vendor',
        vendorName: vendor.vendorName,
        referenceNumber: vendor.referenceNumber,
        transactionCount: vendor.transactionCount,
        totalAmount: vendor.totalAmount,
        lastTransactionDate: vendor.lastTransactionDate
      });
    });

    // DO NOT add customers - ledger only tracks vendors
    // Customers are tracked separately in accounts section

    return vendorList.sort((a, b) => a.name.localeCompare(b.name));
  }, [suppliers, courierPartners, expenseVendors]);

  // Paginate vendors
  const paginatedVendors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return allVendors.slice(startIndex, endIndex);
  }, [allVendors, currentPage]);

  // Calculate pagination info
  const totalPages = Math.ceil(allVendors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, allVendors.length);

  // Reset to page 1 when vendors change
  useEffect(() => {
    setCurrentPage(1);
  }, [allVendors.length]);

  if (selectedVendor) {
    // Calculate deposit amount for courier partners (sum of all credit transactions)
    const depositAmount = selectedVendor.type === 'courier' 
      ? vendorBalance.credit 
      : 0;
    
    // Calculate balance payable for vendors (negative total means payable)
    const balancePayable = selectedVendor.type !== 'courier' && vendorBalance.total < 0
      ? Math.abs(vendorBalance.total)
      : 0;
    
    // Show vendor ledger as standalone dashboard
    return (
      <div className="space-y-6">
        {/* Header with Back Button, Title, and Mini Summary */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
            <button
              onClick={() => setSelectedVendor(null)}
              className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              title="Back to Vendors"
            >
              <HiArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{selectedVendor.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedVendor.type === 'supplier' ? 'Supplier' : 
                 selectedVendor.type === 'courier' ? 'Courier Partner' : 
                 selectedVendor.type === 'customer' ? 'Customer' : 
                 'Vendor'} Ledger
                {selectedVendor.referenceNumber && (
                  <span className="ml-2 text-gray-400">({selectedVendor.referenceNumber})</span>
                )}
              </p>
            </div>
          </div>
          
          {/* Mini Summary */}
          <div className="flex flex-col gap-2 text-right min-w-[180px]">
            {selectedVendor.type === 'courier' && (
              <div className={`rounded-lg px-4 py-2.5 border ${
                depositAmount > 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-xs font-medium ${
                  depositAmount > 0 ? 'text-green-700' : 'text-gray-600'
                }`}>Deposit Amount</p>
                <p className={`text-sm font-semibold mt-0.5 ${
                  depositAmount > 0 ? 'text-green-900' : 'text-gray-700'
                }`}>
                  ₹{depositAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
            {selectedVendor.type !== 'courier' && (
              <div className={`rounded-lg px-4 py-2.5 border ${
                balancePayable > 0 
                  ? 'bg-red-50 border-red-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}>
                <p className={`text-xs font-medium ${
                  balancePayable > 0 ? 'text-red-700' : 'text-gray-600'
                }`}>Balance (Payable)</p>
                <p className={`text-sm font-semibold mt-0.5 ${
                  balancePayable > 0 ? 'text-red-900' : 'text-gray-700'
                }`}>
                  ₹{balancePayable.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Balance Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <StatCard
            title="Total Credit"
            value={`₹${vendorBalance.credit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={HiArrowUp}
            gradient="green"
            loading={vendorLedgerLoading}
          />
          <StatCard
            title="Total Debit"
            value={`₹${vendorBalance.debit.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={HiArrowDown}
            gradient="red"
            loading={vendorLedgerLoading}
          />
          <StatCard
            title={vendorBalance.total === 0 ? 'Balance (Paid)' : vendorBalance.total < 0 ? 'Balance (Payable)' : 'Balance (Receivable)'}
            value={`₹${Math.abs(vendorBalance.total).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            icon={HiCurrencyDollar}
            gradient={vendorBalance.total === 0 ? 'green' : vendorBalance.total >= 0 ? 'green' : 'red'}
            loading={vendorLedgerLoading}
          />
        </div>

        {/* Transactions Table */}
        <Card>
          {vendorLedgerLoading ? (
            <div className="flex justify-center py-8">
              <Loading />
            </div>
          ) : vendorLedgerTransactions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    {!selectedBranch && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Branch
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Credit
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Debit
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {vendorLedgerTransactions.map((txn) => {
                    const isCredit = txn.transactionType === 'income';
                    const isDebit = txn.transactionType === 'expense' || txn.transactionType === 'purchase';
                    
                    return (
                      <tr 
                        key={txn._id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedTransaction(txn);
                          setShowTransactionDetails(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(txn.transactionDate).toLocaleDateString('en-IN', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric'
                          })}
                        </td>
                        {!selectedBranch && (
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {txn.branchId && typeof txn.branchId === 'object' 
                              ? `${txn.branchId.branchName || 'N/A'} (${txn.branchId.branchCode || 'N/A'})`
                              : 'N/A'}
                          </td>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {txn.accountId || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {txn.category || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-green-600">
                          {isCredit ? `₹${(txn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-red-600">
                          {isDebit ? `₹${(txn.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <HiClipboardDocumentList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No transactions found for this vendor</p>
            </div>
          )}
        </Card>

        {/* Transaction Details Modal */}
        <CommonModal
          isOpen={showTransactionDetails}
          onClose={() => {
            setShowTransactionDetails(false);
            setSelectedTransaction(null);
          }}
          title="Transaction Details"
          size="lg"
          showFooter={false}
        >
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Account ID</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedTransaction.accountId || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Category</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {selectedTransaction.category || 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Transaction Type</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={selectedTransaction.transactionType}
                      variant={selectedTransaction.transactionType === 'income' ? 'success' : selectedTransaction.transactionType === 'expense' ? 'danger' : 'warning'}
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Payment Status</label>
                  <div className="mt-1">
                    <StatusBadge
                      status={selectedTransaction.paymentStatus}
                      variant={selectedTransaction.paymentStatus === 'completed' ? 'success' : selectedTransaction.paymentStatus === 'pending' ? 'warning' : 'danger'}
                    />
                  </div>
                </div>
                {!selectedBranch && selectedTransaction.branchId && (
                  <div>
                    <label className="text-xs text-gray-500 uppercase tracking-wider">Branch</label>
                    <p className="text-sm font-medium text-gray-900 mt-1">
                      {typeof selectedTransaction.branchId === 'object' 
                        ? `${selectedTransaction.branchId.branchName || 'N/A'} (${selectedTransaction.branchId.branchCode || 'N/A'})`
                        : 'N/A'}
                    </p>
                  </div>
                )}
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Amount</label>
                  <p className={`text-sm font-semibold mt-1 ${
                    selectedTransaction.transactionType === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₹{(selectedTransaction.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Date</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(selectedTransaction.transactionDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Time</label>
                  <p className="text-sm font-medium text-gray-900 mt-1">
                    {new Date(selectedTransaction.transactionDate).toLocaleTimeString('en-IN', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              </div>
              
              {selectedTransaction.description && (
                <div>
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Description</label>
                  <p className="text-sm text-gray-900 mt-1 bg-gray-50 p-3 rounded-lg">
                    {selectedTransaction.description}
                  </p>
                </div>
              )}

              {selectedTransaction.createdAt && (
                <div className="border-t pt-4">
                  <label className="text-xs text-gray-500 uppercase tracking-wider">Created At</label>
                  <p className="text-sm text-gray-600 mt-1">
                    {new Date(selectedTransaction.createdAt).toLocaleString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                      hour12: true
                    })}
                  </p>
                </div>
              )}
            </div>
          )}
        </CommonModal>
      </div>
    );
  }

  // Show vendors list
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {vendorsLoading ? (
          <div className="flex justify-center py-8">
            <Loading />
          </div>
        ) : allVendors.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vendor Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedVendors.map((vendor) => (
                  <tr key={vendor._id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {vendor.name}
                      </div>
                      {vendor.supplierId && (
                        <div className="text-xs text-gray-500">
                          ID: {vendor.supplierId}
                        </div>
                      )}
                      {vendor.referenceNumber && (
                        <div className="text-xs text-gray-500">
                          Ref: {vendor.referenceNumber}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge
                        status={vendor.type === 'supplier' ? 'Supplier' : 
                                vendor.type === 'courier' ? 'Courier Partner' : 
                                vendor.type === 'customer' ? 'Customer' : 
                                'Vendor'}
                        variant={vendor.type === 'supplier' ? 'info' : 
                                 vendor.type === 'courier' ? 'warning' : 
                                 vendor.type === 'customer' ? 'success' : 
                                 'primary'}
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="space-y-1">
                        {vendor.contactName && (
                          <div className="text-gray-900 font-medium">{vendor.contactName}</div>
                        )}
                        {vendor.phone && (
                          <div className="text-gray-600">{vendor.phone}</div>
                        )}
                        {vendor.email && (
                          <div className="text-gray-600">{vendor.email}</div>
                        )}
                        {vendor.supplierId && !vendor.contactName && !vendor.phone && !vendor.email && (
                          <div className="text-gray-600">ID: {vendor.supplierId}</div>
                        )}
                        {!vendor.contactName && !vendor.phone && !vendor.email && !vendor.supplierId && (
                          <div className="text-gray-400 italic">No contact info</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button
                        onClick={() => setSelectedVendor(vendor)}
                        className="inline-flex items-center justify-center w-8 h-8 text-[#8bc34a] hover:text-[#7cb342] hover:bg-green-50 rounded-lg transition-colors"
                        title="View Ledger"
                      >
                        <HiEye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <HiClipboardDocumentList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No vendors found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {allVendors.length > 0 && (
        <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-4 py-3">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{startIndex}</span> to{' '}
            <span className="font-medium">{endIndex}</span> of{' '}
            <span className="font-medium">{allVendors.length}</span> vendors
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
                if (
                  pageNum === 1 ||
                  pageNum === totalPages ||
                  (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1.5 text-sm font-medium rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-[#8bc34a] text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                } else if (
                  pageNum === currentPage - 2 ||
                  pageNum === currentPage + 2
                ) {
                  return <span key={pageNum} className="px-2 text-gray-500">...</span>;
                }
                return null;
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsPage;