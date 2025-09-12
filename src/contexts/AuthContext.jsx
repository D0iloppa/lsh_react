// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useRef } from 'react';
import { loginPost, validateForm } from '@components/Login/login'; // ← 로그인 로직 재활용

import { useMsg } from './MsgContext';

import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import axios from 'axios';
import qs from 'qs';
import { PAGES } from '../config/pages.config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {

  const isFreeUse = true;

  const invokeCntRef = useRef(0);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [loading, setLoading] = useState(false);
const [isSettingChecked, setIsSettingChecked] = useState(false); // 추가: 설정 확인 상태
const { currentLang, setLanguage } = useMsg();

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
    const CACHE_KEY = 'cached-isActiveUser';
  
    function readCache() {
      try {
        const raw = localStorage.getItem(CACHE_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        if (typeof parsed.isActiveUser !== 'boolean') return null;
        return {
          isActiveUser: parsed.isActiveUser,
          subscription: parsed.subscription || {}
        };
      } catch (e) {
        return null;
      }
    }
  
    function writeCache(data) {
      try {
        localStorage.removeItem(CACHE_KEY); // 클리어 후 저장
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({
            isActiveUser: !!data.isActiveUser,
            subscription: data.subscription || {}
          })
        );
      } catch (e) {
        // quota 등 저장 실패는 무시
      }
    }
  
    try {
      if (!user?.user_id) {
        console.log('❌ User not found, cannot check subscription');
        return { isActiveUser: false, subscription: {} };
      }




  
      const response = await ApiClient.postForm('/api/getSubscriptionInfo', {
        user_id: user.user_id
      });

      if(isFreeUse){

        const subscription = {
          "subscription_id": 46,
          "user_id": user.user_id,
          "subscription_type": "daily",
          "started_at": "2025-08-07 02:46:55.516",
          "expired_at": "2125-08-10 21:22:32.953",
          "canceled_at": null,
          "status": "active",
          "created_at": "2025-08-08 02:46:55.516",
          "days": 1
        };

        const userState = 'active';

        console.log('✅ 한시적 무료:', { isActiveUser: true, subscription, userState });

        writeCache({ isActiveUser: true, subscription, userState }); // 성공 시 캐시 갱신
  

        return { isActiveUser: true, subscription, userState };
      }

  
      // ⚠️ 이름 충돌 피하기: active 로 받기
      const { isActiveUser: active = false, subscription = {}, userState = 'active' } = response || {};
  
      console.log('✅ Subscription check result:', { isActiveUser: active, subscription, userState });
      writeCache({ isActiveUser: active, subscription, userState }); // 성공 시 캐시 갱신
  
      return { isActiveUser: active, subscription, userState };
    } catch (error) {
      console.error('❌ Failed to check subscription:', error);
  
      const cached = readCache();
      if (cached) {
        console.log('⚠️ Using cached subscription due to error:', cached);
        return cached;
      }
  
      return { isActiveUser: false, subscription: {}, userState: 'active' };
    }
  };
  

