import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  HiUsers,
  HiBuildingOffice2,
  HiDocumentText,
  HiChartBar,
  HiPlus,
  HiEye
} from 'react-icons/hi2';
import { Card, Button } from '../common';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Sample stats data
  const stats = [
    {
      name: 'Total Leads',
      value: '1,234',
      icon: HiUsers,
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Active Products',
      value: '89',
      icon: HiDocumentText,
      change: '+3%',
      changeType: 'increase'
    },
    {
      name: 'Branches',
      value: '12',
      icon: HiBuildingOffice2,
      change: '0%',
      changeType: 'neutral'
    },
    {
      name: 'Conversion Rate',
      value: '23.5%',
      icon: HiChartBar,
      change: '+2.1%',
      changeType: 'increase'
    }
  ];


  const actions = [
    <Button
      key="create-lead"
      variant="gradient"
      size="md"
      icon={HiPlus}
      className="shadow-lg hover:shadow-xl"
    >
      Create Lead
    </Button>,
    <Button
      key="view-reports"
      variant="outline"
      size="md"
      icon={HiEye}
      className="shadow-sm"
    >
      View Reports
    </Button>
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Welcome back! Here's what's happening with your business today.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          {actions}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between h-full">
              <div className="flex-shrink-0">
                <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
              </div>
              <div className="flex-1 text-right">
                <p className="text-sm font-medium text-gray-600 mb-1">{stat.name}</p>
                <div className="flex items-center justify-end">
                  <span className={`text-sm font-medium ${
                    stat.changeType === 'increase' ? 'text-green-600' : 
                    stat.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`} style={stat.changeType === 'increase' ? {color: 'rgb(139, 195, 74)'} : {}}>
                    {stat.change}
                  </span>
                  <span className="text-sm text-gray-500 ml-1">from last month</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h3>
        <div className="space-y-4">
              {[
                {
                  id: 1,
                  action: 'New lead created',
                  description: 'John Doe from Mumbai',
                  time: '5 minutes ago',
                  user: 'Sarah Wilson',
                  color: 'bg-blue-500'
                },
                {
                  id: 2,
                  action: 'Lead status updated',
                  description: 'Jane Smith - Qualified',
                  time: '15 minutes ago',
                  user: 'Mike Johnson',
                  color: 'bg-green-500',
                  gradient: true
                },
                {
                  id: 3,
                  action: 'Product created',
                  description: 'New health supplement added',
                  time: '1 hour ago',
                  user: 'Admin',
                  color: 'bg-blue-500'
                },
                {
                  id: 4,
                  action: 'Order completed',
                  description: 'Order #12345 delivered successfully',
                  time: '2 hours ago',
                  user: 'System',
                  color: 'bg-purple-500'
                }
              ].map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                  <div 
                    className={`flex-shrink-0 w-3 h-3 ${activity.color} rounded-full mt-2 shadow-sm`}
                    style={activity.gradient ? {background: 'linear-gradient(90deg, rgb(139, 195, 74), rgb(85, 139, 47))'} : {}}
                  ></div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2 font-medium">
                      {activity.time} by {activity.user}
                    </p>
                  </div>
                </div>
              ))}
            </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <HiUsers className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Manage Leads
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Create, update, and track your leads
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/leads" className="text-blue-500 hover:text-blue-600 text-sm font-semibold transition-colors duration-200">
                Go to Leads →
              </Link>
            </div>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <HiDocumentText className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Products
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Manage your product catalog
                </p>
              </div>
            </div>
            <div className="mt-4">
              <Link to="/products" className="text-blue-500 hover:text-blue-600 text-sm font-semibold transition-colors duration-200">
                Go to Products →
              </Link>
            </div>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <HiChartBar className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Analytics
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View reports and insights
                </p>
              </div>
            </div>
            <div className="mt-4">
              <button className="text-purple-500 hover:text-purple-600 hover:bg-purple-50 text-sm font-semibold px-3 py-1 rounded-lg transition-all duration-200">
                View Reports →
              </button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
