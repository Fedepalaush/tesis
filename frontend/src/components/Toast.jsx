import React from "react";

const Toast = ({ message, onClose }) => {
  return (
    <div className="fixed bottom-6 right-6 bg-white border border-gray-300 shadow-xl rounded-xl px-4 py-3 z-50 flex items-center justify-between w-96">
      <div className="text-sm text-gray-800 flex items-center gap-2">
        <span role="img" aria-label="calendar">📅</span>
        {message}
      </div>
      <button
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700 text-sm font-bold ml-4"
      >
        ✕
      </button>
    </div>
  );
};

export default Toast;
