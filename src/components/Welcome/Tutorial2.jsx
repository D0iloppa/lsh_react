import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from '@components/LoadingScreen';


// Tutorial2 메인 컴포넌트
const Tutorial2 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

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
      <div className="tutorial-container">
      {/* 진행 표시기 */}
      <div className="pi-div">
          <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
      </div>

        <div className="">
          <ImagePlaceholder  src={"/cdn/tuto2.png"}  style={{ border: '1px solid #333', borderRadius: '5px',height: '425px'}}/>

          {/* 설명 텍스트 */}
          <p className="description-text">
            { get('Tutorial2.1') }
            { get('Tutorial2.2') }
          </p>

          {/* Next Screen 버튼 */}
          <div className="relative" style={{ marginTop: '1rem' }}>
            <HatchPattern opacity={0.3} />
            
            <SketchBtn 
              className="sketch-button"
              onClick={onNextScreen}
            >
              { get("btn.next.1") }
            </SketchBtn>
           <LoadingScreen 
                     variant="cocktail"
                     loadingText="Loading..."
                     isVisible={isLoading} 
                   />
          </div>
        </div>
      </div>
  );
};

export default Tutorial2;