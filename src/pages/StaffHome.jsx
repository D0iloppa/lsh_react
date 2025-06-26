import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

const StaffHome = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  return (
    <>
      <style jsx="true">{`
        .staffhome-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .welcome-box {
          background: #fff;
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          padding: 1.1rem 0.9rem 0.7rem 0.9rem;
          margin-bottom: 1.1rem;
          text-align: center;
        }
        .welcome-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }
        .welcome-desc {
          font-size: 1.05rem;
          color: #222;
        }
        .section-card {
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
          margin-bottom: 1.1rem;
        }
        .section-title {
          font-size: 1.08rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .section-content {
          font-size: 0.97rem;
          color: #222;
        }
        .action-row {
          display: flex;
          gap: 0.7rem;
          margin: 1.2rem 0 1.1rem 0;
        }
        .action-btn {
          flex: 1;
          font-size: 1.05rem;
          min-width: 0;
        }
      `}</style>
      <div className="staffhome-container">
        <div className="welcome-box">
          <div className="welcome-title">Welcome, [Staff Name]!</div>
          <div className="welcome-desc">See today's bookings, upcoming shifts, and unread notifications at a glance.</div>
        </div>
        <SketchDiv className="section-card">
          <div className="section-title">Alert: Urgent Message</div>
          <div className="section-content">There is an urgent update regarding the event at XYZ Club.<br/>Please check your notifications for details.</div>
        </SketchDiv>
        <SketchDiv className="section-card">
          <div className="section-title">Today's Bookings</div>
          <div className="section-content">
            7:00 PM - Lounge Bar - 5 guests<br/>
            9:00 PM - Sky Deck - 8 guests<br/>
            10:30 PM - Club Inferno - 12 guests
          </div>
        </SketchDiv>
        <SketchDiv className="section-card">
          <div className="section-title">Upcoming Shifts</div>
          <div className="section-content">
            Tomorrow - 6:00 PM to 2:00 AM<br/>
            Friday - 7:00 PM to 3:00 AM
          </div>
        </SketchDiv>
        <SketchDiv className="section-card">
          <div className="section-title">Unread Notifications</div>
          <div className="section-content">
            New review on your performance<br/>
            Schedule update for next week<br/>
            Reminder: Update your profile
          </div>
        </SketchDiv>
        <div className="action-row">
          <SketchBtn variant="event" size="medium" className="action-btn">Edit Profile</SketchBtn>
          <SketchBtn variant="event" size="medium" className="action-btn">Booking List</SketchBtn>
          <SketchBtn variant="event" size="medium" className="action-btn">New Reviews</SketchBtn>
        </div>
      </div>
    </>
  );
};

export default StaffHome; 