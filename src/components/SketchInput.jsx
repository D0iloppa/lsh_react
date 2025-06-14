import React from 'react';

export default function SketchInput({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  error,
  variant = 'default',
  className = '',
  style = {},
  ...props
}) {
  const getInputClassName = () => {
    const baseClass = 'sketch-input';
    const variantClass = `sketch-input--${variant}`;
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  return (
    <div className="sketch-input-group">
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={getInputClassName()}
        disabled={disabled}
        style={style}
        {...props}
      />
      {error && (
        <div className="sketch-error-message">{error}</div>
      )}
    </div>
  );
}