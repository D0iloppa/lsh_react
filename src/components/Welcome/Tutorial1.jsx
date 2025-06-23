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
      {showIntroImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={handleIntroImageClick}
        >
          <div className="relative">
            <div 
                className="absolute inset-0 bg-black bg-opacity-60 z-0"
                style={{
                  width: '100vw',
                  height: '100vh',
                  left: '-8px',
                  bottom: '8px',
                  background: 'rgb(0 0 0 / 65%)'
                }}
              ></div>
            <ImagePlaceholder 
              src="/cdn/tuto_info_2.png"
              className="w-full h-auto object-contain"
              style={{ 
                left: '-8px',
                bottom: '12px',
                width: '100vw',
                height: '100vh',
                borderRadius: '10px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                objectFit: 'contain',
                
              }}
            />
            
            {/* 클릭 안내 텍스트 (선택사항) */}
            <div 
              className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-center"
              style={{
                   color: 'white',
                    background: 'rgb(157 157 157 / 18%)',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    width: '184px',
                    top: '20px'
              }}
            >
              화면을 터치하여 계속하기   →
            </div>
          </div>
        </div>
      )}

      {/* 메인 튜토리얼 내용 */}
      <div className="tutorial-container max-w-md mx-auto bg-white min-h-screen p-6">
        {/* 진행 표시기 */}
        <div className="pi-div">
          <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
        </div>

        {/* 메인 이미지 */}
        <div className="mb-6">
          <ImagePlaceholder 
             src={"/cdn/tuto1.png"}
            className="w-60 h-48"  
            style={{ border: '2px solid #333', borderRadius: '5px', height: '190px'}}
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

        {/* Elite Hostess Club 카드 */}
        <InfoCard 
           title={"Elite Hostess Club"}
           imageSrc="/cdn/content/mang.png"
           description={get('Tutorial1.5')}
           titleClassName="transform rotate-1"
           descriptionClassName="transform rotate-1"
           imageSize="w-24 h-24"
           className="mb-4"
        />

        <InfoCard 
          title="Vibrant Lounge Bar"
          imageSrc="/cdn/content/qui.png"
          description={get('Tutorial1.7')}
          titleClassName="transform -rotate-1"
          descriptionClassName="transform -rotate-1"
          className="mb-8"
        />

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
         isVisible={isLoading} 
        // loadingText="Loading" 
/>
        </div>
      </div>
    </>
  );
};


export default Tutorial1;