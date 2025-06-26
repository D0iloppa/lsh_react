import React, { useState } from 'react';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import { Calendar, Check, Edit } from 'lucide-react';

const mockReservations = [
  {
    id: 1,
    date: 'Friday, 20th Oct',
    time: '8:00 PM',
    venue: 'SkyBar Lounge',
    status: 'pending',
  },
  {
    id: 2,
    date: 'Saturday, 21st Oct',
    time: '9:30 PM',
    venue: 'The Night Owl',
    status: 'confirmed',
  },
  {
    id: 3,
    date: 'Sunday, 22nd Oct',
    time: '11:00 PM',
    venue: 'Jazz Club',
    status: 'cancelled',
  },
];

const statusList = [
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const ReservationManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const filtered = mockReservations.filter(r => r.status === selectedStatus);

  return (
    <>
      <style jsx="true">{`
        .reservation-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .status-filter-row {
          display: flex;
          justify-content: space-around;
          gap: 0.5rem;
          margin: 0.7rem 0 0.7rem 0;
        }
        .reservation-list {
          display: flex;
          flex-direction: column;
          gap: 0.6rem;
        }
        .reservation-card {
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          background-color: white;
          border: 1px solid #666;
          background: #fff;
          padding: 0.7rem 0.8rem 0.8rem 0.8rem;
          position: relative;
          box-shadow: none;
        }
        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.2rem;
        }
        .reservation-date {
          font-size: 1.02rem;
          font-weight: 600;
          margin-bottom: 0.8rem;
        }
        .reservation-time {
          font-size: 0.92rem;
          color: #555;
          font-weight: 500;
        }
        .reservation-venue {
          font-size: 0.92rem;
          color: #222;
          margin-bottom: 0.2rem;
        }
        .reservation-status {
          font-size: 0.88rem;
          color: #888;
          margin-bottom: 0.2rem;
        }
        .reservation-actions {
          display: flex;
          gap: 0.3rem;
          margin-top: 0.2rem;
        }
        .action-btn {
          min-width: 54px;
          font-size: 0.88rem;
          padding: 0.18rem 0.5rem;
        }
          
        .reservation-contents {
          padding: 0.3rem;
          margin-bottom: 0.5rem;
        
        }
      `}</style>
      <div className="reservation-container">
        <SketchHeader
          title="Reservations"
          showBack={true}
          onBack={goBack}
        />

        <div className="status-filter-row">
          {statusList.map(s => (
            <SketchBtn
              key={s.key}
              variant={s.key === 'cancelled' ? 'danger' : 'primary'}
              onClick={() => setSelectedStatus(s.key)}
              className="status-btn"
              size="small"
            >
              {s.label}
            </SketchBtn>
          ))}
        </div>

        <div className="reservation-list">
          {filtered.map(r => (
            <SketchDiv key={r.id} className="reservation-card">
              <div className="reservation-header">
                <div className="reservation-contents">
                  <div className="reservation-date"><Calendar size={15} style={{marginRight: '3px'}}/> {r.date}</div>
                  <div className="reservation-venue">venue: {r.venue}</div>
                  <div className="reservation-status">Status: {r.status.charAt(0).toUpperCase() + r.status.slice(1)}</div>
                </div>
                <div className="reservation-time">{r.time}</div>
              </div>
              <div className="reservation-actions">
                <SketchBtn variant="event" size="small" className="action-btn">Approve</SketchBtn>
                <SketchBtn variant="primary" size="small" className="action-btn"><Edit size={14} style={{marginRight: '3px'}}/> Modify</SketchBtn>
                <SketchBtn variant="danger" size="small" className="action-btn">Cancel</SketchBtn>
              </div>
              <HatchPattern opacity={0.4} />
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReservationManagement; 