import React, { useState, useRef, useCallback, useEffect } from 'react';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import HatchPattern from '@components/HatchPattern';


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

 
// 주간 테이블 생성 유틸리티 함수 (오늘부터 7일간)
export const generateWeeklyDays = (baseDate) => {
  const today = new Date(baseDate);
  const weekDays = [];
  const dayHeaders = ['일', '월', '화', '수', '목', '금', '토'];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() + i);
    
    const dayOfWeek = currentDate.getDay();
    
    weekDays.push({
      dayName: dayHeaders[dayOfWeek],
      date: currentDate.getDate(),
      fullDate: currentDate.toISOString().split('T')[0],
      isToday: i === 0,
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

// Duration 관련 유틸리티 함수들
const getEndTime = (startTime, duration) => {
  const [hour] = startTime.split(':').map(Number);
  const endHour = hour + duration;
  return `${endHour.toString().padStart(2, '0')}:00`;
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
  startTime, 
  maxDuration, 
  selectedDuration, 
  onDurationChange,
  disabledTimes = [],
  messages = {} // 다국어 메시지 추가
}) => {
  if (!startTime) return null;

  const durations = [];
  for (let i = 1; i <= maxDuration; i++) {
    durations.push(i);
  }

  return (
    <div className="duration-selector">
      <div className="duration-label">
        {startTime}{messages.durationSelectLabel || '부터 이용 시간 선택'}
      </div>
      <div className="duration-grid">
        {durations.map(duration => {
          const isDisabled = !canSelectDuration(startTime, duration, disabledTimes);
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
          {messages.reservationTimeLabel || '예약 시간'}: {startTime} - {getEndTime(startTime, selectedDuration)}
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
  selectedDate, 
  onDateSelect, 
  disabledDates = [],
  messages = {} // 다국어 메시지 추가
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
        {messages.selectDateLabel || 'Select Date'}
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

// Duration-based 시간 선택 컴포넌트 (새로운 방식)
export const DurationBasedTimeSelector = ({ 
  timeSlots = [], 
  selectedStartTime = '', 
  selectedDuration = null,
  onTimeSelect, 
  disabledTimes = [],
  maxDuration = 6, // 최대 6시간까지 선택 가능
  messages = {} // 다국어 메시지 추가
}) => {
  const [startTime, setStartTime] = useState(selectedStartTime);
  const [duration, setDuration] = useState(selectedDuration);

  React.useEffect(() => {
    setStartTime(selectedStartTime);
    setDuration(selectedDuration);
  }, [selectedStartTime, selectedDuration]);

  const handleTimeClick = (time) => {
    if (disabledTimes.includes(time)) return;
    
    // 새로운 시작 시간 선택시 기간 초기화
    setStartTime(time);
    setDuration(null);
    
    // 부모 컴포넌트에 시작 시간만 전달
    onTimeSelect({
      startTime: time,
      duration: null,
      endTime: null
    });
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

  const getTimeSlotVariant = (time) => {
    if (disabledTimes.includes(time)) return 'disabled';
    if (startTime === time) return 'accent';
    
    // 선택된 시간 범위 하이라이트
    if (startTime && duration) {
      const [startHour] = startTime.split(':').map(Number);
      const [timeHour] = time.split(':').map(Number);
      
      if (timeHour >= startHour && timeHour < startHour + duration) {
        return 'primary';
      }
    }
    
    return 'secondary';
  };

  return (
    <div className="form-step-3">
      <div className="step-label">
        <span className="step-number">3</span>
        {messages.timeAndDurationLabel || '시간 및 이용시간 선택'}
        {startTime && duration && (
          <div style={{ marginLeft: '10px', fontSize: '12px', color: '#3b82f6' }}>
            {startTime} - {getEndTime(startTime, duration)} ({duration}{messages.hourUnit || '시간'})
          </div>
        )}
      </div>

      <div 
        className="time-grid" 
        style={{ userSelect: 'none' }}
      >
        {timeSlots.map((time, index) => (
          <SketchBtn
            key={index}
            variant={getTimeSlotVariant(time)}
            size="small"
            onClick={() => handleTimeClick(time)}
            disabled={disabledTimes.includes(time)}
            style={{
              opacity: disabledTimes.includes(time) ? 0.5 : 1,
              position: 'relative'
            }}
          >
            <HatchPattern 
              opacity={startTime === time ? 0.6 : 0.4} 
            />
            {time}
          </SketchBtn>
        ))}
      </div>

      <DurationSelector
        startTime={startTime}
        maxDuration={maxDuration}
        selectedDuration={duration}
        onDurationChange={handleDurationChange}
        disabledTimes={disabledTimes}
        messages={messages}
      />

      {startTime && !duration && (
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

  const handleTimeSelect = (time, event) => {
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

  const getTimeSlotVariant = (time) => {
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
        {timeSlots.map((time, index) => (
          <SketchBtn
            key={index}
            variant={getTimeSlotVariant(time)}
            size="small"
            onClick={() => handleTimeSelect(time)}
            disabled={disabledTimes.includes(time)}
            style={{
              opacity: disabledTimes.includes(time) ? 0.5 : 1,
              position: 'relative'
            }}
          >
            <HatchPattern 
              opacity={currentSelectedTimes.includes(time) ? 0.6 : 0.4} 
            />
            {time}
          </SketchBtn>
        ))}
      </div>
    </div>
  );
};

// 메모 입력 컴포넌트
export const MemoSelector = ({ value, onChange, messages = {} }) => {
  return (
    <div className="form-step"
          style={{
            marginTop:"20px",
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

export const PickupSelector = ({ value, onChange, messages = {} }) => {
  return (
    <div className="form-step"
          style={{
            marginTop:"20px",
            marginBottom: "0"
          }}
    >
      <div className="step-label" style={{display:'none'}}>
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
            <div style={{ fontSize: '1rem', marginBottom: '0.8rem'}}>[{messages.pickupInfo}]</div>
            {messages.pickupInfo1}<br></br>
            {messages.pickupInfo2}<br></br>
            {messages.pickupInfo3}<br></br>
            <div style={{    marginTop: '1rem', fontWeight: 'bold'}}>{messages.pickupInfo4}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// 통합 예약 폼 컴포넌트 (Duration 모드 지원)
export const ReservationForm = ({
  attendee,
  onAttendeeChange,
  baseDate,
  selectedDate,
  onDateSelect,
  timeSlots,
  selectedTime, // 기존 API 유지
  selectedTimes, // 새로운 API 추가
  onTimeSelect,
  memo, // 메모 값 추가
  onMemoChange, // 메모 변경 핸들러 추가
  disabledDates = [],
  disabledTimes = [],
  timeSelectionMode = 'single',
  allowDrag = false,
  useDurationMode = false, // 새로운 prop
  maxDuration = 6, // Duration 모드의 최대 시간
  messages = {}, // 다국어 메시지 추가,
  pickupService,
  setPickupService,
  getTargetLabel = () => {}
}) => {


console.log(messages)

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
        selectedDate={selectedDate}
        onDateSelect={onDateSelect}
        disabledDates={disabledDates}
        messages={messages}
      />
      
      {useDurationMode ? (
        <DurationBasedTimeSelector
          timeSlots={timeSlots}
          selectedStartTime={selectedTimes?.startTime || ''}
          selectedDuration={selectedTimes?.duration || null}
          onTimeSelect={onTimeSelect}
          disabledTimes={disabledTimes}
          maxDuration={maxDuration}
          messages={messages}
        />
      ) : (
        <TimeSlotSelector
          timeSlots={timeSlots}
          selectedTimes={selectedTimes || selectedTime}
          onTimeSelect={onTimeSelect}
          disabledTimes={disabledTimes}
          selectionMode={timeSelectionMode}
          allowDrag={allowDrag}
          messages={messages}
        />
      )}

    <PickupSelector 
      value={pickupService}
      onChange={setPickupService}
      messages={{
        pickupLabel: messages['pickupLabel'] || '옵션',
        pickupOption: messages['pickupOption'] || '픽업 서비스 이용',
        pickupInfo: messages['pickupInfo'],
        pickupInfo1: messages['pickupInfo1'],
        pickupInfo2: messages['pickupInfo2'],
        pickupInfo3: messages['pickupInfo3'],
        pickupInfo4: messages['pickupInfo4'],
      }}
    />

      <MemoSelector
        value={memo}
        onChange={onMemoChange}
        messages={messages}
      />
    </div>
  );
};