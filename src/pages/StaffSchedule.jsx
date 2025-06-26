import React, { useState, useRef } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import dayjs from 'dayjs';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dates = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const staffList = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Anna Smith' },
  { id: 3, name: 'James Brown' },
];

const StaffSchedule = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [month, setMonth] = useState(dayjs().month());
  const [year, setYear] = useState(dayjs().year());
  const [selectedDate, setSelectedDate] = useState(null);

  const calendarScrollRef = useRef(null);

  const firstDay = dayjs(`${year}-${month + 1}-01`);
  const startDay = firstDay.day();
  const daysInMonth = firstDay.daysInMonth();
  const today = dayjs();

  const prevMonth = month === 0 ? 11 : month - 1;
  const prevYear = month === 0 ? year - 1 : year;
  const prevMonthLastDay = dayjs(`${prevYear}-${prevMonth + 1}-01`).daysInMonth();

  const calendarCells = [];
  for (let i = 0; i < startDay; i++) {
    calendarCells.push({
      date: dayjs(`${prevYear}-${prevMonth + 1}-${prevMonthLastDay - startDay + i + 1}`),
      isCurrentMonth: false
    });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push({
      date: dayjs(`${year}-${month + 1}-${d}`),
      isCurrentMonth: true
    });
  }
  const nextMonth = month === 11 ? 0 : month + 1;
  const nextYear = month === 11 ? year + 1 : year;
  for (let i = calendarCells.length; i < 42; i++) {
    calendarCells.push({
      date: dayjs(`${nextYear}-${nextMonth + 1}-${i - daysInMonth - startDay + 1}`),
      isCurrentMonth: false
    });
  }

  const handlePrevMonth = () => {
    let newMonth = month - 1;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    setTimeout(() => {
      if (calendarScrollRef.current) calendarScrollRef.current.scrollTop = 0;
    }, 0);
  };
  const handleNextMonth = () => {
    let newMonth = month + 1;
    let newYear = year;
    if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
    setTimeout(() => {
      if (calendarScrollRef.current) calendarScrollRef.current.scrollTop = 0;
    }, 0);
  };

  const handleGoToThisWeek = () => {
    const todayIdx = calendarCells.findIndex(cell => cell.date.isSame(today, 'date'));
    if (todayIdx !== -1) {
      setSelectedDate(today);
    }
  };

  return (
    <>
      <style jsx="true">{`
        .schedule-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .month-row {
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 1.1rem 0 0.7rem 0;
          gap: 0.7rem;
        }
        .calendar-scroll {
          max-height: 6.8rem;
          overflow-y: auto;
          scroll-snap-type: y mandatory;
        }
        .calendar-2weeks {
          display: grid;
          grid-template-rows: repeat(2, 1fr);
          height: 6.8rem;
          scroll-snap-align: start;
        }
        .calendar-row {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.3rem;
        }
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          margin-bottom: 1.2rem;
        }
        .calendar-day {
          text-align: center;
          font-size: 0.98rem;
          font-weight: 500;
          color: #444;
        }
        .calendar-date {
          background: #fff;
          border: 1.5px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
          font-size: 1.05rem;
          padding: 0.5rem 0;
          min-width: 2.1rem;
          min-height: 2.1rem;
          cursor: pointer;
          transition: border 0.2s, color 0.2s, opacity 0.2s, background 0.2s;
        }
        .calendar-date.today {
          border: 2.2px solid #3bb0ff;
        }
        .calendar-date.selected {
          border: 2.2px solid #222;
          background: #e6f7ff;
        }
        .calendar-date.other-month {
          color: #b0b0b0;
          opacity: 0.55;
          background: #f7f7f7;
        }
        .assign-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .staff-row {
          display: flex;
          align-items: center;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          margin-bottom: 0.6rem;
          padding: 0.6rem 0.8rem;
        }
        .staff-name {
          flex: 1;
          font-size: 1.02rem;
        }
        .staff-assign-btn {
          min-width: 38px;
          font-size: 1.1rem;
          padding: 0.18rem 0.5rem;
        }
        .month-nav-btn {
          background: none !important;
          color: #222 !important;
          box-shadow: none !important;
          padding: 0.08rem 0.5rem !important;
          min-width: 0;
          font-size: 0.92rem !important;
          height: 1.7rem;
          line-height: 1.1;
        }
        .month-label {
          font-size: 1.13rem;
          font-weight: 700;
          margin: 0 0.7rem;
          letter-spacing: 0.01em;
          flex-shrink: 0;
        }
        .calendar-nav-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-bottom: 0.3rem;
        }
      `}</style>
      <div className="schedule-container">
        <SketchHeader
          title="Staff Schedule"
          showBack={true}
          onBack={goBack}
        />
        <div className="month-row">
          <SketchBtn variant="event" size="small" className="month-nav-btn" onClick={handlePrevMonth}>Previous</SketchBtn>
          <div className="month-label">{dayjs().month(month).format('MMMM')} {year}</div>
          <SketchBtn variant="event" size="small" className="month-nav-btn" onClick={handleNextMonth}>Next</SketchBtn>
        </div>
        <div className="calendar">
          {days.map(day => (
            <div key={day} className="calendar-day">{day}</div>
          ))}
        </div>
        <div className="calendar-scroll" ref={calendarScrollRef}>
          {Array.from({ length: Math.ceil(calendarCells.length / 14) }).map((_, twoWeekIdx) => (
            <div className="calendar-2weeks" key={twoWeekIdx}>
              {[0, 1].map(rowIdx => (
                <div className="calendar-row" key={rowIdx}>
                  {calendarCells.slice(twoWeekIdx * 14 + rowIdx * 7, twoWeekIdx * 14 + (rowIdx + 1) * 7).map((cell, idx) => (
                    <div
                      key={idx + rowIdx * 7 + twoWeekIdx * 14}
                      className={
                        'calendar-date' +
                        (cell.date.isSame(today, 'date') ? ' today' : '') +
                        (selectedDate && cell.date.isSame(selectedDate, 'date') ? ' selected' : '') +
                        (!cell.isCurrentMonth ? ' other-month' : '')
                      }
                      onClick={() => setSelectedDate(cell.date)}
                    >
                      {cell.date.date()}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
        </div>
        
        <div className="assign-title">Assign Shifts</div>
        {staffList.map(staff => (
          <div key={staff.id} className="staff-row">
            <div className="staff-name">{staff.name}</div>
            <SketchBtn variant="event" size="small" className="staff-assign-btn">🗓️</SketchBtn>
          </div>
        ))}
      </div>
    </>
  );
};

export default StaffSchedule; 