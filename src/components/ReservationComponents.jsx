import React, { useState, useRef, useCallback, useEffect } from 'react';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';
import ApiClient from '@utils/ApiClient';
import { useAuth } from '../contexts/AuthContext';
import { useMsg } from "@contexts/MsgContext";

import Select from "react-select";


import {
  getVietnamDate,
  getVietnamTime,
  getVietnamHour,
  isVietnamToday,
  getVietnamDateObject,
  buildVNDateTime,
  parseHHMM,
  vnNow
} from '@utils/VietnamTime';

// 주간 테이블 CSS 스타일 (이 스타일을 부모 컴포넌트에 추가하세요)
export const weeklyTableStyles = `

  .reserve-info {
    padding: 10px;
    margin-bottom:10px;
  }

  .summary-item {
      font-size: 0.95rem;
      color: #374151;
      margin-bottom: 0.75rem;
      display: flex;
      justify-content: flex-start;
      align-items: flex-start;
    }

    .summary-item:last-child {
      margin-bottom: 0;
    }

    .summary-label {
      font-weight: bold;
      color: #1f2937;
      flex-shrink: 0;
    }

    .summary-value {
        margin-left:10px;
      }

  .weekly-table {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 8px;
    margin-top: 12px;
    padding: 0;
  }

  .weekly-day {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 12px 8px;
    border: 2px solid #e5e7eb;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
    background-color: white;
    min-height: 60px;
  }

  .weekly-day:hover {
    border-color: #1f2937;
    background-color: #f9fafb;
  }

  .weekly-day.selected {
    background-color: #1f2937;
    color: white;
    border-color: #1f2937;
  }

  .weekly-day.today {
    border-color: #3b82f6;
    background-color: #eff6ff;
  }

  .weekly-day.today.selected {
    background-color: #1f2937;
    border-color: #1f2937;
  }

  .weekly-day.disabled {
    opacity: 0.3;
    cursor: not-allowed;
    background-color: #f3f4f6;
  }

  .weekly-day.disabled:hover {
    border-color: #e5e7eb;
    background-color: #f3f4f6;
  }

  .day-name {
    font-size: 12px;
    font-weight: 500;
    margin-bottom: 4px;
    color: #6b7280;
  }

  .weekly-day.selected .day-name {
    color: #d1d5db;
  }

  .day-date {
    font-size: 16px;
    font-weight: bold;
    color: #1f2937;
  }

  .weekly-day.selected .day-date {
    color: white;
  }

  .weekly-day.today .day-date {
    color: #3b82f6;
  }

  .weekly-day.today.selected .day-date {
    color: white;
  }

  .selection-info {
    margin-top: 4px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
  
  .selection-info small {
    color: #6b7280;
    font-size: 11px;
  }
  
  .selected-count {
    color: #3b82f6;
    font-size: 12px;
    font-weight: 500;
  }
  
  .time-slot.drag-preview {
    transform: scale(0.98);
  }
  
  .selected-times-summary {
    margin-top: 12px;
    padding: 8px;
    background-color: #f9fafb;
    border-radius: 6px;
    font-size: 14px;
    color: #374151;
  }
  
  .clear-selection {
    margin-left: 12px;
    padding: 4px 8px;
    font-size: 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    background-color: white;
    cursor: pointer;
  }

  .clear-selection:hover {
    background-color: #f3f4f6;
  }

  .duration-selector {
    margin-top: 16px;
    padding: 12px;
    background-color: #f9fafb;
    border-radius: 8px;
  }

  .duration-label {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
    color: #374151;
  }

  .duration-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 8px;
  }

  .duration-info {
    margin-top: 8px;
    font-size: 12px;
    color: #6b7280;
  }

  .selection-warning {
    margin-top: 12px;
    padding: 8px;
    background-color: #fef3c7;
    border-radius: 6px;
    font-size: 14px;
    color: #92400e;
  }
`;
  
const dayKeys = [
  "day_sun", // 일요일
  "day_mon", // 월요일
  "day_tue", // 화요일
  "day_wed", // 수요일
  "day_thu", // 목요일
  "day_fri", // 금요일
  "day_sat"  // 토요일
];

// 주간 테이블 생성 유틸리티 함수 (오늘부터 7일간)
export const generateWeeklyDays = (baseDate, maxDay = 1) => {
  const today = new Date(baseDate);
  const weekDays = [];
  //const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];


  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);

    const dayOfWeek = currentDate.getDay();
    const dayKey = dayKeys[dayOfWeek];

    weekDays.push({
      dayName: dayKey,
      date: currentDate.getDate(),
      fullDate: currentDate.toISOString().split('T')[0],
      disabled: i >= maxDay,
      isToday: i === 0,
      dayOfWeek: dayOfWeek
    });
  }

  console.log('generateWeeklyDays', weekDays);
  return weekDays;
};

