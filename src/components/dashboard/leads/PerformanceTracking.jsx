import React, { useState } from 'react';
import {
  HiChartBar,
  HiArrowTrendingUp,
  HiArrowTrendingDown,
  HiUser,
  HiBuildingOffice2,
  HiEnvelope,
  HiPhone,
  HiCalendar,
  HiCheckCircle,
  HiXCircle,
  HiClock
} from 'react-icons/hi2';

const PerformanceTracking = ({ 
  leads, 
  stats 
}) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [selectedBranch, setSelectedBranch] = useState('all');
  const [selectedRep, setSelectedRep] = useState('all');

  const periodOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' }
  ];

  const getStatusCount = (status) => {
    if (!stats?.leadsByStatus || !Array.isArray(stats.leadsByStatus)) return 0;
    const statusData = stats.leadsByStatus.find(item => item._id === status);
    return statusData ? statusData.count : 0;
  };

  const getConversionRate = () => {
    if (!stats?.overview?.totalLeads || stats.overview.totalLeads === 0) return 0;
    const converted = getStatusCount('order_completed');
    return Math.round((converted / stats.overview.totalLeads) * 100);
  };

  const getAverageResponseTime = () => {
    // Mock calculation - in real app, this would come from actual data
    return '2.5 hours';
  };

  const getTopPerformingBranch = () => {
    if (!stats?.topCities || stats.topCities.length === 0) return 'N/A';
    const branch = stats.topCities[0];
    if (!branch) return 'N/A';
    
    // Handle both object and string formats
    if (typeof branch === 'string') return branch;
    if (typeof branch === 'object') {
      return branch.branchName || branch.name || branch._id || 'Unknown Branch';
    }
    return 'N/A';
  };

  const getTopPerformingRep = () => {
    if (!stats?.topCreators || stats.topCreators.length === 0) return 'N/A';
    const rep = stats.topCreators[0];
    if (!rep) return 'N/A';
    
    // Handle both object and string formats
    if (typeof rep === 'string') return rep;
    if (typeof rep === 'object') {
      return rep.name || rep.userName || rep._id || 'Unknown Rep';
    }
    return 'N/A';
  };

  const getStatusDistribution = () => {
    if (!stats?.leadsByStatus || !Array.isArray(stats.leadsByStatus)) return [];
    
    return [
      { status: 'New Lead', count: getStatusCount('new_lead'), color: 'bg-blue-500' },
      { status: 'Not Answered', count: getStatusCount('not_answered'), color: 'bg-yellow-500' },
      { status: 'Qualified', count: getStatusCount('qualified'), color: 'bg-purple-500' },
      { status: 'Order Completed', count: getStatusCount('order_completed'), color: 'bg-[#22c55e]-500' },
      { status: 'Unqualified', count: getStatusCount('unqualified'), color: 'bg-red-500' },
      { status: 'Pending', count: getStatusCount('pending'), color: 'bg-orange-500' }
    ];
  };

  const getBranchPerformance = () => {
    if (!stats?.topCities) return [];
    return stats.topCities.map((city, index) => ({
      name: city.name || city.branchName || city._id || city,
      leads: Math.floor(Math.random() * 50) + 10, // Mock data
      conversion: Math.floor(Math.random() * 30) + 10,
      rank: index + 1
    }));
  };

  const getRepPerformance = () => {
    if (!stats?.topCreators) return [];
    return stats.topCreators.map((creator, index) => ({
      name: creator.name || creator.userName || creator._id || creator,
      leads: Math.floor(Math.random() * 30) + 5, // Mock data
      conversion: Math.floor(Math.random() * 40) + 15,
      rank: index + 1
    }));
  };


  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Performance Analytics</h2>
        <p className="text-sm text-gray-600 mt-1">Track your lead performance and conversion metrics</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6 relative z-10">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Time Period</label>
            <div className="relative">
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-[#22c55e]-500 text-sm bg-white shadow-sm hover:border-gray-400 transition-colors duration-200 cursor-pointer"
              >
                {periodOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Branch</label>
            <div className="relative">
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-[#22c55e]-500 text-sm bg-white shadow-sm hover:border-gray-400 transition-colors duration-200 cursor-pointer"
              >
                <option value="all">All Branches</option>
                {stats?.topCities?.filter(city => city != null).map((city, index) => {
                  // Ensure we have a proper key and value
                  const key = city?._id || city?.name || city?.branchName || `city-${index}`;
                  const value = city?._id || city?.name || city?.branchName || (typeof city === 'string' ? city : 'unknown');
                  const displayName = city?.name || city?.branchName || city?._id || (typeof city === 'string' ? city : 'Unknown');
                  
                  return (
                    <option key={key} value={value}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-800 mb-3">Sales Rep</label>
            <div className="relative">
              <select
                value={selectedRep}
                onChange={(e) => setSelectedRep(e.target.value)}
                className="w-full px-4 py-3 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-[#22c55e]-500 text-sm bg-white shadow-sm hover:border-gray-400 transition-colors duration-200 cursor-pointer"
              >
                <option value="all">All Reps</option>
                {stats?.topCreators?.filter(creator => creator != null).map((creator, index) => {
                  // Ensure we have a proper key and value
                  const key = creator?._id || creator?.name || creator?.userName || `creator-${index}`;
                  const value = creator?._id || creator?.name || creator?.userName || (typeof creator === 'string' ? creator : 'unknown');
                  const displayName = creator?.name || creator?.userName || creator?._id || (typeof creator === 'string' ? creator : 'Unknown');
                  
                  return (
                    <option key={key} value={value}>
                      {displayName}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-[#22c55e]-500 to-[#22c55e]-600 rounded-xl flex items-center justify-center">
                <HiCheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Conversion Rate</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{getConversionRate()}%</p>
              <div className="flex items-center mt-1">
                <HiArrowTrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-[#22c55e]-500 mr-1" />
                <span className="text-xs sm:text-sm text-[#22c55e]-600">+5.2%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <HiUser className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Leads</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats?.overview?.totalLeads || 0}</p>
              <div className="flex items-center mt-1">
                <HiArrowTrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-[#22c55e]-500 mr-1" />
                <span className="text-xs sm:text-sm text-[#22c55e]-600">+12.5%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <HiClock className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Avg Response Time</p>
              <p className="text-lg sm:text-2xl font-bold text-gray-900">{getAverageResponseTime()}</p>
              <div className="flex items-center mt-1">
                <HiArrowTrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-[#22c55e]-500 mr-1" />
                <span className="text-xs sm:text-sm text-[#22c55e]-600">-0.5h</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 hover:shadow-md transition-shadow duration-200">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
                <HiBuildingOffice2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
            </div>
            <div className="ml-3 sm:ml-4 min-w-0 flex-1">
              <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">Top Branch</p>
              <p className="text-lg sm:text-xl font-bold text-gray-900 truncate">{getTopPerformingBranch()}</p>
              <div className="flex items-center mt-1">
                <HiArrowTrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-[#22c55e]-500 mr-1" />
                <span className="text-xs sm:text-sm text-[#22c55e]-600">+8.3%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Lead Status Distribution</h3>
          <div className="space-y-4">
            {getStatusDistribution().map((item) => {
              const total = getStatusDistribution().reduce((sum, i) => sum + i.count, 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              
              return (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700">{item.status}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900 mr-2">{item.count}</span>
                    <span className="text-sm text-gray-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Branches */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Branches</h3>
          <div className="space-y-4">
            {getBranchPerformance().map((branch) => (
              <div key={branch.branchName || branch.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-r from-[#22c55e]-400 to-[#22c55e]-500 rounded-full flex items-center justify-center mr-3">
                    <span className="text-xs font-medium text-white">#{branch.rank}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{branch.branchName || branch.name}</p>
                    <p className="text-xs text-gray-500">{branch.leads} leads</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{branch.conversion}%</p>
                  <p className="text-xs text-gray-500">conversion</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceTracking;