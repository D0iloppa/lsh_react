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
//import ViewReviewDetail from '@pages/ViewReviewDetail';
import ViewReviewDetail from '@pages/ViewReview';


import Notifications from '@pages/Notifications';

import CSPage1 from '@pages/CSPage1';
import CSPage2 from '@pages/CSPage2';

import Promotion from '@pages/Promotion';

import BookingHistory from '@pages/BookingHistory';
import Favorites from '@pages/Favorites';

import Setting from '@pages/Setting';



import Chatting from '@pages/Chatting';
import ChattingList from '@pages/ChattingList';


import Login from '@components/Login/LoginView';
import RegisterView from '@components/Register/RegisterView';

import Terms from '@components/Terms/TermsView';
import Privacy from '@components/Privacy/PrivacyView';
import PurchasePage from '@components/PurchasePage';

import Ranking from '@pages/Ranking';

import Notice from '@pages/Notice';

import BarMainPage from '@pages/BarMainPage';
import MassageMainPage from '@pages/MassageMainPage';

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
    VIEWREVIEWDETAIL: 'VIEWREVIEWDETAIL',
    NOTIFICATIONS: 'NOTIFICATIONS',
    CSPAGE1: 'CSPAGE1',
    CSPAGE2: 'CSPAGE2',
    PROMOTION: 'PROMOTION',
    BOOKINGHISTORY: 'BOOKINGHISTORY',
    FAVORITES: 'FAVORITES',
    SETTING: 'SETTING',
    PROFILE: 'PROFILE',
    PAYMENT: 'PAYMENT',
    CHATTING: 'CHATTING',
    CHATTINGLIST: 'CHATTINGLIST',
    LOGIN: 'LOGIN',
    REGISTER : 'REGISTER',
    TERMS : 'TERMS',
    PRIVACY : 'PRIVACY',
    PURCHASEPAGE: 'PURCHASEPAGE',
    RANKING: 'RANKING',
    NOTICE: 'NOTICE',
    BARLIST: 'BARLIST',
    MASSAGELIST: 'MASSAGELIST'
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
    [PAGES.VIEWREVIEWDETAIL]: ViewReviewDetail,
    [PAGES.NOTIFICATIONS]: Notifications,
    [PAGES.CSPAGE1]: CSPage1,
    [PAGES.CSPAGE2]: CSPage2,
    [PAGES.PROMOTION]: Promotion,
    [PAGES.BOOKINGHISTORY]: BookingHistory,
    [PAGES.FAVORITES]: Favorites,
    [PAGES.SETTING]: Setting,
    [PAGES.PROFILE]: Profile,
    [PAGES.PAYMENT]: Payment,
    [PAGES.CHATTING]: Chatting,
    [PAGES.CHATTINGLIST]: ChattingList,
    [PAGES.LOGIN]: Login,
    [PAGES.REGISTER]: RegisterView,
    [PAGES.TERMS]: Terms,
    [PAGES.PRIVACY]: Privacy,
    [PAGES.PURCHASEPAGE]: PurchasePage,
    [PAGES.RANKING]: Ranking,
    [PAGES.NOTICE]: Notice,
    [PAGES.BARLIST]: BarMainPage,
    [PAGES.MASSAGELIST]: MassageMainPage
};

// 기본 페이지
export const DEFAULT_PAGE = PAGES.HOME;