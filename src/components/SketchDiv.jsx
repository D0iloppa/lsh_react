import React from 'react';

export default function SketchDiv({ 
  children, 
  variant = 'default',
  className = '',
  style = {},
  ...props 
}) {
  const getSketchClassName = () => {
    const baseClass = 'sketch-div';
    const variantClass = `sketch-div--${variant}`;
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  return (
    <div 
      className={getSketchClassName()}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}