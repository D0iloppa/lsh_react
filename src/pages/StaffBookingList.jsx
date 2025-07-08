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

import BookingSummary from '@components/BookingSummary';
import { overlay } from 'overlay-kit';

const mockBookings = [];

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
        const filtered = apiData.filter(item => item.target_name === 'staff');
        console.log("API 데이터:", apiData);
        setBookings(filtered);
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
      'MANAGER': get('BOOKING_MANAGER_CHAT'),
      'Detail': get('BOOKING_DETAIL_BUTTON')
    };
    return actionMap[action] || action;
  };

  const handleBtn = (action, bk) => {

    switch(action){
      case 'Accept':
        acceptBooking(bk);
        break;
      case 'Detail':
        detailBooking(bk);
        break;
      case 'MANAGER':
        chatWithManager(bk);
        break;
    }
  };

  const chatWithManager = async(bk) => {
    console.log('chatWithManager', bk);


    // 1. room_sn 조회
    const chatList = await ApiClient.get('/api/getChattingList', {
      params: {
        venue_id: user.venue_id,
        staff_id: user.staff_id,
        account_type: user.type
      }
    })

    let room_sn = null;
    if(chatList.length > 0){
      room_sn = chatList[0].room_sn;
      console.log('room_sn', room_sn);
    }

    navigateToPageWithData(PAGES.CHATTING, { 
      initType: 'booking',
      reservation_id: bk.reservation_id,
      room_sn: room_sn,
      ...bk
    });


    /*
    navigateToPageWithData(PAGES.CHATTING, { 
      initType: 'booking',
      reservation_id: bk.reservation_id,
      ...bk
    });
    */
  };

  const detailBooking = (bk) => {
    console.log('detailBooking', bk);

    // 시간 계산 로직
    const startTime = bk.res_start_time;
    const endTime = bk.res_end_time;
    
    // res_end_time에 1시간 추가
    const endTimeDate = new Date(`2000-01-01T${endTime}`);
    endTimeDate.setHours(endTimeDate.getHours() + 1);
    const adjustedEndTime = endTimeDate.toTimeString().slice(0, 5); // HH:MM 형식
    
    // duration 계산 (분 단위)
    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${adjustedEndTime}`);
    const durationMinutes = (endDate - startDate) / (1000 * 60);
    const durationHours = durationMinutes / 60;
    
    
    // 예약 데이터를 BookingSummary 컴포넌트용으로 변환
    const displayData = {
      targetName: bk.target_name,
      date: formatDate(bk.reserved_at),
      startTime: startTime,
      endTime: adjustedEndTime,
      duration: durationHours ? `${durationHours}시간` : '',
      attendee: `${bk.attendee}명`,
      memo: bk.note || ''
    };
  
    // 메시지 객체 생성
    const messages = {
      targetLabel: get('BookingSum.Target') || '예약 대상',
      dateLabel: get('BookingSum1.2') || '날짜',
      timeLabel: get('BookingSum1.3') || '시간',
      attendeeLabel: get('ReservationCompo1.1') || '참석자',
      memoLabel: get('Reservation.MemoLabel') || '메모',
      noMemo: get('BookingSum.NoMemo') || '메모 없음'
    };
  
    // 오버레이로 BookingSummary 표시
    overlay.open(({ isOpen, close, unmount }) => {
      return (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 3000,
            padding: '1rem'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              unmount();
            }
          }}
        >
          <div style={{
            maxWidth: '330px',
            width: '100%',
            maxHeight: '80vh',
            overflow: 'auto',
            margin: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
          }}>
            <BookingSummary 
              displayData={displayData}
              messages={messages}
            />
          </div>
        </div>
      );
    });
  };

  
  
  // 날짜 포맷팅 함수 추가
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    
    // 다국어 요일 처리
    const dayOfWeek = getDayOfWeek(date.getDay());
    
    return `${year}.${month}.${day} (${dayOfWeek})`;
  };
  
  // 요일 다국어 처리 함수 추가
  const getDayOfWeek = (dayIndex) => {
    const days = [
      get('Day.Sunday') || '일',
      get('Day.Monday') || '월', 
      get('Day.Tuesday') || '화',
      get('Day.Wednesday') || '수',
      get('Day.Thursday') || '목',
      get('Day.Friday') || '금',
      get('Day.Saturday') || '토'
    ];
    return days[dayIndex];
  };

  const acceptBooking = (bk) => {
    const { status = false } = bk;

    if(status === 'pending'){
      // accept를 할 수 있는 경우에만 진행
      ApiClient.postForm('/api/reservation/manage', {
        reservation_id: bk.reservation_id,
        mngCode:3
      }).then(res=>{
        // 성공 시 예약 목록 갱신
        Swal.fire({
          title: get('Reservation.ReservationTitle'),
          text: get('RESERVATION_APPROVE_SUCCESS'),
          icon: 'success',
          confirmButtonText: get('Common.Confirm')
        }).then(()=>{
          loadBookings();
        });
        
      }).catch(err=>{
        console.log('err', err);
      });
    }else{
      console.log('[acceptBooking]', bk, 'status is not pending');
    }
    
  };

  // 예약을 날짜별로 분류하는 함수
const classifyBookingsByDate = (bookings) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정하여 날짜만 비교

  const todayBookings = [];
  const pastBookings = [];

  bookings.forEach(bk => {
    // 예약 날짜 파싱
    let bookingDate;
    if (bk.date) {
      bookingDate = new Date(bk.date);
    } else if (bk.res_date) {
      bookingDate = new Date(bk.res_date);
    } else {
      // 날짜 정보가 없는 경우 과거로 분류
      pastBookings.push(bk);
      return;
    }

    bookingDate.setHours(0, 0, 0, 0); // 시간을 00:00:00으로 설정

    const timeDiff = bookingDate.getTime() - today.getTime();

    if (timeDiff >= 0) {
      // 오늘 또는 미래 (오늘 이후)
      todayBookings.push(bk);
    } else {
      // 과거
      pastBookings.push(bk);
    }
  });

  return {
    todayBookings,
    pastBookings
  };
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
          .booking-section-title {
            align-items: center;
             justify-content: space-between;
               background: #f2f2f2;
              border-top: 1px solid #dedede;
              font-size: 1.15rem;
              font-weight: 600;
              margin: 1rem 0 0.4rem 0;
              padding: 1rem;
              display: flex;
          }
          
          
          .section-title-text {
            font-size: 1.1rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          
          .section-count {
            background: #6c757d;
            color: white;
            border-radius: 12px;
            padding: 0.2rem 0.6rem;
            font-size: 0.85rem;
            font-weight: 500;
          }
          
          .no-bookings-message {
            text-align: center;
            padding: 2rem;
            color: #6c757d;
            font-size: 1.1rem;
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
        <>
          {(() => {
            const { todayBookings, pastBookings } = classifyBookingsByDate(bookings);
            
            return (
              <>
                {/* 오늘의 예약 */}
                {todayBookings.length > 0 && (
                  <>
                    <div className="booking-section-title">
                      <div className="section-title-text">
                        {get('TODAY_BOOKINGS_TITLE') || '오늘의 예약 내역'}
                      </div>
                      <div className="section-count">{todayBookings.length}</div>
                    </div>
                    {todayBookings.map(bk => (
                      <SketchDiv key={bk.id || bk.reservation_id} className="booking-card">
                        <HatchPattern opacity={0.6} />
                        <div className="booking-header">
                          <div className="booking-venue">{bk.venue || bk.target_name}</div>
                          <div className="booking-status" style={getStatusStyle(bk.status)}>{bk.status}</div>
                        </div>
                        <div className="booking-info">
                          <div>{get('BOOKING_DATE_LABEL')} {bk.date || new Date(bk.res_date).toLocaleDateString()}</div>
                          <div>{get('BOOKING_TIME_LABEL')} {bk.time || bk.res_start_time}</div>
                          <div>{get('BOOKING_CUSTOMER_LABEL')} {bk.client_name || bk.user_name}</div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            marginTop: '0.2rem'
                          }} className="booking-reservedAt">{get('BOOKING_RESERVED_AT_LABEL')} : {new Date(bk.reserved_at).toLocaleString()}</div>
                        </div>
                        <div className="booking-actions">
                          {(['Detail', 'Accept', 'MANAGER']).map(action => {
                            const isAcceptDisabled = action === 'Accept' && 
                              (!user.staff_id || !bk.target_id || user.staff_id !== bk.target_id);
                            
                            return (
                              <SketchBtn 
                                key={action} 
                                variant={getButtonVariant(action)} 
                                size="small" 
                                className="booking-action-btn"
                                disabled={isAcceptDisabled}
                                onClick={() => handleBtn(action, bk)}
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
                    ))}
                  </>
                )}

                {/* 지난 예약 */}
                {pastBookings.length > 0 && (
                  <>
                    <div className="booking-section-title">
                      <div className="section-title-text">
                       {get('PAST_BOOKINGS_TITLE') || '지난 예약 내역'}
                      </div>
                      <div className="section-count">{pastBookings.length}</div>
                    </div>
                    {pastBookings.map(bk => (
                      <SketchDiv key={bk.id || bk.reservation_id} className="booking-card">
                        <HatchPattern opacity={0.6} />
                        <div className="booking-header">
                          <div className="booking-venue">{bk.venue || bk.target_name}</div>
                          <div className="booking-status" style={getStatusStyle(bk.status)}>{bk.status}</div>
                        </div>
                        <div className="booking-info">
                          <div>{get('BOOKING_DATE_LABEL')} {bk.date || new Date(bk.res_date).toLocaleDateString()}</div>
                          <div>{get('BOOKING_TIME_LABEL')} {bk.time || bk.res_start_time}</div>
                          <div>{get('BOOKING_CUSTOMER_LABEL')} {bk.client_name || bk.user_name}</div>
                          <div style={{
                            fontSize: '0.8rem',
                            color: '#666',
                            marginTop: '0.2rem'
                          }} className="booking-reservedAt">{get('BOOKING_RESERVED_AT_LABEL')} : {new Date(bk.reserved_at).toLocaleString()}</div>
                        </div>
                        <div className="booking-actions">
                          {(['Detail', 'Accept', 'MANAGER']).map(action => {
                            const isAcceptDisabled = action === 'Accept' && 
                              (!user.staff_id || !bk.target_id || user.staff_id !== bk.target_id);
                            
                            return (
                              <SketchBtn 
                                key={action} 
                                variant={getButtonVariant(action)} 
                                size="small" 
                                className="booking-action-btn"
                                disabled={isAcceptDisabled}
                                onClick={() => handleBtn(action, bk)}
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
                    ))}
                  </>
                )}

                {/* 예약이 없는 경우 */}
                {bookings.length === 0 && (
                  <div className="no-bookings-message">
                    {get('NO_BOOKINGS_MESSAGE') || '예약 내역이 없습니다.'}
                  </div>
                )}
              </>
            );
          })()}
        </>
      )}
    </div>
  </div>
    </>
  );
};

export default StaffBookingList;