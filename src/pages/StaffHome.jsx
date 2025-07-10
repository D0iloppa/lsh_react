import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { useAuth } from '@contexts/AuthContext';
import { Calendar, Clock, Bell, Star, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, ClipboardList } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import { useFcm } from '@contexts/FcmContext';

const StaffHome = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
 const { fcmToken } = useFcm();
  const [staffInfo, setStaffInfo] = useState({});
  const [dashboardInfo, setDashboardInfo] = useState({
    recentReviews: 0,
    todaysReservations: 0,
    activePromotions: 0,
    urgentMessages: [],
    todaysBookings: [],
    upcomingShifts: [],
    unreadNotifications: [],
    hourlyReservations: [] // 시간별 예약 데이터 추가
  });
  const [isLoadingData, setIsLoadingData] = useState(true);
  console.log('메시지 내용:', messages['Staff.home.btn1']); 



useEffect(() => {

  //alert(fcmToken)
  const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

  const upateAppId = async () => {

    
    try {
      const res = await axios.get(`${API_HOST}/api/upateAppId`, {
        params: {
          user_id: user?.staff_id || 1,
          app_id: fcmToken,
          login_type:2,
        },
      });
      return res.data || [];
    } catch (err) {
      console.error('즐겨찾기 실패:', err);
      return [];
    }
  };

  if (fcmToken) {
    upateAppId();
    // optional logging
    console.log('📲 HomePage에서 받은 FCM 토큰:', fcmToken, 'user_id:', user?.user_id || 1);
  }
}, [fcmToken, user]);


  useEffect(() => {
    window.scrollTo(0, 0);
    if (messages && Object.keys(messages).length > 0) {
      window.scrollTo(0, 0);
    }

    if (user) {
      setStaffInfo(user);
      fetchStaffDashboardData();
    }
  }, [messages, currentLang, user]);

  // 환영 메시지 포맷 함수
  const formatWelcomeTitle = (name) => {
    return get('STAFF_WELCOME_TITLE').replace('{name}', name);
  };

  // 예약 수량에 따른 단수/복수 처리
  const getReservationText = (count) => {
    return count > 1 ? get('text.cnt.1')+ get('STAFF_RESERVATION_PLURAL') : get('text.cnt.1') +  get('STAFF_RESERVATION_SINGLE');
  };

  const fetchStaffDashboardData = async () => {
  try {
    setIsLoadingData(true);
    
    // venue_id와 staff_id가 있는지 확인
    if (!user?.venue_id || !user?.staff_id) {
      console.error('venue_id 또는 staff_id가 없습니다:', user);
      return;
    }

    // 스태프 대시보드 데이터 가져오기
    const response = await ApiClient.get('/api/getStaffDashboardInfo', {
      params: {
        venue_id: user.venue_id,
        target_id: user.staff_id,
        notification_type: 5
      }
    });

    console.log('대시보드 API 응답:', response);
    console.log('response.data:', response.data);

    // API 응답에서 데이터 추출 - 응답 구조에 맞게 수정
    let todaysReservations = [];
    let notifications = { unread_count: 0, total_count: 0 };
    
    // response.data 구조인 경우
    if (response.data) {
      todaysReservations = response.data.todaysReservations || [];
      notifications = response.data.notifications || { unread_count: 0, total_count: 0 };
    } 
    // response 직접 구조인 경우
    else if (response) {
      todaysReservations = response.todaysReservations || [];
      notifications = response.notifications || { unread_count: 0, total_count: 0 };
    }

    console.log("todaysReservations:", todaysReservations);
    console.log("notifications:", notifications);

    // notifications에서 unread_count와 total_count 추출
    const unread_count = notifications?.unread_count ?? 0;
    const total_count = notifications?.total_count ?? 0;

    if (todaysReservations && todaysReservations.length > 0) {
      // 시간별 예약 데이터 처리
      const hourlyData = todaysReservations.map(item => ({
        hour: item.hour,
        reservationCount: item.reservation_count || 0
      }));

      // 총 예약 수 계산
      const totalReservations = hourlyData.reduce((sum, item) => sum + item.reservationCount, 0);

      console.log('처리된 데이터:', {
        totalReservations,
        hourlyData,
        unread_count,
        total_count
      });

      setDashboardInfo(prev => ({
        ...prev,
        todaysReservations: totalReservations,
        hourlyReservations: hourlyData,
        notifications: {
          unread_count: unread_count,
          total_count: total_count,
        },  
        // 시간별 데이터를 todaysBookings 형태로 변환
        todaysBookings: hourlyData
          .filter(item => item.reservationCount > 0)
          .map(item => ({
            time: `${item.hour}:00`,
            location: 'Staff Service',
            guestCount: item.reservationCount
          }))
      }));
    } else {
      console.log("오늘의 예약 데이터가 없습니다");
      setDashboardInfo(prev => ({
        ...prev,
        todaysReservations: 0,
        hourlyReservations: [],
        todaysBookings: [],
        notifications: {
          unread_count: unread_count,
          total_count: total_count,
        }
      }));
    }

  } catch (error) {
    console.error('스태프 대시보드 데이터 로딩 실패:', error);
    setDashboardInfo(prev => ({
      ...prev,
      todaysReservations: 0,
      hourlyReservations: [],
      todaysBookings: [],
      notifications: {
        unread_count: 0,
        total_count: 0,
      }
    }));
  } finally {
    setIsLoadingData(false);
  }
};

