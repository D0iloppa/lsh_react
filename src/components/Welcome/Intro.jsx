import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import InitFooter from '@components/InitFooter';
import '@components/SketchComponents.css';
import { useMsg } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

const Intro = ({ onNextScreen }) => {
  const { messages, isLoading, error, get, currentLang } = useMsg();

  useEffect(() => {
    window.scrollTo(0, 0);
    
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Intro Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
    }
  }, [messages, currentLang]);

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

  return (
    <>
      <style jsx>{`
        .intro-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          display: flex;
          flex-direction: column;
        }

        .brand-section {
          padding-top: 2rem;
          text-align: center;
        }

        .brand-content {
          padding: 0 1rem;
        }

        .brand-header {
          display: flex;
          justify-content: center;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .age-badge {
          font-size: 20px;
          margin-left: -8px;
        }

        .intro-image-section {
          padding: 2rem 1rem;
          display: flex;
          justify-content: center;
        }

        .intro-main-image {
          width: 100%;
          max-width: 320px;
          height: 200px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
        }

        .intro-title-section {
          text-align: center;
          padding: 0 1rem 2rem;
        }

        .main-title {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: #333;
          font-weight: 600;
          line-height: 1.4;
        }

        .intro-description-section {
          padding: 0 1rem;
          margin-bottom: 2rem;
        }

        .description {
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          line-height: 1.4;
          color: #555;
        }

        .features-list {
          text-align: left;
          font-size: 0.85rem;
          line-height: 1.6;
          color: #555;
        }

        .feature-item {
          margin-bottom: 0.5rem;
          padding-left: 0.5rem;
        }

        .feature-item:last-child {
          margin-bottom: 1rem;
        }

        .intro-enter-section {
          padding: 0 1rem 1rem;
          display: flex;
          justify-content: center;
        }

        .enter-button-wrapper {
          position: relative;
          width: 100%;
          max-width: 280px;
        }

        .enter-button {
          width: 100% !important;
          padding: 0.8rem !important;
          font-size: 1rem !important;
          font-weight: bold !important;
        }

        .age-verification {
          text-align: center;
          padding: 1rem;
          font-size: 0.75rem;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .warning-icon {
          font-size: 1rem;
        }

        .verification-text {
          line-height: 1.3;
        }

        /* 반응형 */
        @media (max-width: 480px) {
          .intro-container {
            max-width: 100%;
          }

          .brand-section {
            padding-top: 1.5rem;
          }

          .intro-image-section {
            padding: 1.5rem 1rem;
          }

          .intro-main-image {
            max-width: 280px;
            height: 180px;
          }

          .main-title {
            font-size: 1.1rem;
          }

          .description {
            font-size: 0.85rem;
          }

          .features-list {
            font-size: 0.8rem;
          }
        }

      `}</style>

      <div className="intro-container">
        
        {/* 브랜드 헤더 */}
        <div className="brand-section">
          <div className="brand-content">
            <div className="brand-header">
              <div className="logo-container">
                <CocktailIcon />
                <h1 className="sketch-title sketch-title--large">LeTanTon Sheriff</h1>
                <span className="age-badge">🔞</span>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 이미지 영역 */}
        <div className="intro-image-section">
          <SketchDiv className="intro-main-image">
            <HatchPattern opacity={0.1} />
            <div className="image-placeholder">
              <svg 
                width="80" 
                height="80" 
                viewBox="0 0 100 100" 
                stroke="#666" 
                strokeWidth="2"
                fill="none"
              >
                <line x1="20" y1="20" x2="80" y2="80" />
                <line x1="80" y1="20" x2="20" y2="80" />
              </svg>
            </div>
          </SketchDiv>
        </div>

       {/* 메인 타이틀 */}
       <div className="intro-title-section">
          <h2 className="main-title">
            {get('Intro.title')}
          </h2>
        </div>

        {/* 설명 섹션 */}
        <div className="intro-description-section">
          <p className="description">
            {get('Intro.description')}
          </p>
          
          {/* 기능 리스트 */}
          <div className="features-list">
            <div className="feature-item">
              {get('Intro.feature1')}
            </div>
            <div className="feature-item">
              {get('Intro.feature2')}
            </div>
            <div className="feature-item">
              {get('Intro.feature3')}
            </div>
            <div className="feature-item">
              {get('Intro.feature4')}
            </div>
            <div className="feature-item">
              {get('Intro.feature5')}
            </div>
          </div>
        </div>

         {/* Enter 버튼 */}
         <div className="intro-enter-section">
          <div className="enter-button-wrapper">
            <HatchPattern opacity={0.8} />
            <SketchBtn 
              className="sketch-button enter-button"  
              variant="event" 
              onClick={onNextScreen}
            >
              {get('Intro.enterButton')}
            </SketchBtn>
          </div>
        </div>

        {/* 나이 확인 */}
        <div className="age-verification">
          <span className="warning-icon">⚠️</span>
          <span className="verification-text">{get('Intro.ageVerification')}</span>
        </div>

        {/* Footer */}
        <InitFooter 
          className="custom-footer"
          privacyHref="/privacy"
          termsHref="/terms"
        />

        <LoadingScreen 
          isVisible={isLoading} 
        />
      </div>
    </>
  );
};

export default Intro;