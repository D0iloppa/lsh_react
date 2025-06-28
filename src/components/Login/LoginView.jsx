import React, { useState, useEffect } from 'react';

import SketchDiv from '@components/SketchDiv';
import LoginForm from './LoginForm';
import ImagePlaceholder from '@components/ImagePlaceholder';
import './LoginView.css';
import '@components/SketchComponents.css';
import InitFooter from '@components/InitFooter';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';
import RotationDiv from '@components/RotationDiv';
import PopularVenue from '@components/PopularVenue';

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

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';


export default function LoginView() {

  const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded23:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);


  const popularVenues = [
    {
      venueName: "KLUB ONE",
      description: "Premium entertainment with elite hostesses and vibrant atmosphere",
      rating: "4.9",
      location: "District 1, Ho Chi Minh City",
      image:'/cdn/content/mang.png'
    },
    {
      venueName: "Elite Hostess Club",
      description: "Experience top-notch services with our elite hostesses",
      rating: "4.8",
      location: "District 3, Ho Chi Minh City",
      image:'/cdn/content/qui.png'
    },
    {
      venueName: "Vibrant Lounge Bar",
      description: "Join us for a night full of fun and great vibes",
      rating: "4.7",
      location: "District 7, Ho Chi Minh City",
      image:'/cdn/content/skybar.png'
    }
  ];


  return (
    <div className="login-container">
      <div className="login-wrapper">

        {/* Header */}
        <header className="login-header" style={{display: 'none'}}>
          <div className="logo-container">
            <CocktailIcon />
            <h1 className="sketch-title sketch-title--large">LeTanTon Sheriff</h1>
            <span style={{ fontSize: '20px',  marginLeft: '-8px' }}><ImagePlaceholder src="/cdn/age.png" style={{lineHeight: '0.5', marginLeft: '5px', width:'26px'}}/></span>
          </div>
          <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '10px' }}>
            <span>{get('manager.login.description.1')}</span>
          </div>
        </header>

          {/* 상단 회전 영역 */}
          <div className="rotation-section">
            <RotationDiv 
              interval={4000} 
              showIndicators={true}
              pauseOnHover={true}
              autoLoop={true}  // 이 옵션 추가 (기본값: true)
              className="venue-rotation"
            >
              {popularVenues.map((venue, index) => (
                <PopularVenue
                  key={index}
                  venueName={venue.venueName}
                  description={venue.description}
                  rating={venue.rating}
                  location={venue.location}
                  image={venue.image}
                />
              ))}
            </RotationDiv>
          </div>

                {/* 브랜드 섹션 */}
      <div className="brand-section" 
        style={{
          paddingBottom: '1.0rem',    
          marginTop: '-4rem',
        }}>
        <div className="brand-content">
              <div className="brand-header">
               <div className="logo-container">
                <CocktailIcon />
                <h1 className="sketch-title sketch-title--large">LeTanTon Sheriff</h1>
                <span style={{ fontSize: '20px',  marginLeft: '-8px' }}><ImagePlaceholder src="/cdn/age.png" style={{lineHeight: '0.5', marginLeft: '5px', width:'26px'}}/></span>
              </div>
              </div>
              <div style={{ textAlign: 'center', fontSize: '0.875rem', color: '#6b7280', marginTop: '10px' }}>
                <span>{get('manager.login.description.1')}</span>
              </div>
              
              {/* <h2 className="brand-subtitle">All Girlsbars Here</h2> */}
              
              <p className="brand-description" style={{marginTop: '0.875rem'}}>
                Welcome to Le Thanh Ton Sheriff Manager Portal. Manage your reservations, staff, and promotions easily.
              </p>
            </div>
      </div>

      {/* Login Form */}
      <div
        style={{
          paddingLeft: '1.0rem',
          paddingRight: '1.0rem',
        }}
      >
        <LoginForm />
      </div>
      

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