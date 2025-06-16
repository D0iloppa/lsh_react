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
          cursor: pointer;
          position: relative;
          transition: all 0.2s ease;
          outline: none;
          display: inline-block;
          text-decoration: none;
          transform: rotate(-0.5deg);
        }

        .sketch-btn:hover:not(:disabled) {
          transform: rotate(-0.5deg) scale(1.02);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .sketch-btn:active:not(:disabled) {
          transform: rotate(-0.5deg) scale(0.98);
          box-shadow: 1px 1px 0px #1f2937;
        }

        .sketch-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background-color: #f3f4f6;
          color: #9ca3af;
        }

        /* Variants */
        .sketch-btn.primary {
          background-color: white;
          color: #1f2937;
        }

        .sketch-btn.secondary {
          background-color: #f3f4f6;
          color: #1f2937;
        }

        .sketch-btn.accent {
          background-color: #fbbf24;
          color: #1f2937;
        }

        .sketch-btn.danger {
          background-color: #ef4444;
          color: white;
          border-color: #dc2626;
          box-shadow: 2px 2px 0px #dc2626;
        }

        .sketch-btn.danger:hover:not(:disabled) {
          box-shadow: 3px 3px 0px #dc2626;
        }

        .sketch-btn.danger:active:not(:disabled) {
          box-shadow: 1px 1px 0px #dc2626;
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