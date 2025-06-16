import React from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';

const AccountPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {

  const handleBack = () => {
    console.log('Back 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
  };

  const handleNotificationClick = (type, message) => {
    console.log('Notification clicked:', type, message);
    // 각 알림 타입에 따른 페이지 이동 로직
    switch(type) {
      case 'venue_hours':
        navigateToPageWithData && navigateToPageWithData(PAGES.VENUE_DETAILS);
        break;
      case 'loyalty_program':
        navigateToPageWithData && navigateToPageWithData(PAGES.SUBSCRIPTION);
        break;
      case 'payment':
        navigateToPageWithData && navigateToPageWithData(PAGES.PAYMENT_HISTORY);
        break;
      default:
        console.log('Default notification action');
    }
  };

  const notifications = [
    {
      id: 1,
      icon: "⚠️",
      message: "IMPORTANT venue hours updated.",
      type: "venue_hours",
      isRead: false,
      hasArrow: true
    },
    {
      id: 2,
      icon: "💝",
      message: "Join our nightlife loyalty program.",
      type: "loyalty_program", 
      isRead: false,
      hasArrow: true
    },
    {
      id: 3,
      icon: "💳",
      message: "Payment received for your booking.",
      type: "payment",
      isRead: false,
      hasArrow: true
    },
    {
      id: 4,
      icon: "👍",
      message: "Your reservation is confirmed.",
      type: "reservation",
      isRead: true,
      hasArrow: false
    },
    {
      id: 5,
      icon: "🏷️",
      message: "Exclusive offer on VIP tables.",
      type: "offer",
      isRead: true,
      hasArrow: false
    },
    {
      id: 6,
      icon: "👍",
      message: "Payment reminder for last night.",
      type: "payment_reminder",
      isRead: true,
      hasArrow: false
    },
    {
      id: 7,
      icon: "👍",
      message: "You haven't booked for Saturday.",
      type: "booking_reminder",
      isRead: true,
      hasArrow: false
    },
    {
      id: 8,
      icon: "🏷️",
      message: "Subscribe for Event updates.",
      type: "event_subscription",
      isRead: true,
      hasArrow: false
    },
    {
      id: 9,
      icon: "🏷️",
      message: "Special Event this weekend.",
      type: "special_event",
      isRead: true,
      hasArrow: false
    }
  ];

  return (
    <>
      <style jsx>{`
        .account-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          border: 4px solid #1f2937;
          position: relative;
        }

        .header {
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          position: relative;
          text-align: center;
        }

        .back-button {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: #1f2937;
        }

        .page-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .notifications-section {
          padding: 1.5rem;
        }

        .notification-item {
          width: 100%;
          margin-bottom: 0.75rem;
          padding: 1rem;
          border: 3px solid #1f2937;
          background-color: white;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          text-align: left;
          cursor: pointer;
          transform: rotate(-0.2deg);
          transition: all 0.2s;
          box-shadow: 2px 2px 0px #1f2937;
          position: relative;
          overflow: hidden;
        }

        .notification-item:hover {
          transform: rotate(-0.2deg) scale(1.01);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .notification-item.read {
          background-color: #f3f4f6;
          transform: rotate(0.1deg);
        }

        .notification-item.read:hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .notification-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .notification-message {
          flex: 1;
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.3;
        }

        .notification-arrow {
          font-size: 1rem;
          color: #6b7280;
          flex-shrink: 0;
        }

        .notification-content {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          width: 100%;
        }

        @media (max-width: 480px) {
          .account-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="account-container">
        {/* Header */}
        <div className="header">
          <button className="back-button" onClick={handleBack}>
            &lt;
          </button>
          <h1 className="page-title">Account</h1>
        </div>

        {/* Notifications Section */}
        <div className="notifications-section">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`notification-item ${notification.isRead ? 'read' : ''}`}
              onClick={() => handleNotificationClick(notification.type, notification.message)}
            >
              {!notification.isRead && <HatchPattern opacity={0.03} />}
              
              <div className="notification-content">
                <div className="notification-icon">
                  {notification.icon}
                </div>
                
                <div className="notification-message">
                  {notification.message}
                </div>
                
                {notification.hasArrow && (
                  <div className="notification-arrow">
                    →
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default AccountPage;