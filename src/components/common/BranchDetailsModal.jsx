import React, { useState, useEffect } from 'react';
import {
  HiBuildingOffice2,
  HiTruck,
  HiChevronLeft,
  HiChevronRight
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';

const BranchDetailsModal = ({ 
  isOpen, 
  onClose, 
  branch, 
  onEdit, 
  onDelete,
  onActivate,
  onDisable
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Reset to page 1 when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
    }
  }, [isOpen]);

  // Early return - following the same pattern as other working modals
  if (!isOpen || !branch) return null;

  // Helper functions
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'short'
    });
  };

  // Format currency with proper precision
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '₹0.00';
    const num = Number(amount);
    if (isNaN(num)) return '₹0.00';
    return `₹${num.toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  };

  // Format account number with masking for security
  const formatAccountNumber = (accountNumber) => {
    if (!accountNumber) return 'N/A';
    const numStr = accountNumber.toString();
    if (numStr.length <= 4) return numStr;
    return `${'X'.repeat(numStr.length - 4)}${numStr.slice(-4)}`;
  };

  // Format IFSC code to uppercase
  const formatIFSC = (ifsc) => {
    if (!ifsc) return 'N/A';
    return ifsc.toString().toUpperCase();
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Branch Name',
        value: branch?.branchName || 'N/A'
      },
      {
        label: 'Address',
        value: branch?.address || 'N/A'
      },
      {
        label: 'Phone',
        value: branch?.phone || 'N/A'
      },
      {
        label: 'Email',
        value: branch?.email || 'N/A'
      },
      {
        label: 'Status',
        value: branch?.isActive ? 'Active' : 'Inactive',
        type: 'status'
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Manager',
        value: branch?.manager ? 
          `${branch.manager.firstName} ${branch.manager.lastName}` : 
          'N/A'
      },
      {
        label: 'Created Date',
        value: formatDate(branch?.createdAt)
      },
      {
        label: 'Description',
        value: branch?.description || 'No description available'
      }
    ]
  };

  // Ready cash info
  const readyCashInfo = {
    title: 'Ready Cash',
    fields: [
      {
        label: 'Ready Cash Amount',
        value: branch?.readyCashAmount !== undefined 
          ? `₹${Number(branch.readyCashAmount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` 
          : 'N/A'
      },
      {
        label: 'Ready Cash Remarks',
        value: branch?.readyCashRemarks || 'N/A'
      }
    ]
  };

  // Bank accounts - simplified
  const normalizedBankAccounts = branch && Array.isArray(branch.bankAccounts) && branch.bankAccounts.length > 0
    ? branch.bankAccounts
    : (branch && (branch.bankName || branch.bankAccountNumber || branch.bankIfsc || branch.bankBranch || branch.bankAccountHolder))
      ? [{
          bankName: branch.bankName || '',
          bankAccountHolder: branch.bankAccountHolder || '',
          bankAccountNumber: branch.bankAccountNumber || '',
          bankIfsc: branch.bankIfsc || '',
          bankBranch: branch.bankBranch || '',
          accountBalance: branch.accountBalance || 0
        }]
      : [];


  // Render Page 1: Basic Information
  const renderPage1 = () => {
    return (
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
    );
  };

  // Render Page 2: Bank Accounts and Courier Partners (Compact version)
  const renderPage2 = () => {
    return (
      <div className="space-y-3">
        {/* Bank Accounts Section */}
        {normalizedBankAccounts.length > 0 && (
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <HiBuildingOffice2 className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Bank Accounts</h3>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                {normalizedBankAccounts.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {normalizedBankAccounts.map((account, index) => (
                <div key={index} className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-blue-400 transition-all">
                  <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
                    <div className="p-1.5 bg-blue-50 border border-blue-200 rounded">
                      <HiBuildingOffice2 className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <h4 className="text-xs font-bold text-gray-900 uppercase">
                      {account.bankName || `Account ${index + 1}`}
                    </h4>
                  </div>
                  <div className="space-y-1.5">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase">Holder</span>
                        <p className="font-medium text-gray-900 truncate">{account.bankAccountHolder || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase">Branch</span>
                        <p className="font-medium text-gray-900 truncate">{account.bankBranch || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase">Account No.</span>
                        <p className="font-medium text-gray-900 font-mono text-[10px]">
                          {formatAccountNumber(account.bankAccountNumber)}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase">IFSC</span>
                        <p className="font-medium text-gray-900 font-mono text-[10px]">
                          {formatIFSC(account.bankIfsc)}
                        </p>
                      </div>
                    </div>
                    {account.accountBalance !== undefined && account.accountBalance !== null && (
                      <div className="pt-1.5 border-t border-gray-200">
                        <span className="text-[10px] font-medium text-gray-500 uppercase">Balance</span>
                        <p className="text-sm font-bold text-green-600">
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
            <div className="flex items-center space-x-2 mb-2">
              <HiTruck className="h-4 w-4 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-900">Courier Partners</h3>
              <span className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-xs">
                {branch.courierCodAmounts.length}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {branch.courierCodAmounts.map((courierCod, index) => {
                const courierPartner = courierCod.courierPartnerId;
                const partnerName = typeof courierPartner === 'object' 
                  ? (courierPartner.name || 'Unknown Partner')
                  : 'Unknown Partner';
                const totalCodAmount = courierCod.amount || 0;
                
                return (
                  <div key={index} className="bg-white border border-gray-300 rounded-lg p-3 shadow-sm hover:shadow-md hover:border-green-400 transition-all">
                    <div className="flex items-center space-x-2 mb-2 pb-2 border-b border-gray-200">
                      <div className="p-1.5 bg-green-50 border border-green-200 rounded">
                        <HiTruck className="h-3.5 w-3.5 text-green-600" />
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 uppercase">
                        {partnerName}
                      </h4>
                    </div>
                    <div className="space-y-1.5">
                      <div>
                        <span className="text-[10px] font-medium text-gray-500 uppercase">Total COD Amount</span>
                        <p className="text-sm font-bold text-green-600">
                          {formatCurrency(totalCodAmount)}
                        </p>
                      </div>
                      {courierCod.lastUpdated && (
                        <div className="pt-1.5 border-t border-gray-200">
                          <span className="text-[10px] font-medium text-gray-500 uppercase">Last Updated</span>
                          <p className="text-[10px] font-medium text-gray-700">{formatDate(courierCod.lastUpdated)}</p>
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
        {normalizedBankAccounts.length === 0 && (!branch || !branch.courierCodAmounts || branch.courierCodAmounts.length === 0) && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <HiBuildingOffice2 className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <h4 className="text-sm font-medium text-gray-900 mb-1">No Financial Information</h4>
            <p className="text-xs text-gray-600">No bank accounts or courier partners found for this branch.</p>
          </div>
        )}
      </div>
    );
  };

  const totalPages = 2;
  const hasPage2Content = normalizedBankAccounts.length > 0 || (branch && branch.courierCodAmounts && Array.isArray(branch.courierCodAmounts) && branch.courierCodAmounts.length > 0);
  
  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Branch Details"
      subtitle={branch?.branchName || ''}
      size="lg"
      showFooter={false}
    >
      <div className="space-y-4">
        <div>
          {/* Page Content */}
          {currentPage === 1 ? renderPage1() : renderPage2()}
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
