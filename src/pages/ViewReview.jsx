import React, { useState, useEffect } from 'react'; 
import HatchPattern from '@components/HatchPattern';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader'
import SketchDiv from '@components/SketchDiv'
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';
import {Filter, Martini} from 'lucide-react';

const ViewReviewPage = ({ 
  navigateToPageWithData, 
  PAGES,
  venueData = {
    name: 'Modern Bar',
    subtitle: 'The Rooftop',
    description: 'A chic rooftop bar offering panoramic views.',
    image: '/placeholder-venue.jpg'
  },
  goBack,
  ...otherProps 
}) => {
 
  const venueId = otherProps?.venueId || null;
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
   console.log("venueId", venueId)
   const [userImages, setUserImages] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
const API_HOST = import.meta.env.VITE_API_HOST;
     useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);

  // ViewReview
  useEffect(() => {
  const loadVenueReviews = async () => {
  if (!venueId) return;
  
  try {
    setLoading(true);
    const response = await ApiClient.postForm('/api/getVenueReviewList', {
      venue_id: venueId
    });
    
    const reviewsData = response.data || [];
    setReviews(reviewsData);
    
    // 유니크한 user_id들 추출
    const userIds = [...new Set(reviewsData.map(review => review.user_id))];
    
    // 모든 유저 정보를 병렬로 요청
    const userPromises = userIds.map(userId => 
      ApiClient.get('/api/getUserInfo', {
        user_id: userId
      }).catch(error => {
        console.error(`유저 ${userId} 정보 실패:`, error);
        return { data: { image_url: '/placeholder-user.jpg' } };
      })
    );
    
    const userResponses = await Promise.all(userPromises);
    
    const userImagesData = {};
    userIds.forEach((userId, index) => {
      userImagesData[userId] = userResponses[index].data?.image_url || '/placeholder-user.jpg';
    });

  console.log("userImagesData", userImagesData)
    
    setUserImages(userImagesData);
    
  } catch (error) {
    console.error('리뷰 로딩 실패:', error);
    setReviews([]);
  } finally {
    setLoading(false);
  }
};
  

  loadVenueReviews();
}, [venueId]);



  const handleNotifications = () => {
    console.log('Notifications 클릭');
    navigateToPageWithData && navigateToPageWithData(PAGES.NOTIFICATIONS);
  };

    const handleBack = (venueId) => {
    navigateToPageWithData(PAGES.DISCOVER, { venueId });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
    // 검색 로직
  };

  const renderStars = (rating) => {
    return '⭐'.repeat(rating);
  };

  return (
    <>
      <style jsx="true">{`
        .view-review-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;

          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
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

        .notification-icon {
          width: 2rem;
          height: 2rem;
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
        .select-box {
          padding: 8px 12px;
          border: 1px solid #333;
          border-radius: 8px;
          background: white;
          font-size: 14px;
          min-width: 135px;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg fill='black' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 7l4.5 4 4.5-4'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 10px center;
          background-size: 12px;
        }
        .map-filter-selects {
          display: flex;
          flex-wrap: nowrap;
          overflow-x: auto;
          gap: 12px;
          margin-top: 0.5rem;
          padding-right: 1rem;
          scrollbar-width: none;
          margin-bottom: 10px;
        }
        .map-filter-selects::-webkit-scrollbar { display: none; }

        .venue-section {
          padding: 1.5rem;
        }

        .venue-title {
          font-size: 1.3rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        // .venue-image-container {
        //   margin-bottom: 1rem;
        // }

        .venue-image {
          width: 100%;
          height: 200px;
          border: 3px solid #1f2937;
          transform: rotate(-0.3deg);
          box-shadow: 3px 3px 0px #1f2937;
        }

        .venue-subtitle {
          font-size: 1rem;
          font-weight: bold;
          color: #d97706;
          margin-bottom: 0.5rem;
          margin-top: 20px;
        }

        .venue-description {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.4;
        }

        // .reviews-section {
        //   padding: 1.5rem;
        // }

        .reviews-title {
          font-size: 1.2rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
          margin-top: 20px;
        }

        .review-card {
          background-color: #f8fafc;
          padding: 1rem;
          margin-bottom: 1rem;
          transform: rotate(0.2deg);
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
          width: 60px;
          height: 60px;
          flex-shrink: 0;
        }

        .user-info {
          flex: 1;
        }

        .user-name {
          font-size: 0.95rem;
          font-weight: bold;
          color: #1f2937;
          margin: 0;
        }

        .review-meta {
          font-size: 0.8rem;
          color: #6b7280;
          margin: 0.25rem 0 0 0;
        }

        .review-text {
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

        <SketchHeader
          title={get('Profile1.1')}
          showBack={true}
          onBack={goBack}
          rightButtons={[]}
        />

        {/* Search Section */}
        <div className="map-filter-selects">
        <select class="select-box">
          <option value="ALL">최신순</option>
          <option value="BAR">최신순</option>
          <option value="RESTAURANT">과거순</option>
          </select>
          <select class="select-box">
            <option value="ALL">유형 전체</option>
          <option value="BAR">매장</option>
          <option value="RESTAURANT">Staff</option>
          </select>
          </div>
        {/* <div className="search-section">
          <form onSubmit={handleSearch}>
            <SketchInput
              type="text"
              placeholder="Search for venues..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </div> */}

        {/* User Reviews */}
        <div className="reviews-section">
          
          {loading ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              textAlign: 'center', 
              color: 'gray',
              height: '200px'
            }}>
              <Martini size={15}/>
              <span>리뷰 로딩 중...</span>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <SketchDiv key={review.review_id} className="review-card">
                <HatchPattern opacity={0.03} />
                <div className="review-content">
                  <div className="review-header">
                    <ImagePlaceholder 
                      src={userImages[review.user_id] || '/placeholder-user.jpg'}
                      className="user-avatar"
                    />
                    <div className="user-info">
                      <h3 className="user-name">{review.user_name}</h3>
                      <p className="review-meta">
                        {renderStars(review.rating)} stars - {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="review-text">{review.content}</p>
                </div>
              </SketchDiv>
            ))
          ) : (
            <div style={{textAlign: 'center', color:'gray'}}>리뷰가 없습니다.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewReviewPage;