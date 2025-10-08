import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import {
  HiArrowLeft,
  HiPlus,
  HiTrash,
  HiUser,
  HiBuildingOffice2,
  HiMapPin,
  HiPhone,
  HiEnvelope,
  HiCurrencyDollar,
  HiShoppingBag,
  HiXMark,
  HiInformationCircle
} from 'react-icons/hi2';
import { Button, Input, Select, TextArea, Loading } from '../../components/common';
import CustomerSelect from '../../components/common/CustomerSelect';
import {
  createOrder,
  updateOrder,
  getOrderById
} from '../../redux/actions/orderActions';
import { getAllProducts } from '../../redux/actions/productActions';
import { getAllBranches } from '../../redux/actions/branchActions';
import { getAllUsers } from '../../redux/actions/userActions';
import { getAllLeads } from '../../redux/actions/leadActions';
import { addNotification } from '../../redux/slices/uiSlice';
import {
  selectCurrentOrder,
  selectOrderLoading,
  selectOrderError
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
    orderId: '', // Required field - user must enter
    customerId: '',
    customerType: 'user', // Default to user
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
  const [addressAutoPopulated, setAddressAutoPopulated] = useState(false);

  // Load data on component mount
  useEffect(() => {
    console.log('Loading data for order form...');
    dispatch(getAllProducts({ page: 1, limit: 1000, isActive: true }));
    dispatch(getAllBranches({ page: 1, limit: 1000, isActive: true }));
    dispatch(getAllUsers({ page: 1, limit: 1000, isActive: true }));
    dispatch(getAllLeads({ page: 1, limit: 1000 })); // Load all leads for customer selection
    
    if (isEdit && id) {
      dispatch(getOrderById(id));
    }
  }, [dispatch, isEdit, id]);

  // Update form data when order is loaded
  useEffect(() => {
    if (isEdit && order) {
      const customerId = order.customerType === 'user' ? (order.customerId?._id || '') : (order.leadId?._id || '');
      console.log('Setting form data for edit mode:', {
        orderId: order.orderId,
        customerId,
        customerType: order.customerType,
        orderCustomerId: order.customerId?._id,
        orderLeadId: order.leadId?._id
      });
      
      setFormData({
        orderId: order.orderId || '',
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

  // Handle select change (for Select component)
  const handleSelectChange = (field) => (e) => {
    const value = e.target.value;
    console.log(`Select changed for ${field}:`, value);
    
    if (field === 'customerId') {
      // Find the selected customer option to get customerType
      const selectedOption = allCustomerOptions.find(option => option.value === value);
      if (selectedOption) {
        setFormData(prev => ({
          ...prev,
          customerId: value,
          customerType: selectedOption.customerType
        }));

        // If it's a lead, populate shipping address with lead's address
        if (selectedOption.customerType === 'lead') {
          const selectedLead = leads.find(lead => lead._id === value);
          if (selectedLead && selectedLead.address) {
            console.log('Populating shipping address from lead:', selectedLead);
            setFormData(prev => ({
              ...prev,
              shippingAddress: {
                name: selectedLead.customerName || '',
                address: selectedLead.address.street || '',
                city: selectedLead.address.city || '',
                state: selectedLead.address.state || '',
                pincode: selectedLead.address.pinCode || '',
                phone: selectedLead.customerMobile || '',
                email: selectedLead.customerEmail || ''
              }
            }));
            setAddressAutoPopulated(true);
          } else {
            setAddressAutoPopulated(false);
          }
        } else {
          setAddressAutoPopulated(false);
        }
      }
    } else {
      handleInputChange(field, value);
    }
  };

  // Test function to verify select is working
  const testSelect = () => {
    console.log('Testing select with test data...');
    if (allCustomerOptions.length > 0) {
      handleInputChange('customerId', allCustomerOptions[0].value);
    } else {
      handleInputChange('customerId', 'test1');
    }
    handleInputChange('branchId', 'branch1');
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
    
    // Clear auto-populated flag when user manually edits
    if (addressAutoPopulated) {
      setAddressAutoPopulated(false);
    }
    
    // Clear error when user starts typing
    if (errors[`shippingAddress.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`shippingAddress.${field}`]: ''
      }));
    }
  };

  // Clear shipping address
  const clearShippingAddress = () => {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        name: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        phone: '',
        email: ''
      }
    }));
    setAddressAutoPopulated(false);
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
              unitPrice: selectedProduct.price || 0,
              price: selectedProduct.price || 0 // Add price field for display
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
    
    if (!formData.orderId || formData.orderId.trim() === '') {
      newErrors.orderId = 'Order ID is required';
    }
    
    if (!formData.customerId) {
      newErrors.customerId = 'Customer is required';
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
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
        // Prepare order data based on customer type
        const orderData = {
          orderId: formData.orderId.trim(), // Send the Order ID as entered by user
        customerType: formData.customerType,
        customerId: formData.customerType === 'user' ? formData.customerId : null,
        leadId: formData.customerType === 'lead' ? formData.customerId : null, // Use customerId as leadId for lead type
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

  // Prepare options - Use all leads for customers, prioritizing qualified and converted
  const customerOptions = leads
    .map(lead => ({
      value: lead._id,
      label: `${lead.customerName} | ${lead.customerMobile} `,
      customerType: 'lead',
      priority: lead.leadStatus === 'qualified' || lead.leadStatus === 'converted' ? 1 : 2,
      searchText: `${lead.customerName} ${lead.customerMobile} ${lead.leadStatus}`.toLowerCase()
    }))
    .sort((a, b) => a.priority - b.priority); // Sort by priority (qualified/converted first)

  // Fallback to users if no leads available
  const userCustomerOptions = users
    .filter(user => user.role === 'customer')
    .map(user => ({
      value: user._id,
      label: `${user.firstName} ${user.lastName} | ${user.email} | User`,
      customerType: 'user',
      searchText: `${user.firstName} ${user.lastName} ${user.email}`.toLowerCase()
    }));

  // Combine leads and users, prioritizing leads
  const allCustomerOptions = [...customerOptions, ...userCustomerOptions];

  // Update customer field when customer options are loaded and we have an order
  useEffect(() => {
    if (isEdit && order && allCustomerOptions.length > 0 && !formData.customerId) {
      const customerId = order.customerType === 'user' ? (order.customerId?._id || '') : (order.leadId?._id || '');
      console.log('Updating customer field after options loaded:', {
        customerId,
        customerType: order.customerType,
        availableOptions: allCustomerOptions.length,
        matchingOption: allCustomerOptions.find(opt => opt.value === customerId)
      });
      
      if (customerId) {
        setFormData(prev => ({
          ...prev,
          customerId,
          customerType: order.customerType || 'user'
        }));
      }
    }
  }, [isEdit, order, allCustomerOptions, formData.customerId]);

  const branchOptions = branches.map(branch => ({
    value: branch._id,
    label: `${branch.branchName} (${branch.branchCode})`
  }));

  const productOptions = products.map(product => ({
    value: product._id,
    label: `${product.productName} (${product.productId}) - ₹${product.price}`,
    price: product.price,
    UOM: product.UOM
  }));

  // Test with static data if no data is loaded
  const testCustomerOptions = [
    { value: 'test1', label: 'Test Customer 1 (test1@example.com)' },
    { value: 'test2', label: 'Test Customer 2 (test2@example.com)' }
  ];

  const testBranchOptions = [
    { value: 'branch1', label: 'Test Branch 1 (TB001)' },
    { value: 'branch2', label: 'Test Branch 2 (TB002)' }
  ];

  const testProductOptions = [
    { value: 'prod1', label: 'Test Product 1 (TP001) - ₹100' },
    { value: 'prod2', label: 'Test Product 2 (TP002) - ₹200' }
  ];

  // Debug logging
  console.log('OrderFormPage Debug:', {
    users: users.length,
    leads: leads.length,
    branches: branches.length,
    products: products.length,
    customerOptions: allCustomerOptions.length,
    branchOptions: branchOptions.length,
    productOptions: productOptions.length,
    leadsData: leads.slice(0, 2), // First 2 leads for debugging
    usersData: users.slice(0, 2), // First 2 users for debugging
    branchesData: branches.slice(0, 2), // First 2 branches for debugging
    productsData: products.slice(0, 2) // First 2 products for debugging
  });

  const paymentMethodOptions = [
    { value: 'cash', label: 'Cash' },
    { value: 'card', label: 'Card' },
    { value: 'upi', label: 'UPI' },
    { value: 'netbanking', label: 'Net Banking' },
    { value: 'wallet', label: 'Wallet' },
    { value: 'cheque', label: 'Cheque' }
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
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Order' : 'Create New Order'}
            </h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer and Branch Selection */}
            <div className="bg-white p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Input
                      label="Order ID *"
                      name="orderId"
                      value={formData.orderId}
                      onChange={(e) => handleInputChange('orderId', e.target.value)}
                      placeholder="Enter order ID (e.g., ORD00001)"
                      error={errors.orderId}
                      helperText="Enter a unique Order ID for this order"
                      required
                    />
                  </div>
                <div className="md:col-span-2">
                  <CustomerSelect
                    options={allCustomerOptions.length > 0 ? allCustomerOptions : testCustomerOptions}
                    value={formData.customerId}
                    onChange={handleSelectChange('customerId')}
                    placeholder="Search and select customer (leads or users)"
                    error={errors.customerId}
                    loading={leadsLoading || usersLoading}
                    searchPlaceholder="Search customers by name, email, or phone..."
                    emptyMessage="No customers found"
                    label="Customer *"
                    name="customerId"
                  />
                </div>
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Branch *
                  </label>
                  <Select
                    options={branchOptions.length > 0 ? branchOptions : testBranchOptions}
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
            <div className="bg-white p-6">
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
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4">
                    <div className="md:col-span-6">
                      <label className="block text-sm font-medium mb-2">
                        Product *
                      </label>
                      <Select
                        options={productOptions.length > 0 ? productOptions : testProductOptions}
                        value={item.productId}
                        onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
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
                        value={item.unitPrice || item.price || ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                        placeholder="Price (auto-filled from product)"
                        error={errors[`items.${index}.unitPrice`]}
                        min="0"
                        step="0.01"
                        readOnly={!!item.productId} // Make read-only when product is selected
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
            <div className="bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
                {addressAutoPopulated && (
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      onClick={clearShippingAddress}
                      variant="outline"
                      size="sm"
                      icon={HiXMark}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      Clear
                    </Button>
                  </div>
                )}
              </div>
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
            <div className="bg-white p-6">
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
            <div className="bg-white p-6">
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
                    placeholder="Add any payment-related notes or instructions..."
                    rows={3}
                    error={errors.paymentNotes}
                    helperText="Optional: Add any payment-related notes, transaction IDs, or special instructions"
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
