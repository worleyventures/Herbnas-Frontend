import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiCog6Tooth,
  HiClock,
  HiCheckCircle,
  HiExclamationTriangle,
  HiPause,
  HiPlay,
  HiCube,
  HiDocumentText,
  HiTag,
  HiBuildingOffice2,
  HiCurrencyDollar,
  HiTrash,
  HiPencil,
  HiEye,
  HiPlus,
  HiCalendar,
  HiClipboardDocumentList
} from 'react-icons/hi2';
import { StatCard, Button, SearchInput, Select, Pagination, ConfirmationModal, Table } from '../../common';
import { getAllProducts, getActiveProducts } from '../../../redux/actions/productActions';
import {
  getAllProductions,
  getProductionStats,
  updateProduction,
  deleteProduction
} from '../../../redux/actions/productionActions';
import { addNotification } from '../../../redux/slices/uiSlice';
import ProductionCRUD from './ProductionCRUD';

const ProductionDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [selectedProduction, setSelectedProduction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [showActivateModal, setShowActivateModal] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  // Filter states
  const [productionStatusFilter, setProductionStatusFilter] = useState('all');
  const [QCstatusFilter, setQCstatusFilter] = useState('all');
  const [productFilter, setProductFilter] = useState('all');

  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const {
    productions = [],
    loading = false,
    error = null,
    productionStats = null
  } = useSelector((state) => state.productions);
  
  const {
    products = []
  } = useSelector((state) => state.products);

  // Production status options
  const productionStatusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500', icon: HiPlay },
    { value: 'on-hold', label: 'On Hold', color: 'bg-yellow-500', icon: HiPause },
    { value: 'completed', label: 'Completed', color: 'bg-green-500', icon: HiCheckCircle }
  ];

  // QC status options
  const QCstatusOptions = [
    { value: 'all', label: 'All QC Status' },
    { value: 'Pending', label: 'Pending', color: 'bg-yellow-500', icon: HiClock },
    { value: 'Approved', label: 'Approved', color: 'bg-green-500', icon: HiCheckCircle },
    { value: 'Rejected', label: 'Rejected', color: 'bg-red-500', icon: HiExclamationTriangle }
  ];

  // Load data on component mount
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(getActiveProducts());
      dispatch(getAllProductions({
        page: currentPage,
        limit: itemsPerPage,
        search: searchTerm,
        productionStatus: productionStatusFilter !== 'all' ? productionStatusFilter : undefined,
        QCstatus: QCstatusFilter !== 'all' ? QCstatusFilter : undefined,
        productId: productFilter !== 'all' ? productFilter : undefined
      }));
      dispatch(getProductionStats());
    }
  }, [dispatch, isAuthenticated, currentPage, itemsPerPage, searchTerm, productionStatusFilter, QCstatusFilter, productFilter]);


  // Calculate stats from productions data
  const calculateStats = () => {
    const totalProductions = productions.length;
    const inProgressCount = productions.filter(p => p.productionStatus === 'in-progress').length;
    const onHoldCount = productions.filter(p => p.productionStatus === 'on-hold').length;
    const completedCount = productions.filter(p => p.productionStatus === 'completed').length;
    const pendingQCCount = productions.filter(p => p.QCstatus === 'Pending').length;
    const approvedQCCount = productions.filter(p => p.QCstatus === 'Approved').length;
    const rejectedQCCount = productions.filter(p => p.QCstatus === 'Rejected').length;
    
    // Calculate total quantity produced
    const totalQuantity = productions.reduce((sum, p) => sum + (p.quantity || 0), 0);

    return {
      total: totalProductions,
      inProgress: inProgressCount,
      onHold: onHoldCount,
      completed: completedCount,
      pendingQC: pendingQCCount,
      approvedQC: approvedQCCount,
      rejectedQC: rejectedQCCount,
      totalQuantity
    };
  };

  const stats = calculateStats();

  // Handle production selection
  const handleSelectProduction = (production) => {
    setSelectedProduction(production);
  };

  // Handle create production
  const handleCreateProduction = () => {
    navigate('/productions/create');
  };

  // Handle edit production
  const handleEditProduction = (production) => {
    navigate(`/productions/edit/${production._id}`);
  };

  // Handle delete production
  const handleDeleteProduction = (production) => {
    setSelectedProduction(production);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleDeleteProductionConfirm = () => {
    if (selectedProduction) {
      setDeleteLoading(true);
      dispatch(deleteProduction(selectedProduction._id))
        .then((result) => {
          if (result.type === 'productions/deleteProduction/fulfilled') {
            dispatch(addNotification({
              type: 'success',
              title: 'Production Deleted',
              message: 'Production batch deleted successfully',
              duration: 3000
            }));
            setShowDeleteModal(false);
            setSelectedProduction(null);
            // Refresh data
            dispatch(getAllProductions({
              page: currentPage,
              limit: itemsPerPage,
              search: searchTerm,
              productionStatus: productionStatusFilter !== 'all' ? productionStatusFilter : undefined,
              QCstatus: QCstatusFilter !== 'all' ? QCstatusFilter : undefined,
              productId: productFilter !== 'all' ? productFilter : undefined
            }));
      } else {
            dispatch(addNotification({
              type: 'error',
              title: 'Delete Failed',
              message: result.payload || 'Failed to delete production',
              duration: 5000
            }));
          }
        })
        .finally(() => {
          setDeleteLoading(false);
        });
    }
  };

  // Handle update production
  const handleUpdateProduction = (productionId, data) => {
    setUpdateLoading(true);
    dispatch(updateProduction({ productionId, productionData: data }))
      .then((result) => {
        if (result.type === 'productions/updateProduction/fulfilled') {
      dispatch(addNotification({
        type: 'success',
            title: 'Production Updated',
            message: 'Production batch updated successfully',
        duration: 3000
      }));
          // Refresh data
          dispatch(getAllProductions({
            page: currentPage,
            limit: itemsPerPage,
            search: searchTerm,
            productionStatus: productionStatusFilter !== 'all' ? productionStatusFilter : undefined,
            QCstatus: QCstatusFilter !== 'all' ? QCstatusFilter : undefined,
            productId: productFilter !== 'all' ? productFilter : undefined
          }));
        } else {
          dispatch(addNotification({
            type: 'error',
            title: 'Update Failed',
            message: result.payload || 'Failed to update production',
            duration: 5000
          }));
        }
      })
      .finally(() => {
        setUpdateLoading(false);
      });
  };

  // Product options for filter
  const productOptions = [
    { value: 'all', label: 'All Products' },
    ...products.map(product => ({
      value: product._id,
      label: product.productName
    }))
  ];



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Production Management</h1>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage production batches, QC status, and manufacturing processes
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button
            onClick={handleCreateProduction}
            icon={HiPlus}
            variant="gradient"
            size="sm"
            className="shadow-lg"
          >
            Add Production Batch
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Total Batches"
          value={stats.total}
          icon={HiClipboardDocumentList}
          gradient="blue"
          animation="bounce"
          change="+5%"
          changeType="increase"
          className="h-full"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          icon={HiPlay}
          gradient="indigo"
          animation="pulse"
          change="+2%"
          changeType="increase"
          className="h-full"
        />
        <StatCard
          title="On Hold"
          value={stats.onHold}
          icon={HiPause}
          gradient="yellow"
          animation="float"
          change="+1%"
          changeType="increase"
          className="h-full"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          icon={HiCheckCircle}
          gradient="green"
          animation="bounce"
          change="+8%"
          changeType="increase"
          className="h-full"
        />
        </div>

      {/* Search and Filter Section */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="w-full sm:w-80">
          <SearchInput
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search production batches..."
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-4 sm:flex-shrink-0">
          <div className="w-full sm:w-48">
            <Select
              value={productionStatusFilter}
              onChange={(value) => setProductionStatusFilter(value)}
              options={productionStatusOptions}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={QCstatusFilter}
              onChange={(value) => setQCstatusFilter(value)}
              options={QCstatusOptions}
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              value={productFilter}
              onChange={(value) => setProductFilter(value)}
              options={productOptions}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-500">
            Showing {productions.length} production batches
          </div>
        </div>
        <div className="overflow-hidden">
          <ProductionCRUD
            productions={productions}
            onSelectProduction={handleSelectProduction}
            onEditProduction={handleEditProduction}
            onDeleteProduction={handleDeleteProduction}
            onUpdateProduction={handleUpdateProduction}
            onDeleteProductionConfirm={handleDeleteProductionConfirm}
            showDeleteModal={showDeleteModal}
            showDisableModal={showDisableModal}
            showActivateModal={showActivateModal}
            selectedProduction={selectedProduction}
            setShowDeleteModal={setShowDeleteModal}
            setShowDisableModal={setShowDisableModal}
            setShowActivateModal={setShowActivateModal}
            loading={loading}
            createLoading={createLoading}
            updateLoading={updateLoading}
            deleteLoading={deleteLoading}
          />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedProduction(null);
        }}
        onConfirm={handleDeleteProductionConfirm}
        title="Delete Production Batch"
        message={
          selectedProduction ? (
            `Are you sure you want to delete batch "${selectedProduction.batchId}"? This action cannot be undone.`
          ) : (
            'Are you sure you want to delete this production batch? This action cannot be undone.'
          )
        }
        confirmText="Delete Batch"
        cancelText="Cancel"
        variant="danger"
        loading={deleteLoading}
      />

    </div>
  );
};

export default ProductionDashboard;
