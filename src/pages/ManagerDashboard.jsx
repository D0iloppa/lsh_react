import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Users, ClipboardList, Tag, Star, Headphones, Bell, Settings, MessagesSquare , Briefcase, LogIn, LogOut } from 'lucide-react';

import SketchHeader from '@components/SketchHeader';
import SketchMenuBtn from '@components/SketchMenuBtn';
import HatchPattern from '@components/HatchPattern';
import CocktailIcon from '@components/CocktailIcon';
import SketchDiv from '@components/SketchDiv';
import { useFcm } from '@contexts/FcmContext';
import LoadingScreen from '@components/LoadingScreen';
import SketchBtn from '@components/SketchBtn';

import '@components/SketchComponents.css';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import { useAuth } from '@contexts/AuthContext';

import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';

export default function ManagerDashboard({ navigateToPage, navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) {
  const { user, verifyPassword, logout } = useAuth();
  const { fcmToken } = useFcm();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [venueStatus, setVenueStatus] = useState('before_open');
  const [venueInfo, setVenueInfo] = useState({
    open_time: '',
    close_time: ''
  });
  
  
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

  // 매장 상태 맵핑
  const venueStatusMap = {
    before_open: {
      text: get('VENUE_STATUS_BEFORE_OPEN'),
      variant: 'secondary'
    },
    available: {
      text: get('VENUE_STATUS_OPERATING'),
      variant: 'green'
    },
    closed: {
      text: get('VENUE_STATUS_CLOSED'),
      variant: 'danger'
    }
  };

  // 매장 정보 가져오는 함수 추가
  const fetchVenueInfo = async () => {
    try {
      const venue_id = user?.venue_id;
      if (!venue_id) return;

      const response = await ApiClient.get('/api/getVenue', {
        params: { venue_id }
      });

      if (response) {
        setVenueInfo({
          open_time: response.open_time || '',
          close_time: response.close_time || ''
        });
        setVenueStatus(response.schedule_status || 'before_open');
      }
    } catch (error) {
      console.error('매장 정보 조회 실패:', error);
    }
  };

//  매장 상태 변경 함수
const handleVenueStatusToggle = async () => {
  const venue_id = user?.venue_id;

  // venue_id가 0 또는 음수일 경우: 등록 안내
  if (!venue_id || venue_id < 1) {
    await Swal.fire({
      title: get('SWAL_VENUE_REG1'),
      text: get('SWAL_VENUE_REG2'),
      icon: 'warning',
      confirmButtonText: get('INQUIRY_CONFIRM')
    });
    return;
  }

  // 상태 토글 로직: available <-> closed (before_open은 available로만 변경)
  const statusFlow = {
    before_open: 'available',
    available: 'closed',
    closed: 'available'
  };

  const newStatus = statusFlow[venueStatus];
  const currentStatusText = venueStatusMap[venueStatus]?.text;
  const newStatusText = venueStatusMap[newStatus]?.text;

  // 확인창 표시
  const result = await Swal.fire({
    title: get('WORK_SCHEDULE_REQUEST_CHANGE'),
    text: `"${currentStatusText}" ${get('VENUE_STATUS_CHANGE_CONFIRM')} "${newStatusText}"${get('VENUE_STATUS_CHANGE_QUESTION')}`,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: get('SETTINGS_CHECK_BUTTON'),
    cancelButtonText: get('Common.Cancel'),
    confirmButtonColor: newStatus === 'available' ? '#10b981' : '#ef4444',
    cancelButtonColor: '#6b7280'
  });

  if (!result.isConfirmed) return;

  try {
    const response = await ApiClient.postForm('/api/venueStatusUpdate', {
      venue_id: user.venue_id,
      status: newStatus,
      open_time: venueInfo.open_time,
      close_time: venueInfo.close_time
    });

    if (response > 0) {
      setVenueStatus(newStatus);
      
      Swal.fire({
        title: get('WORK_SCHEDULE_END'),
        text: `${get('VENUE_STATUS_CHANGE_SUCCESS')} "${newStatusText}"${get('VENUE_STATUS_CHANGE_SUCCESS_SUFFIX')}`,
        icon: 'success',
        confirmButtonText: get('SETTINGS_CHECK_BUTTON'),
        confirmButtonColor: '#10b981'
      });
    } else {
      throw new Error('API 응답이 성공을 나타내지 않습니다.');
    }
  } catch (error) {
    console.error('매장 상태 변경 실패:', error);
    Swal.fire({
      title: get('SWAL_ERROR_TITLE'),
      text: get('VENUE_STATUS_CHANGE_ERROR'),
      icon: 'error',
      confirmButtonText: get('SETTINGS_CHECK_BUTTON')
    });
  }
};

// 버튼 텍스트 가져오는 함수
const getVenueStatusButtonText = () => {
  return venueStatusMap[venueStatus]?.text || get('VENUE_STATUS_UNKNOWN');
};

// 버튼 variant 가져오는 함수
const getVenueStatusButtonVariant = () => {
  return venueStatusMap[venueStatus]?.variant || 'secondary';
};

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
    fetchVenueInfo();

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
            title: get('SWAL_VENUE_REG1'),
            text:  get('SWAL_VENUE_REG2'),
            icon: 'info',
            confirmButtonText: get('BUTTON_CONFIRM'),
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
      name: get('MENU_SETTINGS'), 
      page: PAGES.MANAGER_SETTINGS,
      badgeCount: 0,
      showBadge: false, // 설정은 뱃지 없음
      menuEvent: () => { 
        navigateToPage(PAGES.MANAGER_SETTINGS); 
      }
    }
  ];

  useEffect(() => {
    navigateToPage(PAGES.STAFF_MANAGEMENT);
  }, []);

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
        
        <div style={{
          background: 'white',
          padding: '0.2rem 0.9rem',
          borderRadius: '5px',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
          fontFamily: 'inherit',
          transform: 'rotate(-0.2deg)',
          marginBottom: '0.5rem'
        }}>
          <SketchDiv className="item-content">
            <HatchPattern opacity={0.4} />
            <div className="big-card" style={{padding: '0.9rem'}}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between', 
                marginBottom: '0.8rem' 
              }}>
                <div style={{minWidth: '56%'}}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Briefcase size={14} opacity={0.5}/>
                    <span style={{ fontWeight: 600, fontSize: '0.98rem' }}>
                      {get('MANAGER_VENUE_SETTING')}
                    </span>
                  </div>
                  {/* <div style={{ fontSize: '0.92rem', color: '#555', lineHeight: 1.3 }}>
                    {venueInfo.open_time && venueInfo.close_time ? 
                      `${venueInfo.open_time?.slice(0,5)} - ${venueInfo.close_time?.slice(0,5)}` : 
                     '-'
                    }
                  </div> */}
                </div>
                <SketchBtn 
                  variant={getVenueStatusButtonVariant()}
                  style={{
                    marginLeft: '0.5rem', 
                    background: venueStatus === 'available' ? '#10b981' : 
                              venueStatus === 'closed' ? '#ef4444' : '#5e656f',
                    color: 'white'
                  }}
                  size="small"
                  onClick={handleVenueStatusToggle}
                >
                  <HatchPattern opacity={0.6} />
                  {venueStatus === 'available' ? <LogOut size={14}/> : <LogIn size={14}/>} 
                  {getVenueStatusButtonText()}
                </SketchBtn>
              </div>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '0.85rem', 
                color: '#6b7280' 
              }}>
                <span style={{letterSpacing: '-0.5px'}}>
                  {get('title.text.14')} {get('VENUE_START_TIME')}: {venueInfo.open_time?.slice(0,5) || '-'}
                </span>
                <span style={{letterSpacing: '-0.5px'}}>
                 {get('title.text.14')} {get('VENUE_END_TIME')}: {venueInfo.close_time?.slice(0,5) || '-'}
                </span>
              </div>
            </div>
          </SketchDiv>
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
      
       <LoadingScreen
            variant="cocktail"
            subText="Loading..."
            isVisible={isLoading}
          />
    </>
  );
}