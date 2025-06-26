import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import SketchDiv from '@components/SketchDiv';
import '@components/SketchComponents.css';

const mockPromotions = [
  {
    id: 1,
    title: 'Summer Fest 2023',
    desc: 'Join the biggest summer event of the year with live performances and exclusive drinks.',
    date: '25th July 2023',
    img: '',
  },
  {
    id: 2,
    title: 'Autumn Bash',
    desc: 'Experience the charm of autumn with live jazz music and gourmet food stalls.',
    date: '10th October 2023',
    img: '',
  },
];

const PromotionManagement = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  return (
    <>
      <style jsx="true">{`
        .promotion-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .create-btn-row {
          margin: 1.1rem 0 1.2rem 0;
        }
        .promotion-list {
          display: flex;
          flex-direction: column;
          gap: 1.1rem;
        }
        .promotion-card {
          border: 1px solid #e5e7eb;
          border-radius: 7px;
          background: #fff;
          padding: 0.8rem 0.9rem 1.1rem 0.9rem;
        }
        .promo-img {
          width: 100%;
          height: 120px;
          background: #f3f4f6;
          border-radius: 6px;
          margin-bottom: 0.7rem;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.2rem;
          color: #bbb;
        }
        .promo-title {
          font-size: 1.08rem;
          font-weight: 600;
          margin-bottom: 0.2rem;
        }
        .promo-desc {
          font-size: 0.97rem;
          color: #222;
          margin-bottom: 0.2rem;
        }
        .promo-date {
          font-size: 0.93rem;
          color: #888;
          margin-bottom: 0.5rem;
        }
        .promo-actions {
          display: flex;
          gap: 0.7rem;
          justify-content: space-between;
        }
        .promo-action-btn {
          min-width: 54px;
          font-size: 0.95rem;
          padding: 0.18rem 0.5rem;
        }
      `}</style>
      <div className="promotion-container">
        <SketchHeader
          title="Manage Promotions"
          showBack={true}
          onBack={goBack}
        />
        <div className="create-btn-row">
          <SketchBtn variant="primary" size="medium" style={{ width: '100%' }}>Create New Promotion</SketchBtn>
        </div>
        <div className="promotion-list">
          {mockPromotions.map(promo => (
            <SketchDiv key={promo.id} className="promotion-card">
              <div className="promo-img">🖼️</div>
              <div className="promo-title">{promo.title}</div>
              <div className="promo-desc">{promo.desc}</div>
              <div className="promo-date">Date: {promo.date}</div>
              <div className="promo-actions">
                <SketchBtn variant="event" size="small" className="promo-action-btn">Edit</SketchBtn>
                <SketchBtn variant="event" size="small" className="promo-action-btn">End</SketchBtn>
                <SketchBtn variant="event" size="small" className="promo-action-btn">Track</SketchBtn>
              </div>
            </SketchDiv>
          ))}
        </div>
      </div>
    </>
  );
};

export default PromotionManagement; 