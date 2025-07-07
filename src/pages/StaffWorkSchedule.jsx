import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { Calendar, MessageCircle, Clock, MapPin, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp, CheckCircle, XCircle } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';
import WeekSection from '@components/WeekSection';
import MonthSection from '@components/MonthSection';

import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { overlay } from 'overlay-kit';



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
  const [triggerRefresh, setTriggerRefresh] = useState(false);


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


  useEffect(() => {
    fetchSchedules();
  }, [currentMonth, currentYear, currentWeek, view, mondayStart, user, currentLang, messages]);


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
  const today = new Date();
  const startOfWeek = new Date(today);
  startOfWeek.setDate(today.getDate() - today.getDay() + (weekOffset * 7));
  
  const year = startOfWeek.getFullYear();
  const month = startOfWeek.getMonth() + 1;
  
  // 해당 월의 첫 번째 날
  const firstDayOfMonth = new Date(year, startOfWeek.getMonth(), 1);
  
  // 해당 주가 해당 월의 몇 번째 주인지 계산
  const dayOfMonth = startOfWeek.getDate();
  const weekOfMonth = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
  
  return `${month}월 ${weekOfMonth}째주`;
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

  // 월의 모든 주차 시작일 계산 함수 (월의 첫날~마지막날을 완전히 커버)
  const getAllWeekStartsOfMonth = (year, month, mondayStart) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // 첫 주의 시작일(월요일/일요일)
    let firstWeekStart = new Date(firstDay);
    const day = firstWeekStart.getDay();
    const diff = mondayStart ? (day === 0 ? -6 : 1 - day) : -day;
    firstWeekStart.setDate(firstWeekStart.getDate() + diff);
    firstWeekStart.setHours(0,0,0,0);

    // 마지막 주의 시작일(월요일/일요일)
    let lastWeekStart = new Date(lastDay);
    const lastDayOfWeek = lastWeekStart.getDay();
    const lastDiff = mondayStart ? (lastDayOfWeek === 0 ? -6 : 1 - lastDayOfWeek) : -lastDayOfWeek;
    lastWeekStart.setDate(lastWeekStart.getDate() + lastDiff);
    lastWeekStart.setHours(0,0,0,0);

    // 모든 주차 시작일 리스트업
    const weekStarts = [];
    let current = new Date(firstWeekStart);
    while (current <= lastDay) {
      weekStarts.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    return weekStarts;
  };

  // API 연계를 위한 함수
  const fetchSchedules = async () => {
    try {
      setIsLoadingData(true);
      if (view === 'week') {
        // 기존 주간 방식
        const weekDates = getWeekDates(currentWeek, mondayStart);
        const startDate = weekDates[0].toISOString().split('T')[0];
        const response = await ApiClient.postForm('/api/getStaffSchedules', {
          staff_id: user?.staff_id || user?.id,
          start_date: startDate
        });
        const apiResponse = response.data || [];
        setSchedules(apiResponse);
        // 지난 날짜들을 folded 상태로 설정 (Today 제외)
        const today = new Date();
        const pastDates = new Set();
        apiResponse.forEach(schedule => {
          const scheduleDate = new Date(schedule.work_date);
          const dateInfo = formatDate(scheduleDate);
          if (scheduleDate < today && !dateInfo.isToday) {
            pastDates.add(schedule.work_date);
          }
        });
        setFoldedDays(pastDates);
      } else if (view === 'month') {
        // 월간: 해당 월의 모든 주차 시작일을 계산해서 각 주차별로 API 호출
        const weekStarts = getAllWeekStartsOfMonth(currentYear, currentMonth, mondayStart);
        const promises = weekStarts.map(weekStart => {
          const startDate = weekStart.toISOString().split('T')[0];
          return ApiClient.postForm('/api/getStaffSchedules', {
            staff_id: user?.staff_id || user?.id,
            start_date: startDate
          }).then(res => res.data || []);
        });
        const allWeeks = await Promise.all(promises);
        // 모든 주차 데이터를 합쳐서 월간 데이터로 구성
        const merged = [].concat(...allWeeks);
        setSchedules(merged);
      }
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
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
    overlay.open(({ isOpen, close, unmount }) => {
      const [isOn, setIsOn] = React.useState(
        schedule.status !== null &&
        schedule.status !== 'dayoff' &&
        schedule.start_time &&
        schedule.end_time
      );
      const [start, setStart] = React.useState(schedule.start_time);
      const [end, setEnd] = React.useState(schedule.end_time);
      const hourOptions = Array.from({ length: 24 }, (_, i) => {
        const hourStr = String(i).padStart(2, '0');
        return { value: `${hourStr}:00:00`, label: `${i}` };
      });
      return (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0,0,0,0.25)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'BMHanna, Comic Sans MS, cursive, sans-serif'
          }}
          onClick={e => { if (e.target === e.currentTarget) unmount(); }}
        >
          <div style={{ 
            background: '#fff', 
            borderRadius: '1rem', 
            minWidth: 260, 
            padding: '2rem 1.5rem', 
            boxShadow: '0 4px 24px rgba(0,0,0,0.13)', 
            maxWidth: 275, 
            width: '100%' 
          }}>
            {/* Row 1: On/Off */}
            <div className='modal-top'>
              <span style={{ fontWeight: 600, fontSize: '1.01rem', minWidth: 70 }}>
                {get('SCHEDULE_MODAL_WORK_STATUS')}
              </span>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="workStatus" 
                    value="on" 
                    checked={isOn} 
                    onChange={() => setIsOn(true)}
                    style={{
                      appearance: 'none',
                      width: '18px',
                      height: '18px',
                      border: '2px solid #ddd',
                      borderRadius: '50%',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderColor: isOn ? '#2bb4bb' : '#ddd',
                      background: isOn ? '#2bb4bb' : 'transparent'
                    }}
                  />
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#374151' }}>
                    {get('SCHEDULE_MODAL_ON')}
                  </span>
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                  <input 
                    type="radio" 
                    name="workStatus" 
                    value="off" 
                    checked={!isOn} 
                    onChange={() => setIsOn(false)}
                    style={{
                      appearance: 'none',
                      width: '18px',
                      height: '18px',
                      border: '2px solid #ddd',
                      borderRadius: '50%',
                      position: 'relative',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      borderColor: !isOn ? '#2bb4bb' : '#ddd',
                      background: !isOn ? '#2bb4bb' : 'transparent'
                    }}
                  />
                  <span style={{ fontSize: '1rem', fontWeight: 500, color: '#374151' }}>
                    {get('SCHEDULE_MODAL_OFF')}
                  </span>
                </label>
              </div>
            </div>
            
            {/* Row 2: Hours */}
            {isOn && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 10, 
                marginBottom: 10, 
                justifyContent: 'center' 
              }}>
                <span style={{ fontSize: '1.01rem', minWidth: 45, fontWeight: 600}}>
                  {get('SCHEDULE_MODAL_HOURS')}
                </span>
                <select className="select-style" value={start} onChange={e => setStart(e.target.value)}>
                  {hourOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
                <span style={{ fontSize: '1.01rem', minWidth: 18, textAlign: 'center' }}>
                  {get('SCHEDULE_MODAL_TO')}
                </span>
                <select className="select-style" value={end} onChange={e => setEnd(e.target.value)}>
                  {hourOptions.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            )}
            
            <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <SketchBtn variant="danger" size="small" style={{ minWidth: 80 }} onClick={unmount}>
                {get('SCHEDULE_MODAL_CANCEL')}
              </SketchBtn>
              <SketchBtn variant="primary" size="small" style={{ minWidth: 80 }} onClick={() => {
                // 저장 로직
                const formattedData = [{
                  date: schedule.work_date,
                  status: isOn ? 'available' : 'dayoff',
                  start: start,
                  end: end,
                  on: Boolean(isOn)
                }];

                const jsonDataStr = JSON.stringify(formattedData);
                console.log('jsonDataStr:', jsonDataStr);

                const payload = {
                  staff_id: user?.staff_id,
                  jsonData: encodeURIComponent(jsonDataStr)
                }

                ApiClient.postForm('/api/upsertStaffSchedule', payload).then((response)=>{
                  console.log('response:', response);

                  Swal.fire({
                    title: get('SCHEDULE_SAVE_SUCCESS_TITLE'),
                    text: get('SCHEDULE_SAVE_SUCCESS_MESSAGE'),
                    icon: 'success',
                    confirmButtonText: get('SCHEDULE_MODAL_OK')
                  }).then((result) => {
                    if (result.isConfirmed || result.isDismissed) {
                      unmount();
                      setTriggerRefresh(!triggerRefresh);
                    }
                  });
                }).catch((error)=>{
                  console.error('Failed to save schedule:', error);
                  Swal.fire({
                    title: get('SCHEDULE_SAVE_ERROR_TITLE'),
                    text: get('SCHEDULE_SAVE_ERROR_MESSAGE'),
                    icon: 'error',
                    confirmButtonText: get('SCHEDULE_MODAL_OK')
                  });
                  unmount();
                });
              }}>
                <HatchPattern opacity={0.6} />
                {get('SCHEDULE_MODAL_SAVE')}
              </SketchBtn>
            </div>
          </div>
        </div>
      );
    });
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
        title: get('CHECKIN_DATE_ERROR'),
        icon: 'warning',
        confirmButtonText: get('SCHEDULE_MODAL_OK')
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
    case 'dayoff': return 'red';
    case 'no-schedule': return 'gray';
    default: return 'gray';
  }
};

