import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';

import ProgressIndicator from './ProgressIndicator';


import InfoCard from '@components/InfoCard'

import SketchBtn from '@components/SketchBtn';

import '@components/SketchComponents.css';


import ApiClient from '@utils/ApiClient';


import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';


const Tutorial1 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [showIntroImage, setShowIntroImage] = useState(true);

   useEffect(() => {

    

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

   // 안내 이미지 클릭 시 사라지게 하는 함수
  const handleIntroImageClick = () => {
    setShowIntroImage(false);
  };

  return (
    <>
      {/* 초기 안내 이미지 오버레이 */}
      
      {/* 메인 튜토리얼 내용 */}
      <div className="tutorial-container max-w-md mx-auto bg-white min-h-screen p-6">
        {/* 진행 표시기 */}
        <div className="pi-div">
          <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
        </div>

        {/* 제목 */}
        <h1 className="sketch-title sketch-title--large" style={{ fontSize: '1.20rem', marginTop :'10px', marginBottom: '10px' }}>
          {get('Tutorial1.1')}
        </h1>

        {/* 설명 텍스트 */}
        <p className="sketch-description text-center text-gray-600 leading-relaxed mb-8 transform rotate-1"
          style={{ fontSize: '15px', marginTop :'5px', marginBottom: '20px' }}
        >
          {get('Tutorial1.2')}
        </p>

        {/* 메인 이미지 */}
        <div className="mb-6">
          <ImagePlaceholder  src={"/cdn/tuto-1.png"}  style={{ border: '1px solid #333', borderRadius: '5px',height: '465px'}}/>
        </div>


        {/* Elite Hostess Club 카드 */}
        

        {/* Next Screen 버튼 */}
        <div className="relative" style={{ marginTop: '20px' }}>
          <HatchPattern opacity={0.3} />
          
          <SketchBtn 
            className="sketch-button"
            onClick={onNextScreen}
          >
            {get("btn.next.1")}
          </SketchBtn>
          <LoadingScreen 
                    variant="cocktail"
                    loadingText="Loading..."
                    isVisible={isLoading} 
                  />
        </div>
      </div>
    </>
  );
};


export default Tutorial1;