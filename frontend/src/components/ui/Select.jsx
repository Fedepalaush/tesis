import React, { forwardRef } from 'react';
import { COMPONENT_THEMES, ANIMATIONS } from '../../config/theme.config';

/**
 * Accessible select component with consistent styling
 */
const Select = forwardRef(({
  label,
  id,
  value,
  onChange,
  onBlur,
  onFocus,
  disabled = false,
  required = false,
  error,
  helpText,
  placeholder = "Select an option",
  options = [],
  fullWidth = true,
  size = 'md',
  className = '',
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = error ? `${selectId}-error` : undefined;
  const helpTextId = helpText ? `${selectId}-help` : undefined;
  
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

  const baseClasses = `
    border rounded-lg transition-all duration-${ANIMATIONS.fast}
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:cursor-not-allowed disabled:opacity-50
    appearance-none bg-no-repeat bg-right
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
  `;

  const stateClasses = error
    ? 'border-red-500 bg-red-50 text-red-900 focus:ring-red-500 focus:border-red-500'
    : disabled
    ? 'border-gray-600 bg-gray-700 text-gray-400'
    : `border-gray-600 bg-gray-800 text-white focus:ring-blue-500 focus:border-blue-500 hover:border-gray-500`;

  const classes = `${baseClasses} ${stateClasses} ${className}`.trim();

  // Custom dropdown arrow using CSS
  const selectStyle = {
    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
    backgroundPosition: 'right 0.5rem center',
    backgroundSize: '1.5em 1.5em',
    paddingRight: '3rem'
  };

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={selectId}
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
      
      <select
        ref={ref}
        id={selectId}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        disabled={disabled}
        required={required}
        className={classes}
        style={selectStyle}
        aria-describedby={describedBy}
        aria-invalid={error ? 'true' : 'false'}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        
        {options.map((option, index) => (
          <option 
            key={typeof option === 'object' ? option.value : option}
            value={typeof option === 'object' ? option.value : option}
            disabled={typeof option === 'object' ? option.disabled : false}
          >
            {typeof option === 'object' ? option.label : option}
          </option>
        ))}
      </select>
      
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

Select.displayName = 'Select';

export default Select;
