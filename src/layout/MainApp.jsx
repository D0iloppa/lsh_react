// src/layout/MainApp.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Home, Search, Calendar, User, Map, ChevronUp, Star, History, MessagesSquare } from 'lucide-react';
import usePageNavigation from '@hooks/pageHook';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import { PAGE_COMPONENTS, DEFAULT_PAGE } from '../config/pages.config';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';

import { useLocation, useNavigate } from 'react-router-dom';

import './MainApp.css';

const MainApp = () => {


  const scrollToTop = () => {
   console.log('단계별 안전 스크롤');
    
    // 1단계: 다른 컨테이너들 먼저 정리
    const containers = document.querySelectorAll('[class*="container"], [class*="wrapper"], [class*="app"], main, #root, #app');
    containers.forEach(container => {
      if (container.scrollTop > 0) {
        if (container.scrollTo) {
          container.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
          container.scrollTop = 0;
        }
      }
    });
    
    // 2단계: 50ms 후 window 스크롤
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
    
    // 3단계: 백업 - 1초 후에도 스크롤이 안 됐으면 강제 실행
    setTimeout(() => {
      if (window.scrollY > 10) { // 10px 이상 남아있으면
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        window.scrollTo(0, 0);
      }
    }, 1000);
};

    const location = useLocation();
    const navigate = useNavigate();

    
    const { user, isLoggedIn, isActiveUser } = useAuth();
    const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

    const [ activeUser, setActiveUser] = useState({});
    

    console.log('welcome!', user);

    useEffect(() => {
        window.scrollTo(0, 0);
        if (messages && Object.keys(messages).length > 0) {
                window.scrollTo(0, 0);
              }
    
      }, [messages, currentLang, activeUser]);

    const {
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
        PAGES
    } = usePageNavigation();

    const processedQueryRef = useRef(false);
    const lastProcessedQuery = useRef('');

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
    const showAdWithCallback = useCallback(async (onAdComplete, fallbackAction, timeoutMs = 4000) => {

        const clickCount = parseInt(localStorage.getItem('adClickCount') || '0');
        const newClickCount = clickCount + 1;
    
        // 새로운 클릭 횟수를 localStorage에 저장
        localStorage.setItem('adClickCount', newClickCount.toString());
        
        console.log(`클릭 횟수: ${newClickCount}/5`);
        // 5회마다 광고 표시
        if (newClickCount % 5 !== 0) {
            console.log('5회 미만 - 광고 스킵');
            onAdComplete(); // 광고 없이 바로 완료 처리
            return;
        }



        let currentActiveUser = activeUser; // 로컬 변수로 현재 상태 복사


        if (Object.keys(activeUser).length === 0) {
            // 빈 객체인 경우
            console.log('need to init');

            try {
                const {isActiveUser:isActive = false, subscription = {}} = await isActiveUser();
                
                // 로컬 변수 업데이트
                currentActiveUser = {
                    isActive,
                    lastChecked: new Date().toISOString()
                };
                
                // 상태도 업데이트
                setActiveUser(currentActiveUser);
                
                console.log('사용자 상태 초기화 완료:', { isActive, lastChecked: new Date().toISOString() });
                
            } catch (error) {
                console.error('사용자 상태 확인 실패:', error);
                currentActiveUser = {
                    isActive: false,
                    lastChecked: new Date().toISOString()
                };
                setActiveUser(currentActiveUser);
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
                    
                    currentActiveUser = {
                        isActive,
                        lastChecked: new Date().toISOString()
                    };
                    
                    setActiveUser(currentActiveUser);
                    console.log('사용자 상태 재검증 완료:', currentActiveUser);
                    
                } catch (error) {
                    console.error('사용자 상태 재검증 실패:', error);
                    currentActiveUser = {
                        isActive: false,
                        lastChecked: new Date().toISOString()
                    };
                    setActiveUser(currentActiveUser);
                }
            } else {
                // 오늘 이미 체크한 경우 - 기존 상태 유지
                console.log('오늘 이미 체크됨:', activeUser);
            }
        }

        console.log('showAdWithCallback', currentActiveUser);

        if(currentActiveUser.isActive){
            // 티켓구메 유저 무조건 fallback
            fallbackAction();
            return;
        }

        try {
            // 광고 응답 대기 타이머 (기본 4초)
            const fallbackTimer = setTimeout(() => {
                console.warn('광고 응답 없음 - fallback 실행');
                fallbackAction();
            }, timeoutMs);

            // 광고 성공 시 타임아웃 제거 후 콜백 실행
            const handleAdComplete = (event) => {
                if (event.data === 'adCompleted') {
                    clearTimeout(fallbackTimer);
                    window.removeEventListener('message', handleAdComplete);
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
                fallbackAction();
            }
        } catch (error) {
            console.error('광고 호출 중 예외 발생:', error);
            alert(JSON.stringify(error));
            fallbackAction();
        }
    }, [activeUser.isActive, activeUser.lastChecked]); 
    
    const navigationProps = {
        navigateToMap,
        navigateToSearch,
        navigateToEvents,
        navigateToProfile,
        navigateToPage,
        navigateToPageWithData,
        goBack,
        PAGES,
        showAdWithCallback
    };


    // 현재 페이지 렌더링 (데이터와 함께)
    // 페이지 이동시 MainApp.jsx에 정의 필요
    const renderCurrentPage = () => {
        const pageData = getCurrentPageData();
        const PageComponent = PAGE_COMPONENTS[currentPage] || PAGE_COMPONENTS[DEFAULT_PAGE];
        
        return <PageComponent {...pageData} {...navigationProps} />;
    };
    const handleMapClick = () => {
        navigateToMap({
            searchFrom: 'home',
        });
    };

    // 네비게이션 메뉴들
    const navigationItems = [
        { id: PAGES.HOME, icon: Home, label: get('Footer1.3') },
        { id: PAGES.SEARCH, icon: Search, label: get('btn.searchMap.1.1') },
    {
        id: PAGES.CHATTINGLIST,
        icon: MessagesSquare,
        label: get('MENU_CHATTING'),
            data: { 
                chatRoomType: 'user'
            }   
        },
        { id: PAGES.BOOKINGHISTORY, icon: History, label: get('menu.reserve.history') },
        { id: PAGES.ACCOUNT, icon: User, label: get('Menu1.4') }
    ];

    return (
        <div className="main-app-container">
            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            <main className="content-area">
                {renderCurrentPage()}
            </main>

            {/* 하단 네비게이션 (고정) */}
           {currentPage !== PAGES.LOGIN && (
                    <nav className="bottom-navigation">
                        <div className="nav-container">
                        {<HatchPattern opacity={0.3} />}
                        {navigationItems.map(({ id, icon: Icon, label, data = false }) => {
                            const isProtectedPage =
                            id === PAGES.CHATTINGLIST ||
                            id === PAGES.BOOKINGHISTORY ||
                            id === PAGES.ACCOUNT;

                            return (
                            <button
                                key={id}
                                onClick={() => {
                                if (user == null && isProtectedPage) {
                                    navigateToPageWithData(PAGES.LOGIN);
                                    return;
                                }

                                if (data) {
                                    navigateToPageWithData(id, data);
                                } else {
                                    navigateToPage(id);
                                }
                                }}
                                className={`nav-item ${currentPage === id ? 'active' : ''}`}
                            >
                                <Icon className="nav-icon" />
                                <span className="nav-label">{label}</span>
                            </button>
                            );
                        })}
                        </div>
                    </nav>
                    )}

        {currentPage === 'HOME' && (
                <section className="bottom-map-section">
                    <div className="map-icon-container" onClick={handleMapClick}>
                    <Map size={20} />
                    <span style={{ marginLeft: '5px' }}>{get('Main1.1')}</span>
                    </div>
                </section>
                )}

        {currentPage === 'HOME' && (
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


