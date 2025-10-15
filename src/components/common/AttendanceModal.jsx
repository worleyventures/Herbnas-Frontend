import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { HiXMark, HiClock, HiMapPin, HiDocumentText } from 'react-icons/hi2';
import { Button, Input, TextArea, Loading } from './index';
import { 
  checkIn, 
  checkOut, 
  startBreak, 
  endBreak,
  getTodayAttendance
} from '../../redux/actions/attendanceActions';
import { 
  selectTodayAttendance, 
  selectAttendanceLoading, 
  selectAttendanceError, 
  selectAttendanceSuccess,
  clearError,
  clearSuccess
} from '../../redux/slices/attendanceSlice';

const AttendanceModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const todayAttendance = useSelector(selectTodayAttendance);
  const loading = useSelector(selectAttendanceLoading);
  const error = useSelector(selectAttendanceError);
  const success = useSelector(selectAttendanceSuccess);

  const [workType, setWorkType] = useState('');
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  const [manualTime, setManualTime] = useState('');

  // Load today's attendance when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(getTodayAttendance());
      // Set current time for manual input in 12-hour format
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      }); // HH:MM AM/PM format
      setManualTime(timeString);
    }
  }, [isOpen, dispatch]);

  // Clear messages after showing them
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        dispatch(clearError());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        dispatch(clearSuccess());
        onClose();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, dispatch, onClose]);

  const handleCheckIn = () => {
    console.log('🔍 Check-in button clicked');
    console.log('🔍 Form data:', { workType, location, remarks, manualTime });
    
    if (!workType.trim() || !location.trim()) {
      alert('Please fill in work type and location');
      return;
    }
    
    console.log('🔍 Dispatching checkIn action...');
    dispatch(checkIn({ workType, location, remarks, manualTime }));
  };

  const handleCheckOut = () => {
    dispatch(checkOut({ remarks, manualTime }));
  };

  const handleStartBreak = () => {
    dispatch(startBreak({ location, remarks, manualTime }));
  };

  const handleEndBreak = () => {
    dispatch(endBreak({ remarks, manualTime }));
  };

  const getAttendanceStatus = () => {
    console.log('🔍 Getting attendance status, todayAttendance:', todayAttendance);
    
    if (!todayAttendance) {
      console.log('🔍 No todayAttendance data, returning not_checked_in');
      return 'not_checked_in';
    }
    
    if (todayAttendance.checkOut?.time) {
      console.log('🔍 User has checked out, returning checked_out');
      return 'checked_out';
    }
    
    // Check if currently on break (break started but not ended)
    if (todayAttendance.breakTime?.start?.time && !todayAttendance.breakTime?.end?.time) {
      console.log('🔍 User is on break, returning on_break');
      return 'on_break';
    }
    
    // If checked in but not on break
    if (todayAttendance.checkIn?.time) {
      console.log('🔍 User has checked in, returning checked_in');
      return 'checked_in';
    }
    
    console.log('🔍 Default case, returning not_checked_in');
    return 'not_checked_in';
  };

  const status = getAttendanceStatus();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0 sm:items-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity z-[9998]"
          onClick={onClose}
        ></div>

        {/* Modal Content */}
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all w-full max-w-md z-[9999] mx-auto my-8">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
            <div className="flex items-center space-x-3">
              <div className="h-12 w-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <HiClock className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Mark Attendance</h2>
                <p className="text-sm text-gray-600">Record your work status and location</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <HiXMark className="h-6 w-6" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading && <Loading />}
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600">{success}</p>
              </div>
            )}

            {/* Current Status */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Today's Status</h3>
              <div className="space-y-2 text-sm">
                {todayAttendance?.checkIn?.time ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check In:</span>
                      <span className="font-medium">
                        {new Date(todayAttendance.checkIn.time).toLocaleTimeString('en-IN', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>
                    {todayAttendance.checkOut?.time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Check Out:</span>
                        <span className="font-medium">
                          {new Date(todayAttendance.checkOut.time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    )}
                    {todayAttendance.breakTime?.start?.time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Break Start:</span>
                        <span className="font-medium">
                          {new Date(todayAttendance.breakTime.start.time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    )}
                    {todayAttendance.breakTime?.end?.time && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Break End:</span>
                        <span className="font-medium">
                          {new Date(todayAttendance.breakTime.end.time).toLocaleTimeString('en-IN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-2">
                    <span className="text-gray-500">No attendance recorded today</span>
                  </div>
                )}
              </div>
            </div>

            {/* Form Fields - Only show for check-in */}
            {status === 'not_checked_in' && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Work Type *
                  </label>
                  <select
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-700 font-medium"
                  >
                    <option value="">Choose your work type</option>
                    <option value="office">🏢 Office Work</option>
                    <option value="field">🌾 Field Work</option>
                    <option value="remote">🏠 Remote Work</option>
                    <option value="meeting">🤝 Meeting</option>
                    <option value="training">📚 Training</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-red-500 rounded-full mr-2"></span>
                    Location *
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your current location"
                    icon={HiMapPin}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Time
                  </label>
                  <Input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="HH:MM AM/PM"
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current time is automatically set, but you can adjust it manually (e.g., 09:30 AM)</p>
                </div>
              </div>
            )}

            {/* Show location and time fields for break actions */}
            {(status === 'checked_in' || status === 'on_break') && (
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Current Location
                  </label>
                  <Input
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Enter your current location"
                    icon={HiMapPin}
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                    <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                    Time
                  </label>
                  <Input
                    type="text"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    placeholder="HH:MM AM/PM"
                    className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  />
                  <p className="text-xs text-gray-500 mt-1">Current time is automatically set, but you can adjust it manually (e.g., 09:30 AM)</p>
                </div>
              </div>
            )}

            {/* Remarks field - show for all statuses except checked out */}
            {status !== 'checked_out' && (
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Remarks
                </label>
                <TextArea
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder={
                    status === 'not_checked_in' 
                      ? "Any additional notes or comments..." 
                      : status === 'on_break'
                      ? "Break notes or comments..."
                      : "Checkout notes or comments..."
                  }
                  rows={3}
                  className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-8 space-y-3">
              {status === 'not_checked_in' && (
                <Button
                  onClick={handleCheckIn}
                  disabled={loading || !workType.trim() || !location.trim()}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  {loading ? 'Processing...' : '✅ Check In'}
                </Button>
              )}

              {status === 'checked_in' && (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      ✅ Checked In - {todayAttendance?.checkIn?.time ? new Date(todayAttendance.checkIn.time).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) : ''}
                    </div>
                  </div>
                  <Button
                    onClick={handleStartBreak}
                    disabled={loading || !location.trim()}
                    className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    ⏸️ Start Break
                  </Button>
                  <Button
                    onClick={handleCheckOut}
                    disabled={loading}
                    className="w-full bg-red-600 hover:bg-red-700 text-white py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    🏁 Check Out
                  </Button>
                </div>
              )}

              {status === 'on_break' && (
                <div className="space-y-3">
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      ⏸️ On Break - {todayAttendance?.breakTime?.start?.time ? new Date(todayAttendance.breakTime.start.time).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true
                      }) : ''}
                    </div>
                  </div>
                  <Button
                    onClick={handleEndBreak}
                    disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  >
                    {loading ? 'Processing...' : '▶️ End Break'}
                  </Button>
                </div>
              )}

              {status === 'checked_out' && (
                <div className="text-center py-6 bg-gray-50 rounded-xl">
                  <div className="text-4xl mb-2">✅</div>
                  <p className="text-gray-600 font-medium">You have already checked out for today</p>
                  <p className="text-sm text-gray-500 mt-1">Thank you for your work!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceModal;