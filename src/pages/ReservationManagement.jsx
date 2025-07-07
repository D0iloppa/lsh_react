import React, { useState, useEffect } from 'react';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import { MessageCircle, Calendar, Check, Edit, ChevronLeft, ChevronRight } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';

const mockReservations = [
  {
    id: 1,
    date: 'Friday, 20th Oct',
    time: '8:00 PM',
    venue: 'SkyBar Lounge',
    status: 'pending',
  },
  {
    id: 2,
    date: 'Saturday, 21st Oct',
    time: '9:30 PM',
    venue: 'The Night Owl',
    status: 'confirmed',
  },
  {
    id: 3,
    date: 'Sunday, 22nd Oct',
    time: '11:00 PM',
    venue: 'Jazz Club',
    status: 'canceled',
  },
];

const statusList = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'canceled', label: 'Canceled' },
];


// 날짜 포맷팅 함수
const formatDate = (timestamp) => {
  try {
    const date = new Date(timestamp);
    // 유효한 날짜인지 확인
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', timestamp);
      return 'Invalid Date';
    }
    const options = { 
      weekday: 'long', 
      day: 'numeric', 
      month: 'short' 
    };
    return date.toLocaleDateString('en-US', options);
  } catch (error) {
    console.error('Date formatting error:', error, timestamp);
    return 'Invalid Date';
  }
};

// 시간 포맷팅 함수
const formatTime = (timeString) => {
  try {
    if (!timeString) return 'N/A';
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  } catch (error) {
    console.error('Time formatting error:', error, timeString);
    return 'N/A';
  }
};

// 날짜 유틸리티 함수들 추가 (컴포넌트 위에)
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

// API 데이터를 UI용 데이터로 변환하는 함수
const transformReservationData = (apiData) => {
  //console.log('Transforming API data:', apiData); // 디버깅용
  
  return apiData.map(item => {
    //console.log('Processing item:', item); // 각 아이템 확인
    
    const transformed = {
      id: item.reservation_id,
      date: formatDate(item.res_date), // timestamp를 "Friday, 20th Oct" 형식으로
      time: item.res_start_time === item.res_end_time 
        ? formatTime(item.res_start_time) 
        : `${formatTime(item.res_start_time)} - ${formatTime(item.res_end_time)}`, // 시작/종료 시간이 같으면 하나만 표시
      venue: item.name || 'Unknown Venue', // 스태프 이름을 venue 대신 사용
      status: item.status || 'unknown', // "confirmed", "pending", "cancelled"
      staffName: item.name,
      targetName: item.target_name,
      targetId: item.target_id,
      venueId: item.venue_id,
      reservedAt: item.reserved_at,
      client_name: item.client_name,
      client_id: item.client_id,
      use_escort: item.use_escort,
      note: item.note,
      attendee: item.attendee
    };
    
    console.log('Transformed item:', transformed); // 변환된 데이터 확인
    return transformed;
  });
};

const ReservationManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [reservations, setReservations] = useState([]); // API 연동 시 빈 배열로 시작
  const [loading, setLoading] = useState(false);
  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const [selectedDate, setSelectedDate] = useState(getToday());
  


const formatDateForDisplay = (dateString) => {
  const date = new Date(dateString);
  const options = { 
    month: 'short', 
    day: 'numeric',
    weekday: 'short'
  };
  return date.toLocaleDateString('ko-KR', options);
};

const addDays = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
};


// 날짜 변경 함수들 추가
const goToPreviousDay = () => {
  setSelectedDate(prevDate => addDays(prevDate, -1));
};

const goToNextDay = () => {
  setSelectedDate(prevDate => addDays(prevDate, 1));
};

const goToToday = () => {
  setSelectedDate(getToday());
};

