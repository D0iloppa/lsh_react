import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchHeader from '@components/SketchHeader';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

const BookingHistoryPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {

  const handleRebook = (booking) => {
    console.log('Rebook clicked:', booking);
    navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
      rebookingData: booking
    });
  };

  const handleReview = (booking) => {
    console.log('Review clicked:', booking);
    navigateToPageWithData && navigateToPageWithData(PAGES.SHARE_EXPERIENCE, {
      venueData: {
        name: booking.venueName,
        image: booking.image
      }
    });
  };

  useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const bookings = [
    {
      id: 1,
      venueName: 'Skyline Lounge',
      hostName: 'Alex Nguyen',
      date: 'Oct 16, 2023',
      time: '8:00 PM',
      status: 'confirmed',
      statusLabel: 'Confirmed',
      image: '/placeholder-venue1.jpg'
    },
    {
      id: 2,
      venueName: 'Neon Dreams Bar',
      hostName: 'Linh Tran',
      date: 'Sep 14, 2023',
      time: '9:00 PM',
      status: 'completed',
      statusLabel: 'Completed',
      image: '/placeholder-venue2.jpg'
    },
    {
      id: 3,
      venueName: 'Chic Lounge',
      hostName: 'Minh Vu',
      date: 'Aug 21, 2023',
      time: '9:00 PM',
      status: 'canceled',
      statusLabel: 'Canceled',
      image: '/placeholder-venue3.jpg'
    }
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
        return '#059669'; // 초록색
      case 'completed':
        return '#6b7280'; // 회색
      case 'canceled':
        return '#dc2626'; // 빨간색
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      <style jsx>{`
        .booking-history-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
        }

        .header {
          padding: 1.5rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
          text-align: center;
        }

        .page-title {
          
          font-size: 1.4rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .bookings-section {
          padding: 1rem;
        }

        .booking-card {
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          border: 1px solid #1f2937;
          background-color: #f8fafc;
          padding: 1rem;
          margin-bottom: 1rem;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          
          position: relative;
          overflow: hidden;
        }

        .booking-card:hover {
          transform: rotate(-0.1deg) scale(1.01);
        }

        .booking-card:nth-child(even) {
          transform: rotate(0.1deg);
        }

        .booking-card:nth-child(even):hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .booking-content {
          position: relative;
          z-index: 10;
          display: flex;
          gap: 1rem;
        }

        .booking-image {
          width: 100%;
          height: 100%;
          flex-shrink: 0;
          border: 2px solid #1f2937;
        }

        .booking-details {
          flex: 1;
        }

        .venue-name {
         
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .host-info {
          
          font-size: 0.85rem;
          color: #4b5563;
          margin: 0 0 0.25rem 0;
        }

        .booking-datetime {
          
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
        }

        .booking-actions {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          align-items: flex-end;
        }

        .booking-status {
          
          font-size: 0.8rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        @media (max-width: 480px) {
          .booking-history-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .booking-content {
            flex-direction: column;
            gap: 0.75rem;
          }

          .booking-actions {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }

          .action-buttons {
            flex-direction: column;
            gap: 0.25rem;
          }
        }
      `}</style>

      <div className="booking-history-container">
        {/* Header */}
         <SketchHeader
            title={'Booking History'}
            showBack={true}
            onBack={() => console.log('뒤로가기')}
            rightButtons={[]}
          />
        {/* <div className="header">
          <h1 className="page-title">Booking History</h1>
        </div> */}

        {/* Bookings Section */}
        <div className="bookings-section">
          {bookings.map((booking, index) => (
            <div key={booking.id} className="booking-card">
              <HatchPattern opacity={0.4} />
              
              <div className="booking-content">
                <ImagePlaceholder 
                  src={booking.image} 
                  className="booking-image"
                />
                
                <div className="booking-details">
                  <h3 className="venue-name">{booking.venueName}</h3>
                  <p className="host-info">Hosted by {booking.hostName}</p>
                  <p className="booking-datetime">
                    Date {booking.date}, {booking.time}
                  </p>
                </div>

                <div className="booking-actions">
                  <div 
                    className="booking-status"
                    style={{ color: getStatusColor(booking.status) }}
                  >
                    {booking.statusLabel}
                  </div>
                  
                  <div className="action-buttons">
                    <SketchBtn 
                      variant="secondary" 
                      size="small"
                      onClick={() => handleRebook(booking)}
                    >
                      <HatchPattern opacity={0.4} />
                      Rebook
                    </SketchBtn>
                    
                    <SketchBtn 
                      variant="primary" 
                      size="small"
                      onClick={() => handleReview(booking)}
                    >
                      <HatchPattern opacity={0.4} />
                      Review
                    </SketchBtn>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Copyright */}
        {/* <div style={{ 
          padding: '1rem', 
          textAlign: 'center', 
          borderTop: '2px solid #e5e7eb',
          backgroundColor: '#f9fafb'
        }}>
          <p style={{ 
            fontFamily: "'Comic Sans MS', cursive, sans-serif",
            fontSize: '0.8rem',
            color: '#6b7280',
            margin: 0
          }}>
            © 2023 LeTanTon Sheriff. All rights reserved.
          </p>
        </div> */}
      </div>
    </>
  );
};

export default BookingHistoryPage;