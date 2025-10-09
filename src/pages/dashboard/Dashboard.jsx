import React, { useState } from 'react';
import { HiUsers, HiDocumentText, HiBuildingOffice2, HiHeart, HiTrendingUp, HiClock, HiCheckCircle, HiExclamationTriangle, HiCurrencyDollar } from 'react-icons/hi2';
import { AccountsModal } from '../../components/common';

const Dashboard = () => {
  // Modal state
  const [showAccountsModal, setShowAccountsModal] = useState(false);

  // Mock data - replace with actual data from your API
  const stats = [
    { name: 'Total Leads', value: '1,234', change: '+12%', changeType: 'positive', icon: HiUsers, color: 'bg-blue-500' },
    { name: 'Active Products', value: '89', change: '+5%', changeType: 'positive', icon: HiDocumentText, color: 'bg-gradient-to-r from-[#8bc34a] to-[#558b2f]' },
    { name: 'Branches', value: '12', change: '+2', changeType: 'positive', icon: HiBuildingOffice2, color: 'bg-purple-500' },
    { name: 'Health Issues', value: '45', change: '-8%', changeType: 'negative', icon: HiHeart, color: 'bg-red-500' },
  ];

  const recentLeads = [
    { id: 1, name: 'John Doe', email: 'john@example.com', status: 'New', priority: 'High', time: '2 hours ago' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'Contacted', priority: 'Medium', time: '4 hours ago' },
    { id: 3, name: 'Mike Johnson', email: 'mike@example.com', status: 'Qualified', priority: 'High', time: '1 day ago' },
    { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', status: 'New', priority: 'Low', time: '2 days ago' },
  ];

  const recentActivities = [
    { id: 1, action: 'New lead created', user: 'John Doe', time: '5 minutes ago', type: 'success' },
    { id: 2, action: 'Product updated', user: 'Jane Smith', time: '1 hour ago', type: 'info' },
    { id: 3, action: 'Lead status changed', user: 'Mike Johnson', time: '2 hours ago', type: 'warning' },
    { id: 4, action: 'Branch performance report', user: 'Admin', time: '1 day ago', type: 'success' },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Contacted': return 'bg-yellow-100 text-yellow-800';
      case 'Qualified': return 'bg-gradient-to-r from-[#8bc34a]/10 to-[#558b2f]/10 text-[#558b2f] border border-[#558b2f]/20';
      case 'Lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Low': return 'bg-gradient-to-r from-[#8bc34a]/10 to-[#558b2f]/10 text-[#558b2f] border border-[#558b2f]/20';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return <HiCheckCircle className="h-5 w-5" style={{color: '#558b2f'}} />;
      case 'warning': return <HiExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info': return <HiClock className="h-5 w-5 text-blue-500" />;
      default: return <HiClock className="h-5 w-5 text-gray-500" />;
    }
  };

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
              <HiTrendingUp className="h-4 w-4" />
              <span>View Reports</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
              </div>
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <span className={`text-sm font-medium ${
                stat.changeType === 'positive' ? 'text-[#558b2f]' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
              <span className="text-sm text-gray-500 ml-2">from last month</span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Leads</h3>
            <p className="text-sm text-gray-600 mt-1">Latest leads added to your system</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <span className="text-primary-600 font-semibold text-sm">
                        {lead.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-xs text-gray-500">{lead.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(lead.priority)}`}>
                      {lead.priority}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full text-[#558b2f] hover:text-[#4a7c2a] font-medium text-sm py-2 border border-[#558b2f]/20 rounded-lg hover:bg-gradient-to-r hover:from-[#8bc34a] hover:to-[#558b2f] hover:text-white hover:border-transparent transition-all duration-200">
                View all leads
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
            <p className="text-sm text-gray-600 mt-1">Latest activities in your system</p>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors duration-200">
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.action}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      by {activity.user} • {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-6">
              <button className="w-full text-[#558b2f] hover:text-[#4a7c2a] font-medium text-sm py-2 border border-[#558b2f]/20 rounded-lg hover:bg-gradient-to-r hover:from-[#8bc34a] hover:to-[#558b2f] hover:text-white hover:border-transparent transition-all duration-200">
                View all activities
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40">
            <HiUsers className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Add Lead</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40">
            <HiDocumentText className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Create Product</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40">
            <HiBuildingOffice2 className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Add Branch</span>
          </button>
          <button className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40">
            <HiHeart className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Health Issue</span>
          </button>
          <button 
            onClick={() => setShowAccountsModal(true)}
            className="flex flex-col items-center p-4 bg-gradient-to-br from-[#8bc34a]/10 to-[#558b2f]/10 hover:from-[#8bc34a]/20 hover:to-[#558b2f]/20 rounded-lg transition-all duration-200 group border border-[#558b2f]/20 hover:border-[#558b2f]/40"
          >
            <HiCurrencyDollar className="h-8 w-8 text-[#558b2f] mb-2 group-hover:scale-110 transition-transform duration-200" />
            <span className="text-sm font-medium text-[#558b2f]">Accounts</span>
          </button>
        </div>
      </div>

      {/* Accounts Modal */}
      <AccountsModal
        isOpen={showAccountsModal}
        onClose={() => setShowAccountsModal(false)}
      />
    </div>
  );
};

export default Dashboard;