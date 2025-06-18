import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';

import ProgressIndicator from './ProgressIndicator';

// Tutorial2 메인 컴포넌트
const Tutorial2 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  return (
      <div className="tutorial-container">
      {/* 진행 표시기 */}
      {/* <div className="content-area">
        <ProgressIndicator 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />
      </div> */}

        <div className="">
          <ImagePlaceholder  src={"/cdn/map-1.png"}  style={{ border: '1px solid #333', borderRadius: '5px',height: '685px'}}/>

          {/* 설명 텍스트 */}
          <p className="description-text">
            Use the map above to explore various nightlife venues in Ho Chi Minh City. 
            Click on a marker to learn more about each location and book your visit.
          </p>

          {/* Next Screen 버튼 */}
          <div className="relative" style={{ marginTop: '1rem' }}>
            <HatchPattern opacity={0.3} />
            
            <SketchBtn 
              className="sketch-button"
              onClick={onNextScreen}
            >
              {isLast ? 'Get Started' : 'Next Screen'}
            </SketchBtn>
          </div>
        </div>
      </div>
  );
};

export default Tutorial2;