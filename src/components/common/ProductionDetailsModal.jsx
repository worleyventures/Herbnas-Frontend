import React from 'react';
import {
  HiPencil,
  HiTrash
} from 'react-icons/hi2';
import CommonModal from './CommonModal';
import DetailsView from './DetailsView';
import Button from './Button';
import { StatusBadge } from './Badge';

const ProductionDetailsModal = ({ 
  isOpen, 
  onClose, 
  production, 
  onEdit, 
  onDelete 
}) => {
  if (!isOpen || !production) return null;

  // Debug logging
  console.log('ProductionDetailsModal - production data:', production);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const basicInfo = {
    title: 'Basic Information',
    fields: [
      {
        label: 'Batch ID',
        value: production.batchId || 'N/A'
      },
      {
        label: 'Product Name',
        value: production.productId?.productName || 'N/A'
      },
      {
        label: 'Category',
        value: production.productId?.category || 'N/A'
      },
      {
        label: 'Quantity',
        value: `${production.quantity || 0} ${production.productId?.UOM || 'units'}`
      },
      {
        label: 'Production Status',
        value: production.productionStatus?.charAt(0).toUpperCase() + production.productionStatus?.slice(1) || 'N/A',
        type: 'status'
      },
      {
        label: 'QC Status',
        value: production.QCstatus || 'N/A',
        type: 'status'
      }
    ]
  };

  const additionalInfo = {
    title: 'Additional Information',
    fields: [
      {
        label: 'Manufactured Date',
        value: formatDate(production.manufacturedDate)
      },
      {
        label: 'Expiry Date',
        value: formatDate(production.expiryDate)
      },
      {
        label: 'Active Status',
        value: production.isActive ? 'Active' : 'Inactive',
        type: 'status'
      },
      {
        label: 'Created By',
        value: production.createdBy ? 
          `${production.createdBy.firstName} ${production.createdBy.lastName}` : 
          'Unknown User'
      },
      {
        label: 'Updated By',
        value: production.updatedBy ? 
          `${production.updatedBy.firstName} ${production.updatedBy.lastName}` : 
          'Unknown User'
      },
      {
        label: 'Created Date',
        value: formatDateTime(production.createdAt)
      },
      {
        label: 'Last Updated',
        value: formatDateTime(production.updatedAt)
      }
    ]
  };

  const rawMaterialsInfo = production.rawMaterials && production.rawMaterials.length > 0 ? {
    title: 'Raw Materials Used',
    fields: production.rawMaterials.map((rawMaterial, index) => {
      // Handle SETs materials differently
      if (rawMaterial.rawMaterialId?.materialType === 'sets') {
        return {
          label: `${rawMaterial.rawMaterialId?.set || 'SET'} - Batch: ${rawMaterial.rawMaterialId?.batchId || 'N/A'}`,
          value: `${rawMaterial.quantity} ${rawMaterial.rawMaterialId?.UOM || 'units'} (Available: ${rawMaterial.rawMaterialId?.stockQuantity || 0})`
        };
      }
      // Handle individual materials
      return {
        label: rawMaterial.rawMaterialId?.materialName || 'Unknown Material',
        value: `${rawMaterial.quantity} ${rawMaterial.rawMaterialId?.UOM || 'units'} (Available: ${rawMaterial.rawMaterialId?.stockQuantity || 0})`
      };
    })
  } : null;

  const notesInfo = (production.notes || production.QCNotes) ? {
    title: 'Notes',
    fields: [
      ...(production.notes ? [{
        label: 'Production Notes',
        value: production.notes
      }] : []),
      ...(production.QCNotes ? [{
        label: 'QC Notes',
        value: production.QCNotes
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
            onEdit(production);
            onClose();
          }}
          variant="primary"
          icon={HiPencil}
          className="px-4 py-2"
        >
          Edit Production
        </Button>
      )}
      {onDelete && (
        <Button
          onClick={() => {
            onDelete(production);
            onClose();
          }}
          variant="danger"
          icon={HiTrash}
          className="px-4 py-2"
        >
          Delete Production
        </Button>
      )}
    </>
  );

  const sections = [basicInfo, additionalInfo];
  if (rawMaterialsInfo) sections.push(rawMaterialsInfo);
  if (notesInfo) sections.push(notesInfo);

  return (
    <CommonModal
      isOpen={isOpen}
      onClose={onClose}
      title="Production Batch Details"
      subtitle={production.batchId}
      size="xl"
      showFooter={true}
      footerContent={footerContent}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left Column - Additional Info and Notes */}
        <div className="space-y-4">
          <DetailsView sections={[additionalInfo]} />
          {notesInfo && <DetailsView sections={[notesInfo]} />}
        </div>
        
        {/* Right Column - Basic Info */}
        <div className="space-y-4">
          <DetailsView sections={[basicInfo]} />
          {rawMaterialsInfo && <DetailsView sections={[rawMaterialsInfo]} />}
        </div>
      </div>
    </CommonModal>
  );
};

export default ProductionDetailsModal;


