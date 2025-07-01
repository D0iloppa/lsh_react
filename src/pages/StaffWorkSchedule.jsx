import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';

import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';

const StaffWorkSchedule = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  const [view, setView] = useState('week'); // 'week' or 'month'
  const [currentWeek, setCurrentWeek] = useState(0); // 0: 현재주, -1: 이전주, 1: 다음주
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth()); // 0~11
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [mondayStart, setMondayStart] = useState(false); // 내부에서만 제어
  const [schedules, setSchedules] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [foldedDays, setFoldedDays] = useState(new Set()); // 접힌 날짜들

  useEffect(() => {
    // 예시: 서버/유저 설정/기본값 등으로 자동 결정
    // setMondayStart(유저설정값 또는 서버값 또는 false)
    // setMondayStart(false); // 일요일 시작(기본)
    
    // 사용자 설정이나 서버 설정을 가져와서 설정
    // TODO: 실제 사용자 설정이나 서버 설정을 가져오는 로직으로 변경
    const userMondayStart = localStorage.getItem('mondayStart') === 'true';
    setMondayStart(userMondayStart);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (messages && Object.keys(messages).length > 0) {
      window.scrollTo(0, 0);
    }
    fetchSchedules();
  }, [messages, currentLang, currentWeek, mondayStart, view, currentMonth, currentYear]);

  // 주차 계산 함수
  const getWeekDates = (weekOffset = 0, mondayStart = false) => {
    const today = new Date();
    const currentDay = today.getDay(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
    
    let startOfWeek;
    if (mondayStart) {
      // 월요일 시작: 현재 요일이 월요일(1)이면 0, 화요일(2)이면 -1, ..., 일요일(0)이면 -6
      const daysFromMonday = currentDay === 0 ? 6 : currentDay - 1;
      startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - daysFromMonday + (weekOffset * 7));
    } else {
      // 일요일 시작: 현재 요일이 일요일(0)이면 0, 월요일(1)이면 -1, ..., 토요일(6)이면 -6
      startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - currentDay + (weekOffset * 7));
    }

    const weekDates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDates.push(date);
    }

    // 디버깅용 로그
    console.log('getWeekDates debug:', {
      weekOffset,
      mondayStart,
      today: today.toDateString(),
      currentDay,
      startOfWeek: startOfWeek.toDateString(),
      weekDates: weekDates.map(d => d.toDateString())
    });

    return weekDates;
  };

  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: days[date.getDay()],
      month: months[date.getMonth()],
      date: date.getDate(),
      fullDate: date.toISOString().split('T')[0],
      isToday: date.toDateString() === new Date().toDateString(),
      isPast: date < new Date(new Date().setHours(0, 0, 0, 0))
    };
  };

  // 주차 제목 생성
  const getWeekTitle = (weekOffset) => {
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    if (weekOffset === 1) return 'Next Week';
    return `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
  };

  // 시간 포맷 변환 함수 추가
  function formatTimeToAMPM(timeStr) {
    if (!timeStr) return '';
    const [hour, minute] = timeStr.split(':');
    let h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12;
    return `${String(h).padStart(2, '0')}:${minute} ${ampm}`;
  }

  // API 연계를 위한 함수
  const fetchSchedules = async () => {
    try {
      setIsLoadingData(true);
      
      const weekDates = getWeekDates(currentWeek, mondayStart);
      const startDate = weekDates[0].toISOString().split('T')[0];
      
      // 디버깅용 로그
      console.log('fetchSchedules debug:', {
        currentWeek,
        mondayStart,
        startDate,
        weekDates: weekDates.map(d => d.toDateString())
      });
      
      // 실제 API 호출
      const response = await ApiClient.postForm('/api/getStaffSchedules', {
          staff_id: user?.staff_id || user?.id,
          start_date: startDate
      });
      
      // API 응답 데이터를 그대로 저장
      const apiResponse = response.data || [];
      console.log('API response:', apiResponse);
      setSchedules(apiResponse);
      
      // 지난 날짜들을 folded 상태로 설정 (Today 제외)
      const today = new Date();
      const pastDates = new Set();
      apiResponse.forEach(schedule => {
        const scheduleDate = new Date(schedule.work_date);
        const dateInfo = formatDate(scheduleDate);
        // Today가 아닌 과거 날짜만 folded로 설정
        if (scheduleDate < today && !dateInfo.isToday) {
          pastDates.add(schedule.work_date);
        }
      });
      setFoldedDays(pastDates);
      
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      // 에러 시 빈 배열로 설정
      setSchedules([]);
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleCreateSchedule = () => {
    const weekDates = getWeekDates(currentWeek, mondayStart);
    const startDate = weekDates[0].toISOString().split('T')[0];
    
    navigateToPageWithData(PAGES.STAFF_SCHEDULE_CREATE, { 
      mode: 'create', 
      staff_id: user?.staff_id || user?.id,
      start_date: startDate,     // 주차 시작일
      scheduleData: schedules // 해당 주차의 현재 스케줄 데이터
    });
  };

  const handleEditSchedule = (schedule) => {
    navigateToPageWithData(PAGES.STAFF_SCHEDULE_EDIT, { 
      mode: 'edit', schedule_id: schedule.id, schedule
    });
  };

  const handleDeleteSchedule = async (scheduleId) => {
    try {
      // TODO: 실제 API 호출로 변경
      // await ApiClient.delete(`/api/deleteStaffSchedule/${scheduleId}`);
      
      // 목데이터에서 제거
      setSchedules(prev => prev.filter(s => s.id !== scheduleId));
    } catch (error) {
      console.error('Failed to delete schedule:', error);
    }
  };

  const handleCheckInOut = async (schedule, isCheckOut, isCheckedOut) => {
      if(isCheckedOut) return;
    
      console.log(schedule);
      try {

        const {schedule_id = false , work_date = false} = schedule;
        if(!schedule_id || !work_date) return;

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD 형식
        if(work_date !== today) {
          console.warn('Cannot check in/out for different date:', work_date, 'vs', today);
          // 사용자에게 알림 표시
          Swal.fire({
            title: '오늘 날짜가 아닌 일정에는 체크인/아웃할 수 없습니다.',
            icon: 'warning',
            confirmButtonText: 'OK'
          });
          return;
        }


        const status = isCheckOut ? 'check_out' : 'check_in';
        
        // DB에서 업데이트하고 실제 저장된 시간 반환받기
        const response = await ApiClient.postForm('/api/checkInOut', {
          status,
          schedule_id: schedule_id
        });
        
        // 성공했을 때만 로컬 상태 업데이트
        if(response.success) {
          const updatedTime = response.updated_time;
          setSchedules(prev => prev.map(s => 
            s.schedule_id === schedule_id 
              ? { ...s, [status]: updatedTime }
              : s
          ));
        } else {
          // 실패한 경우 에러 처리
          console.error('Check in/out failed:', response.err);
          // 사용자에게 알림 표시 등...
        }
        
      } catch (error) {
        console.error('Failed to check in/out:', error);
      }
  };

  const toggleDayFold = (date) => {
    setFoldedDays(prev => {
      const newSet = new Set(prev);
      if (newSet.has(date)) {
        newSet.delete(date);
      } else {
        newSet.add(date);
      }
      return newSet;
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'green';
      case 'pending': return 'yellow';
      case 'rejected': return 'red';
      case 'dayoff': return 'purple';
      case 'no-schedule': return 'gray';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'available': return 'Available';
      case 'pending': return 'Pending';
      case 'rejected': return 'Rejected';
      case 'dayoff': return 'Day Off';
      case 'no-schedule': return 'No Schedule';
      default: return 'No Schedule';
    }
  };

  // month 이동 함수
  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(y => y - 1);
    } else {
      setCurrentMonth(m => m - 1);
    }
  };
  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(y => y + 1);
    } else {
      setCurrentMonth(m => m + 1);
    }
  };

  if (isLoadingData) {
    return (
      <div className="workschedule-container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <div>Loading schedules...</div>
        </div>
      </div>
    );
  }

  const weekDates = getWeekDates(currentWeek, mondayStart);

  return (
    <>
      <style jsx="true">{`
        .workschedule-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding: 0.5rem;
        }
        .top-bar { display: flex; justify-content: space-between; align-items: center; margin: 1rem 0 1.2rem 0; }
        .toggle-btns { display: flex; gap: 0.5rem; }
        .toggle-btn { padding: 0.4rem 1.2rem; font-size: 1.01rem; border: 1.2px solid #222; background: #f8f8f8; color: #222; font-weight: 600; border-radius: 0.5rem; cursor: pointer; }
        .toggle-btn.active { background: #222; color: #fff; }
        .date-nav { display: flex; align-items: center; gap: 0.7rem; }
        .date-btn { border: 1px solid #bbb; background: #fff; border-radius: 0.4rem; padding: 0.2rem 0.7rem; font-size: 1rem; cursor: pointer; }
        .week-title, .month-title { font-size: 1.1rem; font-weight: 600; color: #1f2937; text-align: center; flex: 1; }
        .schedule-list { margin-top: 1.2rem; }
        .schedule-row { display: flex; align-items: center; gap: 0.7rem; margin-bottom: 0.7rem; }
        .schedule-day { flex: 1.2; font-size: 1.05rem; }
        .schedule-time { flex: 2.5; font-size: 1.05rem; }
        .schedule-actions { flex: 1.5; display: flex; gap: 0.3rem; }
        .schedule-action-btn { min-width: 90px; font-size: 0.95rem; padding: 0.18rem 0.5rem; }
        .create-btn-row { margin: 1.2rem 0 0.7rem 0; }
        .week-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 0 1.5rem 0;
          gap: 1rem;
        }
        .week-start-toggle {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
          border-radius: 8px;
          padding: 0.3rem;
        }
        .toggle-btn {
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
          border-radius: 3px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          border: 0.8px solid #666;
          outline: none;
        }
        .toggle-btn.active {
          background: #2bb4bb;
          color: white;
          box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
          width: 100%;
        }
        .toggle-btn.inactive {
          background: transparent;
          color: #6b7280;
          width: 100%;
        }
        .toggle-btn.inactive:hover {
          background: #e5e7eb;
          color: #374151;
        }
        .schedule-card {
          background: #fff;
          padding: 1rem;
          margin-bottom: 0.8rem;
          position: relative;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }
        .schedule-card.folded {
          padding: 0.6rem 1rem;
          margin-bottom: 0.4rem;
        }
        .schedule-card:hover {
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
        }
        .schedule-card.past {
          opacity: 0.5;
          background: #f8f9fa;
          border-color: #e9ecef;
        }
        .schedule-card.past:hover {
          opacity: 0.7;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
        }
        .schedule-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.8rem;
          cursor: pointer;
          padding: 0.2rem 0;
        }
        .schedule-card.folded .schedule-header {
          margin-bottom: 0;
        }
        .schedule-header:hover {
          background: #f8fafc;
          border-radius: 4px;
          padding: 0.2rem 0.5rem;
          margin: -0.2rem -0.5rem 0.6rem -0.5rem;
        }
        .schedule-card.folded .schedule-header:hover {
          margin: -0.2rem -0.5rem 0 -0.5rem;
        }
        .schedule-card.past .schedule-header:hover {
          background: #f1f3f4;
        }
        .schedule-day {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .schedule-card.folded .schedule-day {
          font-size: 1rem;
        }
        .schedule-card.past .schedule-day {
          color: #6b7280;
        }
        .schedule-date {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: normal;
        }
        .schedule-card.folded .schedule-date {
          font-size: 0.8rem;
        }
        .schedule-card.past .schedule-date {
          color: #9ca3af;
        }
        .schedule-status {
          padding: 0.25rem 0.7rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .schedule-card.folded .schedule-status {
          padding: 0.2rem 0.6rem;
          font-size: 0.7rem;
        }
        .schedule-card.past .schedule-status {
          opacity: 0.7;
        }
        .schedule-details {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
          margin-bottom: 0.8rem;
          overflow: hidden;
          transition: all 0.3s ease;
        }
        .schedule-details.folded {
          max-height: 0;
          margin-bottom: 0;
          opacity: 0;
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 0.6rem;
          font-size: 0.95rem;
          color: #4b5563;
        }
        .schedule-card.past .detail-row {
          color: #6b7280;
        }
        .detail-icon {
          width: 16px;
          color: #6b7280;
          flex-shrink: 0;
        }
        .schedule-card.past .detail-icon {
          color: #9ca3af;
        }
        .schedule-actions {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          transition: all 0.3s ease;
        }
        .schedule-actions.folded {
          max-height: 0;
          opacity: 0;
        }
        .action-btn {
          min-width: 80px;
          font-size: 0.85rem;
          padding: 0.4rem 0.8rem;
          border-radius: 6px;
        }
        .schedule-card.past .action-btn {
          opacity: 0.8;
        }
        .empty-state {
          text-align: center;
          padding: 3rem 2rem;
          color: #6b7280;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1rem;
          opacity: 0.4;
        }
        .empty-title {
          font-size: 1.2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #374151;
        }
        .empty-subtitle {
          font-size: 0.95rem;
          color: #6b7280;
        }
        .fold-icon {
          transition: transform 0.3s ease;
          color: #6b7280;
        }
        .schedule-card.past .fold-icon {
          color: #9ca3af;
        }
        .fold-icon.folded {
          transform: rotate(-90deg);
        }
        .today-badge {
          background: #2bb4bb;
          color: white;
          padding: 0.2rem;
          border-radius: 4px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
        }
        .schedule-card.folded .today-badge {
          font-size: 0.65rem;
          padding: 0.05rem 0.3rem;
        }
        .schedule-card.past .today-badge {
          background: #6b7280;
        }
        .status-vacation {
          background: #f3e8ff !important;
          color: #7c3aed !important;
        }
        .status-no-schedule {
          background: #f3f4f6 !important;
          color: #6b7280 !important;
        }
        .schedule-time-text {
          font-size: 0.8rem;
          font-weight: 400;
          letter-spacing: 0.01em;
        }

        .check-outed{
          background: #f3e8ff !important;
          color: #7c3aed !important;
        }
        .checked-out-badge {
          background: #7c3aed;
          color: #fff;
          font-size: 0.72rem;
          border-radius: 8px;
          padding: 0.13em 0.7em;
          margin-left: 0.7em;
          font-weight: 600;
          letter-spacing: 0.02em;
          vertical-align: middle;
        }
      `}</style>
      
      <SketchHeader
        title={<><Calendar size={18} style={{marginRight:'7px',marginBottom:'-3px'}}/>Work Schedule</>}
        showBack={true}
        onBack={goBack}
      />
      
      <div className="workschedule-container">
        <div className="top-bar">
          <div className="toggle-btns">
            <button className={`toggle-btn${view==='week'?' active':''}`} onClick={()=>setView('week')}>Week</button>
            <button className={`toggle-btn${view==='month'?' active':''}`} onClick={()=>setView('month')}>Month</button>
          </div>
          <div className="date-nav">
            {view === 'week' ? (
              <>
                <button className="date-btn" onClick={()=>setCurrentWeek(w=>w-1)}>&lt;</button>
                <span className="week-title">{getWeekTitle(currentWeek)}</span>
                <button className="date-btn" onClick={()=>setCurrentWeek(w=>w+1)}>&gt;</button>
              </>
            ) : (
              <>
                <button className="date-btn" onClick={handlePrevMonth}>&lt;</button>
                <span className="month-title">{currentYear}.{String(currentMonth+1).padStart(2,'0')}</span>
                <button className="date-btn" onClick={handleNextMonth}>&gt;</button>
              </>
            )}
          </div>
        </div>
        
        {/* 월요일/일요일 시작 토글 버튼 추가 */}
        {/*
        {view === 'week' && (
          <div className="week-start-toggle" style={{ backgroundColor: '#f3f4f6' }}>
            <button 
              className={`toggle-btn ${!mondayStart ? 'active' : 'inactive'}`}
              onClick={() => {
                setMondayStart(false);
                localStorage.setItem('mondayStart', 'false');
              }}
            >
              일요일 시작
            </button>
            <button 
              className={`toggle-btn ${mondayStart ? 'active' : 'inactive'}`}
              onClick={() => {
                setMondayStart(true);
                localStorage.setItem('mondayStart', 'true');
              }}
            >
              월요일 시작
            </button>
          </div>
        )}
        */}
        
        <div className="schedule-list">
          {view === 'week' ? (
            schedules.map((schedule, index) => {
              const dateInfo = formatDate(new Date(schedule.work_date));
              const isPast = new Date(schedule.work_date) < new Date();
              const status = schedule.status || 'no-schedule';
              
              // 액션 버튼 결정
              let actions = [];
              switch (status) {
                case 'pending':
                  actions = [
                    {
                      label: 'Request Change',
                      handler: () => handleEditSchedule(schedule)
                    }
                  ];
                  break;
                case 'available':
                  // 출근/퇴근 상태에 따라 버튼 결정
                  const isCheckedIn = schedule.check_in && !schedule.check_out;
                  const isCheckedOut = (schedule.check_out) ? true : false;
                  actions = [
                    {
                      label: isCheckedOut ? 'END' :
                             isCheckedIn ? 'Check Out' : 'Check In',
                      handler: () => handleCheckInOut(schedule, isCheckedIn, isCheckedOut)
                    }
                  ];
                  break;
                case 'rejected':
                  actions = [
                    {
                      label: 'Request Change',
                      handler: () => handleEditSchedule(schedule)
                    }
                  ];
                  break;
                case 'dayoff':
                  actions = [
                    {
                      label: 'Request Change',
                      handler: () => handleEditSchedule(schedule)
                    }
                  ];
                  break;
                case 'no-schedule':
                  actions = [
                    {
                      label: 'Apply Schedule',
                      handler: () => handleCreateSchedule()
                    }
                  ];
                  break;
                default:
                  actions = [
                    {
                      label: 'Apply Schedule',
                      handler: () => handleCreateSchedule()
                    }
                  ];
              }
              
              return (
                <div key={`schedule-${schedule.schedule_id || schedule.work_date || index}`} 
                     className={`schedule-row${schedule.check_out ? ' check-outed' : ''}`}>
                  <div className="schedule-day">{dateInfo.day}</div>
                  <div className="schedule-time">
                    {status === 'no-schedule' || status === 'dayoff' || !schedule.start_time ? 
                      getStatusText(status) : 
                      <>
                        <span className="schedule-time-text">
                          {`${formatTimeToAMPM(schedule.start_time)} - ${formatTimeToAMPM(schedule.end_time)}`}
                        </span>
                        {schedule.check_out && (
                          <>
                            <CheckCircle size={14} color="#7c3aed" style={{marginLeft: '0.5em', verticalAlign: 'middle'}} />
                            <span className="checked-out-badge">Checked Out</span>
                          </>
                        )}
                      </>
                    }
                  </div>
                  <div className="schedule-actions">
                    {actions.map((action, actionIndex) => (
                      <SketchBtn 
                        key={`${schedule.schedule_id || schedule.work_date || index}-${action.label}-${actionIndex}`} 
                        size="small" 
                        className="schedule-action-btn"
                        onClick={action.handler}
                      >
                        {action.label}
                      </SketchBtn>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <div style={{textAlign:'center',color:'#888',marginTop:'2rem'}}>월별 렌더링 예정</div>
          )}
        </div>
        <div className="create-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '100%' }} onClick={handleCreateSchedule}>Create schedule</SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffWorkSchedule; 