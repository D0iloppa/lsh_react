// pageHook.js
import { useState } from 'react';
import { PAGES, DEFAULT_PAGE } from '../config/pages.config';

const usePageNavigation = () => {
    const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE);
    const [pageDataStack, setPageDataStack] = useState([]);
    const [pageHistory, setPageHistory] = useState([DEFAULT_PAGE]);
    const [noBottom, setNobottom] = useState(false);

    const scrollToTopAndEmitAd = () => {

        console.log('scrollToTopAndEmitAd');
        
        // 스크롤 실행
        const scrollToTop = () => {
            console.log('scrollToTop');
            window.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        };
    
        scrollToTop();
        setTimeout(scrollToTop, 50);
        setTimeout(scrollToTop, 200);
    
        // 스크롤 후 광고 이벤트
        setTimeout(() => {
            window.testPopup.emit('adViewCount');
        }, 100);
    };

    // 일반 페이지 이동
    const navigateToPage = (page) => {
        setCurrentPage(page);
        setPageHistory(prev => [...prev, page]);
        setPageDataStack(prev => [...prev, { page, data: null }]);
    
        scrollToTopAndEmitAd();
    };
    
    const navigateToPageWithData = (page, data) => {
        if(page == PAGES.LOGIN){
            setNobottom(true); 
        } else {
            setNobottom(false); 
        }
    
        setCurrentPage(page);
        setPageDataStack(prev => [...prev, { page, data }]);
        setPageHistory(prev => [...prev, page]);
    
        scrollToTopAndEmitAd();
    };

    const navigateToPageFromNotificationData = async (page_id, data) => {
        console.log('navigateToPageFromNotificationData', page_id, data);
        
        const page = PAGES[page_id];
        if (!page) {
            console.error('해당 page_id를 찾을 수 없습니다:', page_id);
            return;
        }
    
        const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

        const NOTIFICATION_NAVIGATION_PATHS = {
            'CHATTING': [
                'CHATTINGLIST',
                'CHATTING'
            ]
        };
        
        const navigationPath = NOTIFICATION_NAVIGATION_PATHS[page_id];
    
        if (navigationPath && navigationPath.length > 1) {
            for (let i = 0; i < navigationPath.length; i++) {
                const pageId = navigationPath[i];
                const isLastPage = i === navigationPath.length - 1;
                const pageData = isLastPage ? data : null;
                
                if (pageData) {
                    navigateToPageWithData(pageId, pageData);
                } else {
                    navigateToPage(pageId);
                }
                
                // 마지막 페이지가 아니면 잠시 대기
                if (!isLastPage) {
                    await delay(10);
                }
            }
        } else {
            // 단순 이동
            if (data) {
                navigateToPageWithData(page_id, data);
            } else {
                navigateToPage(page_id);
            }
        }
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
        navigateToPageFromNotificationData,
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