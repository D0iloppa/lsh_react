import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingScreen from '@components/LoadingScreen';
import ThemeManager from '@utils/ThemeManager';
import './Welcome.css';

const Welcome = ({ onNextScreen, currentStep, totalSteps, isLast }) => {
  const navigate = useNavigate();

  const onExpore = () => {
    navigate('/main');
  };

  const [showLogo, setShowLogo] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    // 1초 후 자동 이동
    const timer = setTimeout(() => {
      ThemeManager.resetTheme();
      onExpore();
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  if (showLogo) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#fff',
        }}
      >
        {/* 중앙 로고 이미지 */}
        <img
          src="/cdn/content/logo.png"
          alt="LeTanTon Sheriff"
          style={{
            width: '80px',
            height: 'auto',
            marginBottom: '12px',
            animation: 'fadeIn 1s ease-in-out',
             borderRadius: '20px', // ✅ 이미지 모서리 둥글게
          }}
        />
        <p
          style={{
            fontFamily: 'EBGarmond, serif',
            fontSize: '18px',
            color: '#444',
            letterSpacing: '1px',
          }}
        >
        </p>

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
          `}
        </style>
      </div>
    );
  }

  // (필요 시 기존 페이지로 복귀)
  return (
    <div className="welcome-container max-w-md mx-auto bg-white">
      <LoadingScreen variant="cocktail" loadingText="Loading..." isVisible={true} />
    </div>
  );
};

export default Welcome;