const iauMasking = (iau, text, onPurchaseClick) => {
  const { isActiveUser = false, subscription = {}, onlyMasking = false } = iau;

  if (isActiveUser) {
    return text;
  } else {
    // 텍스트가 없거나 빈 문자열인 경우
    if (!text || text.length === 0) {
      return text;
    }

    if(onlyMasking){
      return (
        <span className="masked-text-wrapper">
          <span className="first-char">{text[0]}</span>
          <span className="masking-dots">***</span>
          
          <style jsx>{`
            .masked-text-wrapper {
              display: inline-flex;
              align-items: center; /* 중앙 정렬 */
              line-height: 1;
            }

            .first-char,
            .masking-dots {
              display: inline-block;
              font-size: inherit;
              line-height: 1;
            }

            .masking-dots {
              margin-left: 2px;
              position: relative;
              top: 0.25em; /* 폰트 높이 대비 미세 보정 */
            }
              
        `}</style>
        </span>
      );
    }
    
    // 텍스트 길이의 절반을 계산
    const halfLength = Math.floor(text.length / 4);
    
    // 앞부분은 그대로 두고, 나머지는 ***로 마스킹
    const visiblePart = text.substring(0, 1);
    
    // JSX 요소 반환 (마스킹된 텍스트 + 구매 버튼)
    return (
      <span className="masked-content-wrapper">
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
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
        </div>
       <style jsx="true">{`
         
          
          .visible-text {
            color: inherit;
          }
          
          .masked-section {
            // top: 5px;
            display: flex;
            // background: url('/cdn/ticket.png') center/cover no-repeat;
            //padding: 0px 15px 0px 7px;
            //margin-left: 8px;
            position: relative;
            height: 23px;
            overflow: visible;
            opacity: 0.8;
            max-width: 157px;
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

const getUUID = () => {

  /*
  Swal.fire({
    title: 'UUID 요청!',
    text: `디바이스 UUID`,
    icon: 'success',
    confirmButtonText: '확인',
  });
  */

 const isAndroid = !!window.native;
 const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;
            
  const payload = 'getUUID';
  if (window.webkit && window.webkit.messageHandlers && window.webkit.messageHandlers.native) {
    // iOS WebView
    window.webkit.messageHandlers.native.postMessage(payload);
  } else if (isAndroid) {
    // Android WebView
    window.native.postMessage(payload);
  } else {
    console.log('네이티브 앱 환경이 아닙니다.');
    return null;
  }
};


const fetchFavorits = async () => {
  try {
    const res = await ApiClient.get(`/api/getMyFavoriteList`, {
      params: { user_id: user?.user_id || 1 }
    });
    return res || [];
  } catch (err) {
    console.error('즐겨찾기 실패:', err);
    return [];
  }
 }

 const filterFavorits = async (type='venue') => {
 
  const list = await fetchFavorits();
  
  const filtered = list.filter(item => item.target_type === type);

  return filtered;
 }


const updateSetting = async (currentLang) => {

  if (isSettingChecked) {
      // 이미 한 번 요청이 완료된 경우, 요청하지 않음
      console.log('Setting check already completed.');
      return user;  // 기존 사용자 그대로 반환
    }
  try {
     setIsSettingChecked(true); 
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    const res = await axios.get(`${API_HOST}/api/checkSetting`, {
      params: {
        user_id: user?.user_id || 1,
        lang: currentLang,
        email: user?.email,
        user_type: 'user',
      },
    });

    if (res.data) {
      const updatedUser = { ...user, language: res.data.language || currentLang };
      // 로컬스토리지에 업데이트된 언어 값 저장
      localStorage.setItem('user', updatedUser);
      return updatedUser;
    }

    return user;  // 응답이 없다면 기존 user 반환

  } catch (err) {
    console.error('즐겨찾기 실패:', err);
    return user;  // 오류가 발생하면 기존 user 반환
  }finally {
      //setIsSettingChecked(false);  // 요청 완료 후 상태 초기화
    }
};

  const deviceLogin = async () => {
    // 1. isLoggedIn 체크
    if (isLoggedIn) {
      console.log('이미 로그인된 상태입니다.', user);


      if(invokeCntRef.current < 3) {
        
        invokeCntRef.current += 1;
        // device_login -> 이력 추가
        ApiClient.accessLog({
          user_id : user.user_id,
          page : "INTRO"
        });
      }



      return { success: true, user };
    }

    // 2. UUID 요청 및 응답 대기
    return new Promise((resolve) => {
      const handleMessage = async (event) => {
        try {
          const uuid = event.data;
          console.log('받은 UUID:', uuid);

          // UUID를 SweetAlert로 표시
        
          /*
          Swal.fire({
            title: 'UUID 수신 완료!',
            text: `디바이스 UUID: ${uuid}`,
            icon: 'success',
            confirmButtonText: '확인',
          });
        */
          
          if (!uuid) {
            console.error('UUID를 받지 못했습니다.');
            /*
            Swal.fire({
              title: 'UUID 오류',
              text: '디바이스 UUID를 받지 못했습니다.',
              icon: 'error',
              confirmButtonText: '확인'
            });
            */
            resolve({ success: false, error: 'UUID not received' });
            return;
          }

          const data = qs.stringify({
            login_type: 'device',
            email: uuid,
            login_id: uuid,
            passwd: uuid,
            account_type: 'user'
          });

          // 3. 기존 로그인 API 사용 (device 타입으로)
          const API_HOST = import.meta.env.VITE_API_HOST;
          const response = await axios.post(
            `${API_HOST}/api/deviceLogin`, 
            data,
            {
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
              }
            }
          );

          let { error = false, errMsg = false, errCode = false, user = false, staff = false, manager = false } = response.data;

          // type decoration
          user = user && { 
            type: 'user', 
            'login_type': 'device', 
            login_id: uuid, 
            ...user 
          };

          if (error) {
            console.error('디바이스 로그인 실패:', errCode || errMsg);
            /*
            Swal.fire({
              title: '로그인 실패',
              text: errCode || errMsg || '디바이스 로그인에 실패했습니다.',
              icon: 'error',
              confirmButtonText: '확인'
            });
            */
            resolve({ success: false, error: errCode || errMsg });
            return;
          }

          // 성공 시 상태 업데이트
          const loginUser = user || manager || staff;
          localStorage.removeItem('lsh_language');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('user', JSON.stringify(loginUser));

          setIsLoggedIn(true);
          setUser(loginUser);

          if(invokeCntRef.current < 3) {
        
            invokeCntRef.current += 1;
            // device_login -> 이력 추가
              ApiClient.accessLog({
                user_id : user.user_id,
                page : "INTRO"
              });
          }


          
          console.log('디바이스 로그인 성공:', loginUser);

        } catch (error) {
          console.error('디바이스 로그인 중 오류:', error);
          
          Swal.fire({
            title: '오류 발생',
            text: `로그인 중 오류가 발생했습니다: ${JSON.stringify(error)}`,
            icon: 'error',
            confirmButtonText: '확인'
          });
          resolve({ success: false, error: error.message });
        } finally {
          // 이벤트 리스너 정리
          window.removeEventListener('message', handleMessage);
        }
      };

      // 메시지 이벤트 리스너 등록
      window.addEventListener('message', handleMessage);
      
      // UUID 요청
      getUUID();
      
      // 타임아웃 설정 (10초)
      setTimeout(() => {
        window.removeEventListener('message', handleMessage);
        resolve({ success: false, error: 'UUID request timeout' });
      }, 10000);
    });
  };




  /////////////////////////////////////////////////////


  // venue API 호출 (무조건 fetch)
  const fetchVenueCatMap = async () => {
    try {
      const res = await ApiClient.get(`/api/venueCatMap`);
      return res.data || [];
    } catch (err) {
      console.error("venueCatMap fetch 실패:", err);
      return [];
    }
  };

  // venue API with sessionStorage cache (만료 10분)
  const venueCatMap = async () => {
    const cacheKey = "venueCatMap";
    const ttl = 10 * 60 * 1000; // 10분(ms)

    try {
      // 1. 캐시 확인
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        const { data, ts } = JSON.parse(cached);
        const now = Date.now();

        // 만료 안됨 → 캐시 반환
        if (now - ts < ttl) {
          return data;
        }
      }

      // 2. 없거나 만료 → fetch
      const data = await fetchVenueCatMap();

      // 3. 캐시에 저장 (데이터 + 저장 시각)
      sessionStorage.setItem(
        cacheKey,
        JSON.stringify({ data, ts: Date.now() })
      );

      return data;
    } catch (err) {
      console.error("venueCatMap cache 실패:", err);
      return [];
    }
  };

  // venue 단일 항목 조회
  const venueCatInfo = async (venue_id) => {
    const vcm = await venueCatMap();
    return vcm.find((v) => v.venue_id === venue_id) || null;
  };

  /////////////////////////////////////////////////////




  const value = {
    deviceLogin,
    isLoggedIn,
    user,
    loading,
    login,
    logout,
    fetchFavorits,
    filterFavorits,
    isActiveUser,
    iauMasking,
    verifyPassword,
    updateUserLang,
    updateLoginState,
    exts:{
      venueCatMap,
      venueCatInfo
    }
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