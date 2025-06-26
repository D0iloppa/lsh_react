import React, { useEffect } from 'react';

import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';


import { MsgProvider, useMsg } from '@contexts/MsgContext';

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
import StaffApp from '@layout/StaffApp';

import Cocktail from '@components/CocktailIcon';
import HatchPattern from '@components/HatchPattern';
import VenueTuto1 from '@components/Welcome/VenueTuto1';
import VenueSetup from '@pages/VenueSetup';

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
            path="/venueSetup" 
            element={
              isLoggedIn ? <VenueSetup /> : <Navigate to="/login" replace />
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

function App() {
  return (
    <OverlayProvider>
      {/* 기존 Provider들 */}
      <AuthProvider>
        <MsgProvider>
          <PopupProvider>
            <Router basename={import.meta.env.BASE_URL}>
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