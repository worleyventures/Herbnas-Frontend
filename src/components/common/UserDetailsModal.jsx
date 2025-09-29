import React from 'react';
import {
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import Button from './Button';

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
            onEdit(user);
            onClose();
          }}
          variant="primary"
          icon={HiPencil}
          className="px-4 py-2"
        >
          Edit User
        </Button>
      )}
      {onDelete && (
        <Button
          onClick={() => {
            onDelete(user);
            onClose();
          }}
          variant="danger"
          icon={HiTrash}
          className="px-4 py-2"
        >
          Delete User
        </Button>
      )}
    </>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Details"
      subtitle={`${user.firstName} ${user.lastName}`}
      size="lg"
      showFooter={true}
      footerContent={footerContent}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DetailsView sections={[basicInfo]} />
        <DetailsView sections={[additionalInfo]} />
      </div>
    </CommonModal>
  );
};

export default UserDetailsModal;
