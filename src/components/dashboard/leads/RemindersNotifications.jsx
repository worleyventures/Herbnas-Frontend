import React, { useState } from 'react';
import { 
  HiBell, 
  HiClock,
  HiExclamationTriangle,
  HiCheckCircle,
  HiXCircle,
  HiPhone,
  HiEnvelope,
  HiUser,
  HiCalendar,
  HiPlus,
  HiPencil,
  HiTrash,
  HiXMark,
  HiCheck
} from 'react-icons/hi2';

const RemindersNotifications = ({ leads, onSelectLead, onEditLead }) => {
  const [showAddReminderModal, setShowAddReminderModal] = useState(false);
  const [showEditReminderModal, setShowEditReminderModal] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState(null);
  const [formData, setFormData] = useState({
    leadId: '',
    title: '',
    description: '',
    reminderDate: '',
    reminderTime: '',
    priority: 'medium',
    type: 'followup',
    isCompleted: false
  });

  // Mock reminders data - replace with actual API calls
  const [reminders, setReminders] = useState([
    {
      id: 1,
      leadId: 1,
      title: 'Follow up with John Doe',
      description: 'Call to discuss diabetes management products and pricing',
      reminderDate: '2024-01-25',
      reminderTime: '14:00',
      priority: 'high',
      type: 'followup',
      isCompleted: false,
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      leadId: 2,
      title: 'Send product catalog to Jane Smith',
      description: 'Email product information for arthritis treatment',
      reminderDate: '2024-01-22',
      reminderTime: '11:00',
      priority: 'medium',
      type: 'email',
      isCompleted: false,
      createdAt: '2024-01-19T15:45:00Z'
    },
    {
      id: 3,
      leadId: 3,
      title: 'Schedule meeting with Mike Johnson',
      description: 'In-person meeting to finalize purchase details',
      reminderDate: '2024-01-26',
      reminderTime: '15:00',
      priority: 'high',
      type: 'meeting',
      isCompleted: false,
      createdAt: '2024-01-19T14:30:00Z'
    },
    {
      id: 4,
      leadId: 1,
      title: 'Review lead qualification criteria',
      description: 'Check if John Doe meets all qualification requirements',
      reminderDate: '2024-01-24',
      reminderTime: '09:00',
      priority: 'low',
      type: 'review',
      isCompleted: true,
      createdAt: '2024-01-18T16:20:00Z'
    }
  ]);

  const reminderTypes = [
    { value: 'followup', label: 'Follow-up', icon: HiPhone, color: 'bg-blue-100 text-blue-800' },
    { value: 'email', label: 'Email', icon: HiEnvelope, color: 'bg-[#22c55e]-100 text-[#22c55e]-800' },
    { value: 'meeting', label: 'Meeting', icon: HiUser, color: 'bg-purple-100 text-purple-800' },
    { value: 'review', label: 'Review', icon: HiCheckCircle, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'other', label: 'Other', icon: HiBell, color: 'bg-gray-100 text-gray-800' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-[#22c55e]-100 text-[#22c55e]-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-red-100 text-red-800' }
  ];

  const getReminderType = (type) => {
    return reminderTypes.find(t => t.value === type) || reminderTypes[0];
  };

  const getPriority = (priority) => {
    return priorityOptions.find(p => p.value === priority) || priorityOptions[1];
  };

  const getLeadById = (leadId) => {
    return leads.find(lead => lead.id === leadId);
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString();
    return time ? `${formattedDate} at ${time}` : formattedDate;
  };

  const getDaysUntilReminder = (date) => {
    if (!date) return null;
    const today = new Date();
    const reminderDate = new Date(date);
    const diffTime = reminderDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUpcomingReminders = () => {
    const today = new Date();
    return reminders
      .filter(reminder => !reminder.isCompleted)
      .filter(reminder => {
        const reminderDate = new Date(reminder.reminderDate);
        const diffTime = reminderDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7; // Next 7 days
      })
      .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
  };

  const getOverdueReminders = () => {
    const today = new Date();
    return reminders
      .filter(reminder => !reminder.isCompleted)
      .filter(reminder => {
        const reminderDate = new Date(reminder.reminderDate);
        return reminderDate < today;
      })
      .sort((a, b) => new Date(a.reminderDate) - new Date(b.reminderDate));
  };

  const getCompletedReminders = () => {
    return reminders
      .filter(reminder => reminder.isCompleted)
      .sort((a, b) => new Date(b.reminderDate) - new Date(a.reminderDate));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newReminder = {
      id: reminders.length + 1,
      ...formData,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };
    
    setReminders([newReminder, ...reminders]);
    setShowAddReminderModal(false);
    resetForm();
  };

  const handleUpdateReminder = (e) => {
    e.preventDefault();
    
    setReminders(reminders.map(reminder => 
      reminder.id === selectedReminder.id 
        ? { ...reminder, ...formData }
        : reminder
    ));
    
    setShowEditReminderModal(false);
    setSelectedReminder(null);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      leadId: '',
      title: '',
      description: '',
      reminderDate: '',
      reminderTime: '',
      priority: 'medium',
      type: 'followup',
      isCompleted: false
    });
  };

  const handleEditReminder = (reminder) => {
    setSelectedReminder(reminder);
    setFormData({
      leadId: reminder.leadId,
      title: reminder.title,
      description: reminder.description,
      reminderDate: reminder.reminderDate,
      reminderTime: reminder.reminderTime,
      priority: reminder.priority,
      type: reminder.type,
      isCompleted: reminder.isCompleted
    });
    setShowEditReminderModal(true);
  };

  const handleToggleComplete = (reminderId) => {
    setReminders(reminders.map(reminder => 
      reminder.id === reminderId 
        ? { ...reminder, isCompleted: !reminder.isCompleted }
        : reminder
    ));
  };

  const handleDeleteReminder = (reminderId) => {
    setReminders(reminders.filter(reminder => reminder.id !== reminderId));
  };

  const upcomingReminders = getUpcomingReminders();
  const overdueReminders = getOverdueReminders();
  const completedReminders = getCompletedReminders();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Reminders & Notifications</h2>
        <button
          onClick={() => setShowAddReminderModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <HiPlus className="h-4 w-4 mr-2" />
          Add Reminder
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 rounded-lg">
              <HiExclamationTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-red-600">Overdue</p>
              <p className="text-2xl font-bold text-red-900">{overdueReminders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <HiClock className="h-5 w-5 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-yellow-600">Upcoming</p>
              <p className="text-2xl font-bold text-yellow-900">{upcomingReminders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-[#22c55e]-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-[#22c55e]-100 rounded-lg">
              <HiCheckCircle className="h-5 w-5 text-[#22c55e]-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-[#22c55e]-600">Completed</p>
              <p className="text-2xl font-bold text-[#22c55e]-900">{completedReminders.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <HiBell className="h-5 w-5 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-blue-600">Total</p>
              <p className="text-2xl font-bold text-blue-900">{reminders.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Reminders */}
      {overdueReminders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-red-900 flex items-center">
              <HiExclamationTriangle className="h-5 w-5 mr-2" />
              Overdue Reminders ({overdueReminders.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {overdueReminders.map((reminder) => {
                const lead = getLeadById(reminder.leadId);
                const daysOverdue = Math.abs(getDaysUntilReminder(reminder.reminderDate));
                
                return (
                  <div key={reminder.id} className="flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div className={`p-2 rounded-lg ${getReminderType(reminder.type).color}`}>
                      {React.createElement(getReminderType(reminder.type).icon, { className: "h-4 w-4" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{reminder.title}</h4>
                          <p className="text-sm text-gray-600">{reminder.description}</p>
                          {lead && (
                            <p className="text-xs text-gray-500 mt-1">
                              Lead: {lead.customerName} • {lead.customerMobile}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-red-600 font-medium">
                            {daysOverdue} day{daysOverdue !== 1 ? 's' : ''} overdue
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriority(reminder.priority).color}`}>
                            {getPriority(reminder.priority).label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          Due: {formatDateTime(reminder.reminderDate, reminder.reminderTime)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleComplete(reminder.id)}
                            className="text-[#22c55e]-600 hover:text-[#22c55e]-800 transition-colors duration-200"
                            title="Mark as Complete"
                          >
                            <HiCheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditReminder(reminder)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            title="Edit Reminder"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Delete Reminder"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Upcoming Reminders */}
      {upcomingReminders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-yellow-900 flex items-center">
              <HiClock className="h-5 w-5 mr-2" />
              Upcoming Reminders ({upcomingReminders.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {upcomingReminders.map((reminder) => {
                const lead = getLeadById(reminder.leadId);
                const daysUntil = getDaysUntilReminder(reminder.reminderDate);
                
                return (
                  <div key={reminder.id} className="flex items-start space-x-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className={`p-2 rounded-lg ${getReminderType(reminder.type).color}`}>
                      {React.createElement(getReminderType(reminder.type).icon, { className: "h-4 w-4" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">{reminder.title}</h4>
                          <p className="text-sm text-gray-600">{reminder.description}</p>
                          {lead && (
                            <p className="text-xs text-gray-500 mt-1">
                              Lead: {lead.customerName} • {lead.customerMobile}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-yellow-600 font-medium">
                            {daysUntil === 0 ? 'Today' : `${daysUntil} day${daysUntil !== 1 ? 's' : ''} left`}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriority(reminder.priority).color}`}>
                            {getPriority(reminder.priority).label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          Due: {formatDateTime(reminder.reminderDate, reminder.reminderTime)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleComplete(reminder.id)}
                            className="text-[#22c55e]-600 hover:text-[#22c55e]-800 transition-colors duration-200"
                            title="Mark as Complete"
                          >
                            <HiCheckCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditReminder(reminder)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            title="Edit Reminder"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Delete Reminder"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Completed Reminders */}
      {completedReminders.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-[#22c55e]-900 flex items-center">
              <HiCheckCircle className="h-5 w-5 mr-2" />
              Completed Reminders ({completedReminders.length})
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {completedReminders.map((reminder) => {
                const lead = getLeadById(reminder.leadId);
                
                return (
                  <div key={reminder.id} className="flex items-start space-x-4 p-4 bg-[#22c55e]-50 border border-[#22c55e]-200 rounded-lg">
                    <div className={`p-2 rounded-lg ${getReminderType(reminder.type).color}`}>
                      {React.createElement(getReminderType(reminder.type).icon, { className: "h-4 w-4" })}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 line-through">{reminder.title}</h4>
                          <p className="text-sm text-gray-600">{reminder.description}</p>
                          {lead && (
                            <p className="text-xs text-gray-500 mt-1">
                              Lead: {lead.customerName} • {lead.customerMobile}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#22c55e]-600 font-medium">Completed</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriority(reminder.priority).color}`}>
                            {getPriority(reminder.priority).label}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-xs text-gray-500">
                          Was due: {formatDateTime(reminder.reminderDate, reminder.reminderTime)}
                        </p>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleToggleComplete(reminder.id)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
                            title="Mark as Incomplete"
                          >
                            <HiXCircle className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditReminder(reminder)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            title="Edit Reminder"
                          >
                            <HiPencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteReminder(reminder.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200"
                            title="Delete Reminder"
                          >
                            <HiTrash className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Add Reminder Modal */}
      {showAddReminderModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowAddReminderModal(false);
              resetForm();
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add Reminder</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddReminderModal(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <HiXMark className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead
                      </label>
                      <select
                        name="leadId"
                        value={formData.leadId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Lead</option>
                        {leads.map(lead => (
                          <option key={lead.id} value={lead.id}>
                            {lead.customerName} - {lead.customerMobile}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {reminderTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {priorityOptions.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Date
                      </label>
                      <input
                        type="date"
                        name="reminderDate"
                        value={formData.reminderDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        name="reminderTime"
                        value={formData.reminderTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      placeholder="Enter reminder title"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      placeholder="Enter reminder description"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-[#22c55e]-600 text-base font-medium text-white hover:bg-[#22c55e]-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    <HiCheck className="h-4 w-4 mr-2" />
                    Add Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddReminderModal(false);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Reminder Modal */}
      {showEditReminderModal && selectedReminder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowEditReminderModal(false);
              setSelectedReminder(null);
              resetForm();
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleUpdateReminder}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Reminder</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditReminderModal(false);
                        setSelectedReminder(null);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                    >
                      <HiXMark className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lead
                      </label>
                      <select
                        name="leadId"
                        value={formData.leadId}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                        required
                      >
                        <option value="">Select Lead</option>
                        {leads.map(lead => (
                          <option key={lead.id} value={lead.id}>
                            {lead.customerName} - {lead.customerMobile}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {reminderTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Priority
                      </label>
                      <select
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {priorityOptions.map(priority => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Date
                      </label>
                      <input
                        type="date"
                        name="reminderDate"
                        value={formData.reminderDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Reminder Time
                      </label>
                      <input
                        type="time"
                        name="reminderTime"
                        value={formData.reminderTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      placeholder="Enter reminder title"
                      required
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      placeholder="Enter reminder description"
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-[#22c55e]-600 text-base font-medium text-white hover:bg-[#22c55e]-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    <HiCheck className="h-4 w-4 mr-2" />
                    Update Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditReminderModal(false);
                      setSelectedReminder(null);
                      resetForm();
                    }}
                    className="mt-3 w-full inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RemindersNotifications;
