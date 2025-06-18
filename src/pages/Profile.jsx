import React, { useState, useEffect } from 'react';
import axios from 'axios';

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader';

import { Star, Edit3 } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

const Profile = ({
  navigateToPageWithData,
  PAGES,
  goBack,
  ...otherProps
}) => {
  const { user, isLoggedIn } = useAuth();
  const [userInfo, setUserInfo] = useState({});
  const [userReviews, setUserReviews] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchUserInfo = async () => {
      try {
        const response = await axios.get('/api/api/getUserInfo', {
          params: { user_id: user?.user_id || 1 }
        });
        setUserInfo(response.data || {});
      } catch (error) {
        console.error('유저 정보 불러오기 실패:', error);
      }
    };

    const fetchUserReviews = async () => {
    try {
        const response = await axios.get('/api/api/getMyReviewList', {
          params: { user_id: user?.user_id || 1 }
        });
        setUserReviews(response.data || []);
      } catch (error) {
        console.error('리뷰 목록 불러오기 실패:', error);
      }
    };

    fetchUserInfo();
    fetchUserReviews();

  }, [user]);

  const handleBack = () => {
    navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
  };

  return (
    <>
      <style jsx>{`
       

        .account-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          position: relative;
        }

        .content-section {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .profile-info {
          padding: 1.5rem;
          background-color: #fefefe;
          border: 0.8px solid #666;
          position: relative;
          overflow: hidden;
          border-top-left-radius: 15px 8px;
          border-top-right-radius: 8px 12px;
          border-bottom-right-radius: 12px 6px;
          border-bottom-left-radius: 6px 14px;
          transform: rotate(-0.1deg);
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .profile-image {
          width: 4rem;
          height: 4rem;
          border-radius: 50%;
          background: linear-gradient(135deg, #94fff9, rgb(255, 219, 158));
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: bold;
          color: white;
          border: 0.8px solid #666;
          transform: rotate(2deg);
          position: relative;
        }

        .profile-details h2 {
          margin: 0 0 0.25rem 0;
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
        }

        .profile-details p {
          margin: 0;
          color: #6b7280;
          font-size: 0.875rem;
        }

        .profile-stats {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
          position: relative;
          z-index: 2;
        }

        .stat-item {
          text-align: center;
          flex: 1;
        }

        .stat-number {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1f2937;
          display: block;
        }

        .stat-label {
          font-size: 0.75rem;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .reviews-section {
          padding: 1.5rem;
          background-color: #fefefe;
          border: 0.8px solid #666;
          position: relative;
          overflow: hidden;
          border-top-left-radius: 12px 15px;
          border-top-right-radius: 14px 8px;
          border-bottom-right-radius: 8px 12px;
          border-bottom-left-radius: 10px 6px;
          transform: rotate(0.2deg);
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1rem;
          position: relative;
          z-index: 2;
        }

        .section-title {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .view-all-btn {
          font-size: 0.875rem;
          color: #6b7280;
          text-decoration: underline wavy #999;
          cursor: pointer;
          background: none;
          border: none;
          padding: 0;
        }

        .review-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px dashed #e5e7eb;
        }

        .review-content {
          flex: 1;
        }

        .review-venue {
          font-weight: 500;
          color: #1f2937;
          font-size: 0.875rem;
          margin-bottom: 0.25rem;
        }

        .review-rating {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          margin-bottom: 0.25rem;
        }

        .review-text {
          font-size: 0.75rem;
          color: #6b7280;
          line-height: 1.4;
          margin-bottom: 0.25rem;
        }

        .review-date {
          font-size: 0.7rem;
          color: #9ca3af;
        }
          .profile-image {
              width: 100px;
              height: 100px;
              border-radius: 50%;
              overflow: hidden;
              background: linear-gradient(135deg, #94fff9, rgb(255, 219, 158));
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 1.25rem;
              font-weight: bold;
              color: white;
              border: 0.8px solid #666;
              transform: rotate(2deg);
              position: relative;
            }

            .profile-image img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            }

            .icon-tiny {
                width: 16px;
                height: 16px;
                margin-right: 4px;
                vertical-align: middle;
              }

      `}</style>

      <div className="account-container">
        <SketchHeader
          title="Profile"
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />

        <div className="content-section">
          <SketchDiv className="profile-info">
            <HatchPattern opacity={0.4} />

            <div className="profile-header">
              <div className="profile-image">
                <img src={userInfo.image_url} alt="profile" />
            </div>
              <div className="profile-details">
                <h2>{userInfo?.nickname || '닉네임 없음'}</h2>
                <p>{userInfo?.email || '이메일 없음'}</p>
                <p>{userInfo?.created_at
                ? `Member since ${new Date(userInfo.created_at).toLocaleString('en-US', {
                    year: 'numeric',
                    month: 'long'
                  })}`
                : '가입일 정보 없음'}</p>
              </div>
            </div>

            <div className="profile-stats">
            <div className="stat-item">
              <span className="stat-number">{userInfo?.booking_cnt ?? 0}</span>
              <span className="stat-label">Bookings</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo?.review_cnt ?? 0}</span>
              <span className="stat-label">Reviews</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{userInfo?.favorites_cnt ?? 0}</span>
              <span className="stat-label">Favorites</span>
            </div>
          </div>
          </SketchDiv>

          <SketchDiv className="reviews-section">
            <HatchPattern opacity={0.02} />
            <div className="section-header">
              <h3 className="section-title">Recent Reviews</h3>
            </div>

            <div className="reviews-list">
              {userReviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-content">
                    <div className="review-venue">
                      {review.target_type === 'venue' && (
                        <svg className="icon-tiny" viewBox="0 0 24 24">
                          <path d="M3 9L12 2L21 9V20A1 1 0 0 1 20 21H4A1 1 0 0 1 3 20V9Z" stroke="black" strokeWidth="1.5" fill="none"/>
                          <path d="M9 21V12H15V21" stroke="black" strokeWidth="1.5" fill="none"/>
                        </svg>
                      )}
                      {review.target_type === 'staff' && (
                        <svg className="icon-tiny" viewBox="0 0 24 24">
                          <circle cx="12" cy="7" r="4" stroke="black" strokeWidth="1.5" fill="none"/>
                          <path d="M5.5 21a6.5 6.5 0 0 1 13 0" stroke="black" strokeWidth="1.5" fill="none"/>
                        </svg>
                      )}
                      <span>{review.venue_name}</span>
                    </div>

                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          fill={i < review.rating ? '#fbbf24' : 'none'}
                          color={i < review.rating ? '#fbbf24' : '#d1d5db'}
                        />
                      ))}
                      <span style={{ fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem' }}>
                        {review.rating}/5
                      </span>
                    </div>
                    <div className="review-text">{review.content}</div>
                    <div className="review-date">
                      {review.created_at
                        ? new Date(review.created_at).toLocaleString('ko-KR', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                            hour12: false
                          }).replace(/\./g, '-').replace(' ', ' ').replace(/- /g, '-')
                        : ''}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </SketchDiv>
        </div>
      </div>
    </>
  );
};

export default Profile;
