import React from 'react';
import { HiCreditCard } from 'react-icons/hi2';
import Dropdown from '../../../common/Dropdown';

const PaymentAssignmentStep = ({
  formData,
  setFormData,
  errors
}) => {
  const paymentTypeOptions = [
    { value: 'prepaid', label: 'Prepaid' },
    { value: 'local', label: 'Local' },
    { value: 'cod', label: 'Cash on Delivery' }
  ];

  const paymentModeOptions = [
    { value: 'gpay', label: 'Google Pay' },
    { value: 'phonepe', label: 'PhonePe' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online_sales', label: 'Online Sales' },
    { value: 'cash', label: 'Cash' },
    { value: 'full_cod', label: 'Full COD' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (payment)
    if (name.startsWith('payment.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        payment: {
          ...prev.payment,
          [field]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Payment Information */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 bg-[#22c55e]-100 rounded-xl flex items-center justify-center">
          <HiCreditCard className="h-5 w-5 text-[#22c55e]-600" />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Payment Information</h4>
          <p className="text-sm text-gray-500">Payment details and transaction information</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <Dropdown
            label="Payment Type"
            name="payment.paymentType"
            value={formData.payment.paymentType}
            onChange={handleInputChange}
            options={paymentTypeOptions}
            placeholder="Select payment type"
            className="focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
          />
        </div>
        
        <div>
          <Dropdown
            label="Payment Mode"
            name="payment.paymentMode"
            value={formData.payment.paymentMode}
            onChange={handleInputChange}
            options={paymentModeOptions}
            placeholder="Select payment mode"
            className="focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e]"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Date
          </label>
          <input
            type="date"
            name="payment.paymentDate"
            value={formData.payment.paymentDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Payment Note
          </label>
          <input
            type="text"
            name="payment.paymentNote"
            value={formData.payment.paymentNote}
            onChange={handleInputChange}
            placeholder="Enter payment note"
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#22c55e] focus:border-[#22c55e] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
      </div>

    </div>
  );
};

export default PaymentAssignmentStep;
