import React, { useState, useEffect } from 'react';
import WeekSection from './WeekSection';

// 월간 스케줄 컴포넌트
const MonthSection = ({
  year,
  month,
  schedules = [],
  get = (k) => k,
  handleEditSchedule = () => {},
  handleCheckInOut = () => {},
  handleCreateSchedule = () => {},
  formatDate = (d) => d,
  formatTimeToAMPM = (t) => t,
  getStatusText = (s) => s,
  mondayStart = false
}) => {
  const [foldedWeeks, setFoldedWeeks] = useState(new Set());
  const [weekSections, setWeekSections] = useState([]);

  // 월의 모든 주차의 시작일 리스트업
  const getAllWeekStartsOfMonth = (year, month, mondayStart) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    let current = new Date(firstDay);
    // 첫 주의 시작일로 이동
    const firstWeekStart = getWeekStart(current, mondayStart);
    current = new Date(firstWeekStart);
    const weekStarts = [];
    while (current <= lastDay) {
      weekStarts.push(new Date(current));
      current.setDate(current.getDate() + 7);
    }
    return weekStarts;
  };

  // 주차 시작일 계산
  const getWeekStart = (date, mondayStart) => {
    const day = date.getDay();
    const diff = mondayStart 
      ? (day === 0 ? 6 : day - 1)  // 월요일 시작
      : day;                       // 일요일 시작
    const weekStart = new Date(date);
    weekStart.setDate(date.getDate() - diff);
    weekStart.setHours(0,0,0,0);
    return weekStart;
  };

  // 주차 번호 계산
  const getWeekNumber = (date, mondayStart) => {
    const yearStart = new Date(date.getFullYear(), 0, 1);
    const days = Math.floor((date - yearStart) / (24 * 60 * 60 * 1000));
    return Math.ceil((days + yearStart.getDay() + (mondayStart ? 6 : 0)) / 7);
  };

  // 주차 제목 생성
  const getWeekTitle = (weekStart, weekNumber, isCurrentWeek) => {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    const formatDate = (date) => `${date.getMonth() + 1}/${date.getDate()}`;
    if (isCurrentWeek) {
      return `This Week (${formatDate(weekStart)} - ${formatDate(weekEnd)})`;
    } else {
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)} (Week ${weekNumber})`;
    }
  };

  useEffect(() => {
    const weekStarts = getAllWeekStartsOfMonth(year, month, mondayStart);
    const today = new Date();
    today.setHours(0,0,0,0);
    // 주차별로 스케줄 매핑
    const weekSections = weekStarts.map(weekStart => {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      // 이 주차에 해당하는 스케줄만 필터
      const weekSchedules = schedules.filter(sch => {
        const d = new Date(sch.work_date);
        d.setHours(0,0,0,0);
        return d >= weekStart && d <= weekEnd;
      });
      // 오늘이 이 주차에 포함되는지
      const isCurrentWeek = today >= weekStart && today <= weekEnd;
      // 과거 주차 여부
      const isPastWeek = weekEnd < today;
      // 미래 주차 여부
      const isFutureWeek = weekStart > today;
      return {
        weekStart,
        weekNumber: getWeekNumber(weekStart, mondayStart),
        schedules: weekSchedules,
        isCurrentWeek,
        isPastWeek,
        isFutureWeek
      };
    });
    setWeekSections(weekSections);
    // folded 상태 초기화: 과거 주차만 folded, 현재/미래 주차는 open
    const folded = new Set();
    weekSections.forEach(week => {
      if (week.isPastWeek) folded.add(week.weekStart.toISOString().split('T')[0]);
    });
    setFoldedWeeks(folded);
  }, [schedules, year, month, mondayStart]);

  // fold 토글
  const toggleWeekFold = (weekKey) => {
    setFoldedWeeks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(weekKey)) {
        newSet.delete(weekKey);
      } else {
        newSet.add(weekKey);
      }
      return newSet;
    });
  };

  return (
    <div className="month-section">
      {weekSections.length > 0 ? (
        weekSections.map((week, index) => {
          const weekKey = week.weekStart.toISOString().split('T')[0];
          const isFolded = foldedWeeks.has(weekKey);
          return (
            <WeekSection
              key={`week-${weekKey}-${index}`}
              weekTitle={getWeekTitle(week.weekStart, week.weekNumber, week.isCurrentWeek)}
              schedules={week.schedules}
              usingFolding={true}
              folded={isFolded}
              onToggleFold={() => toggleWeekFold(weekKey)}
              isPastWeek={week.isPastWeek}
              get={get}
              handleEditSchedule={handleEditSchedule}
              handleCheckInOut={handleCheckInOut}
              handleCreateSchedule={handleCreateSchedule}
              formatDate={formatDate}
              formatTimeToAMPM={formatTimeToAMPM}
              getStatusText={getStatusText}
            />
          );
        })
      ) : (
        <div className="empty-month-state">
          <div style={{textAlign:'center',color:'#888',marginTop:'2rem'}}>
            {get('WORK_SCHEDULE_NO_SCHEDULES_THIS_MONTH')}
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthSection; 