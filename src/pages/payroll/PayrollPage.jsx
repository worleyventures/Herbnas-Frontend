import React, { useState } from 'react';
import { HiBanknotes, HiClock } from 'react-icons/hi2';
import PayrollTab from './PayrollTab';
import AttendanceTab from './AttendanceTab';

const PayrollPage = () => {
  const [activeTab, setActiveTab] = useState('payroll');

  const tabs = [
    {
      id: 'payroll',
      name: 'Payroll',
      icon: HiBanknotes,
      component: <PayrollTab />
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: HiClock,
      component: <AttendanceTab />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payroll & Attendance Management</h1>
            <p className="text-gray-600 mt-1">Manage employee payrolls, attendance records, and payments</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white">
        {tabs.find(tab => tab.id === activeTab)?.component}
      </div>
    </div>
  );
};

export default PayrollPage;
