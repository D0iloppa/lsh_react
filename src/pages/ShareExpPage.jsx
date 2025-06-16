import React, { useState } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

const ShareExpPage = ({ 
  navigateToPageWithData, 
  PAGES,
  venueData = {
    name: 'Modern Bar',
    image: '/placeholder-venue.jpg'
  },
  ...otherProps 
}) => {
  const [cardNumber, setCardNumber] = useState('');
  const [venueRating, setVenueRating] = useState(0);
  const [girlRating, setGirlRating] = useState(0);

  const handleMyReviews = () => {
    console.log('My Reviews 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.MY_REVIEWS);
  };

  const handleSubmitReview = () => {
    const reviewData = {
      venue: venueData.name,
      cardNumber,
      venueRating,
      girlRating,
      timestamp: new Date().toISOString()
    };
    console.log('Review submitted:', reviewData);
    // 리뷰 제출 로직
  };

  const StarRating = ({ rating, onRatingChange, label }) => (
    <div className="rating-section">
      <div className="rating-label">{label}</div>
      <div className="stars-container">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            className={`star-button ${rating >= star ? 'filled' : 'empty'}`}
            onClick={() => onRatingChange(star)}
          >
            ○
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <style jsx>{`
        .share-exp-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
          padding: 1.5rem;
        }

        .review-main-section {
          border: 3px solid #1f2937;
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 2rem;
          transform: rotate(-0.2deg);
          box-shadow: 3px 3px 0px #1f2937;
          position: relative;
          overflow: hidden;
        }

        .review-content {
          position: relative;
          z-index: 10;
        }

        .review-header {
          display: flex;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .venue-image {
          width: 80px;
          height: 80px;
          flex-shrink: 0;
        }

        .venue-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .venue-name {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 1rem;
        }

        .card-input-section {
          flex: 1;
        }

        .rating-section {
          margin-bottom: 1.5rem;
        }

        .rating-section:last-of-type {
          margin-bottom: 0;
        }

        .rating-label {
          font-family: 'Comic Sans MS', cursive, sans-serif;
          font-size: 0.95rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .stars-container {
          display: flex;
          gap: 0.5rem;
        }

        .star-button {
          background: none;
          border: 2px solid #1f2937;
          border-radius: 50%;
          width: 2rem;
          height: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 1.2rem;
          transition: all 0.2s;
          font-family: 'Comic Sans MS', cursive, sans-serif;
        }

        .star-button.empty {
          background-color: white;
          color: #6b7280;
        }

        .star-button.filled {
          background-color: #fbbf24;
          color: #1f2937;
          border-color: #f59e0b;
        }

        .star-button:hover {
          transform: scale(1.1);
        }

        .my-review-section {
          text-align: center;
        }

        @media (max-width: 480px) {
          .share-exp-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }

          .review-header {
            flex-direction: column;
            text-align: center;
          }

          .venue-image {
            width: 100%;
            height: 120px;
            align-self: center;
          }
        }
      `}</style>

      <div className="share-exp-container">
        {/* Main Review Section */}
        <div className="review-main-section">
          <HatchPattern opacity={0.05} />
          <div className="review-content">
            {/* Header with Image and Venue Info */}
            <div className="review-header">
              <div className="venue-image">
                <ImagePlaceholder 
                  src={venueData.image} 
                  className="venue-image"
                />
              </div>
              
              <div className="venue-info">
                <div className="venue-name">{venueData.name}</div>
                
                <div className="card-input-section">
                  <SketchInput
                    type="text"
                    placeholder="Card Number"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Rating Sections */}
            <StarRating 
              rating={venueRating}
              onRatingChange={setVenueRating}
              label="Rate the venue"
            />
            
            <StarRating 
              rating={girlRating}
              onRatingChange={setGirlRating}
              label="Rate the Girl"
            />
          </div>
        </div>

        {/* My Review Button */}
        <div className="my-review-section">
          <SketchBtn 
            variant="secondary" 
            size="medium"
            onClick={handleMyReviews}
          >
            My Review
          </SketchBtn>
        </div>
      </div>
    </>
  );
};

export default ShareExpPage;