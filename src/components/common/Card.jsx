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
  loading = false,
  gradient = "blue", // blue, green, purple, orange, red, yellow, indigo, pink
  animation = "default" // default, bounce, pulse, float
}) => {
  const getGradientBackground = () => {
    switch (gradient) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100';
      case 'orange':
        return 'bg-gradient-to-br from-orange-50 to-orange-100';
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-red-100';
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'indigo':
        return 'bg-gradient-to-br from-indigo-50 to-indigo-100';
      case 'pink':
        return 'bg-gradient-to-br from-pink-50 to-pink-100';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100';
      case 'amber':
        return 'bg-gradient-to-br from-amber-50 to-amber-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

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

  const getAnimationClass = () => {
    switch (animation) {
      case 'bounce':
        return 'icon-bounce';
      case 'pulse':
        return 'icon-pulse';
      case 'float':
        return 'icon-float';
      default:
        return 'stat-card-icon';
    }
  };

  if (loading) {
    return (
      <Card className={`group h-full ${getGradientBackground()} ${className}`} padding="p-3">
        <div className="flex items-center h-full">
          <div className="flex-shrink-0">
            <div className="h-6 w-6 loading-skeleton rounded-full"></div>
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
      className={`group h-full ${getGradientBackground()} ${className}`}
      onClick={onClick}
      hover={!!onClick}
      padding="p-3"
    >
      <div className="flex items-center h-full">
        <div className="flex-shrink-0">
          <div className="h-8 w-8 flex items-center justify-center">
            {Icon ? (
              React.createElement(Icon, {
                className: `h-6 w-6 text-gray-600 group-hover:text-blue-600 ${getAnimationClass()}`
              })
            ) : (
              <div className="h-6 w-6 bg-gray-200 rounded-full flex items-center justify-center group-hover:bg-blue-100 transition-all duration-300">
                <span className="text-gray-500 text-xs font-bold group-hover:text-blue-600">?</span>
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
  gradient = "gray", // blue, green, purple, orange, red, yellow, indigo, pink, emerald, amber
  ...props
}) => {
  const getGradientBackground = () => {
    switch (gradient) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100';
      case 'orange':
        return 'bg-gradient-to-br from-orange-50 to-orange-100';
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-red-100';
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'indigo':
        return 'bg-gradient-to-br from-indigo-50 to-indigo-100';
      case 'pink':
        return 'bg-gradient-to-br from-pink-50 to-pink-100';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100';
      case 'amber':
        return 'bg-gradient-to-br from-amber-50 to-amber-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  if (loading) {
    return (
      <Card className={`${getGradientBackground()} ${className}`} {...props}>
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
    <Card className={`${getGradientBackground()} ${className}`} {...props}>
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
  gradient = "gray", // blue, green, purple, orange, red, yellow, indigo, pink, emerald, amber
  ...props
}) => {
  const getGradientBackground = () => {
    switch (gradient) {
      case 'blue':
        return 'bg-gradient-to-br from-blue-50 to-blue-100';
      case 'green':
        return 'bg-gradient-to-br from-green-50 to-green-100';
      case 'purple':
        return 'bg-gradient-to-br from-purple-50 to-purple-100';
      case 'orange':
        return 'bg-gradient-to-br from-orange-50 to-orange-100';
      case 'red':
        return 'bg-gradient-to-br from-red-50 to-red-100';
      case 'yellow':
        return 'bg-gradient-to-br from-yellow-50 to-yellow-100';
      case 'indigo':
        return 'bg-gradient-to-br from-indigo-50 to-indigo-100';
      case 'pink':
        return 'bg-gradient-to-br from-pink-50 to-pink-100';
      case 'emerald':
        return 'bg-gradient-to-br from-emerald-50 to-emerald-100';
      case 'amber':
        return 'bg-gradient-to-br from-amber-50 to-amber-100';
      default:
        return 'bg-gradient-to-br from-gray-50 to-gray-100';
    }
  };

  return (
    <Card
      className={`relative z-10 ${getGradientBackground()} ${className}`}
      padding="p-3"
      {...props}
    >
      {children}
    </Card>
  );
};

export default Card;
