import React, { useState } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

const FavoritesPage = ({ 
  navigateToPageWithData, 
  PAGES,
  ...otherProps 
}) => {
  const [sortBy, setSortBy] = useState('name');
  const [filter, setFilter] = useState('all');

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
        }

        .logo {
          font-family: 'Comic Sans MS', cursive, sans-serif;
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
          font-family: 'Comic Sans MS', cursive, sans-serif;
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
          border: 3px solid #1f2937;
          background-color: #f8fafc;
          padding: 1rem;
          transform: rotate(-0.1deg);
          transition: all 0.2s;
          box-shadow: 3px 3px 0px #1f2937;
          position: relative;
          overflow: hidden;
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .favorite-card:hover {
          transform: rotate(-0.1deg) scale(1.01);
          box-shadow: 4px 4px 0px #1f2937;
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
          align-items: center;
          width: 100%;
        }

        .venue-image {
          width: 4rem;
          height: 4rem;
          flex-shrink: 0;
          border: 2px solid #1f2937;
        }

        .venue-details {
          flex: 1;
        }

        .venue-name {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0 0 0.25rem 0;
        }

        .venue-description {
          font-family: 'Comic Sans MS', cursive, sans-serif;
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
        <div className="header">
          <div className="logo">≡ LeTanTon Sheriff</div>
          <SketchBtn 
            variant="secondary" 
            size="small"
            onClick={handleProfile}
          >
            PROFILE
          </SketchBtn>
        </div>

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
                <HatchPattern opacity={0.03} />
                
                <div className="card-content">
                  <ImagePlaceholder 
                    src={venue.image} 
                    className="venue-image"
                  />
                  
                  <div className="venue-details">
                    <h3 className="venue-name">{venue.name}</h3>
                    <p className="venue-description">{venue.description}</p>
                  </div>

                  <div className="book-action">
                    <SketchBtn 
                      variant="primary" 
                      size="small"
                      onClick={() => handleBook(venue)}
                    >
                      Book
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