import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import SketchBtn from '@components/SketchBtn';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ProgressIndicator from './ProgressIndicator';
import { Weight } from 'lucide-react';

const Tutorial3 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {
  
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
       if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, []);


  return (



    <div className="tutorial-container max-w-md mx-auto bg-white min-h-screenp-6">

    {/* 진행 표시기 */}
    {/* <div className="content-area">
      <ProgressIndicator 
          currentStep={currentStep} 
          totalSteps={totalSteps} 
        />
    </div> */}


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
      <div className="mt-20">
        <ImagePlaceholder src={"/cdn/content/tuto-2.png"} className="w-full h-48" style={{ border: '1px solid #333', borderRadius: '5px'}} />
      </div>

      {/* Next Screen 버튼 */}
      <div className="relative" style={{ marginTop: '1rem' }}>
          {<HatchPattern opacity={0.8} />}
          
          <SketchBtn 
            className="sketch-button"  variant = 'event' 
            onClick={onNextScreen}
          >
            Enjoy Letan ton Sheriff!
          </SketchBtn>
          {/* <HatchPattern /> */}
        </div>
    </div>
  );
};

export default Tutorial3;