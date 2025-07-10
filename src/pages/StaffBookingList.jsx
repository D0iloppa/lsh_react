import React, { useState, useEffect, useRef, useMemo } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import { Calendar, MessageCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import Swal from 'sweetalert2';
import dayjs from 'dayjs';

import BookingSummary from '@components/BookingSummary';
import { overlay } from 'overlay-kit';

const mockBookings = [];

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// 날짜 유틸리티 함수들
const getToday = () => {
  const today = new Date();
  return today.toISOString().split('T')[0]; // YYYY-MM-DD 형식
};

const addDays = (dateString, days) => {
  const date = new Date(dateString);
  date.setDate(date.getDate() + days);
  return date.toISOString().split('T')[0];
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

const StaffBookingList = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user, isLoggedIn } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  // 날짜 필터 관련 상태 추가
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showCalendar, setShowCalendar] = useState(false);
  
  // 달력 관련 상태 추가
  const [calendarMonth, setCalendarMonth] = useState(dayjs().month());
  const [calendarYear, setCalendarYear] = useState(dayjs().year());
  const calendarScrollRef = useRef(null);
  const today = dayjs();

  const venue_id = user.venue_id;

  // 달력 셀 생성
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

  // 날짜 변경 함수들
  const goToPreviousDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, -1));
  };

  const goToNextDay = () => {
    setSelectedDate(prevDate => addDays(prevDate, 1));
  };

  const goToToday = () => {
    setSelectedDate(getToday());
  };

  // 선택된 날짜를 찾아서 스크롤 위치 조정
  useEffect(() => {
    if (showCalendar && calendarScrollRef.current && calendarCells.length > 0) {
      const selectedIndex = calendarCells.findIndex(cell => 
        cell.date.format('YYYY-MM-DD') === selectedDate
      );
      
      if (selectedIndex !== -1) {
        const selectedWeekStartIndex = selectedIndex - (selectedIndex % 7);
        const twoWeekBlockIndex = Math.floor(selectedWeekStartIndex / 14);
        
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
        }, 100);
      }
    }
  }, [showCalendar, selectedDate, calendarCells]);

  // 선택된 날짜의 예약 개수 계산
  const getReservationCountByDate = (date) => {
    const dateString = date.format('YYYY-MM-DD');
    return bookings.filter(bk => {
      const bookingDateString = bk.date || new Date(bk.res_date).toLocaleDateString('en-CA'); // YYYY-MM-DD 형식
      return bookingDateString === dateString;
    }).length;
  };

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
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
        const filtered = apiData.filter(item => 
          item.target_id == user.staff_id && item.target_name == 'staff'
        );
        console.log("API 데이터:", filtered);
        setBookings(filtered);
      } else {
        console.log("데이터가 없습니다");
        setBookings([]);
      }

    } catch (error) {
      console.error('예약 리스트 로딩 실패:', error);
      setBookings(mockBookings);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (venue_id) {
      loadBookings();
    } else {
      setBookings(mockBookings);
    }
  }, [venue_id]);
  
  // action에 따른 variant 결정 함수
  const getButtonVariant = (action) => {
    switch(action) {
      case 'Detail':
        return 'event';
      case 'Decline':
        return 'danger';
      case 'Review':
        return 'secondary';
    }
  };

  const getStatusStyle = (status) => {
  console.log("status", status)

  switch(status) {
    case 'confirmed':
      return { 
        color: '#059669',
        backgroundColor: '#d1fae5',
        border: '1px solid #10b981'
      };
    case 'pending':
      return { 
        color: '#d97706',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b'
      };
    case 'cancelled':
      return { 
        color: '#dc2626',
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444'
      };
    case 'completed':
      return { 
        color: '#3b82f6',
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6'
      };
    default:
      return { 
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        border: '1px solid #d1d5db'
      };
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
  };

  const detailBooking = (bk) => {
    console.log('detailBooking', bk);

    const startTime = bk.res_start_time;
    const endTime = bk.res_end_time;
    
    const endTimeDate = new Date(`2000-01-01T${endTime}`);
    endTimeDate.setHours(endTimeDate.getHours() + 1);
    const adjustedEndTime = endTimeDate.toTimeString().slice(0, 5);
    
    const startDate = new Date(`2000-01-01T${startTime}`);
    const endDate = new Date(`2000-01-01T${adjustedEndTime}`);
    const durationMinutes = (endDate - startDate) / (1000 * 60);
    const durationHours = durationMinutes / 60;
    
    const displayData = {
      targetName: bk.target_name,
      date: formatDate(bk.reserved_at),
      startTime: startTime,
      endTime: adjustedEndTime,
      duration: durationHours ? `${durationHours}시간` : '',
      attendee: `${bk.attendee}명`,
      memo: bk.note || ''
    };
  
    const messages = {
      targetLabel: get('BookingSum.Target') || '예약 대상',
      dateLabel: get('BookingSum1.2') || '날짜',
      timeLabel: get('BookingSum1.3') || '시간',
      attendeeLabel: get('ReservationCompo1.1') || '참석자',
      memoLabel: get('Reservation.MemoLabel') || '메모',
      noMemo: get('BookingSum.NoMemo') || '메모 없음'
    };
  
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
      ApiClient.postForm('/api/reservation/manage', {
        reservation_id: bk.reservation_id,
        mngCode:3
      }).then(res=>{
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

  // 선택된 날짜에 따라 예약을 필터링하는 함수
  const getFilteredBookings = () => {
    return bookings.filter(bk => {
      const bookingDateString = bk.date || new Date(bk.res_date).toLocaleDateString('en-CA'); // YYYY-MM-DD 형식
      return bookingDateString === selectedDate;
    });
  };

  // 예약을 날짜별로 분류하는 함수 (선택된 날짜 기준)
  const classifyBookingsByDate = (bookings) => {
    const selectedDateObj = new Date(selectedDate);
    selectedDateObj.setHours(0, 0, 0, 0);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayBookings = [];
    const pastBookings = [];

    bookings.forEach(bk => {
      let bookingDate;
      if (bk.date) {
        bookingDate = new Date(bk.date);
      } else if (bk.res_date) {
        bookingDate = new Date(bk.res_date);
      } else {
        pastBookings.push(bk);
        return;
      }

      bookingDate.setHours(0, 0, 0, 0);

      const timeDiff = bookingDate.getTime() - today.getTime();

      if (timeDiff >= 0) {
        todayBookings.push(bk);
      } else {
        pastBookings.push(bk);
      }
    });

    return {
      todayBookings,
      pastBookings
    };
  };

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

  const filteredBookings = getFilteredBookings();

  return (
    <>
      <style jsx="true">{`
        .bookinglist-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
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
          
        }
        .booking-info {
          margin-top: 0.5rem;
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 1rem;
        }

        .booking-info div{
          padding: 0.2rem;
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

        /* 날짜 필터 스타일 */
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
          .booking-status {
          display: inline-block;
          padding: 0.15rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
           .reservation-status {
          font-size: 0.88rem;
          color: #888;
          margin-bottom: 0.2rem;
          text-align: end;
        }
      `}</style>
      <div className="bookinglist-container">
        <SketchHeader
          title={
            <>
              <Calendar size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>
              {get('MENU_RESERVATIONS')}
            </>
          }
          showBack={true}
          onBack={goBack}
        />

        {/* 날짜 필터 섹션 추가 */}
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
                {showCalendar ? <Calendar size={16} stroke='#ff7a00'/> : <Calendar size={16} />}
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

        <div className='booking-list'> 
          {loading ? (
            <div className="loading-message">{get('BOOKING_LOADING')}</div>
          ) : (
            <>
              {(() => {
                const { todayBookings, pastBookings } = classifyBookingsByDate(filteredBookings);
                
                return (
                  <>
                    {/* 오늘의 예약 */}
                    {todayBookings.length > 0 && (
                      <>
                        <div className="booking-section-title">
                          <div className="section-title-text">
                            {selectedDate === getToday() 
                              ? (get('TODAY_BOOKINGS_TITLE') || '오늘의 예약 내역')
                              : `${formatDateForDisplay(selectedDate)} 예약 내역`
                            }
                          </div>
                          <div className="section-count">{todayBookings.length}</div>
                        </div>
                        {todayBookings.map(bk => (
                          <SketchDiv key={bk.id || bk.reservation_id} className="booking-card">
                            <HatchPattern opacity={0.6} />
                            <div className="booking-header">
                              <div className="booking-venue">{bk.venue || bk.target_name}</div>
                              <div className="reservation-status">
                             {get('RESERVATION_STATUS_LABEL')} <span className="booking-status" style={getStatusStyle(bk.status)}>{getStatusText(bk.status)}</span>
                             </div>
                            </div>
                            <div className="booking-info">
                              <div>{get('BOOKING_DATE_LABEL')} {bk.date || new Date(bk.res_date).toLocaleDateString()}</div>
                              <div>{get('BOOKING_TIME_LABEL')} {bk.res_start_time}</div>
                              <div>{get('BOOKING_CUSTOMER_LABEL')} {bk.client_name || bk.user_name}</div>
                              <div style={{
                                fontSize: '0.8rem',
                                color: '#666',
                                marginTop: '0.2rem'
                              }} className="booking-reservedAt">{get('BOOKING_RESERVED_AT_LABEL')} : {new Date(bk.reserved_at).toLocaleString()}</div>
                            </div>
                            <div className="booking-actions">
                              {(['Detail', 'MANAGER']).map(action => {
                                return (
                                  <SketchBtn 
                                    key={action} 
                                    variant={getButtonVariant(action)} 
                                    size="small" 
                                    className="booking-action-btn"
                                    onClick={() => handleBtn(action, bk)}
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
                              <div className="reservation-status">
                                {get('RESERVATION_STATUS_LABEL')} <span className="booking-status" style={getStatusStyle(bk.status)}>{getStatusText(bk.status)}</span>
                             </div>
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
                              {(['Detail', 'MANAGER']).map(action => {
                                return (
                                  <SketchBtn 
                                    key={action} 
                                    variant={getButtonVariant(action)} 
                                    size="small" 
                                    className="booking-action-btn"
                                    onClick={() => handleBtn(action, bk)}
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
                    {filteredBookings.length === 0 && (
                      <div className="no-bookings-message">
                        {selectedDate === getToday() 
                          ? (get('NO_BOOKINGS_MESSAGE') || '예약 내역이 없습니다.')
                          : `${formatDateForDisplay(selectedDate)}에 예약 내역이 없습니다.`
                        }
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