// src/layout/MainApp.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Home, Search, Trophy, Calendar, User, Map, ChevronUp, Star, Icon, History, MessagesSquare, Settings, Tag, PlaySquare, MessageSquare } from 'lucide-react';
import usePageNavigation from '@hooks/pageHook';
import useWebviewBackBlock from '@hooks/useWebviewBackBlock';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useLoginOverlay } from '@hooks/useLoginOverlay.jsx';

import { PAGE_COMPONENTS, DEFAULT_PAGE } from '../config/pages.config';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';
import ApiClient from '@utils/ApiClient';
import ChatStorage from '@utils/ChatStorage';
import Swal from 'sweetalert2';
import { backHandlerRef } from '@hooks/backRef';


import { useLocation, useNavigate } from 'react-router-dom';
import ThemeManager from '@utils/ThemeManager';

import { getVersionInfo, compareVersions } from '@utils/storage'


import './MainApp2.css';

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

    const { user, isLoggedIn, isActiveUser, exts } = useAuth();
    const msgContext = useMsg();
    const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = msgContext;

    const [activeUser, setActiveUser] = useState({});
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
        console.log('페이지 변경됨:', currentPage);
        ThemeManager.applyTheme(currentPage); // currentPage를 매개변수로 전달
    }, [currentPage]);

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

    // Unread Chat Count Polling
    const checkUnreadCounts = useCallback(async () => {
        try {
            // Get last chat_sn from DB
            const msgs = await ChatStorage.getMessages(1);
            const lastSn = msgs.length > 0 ? msgs[0].chat_sn : 0;

            const res = await ApiClient.get('/api/openchat/getNewChatCnt', {
                params: {
                    last_chat_sn: lastSn,
                    user_id: user.user_id
                }
            });


            if (res && res.new_chat !== undefined) {
                const count = Number(res.new_chat);
                console.log('[Badge] Setting Count:', count);
                setUnreadChatCount(count);
            }
        } catch (e) {
            console.error('Failed to check unread counts:', e);
        }
    }, []);

    useEffect(() => {
        checkUnreadCounts(); // Initial check
        const interval = setInterval(checkUnreadCounts, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, [checkUnreadCounts]);

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

                if (backHandlerRef.current == null) {
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

    const showAdWithCallback = useCallback(async (onAdComplete, fallbackAction, timeoutMs = 4000, forceShow = false) => {


        // 한시적 광고 비활성화
        let isAdDisabled = false;
        if (isAdDisabled) {
            onAdComplete();
            return;
        }

        // 세션스토리지에서 광고 호출 횟수 관리
        const adCallCountKey = 'adCallCount';
        let adCallCount = parseInt(localStorage.getItem(adCallCountKey) || '1');
        adCallCount++;
        localStorage.setItem(adCallCountKey, adCallCount.toString());

        // 롤백을 위한 이전 값
        const prevAdCallCount = Math.max(1, adCallCount - 1);

        console.log(`광고 호출 횟수: ${adCallCount}`);

        let _isActive = false;

        if (Object.keys(activeUser).length === 0) {
            // 빈 객체인 경우
            console.log('need to init');

            try {
                const { isActiveUser: isActive = false, subscription = {} } = await isActiveUser();

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

        } else {
            // 빈 객체가 아닌 경우 - 날짜 체크
            const today = new Date().toDateString();
            const lastCheckedDate = activeUser.lastChecked
                ? new Date(activeUser.lastChecked).toDateString()
                : null;

            if (!lastCheckedDate || lastCheckedDate !== today) {
                // 하루가 지났거나 처음 체크하는 경우 - 재검증
                console.log('날짜가 변경되어 재검증합니다.');

                try {
                    const { isActiveUser: isActive = false, subscription = {} } = await isActiveUser();

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
        //_isActive = false;


        let app_version = localStorage.getItem('app_version');
        let app_device = localStorage.getItem('app_device');


        if (app_device == 'ios' && compareVersions(app_version, '1.0.10') < 0) {
            _isActive = false;
        }


        if (app_device === 'android' && compareVersions(app_version, '1.0.19') < 0) {
            _isActive = false;
        }


        if (_isActive) {
            console.warn('active user');
            onAdComplete();
            return;
        }



        //////////
        // 화이트리스트


        console.log('MAINAPP', user.user_id);

        // 202 : 이광빈 대표
        // 22 : 권도일
        // 21 : 대표님

        let whiteList = [202];

        if (whiteList.includes(user.user_id)) {
            console.warn('whiteList user');
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

        // 광고 호출 직전 → 무조건 AD_CALL_INTERVAL로 세팅
        // localStorage.setItem(adCallCountKey, String(AD_CALL_INTERVAL + 1));

        try {

            // 광고 성공시에만 초기화필요, 여기서는 롤백
            localStorage.setItem(adCallCountKey, prevAdCallCount);

            // 광고 응답 대기 타이머 (기본 4초)
            const fallbackTimer = setTimeout(() => {
                console.warn('광고 응답 없음 - fallback 실행');

                // localStorage.setItem(adCallCountKey, prevAdCallCount);
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
            // localStorage.setItem(adCallCountKey, '1');
            fallbackAction();
        }
    }, []);

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
        showAdWithCallback,
        refreshUnreadCounts: checkUnreadCounts
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
        { id: PAGES.OPENCHAT, icon: MessageSquare, label: get('open_chat_label'), needLogin: false },
    ];

    return (

        <div className="main-app-container">
            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            <main class="content-area h-screen overflow-hidden">
                {renderCurrentPage()}
            </main>

            {['HOME', 'BARLIST', 'MASSAGELIST'].includes(currentPage) && (
                <section className="bottom-map-section">
                    <div className="map-icon-container" onClick={handleMapClick}>
                        {/* style 속성 제거 - CSS에서 처리 */}
                        <Map size={20} />
                        <span style={{ marginLeft: '5px' }}>{get('Main1.1')}</span>
                    </div>
                </section>
            )}

            {['HOME', 'BARLIST', 'MASSAGELIST'].includes(currentPage) && (
                <button className="scroll-up-btn" onClick={scrollToTop}>
                    {/* style 속성 제거 - CSS에서 처리 */}
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


