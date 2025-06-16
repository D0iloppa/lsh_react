import React, { useState } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

const ViewReviewPage = ({ 
  navigateToPageWithData, 
  PAGES,
  venueData = {
    name: 'Modern Bar',
    subtitle: 'The Rooftop',
    description: 'A chic rooftop bar offering panoramic views.',
    image: '/placeholder-venue.jpg'
  },
  ...otherProps 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const handleNotifications = () => {
    console.log('Notifications 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.NOTIFICATIONS);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
    // 검색 로직
  };

  const reviews = [
    {
      id: 1,
      userName: 'Sarah Nguyen',
      userImage: '/placeholder-user1.jpg',
      rating: 5,
      date: 'March 2023',
      comment: 'Amazing atmosphere with friendly staff and great drinks. Highly recommend!'
    },
    {
      id: 2,
      userName: 'Minh Tran',
      userImage: '/placeholder-user2.jpg',
      rating: 4,
      date: 'February 2023',
      comment: 'Great music and vibe, but a bit crowded on weekends.'
    }
  ];

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <>
      <style jsx>{`
        .view-review-container {
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

        .notification-icon {
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
        }

        .search-section {
          padding: 1rem;
          border-bottom: 2px solid #e5e7eb;
        }

        .venue-section {
          padding: 1.5rem;
          border-bottom: 3px solid #1f2937;
        }

        .venue-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .venue-image-container {
          margin-bottom: 1rem;
        }

        .venue-image {
          width: 100%;
          height: 200px;
          border: 3px solid #1f2937;
          transform: rotate(-0.3deg);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .venue-subtitle {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1rem;
          font-weight: bold;
          color: #d97706;
          margin-bottom: 0.5rem;
        }

        .venue-description {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.4;
        }

        .reviews-section {
          padding: 1.5rem;
        }

        .reviews-title {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.2rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1.5rem;
        }

        .review-card {
          border: 3px solid #1f2937;
          background-color: #f8fafc;
          padding: 1rem;
          margin-bottom: 1rem;
          transform: rotate(0.2deg);
          box-shadow: 2px 2px 0px #1f2937;
          position: relative;
          overflow: hidden;
        }

        .review-card:nth-child(even) {
          transform: rotate(-0.2deg);
        }

        .review-content {
          position: relative;
          z-index: 10;
        }

        .review-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }

        .user-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border: 2px solid #1f2937;
          border-radius: 50%;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.95rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .review-meta {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .review-text {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.9rem;
          color: #374151;
          line-height: 1.4;
          margin: 0;
        }

        @media (max-width: 480px) {
          .view-review-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
      `}</style>

      <div className="view-review-container">
        {/* Header */}
        <div className="header">
          <div className="logo">🍸 LeTanTon Sheriff</div>
          <div className="notification-icon" onClick={handleNotifications}>
            🔔
          </div>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <form onSubmit={handleSearch}>
            <SketchInput
              type="text"
              placeholder="Search for venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div>

        {/* Venue Information */}
        <div className="venue-section">
          <h1 className="venue-title">{venueData.name}</h1>
          
          <div className="venue-image-container">
            <ImagePlaceholder 
              src={venueData.image} 
              className="venue-image"
            />
          </div>

          <div className="venue-subtitle">{venueData.subtitle}</div>
          <p className="venue-description">{venueData.description}</p>
        </div>

        {/* User Reviews */}
        <div className="reviews-section">
          <h2 className="reviews-title">User Reviews</h2>
          
          {reviews.map((review, index) => (
            <div key={review.id} className="review-card">
              <HatchPattern opacity={0.03} />
              <div className="review-content">
                <div className="review-header">
                  <ImagePlaceholder 
                    src={review.userImage} 
                    className="user-avatar"
                  />
                  <div className="user-info">
                    <h3 className="user-name">{review.userName}</h3>
                    <p className="review-meta">
                      {renderStars(review.rating)} stars - {review.date}
                    </p>
                  </div>
                </div>
                <p className="review-text">{review.comment}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default ViewReviewPage;