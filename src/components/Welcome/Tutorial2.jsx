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
  const [showIntroImage, setShowIntroImage] = useState(true);
  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);
  


  return (
<>
    {showIntroImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={onNextScreen}
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
      <div className="tutorial-container" style={{margin: 'auto', padding: '5px', borderRadius: '5px', width: '341px', border: '1px solid #666'}}>
      {/* 진행 표시기 */}
      <div className="pi-div">
          <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
      </div>

        <div className="">
          <ImagePlaceholder  src={"/cdn/tuto2.png"}  style={{ border: '1px solid #333', borderRadius: '5px',height: '405px'}}/>

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
      </>
  );
};

export default Tutorial2;