import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiPlus,
  HiTrash,
  HiUser,
  HiMapPin,
  HiPhone,
  HiEnvelope,
  HiCurrencyDollar,
  HiShoppingBag,
  HiXMark
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea, Loading } from '../../components/common';
import CustomerSelect from '../../components/common/CustomerSelect';
import {
  createOrder,
  updateOrder,
  getOrderById,
} from '../../redux/actions/orderActions';
import { getAllProducts } from '../../redux/actions/productActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { getAllUsers } from '../../redux/actions/userActions';
import { getAllLeads } from '../../redux/actions/leadActions';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError,
} from '../../redux/slices/orderSlice';
import {
  selectProducts,
  selectProductLoading
} from '../../redux/slices/productSlice';
import {
  selectBranches,
  selectBranchLoading
} from '../../redux/slices/branchSlice';
import {
  selectAllUsers,
  selectUserLoading
} from '../../redux/slices/userSlice';
import {
  selectLeads,
  selectLeadLoading
} from '../../redux/slices/leadSlice';

const OrderFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const isEdit = Boolean(id);
  
  // Redux state
  const order = useSelector(selectCurrentOrder);
  const loading = useSelector(selectOrderLoading);
  const error = useSelector(selectOrderError);
  const products = useSelector(selectProducts);
  const productsLoading = useSelector(selectProductLoading);
  const branches = useSelector(selectBranches);
  const branchesLoading = useSelector(selectBranchLoading);
  const users = useSelector(selectAllUsers);
  const usersLoading = useSelector(selectUserLoading);
  const leads = useSelector(selectLeads);
  const leadsLoading = useSelector(selectLeadLoading);
  
  // Form state
  const [formData, setFormData] = useState({
    customerId: '',
    customerType: 'user',
    branchId: '',
    items: [{ productId: '', quantity: 1, unitPrice: 0 }],
    shippingAddress: {
      name: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
      email: ''
    },
    notes: '',
    internalNotes: '',
    taxAmount: 0,
    discountAmount: 0,
    shippingAmount: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    paymentNotes: '',
    expectedDeliveryDate: ''
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Load data on component mount
  useEffect(() => {
    dispatch(getAllProducts({ page: 1, limit: 1000, isActive: true }));
    dispatch(getAllBranches({ page: 1, limit: 1000, isActive: true }));
    dispatch(getAllUsers({ page: 1, limit: 1000, isActive: true }));
    dispatch(getAllLeads({ page: 1, limit: 1000 }));
    
    if (isEdit && id) {
      dispatch(getOrderById(id));
    }
  }, [dispatch, isEdit, id]);

  // Update form data when order is loaded
  useEffect(() => {
    if (isEdit && order) {
      const customerId = order.customerType === 'user' ? (order.customerId?._id || '') : (order.leadId?._id || '');
      
      setFormData({
        customerId,
        customerType: order.customerType || 'user',
        branchId: order.branchId?._id || '',
        items: order.items?.map(item => ({
          productId: item.productId?._id || '',
          quantity: item.quantity || 1,
          unitPrice: item.unitPrice || 0
        })) || [{ productId: '', quantity: 1, unitPrice: 0 }],
        shippingAddress: {
          name: order.shippingAddress?.name || '',
          address: order.shippingAddress?.address || '',
          city: order.shippingAddress?.city || '',
          state: order.shippingAddress?.state || '',
          pincode: order.shippingAddress?.pincode || '',
          phone: order.shippingAddress?.phone || '',
          email: order.shippingAddress?.email || ''
        },
        notes: order.notes || '',
        internalNotes: order.internalNotes || '',
        taxAmount: order.taxAmount || 0,
        discountAmount: order.discountAmount || 0,
        shippingAmount: order.shippingAmount || 0,
        paymentMethod: order.paymentMethod || 'cash',
        paymentStatus: order.paymentStatus || 'pending',
        paymentNotes: order.paymentNotes || '',
        expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : ''
      });
    }
  }, [isEdit, order]);

  // Handle input change
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
    
  };

  // Handle select change
  const handleSelectChange = (field) => (value) => {
    if (field === 'customerId') {
      // Find the selected customer and set customer type
      const allCustomers = [...leads, ...users.filter(user => user.role === 'customer')];
      const selectedCustomer = allCustomers.find(customer => customer._id === value);
      
      if (selectedCustomer) {
        const customerType = selectedCustomer.customerName ? 'lead' : 'user';
        setFormData(prev => ({
          ...prev,
          customerId: value,
          customerType
        }));

        // Auto-fill shipping address if it's a lead
        if (customerType === 'lead' && selectedCustomer.address) {
          const address = selectedCustomer.address;
          setFormData(prev => ({
            ...prev,
            shippingAddress: {
              name: selectedCustomer.customerName || '',
              phone: selectedCustomer.customerMobile || '',
              email: selectedCustomer.email || '',
              address: address.street || '',
              city: address.city || '',
              state: address.state || '',
              pincode: address.pinCode || ''
            }
          }));
        }
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  // Handle shipping address change
  const handleShippingAddressChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [field]: value
      }
    }));
    
    // Clear error when user starts typing
    if (errors[`shippingAddress.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`shippingAddress.${field}`]: ''
      }));
    }
  };

  // Handle item change
  const handleItemChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));

    // Auto-fetch price when product is selected
    if (field === 'productId' && value) {
      const selectedProduct = products.find(product => product._id === value);
      if (selectedProduct) {
        setFormData(prev => ({
          ...prev,
          items: prev.items.map((item, i) => 
            i === index ? { 
              ...item, 
              productId: value,
              unitPrice: selectedProduct.price || 0
            } : item
          )
        }));
      }
    }
  };

  // Add new item
  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { productId: '', quantity: 1, unitPrice: 0 }]
    }));
  };

  // Remove item
  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  // Calculate totals
  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => {
      const quantity = parseInt(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      return sum + (quantity * unitPrice);
    }, 0);
    
    const taxAmount = parseFloat(formData.taxAmount) || 0;
    const discountAmount = parseFloat(formData.discountAmount) || 0;
    const shippingAmount = parseFloat(formData.shippingAmount) || 0;
    
    const totalAmount = subtotal + taxAmount + shippingAmount - discountAmount;
    
    return { subtotal, totalAmount };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    
    // Validate customer based on type
    if (formData.customerType === 'user' && !formData.customerId) {
      newErrors.customerId = 'Customer is required';
    }
    
    if (formData.customerType === 'lead' && !formData.customerId) {
      newErrors.customerId = 'Lead is required';
    }
    
    if (!formData.branchId) {
      newErrors.branchId = 'Branch is required';
    }
    
    if (formData.items.length === 0) {
      newErrors.items = 'At least one item is required';
    }
    
    formData.items.forEach((item, index) => {
      if (!item.productId) {
        newErrors[`items.${index}.productId`] = 'Product is required';
      }
      if (!item.quantity || item.quantity <= 0) {
        newErrors[`items.${index}.quantity`] = 'Quantity must be greater than 0';
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        newErrors[`items.${index}.unitPrice`] = 'Price must be greater than 0';
      }
    });
    
    if (!formData.shippingAddress.name) {
      newErrors['shippingAddress.name'] = 'Name is required';
    }
    
    if (!formData.shippingAddress.address) {
      newErrors['shippingAddress.address'] = 'Address is required';
    }
    
    if (!formData.shippingAddress.city) {
      newErrors['shippingAddress.city'] = 'City is required';
    }
    
    if (!formData.shippingAddress.state) {
      newErrors['shippingAddress.state'] = 'State is required';
    }
    
    if (!formData.shippingAddress.pincode) {
      newErrors['shippingAddress.pincode'] = 'Pincode is required';
    }
    
    if (!formData.shippingAddress.phone) {
      newErrors['shippingAddress.phone'] = 'Phone is required';
    }
    
    if (!formData.paymentStatus) {
      newErrors.paymentStatus = 'Payment status is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevent duplicate submissions
    if (submitting) {
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare order data based on customer type
      const orderData = {
        customerType: formData.customerType,
        customerId: formData.customerType === 'user' ? formData.customerId : null,
        leadId: formData.customerType === 'lead' ? formData.customerId : null,
        branchId: formData.branchId,
        items: formData.items.map(item => ({
          productId: item.productId,
          quantity: parseInt(item.quantity),
          unitPrice: parseFloat(item.unitPrice)
        })),
        shippingAddress: formData.shippingAddress,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        taxAmount: formData.taxAmount,
        discountAmount: formData.discountAmount,
        shippingAmount: formData.shippingAmount,
        paymentMethod: formData.paymentMethod,
        paymentStatus: formData.paymentStatus,
        paymentNotes: formData.paymentNotes,
        expectedDeliveryDate: formData.expectedDeliveryDate
      };
      
      if (isEdit) {
        await dispatch(updateOrder({ id, orderData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Order updated successfully!'
        }));
      } else {
        await dispatch(createOrder(orderData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Order created successfully!'
        }));
      }
      
      navigate('/orders');
    } catch (error) {
      dispatch(addNotification({
        type: 'error',
        message: error || `Failed to ${isEdit ? 'update' : 'create'} order`
      }));
    } finally {
      setSubmitting(false);
    }
  };

  // Prepare options
  const customerOptions = leads
    .map(lead => ({
      value: lead._id,
      label: `${lead.customerName} | ${lead.customerMobile}`,
      customerType: 'lead'
    }))
    .concat(
      users
        .filter(user => user.role === 'customer')
        .map(user => ({
          value: user._id,
          label: `${user.firstName} ${user.lastName} | ${user.email} | User`,
          customerType: 'user'
        }))
    );

  const branchOptions = branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  }));

  const productOptions = products.map(product => ({
    value: product._id,
    label: `${product.productName} (${product.productId}) - ₹${product.price}`,
    price: product.price
  }));

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'netbanking', label: 'Net Banking' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' }
  ];

  const { subtotal, totalAmount } = calculateTotals();

  if (loading && isEdit) {
    return <Loading />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate('/orders')}
            icon={HiArrowLeft}
          >
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            {isEdit ? 'Edit Order' : 'Create New Order'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Details */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <CustomerSelect
                    options={customerOptions}
                    value={formData.customerId}
                    onChange={handleSelectChange('customerId')}
                    placeholder="Search and select customer"
                    error={errors.customerId}
                    loading={leadsLoading || usersLoading}
                    label="Customer *"
                    name="customerId"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch *
                  </label>
                  <Select
                    options={branchOptions}
                    value={formData.branchId}
                    onChange={handleSelectChange('branchId')}
                    placeholder="Select branch"
                    error={errors.branchId}
                    loading={branchesLoading}
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Order Items</h3>
                <Button
                  type="button"
                  onClick={addItem}
                  variant="outline"
                  icon={HiPlus}
                  size="sm"
                >
                  Add Item
                </Button>
              </div>
              
              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border rounded-lg">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium mb-2">
                        Product *
                      </label>
                      <Select
                        options={productOptions}
                        value={item.productId}
                        onChange={(value) => handleItemChange(index, 'productId', value)}
                        placeholder="Select product"
                        error={errors[`items.${index}.productId`]}
                        loading={productsLoading}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        error={errors[`items.${index}.quantity`]}
                        min="1"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Price *
                      </label>
                      <Input
                        type="number"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="Price"
                        error={errors[`items.${index}.unitPrice`]}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <div className="md:col-span-1 flex items-end">
                      <Button
                        type="button"
                        onClick={() => removeItem(index)}
                        variant="danger"
                        icon={HiTrash}
                        size="sm"
                        disabled={formData.items.length === 1}
                        className="w-full"
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Input
                    label="Name *"
                    value={formData.shippingAddress.name}
                    onChange={(e) => handleShippingAddressChange('name', e.target.value)}
                    placeholder="Full name"
                    error={errors['shippingAddress.name']}
                    icon={HiUser}
                  />
                </div>
                <div className="md:col-span-2">
                  <TextArea
                    label="Address *"
                    value={formData.shippingAddress.address}
                    onChange={(e) => handleShippingAddressChange('address', e.target.value)}
                    placeholder="Street address"
                    error={errors['shippingAddress.address']}
                    icon={HiMapPin}
                    rows={3}
                  />
                </div>
                <div>
                  <Input
                    label="City *"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                    placeholder="City"
                    error={errors['shippingAddress.city']}
                  />
                </div>
                <div>
                  <Input
                    label="State *"
                    value={formData.shippingAddress.state}
                    onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                    placeholder="State"
                    error={errors['shippingAddress.state']}
                  />
                </div>
                <div>
                  <Input
                    label="Pincode *"
                    value={formData.shippingAddress.pincode}
                    onChange={(e) => handleShippingAddressChange('pincode', e.target.value)}
                    placeholder="Pincode"
                    error={errors['shippingAddress.pincode']}
                  />
                </div>
                <div>
                  <Input
                    label="Phone *"
                    value={formData.shippingAddress.phone}
                    onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                    placeholder="Phone number"
                    error={errors['shippingAddress.phone']}
                    icon={HiPhone}
                  />
                </div>
                <div>
                  <Input
                    label="Email"
                    type="email"
                    value={formData.shippingAddress.email}
                    onChange={(e) => handleShippingAddressChange('email', e.target.value)}
                    placeholder="Email address"
                    error={errors['shippingAddress.email']}
                    icon={HiEnvelope}
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    label="Expected Delivery Date"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                    placeholder="Select expected delivery date"
                    error={errors.expectedDeliveryDate}
                    helperText="Optional: When do you expect this order to be delivered?"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notes</h3>
              <div className="space-y-4">
                <TextArea
                  label="Customer Notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Notes for the customer"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-gray-600">Tax</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={formData.taxAmount}
                      onChange={(e) => handleInputChange('taxAmount', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-gray-600">Shipping</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={formData.shippingAmount}
                      onChange={(e) => handleInputChange('shippingAmount', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      size="sm"
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <span className="text-sm text-gray-600">Discount</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={formData.discountAmount}
                      onChange={(e) => handleInputChange('discountAmount', e.target.value)}
                      placeholder="0"
                      min="0"
                      step="0.01"
                      size="sm"
                    />
                  </div>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Method</h3>
              <Select
                options={paymentMethodOptions}
                value={formData.paymentMethod}
                onChange={handleSelectChange('paymentMethod')}
                placeholder="Select payment method"
              />
            </div>

            {/* Payment Status and Notes */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Status
                  </label>
                  <Select
                    options={paymentStatusOptions}
                    value={formData.paymentStatus}
                    onChange={handleSelectChange('paymentStatus')}
                    placeholder="Select payment status"
                    error={errors.paymentStatus}
                  />
                </div>
                <div>
                  <TextArea
                    label="Payment Notes"
                    value={formData.paymentNotes}
                    onChange={(e) => handleInputChange('paymentNotes', e.target.value)}
                    placeholder="Add any payment-related notes..."
                    rows={3}
                    error={errors.paymentNotes}
                    helperText="Optional: Add any payment-related notes or transaction IDs"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="bg-white p-6 rounded-lg shadow">
              <Button
                type="submit"
                variant="primary"
                loading={submitting}
                className="w-full"
                icon={HiShoppingBag}
              >
                {isEdit ? 'Update Order' : 'Create Order'}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default OrderFormPage;