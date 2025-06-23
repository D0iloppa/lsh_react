import React, { useState, useEffect } from 'react'; 
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchTextarea from '@components/SketchTextarea';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

const ShareExpPage = ({ 
  navigateToPageWithData, 
  PAGES,
  pageData = {},
  goBack,
  ...otherProps 
}) => {

  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();    
  const [venueRating, setVenueRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  // pageData에서 필요한 정보 추출
  const {
    reservation_id,
    image = '/placeholder-venue.jpg',
    user_id,
    target,
    target_id,
    targetName = 'Venue Name',
    hostName
  } = otherProps;

  useEffect(() => {
    const initializeData = async () => {
      window.scrollTo(0, 0);
  
      // pageData 콘솔 출력
      console.log('📋 ShareExpPage pageData:', otherProps);

      if (messages && Object.keys(messages).length > 0) {
        console.log('✅ Messages loaded:', messages);
        console.log('🌐 Current language set to:', currentLang);
      }
    };

    initializeData();
  }, [messages, currentLang, pageData]);

  const handleSubmitReview = () => {
    if (venueRating === 0) {
      alert('평점을 선택해주세요.');
      return;
    }
    
    if (!reviewText.trim()) {
      alert('리뷰를 작성해주세요.');
      return;
    }

    const reviewData = {
      reservation_id,
      user_id,
      target,
      target_id,
      rating: venueRating,
      review_text: reviewText,
      timestamp: new Date().toISOString()
    };
    
    console.log('📝 Review submitted:', reviewData);
    // 리뷰 제출 API 호출 로직
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
      <style jsx="true">{`
        .share-exp-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
          padding: 1.5rem;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }

        .review-main-section {
          border-radius: 5px;
          border: 1px solid #1f2937;
          background-color: #f8fafc;
          padding: 1.5rem;
          margin-bottom: 2rem;
          transform: rotate(-0.2deg);
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
          justify-content: center;
        }

        .venue-name {
          font-size: 1.1rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
        }

        .host-name {
          font-size: 0.9rem;
          color: #6b7280;
        }

        .rating-section {
          margin-bottom: 1.5rem;
        }

        .rating-label {
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
        }

        .star-button.empty {
          background-color: white;
          color: #6b7280;
        }

        .star-button.filled {
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
          color: #1f2937;
          border-color: #778eaf;
        }

        .star-button:hover {
          transform: scale(1.1);
        }

        .review-textarea-section {
          margin-bottom: 1.5rem;
        }

        .textarea-label {
          font-size: 0.95rem;
          font-weight: bold;
          color: #1f2937;
          margin-bottom: 0.5rem;
          display: block;
        }

        .submit-section {
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

      <SketchHeader
        title={get('Review2.3')} // '리뷰 등록'
        showBack={true}
        onBack={goBack}
        rightButtons={[]}
      />
      
      <div className="share-exp-container">
        <div className="review-main-section">
          <HatchPattern opacity={0.4} />
          <div className="review-content">
            {/* Header with Image and Venue Info */}
            <div className="review-header">
              <div className="venue-image">
                <ImagePlaceholder 
                  src={image} 
                  className="venue-image"
                />
              </div>
              
              <div className="venue-info">
                <div className="venue-name">{targetName}</div>
                {hostName && <div className="host-name">{hostName}</div>}
              </div>
            </div>

            {/* Rating Section */}
            <StarRating 
              rating={venueRating}
              onRatingChange={setVenueRating}
              label={get('Review2.1')} // '장소 평가'
            />

            {/* Review Text Section */}
            <div className="review-textarea-section">
              <label className="textarea-label">{get('Review2.2')}</label>
              <SketchTextarea
                placeholder={get('Review2.2')}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="submit-section">
          <SketchBtn 
            variant="primary" 
            size="large"
            onClick={handleSubmitReview}
          >
            <HatchPattern opacity={0.4} />
            {get('Review2.3')} {/* '리뷰 등록' */}
          </SketchBtn>
        </div>

        <LoadingScreen 
          variant="cocktail"
          loadingText="Loading..."
          isVisible={isLoading} 
        />
      </div>
    </>
  );
};

export default ShareExpPage;