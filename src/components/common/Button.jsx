import React from 'react';

const Button = ({
  children,
  variant = "primary", // primary, secondary, outline, ghost, danger, gradient, success, warning
  size = "md", // sm, md, lg, xl
  icon: Icon,
  iconPosition = "left", // left, right
  loading = false,
  disabled = false,
  className = "",
  onClick,
  type = "button",
  ...props
}) => {
  const getVariantClasses = () => {
    const baseClasses = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 btn-hover";
    
    switch (variant) {
      case 'primary':
        return `${baseClasses} text-white shadow-sm hover:shadow-md focus:ring-green-500 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700`;
      case 'gradient':
        return `${baseClasses} text-white shadow-lg hover:shadow-xl focus:ring-green-500 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700`;
      case 'success':
        return `${baseClasses} text-white shadow-lg hover:shadow-xl focus:ring-emerald-500 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700`;
      case 'warning':
        return `${baseClasses} text-white shadow-lg hover:shadow-xl focus:ring-yellow-500 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700`;
      case 'secondary':
        return `${baseClasses} bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:border-gray-400 focus:ring-green-500 shadow-sm`;
      case 'outline':
        return `${baseClasses} text-green-500 border-2 border-green-500 hover:bg-green-500 hover:text-white focus:ring-green-500 bg-white`;
      case 'ghost':
        return `${baseClasses} text-gray-600 hover:text-green-500 hover:bg-green-50 focus:ring-green-500`;
      case 'danger':
        return `${baseClasses} text-white shadow-lg hover:shadow-xl focus:ring-red-500 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700`;
      case 'info':
        return `${baseClasses} text-white shadow-lg hover:shadow-xl focus:ring-blue-500 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700`;
      default:
        return baseClasses;
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'px-4 py-2 text-sm';
      case 'md':
        return 'px-6 py-3 text-sm';
      case 'lg':
        return 'px-8 py-4 text-base';
      case 'xl':
        return 'px-10 py-5 text-lg';
      default:
        return 'px-6 py-3 text-sm';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-3 w-3';
      case 'md':
        return 'h-4 w-4';
      case 'lg':
        return 'h-5 w-5';
      case 'xl':
        return 'h-6 w-6';
      default:
        return 'h-4 w-4';
    }
  };

  const getPrimaryStyle = () => {
    if (variant === 'primary') {
      return { background: 'linear-gradient(90deg, #8bc34a, #558b2f)' };
    }
    // For gradient variants, we don't need inline styles as they're handled by Tailwind classes
    return {};
  };

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      className={`${getVariantClasses()} ${getSizeClasses()} ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      style={getPrimaryStyle()}
      onClick={onClick}
      disabled={isDisabled}
      {...props}
    >
      {loading && (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className={`${getIconSize()} mr-2`} />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className={`${getIconSize()} ml-2`} />
      )}
    </button>
  );
};

// Action Button Component for table actions
export const ActionButton = ({
  icon: Icon,
  onClick,
  title,
  variant = "ghost",
  size = "sm",
  className = "",
  ...props
}) => {
  const getActionVariantClasses = () => {
    switch (variant) {
      case 'view':
        return 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 hover:scale-110';
      case 'edit':
        return 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 hover:scale-110';
      case 'delete':
        return 'text-gray-400 hover:text-red-500 hover:bg-red-500/10 hover:scale-110';
      case 'success':
        return 'text-gray-400 hover:text-green-500 hover:bg-green-500/10 hover:scale-110';
      case 'warning':
        return 'text-gray-400 hover:text-yellow-500 hover:bg-yellow-500/10 hover:scale-110';
      default:
        return 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10 hover:scale-110';
    }
  };

  const getActionSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'p-1.5';
      case 'md':
        return 'p-2';
      case 'lg':
        return 'p-2.5';
      default:
        return 'p-1.5';
    }
  };

  const getIconSize = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-5 w-5';
      case 'lg':
        return 'h-6 w-6';
      default:
        return 'h-4 w-4';
    }
  };

  return (
    <button
      onClick={onClick}
      className={`${getActionSizeClasses()} rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 ${getActionVariantClasses()} ${className}`}
      title={title}
      {...props}
    >
      <Icon className={getIconSize()} />
    </button>
  );
};

// Button Group Component
export const ButtonGroup = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`} {...props}>
      {children}
    </div>
  );
};

export default Button;
