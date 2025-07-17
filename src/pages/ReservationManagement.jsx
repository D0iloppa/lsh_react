
import React, { useState, useEffect, useRef, useMemo } from 'react';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import PersonFinderBillboard from '@components/PersonFinderBillboard';
import { MessageCircle, Calendar, Check, Edit, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

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

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

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

// 시간에 1시간을 더하는 함수 (기존 formatTime 함수 근처에 추가)
const addOneHour = (timeString) => {
  try {
    if (!timeString) return 'N/A';
    const [hours, minutes, seconds] = timeString.split(':');
    let hour = parseInt(hours);
    hour = (hour + 1) % 24; // 23시 + 1 = 0시로 처리
    return `${hour.toString().padStart(2, '0')}:${minutes}${seconds ? ':' + seconds : ''}`;
  } catch (error) {
    console.error('Time adding error:', error, timeString);
    return timeString;
  }
};

// API 데이터를 UI용 데이터로 변환하는 함수
const transformReservationData = (apiData) => {
  //console.log('Transforming API data:', apiData); // 디버깅용
  
  return apiData.map(item => {
    console.log('Processing item:', item); // 각 아이템 확인
    
    const transformed = {
      id: item.reservation_id,
      date: formatDate(item.res_date), // timestamp를 "Friday, 20th Oct" 형식으로
       time: item.res_start_time === item.res_end_time 
        ? `${formatTime(item.res_start_time)} - ${formatTime(addOneHour(item.res_start_time))}` // 시작시간과 종료시간이 같으면 +1시간으로 표시
        : `${formatTime(item.res_start_time)} - ${formatTime(item.res_end_time)}`, // 다르면 그대로 표시
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
      use_staff: item.use_staff,
      note: item.note,
      attendee: item.attendee,
      noShowCount: item.no_show_count
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
  const [showBillboard, setShowBillboard] = useState(false);

  // 달력 관련 상태 추가
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(dayjs().month());
  const [calendarYear, setCalendarYear] = useState(dayjs().year());
  const calendarScrollRef = useRef(null);
  const today = dayjs();

  // actionMap과 mngCodeMap 상태 추가
  const [actionMap, setActionMap] = useState({});
  const [mngCodeMap, setMngCodeMap] = useState({});

  // 페이지 마운트 시 최초로 버튼 action, mng_code 매핑 정보 조회
  useEffect(() => {
    const fetchButtonInfo = async () => {
      const response = await ApiClient.get('/api/getReservationActionRule', {});
      const {actionMap={}, mngCodeMap={}} = response;      
      console.log('actionMap', actionMap);
      console.log('mngCodeMap', mngCodeMap);
      setActionMap(actionMap);
      setMngCodeMap(mngCodeMap);
    }

    fetchButtonInfo();
  }, []);


  // 달력 셀 생성 (첫 번째 파일에서 가져옴)
  const calendarCells = useMemo(() => {
    const currentDate = dayjs(`${calendarYear}-${calendarMonth + 1}-01`);
    const todayInCurrentMonth = currentDate.month() === today.month() && currentDate.year() === today.year() ? today : currentDate.date(15);
    
    const startOfWeek = todayInCurrentMonth.startOf('week');
    const cells = [];
    const totalWeeks = 8;
    const startDate = startOfWeek.subtract(2, 'week');
    
    for (let week = 0; week < totalWeeks; week++) {
      for (let day = 0; day < 7; day++) {
        const date = startDate.add(week * 7 + day, 'day');
        cells.push({
          date: date,
          isCurrentMonth: date.month() === currentDate.month() && date.year() === currentDate.year()
        });
      }
    }

    return cells;
  }, [calendarMonth, calendarYear, today]);

  // 달력 관련 함수들
    const handleCalendarPrevMonth = () => {
      let newMonth = calendarMonth - 1;
      let newYear = calendarYear;
      if (newMonth < 0) {
        newMonth = 11;
        newYear -= 1;
      }
      setCalendarMonth(newMonth);
      setCalendarYear(newYear);
    };

    const handleCalendarNextMonth = () => {
      let newMonth = calendarMonth + 1;
      let newYear = calendarYear;
      if (newMonth > 11) {
        newMonth = 0;
        newYear += 1;
      }
      setCalendarMonth(newMonth);
      setCalendarYear(newYear);
    };

    const handleCalendarDateSelect = (date) => {
      setSelectedDate(date.format('YYYY-MM-DD'));
      setShowCalendar(false); // 날짜 선택 후 달력 닫기
    };

      // 선택된 날짜를 찾아서 스크롤 위치 조정
  useEffect(() => {
    if (showCalendar && calendarScrollRef.current && calendarCells.length > 0) {
      const selectedIndex = calendarCells.findIndex(cell => 
        cell.date.format('YYYY-MM-DD') === selectedDate
      );
      
      if (selectedIndex !== -1) {
        // 선택된 날짜가 포함된 주의 시작 인덱스 계산
        const selectedWeekStartIndex = selectedIndex - (selectedIndex % 7);
        
        // 2주 블록 인덱스 계산 (14개씩 묶음)
        const twoWeekBlockIndex = Math.floor(selectedWeekStartIndex / 14);
        
        // 해당 2주 블록으로 스크롤
        setTimeout(() => {
          const calendar2WeeksElements = calendarScrollRef.current?.querySelectorAll('.calendar-2weeks');
          
          if (calendar2WeeksElements && calendar2WeeksElements[twoWeekBlockIndex]) {
            const elementHeight = calendar2WeeksElements[twoWeekBlockIndex].offsetHeight;
            const scrollPosition = twoWeekBlockIndex * elementHeight;
            
            calendarScrollRef.current.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }
        }, 100); // 달력이 열린 후 스크롤
      }
    }
  }, [showCalendar, selectedDate, calendarCells]);


const registerReader = async (reservationId) => {
  try {
    if (!user?.manager_id || !reservationId) {
      console.warn('Manager ID 또는 Reservation ID가 없어서 registerReader를 건너뜁니다.');
      return;
    }

    const response = await ApiClient.postForm('/api/registerReader', {
      target_table: 'ManagerReservations',
      target_id: reservationId,        // 각 예약의 ID
      reader_type: 'manager',
      reader_id: user.manager_id
    });

    console.log('✅ registerReader 성공:', response);
    
  } catch (error) {
    console.error('❌ registerReader 실패:', error);
  }
};


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
    const reservationDate = new Date(r.res_date).toISOString().split('T')[0];
    return reservationDate === selectedDate;
  }).length;
};

    useEffect(() => {
        if (messages && Object.keys(messages).length > 0) {
          window.scrollTo(0, 0);
        }
      }, [messages, currentLang]);

  const venue_id = user.venue_id;
   //const venue_id = 1;
  
  // 상태별 텍스트를 가져오는 헬퍼 함수
  const getStatusText = (status) => {
    /*
    const statusMap = {
      'pending': get('RESERVATION_STATUS_PENDING'),
      'confirmed': get('RESERVATION_STATUS_CONFIRMED'),
      'canceled': get('RESERVATION_STATUS_CANCELED')
    };
    */
    const statusMap = {
      'canceled': get('RESERVATION_CANCELED_BUTTON'),
      'completed': get('RESERVATION_COMPLETED_BUTTON'),
      'confirmed': get('RESERVATION_CONFIRMED_BUTTON'),
      'no_show': get('RESERVATION_NO_SHOW_BUTTON'),
      'pending': get('RESERVATION_PENDING_BUTTON')
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

 console.log("mngCode", mngCode);

  let actionText;
  let confirmText;

  if (mngCode === 1) {
    actionText = get('RESERVATION_ACTION_APPROVE');
    confirmText = get('RESERVATION_CONFIRM_APPROVE');
  } else if (mngCode === 2) {
    actionText = get('Common.Confirm');
    confirmText = get('RESERVATION_CONFIRMED_VISIT');
  } else if (mngCode === 3) {
    actionText = get('Common.Confirm');
    confirmText = get('RESERVATION_CONFIRMED_NOSHOW');
  } else {
    actionText = get('Common.Confirm');
    confirmText = get('RESERVATION_CONFIRM_CANCEL');
  }

  

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
    Swal.fire({
      title: get('SWAL_SUCCESS_TITLE'),
      text: get('RESERVATION_CONFIRMED_GOOD'),
      icon: 'success',
      confirmButtonText: get('Common.Confirm'),
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
    
    // 먼저 예약 목록 로드
    await loadReservations();
    
    setLoading(false);
  };

  initializeReservations();
}, [venue_id, user.manager_id]);
 
useEffect(() => {
  const registerAllReservations = async () => {
    if (reservations.length > 0) {
      // 날짜별로 필터링된 예약들에 대해서만 registerReader 호출
      const todayReservations = reservations.filter(r => {
        const reservationDate = new Date(r.reservedAt).toISOString().split('T')[0];
        return reservationDate === selectedDate;
      });

      // 각 예약에 대해 registerReader 호출
      for (const reservation of todayReservations) {
        await registerReader(reservation.id);
      }
    }
  };

  registerAllReservations();
}, [reservations, selectedDate]);

  // const filtered = reservations.filter(r => {
  //   if (selectedStatus === 'pending') {
  //     return r.status === 'pending' || r.status === 'accepted';
  //   }
  //   return r.status === selectedStatus;
  // });

  const filtered = reservations.filter(r => {
  const reservationDate = new Date(r.reservedAt).toISOString().split('T')[0];
  return reservationDate === selectedDate;
});

const getReservationCountByDate = (date) => {
  const dateString = date.format('YYYY-MM-DD');
  return reservations.filter(r => {
    const reservationDate = new Date(r.reservedAt).toISOString().split('T')[0];
    return reservationDate === dateString;
  }).length;
};
  
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

    console.log('r', r);


    navigateToPageWithData(PAGES.CHATTING, { 
      initType: 'booking',
      reservation_id: r.id,
      name : r.client_name,
      room_sn: room_sn,
      send_to: 'user',
      receiver_id: r.client_id,
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
          margin-bottom: 6rem;
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
          padding-bottom: 1rem;
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
          margin-top: 0.2rem;
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .reservation-time {
          font-size: 0.8rem;
          color: #555;
          font-weight: 500;
          margin-top: 8px;
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
              display: flex;
              align-items: center;
              gap: 0.5rem;
            }

            .calendar-toggle-btn {
              padding: 0.2rem;
              background: none;
              border: none;
              cursor: pointer;
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 4px;
              transition: background-color 0.2s;
            }

            .calendar-toggle-btn:hover {
              background: #e5e7eb;
            }

            .date-number {
              font-size: 0.9rem;
              line-height: 1;
            }

            .reservation-count {
                z-index: 999;
                top: -15px;
                left: 15px;
                position: relative;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                font-size: 0.9rem;
                width: 1rem;
                height: 1rem;
                justify-content: center;
                margin-top: 1px;
                font-weight: 600;
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
              .title-wrap {
                display: flex;
                justify-content: space-between;
              }

            /* 달력 스타일 */
            .calendar-accordion {
              overflow: hidden;
              transition: max-height 0.3s ease-in-out;
              max-height: 0;
            }

            .calendar-accordion.open {
              max-height: 205px;
            }

            .calendar-content {
              padding-top: 1rem;
              background: #fff;
              border-top: 1px solid #e5e7eb;
              margin-top: 0.5rem;
              
            }
              .content-area{padding-bottom: 0px;}

            .calendar-month-nav {
              display: flex;
              align-items: center;
              justify-content: center;
              margin-bottom: 1rem;
              gap: 0.7rem;
            }

            .calendar-month-btn {
              background: #f1f4f8;
              color: #222 !important;
              box-shadow: none !important;
              padding: 0.08rem 0.5rem !important;
              min-width: 0;
              font-size: 0.92rem !important;
              height: 1.7rem;
              line-height: 1.1;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              cursor: pointer;
            }

            .calendar-month-label {
              font-size: 1rem;
              font-weight: 600;
              margin: 0 0.7rem;
              letter-spacing: 0.01em;
              flex-shrink: 0;
            }

            .calendar-grid {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              margin-bottom: 1rem;
            }

            .calendar-day-header {
              text-align: center;
              font-size: 0.9rem;
              font-weight: 500;
              color: #444;
              padding: 0.3rem 0;
            }

            .calendar-scroll {
              max-height: 12rem;
              overflow-y: auto;
              scroll-snap-type: y mandatory;
            }

            .calendar-2weeks {
              position: relative;
              display: grid;
              grid-template-rows: repeat(2, 1fr);
              height: 6rem;
              scroll-snap-align: start;
              gap: 3px;
            }

            .calendar-row {
              display: grid;
              grid-template-columns: repeat(7, 1fr);
              gap: 0.3rem;
            }

            .calendar-date {
              background: #fff;
              border: 1.5px solid #e5e7eb;
              border-radius: 6px;
              text-align: center;
              font-size: 0.9rem;
              padding: 0.4rem 0;
              min-width: 1.8rem;
              min-height: 1.8rem;
              cursor: pointer;
              transition: border 0.2s, color 0.2s, opacity 0.2s, background 0.2s;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .calendar-date.today {
              border: 2px solid #3bb0ff;
            }

            .calendar-date.selected {
              border: 2px solid #1f2937;
              background: #e6f7ff;
            }

            .calendar-date.other-month {
              color: #b0b0b0;
              opacity: 0.55;
              background: #f7f7f7;
            }

            .calendar-date:hover:not(.other-month) {
              background: #f0f9ff;
              border-color: #0ea5e9;
            }

            .assign-title {
                  background: #f2f2f2;
                  border-top: 1px solid #dedede;
                  font-size: 1.15rem;
                  font-weight: 600;
                  margin: 1rem 0 0.4rem 0;
                  padding: 1rem;
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
              <button 
                className="calendar-toggle-btn" 
                onClick={() => setShowCalendar(!showCalendar)}
              >
                {showCalendar ? <Calendar size={16}  stroke='#ff7a00'/> : <Calendar size={16} />}
              </button>
            </div>
            
            <button className="date-nav-btn" onClick={goToNextDay}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* 달력 아코디언 */}
          <div className={`calendar-accordion ${showCalendar ? 'open' : ''}`}>
            <div className="calendar-content">
              <div className="calendar-month-nav">
                <button className="calendar-month-btn" onClick={handleCalendarPrevMonth}>
                  {get('SCHEDULE_PREVIOUS_BUTTON')}
                </button>
                <div className="calendar-month-label">
                  {dayjs().month(calendarMonth).format('MMMM')} {calendarYear}
                </div>
                <button className="calendar-month-btn" onClick={handleCalendarNextMonth}>
                  {get('SCHEDULE_NEXT_BUTTON')}
                </button>
              </div>
              
              <div className="calendar-grid">
                {days.map(day => (
                  <div key={day} className="calendar-day-header">{day}</div>
                ))}
              </div>
              
              <div className="calendar-scroll" ref={calendarScrollRef}>
                {Array.from({ length: Math.ceil(calendarCells.length / 14) }).map((_, twoWeekIdx) => (
                  <div className="calendar-2weeks" key={twoWeekIdx}>
                    <HatchPattern opacity={0.1} />
                    {[0, 1].map(rowIdx => (
                      <div className="calendar-row" key={rowIdx}>
                        {calendarCells.slice(twoWeekIdx * 14 + rowIdx * 7, twoWeekIdx * 14 + (rowIdx + 1) * 7).map((cell, idx) => {
                          if (!cell) return null;
                          return (
                            <div
                              key={`${cell.date.format('YYYY-MM-DD')}-${idx}`}
                              className={
                                'calendar-date' +
                                (cell.date.isSame(today, 'date') ? ' today' : '') +
                                (cell.date.format('YYYY-MM-DD') === selectedDate ? ' selected' : '') +
                                (!cell.isCurrentMonth ? ' other-month' : '')
                              }
                              onClick={() => handleCalendarDateSelect(cell.date)}
                            >
                               <div className="date-number">{cell.date.date()}</div>
                              {getReservationCountByDate(cell.date) > 0 && (
                                <div className="reservation-count">
                                  {getReservationCountByDate(cell.date)}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
         <div className="assign-title">
          {get('Mng.menu.2.1')} ({filtered.length}건)
        </div>
        {loading ? (
          <div className="loading-message">{get('LOADING_RESERVATIONS')}</div>
        ) : (
          <div className="reservation-list">
           {filtered.length === 0 ? (
                <div className="loading-message">
                    {selectedDate === getToday() 
                      ? `${get('REVIEW_FILTER_TODAY')} ${get('NO_BOOKINGS_MESSAGE')}`
                      : `${formatDateForDisplay(selectedDate)} ${get('NO_BOOKINGS_MESSAGE')}`
                    }
                  </div>
                ) : (
             filtered.map(r => (
                <SketchDiv key={r.id} className="reservation-card">
                  <div className='title-wrap'>
                    <div className="reservation-date">
                          {r.targetName === "venue" 
                            ? get('RESERVATION_VENUE_LABEL') 
                            : get('RESERVATION_STAFF_LABEL')
                          } {r.venue}
                        </div>
                    {/* <div className="reservation-date">
                      <Calendar size={15} style={{marginRight: '3px'}}/>
                      {r.date}
                    </div> */}
                    <div className="reservation-time">{r.time}</div>
                  </div>
                  <div className="reservation-header">
                    <div className="reservation-contents"> 
                      <div className="reservation-venue">
                        <div>
                          <Edit size={10}/> {get('RESERVATION_CLIENT_LABEL')} <strong>{r.client_name}</strong> 
                          <span 
                            className='chat-style' 
                            onClick={() => chatWithUser(r)}
                          >
                            <MessageCircle size={14}/> {get('BUTTON_CHAT')}
                          </span>
                        </div>
                         <div>
                          <Edit size={10}/> {get('RESERVATION_NO_SHOW_BUTTON')}: <span>{r.noShowCount} {get('text.cnt.1')}</span>
                        </div>
                        <div>
                          <Edit size={10}/> {get('RESERVATION_ATTENDEE_LABEL')} <strong>{r.attendee} {get('ATTENDEE_COUNT_UNIT')}</strong>
                        </div>
                        <div>
                          <Edit size={10}/> {get('RESERVATION_ESCORT_LABEL')} 
                          <span className={`use_escort ${r.use_escort === 1 ? 'applied' : 'not_applied'}`}>
                            {r.use_escort === 1 ? get('ESCORT_APPLIED') : get('ESCORT_NOT_APPLIED')}
                          </span>
                        </div>
                         <div>
                          <Edit size={10}/> {get('STAFF_MSG_1')} 
                          <span className={`use_escort ${r.use_staff === 1 ? 'applied' : 'not_applied'}`}>
                            {r.use_staff === 1 ? get('ESCORT_APPLIED') : get('ESCORT_NOT_APPLIED')}
                          </span>
                        </div>
                        <div>
                          <Edit size={10}/> {get('RESERVATION_NOTE_LABEL')} {r.note ? r.note : <span style={{color:'#9d9d9d'}}>{get('NO_NOTE_MESSAGE')}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    {/* 에스코트 신청했을 때만 전광판 버튼 표시 */}
                    {r.use_escort === 1 ? (
                      <SketchBtn className="billboard-btn"
                        size="small"
                        variant="primary" 
                        style={{width: '30%', background: 'linear-gradient(135deg, rgb(255 111 241 / 0%), rgb(255 225 249))'}}
                        onClick={() => setShowBillboard(true)} 
                      >
                        {get('BILLBOARD_OPEN_BUTTON')}
                      </SketchBtn>
                    ) : (
                      <div style={{width: '40%'}}></div> // 공간 유지를 위한 빈 div
                    )}
                    <div className="reservation-status">
                      {get('RESERVATION_STATUS_LABEL')} <span className={`status-badge status-${r.status}`}>
                        {getStatusText(r.status)}
                      </span>
                    </div>
                  </div>
                  <div className="reservation-actions">
                    {/* actionMap을 기반으로 동적으로 버튼 생성 */}
                    {actionMap[r.status] && actionMap[r.status].length > 0 ? (
                      actionMap[r.status].map((action, index) => {
                        // mngCodeMap에서 해당 action에 대한 mngCode 찾기
                        const mngCode = Object.keys(mngCodeMap).find(key => mngCodeMap[key] === action);
                        
                        if (!mngCode) return null;
                        
                        // 버튼 variant 결정
                        let variant = 'event';
                        if (action === 'canceled') variant = 'secondary';
                        else if (action === 'confirmed') variant = 'event';
                        else if (action === 'completed') variant = 'secondary';
                        else if (action === 'no_show') variant = 'warning';
                        
                        return (
                          <SketchBtn 
                            key={`${r.id}-${action}-${index}`}
                            variant={variant}
                            size="small" 
                            className="action-btn"
                            disabled={loading}
                            onClick={() => {
                              handleReservationManage(r.id, parseInt(mngCode));
                            }}
                          >
                            {get(`RESERVATION_${action.toUpperCase()}_BUTTON`)}
                          </SketchBtn>
                        );
                      })
                    ) : (
                      // action이 없는 경우 (종결 상태 등)
                      <div className="no-actions">
                        {/* {get('RESERVATION_NO_ACTIONS_AVAILABLE')} */}
                      </div>
                    )}
                  </div>
                  <HatchPattern opacity={0.4} />
                </SketchDiv>
              ))
            )}
          </div>
        )}
      </div>
      {showBillboard && (
        <PersonFinderBillboard onClose={() => setShowBillboard(false)} />
      )}
    </>
  );
};

export default ReservationManagement;