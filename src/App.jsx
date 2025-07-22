import React, { useEffect, useState } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { MsgProvider, useMsg } from '@contexts/MsgContext';
import { AuthProvider, useAuth } from '@contexts/AuthContext';
import { PopupProvider } from '@contexts/PopupContext';
import GlobalPopupManager from '@components/GlobalPopupManager';
import { FcmProvider, useFcm } from '@contexts/FcmContext';
import { OverlayProvider } from 'overlay-kit';

import PageView from './debug/PageView'
import WelcomePage from '@components/Welcome';
import LoginView from '@components/Login';
import RegisterView from '@components/Register';
import TermsView from '@components/Terms';
import PrivacyView from '@components/Privacy';
import MainApp from '@layout/MainApp';
import StaffApp from '@layout/StaffApp';
import Cocktail from '@components/CocktailIcon';
import HatchPattern from '@components/HatchPattern';
import VenueTuto1 from '@components/Welcome/VenueTuto1';
import StaffTuto1 from '@components/Welcome/StaffTuto1';
import VenueSetup from '@pages/VenueSetup';
import EditProfile from '@pages/EditProfile';

import { AlignStartVertical, TruckElectric } from 'lucide-react';

const AppRoutes = () => {
  const { isLoggedIn, user, loginType, isCompletedTuto } = useAuth();
  const { currentLang, messages } = useMsg();


  useEffect(() => {
    // body에 현재 언어 속성 추가
    document.body.setAttribute('data-lang', currentLang);
    console.log("currentLang", currentLang)
    
    // 또는 클래스 방식
    document.body.classList.remove('lang-en', 'lang-ko', 'lang-ja', 'lang-vi', 'lang-cn');
    document.body.classList.add(`lang-${currentLang}`);
  }, [currentLang]);


  const navigate = useNavigate();

  const handleWelcomeComplete = () => {
    // 튜토리얼 완료 시 로그인 상태 체크
    if (isLoggedIn) {
      navigate('/');
    } else {
      navigate('/login');
    }
  };

  return (
    <Routes>
      {/* 👇 테스트용 또는 독립 페이지 라우트 */}
      <Route path="/pv/:id" element={<PageView />} />

      {/* 1. 최초 진입 - 항상 WelcomePage */}
      {
        /*
      <Route 
        path="/" 
        element={<WelcomePage onComplete={handleWelcomeComplete} />} 
      />
      */
      }

      <Route 
        path="/" 
        element={
          isLoggedIn ? (
            user?.type === 'manager' ? (
              <Navigate to="/manager" replace />
            ) : user?.type === 'staff' ? (
              <Navigate to="/staff" replace />
            ) : (
              // loginType을 fallback으로 사용
              loginType === 'manager' ? (
                <Navigate to="/manager" replace />
              ) : loginType === 'staff' ? (
                <Navigate to="/staff" replace />
              ) : (
                <Navigate to="/login" replace />
              )
            )
          ) : (
            <LoginView />
          )
        } 
      />

      {/* 2. 로그인 페이지 */}
      <Route 
        path="/login" 
        element={
          <LoginView />
          /* isLoggedIn ? <Navigate to="/main" replace /> : <LoginView /> */
        } 
      />

      {/* 3. 회원가입 페이지 */}
      <Route 
        path="/register" 
        element={
           <RegisterView />
        } 
      />

      {/* 4. 매니저 메인 앱 (로그인 필요) */}
      <Route 
        path="/manager" 
        element={
          isLoggedIn ? <MainApp /> : <Navigate to="/login" replace />
        } 
      />

      <Route 
        path="/managerTuto" 
        element={
          isLoggedIn ? <VenueTuto1 /> : <Navigate to="/login" replace />
        } 
      />

      <Route 
        path="/staffTuto" 
        element={
          isCompletedTuto() ? 
            <Navigate to="/" replace /> : 
            <StaffTuto1 />
        } 
      />

      <Route 
        path="/venueSetup" 
        element={
          isLoggedIn ? <VenueSetup /> : <Navigate to="/login" replace />
        } 
      />

      <Route 
        path="/staffSetting" 
        element={
          isLoggedIn ? <EditProfile /> : <Navigate to="/login" replace />
        } 
      />

      {/* 5. 스태프 메인 앱 (로그인 필요) */}
      <Route 
        path="/staff" 
        element={
          isLoggedIn ? <StaffApp /> : <Navigate to="/login" replace />
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

// NotificationHandler를 별도 컴포넌트로 분리
const NotificationHandler = () => {
  const navigate = useNavigate(); // Router 안에서 사용 가능
  const { setFcmToken } = useFcm();

  useEffect(() => {
    window.ReactReady = true;

    window.onNotificationClick = (navigateTo, data) => {
      // alert(`✅ 푸시 알림 클릭됨\n\n이동할 페이지: ${navigateTo}\n\n전체 데이터:\n${JSON.stringify(data, null, 2)}`);

      let prefix = (data?.chatRoomType === 'staff') ? '/staff' : '/manager';

      // 쿼리스트링 생성 (navigateTo, chatRoomType 등 불필요한 값은 제외 가능)
      const params = new URLSearchParams({
        ...data,
        navigateTo // 목적지 페이지 정보도 쿼리로!
      }).toString();

      // alert(`${prefix}?${params} 페이지로 이동 예정`);
      // 예: /manager?navigateTo=CHATTING&room_sn=48&name=DORIS&chatRoomType=manager
      navigate(`${prefix}?${params}`);
      //navigate('/manager?navigateTo=CHATTING&room_sn=48&name=DORIS&chatRoomType=manager');
    };
  }, [navigate]);

  useEffect(() => {
    window.receiveFcmToken = (token) => {
      setFcmToken(token); // 정상 작동
    };

    if (window.AndroidInterface?.readyToReceiveToken) {
      window.AndroidInterface.readyToReceiveToken();
    }
    
    if (window.webkit?.messageHandlers?.native) {
      window.webkit.messageHandlers.native.postMessage("readyToReceiveToken");
      console.log("📤 readyToReceiveToken 메시지 전송");
    }

    return () => {
      delete window.receiveFcmToken;
    };
  }, [setFcmToken]);

  return null; // UI를 렌더링하지 않는 로직 전용 컴포넌트
};

const AppContent = () => {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <NotificationHandler />
      <AppRoutes />
      <GlobalPopupManager />
    </Router>
  );
};

function App() {
  return (
    <MsgProvider>
      <OverlayProvider>
        <FcmProvider>
          <AuthProvider>
              <PopupProvider>
                <AppContent />
              </PopupProvider>
          </AuthProvider>
        </FcmProvider>
      </OverlayProvider>
    </MsgProvider>
  );
}

export default App;