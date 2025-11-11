import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiUsers,
  HiCurrencyDollar, 
  HiArrowTrendingUp, 
  HiCube,
  HiShoppingBag
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
  // Sales executive specific data
  const [salesExecutiveStats, setSalesExecutiveStats] = useState({
    myLeads: 0,
    incentive: 0,
    totalOrders: 0,
    orderRevenue: 0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [salesExecutiveMonthlyData, setSalesExecutiveMonthlyData] = useState([]);
  const [orderStatusBreakdown, setOrderStatusBreakdown] = useState([]);
  const [leadsStatusBreakdown, setLeadsStatusBreakdown] = useState([]);
  const [monthlyLeadsData, setMonthlyLeadsData] = useState([]);
  
  // Get current user
  const { user } = useSelector((state) => state.auth);

  // Check if user is production manager
  const isProductionManager = user?.role === 'production_manager';
  
  // Check if user is sales executive
  const isSalesExecutive = user?.role === 'sales_executive';

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
        
        // Sales Executive Dashboard
        if (isSalesExecutive && user?._id) {
          // Fetch leads created by this sales executive
          const myLeadsResponse = await api.get(`/leads?createdBy=${user._id}&limit=1000`);
          const myLeads = myLeadsResponse.data?.data?.leads || [];
          const myLeadsCount = myLeads.length;
          
          // Fetch recent leads created by this sales executive
          const recentLeadsResponse = await api.get(`/leads?createdBy=${user._id}&limit=3&sortBy=createdAt&sortOrder=desc`);
          const leads = recentLeadsResponse.data?.data?.leads || [];
          
          // Fetch orders (already filtered by branch for sales_executive)
          const ordersResponse = await api.get('/orders?limit=1000');
          const allOrdersFromBranch = ordersResponse.data?.data?.orders || [];
          
          // Filter orders to only show those created by the current user
          const allOrders = allOrdersFromBranch.filter(order => {
            const orderCreatedBy = order.createdBy?._id || order.createdBy;
            const userId = user._id || user.id;
            return orderCreatedBy && userId && orderCreatedBy.toString() === userId.toString();
          });
          
          // Fetch recent orders and filter by createdBy
          const recentOrdersResponse = await api.get('/orders?limit=100&sortBy=createdAt&sortOrder=desc');
          const recentOrdersFromBranch = recentOrdersResponse.data?.data?.orders || [];
          const orders = recentOrdersFromBranch
            .filter(order => {
              const orderCreatedBy = order.createdBy?._id || order.createdBy;
              const userId = user._id || user.id;
              return orderCreatedBy && userId && orderCreatedBy.toString() === userId.toString();
            })
            .slice(0, 3); // Take only the 3 most recent
          
          // Calculate order revenue from user's orders
          const orderRevenue = allOrders.reduce((sum, order) => {
            if (order.paymentStatus === 'paid' || order.paymentStatus === 'partial') {
              return sum + (order.totalAmount || 0);
            }
            return sum;
          }, 0);
          
          // Calculate incentive
          // Get branch incentive type
          let incentiveType = 0;
          let incentiveAmount = 0;
          if (user?.branch) {
            try {
              const branchResponse = await api.get(`/branches/${user.branch}`);
              incentiveType = branchResponse.data?.data?.branch?.incentiveType || 0;
            } catch (error) {
              console.error('Error fetching branch for incentive:', error);
            }
          }
          
          // Calculate incentive from order revenue (incentiveType is percentage)
          if (incentiveType > 0 && orderRevenue > 0) {
            incentiveAmount = (orderRevenue * incentiveType) / 100;
          }
          
          // Calculate monthly leads data (last 6 months) from user's leads
          const monthlyLeadsCount = [];
          const currentDate = new Date();
          for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const month = date.toLocaleString('default', { month: 'short' });
            const year = date.getFullYear();
            const monthStart = new Date(year, date.getMonth(), 1);
            const monthEnd = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);
            
            // Filter leads for this month
            const monthLeads = myLeads.filter(lead => {
              const leadDate = new Date(lead.createdAt);
              return leadDate >= monthStart && leadDate <= monthEnd;
            });
            
            monthlyLeadsCount.push({
              month: `${month} ${year}`,
              leads: monthLeads.length
            });
          }
          
          // Calculate leads status breakdown
          const leadsStatusCounts = {};
          myLeads.forEach(lead => {
            const status = lead.leadStatus || 'new_lead';
            leadsStatusCounts[status] = (leadsStatusCounts[status] || 0) + 1;
          });
          
          const leadsStatusBreakdown = Object.entries(leadsStatusCounts).map(([status, count]) => ({
            name: `Lead: ${status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            value: count
          }));
          
          // Calculate order status breakdown
          const orderStatusCounts = {};
          allOrders.forEach(order => {
            const status = order.status || 'draft';
            orderStatusCounts[status] = (orderStatusCounts[status] || 0) + 1;
          });
          
          const orderStatusBreakdown = Object.entries(orderStatusCounts).map(([status, count]) => ({
            name: `Order: ${status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            value: count
          }));
          
          // Combine leads and orders status for pie chart
          const combinedStatusBreakdown = [...leadsStatusBreakdown, ...orderStatusBreakdown];
          
          setSalesExecutiveStats({
            myLeads: myLeadsCount,
            incentive: incentiveAmount,
            totalOrders: allOrders.length,
            orderRevenue: orderRevenue
          });
          setRecentLeads(leads);
          setRecentOrders(orders);
          setMonthlyLeadsData(monthlyLeadsCount);
          setLeadsStatusBreakdown(leadsStatusBreakdown);
          setOrderStatusBreakdown(combinedStatusBreakdown);
          setStats({
            revenue: orderRevenue,
            expenses: 0,
            inventory: 0,
            leads: myLeadsCount
          });
          setLoading(false);
          return;
        }
        
        // Default Dashboard (for other roles)
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
  }, [user?.role, user?._id, isSalesExecutive]);

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

  // Sales Executive Monthly Leads Chart Series
  const salesExecutiveMonthlyChartSeries = [
    {
      name: 'Leads',
      data: monthlyLeadsData.map(d => d.leads)
    }
  ];

  // Sales Executive Monthly Leads Chart Options
  const salesExecutiveMonthlyChartOptions = {
    ...monthlyChartOptions,
    xaxis: {
      ...monthlyChartOptions.xaxis,
      categories: monthlyLeadsData.map(d => d.month)
    },
    yaxis: {
      ...monthlyChartOptions.yaxis,
      labels: {
        ...monthlyChartOptions.yaxis.labels,
        formatter: (value) => formatNumber(value)
      }
    },
    tooltip: {
      ...monthlyChartOptions.tooltip,
      y: {
        formatter: (value) => formatNumber(value)
      }
    },
    colors: ['#2196F3'],
    legend: {
      ...monthlyChartOptions.legend,
      show: true
    }
  };

  // Leads and Orders Status Breakdown Pie Chart for Sales Executive
  const leadsOrdersStatusPieChartOptions = {
    chart: {
      type: 'pie',
      height: 280
    },
    labels: orderStatusBreakdown.map(e => e.name),
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
        const isLead = label.startsWith('Lead:');
        const isOrder = label.startsWith('Order:');
        return `
          <div style="padding: 8px;">
            <div style="font-weight: 600; margin-bottom: 4px; color: #fff;">${label}</div>
            <div style="font-size: 12px; color: #fff;">
              ${isLead ? 'Leads' : isOrder ? 'Orders' : 'Count'}: ${value}
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

  const leadsOrdersStatusPieChartSeries = orderStatusBreakdown.map(e => e.value);

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

      {/* Summary Cards */}
      {isSalesExecutive ? (
        // Sales Executive Dashboard Cards
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
          <StatCard
            title="My Leads"
            value={formatNumber(salesExecutiveStats.myLeads)}
            icon={HiUsers}
            gradient="blue"
            loading={loading}
          />
          <StatCard
            title="Incentive"
            value={formatCurrency(salesExecutiveStats.incentive)}
            icon={HiCurrencyDollar}
            gradient="green"
            loading={loading}
          />
          <StatCard
            title="Total Orders"
            value={formatNumber(salesExecutiveStats.totalOrders)}
            icon={HiShoppingBag}
            gradient="purple"
            loading={loading}
          />
          <StatCard
            title="Order Revenue"
            value={formatCurrency(salesExecutiveStats.orderRevenue)}
            icon={HiCurrencyDollar}
            gradient="green"
            loading={loading}
          />
              </div>
      ) : (
        // Default Dashboard Cards
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
      )}

      {/* Charts Grid: Monthly Revenue vs Expenses, Expense Breakdown / Order Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Monthly Revenue vs Expenses / Monthly Leads */}
        {isSalesExecutive ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Monthly Leads</h3>
            {monthlyLeadsData.length > 0 ? (
              <Chart
                options={salesExecutiveMonthlyChartOptions}
                series={salesExecutiveMonthlyChartSeries}
                type="line"
                height={280}
              />
            ) : (
              <div className="flex items-center justify-center h-[280px]">
                <div className="text-gray-500 text-sm">No leads data available</div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Monthly Revenue vs Expenses</h3>
            <Chart
              options={monthlyChartOptions}
              series={monthlyChartSeries}
              type="line"
              height={280}
            />
          </div>
        )}

        {/* Chart 3: Expense Breakdown (Pie Chart) / Leads and Orders Status Breakdown */}
        {isSalesExecutive ? (
          orderStatusBreakdown.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Leads and Orders Status</h3>
              <Chart
                options={leadsOrdersStatusPieChartOptions}
                series={leadsOrdersStatusPieChartSeries}
                type="pie"
                height={280}
              />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-center">
              <div className="text-gray-500 text-sm">No data available</div>
            </div>
          )
        ) : (
          expenseBreakdown.length > 0 ? (
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
          )
        )}
      </div>

      {/* Chart 2: Branch Performance Comparison & Recent Leads/Orders in Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 2: Branch Performance Comparison */}
        {!isSalesExecutive && user?.role === 'super_admin' && branchPerformance.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Branch Performance Comparison</h3>
            <Chart
              options={branchChartOptions}
              series={branchChartSeries}
              type="bar"
              height={280}
            />
                </div>
        ) : !isSalesExecutive ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center justify-center">
            <div className="text-gray-500 text-sm">Branch performance data not available</div>
              </div>
        ) : null}

        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-gray-900">
                {isSalesExecutive ? 'My Recent Leads' : 'Recent Leads'}
                </h3>
              <p className="text-xs text-gray-600 mt-0.5">
                {isSalesExecutive ? 'Latest leads created by you' : 'Latest leads added to your system'}
                </p>
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

        {/* Recent Orders (for Sales Executive) */}
        {isSalesExecutive && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recent Orders</h3>
                <p className="text-xs text-gray-600 mt-0.5">Latest orders from your branch</p>
              </div>
              <button
                onClick={() => navigate('/orders')}
                className="text-sm font-medium text-[#558b2f] hover:text-[#4a7c2a] px-3 py-1.5 border border-[#558b2f]/20 rounded-lg hover:bg-gradient-to-r hover:from-[#8bc34a] hover:to-[#558b2f] hover:text-white hover:border-transparent transition-all duration-200"
              >
                View All
              </button>
            </div>
            <div className="p-4">
              {recentOrders.length > 0 ? (
                <div className="space-y-2">
                  {recentOrders.map((order) => (
                    <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-green-600 font-semibold text-xs">
                            {order.orderId?.charAt(order.orderId.length - 1) || 'O'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-medium text-gray-900 truncate">
                            {order.orderId || 'Unknown Order'}
                          </p>
                          <p className="text-xs text-gray-500 truncate">
                            {formatCurrency(order.totalAmount || 0)}
                </p>
              </div>
            </div>
                      <div className="flex items-center space-x-2 flex-shrink-0 ml-2">
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {formatStatus(order.status || 'pending')}
                        </span>
                      </div>
                    </div>
                  ))}
            </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">No recent orders</div>
              )}
        </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
