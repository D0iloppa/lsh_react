import React from 'react';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';

import ProgressIndicator from './ProgressIndicator';

// Tutorial2 메인 컴포넌트
const Tutorial2 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  return (
      <div className="tutorial-container">
      {/* 진행 표시기 */}
      <div className="content-area">
        <ProgressIndicator 
            currentStep={currentStep} 
            totalSteps={totalSteps} 
          />
      </div>

        <div className="content-area">
          <ImagePlaceholder />

          {/* 설명 텍스트 */}
          <p className="description-text">
            Use the map above to explore various nightlife venues in Ho Chi Minh City. 
            Click on a marker to learn more about each location and book your visit.
          </p>

          {/* Next Screen 버튼 */}
          <div className="next-button-container">
            <button 
              className="sketch-button"
              onClick={onNextScreen}
            >
              {isLast ? 'Get Started' : 'Next Screen'}
            </button>
            <HatchPattern opacity={0.4} />
          </div>
        </div>
      </div>
  );
};

export default Tutorial2;