import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';



const ReservationPage = ({ navigateToPageWithData, PAGES, ...otherProps }) => {
  const [attendee, setAttendee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // 달력 데이터 (예시)
  const calendarDays = [
    'Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa',
    '', '', '', '', '', 1, 2,
    3, 4, 5, 6, 7, 8, 9,
    10, 11, 12, 13, 14, 15, 16,
    17, 18, 19, 20, 21, 22, 23,
    24, 25, 26, 27, 28, 29, 30,
    31, '', '', '', '', '', ''
  ];

  // 시간 옵션
  const timeSlots = [
    '20:00', '20:30', '21:00',
    '21:30', '22:00', '22:30'
  ];

  const handleDateSelect = (date) => {
    if (date && typeof date === 'number') {
      setSelectedDate(date);
    }
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
  };

  const handleReserve = () => {
    console.log('Reservation:', { attendee, selectedDate, selectedTime });

    navigateToPageWithData(PAGES.RESERVATION_SUM, {attendee, selectedDate, selectedTime})
  };

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <>
      <style jsx>{`
        .reservation-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          position: relative;

          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
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

          //  border-top-left-radius: 12px 7px;
          // border-top-right-radius: 6px 14px;
          // border-bottom-right-radius: 10px 5px;
          // border-bottom-left-radius: 8px 11px;
          // width: 100%;
          // padding: 0.75rem;
          // border: 1px solid #1f2937;
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
          /* border-radius: 3px; */
          background-color: white;
          cursor: pointer;

          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
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
          color: white;
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


        @media (max-width: 480px) {
          .reservation-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="reservation-container">
        {/* Header */}
         <SketchHeader
                  title={'Reservation'}
                  showBack={true}
                  onBack={() => console.log('뒤로가기')}
                  rightButtons={[]}
                />
        {/* <div className="header">
          <button className="back-button">
            &lt;
          </button>
          <div className="header-content">
            <h1 className="main-title">Reserve Your Night Out</h1>
            <p className="sub-title">Hanoi Night Market</p>
          </div>
        </div> */}

        {/* Form Section */}
        <div className="form-section">
          {/* Step 1: Attendee */}
          <div className="form-step">
            <div className="step-label">
              <span className="step-number">1</span>
              Attendee
            </div>
            <select 
              className="attendee-select"
              value={attendee}
              onChange={(e) => setAttendee(e.target.value)}
            >
              <option value="">Select number of people</option>
              <option value="1">1 person</option>
              <option value="2">2 people</option>
              <option value="3">3 people</option>
              <option value="4">4 people</option>
              <option value="5">5+ people</option>
            </select>
          </div>

          {/* Step 2: Select Date */}
          <div className="form-step">
            <div className="step-label">
              <span className="step-number">2</span>
              Select
            </div>
            <div className="calendar-grid">
              {calendarDays.map((day, index) => (
                <div 
                  key={index} 
                  className={`calendar-day ${
                    index < 7 ? 'calendar-header' : 
                    day && typeof day === 'number' ? 'calendar-date' : ''
                  } ${selectedDate === day ? 'selected' : ''}`}
                  onClick={() => handleDateSelect(day)}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Step 3: Choose Time */}
          <div className="form-step">
            <div className="step-label">
              <span className="step-number">3</span>
              Choose
            </div>
            <div className="time-grid">
              {timeSlots.map((time, index) => (
                <SketchBtn
                  key={index}
                  variant={selectedTime === time ? 'accent' : 'secondary'}
                  size="small"
                  onClick={() => handleTimeSelect(time)}
                >
                  {time}
                </SketchBtn>
              ))}
            </div>
          </div>
        </div>

        {/* Reserve Button */}
        <div className="reserve-section">
          <SketchBtn 
            className="full-width" 
            variant="primary" 
            size="large"
            onClick={handleReserve}
          >
            RESERVE
            <HatchPattern opacity={0.1} />
          </SketchBtn>
        </div>

      </div>
    </>
  );
};

export default ReservationPage;