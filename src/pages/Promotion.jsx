import React, { useState } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader'

const PromotionsPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {
  const [filterQuery, setFilterQuery] = useState('');

  const handleHome = () => {
    console.log('Home 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.HOME);
  };

  const handleMenu = () => {
    console.log('Menu 클릭');
    // 메뉴 페이지나 사이드바 토글
  };

  const handleApplyFilter = () => {
    console.log('Apply filter:', filterQuery);
    // 필터 적용 로직
  };

  const handleBookNow = (promotion) => {
    console.log('Book Now clicked:', promotion);
    navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
      selectedEvent: promotion
    });
  };

  const handleShare = (promotion) => {
    console.log('Share clicked:', promotion);
    // 공유 기능
  };

  const promotions = [
    {
      id: 1,
      title: 'Rooftop Bash',
      date: 'Dec 14, 2023',
      time: '9 PM',
      location: 'Hanoi Sky Bar',
      image: '/placeholder-event1.jpg'
    },
    {
      id: 2,
      title: 'Jazz Night',
      date: 'Dec 15, 2023',
      time: '8 PM',
      location: 'Saigon Lounge',
      image: '/placeholder-event2.jpg'
    },
    {
      id: 3,
      title: 'Beach Party',
      date: 'Dec 16, 2023',
      time: '6 PM',
      location: 'Da Nang Beach Club',
      image: '/placeholder-event3.jpg'
    }
  ];

  return (
    <>
      <style jsx>{`
        .promotions-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background-color: #f9fafb;
        }

        .logo {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-weight: bold;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .header-icons {
          display: flex;
          gap: 0.5rem;
        }

        .header-icon {
          width: 2rem;
          height: 2rem;
          border: 2px solid #1f2937;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: white;
          font-size: 1rem;
          transition: all 0.2s;
        }

        .header-icon:hover {
          transform: scale(1.1);
        }

        .filter-section {
          padding: 1rem;
          border-bottom: 2px solid #e5e7eb;
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .filter-input {
          flex: 1;
        }

        .promotions-section {
          padding: 1rem;
        }

        .promotion-card {
          border: 3px solid #1f2937;
          background-color: #f8fafc;
          margin-bottom: 1.5rem;
          transform: rotate(-0.2deg);
          transition: all 0.2s;
          box-shadow: 3px 3px 0px #1f2937;
          position: relative;
          overflow: hidden;
        }

        .promotion-card:hover {
          transform: rotate(-0.2deg) scale(1.01);
          box-shadow: 4px 4px 0px #1f2937;
        }

        .promotion-card:nth-child(even) {
          transform: rotate(0.2deg);
        }

        .promotion-card:nth-child(even):hover {
          transform: rotate(0.2deg) scale(1.01);
        }

        .promotion-content {
          position: relative;
          z-index: 10;
        }

        .promotion-image {
          width: 100%;
          height: 180px;
          border-bottom: 3px solid #1f2937;
        }

        .promotion-info {
          padding: 1rem;
        }

        .promotion-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 0.5rem 0;
        }

        .promotion-details {
          margin-bottom: 1rem;
        }

        .promotion-detail {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          color: #4b5563;
          margin: 0.25rem 0;
        }

        .promotion-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .share-icon {
          width: 2rem;
          height: 2rem;
          border: 2px solid #1f2937;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          background-color: white;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .share-icon:hover {
          transform: scale(1.1);
        }

        @media (max-width: 480px) {
          .promotions-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .filter-section {
            flex-direction: column;
            gap: 0.5rem;
          }

          .filter-input {
            width: 100%;
          }
        }
      `}</style>

      <div className="promotions-container">
        {/* Header */}
        <SketchHeader 
          title="Event List"
          showBack={false}
          onBack={() => console.log("뒤로가기")}
          rightButtons={[]}
        />


        {/* Filter Section */}
        <div className="filter-section">
          <div className="filter-input">
            <SketchInput
              type="text"
              placeholder="Filter by category"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
            />
          </div>
          <SketchBtn 
            variant="secondary" 
            size="small"
            onClick={handleApplyFilter}
          >
            Apply
          </SketchBtn>
        </div>

        {/* Promotions Section */}
        <div className="promotions-section">
          {promotions.map((promotion, index) => (
            <div key={promotion.id} className="promotion-card">
              <HatchPattern opacity={0.03} />
              
              <div className="promotion-content">
                <ImagePlaceholder 
                  src={promotion.image} 
                  className="promotion-image"
                />
                
                <div className="promotion-info">
                  <h3 className="promotion-title">{promotion.title}</h3>
                  
                  <div className="promotion-details">
                    <p className="promotion-detail">
                      Date {promotion.date} | Time {promotion.time}
                    </p>
                    <p className="promotion-detail">
                      Location {promotion.location}
                    </p>
                  </div>

                  <div className="promotion-actions">
                    <SketchBtn 
                      variant="primary" 
                      size="small"
                      onClick={() => handleBookNow(promotion)}
                    >
                      Book Now
                    </SketchBtn>
                    
                    <div 
                      className="share-icon"
                      onClick={() => handleShare(promotion)}
                    >
                      📤
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PromotionsPage;