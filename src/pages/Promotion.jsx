import React, { useState } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import SketchDiv from '@components/SketchDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';
import SketchHeader from '@components/SketchHeader'
import { Share, Filter, Star, Heart, ArrowRight } from 'lucide-react';

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
      image: '/cdn/mang.png'
    },
    {
      id: 2,
      title: 'Jazz Night',
      date: 'Dec 15, 2023',
      time: '8 PM',
      location: 'Saigon Lounge',
      image: '/cdn/qui.png'
    },
    {
      id: 3,
      title: 'Beach Party',
      date: 'Dec 16, 2023',
      time: '6 PM',
      location: 'Da Nang Beach Club',
      image: '/cdn/skybar.png'
    }
  ];

  return (
    <>
      <style jsx="true">{`
        .promotions-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          position: relative;
        }

        .content-section {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Filter Section */
        .filter-section {
          padding: 1.25rem;
          background-color: #fefefe;
          border: 0.8px solid #666;
          position: relative;
          overflow: hidden;
          border-top-left-radius: 12px 15px;
          border-top-right-radius: 14px 8px;
          border-bottom-right-radius: 8px 12px;
          border-bottom-left-radius: 10px 6px;
          transform: rotate(-0.1deg);
        }

        .filter-content {
          display: flex;
         
          align-items: center;
          position: relative;
          z-index: 2;
        }

        .filter-input {
          flex: 1;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        /* Promotion Cards */
        .promotion-card {
          padding: 0;
          background-color: #fefefe;
          border: 0.8px solid #666;
          position: relative;
          overflow: hidden;
          border-top-left-radius: 15px 8px;
          border-top-right-radius: 8px 12px;
          border-bottom-right-radius: 12px 6px;
          border-bottom-left-radius: 6px 14px;
          transition: all 0.2s;

          margin-bottom: 20px;
        }

        .promotion-card:nth-child(even) {
          transform: rotate(0.3deg);
        }

        .promotion-card:nth-child(odd) {
          transform: rotate(-0.2deg);
        }

        .promotion-card:hover {
          box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.1);
        }

        .promotion-card:nth-child(even):hover {
          transform: rotate(0.3deg) scale(1.01);
        }

        .promotion-card:nth-child(odd):hover {
          transform: rotate(-0.2deg) scale(1.01);
        }

        .promotion-content {
          position: relative;
          z-index: 2;
          display: flex;
          flex-direction: column;
          padding: 1rem;
        }

        .promotion-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-bottom: 0.8px solid #666;
        }

        .promotion-info {
          padding: 1.25rem;
        }

        .promotion-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 0.75rem 0;
          line-height: 1.2;
        }

        .promotion-details {
          margin-bottom: 1rem;
        }

        .promotion-detail {
          font-size: 0.875rem;
          color: #6b7280;
          margin: 0.25rem 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .detail-label {
          font-weight: 500;
          color: #374151;
          min-width: 3rem;
        }

        .promotion-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .share-btn {
          width: 2.5rem;
          height: 2.5rem;
          background-color: #f8fafc;
          border: 0.8px solid #666;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          transform: rotate(2deg);
          flex-shrink: 0;
        }

        .share-btn:hover {
          background-color: #e2e8f0;
          transform: rotate(2deg) scale(1.05);
          box-shadow: 1px 1px 3px rgba(0, 0, 0, 0.1);
        }

        .book-btn-wrapper {
          flex: 1;
          display: flex;
          justify-content: flex-start;
        }

        /* Special promotion highlight */
        .promotion-card.featured {
          border-color:rgb(255, 193, 86);
          background-color: #fef3c7;
        }

        .promotion-card.featured::before {
          content: '⭐';
          position: absolute;
          top: 0.95rem;
          right: 0.95rem;
          font-size: 1.5rem;
          z-index: 3;
        }

        /* Empty state */
        .empty-state {
          text-align: center;
          padding: 3rem 1.5rem;
          color: #6b7280;
        }

        .empty-state h3 {
          font-size: 1.125rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: #374151;
        }

        .empty-state p {
          font-size: 0.875rem;
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 480px) {
          .content-section {
            padding: 1rem;
          
          }

          .filter-content {
            flex-direction: column;
            align-items: stretch;
          }

          .filter-btn {
            justify-content: center;
          }

          .promotion-info {
            padding: 1rem;
          }

          .promotion-title {
            font-size: 1.1rem;
          }

          .promotion-actions {
            flex-direction: column;
            gap: 0.75rem;
            align-items: stretch;
          }

          .book-btn-wrapper {
            justify-content: center;
          }

          .share-btn {
            align-self: center;
          }
        }

        /* Loading animation */
        .loading-card {
          background: linear-gradient(
            90deg,
            #f0f0f0 25%,
            #e0e0e0 50%,
            #f0f0f0 75%
          );
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
        }

        @keyframes loading {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
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

        <div className="content-section">
          {/* Filter Section */}
          <SketchDiv className="filter-section">
            <HatchPattern opacity={0.02} />
            
            <div className="filter-content">
              <div className="filter-input">
                <SketchInput
                  type="text"
                  placeholder="Filter by category"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
              <SketchBtn 
                variant="event" 
                size="small"
                onClick={handleApplyFilter}
                className="filter-btn"
              > <HatchPattern opacity={0.8} />
                <Filter size={16} />
                Apply
              </SketchBtn>
            </div>
          </SketchDiv>

          {/* Promotions Section */}
          <div className="promotions-list">
            {promotions.length > 0 ? (
              promotions.map((promotion, index) => (
                <SketchDiv 
                  key={promotion.id} 
                  className={`promotion-card ${index === 0 ? 'featured' : ''}`}
                >
                  <HatchPattern opacity={0.4} />
                  
                  <div className="promotion-content">
                    <ImagePlaceholder 
                      src={promotion.image} 
                      alt={promotion.title}
                      className="promotion-image"
                    />
                    
                    <div className="promotion-info">
                      <h3 className="promotion-title">{promotion.title}</h3>
                      
                      <div className="promotion-details">
                        <div className="promotion-detail">
                          <span className="detail-label">Date:</span>
                          <span>{promotion.date}</span>
                        </div>
                        <div className="promotion-detail">
                          <span className="detail-label">Time:</span>
                          <span>{promotion.time}</span>
                        </div>
                        <div className="promotion-detail">
                          <span className="detail-label">Venue:</span>
                          <span>{promotion.location}</span>
                        </div>
                      </div>

                      <div className="promotion-actions">
                        <div className="book-btn-wrapper">
                          <SketchBtn 
                            variant="primary" 
                            size="medium"
                            onClick={() => handleBookNow(promotion)}
                          >
                            Book Now
                          </SketchBtn>
                        </div>
                        
                        <button 
                          className="share-btn"
                          onClick={() => handleShare(promotion)}
                        >
                          <Share size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </SketchDiv>
              ))
            ) : (
              <SketchDiv className="promotion-card">
                <HatchPattern opacity={0.02} />
                <div className="empty-state">
                  <h3>No Events Found</h3>
                  <p>Try adjusting your filter or check back later for new events.</p>
                </div>
              </SketchDiv>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PromotionsPage;