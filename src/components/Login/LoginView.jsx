import React from 'react';
import SketchDiv from '@components/SketchDiv';
import LoginForm from './LoginForm';
import ImagePlaceholder from '@components/ImagePlaceholder';
import './LoginView.css';
import '@components/SketchComponents.css';
import InitFooter from '@components/InitFooter';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';

// 칵테일 아이콘 컴포넌트
const CocktailIcon = () => (
  <svg 
    width="24" 
    height="24" 
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

export default function LoginView() {
  return (
    <div className="login-container">
      <div className="login-wrapper">
        {/* Header */}
        <header className="login-header">
          <div className="logo-container">
            <CocktailIcon />
            <h1 className="sketch-title sketch-title--large">LeTanTon Sheriff</h1>
            <span style={{ fontSize: '20px',  marginLeft: '-8px' }}><ImagePlaceholder src="/cdn/age.png" style={{lineHeight: '0.5', marginLeft: '5px', width:'26px'}}/></span>
          </div>
        </header>

        {/* Login Form Container */}
        <SketchDiv variant="container">
          <HatchPattern opacity={0.3} />
          <LoginForm />
        </SketchDiv>

        {/* Footer */}
          
          <InitFooter 
            className="custom-footer"
            privacyHref="/privacy"
            termsHref="/terms"
          />


      </div>
    </div>
  );
}