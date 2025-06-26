import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import SketchInput from '@components/SketchInput';
import '@components/SketchComponents.css';
import { Calendar } from 'lucide-react';

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const StaffWorkScheduleCreate = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [week, setWeek] = useState({
    Monday: { on: false, start: '', end: '' },
    Tuesday: { on: true, start: '20:00', end: '02:00' },
    Wednesday: { on: false, start: '', end: '' },
    Thursday: { on: false, start: '', end: '' },
    Friday: { on: false, start: '', end: '' },
    Saturday: { on: false, start: '', end: '' },
    Sunday: { on: false, start: '', end: '' },
  });

  return (
    <>
      <style jsx="true">{`
        .workschedulecreate-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .week-title {
          font-size: 1.08rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
          text-align: center;
        }
        .week-row {
          display: flex;
          align-items: center;
          margin-bottom: 0.7rem;
        }
        .week-day {
          flex: 1.2;
          font-size: 1.05rem;
        }
        .week-onoff {
          flex: 1.2;
          margin-right: 0.5rem;
        }
        .week-hours {
          flex: 3;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        .save-btn-row {
          margin: 1.2rem 0 0.7rem 0;
        }
      `}</style>
      <div className="workschedulecreate-container">
        <SketchHeader
          title={<><Calendar size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>Work Schedule</>}
          showBack={true}
          onBack={goBack}
        />
        <div className="week-title">Weekly Work Schedule (2025.05.01 ~ 2025.05.08)</div>
        {days.map(day => (
          <div className="week-row" key={day}>
            <div className="week-day">{day}:</div>
            <div className="week-onoff">
              <select value={week[day].on ? 'on' : 'off'} onChange={e => setWeek(w => ({ ...w, [day]: { ...w[day], on: e.target.value === 'on' } }))} style={{ fontSize: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.2rem 1.2rem 0.2rem 0.5rem', background: '#fff' }}>
                <option value="on">on</option>
                <option value="off">off</option>
              </select>
            </div>
            {week[day].on && (
              <div className="week-hours">
                Hours:
                <select value={week[day].start} onChange={e => setWeek(w => ({ ...w, [day]: { ...w[day], start: e.target.value } }))} style={{ fontSize: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.2rem 1.2rem 0.2rem 0.5rem', background: '#fff' }}>
                  <option value="">--</option>
                  <option value="20:00">20:00</option>
                  <option value="21:00">21:00</option>
                  <option value="22:00">22:00</option>
                </select>
                to
                <select value={week[day].end} onChange={e => setWeek(w => ({ ...w, [day]: { ...w[day], end: e.target.value } }))} style={{ fontSize: '1rem', borderRadius: '6px', border: '1px solid #e5e7eb', padding: '0.2rem 1.2rem 0.2rem 0.5rem', background: '#fff' }}>
                  <option value="">--</option>
                  <option value="02:00">02:00</option>
                  <option value="03:00">03:00</option>
                  <option value="04:00">04:00</option>
                </select>
              </div>
            )}
          </div>
        ))}
        <div className="save-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '100%' }}>Save schedule</SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffWorkScheduleCreate; 