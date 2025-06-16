import React from 'react';

import { useNavigate } from 'react-router-dom';

import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
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

  return (
    <div className="max-w-md mx-auto bg-white min-h-screen border-4 border-gray-800">
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
                <span className="brand-icon">🍸</span>
                <h1 className="brand-title">LeTanTon Sheriff</h1>
              </div>
              
              <h2 className="brand-subtitle">All Girlsbars Here</h2>
              
              <p className="brand-description">
                Discover and book new bars and hostesses
              </p>
            </div>
      </div>

      {/* 액션 버튼들 */}
      <div className="action-buttons-section">
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
      </div>
    </div>
  );
};

export default Welcome;