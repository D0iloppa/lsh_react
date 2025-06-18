// pageHook.js
import { useState } from 'react';
import { PAGES, DEFAULT_PAGE } from '../config/pages.config';

const usePageNavigation = () => {
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [pageDataStack, setPageDataStack] = useState([]);
    const [pageHistory, setPageHistory] = useState([DEFAULT_PAGE]);

    // 일반 페이지 이동
    const navigateToPage = (page) => {
        setCurrentPage(page);
        setPageHistory(prev => [...prev, page]);
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