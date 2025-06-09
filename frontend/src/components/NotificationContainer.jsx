import React from 'react';
import {
  XMarkIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { useNotifications } from '../contexts/NotificationContext';

const NotificationItem = ({ notification, onRemove }) => {
  console.log("Notification data:", notification);
  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'error':
        return <ExclamationCircleIcon className="h-5 w-5 text-red-400" />;
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400" />;
      case 'loading':
        return (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-400"></div>
        );
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-400" />;
    }
  };

  const getBackground = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-800 border-green-600';
      case 'error':
        return 'bg-red-800 border-red-600';
      case 'warning':
        return 'bg-yellow-800 border-yellow-600';
      case 'loading':
        return 'bg-blue-800 border-blue-600';
      default:
        return 'bg-gray-800 border-gray-600';
    }
  };

  // Función para mostrar texto o JSON string si es objeto
  const renderText = (text) => {
    if (typeof text === 'string') return text;
    try {
      return JSON.stringify(text, null, 2);
    } catch {
      return String(text);
    }
  };

  return (
    <div className={`max-w-sm w-full border rounded-lg shadow-lg p-4 ${getBackground()} text-white`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">{getIcon()}</div>
        <div className="ml-3 w-0 flex-1">
          {notification.title && (
            <p className="text-sm font-medium text-white">{renderText(notification.title)}</p>
          )}
          {notification.message && (
            <pre className="text-sm text-gray-300 whitespace-pre-wrap">{renderText(notification.message)}</pre>
          )}
        </div>
        {notification.type !== 'loading' && (
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="rounded-md inline-flex text-gray-400 hover:text-gray-300 focus:outline-none"
              onClick={() => onRemove(notification.id)}
            >
              <XMarkIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotifications();

  if (!notifications || notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;
