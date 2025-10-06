import React from 'react';

const DetailsView = ({ 
  data, 
  sections = [], 
  className = '' 
}) => {
  const renderField = (field, index) => {
    const { label, value, type = 'text', className: fieldClassName = '' } = field;
    
    return (
      <div key={index} className={`py-1.5 ${fieldClassName}`}>
        <div className="flex justify-between items-center">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 mb-1 truncate">{label}</p>
            <p className={`text-sm font-semibold text-gray-900 truncate ${
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
        <h5 className="text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent mb-3">
          {title}
        </h5>
        <div className="space-y-1">
          {fields.map((field, fieldIndex) => renderField(field, fieldIndex))}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {sections.map((section, index) => renderSection(section, index))}
    </div>
  );
};

export default DetailsView;
