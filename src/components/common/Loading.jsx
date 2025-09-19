import React from 'react';

const Loading = ({
  size = "md", // sm, md, lg, xl
  color = "#22c55e",
  className = "",
  text = "",
  variant = "spinner", // spinner, dots, pulse
  ...props
}) => {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-4 w-4';
      case 'md':
        return 'h-6 w-6';
      case 'lg':
        return 'h-8 w-8';
      case 'xl':
        return 'h-12 w-12';
      default:
        return 'h-6 w-6';
    }
  };

  const renderSpinner = () => (
    <div className="relative">
      <div className={`animate-spin rounded-full border-2 border-gray-200 ${getSizeClasses()}`}></div>
      <div 
        className={`animate-spin rounded-full border-2 border-t-transparent absolute top-0 left-0 ${getSizeClasses()}`}
        style={{ borderColor: color }}
      ></div>
    </div>
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="bg-blue-500 rounded-full animate-bounce"
          style={{
            width: size === 'sm' ? '8px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '20px',
            height: size === 'sm' ? '8px' : size === 'md' ? '12px' : size === 'lg' ? '16px' : '20px',
            animationDelay: `${i * 0.1}s`,
            animationDuration: '0.6s'
          }}
        ></div>
      ))}
    </div>
  );

  const renderPulse = () => (
    <div 
      className={`bg-blue-500 rounded-full animate-pulse ${getSizeClasses()}`}
      style={{ backgroundColor: color }}
    ></div>
  );

  const renderLoader = () => {
    switch (variant) {
      case 'dots':
        return renderDots();
      case 'pulse':
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`} {...props}>
      <div className="flex flex-col items-center space-y-3">
        {renderLoader()}
        {text && (
          <span className="text-sm font-medium text-gray-600 animate-pulse">{text}</span>
        )}
      </div>
    </div>
  );
};

// Spinner Component
export const Spinner = ({
  size = "md",
  color = "#22c55e",
  className = "",
  ...props
}) => {
  return (
    <Loading
      size={size}
      color={color}
      className={className}
      {...props}
    />
  );
};

// Page Loading Component
export const PageLoading = ({
  message = "Loading...",
  className = "",
  ...props
}) => {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 ${className}`} {...props}>
      <div className="text-center space-y-6 animate-fade-in">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent absolute top-0 left-0"></div>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{message}</h3>
          <p className="text-sm text-gray-500">Please wait while we load your content</p>
        </div>
      </div>
    </div>
  );
};

// Inline Loading Component
export const InlineLoading = ({
  text = "Loading...",
  className = "",
  ...props
}) => {
  return (
    <Loading
      size="sm"
      text={text}
      className={className}
      {...props}
    />
  );
};

// Button Loading Component
export const ButtonLoading = ({
  className = "",
  ...props
}) => {
  return (
    <div className={`animate-spin rounded-full h-4 w-4 border-b-2 border-white ${className}`} {...props}></div>
  );
};

// Skeleton Loading Component
export const SkeletonLoader = ({ 
  lines = 3, 
  className = '',
  height = 'h-4',
  width = 'w-full',
  rounded = 'rounded-lg'
}) => {
  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <div
          key={index}
          className={`bg-gray-200 ${rounded} animate-pulse ${height} ${
            index === lines - 1 ? 'w-3/4' : width
          }`}
        ></div>
      ))}
    </div>
  );
};

// Card Skeleton Component
export const CardSkeleton = ({ 
  className = '',
  showAvatar = false,
  lines = 3
}) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200/50 p-6 ${className}`}>
      <div className="space-y-4">
        {showAvatar && (
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-1/3"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-1/4"></div>
            </div>
          </div>
        )}
        <SkeletonLoader lines={lines} />
      </div>
    </div>
  );
};

export default Loading;
