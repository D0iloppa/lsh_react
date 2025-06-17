import React from 'react';
import HatchPattern from '@components/HatchPattern';

const CocktailIcon = () => (
  <svg 
    width="30" 
    height="30" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="#333" 
    strokeWidth="1.5"
    style={{ transform: 'rotate(-1deg)' }}
  >
    <path 
      d="M6.2 4.8 L17.8 4.2 L12.1 12.5 Z" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
    />
    <line 
      x1="12" 
      y1="12.5" 
      x2="11.9" 
      y2="18.5" 
      strokeLinecap="round" 
    />
    <line 
      x1="9.2" 
      y1="18.8" 
      x2="14.8" 
      y2="18.2" 
      strokeLinecap="round" 
    />
    <path 
      d="M16.5 6.2 C17.8 5.8, 18.5 7.2, 17.2 8.1 C15.8 9.2, 17.1 10.8, 18.2 9.5"
      strokeLinecap="round" 
      fill="none" 
    />
  </svg>
);

const Header = ({ 
  className = "",
  hatchOpacity = 0.3,
  ...props 
}) => {
  return (
    <>
      <header className={`sketch-header ${className}`} {...props}>
        <HatchPattern opacity={hatchOpacity} />
        <div className="header-content">
          <div className="logo-container">
            <CocktailIcon />
            <h1 className="sketch-title sketch-title--large" style={{fontSize: '20px'}}>LeTanTon Sheriff</h1>
          </div>
        </div>
      </header>
      
      <style jsx>{`
        .sketch-header {
              background: #f8f8f8;
                border-bottom: 1px solid #333;
                padding: 16px 20px;
                position: relative;
                overflow: hidden;
        }
        
        .header-content {
          position: relative;
          z-index: 2;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .sketch-title {
          margin: 0;
          font-family: 'Courier New', monospace;
          color: #333;
          font-weight: bold;
        }
        
        .sketch-title--large {
          font-size: 24px;
          letter-spacing: 0.5px;
        }
        
        /* 반응형 */
        @media (max-width: 768px) {
          .sketch-header {
            margin-bottom: 16px;
          }
          
          .logo-container {
            gap: 8px;
          }
          
          .sketch-title--large {
            font-size: 20px;
          }
        }
        
        @media (max-width: 480px) {
          .sketch-title--large {
            font-size: 18px;
          }
          
          .logo-container {
            gap: 6px;
          }
        }
      `}</style>
    </>
  );
};

export default Header;