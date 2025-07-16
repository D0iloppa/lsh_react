import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import { useNavigate } from 'react-router-dom';
import { Ban} from 'lucide-react';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import RotationDiv from '@components/RotationDiv';
import PopularVenue from '@components/PopularVenue';
import ProgressIndicator from './ProgressIndicator';
import InitFooter from '@components/InitFooter';
import '@components/SketchComponents.css';
import './Welcome.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';
import ImagePlaceholder from '@components/ImagePlaceholder';

const Welcome = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();    

  useEffect(() => {
    window.scrollTo(0, 0);

    
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    
  }, [messages, currentLang]);




  const navigate = useNavigate();

  // Popular venues 데이터
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

  const onExpore = () => {
    navigate('/login');
  };

  const onCreateAccount = () => {
    navigate('/register');
  };



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
    <div className="welcome-container max-w-md mx-auto bg-white">


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
      <div className="brand-section">
        <div className="brand-content">
              <div className="brand-header">
               <div className="logo-container">
                <CocktailIcon />
                <h1 className="sketch-title sketch-title--large">LeTanTon Sheriff</h1>
                <span style={{ fontSize: '20px',  marginLeft: '-8px' }}><ImagePlaceholder src="/cdn/age.png" style={{lineHeight: '0.5', marginLeft: '5px', width:'26px'}}/></span>
              </div>
              </div>
              
              {/* <h2 className="brand-subtitle">All Girlsbars Here</h2> */}
              
              <p className="brand-description">
                Welcome to Le Thanh Ton Sheriff Manager Portal. Manage your reservations, staff, and promotions easily.
              </p>
            </div>
      </div>




       <div className="relative" style={{ marginTop: '1rem' }}>
          <HatchPattern opacity={0.8} />
          
          <SketchBtn 
            className="sketch-button"  
            variant = 'event' 
            onClick={onExpore}
          >
            {'STAFF'}
          </SketchBtn>
        </div>
        <div className="relative" style={{ marginTop: '1rem', marginBottom: '1rem' }}>
          <HatchPattern opacity={0.4} />
          
          <SketchBtn 
            className="sketch-button" style={{ fontWeight: 'bold' }}
            onClick={onCreateAccount}
          >
            {'MANAGER'}
          </SketchBtn>
        </div>

         <InitFooter 
                    className="custom-footer"
                    privacyHref="/privacy"
                    termsHref="/terms"
                  />
                    <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>

    </div>
    
  );
};

export default Welcome;