// 선택된 날짜의 예약 개수 계산 함수 추가
const getReservationCountForDate = () => {
  return reservations.filter(r => {
    const reservationDate = new Date(r.date).toISOString().split('T')[0];
    return reservationDate === selectedDate;
  }).length;
};

    useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
          console.log('✅ Messages loaded:', messages);
          // setLanguage('en'); // 기본 언어 설정
          console.log('Current language set to:', currentLang);
          window.scrollTo(0, 0);
        }
      }, [messages, currentLang]);

  const venue_id = user.venue_id;
   //const venue_id = 1;
  
  // 상태별 텍스트를 가져오는 헬퍼 함수
  const getStatusText = (status) => {
    const statusMap = {
      'pending': get('RESERVATION_STATUS_PENDING'),
      'confirmed': get('RESERVATION_STATUS_CONFIRMED'),
      'canceled': get('RESERVATION_STATUS_CANCELED')
    };
    return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
  };


  // 예약 목록 로드 함수 (재사용을 위해 분리)
  const loadReservations = async () => {
    if (!venue_id) return;

    try {
      const response = await ApiClient.get('/api/getReservationList_mng', {
        params: {venue_id: venue_id}
      });

     
      
      // API 응답이 배열을 직접 반환하는 경우와 data 프로퍼티에 담겨오는 경우 모두 처리
      let apiData = null;
      
      if (Array.isArray(response)) {
        // 응답이 직접 배열인 경우
        apiData = response;
        //console.log("Using response directly as array");
      } else if (response && response.data && Array.isArray(response.data)) {
        // 응답이 객체이고 data 프로퍼티에 배열이 있는 경우
        apiData = response.data;
        //console.log("Using response.data as array");
      } else if (response && Array.isArray(response.data)) {
        // response.data가 배열인 경우
        apiData = response.data;
        //console.log("Using response.data as array (fallback)");
      }
      
      if (apiData && apiData.length > 0) {
        //console.log("Raw API data:", apiData); // 원본 데이터 확인
        const transformedData = transformReservationData(apiData);
        //console.log("Transformed data:", transformedData); // 변환된 데이터 확인
        setReservations(transformedData);
      } else {
        //console.log("No valid data found in response");
        setReservations([]);
      }

    } catch (error) {
      //console.error('예약 리스트 로딩 실패:', error);
      // 에러 시 빈 배열로 설정
      setReservations([]);
    }
  };
    const formatNoReservationsMessage = (status) => {
      const statusText = getStatusText(status);
      return get('NO_RESERVATIONS_FOUND').replace('{status}', statusText.toLowerCase());
    };

// 예약 관리 API 호출 함수 (승인/취소) - SweetAlert2로 변경
const handleReservationManage = async (reservation_id, mngCode) => {
  const actionText = mngCode === 1 
    ? get('RESERVATION_ACTION_APPROVE') 
    : get('RESERVATION_ACTION_CANCEL');
  
  const confirmText = mngCode === 1 
    ? get('RESERVATION_CONFIRM_APPROVE') 
    : get('RESERVATION_CONFIRM_CANCEL');
  
  // 확인창 표시 - SweetAlert2로 변경
  const result = await Swal.fire({
    title: get('RESERVATION_MANAGE_TITLE'),
    text: confirmText,
    icon: 'question',
    showCancelButton: true,
    confirmButtonText: actionText,
    cancelButtonText: get('RESERVATION_ACTION_CANCEL'),
    confirmButtonColor: mngCode === 1 ? '#10b981' : '#ef4444',
    cancelButtonColor: '#6b7280'
  });

  if (!result.isConfirmed) return;

  try {
    setLoading(true);
    
    const response = await ApiClient.postForm('/api/reservation/manage', {
      reservation_id: reservation_id,
      mngCode: mngCode
    });

    console.log(`${actionText} 응답:`, response);

    // 성공 시 예약 목록 다시 불러오기
    await loadReservations();
    
    // 성공 알림 - SweetAlert2로 변경
    const successMessage = mngCode === 1 
      ? get('RESERVATION_APPROVE_SUCCESS') 
      : get('RESERVATION_CANCEL_SUCCESS');
    
    Swal.fire({
      title: get('SWAL_SUCCESS_TITLE'),
      text: successMessage,
      icon: 'success',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
      confirmButtonColor: '#10b981'
    });
    
  } catch (error) {
    console.error(`예약 ${actionText} 실패:`, error);
    
    // 에러 알림 - SweetAlert2로 변경
    const errorMessage = mngCode === 1 
      ? get('RESERVATION_APPROVE_ERROR') 
      : get('RESERVATION_CANCEL_ERROR');
    
    Swal.fire({
      title: get('SWAL_ERROR_TITLE'),
      text: errorMessage,
      icon: 'error',
      confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
      confirmButtonColor: '#ef4444'
    });
  } finally {
    setLoading(false);
  }
};

  // 초기 로딩을 위한 useEffect - venue_id가 변경될 때만 호출
  useEffect(() => {
    if (!venue_id) return;

    const initializeReservations = async () => {
      setLoading(true);
      await loadReservations();
      setLoading(false);
    };

    initializeReservations();
  }, [venue_id]); // venue_id가 변경될 때만 실행

  // const filtered = reservations.filter(r => {
  //   if (selectedStatus === 'pending') {
  //     return r.status === 'pending' || r.status === 'accepted';
  //   }
  //   return r.status === selectedStatus;
  // });

  const filtered = reservations.filter(r => {
  // 먼저 날짜로 필터링
  const reservationDate = new Date(r.reservedAt).toISOString().split('T')[0];
  const isDateMatch = reservationDate === selectedDate;
  
  if (!isDateMatch) return false;

  // 그 다음 상태로 필터링
  if (selectedStatus === 'pending') {
    return r.status === 'pending' || r.status === 'accepted';
  }
  return r.status === selectedStatus;
});
  
