import React, { useState, useEffect, useRef, useMemo } from 'react';  // ⬅ useRef, useMemo 추가
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchHeader from '@components/SketchHeader';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import dayjs from 'dayjs'; // ⬅ dayjs 추가
import { Edit} from 'lucide-react';

import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';
import { useAuth } from '@contexts/AuthContext';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // ⬅ 요일 배열 추가

const BookingHistoryPage = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {

  const { user, isLoggedIn } = useAuth();

  // 상태
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyData, setHistoryData] = useState({});
  const [bookings, setBookings] = useState([]); // 🎯 추가: API 데이터용 상태
  const [allBookings, setAllBookings] = useState([]); // ⬅ 전체 예약 데이터 저장
  
  // ⬅ 달력 관련 상태 추가
  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(dayjs().year());
  const [selectedDate, setSelectedDate] = useState(null);
  const calendarScrollRef = useRef(null);
  const today = dayjs();

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  // ⬅ 달력 셀 생성 로직 (StaffSchedule에서 가져옴)
  const calendarCells = useMemo(() => {
    const currentDate = dayjs(`${year}-${month + 1}-01`);
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
  }, [month, year, today]);

  // ⬅ 달력 네비게이션 핸들러들
  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    setTimeout(() => {
      if (calendarScrollRef.current) calendarScrollRef.current.scrollTop = 0;
    }, 0);
  };

  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    setTimeout(() => {
      if (calendarScrollRef.current) calendarScrollRef.current.scrollTop = 0;
    }, 0);
  };

  // ⬅ 날짜 선택 핸들러 - 예약 내역 필터링
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const selectedDateStr = date.format('YYYY-MM-DD');
    
    // 선택된 날짜의 예약만 필터링
    const filteredBookings = allBookings.filter(booking => 
      booking.date === selectedDateStr
    );
    
    setBookings(filteredBookings);
    console.log('Filtered bookings for date:', selectedDateStr, filteredBookings);
  };

  // 상태 라벨 변환 함수
  const getStatusLabel = (status) => {
    console.log('status', status);
    
    const statusMap = {
      'pending': get('status.pending') || 'Pending',
      'confirmed': get('status.confirmed') || 'Confirmed', 
      'canceled': get('status.canceled') || 'Canceled',
      'completed': get('status.completed') || 'Completed',
      'accepted': get('RESERVATION_CONFIRMED_BUTTON'),
      'no_show': get('RESERVATION_NO_SHOW_BUTTON')
    };
    return statusMap[status] || status;
  };

  // 🎯 상태별 스타일 반환 함수 추가
  const getStatusStyle = (status) => {
    const styleMap = {
      'pending': {
        color: '#f59e0b',
        backgroundColor: '#fef3c7',
        border: '1px solid #f59e0b'
      },
      'confirmed': {
        color: '#059669',
        backgroundColor: '#d1fae5',
        border: '1px solid #059669'
      },
      'accepted': {
        color: '#059669',
        backgroundColor: '#d1fae5',
        border: '1px solid #059669'
      },
      'canceled': {
        color: '#dc2626',
        backgroundColor: '#fee2e2',
        border: '1px solid #ef4444'
      },
      'completed': {
        color: '#6b7280',
        backgroundColor: '#f3f4f6',
        border: '1px solid #9ca3af'
      },
      'no_show': {
        color: 'rgb(27 27 27)',
        backgroundColor: 'rgb(239 239 239)',
        border: '1px solid rgb(100 100 100)'
      }
    };
    
    return styleMap[status] || {
      color: '#6b7280',
      backgroundColor: '#f3f4f6',
      border: '1px solid #9ca3af'
    };
  };
  
  const handleRebook = (booking) => {
    const venue_id = booking.venue_id;

    navigateToPageWithData(PAGES.DISCOVER, { venue_id });
    // isReviewable이 false면 함수 실행하지 않음
    // if (!booking.is_reservation) {
    //   return;
    // }
    
    // console.log('Rebook clicked:', booking);
    // navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
    //   target: booking.targetType,
    //   id: (booking.targetType == 'venue') ? booking.venue_id : booking.targetId,
    //   staff: (booking.targetType == 'staff') ? { name : booking.targetName} : {}
    // });
  };

  const getReviewButtonState = (booking) => {
    if (booking.review_cnt > 0) {
      return {
        text: get('Review1.1'), // '내 리뷰'
        disabled: false,
        action: 'view' // 리뷰 보기
      };
    } else if (booking.is_reservation) {
      return {
        text: get('Review1.2'), // '리뷰 등록'
        disabled: false,
        action: 'create' // 리뷰 작성
      };
    } else {
      return {
        text: get('Review1.2'), // '리뷰 등록'
        disabled: true,
        action: null
      };
    }
  };

  // Rebook 버튼 상태 함수 추가
  const getRebookButtonState = (booking) => {

    console.log('grb', booking);
    if (booking.is_reservation) {
      return {
        text: get('COMMON_VIEW_DETAILS'), // '다시 예약'
        disabled: false
      };
    } else {
      return {
        text: get('DiscoverPage1.1.disable'), 
        disabled: true
      };
    }
  };

  const handleReview = (booking) => {
    const reviewState = getReviewButtonState(booking);
    
    if (reviewState.disabled) {
      return; // 비활성화된 경우 아무것도 하지 않음
    }

    if (reviewState.action === 'view') {
      console.log('view', booking);
      navigateToPageWithData && navigateToPageWithData(PAGES.VIEWREVIEW, {
          reservationId: booking.id,
          clientId: booking.clientId,
          target: booking.targetType,
          targetId: booking.targetId,
          venueId: booking.venue_id
      });
      
    } else if (reviewState.action === 'create') {
      navigateToPageWithData && navigateToPageWithData(PAGES.SHARE_EXP, {
        reservation_id: booking.id,
        image:booking.image,
        user_id: user.user_id,
        target: booking.targetType,
        target_id: booking.targetId,
        targetName: booking.targetName,
        hostName: booking.hostName,
      });
    }
  };

  const formatTimeDisplay = (startTime, endTime) => {
    if (!startTime) return '';
    
    if (endTime && endTime !== startTime) {
      // 시작시간과 종료시간이 모두 있는 경우
      return `${startTime} - ${endTime}`;
    } else {
      // 시작시간만 있는 경우 (기존 방식)
      return startTime;
    }
  };

  const calculateActualEndTime = (startTime, durationHours) => {
    if (!startTime || !durationHours) return '';
    
    // 시간 파싱
    const [hours, minutes, seconds] = startTime.split(':').map(Number);
    
    // 시작 시간을 분으로 변환
    const totalStartMinutes = hours * 60 + minutes;
    
    // duration을 분으로 변환하고 더하기
    const totalEndMinutes = totalStartMinutes + (durationHours * 60);
    
    // 24시간을 넘어가는지 계산
    const endHours = Math.floor(totalEndMinutes / 60);
    const endMinutes = totalEndMinutes % 60;
    
    // 다음날 표시 처리
    if (endHours >= 24) {
      const nextDayHours = endHours - 24;
      return `${nextDayHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}+1`;
    } else {
      return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      window.scrollTo(0, 0);
  
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        console.log('Current language set to:', currentLang);
      }
      
      // historyData 로딩 완료까지 기다리기
      try {
        await loadBookingHistory(); // Promise 리턴하도록 수정 필요
        console.log('📋 Booking history loaded');
      } catch (error) {
        console.error('❌ Failed to load booking history:', error);
      }
    };
  
    initializeData();
  }, [messages, currentLang]); // historyData 의존성 제거

  // ⬅ 달력 스크롤 초기화 useEffect 추가
  useEffect(() => {
    const scrollToToday = () => {
      if (calendarScrollRef.current) {
        const targetScrollIndex = 1;
        const calendar2WeeksElements = calendarScrollRef.current.querySelectorAll('.calendar-2weeks');
        
        if (calendar2WeeksElements[targetScrollIndex]) {
          const elementHeight = calendar2WeeksElements[targetScrollIndex].offsetHeight;
          const scrollPosition = targetScrollIndex * elementHeight;
          
          calendarScrollRef.current.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      }
    };

    scrollToToday();
  }, [month, year]);

  // ⬅ 최초 로딩 시 오늘 날짜 선택
  useEffect(() => {
    if (!selectedDate && allBookings.length > 0) {
      setSelectedDate(today);
      const todayStr = today.format('YYYY-MM-DD');
      const todayBookings = allBookings.filter(booking => 
        booking.date === todayStr
      );
      setBookings(todayBookings);
    }
  }, [allBookings]);

  const loadBookingHistory = () => {
    return new Promise((resolve, reject) => {
      console.log('[Loading] booking-history', user.user_id);
      
      setIsLoadingHistory(true);
      
      ApiClient.postForm('/api/bookingHistory', {  // data
        user_id: user.user_id
      })
      .then(response => {
        console.log('✅ History loaded:', response);
        
        // 🎯 API 데이터를 bookings 형태로 변환
        const formattedBookings = (response.data || []).map(item => ({
          id: item.reservation_id,
          targetName: item.target_name,
          hostName: item.venue_name,
          date: item.date,
          time: item.time,
          end_time: calculateActualEndTime(item.end_time || item.time, 1),
          timeDisplay: formatTimeDisplay(item.time, calculateActualEndTime(item.end_time || item.time, 1)),
          status: item.status,
          statusLabel: getStatusLabel(item.status),
          image: item.content_url || '/placeholder-venue.jpg',
          // 추가 데이터 (필요시 사용)
          targetType: item.target,
          targetId: item.target_id,
          note: item.note,
          attendee: item.attendee,
          reservedAt: item.reserved_at,
          venue_id:item.venue_id,
          review_cnt:item.review_cnt,
          isReviewable:item.isReviewable,
          is_reservation:item.is_reservation,
          clientId: item.client_id
        }));
        
        setAllBookings(formattedBookings); // ⬅ 전체 데이터 저장
        setBookings(formattedBookings); // 🔥 여기서 bookings 설정!
        setHistoryData(response.data || {});
        setIsLoadingHistory(false);
        resolve(response); // 성공 시 resolve
      })
      .catch(error => {
        console.error('❌ Failed to load History:', error);
        setBookings([]); // 에러시 빈 배열
        setAllBookings([]); // ⬅ 전체 데이터도 초기화
        setHistoryData({});
        setIsLoadingHistory(false);
        reject(error); // 실패 시 reject
      });
    });
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
        return '#059669'; // 초록색
      case 'completed':
        return '#6b7280'; // 회색
      case 'canceled':
        return '#dc2626'; // 빨간색
      case 'pending':
        return '#f59e0b'; // 주황색
      default:
        return '#6b7280';
    }
  };

  // 날짜별 예약 개수 계산 함수
  const getBookingCountByDate = (date) => {
    const dateStr = date.format('YYYY-MM-DD');
    return allBookings.filter(booking => booking.date === dateStr).length;
  };

  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';
    
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const diffMs = end - start;
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    return `${diffHours}${get('Reservation.HourUnit') || '시간'}`;
  };

  return (
    <>
      <style jsx="true">{`
        .booking-history-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
        }

        .header {
          padding: 1.5rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          text-align: center;
        }

        .page-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        /* ⬅ 달력 스타일 추가 (StaffSchedule에서 가져옴) */
        .month-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1.1rem 0 1rem 0;
          gap: 0.7rem;
        }
        .calendar-scroll {
          max-height: 7rem;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
        }
        .calendar-2weeks {
          position: relative;
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          height: 7rem;
          scroll-snap-align: start;
          gap: 3px;
        }
        .calendar-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.3rem;
        }
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 1.2rem;
        }
        .calendar-day {
          text-align: center;
          font-size: 0.98rem;
          font-weight: 500;
          color: #444;
        }
        .calendar-date {
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
          font-size: 1.05rem;
          padding: 0.5rem 0;
          min-width: 2.1rem;
          min-height: 2.1rem;
          cursor: pointer;
          transition: border 0.2s, color 0.2s, opacity 0.2s, background 0.2s;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .calendar-date.today {
          border: 2.2px solid #3bb0ff;
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
        .month-nav-btn {
          background: none !important;
          color: #222 !important;
          box-shadow: none !important;
          padding: 0.08rem 0.5rem !important;
          min-width: 0;
          font-size: 0.92rem !important;
          height: 1.7rem;
          line-height: 1.1;
        }
        .month-label {
          font-size: 1.13rem;
          font-weight: 700;
          margin: 0 0.7rem;
          letter-spacing: 0.01em;
          flex-shrink: 0;
        }

        /* 🎯 새로 추가된 뱃지 스타일 */
        .booking-count-badge {
          position: absolute;
          top: 0px;
          right: -4px;
          background: #ef4444;
          color: white;
          border-radius: 50%;
          width: 16px;
          height: 16px;
          font-size: 0.7rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          line-height: 1;
          z-index: 10;
        }

        .bookings-section {
          padding: 1rem;
        }

        .booking-card {
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          border: 1px solid #1f2937;
          background-color: #f8fafc;
          padding: 1rem;
          margin-bottom: 1rem;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .booking-card:hover {
          transform: rotate(-0.1deg) scale(1.01);
        }

        .booking-card:nth-child(even) {
          transform: rotate(0.1deg);
        }

        .booking-card:nth-child(even):hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .booking-content {
          position: relative;
          z-index: 10;
          display: flex;
          gap: 1rem;
        }

        .booking-image {
          width: 100%;
          height: 100%;
          flex-shrink: 0;
          border: 2px solid #1f2937;
        }

        .booking-details {
          flex: 1;
        }

        .venue-name {
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 1rem 0;
        }

        .host-info {
          font-size: 0.85rem;
          color: #4b5563;
          margin: 0 0 0.5rem 0;
        }

        .booking-datetime {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .booking-time, .booking-attendee, .booking-note {
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
          margin-top: 10px;
        }

        .booking-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .booking-status {
          font-size: 0.8rem;
          margin-bottom: 0.5rem;
          padding: 0.25rem 0.5rem;
          border-radius: 10px;
          text-align: center;
          min-width: 50px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .loading-container {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-container {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        @media (max-width: 480px) {
          .booking-history-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .booking-content {
            flex-direction: column;
            gap: 0.75rem;
          }

          .booking-actions {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .action-buttons {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>

      <div className="booking-history-container">
        {/* Header */}
        <SketchHeader
          title={get('Menu1.6')}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        {/* ⬅ 달력 섹션 추가 */}
        <div className="month-row">
          <SketchBtn 
            variant="event" 
            size="small" 
            className="month-nav-btn" 
            onClick={handlePrevMonth}
          >
            {get('SCHEDULE_PREVIOUS_BUTTON') || '◀'}
            <HatchPattern opacity={0.6} />
          </SketchBtn>
          <div className="month-label">
            {dayjs().month(month).format('MMMM')} {year}
          </div>
          <SketchBtn 
            variant="event" 
            size="small" 
            className="month-nav-btn" 
            onClick={handleNextMonth}
          >
            {get('SCHEDULE_NEXT_BUTTON') || '▶'}
            <HatchPattern opacity={0.6} />
          </SketchBtn>
        </div>
        
        <div className="calendar">
          {days.map(day => (
            <div key={day} className="calendar-day">{day}</div>
          ))}
        </div>
        
        <div className="calendar-scroll" ref={calendarScrollRef}>
          {Array.from({ length: Math.ceil(calendarCells.length / 14) }).map((_, twoWeekIdx) => (
            <div className="calendar-2weeks" key={twoWeekIdx}>
              <HatchPattern opacity={0.3} />
              {[0, 1].map(rowIdx => (
                <div className="calendar-row" key={rowIdx}>
                  {calendarCells.slice(twoWeekIdx * 14 + rowIdx * 7, twoWeekIdx * 14 + (rowIdx + 1) * 7).map((cell, idx) => {
                    if (!cell) return null;
                    
                    const bookingCount = getBookingCountByDate(cell.date);
                    
                    return (
                      <div
                        key={`${cell.date.format('YYYY-MM-DD')}-${idx}`}
                        className={
                          'calendar-date' +
                          (cell.date.isSame(today, 'date') ? ' today' : '') +
                          (selectedDate && cell.date.isSame(selectedDate, 'date') ? ' selected' : '') +
                          (!cell.isCurrentMonth ? ' other-month' : '')
                        }
                        onClick={() => handleDateSelect(cell.date)}
                      >
                        <span className="calendar-date-number">{cell.date.date()}</span>
                        {bookingCount > 0 && (
                          <div className="booking-count-badge">
                            {bookingCount}
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

        {/* Bookings Section */}
        <div className="bookings-section">
          {/* ⬅ 선택된 날짜 표시 추가 */}
          {selectedDate && (
            <div style={{ 
              textAlign: 'center', 
              marginBottom: '1rem', 
              padding: '0.5rem',
              background: '#f0f9ff',
              border: '1px solid #e0f2fe',
              borderRadius: '6px',
              fontSize: '0.9rem',
              color: '#0369a1'
            }}>
              {selectedDate.format('YYYY년 MM월 DD일')} {get('menu.reserve.history')}
            </div>
          )}

          {isLoadingHistory ? (
            <div className="loading-container">
              <p>Loading booking history...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-container">
              <p>{get('BookingHis1.3') || 'No booking history found'}</p>
            </div>
          ) : (
            bookings.map((booking, index) => (
              <div key={booking.id} className="booking-card">
                <HatchPattern opacity={0.4} />
                
                <div className="booking-content">
                  {/* <ImagePlaceholder 
                    src={booking.image} 
                    className="booking-image"
                  /> */}
                  
                  <div className="booking-details">
                    <h3 className="venue-name">
                    <span>
                      {booking.targetType === 'venue' 
                        ? get('RESERVATION_VENUE_LABEL') 
                        : booking.targetType === 'staff' 
                          ? get('DiscoverPage1.3') 
                          : booking.targetType
                      }
                    </span> : {booking.targetName}
                  </h3>
                    <p className="host-info"><Edit size={12}/> {get('BookingHis1.1')}: {booking.hostName}</p>

                    <p className="booking-datetime">
                     <Edit size={12}/> {get('Reservation.ReservationTimeLabel')}: {booking.date}
                    </p>
                    <p className="booking-time">
                     <Edit size={12}/> {get('BookingSum1.3')}: {booking.timeDisplay + ' '}
                      {booking.end_time && booking.end_time !== booking.time && (
                        <span className="duration-info">
                          ({calculateDuration(booking.time, booking.end_time)})
                        </span>
                      )}
                    </p>
                    <p className="booking-attendee">
                     <Edit size={12}/> {get('RESERVATION_ATTENDEE_LABEL')} {booking.attendee} {get('Reservation.PersonUnit')}
                    </p>
                    <p className="booking-note">
                   <Edit size={12}/> {get('Reservation.MemoLabel')}: {booking.note || get('NO_NOTE_MESSAGE')}
                  </p>
                  </div>

                  <div className="booking-actions">
                    <div 
                      className="booking-status"
                      style={getStatusStyle(booking.status)}
                    >
                      {booking.statusLabel}
                    </div>
                    
                    <div className="action-buttons">
                        {booking.status === 'completed' && (
                          <SketchBtn 
                            variant="event" 
                            size="small"
                            disabled={getReviewButtonState(booking).disabled}
                            onClick={() => handleReview(booking)}
                          >
                            <HatchPattern opacity={0.4} />
                            {getReviewButtonState(booking).text}
                          </SketchBtn>
                        )}

                        <LoadingScreen 
                          variant="cocktail"
                          loadingText="Loading..."
                          isVisible={isLoading} 
                        />
                      </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default BookingHistoryPage;