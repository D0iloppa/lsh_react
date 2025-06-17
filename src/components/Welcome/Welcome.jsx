import React from 'react';

import { useNavigate } from 'react-router-dom';

import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import RotationDiv from '@components/RotationDiv';
import PopularVenue from '@components/PopularVenue';

import '@components/SketchComponents.css';
import './Welcome.css';

const Welcome = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  const navigate = useNavigate();

  // Popular venues 데이터
  const popularVenues = [
    {
      venueName: "KLUB ONE",
      description: "Premium entertainment with elite hostesses and vibrant atmosphere",
      rating: "4.9",
      location: "District 1, Ho Chi Minh City"
    },
    {
      venueName: "Elite Hostess Club",
      description: "Experience top-notch services with our elite hostesses",
      rating: "4.8",
      location: "District 3, Ho Chi Minh City"
    },
    {
      venueName: "Vibrant Lounge Bar",
      description: "Join us for a night full of fun and great vibes",
      rating: "4.7",
      location: "District 7, Ho Chi Minh City"
    }
  ];

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
    <div className="welcome-container max-w-md mx-auto bg-white min-h-screen">
      {/* 상단 회전 영역 */}
      <div className="rotation-section">
        <RotationDiv 
          interval={4000} 
          showIndicators={true}
          pauseOnHover={true}
          className="venue-rotation"
        >
          {popularVenues.map((venue, index) => (
            <PopularVenue
              key={index}
              venueName={venue.venueName}
              description={venue.description}
              rating={venue.rating}
              location={venue.location}
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
              </div>
              </div>
              
              <h2 className="brand-subtitle">All Girlsbars Here</h2>
              
              <p className="brand-description">
                Discover and book new bars and hostesses
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
       <div className="relative" style={{ marginTop: '1rem' }}>
          <HatchPattern opacity={0.3} />
          
          <SketchBtn 
            className="sketch-button" style={{ fontWeight: 'bold' , backgroundColor: '#f5ffed'}}
            onClick={onNextScreen}
          >
            EXPLORE NOW
          </SketchBtn>
        </div>
        <div className="relative" style={{ marginTop: '1rem' }}>
          <HatchPattern opacity={0.3} />
          
          <SketchBtn 
            className="sketch-button" style={{ fontWeight: 'bold' }}
            onClick={onCreateAccount}
          >
            CREATE AN ACCOUNT
          </SketchBtn>
        </div>
    </div>
    
  );
};

export default Welcome;