import React from 'react';
import {
  HiCheckCircle,
  HiXCircle,
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import Button from './Button';

const BranchDetailsModal = ({ 
  isOpen, 
  onClose, 
  branch, 
  onEdit, 
  onDelete,
  onActivate,
  onDisable
}) => {
  if (!isOpen || !branch) return null;

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
        label: 'Branch Name',
        value: branch.branchName || 'N/A'
      },
      {
        label: 'Address',
        value: branch.address || 'N/A'
      },
      {
        label: 'Phone',
        value: branch.phone || 'N/A'
      },
      {
        label: 'Email',
        value: branch.email || 'N/A'
      },
      {
        label: 'Status',
        value: branch.isActive ? 'Active' : 'Inactive',
        type: 'status'
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Manager',
        value: branch.manager ? 
          `${branch.manager.firstName} ${branch.manager.lastName}` : 
          'N/A'
      },
      {
        label: 'Created Date',
        value: formatDate(branch.createdAt)
      },
      {
        label: 'Description',
        value: branch.description || 'No description available'
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
            onEdit(branch);
            onClose();
          }}
          variant="primary"
          icon={HiPencil}
          className="px-4 py-2"
        >
          Edit Branch
        </Button>
      )}
      {branch.isActive ? (
        onDisable && (
          <Button
            onClick={() => {
              onDisable(branch);
              onClose();
            }}
            variant="warning"
            icon={HiXCircle}
            className="px-4 py-2"
          >
            Disable Branch
          </Button>
        )
      ) : (
        onActivate && (
          <Button
            onClick={() => {
              onActivate(branch);
              onClose();
            }}
            variant="success"
            icon={HiCheckCircle}
            className="px-4 py-2"
          >
            Activate Branch
          </Button>
        )
      )}
      {onDelete && (
        <Button
          onClick={() => {
            onDelete(branch);
            onClose();
          }}
          variant="danger"
          icon={HiTrash}
          className="px-4 py-2"
        >
          Delete Branch
        </Button>
      )}
    </>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Branch Details"
      subtitle={branch.branchName}
      size="xl"
      showFooter={true}
      footerContent={footerContent}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <DetailsView sections={[additionalInfo]} />
        </div>
        <div>
          <DetailsView sections={[basicInfo]} />
        </div>
      </div>
    </CommonModal>
  );
};

export default BranchDetailsModal;
