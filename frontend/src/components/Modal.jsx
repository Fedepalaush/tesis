import React, { useEffect, useRef } from "react";
import { Button } from "@tremor/react";

function Modal({ open, onClose, children, title, ariaLabel }) {
  const dialogRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);

  useEffect(() => {
    if (open) {
      // Focus management when modal opens
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements?.length > 0) {
        firstFocusableRef.current = focusableElements[0];
        lastFocusableRef.current = focusableElements[focusableElements.length - 1];
        firstFocusableRef.current?.focus();
      }

      // Trap focus within modal
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
        
        if (e.key === 'Tab') {
          if (e.shiftKey) {
            // Shift + Tab
            if (document.activeElement === firstFocusableRef.current) {
              e.preventDefault();
              lastFocusableRef.current?.focus();
            }
          } else {
            // Tab
            if (document.activeElement === lastFocusableRef.current) {
              e.preventDefault();
              firstFocusableRef.current?.focus();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';

      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'unset';
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label={ariaLabel || title || "Modal dialog"}
    >
      <div 
        ref={dialogRef}
        className="bg-white rounded-lg w-100 p-6 max-h-[90vh] overflow-y-auto focus:outline-none"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {title && (
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-900" id="modal-title">
              {title}
            </h2>
          </div>
        )}
        <div className="text-center">
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
