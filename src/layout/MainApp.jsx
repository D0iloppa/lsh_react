// src/layout/MainApp.jsx
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Home, Search, Calendar, User } from 'lucide-react';
import usePageNavigation from '@hooks/pageHook';


// pages import
import HomePage from '@pages/HomePage';
import DiscoverPage from '@pages/DiscoverPage';
import StaffDetailPage from '@pages/StaffDetailPage'

import ReservationPage from '@pages/ReservationPage'
import ReservationSummaryPage from '@pages/ReservationSummaryPage'

import SubscriptionPaymentPage from '@pages/SubscriptionPaymentPage'

import ShareExpPage from '@pages/ShareExpPage'



import SearchPage from '@pages/SearchPage';
import EventListPage from '@pages/EventListPage';
import AccountPage from '@pages/AccountPage';
import MapPage from '@pages/MapPage';

import ViewReview from '@pages/ViewReview';
import Notifications from '@pages/Notifications';

import CSPage1 from '@pages/CSPage1';
import CSPage2 from '@pages/CSPage2';

import Promotion from '@pages/Promotion';

import BookingHistory from '@pages/BookingHistory';
import Favorites from '@pages/Favorites';

import Setting from '@pages/Setting';





import './MainApp.css';

const MainApp = () => {
    const {
        currentPage,
        navigateToPage,
        navigateToPageWithData,
        getCurrentPageData,
        navigateToMap,        // ✅ 추가
        navigateToSearch,     // ✅ 추가  
        navigateToEvents,     // ✅ 추가
        navigateToProfile,    // ✅ 추가
        PAGES
    } = usePageNavigation(); // 🎯 여기서만 호출!

    // 현재 페이지 렌더링 (데이터와 함께)
    // 페이지 이동시 MainApp.jsx에 정의 필요
    const renderCurrentPage = () => {
        const pageData = getCurrentPageData();
        const navigationProps = {
            navigateToMap,
            navigateToSearch,
            navigateToEvents,
            navigateToProfile,
            navigateToPage,
            navigateToPageWithData,
            PAGES
        };

        switch (currentPage) {
            case PAGES.HOME:
                return <HomePage {...pageData} {...navigationProps} />;
            case PAGES.MAP:
                return <MapPage {...pageData} {...navigationProps} />;
            case PAGES.SEARCH:
                return <MapPage {...pageData} {...navigationProps} />;
            case PAGES.EVENTS:
                return <EventListPage {...pageData} {...navigationProps} />;
            case PAGES.ACCOUNT:
                return <AccountPage {...pageData} {...navigationProps} />;
            case PAGES.DISCOVER:
                return <DiscoverPage {...pageData} {...navigationProps} />;
            case PAGES.STAFFDETAIL:
                return <StaffDetailPage {...pageData} {...navigationProps} />;
            case PAGES.RESERVATION:
                return <ReservationPage {...pageData} {...navigationProps} />;
            case PAGES.RESERVATION_SUM:
                return <ReservationSummaryPage {...pageData} {...navigationProps} />;
            case PAGES.SUBSCRIPTION_PAY:
                return <SubscriptionPaymentPage {...pageData} {...navigationProps} />;
            case PAGES.SHARE_EXP:
                return <ShareExpPage {...pageData} {...navigationProps} />;

            case PAGES.VIEWREVIEW:
                return <ViewReview {...pageData} {...navigationProps} />;
            case PAGES.NOTIFICATIONS:
                return <Notifications {...pageData} {...navigationProps} />;
            case PAGES.CSPAGE1:
                return <CSPage1 {...pageData} {...navigationProps} />;
            case PAGES.CSPAGE2:
                return <CSPage2 {...pageData} {...navigationProps} />;
            case PAGES.PROMOTION:
                return <Promotion {...pageData} {...navigationProps} />;
            case PAGES.BOOKINGHISTORY:
                return <BookingHistory {...pageData} {...navigationProps} />;
            case PAGES.FAVORITES:
                return <Favorites {...pageData} {...navigationProps} />;
            case PAGES.SETTING:
                return <Setting {...pageData} {...navigationProps} />;


            default:
                return <HomePage {...navigationProps} />;
        }
    };

    // 네비게이션 메뉴들
    const navigationItems = [
        { id: PAGES.HOME, icon: Home, label: 'Home' },
        { id: PAGES.SEARCH, icon: Search, label: 'Search' },
        { id: PAGES.EVENTS, icon: Calendar, label: 'Event list' },
        { id: PAGES.ACCOUNT, icon: User, label: 'Profile' }
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


