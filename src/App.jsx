import React, { useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';


import { MsgProvider, useMsg  } from '@contexts/MsgContext';

import { AuthProvider, useAuth } from '@contexts/AuthContext';

import { PopupProvider } from '@contexts/PopupContext';
import GlobalPopupManager from '@components/GlobalPopupManager';


import { OverlayProvider } from 'overlay-kit';


import PageView from './debug/PageView'

import WelcomePage from '@components/Welcome';

import LoginView from '@components/Login';
import RegisterView from '@components/Register';

import TermsView from '@components/Terms';
import PrivacyView from '@components/Privacy';

import MainApp from '@layout/MainApp';

import Cocktail from '@components/CocktailIcon';

const AppRoutes = () => {
  const { isLoggedIn } = useAuth();
  const { messages } = useMsg();

  const navigate = useNavigate();

  const handleWelcomeComplete = () => {
    // 튜토리얼 완료 시 로그인 상태 체크
    if (isLoggedIn) {
      navigate('/main');
    } else {
      navigate('/login');
    }
  };

  return (
    <Routes>

      {/* 👇 테스트용 또는 독립 페이지 라우트 */}
      <Route path="/pv/:id" element={<PageView />} />


      {/* 1. 최초 진입 - 항상 WelcomePage */}
      <Route 
        path="/" 
        element={<WelcomePage onComplete={handleWelcomeComplete} />} 
      />

      {/* 2. 로그인 페이지 */}
      <Route 
        path="/login" 
        element={
          /*<LoginView />*/
          isLoggedIn ? <Navigate to="/main" replace /> : <LoginView />
        } 
      />


      {/* 3. 회원가입 페이지 */}
      <Route 
        path="/register" 
        element={
           <RegisterView />
        } 
      />

      {/* 4. 메인 앱 (로그인 필요) */}
      <Route 
        path="/main" 
        element={
          /*<MainApp />*/
          isLoggedIn ? <MainApp /> : <Navigate to="/login" replace /> 
        } 
      />

      {/* Terms 페이지 */}
      <Route path="/terms" element={<TermsView />} />

      {/* Privacy 페이지 */}
      <Route path="/privacy" element={<PrivacyView />} />

      {/* 404 페이지 */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};


import { ShieldCheck, Clock, Package, Globe, QrCode } from 'lucide-react';


const LeTantonSheriffPage = () => {
  return (
    <>
      <style jsx="true">{`
        .main-container {
          max-width: 1200px;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding: 1.5rem;
          line-height: 1.4;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 2rem;
          padding-bottom: 0.8rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          border: 2px solid #333;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 1.6rem;
          font-weight: bold;
          color: #333;
        }

        .subtitle {
          font-size: 1rem;
          color: #6b7280;
        }

        .main-title {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.8rem;
        }

        .main-description {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .feature-item {
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          border: 2px solid #333;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #333;
        }

        .feature-content {
          padding-left: 0.8rem;
        }

        .feature-content p {
          margin: 0.3rem 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .qr-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin: 4rem 0;
          padding: 2rem;
          border: 2px solid #333;
          border-radius: 8px;
        }

        .qr-placeholder {
          width: 150px;
          height: 150px;
          border: 2px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          position: relative;
        }

        .qr-placeholder::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
          border: 1px solid #333;
        }

        .qr-content {
          flex: 1;
        }

        .qr-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 1rem;
        }

        .qr-button {
          border: 2px solid #333;
          border-radius: 6px 8px 4px 6px;
          padding: 0.7rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #333;
          margin-top: 1rem;
        }

        .qr-button:hover {
          transform: translateY(-1px);
          box-shadow: 2px 2px 0px #333;
        }

        .bottom-message {
          text-align: center;
          font-size: 1rem;
          color: #374151;
          margin: 2rem 0;
          padding: 1.5rem;
          border: 2px solid #333;
          border-radius: 8px;
        }

        .footer {
          margin-top: 2.5rem;
          padding-top: 1.5rem;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6b7280;
          font-size: 0.85rem;
        }

        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
        }

        .footer-links a {
          color: #6b7280;
          text-decoration: none;
        }

        .footer-links a:hover {
          color: #333;
        }

        .copyright {
          text-align: right;
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .main-container {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .qr-section {
            flex-direction: column;
            text-align: center;
          }

          .footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>

      <div className="main-container">
        {/* 헤더 */}
        <div className="header">
          <div className="logo-section">
            <div className="logo-icon">
              <Cocktail />
            </div>
            <span className="logo-text">LeTanton Sheriff</span>
          </div>
          <div className="subtitle">
            호치민 레탄톤의 프리미엄 나이트라이프 가이드
          </div>
        </div>

        {/* 메인 타이틀 */}
        <div className="main-title">
          모바일 앱에서만 제공되는 특별한 경험!
        </div>
        <div className="main-description">
          지금 스마트폰으로 앱을 설치하고 모든 혜택을 누리세요.
        </div>

        {/* 서비스 핵심 가치 */}
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
            서비스 핵심 가치
          </h2>
          
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-header">
                <div className="feature-icon">
                  <ShieldCheck size={24} />
                </div>
                <div className="feature-title">안전한 예약 시스템</div>
              </div>
              <div className="feature-content">
                <p>검증된 바와 스태프 정보</p>
                <p>실시간 예약 확인 및 취급 서비스</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-header">
                <div className="feature-icon">
                  <Clock size={24} />
                </div>
                <div className="feature-title">실시간 세팅 지원</div>
              </div>
              <div className="feature-content">
                <p>예약별 바/스태프별 차점 소등</p>
                <p>반출시간 즉시 조절 가능</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-header">
                <div className="feature-icon">
                  <Package size={24} />
                </div>
                <div className="feature-title">회원 전용 혜택</div>
              </div>
              <div className="feature-content">
                <p>프리미엄 회원 무제한 픽업 서비스</p>
                <p>일반회원 회원 인기 및 우선 예약</p>
              </div>
            </div>

            <div className="feature-item">
              <div className="feature-header">
                <div className="feature-icon">
                  <Globe size={24} />
                </div>
                <div className="feature-title">현지화된 정보</div>
              </div>
              <div className="feature-content">
                <p>레탄톤 지역 현황 정확한 정보</p>
                <p>베트남어/영어/한국어 완벽 지원</p>
              </div>
            </div>
          </div>
        </div>

        {/* QR 코드 섹션 */}
        <div className="qr-section">
          <div className="qr-placeholder">
            <img src="/cdn/qr.png"></img>
          </div>
          <div className="qr-content">
            <div className="qr-title">
              QR 코드를 스캔하시면 모바일 웹 페이지로 이동합니다
            </div>
          </div>
        </div>

        {/* 하단 메시지 */}
        <div className="bottom-message">
          모바일 앱에서는 더 빠른 예약, 실시간 알림, 위치 기반 추천 등 더 많은 기능을 이용할 수 있습니다!
        </div>

        {/* 푸터 */}
        <div className="footer">
          <div className="footer-contact">
            <div>연락처: support@letantonsheriff.com</div>
            <div className="footer-links">
              <a href="#">약관</a>
              <a href="#">개인정보처리방침</a>
            </div>
          </div>
          <div className="copyright">
            © 2025 Le Thanh Ton Sheriff, All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
};




function App() {
  useEffect(() => {
    // 1. 확대 기능 비활성화
    const disableZoom = () => {
      // 메타 태그로 확대 비활성화
      const metaViewport = document.querySelector('meta[name="viewport"]');
      if (metaViewport) {
        metaViewport.setAttribute('content', 
          'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
        );
      } else {
        // 메타 태그가 없으면 생성
        const meta = document.createElement('meta');
        meta.name = 'viewport';
        meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
        document.head.appendChild(meta);
      }

      // CSS로 추가 확대 방지
      const style = document.createElement('style');
      style.textContent = `
        * {
          touch-action: manipulation !important;
        }
        
        img, canvas, video {
          pointer-events: auto;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
        
        input, textarea, select {
          touch-action: auto !important;
        }
      `;
      document.head.appendChild(style);

      // 제스처 이벤트 방지
      const preventZoomGestures = (e) => {
        if (e.touches && e.touches.length > 1) {
          // 특정 컴포넌트에서 허용된 경우만 제외
          const allowZoomElements = e.target.closest('[data-allow-zoom="true"]');
          if (!allowZoomElements) {
            e.preventDefault();
          }
        }
      };

      // 더블탭 확대 방지
      const preventDoubleTapZoom = (e) => {
        const allowZoomElements = e.target.closest('[data-allow-zoom="true"]');
        if (!allowZoomElements) {
          e.preventDefault();
        }
      };

      document.addEventListener('touchstart', preventZoomGestures, { passive: false });
      document.addEventListener('touchmove', preventZoomGestures, { passive: false });
      document.addEventListener('gesturestart', preventDoubleTapZoom, { passive: false });
      
      return () => {
        document.removeEventListener('touchstart', preventZoomGestures);
        document.removeEventListener('touchmove', preventZoomGestures);
        document.removeEventListener('gesturestart', preventDoubleTapZoom);
      };
    };

    // 2. 뒤로가기 막기
    const disableBackButton = () => {
      // 브라우저 히스토리에 현재 페이지 추가
      window.history.pushState(null, '', window.location.href);
      
      const handlePopState = (event) => {
        // 뒤로가기 시도 시 현재 페이지로 다시 이동
        window.history.pushState(null, '', window.location.href);
        
        // 사용자에게 알림 (선택사항)
        console.log('뒤로가기가 비활성화되어 있습니다. 앱 내 뒤로가기 버튼을 사용해주세요.');
        
        // 또는 경고창 표시 (선택사항)
        // alert('뒤로가기가 비활성화되어 있습니다.');
      };

      window.addEventListener('popstate', handlePopState);
      
      return () => {
        window.removeEventListener('popstate', handlePopState);
      };
    };

    const cleanupZoom = disableZoom();
    const cleanupBack = disableBackButton();

    return () => {
      cleanupZoom && cleanupZoom();
      cleanupBack && cleanupBack();
    };
  }, []);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  if (!isMobile) {
    {/*
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>모바일 앱에서만 접속 가능합니다.</h2>
        <p>아래 QR코드를 모바일로 스캔해 앱에서 접속해주세요.</p>
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?data=https://your-mobile-site-url.com&size=200x200"
          alt="QR 코드"
        />
      </div>
    );
    */}

    return (
      <LeTantonSheriffPage/>
    )
  }

  return (
    <OverlayProvider>
    {/* 기존 Provider들 */}
    <AuthProvider>
      <MsgProvider>
        <PopupProvider>
          <Router basename="/lsh">
            <AppRoutes />
            <GlobalPopupManager />
          </Router>
        </PopupProvider>
      </MsgProvider>
    </AuthProvider>
  </OverlayProvider>
  );
}






export default App;