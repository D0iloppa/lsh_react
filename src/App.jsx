import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';

import { AuthProvider, useAuth } from './contexts/AuthContext';

import WelcomePage from '@components/Welcome';

import LoginView from '@components/Login';
import RegisterView from '@components/Register';

import MainApp from '@layout/MainApp';

const AppRoutes = () => {
  const { isLoggedIn } = useAuth();
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
      {/* 1. 최초 진입 - 항상 WelcomePage */}
      <Route 
        path="/" 
        element={<WelcomePage onComplete={handleWelcomeComplete} />} 
      />

      {/* 2. 로그인 페이지 */}
      <Route 
        path="/login" 
        element={
          isLoggedIn ? <Navigate to="/main" replace /> : <LoginView />
        } 
      />


      {/* 3. 회원가입 페이지 */}
      <Route 
        path="/register" 
        element={
          isLoggedIn ? <Navigate to="/main" replace /> : <RegisterView />
        } 
      />

      {/* 3. 메인 앱 (로그인 필요) */}
      <Route 
        path="/main" 
        element={
          isLoggedIn ? <MainApp /> : <Navigate to="/login" replace />
        } 
      />

      {/* 404 페이지 */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router basename="/lsh">
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;