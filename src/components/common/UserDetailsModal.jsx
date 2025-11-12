import React from 'react';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';

const UserDetailsModal = ({ 
  isOpen, 
  onClose, 
  user, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !user) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Full Name',
        value: `${user.firstName} ${user.lastName}`
      },
      {
        label: 'Email',
        value: user.email || 'N/A'
      },
      {
        label: 'Phone',
        value: user.phone || 'N/A'
      },
      {
        label: 'Role',
        value: user.role?.charAt(0).toUpperCase() + user.role?.slice(1) || 'N/A',
        type: 'status'
      },
      {
        label: 'Status',
        value: user.isActive ? 'Active' : 'Inactive',
        type: 'status'
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Branch',
        value: user.branch?.branchName || 'N/A'
      },
      {
        label: 'Created Date',
        value: formatDate(user.createdAt)
      },
      {
        label: 'Address',
        value: user.address || 'No address provided'
      }
    ]
  };

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      subtitle={`${user.firstName} ${user.lastName}`}
      size="lg"
      showFooter={false}
    >
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <DetailsView sections={[basicInfo]} />
        </div>
        <div>
          <DetailsView sections={[additionalInfo]} />
        </div>
      </div>
    </CommonModal>
  );
};

export default UserDetailsModal;
