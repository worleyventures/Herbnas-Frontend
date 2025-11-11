import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { 
  HiUsers, 
  HiCurrencyDollar, 
  HiArrowTrendingUp, 
  HiCube
} from 'react-icons/hi2';
import api from '../../lib/axiosInstance';
import Chart from 'react-apexcharts';
import { StatCard } from '../common/Card';

const Dashboard = () => {
  const navigate = useNavigate();
  
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
  const [recentLeads, setRecentLeads] = useState([]);
  const [expenseBreakdown, setExpenseBreakdown] = useState([]);
  
  // Get current user
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
        const recentLeadsResponse = await api.get('/leads?limit=3&sortBy=createdAt&sortOrder=desc');
        const leads = recentLeadsResponse.data?.data?.leads || [];
        
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

  // Chart colors - Primary colors (blue, red, green)
  const COLORS = ['#2196F3', '#f44336', '#4caf50', '#1976D2', '#d32f2f', '#388e3c', '#ff9800', '#9c27b0'];

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

  // ApexCharts options for Monthly Revenue vs Expenses
  const monthlyChartOptions = {
    chart: {
      type: 'line',
      height: 280,
      toolbar: { show: false },
      zoom: { enabled: false }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      curve: 'smooth',
      width: 2
    },
    xaxis: {
      categories: monthlyData.map(d => d.month),
      labels: {
        style: {
          fontSize: '12px'
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        },
        formatter: (value) => formatCurrency(value)
      }
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value)
      }
    },
    legend: {
      fontSize: '12px',
      position: 'top'
    },
    colors: ['#8bc34a', '#f44336'],
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    }
  };

  const monthlyChartSeries = [
    {
      name: 'Revenue',
      data: monthlyData.map(d => d.revenue)
    },
    {
      name: 'Expenses',
      data: monthlyData.map(d => d.expenses)
    }
  ];

  // ApexCharts options for Branch Performance
  const branchChartOptions = {
    chart: {
      type: 'bar',
      height: 280,
      toolbar: { show: false }
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '55%',
        endingShape: 'rounded'
      }
    },
    dataLabels: {
      enabled: false
    },
    xaxis: {
      categories: branchPerformance.map(b => b.branchName),
      labels: {
        style: {
          fontSize: '11px'
        },
        rotate: -45,
        rotateAlways: true
      }
    },
    yaxis: {
      labels: {
        style: {
          fontSize: '12px'
        },
        formatter: (value) => formatCurrency(value)
      }
    },
    tooltip: {
      y: {
        formatter: (value) => formatCurrency(value)
      }
    },
    legend: {
      fontSize: '12px',
      position: 'top'
    },
    colors: ['#8bc34a', '#f44336'],
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    }
  };

  const branchChartSeries = [
    {
      name: 'Income',
      data: branchPerformance.map(b => b.income || 0)
    },
    {
      name: 'Expense',
      data: branchPerformance.map(b => b.expense || 0)
    }
  ];

  // ApexCharts options for Expense Breakdown Pie Chart
  const expensePieChartOptions = {
    chart: {
      type: 'pie',
      height: 280
    },
    labels: expenseBreakdown.map(e => e.name),
    colors: COLORS,
    legend: {
      position: 'bottom',
      fontSize: '12px'
    },
    tooltip: {
      custom: function({ series, seriesIndex, dataPointIndex, w }) {
        const label = w.globals.labels[seriesIndex];
        const value = series[seriesIndex];
        const total = series.reduce((a, b) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(1);
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #fff;">${label}</div>
            <div style="font-size: 12px; color: #fff;">
              Amount: ${formatCurrency(value)}
            </div>
            <div style="font-size: 12px; color: #fff;">
              Percentage: ${percentage}%
            </div>
          </div>
        `;
      }
    },
    dataLabels: {
      enabled: false
    }
  };

  const expensePieChartSeries = expenseBreakdown.map(e => e.value);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading dashboard data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
      </div>

      {/* Summary Cards: Revenue | Expenses | Inventory | Leads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Revenue"
          value={formatCurrency(stats.revenue)}
          icon={HiCurrencyDollar}
          gradient="green"
          loading={loading}
        />
        <StatCard
          title="Expenses"
          value={formatCurrency(stats.expenses)}
          icon={HiArrowTrendingUp}
          gradient="red"
          loading={loading}
        />
        <StatCard
          title="Inventory"
          value={formatNumber(stats.inventory)}
          icon={HiCube}
          gradient="blue"
          loading={loading}
        />
        <StatCard
          title="Leads"
          value={formatNumber(stats.leads)}
          icon={HiUsers}
          gradient="blue"
          loading={loading}
        />
      </div>

      {/* Charts Grid: Monthly Revenue vs Expenses, Expense Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Monthly Revenue vs Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <h3 className="text-base font-semibold text-gray-900 mb-3">Monthly Revenue vs Expenses</h3>
          <Chart
            options={monthlyChartOptions}
            series={monthlyChartSeries}
            type="line"
            height={280}
          />
        </div>

        {/* Chart 3: Expense Breakdown (Pie Chart) */}
        {expenseBreakdown.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Expense Breakdown</h3>
            <Chart
              options={expensePieChartOptions}
              series={expensePieChartSeries}
              type="pie"
              height={280}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-center">
            <div className="text-gray-500 text-sm">No expense data available</div>
          </div>
        )}
      </div>

      {/* Chart 2: Branch Performance Comparison & Recent Leads in Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 2: Branch Performance Comparison */}
        {user?.role === 'super_admin' && branchPerformance.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Branch Performance Comparison</h3>
            <Chart
              options={branchChartOptions}
              series={branchChartSeries}
              type="bar"
              height={280}
            />
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Branch performance data not available</div>
          </div>
        )}

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">Recent Leads</h3>
              <p className="text-xs text-gray-600 mt-0.5">Latest leads added to your system</p>
            </div>
            <button
              onClick={() => navigate('/leads')}
              className="text-sm font-medium text-[#558b2f] hover:text-[#4a7c2a] px-3 py-1.5 border border-[#558b2f]/20 rounded-lg hover:bg-gradient-to-r hover:from-[#8bc34a] hover:to-[#558b2f] hover:text-white hover:border-transparent transition-all duration-200"
            >
              View All
            </button>
          </div>
          <div className="p-4">
            {recentLeads.length > 0 ? (
              <div className="space-y-2">
                {recentLeads.map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-blue-600 font-semibold text-xs">
                          {lead.customerName?.charAt(0) || lead.customerMobile?.charAt(0) || 'L'}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-medium text-gray-900 truncate">
                          {lead.customerName || lead.customerMobile || 'Unknown'}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{lead.customerMobile || lead.email || 'No contact'}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(lead.leadStatus)}`}>
                        {formatStatus(lead.leadStatus)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500 text-sm">No recent leads</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
