import React, {useEffect, useState} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

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
  const location = useLocation();
  
  const urlParams = new URLSearchParams(location.search);
  const returnUrl = urlParams.get('returnUrl');
  const agreementType = urlParams.get('agreementType');

  // 스크롤 상태 관리
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  // 스크롤 이벤트 리스너 - 약관 컨테이너 내부 스크롤 감지
  useEffect(() => {
    const handleScroll = (event) => {
      const element = event.target;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight;
      const clientHeight = element.clientHeight;
      
      // 스크롤이 거의 끝까지 도달했는지 확인 (여유분 20px)
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 20;
      
      if (isNearBottom && !hasScrolledToBottom) {
        setHasScrolledToBottom(true);
      }
    };

    // 약관 컨테이너 찾기
    const termsContainer = document.querySelector('.terms');
    
    if (termsContainer) {
      termsContainer.addEventListener('scroll', handleScroll);
      
      // 컴포넌트 언마운트 시 이벤트 리스너 제거
      return () => {
        termsContainer.removeEventListener('scroll', handleScroll);
      };
    }
  }, [hasScrolledToBottom]);

  const navigate = useNavigate();

  const handleBack = () => {
    if (returnUrl && agreementType) {
      const separator = returnUrl.includes('?') ? '&' : '?';
      navigate(`${returnUrl}${separator}${agreementType}=declined`);
    } else {
      navigate(-1);
    }
  };

  const handleAgree = () => {
    if (returnUrl && agreementType) {
      const separator = returnUrl.includes('?') ? '&' : '?';
      navigate(`${returnUrl}${separator}${agreementType}=agreed`);
    } else {
      navigate('/register');
    }
  };

  const isAgreementPage = returnUrl && agreementType;
  const lang = currentLang;

  return (
    <>
      <style jsx="true">{`
        .privacy-container {
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        h1 {margin-bottom:0px;}
        h2{margin-top:3px;}

        /* 약관 컨테이너에 스크롤 추가 */
        .terms {
          max-height: 345px;
          overflow-y: auto;
          padding: 20px;
        }

        .scroll-indicator {
          position: fixed;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 12px;
          z-index: 1000;
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateX(-50%) translateY(0);
          }
          40% {
            transform: translateX(-50%) translateY(-10px);
          }
          60% {
            transform: translateX(-50%) translateY(-5px);
          }
        }

        .agree-button-disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .space-y-3 {padding: 0.3rem;}
      `}</style>

      <div className="min-h-screen bg-white flex flex-col">
        <SketchHeader 
          title={get('Footer1.1')}
          onBack={handleBack}
        />

        <div className="privacy-container flex-1 px-6 py-8 flex flex-col">
          <div className="text-center" style={{color: '#1f2937', fontSize: '13px'}}>
            <h1 className=" font-samll text-gray-800 leading-relaxed" style={{ marginBottom:'20px'}}>
              <ShieldCheck style={{opacity: '0.6'}} /> { get('Policy1.1') }
            </h1>
          </div>
          <HatchPattern />

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

          {/* 스크롤 안내 메시지 */}
          {isAgreementPage && !hasScrolledToBottom && (
            <div className="scroll-indicator">
               {get('scrollToEnd')}
            </div>
          )}

          <div className="space-y-3">
            {isAgreementPage ? (
              <>
                <SketchBtn
                  onClick={handleBack}
                  variant="secondary" 
                  style={{marginBottom: '8px'}}
                >
                  <HatchPattern opacity={0.8} />
                  {get('Btn.disagree')}
                </SketchBtn>
                
                <SketchBtn
                  onClick={hasScrolledToBottom ? handleAgree : undefined}
                  variant="primary"
                  className={!hasScrolledToBottom ? 'agree-button-disabled' : ''}
                  disabled={!hasScrolledToBottom}
                >
                  <HatchPattern opacity={hasScrolledToBottom ? 0.8 : 0.3} />
                  {hasScrolledToBottom ? get('Btn.agree') : get('Btn.readTermsToEnd')}
                </SketchBtn>
              </>
            ) : (
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