import React from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import '@components/SketchComponents.css';

import SketchDiv from '@components/SketchDiv'

import SketchHeader from '@components/SketchHeader'

const CSPage2 = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {

  const handleInquiryClick = (inquiry) => {
    console.log('Inquiry clicked:', inquiry);
    // 문의 상세 페이지로 이동하거나 상세 내용 표시
  };

  const inquiries = [
    {
      id: 1,
      type: 'reservation',
      icon: '⚠️',
      title: 'Reservation Inquiry',
      date: 'October 5, 2023',
      status: 'processing',
      statusLabel: 'Processing'
    },
    {
      id: 2,
      type: 'event',
      icon: 'ℹ️',
      title: 'Event Inquiry',
      date: 'September 30, 2023',
      status: 'answered',
      statusLabel: 'Answered'
    },
    {
      id: 3,
      type: 'other',
      icon: 'ℹ️',
      title: 'Other Inquiry',
      date: 'September 11, 2023',
      status: 'pending',
      statusLabel: 'Pending'
    }
  ];

  const getStatusVariant = (status) => {
    switch(status) {
      case 'processing':
        return 'accent';
      case 'answered':
        return 'secondary';
      case 'pending':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  return (
    <>
      <style jsx>{`
        .cs2-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
        }

        .page-title {
          font-size: 1.4rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .inquiries-section {
          padding: 1.5rem;
        }

        .inquiry-card {
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 1rem;
          cursor: pointer;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
        }

        .inquiry-card:hover {
          transform: rotate(-0.1deg) scale(1.01);
          box-shadow: 4px 4px 0px #1f2937;
        }

        .inquiry-card:nth-child(even) {
          transform: rotate(0.1deg);
        }

        .inquiry-card:nth-child(even):hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .inquiry-content {
          position: relative;
          z-index: 10;
        }

        .inquiry-header {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .inquiry-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
          margin-top: 0.1rem;
        }

        .inquiry-details {
          flex: 1;
        }

        .inquiry-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .inquiry-date {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .inquiry-status {
          align-self: flex-start;
        }

        @media (max-width: 480px) {
          .cs2-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .inquiry-header {
            flex-direction: column;
            gap: 0.5rem;
          }

          .inquiry-status {
            align-self: stretch;
          }
        }
      `}</style>

      <div className="cs2-container">
        {/* Header */}
        <SketchHeader
          title="Customer Support"
          showBack={true}
          onBack={() => {
            // goBack();
            navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
          }}
          rightButtons={[]}
        />

        {/* Inquiries Section */}
        <div className="inquiries-section">
          {inquiries.map((inquiry, index) => (
            <SketchDiv
              key={inquiry.id}
              className="inquiry-card"
              onClick={() => handleInquiryClick(inquiry)}
            >
              <HatchPattern opacity={0.03} />
              
              <div className="inquiry-content">
                <div className="inquiry-header">
                  <div className="inquiry-icon">
                    {inquiry.icon}
                  </div>
                  
                  <div className="inquiry-details">
                    <h3 className="inquiry-title">{inquiry.title}</h3>
                    <p className="inquiry-date">{inquiry.date}</p>
                  </div>
                  
                  <div className="inquiry-status">
                    <SketchBtn 
                      variant={getStatusVariant(inquiry.status)}
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log('Status clicked:', inquiry.status);
                      }}
                    >
                      {inquiry.statusLabel}
                    </SketchBtn>
                  </div>
                </div>
              </div>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default CSPage2;