import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { Bell, CalendarCheck, MessageCircle } from 'lucide-react';

const mockNotifications = [
  {
    id: 1,
    icon: <Bell size={22} />, // System Alert
    title: 'System Alert',
    content: 'Your booking at Bamboo Bar is confirmed.\nEnjoy exclusive perks!',
    time: '2 mins ago',
  },
  {
    id: 2,
    icon: <CalendarCheck size={22} />, // Booking Update
    title: 'Booking Update',
    content: 'Staff message: Meet your hostess at 9 PM at the entrance.',
    time: '10 mins ago',
  },
  {
    id: 3,
    icon: <MessageCircle size={22} />, // Staff Message
    title: 'Staff Message',
    content: 'New event added to your list at Sky Lounge.',
    time: '30 mins ago',
  },
];

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
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .noti-card {
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          display: flex;
          align-items: flex-start;
        }
        .noti-icon {
          margin-right: 0.8rem;
          margin-top: 0.2rem;
        }
        .noti-info {
          flex: 1;
        }
        .noti-title {
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 0.1rem;
        }
        .noti-content {
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 0.2rem;
          white-space: pre-line;
        }
        .noti-time {
          font-size: 0.93rem;
          color: #888;
        }
        .noti-mark-btn {
          min-width: 54px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
          margin-left: 1rem;
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
              <div className="noti-icon">{noti.icon}</div>
              <div className="noti-info">
                <div className="noti-title">{noti.title}</div>
                <div className="noti-content">{noti.content}</div>
                <div className="noti-time">{noti.time}</div>
              </div>
              <SketchBtn variant="event" size="small" className="noti-mark-btn">Mark</SketchBtn>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default NotificationCenter; 