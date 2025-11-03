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
import { getAllBranches, getBranchById } from '../../redux/actions/branchActions';
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
import { createSalesAccount } from '../../redux/actions/accountActions';

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
    taxPercentage: 0,
    discountPercentage: 0,
    shippingAmount: 0,
    codCharges: 0,
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    paymentNotes: '',
    amountReceived: 0,
    expectedDeliveryDate: '',
    status: 'draft', // Add status field
    bankAccountId: '' // Selected bank account for the order
  });
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [isBranchDisabled, setIsBranchDisabled] = useState(false);
  const [selectedBranchDetails, setSelectedBranchDetails] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [againReceiveAmount, setAgainReceiveAmount] = useState(0);

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
      
      // Check if order's customer is a lead with assigned branch
      let shouldDisableBranch = false;
      if (order.customerType === 'lead' && order.leadId && typeof order.leadId === 'object') {
        shouldDisableBranch = !!order.leadId.dispatchedFrom;
      }
      setIsBranchDisabled(shouldDisableBranch);
      
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
        taxPercentage: (() => {
          // Calculate tax percentage from stored taxAmount and subtotal
          const orderSubtotal = order.items?.reduce((sum, item) => {
            const qty = parseInt(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            return sum + (qty * price);
          }, 0) || 0;
          return order.taxAmount && orderSubtotal > 0 
            ? parseFloat(((order.taxAmount / orderSubtotal) * 100).toFixed(2))
            : 0;
        })(),
        discountPercentage: (() => {
          // Calculate discount percentage from stored discountAmount and subtotal
          const orderSubtotal = order.items?.reduce((sum, item) => {
            const qty = parseInt(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            return sum + (qty * price);
          }, 0) || 0;
          return order.discountAmount && orderSubtotal > 0 
            ? parseFloat(((order.discountAmount / orderSubtotal) * 100).toFixed(2))
            : 0;
        })(),
        shippingAmount: order.shippingAmount || 0,
        codCharges: order.codCharges || 0,
        paymentMethod: order.paymentMethod || 'cash',
        paymentStatus: order.paymentStatus || 'pending',
        paymentNotes: order.paymentNotes || '',
        amountReceived: order.amountReceived || 0,
        expectedDeliveryDate: order.expectedDeliveryDate ? new Date(order.expectedDeliveryDate).toISOString().split('T')[0] : '',
        status: order.status || 'draft',
        bankAccountId: order.bankAccountId || ''
      });
      
      // Reset again receive amount when loading order
      setAgainReceiveAmount(0);
    }
  }, [isEdit, order]);

  // Fetch branch details when branchId changes to get bank accounts
  useEffect(() => {
    const fetchBranchDetails = async () => {
      if (formData.branchId) {
        try {
          const result = await dispatch(getBranchById(formData.branchId)).unwrap();
          const branchData = result.data?.branch || result.data;
          setSelectedBranchDetails(branchData);
          // If only one bank account and payment method requires it, auto-select (cash goes to ready cash, not bank account)
          if (branchData?.bankAccounts && Array.isArray(branchData.bankAccounts) && branchData.bankAccounts.length === 1) {
            const paymentMethodsRequiringAccount = ['card', 'netbanking'];
            if (paymentMethodsRequiringAccount.includes(formData.paymentMethod)) {
              setFormData(prev => ({
                ...prev,
                bankAccountId: branchData.bankAccounts[0]._id || ''
              }));
            }
          }
        } catch (error) {
          console.error('Error fetching branch details:', error);
          setSelectedBranchDetails(null);
        }
      } else {
        setSelectedBranchDetails(null);
      }
    };
    
    fetchBranchDetails();
  }, [formData.branchId, formData.paymentMethod, dispatch]);

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
  const handleSelectChange = (field) => (eventOrValue) => {
    // Extract value from event object or use direct value
    const value = eventOrValue?.target?.value !== undefined ? eventOrValue.target.value : eventOrValue;
    
    if (field === 'customerId') {
      // Find the selected customer and set customer type
      const allCustomers = [...leads, ...users.filter(user => user.role === 'customer')];
      const selectedCustomer = allCustomers.find(customer => customer._id === value);
      
      if (selectedCustomer && value) {
        const customerType = selectedCustomer.customerName ? 'lead' : 'user';
        
        // Check if it's a lead with an assigned branch
        let branchIdFromLead = '';
        let shouldDisableBranch = false;
        
        if (customerType === 'lead' && selectedCustomer.dispatchedFrom) {
          // Extract branch ID from dispatchedFrom (could be object or string)
          branchIdFromLead = typeof selectedCustomer.dispatchedFrom === 'object' 
            ? (selectedCustomer.dispatchedFrom._id || selectedCustomer.dispatchedFrom)
            : selectedCustomer.dispatchedFrom;
          shouldDisableBranch = !!branchIdFromLead;
        }
        
        setFormData(prev => ({
          ...prev,
          customerId: value,
          customerType,
          branchId: branchIdFromLead || prev.branchId // Only update if lead has branch, otherwise keep existing
        }));
        
        setIsBranchDisabled(shouldDisableBranch);

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
      } else {
        // Customer cleared (empty value) - reset all related fields
        setIsBranchDisabled(false);
        setFormData(prev => ({
          ...prev,
          customerId: '',
          customerType: 'user',
          branchId: '', // Clear branch
          shippingAddress: {
            // Reset shipping address to empty
            name: '',
            address: '',
            city: '',
            state: '',
            pincode: '',
            phone: '',
            email: ''
          }
        }));
      }
    } else if (field === 'paymentMethod') {
      // When payment method changes, reset COD charges if not COD
      // Also reset bankAccountId if payment method doesn't require it (cash goes to ready cash, not bank account)
      setFormData(prev => ({
        ...prev,
        [field]: value,
        codCharges: value === 'cod' ? prev.codCharges : 0,
        bankAccountId: ['card', 'netbanking'].includes(value) ? prev.bankAccountId : ''
      }));
    } else if (field === 'branchId') {
      // When branch changes, reset bank account selection
      setFormData(prev => ({
        ...prev,
        [field]: value,
        bankAccountId: '' // Reset bank account when branch changes
      }));
      setSelectedBranchDetails(null);
    } else if (field === 'status') {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
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
    
    // Validate amountReceived against total in real-time
    if (field === 'amountReceived') {
      // Calculate totals with updated value
      const updatedFormData = { ...formData, [field]: value };
      const subtotal = updatedFormData.items.reduce((sum, item) => {
        const quantity = parseInt(item.quantity) || 0;
        const unitPrice = parseFloat(item.unitPrice) || 0;
        return sum + (quantity * unitPrice);
      }, 0);
      
      // Calculate tax and discount from percentages
      const taxPercentage = parseFloat(updatedFormData.taxPercentage) || 0;
      const discountPercentage = parseFloat(updatedFormData.discountPercentage) || 0;
      const taxAmount = (subtotal * taxPercentage) / 100;
      const discountAmount = (subtotal * discountPercentage) / 100;
      
      const shippingAmount = parseFloat(updatedFormData.shippingAmount) || 0;
      const codCharges = updatedFormData.paymentMethod === 'cod' ? (parseFloat(updatedFormData.codCharges) || 0) : 0;
      const totalAmount = subtotal + taxAmount + shippingAmount + codCharges - discountAmount;
      
      const amountReceived = parseFloat(value) || 0;
      
      if (amountReceived > totalAmount) {
        setErrors(prev => ({
          ...prev,
          amountReceived: `Received amount (₹${amountReceived.toLocaleString()}) cannot be greater than total amount (₹${totalAmount.toLocaleString()})`
        }));
      } else if (errors.amountReceived && amountReceived <= totalAmount) {
        // Clear error if it's now valid
        setErrors(prev => ({
          ...prev,
          amountReceived: ''
        }));
      }
    }
  };

  // Pincode lookup function
  const handlePincodeLookup = async (pincode) => {
    if (!pincode || pincode.length !== 6) {
      return;
    }

    setPincodeLoading(true);
    try {
      // Using postalpincode.in API (free, no API key required)
      const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
      const data = await response.json();
      
      if (data && data[0] && data[0].Status === 'Success' && data[0].PostOffice && data[0].PostOffice.length > 0) {
        const postOffice = data[0].PostOffice[0];
        setFormData(prev => ({
          ...prev,
          shippingAddress: {
            ...prev.shippingAddress,
            city: postOffice.Block || postOffice.District || '',
            state: postOffice.State || '',
            pincode: pincode
          }
        }));
      } else {
        console.warn('Pincode not found or invalid');
      }
    } catch (error) {
      console.error('Error fetching pincode data:', error);
    } finally {
      setPincodeLoading(false);
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
    
    // Auto-fetch city and state when pinCode is entered
    if (field === 'pincode' && value.length === 6) {
      handlePincodeLookup(value);
    }
    
    // Clear error when user starts typing
    if (errors[`shippingAddress.${field}`]) {
      setErrors(prev => ({
        ...prev,
        [`shippingAddress.${field}`]: ''
      }));
    }
  };

  // Handle item change
  const handleItemChange = (index, field, eventOrValue) => {
    // Extract value from event object or use direct value
    const value = eventOrValue?.target?.value !== undefined ? eventOrValue.target.value : eventOrValue;
    
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
    
    // Calculate tax and discount from percentages
    const taxPercentage = parseFloat(formData.taxPercentage) || 0;
    const discountPercentage = parseFloat(formData.discountPercentage) || 0;
    const taxAmount = (subtotal * taxPercentage) / 100;
    const discountAmount = (subtotal * discountPercentage) / 100;
    
    const shippingAmount = parseFloat(formData.shippingAmount) || 0;
    const codCharges = formData.paymentMethod === 'cod' ? (parseFloat(formData.codCharges) || 0) : 0;
    
    const totalAmount = subtotal + taxAmount + shippingAmount + codCharges - discountAmount;
    
    return { subtotal, taxAmount, discountAmount, totalAmount };
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    // Calculate total amount for validation
    const { totalAmount } = calculateTotals();
    const amountReceived = parseFloat(formData.amountReceived) || 0;
    
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
    
    if (!formData.status) {
      newErrors.status = 'Order status is required';
    }
    
    // Validate received amount cannot exceed total amount
    // For partial payment in edit mode, validate the total (original + additional)
    const finalAmountReceived = isEdit && formData.paymentStatus === 'partial'
      ? parseFloat(formData.amountReceived || 0) + parseFloat(againReceiveAmount || 0)
      : amountReceived;
    
    if (finalAmountReceived > totalAmount) {
      newErrors.amountReceived = `Received amount (₹${finalAmountReceived.toLocaleString()}) cannot be greater than total amount (₹${totalAmount.toLocaleString()})`;
    }
    
    // Validate again receive amount if in partial payment mode
    if (isEdit && formData.paymentStatus === 'partial' && againReceiveAmount > 0) {
      const balance = totalAmount - parseFloat(formData.amountReceived || 0);
      if (againReceiveAmount > balance) {
        newErrors.againReceiveAmount = `Additional amount (₹${againReceiveAmount.toLocaleString()}) cannot exceed balance (₹${balance.toLocaleString()})`;
      }
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
        taxAmount: calculateTotals().taxAmount,
        discountAmount: calculateTotals().discountAmount,
        shippingAmount: formData.shippingAmount,
        codCharges: formData.paymentMethod === 'cod' ? formData.codCharges : 0,
        paymentMethod: formData.paymentMethod,
        paymentStatus: (() => {
          // If partial payment and additional amount makes it fully paid, change status to paid
          if (isEdit && formData.paymentStatus === 'partial' && againReceiveAmount > 0) {
            const finalAmount = parseFloat(formData.amountReceived || 0) + parseFloat(againReceiveAmount || 0);
            return finalAmount >= calculateTotals().totalAmount ? 'paid' : 'partial';
          }
          return formData.paymentStatus;
        })(),
        paymentNotes: formData.paymentNotes,
        amountReceived: isEdit && formData.paymentStatus === 'partial' && againReceiveAmount > 0
          ? parseFloat(formData.amountReceived || 0) + parseFloat(againReceiveAmount || 0)
          : formData.amountReceived,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        status: formData.status,
        bankAccountId: formData.bankAccountId || undefined // Include bank account ID if selected
      };
      
      if (isEdit) {
        const updated = await dispatch(updateOrder({ id, orderData })).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Order updated successfully!'
        }));
        // If there is a partial or full payment, post it to accounts
        const updatedOrder = updated?.data?.order ?? {};
        const finalAmountReceived = isEdit && formData.paymentStatus === 'partial' && againReceiveAmount > 0
          ? parseFloat(formData.amountReceived || 0) + parseFloat(againReceiveAmount || 0)
          : Number(updatedOrder.amountReceived);
        
        const finalPaymentStatus = finalAmountReceived >= calculateTotals().totalAmount ? 'paid' : updatedOrder.paymentStatus;
        
        if (finalAmountReceived > 0 && ['paid', 'partial'].includes(finalPaymentStatus)) {
          await dispatch(createSalesAccount({
            orderId: updatedOrder._id, // must be actual backend ID
            paymentMethod: updatedOrder.paymentMethod,
            paymentStatus: finalPaymentStatus === 'paid' ? 'completed' : 'pending',
          }));
        }
        
        // Reset again receive amount after successful update
        if (isEdit && againReceiveAmount > 0) {
          setAgainReceiveAmount(0);
        }
      } else {
        const created = await dispatch(createOrder(orderData)).unwrap();
        dispatch(addNotification({
          type: 'success',
          message: 'Order created successfully!'
        }));
        // If there is a partial or full payment, post it to accounts
        // Allow draft orders with payments to create accounts (money received should be tracked)
        // Only block cancelled orders
        const createdOrder = created?.data?.order ?? {};
        if (Number(createdOrder.amountReceived) > 0 && ['paid', 'partial'].includes(createdOrder.paymentStatus) && createdOrder.status !== 'cancelled') {
          await dispatch(createSalesAccount({
            orderId: createdOrder._id,
            paymentMethod: createdOrder.paymentMethod,
            paymentStatus: createdOrder.paymentStatus === 'paid' ? 'completed' : 'pending',
          }));
        }
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
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'paid', label: 'Paid' },
    { value: 'partial', label: 'Partial' },
    { value: 'refunded', label: 'Refunded' },
    { value: 'failed', label: 'Failed' }
  ];

  const orderStatusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'confirmed', label: 'Confirmed' },
    { value: 'picked', label: 'Picked' },
    { value: 'dispatched', label: 'Dispatched' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'returned', label: 'Returned' }
  ];

  const { subtotal, taxAmount, discountAmount, totalAmount } = calculateTotals();

  // Watch paymentStatus and automatically set amountReceived to totalAmount when payment is "paid"
  useEffect(() => {
    if (formData.paymentStatus === 'paid') {
      // Set amountReceived equal to totalAmount when payment status is "paid"
      setFormData(prev => ({
        ...prev,
        amountReceived: totalAmount
      }));
    }
  }, [formData.paymentStatus, totalAmount]);

  // Watch paymentStatus and amountReceived to update status logic.
  useEffect(() => {
    const amountReceived = parseFloat(formData.amountReceived) || 0;
    const isFullyPaid = formData.paymentStatus === 'paid' && amountReceived === totalAmount;
    const hasAnyPayment = amountReceived > 0 && ['paid', 'partial'].includes(formData.paymentStatus);
    
    // If fully paid, change to 'confirmed'
    if (isFullyPaid && formData.status === 'draft') {
      setFormData(prev => ({ ...prev, status: 'confirmed' }));
    }
    // If any amount is received and status is still 'draft', change to 'pending'
    else if (hasAnyPayment && formData.status === 'draft' && !isFullyPaid) {
      setFormData(prev => ({ ...prev, status: 'pending' }));
    }
    // If payment is removed (amountReceived becomes 0), reset to draft (only if not already progressed further)
    else if (amountReceived === 0 && formData.paymentStatus === 'pending' && ['pending', 'confirmed'].includes(formData.status)) {
      setFormData(prev => ({ ...prev, status: 'draft' }));
    }
  }, [formData.paymentStatus, formData.amountReceived, formData.status, totalAmount]);

  // Allow editing order status if:
  // 1. Fully paid, OR
  // 2. Any amount received (partial or full payment for any payment method)
  const canEditOrderStatus = (
    (formData.paymentStatus === 'paid' && +formData.amountReceived === +totalAmount)
    ||
    (+formData.amountReceived > 0 && ['paid', 'partial'].includes(formData.paymentStatus))
  );

  if (loading && isEdit) {
    return <Loading />;
  }

  const statusOptions = [...orderStatusOptions];
  const isKnownStatus = statusOptions.some(opt => opt.value === formData.status);
  if (!isKnownStatus && formData.status) {
    statusOptions.push({
      value: formData.status,
      label: formData.status.charAt(0).toUpperCase() + formData.status.slice(1)
    });
  }

  return (
    <div className="space-y-3">
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

      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-3">
            {/* Order Details */}
            <div className="pb-2">
              <h3 className="text-lg font-medium text-gray-900 mb-1.5">Order Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="w-full flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Customer *
                  </label>
                  <CustomerSelect
                    options={customerOptions}
                    value={formData.customerId}
                    onChange={handleSelectChange('customerId')}
                    placeholder="Search and select customer"
                    error={errors.customerId}
                    loading={leadsLoading || usersLoading}
                    name="customerId"
                    className="w-full"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Branch *
                  </label>
                  <Select
                    options={branchOptions}
                    value={formData.branchId}
                    onChange={handleSelectChange('branchId')}
                    placeholder="Select branch"
                    error={errors.branchId}
                    loading={branchesLoading}
                    disabled={isBranchDisabled}
                    className={`w-full ${isBranchDisabled ? 'opacity-60 cursor-not-allowed' : ''}`}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Payment Method
                  </label>
                  <Select
                    options={paymentMethodOptions}
                    value={formData.paymentMethod}
                    onChange={handleSelectChange('paymentMethod')}
                    placeholder="Select payment method"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="pb-2">
              <div className="flex justify-between items-center mb-1.5">
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
              
              <div className="space-y-2">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 py-1.5">
                    <div className="md:col-span-6 w-full flex flex-col">
                      <label className="block text-sm font-medium mb-1.5">
                        Product *
                      </label>
                      <Select
                        options={productOptions}
                        value={item.productId}
                        onChange={(value) => handleItemChange(index, 'productId', value)}
                        placeholder="Select product"
                        error={errors[`items.${index}.productId`]}
                        loading={productsLoading}
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-2 w-full flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Quantity *
                      </label>
                      <Input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        placeholder="Qty"
                        error={errors[`items.${index}.quantity`]}
                        min="1"
                        className="w-full"
                      />
                    </div>
                    <div className="md:col-span-3 w-full flex flex-col">
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
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
                        className="w-full"
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
            <div className="pb-2">
              <h3 className="text-lg font-medium text-gray-900 mb-1.5">Shipping Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2 w-full flex flex-col">
                  <Input
                    label="Name *"
                    value={formData.shippingAddress.name}
                    onChange={(e) => handleShippingAddressChange('name', e.target.value)}
                    placeholder="Full name"
                    error={errors['shippingAddress.name']}
                    icon={HiUser}
                    className="w-full"
                  />
                </div>
                <div className="md:col-span-2 w-full flex flex-col">
                  <TextArea
                    label="Address *"
                    value={formData.shippingAddress.address}
                    onChange={(e) => handleShippingAddressChange('address', e.target.value)}
                    placeholder="Street address"
                    error={errors['shippingAddress.address']}
                    icon={HiMapPin}
                    rows={3}
                    className="w-full"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <Input
                    label="Pincode *"
                    value={formData.shippingAddress.pincode}
                    onChange={(e) => handleShippingAddressChange('pincode', e.target.value.replace(/\D/g, ''))}
                    placeholder="Enter 6-digit pincode"
                    error={errors['shippingAddress.pincode']}
                    maxLength={6}
                    helperText={pincodeLoading ? "Fetching city and state..." : "City and state will be auto-filled"}
                    className="w-full"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <Input
                    label="City *"
                    value={formData.shippingAddress.city}
                    onChange={(e) => handleShippingAddressChange('city', e.target.value)}
                    placeholder="City (auto-filled from pincode)"
                    error={errors['shippingAddress.city']}
                    readOnly={!!formData.shippingAddress.pincode && formData.shippingAddress.pincode.length === 6}
                    className={`w-full ${formData.shippingAddress.pincode && formData.shippingAddress.pincode.length === 6 ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <Input
                    label="State *"
                    value={formData.shippingAddress.state}
                    onChange={(e) => handleShippingAddressChange('state', e.target.value)}
                    placeholder="State (auto-filled from pincode)"
                    error={errors['shippingAddress.state']}
                    readOnly={!!formData.shippingAddress.pincode && formData.shippingAddress.pincode.length === 6}
                    className={`w-full ${formData.shippingAddress.pincode && formData.shippingAddress.pincode.length === 6 ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                  />
                </div>
                <div className="w-full flex flex-col">
                  <Input
                    label="Phone *"
                    value={formData.shippingAddress.phone}
                    onChange={(e) => handleShippingAddressChange('phone', e.target.value)}
                    placeholder="Phone number"
                    error={errors['shippingAddress.phone']}
                    icon={HiPhone}
                    className="w-full"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <Input
                    label="Email"
                    type="email"
                    value={formData.shippingAddress.email}
                    onChange={(e) => handleShippingAddressChange('email', e.target.value)}
                    placeholder="Email address"
                    error={errors['shippingAddress.email']}
                    icon={HiEnvelope}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Delivery Information */}
            <div className="pb-2">
              <h3 className="text-lg font-medium text-gray-900 mb-1.5">Delivery Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="w-full flex flex-col">
                  <Input
                    label="Expected Delivery Date"
                    type="date"
                    value={formData.expectedDeliveryDate}
                    onChange={(e) => handleInputChange('expectedDeliveryDate', e.target.value)}
                    placeholder="Select expected delivery date"
                    error={errors.expectedDeliveryDate}
                    helperText="Optional: When do you expect this order to be delivered?"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="pb-2">
              <h3 className="text-lg font-medium text-gray-900 mb-1.5">Notes</h3>
              <div className="space-y-2">
                <div className="w-full flex flex-col">
                  <TextArea
                    label="Customer Notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Notes for the customer"
                    rows={3}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-3">
            {/* Order Summary */}
            <div className="pb-2">
              <h3 className="text-lg font-medium text-gray-900 mb-1.5">Order Summary</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Subtotal</span>
                  <span className="text-sm font-medium">₹{subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Tax (%)</span>
                    {taxAmount > 0 && (
                      <span className="text-xs text-gray-500">₹{taxAmount.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={formData.taxPercentage}
                      onChange={(e) => handleInputChange('taxPercentage', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
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
                  <div className="flex flex-col">
                    <span className="text-sm text-gray-600">Discount (%)</span>
                    {discountAmount > 0 && (
                      <span className="text-xs text-gray-500">₹{discountAmount.toFixed(2)}</span>
                    )}
                  </div>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={formData.discountPercentage}
                      onChange={(e) => handleInputChange('discountPercentage', e.target.value)}
                      placeholder="0"
                      min="0"
                      max="100"
                      step="0.01"
                      size="sm"
                    />
                  </div>
                </div>
                {formData.paymentMethod === 'cod' && (
                  <div className="flex justify-between items-center gap-3">
                    <span className="text-sm text-gray-600">COD Charges</span>
                    <div className="w-24">
                      <Input
                        type="number"
                        value={formData.codCharges}
                        onChange={(e) => handleInputChange('codCharges', e.target.value)}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        size="sm"
                      />
                    </div>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base font-medium text-gray-900">Total</span>
                    <span className="text-base font-bold text-gray-900">₹{totalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Status and Notes */}
            <div className="pb-2">
              <h3 className="text-lg font-medium text-gray-900 mb-1.5">Payment Information</h3>
              <div className="space-y-2">
                <div className="w-full flex flex-col">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Payment Status
                  </label>
                  <Select
                    options={paymentStatusOptions}
                    value={formData.paymentStatus}
                    onChange={handleSelectChange('paymentStatus')}
                    placeholder="Select payment status"
                    error={errors.paymentStatus}
                    className="w-full"
                  />
                </div>
                <div className="w-full flex flex-col">
                  <Input
                    label="Received Amount"
                    type="number"
                    value={formData.amountReceived}
                    onChange={(e) => handleInputChange('amountReceived', e.target.value)}
                    placeholder="₹0.00"
                    min="0"
                    step="0.01"
                    disabled={formData.paymentStatus === 'paid' || (isEdit && formData.paymentStatus === 'partial')}
                    error={!!errors.amountReceived}
                    errorMessage={errors.amountReceived}
                    helperText={
                      formData.paymentStatus === 'paid' 
                        ? "Amount automatically set to total amount for fully paid orders"
                        : (isEdit && formData.paymentStatus === 'partial')
                        ? "Original received amount (use 'Again Receive Amount' to add more)"
                        : formData.paymentMethod === 'cash'
                        ? "Cash payments will be added to branch's ready cash"
                        : (errors.amountReceived ? "" : "Amount received for this order")
                    }
                    className={`w-full ${(formData.paymentStatus === 'paid' || (isEdit && formData.paymentStatus === 'partial')) ? 'opacity-60 cursor-not-allowed bg-gray-50' : ''}`}
                  />
                </div>
                {/* Again Receive Amount and Balance - Show only for partial payment in edit mode */}
                {isEdit && formData.paymentStatus === 'partial' && (
                  <div className="w-full flex flex-col">
                    <Input
                      label="Again Receive Amount"
                      type="number"
                      value={againReceiveAmount}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0;
                        setAgainReceiveAmount(value);
                        // Validate that again receive amount doesn't exceed balance
                        const balance = totalAmount - parseFloat(formData.amountReceived || 0);
                        if (value > balance) {
                          setErrors(prev => ({
                            ...prev,
                            againReceiveAmount: `Additional amount (₹${value.toLocaleString()}) cannot exceed balance (₹${balance.toLocaleString()})`
                          }));
                        } else {
                          setErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors.againReceiveAmount;
                            return newErrors;
                          });
                        }
                      }}
                      placeholder="₹0.00"
                      min="0"
                      step="0.01"
                      error={!!errors.againReceiveAmount}
                      errorMessage={errors.againReceiveAmount}
                      helperText="Enter additional amount to receive"
                      className="w-full"
                    />
                    <span className="text-sm text-gray-600 mt-1">
                      Balance Value: ₹{Math.max(0, (totalAmount - parseFloat(formData.amountReceived || 0) - parseFloat(againReceiveAmount || 0))).toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="w-full flex flex-col">
                  <TextArea
                    label="Payment Notes"
                    value={formData.paymentNotes}
                    onChange={(e) => handleInputChange('paymentNotes', e.target.value)}
                    placeholder="Add any payment-related notes..."
                    rows={3}
                    error={errors.paymentNotes}
                    helperText="Optional: Add any payment-related notes or transaction IDs"
                    className="w-full"
                  />
                </div>
                {/* Bank Account Selection - Show only for Card or Net Banking (Cash goes to Ready Cash) */}
                {['card', 'netbanking'].includes(formData.paymentMethod) && formData.branchId && selectedBranchDetails && (
                  <div className="w-full flex flex-col">
                    {(() => {
                      // Get bank accounts from branch
                      const bankAccounts = Array.isArray(selectedBranchDetails.bankAccounts) && selectedBranchDetails.bankAccounts.length > 0
                        ? selectedBranchDetails.bankAccounts
                        : (selectedBranchDetails.bankName || selectedBranchDetails.bankAccountNumber)
                          ? [{
                              _id: 'single',
                              bankName: selectedBranchDetails.bankName,
                              bankAccountHolder: selectedBranchDetails.bankAccountHolder,
                              bankAccountNumber: selectedBranchDetails.bankAccountNumber,
                              bankIfsc: selectedBranchDetails.bankIfsc,
                              bankBranch: selectedBranchDetails.bankBranch
                            }]
                          : [];
                      
                      if (bankAccounts.length === 0) {
                        return (
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Bank Account
                            </label>
                            <div className="text-sm text-gray-500 p-2 bg-gray-50 rounded border">
                              No bank accounts available for this branch
                            </div>
                          </div>
                        );
                      }
                      
                      if (bankAccounts.length === 1) {
                        const account = bankAccounts[0];
                        return (
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                              Bank Account
                            </label>
                            <div className="text-sm text-gray-900 p-2 bg-gray-50 rounded border">
                              <div className="font-medium">{account.bankName || 'N/A'}</div>
                              <div className="text-xs text-gray-600 mt-1">
                                Account: {account.bankAccountNumber || 'N/A'} | 
                                IFSC: {account.bankIfsc || 'N/A'} | 
                                Holder: {account.bankAccountHolder || 'N/A'}
                              </div>
                            </div>
                            <input type="hidden" value={account._id || 'single'} />
                          </div>
                        );
                      }
                      
                      // Multiple accounts - show dropdown
                      const bankAccountOptions = bankAccounts.map(acc => ({
                        value: acc._id || acc.bankAccountNumber,
                        label: `${acc.bankName || 'Bank'} - ${acc.bankAccountNumber || 'N/A'} (${acc.bankIfsc || 'IFSC'})`
                      }));
                      
                      return (
                        <div className="w-full flex flex-col">
                          <label className="block text-sm font-medium text-gray-700 mb-1.5">
                            Bank Account
                          </label>
                          <Select
                            options={bankAccountOptions}
                            value={formData.bankAccountId}
                            onChange={handleSelectChange('bankAccountId')}
                            placeholder="Select bank account"
                            error={errors.bankAccountId}
                            className="w-full"
                          />
                        </div>
                      );
                    })()}
                  </div>
                )}
                {isEdit && (
                  <div className="w-full flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Status</label>
                    <Select
                      options={statusOptions}
                      value={formData.status || orderStatusOptions[0].value}
                      onChange={handleSelectChange('status')}
                      error={errors.status}
                      disabled={!canEditOrderStatus}
                      className={`w-full ${!canEditOrderStatus ? 'opacity-60 cursor-not-allowed' : ''}`}
                    />
                    <div className="text-xs text-gray-400 mt-1">
                      {canEditOrderStatus
                        ? 'Order status is now editable.'
                        : "Order status can be changed after receiving any payment amount."}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-3">
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