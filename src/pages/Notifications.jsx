import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import SketchHeader from '@components/SketchHeader'

import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '@components/LoadingScreen';

const NotificationsPage = ({
  navigateToPageWithData,
  PAGES,
  goBack,
  ...otherProps
}) => {
  const [selectedFilter, setSelectedFilter] = useState('ALL');

const getIcon = () => {
    switch (type) {
      case 'booking':
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth={strokeWidth}
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`notification-icon ${className}`}
            {...props}
          >
            {/* 벨 아이콘 */}
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
        
      case 'promotion':
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth={strokeWidth}
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`notification-icon ${className}`}
            {...props}
          >
            {/* 선물 상자 아이콘 */}
            <polyline points="20,12 20,22 4,22 4,12" />
            <rect x="2" y="7" width="20" height="5" />
            <line x1="12" y1="22" x2="12" y2="7" />
            <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
            <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
          </svg>
        );
        
      case 'alert':
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth={strokeWidth}
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`notification-icon ${className}`}
            {...props}
          >
            {/* 경고 삼각형 아이콘 */}
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
        
      default:
        return (
          <svg 
            width={size} 
            height={size} 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke={color} 
            strokeWidth={strokeWidth}
            strokeLinecap="round" 
            strokeLinejoin="round"
            className={`notification-icon ${className}`}
            {...props}
          >
            {/* 기본 알림 아이콘 */}
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  const { user, isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]); // 초기 빈 배열로

  // 버튼 클릭 시 필터링
  const handleFilterType = (type) => {
    if (type === 'ALL') {
      setFilteredNotifications(notifications);
    }  else {
      const typeNum = parseInt(type, 10); // 문자열 → 숫자
      setFilteredNotifications(
        notifications.filter(item => item.notification_type === typeNum)
      );
    }
  };