console.log(PAGES)  

 const handleStaffSchedule = () => {
    navigateToPageWithData(PAGES.STAFF_WORK_SCHEDULE, { staffId: user?.id });
  };

  const handleEditProfile = () => {
    navigateToPageWithData(PAGES.STAFF_EDIT_PROFILE, { staffId: user?.id });
  };

  const handleBookingList = () => {
    navigateToPageWithData(PAGES.STAFF_BOOKING_LIST, { staffId: user?.id });
  };

  const handleNewReviews = () => {
    navigateToPageWithData(PAGES.STAFF_REVIEWS, { staffId: user?.id });
  };

  const handleNotificationClick = () => {
      navigateToPageWithData(PAGES.NOTIFICATION_CENTER_STAFF, { staffId: user?.id });
   };



  if (isLoadingData) {
    return (
      <div className="staffhome-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx="true">{`


        body.lang-ja .staffhome-container {
          font-family: 'NotoSansJP', 'Meiryo', 'Hiragino Kaku Gothic ProN', sans-serif !important;
          color: #1f2937;
        }

        .staffhome-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding-bottom: 80px; /* 고정 버튼 공간 확보 */
        }
        .welcome-box {
          position: relative;
          background: #fff;
          box-sizing: border-box;
          border: 0.8px solid #666;
          border-top-left-radius: 15px 8px;
          border-top-right-radius: 8px 12px;
          border-bottom-right-radius: 12px 6px;
          border-bottom-left-radius: 6px 14px;
          padding: 1.1rem 0.9rem 0.7rem 0.9rem;
          margin-bottom: 0.7rem;
          text-align: center;
        }
        .welcome-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        .welcome-desc {
          font-size: 1.05rem;
          color: #1f2937;
        }
        .section-card {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e8f9ff 100%);
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          margin-bottom: 0.4rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1),
            inset 0 1px 0 rgba(255, 255, 255, 0.8),
            inset 0 -1px 0 rgba(0, 0, 0, 0.05)
          border: 1px solid #999999;
        }
        .section-title {
          font-size: 1.08rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #1f2937;
        }
        .section-content {
          font-size: 0.97rem;
          color: #222;
        }
       .action-grid {
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 0.4rem 0.9rem;
        }

        .action-row {
          display: flex;
          gap: 0.3rem;
          margin: 0;
          padding: 0.1rem;
        }

        .action-row-top, .action-row-bottom {
            height: 61px;
            display: flex;
            justify-content: space-between;
        }

        .action-btn {
          flex: 1;
          font-size: 1.05rem;
          min-width: 0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
          border: 1px solid #d1d5db;
          display: flex;
          align-items: center;
          justify-content: start;
          gap: 0.5rem; /* 아이콘과 텍스트 사이 간격 */
        }
        .empty-state {
          color: #6b7280;
          font-style: italic;
        }
        .hourly-reservation {
          margin-bottom: 0.3rem;
          padding: 0.3rem 0;
          border-bottom: 1px solid #f0f0f0;
        }
        .hourly-reservation:last-child {
          border-bottom: none;
        }
      `}</style>
          <div className="staffhome-container"> 
          <div className="welcome-box">
            <HatchPattern opacity={0.6} />
            <div className="welcome-title">{formatWelcomeTitle(staffInfo.name)}</div>
            <div className="welcome-desc">{get('STAFF_WELCOME_DESC')}</div>
          </div>
          
          {dashboardInfo.urgentMessages.length > 0 && (
            <SketchDiv className="section-card">
              <div className="section-title">{get('STAFF_URGENT_MESSAGE_TITLE')}</div>
              <div className="section-content">
                {dashboardInfo.urgentMessages.map((message, index) => (
                  <div key={index}>{message.content}</div>
                ))}
              </div>
            </SketchDiv>
          )}

        <div style={{padding: '0.2rem 0.9rem'}}>
          <SketchDiv className="section-card" onClick={handleBookingList}>
            <HatchPattern opacity={0.6} />
            <div className="section-title">
              <Clock size={14} style={{marginRight: '5px', opacity: '0.5'}}/> {get('STAFF_TODAYS_RESERVATIONS')} ({dashboardInfo.todaysReservations})
            </div>
            <div className="section-content">
              {dashboardInfo.hourlyReservations.length > 0 ? (
                dashboardInfo.hourlyReservations
                  .filter(item => item.reservationCount > 0)
                  .map((item, index) => (
                    <div key={index} className="hourly-reservation">
                      {item.hour}:00 - {item.reservationCount} {getReservationText(item.reservationCount)}
                    </div>
                  ))
              ) : (
                <div className="empty-state">{get('STAFF_NO_RESERVATIONS_TODAY')}</div>
              )}
            </div>
          </SketchDiv>

          <SketchDiv className="section-card" onClick={handleStaffSchedule}>
            <HatchPattern opacity={0.6} />
            <div className="section-title">
              <Calendar size={14} opacity={0.5}/> {get('STAFF_UPCOMING_SHIFTS')} ({dashboardInfo.upcomingShifts.length})
            </div>
            <div className="section-content">
              {dashboardInfo.upcomingShifts.length > 0 ? (
                dashboardInfo.upcomingShifts.map((shift, index) => (
                  <div key={index}>
                    {shift.date} - {shift.startTime} to {shift.endTime}
                  </div>
                ))
              ) : (
                <div className="empty-state">{get('STAFF_NO_UPCOMING_SHIFTS')}</div>
              )}
            </div>
          </SketchDiv>

          <SketchDiv 
              className="section-card notification-clickable" 
              onClick={handleNotificationClick}
              style={{ cursor: 'pointer' }}
            >
              <HatchPattern opacity={0.6} />
              <div className="section-title">
                <Bell size={14} opacity={0.5} /> {get('STAFF_UNREAD_NOTIFICATIONS')} ({dashboardInfo?.notifications?.unread_count ?? 0})
              </div>
              <div className="section-content">
                {(dashboardInfo?.notifications?.unread_count ?? 0) > 0 ? (
                  <div>
                    All notifications: {dashboardInfo?.notifications?.total_count ?? 0}
                  </div>
                ) : (
                  <div className="empty-state">{get('STAFF_NO_UNREAD_NOTIFICATIONS')}</div>
                )}
              </div>
            </SketchDiv>

          </div>

          <div className="action-grid">
            <div className="action-row action-row-top">
              <SketchBtn 
                size="medium" 
                variant="secondary" 
                className="action-btn" 
                style={{border: '1px solid #d1d5db'}}
                onClick={handleEditProfile}
              >
                <HatchPattern opacity={0.6} />
                <User size={24}/> {get('Staff.setting.profile.title')}
              </SketchBtn>
              <SketchBtn 
                size="medium" 
                variant="secondary" 
                className="action-btn" 
                style={{border: '1px solid #d1d5db'}}
                onClick={handleBookingList}
              >
                <HatchPattern opacity={0.6} />
                <Calendar size={24}/> {get('MENU_RESERVATIONS')}
              </SketchBtn>
            </div>
            <div className="action-row action-row-bottom">
              <SketchBtn 
                size="medium" 
                variant="secondary" 
                className="action-btn" 
                style={{border: '1px solid #d1d5db'}}
                onClick={handleNewReviews}
              >
                <HatchPattern opacity={0.6} />
                <Star size={24}/> {get('Staff.home.btn3')}
              </SketchBtn>
              <SketchBtn 
                size="medium" 
                variant="secondary" 
                className="action-btn" 
                style={{border: '1px solid #d1d5db'}}
                onClick={handleStaffSchedule}
              >
                <HatchPattern opacity={0.6} />
                <ClipboardList size={24}/>{get('Staff.menu.1')}
              </SketchBtn>
            </div>
          </div>
        </div>
    </>
  );
};

export default StaffHome;