import { useState } from 'react';

// 페이지 정의
const PAGES = {
  HOME: 'home',
  DISCOVER: 'discover',
  STAFFDETAIL: 'staffdetail',
  RESERVATION: 'reservation',
  RESERVATION_SUM: 'reservation_sum',
  SUBSCRIPTION_PAY: 'subscription_pay',
  SHARE_EXP: 'share_exp',
  MAP: 'map',
  SEARCH: 'search',
  EVENTS: 'events',
  ACCOUNT: 'account',
  VIEWREVIEW: 'viewreview',
  NOTIFICATIONS: 'notifications',
  CSPAGE1: 'cspage1',
  CSPAGE2: 'cspage2',
  PROMOTION: 'promotion',
  BOOKINGHISTORY: 'bookinghistory',
  FAVORITES: 'favorites',
  SETTING: 'setting',
  PROFILE: 'profile'
};

const usePageNavigation = (initialPage = PAGES.HOME, customData = {}) => {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageData, setPageData] = useState(customData); // 커스텀 데이터로 초기화
  const [globalData, setGlobalData] = useState({}); // 전역 데이터 저장

  // 데이터와 함께 페이지 이동하는 기본 함수
  const navigateToPageWithData = (page, data = {}) => {
    if (Object.values(PAGES).includes(page)) {
      setPageData(prev => ({
        ...prev,
        [page]: {
          ...customData[page], // 커스텀 데이터 병합
          ...data
        }
      }));
      setCurrentPage(page);
    } else {
      console.warn(`Unknown page: ${page}`);
    }
  };

  // 특정 페이지로 이동하는 함수들 (데이터 포함 가능)
  const navigateToHome = (data = {}) => {
    navigateToPageWithData(PAGES.HOME, data);
  };


  const navigateToDiscover = (data = {}) => {
    navigateToPageWithData(PAGES.DISCOVER, data);
  };

  const navigateToMap = (data = {}) => {
    navigateToPageWithData(PAGES.MAP, data);
  };

  const navigateToSearch = (data = {}) => {
    navigateToPageWithData(PAGES.SEARCH, data);
  };

  const navigateToEvents = (data = {}) => {
    navigateToPageWithData(PAGES.EVENTS, data);
  };

  const navigateToProfile = (data = {}) => {
    navigateToPageWithData(PAGES.PROFILE, data);
  };




  // 일반적인 페이지 이동 함수 (데이터 없이)
  const navigateToPage = (page) => {
    navigateToPageWithData(page, {});
  };

  // 특정 용도별 네비게이션 함수들
  const navigateToMapWithVenues = (venues, searchQuery = '') => {
    navigateToMap({
      venues,
      searchQuery,
      initialView: 'list'
    });
  };

  const navigateToSearchWithQuery = (query, filters = {}) => {
    navigateToSearch({
      initialQuery: query,
      filters,
      autoSearch: true
    });
  };

  const navigateToEventsWithFilter = (category = 'all', date = null) => {
    navigateToEvents({
      selectedCategory: category,
      selectedDate: date,
      autoFilter: true
    });
  };

  const navigateToProfileWithTab = (activeTab = 'info') => {
    navigateToProfile({
      activeTab,
      scrollToTop: true
    });
  };

  // 선택된 장소와 함께 맵으로 이동
  const navigateToMapWithSelectedVenue = (venue) => {
    navigateToMap({
      selectedVenue: venue,
      centerOnVenue: true,
      showVenueInfo: true
    });
  };

  // 이전 페이지로 이동 (간단한 히스토리)
  const [pageHistory, setPageHistory] = useState([{page: initialPage, data: {}}]);
  
  const navigateWithHistory = (page, data = {}) => {
    if (Object.values(PAGES).includes(page)) {
      setPageHistory(prev => [...prev, {page: currentPage, data: pageData[currentPage] || {}}]);
      navigateToPageWithData(page, data);
    }
  };

  const goBack = () => {
    if (pageHistory.length > 0) {
      const previous = pageHistory[pageHistory.length - 1];
      setPageHistory(prev => prev.slice(0, -1));
      setCurrentPage(previous.page);
      setPageData(prev => ({
        ...prev,
        [previous.page]: previous.data
      }));
    }
  };

  // 현재 페이지 확인 함수들
  const isCurrentPage = (page) => currentPage === page;
  const isHomePage = () => currentPage === PAGES.HOME;
  const isMapPage = () => currentPage === PAGES.MAP;
  const isSearchPage = () => currentPage === PAGES.SEARCH;
  const isEventsPage = () => currentPage === PAGES.EVENTS;
  const isProfilePage = () => currentPage === PAGES.PROFILE;



  // 현재 페이지 데이터 가져오기 (커스텀 데이터와 병합)
  const getCurrentPageData = () => {
    const baseData = customData[currentPage] || {};
    const currentData = pageData[currentPage] || {};
    return {
      ...baseData,
      ...currentData,
      ...globalData
    };
  };

  // 특정 페이지 데이터 가져오기 (커스텀 데이터와 병합)
  const getPageDataByPage = (page) => {
    const baseData = customData[page] || {};
    const currentData = pageData[page] || {};
    return {
      ...baseData,
      ...currentData,
      ...globalData
    };
  };

  // 전역 데이터 설정 (모든 페이지에서 접근 가능)
  const setGlobalPageData = (data) => {
    setGlobalData(prev => ({
      ...prev,
      ...data
    }));
  };

  // 전역 데이터 가져오기
  const getGlobalData = () => globalData;

  // 커스텀 데이터 가져오기
  const getCustomData = () => customData;

  // 페이지 데이터 업데이트 (현재 페이지에서)
  const updateCurrentPageData = (newData) => {
    setPageData(prev => ({
      ...prev,
      [currentPage]: {
        ...(prev[currentPage] || {}),
        ...newData
      }
    }));
  };

  // 페이지 데이터 클리어
  const clearPageData = (page = null) => {
    if (page) {
      setPageData(prev => ({
        ...prev,
        [page]: {}
      }));
    } else {
      setPageData({});
    }
  };

  // 페이지 정보 가져오기 (미래 확장용)
  const getPageInfo = (page) => {
    const pageInfo = {
      [PAGES.HOME]: { title: 'Home', hasBottomNav: true },
      [PAGES.MAP]: { title: 'Map', hasBottomNav: true },
      [PAGES.SEARCH]: { title: 'Search', hasBottomNav: true },
      [PAGES.EVENTS]: { title: 'Events', hasBottomNav: true },
      [PAGES.PROFILE]: { title: 'Profile', hasBottomNav: true }
    };
    return pageInfo[page] || pageInfo[PAGES.HOME];
  };

  return {
    // 상태
    currentPage,
    pageHistory,
    pageData,
    globalData,
    customData,
    
    // 기본 네비게이션
    navigateToPage,
    navigateToPageWithData,
    setCurrentPage,
    
    // 특정 페이지 이동 (데이터 포함 가능)
    navigateToHome,
    navigateToMap,
    navigateToSearch,
    navigateToEvents,
    navigateToProfile,
    navigateToDiscover,
    
    // 특수 목적 네비게이션
    navigateToMapWithVenues,
    navigateToMapWithSelectedVenue,
    navigateToSearchWithQuery,
    navigateToEventsWithFilter,
    navigateToProfileWithTab,
    
    // 히스토리 기능
    navigateWithHistory,
    goBack,
    
    // 상태 확인
    isCurrentPage,
    isHomePage,
    isMapPage,
    isSearchPage,
    isEventsPage,
    isProfilePage,
    
    // 데이터 관리
    getCurrentPageData,
    getPageDataByPage,
    updateCurrentPageData,
    clearPageData,
    setGlobalPageData,
    getGlobalData,
    getCustomData,
    
    // 유틸리티
    getPageInfo,
    
    // 상수
    PAGES
  };
};

export default usePageNavigation;