// src/layout/MainApp.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@contexts/AuthContext';
import { Home, Search, Settings, Calendar, User, Map, ChevronUp, MessagesSquare } from 'lucide-react';
import usePageNavigation from '@hooks/pageHook';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useFcm } from '@contexts/FcmContext';

import { PAGE_COMPONENTS, DEFAULT_MANAGER_PAGE } from '../config/pages.config';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';
import SketchHeader from '@components/SketchHeader'

import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';

import { useLocation, useNavigate } from 'react-router-dom';

import './AdminApp.css';

const MainApp = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { fcmToken } = useFcm();

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const { user, isLoggedIn } = useAuth();
    const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
    

    useEffect(() => {
        const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
      
        const upateAppId = async () => {
          try {
            const res = await axios.get(`${API_HOST}/api/upateAppId_admin`, {
              params: {
                user_id: 1,
                app_id: fcmToken || '2345',
                login_type: 99, // admin
              },
            });
            return res.data || [];
          } catch (err) {
            return [];
          }
        };
    
        if (fcmToken) {
          upateAppId();
          //alert('📲 HomePage에서 받은 FCM 토큰:', fcmToken, 'manager_id:', user?.manager_id || 1);
        }
      }, [fcmToken]);


    console.log('Welcome manager!', user);

    useEffect(() => {
        const {language} = user;
        //setLanguage('kr');
        
        window.scrollTo(0, 0);
        if (messages && Object.keys(messages).length > 0) {
            window.scrollTo(0, 0);
        }
    }, [messages, currentLang]);

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
    
    const navigationProps = {
        navigateToMap,
        navigateToSearch,
        navigateToEvents,
        navigateToProfile,
        navigateToPage,
        navigateToPageWithData,
        goBack,
        PAGES
    };

    const processedQueryRef = useRef(false);
    const lastProcessedQuery = useRef('');
    const [unreadChatCount, setUnreadChatCount] = useState(0);

    // 채팅 개수 가져오기
    const fetchUnreadChatCount = async () => {
               if (!user?.manager_id) return;
       
               try {
               const response = await ApiClient.get('/api/getUnreadCountChat_mng', {
                   params: {
                   participant_type: 'manager',
                   participant_user_id: user.manager_id
                   }
               });
       
               console.log("count", response)
   
              // response가 직접 숫자로 온다면
                const count = parseInt(response) || 0;
                setUnreadChatCount(count);
                
               } catch (error) {
               console.error('읽지 않은 채팅 개수 조회 실패:', error);
               setUnreadChatCount(0);
               }
           };
       
           // 초기 로드 및 주기적 업데이트
           useEffect(() => {
            /*
               fetchUnreadChatCount();
               
               const interval = setInterval(fetchUnreadChatCount, 3000);
               
               return () => clearInterval(interval);
            */
           }, [user]);
       
           // 채팅 페이지 이동 시 개수 초기화 함수
           const resetChatCount = () => {
               //setUnreadChatCount(0);
           };


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

    // 현재 페이지 렌더링 (데이터와 함께)
    const renderCurrentPage = () => {
        const pageData = getCurrentPageData();
        const PageComponent = PAGE_COMPONENTS[currentPage] || PAGE_COMPONENTS[DEFAULT_MANAGER_PAGE];
        
        return <PageComponent {...pageData} {...navigationProps} />;
    };

    const handleMapClick = () => {
        navigateToMap({
            searchFrom: 'home',
        });
    };

    // 네비게이션 메뉴들
    const navigationItems = [
        { id: PAGES.MANAGER_DASHBOARD, icon: Home, label: get('Footer1.3') || '대시보드' },
        { id: PAGES.RESERVATION_MANAGEMENT, icon: Calendar, label: get('Mng.menu.2') || '예약관리' },
        { id: PAGES.CHATTINGLIST, icon: MessagesSquare, label: get('MENU_CHATTING'), data : { chatRoomType: 'manager' } },
        { id: PAGES.MANAGER_SETTINGS, icon: Settings, label: get('MENU_SETTINGS') || '계정' }
    ];

    return (
        <div className="main-app-container">

            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            <main className="content-area">
                test
            </main>

            <LoadingScreen 
                isVisible={isLoading} 
                // loadingText="Loading" 
            />
        </div>
    );
};

export default MainApp;