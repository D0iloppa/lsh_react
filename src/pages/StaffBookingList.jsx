import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';
import { Calendar } from 'lucide-react';

const mockBookings = [
  {
    id: 1,
    venue: 'The Sunset Bar',
    status: 'Confirmed',
    date: '12th Nov, 2023',
    time: '8:00 PM',
    customer: 'Minh Tran',
    actions: ['Details', 'Accept', 'CHAT MANAGER']
  },
  {
    id: 2,
    venue: 'Lotus Lounge',
    status: 'Cancelled',
    date: '15th Oct, 2023',
    time: '10:00 PM',
    customer: 'An Nguyen',
    actions: ['Details', 'Decline', 'CHAT MANAGER']
  },
  {
    id: 3,
    venue: 'Moonlight Terrace',
    status: 'Completed',
    date: '20th Sep, 2023',
    time: '9:00 PM',
    customer: 'Linh Vu',
    actions: ['Details', 'Review', 'CHAT MANAGER']
  },
];

const StaffBookingList = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  return (
    <>
      <style jsx="true">{`
        .bookinglist-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .booking-card {
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          margin-bottom: 1.1rem;
        }
        .booking-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }
        .booking-venue {
          font-size: 1.08rem;
          font-weight: 600;
        }
        .booking-status {
          font-size: 1.05rem;
          color: #222;
        }
        .booking-info {
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 0.5rem;
        }
        .booking-actions {
          display: flex;
          gap: 0.7rem;
        }
        .booking-action-btn {
          min-width: 54px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
      `}</style>
      <div className="bookinglist-container">
        <SketchHeader
          title={<><Calendar size={20} style={{marginRight:'7px',marginBottom:'-3px'}}/>Booking List</>}
          showBack={true}
          onBack={goBack}
        />
        {mockBookings.map(bk => (
          <SketchDiv key={bk.id} className="booking-card">
            <div className="booking-header">
              <div className="booking-venue">{bk.venue}</div>
              <div className="booking-status">{bk.status}</div>
            </div>
            <div className="booking-info">
              Date: {bk.date}<br/>
              Time: {bk.time}<br/>
              Customer: {bk.customer}
            </div>
            <div className="booking-actions">
              {bk.actions.map(action => (
                <SketchBtn key={action} variant="event" size="small" className="booking-action-btn">{action}</SketchBtn>
              ))}
            </div>
          </SketchDiv>
        ))}
      </div>
    </>
  );
};

export default StaffBookingList; 