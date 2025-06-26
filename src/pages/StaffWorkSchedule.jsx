import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { Calendar } from 'lucide-react';

const weekData = [
  { day: 'Monday', time: '9:00 AM - 5:00 PM', actions: ['Check In'] },
  { day: 'Tuesday', time: '9:00 AM - 5:00 PM', actions: ['Check Out'] },
  { day: 'Wednesday', time: 'Unavailable', actions: ['Request Change'] },
];

const StaffWorkSchedule = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [view, setView] = useState('week');

  return (
    <>
      <style jsx="true">{`
        .workschedule-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .toggle-row {
          display: flex;
          justify-content: flex-end;
          gap: 0.7rem;
          margin: 1.1rem 0 0.7rem 0;
        }
        .schedule-card {
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          margin-bottom: 1.1rem;
        }
        .week-title {
          font-size: 1.08rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .week-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .week-day {
          flex: 1.2;
          font-size: 1.05rem;
        }
        .week-time {
          flex: 1.5;
          font-size: 1.05rem;
        }
        .week-actions {
          flex: 1.5;
          display: flex;
          gap: 0.3rem;
        }
        .week-action-btn {
          min-width: 90px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
        .create-btn-row {
          margin: 1.2rem 0 0.7rem 0;
        }
      `}</style>
      <div className="workschedule-container">
        <SketchHeader
          title={<><Calendar size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>Work Schedule</>}
          showBack={true}
          onBack={goBack}
        />
        <div className="toggle-row">
          <SketchBtn variant={view==='week'?'primary':'event'} size="small" onClick={()=>setView('week')}>Week</SketchBtn>
          <SketchBtn variant={view==='month'?'primary':'event'} size="small" onClick={()=>setView('month')}>Month</SketchBtn>
        </div>
        <SketchDiv className="schedule-card">
          <div className="week-title">This week</div>
          {weekData.map((row, idx) => (
            <div className="week-row" key={row.day}>
              <div className="week-day">{row.day}</div>
              <div className="week-time">{row.time}</div>
              <div className="week-actions">
                {row.actions.map(action => (
                  <SketchBtn key={action} variant="event" size="small" className="week-action-btn">{action}</SketchBtn>
                ))}
              </div>
            </div>
          ))}
        </SketchDiv>
        <div className="create-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '100%' }}>Create schedule</SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffWorkSchedule; 