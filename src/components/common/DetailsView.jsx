import React from 'react';

const DetailsView = ({ 
  data, 
  sections = [], 
  className = '' 
}) => {
  const renderField = (field, index) => {
    const { label, value, type = 'text', className: fieldClassName = '' } = field;
    
    // Handle image type
    if (type === 'image' && value) {
      return (
        <div key={index} className={`py-1 ${fieldClassName}`}>
          <div className="flex flex-col">
            <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
            <div className="relative rounded-lg overflow-hidden border border-gray-200">
              <img
                src={value}
                alt={label}
                className="w-full h-auto max-h-64 object-contain bg-gray-50"
                onError={(e) => {
                  e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5Y2EzYWYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZSBub3QgZm91bmQ8L3RleHQ+PC9zdmc+';
                }}
              />
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div key={index} className={`py-1 ${fieldClassName}`}>
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0 pr-4">
            <p className="text-xs font-medium text-gray-500 mb-1">{label}</p>
            <p className={`text-sm font-semibold text-gray-900 break-words leading-tight ${
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
    const fieldCount = fields.length;
    // Dynamic spacing based on field count - smaller sections get less margin
    const sectionMargin = fieldCount <= 2 ? 'mb-3' : fieldCount <= 4 ? 'mb-4' : 'mb-5';
    const titleMargin = fieldCount <= 2 ? 'mb-2' : 'mb-3';
    
    return (
      <div key={sectionIndex} className={`${sectionMargin} ${sectionClassName}`}>
        <h5 className={`text-sm font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent ${titleMargin}`}>
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