const API_HOST = import.meta.env.VITE_API_HOST;
const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  // 마운트 시 즐겨찾기 가져오기
  useEffect(() => {
    window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      // setLanguage('en'); // 기본 언어 설정
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }

    const fetchNotifications = async () => {
      try {
        const response = await axios.get(`${API_HOST}/api/getNotificationList`, {
          params: { user_id: user?.user_id, notification_type: 3 }
        });
        setNotifications(response.data || []);
      } catch (error) {
        console.error('getMyFavoriteList 목록 불러오기 실패:', error);
      }
    };

    fetchNotifications();
  }, [messages, currentLang]);

  // favorites가 업데이트되면 filteredFavorites도 초기화
  useEffect(() => {
    setFilteredNotifications(notifications);
  }, [notifications]);



  const handleClearAll = () => {
    console.log('Clear All notifications');
    // 모든 알림 삭제 로직
  };

  const handleFilterChange = (filterType) => {
    setSelectedFilter(filterType);
    console.log('Filter changed to:', filterType);
  };

  const handleNotificationClick = (notification) => {
    console.log('Notification clicked:', notification);
    // 알림 클릭 시 해당 페이지로 이동
    switch (notification.type) {
      case 'booking':
        navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATIONS);
        break;
      case 'promotion':
        navigateToPageWithData && navigateToPageWithData(PAGES.PROMOTIONS);
        break;
      case 'alert':
        navigateToPageWithData && navigateToPageWithData(PAGES.ALERTS);
        break;
      default:
        break;
    }
  };

  const filterButtons = [
    { type: 'booking', label: 'Booking' },
    { type: 'promotion', label: 'Promotion' },
    { type: 'alert', label: 'Alert' }
  ];

  return (
    <>
      <style jsx="true">{`

        .notifications-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
        }

        .page-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .filter-section {
          // display: flex;
          padding: 17px 10px;
          border-bottom: 2px solid #e5e7eb;
        }

        .filter-label {
              margin-right: 12px;
            font-size: 0.9rem;
            font-weight: bold;
            color: #1f2937;
            line-height: 3;
            margin-bottom: 0px;
        }

        .filter-buttons {
          display: flex;
          gap:5px;
        }

        .notifications-list {
          padding: 1rem;
        }

        .notification-item {
          background-color: white;
          padding: 1rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .notification-item:hover {
          transform: rotate(-0.1deg) scale(1.01);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .notification-item.read {
          background-color: #f3f4f6;
          transform: rotate(0.1deg);
        }

        .notification-item.read:hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .notification-content {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .notification-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .notification-details {
          flex: 1;
        }

        .notification-message {
         
          font-size: 0.75rem;
          color: #374151;
          margin: 0 0 0.25rem 0;
          font-weight: bold;
        }

        .notification-datetime {
        
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .notification-status {
        
          font-size: 0.8rem;
          font-weight: bold;
          flex-shrink: 0;
        }

        .notification-status.unread {
          color: #dc2626;
        }

        .notification-status.read {
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 2rem 0;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          font-size: 0.83rem;
        }

        @media (max-width: 480px) {
          .notifications-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          
        }

        .filter-buttons .active-filter {
        background-color: #1f2937 !important; /* 검정색 배경 */
        color: #fff !important;           /* 흰색 글씨 */
        border: 1px solid #000 !important;
      }
      `}</style>

      <div className="notifications-container">
        {/* Header */}
        <SketchHeader
          title={ get('Notification1.1') }
          showBack={true}
          onBack={goBack}
        />

        {/* Filter Section */}
       {/* Filter Section */}
<div className="filter-section">
  <div className="filter-label"></div>
  <div className="filter-buttons">
    <SketchBtn 
      className={selectedFilter === "ALL" ? "active-filter" : ""}
      size="small"
      onClick={() => {
        handleFilterType("ALL");
        setSelectedFilter("ALL");
      }}
    >
      <HatchPattern opacity={0.4} />
      {get('btn.all.1')}
    </SketchBtn>

    <SketchBtn 
      className={selectedFilter === "3" ? "active-filter" : ""}
      size="small"
      onClick={() => {
        handleFilterType("3");
        setSelectedFilter("3");
      }}
    >
      <HatchPattern opacity={0.4} />
      {get('btn.booking.1')}
    </SketchBtn>

    <SketchBtn 
      className={selectedFilter === "2" ? "active-filter" : ""}
      size="small"
      onClick={() => {
        handleFilterType("2");
        setSelectedFilter("2");
      }}
    >
      <HatchPattern opacity={0.4} />
      {get('btn.promotion.1')}
    </SketchBtn>

    <SketchBtn 
      className={selectedFilter === "6" ? "active-filter" : ""}
      size="small"
      onClick={() => {
        handleFilterType("6");
        setSelectedFilter("6");
      }}
    >
      <HatchPattern opacity={0.4} />
      {get('btn.alert.1')}
    </SketchBtn>
  </div>
</div>



        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <SketchDiv
                key={notification.id}
                className={`notification-item ${notification.isRead ? 'read' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                {<HatchPattern opacity={0.4} />}

                <div className="notification-content">
                  <div className="notification-icon">
                    {notification.icon}
                  </div>

                  <div className="notification-details">
                    <p className="notification-message">
                      {notification.title}
                    </p>
                    <p className="notification-message">
                      {notification.message}
                    </p>
                    <p className="notification-datetime">
                      {notification.created_at
                          ? new Date(notification.created_at).toLocaleString('ko-KR', {
                              year: 'numeric',
                              month: '2-digit',
                              day: '2-digit',
                              hour: '2-digit',
                              minute: '2-digit',
                              second: '2-digit',
                              hour12: false
                            }).replace(/\./g, '-').replace(' ', ' ').replace(/- /g, '-')
                          : ''}
                    </p>
                  </div>

                  <div className={`notification-status ${notification.isRead ? 'read' : 'unread'}`}>
                    {notification.status}
                  </div>
                </div>
              </SketchDiv>
            ))
          ) : (
            <SketchDiv className="notification-item">
              <HatchPattern opacity={0.02} />
              <div className="empty-state">
                <h3>{get('Notifications.empty.title')}</h3>
                <p style={{fontSize: '0.83rem'}}>{get('Notifications.empty.description')}</p>
              </div>
            </SketchDiv>
          )}
          <LoadingScreen 
            variant="cocktail"
            loadingText="Loading..."
            isVisible={isLoading} 
          />
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;