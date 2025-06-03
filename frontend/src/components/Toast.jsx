import React, { useEffect, useRef } from "react";

const Toast = ({ message, onClose, type = "info", autoClose = true, duration = 5000 }) => {
  const toastRef = useRef(null);

  useEffect(() => {
    // Announce the toast to screen readers
    if (toastRef.current) {
      toastRef.current.focus();
    }

    // Auto close if enabled
    if (autoClose && onClose) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return { icon: '✓', label: 'success' };
      case 'error':
        return { icon: '✕', label: 'error' };
      case 'warning':
        return { icon: '⚠', label: 'warning' };
      default:
        return { icon: 'ℹ', label: 'information' };
    }
  };

  const { icon, label } = getIcon();

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'border-green-300 bg-green-50 text-green-800';
      case 'error':
        return 'border-red-300 bg-red-50 text-red-800';
      case 'warning':
        return 'border-yellow-300 bg-yellow-50 text-yellow-800';
      default:
        return 'border-gray-300 bg-white text-gray-800';
    }
  };

  return (
    <div 
      ref={toastRef}
      className={`fixed bottom-6 right-6 border shadow-xl rounded-xl px-4 py-3 z-50 flex items-center justify-between w-96 ${getColorClasses()}`}
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      tabIndex={-1}
    >
      <div className="text-sm flex items-center gap-2">
        <span role="img" aria-label={label}>
          {icon}
        </span>
        <span>{message}</span>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="text-current hover:opacity-70 text-sm font-bold ml-4 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-current rounded"
          aria-label="Cerrar notificación"
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Toast;
