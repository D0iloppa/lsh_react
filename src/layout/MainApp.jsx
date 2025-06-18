// src/layout/MainApp.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, Calendar, User } from 'lucide-react';
import usePageNavigation from '@hooks/pageHook';


import { PAGE_COMPONENTS, DEFAULT_PAGE } from '../config/pages.config';
import HatchPattern from '@components/HatchPattern';


import './MainApp.css';

const MainApp = () => {


    const { user, isLoggedIn } = useAuth();

    console.log('Welcome!', user);

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
        const PageComponent = PAGE_COMPONENTS[currentPage] || PAGE_COMPONENTS[DEFAULT_PAGE];
        
        return <PageComponent {...pageData} {...navigationProps} />;
    };


    // 네비게이션 메뉴들
    const navigationItems = [
        { id: PAGES.HOME, icon: Home, label: 'Home' },
        { id: PAGES.SEARCH, icon: Search, label: 'Search' },
        { id: PAGES.EVENTS, icon: Calendar, label: 'Event list' },
        { id: PAGES.ACCOUNT, icon: User, label: 'Account' }
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
        </div>
    );
};

export default MainApp;


