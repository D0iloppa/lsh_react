import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';


import ProgressIndicator from './ProgressIndicator';


import InfoCard from '@components/InfoCard'

import SketchBtn from '@components/SketchBtn';

import '@components/SketchComponents.css';


import ApiClient from '@utils/ApiClient';


import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';


const Tutorial1 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

   useEffect(() => {

    

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);



  return (
  


    <div className="tutorial-container max-w-md mx-auto bg-white min-h-screen p-6">


    {/* 진행 표시기 */}
    {/* <div className="content-area">
      <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />
    </div> */}


      {/* 메인 이미지 */}
      <div className="mb-6">
        <ImagePlaceholder 
           src={"/cdn/tuto1.png"}
          className="w-60 h-48"  style={{ border: '2px solid #333', borderRadius: '5px', height: '250px'}}/>
      </div>

      {/* 제목 */}
      <h1 className="sketch-title sketch-title--large" style={{ fontSize: '1.20rem', marginTop :'10px', marginBottom: '10px' }}>
        {
          get('Tutorial1.1')
          // messages?.['Tutorial1.1']?.msg_kr || 'Welcome to Le Thanh Ton Sheriff!'
        }
      </h1>

      {/* 설명 텍스트 */}
      <p className="sketch-description text-center text-gray-600 leading-relaxed mb-8 transform rotate-1"
        style={{ fontSize: '15px', marginTop :'5px', marginBottom: '20px' }}
      >
        {
          get('Tutorial1.2')
          // messages?.['Tutorial1.2']?.msg_kr || 'Welcome to Le Thanh Ton Sheriff!'
        }
      </p>

      {/* Elite Hostess Club 카드 */}
      <InfoCard 
         title={"Elite Hostess Club"}
         imageSrc="/cdn/content/mang.png"
         description={  get('Tutorial1.5') }
         titleClassName="transform rotate-1"
         descriptionClassName="transform rotate-1"
         imageSize="w-24 h-24"
         className="mb-4"
      />


      <InfoCard 
        title="Vibrant Lounge Bar"
        imageSrc="/cdn/content/qui.png"
        description={  get('Tutorial1.7') }
        titleClassName="transform -rotate-1"
        descriptionClassName="transform -rotate-1"
        className="mb-8"
      />

      {/* Next Screen 버튼 */}
      <div className="relative" style={{ marginTop: '1rem' }}>
        {<HatchPattern opacity={0.3} />}
        
        <SketchBtn 
          className="sketch-button"
          onClick={onNextScreen}
        >
          { get("btn.next.1") }
        </SketchBtn>
        {/* <HatchPattern /> */}
      </div>
    </div>
  );
};

export default Tutorial1;