import React from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';

const ReserveSummaryPage = ({ 
  navigateToPageWithData, 
  PAGES, 
  reservationData = {
    date: '15th Nov',
    time: '9:00 PM',
    attendees: '4',
    preferences: 'Non-Smoking'
  },
  ...otherProps 
}) => {

  const handleHome = () => {
    console.log('Home 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
  };

  const handleConfirm = () => {
    console.log('Confirm Reservation:', reservationData);
    // 예약 확정 로직
    navigateToPageWithData && navigateToPageWithData(PAGES.SUBSCRIPTION_PAY, { confirmed: true });
  };

  return (
    <>
      <style jsx>{`
        .summary-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          border: 4px solid #1f2937;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          position: relative;
        }

        .logo {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-weight: bold;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .content-section {
          padding: 2rem 1.5rem;
        }

        .section-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .booking-summary-box {
          border: 3px solid #1f2937;
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 2rem;
          transform: rotate(-0.3deg);
          box-shadow: 3px 3px 0px #1f2937;
          position: relative;
          overflow: hidden;
        }

        .summary-content {
          position: relative;
          z-index: 10;
        }

        .summary-item {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.95rem;
          color: #374151;
          margin-bottom: 0.5rem;
          display: flex;
          justify-content: space-between;
        }

        .summary-item:last-child {
          margin-bottom: 0;
        }

        .summary-label {
          font-weight: bold;
          color: #1f2937;
        }

        .summary-value {
          color: #4b5563;
        }

        .confirm-section {
          padding: 0 1.5rem 2rem;
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
          margin-right: 0.75rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 480px) {
          .summary-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="summary-container">
        {/* Header */}
        <div className="header">
          <div className="logo">🍸 LeTanTon Sheriff</div>
        </div>

        {/* Content Section */}
        <div className="content-section">
          <div className="section-title">Booking Summary</div>
          
          {/* Booking Summary Box */}
          <div className="booking-summary-box">
            <HatchPattern opacity={0.05} />
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Date:</span>
                <span className="summary-value">{reservationData.date}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Time:</span>
                <span className="summary-value">{reservationData.time}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Attendees:</span>
                <span className="summary-value">{reservationData.attendees}</span>
              </div>
              
              <div className="summary-item">
                <span className="summary-label">Preferences:</span>
                <span className="summary-value">{reservationData.preferences}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Confirm Section */}
        <div className="confirm-section">
          <SketchBtn 
            className="full-width" 
            variant="primary" 
            size="large"
            onClick={handleConfirm}
          >
            CONFIRM RESERVATION
            <HatchPattern opacity={0.1} />
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default ReserveSummaryPage;