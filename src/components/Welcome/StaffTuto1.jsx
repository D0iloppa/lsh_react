import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ProgressIndicator from './ProgressIndicator';
import LoadingScreen from '@components/LoadingScreen';
import { AlertTriangle} from 'lucide-react';


const StaffTuto1 = ({ navigateToPageWithData, onNextScreen,  PAGES, user}) => {
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const navigate = useNavigate();

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);


   const handleEnterVenueInfo = () => {

    navigateToPageWithData(PAGES.STAFF_EDIT_PROFILE, { staffId: user?.id });
    //navigate('/staffSetting', { state: { from: 'staffTuto' } });
  };

  const handleRemindLater = () => {
    navigateToPageWithData(PAGES.STAFF_HOME);
  };

  return (
 <>
      <style jsx="true">{`
       
      `}</style>

  <div className="tutorial-container">
    <div className="">
      {/* 메인 이미지 */}
      {/* <div className="relative" style={{  margin:'auto'}}>
        <ImagePlaceholder src="/cdn/tuto1.png"
        className="w-full h-auto object-contain"
          style={{ 
            height: '200px',
            width: '100%',
            borderRadius: '1px solid #666',
            borderRadius: '10px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            objectFit: 'contain',
          }}
        />
      </div> */}

      {/* 설명 텍스트 */}
      <div style={{ 
          marginTop: '1rem',
          borderLeft: '4px solid #f59e0b',
          background: '#fffbeb',
          padding: '1rem 1.5rem',
          marginBottom: '0.5rem',
          borderRadius: '0 8px 8px 0',
          position: 'relative'
        }}>
          <p style={{ 
            fontSize: '1rem', 
            color: '#92400e', 
            lineHeight: '1.4',
            margin: 0,
            textAlign: 'center',
            fontWeight: '500',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}>
            {get('TUTORIAL_STAFF_DESC')}
          </p>
        </div>

        <ImagePlaceholder src={get('STAFF_SETTING_IMAGE')}
        className="w-full h-auto object-contain"
          style={{ 
            height: '415px',
            width: '100%',
            borderRadius: '1px solid #666',
            borderRadius: '10px',
            objectFit: 'contain',
            marginBottom: '1rem'
          }}
        />

      {/* Enter venue information 버튼 */}
      <div className="relative" style={{ marginBottom: '0.75rem' }}>
        <SketchBtn 
        varint
          onClick={handleEnterVenueInfo}
          variant = 'event' 
          style={{ 
          padding: '0.75rem',
          backgroundColor: '#f5f5f5',
          textAlign: 'center'
        }}>
          <HatchPattern opacity={0.4} />
          <div style={{ 
            position: 'relative',
            zIndex: 1,
            fontSize: '0.875rem',
            color: '#333'
          }}>
            {get('SWAL_STAFF_REG')}
          </div>
        </SketchBtn>
      </div>

      {/* Remind me later 버튼 */}
      <div className="relative" style={{ marginBottom: '1rem' }}>
          <SketchBtn 
            className="sketch-button"
            onClick={handleRemindLater}
            style={{ 
              position: 'relative',
              zIndex: 1,
              width: '100%',
              padding: '0.75rem',
              fontSize: '0.875rem'
            }}
          ><HatchPattern opacity={0.4} />
            {get('TUTORIAL_REMIND_LATER')}
          </SketchBtn>
      </div>

      {/* 하단 설명 텍스트 */}
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '0.75rem', color: '#666' }}>
          * {get('TUTORIAL_EDIT_ANYTIME')}
        </p>
      </div>

      <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
      />
    </div>
  </div>
  </>
  );
};

export default StaffTuto1;