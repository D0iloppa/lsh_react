// src/layout/MainApp.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, Calendar, User, Map, ChevronUp } from 'lucide-react';
import usePageNavigation from '@hooks/pageHook';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import { PAGE_COMPONENTS, DEFAULT_MANAGER_PAGE } from '../config/pages.config';
import HatchPattern from '@components/HatchPattern';
import LoadingScreen from '@components/LoadingScreen';

import './MainApp.css';

const MainApp = () => {

    const scrollToTop = () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const { user, isLoggedIn } = useAuth();
    const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
    
    console.log('Welcome manager!', user);


    useEffect(() => {
        window.scrollTo(0, 0);
        if (messages && Object.keys(messages).length > 0) {
                window.scrollTo(0, 0);
              }
    
      }, [messages, currentLang]);

    const {
        currentPage,
        navigateToPage,
        navigateToPageWithData,
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


    // 현재 페이지 렌더링 (데이터와 함께)
    // 페이지 이동시 MainApp.jsx에 정의 필요
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
        { id: PAGES.MANAGER_SETTINGS, icon: User, label: get('Mng.menu.3') || '계정' }
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
                    {navigationItems.map(({ id, icon: Icon, label }) => (
                        <button
                            key={id}
                            onClick={() => navigateToPage(id)}
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
                    {/* 스크롤 업 버튼 */}
                    {/* <button className="scroll-up-btn" onClick={scrollToTop}>
                    <ChevronUp size={24} />
                    </button> */}
                

                                <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>
        </div>
    );
};

export default MainApp;


