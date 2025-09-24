import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProductionById, deleteProduction } from '../../redux/actions/productionActions';
import { addNotification } from '../../redux/slices/uiSlice';
import { ProductionDetailsModal, Loading, EmptyState, Button, ConfirmationModal } from '../../components/common';
import { HiArrowLeft, HiPencil, HiTrash } from 'react-icons/hi2';

const ProductionDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { currentProduction, loading, error } = useSelector((state) => state.productions);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(getProductionById(id));
    }
  }, [dispatch, id]);

  const handleEdit = () => {
    navigate(`/productions/edit/${id}`);
  };

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (id) {
      dispatch(deleteProduction(id))
        .then((result) => {
          if (result.type === 'productions/deleteProduction/fulfilled') {
            dispatch(addNotification({
              type: 'success',
              title: 'Production Deleted',
              message: 'Production batch deleted successfully',
              duration: 3000
            }));
            navigate('/productions');
          } else {
            dispatch(addNotification({
              type: 'error',
              title: 'Delete Failed',
              message: result.payload || 'Failed to delete production batch',
              duration: 5000
            }));
          }
        });
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <EmptyState
          title="Error Loading Production"
          message={error}
          action={{
            label: 'Go Back',
            onClick: () => navigate('/productions')
          }}
        />
      </div>
    );
  }

  if (!currentProduction) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <EmptyState
          title="Production Not Found"
          message="The production batch you're looking for doesn't exist."
          action={{
            label: 'Go Back',
            onClick: () => navigate('/productions')
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => navigate('/productions')}
              variant="outline"
              size="sm"
              icon={HiArrowLeft}
            >
              Back to Productions
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Production Batch: {currentProduction.batchId}
              </h1>
              <p className="text-sm text-gray-500">
                Production batch details and management
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Button
              onClick={handleEdit}
              variant="primary"
              size="sm"
              icon={HiPencil}
            >
              Edit Production
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              size="sm"
              icon={HiTrash}
            >
              Delete Production
            </Button>
          </div>
        </div>

        {/* Production Details Modal */}
        <ProductionDetailsModal
          isOpen={true}
          onClose={() => navigate('/productions')}
          production={currentProduction}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleConfirmDelete}
          title="Delete Production Batch"
          message={`Are you sure you want to delete batch "${currentProduction.batchId}"? This action cannot be undone.`}
          confirmText="Delete Batch"
          cancelText="Cancel"
          variant="danger"
        />
      </div>
    </div>
  );
};

export default ProductionDetailsPage;
