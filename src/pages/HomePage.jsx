import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Heart, ArrowRight, MapPin } from 'lucide-react';
import GoogleMapComponent from '@components/GoogleMapComponent';
import ImagePlaceholder from '@components/ImagePlaceholder';
import SketchSearch from '@components/SketchSearch';
import HatchPattern from '@components/HatchPattern';
import SketchBtn from '@components/SketchBtn';

import { useAuth } from '../contexts/AuthContext';
import { useMsg } from '@contexts/MsgContext';
import LoadingScreen from '@components/LoadingScreen';

const HomePage = ({ navigateToMap, navigateToSearch, navigateToPageWithData, PAGES }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hotspots, setHotspots] = useState([]);
  const [originalHotspots, setOriginalHotspots] = useState([]);
  const { messages, get, currentLang, isLoading } = useMsg();
  const { user } = useAuth();
  const [favorites, setFavorits] = useState([]);

  useEffect(() => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';

    const fetchFavorits = async () => {
      try {
        const response = await axios.get(`${API_HOST}/api/getMyFavoriteList`, {
          params: { user_id: user?.user_id || 1 }
        });
        return response.data || [];
      } catch (error) {
        console.error('getMyFavoriteList 목록 불러오기 실패:', error);
        return [];
      }
    };

    const fetchHotspots = async (favoritesData) => {
      try {
        const response = await axios.get(`${API_HOST}/api/getVenueList`);
        const data = response.data || [];

        const favoriteVenueIds = new Set(
          favoritesData.filter((fav) => fav.target_type === 'venue').map((fav) => fav.target_id)
        );

        const transformed = data.map((item, index) => ({
          id: item.venue_id || index,
          name: item.name || 'Unknown',
          rating: parseFloat(item.rating || 0).toFixed(1),
          image: item.image_url,
          address: item.address || '', // 주소 필드 추가
          opening_hours: (item.open_time + "~" + item.close_time) || '정보 없음',
          isFavorite: favoriteVenueIds.has(item.venue_id),
        }));

        setOriginalHotspots(transformed);
        setHotspots(transformed);
      } catch (error) {
        console.error('장소 정보 가져오기 실패:', error);
      }
    };

    const initialize = async () => {
      if (messages && Object.keys(messages).length > 0) {
        window.scrollTo(0, 0);
      }

      const favoritesData = await fetchFavorits();
      setFavorits(favoritesData);
      await fetchHotspots(favoritesData);
    };

    initialize();
  }, [messages, currentLang]);

  const handleSearch = () => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      setHotspots(originalHotspots);
      return;
    }
    const filtered = originalHotspots.filter((spot) =>
      spot.name.toLowerCase().includes(query)
    );
    setHotspots(filtered);
  };

  const handleLocationClick = () => {
    handleSearch();
  };

  const handleDiscover = (venueId) => {
    navigateToPageWithData(PAGES.DISCOVER, { venueId });
  };

  const toggleFavorite = async (spotTmp) => {
    const API_HOST = import.meta.env.VITE_API_HOST || 'http://localhost:8080';
    setHotspots((prev) =>
      prev.map((spot) =>
        spot.id === spotTmp.id ? { ...spot, isFavorite: !spot.isFavorite } : spot
      )
    );

    const isNowFavorite = !spotTmp.isFavorite;

    try {
      const url = `${API_HOST}/api/${isNowFavorite ? 'insertFavorite' : 'deleteFavorite'}`;
      await axios.get(url, {
        params: {
          user_id: user?.user_id || 1,
          target_type: 'venue',
          target_id: spotTmp.id,
        },
      });
    } catch (error) {
      console.error('API 호출 실패:', error);
    }
  };

  return (
    <>
      <style jsx>{`
        .homepage-container {
          background: #f9fafb;
          font-family: 'BMHanna', 'Comic Sans MS';
        }
        .hero-section {
          height: 117px;
          padding: 2rem 1.5rem;
          background: white;
          border-radius: 12px;
          border: 1px solid #333;
        }
        .hero-title {
          text-align: center;
          font-size: 1.55rem;
          font-weight: bold;
          color: #374151;
          margin-top: 20px;
        }
        .content-section {
          padding: 1rem 1.5rem;
        }
        .card {
          border: 1px solid #333;
          border-radius: 10px;
          overflow: hidden;
          background: white;
          margin-bottom: 1.5rem;
          position: relative;
        }
        .rating-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: linear-gradient(135deg, #00f0ff, #fff0d8);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.75rem;
          z-index: 2;
          display: flex;
          align-items: center;
        }
        .heart-icon {
          position: absolute;
          top: 8px;
          right: 8px;
          cursor: pointer;
          z-index: 2;
        }
        .card-footer {
          padding: 1rem;
          background: #f3f4f6;
          text-align: right;
        }
        .discover-btn-small {
          background: black;
          color: white;
          padding: 4px 10px;
          font-size: 13px;
          border-radius: 4px;
          font-weight: bold;
          cursor: pointer;
          margin-left: auto;
        }
        .compact-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          border: 1px solid #ccc;
          border-radius: 10px;
          background: white;
          margin-bottom: 1rem;
        }
        .compact-image {
          width: 125px;
          height: 125px;
          overflow: hidden;
          border-radius: 8px;
          flex-shrink: 0;
        }
        .compact-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .compact-right {
          flex: 1;
          display: flex;
          flex-direction: column;
        }
        .compact-title {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .compact-hours {
          font-size: 13px;
          color: #666;
        }
        .compact-bottom {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 10px;
        }
        .compact-rating {
          display: flex;
          align-items: center;
          font-size: 14px;
          color: #555;
        }
        .compact-rating svg {
          margin-right: 4px;
          fill: #ffe800;
        }
      `}</style>

      <div className="homepage-container">
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

        <section className="content-section">
          <h2 style={{ margin: 0, marginTop: '26px', fontSize: '21px' }}>{get('HomePage1.2')}</h2>
          {hotspots.map((spot, idx) => (
            idx < 3 ? (
              <div className="card" key={spot.id}>
                <ImagePlaceholder src={spot.image} alt={spot.name} />
                <div className="rating-badge">
                  <Star size={14} style={{ marginRight: '4px', fill: '#ffe800' }} />
                  {spot.rating}
                </div>
                <div className="heart-icon" onClick={() => toggleFavorite(spot)}>
                  <Heart fill={spot.isFavorite ? '#f43f5e' : 'white'} color="white" />
                </div>
                <div style={{ padding: '0.75rem 1rem' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '6px' }}>{spot.name}</div>
                  <div style={{ fontSize: '14px', color: '#333', marginBottom: '4px' }}>
                    🗺️ {spot.address}
                  </div>
                  <div style={{ fontSize: '14px', color: '#555' }}>🕒 {spot.opening_hours}</div>
                </div>
                <div className="card-footer">
                  <SketchBtn className="discover-btn-small" onClick={() => handleDiscover(spot.id)}>
                    {get('HomePage1.3')} <ArrowRight size={16} style={{ marginLeft: 5 }} />
                  </SketchBtn>
                </div>
              </div>
            ) : (
              <div className="compact-card" key={spot.id}>
                <div className="compact-image">
                  <img src={spot.image} alt={spot.name} />
                </div>
                <div className="compact-right">
                  <div className="compact-title">{spot.name}</div>
                  <div className="compact-hours">
                    🗺️ {spot.address}
                  </div>
                  <div className="compact-hours">🕒 {spot.opening_hours}</div>
                  <div className="compact-bottom">
                    <div className="compact-rating">
                      <Star size={14} /> {spot.rating}
                    </div>
                    <SketchBtn
                      className="discover-btn-small"
                      onClick={() => handleDiscover(spot.id)}
                      style={{ marginLeft: 6, width: '84px', height: '30px', display: 'flex', alignItems: 'center' }}
                    >
                      {get('HomePage1.3')}
                    </SketchBtn>
                      <LoadingScreen 
        isVisible={isLoading} 
        // loadingText="Loading" 
/>
                  </div>
                </div>
              </div>
            )
          ))}
        </section>
      </div>
    </>
  );
};

export default HomePage;
