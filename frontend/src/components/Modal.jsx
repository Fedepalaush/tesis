import React from "react";
import { Button } from "@tremor/react";

function Modal({ open, onClose, children }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg w-100 p-6">
        <div className="text-center">
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
