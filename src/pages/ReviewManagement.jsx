import React, { useState } from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

const mockReviews = [
  {
    id: 1,
    name: 'Emily Tran',
    rating: 5.0,
    content: 'Amazing atmosphere and friendly staff. Will visit again!'
  },
  {
    id: 2,
    name: 'Lucas Nguyen',
    rating: 3.5,
    content: 'Good service but the music was too loud.'
  },
  {
    id: 3,
    name: 'Sophie Le',
    rating: 4.0,
    content: 'Great place but the wait time was long.'
  },
];

const ReviewManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  const [ratingFilter, setRatingFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('Newest');

  return (
    <>
      <style jsx="true">{`
        .review-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .filter-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 1.1rem 0 1.2rem 0;
        }
        .filter-label {
          font-size: 1rem;
          margin-right: 0.5rem;
        }
        .filter-select {
          font-size: 1rem;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 0.2rem 1.2rem 0.2rem 0.5rem;
          background: #fff;
        }
        .review-list {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .review-card {
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
        }
        .review-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.2rem;
        }
        .review-name {
          font-size: 1.05rem;
          font-weight: 600;
        }
        .review-rating {
          font-size: 1.05rem;
          color: #222;
          display: flex;
          align-items: center;
          gap: 0.2rem;
        }
        .review-content {
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 0.5rem;
        }
        .review-actions {
          display: flex;
          gap: 0.7rem;
        }
        .review-action-btn {
          min-width: 54px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
      `}</style>
      <div className="review-container">
        <SketchHeader
          title="Manage Reviews"
          showBack={true}
          onBack={goBack}
        />
        <div className="filter-row">
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="filter-label">Rating</span>
            <select className="filter-select" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
              <option>All</option>
              <option>5.0</option>
              <option>4.0+</option>
              <option>3.0+</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="filter-label">Date:</span>
            <select className="filter-select" value={dateFilter} onChange={e => setDateFilter(e.target.value)}>
              <option>Newest</option>
              <option>Oldest</option>
            </select>
          </div>
        </div>
        <div className="review-list">
          {mockReviews.map(review => (
            <SketchDiv key={review.id} className="review-card">
              <div className="review-header">
                <div className="review-name">{review.name}</div>
                <div className="review-rating">★ {review.rating}</div>
              </div>
              <div className="review-content">"{review.content}"</div>
              <div className="review-actions">
                <SketchBtn variant="event" size="small" className="review-action-btn">Respond</SketchBtn>
                <SketchBtn variant="event" size="small" className="review-action-btn">Flag</SketchBtn>
                <SketchBtn variant="event" size="small" className="review-action-btn">Chat</SketchBtn>
              </div>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default ReviewManagement; 