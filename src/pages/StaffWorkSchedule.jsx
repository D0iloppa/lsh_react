import React, { useState, useEffect, useRef, useMemo } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { Calendar, MessageCircle, Clock, CheckCircle, XCircle, ChevronLeft, ChevronRight, Check, X } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';
import dayjs from 'dayjs';

import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';
import { overlay } from 'overlay-kit';

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

  const month = date.getMonth() + 1; // 월은 0부터 시작
  const day = date.getDate();

  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' });

  return `${month}/${day} (${weekday})`;
};

const StaffWorkSchedule = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  const [schedules, setSchedules] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingVenue, setIsLoadingVenue] = useState(true);
  const [triggerRefresh, setTriggerRefresh] = useState(false);

  // 달력 관련 상태 추가
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [showCalendar, setShowCalendar] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(dayjs().month());
  const [calendarYear, setCalendarYear] = useState(dayjs().year());
  const [mondayStart, setMondayStart] = useState(false); // 내부에서만 제어
  const [currentWeek, setCurrentWeek] = useState(0); // 0: 현재주, -1: 이전주, 1: 다음주


  // venue Info
  const [venueData, setVenueData] = useState({});


  const calendarScrollRef = useRef(null);
  const today = dayjs();

  // 편집 중인 스케줄 상태 추가
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [editForm, setEditForm] = useState({
    isOn: false,
    start: '',
    end: ''
  });

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


  useEffect(() => {
    const fetchVenueData = async () => {
      try {
        setIsLoadingVenue(true);
        if (user?.venue_id) {
          const vd = await ApiClient.get('/api/getVenue', {
            params: { venue_id: user.venue_id }
          });
          console.log('Venue data fetched:', vd);
          setVenueData(vd);
        }
      } catch (error) {
        console.error('Failed to fetch venue data:', error);
      } finally {
        setIsLoadingVenue(false);
      }
    };

    fetchVenueData();
  }, [user?.venue_id]);

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

  // 선택된 날짜의 스케줄 개수 계산
  const getScheduleCountByDate = (date) => {
    const dateString = date.format('YYYY-MM-DD');
    return schedules.filter(schedule => {
      const scheduleDate = schedule.work_date || new Date(schedule.date).toLocaleDateString('en-CA');
      return scheduleDate === dateString;
    }).length;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    if (messages && Object.keys(messages).length > 0) {
      window.scrollTo(0, 0);
    }
    // venueData가 로드된 후에만 스케줄을 가져옴
    if (venueData && Object.keys(venueData).length > 0) {
      fetchSchedules();
    }
  }, [messages, currentLang, venueData]);

  useEffect(() => {
    // venueData가 로드된 후에만 스케줄을 가져옴
    if (venueData && Object.keys(venueData).length > 0) {
      fetchSchedules();
    }
  }, [user, currentLang, messages, triggerRefresh, venueData]);

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

  // 선택된 날짜에 따라 스케줄을 필터링하는 함수
  const getFilteredSchedules = () => {
  return schedules.filter(schedule => {
    const scheduleDate = schedule.work_date || new Date(schedule.date).toLocaleDateString('en-CA');
    if (scheduleDate !== selectedDate) return false;
    
    // 실제 스케줄이 설정된 것만 반환
    return schedule.status && 
           schedule.status !== 'no-schedule' && 
           (schedule.start_time || schedule.end_time);
  });
};

  // API 연계를 위한 함수 - 전체 스케줄 데이터를 가져옴
  const fetchSchedules = async () => {
    try {
      setIsLoadingData(true);
      
      // 기존 월간 로직 사용 - 해당 월의 모든 주차 시작일을 계산해서 각 주차별로 API 호출
      const weekStarts = getAllWeekStartsOfMonth(calendarYear, calendarMonth, false); // mondayStart = false
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
      
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      setSchedules([]);
    } finally {
      setIsLoadingData(false);
    }
};

// 날짜 비교 유틸리티 함수 추가
const isPastDate = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString < today;
};

const isTodayOrFuture = (dateString) => {
  const today = new Date().toISOString().split('T')[0];
  return dateString >= today;
};

const handleCreateSchedule = () => {
      // 기존 로직: 선택된 날짜 기준으로 해당 주의 일요일 시작일 계산
      /*
      const selectedDateObj = new Date(selectedDate);
      const dayOfWeek = selectedDateObj.getDay();
      const startOfWeek = new Date(selectedDateObj);
      startOfWeek.setDate(selectedDateObj.getDate() - dayOfWeek);
      const startDate = startOfWeek.toISOString().split('T')[0];

      // 해당 주 7일 전체 배열 생성
      const weekScheduleData = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(startOfWeek);
        currentDate.setDate(startOfWeek.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // 해당 날짜의 기존 스케줄 찾기
        const existingSchedule = schedules.find(schedule => {
          const scheduleDate = schedule.work_date || new Date(schedule.date).toLocaleDateString('en-CA');
          return scheduleDate === dateString;
        });
        
        // 기존 스케줄이 있으면 그것을 사용하고, 없으면 기본 구조 생성
        weekScheduleData.push(existingSchedule || {
          work_date: dateString,
          status: null,
          start_time: null,
          end_time: null,
          // 필요한 다른 기본값들...
        });
      }
      */

      // 새로운 로직: 선택된 날짜부터 7일간의 데이터 생성
      const selectedDateObj = new Date(selectedDate);
      const startDate = selectedDateObj.toISOString().split('T')[0];

      // 선택된 날짜부터 7일 전체 배열 생성
      const weekScheduleData = [];
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(selectedDateObj);
        currentDate.setDate(selectedDateObj.getDate() + i);
        const dateString = currentDate.toISOString().split('T')[0];
        
        // 해당 날짜의 기존 스케줄 찾기
        const existingSchedule = schedules.find(schedule => {
          const scheduleDate = schedule.work_date || new Date(schedule.date).toLocaleDateString('en-CA');
          return scheduleDate === dateString;
        });
        
        // 기존 스케줄이 있으면 그것을 사용하고, 없으면 기본 구조 생성
        weekScheduleData.push(existingSchedule || {
          work_date: dateString,
          status: null,
          start_time: null,
          end_time: null,
          // 필요한 다른 기본값들...
        });
    }

      console.log("selected date:", selectedDate);
      console.log("startDate:", startDate);
      console.log("weekScheduleData (7 days):", weekScheduleData);

      navigateToPageWithData(PAGES.STAFF_SCHEDULE_CREATE, { 
        mode: 'create', 
        staff_id: user?.staff_id || user?.id,
        venueData: venueData,
        start_date: selectedDate,
        scheduleData: weekScheduleData // 7일 전체 데이터
      });                       
};

  // const handleEditSchedule = (schedule) => {
  //   overlay.open(({ isOpen, close, unmount }) => {
  //     const [isOn, setIsOn] = React.useState(
  //       schedule.status !== null &&
  //       schedule.status !== 'dayoff' &&
  //       schedule.start_time &&
  //       schedule.end_time
  //     );
  //     const [start, setStart] = React.useState(schedule.start_time);
  //     const [end, setEnd] = React.useState(schedule.end_time);
  //     const hourOptions = Array.from({ length: 24 }, (_, i) => {
  //       const hourStr = String(i).padStart(2, '0');
  //       return { value: `${hourStr}:00:00`, label: `${i}` };
  //     });
  //     return (
  //       <div 
  //         style={{
  //           position: 'fixed',
  //           top: 0,
  //           left: 0,
  //           width: '100vw',
  //           height: '100vh',
  //           background: 'rgba(0,0,0,0.25)',
  //           zIndex: 2,
  //           display: 'flex',
  //           alignItems: 'center',
  //           justifyContent: 'center',
  //           fontFamily: 'BMHanna, Comic Sans MS, cursive, sans-serif'
  //         }}
  //         onClick={e => { if (e.target === e.currentTarget) unmount(); }}
  //       >
  //         <div style={{ 
  //           background: '#fff', 
  //           borderRadius: '1rem', 
  //           minWidth: 260, 
  //           padding: '2rem 1.5rem', 
  //           boxShadow: '0 4px 24px rgba(0,0,0,0.13)', 
  //           maxWidth: 275, 
  //           width: '100%' 
  //         }}>
  //           {/* Row 1: On/Off */}
  //           <div className='modal-top'>
  //             <span style={{ fontWeight: 600, fontSize: '1.01rem', minWidth: 70 }}>
  //               {get('SCHEDULE_MODAL_WORK_STATUS')}
  //             </span>
  //             <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
  //               <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
  //                 <input 
  //                   type="radio" 
  //                   name="workStatus" 
  //                   value="on" 
  //                   checked={isOn} 
  //                   onChange={() => setIsOn(true)}
  //                   style={{
  //                     appearance: 'none',
  //                     width: '18px',
  //                     height: '18px',
  //                     border: '2px solid #ddd',
  //                     borderRadius: '50%',
  //                     position: 'relative',
  //                     cursor: 'pointer',
  //                     transition: 'all 0.2s ease',
  //                     borderColor: isOn ? '#2bb4bb' : '#ddd',
  //                     background: isOn ? '#2bb4bb' : 'transparent'
  //                   }}
  //                 />
  //                 <span style={{ fontSize: '1rem', fontWeight: 500, color: '#374151' }}>
  //                   {get('SCHEDULE_MODAL_ON')}
  //                 </span>
  //               </label>
  //               <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
  //                 <input 
  //                   type="radio" 
  //                   name="workStatus" 
  //                   value="off" 
  //                   checked={!isOn} 
  //                   onChange={() => setIsOn(false)}
  //                   style={{
  //                     appearance: 'none',
  //                     width: '18px',
  //                     height: '18px',
  //                     border: '2px solid #ddd',
  //                     borderRadius: '50%',
  //                     position: 'relative',
  //                     cursor: 'pointer',
  //                     transition: 'all 0.2s ease',
  //                     borderColor: !isOn ? '#2bb4bb' : '#ddd',
  //                     background: !isOn ? '#2bb4bb' : 'transparent'
  //                   }}
  //                 />
  //                 <span style={{ fontSize: '1rem', fontWeight: 500, color: '#374151' }}>
  //                   {get('SCHEDULE_MODAL_OFF')}
  //                 </span>
  //               </label>
  //             </div>
  //           </div>
            
  //           {/* Row 2: Hours */}
  //           {isOn && (
  //             <div style={{ 
  //               display: 'flex', 
  //               alignItems: 'center', 
  //               gap: 10, 
  //               marginBottom: 10, 
  //               justifyContent: 'center' 
  //             }}>
  //               <span style={{ fontSize: '1.01rem', minWidth: 45, fontWeight: 600}}>
  //                 {get('SCHEDULE_MODAL_HOURS')}
  //               </span>
  //               <select className="select-style" value={start} onChange={e => setStart(e.target.value)}>
  //                 {hourOptions.map(opt => (
  //                   <option key={opt.value} value={opt.value}>{opt.label}</option>
  //                 ))}
  //               </select>
  //               <span style={{ fontSize: '1.01rem', minWidth: 18, textAlign: 'center' }}>
  //                 {get('SCHEDULE_MODAL_TO')}
  //               </span>
  //               <select className="select-style" value={end} onChange={e => setEnd(e.target.value)}>
  //                 {hourOptions.map(opt => (
  //                   <option key={opt.value} value={opt.value}>{opt.label}</option>
  //                 ))}
  //               </select>
  //             </div>
  //           )}
            
  //           <div style={{ marginTop: 32, display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
  //             <SketchBtn variant="danger" size="small" style={{ minWidth: 80 }} onClick={unmount}>
  //               {get('SCHEDULE_MODAL_CANCEL')}
  //             </SketchBtn>
  //             <SketchBtn variant="primary" size="small" style={{ minWidth: 80 }} onClick={() => {
  //               // 저장 로직
  //               const formattedData = [{
  //                 date: schedule.work_date,
  //                 status: isOn ? 'available' : 'dayoff',
  //                 start: start,
  //                 end: end,
  //                 on: Boolean(isOn)
  //               }];

  //               const jsonDataStr = JSON.stringify(formattedData);
  //               console.log('jsonDataStr:', jsonDataStr);

  //               const payload = {
  //                 staff_id: user?.staff_id,
  //                 jsonData: encodeURIComponent(jsonDataStr)
  //               }

  //               ApiClient.postForm('/api/upsertStaffSchedule', payload).then((response)=>{
  //                 console.log('response:', response);

  //                 Swal.fire({
  //                   title: get('SCHEDULE_SAVE_SUCCESS_TITLE'),
  //                   text: get('SCHEDULE_SAVE_SUCCESS_MESSAGE'),
  //                   icon: 'success',
  //                   confirmButtonText: get('SCHEDULE_MODAL_OK')
  //                 }).then((result) => {
  //                   if (result.isConfirmed || result.isDismissed) {
  //                     unmount();
  //                     setTriggerRefresh(!triggerRefresh);
  //                   }
  //                 });
  //               }).catch((error)=>{
  //                 console.error('Failed to save schedule:', error);
  //                 Swal.fire({
  //                   title: get('SCHEDULE_SAVE_ERROR_TITLE'),
  //                   text: get('SCHEDULE_SAVE_ERROR_MESSAGE'),
  //                   icon: 'error',
  //                   confirmButtonText: get('SCHEDULE_MODAL_OK')
  //                 });
  //                 unmount();
  //               });
  //             }}>
  //               <HatchPattern opacity={0.6} />
  //               {get('SCHEDULE_MODAL_SAVE')}
  //             </SketchBtn>
  //           </div>
  //         </div>
  //       </div>
  //     );
  //   });
  // };

  const handleEditSchedule = (schedule) => {
  // 과거 날짜 체크
  if (isPastDate(schedule.work_date)) {
    Swal.fire({
      title: get('SCHEDULE_PAST_EDIT_ERROR_TITLE') || '과거 스케줄 수정 불가',
      text: get('SCHEDULE_PAST_EDIT_ERROR_MESSAGE') || '과거 날짜의 스케줄은 수정할 수 없습니다.',
      icon: 'warning',
      confirmButtonText: get('SCHEDULE_MODAL_OK')
    });
    return;
  }

  if (editingScheduleId === schedule.schedule_id) {
    // 이미 편집 중이면 편집 취소
    setEditingScheduleId(null);
    setEditForm({ isOn: false, start: '', end: '' });
  } else {
    // 새로운 편집 시작
    setEditingScheduleId(schedule.schedule_id);
    setEditForm({
      isOn: schedule.status !== null && schedule.status !== 'dayoff' && schedule.start_time && schedule.end_time,
      start: schedule.start_time || '09:00:00',
      end: schedule.end_time || '18:00:00'
    });
  }
};

