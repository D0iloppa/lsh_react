import React from 'react';

const SketchBtn = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'medium',
  disabled = false,
  className = '',
  ...props 
}) => {
  return (
    <>
      <style jsx>{`

      .sketch-btn {
        width: 100%;
        padding: 0.75rem;
        background-color: #e5e7eb;
        color: #374151;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        border: 0.8px solid #666;
        cursor: pointer;
        font-size: 1rem;
        transition: background-color 0.2s;
        font-family: inherit;
        border-top-left-radius: 12px 7px;
        border-top-right-radius: 6px 14px;
        border-bottom-right-radius: 10px 5px;
        border-bottom-left-radius: 8px 11px;
        transform: rotate(0.3deg);
        box-sizing: border-box; /* 추가! */

        font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
      }
      
      .sketch-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
      
      .sketch-btn--secondary {
        background-color: transparent;
        color: #6b7280;
        border: none;
        text-transform: none;
        letter-spacing: normal;
        text-decoration: underline wavy #999;
        font-size: 0.875rem;
        padding: 0.25rem;
        transform: rotate(-0.2deg);
      }
      
      .sketch-btn--secondary:hover:not(:disabled) {
        color: #374151;
        background-color: transparent;
      }


        /* Variants */
        .sketch-btn.event {
          color: #1f2937;
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
        }


        .sketch-btn.primary {
          background-color: white;
          color: #1f2937;
        }

        .sketch-btn.secondary {
          background-color: #f3f4f6;
          color: #1f2937;
        }

        .sketch-btn.accent {
          background-color: #94fff9;
          color: #1f2937;
        }

        .sketch-btn.danger {
         background-color:rgba(243, 27, 27, 0.66);
          color:rgb(255, 255, 255);
          // box-shadow: 2px 2px 0px rgb(255, 73, 73);
        }

        .sketch-btn.danger:hover:not(:disabled) {
          box-shadow: 3px 3px 0px rgb(255, 183, 183);
        }

        .sketch-btn.danger:active:not(:disabled) {
          box-shadow: 1px 1px 0px rgb(255, 183, 183);
        }

        /* Sizes */
        .sketch-btn.small {
          padding: 0.5rem 0.75rem;
          font-size: 0.8rem;
        }

        .sketch-btn.medium {
          padding: 0.75rem 1rem;
          font-size: 0.9rem;
        }

        .sketch-btn.large {
          padding: 1rem 1.5rem;
          font-size: 1rem;
        }

        .sketch-btn.full-width {
          width: 100%;
          text-align: center;
        }

        /* Special rotation variants */
        .sketch-btn.rotate-left {
          transform: rotate(-1deg);
        }

        .sketch-btn.rotate-left:hover:not(:disabled) {
          transform: rotate(-1deg) scale(1.02);
        }

        .sketch-btn.rotate-left:active:not(:disabled) {
          transform: rotate(-1deg) scale(0.98);
        }

        .sketch-btn.rotate-right {
          transform: rotate(1deg);
        }

        .sketch-btn.rotate-right:hover:not(:disabled) {
          transform: rotate(1deg) scale(1.02);
        }

        .sketch-btn.rotate-right:active:not(:disabled) {
          transform: rotate(1deg) scale(0.98);
        }

        .sketch-btn.no-rotate {
          transform: rotate(0deg);
        }

        .sketch-btn.no-rotate:hover:not(:disabled) {
          transform: rotate(0deg) scale(1.02);
        }

        .sketch-btn.no-rotate:active:not(:disabled) {
          transform: rotate(0deg) scale(0.98);
        }
      `}</style>
      
      <button 
        className={`sketch-btn ${variant} ${size} ${className}`}
        onClick={onClick}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    </>
  );
};

export default SketchBtn;