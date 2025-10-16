import React, { useState, useEffect } from 'react';
import { HiChevronLeft, HiChevronRight, HiCalendar, HiUsers, HiCheckCircle, HiXMark } from 'react-icons/hi2';

const AttendanceCalendar = ({ attendance, onDateClick, loading }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarData, setCalendarData] = useState({});

  // Generate calendar data for the current month
  useEffect(() => {
    if (attendance && attendance.length > 0) {
      const data = {};
      attendance.forEach(record => {
        const date = new Date(record.date);
        // Use local date to avoid timezone issues
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const dateKey = `${year}-${month}-${day}`;
        
        if (!data[dateKey]) {
          data[dateKey] = {
            present: 0,
            absent: 0,
            halfDay: 0,
            late: 0,
            leave: 0,
            total: 0,
            records: []
          };
        }
        
        data[dateKey].records.push(record);
        data[dateKey].total++;
        
        // Categorize attendance status
        if (record.status === 'present' || record.status === 'approved') {
          data[dateKey].present++;
        } else if (record.status === 'absent' || record.status === 'rejected') {
          data[dateKey].absent++;
        } else if (record.status === 'half_day') {
          data[dateKey].halfDay++;
        } else if (record.status === 'late') {
          data[dateKey].late++;
        } else if (record.status === 'leave') {
          data[dateKey].leave++;
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
      // Use consistent date format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const dayStr = String(date.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${dayStr}`;
      const dayData = calendarData[dateKey] || { present: 0, absent: 0, halfDay: 0, late: 0, leave: 0, total: 0, records: [] };
      
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
    
    // Calculate total positive attendance (present + half_day + late)
    const positiveCount = dayData.present + dayData.halfDay + dayData.late;
    const negativeCount = dayData.absent;
    
    if (positiveCount > negativeCount) return 'bg-green-50 text-green-700 border-green-200';
    if (negativeCount > positiveCount) return 'bg-red-50 text-red-700 border-red-200';
    if (dayData.halfDay > 0) return 'bg-orange-50 text-orange-700 border-orange-200';
    if (dayData.leave > 0) return 'bg-blue-50 text-blue-700 border-blue-200';
    return 'bg-yellow-50 text-yellow-700 border-yellow-200';
  };

  const getDayBorderColor = (dayData) => {
    if (dayData.total === 0) return 'border-gray-200';
    
    // Calculate total positive attendance (present + half_day + late)
    const positiveCount = dayData.present + dayData.halfDay + dayData.late;
    const negativeCount = dayData.absent;
    
    if (positiveCount > negativeCount) return 'border-green-300';
    if (negativeCount > positiveCount) return 'border-red-300';
    if (dayData.halfDay > 0) return 'border-orange-300';
    if (dayData.leave > 0) return 'border-blue-300';
    return 'border-yellow-300';
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
      {/* Calendar Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <HiCalendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <HiChevronLeft className="h-5 w-5 text-gray-600" />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Today
            </button>
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <HiChevronRight className="h-5 w-5 text-gray-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="px-6 py-3 border-b border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm text-gray-600">Present</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm text-gray-600">Half Day</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm text-gray-600">Absent</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span className="text-sm text-gray-600">Leave</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <span className="text-sm text-gray-600">No Data</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((dayData, index) => {
            if (!dayData) {
              return <div key={index} className="h-24"></div>;
            }

            const today = new Date();
            const todayYear = today.getFullYear();
            const todayMonth = String(today.getMonth() + 1).padStart(2, '0');
            const todayDay = String(today.getDate()).padStart(2, '0');
            const todayKey = `${todayYear}-${todayMonth}-${todayDay}`;
            const isToday = dayData.dateKey === todayKey;
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
                      <div className="grid grid-cols-2 gap-1 text-xs">
                        {dayData.present > 0 && (
                          <div className="flex items-center space-x-1">
                            <HiCheckCircle className="h-3 w-3 text-green-600" />
                            <span className="font-medium">{dayData.present}</span>
                          </div>
                        )}
                        {dayData.halfDay > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                            <span className="font-medium">{dayData.halfDay}</span>
                          </div>
                        )}
                        {dayData.late > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                            <span className="font-medium">{dayData.late}</span>
                          </div>
                        )}
                        {dayData.leave > 0 && (
                          <div className="flex items-center space-x-1">
                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                            <span className="font-medium">{dayData.leave}</span>
                          </div>
                        )}
                        {dayData.absent > 0 && (
                          <div className="flex items-center space-x-1">
                            <HiXMark className="h-3 w-3 text-red-600" />
                            <span className="font-medium">{dayData.absent}</span>
                          </div>
                        )}
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <HiUsers className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">
              Total: {Object.values(calendarData).reduce((sum, day) => sum + day.total, 0)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <HiCheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">
              Present: {Object.values(calendarData).reduce((sum, day) => sum + day.present, 0)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-orange-500"></div>
            <span className="text-sm font-medium text-gray-700">
              Half Day: {Object.values(calendarData).reduce((sum, day) => sum + day.halfDay, 0)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
            <span className="text-sm font-medium text-gray-700">
              Late: {Object.values(calendarData).reduce((sum, day) => sum + day.late, 0)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span className="text-sm font-medium text-gray-700">
              Leave: {Object.values(calendarData).reduce((sum, day) => sum + day.leave, 0)}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <HiXMark className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-gray-700">
              Absent: {Object.values(calendarData).reduce((sum, day) => sum + day.absent, 0)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceCalendar;