const handleSaveSchedule = async (schedule) => {
  const formattedData = [{
    date: schedule.work_date,
    status: editForm.isOn ? 'available' : 'dayoff',
    start: editForm.start,
    end: editForm.end,
    on: Boolean(editForm.isOn)
  }];

  const jsonDataStr = JSON.stringify(formattedData);
  const payload = {
    staff_id: user?.staff_id,
    jsonData: encodeURIComponent(jsonDataStr)
  };

  try {
    const response = await ApiClient.postForm('/api/upsertStaffSchedule', payload);
    
    Swal.fire({
      title: get('SCHEDULE_SAVE_SUCCESS_TITLE'),
      text: get('SCHEDULE_SAVE_SUCCESS_MESSAGE'),
      icon: 'success',
      confirmButtonText: get('SCHEDULE_MODAL_OK')
    });
    
    setEditingScheduleId(null);
    setEditForm({ isOn: false, start: '', end: '' });
    setTriggerRefresh(!triggerRefresh);
    
  } catch (error) {
    console.error('Failed to save schedule:', error);
    Swal.fire({
      title: get('SCHEDULE_SAVE_ERROR_TITLE'),
      text: get('SCHEDULE_SAVE_ERROR_MESSAGE'),
      icon: 'error',
      confirmButtonText: get('SCHEDULE_MODAL_OK')
    });
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



  const getStatusText = (status) => {
    switch (status) {
      case 'available': return get('SCHEDULE_MODAL_ON');
      case 'pending': return get('SCHEDULE_STATUS_PENDING');
      case 'rejected': return get('SCHEDULE_STATUS_REJECTED');
      case 'dayoff': return get('SCHEDULE_STATUS_DAYOFF');
      case 'no-schedule': return get('SCHEDULE_STATUS_NO_SCHEDULE');
      default: return get('SCHEDULE_STATUS_NO_SCHEDULE');
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

  const filteredSchedules = getFilteredSchedules();

// getScheduleCountByDate 함수 근처에 추가
const getScheduleStatusByDate = (date) => {
  const dateString = date.format('YYYY-MM-DD');
  const daySchedules = schedules.filter(schedule => {
    const scheduleDate = schedule.work_date || new Date(schedule.date).toLocaleDateString('en-CA');
    return scheduleDate === dateString;
  });
  
  if (daySchedules.length === 0) return null; // 스케줄 없음
  
  // 휴무가 있는지 확인
  const hasDayoff = daySchedules.some(s => s.status === 'dayoff');
  if (hasDayoff) return 'dayoff';
  
  // 작성된 스케줄이 있는지 확인
  const hasSchedule = daySchedules.some(s => s.status && s.status !== 'no-schedule');

  return hasSchedule ? 'scheduled' : 'no-schedule';
};

const weekDates = getWeekDates(currentWeek, mondayStart);

  const chatWithManager = async() => {
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
      name : get('CHAT_ONE_ON_ONE_TITLE'),
      room_sn: room_sn,
      send_to:'manager',
      receiver_id: user.manager_id,
    });
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
        .schedule-day { flex: 1; font-size: 1rem; justify-content: space-between;  max-width: 65px; min-height: 24px;}
        .schedule-time { flex: 2; font-size: 1.05rem; }
        .schedule-actions { flex: 1.2; display: flex;}
        .schedule-action-btn { min-width: 90px; font-size: 0.95rem; padding: 0.18rem 0.5rem; }
        .create-btn-row { margin: 1.2rem 0 0.7rem 0;  display: flex; gap: 10px;}
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
          font-size: 1rem;
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
          font-size: 1.1rem;
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
          font-size: 1rem;
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
          position: absolute;
          top: 2px;
          left: 3px;
          font-size: 0.7rem;
          line-height: 1;
          font-weight: 500;
        }
          .schedule-status-indicator {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            margin-top: 0.5rem;
          }
            .scheduled-indicator {
              color: #10b981;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .no-schedule-indicator {
              color: #6b7280;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .dayoff-indicator {
              color: #ef4444;
              font-size: 0.6rem;
              padding: 1px 3px;
              border-radius: 3px;
              min-width: 20px;
              text-align: center;
            }


        .schedule-count {
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
          max-height: 209px;
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
          position: relative;
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

        .schedule-section-title {
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
        
        .no-schedule-message {
          text-align: center;
          padding: 2rem;
          color: #6c757d;
          font-size: 1.1rem;
        }

        .status-dayoff{color: red;}

        .status-available{color: green;}

        /* 인라인 편집 폼 스타일 */
        .schedule-edit-form {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 1rem;
          margin: 0.5rem 0;
        }

        .edit-form-row {
          margin-bottom: 1rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-label {
          font-weight: 600;
          font-size: 0.9rem;
          color: #374151;
        }

        .radio-group {
          display: flex;
          gap: 1rem;
        }

        .radio-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          cursor: pointer;
        }

        .radio-input {
          appearance: none;
          width: 16px;
          height: 16px;
          border: 2px solid #d1d5db;
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

        .radio-label {
          font-size: 0.9rem;
          color: #374151;
          user-select: none;
        }

        .time-selects {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .time-separator {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .select-style {
          padding: 0.3rem 0.5rem;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.9rem;
          background: white;
          cursor: pointer;
          min-width: 60px;
        }

        .edit-form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
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
      
      {/* venueData 로딩 중일 때 표시 */}
      {isLoadingVenue && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '1.1rem',
          color: '#666'
        }}>
          매장 정보를 불러오는 중... / Loading venue information...
        </div>
      )}
      
      {/* venueData가 로드되지 않았을 때 에러 표시 */}
      {!isLoadingVenue && (!venueData || Object.keys(venueData).length === 0) && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '200px',
          fontSize: '1.1rem',
          color: '#e74c3c'
        }}>
          매장 정보를 불러올 수 없습니다. / Failed to load venue information.
        </div>
      )}
      
      {/* venueData가 로드된 후에만 메인 컨텐츠 표시 */}
      {!isLoadingVenue && venueData && Object.keys(venueData).length > 0 && (
      <div className="workschedule-container">
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
                                <div className="schedule-status-indicator">
                                {(() => {
                                  const status = getScheduleStatusByDate(cell.date);
                                  if (status === 'dayoff') {
                                    return <div className="dayoff-indicator">{get('STAFF_DAYOFF_STATUS')}</div>;
                                  } else if (status === 'scheduled') {
                                    return <div className="scheduled-indicator"><Check size={14} /></div>;
                                  } else if (status === 'no-schedule' || status == null) {
                                    return <div className="no-schedule-indicator"><X size={12} /></div>;
                                  }
                                  return null;
                                })()}
                              </div>
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

        {/* 선택된 날짜의 스케줄 표시 */}
        <div className="schedule-section-title">
          <div className="section-title-text">
            {selectedDate === getToday() 
              ? get('TODAY_SCHEDULE_TITLE') 
              : `${formatDateForDisplay(selectedDate)} ${get('WORK_SCHEDULE_TITLE')}`
            }
          </div>
          {/* <div className="section-count">{filteredSchedules.length}</div> */}
        </div>

        {filteredSchedules.length === 0 ? (
          <div className="no-schedule-message">
            {selectedDate === getToday() 
              ? (get('NO_SCHEDULE_TODAY'))
              : `${formatDateForDisplay(selectedDate)} ${get('STAFF_NO_UPCOMING_SHIFTS')}`
            }
          </div>
        ) : (
          <div className="schedule-list">
            {filteredSchedules.map((schedule, index) => {
              const isEditing = editingScheduleId === schedule.schedule_id;
              const isPast = isPastDate(schedule.work_date);
              const hourOptions = Array.from({ length: 24 }, (_, i) => {
                const hourStr = String(i).padStart(2, '0');
                return { value: `${hourStr}:00:00`, label: `${i}` };
              });
              
              return (
                <SketchDiv key={schedule.schedule_id || index} className="schedule-card">
                  <HatchPattern opacity={0.6} />
                  <div className="schedule-header">
                    <div className="schedule-day">
                      {formatDate(new Date(schedule.work_date)).day}
                      <div className="schedule-date">
                        {formatDate(new Date(schedule.work_date)).date}
                      </div>
                    </div>
                    <div className={`schedule-status status-${schedule.status || 'no-schedule'}`}>
                      {getStatusText(schedule.status || 'no-schedule')}
                    </div>
                  </div>
                  
                  {isEditing ? (
                    // 편집 모드
                    <div className="schedule-edit-form">
                      <div className="edit-form-row">
                        <span className="form-label">{get('SCHEDULE_MODAL_WORK_STATUS')}</span>
                        <div className="radio-group">
                          <label className="radio-item">
                            <input 
                              type="radio" 
                              name={`workStatus-${schedule.schedule_id}`}
                              checked={editForm.isOn} 
                              onChange={() => setEditForm({...editForm, isOn: true})}
                              className="radio-input"
                            />
                            <span className="radio-label">{get('SCHEDULE_MODAL_ON')}</span>
                          </label>
                          <label className="radio-item">
                            <input 
                              type="radio" 
                              name={`workStatus-${schedule.schedule_id}`}
                              checked={!editForm.isOn} 
                              onChange={() => setEditForm({...editForm, isOn: false})}
                              className="radio-input"
                            />
                            <span className="radio-label">{get('SCHEDULE_MODAL_OFF')}</span>
                          </label>
                        </div>
                      </div>
                      
                      {editForm.isOn && (
                        <div className="edit-form-row">
                          <span className="form-label">{get('SCHEDULE_MODAL_HOURS')}</span>
                          <div className="time-selects">
                            <select 
                              className="select-style" 
                              value={editForm.start} 
                              onChange={e => setEditForm({...editForm, start: e.target.value})}
                            >
                              {hourOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                            <span className="time-separator">{get('SCHEDULE_MODAL_TO')}</span>
                            <select 
                              className="select-style" 
                              value={editForm.end} 
                              onChange={e => setEditForm({...editForm, end: e.target.value})}
                            >
                              {hourOptions.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                      )}
                      
                      <div className="edit-form-actions">
                        <SketchBtn 
                          variant="primary" 
                          size="small" 
                          onClick={() => handleSaveSchedule(schedule)}
                        >
                          {get('SCHEDULE_MODAL_SAVE')}
                        </SketchBtn>
                        <SketchBtn 
                          variant="danger" 
                          size="small" 
                          onClick={() => {
                            setEditingScheduleId(null);
                            setEditForm({ isOn: false, start: '', end: '' });
                          }}
                        >
                          {get('SCHEDULE_MODAL_CANCEL')}
                        </SketchBtn>
                      </div>
                    </div>
                  ) : (
                    // 일반 모드
                    <>
                      <div className="schedule-details">
                        {schedule.start_time && schedule.end_time && (
                          <div className="detail-row">
                            <Clock className="detail-icon" />
                            <span>
                              {formatTimeToAMPM(schedule.start_time)} - {formatTimeToAMPM(schedule.end_time)}
                            </span>
                          </div>
                        )}
                        
                        {schedule.check_in && (
                          <div className="detail-row">
                            <CheckCircle className="detail-icon" />
                            <span>{get('WORK_SCHEDULE_CHECK_IN')}: {formatTimeToAMPM(schedule.check_in)}</span>
                          </div>
                        )}
                        
                        {schedule.check_out && (
                          <div className="detail-row">
                            <XCircle className="detail-icon" />
                            <span>{get('WORK_SCHEDULE_CHECK_OUT')}: {formatTimeToAMPM(schedule.check_out)}</span>
                          </div>
                        )}
                      </div>
                      
                     <div className="schedule-actions">
                          {/* 과거 날짜가 아닐 때만 변경 버튼 표시 */}
                          {!isPast && (
                            <SketchBtn 
                              variant="primary" 
                              size="small" 
                              className="action-btn"
                              onClick={() => handleEditSchedule(schedule)}
                            >
                              {get('WORK_SCHEDULE_REQUEST_CHANGE')}
                            </SketchBtn>
                          )}
                          
                          {/* 과거 날짜일 때는 변경 불가 메시지 */}
                          {isPast && (
                            <div className="past-schedule-notice">
                             
                            </div>
                          )}
                        </div>
                      </>
                  )}
                </SketchDiv>
              );
            })}
          </div>
        )}


        <div className="create-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '90%', marginBottom: '0.3rem', height: '40px' }} onClick={chatWithManager}><HatchPattern opacity={0.4} />
            {get('BOOKING_MANAGER_CHAT')} Chat <MessageCircle size={14}/>
          </SketchBtn>
          <SketchBtn variant="event" size="medium" style={{ width: '90%',  height: '40px' }} onClick={handleCreateSchedule}><HatchPattern opacity={0.4} />
            {get('WORK_SCHEDULE_CREATE_SCHEDULE')}
          </SketchBtn>
        </div>
      </div>
      )}
    </>
  );
};


export default StaffWorkSchedule;