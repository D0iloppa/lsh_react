import React from 'react';

import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';


import ProgressIndicator from './ProgressIndicator';


import InfoCard from '@components/InfoCard'

import '@components/SketchComponents.css';

const Tutorial1 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  return (
  


    <div className="max-w-md mx-auto bg-white min-h-screen border-4 border-gray-800 p-6">


    {/* 진행 표시기 */}
    <div className="content-area">
      <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />
    </div>


      {/* 메인 이미지 */}
      <div className="mb-6">
        <ImagePlaceholder className="w-full h-48" />
      </div>

      {/* 제목 */}
      <h1 className="sketch-title sketch-title--large">
        Welcome to Le Thanh Ton Sheriff!
      </h1>

      {/* 설명 텍스트 */}
      <p className="sketch-description text-center text-gray-600 leading-relaxed mb-8 transform rotate-1">
        Discover the best venues and hostesses in Ho Chi Minh 
        City. Easy booking, real-time info, and exclusive 
        promotions await you.
      </p>

      {/* Elite Hostess Club 카드 */}
      <InfoCard 
         title="Elite Hostess Club"
         description="Experience top-notch services with our elite hostesses."
         titleClassName="transform rotate-1"
         descriptionClassName="transform rotate-1"
         className="mb-4"
      />


      <InfoCard 
        title="Vibrant Lounge Bar"
        description="Join us for a night full of fun and great vibes."
        titleClassName="transform -rotate-1"
        descriptionClassName="transform -rotate-1"
        className="mb-8"
      />

      {/* Next Screen 버튼 */}
      <div className="relative">
        <button 
          className="sketch-button"
          onClick={onNextScreen}
        >
          Next Screen
        </button>
        {/* <HatchPattern /> */}
      </div>
    </div>
  );
};

export default Tutorial1;