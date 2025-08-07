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
    try {
        const storedUser = localStorage.getItem('user');
        if (!storedUser || storedUser === 'undefined' || storedUser === 'null') {
            return {};
        }
        return JSON.parse(storedUser);
    } catch (error) {
        console.error('localStorage user 파싱 실패:', error);
        return {};
    }
});

  const [loginType, setLoginType] = useState(() => {
    return localStorage.getItem('loginType') || null;
  });

  const [accountType, setAccountType] = useState(() => {
    return localStorage.getItem('accountType') || null;
  });



  const [loading, setLoading] = useState(false);
  const [isJustLoggedIn, setIsJustLoggedIn] = useState(true);


  const clearJustLoggedInFlag = () =>{
      setIsJustLoggedIn(false);
  };



  // 사용자 정보 업데이트 함수
  const updateUser = (updates) => {
    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    console.log('사용자 정보 업데이트:', updatedUser);
  };

  // venue_id 업데이트 전용 함수
  const updateVenueId = (venue_id) => {
    updateUser({ venue_id });
  };


  const login_v2 = async (params={}) => {
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
      
      //localStorage.removeItem('lsh_language');

      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('user', JSON.stringify(params.user));
      localStorage.setItem('loginType', params.login_type);
      localStorage.setItem('accountType', params.account_type);

      setIsLoggedIn(true);
      setIsJustLoggedIn(true);
      setUser(params.user);
      setLoginType(params.login_type);
      setAccountType(params.account_type);
      console.log('로그인 성공:', params.user);
      
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
          //localStorage.removeItem('lsh_language');

          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('loginType', params.login_type);
          localStorage.setItem('accountType', params.account_type);

          setIsLoggedIn(true);
          setIsJustLoggedIn(true);
          setUser(result.user);
          setLoginType(params.login_type);
          setAccountType(params.account_type);
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

  // 비밀번호 검증 전용 함수 (navigate 없음)
  const verifyPassword = async (params={}) => {
    try {
      setLoading(true);
      
      // Login 컴포넌트의 API 호출 함수 사용 
      const result = await loginPost(params);
      
      // 성공해도 상태를 업데이트하지 않음 (navigate 없음)
      return result;
      
    } catch (error) {
      console.error('Password verification error:', error);
      return {
        success: false,
        errors: { general: 'Something went wrong. Please try again.' }
      };
    } finally {
      setLoading(false);
    }
  };

  // 사용자 언어 업데이트 함수
  const updateUserLang = (newLang) => {
    const updatedUser = { ...user, language: newLang };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // 로그아웃 함수
  const logout = async () => {

      try {


        const {type:account_type} = user;

        let account_id = (account_type == 'manager') ? user.manager_id : user.staff_id;

        const response = await ApiClient.postForm('/api/logout', {
          user: 'logout',
          account_type: account_type,
          account_id: account_id
        });

        console.log(response);
    
      } catch (error) {
        console.error('❌ Failed to logout:', error);
      } finally {
        // 성공, 실패 상관없이 실행
        setIsLoggedIn(false);
        setUser(null);
        setLoginType(null);
        setAccountType(null);
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('user');
        localStorage.removeItem('loginType');
        localStorage.removeItem('accountType');
      }
  };

  const isCompletedTuto = () => {
  // 로그인되지 않은 경우 false 반환
  if (!isLoggedIn || !user) {
    return false;
  }

  // account_type이 staff가 아닌 경우 false 반환
  if (user.type !== 'staff' && user.account_type !== 'staff') {
    return false;
  }

  // profile_content_id가 falsy인 경우 false 반환
  if (!user.profile_content_id) {
    return false;
  }

  // 모든 조건을 만족하는 경우 true 반환
  return true;
};

  const value = {
    isLoggedIn,
    user,
    loading,
    login,
    login_v2,
    verifyPassword,
    logout,
    loginType,
    setLoginType,
    accountType,
    setAccountType,
    updateUserLang,
    updateUser,      // 추가
    updateVenueId,    // 추가
    isCompletedTuto,
    isJustLoggedIn,
    clearJustLoggedInFlag
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