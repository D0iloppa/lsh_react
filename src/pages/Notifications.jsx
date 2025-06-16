import React, { useState } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';

const NotificationsPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const notifications = [
    {
      id: 1,
      type: 'booking',
      icon: '🔔',
      message: 'New booking at Sky Lounge',
      date: '24/05/2028',
      time: '14:05',
      isRead: false
    },
    {
      id: 2,
      type: 'promotion',
      icon: '💝',
      message: '50% off at Beach Club',
      date: '24/05/2028', 
      time: '07:05',
      isRead: true
    },
    {
      id: 3,
      type: 'alert',
      icon: '⚠️',
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
    switch(notification.type) {
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
          min-height: 100vh;
          border: 4px solid #1f2937;
          position: relative;
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
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .filter-section {
          padding: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .filter-label {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.75rem;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .notifications-list {
          padding: 1rem;
        }

        .notification-item {
          border: 3px solid #1f2937;
          background-color: white;
          padding: 1rem;
          margin-bottom: 0.75rem;
          cursor: pointer;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          box-shadow: 2px 2px 0px #1f2937;
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
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.95rem;
          color: #374151;
          margin: 0 0 0.25rem 0;
          font-weight: bold;
        }

        .notification-datetime {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0;
        }

        .notification-status {
          font-family: 'Comic Sans MS', cursive, sans-serif;
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

          .filter-buttons {
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="notifications-container">
        {/* Header */}
        <div className="header">
          <h1 className="page-title">Notifications</h1>
          <SketchBtn 
            variant="secondary" 
            size="small"
            onClick={handleClearAll}
          >
            Clear All
          </SketchBtn>
        </div>

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
                {filter.label}
              </SketchBtn>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        <div className="notifications-list">
          {filteredNotifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : ''}`}
              onClick={() => handleNotificationClick(notification)}
            >
              {!notification.isRead && <HatchPattern opacity={0.03} />}
              
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
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationsPage;