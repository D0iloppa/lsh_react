import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { Bell, CalendarCheck, MessageCircle, Popsicle } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    icon: <Bell size={22} />,
    title: 'System Alert',
    content: 'Your booking at Bamboo Bar is confirmed.\nEnjoy exclusive perks!',
    time: '2 mins ago',
    iconColor: '#ef4444', // 빨간색
    bgColor: '#fee2e2'    // 연한 빨간색 배경
  },
  {
    id: 2,
    icon: <CalendarCheck size={22} />,
    title: 'Booking Update',
    content: 'Staff message: Meet your hostess at 9 PM at the entrance.',
    time: '10 mins ago',
    iconColor: '#3b82f6', // 파란색
    bgColor: '#dbeafe'    // 연한 파란색 배경
  },
  {
    id: 3,
    icon: <MessageCircle size={22} />,
    title: 'Staff Message',
    content: 'New event added to your list at Sky Lounge.',
    time: '30 mins ago',
    iconColor: '#10b981', // 초록색
    bgColor: '#d1fae5'    // 연한 초록색 배경
  },
];

const getIconClass = (title) => {
  switch(title) {
    case 'System Alert': return 'icon-system';
    case 'Booking Update': return 'icon-booking';
    case 'Staff Message': return 'icon-message';
    default: return 'icon-default';
  }
};

const NotificationCenter = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  return (
    <>
      <style jsx="true">{`
        .noti-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .noti-list {
          margin-top: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.3rem;
        }
        .noti-card {
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          display: flex;
          align-items: flex-start;
          position: relative;
        }
        .noti-icon {
          margin-right: 0.8rem;
          margin-top: 0.2rem;
        }
        .noti-info {
          flex: 1;
          max-width: 180px;
        }
        .noti-title {
          margin-top: 0.6rem;
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 0.1rem;
        }
        .noti-content {
          margin-top: 0.9rem;
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 0.2rem;
          white-space: pre-line;
        }
        .noti-time {
          margin-top: 0.6rem;
          font-size: 0.93rem;
          color: #888;
        }
        .noti-mark-btn {
          min-width: 54px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }

        .notification-icon {
          width: 35px;
          height: 35px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .icon-system {
          background-color: #fee2e2;
          color: #ef4444;
          border-color: rgba(239, 68, 68, 0.3);
        }

        .icon-booking {
          background-color: #dbeafe;
          color: #3b82f6;
          border-color: rgba(59, 130, 246, 0.3);
        }

        .icon-message {
          background-color: #d1fae5;
          color: #10b981;
          border-color: rgba(16, 185, 129, 0.3);
        }
      `}</style>
      <div className="noti-container">
        <SketchHeader
          title="Notification Center"
          showBack={true}
          onBack={goBack}
        />
        <div className="noti-list">
          {mockNotifications.map(noti => (
            <SketchDiv key={noti.id} className="noti-card">
              <HatchPattern opacity={0.4} />
              <div className="noti-icon">
                <div className={`notification-icon ${getIconClass(noti.title)}`}>
                  {noti.icon}
                </div>
              </div>
              <div className="noti-info">
                <div className="noti-title">{noti.title}</div>
                <div className="noti-content">{noti.content}</div>
                <div className="noti-time">{noti.time}</div>
              </div>
              <SketchBtn variant="primary" size="small" className="noti-mark-btn" style={{width: '30%'}}>
                Mark
                <HatchPattern opacity={0.6} />
              </SketchBtn>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter;