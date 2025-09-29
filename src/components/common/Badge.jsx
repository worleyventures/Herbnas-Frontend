import React from 'react';

const Badge = ({
  children,
  variant = "default", // default, success, warning, error, info, custom
  size = "md", // sm, md, lg
  className = "",
  customColor = "",
  ...props
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'success':
        return 'bg-#22c55e-100 text-#22c55e-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'info':
        return 'bg-blue-100 text-blue-800';
      case 'custom':
        return customColor;
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-2 py-0.5 text-xs';
      case 'md':
        return 'px-2 py-1 text-xs';
      case 'lg':
        return 'px-3 py-1.5 text-sm';
      default:
        return 'px-2 py-1 text-xs';
    }
  };

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${getVariantClasses()} ${getSizeClasses()} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

// Status Badge Component
export const StatusBadge = ({
  status,
  statusMap = {},
  className = "",
  ...props
}) => {
  const defaultStatusMap = {
    new: { variant: 'info', label: 'New' },
    'new_lead': { variant: 'info', label: 'New Lead' },
    contacted: { variant: 'warning', label: 'Contacted' },
    qualified: { variant: 'info', label: 'Qualified' },
    converted: { variant: 'success', label: 'Converted' },
    'order_completed': { variant: 'success', label: 'Order Completed' },
    lost: { variant: 'error', label: 'Lost' },
    pending: { variant: 'warning', label: 'Pending' },
    'Pending': { variant: 'warning', label: 'Pending' },
    completed: { variant: 'success', label: 'Completed' },
    'in-progress': { variant: 'info', label: 'In Progress' },
    'on-hold': { variant: 'warning', label: 'On Hold' },
    'Approved': { variant: 'success', label: 'Approved' },
    'Rejected': { variant: 'error', label: 'Rejected' },
    cancelled: { variant: 'error', label: 'Cancelled' },
    active: { variant: 'success', label: 'Active' },
    inactive: { variant: 'error', label: 'Inactive' },
    high: { variant: 'error', label: 'High' },
    medium: { variant: 'warning', label: 'Medium' },
    low: { variant: 'info', label: 'Low' },
    ...statusMap
  };

  // Handle status formatting - convert underscores to spaces and capitalize
  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Check custom statusMap first, then defaultStatusMap
  const statusConfig = statusMap[status] || defaultStatusMap[status] || { 
    variant: 'default', 
    label: formatStatus(status) 
  };

  return (
    <Badge
      variant={statusConfig.variant}
      className={`${className} ${!status ? 'opacity-50' : ''}`}
      {...props}
    >
      {statusConfig.label}
    </Badge>
  );
};

// Priority Badge Component
export const PriorityBadge = ({
  priority,
  className = "",
  ...props
}) => {
  const priorityMap = {
    high: { variant: 'error', label: 'High' },
    medium: { variant: 'warning', label: 'Medium' },
    low: { variant: 'info', label: 'Low' },
    urgent: { variant: 'error', label: 'Urgent' },
    normal: { variant: 'default', label: 'Normal' }
  };

  const priorityConfig = priorityMap[priority] || { variant: 'default', label: priority };

  return (
    <Badge
      variant={priorityConfig.variant}
      className={className}
      {...props}
    >
      {priorityConfig.label}
    </Badge>
  );
};

// Custom Badge with specific colors
export const CustomBadge = ({
  children,
  bgColor = "#22c55e",
  textColor = "#ffffff",
  className = "",
  ...props
}) => {
  return (
    <Badge
      variant="custom"
      customColor={`text-white`}
      className={className}
      style={{ backgroundColor: bgColor, color: textColor }}
      {...props}
    >
      {children}
    </Badge>
  );
};

export default Badge;