const getStatusText = (status) => {
  switch (status) {
    case 'available': return get('SCHEDULE_STATUS_AVAILABLE');
    case 'pending': return get('SCHEDULE_STATUS_PENDING');
    case 'rejected': return get('SCHEDULE_STATUS_REJECTED');
    case 'dayoff': return get('SCHEDULE_STATUS_DAYOFF');
    case 'no-schedule': return get('SCHEDULE_STATUS_NO_SCHEDULE');
    default: return get('SCHEDULE_STATUS_NO_SCHEDULE');
  }
};

// month 이동 함수
const handlePrevMonth = () => {
  let newMonth = currentMonth - 1;
  let newYear = currentYear;
  if (newMonth < 0) {
    newMonth = 11;
    newYear = currentYear - 1;
  }
  if (newMonth === currentMonth && newYear === currentYear) {
    setTriggerRefresh(prev => !prev);
  } else {
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }
};

const handleNextMonth = () => {
  let newMonth = currentMonth + 1;
  let newYear = currentYear;
  if (newMonth > 11) {
    newMonth = 0;
    newYear = currentYear + 1;
  }
  if (newMonth === currentMonth && newYear === currentYear) {
    setTriggerRefresh(prev => !prev);
  } else {
    setCurrentMonth(newMonth);
    setCurrentYear(newYear);
  }
};

