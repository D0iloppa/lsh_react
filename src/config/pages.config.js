// pages.config.js
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

import Profile from '@pages/Profile';
import Payment from '@pages/Payment';


import MapPage from '@pages/MapPage';

import ViewReview from '@pages/ViewReview';
import Notifications from '@pages/Notifications';

import CSPage1 from '@pages/CSPage1';
import CSPage2 from '@pages/CSPage2';

import Promotion from '@pages/Promotion';

import BookingHistory from '@pages/BookingHistory';
import Favorites from '@pages/Favorites';

import Setting from '@pages/Setting';
import ManagerDashboard from '@pages/ManagerDashboard';
import ScheduleManagement from '@pages/ScheduleManagement';
import ManagerAccount from '@pages/ManagerAccount';

// 페이지 상수
export const PAGES = {
    HOME: 'HOME',
    MAP: 'MAP',
    SEARCH: 'SEARCH',
    EVENTS: 'EVENTS',
    ACCOUNT: 'ACCOUNT',
    DISCOVER: 'DISCOVER',
    STAFFDETAIL: 'STAFFDETAIL',
    RESERVATION: 'RESERVATION',
    RESERVATION_SUM: 'RESERVATION_SUM',
    SUBSCRIPTION_PAY: 'SUBSCRIPTION_PAY',
    SHARE_EXP: 'SHARE_EXP',
    VIEWREVIEW: 'VIEWREVIEW',
    NOTIFICATIONS: 'NOTIFICATIONS',
    CSPAGE1: 'CSPAGE1',
    CSPAGE2: 'CSPAGE2',
    PROMOTION: 'PROMOTION',
    BOOKINGHISTORY: 'BOOKINGHISTORY',
    FAVORITES: 'FAVORITES',
    SETTING: 'SETTING',
    PROFILE: 'PROFILE',
    PAYMENT: 'PAYMENT',
    MANAGER_DASHBOARD: 'MANAGER_DASHBOARD',
    SCHEDULE_MANAGEMENT: 'SCHEDULE_MANAGEMENT',
    SCHEDULE_ADD: 'SCHEDULE_ADD',
    SCHEDULE_EDIT: 'SCHEDULE_EDIT',
    MANAGER_ACCOUNT: 'MANAGER_ACCOUNT',
    STAFF_MANAGEMENT: 'STAFF_MANAGEMENT',
    ANALYTICS: 'ANALYTICS'
};

// 페이지 컴포넌트 매핑
export const PAGE_COMPONENTS = {
    [PAGES.HOME]: HomePage,
    [PAGES.MAP]: MapPage,
    [PAGES.SEARCH]: MapPage, // 같은 컴포넌트 사용
    [PAGES.EVENTS]: Promotion, // 같은 컴포넌트 사용
    [PAGES.ACCOUNT]: AccountPage,
    [PAGES.DISCOVER]: DiscoverPage,
    [PAGES.STAFFDETAIL]: StaffDetailPage,
    [PAGES.RESERVATION]: ReservationPage,
    [PAGES.RESERVATION_SUM]: ReservationSummaryPage,
    [PAGES.SUBSCRIPTION_PAY]: SubscriptionPaymentPage,
    [PAGES.SHARE_EXP]: ShareExpPage,
    [PAGES.VIEWREVIEW]: ViewReview,
    [PAGES.NOTIFICATIONS]: Notifications,
    [PAGES.CSPAGE1]: CSPage1,
    [PAGES.CSPAGE2]: CSPage2,
    [PAGES.PROMOTION]: Promotion,
    [PAGES.BOOKINGHISTORY]: BookingHistory,
    [PAGES.FAVORITES]: Favorites,
    [PAGES.SETTING]: Setting,
    [PAGES.PROFILE]: Profile,
    [PAGES.PAYMENT]: Payment,
    [PAGES.MANAGER_DASHBOARD]: ManagerDashboard,
    [PAGES.SCHEDULE_MANAGEMENT]: ScheduleManagement,
    [PAGES.SCHEDULE_ADD]: ScheduleManagement, // 임시로 같은 컴포넌트 사용
    [PAGES.SCHEDULE_EDIT]: ScheduleManagement, // 임시로 같은 컴포넌트 사용
    [PAGES.MANAGER_ACCOUNT]: ManagerAccount,
    [PAGES.STAFF_MANAGEMENT]: ManagerDashboard, // 임시로 대시보드 사용
    [PAGES.ANALYTICS]: ManagerDashboard // 임시로 대시보드 사용
};

// 기본 페이지
export const DEFAULT_MANAGER_PAGE = PAGES.MANAGER_DASHBOARD;
export const DEFAULT_STAFF_PAGE = PAGES.HOME;