// 주간 테이블 CSS 스타일 (이 스타일을 부모 컴포넌트에 추가하세요)
export const weeklyTableStyles = `
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
`;

import React, { useState } from 'react';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern';
import SketchDiv from '@components/SketchDiv';

// 주간 테이블 생성 유틸리티 함수 (오늘부터 7일간)
export const generateWeeklyDays = (baseDate) => {
  const today = new Date(baseDate);
  const weekDays = [];
  const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
  
  // 오늘부터 시작해서 7일간 생성
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    const dayOfWeek = currentDate.getDay(); // 0=일요일, 1=월요일, ...
    
    weekDays.push({
      dayName: dayHeaders[dayOfWeek],
      date: currentDate.getDate(),
      fullDate: currentDate.toISOString().split('T')[0], // YYYY-MM-DD 형태
      isToday: i === 0, // 첫 번째 날이 오늘
      dayOfWeek: dayOfWeek
    });
  }
  
  return weekDays;
};

// 년월 표시 함수
export const getYearMonthDisplay = (date) => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${year}.${month}`;
};

// 시간 슬롯 생성 함수
export const generateTimeSlots = () => {
  const timeSlots = [];
  for (let hour = 18; hour <= 24; hour++) {
    const timeString = hour.toString().padStart(2, '0') + ':00';
    timeSlots.push(timeString);
  }
  return timeSlots;
};

// 1. 년월 표시 컴포넌트 (선택 불가, 표시만)
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

// 2. 참석자 선택 컴포넌트
export const AttendeeSelector = ({ value, onChange }) => {
  const attendeeOptions = [
    { value: '', label: 'Select number of people' },
    { value: '1', label: '1 person' },
    { value: '2', label: '2 people' },
    { value: '3', label: '3 people' },
    { value: '4', label: '4 people' },
    { value: '5', label: '5+ people' }
  ];

  return (
    <div className="form-step">
      <div className="step-label">
        <span className="step-number">1</span>
        Attendee
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

// 3. 주간 테이블 컴포넌트
export const WeeklyTableComponent = ({ 
  baseDate, 
  selectedDate, 
  onDateSelect, 
  disabledDates = [] 
}) => {
  const weekDays = generateWeeklyDays(baseDate);
  
  const handleDateSelect = (dayInfo) => {
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
        Select Date
      </div>
      
      <YearMonthDisplay date={baseDate} />
      
      <div className="weekly-table">
        {weekDays.map((dayInfo, index) => (
          <div 
            key={index} 
            className={`weekly-day ${isSelected(dayInfo) ? 'selected' : ''} ${
              isDateDisabled(dayInfo) ? 'disabled' : ''
            } ${dayInfo.isToday ? 'today' : ''}`}
            onClick={() => handleDateSelect(dayInfo)}
            style={{
              opacity: isDateDisabled(dayInfo) ? 0.3 : 1,
              cursor: isDateDisabled(dayInfo) ? 'not-allowed' : 'pointer'
            }}
          >
            <div className="day-name">{dayInfo.dayName}</div>
            <div className="day-date">{dayInfo.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 4. 시간 선택 컴포넌트
export const TimeSlotSelector = ({ 
  timeSlots = [], 
  selectedTime, 
  onTimeSelect, 
  disabledTimes = [] 
}) => {
  const handleTimeSelect = (time) => {
    if (!disabledTimes.includes(time)) {
      onTimeSelect(time);
    }
  };

  return (
    <div className="form-step-3">
      <div className="step-label">
        <span className="step-number">3</span>
        Choose Time
      </div>
      <div className="time-grid">
        {timeSlots.map((time, index) => (
          <SketchBtn
            key={index}
            variant={selectedTime === time ? 'accent' : 'secondary'}
            size="small"
            onClick={() => handleTimeSelect(time)}
            disabled={disabledTimes.includes(time)}
            style={{
              opacity: disabledTimes.includes(time) ? 0.5 : 1
            }}
          >
            <HatchPattern opacity={0.4} />
            {time}
          </SketchBtn>
        ))}
      </div>
    </div>
  );
};

// 5. 통합 예약 폼 컴포넌트
export const ReservationForm = ({
  attendee,
  onAttendeeChange,
  baseDate, // year, month 대신 baseDate 사용
  selectedDate,
  onDateSelect,
  timeSlots,
  selectedTime,
  onTimeSelect,
  disabledDates = [],
  disabledTimes = []
}) => {
  return (
    <div className="form-section">
      <AttendeeSelector 
        value={attendee}
        onChange={onAttendeeChange}
      />
      
      <WeeklyTableComponent
        baseDate={baseDate}
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        disabledDates={disabledDates}
      />
      
      <TimeSlotSelector
        timeSlots={timeSlots}
        selectedTime={selectedTime}
        onTimeSelect={onTimeSelect}
        disabledTimes={disabledTimes}
      />


        <div style={{ marginTop:"15px", marginBottom: "5px", padding: "5px" }}>
            <div className="step-label">
                <span className="step-number">4</span>
                Note
            </div>

            <SketchDiv>
                <textarea 
                placeholder="메모를 입력하세요..."
                style={{
                    width: "100%",
                    minHeight: "80px",
                    border: "none",
                    background: "transparent",
                    resize: "vertical",
                    padding: "10px"
                }}
                />
            </SketchDiv>
        </div>

    </div>
  );
};