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

  const isActiveUser = async () => {
    try {
      if (!user?.user_id) {
        console.log('❌ User not found, cannot check subscription');
        return { isActiveUser: false, subscription: {} };
      }

      const response = await ApiClient.postForm('/api/getSubscriptionInfo', {
        user_id: user.user_id
      });

      const { isActiveUser = false, subscription = {} } = response;
      
      console.log('✅ Subscription check result:', { isActiveUser, subscription });
      
      return { isActiveUser, subscription };
      
    } catch (error) {
      console.error('❌ Failed to check subscription:', error);
      return { isActiveUser: false, subscription: {} };
    }
  }

const iauMasking = (iau, text, onPurchaseClick) => {
  const { isActiveUser = false, subscription = {} } = iau;

  if (isActiveUser) {
    return text;
  } else {
    // 텍스트가 없거나 빈 문자열인 경우
    if (!text || text.length === 0) {
      return text;
    }
    
    // 텍스트 길이의 절반을 계산
    const halfLength = Math.floor(text.length / 4);
    
    // 앞부분은 그대로 두고, 나머지는 ***로 마스킹
    const visiblePart = text.substring(0, halfLength);
    
    // JSX 요소 반환 (마스킹된 텍스트 + 구매 버튼)
    return (
      <span className="masked-content-wrapper">
        <span className="visible-text">{visiblePart}</span>
        <span className="masked-section">
          <span className="masked-dots"> ***</span>
          <button 
            className="daily-pass-btn"
            onClick={onPurchaseClick}
          >
            일일권 구매 시 노출
          </button>
        </span>
        
         <style jsx="true">{`
          .masked-content-wrapper {
            position: relative;
            display: inline-block;
          }
          
          .visible-text {
            color: inherit;
          }
          
          .masked-section {
            top: 5px;
          display: inline-block;
          background: linear-gradient(2deg, rgb(255 232 161) 0%, rgb(255 255 255 / 10%) 100%);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 15px;
          padding: 0px 7px;
          margin-left: 8px;
          border: 1px solid #ffcc01;
              opacity: 0.8;
          // box-shadow: 2px 2px 0px #c1c1c1;
          position: relative;
              height: 23px;
          overflow: hidden;
          }
          
          .masked-section::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: linear-gradient(
              45deg,
              transparent,
              rgba(255, 255, 255, 0.4),
              transparent
            );
            transform: rotate(45deg);
            animation: shimmer 2.5s infinite;
            z-index: 1;
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(-100%) translateY(-100%) rotate(45deg);
            }
            50% {
              transform: translateX(50%) translateY(50%) rotate(45deg);
            }
            100% {
              transform: translateX(200%) translateY(200%) rotate(45deg);
            }
          }
          
          .masked-dots {
            color:#c9980e;
            font-weight: bold;
            margin-right: 8px;
            position: relative;
            z-index: 2;
          }
          
          .daily-pass-btn {
            color: #c9980e;
            border: none;
            border-radius: 6px;
            padding: 4px 10px;
            font-size: 9px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            white-space: nowrap;
            position: relative;
            z-index: 2;
            background: rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(5px);
            -webkit-backdrop-filter: blur(5px);
            // border: 1px solid rgba(255, 255, 255, 0.3);
          }
          
          .daily-pass-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-1px);
            // box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
          }
          
          .daily-pass-btn:active {
            transform: translateY(0);
          }
          
          @media (max-width: 480px) {
            .daily-pass-btn {
              font-size: 9px;
              padding: 3px 8px;
            }
          }
        `}</style>
      </span>
    );
  }
};

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    isActiveUser,
    iauMasking
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