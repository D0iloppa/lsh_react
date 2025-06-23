import React from 'react';

export default function SketchTextarea({ 
  placeholder, 
  value, 
  onChange, 
  disabled = false,
  error,
  variant = 'default',
  className = '',
  style = {},
  rows = 3,
  cols,
  resize = 'vertical',
  ...props
}) {
  const getTextareaClassName = () => {
    const baseClass = 'sketch-textarea';
    const variantClass = `sketch-textarea--${variant}`;
    return `${baseClass} ${variantClass} ${className}`.trim();
  };

  const textareaStyle = {
    resize: resize,
    ...style
  };

  return (
    <div className="sketch-textarea-group">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={getTextareaClassName()}
        disabled={disabled}
        style={textareaStyle}
        rows={rows}
        cols={cols}
        {...props}
      />
      {error && (
        <div className="sketch-error-message">{error}</div>
      )}
    </div>
  );
}