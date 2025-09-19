import React, { useState } from 'react';
import {
  HiUser,
  HiPhone,
  HiEnvelope,
  HiCalendar,
  HiCheckCircle,
  HiExclamationTriangle,
  HiClock,
  HiXCircle
} from 'react-icons/hi2';

const LeadPipeline = ({ 
  leads, 
  onStatusUpdate, 
  onSelectLead, 
  onEditLead 
}) => {
  const [draggedLead, setDraggedLead] = useState(null);


  const pipelineStages = [
    { 
      id: 'new_lead', 
      title: 'New Leads', 
      color: 'bg-blue-500', 
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-200'
    },
    { 
      id: 'not_answered', 
      title: 'Not Answered', 
      color: 'bg-yellow-500', 
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-200'
    },
    { 
      id: 'qualified', 
      title: 'Qualified', 
      color: 'bg-purple-500', 
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-800',
      borderColor: 'border-purple-200'
    },
    { 
      id: 'pending', 
      title: 'Pending', 
      color: 'bg-orange-500', 
      bgColor: 'bg-orange-50',
      textColor: 'text-orange-800',
      borderColor: 'border-orange-200'
    },
    { 
      id: 'order_completed', 
      title: 'Order Completed', 
      color: 'bg-[#22c55e]-500', 
      bgColor: 'bg-[#22c55e]-50',
      textColor: 'text-[#22c55e]-800',
      borderColor: 'border-[#22c55e]-200'
    },
    { 
      id: 'unqualified', 
      title: 'Unqualified', 
      color: 'bg-red-500', 
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-200'
    }
  ];

  const getLeadsByStatus = (status) => {
    const filteredLeads = leads.filter(lead => lead.leadStatus === status);
    
    // For all statuses, show only last 3 leads
    return filteredLeads
      .sort((a, b) => new Date(b.createdAt || b.created_at) - new Date(a.createdAt || a.created_at))
      .slice(0, 3);
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high':
        return <HiExclamationTriangle className="h-4 w-4 text-red-500" />;
      case 'medium':
        return <HiClock className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <HiCheckCircle className="h-4 w-4 text-[#22c55e]-500" />;
      default:
        return <HiClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'new_lead':
        // return <HiUser className="h-4 w-4" />;
      case 'not_answered':
        // return <HiPhone className="h-4 w-4" />;
      case 'qualified':
        // return <HiCheckCircle className="h-4 w-4" />;
      case 'pending':
        // return <HiClock className="h-4 w-4" />;
      case 'order_completed':
        // return <HiCheckCircle className="h-4 w-4" />;
      case 'unqualified':
        // return <HiXCircle className="h-4 w-4" />;
      default:
        // return <HiUser className="h-4 w-4" />;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return `${date.getDate()}/${date.getMonth() + 1}`;
  };

  const handleDragStart = (e, lead) => {
    setDraggedLead(lead);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    if (draggedLead && draggedLead.leadStatus !== newStatus) {
      onStatusUpdate(draggedLead._id || draggedLead.id, newStatus);
    }
    setDraggedLead(null);
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Lead Pipeline</h2>
        <p className="text-xs text-gray-600 mt-1">Drag and drop leads between stages to update their status</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {pipelineStages.map((stage) => {
          const stageLeads = getLeadsByStatus(stage.id);
          
          return (
            <div
              key={stage.id}
              className={`${stage.bgColor} ${stage.borderColor} border-2 rounded-lg p-4 min-h-[400px]`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <div className={`p-1.5 rounded-md ${stage.color} text-white mr-2`}>
                    {getStatusIcon(stage.id)}
                  </div>
                  <div>
                    <h3 className={`font-medium text-sm ${stage.textColor}`}>{stage.title}</h3>
                    <p className="text-xs text-gray-600">
                      {(() => {
                        const totalLeads = leads.filter(lead => lead.leadStatus === stage.id).length;
                        if (totalLeads > 3) {
                          return `${stageLeads.length} of ${totalLeads}`;
                        }
                        return stageLeads.length;
                      })()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Leads List */}
              <div className="space-y-3">
                {stageLeads.length === 0 ? (
                  <div className="text-center py-4">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${stage.color} bg-opacity-20 mb-2`}>
                      {getStatusIcon(stage.id)}
                    </div>
                    <p className={`text-xs ${stage.textColor} opacity-60`}>No leads</p>
                  </div>
                ) : (
                  <>
                    {stageLeads.map((lead) => (
                    <div
                      key={lead._id || lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead)}
                      className="bg-white rounded-md p-3 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-move"
                    >
                      {/* Lead Header - Compact */}
                      <div className="flex items-center mb-2">
                        <div className="w-6 h-6 bg-gradient-to-r from-[#22c55e]-400 to-[#22c55e]-500 rounded-full flex items-center justify-center mr-2">
                          <span className="text-xs font-medium text-white">
                            {lead.customerName?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-medium text-gray-900 text-xs truncate">{lead.customerName}</h4>
                          <p className="text-xs text-gray-500 truncate">
                            {(() => {
                              if (!lead.dispatchedFrom) return 'No Branch';
                              if (typeof lead.dispatchedFrom === 'string') return lead.dispatchedFrom;
                              if (lead.dispatchedFrom.name) return lead.dispatchedFrom.name;
                              if (lead.dispatchedFrom.branchName) return lead.dispatchedFrom.branchName;
                              return 'No Branch';
                            })()}
                          </p>
                        </div>
                      </div>

                      {/* Contact - Minimal */}
                      <div className="flex items-center text-xs text-gray-600 mb-2">
                        <HiPhone className="h-3 w-3 mr-1" />
                        <span className="truncate">{lead.customerMobile}</span>
                      </div>

                      {/* Status Badge */}
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full truncate max-w-[60%]">
                          {lead.leadStatus?.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-gray-500 truncate max-w-[35%]">
                          {formatDate(lead.createdAt)}
                        </span>
                      </div>
                    </div>
                    ))}
                    
                    {/* Show "more leads" indicator if there are more than 3 leads */}
                    {(() => {
                      const totalLeads = leads.filter(lead => lead.leadStatus === stage.id).length;
                      if (totalLeads > 3) {
                        return (
                          <div className="text-center py-2">
                            <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${stage.textColor} bg-opacity-20`}>
                              +{totalLeads - 3} more
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pipeline Summary - Compact */}
      <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Pipeline Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {pipelineStages.map((stage) => {
            const stageLeads = getLeadsByStatus(stage.id);
            const percentage = leads.length > 0 ? Math.round((stageLeads.length / leads.length) * 100) : 0;
            
            return (
              <div key={stage.id} className="text-center">
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${stage.color} text-white mb-2`}>
                  {/* {getStatusIcon(stage.id)} */}
                </div>
                <p className="text-xl font-bold text-gray-900">{stageLeads.length}</p>
                <p className={`text-xs font-medium ${stage.textColor}`}>{stage.title}</p>
                <p className="text-xs text-gray-500">{percentage}%</p>
              </div>
            );
          })}
        </div>
        
        {/* Total Summary - Compact */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-900">{leads.length}</p>
              <p className="text-xs text-gray-600">Total</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-[#22c55e]-600">
                {leads.filter(lead => lead.leadStatus === 'order_completed').length}
              </p>
              <p className="text-xs text-gray-600">Completed</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-600">
                {leads.filter(lead => lead.leadStatus === 'new_lead').length}
              </p>
              <p className="text-xs text-gray-600">New</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-purple-600">
                {leads.filter(lead => lead.leadStatus === 'qualified').length}
              </p>
              <p className="text-xs text-gray-600">Qualified</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeadPipeline;