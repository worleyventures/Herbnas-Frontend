import React from 'react';
import { HiBell, HiPlus, HiTrash } from 'react-icons/hi2';
import Dropdown from '../../../common/Dropdown';

const RemindersStep = ({ formData, setFormData, errors, newReminder, setNewReminder }) => {
  // Helper function to format datetime for display (12-hour format)
  const formatReminderDateTime = (datetimeString) => {
    const date = new Date(datetimeString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Helper function to format datetime for API (24-hour format)
  const formatReminderDateTimeForAPI = (date, time, ampm) => {
    const [hours, minutes] = time.split(':');
    let hour24 = parseInt(hours);
    
    if (ampm === 'PM' && hour24 !== 12) {
      hour24 += 12;
    } else if (ampm === 'AM' && hour24 === 12) {
      hour24 = 0;
    }
    
    const datetime = new Date(date);
    datetime.setHours(hour24, parseInt(minutes), 0, 0);
    
    return datetime.toISOString();
  };

  const handleReminderChange = (e) => {
    const { name, value } = e.target;
    setNewReminder(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddReminder = () => {
    if (newReminder.date && newReminder.time && newReminder.note) {
      const reminder = {
        id: Date.now(),
        date: formatReminderDateTimeForAPI(newReminder.date, newReminder.time, newReminder.ampm),
        note: newReminder.note
      };
      
      setFormData(prev => ({
        ...prev,
        reminders: [...prev.reminders, reminder]
      }));
      
      setNewReminder({ date: '', time: '', ampm: 'AM', note: '' });
    }
  };

  const handleRemoveReminder = (reminderId) => {
    setFormData(prev => ({
      ...prev,
      reminders: prev.reminders.filter(reminder => reminder.id !== reminderId)
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-yellow-100 rounded-xl flex items-center justify-center">
          <HiBell className="h-5 w-5 text-yellow-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Reminders</h4>
          <p className="text-sm text-gray-500">Set follow-up reminders and notes</p>
        </div>
      </div>

      {/* Add Reminder Form */}
      <div className=" p-6">
        <h5 className="text-sm font-medium text-gray-700 mb-4">Add New Reminder</h5>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              name="date"
              value={newReminder.date}
              onChange={handleReminderChange}
              className="w-full  px-3 py-2 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#558b2f] focus:border-[#558b2f] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
            <input
              type="time"
              name="time"
              value={newReminder.time}
              onChange={handleReminderChange}
              className="w-full px-4 py-2 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#558b2f] focus:border-[#558b2f] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
            />
          </div>
          
          <div>
            <Dropdown
              label="AM/PM"
              name="ampm"
              value={newReminder.ampm}
              onChange={handleReminderChange}
              options={[
                { value: 'AM', label: 'AM' },
                { value: 'PM', label: 'PM' }
              ]}
              placeholder="Select AM/PM"
              className="focus:ring-2 focus:ring-[#558b2f] focus:border-[#558b2f]"
            />
          </div>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Note</label>
          <textarea
            name="note"
            value={newReminder.note}
            onChange={handleReminderChange}
            placeholder="Enter reminder note..."
            className="w-full px-4 py-2 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
        
        <button
          type="button"
          onClick={handleAddReminder}
          className="w-[200px] h-[35px] px-4 py-3 text-white rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
          style={{background: 'linear-gradient(90deg, #8bc34a, #558b2f)'}}
        >
          <HiPlus className="h-2 w-2" />
          <span>Add Reminder</span>
        </button>
      </div>
      
      {/* Existing Reminders */}
      {formData.reminders.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-sm font-medium text-gray-700">Scheduled Reminders:</h5>
          {formData.reminders.map(reminder => (
            <div key={reminder.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <HiBell className="h-4 w-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{reminder.note}</p>
                  <p className="text-xs text-gray-500">{formatReminderDateTime(reminder.date)}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveReminder(reminder.id)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <HiTrash className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RemindersStep;
