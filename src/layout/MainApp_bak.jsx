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
import { overlay } from 'overlay-kit';
import { MsgProvider } from '@contexts/MsgContext';
import { AuthProvider } from '@contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';

import LoginComp from '@components/Login/LoginView';

import './MainApp.css';

const MainApp = () => {
    const location = useLocation();
    const navigate = useNavigate();

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

        // 한시적 광고 비활성화
        let isAdDisabled = true;
        if(isAdDisabled){
            onAdComplete();
            return;
        }
        



        if (Object.keys(activeUser).length === 0) {
            // 빈 객체인 경우
            console.log('need to init');

            try {
                const {isActiveUser:isActive = false, subscription = {}} = await isActiveUser();
                
                setActiveUser({
                    isActive,
                    lastChecked: new Date().toISOString()
                });
                
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
    }, []); 
    
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

//console.log('PAGES', PAGES)

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


    const openLoginOverlay = (targetPage = null, targetData = null) => {
        console.log('openLoginOverlay');
          // 목표 페이지 정보를 전역에 저장
            window.loginTargetPage = targetPage;
            window.loginTargetData = targetData;

        overlay.open(({ isOpen, close, unmount }) => {
            // 여기서 unmount를 전역에 저장
            window.overlayUnmount = unmount;

            // 여기서 전역 함수 등록
            window.overlayRegisterHandler = () => {
                console.log('Register 버튼 클릭 - 오버레이 닫고 Register 페이지로');
                if (window.overlayUnmount) {
                    window.overlayUnmount();
                }
                navigateToPage(PAGES.REGISTER); // 회원가입 페이지로 이동
                
                // 정리
                delete window.overlayUnmount;
                delete window.overlayRegisterHandler;
            };

              window.overlayLoginSuccessHandler = (userData) => {
                console.log('Login success:', userData);
                unmount();
                delete window.overlayUnmount;
                delete window.overlayRegisterHandler;
                delete window.overlayLoginSuccessHandler;
                
                
                // 목표 페이지가 있으면 그 페이지로, 없으면 새로고침
                if (window.loginTargetPage) {
                    console.log('로그인 성공 - 목표 페이지로 이동:', window.loginTargetPage);
                    
                    if (window.loginTargetData) {
                        navigateToPageWithData(window.loginTargetPage, window.loginTargetData);
                    } else {
                        navigateToPage(window.loginTargetPage);
                    }
                    
                    // 정리
                    delete window.loginTargetPage;
                    delete window.loginTargetData;

                } else {
                    setTimeout(() => {
                        window.location.reload();
                    }, 100);
                }
            };
            
            return (
                <BrowserRouter>
                    <MsgProvider>
                        <AuthProvider>
                            <style>{`
                                .go-home-button {
                                    display: none !important;
                                }
                                .login-container{min-height: 72vh;}
                            `}</style>
                            <div 
                                style={{
                                    position: 'fixed',
                                    top: 0,
                                    left: 0,
                                    width: '100vw',
                                    height: '100vh',
                                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 9998,
                                    padding: '20px',
                                    boxSizing: 'border-box'
                                }}
                                onClick={(e) => {
                                    if (e.target === e.currentTarget) {
                                        unmount();
                                        // 정리
                                        delete window.overlayUnmount;
                                        delete window.overlayRegisterHandler;
                                    }
                                }}
                            >
                                <div style={{
                                    maxWidth: '400px',
                                    width: '100%',
                                    maxHeight: '90vh',
                                    overflow: 'auto',
                                    backgroundColor: 'white',
                                    borderRadius: '8px',
                                    position: 'relative'
                                }}>
                                    <button
                                        onClick={() => {
                                            unmount();
                                            // 정리
                                            delete window.overlayUnmount;
                                            delete window.overlayRegisterHandler;
                                        }}
                                        style={{
                                            position: 'absolute',
                                            top: '10px',
                                            right: '10px',
                                            background: 'none',
                                            border: 'none',
                                            fontSize: '24px',
                                            cursor: 'pointer',
                                            zIndex: 10,
                                            color: '#666'
                                        }}
                                    >
                                        ×
                                    </button>
                                    
                                    <LoginComp
                                        onClose={() => {
                                            console.log('Login overlay closing...');
                                            unmount();
                                            // 정리
                                            delete window.overlayUnmount;
                                            delete window.overlayRegisterHandler;
                                        }}
                                    
                                        redirectUrl="/profile"
                                        showSocialLogin={true}
                                        isOverlay={true}
                                    />
                                </div>
                            </div>
                        </AuthProvider>
                    </MsgProvider>
                </BrowserRouter>
            );
        });
        //navigateToPage(PAGES.LOGIN);
        /*
        const overlayElement = overlay.open(({ isOpen, close, unmount }) => (
            <LoginComp
                propsUseMsg={() => msgContext} // 전체 context 객체 전달
                onClose={() => {
                    console.log('Login overlay closing...');
                    unmount();
                }}
                onLoginSuccess={(userData) => {
                    console.log('Login success:', userData);
                    unmount();
                    // 로그인 성공 후 페이지 이동 등
                    navigateToPage(PAGES.PROFILE);
                }}
                // Login 컴포넌트에 필요한 다른 props들
                redirectUrl="/profile"
                showSocialLogin={true}
            />
        ));
        */
    };

    // 네비게이션 메뉴들
    const navigationItems = [
        { id: PAGES.HOME, icon: Home, label: get('Footer1.3'), needLogin:false },
        { id: PAGES.SEARCH, icon: Search, label: get('btn.searchMap.1.1'), needLogin:false },
        { id: PAGES.CHATTINGLIST, icon: MessagesSquare, label: get('MENU_CHATTING'), 
            needLogin:true,
            data: { 
                chatRoomType: 'user'
            }   
        },
        { id: PAGES.BOOKINGHISTORY, icon: History, label: get('menu.reserve.history') ,needLogin:true},
        { id: PAGES.ACCOUNT, icon: User, label: get('Menu1.4'), needLogin:true }
    ];

    return (
        
        <div className="main-app-container">
            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            <main className="content-area">
                {renderCurrentPage()}
            </main>

            {/* 하단 네비게이션 (고정) */}
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
                    ))}
                </div>
            </nav>

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


