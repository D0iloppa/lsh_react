import React from 'react';
import SketchHeader from '@components/SketchHeader';
import SketchBtn from '@components/SketchBtn';
import { Star, StarOff } from 'lucide-react';

const reviews = [
  {
    venue: 'The Rooftop Bar',
    date: 'Oct 10, 2023',
    rating: 4.5,
    text: 'Amazing atmosphere with a stunning view of the city. Highly recommend for a fun night out!'
  },
  {
    venue: 'Jazz Night Club',
    date: 'Sep 28, 2023',
    rating: 5,
    text: 'The live music was incredible, and the cocktails were top-notch. Will definitely visit again!'
  },
  {
    venue: 'Club Viva',
    date: 'Sep 15, 2023',
    rating: 3.5,
    text: 'Great vibe and excellent service. The DJ kept the energy high all night!'
  }
];

function renderStars(rating) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars.push(<Star key={i} size={28} fill="#fff" stroke="#222" style={{marginRight:2}}/>);
    } else if (i - rating < 1) {
      stars.push(<Star key={i} size={28} fill="#fff" stroke="#222" style={{marginRight:2}}><polygon points="0,0 28,0 14,28" fill="#fff"/></Star>);
      stars.push(<StarOff key={i+0.5} size={28} stroke="#222" style={{position:'absolute',marginLeft:-30}}/>);
      break;
    } else {
      stars.push(<StarOff key={i} size={28} stroke="#222" style={{marginRight:2}}/>);
    }
  }
  return <span style={{display:'flex',alignItems:'center'}}>{stars}</span>;
}

const StaffReviewHistory = ({ navigateToPageWithData, PAGES, goBack, pageData, ...otherProps }) => {
  return (
    <>
      <style jsx="true">{`
        .reviewhistory-container {
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          min-height: 100vh;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
        }
        .review-card {
          border: 3px solid #222;
          border-radius: 7px;
          margin: 1.1rem 0.2rem 0 0.2rem;
          padding: 1.1rem 1.2rem 0.7rem 1.2rem;
          background: #fff;
          box-shadow: 0 2px 0 #eee;
        }
        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          font-size: 1.2rem;
          font-weight: 600;
        }
        .review-date {
          font-size: 1.05rem;
          font-weight: 400;
          margin-top: 0.2rem;
        }
        .review-stars {
          margin: 0.5rem 0 0.2rem 0;
        }
        .review-text {
          font-size: 1.08rem;
          margin-bottom: 0.7rem;
          margin-top: 0.2rem;
        }
        .review-btn-row {
          display: flex;
          gap: 1.1rem;
          margin-bottom: 0.2rem;
        }
        .bottom-nav {
          position: fixed;
          left: 0; right: 0; bottom: 0;
          width: 100vw;
          max-width: 28rem;
          margin: 0 auto;
          background: #fff;
          border-top: 2.5px solid #222;
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 0.7rem 0 0.3rem 0;
          z-index: 10;
        }
        .nav-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          font-size: 1.1rem;
        }
      `}</style>
      <div className="reviewhistory-container">
        <SketchHeader
          title={<><span style={{marginRight:'7px',marginBottom:'-3px'}}>★</span>Review History</>}
          showBack={true}
          onBack={goBack}
        />
        {reviews.map((r, idx) => (
          <div className="review-card" key={idx}>
            <div className="review-header">
              <span>{r.venue}</span>
              <span className="review-date">{r.date}</span>
            </div>
            <div className="review-stars">{renderStars(r.rating)}</div>
            <div className="review-text">"{r.text}"</div>
            <div className="review-btn-row">
              <SketchBtn variant="secondary" size="medium">Reply</SketchBtn>
              <SketchBtn variant="primary" size="medium">DECLARE</SketchBtn>
            </div>
          </div>
        ))}
        <div style={{height:'5.5rem'}}></div>
        <div className="bottom-nav">
          <div className="nav-item">
            <span style={{fontSize:'2rem'}}>📅</span>
            <span>Bookings</span>
          </div>
          <div className="nav-item">
            <span style={{fontSize:'2rem'}}>👥</span>
            <span>Chatting</span>
          </div>
          <div className="nav-item">
            <span style={{fontSize:'2rem'}}>⚙️</span>
            <span>Settings</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default StaffReviewHistory; 