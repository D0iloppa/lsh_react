import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { Bell, CalendarCheck, MessageCircle, Popsicle, Martini } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

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

// 알림 타입에 따른 아이콘 반환
const getNotificationIcon = (type) => {
  switch(type) {
    case 'system':
    case 'alert':
      return <Bell size={22} />;
    case 'booking':
    case 'reservation':
      return <CalendarCheck size={22} />;
    case 'message':
    case 'chat':
      return <MessageCircle size={22} />;
    default:
      return <Bell size={22} />;
  }
};

// 시간 포맷팅 함수
const formatTime = (timestamp) => {
  try {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMs = now - notificationTime;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} mins ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  } catch (error) {
    return 'Recently';
  }
};

const NotificationCenter_staff = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user, accountType, login } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const staff_id = user?.staff_id || 1;

// 알림 목록을 가져오는 함수를 별도로 분리
const fetchNotifications = async () => {
  if (!staff_id) return;

  try {
    setLoading(true);
    const response = await ApiClient.get('/api/getNotificationList', {
      params: { user_id: user?.staff_id, notification_type: 5 }
    });

    // API 응답 처리 (배열 직접 반환 또는 data 프로퍼티)
    let apiData = null;
    
    if (Array.isArray(response)) {
      apiData = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      apiData = response.data;
    }
    
    if (apiData && apiData.length >= 0) {
      setNotifications(apiData);
    } else {
      console.log('No notification data found');
      setNotifications([]);
    }

  } catch (error) {
    console.error('Failed to load notifications:', error);
    // 에러 시 빈 배열로 설정
    setNotifications([]);
  } finally {
    setLoading(false);
  }
};

// 컴포넌트 진입 시 알림 읽음 처리 및 목록 로드
useEffect(() => {
  const markNotificationsAsRead = async () => {
    try {
      // 스태프 알림 (notification_type: 5) 읽음 처리
      await ApiClient.postForm('/api/updateNotifi', {
        notification_type: 5, 
        user_id: user?.staff_id
      });
      
      console.log('알림 읽음 처리 완료');

      // 업데이트가 성공했으면 즉시 로컬 상태 반영
      if (result > 0) {
        // 현재 로드된 알림들의 is_read를 모두 true로 변경
        setNotifications(prevNotifications => 
          prevNotifications.map(noti => ({
            ...noti,
            is_read: true
          }))
        );
        console.log('✅ 알림 상태 즉시 반영 완료');
      }
      
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const initializeNotifications = async () => {
    if (!user?.staff_id) return;
    
    // 1. 먼저 알림을 읽음 처리
    await markNotificationsAsRead();
    
    // 2. 그 다음 알림 목록 로드
    await fetchNotifications();
  };

  initializeNotifications();
}, [user?.staff_id]);



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
          margin-bottom: 1rem;
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
          max-width: 196px;
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

        .icon-default {
          background-color: #f3f4f6;
          color: #6b7280;
          border-color: rgba(107, 114, 128, 0.3);
        }

        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #666;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        .no-notifications {
          text-align: center;
          padding: 2rem;
          color: #888;
          font-size: 0.95rem;
        }
      `}</style>
        <div className="noti-container">
        <SketchHeader
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Bell size={18} />
              {get('NOTIFICATION_CENTER_TITLE')}
            </span>
          }
          showBack={true}
          onBack={goBack}
        />
        
        {loading ? (
          <div className="loading-message">
            <Martini size={15} />
            <span>{get('LOADING_NOTIFICATIONS')}</span>
          </div>
        ) : (
          <div className="noti-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                {get('NO_NOTIFICATIONS_MESSAGE')}
              </div>
            ) : (
              notifications.map(noti => (
                <SketchDiv key={noti.notification_id || noti.id} className="noti-card">
                  <HatchPattern opacity={0.4} />
                  <div className="noti-icon">
                    <div className={`notification-icon ${getIconClass(noti.title || noti.type)}`}>
                      {getNotificationIcon(noti.type || noti.notification_type)}
                    </div>
                  </div>
                  <div className="noti-info">
                    <div className="noti-title">
                      {noti.title || noti.notification_title || get('NOTIFICATION_DEFAULT_TITLE')}
                    </div>
                    <div className="noti-content">
                      {noti.content || noti.message || noti.notification_content}
                    </div>
                    <div className="noti-time">{formatTime(noti.created_at)}</div>
                  </div>
                  <SketchDiv 
                      variant={noti.is_read ? "primary" : "secondary"} 
                      size="small" 
                      className={`noti-mark-btn ${noti.is_read ? 'read' : 'unread'}`}
                      style={{
                        width: '18%',
                        textAlign: 'center',
                        backgroundColor: noti.is_read ? '#d5d5d5' : 'rgb(250 250 250)'
                      }}
                    >
                      {noti.is_read ? 'Read' : 'Unread'}
                      <HatchPattern opacity={0.6} />
                    </SketchDiv>
                </SketchDiv>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default NotificationCenter_staff;