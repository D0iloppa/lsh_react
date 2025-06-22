// src/components/Welcome/ProgressIndicator.jsx
import React from 'react';

const ProgressIndicator = ({ 
  currentStep, 
  totalSteps, 
  className = "",
  showText = true,
  dotSize = "8px"
}) => {
  return (
    <>
      <style jsx="true">{`
        .progress-container {
          // margin-bottom: 1.5rem;
        }
        
        .progress-indicator {
          display: flex;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        
        .progress-dot {
          width: ${dotSize};
          height: ${dotSize};
          border-radius: 50%;
          background-color: #d1d5db;
          transition: background-color 0.3s ease;
        }
        
        .progress-dot.active {
          background-color: #374151;
        }
        
        .progress-dot.completed {
          background-color: #059669;
        }
        
        .progress-text {
          text-align: center;
          font-size: 0.875rem;
          color: #6b7280;
          transform: rotate(0.1deg);
        }
      `}</style>
      
      <div className={`progress-container ${className}`}>
        <div className="progress-indicator">
          {Array.from({ length: totalSteps }, (_, i) => (
            <div
              key={i}
              className={`progress-dot ${
                i === currentStep 
                  ? 'active' 
                  : i < currentStep 
                    ? 'completed' 
                    : ''
              }`}
            />
          ))}
        </div>
        {showText && (
          <p className="progress-text">
            {currentStep + 1} / {totalSteps}
          </p>
        )}
      </div>
    </>
  );
};

export default ProgressIndicator;