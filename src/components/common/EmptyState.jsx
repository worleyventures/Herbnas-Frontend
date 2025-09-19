import React from 'react';

const EmptyState = ({
  icon: Icon,
  title = "No data found",
  description = "There are no items to display at the moment.",
  action,
  className = "",
  iconClassName = "",
  titleClassName = "",
  descriptionClassName = "",
  ...props
}) => {
  return (
    <div className={`text-center py-12 ${className}`} {...props}>
      {Icon && (
        <div className={`mx-auto h-12 w-12 text-gray-300 mb-4 ${iconClassName}`}>
          <Icon className="h-full w-full" />
        </div>
      )}
      
      <h3 className={`text-lg font-medium text-gray-900 mb-2 ${titleClassName}`}>
        {title}
      </h3>
      
      <p className={`text-sm text-gray-500 mb-6 ${descriptionClassName}`}>
        {description}
      </p>
      
      {action && (
        <div className="flex justify-center">
          {action}
        </div>
      )}
    </div>
  );
};

// Table Empty State Component
export const TableEmptyState = ({
  title = "No data found",
  description = "Get started by creating your first item.",
  action,
  className = "",
  ...props
}) => {
  return (
    <tr>
      <td colSpan="100%" className="px-6 py-12 text-center text-gray-500">
        <EmptyState
          title={title}
          description={description}
          action={action}
          className={className}
          {...props}
        />
      </td>
    </tr>
  );
};

// Card Empty State Component
export const CardEmptyState = ({
  title = "No data available",
  description = "There are no items to display.",
  action,
  className = "",
  ...props
}) => {
  return (
    <div className={`p-8 ${className}`} {...props}>
      <EmptyState
        title={title}
        description={description}
        action={action}
        {...props}
      />
    </div>
  );
};

// Page Empty State Component
export const PageEmptyState = ({
  title = "Nothing here yet",
  description = "This page is empty. Create something to get started.",
  action,
  className = "",
  ...props
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gray-50 ${className}`} {...props}>
      <EmptyState
        title={title}
        description={description}
        action={action}
        {...props}
      />
    </div>
  );
};

export default EmptyState;