// 년월 표시 함수
export const getYearMonthDisplay = (date) => {

  if (!date) return 'loading...';

  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}.${month}`;
};

// 시간 슬롯 생성 함수 (기본: 0~24시간)
export const generateTimeSlots = (startHour = 0, endHour = 24) => {
  const timeSlots = [];

  // 0 ~ 23 범위 제한
  startHour = startHour % 24;
  endHour = endHour % 24;

  if (startHour === endHour) {
    return timeSlots; // 0시간
  }

  if (startHour < endHour) {
    // 같은 날 내 예약
    for (let hour = startHour; hour < endHour; hour++) {
      const timeString = hour.toString().padStart(2, '0') + ':00';
      timeSlots.push(timeString);
    }
  } else {
    // 다음날로 넘어감
    // 예: 17 → 23
    for (let hour = startHour; hour < 24; hour++) {
      const timeString = hour.toString().padStart(2, '0') + ':00';
      timeSlots.push(timeString);
    }
    // 예: 0 → 2
    for (let hour = 0; hour < endHour; hour++) {
      const timeString = hour.toString().padStart(2, '0') + ':00';
      timeSlots.push(timeString);
    }
  }

  return timeSlots;
};

// 새로운 함수: 라벨과 값을 분리한 시간 슬롯 생성
export const generateTimeSlotsWithLabels = (startHour = 19, endHour = 3) => {
  const timeSlots = [];
  const usedValues = new Set();

  const startTotalMinutes = startHour * 60;
  const endTotalMinutes = endHour * 60;

  if (startHour < endHour) {
    // 같은 날 안에서만 도는 경우 (예: 09:00 ~ 18:00)
    for (let m = startTotalMinutes; m <= endTotalMinutes; m += 30) {
      const hour = Math.floor(m / 60);
      const minute = m % 60;
      const displayTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      const actualTime = displayTime;

      if (!usedValues.has(actualTime)) {
        timeSlots.push({
          label: displayTime,
          value: actualTime,
          isNextDay: false,
        });
        usedValues.add(actualTime);
      }
    }
  } else {
    // 자정을 넘어가는 경우 (예: 19:00 ~ 03:00)
    // 1) 당일 구간
    for (let m = startTotalMinutes; m < 24 * 60; m += 30) {
      const hour = Math.floor(m / 60);
      const minute = m % 60;
      const displayTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      const actualTime = displayTime;

      if (!usedValues.has(actualTime)) {
        timeSlots.push({
          label: displayTime,
          value: actualTime,
          isNextDay: false,
        });
        usedValues.add(actualTime);
      }
    }

    // 2) 다음날 구간
    for (let m = 0; m <= endTotalMinutes; m += 30) {
      const hour = Math.floor(m / 60);
      const minute = m % 60;
      const displayTime = `${hour.toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;
      // value는 24h 넘겨서 구분 가능하게
      const actualTime = `${(hour + 24).toString().padStart(2, '0')}:${minute
        .toString()
        .padStart(2, '0')}`;

      if (!usedValues.has(actualTime)) {
        timeSlots.push({
          label: displayTime,
          value: actualTime,
          isNextDay: true,
        });
        usedValues.add(actualTime);
      }
    }
  }

  return timeSlots;
};


// Duration 관련 유틸리티 함수들
const getEndTime = (startTime, duration) => {
  const [hour] = startTime.split(':').map(Number);
  const endHour = (hour + duration);
  return `${endHour.toString().padStart(2, '0')}:00`;
};

const getEndTimeDisplay = (startTime, duration) => {
  // duration은 "시간 단위" (예: 1.5 = 1시간 30분)
  const [hour, min] = startTime.split(':').map(Number);

  // 시작 시각을 총 분으로 변환
  const startTotalMinutes = hour * 60 + min;

  // duration(시간)을 분으로 변환
  const addMinutes = Math.round(duration * 60);

  // 종료 시각(분 단위, 24시간 모듈러)
  const endTotalMinutes = (startTotalMinutes + addMinutes) % (24 * 60);

  // 다시 시:분으로 변환
  const endHour = Math.floor(endTotalMinutes / 60);
  const endMinute = endTotalMinutes % 60;

  return `${endHour.toString().padStart(2, '0')}:${endMinute
    .toString()
    .padStart(2, '0')}`;
};

const canSelectDuration = (startTime, duration, disabledTimes) => {
  const [startHour] = startTime.split(':').map(Number);

  // 연속된 시간들이 모두 사용 가능한지 체크
  for (let i = 0; i < duration; i++) {
    const checkHour = startHour + i;
    const checkTime = `${checkHour.toString().padStart(2, '0')}:00`;

    if (disabledTimes.includes(checkTime)) {
      return false;
    }
  }

  return true;
};

