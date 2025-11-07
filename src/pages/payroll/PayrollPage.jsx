import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { HiBanknotes, HiClock, HiPlus, HiCurrencyDollar } from 'react-icons/hi2';
import { Button } from '../../components/common';
import PayrollTab from './PayrollTab';
import AttendanceTab from './AttendanceTab';
import UsersPage from '../users/UsersPage';

const PayrollPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const isAccountsManager = user?.role === 'accounts_manager';
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'employees'); // Default to employees tab

  // Filter tabs based on role - accounts_manager only sees Employees and Payslip
  const allTabs = [
    {
      id: 'employees',
      name: 'Employees',
      icon: HiBanknotes,
      component: <PayrollTab showUsers={true} isPayrollTab={false} />
    },
    {
      id: 'payroll',
      name: isAccountsManager ? 'Payslip' : 'Payroll',
      icon: HiCurrencyDollar,
      component: <PayrollTab isPayrollTab={true} />
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: HiClock,
      component: <AttendanceTab />
    }
  ];

  const tabs = isAccountsManager 
    ? allTabs.filter(tab => tab.id !== 'attendance')
    : allTabs;


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payroll Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage employee payrolls, attendance records, and payments
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {activeTab === 'employees' && (
            <Button
              onClick={() => navigate('/payrolls/new')}
              className="bg-blue-600 hover:bg-blue-700 text-white"
              icon={HiPlus}
            >
              Add Employee
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Icon className="h-5 w-5" />
                  <span>{tab.name}</span>
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {tabs.find(tab => tab.id === activeTab)?.component}
    </div>
  );
};

export default PayrollPage;
