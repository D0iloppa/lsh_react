import React, { useState, useEffect } from 'react'; 
import SketchHeader from '@components/SketchHeader';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';
import LoadingScreen from '@components/LoadingScreen';
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

import ApiClient from '@utils/ApiClient';
import Swal from 'sweetalert2';

const ShareExpPage = ({ 
  navigateToPageWithData, 
  PAGES,
  venueData = {
    name: 'Modern Bar',
    image: '/placeholder-venue.jpg'
  },
  goBack,
  ...otherProps 
}) => {

   const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();    
  const [cardNumber, setCardNumber] = useState('');
  const [venueRating, setVenueRating] = useState(0);
  const [girlRating, setGirlRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const [venueInfo, setVenueInfo] = useState({});

  useEffect(() => {
    

    console.log('venueData', venueData, otherProps);

    setVenueInfo(venueData);
  }, [venueData]);

  const handleSubmitReview = () => {
    if (!reviewText.trim()) {
      alert('리뷰 내용을 입력해주세요.');
      return;
    }
    
    if (venueRating === 0) {
      alert('장소 별점을 선택해주세요.');
      return;
    }

    const reviewPayload = {
      venue_id: venueData.id || venueData.venue_id,
      content: reviewText,
      rating: venueRating,
      target_type: 'venue'
    };
    
    console.log('Review payload:', reviewPayload);

    ApiClient.postForm('/api/admin/official_review', reviewPayload).then(response => {
      console.log('Review submitted successfully:', response);
      Swal.fire({
        title: '리뷰 제출 완료',
        text: '리뷰가 제출되었습니다.',
        icon: 'success',
        confirmButtonText: '확인'
      }).then(() => {
        goBack();
      });
    }).catch(error => {
      console.error('Error submitting review:', error);
      Swal.fire({
        title: '리뷰 제출 실패',
        text: '리뷰 제출에 실패했습니다.',
        icon: 'error',
        confirmButtonText: '확인'
      });
    });
    
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
          justify-content: space-between;
        }

        .venue-name {
         
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

        <SketchHeader
          title={'Confirm and pay'}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />
      <div className="share-exp-container">
        {/* Main Review Section */}
        <div className="review-main-section">
          <HatchPattern opacity={0.4} />
          <div className="review-content">
            {/* Header with Image and Venue Info */}
            <div className="review-header">
              <div className="venue-image">
                <ImagePlaceholder 
                  src={venueData.image_url} 
                  className="venue-image"
                />
              </div>
              
              <div className="venue-info">
                <div className="venue-name">{venueData.venue_name}</div>
                
                <div className="card-input-section">
                <SketchInput
                    name="review"
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    placeholder={'리뷰를 작성해주세요...'}
                    as="textarea"
                    rows={8}
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
          </div>
        </div>

        {/* My Review Button */}
        <div className="my-review-section">
          <SketchBtn
            className="full-width"
            onClick={handleSubmitReview}
            disabled={!reviewText.trim() || venueRating === 0}
          >
            리뷰 제출하기
            <HatchPattern opacity={0.4} />
          </SketchBtn>
        </div>
         <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>
      </div>
    </>
  );
};

export default ShareExpPage;