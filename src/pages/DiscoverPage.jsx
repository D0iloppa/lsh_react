import React, { useState, useEffect } from 'react';
import axios from 'axios';
import RotationDiv from '@components/RotationDiv';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchHeader from '@components/SketchHeader';
import GoogleMapComponent from '@components/GoogleMapComponent';

const DiscoverPage = ({ navigateToPageWithData, PAGES, ...otherProps }) => {
  const venueId = otherProps?.venueId || null;
  const [venueInfo, setVenueInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [topGirls, setTopGirls] = useState([]);

  const handleDetail = (girl) => {
    navigateToPageWithData(PAGES.STAFFDETAIL, girl);
  };

  useEffect(() => {
    window.scrollTo(0, 0); 
    const fetchVenueInfo = async () => {
      if (!venueId) return;
      setLoading(true);
      try {
        const response = await axios.get('/api/api/getVenue', {
          params: { venue_id: venueId },
        });
        setVenueInfo(response.data || null);
      } catch (error) {
        console.error('Venue 정보 가져오기 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    const fetchTopGirls = async () => {
      if (!venueId) return;
      try {
        const res = await axios.get('/api/api/getVenueStaffList', {
          params: { venue_id: venueId },
        });
        const staffList = res.data || [];
        const top3 = staffList.slice(0, 3).map((girl) => {
          const birthYear = parseInt(girl.birth_year, 10);
          const currentYear = new Date().getFullYear();
          const age = birthYear ? currentYear - birthYear : '?';
          return {
            ...girl,
            displayName: `${girl.name} (${age})`,
          };
        });
        setTopGirls(top3);
      } catch (error) {
        console.error('Top girls 가져오기 실패:', error);
      }
    };

    fetchVenueInfo();
    fetchTopGirls();
  }, [venueId]);

  const renderStars = (rating = 0) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      let color = '#d1d5db';
      if (rating >= i) {
        color = '#fbbf24';
      } else if (rating >= i - 0.5) {
        color = '#fde68a';
      }
      stars.push(
        <span key={i} style={{ color }}>{'★'}</span>
      );
    }
    return stars;
  };

  const CalendarIcon = ({ size = 24, color = '#333' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
    stroke={color}
    strokeWidth="1.5"
  >
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

  return (
    <>
      <style jsx>{`
        .discover-container {
          max-width: 28rem;
          margin: 0 auto;
          background-color: white;
          min-height: 100vh;

          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
        }
        .featured-section { padding-bottom: 60px; padding: 1rem; text-align: center; border-bottom: 1px solid #1f2937; }
        .club-image-area {
          border-radius: 3px;
          width: 100%; height: 200px; border: 1px solid #1f2937;
          background-color: #f3f4f6; margin-bottom: 1rem;
          display: flex; align-items: center; justify-content: center; overflow: hidden;
        }
        .club-image-area img { width: 100%; height: 100%; object-fit: cover; }
        .club-name {
          font-size: 1.5rem; font-weight: bold; margin: 0.5rem 0;
          word-break: break-word; white-space: normal;
        }
        .club-location { font-size: 0.9rem; color: #6b7280; }
        .top-venues-text { font-size: 1.2rem; font-weight: bold; }
        .description {
          font-size: 0.9rem; color: #4b5563; line-height: 1.4; margin-bottom: 2rem;
        }
        .action-row {
          display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;
        }
        .make-text { font-weight: bold; }
        .reserve-btn {
          border: 0; font-size: 1.5rem; background: none; cursor: pointer;
        }
        .stars { font-size: 1.2rem; }
        .upcoming-events {
          padding: 1rem; border-bottom: 1px solid #1f2937;
        }
        .section-title { font-size: 1.1rem; font-weight: bold; margin-bottom: 1rem;}
        .events-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
        }
        .event-card {
          width: 100%; height: 120px; border: 1px solid #1f2937;
          background-color: #f9fafb; display: flex; flex-direction: column;
          justify-content: center; align-items: center;
          color: #6b7280; 
        }
        .top-girls-section { padding: 1rem;}
        .girls-rotation { width: 100%; }
        .girl-slide { text-align: center; }
        .girl-img {
          width: 120px; height: 160px; object-fit: cover; border-radius: 0.5rem;
          margin: 0 auto 0.5rem;
        }
        .girl-name {
          
          text-align: center; margin-bottom: 0.5rem;
        }
        .girl-detail-btn {
          display: block; margin: 0 auto; padding: 0.5rem 1rem;
          border: 1px solid #1f2937; background-color: white; border-radius: 3px;
          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
          cursor: pointer;
        }
        @media (max-width: 480px) {
          .discover-container {
            max-width: 100%;
            border-left: none;
            border-right: none;
          }
        }
       .map-section {
          width: 100%;
          height: 250px;
          margin-top: 1rem;
          border: 2px solid #1f2937;
        }   
      `}</style>

      <div className="discover-container">
        <SketchHeader
          title={venueInfo?.name || 'Discover'}
          showBack={true}
          onBack={() => console.log('뒤로가기')}
          rightButtons={[]}
        />

        <div className="featured-section">
          <div className="club-image-area">
            {loading ? (
              <div className="club-name">Loading...</div>
            ) : venueInfo?.image_url ? (
              <img src={venueInfo.image_url} alt="venue" />
            ) : (
              <div className="club-name">No Image</div>
            )}
          </div>

          <div className="club-name">{venueInfo?.name || 'Club One'}</div>
          <div className="club-location">{venueInfo?.address || venueInfo?.location || 'in Vietnam'}</div>
          <div className="top-venues-text">{venueInfo?.description || 'Top Venues'}</div>

          <div className="description">
            {venueInfo?.description ||
              'Discover the best nightlife spots in Vietnam, from vibrant bars to chic lounges, all available for easy booking.'}
          </div>

          <div className="action-row">
            <span className="make-text">Make a</span>
            <button
              className="reserve-btn"
              onClick={() =>
                navigateToPageWithData(PAGES.RESERVATION, {
                  target: 'venue',
                  id: venueId || 123,
                })
              }
            >
              <CalendarIcon />
            </button>
            <div className="stars">{renderStars(venueInfo?.rating)}</div>
          </div>

          <div className="map-section">
            <GoogleMapComponent
              places={venueInfo ? [venueInfo] : []}
              disableInteraction={true}
            />
          </div>
        </div>

        <div className="upcoming-events">
          <div className="section-title">Upcoming Events</div>
          <div className="events-grid">
            <div className="event-card">No Events</div>
            <div className="event-card">No Events</div>
          </div>
        </div>

        <div className="top-girls-section">
          <div className="section-title">Top Girls</div>
          <RotationDiv interval={3000} showIndicators={true} pauseOnHover={true} className="girls-rotation">
            {topGirls.map((girl, index) => (
              <div key={index} className="girl-slide">
                {girl.image_url ? (
                  <img src={girl.image_url} className="girl-img" alt="girl" />
                ) : (
                  <ImagePlaceholder />
                )}
                <div className="girl-name">{girl.displayName}</div>
                <button className="girl-detail-btn" onClick={() => handleDetail(girl)}>
                  Girl Detail
                </button>
              </div>
            ))}
          </RotationDiv>
        </div>
      </div>
    </>
  );
};

export default DiscoverPage;
