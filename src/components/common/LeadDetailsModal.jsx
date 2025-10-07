import React from 'react';
import {
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import Button from './Button';

const LeadDetailsModal = ({ 
  isOpen, 
  onClose, 
  lead, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !lead) return null;

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
        value: lead.dispatchedFrom?.branchName || 'N/A'
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

  const footerContent = (
    <>
              <Button
        onClick={onClose}
                variant="outline"
                className="px-4 py-2"
              >
                Close
              </Button>
              {onEdit && (
                <Button
                  onClick={() => {
                    onEdit(lead);
                    onClose();
                  }}
          variant="primary"
          icon={HiPencil}
          className="px-4 py-2"
                >
          Edit Lead
                </Button>
              )}
              {onDelete && (
                <Button
                  onClick={() => {
                    onDelete(lead);
                    onClose();
                  }}
          variant="danger"
          icon={HiTrash}
          className="px-4 py-2"
                >
          Delete Lead
                </Button>
              )}
    </>
  );

  const sections = [basicInfo, additionalInfo];
  if (notesInfo) sections.push(notesInfo);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Lead Details"
      subtitle={lead.customerName || 'Lead Details'}
      size="xl"
      showFooter={true}
      footerContent={footerContent}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DetailsView sections={sections.slice(0, Math.ceil(sections.length / 2))} />
        </div>
        <div>
          <DetailsView sections={sections.slice(Math.ceil(sections.length / 2))} />
        </div>
      </div>
    </CommonModal>
  );
};

export default LeadDetailsModal;
