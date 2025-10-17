import React, { useState, useEffect, useRef  } from 'react';  // ⬅ useEffect 추가

import { useNavigate } from 'react-router-dom';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import RotationDiv from '@components/RotationDiv';
import PopularVenue from '@components/PopularVenue';
import '@components/SketchComponents.css';
import ImagePlaceholder from '@components/ImagePlaceholder';
import './Welcome.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';
import MessageFlag from '@components/MessageFlag';


const Welcome = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();    
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const videoRef = useRef(null); // 🎯 video 제어용 ref 추가

 
  useEffect(() => {
    window.scrollTo(0, 0);

    
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to  1111:', currentLang);
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
    navigate('/main');
  };

  const onCreateAccount = () => {
    navigate('/register');
  };

    const handleOpenTutorial = () => {
    if (videoRef.current) {
      videoRef.current.pause(); // 🎯 튜토리얼 열릴 때 영상 멈춤
    }
    setIsVideoOpen(true);
  };

  const handleCloseTutorial = () => {
    if (videoRef.current) {
      videoRef.current.play(); // 🎯 닫을 때 다시 재생
    }
    setIsVideoOpen(false);
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
     <div 
        className="video-section" 
        style={{ 
          position: 'relative', 
          marginBottom: '20px', 
          marginTop: '20px', 
          maxHeight: '300px', // 세로 최대 높이 고정
          overflow: 'hidden', // 넘치면 잘리게
          borderRadius: '12px',
          width:'95%',
          marginLeft:'2.5%'
        }}
      >
        <video 
          ref={videoRef} // 🎯 ref 연결
          src="/cdn/intro.mp4" 
          autoPlay 
          loop 
          playsInline 
          webkit-playsinline
          style={{ 
            width: '100%',   // 가로 화면 기준
            height: 'auto',  // 세로 비율 유지
            display: 'block',
            objectFit: 'cover'
          }}
        />
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
              
              <p className="brand-description">
                {get('Welcome1.1')}
              </p>
              <p className="description" style={{color:'#ca1212', margin: '0', textAlign: 'center', fontSize: '16px'}}>
                {get('Intro.description1')}
              </p>
            </div>
      </div>

      {/* 액션 버튼들 */}
      {/* <div className="action-buttons-section">
        <SketchDiv 
          className="action-btn explore-btn"
          variant="button"
          onClick={onNextScreen}
        >
          <HatchPattern opacity={0.15} />
          <span className="btn-text">EXPLORE NOW</span>
        </SketchDiv>
        
        <SketchDiv 
          className="action-btn create-account-btn"
          variant="button"
          onClick={onCreateAccount}
        >
          <HatchPattern opacity={0.15} />
          <span className="btn-text">CREATE AN ACCOUNT</span>
        </SketchDiv>
      </div> */}

         {/* 설명 섹션 */}
         <div className="intro-description-section">
          <p style={{marginTop: '3px'}}>
            {get('Intro.description2')}
          </p>
          
          {/* 기능 리스트 */}
          <div className="features-list">
            <div className="feature-item" style={{ color: 'rgb(202, 18, 18)', fontWeight: 'bold' }}>
              {get('Intro.feature11')}
            </div>
            <div className="feature-item">
              {get('Intro.feature12')}
            </div>
            <div className="feature-item">
              {get('Intro.feature13')}
            </div>
            <div className="feature-item">
              {get('Intro.feature14')}
            </div>
            <div className="feature-item">
              {get('Intro.feature15')}
            </div>
          </div>
        </div>


       <div 
  className="relative" 
  style={{ margin: '2rem', gap: '0.5rem' }}
>
  <div style={{ flex: 1 }}>
    <HatchPattern opacity={0.8} />
    <SketchBtn 
      className="sketch-button"  
      variant='event' 
      onClick={onExpore}
    >
      {get('Welcome1.2')}
    </SketchBtn>
  </div>

  <div style={{ flex: 1}}>
    <HatchPattern opacity={0.4} />
    <SketchBtn 
      className="sketch-button" style={{ 
        marginTop: '10px'
      }}
      onClick={handleOpenTutorial} 
    >
      {get('Welcome1.3')}
    </SketchBtn>
  </div>
</div>
        {isVideoOpen && (
  <div 
    className="video-modal" 
    style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 9999
    }}
  >
    <div style={{ position: 'relative', width: '90%', maxWidth: '600px' }}>
      {/* 닫기 버튼 */}
      <button 
        onClick={handleCloseTutorial} 
        style={{
          position: 'absolute',
          top: '-40px',
          right: '0',
          background: '#007bff',
          color: '#fff',
          border: 'none',
          padding: '8px 12px',
          borderRadius: '6px',
          cursor: 'pointer'
        }}
      >
        닫기
      </button>

      {/* 유튜브 iframe */}
      <iframe
        width="100%"
        height="315"
        src="https://www.youtube.com/embed/VpUULfYz9rY?autoplay=1"
        title="YouTube video player"
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
        allowFullScreen
      ></iframe>
    </div>
  </div>
)}


         {/* <InitFooter 
                    className="custom-footer"
                    privacyHref="/privacy"
                    termsHref="/terms"
                  /> */}
                   <LoadingScreen 
                             variant="cocktail"
                             loadingText="Loading..."
                             isVisible={isLoading} 
                           />


      <MessageFlag />
    </div>
    
  );
};

export default Welcome;