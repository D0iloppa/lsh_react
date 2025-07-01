import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import { Calendar, MessageCircle } from 'lucide-react';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import Swal from 'sweetalert2';

const mockBookings = [
  {
    id: 1,
    venue: 'The Sunset Bar',
    status: 'Confirmed',
    date: '12th Nov, 2023',
    time: '8:00 PM',
    customer: 'Minh Tran',
    actions: ['CUSTOMER', 'Accept', 'MANAGER']
  },
  {
    id: 2,
    venue: 'Lotus Lounge',
    status: 'Cancelled',
    date: '15th Oct, 2023',
    time: '10:00 PM',
    customer: 'An Nguyen',
    actions: ['CUSTOMER', 'Accept', 'MANAGER']
  },
  {
    id: 3,
    venue: 'Moonlight Terrace',
    status: 'Completed',
    date: '20th Sep, 2023',
    time: '9:00 PM',
    customer: 'Linh Vu',
    actions: ['CUSTOMER', 'Accept', 'MANAGER']
  },
];

const StaffBookingList = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  const venue_id = user.venue_id;

   useEffect(() => {
            if (messages && Object.keys(messages).length > 0) {
              console.log('✅ Messages loaded:', messages);
              // setLanguage('en'); // 기본 언어 설정
              console.log('Current language set to:', currentLang);
              window.scrollTo(0, 0);
            }
          }, [messages, currentLang]);

  // 예약 목록 로드 함수
  const loadBookings = async () => {
    if (!venue_id) return;

    try {
      setLoading(true);
      const response = await ApiClient.get('/api/getReservationList_mng', {
        params: { venue_id: venue_id }
      });

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
        console.log("API 데이터:", apiData);
        setBookings(apiData);
      } else {
        console.log("데이터가 없습니다");
        setBookings([]); // API 데이터가 없으면 목 데이터 사용
      }

    } catch (error) {
      console.error('예약 리스트 로딩 실패:', error);
      setBookings(mockBookings); // 에러 시 목 데이터 사용
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (venue_id) {
      loadBookings();
    } else {
      setBookings(mockBookings); // venue_id가 없으면 목 데이터 사용
    }
  }, [venue_id]);
  
  // action에 따른 variant 결정 함수
  const getButtonVariant = (action) => {
    switch(action) {
      case 'Accept':
        return 'event';
      case 'Decline':
        return 'danger';
      case 'Review':
        return 'secondary';
    }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Confirmed':
        return { color: '#059669'}; // 초록색
      case 'Cancelled':
        return { color: '#dc2626'}; // 빨간색
      case 'Completed':
        return { color: '#3b82f6'}; // 파란색
      default:
        return { color: '#6b7280'}; // 기본 회색
    }
  };

  const getActionText = (action) => {
    const actionMap = {
      'Accept': get('BOOKING_ACCEPT_BUTTON'),
      'CUSTOMER': get('BOOKING_CUSTOMER_CHAT'),
      'MANAGER': get('BOOKING_MANAGER_CHAT')
    };
    return actionMap[action] || action;
  };

  return (
    <>
      <style jsx="true">{`
        .bookinglist-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 75vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .booking-card {
          position: relative;
          background: #fff;
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          margin-bottom: 0.5rem;
        }
        .booking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }
        .booking-venue {
          font-size: 1.08rem;
          font-weight: 600;
        }
        .booking-status {
          font-size: 1.05rem;
          color: #222;
        }
        .booking-info {
          margin-top: 0.5rem;
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 1rem;
        }

        .booking-info div{
          padding: 0.1rem;
        }

        .booking-actions {
          display: flex;
          gap: 0.3rem;
        }
        .booking-action-btn {
          min-width: 54px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
        .booking-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .booking-list {
          padding: 0.5rem;
        }
        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #666;
        }
      `}</style>
        <div className="bookinglist-container">
        <SketchHeader
          title={
            <>
              <Calendar size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>
              {get('BOOKING_LIST_TITLE')}
            </>
          }
          showBack={true}
          onBack={goBack}
        />

        <div className='booking-list'> 
          {loading ? (
            <div className="loading-message">{get('BOOKING_LOADING')}</div>
          ) : (
            bookings.map(bk => (
              <SketchDiv key={bk.id || bk.reservation_id} className="booking-card">
                <HatchPattern opacity={0.6} />
                <div className="booking-header">
                  <div className="booking-venue">{bk.venue || bk.target_name}</div>
                  <div className="booking-status" style={getStatusStyle(bk.status)}>{bk.status}</div>
                </div>
                <div className="booking-info">
                  <div>{get('BOOKING_DATE_LABEL')} {bk.date || new Date(bk.res_date).toLocaleDateString()}</div>
                  <div>{get('BOOKING_TIME_LABEL')} {bk.time || bk.res_start_time}</div>
                  <div>{get('BOOKING_CUSTOMER_LABEL')} {bk.customer || bk.user_name}</div>
                </div>
                <div className="booking-actions">
                  {(bk.actions || ['CUSTOMER', 'Accept', 'MANAGER']).map(action => {
                    // Accept 버튼 활성화 조건: user.staff_id와 target_id가 같을 때만
                    const isAcceptDisabled = action === 'Accept' && 
                      (!user.staff_id || !bk.target_id || user.staff_id !== bk.target_id);
                    
                    return (
                      <SketchBtn 
                        key={action} 
                        variant={getButtonVariant(action)} 
                        size="small" 
                        className="booking-action-btn"
                        disabled={isAcceptDisabled}
                        style={isAcceptDisabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                      >
                        {action === 'MANAGER' || action === 'CUSTOMER' ? (
                          <>
                            <MessageCircle size={14} style={{ marginRight: '4px' }} />
                            {getActionText(action)}
                          </>
                        ) : (
                          getActionText(action)
                        )}
                      </SketchBtn>
                    );
                  })}
                </div>
              </SketchDiv>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default StaffBookingList;