const chatWithUser = async(r) => {
    console.log('chatWithManager', r);


    // 1. room_sn 조회
    const chatList = await ApiClient.get('/api/getChattingList', {
      params: {
        venue_id: user.venue_id,
        target : 'user',
        user_id : r.client_id,
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
      reservation_id: r.id,
      name : r.client_name,
      room_sn: room_sn,
      ...r
    });


    /*
    navigateToPageWithData(PAGES.CHATTING, { 
      initType: 'booking',
      reservation_id: bk.reservation_id,
      ...bk
    });
    */
  };

  return (
    <>
      <style jsx="true">{`
        .reservation-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 101vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .status-filter-row {
          display: flex;
          justify-content: space-around;
          gap: 0.5rem;
          margin: 0.7rem 0 0.7rem 0;
        }
        .reservation-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .reservation-card {
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          background-color: white;
          border: 1px solid #666;
          background: #fff;
          padding: 0.7rem 0.8rem 0.8rem 0.8rem;
          position: relative;
          box-shadow: none;
        }
        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.2rem;
        }
        .reservation-date {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .reservation-time {
          font-size: 0.92rem;
          color: #555;
          font-weight: 500;
        }
        .reservation-venue {
          font-size: 0.92rem;
          color: #222;
          margin-bottom: 0.2rem;
        }

         .reservation-venue div{
          margin-bottom: 1rem;
        }

        .reservation-status {
          font-size: 0.88rem;
          color: #888;
          margin-bottom: 0.2rem;
          text-align: end;
          margin-bottom: 1rem;
        }
        
        .status-badge {
          display: inline-block;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .status-pending {
          color: #d97706;
          background-color: #fef3c7;
          border: 1px solid #f59e0b;
        }
        
        .status-confirmed {
          color: #059669;
          background-color: #d1fae5;
          border: 1px solid #10b981;
        }
        
        .status-canceled {
          color: #dc2626;
          background-color: #fee2e2;
          border: 1px solid #ef4444;
        }
        
        .reservation-actions {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.2rem;
        }
        
        .action-btn {
          min-width: 54px;
          font-size: 0.88rem;
          padding: 0.18rem 0.5rem;
        }
        
        .action-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
          
        .reservation-contents {
          padding: 0.3rem;
          max-width: 250px;
        }

        .loading-message {
          text-align: center;
          padding: 2rem;
          color: #666;
        }

        .use_escort.applied {
            color: #ffffff;
            background-color: #44cc63;
            padding: 2px 6px;
            border-radius: 4px;
            margin-left: 0.3rem;
          }

          .use_escort.not_applied {
            color: #6c757d;
            background-color: #f0f0f0;
            padding: 2px 6px;
            border-radius: 4px;
            font-weight: normal;
            margin-left: 0.3rem;
          }
            .chat-style {
              padding: 0.3rem;
              background: #e2fffe;
              color: #126d6a;
              border: 1px solid #11a29d;
              border-radius: 15px;
              margin-left: 0.3rem;
            }

            .date-filter-section {
              margin: 0.7rem 0;
              padding: 0.5rem;
              background: #f8fafc;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
            }

            .date-navigation {
              display: flex;
              align-items: center;
              justify-content: space-between;
              margin-bottom: 0.5rem;
            }

            .date-nav-btn {
              padding: 0.3rem;
              background: #fff;
              border: 1px solid #d1d5db;
              border-radius: 6px;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .date-nav-btn:hover {
              background: #f3f4f6;
            }

            .current-date {
              font-size: 1.1rem;
              font-weight: 600;
              text-align: center;
              color: #1f2937;
            }

            .date-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 0.9rem;
              color: #6b7280;
            }

            .today-btn {
              padding: 0.2rem 0.5rem;
              background: #3b82f6;
              color: white;
              border: none;
              border-radius: 4px;
              cursor: pointer;
              font-size: 0.8rem;
            }

            .today-btn:hover {
              background: #2563eb;
            }
          
      `}</style>
      <div className="reservation-container">
        <SketchHeader
           title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Calendar size={18} />
              {get('Mng.menu.2.1')}
            </span>
          }
          showBack={true}
          onBack={goBack}
        />
        
        {/* <div className="status-filter-row">
          {statusList.map(s => (
            <SketchBtn
              key={s.key}
              variant={s.key === 'canceled' ? 'danger' : 'primary'}
              onClick={() => setSelectedStatus(s.key)}
              className={`status-btn ${selectedStatus === s.key ? 'selected' : ''}`}
              size="small"
            >
              {s.label}
            </SketchBtn>
          ))}
        </div> */}

        {/* 날짜 필터 섹션 */}
        <div className="date-filter-section">
          <div className="date-navigation">
            <button className="date-nav-btn" onClick={goToPreviousDay}>
              <ChevronLeft size={18} />
            </button>
            
            <div className="current-date">
              {formatDateForDisplay(selectedDate)}
            </div>
            
            <button className="date-nav-btn" onClick={goToNextDay}>
              <ChevronRight size={18} />
            </button>
          </div>
          
          <div className="date-info">
            <span>예약 {getReservationCountForDate()}건</span>
            {selectedDate !== getToday() && (
              <button className="today-btn" onClick={goToToday}>
                오늘
              </button>
            )}
          </div>
        </div>
      
        {loading ? (
          <div className="loading-message">{get('LOADING_RESERVATIONS')}</div>
        ) : (
          <div className="reservation-list">
           {filtered.length === 0 ? (
                <div className="loading-message">
                    {selectedDate === getToday() 
                      ? `오늘 ${getStatusText(selectedStatus).toLowerCase()} 예약이 없습니다.`
                      : `${formatDateForDisplay(selectedDate)} ${getStatusText(selectedStatus).toLowerCase()} 예약이 없습니다.`
                    }
                  </div>
                ) : (
              filtered.map(r => (

                <SketchDiv key={r.id} className="reservation-card">
                  <div className="reservation-header">
                    <div className="reservation-contents">
                      <div className="reservation-date">
                        <Calendar size={15} style={{marginRight: '3px'}}/>
                        {r.date}
                      </div>
                      <div className="reservation-venue">
                        <div>
                          {r.targetName === "venue" 
                            ? '- ' + get('RESERVATION_VENUE_LABEL') 
                            : '- ' + get('RESERVATION_STAFF_LABEL')
                          } {r.venue}
                        </div>
                        <div>
                          <Edit size={10}/> 예약자: <strong>{r.client_name}</strong> 
                          <span 
                            className='chat-style' 
                            onClick={() => chatWithUser(r)}
                          >
                            <MessageCircle size={14}/> chat
                          </span>
                        </div>
                        <div>
                          <Edit size={10}/> 참석 인원: <strong>{r.attendee} 명</strong>
                        </div>
                        <div>
                          <Edit size={10}/> 에스코트 여부: 
                           <span className={`use_escort ${r.use_escort === 1 ? 'applied' : 'not_applied'}`}>
                             {r.use_escort === 1 ? '신청' : '미신청'}
                          </span>
                        </div>
                        <div>
                         <Edit size={10}/> 예약자 메모: {r.note ? r.note : <span style={{color:'#9d9d9d'}}>메모 없음</span>}
                        </div>
                      </div>
                    </div>
                    <div className="reservation-time">{r.time}</div>
                  </div>
                  <div className="reservation-status">
                    {get('RESERVATION_STATUS_LABEL')} <span className={`status-badge status-${r.status}`}>
                      {getStatusText(r.status)}
                    </span>
                  </div>
                  <div className="reservation-actions">
                    {/* Approve 버튼 - pending일 때만 활성화, confirmed면 "승인됨", cancelled이면 숨김 */}
                    {r.status === 'canceled' ? null : (
                      <SketchBtn 
                        variant={r.status === 'confirmed' ? 'secondary' : 'event'} 
                        size="small" 
                        className="action-btn"
                        disabled={r.status === 'confirmed' || loading}
                        onClick={() => {
                          if (r.status === 'pending') {
                            handleReservationManage(r.id, 1); // 승인: mngCode = 1
                          }
                        }}
                      >
                        {r.status === 'confirmed' ? (
                          <>
                            <Check size={14} style={{marginRight: '3px'}}/>
                            {get('RESERVATION_APPROVED_BUTTON')}
                          </>
                        ) : get('RESERVATION_APPROVE_BUTTON')}
                      </SketchBtn>
                    )}
                    
                    {/* <SketchBtn variant="primary" size="small" className="action-btn">
                      <MessageCircle size={14} style={{marginRight: '3px'}}/>
                      {get('RESERVATION_CHAT_BUTTON')}
                    </SketchBtn> */}
                    
                    {/* Cancel 버튼 - cancelled 상태가 아닐 때만 표시 */}
                    {r.status !== 'canceled' && (
                      <SketchBtn 
                        variant="danger" 
                        size="small" 
                        className="action-btn"
                        disabled={loading}
                        onClick={() => {
                          handleReservationManage(r.id, -1); // 취소: mngCode = -1
                        }}
                      >
                        {get('RESERVATION_CANCEL_BUTTON')}
                      </SketchBtn>
                    )}
                  </div>
                  <HatchPattern opacity={0.4} />
                </SketchDiv>
              ))
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default ReservationManagement;