import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import SketchDiv from '@components/SketchDiv';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern';
import SketchHeader from '@components/SketchHeader';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

import Privacy_kr from './Privacy_kr';
import Privacy_en from './Privacy_en';

import './PrivacyView.css'

export default function TermsView() {
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1); // 이전 페이지로 이동
  };

  const lang = currentLang;

  return (
      <>
      <style jsx="true">{`
        .privacy-container {
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        h1 {margin-bottom:0px;}
        h2{margin-top:3px;}

       `}</style>

    <div className="min-h-screen bg-white flex flex-col">
      {/* 헤더 */}
      <SketchHeader 
        title={get('Footer1.1')}
        onBack={handleBack}
      />

      {/* 메인 컨텐츠 */}
      <div className="privacy-container flex-1 px-6 py-8 flex flex-col">
        {/* 제목 */}
        <div className="text-center" style={{color: '#1f2937', fontSize: '13px'}}>
          <h1 className=" font-samll text-gray-800 leading-relaxed" style={{ marginBottom:'20px'}}>
            <ShieldCheck style={{opacity: '0.6'}} /> { get('Policy1.1') }
          </h1>
          {/* <h2 className="text-xl font-medium text-gray-800 leading-relaxed">
            LeTanTon Sheriff Privacy Policy
          </h2> */}
        </div><HatchPattern />

        {/* 약관 내용 박스 */}
        <SketchDiv className="terms flex-1 mb-8 relative">
          {(() => {
            switch(lang) {
              case 'kr':
                return <Privacy_kr />;
              case 'en':
                  return <Privacy_en />;
              default:
                return <Privacy_kr />;
            }
          })()}
        </SketchDiv>

        {/* 버튼 영역 */}
        <div className="space-y-3">
          <SketchBtn
            onClick={handleBack}
            variant="secondary"
            className=""
          ><HatchPattern opacity={0.8} />
            { get("btn.back.1") }
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
}