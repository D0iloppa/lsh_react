import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import HatchPattern from '@components/HatchPattern';
import { useAuth } from '@contexts/AuthContext';
import { Calendar, Clock, Bell, MapPin, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';

const StaffHome = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {

  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

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
    return count > 1 ? get('STAFF_RESERVATION_PLURAL') : get('STAFF_RESERVATION_SINGLE');
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
          target_id: user.staff_id
        }
      });

      console.log('대시보드 API 응답:', response);

      // API 응답 처리
      let apiData = null;
      
      if (Array.isArray(response)) {
        apiData = response;
      } else if (response && response.data && Array.isArray(response.data)) {
        apiData = response.data;
      } else if (response && Array.isArray(response.data)) {
        apiData = response.data;
      }

      if (apiData && apiData.length > 0) {
        // 시간별 예약 데이터 처리
        const hourlyData = apiData.map(item => ({
          hour: item.hour,
          reservationCount: item.reservation_count || 0
        }));

        // 총 예약 수 계산
        const totalReservations = hourlyData.reduce((sum, item) => sum + item.reservationCount, 0);

        setDashboardInfo(prev => ({
          ...prev,
          todaysReservations: totalReservations,
          hourlyReservations: hourlyData,
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
        console.log("대시보드 데이터가 없습니다");
        setDashboardInfo(prev => ({
          ...prev,
          todaysReservations: 0,
          hourlyReservations: [],
          todaysBookings: []
        }));
      }

    } catch (error) {
      console.error('스태프 대시보드 데이터 로딩 실패:', error);
      setDashboardInfo(prev => ({
        ...prev,
        todaysReservations: 0,
        hourlyReservations: [],
        todaysBookings: []
      }));
    } finally {
      setIsLoadingData(false);
    }
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
        }
        .welcome-desc {
          font-size: 1.05rem;
          color: #222;
        }
        .section-card {
          position: relative;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #e8f9ff 100%);
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          margin-bottom: 0.4rem;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border: 1px solid #999999;
        }
        .section-title {
          font-size: 1.08rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .section-content {
          font-size: 0.97rem;
          color: #222;
        }
        .action-row {
          position: fixed;
          bottom: 94px;
          left: 50%;
          transform: translateX(-50%);
          width: 91%;
          max-width: 28rem;
          display: flex;
          gap: 0.3rem;
          margin: 0;
          padding: 0.8rem;
          z-index: 1000;
        }
        .action-btn {
          flex: 1;
          font-size: 1.05rem;
          min-width: 0;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
          border: 1px solid #d1d5db;
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
          <SketchDiv className="section-card">
            <HatchPattern opacity={0.6} />
            <div className="section-title">
              <Clock size={14} style={{marginRight: '5px'}}/> {get('STAFF_TODAYS_RESERVATIONS')} ({dashboardInfo.todaysReservations})
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

          <SketchDiv className="section-card">
            <HatchPattern opacity={0.6} />
            <div className="section-title">
              <Calendar size={14} opacity={0.6}/> {get('STAFF_UPCOMING_SHIFTS')} ({dashboardInfo.upcomingShifts.length})
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

          <SketchDiv className="section-card">
            <HatchPattern opacity={0.6} />
            <div className="section-title">
              <Bell size={14} opacity={0.6}/> {get('STAFF_UNREAD_NOTIFICATIONS')} ({dashboardInfo.unreadNotifications.length})
            </div>
            <div className="section-content">
              {dashboardInfo.unreadNotifications.length > 0 ? (
                dashboardInfo.unreadNotifications.map((notification, index) => (
                  <div key={index}>{notification.content}</div>
                ))
              ) : (
                <div className="empty-state">{get('STAFF_NO_UNREAD_NOTIFICATIONS')}</div>
              )}
            </div>
          </SketchDiv>

          </div>

          <div className="action-row">
            <SketchBtn 
              size="medium" 
              variant="secondary" 
              className="action-btn" style={{border: '1px solid #999999'}}
              onClick={handleEditProfile}
            >
              <HatchPattern opacity={0.6} />
               {get('Staff.home.btn1')}
            </SketchBtn>
            <SketchBtn 
              size="medium" 
              variant="secondary" 
              className="action-btn" style={{border: '1px solid #999999'}}
              onClick={handleBookingList}
            >
              <HatchPattern opacity={0.6} />
              {get('Staff.home.btn2')}
            </SketchBtn>
            <SketchBtn 
              size="medium" 
              variant="secondary" 
              className="action-btn" style={{border: '1px solid #999999'}}
              onClick={handleNewReviews}
            >
              <HatchPattern opacity={0.6} />
              {get('Staff.home.btn3')}
            </SketchBtn>
          </div>
        </div>
    </>
  );
};

export default StaffHome;