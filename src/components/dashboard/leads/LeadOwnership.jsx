import React, { useState } from 'react';
import { 
  HiUser, 
  HiBuildingOffice2,
  HiPencil,
  HiCheck,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiUsers,
  HiPhone,
  HiEnvelope
} from 'react-icons/hi2';

const LeadOwnership = ({ leads, branches, salesReps, onUpdateLead }) => {
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    branch: '',
    assignedTo: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      branch: lead.branch,
      assignedTo: lead.assignedTo
    });
  };

  const handleSave = () => {
    if (editingLead) {
      onUpdateLead({
        ...editingLead,
        ...formData
      });
      setEditingLead(null);
      setFormData({ branch: '', assignedTo: '' });
    }
  };

  const handleCancel = () => {
    setEditingLead(null);
    setFormData({ branch: '', assignedTo: '' });
  };

  // Group leads by branch
  const leadsByBranch = leads.reduce((acc, lead) => {
    if (!acc[lead.branch]) {
      acc[lead.branch] = [];
    }
    acc[lead.branch].push(lead);
    return acc;
  }, {});

  // Group leads by sales rep
  const leadsByRep = leads.reduce((acc, lead) => {
    if (!acc[lead.assignedTo]) {
      acc[lead.assignedTo] = [];
    }
    acc[lead.assignedTo].push(lead);
    return acc;
  }, {});

  const getStatusColor = (status) => {
    const colors = {
      new: 'bg-blue-100 text-blue-800',
      contacted: 'bg-yellow-100 text-yellow-800',
      qualified: 'bg-purple-100 text-purple-800',
      converted: 'bg-[#22c55e]-100 text-[#22c55e]-800',
      lost: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      high: 'bg-red-100 text-red-800',
      medium: 'bg-yellow-100 text-yellow-800',
      low: 'bg-[#22c55e]-100 text-[#22c55e]-800'
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Lead Ownership & Assignment</h2>
        <div className="text-sm text-gray-500">
          Manage lead assignments and branch ownership
        </div>
      </div>

      {/* Branch Assignment Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HiBuildingOffice2 className="h-5 w-5 mr-2" />
          Branch Assignment Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map(branch => {
            const branchLeads = leadsByBranch[branch] || [];
            const convertedLeads = branchLeads.filter(lead => lead.status === 'converted').length;
            const conversionRate = branchLeads.length > 0 ? (convertedLeads / branchLeads.length) * 100 : 0;
            
            return (
              <div key={branch} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{branch}</h4>
                  <span className="text-sm text-gray-500">{branchLeads.length} leads</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Converted:</span>
                    <span className="font-medium text-[#22c55e]-600">{convertedLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion Rate:</span>
                    <span className="font-medium text-blue-600">{conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sales Rep Assignment Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <HiUsers className="h-5 w-5 mr-2" />
          Sales Rep Assignment Overview
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {salesReps.map(rep => {
            const repLeads = leadsByRep[rep] || [];
            const convertedLeads = repLeads.filter(lead => lead.status === 'converted').length;
            const conversionRate = repLeads.length > 0 ? (convertedLeads / repLeads.length) * 100 : 0;
            
            return (
              <div key={rep} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{rep}</h4>
                  <span className="text-sm text-gray-500">{repLeads.length} leads</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Converted:</span>
                    <span className="font-medium text-[#22c55e]-600">{convertedLeads}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Conversion Rate:</span>
                    <span className="font-medium text-blue-600">{conversionRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lead Assignment Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lead Assignment Management</h3>
          <p className="text-sm text-gray-500 mt-1">Click edit to change branch or sales rep assignment</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Branch
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Assigned To
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-[#22c55e]-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-[#22c55e]-600">
                            {lead.customerName.charAt(0)}
                          </span>
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{lead.customerName}</div>
                        <div className="text-sm text-gray-500">{lead.source}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.customerMobile}</div>
                    <div className="text-sm text-gray-500">{lead.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingLead && editingLead.id === lead.id ? (
                      <select
                        name="branch"
                        value={formData.branch}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent text-sm"
                      >
                        {branches.map(branch => (
                          <option key={branch} value={branch}>{branch}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center">
                        <HiBuildingOffice2 className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{lead.branch}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingLead && editingLead.id === lead.id ? (
                      <select
                        name="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#22c55e]-500 focus:border-transparent text-sm"
                      >
                        {salesReps.map(rep => (
                          <option key={rep} value={rep}>{rep}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="flex items-center">
                        <HiUser className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">{lead.assignedTo}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(lead.priority)}`}>
                      {lead.priority.charAt(0).toUpperCase() + lead.priority.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingLead && editingLead.id === lead.id ? (
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={handleSave}
                          className="text-[#22c55e]-600 hover:text-[#22c55e]-900 transition-colors duration-200"
                          title="Save Changes"
                        >
                          <HiCheck className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="text-gray-600 hover:text-gray-900 transition-colors duration-200"
                          title="Cancel"
                        >
                          <HiXMark className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleEdit(lead)}
                        className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                        title="Edit Assignment"
                      >
                        <HiPencil className="h-4 w-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assignment Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Branch Performance</h3>
          <div className="space-y-3">
            {branches.map(branch => {
              const branchLeads = leadsByBranch[branch] || [];
              const convertedLeads = branchLeads.filter(lead => lead.status === 'converted').length;
              const conversionRate = branchLeads.length > 0 ? (convertedLeads / branchLeads.length) * 100 : 0;
              
              return (
                <div key={branch} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HiBuildingOffice2 className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{branch}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{branchLeads.length} leads</span>
                    <span className={`text-sm font-medium ${conversionRate >= 20 ? 'text-[#22c55e]-600' : conversionRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Rep Performance</h3>
          <div className="space-y-3">
            {salesReps.map(rep => {
              const repLeads = leadsByRep[rep] || [];
              const convertedLeads = repLeads.filter(lead => lead.status === 'converted').length;
              const conversionRate = repLeads.length > 0 ? (convertedLeads / repLeads.length) * 100 : 0;
              
              return (
                <div key={rep} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HiUser className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm font-medium text-gray-900">{rep}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">{repLeads.length} leads</span>
                    <span className={`text-sm font-medium ${conversionRate >= 20 ? 'text-[#22c55e]-600' : conversionRate >= 10 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {conversionRate.toFixed(1)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Assignment Insights */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <HiBuildingOffice2 className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Top Branch</p>
                <p className="text-lg font-bold text-blue-900">
                  {branches.reduce((top, branch) => {
                    const branchLeads = leadsByBranch[branch] || [];
                    const topLeads = leadsByBranch[top] || [];
                    return branchLeads.length > topLeads.length ? branch : top;
                  }, branches[0] || 'N/A')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-[#22c55e]-50 rounded-lg p-4">
            <div className="flex items-center">
              <HiUser className="h-8 w-8 text-[#22c55e]-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-[#22c55e]-600">Top Sales Rep</p>
                <p className="text-lg font-bold text-[#22c55e]-900">
                  {salesReps.reduce((top, rep) => {
                    const repLeads = leadsByRep[rep] || [];
                    const topLeads = leadsByRep[top] || [];
                    return repLeads.length > topLeads.length ? rep : top;
                  }, salesReps[0] || 'N/A')}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <HiCheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Total Assigned</p>
                <p className="text-lg font-bold text-purple-900">{leads.length}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadOwnership;
