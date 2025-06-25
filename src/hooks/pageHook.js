// pageHook.js
import { useState, useEffect } from 'react';
import { PAGES, DEFAULT_MANAGER_PAGE, DEFAULT_STAFF_PAGE } from '../config/pages.config';
import { useAuth } from '@contexts/AuthContext';

const usePageNavigation = () => {
    const { loginType } = useAuth();
    
    // loginType에 따라 기본 페이지 결정
    const getDefaultPage = () => {
        if (loginType === 'manager') {
            return DEFAULT_MANAGER_PAGE;
        } else if (loginType === 'staff') {
            return DEFAULT_STAFF_PAGE;
        }
        return PAGES.HOME; // 기본값
    };

    const [currentPage, setCurrentPage] = useState(getDefaultPage());
    const [pageDataStack, setPageDataStack] = useState([]);
    const [pageHistory, setPageHistory] = useState([getDefaultPage()]);

    // loginType이 변경될 때 기본 페이지 업데이트
    useEffect(() => {
        const defaultPage = getDefaultPage();
        setCurrentPage(defaultPage);
        setPageHistory([defaultPage]);
        setPageDataStack([]);
    }, [loginType]);

    // 일반 페이지 이동
    const navigateToPage = (page) => {
        setCurrentPage(page);
        setPageHistory(prev => [...prev, page]);
        // data clear
        setPageDataStack(prev => [...prev, { page, data: null }]);
    };

    // 데이터와 함께 페이지 이동
    const navigateToPageWithData = (page, data) => {
        setCurrentPage(page);
        setPageDataStack(prev => [...prev, { page, data }]);
        setPageHistory(prev => [...prev, page]);
    };

    // 현재 페이지 데이터 가져오기
    const getCurrentPageData = () => {
        const currentPageDataEntry = pageDataStack
            .slice()
            .reverse()
            .find(entry => entry.page === currentPage);
        
        return currentPageDataEntry?.data || {};
    };

    // 뒤로가기
    const goBack = () => {

      console.log('pageHistory', pageHistory);


        if (pageHistory.length > 1) {
            const newHistory = pageHistory.slice(0, -1);
            const previousPage = newHistory[newHistory.length - 1];
            
            setCurrentPage(previousPage);
            setPageHistory(newHistory);
            
            // 현재 페이지 데이터 제거
            setPageDataStack(prev => 
                prev.filter(entry => entry.page !== currentPage)
            );
        }
    };

    // 빠른 네비게이션 함수들
    const navigateToMap = (data = {}) => {
        if (Object.keys(data).length > 0) {
            navigateToPageWithData(PAGES.MAP, data);
        } else {
            navigateToPage(PAGES.MAP);
        }
    };

    const navigateToSearch = (data = {}) => {
        if (Object.keys(data).length > 0) {
            navigateToPageWithData(PAGES.SEARCH, data);
        } else {
            navigateToPage(PAGES.SEARCH);
        }
    };

    const navigateToEvents = (data = {}) => {
        if (Object.keys(data).length > 0) {
            navigateToPageWithData(PAGES.EVENTS, data);
        } else {
            navigateToPage(PAGES.EVENTS);
        }
    };

    const navigateToProfile = (data = {}) => {
        if (Object.keys(data).length > 0) {
            navigateToPageWithData(PAGES.PROFILE, data);
        } else {
            navigateToPage(PAGES.PROFILE);
        }
    };

    return {
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
    };
};

export default usePageNavigation;