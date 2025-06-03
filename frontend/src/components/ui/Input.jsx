import React, { forwardRef } from 'react';
import { COMPONENT_THEMES, A11Y, ANIMATIONS } from '../../config/theme.config';

/**
 * Accessible input component with consistent styling and validation
 */
const Input = forwardRef(({
  label,
  id,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  helpText,
  fullWidth = true,
  size = 'md',
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${inputId}-error` : undefined;
  const helpTextId = helpText ? `${inputId}-help` : undefined;
  
  const describedBy = [
    ariaDescribedBy,
    errorId,
    helpTextId
  ].filter(Boolean).join(' ') || undefined;

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const theme = COMPONENT_THEMES.input.default;

  const baseClasses = `
    border rounded-lg transition-all duration-${ANIMATIONS.fast}
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:cursor-not-allowed disabled:opacity-50
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
  `;

  const stateClasses = error
    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-500 focus:border-red-500'
    : disabled
    ? 'border-gray-600 bg-gray-700 text-gray-400'
    : `border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 hover:border-gray-500`;

  const classes = `${baseClasses} ${stateClasses} ${className}`.trim();

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-300 mb-2"
        >
          {label}
          {required && (
            <span 
              className="text-red-400 ml-1" 
              aria-label="required"
              title="This field is required"
            >
              *
            </span>
          )}
        </label>
      )}
      
      <input
        ref={ref}
        id={inputId}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={classes}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      />
      
      {error && (
        <div 
          id={errorId}
          className="mt-1 text-sm text-red-400"
          role="alert"
          aria-live="polite"
        >
          {error}
        </div>
      )}
      
      {helpText && !error && (
        <div 
          id={helpTextId}
          className="mt-1 text-sm text-gray-400"
        >
          {helpText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
