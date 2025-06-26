import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const dates = [1,2,3,4,5,6,7,8,9,10,11,12,13];
const staffList = [
  { id: 1, name: 'John Doe' },
  { id: 2, name: 'Anna Smith' },
  { id: 3, name: 'James Brown' },
];

const StaffSchedule = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [month, setMonth] = useState('October');
  const [year, setYear] = useState(2023);

  return (
    <>
      <style jsx="true">{`
        .schedule-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .month-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 1.1rem 0 0.7rem 0;
        }
        .calendar {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 0.3rem;
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
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          text-align: center;
          font-size: 1.05rem;
          padding: 0.5rem 0;
          min-width: 2.1rem;
          min-height: 2.1rem;
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
      `}</style>
      <div className="schedule-container">
        <SketchHeader
          title="Staff Schedule"
          showBack={true}
          onBack={goBack}
        />
        <div className="month-row">
          <SketchBtn variant="event" size="small">Previous</SketchBtn>
          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{month} {year}</div>
          <SketchBtn variant="event" size="small">Next</SketchBtn>
        </div>
        <div className="calendar">
          {days.map(day => (
            <div key={day} className="calendar-day">{day}</div>
          ))}
          {dates.map(date => (
            <div key={date} className="calendar-date">{date}</div>
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