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

import Cocktail from '@components/CocktailIcon';
import HatchPattern from '@components/HatchPattern';

import PurchasePage from '@components/PurchasePage';

import DownloadIOS from '@components/Welcome/downloadIOS';
import DownloadAndroid from '@components/Welcome/downloadAndroid';
import Block from '@components/Welcome/Block';


import Swal from 'sweetalert2';


const AppRoutes = () => {
  const { deviceLogin, isLoggedIn } = useAuth();
  const { currentLang, messages } = useMsg();

  const [appVersion, setAppVersion] = useState(null); // 없을 때는 null 유지

  useEffect(() => {
    const init = async () => {
    const currentQuery = window.location.href;
    const url = new URL(currentQuery);
    const params = new URLSearchParams(url.search);
    const versionFromParam = params.get('version');
    const pathname = url.pathname;


    const today = new Date().toLocaleDateString('sv-SE');  // YYYY-MM-DD
    let hasFetched = localStorage.getItem("hasFetchedNotice");

    // hasFetched 값이 "true"가 아니고, 오늘 날짜도 아니면 false로 설정
    if (hasFetched !== today) {
      localStorage.setItem("hasFetchedNotice", "false");
    }

    hasFetched = localStorage.getItem('hasFetchedNotice');

    // ✅ 저장된 버전이 있는 경우
    let version = versionFromParam || localStorage.getItem('app_version');

    // ✅ 버전이 있으면 localStorage에 저장
    if (versionFromParam) {
      localStorage.setItem('app_version', versionFromParam);
    }

    // ✅ 전역 상태에도 반영
    setAppVersion(version);

    const compareVersions = (v1, v2) => {
      const a = v1.split('.').map(Number);
      const b = v2.split('.').map(Number);
      for (let i = 0; i < Math.max(a.length, b.length); i++) {
        if ((a[i] || 0) > (b[i] || 0)) return 1;
        if ((a[i] || 0) < (b[i] || 0)) return -1;
      }
      return 0;
    };

    const isAndroid = !!window.native;
    const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;

    try {
      const uuid = await getUUIDTmp();

      const allowedUUIDs = [
        '2E14837B-E59D-4812-BA9E-583E20947AAC',
        '89716887-4177-4DD9-A76A-9DB026231E6D',
        'FCCD560A-D1D2-4CEC-A0CA-F5888E5A6B35',
        '259d616410fefca9',
        '7f94a544b7a4fa9a',
        '8a19307d021cf7a5'
      ];

      if (!allowedUUIDs.includes(uuid)) {
        // navigate('/block');
        // return;
      }

    } catch (err) {
      console.error('UUID 오류:', err);
      //Swal.fire('UUID 에러', err.toString(), 'error');
      
    }


    const isNotNative = !isAndroid && !isIOS;

    let vcObj = {
      isLatestVersion: false,
      isAndroid, isIOS, isNotNative
    };



    localStorage.setItem('versionCheck', JSON.stringify(vcObj));

    const saveVersionCheck = (isLatest) => {
      vcObj.isLatestVersion = isLatest;
      localStorage.setItem('versionCheck', JSON.stringify(vcObj));
    };

    // ✅ 버전 분기 처리
    if (version) {
       if (isAndroid && compareVersions(version, '1.0.10') < 0) {
          navigate('/downloadAndroid');
       } else if (isIOS && compareVersions(version, '1.0.8') < 0) {
          navigate('/downloadIOS');
      }
    } else {
      if (isAndroid && compareVersions(version, '1.0.10') < 0) {
         navigate('/downloadAndroid');
       } else if (isIOS && compareVersions(version, '1.0.8') < 0) {
         navigate('/downloadIOS');
      }
    }


    if (version) {
       if (isAndroid && compareVersions(version, '1.0.10') == 0) {
          saveVersionCheck(true);
       } else if (isIOS && compareVersions(version, '1.0.8') == 0) {
          saveVersionCheck(true);
      }
    }





/*
      if (version) {
       if (isAndroid && compareVersions(version, '1.0.9') < 0) {
          saveVersionCheck(false);
       } else if (isIOS && compareVersions(version, '1.0.6') < 0) {
          saveVersionCheck(false);
      }
    } else {
      if (isAndroid && compareVersions(version, '1.0.9') < 0) {
         saveVersionCheck(false);
       } else if (isIOS && compareVersions(version, '1.0.6') < 0) {
         saveVersionCheck(false);
      }
    }
*/

    if (isNotNative) {
      saveVersionCheck(false);
    }


  };

  init();
}, []);



    useEffect(() => {
      deviceLogin();
    }, [deviceLogin]);

    useEffect(() => {
      // body에 현재 언어 속성 추가
      document.body.setAttribute('data-lang', currentLang);
      
      // 또는 클래스 방식
      document.body.classList.remove('lang-en', 'lang-ko', 'lang-ja', 'lang-zh', 'lang-cn');
      document.body.classList.add(`lang-${currentLang}`);
    }, [currentLang]);

  const navigate = useNavigate();

  const handleWelcomeComplete = () => {
    // 튜토리얼 완료 시 로그인 상태 체크
    if (isLoggedIn) {
      navigate('/main');
    } else {
      navigate('/main');
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

      <Route
        path="/downloadIOS"
        element={
          <DownloadIOS />
        }
      />

      <Route
        path="/downloadAndroid"
        element={
          <DownloadAndroid />
        }
      />

      
      <Route
        path="/block"
        element={
          <Block />
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
          <MainApp />
          /*isLoggedIn ? <MainApp /> : <Navigate to="/login" replace />*/
        }
      />

      {/* Terms 페이지 */}
      <Route path="/terms" element={<TermsView />} />

      {/* Privacy 페이지 */}
      <Route path="/privacy" element={<PrivacyView />} />

      <Route
        path="/purchase"
        element={
          <PurchasePage />
        }
      />

      {/* 404 페이지 */}
      <Route path="*" element={<div>404 Not Found</div>} />
    </Routes>
  );
};


//import { ShieldCheck, Clock, Package, Globe, QrCode } from 'lucide-react';
import { ShieldCheck, Clock, Gift , MessagesSquare, ShoppingBasket,  Package, Globe, QrCode } from 'lucide-react';

const LeTantonSheriffPage = () => {
  return (
    <>
      <style jsx="true">{`

         #root {
          padding: 0;
          margin: 0;
        }

        /* body도 함께 초기화하는 것이 좋음 */
        body {
          margin: 0;
          padding: 0;
        }


        .main-container {
          margin: 0 auto;
          background-color: white;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          line-height: 1.4;
        }

        .content-container{
          padding:1.5rem;
          background-color: white;
          z-index:1
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          padding-bottom: 1.0rem;
          border-bottom: 2px solid #e5e7eb;
          position: relative;
          background-color: #fafafa;
        }

        .header::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d1d5db' stroke-width='1' opacity='0.4'%3E%3Cpath d='M-10,-10 L70,70 M-5,-15 L65,65 M-15,-5 L65,75 M0,-20 L80,60 M-20,0 L60,80'/%3E%3C/g%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5e7eb' stroke-width='0.8' opacity='0.3'%3E%3Cpath d='M-10,50 L50,-10 M-5,45 L45,-5 M0,40 L40,0 M5,45 L45,5 M10,50 L50,10'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 60px 60px, 40px 40px;
          background-position: 0 0, 20px 20px;
          pointer-events: none;
          z-index: 1;
        }

        .header > * {
          position: relative;
          z-index: 2;
        }

        .logo-section {
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-text {
          font-size: 1.6rem;
          font-weight: bold;
          color: #333;
        }

        .subtitle {
          font-size: 1rem;
          color: #6b7280;
          padding: 0.5rem 1rem;
          /* background-color: rgba(255, 255, 255, 0.8);*/
          border-radius: 4px;
        }

        .main-title {
          font-size: 2rem;
          font-weight: bold;
          color: #333;
          margin-bottom: 0.1rem;
        }

        .main-description {
          font-size: 1rem;
          color: #6b7280;
          margin-bottom: 2rem;
        }

        .features-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 2.5rem;
        }

        .feature-item {
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .feature-header {
          display: flex;
          align-items: center;
          gap: 0.8rem;
        }

        .feature-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .feature-title {
          font-size: 1.1rem;
          font-weight: bold;
          color: #333;
        }

        .feature-content {
          padding-left: 3.4rem;
        }

        .feature-content p {
          margin: 0.3rem 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .qr-section {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin: 1rem 0;
        }

        .qr-placeholder {
          width: 200px;
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
          position: relative;
          border: 2px dashed #d1d5db;
          background-color: #f9fafb;
        }

        .qr-placeholder::before {
          content: '';
          position: absolute;
          top: 10px;
          left: 10px;
          right: 10px;
          bottom: 10px;
        }

        .qr-content {
          flex: 1;
        }

        .qr-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #333;
          margin-top:1rem;
          margin-bottom: 1rem;
        }

        .qr-button {
          border: 2px solid #333;
          border-radius: 6px 8px 4px 6px;
          padding: 0.7rem 1.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          color: #333;
          margin-top: 1rem;
        }

        .qr-button:hover {
          transform: translateY(-1px);
          box-shadow: 2px 2px 0px #333;
        }

        .bottom-message {
          font-size: 1rem;
          color: #374151;
          padding-left: 4rem;
          margin-bottom: 2rem;
        }

        .dummy-space{
          padding-top: 0.5rem;
          padding-bottom: 0.5rem;
        }

        .footer {
          padding: 1.5rem;
          border-top: 2px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: #6b7280;
          font-size: 0.85rem;
          position: relative;
          background-color: #fafafa;
        }

        .footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: 
            url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23d1d5db' stroke-width='1' opacity='0.4'%3E%3Cpath d='M-10,-10 L70,70 M-5,-15 L65,65 M-15,-5 L65,75 M0,-20 L80,60 M-20,0 L60,80'/%3E%3C/g%3E%3C/svg%3E"),
            url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23e5e7eb' stroke-width='0.8' opacity='0.3'%3E%3Cpath d='M-10,50 L50,-10 M-5,45 L45,-5 M0,40 L40,0 M5,45 L45,5 M10,50 L50,10'/%3E%3C/g%3E%3C/svg%3E");
          background-size: 80px 80px, 50px 50px;
          background-position: 0 0, 25px 25px;
          pointer-events: none;
          z-index: 1;
        }

        .footer > * {
          position: relative;
          z-index: 2;
        }

        .footer-contact {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          /* background-color: rgba(255, 255, 255, 0.8);*/
          border-radius: 4px;
        }

        .footer-links {
          display: flex;
          gap: 2rem;
        }

        .footer-links a {
          color: #6b7280;
          text-decoration: none;
        }

        .footer-links a:hover {
          color: #333;
        }

        .copyright {
          text-align: right;
          padding: 0.5rem 1rem;
          /* background-color: rgba(255, 255, 255, 0.8);*/ 
          border-radius: 4px;
        }

        /* 반응형 */
        @media (max-width: 768px) {
          .main-container {
            padding: 1rem;
          }

          .header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .features-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .qr-section {
            flex-direction: column;
            text-align: center;
          }

          .footer {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .footer-links {
            flex-direction: column;
            gap: 0.5rem;
          }

          .bottom-message {
            padding-left: 0;
          }
        }
      `}</style>

      <div className="main-container">
        {/* 헤더 */}
        <div>
          <div className="header">            
            <div className="logo-section">
              <div className="logo-icon">
                <Cocktail />
              </div>
              <span className="logo-text">LeTanton Sheriff</span>
            </div>
            <div className="subtitle">
              호치민 레탄톤의 프리미엄 나이트라이프 가이드
            </div>
          </div>

          {/* <HatchPattern opacity={0.8} />*/}
          
        </div>
        

        <div className="content-container">

          {/* 메인 타이틀 */}
          <div className="main-title">
            모바일에서만 제공되는 특별한 경험!
          </div>
          <div className="main-description">
            지금 스마트폰으로 레탄톤 보안관에 접속하고 모든 혜택을 누리세요.
          </div>

          {/* 서비스 핵심 가치 */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', color: '#333' }}>
              서비스 핵심 가치
            </h2>

            <div className="features-grid">
              <div className="feature-item">
                <div className="feature-header">
                  <div className="feature-icon">
                    <ShoppingBasket size={24} />
                  </div>
                  <div className="feature-title">안전한 예약 시스템</div>
                </div>
                <div className="feature-content">
                  <p>검증된 바와 스탭 정보</p>
                  <p>실시간 예약 확인 및 취급 서비스</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-header">
                  <div className="feature-icon">
                    <MessagesSquare size={24} />
                  </div>
                  <div className="feature-title">실시간 채팅 지원</div>
                </div>
                <div className="feature-content">
                  <p>예약별 바/스탭과 직접 소통</p>
                  <p>변경사항 즉시 조정 가능</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-header">
                  <div className="feature-icon">
                    <Gift size={24} />
                  </div>
                  <div className="feature-title">예약권 구매 혜택</div>
                </div>
                <div className="feature-content">
                  <p>안전한 픽업 서비스</p>
                  <p>무제한 스탭 검색</p>
                </div>
              </div>

              <div className="feature-item">
                <div className="feature-header">
                  <div className="feature-icon">
                    <Globe size={24} />
                  </div>
                  <div className="feature-title">현지화된 정보</div>
                </div>
                <div className="feature-content">
                  <p>레탄톤 지역 한정 정확한 정보</p>
                  <p>베트남어/영어/한국어 완벽 지원</p>
                </div>
              </div>
            </div>
          </div>

          {/* QR 코드 섹션 */}
          <div className="qr-section">
            <div className="qr-placeholder">
              <img src="/cdn/qr.png" style={{"width": "100%"}}></img>
            </div>
            <div className="qr-content">
              <div className="qr-title">
                QR 코드를 스캔하시면 모바일 웹 페이지로 이동합니다
                <div className="dummy-space"></div>
              </div>
            </div>
          </div>

          {/* 하단 메시지 */}
          <div className="bottom-message">
            모바일에서는 더 빠른 예약, 실시간 알림, 위치 기반 추천 등 더 많은 기능을 이용할 수 있습니다!
          </div>


        </div>

        {/* 푸터 */}
        <div className="footer">
          <div className="footer-contact">
            <div>연락처: support@letantonsheriff.com</div>
            <div className="footer-links">
              <a href="#">약관</a>
              <a href="#">개인정보처리방침</a>
            </div>
          </div>
          <div className="copyright">
            © 2025 Le Thanh Ton Sheriff, All rights reserved.
          </div>
        </div>
      </div>
    </>
  );
};



// NotificationHandler를 별도 컴포넌트로 분리
const NotificationHandler = () => {
  const navigate = useNavigate(); // Router 안에서 사용 가능
  const { setFcmToken } = useFcm();

  useEffect(() => {
    window.ReactReady = true;

    window.onNotificationClick = (navigateTo, data) => {
      let prefix = '/main' ;
      // (data?.chatRoomType === 'staff') ? '/staff' : '/manager';

      // 쿼리스트링 생성 (navigateTo, chatRoomType 등 불필요한 값은 제외 가능)
      const params = new URLSearchParams({
        ...data,
        navigateTo // 목적지 페이지 정보도 쿼리로!
      }).toString();

      navigate(`${prefix}?${params}`);
    };
  }, [navigate]);

  useEffect(() => {
    window.receiveFcmToken = (token) => {
      setFcmToken(token); // 정상 작동
    };

    if (window.native?.readyToReceiveToken) {
      window.native.readyToReceiveToken();
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
  const { setFcmToken } = useFcm();

  useEffect(() => {
    window.receiveFcmToken = (token) => {
      setFcmToken(token); // 정상 작동
    };

    if (window.native?.readyToReceiveToken) {
      window.native.readyToReceiveToken();
    }

    return () => {
      delete window.receiveFcmToken;
    };
  }, [setFcmToken]);

  return (
    <Router basename={import.meta.env.BASE_URL}>
      <NotificationHandler />
      <AppRoutes />
      <GlobalPopupManager />
    </Router>
  );
};

////////////////////////////////////////////////////////////
// MAIN APP (ROOT)
function App() {
  useEffect(() => {


    // 0. 앱 시작시 스크롤 위치 초기화
    localStorage.removeItem('homeScrollY');
    localStorage.removeItem('discoverScrollY');

    // 1. 확대 기능 비활성화
    const disableZoom = () => {
        const contentValue = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        const metaViewport = document.querySelector('meta[name="viewport"]');

        if (metaViewport) {
          metaViewport.setAttribute('content', contentValue);
        } else {
          const meta = document.createElement('meta');
          meta.name = 'viewport';
          meta.content = contentValue;
          document.head.appendChild(meta);
        }

        // CSS 및 이벤트 방지는 그대로 유지
        const style = document.createElement('style');
        style.textContent = `
          * {
            touch-action: manipulation;
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

        const preventZoomGestures = (e) => {
          if (e.touches && e.touches.length > 1) {
            const allowZoomElements = e.target.closest('[data-allow-zoom="true"]');
            if (!allowZoomElements) {
              e.preventDefault();
            }
          }
        };

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
    // const cleanupBack = disableBackButton();

    return () => {
      cleanupZoom && cleanupZoom();
      // cleanupBack && cleanupBack();
    };
  }, []);

  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);


  // 모바일이 아닌 경우
  if (!isMobile) {
    return (
      <LeTantonSheriffPage />
    )
  }

  // 모바일 환경 
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
////////////////////////////////////////////////////////////

export const getUUIDTmp = () => {
  return new Promise((resolve, reject) => {
    let resolved = false;

    const handleMessage = (event) => {
      resolved = true;
      window.removeEventListener('message', handleMessage);
      resolve(event.data);
    };

    // iOS WebView
    if (window.webkit?.messageHandlers?.native?.postMessage) {
      window.addEventListener('message', handleMessage);
      window.webkit.messageHandlers.native.postMessage('getUUID');
    }
    // Android WebView
    else if (window.native?.postMessage) {
      window.addEventListener('message', handleMessage);
      window.native.postMessage('getUUID');
    }
    else {
      reject('❌ Native 환경이 아님');
    }

    // 10초 타임아웃 처리
    setTimeout(() => {
      if (!resolved) {
        window.removeEventListener('message', handleMessage);
        reject('⏱ UUID 수신 타임아웃');
      }
    }, 10000);
  });
};




export default App;