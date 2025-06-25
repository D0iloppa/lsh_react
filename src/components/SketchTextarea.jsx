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
    <>
      <style jsx="true">{`
        .sketch-textarea-group {
          width: 100%;
          position: relative;
        }

        .sketch-textarea {
          width: 100%;
          padding: 12px 16px;
          border-radius: 8px;
          background-color: white;
          font-size: 0.95rem;
          line-height: 1.4;
          color: #1f2937;
          transition: all 0.2s ease;
          box-sizing: border-box;
          outline: none;
          transform: rotate(-0.1deg);
        }

        .sketch-textarea:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
          transform: rotate(0deg);
        }

        .sketch-textarea:hover:not(:focus) {
          border-color: #4b5563;
          transform: rotate(0.05deg);
        }

        .sketch-textarea:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .sketch-textarea::placeholder {
          color: #9ca3af;
          font-style: italic;
        }

        .sketch-textarea--default {
          /* 기본 스타일 */
        }

        .sketch-textarea--primary {
          border-color: #3b82f6;
        }

        .sketch-textarea--secondary {
          border-color: #6b7280;
        }

        .sketch-error-message {
          color: #ef4444;
          font-size: 0.85rem;
          margin-top: 4px;
          transform: rotate(-0.1deg);
          font-family: BMHanna, "Comic Sans MS", cursive, sans-serif;
        }

        @media (max-width: 480px) {
          .sketch-textarea {
            padding: 10px 14px;
            font-size: 0.9rem;
          }
        }
      `}</style>
      
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
    </>
  );
}