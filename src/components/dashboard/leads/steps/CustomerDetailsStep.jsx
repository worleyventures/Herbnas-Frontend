import React from 'react';
import { HiPhone, HiEnvelope, HiUser } from 'react-icons/hi2';

const CustomerDetailsStep = ({ formData, setFormData, errors }) => {
  const genderOptions = [
    { value: 'Male', label: 'Male' },
    { value: 'Female', label: 'Female' },
    { value: 'Other', label: 'Other' }
  ];

  const maritalStatusOptions = [
    { value: 'Married', label: 'Married' },
    { value: 'Unmarried', label: 'Unmarried' }
  ];


  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested objects (address)
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
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
      <div className="flex items-center space-x-3 mb-6">
        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{backgroundColor: '#8bc34a20'}}>
          <HiPhone className="h-5 w-5" style={{color: '#8bc34a'}} />
        </div>
        <div>
          <h4 className="text-lg font-semibold text-gray-900">Customer Contact Information</h4>
          <p className="text-sm text-gray-600">Customer details and contact information</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Name *
          </label>
          <input
            type="text"
            name="customerName"
            value={formData.customerName}
            onChange={handleInputChange}
            placeholder="Enter customer name"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
              errors.customerName ? 'border-red-500' : 'border-gray-300/50'
            }`}
          />
          {errors.customerName && (
            <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mobile Number *
          </label>
          <input
            type="tel"
            name="customerMobile"
            value={formData.customerMobile}
            onChange={handleInputChange}
            placeholder="Enter mobile number"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
              errors.customerMobile ? 'border-red-500' : 'border-gray-300/50'
            }`}
          />
          {errors.customerMobile && (
            <p className="mt-1 text-sm text-red-600">{errors.customerMobile}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="customerEmail"
            value={formData.customerEmail}
            onChange={handleInputChange}
            placeholder="Enter email address"
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md ${
              errors.customerEmail ? 'border-red-500' : 'border-gray-300/50'
            }`}
          />
          {errors.customerEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.customerEmail}</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Age
          </label>
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleInputChange}
            placeholder="Enter age"
            min="1"
            max="120"
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender
          </label>
          <select
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          >
            <option value="">Select Gender</option>
            {genderOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Marital Status
          </label>
          <select
            name="maritalStatus"
            value={formData.maritalStatus}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          >
            <option value="">Select Marital Status</option>
            {maritalStatusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Street Address
        </label>
        <textarea
          name="address.street"
          value={formData.address.street}
          onChange={handleInputChange}
          rows={2}
          placeholder="Enter street address"
          className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md resize-none"
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            City
          </label>
          <input
            type="text"
            name="address.city"
            value={formData.address.city}
            onChange={handleInputChange}
            placeholder="Enter city"
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <input
            type="text"
            name="address.state"
            value={formData.address.state}
            onChange={handleInputChange}
            placeholder="Enter state"
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pin Code
          </label>
          <input
            type="text"
            name="address.pinCode"
            value={formData.address.pinCode}
            onChange={handleInputChange}
            placeholder="Enter pin code"
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <input
            type="text"
            name="address.country"
            value={formData.address.country}
            onChange={handleInputChange}
            placeholder="Enter country"
            className="w-full px-4 py-3 border border-gray-300/50 rounded-xl focus:ring-2 focus:ring-[#8bc34a] focus:border-[#8bc34a] transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md"
          />
        </div>
      </div>

    </div>
  );
};

export default CustomerDetailsStep;
