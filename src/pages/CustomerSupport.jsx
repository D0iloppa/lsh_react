import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import HatchPattern from '@components/HatchPattern';
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

const getStatusStyle = (status) => {
  switch(status) {
    case 'New':
      return { color: '#dc2626',   }; // 빨간색
    case 'In Progress':
      return { color: '#d97706'}; // 노란색
    case 'Resolved':
      return { color: '#059669', background: '#eeffee'}; // 초록색
    default:
      return { color: '#6b7280' }; // 기본 회색
  }
};

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
          background: #fff;
          padding: 0.8rem 0.9rem 0.8rem 0.9rem;
          display: flex;
          align-items: center;
          position: relative;
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
            <SketchDiv key={inq.id} className="inquiry-card"><HatchPattern opacity={0.3} />
              <div className="inquiry-info">
                <div className="inquiry-title-main">{inq.title}</div>
                <div className="inquiry-meta">{inq.user} - {inq.date}</div>
              </div>
              <SketchBtn variant="primary" size="small" className="inquiry-status-btn"  style={{
                width: '38%',
                ...getStatusStyle(inq.status) // 상태별 스타일 적용
              }}>
              {inq.status}<HatchPattern opacity={0.6} /></SketchBtn>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default CustomerSupport; 