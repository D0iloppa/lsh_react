import React, { useState, useEffect } from 'react';
import axios, { getAdapter } from 'axios';
import { Calendar, Users, ClipboardList, Tag, Star, Headphones, Bell, Settings, MessagesSquare } from 'lucide-react';

import SketchHeader from '@components/SketchHeader';
import SketchMenuBtn from '@components/SketchMenuBtn';
import HatchPattern from '@components/HatchPattern';
import CocktailIcon from '@components/CocktailIcon';
import SketchDiv from '@components/SketchDiv';
import { useFcm } from '@contexts/FcmContext';

import '@components/SketchComponents.css';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';

import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';

export default function ManagerDashboard({ navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) {
  const { user, verifyPassword, logout } = useAuth();
  const { fcmToken } = useFcm();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  const [dashboardInfo, setDashboardInfo] = useState({
    recentReviews: 0,
    todaysReservations: 0,
    activePromotions: 0
  });

  // 알림 뱃지 상태 추가
  const [notificationCounts, setNotificationCounts] = useState({
    reservations: 0,  // 새로운 예약 대기
    reviews: 0,       // 새로운 리뷰
    chatting: 0,      // 읽지 않은 채팅
  });

  // 알림 개수 가져오는 함수
  const fetchNotificationCounts = async () => {
    try {
      const venue_id = user?.venue_id;
      if (!venue_id) return;

      // API 호출 (실제 구현에 맞게 수정)
       const response = await ApiClient.get('/api/getManagerUnreadCount', {
         params: { 
          venue_id, 
          manager_id: user?.manager_id, 
          participant_type: 'manager', 
          participant_user_id: user?.manager_id
         }
       });

      setNotificationCounts({
        reservations: response.getUnreadCountReservation_mng || 0,
        reviews: response.getUnreadCountReview_mng || 0,
        chatting: response.getUnreadCountChat_mng || 0,
      });
    } catch (error) {
      console.error('알림 개수 조회 실패:', error);
      
      setNotificationCounts({
        reservations: 0,
        reviews: 0,
        chatting: 0,
      });
    }
  };

  useEffect(() => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
  
    const upateAppId = async () => {
      try {
        const res = await axios.get(`${API_HOST}/api/upateAppId`, {
          params: {
            user_id: user?.manager_id || 1,
            app_id: fcmToken || '2345',
            login_type: 1,
          },
        });
        return res.data || [];
      } catch (err) {
        return [];
      }
    };

    if (fcmToken) {
      upateAppId();
      //alert('📲 HomePage에서 받은 FCM 토큰:', fcmToken, 'manager_id:', user?.manager_id || 1);
    }
  }, [fcmToken, user]);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }

    // 대시보드 정보 불러오기
    const fetchDashboardInfo = async () => {
      try {
        const venue_id = user?.venue_id;
        if (!venue_id) return;
        const res = await ApiClient.postForm('/api/getManagerDashboardInfo', { venue_id });
        setDashboardInfo(res);
      } catch (e) {
        console.error('Dashboard info fetch error:', e);
      }
    };

    fetchDashboardInfo();
    fetchNotificationCounts(); // 알림 개수도 함께 조회

  }, [messages, currentLang]);

  // 주기적으로 알림 개수 업데이트 (10초마다)
  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotificationCounts();
    }, 10000);

    return () => clearInterval(interval);
  }, [user?.venue_id]);

  const formatMessage = (messageKey, count) => {
    return get(messageKey).replace('{count}', count);
  };

  // 뱃지 컴포넌트
  const NotificationBadge = ({ count, isVisible = true }) => {
    if (!isVisible || count <= 0) return null;
    
    return (
      <div className="notification-badge">
        {count > 99 ? '99+' : count}
      </div>
    );
  };

  // 대시보드 상단 요약 정보
  const summary = [
    {
      title: (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            if(!chkAlert()) return;

            navigateToPage(PAGES.RESERVATION_MANAGEMENT)
          }}
        >
          <Calendar size={16} opacity={0.5}/>
          <span>{get('DASHBOARD_TODAYS_RESERVATIONS')}</span>
        </div>
      ),
      content: formatMessage('DASHBOARD_RESERVATIONS_COUNT', dashboardInfo.todaysReservations)
    },
    {
      title: (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            if(!chkAlert()) return;
            navigateToPage(PAGES.PROMOTION_MANAGEMENT);
          }}
        >
          <Tag size={16} opacity={0.5}/>
          <span>{get('DASHBOARD_ACTIVE_PROMOTIONS')}</span>
        </div>
      ),
      content: formatMessage('DASHBOARD_PROMOTIONS_COUNT', dashboardInfo.activePromotions)
    },
    {
      title: (
        <div
          style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          onClick={() => {
            if(!chkAlert()) return;
            
            navigateToPage(PAGES.REVIEW_MANAGEMENT);
          }}
        >
          <Star size={16} opacity={0.5}/>
          <span>{get('DASHBOARD_RECENT_REVIEWS')}</span>
        </div>
      ),
      content: formatMessage('DASHBOARD_REVIEWS_COUNT', dashboardInfo.recentReviews)
    }
  ];

  const chkAlert = () => {
    const chk = user.venue_id;

    if(!chk || chk < 1){
        console.log('venue 생성 전');

        Swal.fire({
            title: '매장 등록 필요',
            text: '매장을 등록해야 이용 가능합니다.',
            icon: 'info',
            confirmButtonText: '확인',
            confirmButtonColor: '#3085d6',
            showCancelButton: false,
            allowOutsideClick: true
        });


        return false;
    }

    return true;
  }

  // 대시보드 주요 메뉴 (뱃지 정보 추가)
  const menus = [
    {
      id: 1,
      icon: <Calendar size={24} />,
      name: get('MENU_RESERVATIONS'),
      page: PAGES.RESERVATION_MANAGEMENT,
      badgeCount: notificationCounts.reservations,  // 예약관리 뱃지
      showBadge: true,
      menuEvent: () => { 
        if(!chkAlert()) return;

        navigateToPage(PAGES.RESERVATION_MANAGEMENT); 
      }
    },
    {
      id: 2,
      icon: <Users size={24} />,
      name: get('MENU_STAFF_MANAGEMENT'),
      page: PAGES.STAFF_MANAGEMENT,
      badgeCount: 0,
      showBadge: false, // 스태프 관리는 뱃지 없음
      menuEvent: () => { 
        if(!chkAlert()) return;

        navigateToPage(PAGES.STAFF_MANAGEMENT); 
      }
    },
    {
      id: 3,
      icon: <ClipboardList size={24} />,
      name: get('MENU_STAFF_SCHEDULE'),
      page: PAGES.STAFF_SCHEDULE,
      badgeCount: 0,
      showBadge: false, // 스태프 스케줄은 뱃지 없음
      menuEvent: () => { 
        if(!chkAlert()) return;
        navigateToPage(PAGES.STAFF_SCHEDULE); 
      }
    },
    { 
      id: 4, 
      icon: <Tag size={24} />, 
      name: get('MENU_PROMOTIONS'), 
      page: PAGES.PROMOTION_MANAGEMENT,
      badgeCount: 0,
      showBadge: false, // 프로모션은 뱃지 없음
      menuEvent: () => { 
        if(!chkAlert()) return;
        navigateToPage(PAGES.PROMOTION_MANAGEMENT); 
      }
    },
    { 
      id: 5, 
      icon: <Star size={24} />, 
      name: get('MENU_REVIEWS'), 
      page: PAGES.REVIEW_MANAGEMENT,
      badgeCount: notificationCounts.reviews, // 리뷰 관리 뱃지
      showBadge: true,
      menuEvent: () => { 
        if(!chkAlert()) return;
        navigateToPage(PAGES.REVIEW_MANAGEMENT); 
      }
    },
    { 
      id: 6, 
      icon: <MessagesSquare size={24} />, 
      name: get('MENU_CHATTING'), 
      page: PAGES.CHATTING,
      badgeCount: notificationCounts.chatting, // 채팅 뱃지
      showBadge: true,
      menuEvent: () => { 
        if(!chkAlert()) return;
        navigateToPageWithData(PAGES.CHATTINGLIST, { chatRoomType: 'manager' }); 
      } 
    },
    { 
      id: 7, 
      icon: <Bell size={24} />, 
      name: get('MENU_NOTIFICATIONS'), 
      page: PAGES.NOTIFICATION_CENTER,
      badgeCount: 0,
      showBadge: false, // 알림센터는 뱃지 없음
      menuEvent: () => { 
        if(!chkAlert()) return;
        navigateToPage(PAGES.NOTIFICATION_CENTER); 
      }
    },
    { 
      id: 8, 
      icon: <Settings size={24} />, 
      name: getAdapter('MENU_SETTINGS'), 
      page: PAGES.MANAGER_SETTINGS,
      badgeCount: 0,
      showBadge: false, // 설정은 뱃지 없음
      menuEvent: () => { 
        navigateToPage(PAGES.MANAGER_SETTINGS); 
      }
    }
  ];

  return (
    <>
      <style jsx="true">{` 
        .menu-item { 
          position: relative;
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
          border: 1px solid #d1d5db;
          border-radius: 12px 10px 8px 14px;
          transform: rotate(0.4deg);
          transition: all 0.2s ease;
          cursor: pointer;
          box-sizing: border-box;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 0 -1px 0 rgba(0, 0, 0, 0.05);
          height: 60px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        
        .menu-item-wrapper {
          flex: 1 1 45%;
          minWidth: 140px;
          height: 60px;
          position: relative;
        }
        
        .item-content {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e8f9ff 100%);
          color: #1f2937;
          border: 1px solid #999999;
          box-shadow: 
            0 2px 4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05);
        }
        
        .menu-icon {
          margin-top: 3px;
        }
        
        .menu-item .menu-text {
          font-size: 0.9rem;
          line-height: 1.2;
          text-align: center;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          min-width: 23px;
          height: 23px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: bold;
          z-index: 10;
          border: 1px solid white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .notification-badge.large-count {
          min-width: 24px;
          height: 20px;
          border-radius: 10px;
          font-size: 10px;
        }

        .bottom-navigation {
          // max-height: 3vh;
        }
      `}</style>

      <div className="account-container">
        <SketchHeader 
          title={[<CocktailIcon key="icon" />, get('APP_TITLE')]}
          showBack={false}
          onBack={goBack}
          rightButtons={[]}
        />

        <div style={{ padding: '0.7rem 0 0 0' }}>
          {summary.map((item, idx) => (
            <div key={idx} style={{
              background: 'white',
              padding: '0.2rem 0.9rem',
              borderRadius: '5px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
              fontFamily: 'inherit',
              transform: 'rotate(-0.2deg)'
            }}>
              <SketchDiv className="item-content">
                <HatchPattern opacity={0.4} />
                <div className="big-card" style={{padding: '0.9rem'}}>
                  <div style={{ fontWeight: 600, fontSize: '0.98rem', marginBottom: 2 }}>{item.title}</div>
                  <div style={{ color: '#555', fontSize: '0.92rem', lineHeight: 1.3 }}>{item.content}</div>
                </div>
              </SketchDiv>
            </div>
          ))}
        </div>
      
        <div className="menu-section" style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '0.3rem', 
          padding: '1rem 0.7rem 1.5rem',
          alignItems: 'stretch' 
        }}>
          {menus.map((menu) => (
            <div key={menu.id} className="menu-item-wrapper">
              <SketchMenuBtn
                icon={menu.icon}
                name={menu.name}
                hasArrow={false}
                onClick={menu.menuEvent}
                className={"menu-item"}
              />
              <NotificationBadge 
                count={menu.badgeCount} 
                isVisible={menu.showBadge && menu.badgeCount > 0}
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}