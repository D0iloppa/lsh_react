import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Heart } from 'lucide-react';

import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';

const HomePage = ({ navigateToMap, navigateToSearch, navigateToPageWithData, PAGES }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotspots, setHotspots] = useState([]);

  useEffect(() => {
    const fetchHotspots = async () => {
      try {
        const response = await axios.get('/api/api/getVenueList');
        const data = response.data || [];
        const transformed = data.map((item, index) => ({
          id: item.venue_id || index,
          name: item.name || 'Unknown',
          rating: parseFloat(item.rating || 0).toFixed(1),
          image: item.image_url,
          isFavorite: false,
        }));
        setHotspots(transformed);
      } catch (error) {
        console.error('장소 정보 가져오기 실패:', error);
      }
    };
    fetchHotspots();
  }, []);

  const handleSearch = () => {
    navigateToMap({
      initialKeyword:searchQuery,
      searchFrom: 'home',
    });
  };

  const handleLocationClick = () => {
    navigateToMap({
      initialKeyword:searchQuery,
      searchFrom: 'home',
    });
  };

  const handleDiscover = (venueId) => {
  navigateToPageWithData(PAGES.DISCOVER, { venueId });
};

  const toggleFavorite = (id) => {
    setHotspots((prev) =>
      prev.map((spot) =>
        spot.id === id ? { ...spot, isFavorite: !spot.isFavorite } : spot
      )
    );
  };

  return (
    <>
      <style jsx>{`
        .homepage-container {
          background-color: #f9fafb;
          font-family: 'Kalam', 'Comic Sans MS', cursive, sans-serif;
        }
        .hero-section {
          height: 117px;
          border: 1px solid #333;
          position: relative;
          padding: 2rem 1.5rem;
          background-color: white;
          border-top-left-radius: 12px 7px;
          border-top-right-radius: 6px 14px;
          border-bottom-right-radius: 10px 5px;
          border-bottom-left-radius: 8px 11px;
        }
        .hero-title {
          font-size: 1.5rem;
          font-weight: bold;
          color: #374151;
          margin-bottom: 1.5rem;
          transform: rotate(-0.5deg);
        }
        .content-section {
          padding: 1rem 1.5rem;
        }
        .card {
         border: 1px solid #333;
          position: relative;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 1.5rem;
        }
        .card img {
          width: 100%;
          height: auto;
          display: block;
        }
        .rating-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: white;
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.75rem;
          display: flex;
          align-items: center;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          z-index: 2; /* 그라디언트보다 위에 표시 */

        }
        .heart-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
          z-index: 2; /* 그라디언트보다 위에 표시 */

        }
        .card-footer {
          padding: 1rem;
          background: #f3f4f6;
          text-align: right;
        }
        .discover-btn {
          background: black;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
        }

        .overlay-gradient {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 60%; /* 상단 60% 영역에 그라디언트 적용 */
          background: linear-gradient(
             to bottom, 
             rgba(0, 0, 0, 0.5) 0%,    /* 상단: 30% 불투명 검은색 */
             rgba(0, 0, 0, 0.15) 40%,  /* 중간: 40% 불투명 검은색 */
             rgba(0, 0, 0, 0) 100%     /* 하단: 완전 투명 */
           );
          z-index: 1;
          pointer-events: none; /* 클릭 이벤트가 하위 요소로 전달되도록 */
          border-radius: inherit; /* 카드의 border-radius 상속 */
        }


      `}</style>

      <div className="homepage-container">
        {/* Hero Section */}
        <section className="hero-section">
          <HatchPattern opacity={0.3} />
          <h1 className="hero-title">Explore LeTanTon bars and beautiful girls</h1>
          <SketchSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            handleLocationClick={handleLocationClick}
          />
        </section>

        {/* Hotspots */}
        <section className="content-section">
          <h2 className="section-title" style={{margin: '0', marginTop: '26px', fontSize: '21px'}}>Hotspots near you</h2>
          {hotspots.map((spot) => (
            <div className="card" key={spot.id}>
              <ImagePlaceholder src={spot.image} alt={spot.name} />
              <div className="overlay-gradient"></div>
              <div className="rating-badge">
                <Star size={14} style={{ marginRight: '4px', fill: 'yellow'}} />
                {spot.rating}
              </div>
              <div className="heart-icon" onClick={() => toggleFavorite(spot.id)}>
                <Heart fill={spot.isFavorite ? '#f43f5e' : 'none'} color="#f43f5e" />
              </div>
              <div className="card-footer">
                <SketchBtn className="discover-btn" onClick={() => handleDiscover(spot.id)}>
                  {<HatchPattern opacity={0.3} />}
                DISCOVER
              </SketchBtn>
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default HomePage;
