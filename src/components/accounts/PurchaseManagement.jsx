import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiPlus,
  HiShoppingCart,
  HiCube,
  HiBuildingOffice,
  HiCurrencyDollar,
  HiEye,
  HiPencil,
  HiTrash,
  HiMagnifyingGlass
} from 'react-icons/hi2';
import { 
  Button, 
  Select, 
  Table, 
  StatusBadge, 
  Loading, 
  StatCard, 
  CommonModal, 
  SearchInput, 
  Pagination,
  Input,
  TextArea
} from '../../components/common';
import {
  getAllAccounts,
  getAccountStats,
  createRawMaterialPurchaseAccount,
  createBranchItemPurchaseAccount,
  deleteAccount
} from '../../redux/actions/accountActions';
import {
  selectAccounts,
  selectAccountLoading,
  selectAccountError,
  selectAccountStats,
  selectAccountStatsLoading,
  selectAccountPagination,
  selectAccountCreateLoading,
  clearAccountError
} from '../../redux/slices/accountSlice';
import { addNotification } from '../../redux/slices/uiSlice';
import { getAllRawMaterials } from '../../redux/actions/inventoryActions';
import { getAllProducts } from '../../redux/actions/productActions';
import { getAllBranches } from '../../redux/actions/branchActions';

const PurchaseManagement = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Redux state
  const accounts = useSelector(selectAccounts);
  const loading = useSelector(selectAccountLoading);
  const error = useSelector(selectAccountError);
  const stats = useSelector(selectAccountStats);
  const statsLoading = useSelector(selectAccountStatsLoading);
  const pagination = useSelector(selectAccountPagination);
  const createLoading = useSelector(selectAccountCreateLoading);
  const { user } = useSelector((state) => state.auth);
  
  // Additional state for purchase management
  const { rawMaterials = [] } = useSelector((state) => state.inventory);
  const { products = [] } = useSelector((state) => state.products);
  const { branches = [] } = useSelector((state) => state.branches);
  
  // Local state
  const [activeTab, setActiveTab] = useState('raw-materials');
  const [searchTerm, setSearchTerm] = useState('');
  const [purchaseTypeFilter, setPurchaseTypeFilter] = useState('all');
  const [branchFilter, setBranchFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);

  // Role-based access
  const isAccountsManager = user?.role === 'accounts_manager';
  
  // Form state
  const [formData, setFormData] = useState({
    purchaseType: 'centralized',
    rawMaterialId: '',
    productId: '',
    branchId: '',
    supplierId: '',
    supplierName: '',
    invoiceNumber: '',
    quantity: '',
    unitPrice: '',
    gstPercentage: 0,
    paymentMethod: 'cash',
    paymentStatus: 'completed',
    description: '',
    notes: '',
    paymentSource: 'ready_cash', // 'bank_account' or 'ready_cash'
    bankAccountIndex: '' // Index of bank account if paymentSource is 'bank_account'
  });

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllAccounts({
      page: currentPage,
      limit: 10,
      transactionType: 'purchase',
      search: searchTerm,
      purchaseType: purchaseTypeFilter !== 'all' ? purchaseTypeFilter : undefined,
      branchId: branchFilter !== 'all' ? branchFilter : undefined
    }));
    dispatch(getAccountStats());
    dispatch(getAllRawMaterials({ page: 1, limit: 1000 }));
    dispatch(getAllProducts({ page: 1, limit: 1000 }));
    dispatch(getAllBranches());
  }, [currentPage, searchTerm, purchaseTypeFilter, branchFilter, dispatch]);

  // Auto-select branch for accounts managers
  useEffect(() => {
    if (isAccountsManager && user?.branch && branches.length > 0) {
      const userBranchId = user.branch?._id || user.branch;
      setFormData(prev => ({
        ...prev,
        branchId: userBranchId
      }));
    }
  }, [isAccountsManager, user?.branch, branches.length]);

  // Filter accounts for purchase transactions
  const purchaseAccounts = accounts.filter(account => account.transactionType === 'purchase');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate payment source for Head Office centralized purchases
    if (activeTab === 'raw-materials' && formData.purchaseType === 'centralized') {
      const selectedBranch = branches.find(b => b._id === formData.branchId);
      const isHeadOffice = selectedBranch && selectedBranch.branchName && 
                          selectedBranch.branchName.toLowerCase() === 'head office';
      
      if (isHeadOffice) {
        if (formData.paymentSource === 'bank_account' && (!formData.bankAccountIndex || formData.bankAccountIndex === '')) {
          dispatch(addNotification({
            type: 'error',
            message: 'Please select a bank account'
          }));
          return;
        }
      }
    }
    
    try {
      if (activeTab === 'raw-materials') {
        await dispatch(createRawMaterialPurchaseAccount(formData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Raw material purchase account created successfully!'
        }));
      } else {
        await dispatch(createBranchItemPurchaseAccount(formData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Branch item purchase account created successfully!'
        }));
      }
      
      setShowCreateModal(false);
      setFormData({
        purchaseType: 'centralized',
        rawMaterialId: '',
        productId: '',
        branchId: '',
        supplierId: '',
        supplierName: '',
        invoiceNumber: '',
        quantity: '',
        unitPrice: '',
        gstPercentage: 0,
        paymentMethod: 'cash',
        paymentStatus: 'completed',
        description: '',
        notes: '',
        paymentSource: 'ready_cash',
        bankAccountIndex: ''
      });
      
      // Refresh accounts list and branches (to update balances)
      dispatch(getAllAccounts({
        page: currentPage,
        limit: 10,
        transactionType: 'purchase'
      }));
      dispatch(getAllBranches());
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to create purchase account entry'
      }));
    }
  };

  // Handle edit account
  const handleEditAccount = (id) => {
    navigate(`/accounts/edit/${id}`);
  };

  // Handle delete account
  const handleDeleteAccount = (accountId) => {
    const account = accounts.find(a => a._id === accountId);
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  // Confirm delete account
  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;
    
    try {
      await dispatch(deleteAccount(accountToDelete._id)).unwrap();
      dispatch(addNotification({
        type: 'success',
        message: 'Purchase account entry deleted successfully!'
      }));
      setShowDeleteModal(false);
      setAccountToDelete(null);
      
      // Refresh accounts list
      dispatch(getAllAccounts({
        page: currentPage,
        limit: 10,
        transactionType: 'purchase'
      }));
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || 'Failed to delete purchase account entry'
      }));
    }
  };

  // Get transaction type color
  const getTransactionTypeColor = (type) => {
    return type === 'purchase' ? 'blue' : 'gray';
  };

  // Get purchase type color
  const getPurchaseTypeColor = (type) => {
    return type === 'centralized' ? 'green' : 'orange';
  };

  // Table columns
  const columns = [
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
      key: 'purchaseType',
      label: 'Purchase Type',
      render: (account) => (
        <StatusBadge
          status={account.purchaseType}
          color={getPurchaseTypeColor(account.purchaseType)}
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
        <div className="font-medium text-red-600">
          {account.formattedAmount}
        </div>
      )
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (account) => (
        <div className="text-sm text-gray-900">
          {account.quantity || 'N/A'}
        </div>
      )
    },
    {
      key: 'supplier',
      label: 'Supplier',
      render: (account) => (
        <div>
          <div className="font-medium text-gray-900">
            {account.vendorName || 'N/A'}
          </div>
          <div className="text-sm text-gray-500">
            {account.supplierId || 'N/A'}
          </div>
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
        <div className="flex space-x-2">
          <button
            onClick={() => {/* Handle view */}}
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
          {!isAccountsManager && (
            <button
              onClick={() => handleDeleteAccount(account._id)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              title="Delete Account"
            >
              <HiTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  // Filter options
  const purchaseTypeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'centralized', label: 'Centralized' },
    { value: 'branch_specific', label: 'Branch Specific' }
  ];

  const branchOptions = [
    { value: 'all', label: 'All Branches' },
    ...(branches?.map(branch => ({
      value: branch._id,
      label: branch.branchName
    })) || [])
  ];

  const rawMaterialOptions = [
    { value: '', label: 'Select Raw Material' },
    ...(rawMaterials?.map(material => ({
      value: material._id,
      label: `${material.materialName} (${material.category})`
    })) || [])
  ];

  const productOptions = [
    { value: '', label: 'Select Product' },
    ...(products?.map(product => ({
      value: product._id,
      label: `${product.productName} (${product.category})`
    })) || [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Purchase Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage centralized and branch-wise inventory purchases
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            icon={HiPlus}
            size="sm"
          >
            Add Purchase
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('raw-materials')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'raw-materials'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <HiCube className="h-5 w-5" />
              <span>Raw Materials</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('branch-items')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'branch-items'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <HiBuildingOffice className="h-5 w-5" />
              <span>Branch Items</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Purchases"
          value={purchaseAccounts.length}
          icon={HiShoppingCart}
          gradient="blue"
          loading={statsLoading}
        />
        <StatCard
          title="Centralized Purchases"
          value={purchaseAccounts.filter(a => a.purchaseType === 'centralized').length}
          icon={HiCube}
          gradient="green"
          loading={statsLoading}
        />
        <StatCard
          title="Branch Purchases"
          value={purchaseAccounts.filter(a => a.purchaseType === 'branch_specific').length}
          icon={HiBuildingOffice}
          gradient="orange"
          loading={statsLoading}
        />
        <StatCard
          title="Total Amount"
          value={`₹${purchaseAccounts.reduce((sum, a) => sum + (a.amount || 0), 0).toLocaleString()}`}
          icon={HiCurrencyDollar}
          gradient="red"
          loading={statsLoading}
        />
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            placeholder="Search purchases..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            icon={HiMagnifyingGlass}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
          <div className="w-full sm:w-48">
            <Select
              options={purchaseTypeOptions}
              value={purchaseTypeFilter}
              onChange={(value) => {
                setPurchaseTypeFilter(value);
                setCurrentPage(1);
              }}
              placeholder="All Types"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={branchOptions}
              value={branchFilter}
              onChange={(value) => {
                setBranchFilter(value);
                setCurrentPage(1);
              }}
              placeholder="All Branches"
            />
          </div>
        </div>
      </div>

      {/* Results Info */}
      {purchaseAccounts.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing {((currentPage - 1) * 10) + 1}-{Math.min(currentPage * 10, purchaseAccounts.length)} of {purchaseAccounts.length} purchases
          </div>
        </div>
      )}

      {/* Purchase Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <Table
          data={purchaseAccounts}
          columns={columns}
          loading={loading}
          error={error}
          pagination={pagination}
          onPageChange={setCurrentPage}
          emptyMessage="No purchases found"
          emptyIcon={HiShoppingCart}
        />
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          itemsPerPage={10}
          onPageChange={setCurrentPage}
          startIndex={((currentPage - 1) * 10) + 1}
          endIndex={Math.min(currentPage * 10, pagination.total)}
        />
      )}

      {/* Create Purchase Modal */}
      <CommonModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title={`Add ${activeTab === 'raw-materials' ? 'Raw Material' : 'Branch Item'} Purchase`}
        subtitle="Create a new purchase account entry"
        icon={HiShoppingCart}
        iconColor="from-blue-500 to-blue-600"
        size="lg"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateModal(false)}
              size="sm"
            >
              Cancel
            </Button>
            <Button
              variant="gradient"
              onClick={handleSubmit}
              size="sm"
              loading={createLoading}
              disabled={createLoading}
            >
              Create Purchase
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Purchase Type
              </label>
              <Select
                value={formData.purchaseType}
                onChange={(value) => setFormData({ ...formData, purchaseType: value })}
                options={[
                  { value: 'centralized', label: 'Centralized' },
                  { value: 'branch_specific', label: 'Branch Specific' }
                ]}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch
              </label>
              <Select
                value={formData.branchId}
                onChange={(value) => setFormData({ ...formData, branchId: value })}
                options={branchOptions}
                placeholder="Select Branch"
                disabled={isAccountsManager}
                className={isAccountsManager ? 'opacity-60 cursor-not-allowed' : ''}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeTab === 'raw-materials' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Raw Material
                </label>
                <Select
                  value={formData.rawMaterialId}
                  onChange={(value) => setFormData({ ...formData, rawMaterialId: value })}
                  options={rawMaterialOptions}
                  placeholder="Select Raw Material"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product
                </label>
                <Select
                  value={formData.productId}
                  onChange={(value) => setFormData({ ...formData, productId: value })}
                  options={productOptions}
                  placeholder="Select Product"
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Supplier Name
              </label>
              <Input
                value={formData.supplierName}
                onChange={(e) => setFormData({ ...formData, supplierName: e.target.value })}
                placeholder="Enter supplier name"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantity
              </label>
              <Input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder="Enter quantity"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unit Price (₹)
              </label>
              <Input
                type="number"
                value={formData.unitPrice}
                onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                placeholder="Enter unit price"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                GST %
              </label>
              <Input
                type="number"
                value={formData.gstPercentage}
                onChange={(e) => setFormData({ ...formData, gstPercentage: e.target.value })}
                placeholder="Enter GST percentage"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Invoice Number
              </label>
              <Input
                value={formData.invoiceNumber}
                onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                placeholder="Enter invoice number"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Method
              </label>
              <Select
                value={formData.paymentMethod}
                onChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                options={[
                  { value: 'cash', label: 'Cash' },
                  { value: 'card', label: 'Card' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'netbanking', label: 'Net Banking' },
                  { value: 'cheque', label: 'Cheque' }
                ]}
              />
            </div>
          </div>

          {/* Payment Source Selection - Only for centralized raw material purchases from Head Office */}
          {activeTab === 'raw-materials' && formData.purchaseType === 'centralized' && (() => {
            const selectedBranch = branches.find(b => b._id === formData.branchId);
            const isHeadOffice = selectedBranch && selectedBranch.branchName && 
                                selectedBranch.branchName.toLowerCase() === 'head office';
            
            if (!isHeadOffice) return null;

            const headOfficeBranch = selectedBranch;
            const bankAccounts = Array.isArray(headOfficeBranch.bankAccounts) && headOfficeBranch.bankAccounts.length > 0
              ? headOfficeBranch.bankAccounts
              : [];

            const bankAccountOptions = bankAccounts.map((acc, index) => ({
              value: String(index),
              label: `${acc.bankName || 'Bank'} - ${acc.bankAccountNumber || 'N/A'} (Balance: ₹${(acc.accountBalance || 0).toLocaleString()})`
            }));

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Payment Source *
                  </label>
                  <Select
                    value={formData.paymentSource}
                    onChange={(value) => {
                      setFormData({ 
                        ...formData, 
                        paymentSource: value,
                        bankAccountIndex: value === 'bank_account' ? formData.bankAccountIndex : ''
                      });
                    }}
                    options={[
                      { value: 'ready_cash', label: `Ready Cash (Balance: ₹${(headOfficeBranch.readyCashAmount || 0).toLocaleString()})` },
                      ...(bankAccountOptions.length > 0 ? [{ value: 'bank_account', label: 'Bank Account' }] : [])
                    ]}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Select from which account the amount should be deducted
                  </p>
                </div>

                {formData.paymentSource === 'bank_account' && bankAccountOptions.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Bank Account *
                    </label>
                    <Select
                      value={formData.bankAccountIndex}
                      onChange={(value) => setFormData({ ...formData, bankAccountIndex: value })}
                      options={bankAccountOptions}
                      placeholder="Select Bank Account"
                    />
                  </div>
                )}
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <TextArea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <TextArea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter additional notes"
              rows={2}
            />
          </div>
        </form>
      </CommonModal>

      {/* Delete Confirmation Modal */}
      <CommonModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Purchase Entry"
        subtitle="This action cannot be undone"
        icon={HiTrash}
        iconColor="from-red-500 to-red-600"
        size="sm"
        showFooter={true}
        footerContent={
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
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
            Are you sure you want to delete this purchase entry?
          </h3>
          {accountToDelete && (
            <div className="text-sm text-gray-500 mb-4">
              <p><strong>Account ID:</strong> {accountToDelete.accountId}</p>
              <p><strong>Type:</strong> {accountToDelete.purchaseType}</p>
              <p><strong>Amount:</strong> {accountToDelete.formattedAmount}</p>
              <p><strong>Description:</strong> {accountToDelete.description}</p>
            </div>
          )}
          <p className="text-sm text-gray-500">
            This action cannot be undone. The purchase entry will be permanently removed.
          </p>
        </div>
      </CommonModal>
    </div>
  );
};

export default PurchaseManagement;
