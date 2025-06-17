import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader'

const NotificationsPage = ({
  navigateToPageWithData,
  PAGES,
  ...otherProps
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

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

  const notifications = [
    {
    id: 1,
    type: 'booking',
    icon: <span style={{ filter: 'grayscale(1)', fontSize: '1.25rem' }}>🔔</span>,
    message: 'New booking at Sky Lounge',
    date: '24/05/2028',
    time: '14:05',
    isRead: false
  },
  {
    id: 2,
    type: 'promotion',
    icon: <span style={{ filter: 'grayscale(1)', fontSize: '1.25rem' }}>💝</span>,
    message: '50% off at Beach Club',
    date: '24/05/2028',
    time: '07:05',
    isRead: true
  },
  {
    id: 3,
    type: 'alert',
    icon: <span style={{ filter: 'grayscale(1)', fontSize: '1.25rem' }}>⚠️</span>,
    message: 'Alert Event rescheduled',
    date: '24/05/2028',
    time: '16:05',
    isRead: false
  }
  ];

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

  const filteredNotifications = selectedFilter === 'all'
    ? notifications
    : notifications.filter(n => n.type === selectedFilter);

  const filterButtons = [
    { type: 'booking', label: 'Booking' },
    { type: 'promotion', label: 'Promotion' },
    { type: 'alert', label: 'Alert' }
  ];

  return (
    <>
      <style jsx>{`
        .notifications-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;

          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
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
          display: flex;
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
         
          font-size: 0.95rem;
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

        @media (max-width: 480px) {
          .notifications-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          
        }
      `}</style>

      <div className="notifications-container">
        {/* Header */}
        <SketchHeader
          title="Notifications"
          showBack={true}
          onBack={() => {
            // goBack();
            navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
          }}
          rightButtons={[
            <div
            size="small"
            onClick={handleClearAll}
          >
            Clear All
          </div>
          ]}
        />

        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-label">Filter by Type</div>
          <div className="filter-buttons">
            {filterButtons.map((filter) => (
              <SketchBtn
                key={filter.type}
                variant={selectedFilter === filter.type ? 'accent' : 'secondary'}
                size="small"
                onClick={() => handleFilterChange(filter.type)}
              >
                 {<HatchPattern opacity={0.4} />}
                {filter.label}
              </SketchBtn>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
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
                    {notification.message}
                  </p>
                  <p className="notification-datetime">
                    {notification.date} {notification.time}
                  </p>
                </div>

                <div className={`notification-status ${notification.isRead ? 'read' : 'unread'}`}>
                  {notification.isRead ? 'read' : 'unread'}
                </div>
              </div>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;