if (isLoadingData) {
  return (
    <div className="workschedule-container">
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <div>{get('SCHEDULE_LOADING')}</div>
      </div>
    </div>
  );
}

  const weekDates = getWeekDates(currentWeek, mondayStart);

  const chatWithManager = async() => {
    //console.log('chatWithManager', bk);


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
      //initType: 'booking',
      //reservation_id: bk.reservation_id,
      name : get('CHAT_ONE_ON_ONE_TITLE'),
      room_sn: room_sn,
      //...bk
    });


    /*
    navigateToPageWithData(PAGES.CHATTING, { 
      initType: 'booking',
      reservation_id: bk.reservation_id,
      ...bk
    });
    */
  };

   // 액션 라벨을 가져오는 함수
  const getActionLabel = (status, schedule) => {
    switch (status) {
      case 'pending':
      case 'rejected':
      case 'dayoff':
        return get('WORK_SCHEDULE_REQUEST_CHANGE');
      case 'available':
        const isCheckedIn = schedule.check_in && !schedule.check_out;
        const isCheckedOut = schedule.check_out ? true : false;
        if (isCheckedOut) return get('WORK_SCHEDULE_END');
        if (isCheckedIn) return get('WORK_SCHEDULE_CHECK_OUT');
        return get('WORK_SCHEDULE_CHECK_IN');
      case 'no-schedule':
      default:
        return get('WORK_SCHEDULE_APPLY_SCHEDULE');
    }
  };

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
        .toggle-btns { display: flex; gap: 0.3rem; }
        .toggle-btn { position:relative; padding: 0.4rem 1.2rem; font-size: 1.01rem; border: 1.2px solid #222; background: #f8f8f8; color: #222; font-weight: 600; border-radius: 0.5rem; cursor: pointer; }
        .toggle-btn.active { background: #222; color: #fff; }
        .date-nav { display: flex; align-items: center; gap: 0.7rem; }
        .date-btn { border: 1px solid #bbb; background: #fff; border-radius: 0.4rem; padding: 0.2rem 0.5rem; font-size: 1rem; cursor: pointer; }
        .week-title, .month-title { font-size: 1.1rem; font-weight: 600; color: #1f2937; text-align: center; flex: 1; }
        .schedule-list { margin-top: 1.5rem; }
        .schedule-row { display: flex; align-items: center; gap: 0.7rem; padding: 3px; margin-bottom: 5px;}
        .schedule-day { flex: 1; font-size: 0.9rem; justify-content: space-between;  max-width: 65px; min-height: 24px;}
        .schedule-time { flex: 2; font-size: 1.05rem; }
        .schedule-actions { flex: 1.2; display: flex;}
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
          font-size: 0.9rem;
          font-weight: 600;
          color: #1f2937;
          display: flex;
          align-items: center;
          max-width: 50px;
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

        .schedule-time-dayoff {
            color: #dc2626 !important; /* 빨간색 */
            font-weight: 500;
          }

          .schedule-time-no-schedule {
            color: #9ca3af !important; /* 회색 + 투명도 */
            opacity: 0.7;
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
          m
        }

        .check-outed{
          padding: 4px;
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
        .approved-badge {
          background: #2bb4bb;
          color: #fff;
          font-size: 0.72rem;
          border-radius: 8px;
          padding: 0.13em 0.7em;
          margin-left: 0.5em;
          font-weight: 600;
          letter-spacing: 0.02em;
          vertical-align: middle;
        }

        .modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.25);
            z-index: 2;
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .modal-content {
            background: #fff;
            border-radius: 1rem;
            min-width: 260px;
            padding: 2rem 1.5rem;
            box-shadow: 0 4px 24px rgba(0,0,0,0.13);
            max-width: 275px;
            width: 100%;
        }

        .form-row {
            margin-bottom: 22px;
            display: flex;
            align-items: center;
            gap: 16px;
        }

        .form-label {
            font-weight: 600;
            font-size: 1.01rem;
            min-width: 70px;
        }

        /* 라디오 버튼 컨테이너 */
        .radio-group {
            display: flex;
            gap: 12px;
            align-items: center;
        }

        .radio-item {
            display: flex;
            align-items: center;
            gap: 6px;
            cursor: pointer;
            font-size: 1rem;
        }

        /* 커스텀 라디오 버튼 스타일 */
        .radio-input {
            appearance: none;
            width: 18px;
            height: 18px;
            border: 2px solid #ddd;
            border-radius: 50%;
            position: relative;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .radio-input:checked {
            border-color: #2bb4bb;
            background: #2bb4bb;
        }

        .radio-input:checked::after {
            content: '';
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 6px;
            height: 6px;
            border-radius: 50%;
            background: white;
        }

        .radio-input:hover {
            border-color: #2bb4bb;
        }

        .radio-label {
            font-weight: 500;
            color: #374151;
            user-select: none;
        }

        /* 시간 선택 영역 */
        .hours-row {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 10px;
        }

        .select-style {
            padding: 0.4rem 0.6rem;
           border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          border: 0.8px solid #666;
            font-size: 0.9rem;
            background: white;
            cursor: pointer;
        }

        .hours-label {
            font-size: 1.01rem;
            min-width: 45px;
        }

        .hours-separator {
            font-size: 1.01rem;
            min-width: 18px;
            text-align: center;
        }

        /* 버튼 영역 */
        .button-row {
            margin-top: 32px;
            display: flex;
            justify-content: flex-end;
            gap: 10px;
        }

        .btn {
            min-width: 80px;
            padding: 0.5rem 1rem;
            border-radius: 6px;
            font-size: 0.9rem;
            font-weight: 600;
            border: none;
            cursor: pointer;
            transition: all 0.2s ease;
        }

        .btn-secondary {
            background: #f3f4f6;
            color: #374151;
            border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
            background: #e5e7eb;
        }

        .btn-primary {
            background: #2bb4bb;
            color: white;
        }

        .btn-primary:hover {
            background: #259ca3;
        }

        .demo-section {
            background: white;
            padding: 1rem;
            border-radius: 8px;
            margin-bottom: 2rem;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }

        .demo-title {
            font-size: 1.2rem;
            font-weight: bold;
            margin-bottom: 1rem;
            color: #374151;
        }

        .modal-top {    
        margin-bottom: 22px;
        display: flex;
        align-items: center;
        gap: 16px;
        border-bottom: 1px solid #dddddd;
        padding-bottom: 15px;
        justify-content: center;}
      `}</style>
      
      <SketchHeader
        title={
          <>
            <Calendar size={18} style={{marginRight:'7px',marginBottom:'-3px'}}/>
            {get('WORK_SCHEDULE_TITLE')}
          </>
        }
        showBack={true}
        onBack={goBack}
      />
      
      <div className="workschedule-container">
        <div className="top-bar">
          <div className="toggle-btns">
            <button 
              className={`toggle-btn${view==='week'?' active':''}`} 
              onClick={()=>setView('week')}
            >
              <HatchPattern opacity={0.6} />
              {get('WORK_SCHEDULE_WEEK')}
            </button>
            <button 
              className={`toggle-btn${view==='month'?' active':''}`} 
              onClick={()=>setView('month')}
            >
              <HatchPattern opacity={0.6} />
              {get('WORK_SCHEDULE_MONTH')}
            </button>
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
              {get('WORK_SCHEDULE_START_SUNDAY')}
            </button>
            <button 
              className={`toggle-btn ${mondayStart ? 'active' : 'inactive'}`}
              onClick={() => {
                setMondayStart(true);
                localStorage.setItem('mondayStart', 'true');
              }}
            >
              {get('WORK_SCHEDULE_START_MONDAY')}
            </button>
          </div>
        )}
        */}
        
        <div className="schedule-list">
          {view === 'week' ? (
            <WeekSection
              weekTitle={getWeekTitle(currentWeek)}
              schedules={schedules}
              usingFolding={false}
              folded={false}
              onToggleFold={()=>{}}
              isPastWeek={currentWeek < 0}
              get={get}
              handleEditSchedule={handleEditSchedule}
              handleCheckInOut={handleCheckInOut}
              handleCreateSchedule={handleCreateSchedule}
              formatDate={formatDate}
              formatTimeToAMPM={formatTimeToAMPM}
              getStatusText={getStatusText}
            />
          ) : (
            <MonthSection
              year={currentYear}
              month={currentMonth}
              schedules={schedules}
              get={get}
              handleEditSchedule={handleEditSchedule}
              handleCheckInOut={handleCheckInOut}
              handleCreateSchedule={handleCreateSchedule}
              formatDate={formatDate}
              formatTimeToAMPM={formatTimeToAMPM}
              getStatusText={getStatusText}
              mondayStart={mondayStart}
            />
          )}
        </div>
        <div className="create-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '100%', marginBottom: '0.3rem' }} onClick={chatWithManager}><HatchPattern opacity={0.4} />
            {get('BOOKING_MANAGER_CHAT')} Chat <MessageCircle size={14}/>
          </SketchBtn>
          <SketchBtn variant="event" size="medium" style={{ width: '100%' }} onClick={handleCreateSchedule}><HatchPattern opacity={0.4} />
            {get('WORK_SCHEDULE_CREATE_SCHEDULE')}
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffWorkSchedule; 