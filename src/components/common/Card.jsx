import React from 'react';

const Card = ({
  children,
  className = "",
  padding = "p-6",
  shadow = "shadow-sm",
  rounded = "rounded-xl",
  border = "border border-gray-200/50",
  hover = false,
  gradient = false,
  glass = false,
  onClick,
  ...props
}) => {
  const baseClasses = `bg-white ${padding} ${shadow} ${rounded} ${border}`;
  const hoverClasses = hover ? "card-hover cursor-pointer" : "";
  const gradientClasses = gradient ? "gradient-primary text-white" : "";
  const glassClasses = glass ? "glass backdrop-blur-sm" : "";
  const clickClasses = onClick ? "cursor-pointer" : "";

  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${gradientClasses} ${glassClasses} ${clickClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Stat Card Component
export const StatCard = ({
  title,
  value,
  icon: Icon,
  iconColor = "text-blue-500",
  iconBg = "bg-gradient-to-br from-blue-500 to-blue-600",
  change,
  changeType = "neutral", // positive, negative, neutral
  className = "",
  onClick,
  loading = false
}) => {
  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
      case 'increase':
        return 'text-emerald-600';
      case 'negative':
      case 'decrease':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
      case 'increase':
        return '↗';
      case 'negative':
      case 'decrease':
        return '↘';
      default:
        return '→';
    }
  };

  if (loading) {
    return (
      <Card className={`group h-full ${className}`} padding="p-3">
        <div className="flex items-center h-full">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 loading-skeleton rounded-lg"></div>
          </div>
          <div className="ml-2 flex-1 space-y-1">
            <div className="h-3 loading-skeleton rounded w-12"></div>
            <div className="h-5 loading-skeleton rounded w-8"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={`group h-full ${className}`}
      onClick={onClick}
      hover={!!onClick}
      padding="p-3"
    >
      <div className="flex items-center h-full">
        <div className="flex-shrink-0">
          <div className={`h-8 w-8 ${iconBg} rounded-lg flex items-center justify-center shadow-sm group-hover:shadow-md transition-all duration-300`}>
            {Icon ? (
              React.createElement(Icon, {
                className: "h-4 w-4 text-white group-hover:scale-110 transition-transform duration-300"
              })
            ) : (
              <div className="h-4 w-4 bg-white/20 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">?</span>
              </div>
            )}
          </div>
        </div>
        <div className="ml-2 flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 mb-0.5 truncate">{title}</p>
          <p className="text-xl font-bold text-gray-900 mb-0.5">{value}</p>
          {change && (
            <div className="flex items-center space-x-1">
              <span className={`text-xs font-medium ${getChangeColor()}`}>
                {getChangeIcon()}
              </span>
              <p className={`text-xs font-medium ${getChangeColor()}`}>
                {change}
              </p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Info Card Component
export const InfoCard = ({
  title,
  subtitle,
  children,
  actions,
  className = "",
  titleClassName = "",
  subtitleClassName = "",
  loading = false,
  ...props
}) => {
  if (loading) {
    return (
      <Card className={className} {...props}>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 loading-skeleton rounded w-32"></div>
              <div className="h-4 loading-skeleton rounded w-24"></div>
            </div>
            <div className="h-8 loading-skeleton rounded w-20"></div>
          </div>
          <div className="space-y-2">
            <div className="h-4 loading-skeleton rounded w-full"></div>
            <div className="h-4 loading-skeleton rounded w-3/4"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={className} {...props}>
      {(title || subtitle || actions) && (
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1 min-w-0">
            {title && (
              <h3 className={`text-xl font-bold text-gray-900 mb-2 ${titleClassName}`}>
                {title}
              </h3>
            )}
            {subtitle && (
              <p className={`text-sm text-gray-500 leading-relaxed ${subtitleClassName}`}>
                {subtitle}
              </p>
            )}
          </div>
          {actions && (
            <div className="flex items-center space-x-3 ml-4">
              {actions}
            </div>
          )}
        </div>
      )}
      {children}
    </Card>
  );
};

// Filter Card Component
export const FilterCard = ({
  children,
  className = "",
  ...props
}) => {
  return (
    <Card
      className={`relative z-10 ${className}`}
      padding="p-3"
      {...props}
    >
      {children}
    </Card>
  );
};

export default Card;
