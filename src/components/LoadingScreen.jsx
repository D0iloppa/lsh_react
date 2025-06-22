import React from 'react';
import { Loader2, Coffee, Heart } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';

const LoadingScreen = ({ 
  isVisible = true,
  loadingText = "Loading...",
  subText = "",
  variant = "default", // "default", "coffee", "heart", "simple"
  opacity = 0.95,
  showLogo = true
}) => {
  
  if (!isVisible) return null;

  const getLoadingIcon = () => {
    switch (variant) {
      case "coffee":
        return <Coffee size={32} className="loading-icon coffee-icon" />;
      case "heart":
        return <Heart size={32} className="loading-icon heart-icon" />;
      case "simple":
        return <div className="simple-spinner"></div>;
      default:
        return <Loader2 size={32} className="loading-icon spinner-icon" />;
    }
  };

  return (
    <>
      <style jsx="true">{`
        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, ${opacity});
          backdrop-filter: blur(2px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .loading-content {
          display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 2rem;
    /* background: white; */
    /* border: 2px solid #333; */
    /* border-radius: 15px; */
    /* box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1); */
    position: relative;
    overflow: hidden;
    max-width: 300px;
    transform: rotate(-0.5deg);
        }

        .loading-logo {
          font-size: 1.5rem;
          font-weight: bold;
          color: #374151;
          margin-bottom: 1.5rem;
          transform: rotate(0.8deg);
        }

        .loading-icon-container {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 60px;
        }

        .loading-icon {
          color: #374151;
        }

        .spinner-icon {
          animation: spin 1s linear infinite;
        }

        .coffee-icon {
          animation: bounce 1.5s ease-in-out infinite;
          color: #8B4513;
        }

        .heart-icon {
          animation: heartbeat 1.2s ease-in-out infinite;
          color: #f43f5e;
        }

        .simple-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #374151;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .loading-text {
            margin-left: 18px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          transform: rotate(-0.3deg);
        }

        .loading-subtext {
          font-size: 0.9rem;
          color: #6b7280;
          line-height: 1.4;
          transform: rotate(0.2deg);
        }

        .loading-dots {
          display: inline-block;
          animation: dots 1.5s infinite;
        }

        /* 애니메이션 */
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.2);
          }
        }

        @keyframes dots {
          0%, 20% {
            opacity: 0;
          }
          50% {
            opacity: 1;
          }
          80%, 100% {
            opacity: 0;
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px) rotate(-0.5deg);
          }
          to {
            opacity: 1;
            transform: translateY(0) rotate(-0.5deg);
          }
        }

        .loading-content {
          animation: fadeIn 0.3s ease-out;
        }

        /* 반응형 */
        @media (max-width: 480px) {
          .loading-content {
            margin: 1rem;
            padding: 1.5rem;
            max-width: calc(100vw - 2rem);
          }
          
          .loading-logo {
            font-size: 1.3rem;
          }
          
          .loading-text {
            font-size: 1rem;
          }
        }
      `}</style>

      <div className="loading-overlay">
        <div className="loading-content">
          <HatchPattern opacity={0.1} />
          
          {/* {showLogo && (
            <div className="loading-logo">
              Le Thanh Ton Sheriff
            </div>
          )} */}
          
          <div className="loading-icon-container">
            {getLoadingIcon()}
          </div>
          
          <div className="loading-text">
            {/* {loadingText}
            <span className="loading-dots"><svg width="16" height="16" viewBox="0 0 24 24" className="cocktail-icon">
                <path d="M5 7V5a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v2l-6 6v8h2a1 1 0 0 1 0 2H9a1 1 0 0 1 0-2h2v-8L5 7z" fill="currentColor"/>
                <circle cx="12" cy="4" r="1" fill="#3b82f6"/>
              </svg>...</span> */}
          </div>
          
          {subText && (
            <div className="loading-subtext">
              {subText}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;