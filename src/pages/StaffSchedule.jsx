import React, { useState, useRef, useEffect, useMemo } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import '@components/SketchComponents.css';
import dayjs from 'dayjs';
import { CheckCircle, XCircle, ClipboardList, MessageCircle, Bell} from 'lucide-react';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

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
  const [dayoffList, setDayoffList] = useState([]);
  const [notRegisterList, setNotRegisterList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const { messages, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const { user } = useAuth();

  const calendarScrollRef = useRef(null);
  const today = dayjs();

  // 현재 주를 맨 위에 배치하는 함수
  const reorderCalendarCellsForCurrentWeek = (cells, today) => {
    // 현재 날짜가 있는 인덱스 찾기
    const todayIndex = cells.findIndex(cell => cell.date.isSame(today, 'date'));
    
    if (todayIndex === -1) {
      // 오늘 날짜가 현재 월에 없으면 기존 배열 그대로 반환
      return cells;
    }
    
    // 현재 주의 시작 인덱스 계산 (일요일 기준)
    const currentWeekStartIndex = todayIndex - (todayIndex % 7);
    
    // 현재 주부터 시작하여 재배치
    const reorderedCells = [];
    
    // 현재 주부터 끝까지
    for (let i = currentWeekStartIndex; i < cells.length; i++) {
      reorderedCells.push(cells[i]);
    }
    
    // 현재 주 이전 주들을 뒤에 추가
    for (let i = 0; i < currentWeekStartIndex; i++) {
      reorderedCells.push(cells[i]);
    }
    
    return reorderedCells;
  };

  // 더 유연한 캘린더 생성 (현재 주 기준으로 앞뒤로 확장)
  const calendarCells = useMemo(() => {
    // 현재 월의 오늘 날짜 기준으로 주 단위 생성
    const currentDate = dayjs(`${year}-${month + 1}-01`);
    const todayInCurrentMonth = currentDate.month() === today.month() && currentDate.year() === today.year() ? today : currentDate.date(15); // 현재 월이 아니면 15일을 기준으로
    
    // 기준 날짜가 포함된 주의 시작일 (일요일)
    const startOfWeek = todayInCurrentMonth.startOf('week');
    
    // 총 8주 생성 (현재 주 기준으로 앞 2주, 뒤 5주)
    const cells = [];
    const totalWeeks = 8;
    const startDate = startOfWeek.subtract(2, 'week'); // 현재 주 2주 전부터 시작
    
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

  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      console.log('Current language set to:', currentLang);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  const chatWithStaff = async(staff) => {
    console.log('chatWithStaff', staff);

    // 1. room_sn 조회
    const chatList = await ApiClient.get('/api/getChattingList', {
      params: {
        venue_id: user.venue_id,
        target : 'staff',
        staff_id : staff.staff_id,
        account_type: user.type
      }
    })

    let room_sn = null;
    if(chatList.length > 0){
      room_sn = chatList[0].room_sn;
      console.log('room_sn', room_sn);
    }

    navigateToPageWithData(PAGES.CHATTING, { 
      name : staff.staff_name,
      room_sn: room_sn,
      send_to: 'staff',
      receiver_id: staff.staff_id,
      ...staff
    });
  };

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

  // 요일 다국어 배열 (필요한 경우 사용)
  const getDayLabels = () => [
    get('DAY_SUN'),
    get('DAY_MON'),
    get('DAY_TUE'),
    get('DAY_WED'),
    get('DAY_THU'),
    get('DAY_FRI'),
    get('DAY_SAT')
  ];

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

      const {data=[], dayoff=[], not_register=[]} = response;

      console.log('✅ Staff shift data loaded:', data);
      
      // 데이터 구조 매핑
      const mappedStaffList = data.map(item => ({
        staff_id:item.staff_id,
        schedule_id: item.schedule_id,
        staff_name: item.target_name || 'Unknown Staff',
        status: item.status, // 'pending', 'available', 'declined'
        start_time: item.start_time,
        end_time: item.end_time,
        work_date: item.work_date
      }));

      const dayoffList = dayoff.map(item => ({
        staff_id:item.staff_id,
        staff_name: item.target_name || 'Unknown Staff',
        work_date: item.work_date
      }));

      const notRegisterList = not_register.map(item => ({
        staff_id:item.staff_id,
        staff_name: item.target_name || 'Unknown Staff',
        work_date: item.work_date
      }));

      setStaffList(mappedStaffList);
      setDayoffList(dayoffList);
      setNotRegisterList(notRegisterList);

    } catch (error) {
      console.error('Failed to fetch staff list:', error);
      setStaffList([]);
      setDayoffList([]);
      setNotRegisterList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 메시지 포맷 헬퍼 함수
  const formatScheduleMessage = (messageKey, staffName) => {
    return get(messageKey).replace('{staffName}', staffName);
  };

  // 스케줄 상태 변경 핸들러
  const handleStatusChange = async (scheduleId, newStatus) => {
    try {
      // 해당 스태프 정보 찾기
      const staff = staffList.find(s => s.schedule_id === scheduleId);
      const staffName = staff ? staff.staff_name : 'Unknown Staff';
      
      // 상태 변경 확인 메시지
      const result = await customSwal.fire({
        title: get('SCHEDULE_SETTING_TITLE'),
        text: get('SCHEDULE_SETTING_CONFIRM'),
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: get('SWAL_CONFIRM_BUTTON'),
        cancelButtonText: get('STAFF_CANCEL_BUTTON'),
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
            {formatScheduleMessage('SCHEDULE_APPROVED_MESSAGE', staffName)}
          </span>,
          {icon:false}
        );
      } else {
        toast.info(
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <XCircle color="#f44336" size={20} />
            {formatScheduleMessage('SCHEDULE_REJECTED_MESSAGE', staffName)}
          </span>,
          {icon:false}
        );
      }
      
    } catch (error) {
      console.error('Failed to update schedule status:', error);

      // 실패 시 결과 알림
      toast.error(get('SCHEDULE_UPDATE_ERROR'));
    }
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    fetchStaffList(date);
  };

  const sendAlert = async (staffId) => {
    try {
      const response = await ApiClient.postForm('/api/sendAlert', {
        staff_id: staffId
      });

      console.log("response", response)
        
    } catch (error) {
      console.error('Failed to update schedule status:', error);
    }
  }

  // 스크롤을 현재 주로 이동 (이제 현재 주가 세 번째 줄에 위치)
  useEffect(() => {
    const scrollToToday = () => {
      if (calendarScrollRef.current) {
        // 현재 주는 2주 후에 위치 (0번째: 2주전, 1번째: 1주전, 2번째: 현재주)
        const targetScrollIndex = 1; // 두 번째 2주 블록 (현재 주가 포함된 블록)
        
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

    // 즉시 실행
    scrollToToday();
  }, [month, year]);

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
          height: 6.8rem;
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
        .assign-title {
          background: #f2f2f2;
          border-top: 1px solid #dedede;
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1rem 0 0.4rem 0;
          padding: 1rem;
        }
        .staff-row {
          position: relative;
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
          border-radius: 5px;
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
          title={
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ClipboardList size={18} />
              {get('STAFF_SCHEDULE_TITLE')}
            </span>
          }
          showBack={true}
          onBack={goBack}
        />
        
        <div className="month-row">
          <SketchBtn 
            variant="event" 
            size="small" 
            className="month-nav-btn" 
            onClick={handlePrevMonth}
          >
            {get('SCHEDULE_PREVIOUS_BUTTON')}
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
            {get('SCHEDULE_NEXT_BUTTON')}
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
                    if (!cell) return null; // 셀이 없는 경우 방어
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
                        {cell.date.date()}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem', color: '#666' }}>
            {get('SCHEDULE_LOADING_STAFF')}
          </div>
        ) : (
          <>
            {/* 근무자 리스트 */}
            {staffList.length > 0 && (
              <>
                <div className="assign-title">{get('SCHEDULE_APPROVAL_TITLE')}</div>
                {staffList.map(staff => (
                  <div key={staff.schedule_id} className="staff-row">
                    <HatchPattern opacity={0.6} />
                    <div className="staff-info">
                      <div className="staff-name">{staff.staff_name}</div>
                      <div className="staff-time">
                        {staff.start_time?.substring(0, 5)} - {staff.end_time?.substring(0, 5)}
                      </div>
                    </div>
                    <div>
                      <SketchBtn
                        size="small"
                        className="staff-assign-btn"
                        onClick={() => chatWithStaff(staff)}
                      >
                      <span className='chat-style' >
                          <MessageCircle size={14}/> chat
                      </span>
                      </SketchBtn>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 휴무자 리스트 */}
            {dayoffList.length > 0 && (
              <>
                <div className="assign-title">{get('STAFF_DAYOFF_TITLE')}</div>
                {dayoffList.map(staff => (
                  <div key={`dayoff-${staff.staff_id}`} className="staff-row">
                    <HatchPattern opacity={0.6} />
                    <div className="staff-info">
                      <div className="staff-name">{staff.staff_name}</div>
                      <div className="staff-time">{get('STAFF_DAYOFF_STATUS')}</div>
                    </div>
                    <div>
                      <SketchBtn
                        size="small"
                        className="staff-assign-btn"
                        onClick={() => chatWithStaff(staff)}
                      >
                        <span className='chat-style'>
                          <MessageCircle size={14}/> {get('BUTTON_CHAT')}
                        </span>
                      </SketchBtn>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* 미입력자 리스트 */}
            {notRegisterList.length > 0 && (
              <>
                <div className="assign-title">{get('STAFF_NOT_REGISTERED_TITLE')}</div>
                {notRegisterList.map(staff => (
                  <div key={`not-register-${staff.staff_id}`} className="staff-row">
                    <HatchPattern opacity={0.6} />
                    <div className="staff-info">
                      <div className="staff-name">{staff.staff_name}</div>
                      <div className="staff-time">{get('STAFF_NOT_REGISTERED_STATUS')}</div>
                    </div>
                    <div style={{display: 'flex', gap: '5px', width: '175px'}}>
                      <SketchBtn
                        size="small"
                        className="staff-assign-btn"
                        onClick={() => sendAlert(staff.staff_id)}
                      >
                        <span className='chat-style'>
                          <Bell size={13}/> {get('BUTTON_SEND')}
                        </span>
                      </SketchBtn>
                      <SketchBtn
                        size="small"
                        className="staff-assign-btn"
                        onClick={() => chatWithStaff(staff)}
                      >
                        <span className='chat-style'>
                          <MessageCircle size={14}/> {get('BUTTON_CHAT')}
                        </span>
                      </SketchBtn>
                    </div>
                  </div>
                ))}
              </>
            )}
          </>
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