import React, { useState, useRef, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import dayjs from 'dayjs';
import { CheckCircle, XCircle } from 'lucide-react';

import { useAuth } from '@contexts/AuthContext';
import ApiClient from '@utils/ApiClient';

import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import customSwal from '@components/CustomSwal';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const StaffSchedule = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(dayjs().year());
  const [selectedDate, setSelectedDate] = useState(null);
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuth();

  const calendarScrollRef = useRef(null);

  const firstDay = dayjs(`${year}-${month + 1}-01`);
  const startDay = firstDay.day();
  const daysInMonth = firstDay.daysInMonth();
  const today = dayjs();

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = dayjs(`${prevYear}-${prevMonth + 1}-01`).daysInMonth();

  const calendarCells = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push({
      date: dayjs(`${prevYear}-${prevMonth + 1}-${prevMonthLastDay - startDay + i + 1}`),
      isCurrentMonth: false
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      date: dayjs(`${year}-${month + 1}-${d}`),
      isCurrentMonth: true
    });
  }
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let i = calendarCells.length; i < 42; i++) {
    calendarCells.push({
      date: dayjs(`${nextYear}-${nextMonth + 1}-${i - daysInMonth - startDay + 1}`),
      isCurrentMonth: false
    });
  }

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

  const handleGoToThisWeek = () => {
    const todayIdx = calendarCells.findIndex(cell => cell.date.isSame(today, 'date'));
    if (todayIdx !== -1) {
      setSelectedDate(today);
    }
  };

  // 날짜 선택 시 스태프 목록을 가져오는 함수
  const fetchStaffList = async (date) => {
    setIsLoading(true);
    try {
      console.log('Fetching staff list for date:', user, date.format('YYYY-MM-DD'));


      // 실제 API 호출
      const response = await ApiClient.postForm('/api/getStaffShift', {
        target_id: user.venue_id,
        work_date: date.format('YYYY-MM-DD')
      });

      const {data=[]} = response;

      console.log('✅ Staff shift data loaded:', data);
      
      // 데이터 구조 매핑
      const mappedStaffList = data.map(item => ({
        schedule_id: item.schedule_id,
        staff_name: item.target_name || 'Unknown Staff',
        status: item.status, // 'pending', 'available', 'declined'
        start_time: item.start_time,
        end_time: item.end_time,
        work_date: item.work_date
      }));
      
      setStaffList(mappedStaffList);
    } catch (error) {
      console.error('Failed to fetch staff list:', error);
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 스케줄 상태 변경 핸들러
  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      // 해당 스태프 정보 찾기
      const staff = staffList.find(s => s.schedule_id === scheduleId);
      const staffName = staff ? staff.staff_name : 'Unknown Staff';
      
      // 상태 변경 확인 메시지
      const result = await customSwal.fire({
        title: '스케줄 설정',
        text: '스케줄을 설정하시겠습니까?',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: '확인',
        cancelButtonText: '취소',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
      });

      // 사용자가 취소한 경우
      if (!result.isConfirmed) {
        return;
      }

      console.log('Updating schedule status:', scheduleId, 'to:', newStatus);

      // 실제 스케줄 상태 변경 API 호출
      const response = await ApiClient.postForm('/api/updateShift', {
        schedule_id: scheduleId,
        status: newStatus
      });

      console.log('✅ Schedule status update response:', response);
      
      // 성공 시 로컬 상태 업데이트
      setStaffList(prev => 
        prev.map(staff => 
          staff.schedule_id === scheduleId 
            ? { ...staff, status: newStatus }
            : staff
        )
      );
      
      console.log('✅ Schedule status updated:', newStatus);

      // 성공 시 결과 알림
      if (newStatus === 'available') {
        toast.info(
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle color="#4caf50" size={20} />
            {`${staffName}의 스케줄이 승인되었습니다.`}
          </span>,
          {icon:false}
        );
      } else {
        toast.info(
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle color="#f44336" size={20} />
            {`${staffName}의 스케줄이 거절되었습니다.`}
          </span>,
          {icon:false}
        );
      }
      
    } catch (error) {
      console.error('Failed to update schedule status:', error);

      // 실패 시 결과 알림
      toast.error('스케줄 상태 변경에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchStaffList(date);
  };

  // 페이지 진입 시 오늘 날짜로 스크롤 이동
  useEffect(() => {
    const scrollToToday = () => {
      if (calendarScrollRef.current) {
        const todayIdx = calendarCells.findIndex(cell => cell.date.isSame(today, 'date'));
        
        if (todayIdx !== -1) {
          // 오늘 날짜가 있는 주(2주 단위)를 찾기
          const weekIndex = Math.floor(todayIdx / 14);
          
          // 실제 DOM 요소의 높이를 계산
          const calendar2WeeksElements = calendarScrollRef.current.querySelectorAll('.calendar-2weeks');
          
          if (calendar2WeeksElements[weekIndex]) {
            const elementHeight = calendar2WeeksElements[weekIndex].offsetHeight;
            
            // 간단한 방법: 각 2주 블록의 높이를 기준으로 계산
            const scrollPosition = weekIndex * elementHeight;
            
            // 부드러운 스크롤 애니메이션
            calendarScrollRef.current.scrollTo({
              top: scrollPosition,
              behavior: 'smooth'
            });
          }
        }
      }
    };

    // 즉시 실행
    scrollToToday();
  }, [month, year]); // calendarCells 대신 month, year를 의존성으로 변경

  // 최초 로딩 시 오늘 날짜 선택 및 스태프 목록 가져오기
  useEffect(() => {
    if (!selectedDate) {
      setSelectedDate(today);
      fetchStaffList(today);
    }
  }, []); // 최초 한 번만 실행

  return (
    <>
      <style jsx="true">{`
        .schedule-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .month-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1.1rem 0 0.7rem 0;
          gap: 0.7rem;
        }
        .calendar-scroll {
          max-height: 6.8rem;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
        }
        .calendar-2weeks {
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          height: 6.8rem;
          scroll-snap-align: start;
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
        }
        .calendar-date.today {
          border: 2.2px solid #3bb0ff;
        }
        .calendar-date.selected {
          border: 2.2px solid #222;
          background: #e6f7ff;
        }
        .calendar-date.other-month {
          color: #b0b0b0;
          opacity: 0.55;
          background: #f7f7f7;
        }
        .assign-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .staff-row {
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          margin-bottom: 0.6rem;
          padding: 0.6rem 0.8rem;
        }
        .staff-info {
          flex: 1;
        }
        .staff-name {
          font-size: 1.02rem;
        }
        .staff-time {
          font-size: 0.92rem;
          color: #666;
        }
        .staff-assign-btn {
          min-width: 38px;
          font-size: 1.1rem;
          padding: 0.18rem 0.5rem;
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
        .calendar-nav-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-bottom: 0.3rem;
        }
        .status-toggle {
          width: 40px;
          height: 20px;
          background-color: #ccc;
          border-radius: 20px;
          position: relative;
          cursor: pointer;
        }
        .status-toggle.available {
          background-color: #4caf50;
        }
        .status-toggle.pending,
        .status-toggle.declined {
          background-color: #f44336;
        }
        .toggle-slider {
          width: 18px;
          height: 18px;
          background-color: #fff;
          border-radius: 50%;
          position: absolute;
          top: 1px;
          left: 1px;
          transition: transform 0.2s;
        }
        .toggle-slider.available {
          transform: translateX(20px);
        }
        .toggle-slider.pending,
        .toggle-slider.declined {
          transform: translateX(0);
        }
      `}</style>
      <div className="schedule-container">
        <SketchHeader
          title="Staff Schedule"
          showBack={true}
          onBack={goBack}
        />
        <div className="month-row">
          <SketchBtn variant="event" size="small" className="month-nav-btn" onClick={handlePrevMonth}>Previous</SketchBtn>
          <div className="month-label">{dayjs().month(month).format('MMMM')} {year}</div>
          <SketchBtn variant="event" size="small" className="month-nav-btn" onClick={handleNextMonth}>Next</SketchBtn>
        </div>
        <div className="calendar">
          {days.map(day => (
            <div key={day} className="calendar-day">{day}</div>
          ))}
        </div>
        <div className="calendar-scroll" ref={calendarScrollRef}>
          {Array.from({ length: Math.ceil(calendarCells.length / 14) }).map((_, twoWeekIdx) => (
            <div className="calendar-2weeks" key={twoWeekIdx}>
              {[0, 1].map(rowIdx => (
                <div className="calendar-row" key={rowIdx}>
                  {calendarCells.slice(twoWeekIdx * 14 + rowIdx * 7, twoWeekIdx * 14 + (rowIdx + 1) * 7).map((cell, idx) => (
                    <div
                      key={idx + rowIdx * 7 + twoWeekIdx * 14}
                      className={
                        'calendar-date' +
                        (cell.date.isSame(today, 'date') ? ' today' : '') +
                        (selectedDate && cell.date.isSame(selectedDate, 'date') ? ' selected' : '') +
                        (!cell.isCurrentMonth ? ' other-month' : '')
                      }
                      onClick={() => handleDateSelect(cell.date)}
                    >
                      {cell.date.date()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="assign-title">Schedule Approval</div>
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
            Loading staff list...
          </div>
        ) : (
          staffList.map(staff => (
            <div key={staff.schedule_id} className="staff-row">
              <div className="staff-info">
                <div className="staff-name">{staff.staff_name}</div>
                <div className="staff-time">
                  {staff.start_time?.substring(0, 5)} - {staff.end_time?.substring(0, 5)}
                </div>
              </div>
              <div 
                className={`status-toggle ${staff.status}`}
                onClick={() => handleStatusChange(
                  staff.schedule_id, 
                  staff.status === 'available' ? 'declined' : 'available'
                )}
              >
                <div className={`toggle-slider ${staff.status}`}></div>
              </div>
            </div>
          ))
        )}
      </div>
      <ToastContainer
        position="bottom-center"
        autoClose={3000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        style={{
          borderRadius: '25px',
          fontSize: '14px',
          padding: '12px 20px'
        }}
      />
    </>
  );
};

export default StaffSchedule; 