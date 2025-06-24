import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import SketchDiv from '@components/SketchDiv';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern';
import SketchHeader from '@components/SketchHeader';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { ArrowLeft, BookOpenText } from 'lucide-react';
import LoadingScreen from '@components/LoadingScreen';

import Terms_kr from './Terms_kr';
import Terms_en from './Terms_en';

import './TermsView.css'

export default function TermsView() {
  const navigate = useNavigate();
  const urlParams = new URLSearchParams(location.search);
  const returnUrl = urlParams.get('returnUrl');
  const agreementType = urlParams.get('agreementType');


  const handleBack = () => {
  // 동의 페이지에서 온 경우와 일반 페이지에서 온 경우를 구분
  if (returnUrl && agreementType) {
    // Register 페이지에서 동의를 위해 온 경우 - 동의하지 않음 파라미터와 함께 돌아가기
    const separator = returnUrl.includes('?') ? '&' : '?';
    navigate(`${returnUrl}${separator}${agreementType}=declined`); // declined 추가
  } else {
    // 일반적인 뒤로가기
    navigate(-1);
  }
};

const handleAgree = () => {
  // 동의했다는 파라미터와 함께 돌아가기
  if (returnUrl && agreementType) {
    const separator = returnUrl.includes('?') ? '&' : '?';
    navigate(`${returnUrl}${separator}${agreementType}=agreed`);
  } else {
    navigate('/register');
  }
};
  
  // 동의 페이지로 온 경우인지 확인
  const isAgreementPage = returnUrl && agreementType;


  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
    useEffect(() => {
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        // setLanguage('en'); // 기본 언어 설정
        console.log('Current language set to:', currentLang);
        window.scrollTo(0, 0);
      }
    }, [messages, currentLang]);

  const lang = currentLang;
  
  return (

     <>
      <style jsx="true">{`
        .teams-container {
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        h1 {margin-bottom:0px;}
        h2{margin-top:3px;}

       `}</style>

    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <SketchHeader 
         title={get('Footer1.2')}
        onBack={handleBack}
      />

      {/* 메인 컨텐츠 */}
      <div className="teams-container flex-1 px-6 py-8 flex flex-col">
        {/* 제목 */}
        <div className="text-center" style={{color: '#1f2937' , fontSize: '13px'}}>
          <h1 className="text-xl font-medium text-gray-800 leading-relaxed" style={{ marginBottom:'20px'}}>
            <BookOpenText style={{opacity: '0.6'}}/>  { get('Terms1.1') }
          </h1>
          {/* <h2 className="text-xl font-medium text-gray-800 leading-relaxed">
            LeTanTon Sheriff Terms & Conditions
          </h2> */}
        </div><HatchPattern />

        {/* 약관 내용 박스 */}
        <SketchDiv className="terms flex-1 mb-8 relative">
          {(() => {
            switch(lang) {
              case 'kr':
                return <Terms_kr />;
              case 'en':
                  return <Terms_en />;
              default:
                return <Terms_kr />;
            }
          })()}
        </SketchDiv>

        {/* 버튼 영역 */}
        <div className="space-y-3">
                    {isAgreementPage ? (
                      // 동의 페이지에서 온 경우 - 두 개 버튼
                      <>
                        <SketchBtn
                          onClick={handleBack}
                          variant="secondary" style={{marginBottom: '8px'}}
                        >
                          <HatchPattern opacity={0.8} />
                          동의하지 않음
                        </SketchBtn>
                        
                        <SketchBtn
                          onClick={handleAgree}
                          variant="primary"
                        >
                          <HatchPattern opacity={0.8} />
                          동의합니다
                        </SketchBtn>
                      </>
                    ) : (
                      // 일반 페이지에서 온 경우 - 기존 버튼
                      <SketchBtn
                        onClick={handleBack}
                        variant="secondary"
                      >
                        <HatchPattern opacity={0.8} />
                        {get("btn.back.1")}
                      </SketchBtn>
                    )}
                  </div>

        <LoadingScreen 
                                    variant="cocktail"
                                    loadingText="Loading..."
                                    isVisible={isLoading} 
                                  />
      </div>
    </div>
     </>
  );
}