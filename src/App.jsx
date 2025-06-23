import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';


import { MsgProvider, useMsg  } from '@contexts/MsgContext';

import { AuthProvider, useAuth } from '@contexts/AuthContext';

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
  return (
    <AuthProvider>
      <MsgProvider>  {/* 👈 여기에 추가! */}
        <Router basename="/lsh">
          <AppRoutes />
        </Router>
      </MsgProvider>
    </AuthProvider>
  );
}

export default App;