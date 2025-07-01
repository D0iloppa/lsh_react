import React, { useState, useEffect } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { Calendar, Clock, MapPin, User, Plus, Edit, Trash2, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import HatchPattern from '@components/HatchPattern';

import { useAuth } from '@contexts/AuthContext';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';

const StaffWorkSchedule = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const { user, isLoggedIn } = useAuth();
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  
  const [currentWeek, setCurrentWeek] = useState(0); // 0: 현재주, -1: 이전주, 1: 다음주
  const [mondayStart, setMondayStart] = useState(false); // false: 일요일 시작, true: 월요일 시작
  const [schedules, setSchedules] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [foldedDays, setFoldedDays] = useState(new Set()); // 접힌 날짜들

  useEffect(() => {
    window.scrollTo(0, 0);
    if (messages && Object.keys(messages).length > 0) {
      window.scrollTo(0, 0);
    }

    fetchSchedules();
  }, [messages, currentLang, currentWeek, mondayStart]);

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
    if (weekOffset === 0) return 'This Week';
    if (weekOffset === -1) return 'Last Week';
    if (weekOffset === 1) return 'Next Week';
    return `Week ${weekOffset > 0 ? '+' : ''}${weekOffset}`;
  };

  // API 연계를 위한 함수 (현재는 목데이터 반환)
  const fetchSchedules = async () => {
    try {
      setIsLoadingData(true);
      
      // TODO: 실제 API 호출로 변경
      const weekDates = getWeekDates(currentWeek, mondayStart);
      const startDate = weekDates[0].toISOString().split('T')[0];
      const endDate = weekDates[6].toISOString().split('T')[0];
      
      // const response = await ApiClient.get('/api/getStaffSchedules', {
      //   params: { 
      //     staff_id: user?.staff_id || user?.id,
      //     start_date: startDate,
      //     end_date: endDate,
      //     monday_start: mondayStart, // 일요일/월요일 시작 설정
      //     week_offset: currentWeek // 주차 오프셋 (현재주: 0, 이전주: -1, 다음주: 1)
      //   }
      // });
      
      // 목데이터 반환
      const dummyData = getDummySchedules();
      
      // 실제 API 응답 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 50));
      
      setSchedules(dummyData);
      
      // 지난 날짜들을 folded 상태로 설정 (Today 제외)
      const today = new Date();
      const pastDates = new Set();
      dummyData.forEach(schedule => {
        const scheduleDate = new Date(schedule.date);
        const dateInfo = formatDate(scheduleDate);
        // Today가 아닌 과거 날짜만 folded로 설정
        if (scheduleDate < today && !dateInfo.isToday) {
          pastDates.add(schedule.date);
        }
      });
      setFoldedDays(pastDates);
      
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      // 에러 시에도 목데이터 사용
      setSchedules(getDummySchedules());
    } finally {
      setIsLoadingData(false);
    }
  };

  // 목데이터 생성 함수
  const getDummySchedules = () => {
    const weekDates = getWeekDates(currentWeek, mondayStart);
    const today = new Date();
    
    return weekDates.map((date, index) => {
      const dateInfo = formatDate(date);
      const isPast = date < today;
      
      // 과거 날짜도 스케줄 유무에 따라 구분
      if (isPast) {
        // 과거 날짜는 랜덤하게 스케줄이 있었는지 없었는지 결정
        // const hadSchedule = Math.random() > 0.4; // 60% 확률로 스케줄이 있었음
        const hadSchedule = false
        
        if (hadSchedule) {
          return {
            id: index + 1,
            day: dateInfo.day,
            date: dateInfo.fullDate,
            startTime: '09:00',
            endTime: '17:00',
            location: 'Main Venue',
            status: 'completed',
            type: 'working',
            actions: [],
            isEmpty: false
          };
        } else {
          return {
            id: index + 1,
            day: dateInfo.day,
            date: dateInfo.fullDate,
            startTime: 'Unavailable',
            endTime: 'Unavailable',
            location: 'No Schedule',
            status: 'no_schedule',
            type: 'no_schedule',
            actions: [],
            isEmpty: true
          };
        }
      } else {
        // 미래 날짜는 랜덤 스케줄
        const schedules = [
          {
            startTime: '09:00',
            endTime: '17:00',
            location: 'Main Venue',
            status: 'confirmed',
            type: 'working'
          },
          {
            startTime: '10:00',
            endTime: '18:00',
            location: 'VIP Lounge',
            status: 'pending',
            type: 'working'
          },
          {
            startTime: '14:00',
            endTime: '22:00',
            location: 'Night Club',
            status: 'confirmed',
            type: 'working'
          },
          {
            startTime: 'Unavailable',
            endTime: 'Unavailable',
            location: 'Day Off',
            status: 'vacation',
            type: 'vacation'
          },
          {
            startTime: 'Unavailable',
            endTime: 'Unavailable',
            location: 'No Schedule',
            status: 'no_schedule',
            type: 'no_schedule'
          }
        ];
        
        const randomSchedule = schedules[Math.floor(Math.random() * schedules.length)];
        
        return {
          id: index + 1,
          day: dateInfo.day,
          date: dateInfo.fullDate,
          ...randomSchedule,
          actions: randomSchedule.type === 'vacation' ? ['Request Change'] : 
                  randomSchedule.type === 'no_schedule' ? ['Apply Schedule'] : 
                  ['Check In', 'Edit'],
          isEmpty: false
        };
      }
    });
  };

  const handleCreateSchedule = () => {
    const weekDates = getWeekDates(currentWeek, mondayStart);
    const startDate = weekDates[0].toISOString().split('T')[0];
    
    navigateToPageWithData(PAGES.STAFF_SCHEDULE_CREATE, { 
      mode: 'create', 
      staff_id: user?.staff_id || user?.id,
      monday_start: mondayStart, // 일요일/월요일 시작 설정
      week_offset: currentWeek,  // 주차 오프셋
      start_date: startDate,     // 주차 시작일
      week_dates: weekDates.map(date => date.toISOString().split('T')[0]) // 전체 주차 날짜들
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
      case 'confirmed': return 'green';
      case 'pending': return 'yellow';
      case 'vacation': return 'purple';
      case 'no_schedule': return 'gray';
      case 'completed': return 'blue';
      default: return 'gray';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'confirmed': return 'Confirmed';
      case 'pending': return 'Pending';
      case 'vacation': return 'Day Off';
      case 'no_schedule': return 'No Schedule';
      case 'completed': return 'Completed';
      default: return 'Unknown';
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
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
          padding: 0.5rem;
        }
        .week-navigation {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 1rem 0 1.5rem 0;
          gap: 1rem;
        }
        .week-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          text-align: center;
          flex: 1;
        }
        .nav-btn {
          min-width: 4rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.3rem;
          font-size: 0.9rem;
          font-weight: 500;
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
        .create-btn-row {
          margin: 1rem 0 1rem 0;
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
      `}</style>
      
      <SketchHeader
        title={<><Calendar size={18} style={{marginRight:'7px',marginBottom:'-3px'}}/>Work Schedule</>}
        showBack={true}
        onBack={goBack}
      />
      
      <div className="workschedule-container">
        <div className="week-navigation">
          <SketchBtn 
            size="small"
            className="nav-btn" style={{width: '30%'}}
            onClick={() => setCurrentWeek(prev => prev - 1)} 
          ><HatchPattern opacity={0.6} />
            <ChevronLeft size={16} />
            Prev
          </SketchBtn>
          
          <div className="week-title">{getWeekTitle(currentWeek)}</div>
          
          <SketchBtn 
            size="small"
            className="nav-btn" style={{width: '30%'}}
            onClick={() => setCurrentWeek(prev => prev + 1)}
          ><HatchPattern opacity={0.6} />
            Next
            <ChevronRight size={16} />
          </SketchBtn>
        </div>

        <div className="week-start-toggle">
          
          <button 
            className={`toggle-btn ${!mondayStart ? 'active' : 'inactive'}`}
            onClick={() => setMondayStart(false)}
          >
            Sunday Start
          </button>
          <button 
            className={`toggle-btn ${mondayStart ? 'active' : 'inactive'}`}
            onClick={() => setMondayStart(true)}
          >
            Monday Start
          </button>
        </div>

        {schedules.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📅</div>
            <div className="empty-title">No schedules found</div>
            <div className="empty-subtitle">
              Create your first work schedule to get started
            </div>
          </div>
        ) : (
          schedules.map((schedule) => {
            const isFolded = foldedDays.has(schedule.date);
            const dateInfo = formatDate(new Date(schedule.date));
            
            return (
              <SketchDiv 
                key={schedule.id} 
                className={`schedule-card ${dateInfo.isPast ? 'past' : ''} ${isFolded ? 'folded' : ''}`}
              ><HatchPattern opacity={0.6} />
                <div 
                  className="schedule-header"
                  onClick={() => toggleDayFold(schedule.date)}
                >
                  <div className="schedule-day">
                    <ChevronDown 
                      size={16} 
                      className={`fold-icon ${isFolded ? 'folded' : ''}`}
                    />
                    {schedule.day}
                    <span className="schedule-date">
                      {dateInfo.month} {dateInfo.date}
                    </span>
                    {dateInfo.isToday && (
                      <span className="today-badge">Today</span>
                    )}
                  </div>
                  <div 
                    className="schedule-status"
                    style={{
                      backgroundColor: getStatusColor(schedule.status) === 'green' ? '#dcfce7' : 
                                     getStatusColor(schedule.status) === 'yellow' ? '#fef3c7' : 
                                     getStatusColor(schedule.status) === 'blue' ? '#dbeafe' : 
                                     getStatusColor(schedule.status) === 'purple' ? '#f3e8ff' : '#f3f4f6',
                      color: getStatusColor(schedule.status) === 'green' ? '#166534' : 
                            getStatusColor(schedule.status) === 'yellow' ? '#92400e' : 
                            getStatusColor(schedule.status) === 'blue' ? '#1e40af' : 
                            getStatusColor(schedule.status) === 'purple' ? '#7c3aed' : '#6b7280'
                    }}
                  >
                    {getStatusText(schedule.status)}
                  </div>
                </div>

                <div className={`schedule-details ${isFolded ? 'folded' : ''}`}>
                  <div className="detail-row">
                    <Clock size={16} className="detail-icon" />
                    <span>
                      {schedule.startTime === 'Unavailable' ? 
                        (schedule.status === 'vacation' ? 'Day Off' : 'No Schedule') : 
                        `${schedule.startTime} - ${schedule.endTime}`
                      }
                    </span>
                  </div>
                </div>

                <div className={`schedule-actions ${isFolded ? 'folded' : ''}`}>
                  {schedule.actions.map((action) => (
                    <SketchBtn 
                      key={action} 
                      size="small" 
                      className="action-btn"
                      variant={
                        action === 'Check In' ? 'accent' : 
                        action === 'Check Out' ? 'danger' : 
                        'primary'
                      }
                      onClick={() => {
                        if (action === 'Edit') {
                          handleEditSchedule(schedule);
                        } else if (action === 'Delete') {
                          handleDeleteSchedule(schedule.id);
                        }
                      }}
                    >
                      {action === 'Edit' ? (
                        <>
                          <Edit size={13} /> Edit
                        </>
                      ) : (
                        action
                      )}
                    </SketchBtn>
                  ))}
                </div>
              </SketchDiv>
            );
          })
        )}

        <div className="create-btn-row">
          <SketchBtn 
            size="medium" 
            style={{ width: '100%' }}
            onClick={handleCreateSchedule}
          >
            <Plus size={18} style={{ marginRight: '5px', marginBottom:'-3px' }} />
            Create Schedule
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffWorkSchedule; 