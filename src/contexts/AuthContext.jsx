// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState } from 'react';
import { loginPost, validateForm } from '@components/Login/login'; // ← 로그인 로직 재활용

import { useMsg } from './MsgContext';

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

  const { get } = useMsg();

  // 로그인 함수 (Login 컴포넌트 로직 재활용)
    const login = async (params={}) => {
      try {
        setLoading(true);
        
        /*
        // Login 컴포넌트의 유효성 검사 함수 사용
        const validation = validateForm(email, password);
        if (!validation.isValid) {
          return {
            success: false,
            errors: validation.errors
          };
        }
          */

        // Login 컴포넌트의 API 호출 함수 사용
        const result = await loginPost(params);
        
        if (result.success) {
          // 성공 시 상태 업데이트

          // 로컬 language가 아닌 설정값 참조위함
          localStorage.removeItem('lsh_language');

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
            {get('purchase.daily_pass.btn')}
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
            // top: 5px;
            display: inline-block;
            // background: url('/cdn/ticket.png') center/cover no-repeat;
            //padding: 0px 15px 0px 7px;
            margin-left: 8px;
            position: relative;
            height: 23px;
            overflow: visible;
            opacity: 0.8;
          }
          
          .masked-section::after {
            content: '';
            position: absolute;
            top: 25%;
            left: 0;
            width: 100%;
            height: 50%;
            // background: linear-gradient(
            //   45deg,
            //   transparent,
            //   rgba(255, 255, 255, 0.4),
            //   transparent
            // );
            transform: rotate(45deg);
            // animation: shimmer 2.5s infinite;
            z-index: 1;
          }
          
          @keyframes shimmer {
            0% {
              transform: translateX(0%) rotate(45deg);
            }
            100% {
              transform: translateX(200%) rotate(45deg);
            }
          }
          
          .masked-dots {
            color:#c9980e;
            font-weight: bold;
            position: relative;
            z-index: 2;
          }
          
          .daily-pass-btn {
            color: #c9980e;
            background: rgba(255, 222, 75, 0.8);
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
            // background: rgba(255, 255, 255, 0.2) url('/cdn/ticket.png') center/cover no-repeat;
            margin-left: 0.2rem;
          }
          
          // .daily-pass-btn:hover {
          //   background: rgba(255, 255, 255, 0.3) url('/cdn/ticket.png') center/cover no-repeat;
          // }
          
          .daily-pass-btn:active {
            transform: translateY(0);
          }
          
          @media (max-width: 480px) {
            .daily-pass-btn {
              font-size: 11px;
              padding: 3px 8px;
            }
          }
        `}</style>
      </span>
    );
  }
};



const verifyPassword = async (params={}) => {
  try {
    // setLoading(true); // 제거 - 비밀번호 인증에서는 불필요한 상태 변경 방지
    const result = await loginPost(params);
    return result;
  } catch (error) {
    console.error('Password verification error:', error);
    return {
      success: false,
      errors: { general: 'Something went wrong. Please try again.' }
    };
  }
  // finally 블록 제거 - setLoading(false) 제거
};

// 사용자 언어 업데이트 함수
const updateUserLang = (newLang) => {
  const updatedUser = { ...user, language: newLang };
  setUser(updatedUser);
  localStorage.setItem('user', JSON.stringify(updatedUser));
};

// 로그인 상태 강제 업데이트 함수 (오버레이용)
const updateLoginState = (userData) => {
  localStorage.setItem('isLoggedIn', 'true');
  localStorage.setItem('user', JSON.stringify(userData));
  setIsLoggedIn(true);
  setUser(userData);
  console.log('로그인 상태 강제 업데이트:', userData);
};


  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    isActiveUser,
    iauMasking,
    verifyPassword,
    updateUserLang,
    updateLoginState
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