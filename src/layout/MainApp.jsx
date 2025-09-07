// src/layout/MainApp.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Home, Search, Trophy, Calendar, User, Map, ChevronUp, Star,Icon, History, MessagesSquare, Settings, Tag } from 'lucide-react';
import usePageNavigation from '@hooks/pageHook';
import useWebviewBackBlock from '@hooks/useWebviewBackBlock';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useLoginOverlay } from '@hooks/useLoginOverlay.jsx';

import { PAGE_COMPONENTS, DEFAULT_PAGE } from '../config/pages.config';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { backHandlerRef } from '@hooks/backRef'; 


import { useLocation, useNavigate } from 'react-router-dom';




import './MainApp.css';

const MainApp = () => {
    const location = useLocation();
    const navigate = useNavigate();


     // ✅ iOS 판별 + 네이티브 메시지 함수
    const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;

    const postIOS = (payload) => {
        try {
            window.webkit?.messageHandlers?.native?.postMessage(
                JSON.stringify(payload)
            );
        } catch (e) {
            console.error("iOS postMessage 실패:", e);
        }
    };

    const hideIOSImageViewer = () => {
        if (isIOS) {
            postIOS({ type: "deleteImageViewer" });
        }
    };


    const scrollToTop = () => {
         console.log('올바른 스크롤 리셋');
  
            // 진짜 스크롤 컨테이너인 content-area 리셋
        const contentArea = document.querySelector('.content-area');
            if (contentArea) {
            contentArea.scrollTop = 0;
                contentArea.scrollTo && contentArea.scrollTo(0, 0);
            }

            // window도 리셋
            window.scrollTo(0, 0);
            document.documentElement.scrollTop = 0;
            document.body.scrollTop = 0;
    };
    
    const { user, isLoggedIn, isActiveUser } = useAuth();
    const msgContext = useMsg();
    const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = msgContext;

    const [ activeUser, setActiveUser] = useState({});
    const [loginId, setLoginId] = useState('');
    const [pageRefreshKey, setPageRefreshKey] = useState({});
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    console.log('welcome!', user);

    


    // user 상태 변화 감지 및 처리
    useEffect(() => {
        console.log('User 상태 변경됨:', user);

        setPageRefreshKey(prev => ({
            ...prev,
            [currentPage]: Date.now()
        }));

        
        // 스크롤 리셋
        window.scrollTo(0, 0);
        
        
        // 일반적인 user 상태 변경 처리
        if (user && Object.keys(activeUser).length > 0) {
            setActiveUser({});
        }
        
        // 스크롤 리셋
        window.scrollTo(0, 0);
        if (messages && Object.keys(messages).length > 0) {
            window.scrollTo(0, 0);
        }
    }, [user, messages, currentLang, activeUser, loginId]);

    const {
        pageHistory,
        currentPage,
        navigateToPage,
        navigateToPageWithData,
        navigateToPageFromNotificationData,
        getCurrentPageData,
        navigateToMap,        
        navigateToSearch,     
        navigateToEvents,    
        navigateToProfile,   
        goBack,
        goBackParams,
        PAGES
    } = usePageNavigation();

     useEffect(() => {
        if (isIOS) {
            console.log("페이지 진입 - iOS ImageViewer 초기화");
            hideIOSImageViewer();
        }
    }, [currentPage]);

    useEffect(() => {
        ApiClient.accessLog({
            user_id: user?.user_id, 
            page: currentPage
        });
    }, [currentPage]);

    const processedQueryRef = useRef(false);
    const lastProcessedQuery = useRef('');

    
    
    useEffect(() => {
            const width = window.screen.width;
            const height = window.screen.height;
            const ratio = (height / width).toFixed(2); // 소수점 2자리

            // CSS 변수에 주입
            document.documentElement.style.setProperty("--aspect-ratio", ratio);

            // 조건에 따라 safe-bottom 조정
            const isAndroid = !!window.native;

            if (isAndroid && ratio <= 2.21) {
                document.documentElement.style.setProperty("--safe-bottom", "0px");
            } else {
                document.documentElement.style.setProperty("--safe-bottom", "0px");
            }
        }, []);


  
    useEffect(() => {
      const handleMessage = (event) => {
        // Android WebView → window.postMessage 로 보낸 데이터 받기
        if (event.data === 'onBackPressed') {
            if (backHandlerRef.current) {
                backHandlerRef.current(); // 👈 SketchHeader의 onBack 실행
            } 
            
            if ( backHandlerRef.current == null ) {
                Swal.fire({
                    title: get('PROMOTION_END_BUTTON_SHORT') || '종료',
                    text: get('APP_EXIT_CONFIRM') || '앱을 종료하시겠습니까?',
                    icon: 'question',
                    showCancelButton: true,
                    confirmButtonText: get('PROMOTION_END_BUTTON_SHORT') || '종료',
                    cancelButtonText: get('Common.Cancel') || '취소',
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33'
                }).then((result) => {
                    if (result.isConfirmed) {
                        window.native.postMessage("exitApp");
                    }
                });
            }
        }
      };
    
      // 이벤트 리스너 등록
      document.addEventListener("message", handleMessage); // Android WebView
      window.addEventListener("message", handleMessage);   // iOS WebView 호환
    
      return () => {
        document.removeEventListener("message", handleMessage);
        window.removeEventListener("message", handleMessage);
      };
    }, []);

    // notification 클릭 url 링크
    useEffect(() => {
        const currentQuery = location.search;
        
        // 쿼리스트링이 있고, 이전에 처리한 것과 다른 경우에만 처리
        if (currentQuery && currentQuery !== lastProcessedQuery.current) {
            const params = new URLSearchParams(currentQuery);
            const data = {};
            params.forEach((value, key) => { 
                data[key] = value; 
            });

            const { navigateTo, ...paramsData } = data;
            console.log('쿼리스트링 파싱 결과:', paramsData);
            

            if (navigateTo) {

                //alert(`navigateTo->${navigateTo} | data : ${JSON.stringify(paramsData)}`);

                // 페이지 네비게이션 먼저 실행
                navigateToPageFromNotificationData(navigateTo, paramsData);

                // 처리된 쿼리 기록
                lastProcessedQuery.current = currentQuery;
                processedQueryRef.current = true;

                // 약간의 지연 후 쿼리스트링 제거
                setTimeout(() => {
                    navigate(location.pathname, { replace: false });
                }, 100);
            }
        }
        
        // 쿼리스트링이 없어진 경우 플래그 리셋
        if (!currentQuery && processedQueryRef.current) {
            processedQueryRef.current = false;
            lastProcessedQuery.current = '';
        }
    }, [location.search, location.pathname, navigate]); // navigateToPageFromNotificationData 제거



    // 광고 호출 함수 (useCallback으로 메모이제이션)
    // 광고 호출 주기 설정 (N회마다 광고 호출)
    const AD_CALL_INTERVAL = 5;

    const showAdWithCallback = useCallback(async (
        onAdComplete,
        fallbackAction,
        timeoutMs = 4000,
        forceShow = false
      ) => {
        // ---- helpers: persistent counter ----
        const KEY = 'adCallCount';
        const getCount = () => {
          const raw = localStorage.getItem(KEY);
          const n = parseInt(raw ?? 'NaN', 10);
          if (!Number.isFinite(n) || n < 1) {
            localStorage.setItem(KEY, '1');
            return 1;
          }
          return n;
        };
        const setCount = (n) => localStorage.setItem(KEY, String(n));
        const resetCount = () => setCount(1);
        const incCount = () => setCount(getCount() + 1);
      
        // ---- 최초 보정: 항상 최소 1 ----
        let adCallCount = getCount(); // 보정된 값
        console.log(`광고 호출 횟수(로드): ${adCallCount}`);
      
        // ---- (선택) 사용자 활성 상태 확인 로직 (원본 유지) ----
        let _isActive = false;
        try {
          if (Object.keys(activeUser).length === 0) {
            console.log('need to init');
            const { isActiveUser: isActive = false } = await isActiveUser();
            setActiveUser({ isActive, lastChecked: new Date().toISOString() });
            _isActive = isActive;
            console.log('사용자 상태 초기화 완료:', { isActive });
          } else {
            const today = new Date().toDateString();
            const lastCheckedDate = activeUser.lastChecked
              ? new Date(activeUser.lastChecked).toDateString()
              : null;
            if (!lastCheckedDate || lastCheckedDate !== today) {
              console.log('날짜가 변경되어 재검증합니다.');
              const { isActiveUser: isActive = false } = await isActiveUser();
              setActiveUser({ isActive, lastChecked: new Date().toISOString() });
              _isActive = isActive;
              console.log('사용자 상태 재검증 완료:', { isActive });
            } else {
              _isActive = !!activeUser.isActive;
              console.log('오늘 이미 체크됨:', activeUser);
            }
          }
        } catch (e) {
          console.error('사용자 상태 확인 실패:', e);
          setActiveUser({ isActive: false, lastChecked: new Date().toISOString() });
        }
      
        console.log('showAdWithCallback', activeUser);
      
        // 한시적 무료 강제 (원본 로직 유지)
        _isActive = false;
        if (_isActive) {
          console.warn('active user');
          onAdComplete();
          return;
        }
      
        // ---- 트리거 판정 ----
        // 규칙: 1, N+1, 2N+1 ... 회차에 광고
        const needAd = forceShow || (adCallCount % AD_CALL_INTERVAL === 1);
      
        // 트리거가 아닐 때: 정상 흐름이므로 ++ 후 곧바로 onAdComplete
        if (!needAd) {
          incCount(); // ✅ 광고 없음 → 증가
          adCallCount = getCount();
          console.log(`${adCallCount}회차 - 광고 호출 건너뜀 (${AD_CALL_INTERVAL}회마다 호출). 카운터 증가됨.`);
          onAdComplete();
          return;
        }
      
        console.log(`${adCallCount}회차 - 광고 호출 실행`);
      
        // ---- 중복 실행 가드 (필요 시 전역/Ref로 유지) ----
        if (window.__adShowing) {
          console.warn('이미 광고 진행 중입니다.');
          return;
        }
        window.__adShowing = true;
      
        try {
          // 타임아웃 설정: 실패 간주 시 카운터 변경 없음(규칙)
          const fallbackTimer = setTimeout(() => {
            console.warn('광고 응답 없음 - fallback 실행 (카운터 변경 없음)');
            window.removeEventListener('message', handleAdEvent);
            window.__adShowing = false;
            // ❌ 증가 금지, ❌ 리셋 금지 → 다음 호출에도 동일 회차로 광고 재시도
            fallbackAction?.();
          }, timeoutMs);
      
          const completeAndClear = () => {
            clearTimeout(fallbackTimer);
            window.removeEventListener('message', handleAdEvent);
            window.__adShowing = false;
          };
      
          // 네이티브로부터 이벤트 수신
          const handleAdEvent = (event) => {
            // 메시지 스펙은 환경에 맞게 조정(문자열/객체)
            const data = typeof event.data === 'string' ? event.data : event.data?.type;
      
            if (data === 'adCompleted') {
              // ✅ 광고 완료 → 리셋(=1)
              resetCount();
              console.log('광고 완료 - 카운터 리셋(1)');
              completeAndClear();
              onAdComplete();
            } else if (data === 'adClosed' || data === 'adFailed') {
              // ❌ 미완료(닫힘/실패) → 카운터 변경 없음
              console.warn(`광고 미완료(${data}) - 카운터 변경 없음`);
              completeAndClear();
              fallbackAction?.();
            }
          };
      
          window.addEventListener('message', handleAdEvent);
      
          // 웹뷰 판단 및 광고 호출
          const isAndroid = !!window.native?.postMessage || !!window.native;
          const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;
      
          if (isAndroid) {
            // 안드: 문자열 대신 구조화 권장
            try {
              // window.native.postMessage("showAd");
              window.native.postMessage(JSON.stringify({ type: 'showAd' }));
            } catch {
              // 일부 환경은 문자열만 지원
              window.native.postMessage('showAd');
            }
          } else if (isIOS) {
            window.webkit.messageHandlers.native.postMessage({ type: 'showAd' });
          } else {
            console.warn('웹뷰 환경이 아님 - fallback 실행 (카운터 변경 없음)');
            completeAndClear();
            fallbackAction?.();
          }
        } catch (error) {
          console.error('광고 호출 중 예외 발생:', error);
          // ❌ 예외 시에도 카운터 변경 없음
          window.__adShowing = false;
          fallbackAction?.();
        }
      }, []);
      




    /*
    const showAdWithCallback = useCallback(async (onAdComplete, fallbackAction, timeoutMs = 4000, forceShow = false) => {
        
        // 한시적 광고 비활성화
        let isAdDisabled = false;
        if(isAdDisabled){
            onAdComplete();
            return;
        }
        
        // 세션스토리지에서 광고 호출 횟수 관리
        const adCallCountKey = 'adCallCount';
        let adCallCount = parseInt(localStorage.getItem(adCallCountKey) || '1');
        adCallCount++;
        localStorage.setItem(adCallCountKey, adCallCount.toString());
        
        console.log(`광고 호출 횟수: ${adCallCount}`);

        let _isActive = false;

        if (Object.keys(activeUser).length === 0) {
            // 빈 객체인 경우
            console.log('need to init');

            try {
                const {isActiveUser:isActive = false, subscription = {}} = await isActiveUser();
                
                setActiveUser({
                    isActive,
                    lastChecked: new Date().toISOString()
                });

                _isActive = isActive;
                
                console.log('사용자 상태 초기화 완료:', { isActive, lastChecked: new Date().toISOString() });
                
            } catch (error) {
                console.error('사용자 상태 확인 실패:', error);
                setActiveUser({
                    isActive: false,
                    lastChecked: new Date().toISOString()
                });
            }

        }else{
             // 빈 객체가 아닌 경우 - 날짜 체크
            const today = new Date().toDateString();
            const lastCheckedDate = activeUser.lastChecked 
                ? new Date(activeUser.lastChecked).toDateString() 
                : null;
            
            if (!lastCheckedDate || lastCheckedDate !== today) {
                // 하루가 지났거나 처음 체크하는 경우 - 재검증
                console.log('날짜가 변경되어 재검증합니다.');
                
                try {
                    const {isActiveUser:isActive = false, subscription = {}} = await isActiveUser();
                    
                    setActiveUser({
                        isActive,
                        lastChecked: new Date().toISOString()
                    });

                    _isActive = isActive;
                    
                    console.log('사용자 상태 재검증 완료:', { isActive, lastChecked: new Date().toISOString() });
                    
                } catch (error) {
                    console.error('사용자 상태 재검증 실패:', error);
                    setActiveUser({
                        isActive: false,
                        lastChecked: new Date().toISOString()
                    });
                }
            } else {
                // 오늘 이미 체크한 경우 - 기존 상태 유지
                console.log('오늘 이미 체크됨:', activeUser);
            }
        }

        console.log('showAdWithCallback', activeUser);

        // 한시적 무료
        // 모든이 광고 필수
        _isActive = false;

        if(_isActive) {
            console.warn('active user');
            onAdComplete();
            return;
        }

        // N회마다 광고 호출 (1, N+1, 2N+1... 회차에 광고 호출)
        //if (adCallCount % AD_CALL_INTERVAL !== 1) {
        if (!forceShow && adCallCount % AD_CALL_INTERVAL !== 1) {
            console.log(`${adCallCount}회차 - 광고 호출 건너뜀 (${AD_CALL_INTERVAL}회마다 호출)`);
            onAdComplete();
            return;
        }

        console.log(`${adCallCount}회차 - 광고 호출 실행`);


        try {
            // 광고 응답 대기 타이머 (기본 4초)
            const fallbackTimer = setTimeout(() => {
                console.warn('광고 응답 없음 - fallback 실행');
                // 광고 실패 시에도 카운터 리셋
                adCallCount = adCallCount - 1;
                localStorage.setItem(adCallCountKey, adCallCount);
                fallbackAction();
            }, timeoutMs);

            // 광고 성공 시 타임아웃 제거 후 콜백 실행
            const handleAdComplete = (event) => {
                if (event.data === 'adCompleted') {
                    clearTimeout(fallbackTimer);
                    window.removeEventListener('message', handleAdComplete);
                    // 광고 성공 시 카운터 리셋
                    localStorage.setItem(adCallCountKey, '1');
                    console.log('광고 완료 - 카운터 리셋');
                    onAdComplete();
                }
            };

            window.addEventListener('message', handleAdComplete);

            // 광고 요청 (iOS / Android 공통 처리)
            const isAndroid = !!window.native;
            const isIOS = !!window.webkit?.messageHandlers?.native?.postMessage;
            
            if (isAndroid) {
                window.native.postMessage("showAd");
            } else if (isIOS) {

                window.webkit.messageHandlers.native.postMessage("showAd");
            } else {
                console.warn('웹뷰 환경이 아님 - 바로 fallback 실행');
                clearTimeout(fallbackTimer);
                // 웹뷰 환경이 아닐 때도 카운터 리셋
                localStorage.setItem(adCallCountKey, '1');
                fallbackAction();
            }
        } catch (error) {
            console.error('광고 호출 중 예외 발생:', error);
            //alert(JSON.stringify(error));
            // 예외 발생 시에도 카운터 리셋
            localStorage.setItem(adCallCountKey, '1');
            fallbackAction();
        }
    }, []); 
    */

    
    const navigationProps = {
        pageHistory,
        navigateToMap,
        navigateToSearch,
        navigateToEvents,
        navigateToProfile,
        navigateToPage,
        navigateToPageWithData,
        goBack,
        goBackParams,
        PAGES,
        showAdWithCallback
    };


    


    // 커스텀 훅 사용 - 로그인 성공 시 추가 재렌더링 콜백
    const handleLoginSuccess = useCallback((userData) => {
        setLoginId(crypto.randomUUID());
        
        // 현재 페이지만 재렌더링
        setPageRefreshKey(prev => ({
            ...prev,
            [currentPage]: Date.now()
        }));
    }, [currentPage]);

    const { openLoginOverlay } = useLoginOverlay(navigationProps, handleLoginSuccess);

//console.log('PAGES', PAGES)

    // 현재 페이지 렌더링 (데이터와 함께)
    // 페이지 이동시 MainApp.jsx에 정의 필요
    const renderCurrentPage = () => {
        const pageData = getCurrentPageData();
        const PageComponent = PAGE_COMPONENTS[currentPage] || PAGE_COMPONENTS[DEFAULT_PAGE];
        
        // 페이지별 refresh key를 사용하여 특정 페이지만 재렌더링
        const pageKey = pageRefreshKey[currentPage] 
            ? `${currentPage}-${pageRefreshKey[currentPage]}` 
            : currentPage;
        
        return <PageComponent key={pageKey} {...pageData} {...navigationProps} />;
    };
    const handleMapClick = () => {
        navigateToMap({
            searchFrom: 'home',
        });
    };




    // 네비게이션 메뉴들
    const navigationItems = [
        { id: PAGES.HOME, icon: Home, label: get('Footer1.3'), needLogin:false },
        // { id: PAGES.SEARCH, icon: Search, label: get('btn.searchMap.1.1'), needLogin:false },
        { id: PAGES.RANKING, icon: Trophy, label: get('TITLE_RANK'), needLogin:false },
        { id: PAGES.PROMOTION, icon: Tag, label: get('btn.promotion.1'), needLogin:false },
        { id: PAGES.VIEWREVIEW, icon: Star, label: get('Profile1.1') ,needLogin:false},
        { id: PAGES.ACCOUNT, icon: Settings, label: get('MENU_SETTINGS'), needLogin:true }
    ];

    return (
        
        <div className="main-app-container">
            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            <main className="content-area">
                {renderCurrentPage()}
            </main>

            {/* 하단 네비게이션 (고정) */}.
            {currentPage !== 'CHATTING' && (
            <nav className="bottom-navigation">
                <div className="nav-container">
                    {<HatchPattern opacity={0.3} />}
                    {navigationItems.map(({ id, icon: Icon, label, data = false, needLogin = false }) => (
                       <button
                            key={id}
                            onClick={() => {

                                if(needLogin){
                                    if(!user || user?.user_id == 1){

                                        openLoginOverlay(id, data);
                                        return;
                                    }
                                }

                                 if (id === PAGES.HOME) {
                                    localStorage.setItem('homeScrollY', '0');
                                }

                                  if (id === PAGES.RANKING) {
                                    localStorage.setItem('rankScrollRatio',0);
                                    localStorage.setItem('rankScrollY',0);
                                }

                                if (id === PAGES.PROMOTION) {
                                    localStorage.setItem('promotionScrollY',0);
                                }
                               

                                //const blockPage = [ PAGES.RANKING, PAGES.CHATTINGLIST, PAGES.BOOKINGHISTORY];
                                const blockPage = [ PAGES.CHATTINGLIST, PAGES.BOOKINGHISTORY];

                                if(id == PAGES.RANKING ){
                                    localStorage.setItem('rankingType', 'venue');
                                    

                                    navigateToPage(id);


                                    /*
                                    showAdWithCallback(
                                        // 광고 완료 시 콜백
                                        () => {
                                            navigateToPage(id);
                                        },
                                        // fallback 콜백 (광고 응답 없을 때)
                                        () => {
                                            navigateToPage(id);
                                        },
                                        1000, // 1초 타임아웃
                                        false // 강제 광고 표시(광고 호출 주기 무시)
                                      );
                                      */


                                      return;
                                }

                                if(id == PAGES.VIEWREVIEW ){

                                    const INITIAL_STATE = {
                                    scrollY: 0,
                                    sortOrder1: "latest",
                                    sortOrder: "latest",
                                    targetTypeFilter: "venue"
                                    };

                                    localStorage.setItem("viewReviewPageState", JSON.stringify(INITIAL_STATE));
                                    showAdWithCallback(
                                        // 광고 완료 시 콜백
                                        () => {
                                            navigateToPage(id);
                                        },
                                        // fallback 콜백 (광고 응답 없을 때)
                                        () => {
                                            navigateToPage(id);
                                        },
                                        1000 // 1초 타임아웃
                                      );
                                      return;
                                }
                                    

                               if(blockPage.includes(id)) {
                                    console.log("activeUser", activeUser);

                                    

                                    // activeUser 상태가 빈 객체이거나 isActive가 false인 경우
                                    if (Object.keys(activeUser).length === 0) {
                                        
                                        isActiveUser().then(({isActiveUser: isActive = false}) => {
                                            setActiveUser({
                                                isActive,
                                                lastChecked: new Date().toISOString()
                                            });

                                            // API 결과에 따라 처리
                                            if (!isActive) {

                                                let swalTitle = get('ranking_swal_title');
                                                let swalText = get('RANKING_PURCHASE_MESSAGE');
                                                
                                                if(id === PAGES.RANKING){
                                                    
                                                    swalTitle = get('ranking_swal_title');
                                                    swalText = get('RANKING_PURCHASE_MESSAGE');
                                                }else if(id === PAGES.CHATTINGLIST){
                                                    swalTitle = get('chatting_swal_title');
                                                    swalText = get('CHATTING_PURCHASE_MESSAGE');
                                                }else if(id === PAGES.BOOKINGHISTORY){
                                                    swalTitle = get('booking_swal_title');
                                                    swalText = get('BOOKING_PURCHASE_MESSAGE');
                                                }


                                                Swal.fire({
                                                    title: swalTitle,
                                                    text: swalText,
                                                    icon: 'question',
                                                    showCancelButton: true,
                                                    confirmButtonText: get('Popup.Button.TodayTrial'),
                                                    cancelButtonText: get('Common.Cancel'),
                                                    confirmButtonColor: '#3085d6',
                                                    cancelButtonColor: '#d33'
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        navigate('/purchase');
                                                    }
                                                });
                                            } else {
                                                navigateToPage(id);
                                            }
                                        }).catch(error => {
                                            console.error('사용자 상태 확인 실패:', error);
                                            // 에러 시 구매 페이지로 이동
                                            navigate('/purchase');
                                        });
                                        return;
                                    }
                                }
                                
                                
                                if (data) {
                                    navigateToPageWithData(id, data);
                                } else {
                                    navigateToPage(id);
                                }
                            }}
                            className={`nav-item ${currentPage === id ? 'active' : ''}`}
                        >
                            <div className="nav-icon-container">
                                <Icon className="nav-icon" />
                                {/* 채팅 버튼에만 뱃지 추가 */}
                               
                            </div>
                            <span className="nav-label">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>
            )}
            {currentPage == 'HOME' && (
                <section className="bottom-map-section">
                    <div className="map-icon-container" onClick={handleMapClick}>
                    <Map size={20} /> <span style={{marginLeft: '5px'}}>{get('Main1.1')}</span>
                    </div>
                </section>
                )}

            {currentPage == 'HOME' && (
                 <button className="scroll-up-btn" onClick={scrollToTop}>
                    <ChevronUp size={24} />
                    </button>
                    )}

                               <LoadingScreen 
                                         variant="cocktail"
                                         loadingText="Loading..."
                                         isVisible={isLoading} 
                                       />
        </div>
    );
};

export default MainApp;