// 
// 시간 선택 컴포넌트
const DurationSelector = ({
  durationByMenu = false, // 이용시간이 메뉴에 기재된 경우 사용하지 않음
  timeSlots,
  startTime,
  maxDuration,
  selectedDuration,
  onDurationChange,
  disabledTimes = [],
  availableTimes = new Set(),
  messages = {} // 다국어 메시지 추가
}) => {
  if (!startTime) return null;

  // startTime 기준으로 timeSlots에서 인덱스 찾기
  const startTimeIndex = timeSlots.findIndex(slot => {
    if (typeof slot === 'string') {
      return slot === startTime;
    } else {
      return slot.value === startTime;
    }
  });
  if (startTimeIndex === -1) return null;




// helper: 문자열 시간 → totalMinutes (예: "28:30" -> 1710)
const toMinutes = (time) => {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
};

// helper: totalMinutes → 문자열 시간 (예: 1710 -> "28:30")
const toTime = (minutes) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, '0')}`;
};

const durations = [];
const startMinutes = toMinutes(startTime);

for (let h = 1; h <= maxDuration; h++) {
  let canUse = true;
  // h시간 → h*2개의 30분 슬롯 필요
  for (let i = 0; i < h * 2; i++) {
    const slotTime = toTime(startMinutes + i * 30);
    if (!availableTimes.has(slotTime)) {
      canUse = false;
      break;
    }
  }
  if (canUse) {
    durations.push(h);
  } else {
    break; // 더 긴 시간은 당연히 불가하므로 루프 중단
  }
}

console.log('availableTimes-time:', availableTimes, startTime, durations);



const canSelectDuration = (start, duration, availableTimes) => {
  const startMinutes = toMinutes(start);
  const slotsNeeded = duration * 2; // 1시간 = 2슬롯 (30분 단위)

  for (let i = 0; i < slotsNeeded; i++) {
    const slotTime = toTime(startMinutes + i * 30);
    if (!availableTimes.has(slotTime)) {
      return false; // 연속 구간 중 하나라도 없으면 불가
    }
  }
  return true;
};










/*

  // 남아있는 슬롯 수 계산
  const remainingSlots = timeSlots.length - startTimeIndex;

  // maxDuration(시간) → 슬롯 개수는 시간*2 (30분 단위라서)
  const slotIntervalMinutes = 30;
  const slotsPerHour = 60 / slotIntervalMinutes; // 2개 = 30분 단위

  // maxDuration(시간) → 슬롯 개수
  const maxSlotsByDuration = maxDuration * slotsPerHour;
  const availableSlots = Math.min(maxSlotsByDuration, remainingSlots);

  // 실제 표시할 duration (시간 단위)

  const durations = [];
  for (let h = 1; h <= maxDuration; h++) { 
    const slotsNeeded = h * 2; 
    if (slotsNeeded <= availableSlots) { 
      durations.push(h); 
    } 
  }
*/





  // 24시간 형식 출력 (넘어가면 25:00 → 01:00 이런식으로 유지)
  const formatTime = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const displayHours = (hours % 24).toString().padStart(2, '0');
    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  /*
  // 특정 duration이 예약 가능한지 확인
  const canSelectDuration = (start, duration) => {
    const slotsNeeded = duration * 2;
    for (let i = 0; i < slotsNeeded; i++) {
      const slot = timeSlots[startTimeIndex + i];
      if (!slot) return false;
      const slotValue = typeof slot === 'string' ? slot : slot.value;
      if (disabledTimes.includes(slotValue)) return false;
    }
    return true;
  };
  */

  // 종료 시간 계산
  /*
  const getEndTimeDisplay = (start, duration) => {
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = h * 60 + m + duration * 60; // duration 시간(60분 단위)
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${(endHour % 24).toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  };
  */

  const getEndTimeDisplay = (start, duration) => {
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = h * 60 + m + duration * 60; // duration(시간) → 분 변환
    const endHour = Math.floor(totalMinutes / 60);
    const endMinute = totalMinutes % 60;
    return `${(endHour % 24).toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
  };

  return (
    <div className="duration-selector">
      <div className="duration-label">
        {formatTime(startTime)}{messages.durationSelectLabel || '부터 이용 시간 선택'}
      </div>
      <div className="duration-grid">
        {durations.map(duration => {
          const isDisabled = !canSelectDuration(startTime, duration, availableTimes);
          return (
            <SketchBtn
              key={duration}
              variant={selectedDuration === duration ? 'accent' : 'secondary'}
              onClick={() => onDurationChange(duration)}
              disabled={isDisabled}
              style={{ fontSize: '12px', padding: '6px 12px', minHeight: '32px' }}
            >
              {duration}{messages.hourUnit || '시간'}
            </SketchBtn>
          );
        })}
      </div>
      {selectedDuration && (
        <div className="duration-info">
          {messages.reservationTimeLabel || '예약 시간'}: {formatTime(startTime)} - {getEndTimeDisplay(startTime, selectedDuration)}
        </div>
      )}
    </div>
  );
};


// 시간 슬롯 필터링 함수 (특정 범위만 추출)
export const filterTimeSlots = (allTimeSlots, startTime, endTime) => {
  const startHour = parseInt(startTime.split(':')[0]);
  const endHour = parseInt(endTime.split(':')[0]);

  return allTimeSlots.filter(timeSlot => {
    const hour = parseInt(timeSlot.split(':')[0]);
    return hour >= startHour && hour <= endHour;
  });
};

// 특정 시간대를 비활성화하는 함수
export const getDisabledTimeSlots = (scheduleData, selectedDate, bookedTimes = []) => {
  const disabledTimes = [];

  console.log('getDisabledTimeSlots',scheduleData, selectedDate, bookedTimes);
  if (bookedTimes && bookedTimes.length > 0) {
    disabledTimes.push(...bookedTimes);
  }

  if (scheduleData && selectedDate && scheduleData[selectedDate]) {
    const daySchedule = scheduleData[selectedDate];

    if (daySchedule.timeSlots) {
      Object.keys(daySchedule.timeSlots).forEach(time => {
        const timeSlot = daySchedule.timeSlots[time];
        if (timeSlot.available === false || timeSlot.reserved === true) {
          disabledTimes.push(time);
        }
      });
    }
  }

  return [...new Set(disabledTimes)];
};

// 영업시간 외 시간대를 비활성화하는 함수
export const getBusinessHoursDisabledTimes = (allTimeSlots, businessStart = 9, businessEnd = 22) => {
  return allTimeSlots.filter(timeSlot => {
    const hour = parseInt(timeSlot.split(':')[0]);
    return hour < businessStart || hour > businessEnd;
  });
};

// 시간대별 상태 확인 함수
export const getTimeSlotStatus = (timeSlot, scheduleData, selectedDate, disabledTimes = []) => {
  if (disabledTimes.includes(timeSlot)) {
    return 'disabled';
  }

  if (scheduleData && selectedDate && scheduleData[selectedDate]) {
    const daySchedule = scheduleData[selectedDate];

    if (daySchedule.timeSlots && daySchedule.timeSlots[timeSlot]) {
      const slotData = daySchedule.timeSlots[timeSlot];

      if (slotData.reserved === true) {
        return 'reserved';
      }

      if (slotData.available === false) {
        return 'unavailable';
      }
    }
  }

  return 'available';
};

// 년월 표시 컴포넌트
export const YearMonthDisplay = ({ date }) => {
  const yearMonth = getYearMonthDisplay(date);

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: '16px',
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#1f2937'
    }}>
      <span>{yearMonth}</span>
    </div>
  );
};

