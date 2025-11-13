import React, { useState, useEffect, useRef } from 'react';
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
  const [monthlyLeadsData, setMonthlyLeadsData] = useState([]);
  // Admin branch performance data
  const [adminBranchLeadsOrders, setAdminBranchLeadsOrders] = useState([]);
  
  // Get current user
  const { user } = useSelector((state) => state.auth);

  // Check if user is production manager
  const isProductionManager = user?.role === 'production_manager';
  
  // Check if user is sales executive
  const isSalesExecutive = user?.role === 'sales_executive';
  
  // Check if user is admin
  const isAdmin = user?.role === 'admin';

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
          
          // Fetch ALL orders (not just delivered) for order status breakdown
          const allOrdersResponse = await api.get('/orders?limit=1000');
          const allOrdersFromBranch = allOrdersResponse.data?.data?.orders || [];
          
          // Filter orders to only show those created by the current user
          const allOrders = allOrdersFromBranch.filter(order => {
            const orderCreatedBy = order.createdBy?._id || order.createdBy;
            const userId = user._id || user.id;
            return orderCreatedBy && userId && orderCreatedBy.toString() === userId.toString();
          });
          
          // Fetch delivered orders separately for incentive calculation
          const deliveredOrdersResponse = await api.get('/orders?limit=1000&status=delivered');
          const deliveredOrdersFromBranch = deliveredOrdersResponse.data?.data?.orders || [];
          const deliveredOrders = deliveredOrdersFromBranch.filter(order => {
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
          
          // Calculate incentive based on product sales
          // Get branch incentive type (count threshold)
          let branchIncentiveType = 0; // Count threshold (e.g., 100)
          let incentiveAmount = 0;
          if (user?.branch) {
            try {
              // Extract branch ID - handle both string and object cases
              const branchId = typeof user.branch === 'object' 
                ? (user.branch._id || user.branch.id) 
                : user.branch;
              
              if (branchId) {
                const branchResponse = await api.get(`/branches/${branchId}`);
                branchIncentiveType = branchResponse.data?.data?.branch?.incentiveType || 0;
              }
            } catch (error) {
              console.error('Error fetching branch for incentive:', error);
            }
          }
          
          // Calculate incentive based on product sales (same logic as backend)
          // Use delivered orders for incentive calculation
          if (branchIncentiveType > 0 && deliveredOrders.length > 0) {
            // Aggregate product quantities sold from delivered orders
            const productQuantities = {}; // { productId: { totalQuantity, incentive } }
            
            deliveredOrders.forEach(order => {
              if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                  const productId = (item.productId?._id || item.productId)?.toString();
                  const productIncentive = item.productId?.incentive || 0;
                  const quantity = parseInt(item.quantity) || 0;
                  
                  if (productId && productIncentive > 0) {
                    if (!productQuantities[productId]) {
                      productQuantities[productId] = {
                        totalQuantity: 0,
                        incentive: productIncentive
                      };
                    }
                    productQuantities[productId].totalQuantity += quantity;
                  }
                });
              }
            });
            
            // Calculate incentive for each product
            Object.values(productQuantities).forEach(product => {
              const { totalQuantity, incentive } = product;
              if (totalQuantity > branchIncentiveType) {
                // Only count units above the threshold
                const incentiveUnits = totalQuantity - branchIncentiveType;
                incentiveAmount += incentiveUnits * incentive;
              }
            });
          }
          
          // Calculate monthly leads and orders data (last 6 months)
          const monthlyLeadsOrdersCount = [];
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
            
            // Filter orders for this month
            const monthOrders = allOrders.filter(order => {
              const orderDate = new Date(order.createdAt);
              return orderDate >= monthStart && orderDate <= monthEnd;
            });
            
            monthlyLeadsOrdersCount.push({
              month: `${month} ${year}`,
              leads: monthLeads.length,
              orders: monthOrders.length
            });
          }
          
          // Calculate order status breakdown from ALL orders (not just delivered)
          const orderStatusCounts = {};
          const orderStatusRevenue = {}; // Track revenue per status
          
          allOrders.forEach(order => {
            const status = order.status || 'draft';
            orderStatusCounts[status] = (orderStatusCounts[status] || 0) + 1;
            // Calculate revenue for this status
            if (!orderStatusRevenue[status]) {
              orderStatusRevenue[status] = 0;
            }
            const orderTotal = order.totalAmount || 0;
            orderStatusRevenue[status] += orderTotal;
          });
          
          const orderStatusBreakdown = Object.entries(orderStatusCounts).map(([status, count]) => ({
            name: status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
            value: count,
            status: status, // Keep original status for navigation
            revenue: orderStatusRevenue[status] || 0
          }));
          
          setSalesExecutiveStats({
            myLeads: myLeadsCount,
            incentive: incentiveAmount,
            totalOrders: allOrders.length,
            orderRevenue: orderRevenue
          });
          setRecentLeads(leads);
          setRecentOrders(orders);
          setMonthlyLeadsData(monthlyLeadsOrdersCount);
          setOrderStatusBreakdown(orderStatusBreakdown);
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
        let leads = [];
        if (isAdmin && user?.branch) {
          const branchId = user.branch._id || user.branch;
          
          // First, fetch all users from the admin's branch
          const usersResponse = await api.get(`/users?branch=${branchId}&limit=1000`);
          const branchUsers = usersResponse.data?.data?.users || [];
          const branchUserIds = branchUsers.map(u => u._id || u.id);
          
          // Fetch recent leads created by branch employees AND for the branch
          if (branchUserIds.length > 0) {
            const recentLeadsPromises = branchUserIds.map(userId => 
              api.get(`/leads?createdBy=${userId}&dispatchedFrom=${branchId}&limit=10&sortBy=createdAt&sortOrder=desc`)
            );
            const recentLeadsResponses = await Promise.all(recentLeadsPromises);
            const allRecentLeads = recentLeadsResponses.flatMap(response => response.data?.data?.leads || []);
            
            // Remove duplicates and sort by createdAt, then take top 3
            const uniqueRecentLeads = allRecentLeads.filter((lead, index, self) => 
              index === self.findIndex(l => l._id === lead._id)
            );
            leads = uniqueRecentLeads
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .slice(0, 3);
          }
        } else {
          const recentLeadsResponse = await api.get('/leads?limit=3&sortBy=createdAt&sortOrder=desc');
          leads = recentLeadsResponse.data?.data?.leads || [];
        }
        
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
        
        // Fetch leads and orders for admin's branch
        let adminLeadsOrdersData = [];
        if (isAdmin && user?.branch) {
          try {
            const branchId = user.branch._id || user.branch;
            
            // First, fetch all users from the admin's branch
            const usersResponse = await api.get(`/users?branch=${branchId}&limit=1000`);
            const branchUsers = usersResponse.data?.data?.users || [];
            const branchUserIds = branchUsers.map(u => u._id || u.id);
            
            // Fetch leads created by branch employees AND for the branch (last 6 months)
            let branchLeads = [];
            if (branchUserIds.length > 0) {
              // Fetch leads with both createdBy (branch employees) and dispatchedFrom (branch) filters
              const leadsPromises = branchUserIds.map(userId => 
                api.get(`/leads?createdBy=${userId}&dispatchedFrom=${branchId}&limit=1000`)
              );
              const leadsResponses = await Promise.all(leadsPromises);
              branchLeads = leadsResponses.flatMap(response => response.data?.data?.leads || []);
              
              // Remove duplicates (in case a lead appears in multiple responses)
              const uniqueLeads = branchLeads.filter((lead, index, self) => 
                index === self.findIndex(l => l._id === lead._id)
              );
              branchLeads = uniqueLeads;
            }
            
            // Fetch orders created by branch employees AND for the branch (last 6 months)
            let branchOrders = [];
            if (branchUserIds.length > 0) {
              // Fetch orders with both createdBy (branch employees) and branchId (branch) filters
              const ordersPromises = branchUserIds.map(userId => 
                api.get(`/orders?createdBy=${userId}&branchId=${branchId}&limit=1000`)
              );
              const ordersResponses = await Promise.all(ordersPromises);
              branchOrders = ordersResponses.flatMap(response => response.data?.data?.orders || []);
              
              // Remove duplicates
              const uniqueOrders = branchOrders.filter((order, index, self) => 
                index === self.findIndex(o => o._id === order._id)
              );
              branchOrders = uniqueOrders;
            }
            
            // Calculate monthly leads and orders (last 6 months)
            const currentDate = new Date();
            for (let i = 5; i >= 0; i--) {
              const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
              const month = date.toLocaleString('default', { month: 'short' });
              const year = date.getFullYear();
              const monthStart = new Date(year, date.getMonth(), 1);
              const monthEnd = new Date(year, date.getMonth() + 1, 0, 23, 59, 59);
              
              // Filter leads for this month
              const monthLeads = branchLeads.filter(lead => {
                const leadDate = new Date(lead.createdAt);
                return leadDate >= monthStart && leadDate <= monthEnd;
              });
              
              // Filter orders for this month
              const monthOrders = branchOrders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate >= monthStart && orderDate <= monthEnd;
              });
              
              adminLeadsOrdersData.push({
                month: `${month} ${year}`,
                leads: monthLeads.length,
                orders: monthOrders.length
              });
            }
            
            setAdminBranchLeadsOrders(adminLeadsOrdersData);
          } catch (error) {
            console.error('Error fetching admin branch leads and orders:', error);
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
  }, [user?.role, user?._id, user?.branch, isSalesExecutive, isAdmin]);

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

  // ApexCharts options for Admin Branch Leads and Orders
  const adminBranchLeadsOrdersChartOptions = {
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
      categories: adminBranchLeadsOrders.map(d => d.month),
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
        formatter: (value) => formatNumber(value)
      }
    },
    tooltip: {
      y: {
        formatter: (value) => formatNumber(value)
      }
    },
    legend: {
      fontSize: '12px',
      position: 'top'
    },
    colors: ['#2196F3', '#4caf50'],
    grid: {
      borderColor: '#e5e7eb',
      strokeDashArray: 3
    }
  };

  const adminBranchLeadsOrdersChartSeries = [
    {
      name: 'Leads',
      data: adminBranchLeadsOrders.map(d => d.leads)
    },
    {
      name: 'Orders',
      data: adminBranchLeadsOrders.map(d => d.orders)
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

  // Sales Executive Monthly Leads and Orders Chart Series
  const salesExecutiveMonthlyChartSeries = [
    {
      name: 'Leads',
      data: monthlyLeadsData.map(d => d.leads || 0)
    },
    {
      name: 'Orders',
      data: monthlyLeadsData.map(d => d.orders || 0)
    }
  ];

  // Sales Executive Monthly Leads and Orders Chart Options
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
    colors: ['#2196F3', '#4caf50'],
    legend: {
      ...monthlyChartOptions.legend,
      show: true
    }
  };

  // Order Status Breakdown Pie Chart for Sales Executive
  // Track last click time for double-click detection
  const lastClickRef = useRef({ time: 0, index: -1 });
  
  const orderStatusPieChartOptions = {
    chart: {
      type: 'pie',
      height: 280,
      events: {
        dataPointSelection: function(event, chartContext, config) {
          // Handle click on pie slice - detect double-click
          if (config.dataPointIndex !== undefined) {
            const statusData = orderStatusBreakdown[config.dataPointIndex];
            if (statusData && statusData.status) {
              const now = Date.now();
              const lastClick = lastClickRef.current;
              
              // Check if this is a double-click (same slice clicked within 300ms)
              if (lastClick.index === config.dataPointIndex && (now - lastClick.time) < 300) {
                // Double-click detected - navigate to orders page with status filter
                navigate(`/orders?status=${statusData.status}`);
                lastClickRef.current = { time: 0, index: -1 }; // Reset
              } else {
                // First click - record time and index
                lastClickRef.current = { time: now, index: config.dataPointIndex };
              }
            }
          }
        }
      }
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
        const statusData = orderStatusBreakdown[seriesIndex];
        const revenue = statusData?.revenue || 0;
        return `
          <div style="padding: 10px; background: rgba(0, 0, 0, 0.8); border-radius: 6px;">
            <div style="font-weight: 600; margin-bottom: 6px; color: #fff; font-size: 14px;">${label}</div>
            <div style="font-size: 12px; color: #e5e7eb; margin-bottom: 4px;">
              <strong>Orders:</strong> ${value}
            </div>
            <div style="font-size: 12px; color: #e5e7eb; margin-bottom: 4px;">
              <strong>Percentage:</strong> ${percentage}%
            </div>
            <div style="font-size: 12px; color: #e5e7eb; margin-bottom: 4px;">
              <strong>Revenue:</strong> ₹${revenue.toLocaleString('en-IN')}
            </div>
            <div style="font-size: 11px; color: #9ca3af; margin-top: 6px; padding-top: 6px; border-top: 1px solid rgba(255,255,255,0.2);">
              Double-click to view orders
            </div>
          </div>
        `;
      }
    },
    dataLabels: {
      enabled: false
    },
    plotOptions: {
      pie: {
        expandOnClick: false
      }
    }
  };

  const orderStatusPieChartSeries = orderStatusBreakdown.map(e => e.value);

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
        {/* Chart 1: Monthly Revenue vs Expenses / Monthly Leads & Orders */}
        {isSalesExecutive ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Monthly Leads & Orders</h3>
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

        {/* Chart 3: Expense Breakdown (Pie Chart) / Order Status Breakdown */}
        {isSalesExecutive ? (
          orderStatusBreakdown.length > 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="text-base font-semibold text-gray-900 mb-3">Order Status</h3>
              <Chart
                options={orderStatusPieChartOptions}
                series={orderStatusPieChartSeries}
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
        {/* Chart 2: Branch Performance Comparison / Admin Branch Leads & Orders */}
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
        ) : !isSalesExecutive && isAdmin && adminBranchLeadsOrders.length > 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Branch Leads & Orders</h3>
            <Chart
              options={adminBranchLeadsOrdersChartOptions}
              series={adminBranchLeadsOrdersChartSeries}
              type="line"
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
