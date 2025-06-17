import React, { useState, useEffect } from 'react';  
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchHeader from '@components/SketchHeader';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

const FavoritesPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const handleProfile = () => {
    console.log('Profile 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.PROFILE);
  };

  const handleSort = () => {
    console.log('Sort 클릭');
    // 정렬 옵션 토글 또는 모달
  };

  const handleFilter = () => {
    console.log('Filter 클릭');
    // 필터 옵션 토글 또는 모달
  };

  const handleBook = (venue) => {
    console.log('Book clicked:', venue);
    navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
      selectedVenue: venue
    });
  };

  const ShareIcon = ({ 
  size = 24, 
  color = "#333", 
  strokeWidth = 1.5,
  className = "",
  variant = "nodes", // "nodes", "arrow", "simple"
  ...props 
}) => {
    return (
      <svg 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke={color} 
        strokeWidth={strokeWidth}
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={`share-icon ${className}`}
        {...props}
      >
        {/* 간단한 공유 아이콘 - 상자에서 화살표가 나오는 형태 */}
        <path d="M14 2L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2H14Z" />
        <path d="M14 2V8H20" />
        <path d="M12 11L16 7" />
        <path d="M16 7H12" />
        <path d="M16 7V11" />
      </svg>
    );
};


  const favorites = [
    {
      id: 1,
      name: 'Elegant Lounge',
      description: 'Vibrant atmosphere with live music.',
      image: '/placeholder-venue1.jpg',
      rating: 4.8,
      category: 'lounge'
    },
    {
      id: 2,
      name: 'Cocktail Bar',
      description: 'Famous for its craft cocktails.',
      image: '/placeholder-venue2.jpg',
      rating: 4.6,
      category: 'bar'
    },
    {
      id: 3,
      name: 'Rooftop Views',
      description: 'Stunning views of the city skyline.',
      image: '/placeholder-venue3.jpg',
      rating: 4.9,
      category: 'rooftop'
    }
  ];

  return (
    <>
      <style jsx>{`
        .favorites-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;
          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
          position: relative;
        }

        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          border-bottom: 3px solid #1f2937;
          background-color: #f9fafb;
        }

        .logo {
          
          font-weight: bold;
          color: #1f2937;
          font-size: 1.1rem;
        }

        .content-section {
          padding: 1.5rem;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .section-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .filter-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .favorites-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .favorite-card {
            border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
          border: 1px solid #1f2937;
          background-color: #f8fafc;
          padding: 1rem;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          position: relative;
          overflow: hidden;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .favorite-card:hover {
          transform: rotate(-0.1deg) scale(1.01);
         
        }

        .favorite-card:nth-child(even) {
          transform: rotate(0.1deg);
        }

        .favorite-card:nth-child(even):hover {
          transform: rotate(0.1deg) scale(1.01);
        }

        .card-content {
          position: relative;
          z-index: 10;
          display: flex;
          gap: 1rem;
        
          width: 100%;
        }

        .venue-image {
          width: 20rem;
          height: 7rem;
          flex-shrink: 0;
          border: 2px solid #1f2937;
        }

        .venue-details {
          flex: 1;
        }

        .venue-name {
         text-align: start;
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;   
          margin: 0 0 0.25rem 0;
        }

        .venue-description {
         text-align: start;
          font-size: 0.85rem;
          color: #4b5563;
          margin: 0;
          line-height: 1.3;
        }

        .book-action {
          flex-shrink: 0;
        }

        @media (max-width: 480px) {
          .favorites-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .section-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .filter-buttons {
            justify-content: center;
          }

          .card-content {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }

          .venue-image {
            align-self: center;
          }
        }
      `}</style>

      <div className="favorites-container">
        {/* Header */}
        <SketchHeader
                  onClick={handleProfile}
                  title={'PROFILE'}
                  showBack={true}
                  onBack={() => console.log('뒤로가기')}
                  rightButtons={[]}
                />
        {/* <div className="header">
          <div className="logo">≡ LeTanTon Sheriff</div>
          <SketchBtn 
            variant="secondary" 
            size="small"
            onClick={handleProfile}
          >
            PROFILE
          </SketchBtn>
        </div> */}

        {/* Content Section */}
        <div className="content-section">
          {/* Section Header */}
          <div className="section-header">
            <h1 className="section-title">Favorites</h1>
            <div className="filter-buttons">
              <SketchBtn 
                variant="secondary" 
                size="small"
                onClick={handleSort}
              >
                SORT
              </SketchBtn>
              <SketchBtn 
                variant="secondary" 
                size="small"
                onClick={handleFilter}
              >
                FILTER
              </SketchBtn>
            </div>
          </div>

          {/* Favorites List */}
          <div className="favorites-list">
            {favorites.map((venue, index) => (
              <div key={venue.id} className="favorite-card">
                <HatchPattern opacity={0.4} />
                
                <div className="card-content">
                  <ImagePlaceholder 
                    src={venue.image} 
                    className="venue-image"
                  />
                  
                  <div className="venue-details">
                    <div className="venue-info">
                    <h3 className="venue-name">{venue.name}</h3>
                    <ShareIcon />
                    </div>
                    <p className="venue-description">{venue.description}</p>
                  </div>

                  <div className="book-action">
                    <SketchBtn 
                      variant="primary" 
                      size="small"
                      onClick={() => handleBook(venue)}
                    >
                      Book Now
                    </SketchBtn>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default FavoritesPage;