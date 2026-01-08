import { ButtonHTMLAttributes, forwardRef } from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ children, variant = 'primary', size = 'md', isLoading, className = '', disabled, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variants = {
      primary: 'bg-gradient-to-r from-gray-700 via-gray-600 to-gray-700 text-white hover:from-gray-600 hover:via-gray-500 hover:to-gray-600 focus:ring-gray-500 shadow-lg shadow-gray-900/50 border border-gray-600',
      secondary: 'bg-gradient-to-r from-gray-800 to-gray-900 text-gray-200 hover:from-gray-700 hover:to-gray-800 focus:ring-gray-600 border border-gray-700',
      outline: 'border-2 border-gray-600 text-gray-300 hover:bg-gray-800 hover:border-gray-500 focus:ring-gray-600',
      ghost: 'text-gray-300 hover:bg-gray-800 focus:ring-gray-600',
      danger: 'bg-gradient-to-r from-red-900 to-red-800 text-red-200 hover:from-red-800 hover:to-red-700 focus:ring-red-700 border border-red-700',
    };
    
    const sizes = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-base',
      lg: 'px-6 py-3 text-lg',
    };

    return (
      <motion.button
        ref={ref}
        whileHover={disabled || isLoading ? {} : { scale: 1.02 }}
        whileTap={disabled || isLoading ? {} : { scale: 0.98 }}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...(props as any)}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Loading...
          </>
        ) : children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
