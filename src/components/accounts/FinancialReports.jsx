import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  HiChartBar,
  HiCurrencyDollar,
  HiArrowUp,
  HiArrowDown,
  HiBuildingOffice,
  HiShoppingCart,
  HiCube,
  HiClipboardDocumentList,
  HiCalendar,
  HiArrowDownTray,
  HiArrowPath
} from 'react-icons/hi2';
import { 
  Button, 
  Select, 
  StatCard, 
  Loading,
  Card
} from '../../components/common';
import {
  getFinancialReports,
  getAccountStats
} from '../../redux/actions/accountActions';
import {
  selectAccountReports,
  selectAccountReportsLoading,
  selectAccountStats,
  selectAccountStatsLoading,
  selectAccountError,
  clearAccountError
} from '../../redux/slices/accountSlice';
import { getAllBranches } from '../../redux/actions/branchActions';

const FinancialReports = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const reports = useSelector(selectAccountReports);
  const reportsLoading = useSelector(selectAccountReportsLoading);
  const stats = useSelector(selectAccountStats);
  const statsLoading = useSelector(selectAccountStatsLoading);
  const error = useSelector(selectAccountError);
  const { branches = [] } = useSelector((state) => state.branches);
  
  // Local state
  const [reportType, setReportType] = useState('all');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  
  // Load data on component mount
  useEffect(() => {
    dispatch(getAccountStats());
    dispatch(getAllBranches());
  }, [dispatch]);

  // Load reports when filters change
  useEffect(() => {
    const params = {
      reportType,
      branchId: selectedBranch !== 'all' ? selectedBranch : undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };
    
    dispatch(getFinancialReports(params));
  }, [reportType, selectedBranch, startDate, endDate, dispatch]);

  // Calculate date ranges
  const getDateRange = (range) => {
    const now = new Date();
    const start = new Date();
    
    switch (range) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return { startDate: '', endDate: '' };
    }
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: now.toISOString().split('T')[0]
    };
  };

  // Handle date range change
  const handleDateRangeChange = (range) => {
    setDateRange(range);
    if (range === 'custom') return;
    
    const dates = getDateRange(range);
    setStartDate(dates.startDate);
    setEndDate(dates.endDate);
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `₹${(amount || 0).toLocaleString('en-IN')}`;
  };

  // Calculate percentage change
  const calculatePercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  // Render income vs expense summary
  const renderIncomeExpenseSummary = () => {
    if (!reports?.incomeExpenseSummary) return null;
    
    const incomeData = reports.incomeExpenseSummary.find(item => item._id === 'income');
    const expenseData = reports.incomeExpenseSummary.find(item => item._id === 'expense');
    const purchaseData = reports.incomeExpenseSummary.find(item => item._id === 'purchase');
    
    const totalIncome = incomeData?.totalAmount || 0;
    const totalExpense = expenseData?.totalAmount || 0;
    const totalPurchase = purchaseData?.totalAmount || 0;
    const netProfit = totalIncome - totalExpense;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Income"
          value={formatCurrency(totalIncome)}
          icon={HiArrowUp}
          gradient="green"
          loading={reportsLoading}
        />
        <StatCard
          title="Total Expense"
          value={formatCurrency(totalExpense)}
          icon={HiArrowDown}
          gradient="red"
          loading={reportsLoading}
        />
        <StatCard
          title="Total Purchase"
          value={formatCurrency(totalPurchase)}
          icon={HiShoppingCart}
          gradient="blue"
          loading={reportsLoading}
        />
        <StatCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          icon={HiCurrencyDollar}
          gradient={netProfit >= 0 ? 'emerald' : 'red'}
          loading={reportsLoading}
        />
      </div>
    );
  };

  // Render category breakdown
  const renderCategoryBreakdown = () => {
    if (!reports?.categoryBreakdown) return null;
    
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Category Breakdown</h3>
          <HiChartBar className="h-6 w-6 text-blue-500" />
        </div>
        
        <div className="space-y-4">
          {reports.categoryBreakdown.map((typeData) => (
            <div key={typeData._id} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3 capitalize">
                {typeData._id} Categories
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {typeData.categories.map((category) => (
                  <div key={category.category} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900 capitalize">
                          {category.category.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-gray-500">{category.count} transactions</p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900">
                        {formatCurrency(category.totalAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Render branch performance
  const renderBranchPerformance = () => {
    if (!reports?.branchPerformance) return null;
    
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Branch Performance</h3>
          <HiBuildingOffice className="h-6 w-6 text-blue-500" />
        </div>
        
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
                  Net Profit
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transactions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reports.branchPerformance.map((branch) => (
                <tr key={branch.branchId}>
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
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(branch.totalIncome)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {formatCurrency(branch.totalExpense)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600 font-medium">
                    {formatCurrency(branch.totalPurchase)}
                  </td>
                  <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                    branch.netProfit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatCurrency(branch.netProfit)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {branch.transactionCount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  // Render purchase analysis
  const renderPurchaseAnalysis = () => {
    if (!reports?.purchaseAnalysis) return null;
    
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Purchase Analysis</h3>
          <HiCube className="h-6 w-6 text-blue-500" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.purchaseAnalysis.map((purchase) => (
            <div key={`${purchase._id.purchaseType}-${purchase._id.category}`} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-medium text-gray-900 capitalize">
                  {purchase._id.purchaseType.replace('_', ' ')} - {purchase._id.category.replace('_', ' ')}
                </h4>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Amount:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(purchase.totalAmount)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Quantity:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {purchase.totalQuantity || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg Unit Price:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatCurrency(purchase.avgUnitPrice)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Transactions:</span>
                  <span className="text-sm font-medium text-gray-900">
                    {purchase.count}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  };

  // Branch options
  const branchOptions = [
    { value: 'all', label: 'All Branches' },
    ...(branches?.map(branch => ({
      value: branch._id,
      label: branch.branchName
    })) || [])
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
          <p className="mt-1 text-sm text-gray-500">
            Comprehensive financial analysis and reporting
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-2">
          <Button
            onClick={() => dispatch(getFinancialReports({ reportType, branchId: selectedBranch, startDate, endDate }))}
            icon={HiArrowPath}
            variant="outline"
            size="sm"
            loading={reportsLoading}
          >
            Refresh
          </Button>
          <Button
            onClick={() => {/* Handle export */}}
            icon={HiArrowDownTray}
            variant="gradient"
            size="sm"
          >
            Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Report Type
            </label>
            <Select
              value={reportType}
              onChange={setReportType}
              options={[
                { value: 'all', label: 'All Reports' },
                { value: 'summary', label: 'Summary Only' },
                { value: 'category', label: 'Category Only' },
                { value: 'branch', label: 'Branch Only' },
                { value: 'purchase', label: 'Purchase Only' }
              ]}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Branch
            </label>
            <Select
              value={selectedBranch}
              onChange={setSelectedBranch}
              options={branchOptions}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date Range
            </label>
            <Select
              value={dateRange}
              onChange={handleDateRangeChange}
              options={[
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'quarter', label: 'Last Quarter' },
                { value: 'year', label: 'Last Year' },
                { value: 'custom', label: 'Custom Range' }
              ]}
            />
          </div>
          
          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg shadow-sm">
          <div className="flex items-center">
            <div className="ml-3">
              <p className="text-sm font-medium text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Reports Content */}
      {reportsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loading />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Income vs Expense Summary */}
          {(reportType === 'all' || reportType === 'summary') && renderIncomeExpenseSummary()}
          
          {/* Category Breakdown */}
          {(reportType === 'all' || reportType === 'category') && renderCategoryBreakdown()}
          
          {/* Branch Performance */}
          {(reportType === 'all' || reportType === 'branch') && renderBranchPerformance()}
          
          {/* Purchase Analysis */}
          {(reportType === 'all' || reportType === 'purchase') && renderPurchaseAnalysis()}
        </div>
      )}
    </div>
  );
};

export default FinancialReports;
