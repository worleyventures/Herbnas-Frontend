import React from 'react';
import { HiUser, HiCalendar, HiExclamationTriangle } from 'react-icons/hi2';
import Dropdown from '../../../common/Dropdown';

const BasicInfoStep = ({ formData, setFormData, errors, setErrors, hasAttemptedSubmit }) => {
  const statusOptions = [
    { value: 'new_lead', label: 'New Lead', color: 'bg-blue-500/10 text-blue-500' },
    { value: 'not_answered', label: 'Not Answered', color: 'bg-yellow-500/10 text-yellow-500' },
    { value: 'qualified', label: 'Qualified', color: 'bg-green-500/10 text-green-500' },
    { value: 'pending', label: 'Pending', color: 'bg-purple-500/10 text-purple-500' },
    { value: 'order_completed', label: 'Order Completed', color: 'bg-green-500/10 text-green-500' },
    { value: 'unqualified', label: 'Unqualified', color: 'bg-red-500/10 text-red-500' }
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'bg-green-500/10 text-green-500' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500/10 text-yellow-500' },
    { value: 'high', label: 'High', color: 'bg-red-500/10 text-red-500' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-blue-100 rounded-xl flex items-center justify-center">
          <HiUser className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Basic Lead Information</h4>
          <p className="text-sm text-gray-600">Essential lead details and status</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Lead Date *
          </label>
          <input
            type="date"
            name="leadDate"
            value={formData.leadDate}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md"
          />
        </div>
        
        <div>
          <Dropdown
            label="Lead Status *"
            name="leadStatus"
            value={formData.leadStatus}
            onChange={handleInputChange}
            options={statusOptions}
            placeholder="Select lead status"
            className="focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a]"
          />
        </div>

        <div>
          <Dropdown
            label="Priority"
            name="priority"
            value={formData.priority}
            onChange={handleInputChange}
            options={priorityOptions}
            placeholder="Select priority"
            className="focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a]"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes
        </label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          rows={3}
          placeholder="Additional notes about this lead..."
          className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white shadow-sm hover:shadow-md resize-none"
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
