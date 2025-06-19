import React, { useState, useEffect } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';

import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import ApiClient from '@utils/ApiClient';

// 새로운 컴포넌트 import
import { 
  ReservationForm, 
  generateTimeSlots,
  weeklyTableStyles  // CSS 스타일
} from '@components/ReservationComponents';

const ReservationPage = ({ navigateToPageWithData, PAGES, ...otherProps }) => {
  const { target, id } = otherProps || {};

  // 상태들
  const [attendee, setAttendee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [baseDate] = useState(new Date()); // 오늘 날짜 고정
  const [scheduleData, setScheduleData] = useState({});
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);

  // 시간 슬롯 생성
  const timeSlots = generateTimeSlots();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (target && id) {
      loadScheduleData();
    }
  }, [target, id]);

  const loadScheduleData = async () => {
    // 스케줄 데이터 로딩 로직
    console.log('load',target, id);

    // ApiClient.get('/api/schedule');
  };

  const handleDateSelect = (fullDate, dayNumber) => {
    setSelectedDate(fullDate);
    setSelectedTime('');
  };

  const handleReserve = () => {
    // 예약 처리 로직
  };

  return (
    <>
      <style jsx="true">{`
        ${weeklyTableStyles}  /* 주간 테이블 CSS 추가 */
        
        
        .sketch-btn.disabled {
          opacity: 0.4 !important;
          background-color: #f3f4f6 !important;
          color: #9ca3af !important;
          cursor: not-allowed !important;
          pointer-events: none !important;
        }

        .sketch-btn.disabled:hover {
          background-color: #f3f4f6 !important;
          border-color: #e5e7eb !important;
        }

        .reservation-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
        }

        .header {
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          position: relative;
        }

        .back-button {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
        }

        .header-content {
          text-align: center;
        }

        .main-title {
          font-size: 1.2rem;
          font-weight: bold;
          margin: 0;
          color: #1f2937;
        }

        .sub-title {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .form-section {
          padding: 1.5rem;
        }

        .form-step {
          margin-bottom: 2rem;
        }

        .step-number {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 1.5rem;
          height: 1.5rem;
          background-color: #1f2937;
          color: white;
          border-radius: 50%;
          font-size: 0.8rem;
          font-weight: bold;
          margin-right: 0.5rem;
        }

        .step-label {
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.75rem;
          display: flex;
          align-items: center;
        }

        .attendee-select {
          height: 40px;
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #1f2937;
          background-color: white;
          cursor: pointer;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.25rem;
          margin-top: 0.75rem;
        }

        .calendar-day {
          aspect-ratio: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
        }

        .calendar-header {
          font-weight: bold;
          color: #6b7280;
        }

        .calendar-date {
          cursor: pointer;
          border: 2px solid transparent;
        }

        .calendar-date:hover {
          border-color: #1f2937;
        }

        .calendar-date.selected {
          background-color: #1f2937;
          border-radius: 2px;
          color: white;
        }

        .calendar-date.disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .time-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 0.75rem;
          margin-top: 0.75rem;
        }

        .reserve-section {
          padding: 0 1.5rem 1.5rem;
        }

        .form-step-3 { 
          padding: 8px;
          border: 1px solid #333;
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
        }

        .loading-overlay {
          position: relative;
          opacity: 0.6;
          pointer-events: none;
        }

        @media (max-width: 480px) {
          .reservation-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="reservation-container">
        <SketchHeader
          title={'Reservation'}
          showBack={true}
          onBack={() => console.log('뒤로가기')}
          rightButtons={[]}
        />

        <ReservationForm
          attendee={attendee}
          onAttendeeChange={setAttendee}
          baseDate={baseDate}
          selectedDate={selectedDate}
          onDateSelect={handleDateSelect}
          timeSlots={timeSlots}
          selectedTime={selectedTime}
          onTimeSelect={setSelectedTime}
          disabledDates={[]} // 비활성화할 날짜들
          disabledTimes={[]} // 비활성화할 시간들
        />

        <div className="reserve-section">
          <SketchBtn 
            className="full-width" 
            variant="event" 
            size="normal" 
            onClick={handleReserve}
            disabled={!attendee || !selectedDate || !selectedTime}
          >
            RESERVE
            <HatchPattern opacity={0.4} />
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default ReservationPage;