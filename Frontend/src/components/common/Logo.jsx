import React, { forwardRef } from 'react';

/**
 * Centralized Logo Component
 * Usage: <Logo className="h-8 w-auto" />
 * Supports ref for animations
 */
const Logo = forwardRef(({ className = "h-8 w-auto", ...props }, ref) => {
  return (
    <img
      ref={ref}
      src="/logo.png"
      alt="GrooAgri"
      className={`${className} object-contain`}
      {...props}
    />
  );
});

Logo.displayName = 'Logo';

export default Logo;
