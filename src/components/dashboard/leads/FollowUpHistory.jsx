import React, { useState } from 'react';
import { 
  HiPlus, 
  HiEye, 
  HiPencil, 
  HiTrash, 
  HiBell, 
  HiUser, 
  HiBuildingOffice2,
  HiPhone,
  HiEnvelope,
  HiCalendar,
  HiClock,
  HiCheckCircle,
  HiXCircle,
  HiExclamationTriangle,
  HiChatBubbleLeft,
  HiXMark,
  HiCheck
} from 'react-icons/hi2';

const FollowUpHistory = ({ leads, onSelectLead, onEditLead }) => {
  const [selectedLead, setSelectedLead] = useState(null);
  const [showAddFollowUpModal, setShowAddFollowUpModal] = useState(false);
  const [showEditFollowUpModal, setShowEditFollowUpModal] = useState(false);
  const [selectedFollowUp, setSelectedFollowUp] = useState(null);
  const [formData, setFormData] = useState({
    type: 'call',
    status: 'completed',
    notes: '',
    nextFollowUpDate: '',
    nextFollowUpTime: '',
    outcome: 'positive'
  });

  // Mock follow-up data - replace with actual API calls
  const [followUps, setFollowUps] = useState([
    {
      id: 1,
      leadId: 1,
      type: 'call',
      status: 'completed',
      notes: 'Customer showed interest in diabetes management products. Discussed pricing and delivery options.',
      outcome: 'positive',
      followUpDate: '2024-01-20',
      followUpTime: '10:30',
      nextFollowUpDate: '2024-01-25',
      nextFollowUpTime: '14:00',
      createdBy: 'Sales Rep 1',
      createdAt: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      leadId: 1,
      type: 'email',
      status: 'completed',
      notes: 'Sent product catalog and pricing information via email.',
      outcome: 'neutral',
      followUpDate: '2024-01-18',
      followUpTime: '15:45',
      nextFollowUpDate: '2024-01-22',
      nextFollowUpTime: '11:00',
      createdBy: 'Sales Rep 1',
      createdAt: '2024-01-18T15:45:00Z'
    },
    {
      id: 3,
      leadId: 2,
      type: 'call',
      status: 'scheduled',
      notes: 'Scheduled follow-up call to discuss arthritis treatment options.',
      outcome: 'pending',
      followUpDate: '2024-01-22',
      followUpTime: '16:00',
      nextFollowUpDate: '2024-01-26',
      nextFollowUpTime: '10:00',
      createdBy: 'Sales Rep 2',
      createdAt: '2024-01-19T09:15:00Z'
    },
    {
      id: 4,
      leadId: 3,
      type: 'meeting',
      status: 'completed',
      notes: 'In-person meeting at customer location. Customer is ready to purchase, needs final pricing approval.',
      outcome: 'positive',
      followUpDate: '2024-01-19',
      followUpTime: '14:30',
      nextFollowUpDate: '2024-01-26',
      nextFollowUpTime: '15:00',
      createdBy: 'Sales Rep 3',
      createdAt: '2024-01-19T14:30:00Z'
    }
  ]);

  const followUpTypes = [
    { value: 'call', label: 'Phone Call', icon: HiPhone, color: 'bg-blue-100 text-blue-800' },
    { value: 'email', label: 'Email', icon: HiEnvelope, color: 'bg-[#22c55e]-100 text-[#22c55e]-800' },
    { value: 'meeting', label: 'Meeting', icon: HiUser, color: 'bg-purple-100 text-purple-800' },
    { value: 'message', label: 'Message', icon: HiChatBubbleLeft, color: 'bg-yellow-100 text-yellow-800' }
  ];

  const followUpStatuses = [
    { value: 'scheduled', label: 'Scheduled', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'completed', label: 'Completed', color: 'bg-[#22c55e]-100 text-[#22c55e]-800' },
    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
    { value: 'rescheduled', label: 'Rescheduled', color: 'bg-blue-100 text-blue-800' }
  ];

  const outcomes = [
    { value: 'positive', label: 'Positive', color: 'bg-[#22c55e]-100 text-[#22c55e]-800' },
    { value: 'neutral', label: 'Neutral', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'negative', label: 'Negative', color: 'bg-red-100 text-red-800' },
    { value: 'pending', label: 'Pending', color: 'bg-blue-100 text-blue-800' }
  ];

  const getFollowUpsByLead = (leadId) => {
    return followUps.filter(followUp => followUp.leadId === leadId);
  };

  const getFollowUpType = (type) => {
    return followUpTypes.find(t => t.value === type) || followUpTypes[0];
  };

  const getFollowUpStatus = (status) => {
    return followUpStatuses.find(s => s.value === status) || followUpStatuses[0];
  };

  const getOutcome = (outcome) => {
    return outcomes.find(o => o.value === outcome) || outcomes[0];
  };

  const formatDateTime = (date, time) => {
    if (!date) return 'N/A';
    const dateObj = new Date(date);
    const formattedDate = dateObj.toLocaleDateString();
    return time ? `${formattedDate} at ${time}` : formattedDate;
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
    
    const newFollowUp = {
      id: followUps.length + 1,
      leadId: selectedLead.id,
      ...formData,
      createdBy: 'Current User', // Replace with actual user
      createdAt: new Date().toISOString()
    };
    
    setFollowUps([newFollowUp, ...followUps]);
    setShowAddFollowUpModal(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      type: 'call',
      status: 'completed',
      notes: '',
      nextFollowUpDate: '',
      nextFollowUpTime: '',
      outcome: 'positive'
    });
  };

  const handleEditFollowUp = (followUp) => {
    setSelectedFollowUp(followUp);
    setFormData({
      type: followUp.type,
      status: followUp.status,
      notes: followUp.notes,
      nextFollowUpDate: followUp.nextFollowUpDate,
      nextFollowUpTime: followUp.nextFollowUpTime,
      outcome: followUp.outcome
    });
    setShowEditFollowUpModal(true);
  };

  const handleUpdateFollowUp = (e) => {
    e.preventDefault();
    
    setFollowUps(followUps.map(followUp => 
      followUp.id === selectedFollowUp.id 
        ? { ...followUp, ...formData }
        : followUp
    ));
    
    setShowEditFollowUpModal(false);
    setSelectedFollowUp(null);
    resetForm();
  };

  const handleDeleteFollowUp = (followUpId) => {
    setFollowUps(followUps.filter(followUp => followUp.id !== followUpId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Follow-up History</h2>
        <button
          onClick={() => setShowAddFollowUpModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[#22c55e] to-[#16a34a] hover:from-[#16a34a] hover:to-[#15803d] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e] shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <HiPlus className="h-4 w-4 mr-2" />
          Add Follow-up
        </button>
      </div>

      {/* Leads with Follow-up History */}
      <div className="space-y-4">
        {leads.map((lead) => {
          const leadFollowUps = getFollowUpsByLead(lead.id);
          const latestFollowUp = leadFollowUps[0];
          
          return (
            <div key={lead.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-12 w-12">
                      <div className="h-12 w-12 rounded-full bg-[#22c55e]-100 flex items-center justify-center">
                        <span className="text-lg font-medium text-[#22c55e]-600">
                          {lead.customerName.charAt(0)}
                        </span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{lead.customerName}</h3>
                      <p className="text-sm text-gray-500">{lead.customerMobile} • {lead.email}</p>
                      <p className="text-sm text-gray-500">{lead.branch} • {lead.assignedTo}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                      lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                      lead.status === 'qualified' ? 'bg-purple-100 text-purple-800' :
                      lead.status === 'converted' ? 'bg-[#22c55e]-100 text-[#22c55e]-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                    <button
                      onClick={() => onSelectLead(lead)}
                      className="p-2 text-gray-400 hover:text-[#22c55e]-600 transition-colors duration-200"
                      title="View Lead Details"
                    >
                      <HiEye className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                {/* Latest Follow-up Summary */}
                {latestFollowUp && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className={`p-2 rounded-lg ${getFollowUpType(latestFollowUp.type).color}`}>
                          {React.createElement(getFollowUpType(latestFollowUp.type).icon, { className: "h-4 w-4" })}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">
                            Latest: {getFollowUpType(latestFollowUp.type).label}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatDateTime(latestFollowUp.followUpDate, latestFollowUp.followUpTime)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFollowUpStatus(latestFollowUp.status).color}`}>
                          {getFollowUpStatus(latestFollowUp.status).label}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcome(latestFollowUp.outcome).color}`}>
                          {getOutcome(latestFollowUp.outcome).label}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">{latestFollowUp.notes}</p>
                    {latestFollowUp.nextFollowUpDate && (
                      <p className="text-xs text-gray-500 mt-2">
                        Next follow-up: {formatDateTime(latestFollowUp.nextFollowUpDate, latestFollowUp.nextFollowUpTime)}
                      </p>
                    )}
                  </div>
                )}

                {/* Follow-up History */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-900">Follow-up History ({leadFollowUps.length})</h4>
                  {leadFollowUps.length > 0 ? (
                    <div className="space-y-2">
                      {leadFollowUps.map((followUp) => (
                        <div key={followUp.id} className="flex items-start space-x-3 p-3 bg-white border border-gray-200 rounded-lg">
                          <div className={`p-2 rounded-lg ${getFollowUpType(followUp.type).color}`}>
                            {React.createElement(getFollowUpType(followUp.type).icon, { className: "h-4 w-4" })}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {getFollowUpType(followUp.type).label}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {formatDateTime(followUp.followUpDate, followUp.followUpTime)} • {followUp.createdBy}
                                </p>
                              </div>
                              <div className="flex items-center space-x-2">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getFollowUpStatus(followUp.status).color}`}>
                                  {getFollowUpStatus(followUp.status).label}
                                </span>
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getOutcome(followUp.outcome).color}`}>
                                  {getOutcome(followUp.outcome).label}
                                </span>
                                <div className="flex items-center space-x-1">
                                  <button
                                    onClick={() => handleEditFollowUp(followUp)}
                                    className="p-1 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                                    title="Edit Follow-up"
                                  >
                                    <HiPencil className="h-3 w-3" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteFollowUp(followUp.id)}
                                    className="p-1 text-gray-400 hover:text-red-600 transition-colors duration-200"
                                    title="Delete Follow-up"
                                  >
                                    <HiTrash className="h-3 w-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">{followUp.notes}</p>
                            {followUp.nextFollowUpDate && (
                              <p className="text-xs text-gray-500 mt-1">
                                Next: {formatDateTime(followUp.nextFollowUpDate, followUp.nextFollowUpTime)}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <HiClock className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No follow-ups recorded yet</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Follow-up Modal */}
      {showAddFollowUpModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowAddFollowUpModal(false);
              resetForm();
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Add Follow-up</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddFollowUpModal(false);
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
                        Follow-up Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {followUpTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {followUpStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        name="followUpDate"
                        value={formData.followUpDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Follow-up Time
                      </label>
                      <input
                        type="time"
                        name="followUpTime"
                        value={formData.followUpTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outcome
                      </label>
                      <select
                        name="outcome"
                        value={formData.outcome}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {outcomes.map(outcome => (
                          <option key={outcome.value} value={outcome.value}>
                            {outcome.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Follow-up Date
                      </label>
                      <input
                        type="date"
                        name="nextFollowUpDate"
                        value={formData.nextFollowUpDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      placeholder="Enter follow-up notes..."
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-[#22c55e]-600 text-base font-medium text-white hover:bg-[#22c55e]-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    <HiCheck className="h-4 w-4 mr-2" />
                    Add Follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddFollowUpModal(false);
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

      {/* Edit Follow-up Modal */}
      {showEditFollowUpModal && selectedFollowUp && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => {
              setShowEditFollowUpModal(false);
              setSelectedFollowUp(null);
              resetForm();
            }}></div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <form onSubmit={handleUpdateFollowUp}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">Edit Follow-up</h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditFollowUpModal(false);
                        setSelectedFollowUp(null);
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
                        Follow-up Type
                      </label>
                      <select
                        name="type"
                        value={formData.type}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {followUpTypes.map(type => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {followUpStatuses.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Follow-up Date
                      </label>
                      <input
                        type="date"
                        name="followUpDate"
                        value={formData.followUpDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Follow-up Time
                      </label>
                      <input
                        type="time"
                        name="followUpTime"
                        value={formData.followUpTime}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Outcome
                      </label>
                      <select
                        name="outcome"
                        value={formData.outcome}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      >
                        {outcomes.map(outcome => (
                          <option key={outcome.value} value={outcome.value}>
                            {outcome.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Next Follow-up Date
                      </label>
                      <input
                        type="date"
                        name="nextFollowUpDate"
                        value={formData.nextFollowUpDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent"
                      placeholder="Enter follow-up notes..."
                    />
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-[#22c55e]-600 text-base font-medium text-white hover:bg-[#22c55e]-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#22c55e]-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors duration-200"
                  >
                    <HiCheck className="h-4 w-4 mr-2" />
                    Update Follow-up
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditFollowUpModal(false);
                      setSelectedFollowUp(null);
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

export default FollowUpHistory;
