// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { loginPost, validateForm } from '@components/Login/login'; // ← 로그인 로직 재활용

import ApiClient from '@utils/ApiClient';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);

  // 로그인 함수 (Login 컴포넌트 로직 재활용)
    const login = async (email, password) => {
      try {
        setLoading(true);
        
        // Login 컴포넌트의 유효성 검사 함수 사용
        const validation = validateForm(email, password);
        if (!validation.isValid) {
          return {
            success: false,
            errors: validation.errors
          };
        }

        // Login 컴포넌트의 API 호출 함수 사용
        const result = await loginPost(email, password);
        
        if (result.success) {
          // 성공 시 상태 업데이트

          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(result.user));

          setIsLoggedIn(true);
          setUser(result.user);
          console.log('로그인 성공:', result.user);
        }
        
        return result;
        
      } catch (error) {
        console.error('Login error:', error);
        return {
          success: false,
          errors: { general: 'Something went wrong. Please try again.' }
        };
      } finally {
        setLoading(false);
      }
    };

  // 로그아웃 함수
  const logout = async () => {

      try {
        const response = await ApiClient.postForm('/api/logout', {
          user: 'logout'
        });

        console.log(response);
    
      } catch (error) {
        console.error('❌ Failed to logout:', error);
      } finally {
        // 성공, 실패 상관없이 실행
        setIsLoggedIn(false);
        setUser(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
      }
  };

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth는 AuthProvider 안에서 사용해야 합니다');
  }
  return context;
};