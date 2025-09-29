import React from 'react';

const DetailsView = ({ 
  data, 
  sections = [], 
  className = '' 
}) => {
  const renderField = (field, index) => {
    const { label, value, type = 'text', className: fieldClassName = '' } = field;
    
    return (
      <div key={index} className={`py-2 ${fieldClassName}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
            <p className={`text-sm font-semibold text-gray-900 ${
              type === 'status' && value === 'Active' ? 'text-green-600' : 
              type === 'status' && value === 'Inactive' ? 'text-red-600' :
              type === 'price' ? 'text-green-600' : ''
            }`}>
              {value || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    );
  };

  const renderSection = (section, sectionIndex) => {
    const { title, fields, className: sectionClassName = '' } = section;
    
    return (
      <div key={sectionIndex} className={`${sectionClassName}`}>
        <h5 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent mb-2">
          {title}
        </h5>
        <div className="space-y-0.5">
          {fields.map((field, fieldIndex) => renderField(field, fieldIndex))}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default DetailsView;
