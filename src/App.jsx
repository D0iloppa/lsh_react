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

  return (
    <OverlayProvider>
    {/* 기존 Provider들 */}
    <AuthProvider>
      <MsgProvider>
        <PopupProvider>
          <Router basename="/">
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