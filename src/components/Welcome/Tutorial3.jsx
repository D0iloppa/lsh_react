import React from 'react';

import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';

import ProgressIndicator from './ProgressIndicator';

const Tutorial3 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {
  return (



    <div className="max-w-md mx-auto bg-white min-h-screen border-4 border-gray-800 p-6">

    {/* 진행 표시기 */}
    <div className="content-area">
      <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />
    </div>


      <SketchDiv variant="container">
        <HatchPattern opacity={0.3} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <h3 className="welcome-title">
            Welcome to Our Venue Booking System
          </h3>
          <p className="welcome-description">
            Whether you're planning a night out or organizing an event,
            our platform allows you to effortlessly select the perfect venue,
            choose the right staff, and schedule your event at your convenience.
            Enjoy a seamless booking experience and make your occasion unforgettable!
          </p>
        </div>
      </SketchDiv>


      {/* 메인 이미지 */}
      <div className="mb-6">
        <ImagePlaceholder className="w-full h-48" />
      </div>

      {/* Next Screen 버튼 */}
      <div className="relative">
        <button
          className="sketch-button"
          onClick={onNextScreen}
        >
          Enjoy Letan ton Sheriff
        </button>
        <HatchPattern />
      </div>
    </div>
  );
};

export default Tutorial3;