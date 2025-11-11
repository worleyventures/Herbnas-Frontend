import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { 
  HiUsers, 
  HiCurrencyDollar, 
  HiArrowTrendingUp, 
  HiCube,
  HiBuildingOffice2
} from 'react-icons/hi2';
import { AccountsModal } from '../../components/common';
import api from '../../lib/axiosInstance';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Dashboard = () => {
  // Modal state
  const [showAccountsModal, setShowAccountsModal] = useState(false);
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    revenue: 0,
    expenses: 0,
    inventory: 0,
    leads: 0
  });
  const [monthlyData, setMonthlyData] = useState([]);
  const [branchPerformance, setBranchPerformance] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [recentLeads, setRecentLeads] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  
  // Get current user for role-based functionality
  const { user } = useSelector((state) => state.auth);
  
  // Check if user is production manager
  const isProductionManager = user?.role === 'production_manager';

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format number with commas
  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-IN').format(num);
  };

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch account stats for revenue and expenses
        const accountStatsResponse = await api.get('/accounts/stats');
        const accountStats = accountStatsResponse.data?.data;
        
        // Fetch inventory stats
        const inventoryStatsResponse = await api.get('/inventory/stats');
        const inventoryStats = inventoryStatsResponse.data?.data?.stats;
        
        // Fetch lead stats
        const leadStatsResponse = await api.get('/leads/admin/stats');
        const leadStats = leadStatsResponse.data?.data;
        
        // Fetch recent leads
        const recentLeadsResponse = await api.get('/leads?limit=5&sortBy=createdAt&sortOrder=desc');
        const leads = recentLeadsResponse.data?.data?.leads || [];
        
        // Fetch low stock items (raw materials with low stock)
        const lowStockResponse = await api.get('/inventory/raw-materials?stockStatus=low&limit=10');
        const lowStock = lowStockResponse.data?.data?.rawMaterials || [];
        
        // Fetch branch summary for branch performance
        let branchData = [];
        if (user?.role === 'super_admin') {
          try {
            const branchSummaryResponse = await api.get('/accounts/branch-summary');
            branchData = branchSummaryResponse.data?.data?.summary || [];
          } catch (error) {
            console.error('Error fetching branch summary:', error);
          }
        }
        
        // Calculate monthly revenue vs expenses (last 6 months)
        const monthlyRevenueExpenses = [];
        const currentDate = new Date();
        for (let i = 5; i >= 0; i--) {
          const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const month = date.toLocaleString('default', { month: 'short' });
          const year = date.getFullYear();
          
          try {
            const monthStatsResponse = await api.get('/accounts/stats', {
              params: {
                month: date.getMonth() + 1,
                year: year
              }
            });
            const monthStats = monthStatsResponse.data?.data;
            monthlyRevenueExpenses.push({
              month: `${month} ${year}`,
              revenue: monthStats?.summary?.totalIncome || 0,
              expenses: monthStats?.summary?.totalExpense || 0
            });
          } catch (error) {
            monthlyRevenueExpenses.push({
              month: `${month} ${year}`,
              revenue: 0,
              expenses: 0
            });
          }
        }
        
        // Calculate expense breakdown from category breakdown
        const expenseCategories = [];
        if (accountStats?.categoryBreakdown) {
          const expenseCategoryData = accountStats.categoryBreakdown.find(
            item => item._id === 'expense'
          );
          if (expenseCategoryData?.categories) {
            expenseCategories.push(...expenseCategoryData.categories.map(cat => ({
              name: cat.category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
              value: cat.totalAmount
            })));
          }
        }
        
        // Update state
        setStats({
          revenue: accountStats?.summary?.totalIncome || 0,
          expenses: accountStats?.summary?.totalExpense || 0,
          inventory: inventoryStats?.rawMaterials?.totalItems || 0,
          leads: leadStats?.overview?.totalLeads || 0
        });
        
        setMonthlyData(monthlyRevenueExpenses);
        setBranchPerformance(branchData.slice(0, 10)); // Top 10 branches
        setLowStockItems(lowStock);
        setRecentLeads(leads);
        setExpenseBreakdown(expenseCategories);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user?.role]);

  // Chart colors
  const COLORS = ['#8bc34a', '#558b2f', '#4caf50', '#81c784', '#a5d6a7', '#c8e6c9'];

  const getStatusColor = (status) => {
    switch (status) {
      case 'new_lead': return 'bg-blue-100 text-blue-800';
      case 'qualified': return 'bg-gradient-to-r from-[#8bc34a]/10 to-[#558b2f]/10 text-[#558b2f] border border-[#558b2f]/20';
      case 'order_completed': return 'bg-green-100 text-green-800';
      case 'unqualified': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status) => {
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your business today.</p>
          </div>
          <div className="flex items-center space-x-3">
            <button className="bg-gradient-to-r from-[#8bc34a] to-[#558b2f] text-white px-4 py-2 rounded-lg hover:from-[#558b2f] hover:to-[#4a7c2a] shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
              <HiArrowTrendingUp className="h-4 w-4" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards: Revenue | Expenses | Inventory | Leads */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.revenue)}</p>
            </div>
            <div className="bg-green-500 p-3 rounded-lg">
              <HiCurrencyDollar className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Expenses</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(stats.expenses)}</p>
            </div>
            <div className="bg-red-500 p-3 rounded-lg">
              <HiArrowTrendingUp className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Inventory</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.inventory)}</p>
            </div>
            <div className="bg-gradient-to-r from-[#8bc34a] to-[#558b2f] p-3 rounded-lg">
              <HiCube className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Leads</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatNumber(stats.leads)}</p>
            </div>
            <div className="bg-blue-500 p-3 rounded-lg">
              <HiUsers className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Chart 1: Monthly Revenue vs Expenses */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue vs Expenses</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="revenue" stroke="#8bc34a" strokeWidth={2} name="Revenue" />
            <Line type="monotone" dataKey="expenses" stroke="#f44336" strokeWidth={2} name="Expenses" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart 2: Branch Performance Comparison */}
      {user?.role === 'super_admin' && branchPerformance.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="branchName" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="income" fill="#8bc34a" name="Income" />
              <Bar dataKey="expense" fill="#f44336" name="Expense" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Table 1: Low Stock Items & Table 2: Recent Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Table 1: Low Stock Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Low Stock Items</h3>
            <p className="text-sm text-gray-600 mt-1">Items that need restocking</p>
          </div>
          <div className="p-6">
            {lowStockItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 px-3 text-sm font-medium text-gray-700">Material</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Stock</th>
                      <th className="text-right py-2 px-3 text-sm font-medium text-gray-700">Min Level</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStockItems.map((item) => (
                      <tr key={item._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-2 px-3 text-sm text-gray-900">{item.materialName}</td>
                        <td className="py-2 px-3 text-sm text-right text-gray-900">{formatNumber(item.stockQuantity || 0)}</td>
                        <td className="py-2 px-3 text-sm text-right text-gray-600">{formatNumber(item.minStockLevel || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No low stock items</div>
            )}
          </div>
        </div>

        {/* Table 2: Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
            <p className="text-sm text-gray-600 mt-1">Latest leads added to your system</p>
          </div>
          <div className="p-6">
            {recentLeads.length > 0 ? (
              <div className="space-y-4">
                {recentLeads.map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-semibold text-sm">
                          {lead.customerName?.charAt(0) || lead.customerMobile?.charAt(0) || 'L'}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {lead.customerName || lead.customerMobile || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500">{lead.customerMobile || lead.email || 'No contact'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.leadStatus)}`}>
                        {formatStatus(lead.leadStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">No recent leads</div>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Expense Breakdown (Pie Chart) */}
      {expenseBreakdown.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={expenseBreakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {expenseBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40">
            <HiUsers className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Add Lead</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40">
            <HiCube className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Manage Inventory</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40">
            <HiBuildingOffice2 className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Add Branch</span>
          </button>
          {!isProductionManager && (
            <button 
              onClick={() => setShowAccountsModal(true)}
              className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40"
            >
              <HiCurrencyDollar className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-sm font-medium text-[#558b2f]">Accounts</span>
            </button>
          )}
        </div>
      </div>

      {/* Accounts Modal - only show for non-production managers */}
      {!isProductionManager && (
        <AccountsModal
          isOpen={showAccountsModal}
          onClose={() => setShowAccountsModal(false)}
        />
      )}
    </div>
  );
};

export default Dashboard;