// 참석자 선택 컴포넌트
export const AttendeeSelector = ({ value, onChange, messages = {} }) => {
  const attendeeOptions = [
    { value: '', label: messages.selectPeople || 'Select number of people' },
    { value: '1', label: messages.onePerson || '1 person' },
    { value: '2', label: messages.twoPeople || '2 people' },
    { value: '3', label: messages.threePeople || '3 people' },
    { value: '4', label: messages.fourPeople || '4 people' },
    { value: '5', label: messages.fivePlusePeople || '5+ people' }
  ];

  return (
    <div className="form-step">
      <div className="step-label">
        <span className="step-number">1</span>
        {messages.attendeeLabel || 'Attendee'}
      </div>
      <select
        className="attendee-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {attendeeOptions.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// 주간 테이블 컴포넌트
export const WeeklyTableComponent = ({
  baseDate,
  maxDay = 1,
  selectedDate,
  onDateSelect,
  disabledDates = [],
  messages = {}, // 다국어 메시지 추가
  navigateToPageWithData,
  PAGES
}) => {
  const { get } = useMsg();
  const weekDays = generateWeeklyDays(baseDate, maxDay);

  console.log('WeeklyTableComponent', weekDays);

  const handleDateSelect = (dayInfo) => {

    if (dayInfo.disabled) return;

    if (!disabledDates.includes(dayInfo.fullDate)) {
      onDateSelect(dayInfo.fullDate, dayInfo.date);
    }
  };

  const isDateDisabled = (dayInfo) => {
    return disabledDates.includes(dayInfo.fullDate);
  };

  const isSelected = (dayInfo) => {
    return selectedDate === dayInfo.fullDate || selectedDate === dayInfo.date;
  };

  return (
    <div className="form-step">
      <div className="step-label">
        <span className="step-number">2</span>
        {messages.selectDateLabel || 'Select Date'}
      </div>

      <YearMonthDisplay date={baseDate} />

      <div className="weekly-table">
        {weekDays.map((dayInfo, index) => (
          <div
            key={index}
            className={`
              weekly-day 
              ${isSelected(dayInfo) ? 'selected' : ''} 
              ${isDateDisabled(dayInfo) ? 'disabled' : ''} 
              ${dayInfo.disabled ? 'disabled' : ''}
              ${isVietnamToday(dayInfo.fullDate) ? 'today' : ''}
            `}
            onClick={() => handleDateSelect(dayInfo)}
            style={{
              opacity: isDateDisabled(dayInfo) ? 0.3 : 1,
              cursor: isDateDisabled(dayInfo) ? 'not-allowed' : 'pointer'
            }}
          >
            <div className="day-name">{get(dayInfo.dayName)}</div>
            <div className="day-date">{dayInfo.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Duration-based 시간 선택 컴포넌트 (새로운 방식)
export const DurationBasedTimeSelector = ({
  timeSlots = [],
  selectedStartTime = '',
  selectedDuration = null,
  onTimeSelect,
  disabledTimes = [],
  availableTimes = new Set(),
  baseDate = new Date(),
  maxDuration = 6, // 최대 6시간까지 선택 가능
  messages = {}, // 다국어 메시지 추가
  navigateToPageWithData,
  PAGES,
  menuDuration = null // ✅ 새로 추가
}) => {

  const { user, isActiveUser } = useAuth();


  const [startTime, setStartTime] = useState(selectedStartTime);
  const [duration, setDuration] = useState(selectedDuration);
  const [active, setActive] = useState(false);
  const { get } = useMsg();



  React.useEffect(() => {
    setStartTime(selectedStartTime);
    setDuration(selectedDuration);
  }, [selectedStartTime, selectedDuration]);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const result = await isActiveUser();
      if (mounted) setActive(result);
    })();
    return () => { mounted = false; };
  }, [isActiveUser]);

  const handleTimeClick = (timeSlot) => {
    const time = typeof timeSlot === 'string' ? timeSlot : timeSlot.value;
    if (disabledTimes.includes(time)) return;
  
    setStartTime(time);
  
    // 메뉴 duration이 있으면 바로 확정
    if (menuDuration) {
      onTimeSelect({
        startTime: time,
        duration: menuDuration,
        endTime: getEndTimeDisplay(time, menuDuration),
      });
    } else {
      // 기존 로직: duration은 사용자가 고름
      setDuration(null);
      onTimeSelect({
        startTime: time,
        duration: null,
        endTime: null,
      });
    }
  };

  const handleDurationChange = (newDuration) => {
    setDuration(newDuration);

    // 부모 컴포넌트에 완전한 예약 정보 전달
    onTimeSelect({
      startTime: startTime,
      duration: newDuration,
      endTime: getEndTime(startTime, newDuration)
    });
  };

  const getTimeSlotVariant = (timeSlot) => {
    const time = typeof timeSlot === 'string' ? timeSlot : timeSlot.value;
    if (disabledTimes.includes(time)) return 'disabled';
    if (startTime === time) return 'accent';
  
    // 선택된 시간 범위 하이라이트
    const effectiveDuration = menuDuration || duration;  // ✅ 메뉴 duration 우선
    if (startTime && effectiveDuration) {
      const [startHour, startMin] = startTime.split(':').map(Number);
      const [timeHour, timeMin] = time.split(':').map(Number);
  
      const startTotal = startHour * 60 + startMin;
      const slotTotal = timeHour * 60 + timeMin;
      const endTotal = startTotal + effectiveDuration * 60;
  
      if (slotTotal >= startTotal && slotTotal < endTotal) {
        return 'primary';
      }
    }
  
    return 'secondary';
  };

  const convertTo12HourFormat = (time24) => {
    const [hours, minutes] = time24.split(':').map(Number);
    const adjustedHours = hours % 24;



    const displayHours = adjustedHours.toString().padStart(2, '0');

    //adjustedHours === 0 ? 12 : (adjustedHours > 12 ? adjustedHours - 12 : adjustedHours);

    return `${displayHours}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="form-step-3">
      <div className="step-label">
        <span className="step-number">3</span>
        {messages.timeAndDurationLabel || '시간 및 이용시간 선택'}
        {startTime && duration && (
          <div style={{ marginLeft: '10px', fontSize: '12px', color: '#3b82f6' }}>
            {convertTo12HourFormat(startTime)} - {getEndTimeDisplay(startTime, duration)} ({duration}{messages.hourUnit || '시간'})
          </div>
        )}
      </div>




      <div style={{ userSelect: 'none', width: '100%' }}>
        {/*이용권 연장*/}
        <div>
          {(() => {
            const { isActiveUser = false, subscription = {} } = active || {};
            const expiredAtStr = subscription?.expired_at; // e.g. "2025-08-12 21:22:32.953"
            if (!expiredAtStr || !baseDate) return null;

            // 1) 만료일의 날짜 부분만 사용
            const expiredYmd = expiredAtStr.slice(0, 10); // "YYYY-MM-DD"

            // 2) baseDate를 VN 타임존 날짜(YYYY-MM-DD)로 변환
            const parts = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Asia/Ho_Chi_Minh',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour12: false
            }).formatToParts(baseDate);
            const getPart = (type) => parts.find(p => p.type === type)?.value || '';
            const baseYmd = `${getPart('year')}-${getPart('month')}-${getPart('day')}`;

            // 3) 규칙: baseDate >= expired_at(날짜)이면 연장 버튼 노출
            const shouldShowButton = baseYmd >= expiredYmd;

            console.log('[extend-check]', { baseYmd, expiredYmd, shouldShowButton, isActiveUser, navigateToPageWithData, PAGES });
            // PURCHASEPAGE

            if (shouldShowButton) {
              return (
                <SketchBtn
                  style={{ boxShadow: '4px 4px 0px #49dde4', marginBottom: '10px' }}
                  onClick={() => {
                    navigateToPageWithData(PAGES.PURCHASEPAGE, {
                      mode: 'extend'
                    });
                  }}
                >
                  이용권 연장
                </SketchBtn>
              );
            } else {
              return null;
            }
          })()}
        </div>


        {(() => {
          const result = [];
          let currentDate = null;
          let buttonGroup = [];

          const pushGroup = () => {
            

            if (!currentDate || buttonGroup.length === 0) return;


            //const days = ['일', '월', '화', '수', '목', '금', '토'];
            const dayKeys = [
              "day_sun", // 0: 일요일
              "day_mon", // 1: 월요일
              "day_tue", // 2: 화요일
              "day_wed", // 3: 수요일
              "day_thu", // 4: 목요일
              "day_fri", // 5: 금요일
              "day_sat", // 6: 토요일
            ];

            // currentDate가 "YYYY-MM-DD" 문자열
            const dateObj = new Date(currentDate);
            const dayOfWeek = dateObj.getDay();
            const dayKey = dayKeys[dayOfWeek];
            const dayName = get(dayKey);

            const displayDate = `${currentDate} (${dayName})`;

            result.push(
              <div
                key={`group-${currentDate}`}
                style={{
                  display: 'block',        // 💥 핵심: 가로 정렬 안 하도록 block 지정
                  width: '100%',
                  marginBottom: '24px',
                }}
              >
                {/* 날짜 */}
                <div
                  style={{
                    display: 'block',     // 💥 날짜도 block
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#111827',
                    marginBottom: '10px',
                  }}
                >
                  {displayDate}
                </div>

                {/* 버튼들 */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                }}>
                  {buttonGroup}
                </div>
              </div>
            );
          };

          timeSlots.forEach((timeSlot, index) => {
            const time = typeof timeSlot === 'string' ? timeSlot : timeSlot.value;
            const displayTime = typeof timeSlot === 'string' ? timeSlot : timeSlot.label;

            const hour = parseInt(time.split(':')[0], 10);
            const isNextDay = hour >= 24;

            const labelDate = new Date(baseDate);
            if (isNextDay) labelDate.setDate(labelDate.getDate() + 1);

            const dateLabelString = labelDate.toISOString().split('T')[0];

            if (currentDate !== dateLabelString) {
              pushGroup(); // 이전 그룹 밀어넣기
              currentDate = dateLabelString;
              buttonGroup = [];
            }

            buttonGroup.push(
              <SketchBtn
                key={`btn-${index}`}
                variant={getTimeSlotVariant(timeSlot)}
                size="small"
                onClick={() => handleTimeClick(timeSlot)}
                disabled={disabledTimes.includes(time)}
                style={{
                  opacity: disabledTimes.includes(time) ? 0.5 : 1,
                  position: 'relative',
                }}
              >
                <HatchPattern opacity={startTime === time ? 0.6 : 0.4} />
                {displayTime}
              </SketchBtn>
            );
          });

          pushGroup(); // 마지막 그룹

          return result;
        })()}
      </div>











      {/* DurationSelector → menuDuration 없을 때만 보이도록 */}
      {!menuDuration && (
        <DurationSelector
          startTime={startTime}
          timeSlots={timeSlots}
          maxDuration={maxDuration}
          selectedDuration={duration}
          onDurationChange={handleDurationChange}
          disabledTimes={disabledTimes}
          availableTimes={availableTimes}
          messages={messages}
        />
      )}

      {startTime && !duration && !menuDuration && (
        <div className="selection-warning">
          {messages.selectDurationWarning || "시작 시간을 선택했습니다. 이용 시간을 선택해주세요."}
        </div>
      )}
    </div>
  );
};

// 기존 TimeSlotSelector 컴포넌트 (호환성 유지)
export const TimeSlotSelector = ({
  timeSlots = [],
  selectedTimes = [],
  onTimeSelect,
  disabledTimes = [],
  selectionMode = 'single',
  allowDrag = false,
  messages = {} // 다국어 메시지 추가
}) => {
  // 기존 API와의 호환성을 위한 처리
  const currentSelectedTimes = Array.isArray(selectedTimes) ? selectedTimes :
    selectedTimes ? [selectedTimes] : [];

  const handleTimeSelect = (timeSlot, event) => {
    // 새로운 형식 지원 (label/value 분리)
    const time = typeof timeSlot === 'string' ? timeSlot : timeSlot.value;
    const displayTime = typeof timeSlot === 'string' ? timeSlot : timeSlot.label;

    if (disabledTimes.includes(time)) return;

    let newSelectedTimes;




    switch (selectionMode) {
      case 'single':
        newSelectedTimes = [time];
        break;

      default:
        newSelectedTimes = [time];
    }

    // 기존 API와 호환성 유지
    if (selectionMode === 'single') {
      onTimeSelect(newSelectedTimes[0] || '');
    } else {
      onTimeSelect(newSelectedTimes);
    }
  };

  const getTimeSlotVariant = (timeSlot) => {
    const time = typeof timeSlot === 'string' ? timeSlot : timeSlot.value;
    if (disabledTimes.includes(time)) return 'disabled';
    if (currentSelectedTimes.includes(time)) return 'accent';
    return 'secondary';
  };

  return (
    <div className="form-step-3">
      <div className="step-label">
        <span className="step-number">3</span>
        {messages.chooseTimeLabel || 'Choose Time'}
      </div>

      <div
        className="time-grid"
        style={{ userSelect: 'none' }}
      >
        {timeSlots.map((timeSlot, index) => {
          const time = typeof timeSlot === 'string' ? timeSlot : timeSlot.value;
          const displayTime = typeof timeSlot === 'string' ? timeSlot : timeSlot.label;

          return (
            <SketchBtn
              key={index}
              variant={getTimeSlotVariant(timeSlot)}
              size="small"
              onClick={() => handleTimeSelect(timeSlot)}
              disabled={disabledTimes.includes(time)}
              style={{
                opacity: disabledTimes.includes(time) ? 0.5 : 1,
                position: 'relative'
              }}
            >
              <HatchPattern
                opacity={currentSelectedTimes.includes(time) ? 0.6 : 0.4}
              />
              {displayTime}
            </SketchBtn>
          );
        })}
      </div>
    </div>
  );
};

// 메모 입력 컴포넌트
export const MemoSelector = ({ value, onChange, messages = {} }) => {
  return (
    <div className="form-step"
      style={{
        marginTop: "20px",
        marginBottom: "0"
      }}
    >
      <div className="step-label">
        <span className="step-number">4</span>
        {messages.memoLabel || 'Memo'}
      </div>
      <textarea
        className="memo-textarea"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={messages.memoPlaceholder || '추가 요청사항이나 메모를 입력해주세요...'}
        rows={3}
        style={{
          width: '100%',
          padding: '12px',
          border: '2px solid #e5e7eb',
          borderRadius: '8px',
          fontSize: '14px',
          fontFamily: 'inherit',
          resize: 'vertical',
          minHeight: '80px',
          boxSizing: 'border-box'
        }}
      />
      {value && (
        <div style={{
          marginTop: '4px',
          fontSize: '12px',
          color: '#6b7280',
          textAlign: 'right'
        }}>
          {value.length} / 500
        </div>
      )}
    </div>
  );
};

export const PickupSelector = ({ value, onChange, messages = {}, onBookerChange, onEntranceChange, selectedEntrance = '' }) => {

  const { user } = useAuth();
  const { get } = useMsg();

  // booker 값을 별도 state로 관리 (초기값은 user.nickname)
  const [bookerValue, setBookerValue] = useState(user?.nickname || '');

  useEffect(() => {

    onBookerChange(bookerValue);

  }, []);

  // onChange 핸들러를 useCallback으로 최적화
  const handleBookerChange = useCallback((e) => {
    const newValue = e.target.value;
    setBookerValue(newValue);
    onBookerChange?.(newValue);
  }, [onBookerChange]);

  //입구 선택
  const handleEntranceChange = useCallback((e) => {
    const newValue = e.target.value;
    onEntranceChange?.(newValue);
  }, [onEntranceChange]);

  return (
    <div className="form-step"
      style={{
        marginTop: "20px",
        marginBottom: "0"
      }}
    >
      <div className="step-label" style={{ display: 'none' }}>
        <span className="step-number">4</span>
        {messages.pickupLabel || '픽업 서비스'}
      </div>
      <div className="pickup-option">
        <label
          className="pickup-checkbox"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: value ? '#fef3c7' : '#f9fafb',
            borderColor: value ? '#f59e0b' : '#e5e7eb',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        >
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          <span>
            {messages.pickupOption || '픽업 서비스 이용'}
          </span>
        </label>
        <div></div>

        {value && (
          <SketchDiv className="reserve-info" style={{ marginTop: '5px' }}>
            <div className="summary-item" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span className="summary-label">{messages['bookerLabel']}</span>
              <input
                type="text"
                value={bookerValue}
                onChange={handleBookerChange}
                placeholder={'Booker'}
                style={{
                  flex: 1,
                  padding: '5px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* ✅ 입구 선택 드롭다운 추가 */}
            <div className="summary-item" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginTop: '8px'
            }}>
              <span className="summary-label">{get('entranceLabel') || '장소'}:</span>
              <select
                value={selectedEntrance}
                onChange={handleEntranceChange}
                style={{
                  flex: 1,
                  padding: '5px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: 'white',
                  boxSizing: 'border-box'
                }}
              >
                <option value="">{get('entranceSelect') || '선택하세요'}</option>
                <option value="1">{get('ENTRANCE_MARKER_1') || '1번 입구'}</option>
                <option value="2">{get('ENTRANCE_MARKER_2')|| '2번 입구'}</option>
              </select>
            </div>
          </SketchDiv>
        )}

        {value && (
          <div style={{
            marginTop: '8px',
            padding: '8px 12px',
            backgroundColor: '#eff6ff',
            border: '1px solid #dbeafe',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#1e40af',
            lineHeight: '1.4'
          }}>
            <div style={{ fontSize: '1rem', marginBottom: '0.8rem' }}>[{messages.pickupInfo}]</div>
            {messages.pickupInfo1}<br></br>
            {messages.pickupInfo2}<br></br>
            {messages.pickupInfo3}<br></br>
            <div style={{ marginTop: '1rem', fontWeight: 'bold' }}>{messages.pickupInfo4}</div>
          </div>
        )}
      </div>
    </div>
  );
};


export const MenuSelect = ({ venue_id, value, onChange, messages = {} }) => {

  const [menuList, setMenuList] = useState([]);
  const { get } = useMsg();

  console.log('[DBG-MENUSELECT]', messages)

  useEffect(() => {
    if (!venue_id) return;

    const fetchMenuList = async () => {
      try {
        const res = await ApiClient.postForm("/api/getMenuItemList", { venue_id });
        setMenuList(res.data || []);
      } catch (err) {
        console.error("메뉴 목록 조회 실패:", err);
        setMenuList([]);
      }
    };

    fetchMenuList();
  }, [venue_id]);

  // 기본 옵션 + API 데이터
  const options = [
    { item_id: -1, name: messages.defaultItem, price: 0, description: "" },
    ...menuList,
  ];

  // value → 옵션 찾기 (타입 불일치 확인 위해 String 비교)
  const selectedOption =
    options.find((opt) => String(opt.item_id) === String(value)) || options[0];

  // ✅ 디버깅 로그
  console.log("==== MenuSelect Debug ====");
  console.log("prop value:", value, "(", typeof value, ")");
  console.log("options:", options.map((o) => `${o.item_id}:${typeof o.item_id}`));
  console.log("selectedOption:", selectedOption);

  return (
    <div
      style={{
        border: "1px solid rgb(96 96 96);",
        borderRadius: "8px",
        padding: "23px 0px",
        marginTop: "12px",
        backgroundColor: "#fff",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "6px",
          fontSize: "14px",
          color: "#333",
          fontFamily: "'BMHanna', 'Comic Sans MS', cursive, sans-serif"        
        }}
      >
        {get('COURSE')}
      </label>

      <Select
        options={options}
        value={selectedOption}
        onChange={(opt) => {
          const selected = {
            item_id: opt.item_id,
            duration: opt.duration || null,
            label: `${opt.name} (${opt.price.toLocaleString("vi-VN")} VND)`,
          };
          console.log("👉 선택된 메뉴:", selected);
          onChange?.(selected);
        }}
        placeholder="메뉴를 선택하세요"
        getOptionValue={(opt) => String(opt.item_id)}
        menuPosition="fixed"
        menuPortalTarget={document.body}
        isSearchable={false}  // ✅ 키패드 차단
        styles={{
          menuPortal: (base) => ({ ...base, zIndex: 2147483647 }),
          menuList: (base) => ({
            ...base,
            fontFamily: "BMHanna, sans-serif",
            maxHeight: 240,
          }),
          option: (base, state) => ({
            ...base,
            fontFamily: "BMHanna, sans-serif",
            backgroundColor: state.isSelected
              ? "#00f0ff" // ✅ 선택된 항목 배경 (연한 하늘색)
              : state.isFocused
              ? "#f9fafb" // ✅ hover 시 회색톤 강조
              : "#fff",   // 기본 흰색
            color: state.isSelected ? "#111" : "#333", // 선택 시 살짝 진하게
            fontWeight: state.isSelected ? "600" : "400",
            cursor: "pointer",
            transition: "background-color 0.2s ease",
          }),
          control: (base, state) => ({
            ...base,
            borderColor: state.isFocused ? "#3b82f6" : "#ccc",
            boxShadow: state.isFocused ? "0 0 0 1px #3b82f6" : "none",
            "&:hover": { borderColor: "#3b82f6" },
            fontFamily: "BMHanna, sans-serif",
          }),
        }}
        formatOptionLabel={(opt, { context }) => {
          if (opt.item_id === -1) return messages.defaultItem || "기본";
          if (context === "menu") {
            return (
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: 500 }}>{opt.name}</span>
                  <span style={{ color: "#666" }}>
                    {opt.price.toLocaleString("vi-VN")} VND
                  </span>
                </div>
                <small style={{ color: "#888", fontSize: "12px" }}>
                  {opt.description}
                </small>
              </div>
            );
          }
          return `${opt.name} (${opt.price.toLocaleString("vi-VN")} VND)`;
        }}
      />
    </div>
  );
};





export const UseStaff = ({ value, onChange, messages = {} }) => {

  return (
    <div className="form-step"
      style={{
        marginTop: "20px",
        marginBottom: "0"
      }}
    >
      <div className="step-label" style={{ display: 'none' }}>
        <span className="step-number">4</span>
        {messages.pickupLabel || '픽업 서비스'}
      </div>
      <div className="usestaff-option">
        <label
          className="usestaff-checkbox"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            padding: '12px',
            border: '2px solid #e5e7eb',
            borderRadius: '8px',
            backgroundColor: value ? '#fef3c7' : '#f9fafb',
            borderColor: value ? '#f59e0b' : '#e5e7eb',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
        >
          <input
            type="checkbox"
            onChange={(e) => onChange(e.target.checked)}
            checked={value}
            style={{
              width: '16px',
              height: '16px',
              cursor: 'pointer'
            }}
          />
          <span>
            {messages.staffLabel}
          </span>
        </label>
        <div></div>
      </div>
    </div>
  );
};

// 통합 예약 폼 컴포넌트 (Duration 모드 지원)
export const ReservationForm = ({
  venue_id,
  cat_id,
  menuList,
  attendee,
  onAttendeeChange,
  baseDate,
  maxDay = 1,
  selectedDate,
  onDateSelect,
  timeSlots,
  selectedTime, // 기존 API 유지
  selectedTimes, // 새로운 API 추가
  onTimeSelect,
  memo, // 메모 값 추가
  onMemoChange, // 메모 변경 핸들러 추가
  onBookerChange,
  disabledDates = [],
  disabledTimes = [],
  availableTimes = new Set(),
  timeSelectionMode = 'single',
  allowDrag = false,
  useDurationMode = false, // 새로운 prop
  maxDuration = 6, // Duration 모드의 최대 시간
  messages = {}, // 다국어 메시지 추가,
  pickupService,
  setPickupService,
  menuItem,
  setMenuItem,
  useStaffService,
  setUseStaffService,
  selectedEntrance,
  onEntranceChange,
  getTargetLabel = () => { },
  navigateToPageWithData,
  PAGES
}) => {

  console.log("cat_id 값:", cat_id);
  const { get } = useMsg();

  // ReservationForm 내부
  const [menuDuration, setMenuDuration] = useState(null);

 

   // 최종 duration: 메뉴 duration 우선, 없으면 선택값

   const convertMinutesToHours = (minutes) => {
    if (!minutes) return null;
    // 분 → 시간 (소수)
    const hours = minutes / 60;
    // 0.5 단위로 반올림
    return Math.round(hours * 2) / 2;
  };

   // 메뉴 아이템 선택될 때 duration 반영
   useEffect(() => {
    if (menuItem?.duration) {
      const hours = convertMinutesToHours(menuItem.duration);
      setMenuDuration(hours);
    } else {
      setMenuDuration(null);
    }
  }, [menuItem]);

  const handleMenuChange = (menu) => {
    setMenuItem(menu);
  
    // 이미 startTime이 선택돼 있다면 새 duration 반영
    if (selectedTimes?.startTime && menu?.duration) {
      const hours = convertMinutesToHours(menu.duration);
      onTimeSelect({
        startTime: selectedTimes.startTime,
        duration: hours,
        endTime: getEndTimeDisplay(selectedTimes.startTime, hours),
      });
    }
  };

  useEffect(() => {
    if (menuItem?.duration && selectedTimes?.startTime) {
      const hours = convertMinutesToHours(menuItem.duration);
      onTimeSelect({
        startTime: selectedTimes.startTime,
        duration: hours,
        endTime: getEndTimeDisplay(selectedTimes.startTime, hours),
      });
    }
  }, [menuItem, selectedTimes?.startTime]);
  

     // onTimeSelect 호출 래퍼
  const handleTimeSelectWithMenu = (selection) => {
    const appliedDuration = menuItem?.duration
      ? convertMinutesToHours(menuItem.duration)
      : selection.duration ?? null;

    onTimeSelect({
      ...selection,
      duration: appliedDuration,   // duration만 확정해서 전달
    });

    console.log('hts', appliedDuration);
  };

  return (
    <div className="form-section">


      <SketchDiv className="reserve-info">
        <div className="summary-item">
          <span className="summary-label">{messages['targetLabel']}:</span>
          <span className="summary-value">{getTargetLabel()}</span>
        </div>
      </SketchDiv>

      <AttendeeSelector
        value={attendee}
        onChange={onAttendeeChange}
        messages={messages}
      />

      <WeeklyTableComponent
        baseDate={baseDate}
        maxDay={maxDay}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        disabledDates={disabledDates}
        messages={messages}
        navigateToPageWithData={navigateToPageWithData}
        PAGES={PAGES}
      />

      {useDurationMode ? (
        <DurationBasedTimeSelector
          baseDate={selectedDate ? new Date(selectedDate) : new Date()}
          timeSlots={timeSlots}
          selectedStartTime={selectedTimes?.startTime || ''}
          selectedDuration={selectedTimes?.duration || null}
          onTimeSelect={handleTimeSelectWithMenu}
          disabledTimes={disabledTimes}
          availableTimes={availableTimes}
          maxDuration={maxDuration}
          messages={messages}
          navigateToPageWithData={navigateToPageWithData}
          PAGES={PAGES}
          menuDuration={menuDuration} // ✅ 여기서만 추가
        />
      ) : null}

      {messages.rev_target !== 'staff' && (
        <UseStaff
          value={useStaffService}
          onChange={setUseStaffService}
          messages={{
            staffLabel: messages['staff_info'] || '옵션',
          }}
        />
      )}

 {cat_id == 1 && (
      <PickupSelector
        value={pickupService}
        onChange={setPickupService}
        onBookerChange={onBookerChange}
        onEntranceChange={onEntranceChange}
        selectedEntrance={selectedEntrance}
        messages={{
          bookerLabel: messages['bookerLabel'],
          pickupLabel: messages['pickupLabel'] || '옵션',
          pickupOption: messages['pickupOption'] || '픽업 서비스 이용',
          pickupInfo: messages['pickupInfo'],
          pickupInfo1: messages['pickupInfo1'],
          pickupInfo2: messages['pickupInfo2'],
          pickupInfo3: messages['pickupInfo3'],
          pickupInfo4: messages['pickupInfo4'],
        }}
      />
       )}

      <MenuSelect
        venue_id={venue_id}
        menuList={menuList}
        value={menuItem.item_id}
        onChange={handleMenuChange}
        messages={{
          defaultItem: messages['defaultItem'] || '기본2',
          menuLabel: get('MENU') || '코스',
        }}
      />

      <MemoSelector
        value={memo}
        onChange={onMemoChange}
        messages={{
          menuLabel: get('Reservation.MemoLabel') || '메모',
        }}
      />
    </div>
  );
};