import React, { useState, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight, HiCalendar, HiUsers, HiCheckCircle, HiXMark, HiClock, HiExclamationTriangle } from 'react-icons/hi2';

const SupervisorAttendanceCalendar = ({ attendance, onDateClick, loading, onApprove, onReject }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});

  // Generate calendar data for the current month
  useEffect(() => {
    if (attendance && attendance.length > 0) {
      const data = {};
      attendance.forEach(record => {
        const date = new Date(record.date);
        const dateKey = date.toISOString().split('T')[0];
        
        if (!data[dateKey]) {
          data[dateKey] = {
            pending: 0,
            approved: 0,
            rejected: 0,
            total: 0,
            records: []
          };
        }
        
        data[dateKey].records.push(record);
        data[dateKey].total++;
        
        if (record.approvalStatus === 'pending') {
          data[dateKey].pending++;
        } else if (record.approvalStatus === 'approved') {
          data[dateKey].approved++;
        } else if (record.approvalStatus === 'rejected') {
          data[dateKey].rejected++;
        }
      });
      
      setCalendarData(data);
    }
  }, [attendance]);

  // Get days in month
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  // Get first day of month
  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  // Navigate months
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  // Generate calendar days
  const generateCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateKey = date.toISOString().split('T')[0];
      const dayData = calendarData[dateKey] || { pending: 0, approved: 0, rejected: 0, total: 0, records: [] };
      
      days.push({
        day,
        date,
        dateKey,
        ...dayData
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayColor = (dayData) => {
    if (dayData.total === 0) return 'bg-gray-50 text-gray-400';
    if (dayData.pending > 0) return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    if (dayData.approved > dayData.rejected) return 'bg-green-50 text-green-700 border-green-200';
    if (dayData.rejected > dayData.approved) return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-blue-50 text-blue-700 border-blue-200';
  };

  const getDayBorderColor = (dayData) => {
    if (dayData.total === 0) return 'border-gray-200';
    if (dayData.pending > 0) return 'border-yellow-300';
    if (dayData.approved > dayData.rejected) return 'border-green-300';
    if (dayData.rejected > dayData.approved) return 'border-red-300';
    return 'border-blue-300';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-blue-500 rounded-lg flex items-center justify-center">
              <HiCalendar className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Attendance Approval Calendar</h3>
              <p className="text-sm text-gray-600">Review and approve employee attendance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <HiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        
        {/* Month/Year Display */}
        <div className="mt-4">
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span className="text-gray-600">Pending Approval</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
            <span className="text-gray-600">Approved</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <span className="text-gray-600">Rejected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
            <span className="text-gray-600">No Data</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={index} className="h-24"></div>;
            }

            const isToday = dayData.dateKey === new Date().toISOString().split('T')[0];
            const hasData = dayData.total > 0;

            return (
              <div
                key={dayData.dateKey}
                onClick={() => hasData && onDateClick(dayData)}
                className={`
                  h-24 p-2 border rounded-lg cursor-pointer transition-all duration-200
                  ${getDayColor(dayData)}
                  ${getDayBorderColor(dayData)}
                  ${hasData ? 'hover:shadow-md hover:scale-105' : 'cursor-default'}
                  ${isToday ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}
                `}
              >
                <div className="flex flex-col h-full">
                  <div className={`text-sm font-medium ${isToday ? 'text-blue-600' : ''}`}>
                    {dayData.day}
                  </div>
                  
                  {hasData && (
                    <div className="flex-1 flex flex-col justify-center space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1">
                          <HiClock className="h-3 w-3 text-yellow-600" />
                          <span className="font-medium">{dayData.pending}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <HiCheckCircle className="h-3 w-3 text-green-600" />
                          <span className="font-medium">{dayData.approved}</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center text-xs">
                        <div className="flex items-center space-x-1">
                          <HiXMark className="h-3 w-3 text-red-600" />
                          <span className="font-medium">{dayData.rejected}</span>
                        </div>
                      </div>
                      <div className="text-xs text-center font-medium">
                        {dayData.total} total
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-yellow-600">
              {attendance?.filter(a => a.approvalStatus === 'pending').length || 0}
            </div>
            <div className="text-sm text-gray-600">Pending Approval</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {attendance?.filter(a => a.approvalStatus === 'approved').length || 0}
            </div>
            <div className="text-sm text-gray-600">Approved</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-red-600">
              {attendance?.filter(a => a.approvalStatus === 'rejected').length || 0}
            </div>
            <div className="text-sm text-gray-600">Rejected</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupervisorAttendanceCalendar;
