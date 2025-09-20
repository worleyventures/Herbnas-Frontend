import React from 'react';
import { HiXMark } from 'react-icons/hi2';
import { Button } from './index';

const CommonModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  showFooter = false,
  footerContent,
  className = ''
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
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full ${sizeClasses[size]} ${className}`}>
          {/* Header */}
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                    {title}
                  </h3>
                {showCloseButton && (
                  <button
                    onClick={onClose}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <HiXMark className="h-6 w-6" />
                  </button>
                )}
              </div>
            </div>

          {/* Body */}
          <div className="bg-white px-4 pb-4 sm:p-6 sm:pt-0">
            {children}
          </div>

          {/* Footer */}
          {showFooter && (
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              {footerContent}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommonModal;