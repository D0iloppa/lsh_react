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
  as = 'input',
  rows = 3,
  ...props
}) {
  const getInputClassName = () => {
    const baseClass = 'sketch-input';
    const variantClass = `sketch-input--${variant}`;
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  const inputProps = {
    placeholder,
    value,
    onChange,
    className: getInputClassName(),
    disabled,
    style,
    ...props
  };

  return (
    <div className="sketch-input-group">
      {as === 'textarea' ? (
        <textarea
          {...inputProps}
          rows={rows}
        />
      ) : (
        <input
          type={type}
          {...inputProps}
        />
      )}
      {error && (
        <div className="sketch-error-message">{error}</div>
      )}
    </div>
  );
}