import React from 'react';
import {
  HiPencil,
  HiTrash,
  HiXCircle,
  HiCheckCircle
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import Button from './Button';

const HealthIssueDetailsModal = ({ 
  isOpen, 
  onClose, 
  healthIssue, 
  onEdit, 
  onDelete,
  onResolve,
  onReopen
}) => {
  if (!isOpen || !healthIssue) return null;

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

  const getGenderColor = (gender) => {
    switch (gender) {
      case 'male':
        return 'bg-blue-100 text-blue-800';
      case 'female':
        return 'bg-pink-100 text-pink-800';
      case 'both':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaritalStatusColor = (maritalStatus) => {
    switch (maritalStatus) {
      case 'married':
        return 'bg-green-100 text-green-800';
      case 'unmarried':
        return 'bg-yellow-100 text-yellow-800';
      case 'both':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getGenderIcon = (gender) => {
    switch (gender) {
      case 'male':
        return '👨';
      case 'female':
        return '👩';
      case 'both':
        return '👥';
      default:
        return '👤';
    }
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Health Issue',
        value: healthIssue.healthIssue || 'N/A'
      },
      {
        label: 'Gender',
        value: healthIssue.gender?.charAt(0).toUpperCase() + healthIssue.gender?.slice(1) || 'N/A'
      },
      {
        label: 'Marital Status',
        value: healthIssue.maritalStatus?.charAt(0).toUpperCase() + healthIssue.maritalStatus?.slice(1) || 'N/A'
      },
      {
        label: 'Age Range',
        value: `${healthIssue.fromAge} - ${healthIssue.toAge} years`
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Status',
        value: healthIssue.isActive ? 'Active' : 'Inactive',
        type: 'status'
      },
      {
        label: 'Created By',
        value: healthIssue.createdBy ? 
          `${healthIssue.createdBy.firstName} ${healthIssue.createdBy.lastName}` : 
                          'Unknown User'
      },
      {
        label: 'Created Date',
        value: formatDate(healthIssue.createdAt)
      },
      {
        label: 'Last Updated',
        value: formatDate(healthIssue.updatedAt)
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
                    onEdit(healthIssue);
                    onClose();
                  }}
          variant="primary"
          icon={HiPencil}
          className="px-4 py-2"
                >
          Edit Health Issue
                </Button>
              )}
      {healthIssue.isActive ? (
        onDelete && (
                  <Button
                    onClick={() => {
              onDelete(healthIssue);
                      onClose();
                    }}
            variant="warning"
            icon={HiXCircle}
            className="px-4 py-2"
                  >
            Deactivate
                  </Button>
                )
              ) : (
                onResolve && (
                  <Button
                    onClick={() => {
                      onResolve(healthIssue);
                      onClose();
                    }}
            variant="success"
            icon={HiCheckCircle}
            className="px-4 py-2"
                  >
            Activate
                  </Button>
                )
              )}
              {onDelete && (
                <Button
                  onClick={() => {
                    onDelete(healthIssue);
                    onClose();
                  }}
          variant="danger"
          icon={HiTrash}
          className="px-4 py-2"
                >
          Delete
                </Button>
              )}
    </>
  );

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Health Issue Details"
      subtitle="View and manage health issue information"
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

export default HealthIssueDetailsModal;



