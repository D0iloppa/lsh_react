import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가


import { useNavigate } from 'react-router-dom';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import SketchBtn from '@components/SketchBtn';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ProgressIndicator from './ProgressIndicator';
import { Weight } from 'lucide-react';
import LoadingScreen from '@components/LoadingScreen';
const Tutorial3 = ({ onNextScreen, currentStep, totalSteps, isLast }) => {
  
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();    

  useEffect(() => {
  window.scrollTo(0, 0);
  
  
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

    const navigate = useNavigate();


    const onExpore = () => {
      navigate('/login');
    };


    
  return (



    <div className="tutorial-container max-w-md mx-auto bg-white min-h-screenp-6" style={{margin: 'auto', padding: '5px', borderRadius: '5px', width: '341px', border: '1px solid #666'}}>

    {/* 진행 표시기 */}
      <div className="pi-div">
          <ProgressIndicator 
              currentStep={currentStep} 
              totalSteps={totalSteps} 
            />
        </div>

      <SketchDiv variant="container" style={{padding: '10px 20px', width: '310px', margin: 'auto'}}>
        <HatchPattern opacity={0.3} />
        <div style={{ position: 'relative', zIndex: '10'}}>
          <h3 className="welcome-title" style={{fontSize: '17px'}}>
            {get('Tutorial3.1')}
          </h3>
          <p className="welcome-description">
            {get('Tutorial3.2')}
            {get('Tutorial3.3')}
          </p>
        </div>
      </SketchDiv>


      {/* 메인 이미지 */}
      <div className="">
        <ImagePlaceholder src={"/cdn/tuto-2.png"} className="w-full h-48" style={{margin: 'auto', width: '330px', height:'307px', border: '1px solid #333', padding: '10px', borderTopLeftRadius: '15px 8px',
        borderTopRightRadius: '8px 20px',
        borderBottomRightRadius: '12px 6px',
        borderBottomLeftRadius: '6px 15px',
        transform: 'rotate(-1.2deg)' }} />
      </div>

      {/* Next Screen 버튼 */}
      <div className="relative" style={{ marginTop: '1rem' }}>
          {<HatchPattern opacity={0.8} />}
          
          <SketchBtn 
            className="sketch-button"  variant = 'event' 
            onClick={onExpore}
          >
            {get('Tutorial3.4')}
          </SketchBtn>
           <LoadingScreen 
                     variant="cocktail"
                     loadingText="Loading..."
                     isVisible={isLoading} 
                   />

          {/* <HatchPattern /> */}
        </div>
    </div>
  );
};

export default Tutorial3;