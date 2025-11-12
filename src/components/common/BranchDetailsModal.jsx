import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiCube,
  HiExclamationTriangle,
  HiCheckCircle as HiCheck,
  HiBuildingOffice2,
  HiTruck,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import { getBranchInventory } from '../../redux/actions/branchActions';
import { selectBranchInventory, selectInventoryLoading, selectInventoryError } from '../../redux/slices/branchSlice';
import { getAllOrders } from '../../redux/actions/orderActions';
import api from '../../lib/axiosInstance';

const BranchDetailsModal = ({ 
  isOpen, 
  onClose, 
  branch, 
  onEdit, 
  onDelete,
  onActivate,
  onDisable
}) => {
  const dispatch = useDispatch();
  const branchInventory = useSelector(selectBranchInventory);
  const inventoryLoading = useSelector(selectInventoryLoading);
  const inventoryError = useSelector(selectInventoryError);
  const [lastTransactionAmounts, setLastTransactionAmounts] = useState({});
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Load branch inventory when modal opens (skip for Head Office)
  useEffect(() => {
    if (isOpen && branch) {
      // Skip loading inventory for Head Office
      if (branch.branchName && branch.branchName.toLowerCase() === 'head office') {
        return;
      }
      
      const branchId = branch._id || branch.id;
      
      if (branchId) {
        dispatch(getBranchInventory(branchId));
      }
    }
  }, [isOpen, branch, dispatch]);

  // Fetch last transaction amounts for each courier partner
  useEffect(() => {
    const fetchLastTransactionAmounts = async () => {
      if (!isOpen || !branch || !branch.courierCodAmounts || branch.courierCodAmounts.length === 0) {
        return;
      }

      const branchId = branch._id || branch.id;
      if (!branchId) return;

      const amounts = {};
      
      try {
        // Fetch last order for each courier partner
        for (const courierCod of branch.courierCodAmounts) {
          const courierPartnerId = typeof courierCod.courierPartnerId === 'object' 
            ? courierCod.courierPartnerId._id || courierCod.courierPartnerId
            : courierCod.courierPartnerId;
          
          if (!courierPartnerId) continue;

          try {
            // Get recent orders for this branch to find the last transaction for this courier partner
            const response = await api.get('/orders', {
              params: {
                branchId: branchId,
                page: 1,
                limit: 50, // Fetch more orders to find the right one
                sortBy: 'createdAt',
                sortOrder: 'desc'
              }
            });

            const orders = response.data?.data?.orders || [];
            // Filter orders by courier partner ID and COD payment method
            const codOrders = orders.filter(order => {
              if (!order.courierPartnerId || order.paymentMethod !== 'cod' || !order.amountReceived || order.amountReceived <= 0) {
                return false;
              }
              
              const orderCourierId = typeof order.courierPartnerId === 'object' 
                ? (order.courierPartnerId._id || order.courierPartnerId)
                : order.courierPartnerId;
              
              return orderCourierId && orderCourierId.toString() === courierPartnerId.toString();
            });

            if (codOrders.length > 0) {
              // Get the most recent order (already sorted by createdAt desc)
              const lastOrder = codOrders[0];
              amounts[courierPartnerId.toString()] = lastOrder.amountReceived || 0;
            } else {
              amounts[courierPartnerId.toString()] = 0;
            }
          } catch (error) {
            console.error(`Error fetching last transaction for courier partner ${courierPartnerId}:`, error);
            amounts[courierPartnerId.toString()] = 0;
          }
        }

        setLastTransactionAmounts(amounts);
      } catch (error) {
        console.error('Error fetching last transaction amounts:', error);
      }
    };

    fetchLastTransactionAmounts();
  }, [isOpen, branch]);

  if (!isOpen || !branch) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Branch Name',
        value: branch.branchName || 'N/A'
      },
      {
        label: 'Address',
        value: branch.address || 'N/A'
      },
      {
        label: 'Phone',
        value: branch.phone || 'N/A'
      },
      {
        label: 'Email',
        value: branch.email || 'N/A'
      },
      {
        label: 'Status',
        value: branch.isActive ? 'Active' : 'Inactive',
        type: 'status'
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Manager',
        value: branch.manager ? 
          `${branch.manager.firstName} ${branch.manager.lastName}` : 
          'N/A'
      },
      {
        label: 'Created Date',
        value: formatDate(branch.createdAt)
      },
      {
        label: 'Description',
        value: branch.description || 'No description available'
      }
    ]
  };

  // Bank details and ready cash
  const normalizedBankAccounts = Array.isArray(branch.bankAccounts) && branch.bankAccounts.length > 0
    ? branch.bankAccounts
    : (branch.bankName || branch.bankAccountNumber || branch.bankIfsc || branch.bankBranch || branch.bankAccountHolder)
      ? [{
          bankName: branch.bankName,
          bankAccountHolder: branch.bankAccountHolder,
          bankAccountNumber: branch.bankAccountNumber,
          bankIfsc: branch.bankIfsc,
          bankBranch: branch.bankBranch,
          accountBalance: branch.accountBalance || 0
        }]
      : [];

  // Ready cash info
  const readyCashInfo = {
    title: 'Ready Cash',
    fields: [
      {
        label: 'Ready Cash Amount',
        value: branch.readyCashAmount !== undefined 
          ? `₹${Number(branch.readyCashAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : 'N/A'
      },
      {
        label: 'Ready Cash Remarks',
        value: branch.readyCashRemarks || 'N/A'
      }
    ]
  };

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getStockStatus = (quantity, minQuantity, maxQuantity) => {
    if (quantity <= minQuantity) return { status: 'Low Stock', color: 'text-red-600', bgColor: 'bg-red-100' };
    if (quantity <= minQuantity * 2) return { status: 'Medium Stock', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
    return { status: 'In Stock', color: 'text-green-600', bgColor: 'bg-green-100' };
  };

  const renderInventoryTable = () => {
    if (branchInventory.length === 0) {
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <HiCube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Inventory Items</h4>
          <p className="text-gray-600">This branch doesn't have any inventory items yet.</p>
        </div>
      );
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Current Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Level
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Availability
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {branchInventory.map((item, index) => {
              const stockStatus = getStockStatus(item.quantity, item.minQuantity, item.maxQuantity);
              
              return (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <HiCube className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {item.product?.productName || 'Unknown Product'}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {item.product?.productId || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{item.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.minQuantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.maxQuantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.bgColor} ${stockStatus.color}`}>
                      {stockStatus.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm">
                      {item.isAvailable ? (
                        <>
                          <HiCheck className="h-4 w-4 text-green-500 mr-1" />
                          <span className="text-green-700">Available</span>
                        </>
                      ) : (
                        <>
                          <HiExclamationTriangle className="h-4 w-4 text-red-500 mr-1" />
                          <span className="text-red-700">Unavailable</span>
                        </>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(item.lastUpdated)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };


  // Render Page 1: Basic Information and Inventory
  const renderPage1 = () => (
    <div className="space-y-4">
      {/* Basic, Additional and Ready Cash Information */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <DetailsView sections={[additionalInfo]} />
        </div>
        <div>
          <DetailsView sections={[basicInfo]} />
        </div>
        <div>
          <DetailsView sections={[readyCashInfo]} />
        </div>
      </div>

      {/* Branch Inventory Section - Hide for Head Office */}
      {branch.branchName && branch.branchName.toLowerCase() !== 'head office' && (
        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center space-x-2 mb-4">
            <HiCube className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Branch Inventory</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {branchInventory.length} items
            </span>
          </div>

          {inventoryLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Loading inventory...</span>
            </div>
          ) : inventoryError ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <HiExclamationTriangle className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-red-700">Failed to load inventory: {inventoryError}</span>
              </div>
            </div>
          ) : (
            renderInventoryTable()
          )}
        </div>
      )}
    </div>
  );

  // Render Page 2: Bank Accounts and Courier Partners
  const renderPage2 = () => (
    <div className="space-y-6">
      {/* Bank Accounts Section */}
      {normalizedBankAccounts.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <HiBuildingOffice2 className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Bank Accounts</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {normalizedBankAccounts.length} account{normalizedBankAccounts.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {normalizedBankAccounts.map((account, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <HiBuildingOffice2 className="h-4 w-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm font-semibold text-gray-900">
                      {account.bankName || `Bank Account ${index + 1}`}
                    </h4>
                  </div>
                </div>
                <div className="space-y-2">
                  <div>
                    <span className="text-xs font-medium text-gray-500">Account Holder</span>
                    <p className="text-sm text-gray-900 mt-0.5">{account.bankAccountHolder || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Account Number</span>
                    <p className="text-sm text-gray-900 mt-0.5 font-mono">{account.bankAccountNumber || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">IFSC Code</span>
                    <p className="text-sm text-gray-900 mt-0.5 font-mono">{account.bankIfsc || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-xs font-medium text-gray-500">Branch</span>
                    <p className="text-sm text-gray-900 mt-0.5">{account.bankBranch || 'N/A'}</p>
                  </div>
                  {account.accountBalance !== undefined && (
                    <div className="pt-2 border-t border-gray-100">
                      <span className="text-xs font-medium text-gray-500">Account Balance</span>
                      <p className="text-sm font-semibold text-green-600 mt-0.5">
                        {formatCurrency(account.accountBalance)}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Courier Partners Section */}
      {branch.courierCodAmounts && Array.isArray(branch.courierCodAmounts) && branch.courierCodAmounts.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-4">
            <HiTruck className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Courier Partners</h3>
            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-sm">
              {branch.courierCodAmounts.length} partner{branch.courierCodAmounts.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {branch.courierCodAmounts.map((courierCod, index) => {
              const courierPartner = courierCod.courierPartnerId;
              const courierPartnerId = typeof courierPartner === 'object' 
                ? (courierPartner._id || courierPartner)
                : courierPartner;
              const partnerName = typeof courierPartner === 'object' 
                ? (courierPartner.name || courierPartnerId?.name || 'Unknown Partner')
                : 'Unknown Partner';
              const partnerDepositAmount = typeof courierPartner === 'object' 
                ? (courierPartner.depositAmount || 0)
                : 0;
              const totalCodAmount = courierCod.amount || 0;
              const lastTransactionAmount = lastTransactionAmounts[courierPartnerId?.toString()] || 0;
              
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <HiTruck className="h-4 w-4 text-green-600" />
                      </div>
                      <h4 className="text-sm font-semibold text-gray-900">
                        {partnerName}
                      </h4>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs font-medium text-gray-500">Last Transaction Amount</span>
                      <p className="text-sm font-semibold text-blue-600 mt-0.5">
                        {formatCurrency(lastTransactionAmount)}
                      </p>
                    </div>
                    <div>
                      <span className="text-xs font-medium text-gray-500">Total COD Amount (This Branch)</span>
                      <p className="text-sm font-semibold text-green-600 mt-0.5">
                        {formatCurrency(totalCodAmount)}
                      </p>
                    </div>
                    {courierCod.lastUpdated && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-xs font-medium text-gray-500">Last Updated</span>
                        <p className="text-xs text-gray-600 mt-0.5">{formatDate(courierCod.lastUpdated)}</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Show message if no bank accounts or courier partners */}
      {normalizedBankAccounts.length === 0 && (!branch.courierCodAmounts || branch.courierCodAmounts.length === 0) && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <HiBuildingOffice2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Financial Information</h4>
          <p className="text-gray-600">No bank accounts or courier partners found for this branch.</p>
        </div>
      )}
    </div>
  );

  const totalPages = 2;
  const hasPage2Content = normalizedBankAccounts.length > 0 || (branch.courierCodAmounts && Array.isArray(branch.courierCodAmounts) && branch.courierCodAmounts.length > 0);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Branch Details"
      subtitle={branch.branchName}
      size="lg"
      showFooter={false}
    >
      <div className="space-y-4">
        {/* Page Content */}
        <div className="min-h-[400px]">
          {currentPage === 1 && renderPage1()}
          {currentPage === 2 && renderPage2()}
        </div>

        {/* Navigation Controls */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <HiChevronLeft className="h-5 w-5" />
          </button>

          <div className="flex items-center space-x-2">
            <span className={`w-2 h-2 rounded-full ${currentPage === 1 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
            <span className={`w-2 h-2 rounded-full ${currentPage === 2 ? 'bg-blue-600' : 'bg-gray-300'}`}></span>
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages || !hasPage2Content}
            className={`flex items-center justify-center w-8 h-8 rounded-lg transition-colors ${
              currentPage === totalPages || !hasPage2Content
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            <HiChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </CommonModal>
  );
};

export default BranchDetailsModal;
