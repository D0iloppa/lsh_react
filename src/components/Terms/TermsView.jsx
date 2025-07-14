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
import Terms_vi from './Terms_vi';
import Terms_ja from './Terms_ja';
import Terms_cn from './Terms_cn';

import './TermsView.css'

export default function TermsView() {
  const navigate = useNavigate();
  const location = useLocation();
  const urlParams = new URLSearchParams(location.search);
  const returnUrl = urlParams.get('returnUrl');
  const agreementType = urlParams.get('agreementType');

  // 스크롤 상태 관리
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

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

  const lang = currentLang;
  
  return (
    <>
      <style jsx="true">{`
        .teams-container {
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        h1 {margin-bottom:0px;}
        h2{margin-top:3px;}

        /* 약관 컨테이너에 스크롤 추가 */
        .terms {
          max-height: 400px;
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
          </div>
          <HatchPattern />

          {/* 약관 내용 박스 */}
          <SketchDiv className="terms flex-1 mb-8 relative">
            {(() => {
              switch(lang) {
                case 'kr':
                  return <Terms_kr />;
                case 'en':
                  return <Terms_en />;
                case 'cn':
                  return <Terms_cn />;
                case 'ja':
                  return <Terms_ja />;
                case 'vi':
                  return <Terms_vi />;
                default:
                  return <Terms_en />;
              }
            })()}
          </SketchDiv>

          {/* 스크롤 안내 메시지 */}
          {isAgreementPage && !hasScrolledToBottom && (
            <div className="scroll-indicator">
              ↓ {get('scrollToEnd')}
            </div>
          )}

          {/* 버튼 영역 */}
          <div className="space-y-3">
            {isAgreementPage ? (
              // 동의 페이지에서 온 경우 - 두 개 버튼
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
                  {hasScrolledToBottom ? (get('Btn.agree')) : (get('Btn.readTermsToEnd'))}
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