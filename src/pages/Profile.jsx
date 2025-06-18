import React, { useState, useEffect } from 'react';  // ⬅ useEffect 추가

import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';
import SketchMenuBtn from '@components/SketchMenuBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

import SketchHeader from '@components/SketchHeader'

import { Star, Edit3 } from 'lucide-react';

import { useAuth } from '../contexts/AuthContext';

const Profile = ({ 
  navigateToPageWithData, 
  PAGES,
  goBack,
  ...otherProps 
}) => {

    useEffect(() => {
      window.scrollTo(0, 0);
    }, []);

  const { user, isLoggedIn } = useAuth();
  
  console.log('welcome-profile', user);

  const handleBack = () => {
    // goBack();
    navigateToPageWithData && navigateToPageWithData(PAGES.ACCOUNT);
  };


  // 샘플 리뷰 데이터
  const userReviews = [
    {
      id: 1,
      venueName: "Sky Lounge",
      rating: 5,
      comment: "Amazing atmosphere with friendly staff and great drinks.",
      date: "2024-03-15"
    },
    {
      id: 2,
      venueName: "Neon Dreams Bar",
      rating: 4,
      comment: "Great music and vibe, but a bit crowded on weekends.",
      date: "2024-03-10"
    }
  ];

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

        /* Profile Info Section */
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
          background: linear-gradient(135deg, #94fff9,rgb(255, 219, 158));
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

        .profile-image::before {
          content: '';
          position: absolute;
          top: -2px;
          right: -2px;
          width: 1rem;
          height: 1rem;
          background-color: #f3f4f6;
          border: 0.8px solid #666;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 1;
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

        .edit-btn {
          margin-left: auto;
          width: 2.5rem;
          height: 2.5rem;
          background-color: #f8fafc;
          border: 0.8px solid #666;
          border-radius: 6px 12px 8px 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transform: rotate(-1deg);
          transition: all 0.2s;
        }

        .edit-btn:hover {
          background-color: #e2e8f0;
          transform: rotate(-1deg) scale(1.05);
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

        /* Recent Reviews Section */
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

        .view-all-btn:hover {
          color: #374151;
        }

        .review-item {
          display: flex;
          gap: 0.75rem;
          padding: 0.75rem 0;
          border-bottom: 1px dashed #e5e7eb;
          position: relative;
          z-index: 2;
        }

        .review-item:last-child {
          border-bottom: none;
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

        /* Menu Section */
        .menu-section {
          padding: 0 1.5rem 1.5rem 1.5rem;
        }

        .menu-item {
          width: 100%;
          margin-bottom: 0.75rem;
        }

        .logout {
          margin-top: 1rem;
        }

        .logout .menu-item {
          border-color: #ef4444;
          color: #dc2626;
        }

        .logout .menu-item:hover {
          background-color: #fef2f2;
        }
      `}</style>

      <div className="account-container">
        
        {/* Header */}
        <SketchHeader 
          title="Profile"
          showBack={true}
          onBack={handleBack}
          rightButtons={[]}
        />

        <div className="content-section">
          {/* Profile Info Section */}
          <SketchDiv className="profile-info">
            <HatchPattern opacity={0.4} />
            
            <div className="profile-header">
              <div className="profile-image">
                JD
              </div>
              
              <div className="profile-details">
                <h2>John Doe</h2>
                <p>john.doe@example.com</p>
                <p>Member since March 2024</p>
              </div>
            </div>

            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-number">12</span>
                <span className="stat-label">Bookings</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">8</span>
                <span className="stat-label">Reviews</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">15</span>
                <span className="stat-label">Favorites</span>
              </div>
            </div>
          </SketchDiv>

          {/* Recent Reviews Section */}
          <SketchDiv className="reviews-section">
            <HatchPattern opacity={0.02} />
            
            <div className="section-header">
              <h3 className="section-title">Recent Reviews</h3>
              <button className="view-all-btn" onClick={() => console.log('View all reviews')}>
                View All
              </button>
            </div>

            <div className="reviews-list">
              {userReviews.map((review) => (
                <div key={review.id} className="review-item">
                  <div className="review-content">
                    <div className="review-venue">{review.venueName}</div>
                    <div className="review-rating">
                      {[...Array(5)].map((_, i) => (
                        <Star 
                          key={i} 
                          size={12} 
                          fill={i < review.rating ? '#fbbf24' : 'none'}
                          color={i < review.rating ? '#fbbf24' : '#d1d5db'}
                        />
                      ))}
                      <span style={{fontSize: '0.75rem', color: '#6b7280', marginLeft: '0.25rem'}}>
                        {review.rating}/5
                      </span>
                    </div>
                    <div className="review-text">{review.comment}</div>
                    <div className="review-date">{review.date}</div>
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