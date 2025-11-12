import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getActiveBranches } from '../../redux/actions/branchActions';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';

const LeadDetailsModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onEdit, 
  onDelete 
}) => {
  const dispatch = useDispatch();
  // Get branches from Redux to resolve branch names
  const { branches } = useSelector((state) => state.branches);
  
  // Load branches if not already loaded
  useEffect(() => {
    if (isOpen && (!branches || branches.length === 0)) {
      dispatch(getActiveBranches());
    }
  }, [isOpen, branches, dispatch]);
  
  if (!isOpen || !lead) return null;
  
  // Helper function to get branch name
  const getBranchName = () => {
    // If dispatchedFrom is already populated with branchName
    if (lead.dispatchedFrom?.branchName) {
      return lead.dispatchedFrom.branchName;
    }
    
    // If dispatchedFrom is an object but no branchName, try other fields
    if (lead.dispatchedFrom && typeof lead.dispatchedFrom === 'object') {
      return lead.dispatchedFrom.name || (lead.dispatchedFrom._id ? 'Loading...' : 'N/A');
    }
    
    // If dispatchedFrom is just an ID (string), look it up in branches
    if (lead.dispatchedFrom && typeof lead.dispatchedFrom === 'string') {
      const branch = Array.isArray(branches) && branches.length > 0
        ? branches.find(b => {
            const branchId = b._id || b.id;
            return branchId && (branchId.toString() === lead.dispatchedFrom.toString());
          })
        : null;
      return branch ? branch.branchName : branches?.length === 0 ? 'N/A' : 'Loading...';
    }
    
    return 'N/A';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'new_lead':
        return 'New Lead';
      case 'not_answered':
        return 'Not Answered';
      case 'qualified':
        return 'Qualified';
      case 'pending':
        return 'Pending';
      case 'order_completed':
        return 'Order Completed';
      case 'unqualified':
        return 'Unqualified';
      default:
        return status;
    }
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Full Name',
        value: lead.customerName || 'N/A'
      },
      {
        label: 'Email',
        value: lead.customerEmail || 'N/A'
      },
      {
        label: 'Phone',
        value: lead.customerMobile || 'N/A'
      },
      {
        label: 'Age',
        value: lead.age ? `${lead.age} years` : 'N/A'
      },
      {
        label: 'Gender',
        value: lead.gender || 'N/A'
      },
      {
        label: 'Marital Status',
        value: lead.maritalStatus || 'N/A'
      },
      {
        label: 'Status',
        value: getStatusLabel(lead.leadStatus),
        type: 'status'
      },
      {
        label: 'Priority',
        value: lead.priority?.charAt(0).toUpperCase() + lead.priority?.slice(1) || 'N/A',
        type: 'status'
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Assigned Branch',
        value: getBranchName()
      },
      {
        label: 'Address',
        value: lead.address ? 
          `${lead.address.street || ''}, ${lead.address.city || ''}, ${lead.address.state || ''} - ${lead.address.pinCode || ''}`.replace(/,\s*,/g, ',').replace(/^,\s*|,\s*$/g, '') || 'N/A' :
          'N/A'
      },
      {
        label: 'Health Issues',
        value: lead.healthIssues && lead.healthIssues.length > 0 ? 
          lead.healthIssues.join(', ') : 'N/A'
      },
      {
        label: 'Products',
        value: lead.products && lead.products.length > 0 ? 
          lead.products.map(p => p.productName || p).join(', ') : 'N/A'
      },
      {
        label: 'Payment Type',
        value: lead.payment?.paymentType ? 
          lead.payment.paymentType.charAt(0).toUpperCase() + lead.payment.paymentType.slice(1) : 'N/A'
      },
      {
        label: 'Payment Mode',
        value: lead.payment?.paymentMode ? 
          lead.payment.paymentMode.charAt(0).toUpperCase() + lead.payment.paymentMode.slice(1) : 'N/A'
      },
      {
        label: 'Created Date',
        value: formatDate(lead.createdAt)
      },
      {
        label: 'Last Contact',
        value: formatDate(lead.lastContactDate)
      }
    ]
  };

  const notesInfo = (lead.notes || lead.comments) ? {
    title: 'Notes & Comments',
    fields: [
      ...(lead.notes ? [{
        label: 'Notes',
        value: lead.notes
      }] : []),
      ...(lead.comments ? [{
        label: 'Comments',
        value: lead.comments
      }] : [])
    ]
  } : null;

  const sections = [basicInfo, additionalInfo];
  if (notesInfo) sections.push(notesInfo);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Details"
      subtitle={lead.customerName || 'Lead Details'}
      size="lg"
      showFooter={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <DetailsView sections={sections.slice(0, Math.ceil(sections.length / 3))} />
        </div>
        <div>
          <DetailsView sections={sections.slice(Math.ceil(sections.length / 3), Math.ceil(sections.length * 2 / 3))} />
        </div>
        <div>
          <DetailsView sections={sections.slice(Math.ceil(sections.length * 2 / 3))} />
        </div>
      </div>
    </CommonModal>
  );
};

export default LeadDetailsModal;
