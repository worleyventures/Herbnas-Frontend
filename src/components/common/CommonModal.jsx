import React from 'react';
import { HiXMark } from 'react-icons/hi2';
import { Button } from './index';

const CommonModal = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  size = 'md',
  showCloseButton = true,
  showFooter = false,
  footerContent,
  className = '',
  icon: Icon,
  iconColor = 'from-[#8bc34a] to-[#558b2f]'
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-6xl',
    full: 'max-w-full mx-4'
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-2">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/30 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`relative w-full bg-white rounded-xl shadow-2xl transform transition-all ${sizeClasses[size]} ${className}`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100">
            <div className="flex items-center space-x-2">
              {Icon && (
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${iconColor} flex items-center justify-center`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-bold bg-gradient-to-r from-[#8bc34a] to-[#558b2f] bg-clip-text text-transparent">
                  {title}
                </h3>
                {subtitle && (
                  <p className="text-xs text-gray-500">{subtitle}</p>
                )}
              </div>
            </div>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <HiXMark className="h-4 w-4 text-gray-500" />
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-4">
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="px-4 py-3 bg-gray-50 rounded-b-xl">
              <div className="flex items-center justify-end space-x-2">
                {footerContent}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonModal;