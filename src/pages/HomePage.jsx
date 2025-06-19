import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Heart, ArrowRight } from 'lucide-react';
import GoogleMapComponent from '@components/GoogleMapComponent';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';

import { useMsg, useMsgGet, useMsgLang } from '@contexts/MsgContext';

const HomePage = ({ navigateToMap, navigateToSearch, navigateToPageWithData, PAGES }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotspots, setHotspots] = useState([]);
const { messages, isLoading, error, get, currentLang, setLanguage, availableLanguages, refresh } = useMsg();
  useEffect(() => {
    if (messages && Object.keys(messages).length > 0) {
          console.log('✅ Messages loaded:', messages);
          // setLanguage('en'); // 기본 언어 설정
          console.log('Current language set to:', currentLang);
          window.scrollTo(0, 0);
        }

    const fetchHotspots = async () => {
      try {
        const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

        const response = await axios.get(`${API_HOST}/api/getVenueList`);
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
  }, [messages, currentLang]);

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
      <style jsx="true">{`

      
        .homepage-container {
          background-color: #f9fafb;
          font-family: 'BMHanna', 'Comic Sans MS', cursive, sans-serif;
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
          text-align: center;
          font-size: 1.55rem;
          font-weight: bold;
          color: #374151;
          margin-top: 20px;
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
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
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


        @keyframes spin {
          0%, 100% {
            transform: rotate(0deg);
          }
          50% {
            transform: rotate(20deg);
          }
        }

        .rating-badge .shining-star {
          animation: spin 1s ease-in-out infinite;
          transform-origin: center;
        }

        @keyframes move-right {
            0% { transform: translateX(0); }
            50% { transform: translateX(4px); }
            100% { transform: translateX(0); }
          }

          .animate-arrow {
            animation: move-right 1s infinite;
          }



      `}</style>

      <div className="homepage-container">
        {/* Hero Section */}
        <section className="hero-section">
          <HatchPattern opacity={0.3} />
          <h1 className="hero-title">{get('HomePage1.1')}</h1>
          <SketchSearch
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleSearch={handleSearch}
            handleLocationClick={handleLocationClick}
          />
        </section>

        {/* Hotspots */}
        <section className="content-section">
          <h2 className="section-title" style={{margin: '0', marginTop: '26px', fontSize: '21px'}}>{get('HomePage1.2')}</h2>
          {hotspots.map((spot) => (
            <div className="card" key={spot.id}>
              <ImagePlaceholder src={spot.image} alt={spot.name} />
              <div className="overlay-gradient"></div>
              <div className="rating-badge">
                <Star
                  size={14}
                  className="shining-star"
                  style={{ marginRight: '4px', fill: '#ffe800' }}
                />
                {spot.rating}
              </div>
              <div className="heart-icon" onClick={() => toggleFavorite(spot.id)}>
                <Heart fill={spot.isFavorite ? '#f43f5e' : 'white'} color="white" />
              </div>
              <div className="card-footer">
                <SketchBtn className="discover-btn" onClick={() => handleDiscover(spot.id)}>
                  {<HatchPattern opacity={0.8} />}
                     <div className="flex justify-center ">
                      <span>{get('HomePage1.3')}</span>
                      <ArrowRight
                          size={20}
                          strokeWidth={1.5}
                          className="ml-6 text-gray-500 animate-arrow" style={{marginLeft: '10px'}}
                        />
                    </div>
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
