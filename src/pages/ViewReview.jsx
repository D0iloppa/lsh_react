import React, { useState, useEffect } from 'react';
import HatchPattern from '@components/HatchPattern';
import SketchInput from '@components/SketchInput';
import ImagePlaceholder from '@components/ImagePlaceholder';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeaderMain'
import SketchDiv from '@components/SketchDiv'
import SketchBtn from '@components/SketchBtn'
import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';
import ApiClient from '@utils/ApiClient';
import LoadingScreen from '@components/LoadingScreen';
import { Filter, Martini, Store, User } from 'lucide-react';

import { Star, Edit3 } from 'lucide-react';
import axios from 'axios';

const ViewReviewPage = ({
  navigateToPageWithData,
  navigateToPage,
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
  const [sortOrder1, setSortOrder1] = useState('rating_high'); // 정렬 순서
  const [sortOrder, setSortOrder] = useState('latest'); // 정렬 순서

  const [targetTypeFilter, setTargetTypeFilter] = useState('ALL'); // 타겟 타입 필터
  const [originalReviews, setOriginalReviews] = useState([]); // 원본 데이터 보관
  const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  const API_HOST = import.meta.env.VITE_API_HOST;


  

  useEffect(() => {


    if (messages && Object.keys(messages).length > 0) {
      console.log('✅ Messages loaded:', messages);
      window.scrollTo(0, 0);
    }
  }, [messages, currentLang]);


  const handleReservation = (review) => {
    console.log('Rebook clicked:', review);
    navigateToPageWithData && navigateToPageWithData(PAGES.RESERVATION, {
      target: review.target_type,
      id: (review.target_type == 'venue') ? review.venue_id : review.target_id,
      staff: (review.target_type == 'staff') ? { name : review.targetName} : {}
    });
  };

  const handleViewDetail = (review) => {
  console.log('View detail clicked:', review);
  
  if (review.target_type === 'venue') {
    // venue인 경우 VIEWREVIEW 페이지로 이동
    navigateToPageWithData && navigateToPageWithData(PAGES.DISCOVER, {
      venueId: review.venue_id
    });
  } else if (review.target_type === 'staff') {
    // staff인 경우 STAFFDETAIL 페이지로 이동
    navigateToPageWithData && navigateToPageWithData(PAGES.STAFFDETAIL, {
      staff_id: review.target_id,
      fromReview: true
    });
  }
};

  const applyFiltersAndSort = () => {

    console.log('filter', otherProps);

    const { reservationId = false, clientId = false, target, targetId } = otherProps

    let userFilter = false;
    if (reservationId && clientId) userFilter = true;

    let filtered = [...originalReviews];

    // 타겟 타입 필터링
    if (targetTypeFilter !== 'ALL') {
      filtered = filtered.filter(review => review.target_type === targetTypeFilter);
    }

    if (userFilter) {
      // filtered = filtered.filter(review => review.user_id == clientId);
      filtered = filtered.filter(review => review.reservation_id == reservationId);
    }

    console.log('tt', filtered);

    // 날짜 정렬
    filtered.sort((a, b) => {
      // 1차 정렬: 평점
      let ratingSort = 0;
      if (sortOrder1 === 'rating_high') {
        ratingSort = b.rating - a.rating;
      } else if (sortOrder1 === 'rating_low') {
        ratingSort = a.rating - b.rating;
      }

      // 평점이 다르면 평점으로 정렬
      if (ratingSort !== 0) {
        return ratingSort;
      }

      // 평점이 같으면 날짜로 정렬
      const dateA = new Date(a.created_at);
      const dateB = new Date(b.created_at);

      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    setReviews(filtered);
  };

  useEffect(() => {
    applyFiltersAndSort();
  }, [sortOrder, sortOrder1, targetTypeFilter, originalReviews]);

  // ViewReview
  useEffect(() => {
    const loadVenueReviews = async () => {
      //if (!venueId) return;

      try {
        setLoading(true);
        const response = await ApiClient.postForm('/api/getVenueReviewList', {
          venue_id: venueId || -1
        });

        const reviewsData = response.data || [];
        //console.log("reviewsData", reviewsData)
        setOriginalReviews(reviewsData);
        setReviews(reviewsData);

        // 유니크한 user_id들 추출
        const userIds = [...new Set(reviewsData.map(review => review.user_id))];

        // 모든 유저 정보를 병렬로 요청
        const userPromises = userIds.map(userId =>
          axios.get(`${API_HOST}/api/getUserInfo`, {
            params: { user_id: userId }
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

  const handleBack = () => {
    
    navigateToPage(PAGES.HOME);
  };
  

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Search:', searchQuery);
    // 검색 로직
  };

 const renderStars = (rating) => {
  return (
    <>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          fill={i < rating ? '#fbbf24' : 'none'}
          color={i < rating ? '#fbbf24' : '#d1d5db'}
          style={{ marginRight: 2 }}
        />
      ))}
    </>
  );
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
            padding: 8px 8px;
            border: 1px solid #333;
            border-radius: 8px;
            background: white;
            font-size: 13px;
            flex: 1;
            min-width: 0;
            max-width: none;
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg fill='black' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.5 7l4.5 4 4.5-4'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 8px center;
            background-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .map-filter-selects {
            display: flex;
            gap: 8px;
            margin-top: 0.5rem;
            margin-bottom: 10px;
            width: 100%;
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

        .review-type{margin-bottom: 10px;
          padding: 2px;
          border-radius: 10px;
          width: 50px;
          text-align: center;}

        .review-type.venue {
          background: #b8fbff;
        }

        .review-type.staff {
         background: #ffffaa;
        }

        @media (max-width: 480px) {
          .view-review-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }

        .review-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 8px;
          }

          .review-type-badge {
            display: inline-flex;
            align-items: center;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
            border: 1px solid;
          }

          .review-type-badge.venue {
            background-color: #a7f3d0;
            color: #047857;
            border-color: #34d399;
          }

          .review-type-badge.staff {
            background-color: #fef08a;
            color: #92400e;
            border-color: #fbbf24;
          }

          .review-target-name {
            font-size: 16px;
            font-weight: 500;
            color: #333;
            letter-spacing: 0.3px;
          }
      `}</style>

      <div className="view-review-container">
        {/* Header */}

        <SketchHeader
          title={get('Profile1.1')}
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />

        {/* Search Section */}
        <div className="map-filter-selects">
          <select
            className="select-box"
            value={sortOrder1}
            onChange={(e) => setSortOrder1(e.target.value)}
          >
            <option value="rating_high">{get('Sort.Rating.High')}</option>
            <option value="rating_low">{get('Sort.Rating.Low')}</option>
          </select>
          <select
            className="select-box"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="latest">{get('Newest.filter')}</option>
            <option value="oldest">{get('Oldest.filter')}</option>
          </select>
          <select
            className="select-box"
            value={targetTypeFilter}
            onChange={(e) => setTargetTypeFilter(e.target.value)}
          >
            <option value="ALL">{get('main.filter.category.all')}</option>
            <option value="venue">{get('title.text.14')}</option>
            <option value="staff">{get('title.text.16')}</option>
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
              <Martini size={15} />
              <span>Loading...</span>
            </div>
          ) : reviews.length > 0 ? (
            reviews.map((review, index) => (
              <SketchDiv key={review.review_id} className="review-card">
                <HatchPattern opacity={0.03} />
                <div className="review-content">
                  <div className="review-header">
                    <ImagePlaceholder
                      //src={userImages[review.user_id] || '/placeholder-user.jpg'}
                      src={review.targetImage || '/placeholder-user.jpg'}
                      className="user-avatar" alt="profile"
                    />
                    <div>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px'
                      }}>
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          backgroundColor: review.target_type === 'venue' ? '#dcfce7' : '#fef3c7',
                          color: review.target_type === 'venue' ? '#16a34a' : '#d97706'
                        }}>
                          {review.target_type === 'venue' ? (
                            <Store size={14} />
                          ) : (
                            <User size={14} />
                          )}
                        </div>
                        <span style={{
                          fontSize: '15px',
                          fontWeight: '500',
                          color: '#333'
                        }}>
                          {review.targetName}
                        </span>
                      </div>



                      <div className="user-info"></div>
                      <div style={{ 'display': 'flex' }}>
                        <span style={{ marginRight: '5px', fontSize: '0.95rem' }}>작성자 :</span>
                        <h3 className="user-name">{review.user_name}</h3>
                      </div>
                      <p className="review-meta">
                        {renderStars(review.rating)} stars - {new Date(review.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="review-text">{review.content}</p>

                  {/* 예약하기 버튼 */}
                  {/* <div className="review-actions" style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                    <SketchBtn
                      className="reservation-btn"
                      onClick={() => {
                        if (review.is_reservation) {
                          handleReservation(review);
                        }
                      }}
                      disabled={!review.is_reservation}
                      style={{
                        width: '30%',
                        backgroundColor: review.is_reservation ? '#10b981' : '#9ca3af', // 회색으로 비활성화 느낌
                        color: '#fefefe',
                        padding: '0.5rem 1rem',
                        cursor: review.is_reservation ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {review.is_reservation ? '예약하기' : '예약 마감'}
                    </SketchBtn>

                  </div> */}

                  <div className="review-actions" style={{
                    paddingTop: '1rem',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'flex-end'
                  }}>
                  <SketchBtn 
                    onClick={() => {
                      console.log('버튼 클릭됨!');
                      handleViewDetail(review);
                    }}
                    style={{
                        width: '30%',
                        backgroundColor: review.is_reservation ? '#10b981' : '#9ca3af', // 회색으로 비활성화 느낌
                        color: '#fefefe',
                        padding: '0.5rem 1rem',
                        cursor: review.is_reservation ? 'pointer' : 'not-allowed',
                        transition: 'all 0.2s ease'
                      }}
                  >
                    상세보기
                  </SketchBtn>
</div>

                </div>
              </SketchDiv>
            ))
          ) : (
            <div style={{ textAlign: 'center', color: 'gray' }}>리뷰가 없습니다.</div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewReviewPage;