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
import Chatting from '@pages/Chatting';
import ChattingList from '@pages/ChattingList';



//////////////////////////


// Manager Pages
import ManagerDashboard from '@pages/ManagerDashboard';
import ManagerAccount from '@pages/ManagerAccount';
import ReservationManagement from '@pages/ReservationManagement';
import StaffManagement from '@pages/StaffManagement';
import CreateStaff from '@pages/CreateStaff';
import StaffSchedule from '@pages/StaffSchedule';
import PromotionManagement from '@pages/PromotionManagement';
import CreatePromotion from '@pages/CreatePromotion';
import ReviewManagement from '@pages/ReviewManagement';
import CustomerSupport from '@pages/CustomerSupport';
import NotificationCenter from '@pages/NotificationCenter';
import ManagerSettings from '@pages/ManagerSettings';
import VenueSetup from '@pages/VenueSetup';
import DiscoverPageVenue from '@pages/DiscoverPageVenue';
import EditStaff from '@pages/EditStaff';


import ShortsManagement from '@pages/ShortsManagement'

//////////////////////////
// Staff Pages
import StaffHome from '@pages/StaffHome';
import EditProfile from '@pages/EditProfile';

import StaffBookingList from '@pages/StaffBookingList';
import StaffWorkSchedule from '@pages/StaffWorkSchedule';
import StaffWorkScheduleCreate from '@pages/StaffWorkScheduleCreate';

import StaffReviewHistory from '@pages/StaffReviewHistory';

import StaffSetting from '@pages/StaffSetting';
import NotificationCenter_staff from '@pages/NotificationCenter_staff';
import StaffChat from '@pages/ChattingStaff';

import StaffTuto1 from '@components/Welcome/StaffTuto1';

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
    RESERVATION_MANAGEMENT: 'RESERVATION_MANAGEMENT',
    SCHEDULE_ADD: 'SCHEDULE_ADD',
    SCHEDULE_EDIT: 'SCHEDULE_EDIT',
    MANAGER_ACCOUNT: 'MANAGER_ACCOUNT',
    STAFF_MANAGEMENT: 'STAFF_MANAGEMENT',
    ANALYTICS: 'ANALYTICS',
    CREATE_STAFF: 'CREATE_STAFF',
    EDIT_STAFF: 'EDIT_STAFF',
    STAFF_SCHEDULE: 'STAFF_SCHEDULE',
    STAFF_SCHEDULE_CREATE: 'STAFF_SCHEDULE_CREATE',
    PROMOTION_MANAGEMENT: 'PROMOTION_MANAGEMENT',
    CREATE_PROMOTION: 'CREATE_PROMOTION',
    REVIEW_MANAGEMENT: 'REVIEW_MANAGEMENT',
    CUSTOMER_SUPPORT: 'CUSTOMER_SUPPORT',
    NOTIFICATION_CENTER: 'NOTIFICATION_CENTER',
    SETTINGS: 'SETTINGS',
    VENUE_SETUP: 'VENUE_SETUP',
    MANAGER_SETTINGS: 'MANAGER_SETTINGS',
    STAFF_HOME: 'STAFF_HOME',
    EDIT_PROFILE: 'EDIT_PROFILE',
    STAFF_BOOKING_LIST: 'STAFF_BOOKING_LIST',
    STAFF_WORK_SCHEDULE: 'STAFF_WORK_SCHEDULE',
    CHATTING: 'CHATTING',
    CHATTINGLIST: 'CHATTINGLIST',
    StaffWorkScheduleCreate:'StaffWorkScheduleCreate',
    StaffReviewHistory:'StaffReviewHistory',
    STAFF_SETTING: 'STAFF_SETTING',
    STAFF_EDIT_PROFILE: 'STAFF_EDIT_PROFILE',
    NOTIFICATION_CENTER_STAFF: 'NOTIFICATION_CENTER_STAFF',
    DISCOVERVENUE: 'DiscoverPageVenue',
    STAFFCHAT : 'StaffChat',
    STAFFTUTO1:'STAFFTUTO1',
    SHORTSMANAGEMENT: 'SHORTSMANAGEMENT'
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
    [PAGES.RESERVATION_MANAGEMENT]: ReservationManagement,
    [PAGES.MANAGER_ACCOUNT]: ManagerAccount,
    [PAGES.STAFF_MANAGEMENT]: StaffManagement,
    [PAGES.ANALYTICS]: ManagerDashboard, // 임시로 대시보드 사용
    [PAGES.CREATE_STAFF]: CreateStaff,
    [PAGES.EDIT_STAFF]: EditStaff,
    [PAGES.STAFF_SCHEDULE]: StaffSchedule,
    [PAGES.STAFF_SCHEDULE_CREATE]: StaffWorkScheduleCreate,
    [PAGES.PROMOTION_MANAGEMENT]: PromotionManagement,
    [PAGES.CREATE_PROMOTION]: CreatePromotion,
    [PAGES.REVIEW_MANAGEMENT]: ReviewManagement,
    [PAGES.CUSTOMER_SUPPORT]: CustomerSupport,
    [PAGES.NOTIFICATION_CENTER]: NotificationCenter,
    [PAGES.MANAGER_SETTINGS]: ManagerSettings,
    [PAGES.VENUE_SETUP]: VenueSetup,
    [PAGES.STAFF_HOME]: StaffHome,
    [PAGES.STAFF_EDIT_PROFILE]: EditProfile,
    [PAGES.STAFF_BOOKING_LIST]: StaffBookingList,
    [PAGES.STAFF_WORK_SCHEDULE]: StaffWorkSchedule,
    [PAGES.STAFF_REVIEWS]: StaffReviewHistory,
    [PAGES.STAFF_SETTING]: StaffSetting,
    [PAGES.CHATTING]: Chatting,
    [PAGES.CHATTINGLIST]: ChattingList,
    [PAGES.NOTIFICATION_CENTER_STAFF]: NotificationCenter_staff,
    [PAGES.DISCOVERVENUE]: DiscoverPageVenue,
    [PAGES.STAFFCHAT] : StaffChat,
    [PAGES.STAFFTUTO1] : StaffTuto1,
    [PAGES.SHORTSMANAGEMENT] : ShortsManagement
};

// 기본 페이지
export const DEFAULT_MANAGER_PAGE = PAGES.MANAGER_DASHBOARD;
export const DEFAULT_STAFF_PAGE = PAGES.STAFF_HOME;