import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchHeader from '@components/SketchHeader';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';
import { useAuth } from '@contexts/AuthContext';

const BookingHistoryPage = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {

  const { user, isLoggedIn } = useAuth();

  // 상태
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [historyData, setHistoryData] = useState({});
  const [bookings, setBookings] = useState([]); // 🎯 추가: API 데이터용 상태

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();

  // 상태 라벨 변환 함수
  const getStatusLabel = (status) => {
    const statusMap = {
      'pending': get('status.pending') || 'Pending',
      'confirmed': get('status.confirmed') || 'Confirmed', 
      'canceled': get('status.canceled') || 'Canceled',
      'completed': get('status.completed') || 'Completed'
    };
    return statusMap[status] || status;
  };
  
  const handleRebook = (booking) => {
    console.log('Rebook clicked:', booking);
    navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
      target: booking.targetType,
      id: booking.targetId
    });
  };

  const handleReview = (booking) => {
    console.log('Review clicked:', booking);
    navigateToPageWithData && navigateToPageWithData(PAGES.SHARE_EXPERIENCE, {
      target: booking.targetType,
      target_id: booking.targetId
    });
  };

  useEffect(() => {
    const initializeData = async () => {
      window.scrollTo(0, 0);
  
      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        console.log('Current language set to:', currentLang);
      }
  
      // historyData 로딩 완료까지 기다리기
      try {
        await loadBookingHistory(); // Promise 리턴하도록 수정 필요
        console.log('📋 Booking history loaded');
      } catch (error) {
        console.error('❌ Failed to load booking history:', error);
      }
    };
  
    initializeData();
  }, [messages, currentLang]); // historyData 의존성 제거

  const loadBookingHistory = () => {
    return new Promise((resolve, reject) => {
      console.log('[Loading] booking-history', user.user_id);
      
      setIsLoadingHistory(true);
      
      ApiClient.postForm('/api/bookingHistory', {  // data
        user_id: user.user_id
      })
      .then(response => {
        console.log('✅ History loaded:', response);
        
        // 🎯 API 데이터를 bookings 형태로 변환
        const formattedBookings = (response.data || []).map(item => ({
          id: item.reservation_id,
          targetName: item.target_name,
          hostName: item.venue_name,
          date: item.date,
          time: item.time,
          status: item.status,
          statusLabel: getStatusLabel(item.status),
          image: item.content_url || '/placeholder-venue.jpg',
          // 추가 데이터 (필요시 사용)
          targetType: item.target,
          targetId: item.target_id,
          note: item.note,
          attendee: item.attendee,
          reservedAt: item.reserved_at
        }));
        
        setBookings(formattedBookings); // 🔥 여기서 bookings 설정!
        setHistoryData(response.data || {});
        setIsLoadingHistory(false);
        resolve(response); // 성공 시 resolve
      })
      .catch(error => {
        console.error('❌ Failed to load History:', error);
        setBookings([]); // 에러시 빈 배열
        setHistoryData({});
        setIsLoadingHistory(false);
        reject(error); // 실패 시 reject
      });
    });
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'confirmed':
        return '#059669'; // 초록색
      case 'completed':
        return '#6b7280'; // 회색
      case 'canceled':
        return '#dc2626'; // 빨간색
      case 'pending':
        return '#f59e0b'; // 주황색
      default:
        return '#6b7280';
    }
  };

  return (
    <>
      <style jsx="true">{`
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

        .loading-container {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-container {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
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
          title={get('Menu1.6')}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        {/* Bookings Section */}
        <div className="bookings-section">
          {isLoadingHistory ? (
            <div className="loading-container">
              <p>Loading booking history...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="empty-container">
              <p>{get('BookingHis1.3') || 'No booking history found'}</p>
            </div>
          ) : (
            bookings.map((booking, index) => (
              <div key={booking.id} className="booking-card">
                <HatchPattern opacity={0.4} />
                
                <div className="booking-content">
                  <ImagePlaceholder 
                    src={booking.image} 
                    className="booking-image"
                  />
                  
                  <div className="booking-details">
                    <h3 className="venue-name">{booking.targetName}</h3>
                    <p className="host-info">{get('BookingHis1.1')}: {booking.hostName}</p>
                    <p className="booking-datetime">
                      {get('BookingSum1.2')}: {booking.date}, {booking.time}
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
                        variant="event" 
                        size="small"
                        onClick={() => handleRebook(booking)}
                      >
                        <HatchPattern opacity={0.8} />
                        {get('BookingHis1.2')}
                      </SketchBtn>
                      
                      <SketchBtn 
                        variant="primary" 
                        size="small"
                        onClick={() => handleReview(booking)}
                      >
                        <HatchPattern opacity={0.4} />
                        {get('Profile1.1')}
                      </SketchBtn>
                                      <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default BookingHistoryPage;