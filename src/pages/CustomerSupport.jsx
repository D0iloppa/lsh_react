import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

const mockInquiries = [
  {
    id: 1,
    title: 'Booking Issue',
    user: 'John Doe',
    date: '2 days ago',
    status: 'New'
  },
  {
    id: 2,
    title: 'Payment Failure',
    user: 'Alice Nguyen',
    date: '1 day ago',
    status: 'In Progress'
  },
  {
    id: 3,
    title: 'Event Inquiry',
    user: 'David Tran',
    date: '3 days ago',
    status: 'Resolved'
  },
];

const CustomerSupport = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  return (
    <>
      <style jsx="true">{`
        .support-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .inquiry-title {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.2rem 0 0.7rem 0;
        }
        .inquiry-list {
          display: flex;
          flex-direction: column;
          gap: 0.7rem;
        }
        .inquiry-card {
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          padding: 0.8rem 0.9rem 0.8rem 0.9rem;
          display: flex;
          align-items: center;
        }
        .inquiry-info {
          flex: 1;
        }
        .inquiry-title-main {
          font-size: 1.05rem;
          font-weight: 600;
          margin-bottom: 0.1rem;
        }
        .inquiry-meta {
          font-size: 0.97rem;
          color: #222;
        }
        .inquiry-status-btn {
          min-width: 74px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
      `}</style>
      <div className="support-container">
        <SketchHeader
          title="Customer Support"
          showBack={true}
          onBack={goBack}
        />
        <div className="inquiry-title">Customer Inquiries</div>
        <div className="inquiry-list">
          {mockInquiries.map(inq => (
            <SketchDiv key={inq.id} className="inquiry-card">
              <div className="inquiry-info">
                <div className="inquiry-title-main">{inq.title}</div>
                <div className="inquiry-meta">{inq.user} - {inq.date}</div>
              </div>
              <SketchBtn variant="event" size="small" className="inquiry-status-btn">{inq.status}</SketchBtn>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default CustomerSupport; 