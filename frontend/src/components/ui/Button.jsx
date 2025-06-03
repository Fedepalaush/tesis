import React, { forwardRef } from 'react';
import { COMPONENT_THEMES, A11Y, ANIMATIONS } from '../../config/theme.config';

/**
 * Accessible button component with consistent styling and behavior
 */
const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  const variants = {
    primary: COMPONENT_THEMES.button.primary,
    secondary: COMPONENT_THEMES.button.secondary,
    success: COMPONENT_THEMES.button.success,
    error: COMPONENT_THEMES.button.error,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const theme = variants[variant];
  const isDisabled = disabled || loading;

  const baseClasses = `
    inline-flex items-center justify-center font-medium rounded-lg
    transition-all duration-${ANIMATIONS.fast}
    focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900
    disabled:cursor-not-allowed
    ${fullWidth ? 'w-full' : ''}
    ${sizes[size]}
  `;

  const variantClasses = isDisabled
    ? `bg-gray-600 text-gray-400 cursor-not-allowed`
    : `bg-[${theme.bg}] hover:bg-[${theme.bgHover}] text-[${theme.text}] focus:ring-blue-500`;

  const classes = `${baseClasses} ${variantClasses} ${className}`.trim();

  const handleClick = (e) => {
    if (isDisabled) {
      e.preventDefault();
      return;
    }
    onClick?.(e);
  };

  const buttonContent = (
    <>
      {loading && (
        <svg 
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle 
            className="opacity-25" 
            cx="12" 
            cy="12" 
            r="10" 
            stroke="currentColor" 
            strokeWidth="4"
          ></circle>
          <path 
            className="opacity-75" 
            fill="currentColor" 
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {children}
    </>
  );

  return (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={isDisabled}
      onClick={handleClick}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={isDisabled}
      {...props}
    >
      {buttonContent}
    </button>
  );
});

Button.displayName = 'Button';

export default Button;
