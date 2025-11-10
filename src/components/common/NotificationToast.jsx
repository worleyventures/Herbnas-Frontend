import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { removeNotification } from '../../redux/slices/uiSlice';
import { 
  HiCheckCircle, 
  HiXCircle, 
  HiExclamationTriangle, 
  HiInformationCircle,
  HiXMark
} from 'react-icons/hi2';

const NotificationToast = () => {
  const dispatch = useDispatch();
  const notifications = useSelector((state) => state.ui.notifications || []);

  useEffect(() => {
    notifications.forEach((notification) => {
      const duration = notification.duration || 5000;
      const timer = setTimeout(() => {
        dispatch(removeNotification(notification.id));
      }, duration);

      return () => clearTimeout(timer);
    });
  }, [notifications, dispatch]);

  const getIcon = (type) => {
    switch (type) {
      case 'success':
        return <HiCheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <HiXCircle className="h-5 w-5 text-red-500" />;
      case 'warning':
        return <HiExclamationTriangle className="h-5 w-5 text-yellow-500" />;
      case 'info':
        return <HiInformationCircle className="h-5 w-5 text-blue-500" />;
      default:
        return <HiInformationCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getBgColor = (type) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getTextColor = (type) => {
    switch (type) {
      case 'success':
        return 'text-green-800';
      case 'error':
        return 'text-red-800';
      case 'warning':
        return 'text-yellow-800';
      case 'info':
        return 'text-blue-800';
      default:
        return 'text-gray-800';
    }
  };

  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`${getBgColor(notification.type)} border rounded-lg shadow-lg p-4 fade-in flex items-start space-x-3`}
        >
          <div className="flex-shrink-0 mt-0.5">
            {getIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            {notification.title && (
              <h4 className={`text-sm font-semibold ${getTextColor(notification.type)} mb-1`}>
                {notification.title}
              </h4>
            )}
            <p className={`text-sm ${getTextColor(notification.type)}`}>
              {notification.message}
            </p>
          </div>
          <button
            onClick={() => dispatch(removeNotification(notification.id))}
            className={`flex-shrink-0 ${getTextColor(notification.type)} hover:opacity-70 transition-opacity`}
          >
            <HiXMark className="h-5 w-5" />
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationToast;

